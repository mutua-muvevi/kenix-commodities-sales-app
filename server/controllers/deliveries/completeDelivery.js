/**
 * Complete Delivery Controller
 *
 * PATCH /api/deliveries/:deliveryId/complete
 * Accessible by: rider only
 *
 * Completes a delivery with signature/photo confirmation
 * Updates inventory, rider wallet, and enables next delivery
 * USES SEQUENTIAL ENFORCEMENT MIDDLEWARE
 */

const Delivery = require('../../models/deliveries');
const Order = require('../../models/orders');
const Route = require('../../models/routes');
const Inventory = require('../../models/inventory');
const RiderWallet = require('../../models/riderWallet');
const mongoose = require('mongoose');
const { sendDeliveryCompleted } = require('../../services/sms/africasTalking');
const { emitToUser, emitToRole } = require('../../websocket/index');

/**
 * @route   PATCH /api/deliveries/:deliveryId/complete
 * @desc    Complete a delivery
 * @access  Private (rider only)
 *
 * @param {string} deliveryId - Delivery ID
 * @body {string} [signature] - Signature image URL
 * @body {string} [photo] - Delivery photo URL
 * @body {string} [notes] - Delivery notes
 * @body {string} [recipientName] - Recipient name
 * @body {string} [recipientPhone] - Recipient phone
 * @body {Object} location - Current location { lat, lng }
 *
 * @returns {Object} Completed delivery and next shop details
 */
const completeDelivery = async (req, res) => {
	const session = await mongoose.startSession();

	try {
		session.startTransaction();

		const { deliveryId } = req.params;
		const { signature, photo, notes, recipientName, recipientPhone, location } = req.body;
		const riderId = req.user._id;

		// Delivery and route already validated by sequentialEnforcement middleware
		const delivery = req.delivery;
		const route = req.route;

		// Check delivery status
		if (delivery.status !== 'arrived') {
			await session.abortTransaction();
			return res.status(400).json({
				success: false,
				message: 'Delivery not marked as arrived',
				errors: ['You must mark arrival before completing delivery'],
			});
		}

		// Validate payment collected (if required)
		if (
			delivery.paymentInfo.method !== 'not_required' &&
			delivery.paymentInfo.method !== 'credit' &&
			delivery.paymentInfo.status !== 'collected'
		) {
			await session.abortTransaction();
			return res.status(400).json({
				success: false,
				message: 'Payment not collected',
				errors: ['Payment must be collected before completing delivery'],
			});
		}

		// Update delivery status
		delivery.status = 'completed';
		delivery.completedAt = new Date();

		// Update confirmation data
		delivery.confirmation = {
			recipientName: recipientName || '',
			recipientPhone: recipientPhone || '',
			signature: signature || '',
			photo: photo || '',
			notes: notes || '',
			confirmedAt: new Date(),
		};

		// Mark all items as delivered
		delivery.items = delivery.items.map((item) => ({
			...item,
			delivered: item.quantity,
		}));

		await delivery.save({ session });

		// Update order status
		const order = await Order.findById(delivery.order).session(session);
		if (order) {
			order.deliveryStatus = 'delivered';
			order.status = 'completed';
			order.deliveredAt = new Date();
			await order.save({ session });

			// Complete inventory transaction (ACID compliance)
			for (const item of order.products) {
				await Inventory.completeTransaction(
					item.product,
					item.quantity,
					order._id,
					riderId
				);
			}
		}

		// Update rider wallet - credit the payment (reduce negative balance)
		const riderWallet = await RiderWallet.findOne({ rider: riderId }).session(session);
		if (riderWallet && order) {
			riderWallet.currentBalance += order.totalPrice;
			riderWallet.totalDeliveries += 1;

			// Add transaction record
			riderWallet.transactions.push({
				type: 'credit',
				amount: order.totalPrice,
				description: `Delivery ${delivery.deliveryCode} completed`,
				relatedOrder: order._id,
				relatedDelivery: delivery._id,
				balanceAfter: riderWallet.currentBalance,
				timestamp: new Date(),
			});

			await riderWallet.save({ session });
		}

		// Update route progress
		route.currentProgress.currentShopIndex += 1;

		// Check if route is completed
		const allShops = route.shops.filter((s) => s.isActive);
		if (route.currentProgress.currentShopIndex >= allShops.length) {
			route.currentProgress.isInProgress = false;
			route.status = 'archived';
		}

		await route.save({ session });

		// Enable next delivery in sequence
		const nextDelivery = await Delivery.findOne({
			route: route._id,
			previousDelivery: delivery._id,
		}).session(session);

		if (nextDelivery) {
			nextDelivery.canProceed = true;
			await nextDelivery.save({ session });
		}

		await session.commitTransaction();

		// Get next shop details
		let nextShopData = null;
		if (route.currentProgress.currentShopIndex < allShops.length) {
			const nextShop = allShops[route.currentProgress.currentShopIndex];
			const nextShopDeliveries = await Delivery.find({
				route: route._id,
				shop: nextShop.shop,
			})
				.populate('order', 'orderId totalPrice paymentMethod products')
				.populate('shop', 'shopName phoneNumber location address');

			nextShopData = {
				...nextShop.toObject(),
				deliveries: nextShopDeliveries,
			};
		}

		// Send SMS notification to shop
		const populatedDelivery = await Delivery.findById(delivery._id).populate('shop', 'phoneNumber shopName');
		if (populatedDelivery.shop?.phoneNumber && order) {
			await sendDeliveryCompleted(populatedDelivery.shop.phoneNumber, delivery.deliveryCode, order.totalPrice);
		}

		// WebSocket: Notify shop and admin
		emitToUser(delivery.shop.toString(), 'delivery:completed', {
			deliveryId: delivery._id,
			deliveryCode: delivery.deliveryCode,
			orderId: order?.orderId,
			message: 'Your delivery has been completed'
		});
		emitToRole('admin', 'delivery:completed', {
			deliveryId: delivery._id,
			deliveryCode: delivery.deliveryCode,
			riderId: riderId,
			routeProgress: route.currentProgress.currentShopIndex
		});

		return res.status(200).json({
			success: true,
			message: nextShopData
				? 'Delivery completed. Proceeding to next shop.'
				: 'Delivery completed. Route finished!',
			data: {
				completedDelivery: {
					_id: delivery._id,
					deliveryCode: delivery.deliveryCode,
					completedAt: delivery.completedAt,
				},
				nextShop: nextShopData,
				routeProgress: {
					completed: route.currentProgress.currentShopIndex,
					total: allShops.length,
					percentage: Math.round(
						(route.currentProgress.currentShopIndex / allShops.length) * 100
					),
				},
				walletBalance: riderWallet ? riderWallet.currentBalance : 0,
			},
		});
	} catch (error) {
		await session.abortTransaction();
		console.error('Complete Delivery Error:', error);

		return res.status(500).json({
			success: false,
			message: 'Failed to complete delivery',
			errors: [error.message],
		});
	} finally {
		session.endSession();
	}
};

module.exports = completeDelivery;
