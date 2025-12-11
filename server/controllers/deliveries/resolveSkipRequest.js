/**
 * Resolve Skip Request Controller
 *
 * POST /api/deliveries/:id/resolve-skip
 * Accessible by: admin only
 *
 * Allows admin to approve or reject a skip request
 * When approved, marks delivery as skipped and unlocks next delivery
 */

const Delivery = require('../../models/deliveries');
const Route = require('../../models/routes');
const ShopWallet = require('../../models/shopWallet');
const mongoose = require('mongoose');
const { emitToUser } = require('../../websocket');
const logger = require('../../utils/logger');

/**
 * @route   POST /api/deliveries/:id/resolve-skip
 * @desc    Approve or reject skip request
 * @access  Private (admin only)
 *
 * @param {string} id - Delivery ID
 * @body {boolean} approved - Whether to approve the skip
 * @body {string} [resolution] - Optional resolution notes
 *
 * @returns {Object} Updated delivery
 */
const resolveSkipRequest = async (req, res) => {
	const session = await mongoose.startSession();

	try {
		session.startTransaction();

		const { id } = req.params;
		const { approved, resolution } = req.body;
		const adminId = req.user._id;

		// Validation
		if (typeof approved !== 'boolean') {
			await session.abortTransaction();
			return res.status(400).json({
				success: false,
				message: 'Approval decision is required',
				errors: ['approved field must be true or false'],
			});
		}

		// Find delivery
		const delivery = await Delivery.findById(id)
			.populate('shop', 'shopName ownerName phoneNumber')
			.populate('rider', 'firstName lastName _id')
			.populate('route')
			.populate('order')
			.session(session);

		if (!delivery) {
			await session.abortTransaction();
			return res.status(404).json({
				success: false,
				message: 'Delivery not found',
				errors: ['No delivery exists with the specified ID'],
			});
		}

		// Check if there's a pending skip request
		if (!delivery.skipRequest.requested || delivery.skipRequest.status !== 'pending') {
			await session.abortTransaction();
			return res.status(400).json({
				success: false,
				message: 'No pending skip request found',
				errors: ['This delivery does not have a pending skip request'],
			});
		}

		// Update skip request status
		delivery.skipRequest.status = approved ? 'approved' : 'rejected';
		delivery.skipRequest.resolvedBy = adminId;
		delivery.skipRequest.resolvedAt = new Date();
		delivery.skipRequest.resolution = resolution || '';

		if (approved) {
			// Mark delivery as skipped
			delivery.status = 'skipped';

			// Set admin override
			delivery.adminOverride.isOverridden = true;
			delivery.adminOverride.reason = `Skip approved: ${delivery.skipRequest.reason} - ${delivery.skipRequest.notes}`;
			delivery.adminOverride.overriddenBy = adminId;
			delivery.adminOverride.overriddenAt = new Date();

			await delivery.save({ session });

			// Find and unlock next delivery in sequence
			const nextDelivery = await Delivery.findOne({
				route: delivery.route._id,
				previousDelivery: delivery._id,
			}).session(session);

			if (nextDelivery) {
				nextDelivery.canProceed = true;
				await nextDelivery.save({ session });
				logger.info(`Next delivery ${nextDelivery._id} unlocked after skip approval`);
			}

			// Update route progress
			const route = await Route.findById(delivery.route._id).session(session);
			if (route && route.currentProgress.isInProgress) {
				// Find the shop index
				const skippedShopIndex = route.shops.findIndex(
					s => s.shop.toString() === delivery.shop._id.toString()
				);

				if (skippedShopIndex !== -1) {
					// Mark shop as inactive temporarily
					route.shops[skippedShopIndex].isActive = false;
					route.shops[skippedShopIndex].notes =
						(route.shops[skippedShopIndex].notes || '') +
						`\n[SKIPPED: ${delivery.skipRequest.reason} - ${delivery.skipRequest.notes}]`;

					// Move to next shop if this was the current one
					if (route.currentProgress.currentShopIndex === skippedShopIndex) {
						const nextShopIndex = route.shops.findIndex(
							(s, idx) => idx > skippedShopIndex && s.isActive
						);
						if (nextShopIndex !== -1) {
							route.currentProgress.currentShopIndex = nextShopIndex;
						}
					}

					await route.save({ session });
				}
			}

			// Handle shop wallet - Keep negative balance for skipped delivery
			// The balance will remain negative until resolved (re-delivery, cancellation, etc.)
			const shopWallet = await ShopWallet.findOne({ shop: delivery.shop._id }).session(session);
			if (shopWallet && delivery.order) {
				// Add transaction to record the skip
				shopWallet.transactions.push({
					type: 'adjustment',
					amount: 0, // No balance change, just recording the skip
					previousBalance: shopWallet.balance,
					newBalance: shopWallet.balance,
					description: `Delivery skipped: ${delivery.skipRequest.reason}. Balance remains pending resolution.`,
					relatedOrder: delivery.order._id,
					relatedDelivery: delivery._id,
					performedBy: adminId,
					timestamp: new Date(),
				});

				await shopWallet.save({ session });

				logger.info(`Shop wallet recorded skip for delivery ${delivery._id}. Balance remains: ${shopWallet.balance}`);
			}

			// Emit approval to rider via WebSocket
			try {
				emitToUser(delivery.rider._id.toString(), 'admin:skip-approved', {
					deliveryId: delivery._id,
					shopId: delivery.shop._id,
					shopName: delivery.shop.shopName,
					message: resolution || 'Your skip request has been approved. You can proceed to the next shop.',
					nextDeliveryUnlocked: !!nextDelivery,
				});
				logger.info(`Skip approval sent to rider ${delivery.rider._id} for delivery ${delivery._id}`);
			} catch (wsError) {
				logger.error('WebSocket error sending skip approval:', wsError);
				// Continue even if WebSocket fails
			}
		} else {
			// Rejection - just update the skip request status
			await delivery.save({ session });

			// Emit rejection to rider via WebSocket
			try {
				emitToUser(delivery.rider._id.toString(), 'admin:skip-rejected', {
					deliveryId: delivery._id,
					shopId: delivery.shop._id,
					shopName: delivery.shop.shopName,
					message: resolution || 'Your skip request has been rejected. Please attempt delivery.',
				});
				logger.info(`Skip rejection sent to rider ${delivery.rider._id} for delivery ${delivery._id}`);
			} catch (wsError) {
				logger.error('WebSocket error sending skip rejection:', wsError);
				// Continue even if WebSocket fails
			}
		}

		await session.commitTransaction();

		// Populate delivery for response
		const populatedDelivery = await Delivery.findById(delivery._id)
			.populate('shop', 'shopName ownerName phoneNumber')
			.populate('rider', 'firstName lastName')
			.populate('skipRequest.resolvedBy', 'firstName lastName');

		return res.status(200).json({
			success: true,
			message: approved ? 'Skip request approved successfully' : 'Skip request rejected',
			data: {
				delivery: populatedDelivery,
				action: approved ? 'approved' : 'rejected',
				resolvedAt: delivery.skipRequest.resolvedAt,
			},
		});
	} catch (error) {
		await session.abortTransaction();
		logger.error('Resolve Skip Request Error:', error);

		return res.status(500).json({
			success: false,
			message: 'Failed to resolve skip request',
			errors: [error.message],
		});
	} finally {
		session.endSession();
	}
};

module.exports = resolveSkipRequest;
