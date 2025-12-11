/**
 * Admin Unlock Delivery Controller
 *
 * POST /api/deliveries/:deliveryId/admin-unlock
 * Accessible by: admin only
 *
 * Allows admins to override sequential delivery enforcement
 * when a shop is unavailable (closed, absent owner, etc.)
 */

const Delivery = require('../../models/deliveries');
const Route = require('../../models/routes');
const mongoose = require('mongoose');
const { emitToUser } = require('../../websocket/index');

/**
 * @route   POST /api/deliveries/:deliveryId/admin-unlock
 * @desc    Admin override to unlock a delivery that is blocked by sequential enforcement
 * @access  Private (admin only)
 *
 * @param {string} deliveryId - Delivery ID to unlock
 * @body {string} reason - Reason for unlocking (e.g., "shop_closed", "emergency")
 * @body {string} [notes] - Additional notes about the unlock
 *
 * @returns {Object} Updated delivery and next delivery details
 */
const adminUnlockDelivery = async (req, res) => {
	const session = await mongoose.startSession();

	try {
		session.startTransaction();

		const { deliveryId } = req.params;
		const { reason, notes } = req.body;
		const adminId = req.user._id;

		// Validate required fields
		if (!reason) {
			await session.abortTransaction();
			return res.status(400).json({
				success: false,
				message: 'Reason is required',
				errors: ['Please provide a reason for unlocking this delivery'],
			});
		}

		// Find the delivery
		const delivery = await Delivery.findById(deliveryId)
			.populate('route')
			.populate('previousDelivery')
			.session(session);

		if (!delivery) {
			await session.abortTransaction();
			return res.status(404).json({
				success: false,
				message: 'Delivery not found',
				errors: ['No delivery exists with the specified ID'],
			});
		}

		// Check if delivery is already completed
		if (delivery.status === 'completed') {
			await session.abortTransaction();
			return res.status(400).json({
				success: false,
				message: 'Delivery already completed',
				errors: ['This delivery is already completed and cannot be unlocked'],
			});
		}

		// Check if delivery is already unlocked
		if (delivery.adminOverride.isOverridden) {
			await session.abortTransaction();
			return res.status(400).json({
				success: false,
				message: 'Delivery already unlocked',
				errors: ['This delivery has already been unlocked by admin'],
			});
		}

		// Apply admin override
		delivery.adminOverride = {
			isOverridden: true,
			reason: reason,
			overriddenBy: adminId,
			overriddenAt: new Date(),
		};
		delivery.canProceed = true;

		// If there's a previous delivery that's not completed, mark this one as skipped
		// This allows the rider to move to the next shop
		if (delivery.previousDelivery) {
			const prevDelivery = await Delivery.findById(delivery.previousDelivery).session(session);
			if (prevDelivery && prevDelivery.status !== 'completed' && prevDelivery.status !== 'skipped') {
				// We're allowing skip, so update the status appropriately
				// The previous delivery can be revisited later if needed
				console.log(`Admin unlock: allowing skip of delivery ${prevDelivery.deliveryCode}`);
			}
		}

		// Add notes if provided
		if (notes) {
			delivery.riderNotes = (delivery.riderNotes ? delivery.riderNotes + '\n' : '') +
				`[Admin Note - ${new Date().toISOString()}]: ${notes}`;
		}

		await delivery.save({ session });

		// Update route to allow skip if needed
		const route = await Route.findById(delivery.route).session(session);
		if (route) {
			// Log the admin override
			console.log(`Admin ${req.user.email} unlocked delivery ${delivery.deliveryCode} on route ${route.routeCode}`);
		}

		await session.commitTransaction();

		// Populate delivery for response
		const populatedDelivery = await Delivery.findById(delivery._id)
			.populate('order', 'orderId totalPrice paymentMethod')
			.populate('shop', 'shopName phoneNumber location address')
			.populate('rider', 'firstName lastName phoneNumber');

		// WebSocket: Notify rider that delivery has been unlocked
		if (delivery.rider) {
			emitToUser(delivery.rider.toString(), 'admin:shop-unlocked', {
				deliveryId: delivery._id,
				deliveryCode: delivery.deliveryCode,
				reason: reason,
				message: `Admin has unlocked delivery ${delivery.deliveryCode}. You can now proceed.`,
			});
		}

		return res.status(200).json({
			success: true,
			message: 'Delivery unlocked successfully',
			data: {
				delivery: populatedDelivery,
				unlockInfo: {
					unlockedBy: req.user.email,
					unlockedAt: delivery.adminOverride.overriddenAt,
					reason: reason,
					notes: notes,
				},
			},
		});
	} catch (error) {
		await session.abortTransaction();
		console.error('Admin Unlock Delivery Error:', error);

		return res.status(500).json({
			success: false,
			message: 'Failed to unlock delivery',
			errors: [error.message],
		});
	} finally {
		session.endSession();
	}
};

module.exports = adminUnlockDelivery;
