/**
 * Reject Order Controller
 *
 * PATCH /api/orders/:id/reject
 * Accessible by: admin only
 *
 * Rejects a pending order and releases inventory
 */

const Order = require('../../models/orders');
const Inventory = require('../../models/inventory');
const mongoose = require('mongoose');
const { sendOrderRejection } = require('../../services/sms/africasTalking');
const { emitToUser } = require('../../websocket/index');

/**
 * @route   PATCH /api/orders/:id/reject
 * @desc    Reject a pending order
 * @access  Private (admin only)
 *
 * @param {string} id - Order ID
 * @body {string} reason - Rejection reason (required)
 *
 * @returns {Object} Rejected order
 */
const rejectOrder = async (req, res) => {
	const session = await mongoose.startSession();

	try {
		session.startTransaction();

		const { id } = req.params;
		const adminId = req.user._id;
		const { reason } = req.body;

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

		// Check if order is pending
		if (order.approvalStatus !== 'pending') {
			await session.abortTransaction();
			return res.status(400).json({
				success: false,
				message: 'Order cannot be rejected',
				errors: [`Order is already ${order.approvalStatus}`],
			});
		}

		// Release reserved inventory (ACID compliance)
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
					reason: `Order rejected: ${reason}`,
					relatedOrder: order._id,
					performedBy: adminId,
					timestamp: new Date(),
				});

				await inventory.save({ session });
			}
		}

		// Update order
		order.approvalStatus = 'rejected';
		order.approvedBy = adminId;
		order.approvedAt = new Date();
		order.rejectionReason = reason;
		order.status = 'cancelled';

		await order.save({ session });

		await session.commitTransaction();

		// Populate order for response
		const populatedOrder = await Order.findById(order._id)
			.populate('products.product', 'productName unitPrice imageUrl')
			.populate('orderer', 'shopName phoneNumber')
			.populate('approvedBy', 'firstName lastName');

		// Send SMS notification to shop about rejection
		if (populatedOrder.orderer?.phoneNumber) {
			await sendOrderRejection(populatedOrder.orderer.phoneNumber, order.orderId, reason);
		}

		// WebSocket: Notify shop
		emitToUser(order.orderer.toString(), 'order:rejected', {
			orderId: order._id,
			orderNumber: order.orderId,
			status: 'rejected',
			reason: reason,
			message: `Your order has been rejected: ${reason}`
		});

		return res.status(200).json({
			success: true,
			message: 'Order rejected successfully',
			data: {
				order: populatedOrder,
			},
		});
	} catch (error) {
		await session.abortTransaction();
		console.error('Reject Order Error:', error);

		return res.status(500).json({
			success: false,
			message: 'Failed to reject order',
			errors: [error.message],
		});
	} finally {
		session.endSession();
	}
};

module.exports = rejectOrder;
