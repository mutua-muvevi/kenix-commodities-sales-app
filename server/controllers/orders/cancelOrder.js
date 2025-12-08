/**
 * Cancel Order Controller
 *
 * PATCH /api/orders/:id/cancel
 * Accessible by: admin (any order), shop (own pending orders only)
 *
 * Cancels an order and releases inventory
 * Updates rider wallet if order was assigned
 */

const Order = require('../../models/orders');
const Inventory = require('../../models/inventory');
const Route = require('../../models/routes');
const RiderWallet = require('../../models/riderWallet');
const mongoose = require('mongoose');

/**
 * @route   PATCH /api/orders/:id/cancel
 * @desc    Cancel an order
 * @access  Private (admin, shop with restrictions)
 *
 * @param {string} id - Order ID
 * @body {string} reason - Cancellation reason (required)
 *
 * @returns {Object} Cancelled order
 */
const cancelOrder = async (req, res) => {
	const session = await mongoose.startSession();

	try {
		session.startTransaction();

		const { id } = req.params;
		const { reason } = req.body;
		const userId = req.user._id;
		const userRole = req.user.role;

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

		// Check if order is already delivered or cancelled
		if (order.status === 'cancelled') {
			await session.abortTransaction();
			return res.status(400).json({
				success: false,
				message: 'Order is already cancelled',
				errors: ['This order has already been cancelled'],
			});
		}

		if (order.deliveryStatus === 'delivered') {
			await session.abortTransaction();
			return res.status(400).json({
				success: false,
				message: 'Cannot cancel delivered order',
				errors: ['Order has already been delivered'],
			});
		}

		// Role-based validation
		if (userRole === 'shop') {
			// Shops can only cancel their own pending orders
			if (order.orderer.toString() !== userId.toString()) {
				await session.abortTransaction();
				return res.status(403).json({
					success: false,
					message: 'Access denied',
					errors: ['You can only cancel your own orders'],
				});
			}

			if (order.approvalStatus !== 'pending') {
				await session.abortTransaction();
				return res.status(403).json({
					success: false,
					message: 'Cannot cancel order',
					errors: ['You can only cancel pending orders. Contact admin for approved orders.'],
				});
			}
		}

		// Release inventory for all products (ACID compliance)
		for (const item of order.products) {
			const inventory = await Inventory.findOne({
				product: item.product,
			}).session(session);

			if (inventory) {
				const previousReserved = inventory.reservedQuantity;
				inventory.reservedQuantity = Math.max(
					0,
					inventory.reservedQuantity - item.quantity
				);

				// Add to stock history
				inventory.stockHistory.push({
					type: 'released',
					quantity: item.quantity,
					previousQuantity: previousReserved,
					newQuantity: inventory.reservedQuantity,
					reason: `Order cancelled: ${reason}`,
					relatedOrder: order._id,
					performedBy: userId,
					timestamp: new Date(),
				});

				await inventory.save({ session });
			}
		}

		// If order was assigned to route, remove from route
		if (order.assignedRoute) {
			const route = await Route.findById(order.assignedRoute).session(session);
			if (route) {
				// Logic to remove order from route if applicable
				// (Routes don't have an orders array in the model, but this is for future-proofing)
			}
		}

		// If rider was assigned, update wallet
		if (order.assignedRider) {
			const riderWallet = await RiderWallet.findOne({
				rider: order.assignedRider,
			}).session(session);

			if (riderWallet) {
				// Credit back the amount (remove negative balance)
				riderWallet.currentBalance += order.totalPrice;

				// Add transaction record
				riderWallet.transactions.push({
					type: 'credit',
					amount: order.totalPrice,
					description: `Order ${order.orderId} cancelled`,
					relatedOrder: order._id,
					balanceAfter: riderWallet.currentBalance,
					timestamp: new Date(),
				});

				await riderWallet.save({ session });
			}
		}

		// Update order status
		order.status = 'cancelled';
		order.approvalStatus = 'rejected';
		order.deliveryStatus = 'failed';
		order.rejectionReason = `Cancelled by ${userRole}: ${reason}`;
		order.approvedBy = userId;
		order.approvedAt = new Date();

		await order.save({ session });

		await session.commitTransaction();

		// Populate order for response
		const populatedOrder = await Order.findById(order._id)
			.populate('products.product', 'productName unitPrice imageUrl')
			.populate('orderer', 'shopName phoneNumber')
			.populate('approvedBy', 'firstName lastName');

		return res.status(200).json({
			success: true,
			message: 'Order cancelled successfully',
			data: {
				order: populatedOrder,
			},
		});
	} catch (error) {
		await session.abortTransaction();
		console.error('Cancel Order Error:', error);

		return res.status(500).json({
			success: false,
			message: 'Failed to cancel order',
			errors: [error.message],
		});
	} finally {
		session.endSession();
	}
};

module.exports = cancelOrder;
