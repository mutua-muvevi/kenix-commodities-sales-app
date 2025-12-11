/**
 * Assign Rider to Route Controller
 *
 * PATCH /api/routes/:id/assign-rider
 * Accessible by: admin only
 *
 * Assigns a rider to a route and updates their wallet
 */

const Route = require('../../models/routes');
const User = require('../../models/user');
const Order = require('../../models/orders');
const RiderWallet = require('../../models/riderWallet');
const mongoose = require('mongoose');
const { sendRiderRouteAssignment } = require('../../services/sms/africasTalking');
const { emitToUser } = require('../../websocket/index');

/**
 * @route   PATCH /api/routes/:id/assign-rider
 * @desc    Assign a rider to a route
 * @access  Private (admin only)
 *
 * @param {string} id - Route ID
 * @body {string} riderId - Rider user ID
 *
 * @returns {Object} Updated route
 */
const assignRider = async (req, res) => {
	const session = await mongoose.startSession();

	try {
		session.startTransaction();

		const { id } = req.params;
		const { riderId } = req.body;
		const adminId = req.user._id;

		// Find route
		const route = await Route.findById(id).session(session);

		if (!route) {
			await session.abortTransaction();
			return res.status(404).json({
				success: false,
				message: 'Route not found',
				errors: ['No route exists with the specified ID'],
			});
		}

		// Check route is not already completed
		if (route.status === 'archived') {
			await session.abortTransaction();
			return res.status(400).json({
				success: false,
				message: 'Cannot assign rider to archived route',
				errors: ['This route is archived'],
			});
		}

		// Validate rider
		const rider = await User.findOne({
			_id: riderId,
			role: 'rider',
		}).session(session);

		if (!rider) {
			await session.abortTransaction();
			return res.status(404).json({
				success: false,
				message: 'Rider not found',
				errors: ['The specified user is not a rider'],
			});
		}

		// Check if rider is active
		if (rider.banStatus && rider.banStatus.isBanned) {
			await session.abortTransaction();
			return res.status(400).json({
				success: false,
				message: 'Rider is banned',
				errors: ['Cannot assign banned rider to route'],
			});
		}

		// Get all orders for this route
		const shopIds = route.shops.map((s) => s.shop);
		const orders = await Order.find({
			orderer: { $in: shopIds },
			assignedRoute: route._id,
		}).session(session);

		// Calculate total delivery value
		const totalDeliveryValue = orders.reduce((sum, order) => sum + order.totalPrice, 0);

		// Update route
		route.assignedRider = riderId;
		route.status = 'active';
		route.updatedBy = adminId;

		await route.save({ session });

		// Get or create rider wallet
		let riderWallet = await RiderWallet.getOrCreateWallet(riderId);
		riderWallet = await RiderWallet.findOne({ rider: riderId }).session(session);

		// Load goods for route (creates negative balance)
		// This method handles balance decrease and transaction recording
		await riderWallet.loadGoodsForRoute(route._id, totalDeliveryValue, adminId);

		// Update all orders on route with rider assignment
		await Order.updateMany(
			{
				_id: { $in: orders.map((o) => o._id) },
			},
			{
				$set: {
					assignedRider: riderId,
				},
			}
		).session(session);

		await session.commitTransaction();

		// Populate route for response
		const populatedRoute = await Route.findById(route._id)
			.populate('shops.shop', 'shopName phoneNumber location')
			.populate('assignedRider', 'firstName lastName phoneNumber')
			.populate('updatedBy', 'firstName lastName');

		// Send SMS notification to rider about route assignment
		if (rider.phoneNumber) {
			await sendRiderRouteAssignment(rider.phoneNumber, orders.length, route.routeCode);
		}

		// WebSocket: Notify rider about route and wallet update
		emitToUser(riderId.toString(), 'route:assigned', {
			routeId: route._id,
			routeCode: route.routeCode,
			totalOrders: orders.length,
			totalValue: totalDeliveryValue,
			message: `You have been assigned route ${route.routeCode} with ${orders.length} orders`
		});

		// WebSocket: Notify rider about wallet update
		emitToUser(riderId.toString(), 'wallet:updated', {
			balance: riderWallet.balance,
			totalLoadedAmount: riderWallet.totalLoadedAmount,
			outstandingAmount: riderWallet.outstandingAmount,
			message: `Wallet updated: ${orders.length} orders loaded (KES ${totalDeliveryValue.toLocaleString()})`
		});

		return res.status(200).json({
			success: true,
			message: 'Rider assigned to route successfully',
			data: {
				route: populatedRoute,
				assignment: {
					totalOrders: orders.length,
					totalValue: totalDeliveryValue,
					riderWalletBalance: riderWallet.balance,
					totalLoadedAmount: riderWallet.totalLoadedAmount,
					outstandingAmount: riderWallet.outstandingAmount,
				},
			},
		});
	} catch (error) {
		await session.abortTransaction();
		console.error('Assign Rider Error:', error);

		return res.status(500).json({
			success: false,
			message: 'Failed to assign rider to route',
			errors: [error.message],
		});
	} finally {
		session.endSession();
	}
};

module.exports = assignRider;
