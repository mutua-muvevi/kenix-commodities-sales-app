/**
 * Assign Order to Route Controller
 *
 * PATCH /api/orders/:id/assign-route
 * Accessible by: admin only
 *
 * Assigns an approved order to a route and rider
 * Updates rider wallet with negative balance
 */

const Order = require('../../models/orders');
const Route = require('../../models/routes');
const User = require('../../models/user');
const RiderWallet = require('../../models/riderWallet');
const mongoose = require('mongoose');
const { sendRiderOrderAssignment } = require('../../services/sms/africasTalking');
const { emitToUser } = require('../../websocket/index');

/**
 * @route   PATCH /api/orders/:id/assign-route
 * @desc    Assign order to route and rider
 * @access  Private (admin only)
 *
 * @param {string} id - Order ID
 * @body {string} routeId - Route ID
 * @body {string} riderId - Rider user ID
 *
 * @returns {Object} Updated order
 */
const assignOrderToRoute = async (req, res) => {
	const session = await mongoose.startSession();

	try {
		session.startTransaction();

		const { id } = req.params;
		const { routeId, riderId } = req.body;
		const adminId = req.user._id;

		// Find order
		const order = await Order.findById(id).session(session);

		if (!order) {
			await session.abortTransaction();
			return res.status(404).json({
				success: false,
				message: 'Order not found',
				errors: ['No order exists with the specified ID'],
			});
		}

		// Check order is approved
		if (order.approvalStatus !== 'approved') {
			await session.abortTransaction();
			return res.status(400).json({
				success: false,
				message: 'Order must be approved before assignment',
				errors: [`Order is currently ${order.approvalStatus}`],
			});
		}

		// Validate route exists and is active
		const route = await Route.findById(routeId).session(session);

		if (!route) {
			await session.abortTransaction();
			return res.status(404).json({
				success: false,
				message: 'Route not found',
				errors: ['The specified route does not exist'],
			});
		}

		if (route.status !== 'active') {
			await session.abortTransaction();
			return res.status(400).json({
				success: false,
				message: 'Route is not active',
				errors: [`Route status is ${route.status}`],
			});
		}

		// Validate rider exists and has rider role
		const rider = await User.findById(riderId).session(session);

		if (!rider) {
			await session.abortTransaction();
			return res.status(404).json({
				success: false,
				message: 'Rider not found',
				errors: ['The specified rider does not exist'],
			});
		}

		if (rider.role !== 'rider') {
			await session.abortTransaction();
			return res.status(400).json({
				success: false,
				message: 'Invalid rider',
				errors: [`User ${rider.firstName} ${rider.lastName} is not a rider`],
			});
		}

		// Validate shop is on the route
		const shopOnRoute = route.shops.find(
			(s) => s.shop.toString() === order.orderer.toString()
		);

		if (!shopOnRoute) {
			await session.abortTransaction();
			return res.status(400).json({
				success: false,
				message: 'Shop not on route',
				errors: ['The order shop is not part of the selected route'],
			});
		}

		// Update order
		order.assignedRoute = routeId;
		order.assignedRider = riderId;
		order.deliveryStatus = 'assigned';

		await order.save({ session });

		// Update rider wallet - increase negative balance (money owed to company)
		let riderWallet = await RiderWallet.findOne({ rider: riderId }).session(session);

		if (!riderWallet) {
			// Create wallet if doesn't exist
			riderWallet = new RiderWallet({
				rider: riderId,
				currentBalance: -order.totalPrice,
				totalDeliveries: 0,
				totalEarnings: 0,
			});
		} else {
			riderWallet.currentBalance -= order.totalPrice;
		}

		// Add transaction record
		riderWallet.transactions.push({
			type: 'debit',
			amount: order.totalPrice,
			description: `Order ${order.orderId} assigned`,
			relatedOrder: order._id,
			balanceAfter: riderWallet.currentBalance,
			timestamp: new Date(),
		});

		await riderWallet.save({ session });

		await session.commitTransaction();

		// Populate order for response
		const populatedOrder = await Order.findById(order._id)
			.populate('products.product', 'productName unitPrice imageUrl')
			.populate('orderer', 'shopName phoneNumber location')
			.populate('assignedRider', 'firstName lastName phoneNumber')
			.populate('assignedRoute', 'routeName routeCode');

		// Send SMS notification to rider about new assignment
		if (rider.phoneNumber) {
			const shopName = populatedOrder.orderer?.shopName || 'Shop';
			const address = populatedOrder.orderer?.location?.address || 'Check app for details';
			await sendRiderOrderAssignment(rider.phoneNumber, order.orderId, shopName, address);
		}

		// WebSocket: Notify rider and shop
		emitToUser(riderId.toString(), 'order:assigned', {
			orderId: order._id,
			orderNumber: order.orderId,
			shopName: populatedOrder.orderer?.shopName,
			address: populatedOrder.orderer?.location?.address,
			message: `New delivery assigned: Order #${order.orderId}`
		});
		emitToUser(order.orderer.toString(), 'order:assigned', {
			orderId: order._id,
			orderNumber: order.orderId,
			riderName: `${rider.firstName} ${rider.lastName}`,
			message: 'A rider has been assigned to your order'
		});

		return res.status(200).json({
			success: true,
			message: 'Order assigned to route successfully',
			data: {
				order: populatedOrder,
				riderWalletBalance: riderWallet.currentBalance,
			},
		});
	} catch (error) {
		await session.abortTransaction();
		console.error('Assign Order to Route Error:', error);

		return res.status(500).json({
			success: false,
			message: 'Failed to assign order to route',
			errors: [error.message],
		});
	} finally {
		session.endSession();
	}
};

module.exports = assignOrderToRoute;
