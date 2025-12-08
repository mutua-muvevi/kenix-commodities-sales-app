/**
 * Approve Order Controller
 *
 * PATCH /api/orders/:id/approve
 * Accessible by: admin only
 *
 * Approves a pending order
 */

const Order = require('../../models/orders');
const { sendOrderApproval } = require('../../services/sms/africasTalking');
const { emitToUser, emitToRole } = require('../../websocket/index');

/**
 * @route   PATCH /api/orders/:id/approve
 * @desc    Approve a pending order
 * @access  Private (admin only)
 *
 * @param {string} id - Order ID
 * @body {string} [notes] - Optional approval notes
 *
 * @returns {Object} Approved order
 */
const approveOrder = async (req, res) => {
	try {
		const { id } = req.params;
		const adminId = req.user._id;
		const { notes } = req.body;

		// Find order
		const order = await Order.findById(id);

		if (!order) {
			return res.status(404).json({
				success: false,
				message: 'Order not found',
				errors: ['No order exists with the specified ID'],
			});
		}

		// Check if order is pending
		if (order.approvalStatus !== 'pending') {
			return res.status(400).json({
				success: false,
				message: 'Order cannot be approved',
				errors: [`Order is already ${order.approvalStatus}`],
			});
		}

		// Update order
		order.approvalStatus = 'approved';
		order.approvedBy = adminId;
		order.approvedAt = new Date();
		order.status = 'processing';

		// Add notes if provided
		if (notes) {
			order.deliveryAddress.deliveryNotes =
				(order.deliveryAddress.deliveryNotes || '') +
				`\nAdmin notes: ${notes}`;
		}

		await order.save();

		// Populate order for response
		const populatedOrder = await Order.findById(order._id)
			.populate('products.product', 'productName unitPrice imageUrl')
			.populate('orderer', 'shopName phoneNumber')
			.populate('approvedBy', 'firstName lastName');

		// Send SMS notification to shop
		if (populatedOrder.orderer?.phoneNumber) {
			await sendOrderApproval(populatedOrder.orderer.phoneNumber, order.orderId);
		}

		// WebSocket: Notify shop and admin
		emitToUser(order.orderer.toString(), 'order:approved', {
			orderId: order._id,
			orderNumber: order.orderId,
			status: 'approved',
			message: 'Your order has been approved'
		});
		emitToRole('admin', 'order:status-changed', {
			orderId: order._id,
			orderNumber: order.orderId,
			newStatus: 'approved'
		});

		return res.status(200).json({
			success: true,
			message: 'Order approved successfully',
			data: {
				order: populatedOrder,
			},
		});
	} catch (error) {
		console.error('Approve Order Error:', error);

		return res.status(500).json({
			success: false,
			message: 'Failed to approve order',
			errors: [error.message],
		});
	}
};

module.exports = approveOrder;
