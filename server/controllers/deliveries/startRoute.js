/**
 * Start Route Controller
 *
 * POST /api/deliveries/:routeId/start
 * Accessible by: rider (assigned to route)
 *
 * Starts a route and creates delivery records for all shops
 */

const Route = require('../../models/routes');
const Delivery = require('../../models/deliveries');
const Order = require('../../models/orders');
const mongoose = require('mongoose');
const { emitToUser } = require('../../websocket/index');

/**
 * @route   POST /api/deliveries/:routeId/start
 * @desc    Start a delivery route
 * @access  Private (rider - assigned to route)
 *
 * @param {string} routeId - Route ID
 *
 * @returns {Object} Route started with first shop details
 */
const startRoute = async (req, res) => {
	const session = await mongoose.startSession();

	try {
		session.startTransaction();

		const { routeId } = req.params;
		const riderId = req.user._id;

		// Find route
		const route = await Route.findById(routeId).session(session);

		if (!route) {
			await session.abortTransaction();
			return res.status(404).json({
				success: false,
				message: 'Route not found',
				errors: ['No route exists with the specified ID'],
			});
		}

		// Verify rider is assigned to this route
		if (!route.assignedRider || route.assignedRider.toString() !== riderId.toString()) {
			await session.abortTransaction();
			return res.status(403).json({
				success: false,
				message: 'Access denied',
				errors: ['You are not assigned to this route'],
			});
		}

		// Check route status
		if (route.status !== 'active') {
			await session.abortTransaction();
			return res.status(400).json({
				success: false,
				message: 'Route is not active',
				errors: [`Route status is ${route.status}`],
			});
		}

		// Check if route already in progress
		if (route.currentProgress.isInProgress) {
			await session.abortTransaction();
			return res.status(400).json({
				success: false,
				message: 'Route already in progress',
				errors: ['This route has already been started'],
			});
		}

		// Get all orders for this route
		const shopIds = route.shops.map((s) => s.shop);
		const orders = await Order.find({
			orderer: { $in: shopIds },
			assignedRoute: route._id,
			approvalStatus: 'approved',
		}).session(session);

		if (orders.length === 0) {
			await session.abortTransaction();
			return res.status(400).json({
				success: false,
				message: 'No orders on this route',
				errors: ['Route has no approved orders'],
			});
		}

		// Check if deliveries already exist
		const existingDeliveries = await Delivery.countDocuments({
			route: route._id,
		}).session(session);

		let deliveries = [];

		if (existingDeliveries === 0) {
			// Create deliveries using static method
			deliveries = await Delivery.createDeliveriesForRoute(
				route._id,
				orders,
				riderId
			);
		} else {
			// Get existing deliveries
			deliveries = await Delivery.find({ route: route._id })
				.sort({ sequenceNumber: 1 })
				.session(session);
		}

		// Update route to in_progress
		route.currentProgress.isInProgress = true;
		route.currentProgress.startedAt = new Date();
		route.currentProgress.currentShopIndex = 0;

		await route.save({ session });

		// Update orders to in_transit
		await Order.updateMany(
			{ _id: { $in: orders.map((o) => o._id) } },
			{ $set: { deliveryStatus: 'in_transit' } }
		).session(session);

		await session.commitTransaction();

		// Get first shop details
		const firstShop = route.shops[0];
		const firstShopDeliveries = await Delivery.find({
			route: route._id,
			shop: firstShop.shop,
		})
			.populate('order', 'orderId totalPrice paymentMethod products')
			.populate('shop', 'shopName phoneNumber location address');

		// WebSocket: Notify all shops on the route that delivery has started
		for (const shop of route.shops) {
			emitToUser(shop.shop.toString(), 'delivery:started', {
				routeId: route._id,
				routeCode: route.routeCode,
				riderName: `${req.user.firstName} ${req.user.lastName}`,
				message: 'Your delivery route has started. Rider is on the way.'
			});
		}

		return res.status(200).json({
			success: true,
			message: 'Route started successfully',
			data: {
				route: {
					_id: route._id,
					routeName: route.routeName,
					routeCode: route.routeCode,
					totalShops: route.stats.totalShops,
					startedAt: route.currentProgress.startedAt,
				},
				currentShop: {
					...firstShop.toObject(),
					deliveries: firstShopDeliveries,
				},
				totalDeliveries: deliveries.length,
			},
		});
	} catch (error) {
		await session.abortTransaction();
		console.error('Start Route Error:', error);

		return res.status(500).json({
			success: false,
			message: 'Failed to start route',
			errors: [error.message],
		});
	} finally {
		session.endSession();
	}
};

module.exports = startRoute;
