/**
 * Get Single Order Controller
 *
 * GET /api/orders/:id
 * Accessible by: all roles (with ownership check)
 *
 * Retrieves a single order with full details
 */

const Order = require('../../models/orders');
const Delivery = require('../../models/deliveries');

/**
 * @route   GET /api/orders/:id
 * @desc    Get single order details
 * @access  Private (all roles - ownership check)
 *
 * @param {string} id - Order ID
 *
 * @returns {Object} Order details with delivery status
 */
const getOrder = async (req, res) => {
	try {
		const { id } = req.params;
		const userId = req.user._id;
		const userRole = req.user.role;

		// Find order
		const order = await Order.findById(id)
			.populate('products.product', 'productName unitPrice imageUrl category description')
			.populate('orderer', 'shopName phoneNumber location address')
			.populate('createdBy', 'firstName lastName role phoneNumber')
			.populate('assignedRider', 'firstName lastName phoneNumber location')
			.populate('assignedRoute', 'routeName routeCode status currentProgress')
			.populate('approvedBy', 'firstName lastName role')
			.populate('mpesaTransaction', 'transactionId amount status timestamp');

		if (!order) {
			return res.status(404).json({
				success: false,
				message: 'Order not found',
				errors: ['No order exists with the specified ID'],
			});
		}

		// Ownership validation based on role
		let hasAccess = false;

		if (userRole === 'admin') {
			hasAccess = true;
		} else if (userRole === 'shop') {
			// Shop can only see their own orders
			hasAccess = order.orderer._id.toString() === userId.toString();
		} else if (userRole === 'sales_agent') {
			// Sales agent can see orders they created
			hasAccess = order.createdBy._id.toString() === userId.toString();
		} else if (userRole === 'rider') {
			// Rider can see orders assigned to them
			hasAccess = order.assignedRider && order.assignedRider._id.toString() === userId.toString();
		}

		if (!hasAccess) {
			return res.status(403).json({
				success: false,
				message: 'Access denied',
				errors: ['You do not have permission to view this order'],
			});
		}

		// Get delivery information if order is assigned to route
		let deliveryInfo = null;
		if (order.assignedRoute) {
			deliveryInfo = await Delivery.findOne({ order: order._id })
				.populate('route', 'routeName routeCode currentProgress')
				.select('deliveryCode status sequenceNumber canProceed arrivedAtShopAt completedAt paymentInfo confirmation')
				.lean();
		}

		// Calculate order summary
		const orderSummary = {
			totalItems: order.products.reduce((sum, item) => sum + item.quantity, 0),
			totalPrice: order.totalPrice,
			status: order.status,
			approvalStatus: order.approvalStatus,
			deliveryStatus: order.deliveryStatus,
			paymentStatus: order.paymentStatus,
		};

		return res.status(200).json({
			success: true,
			message: 'Order retrieved successfully',
			data: {
				order,
				orderSummary,
				deliveryInfo,
			},
		});
	} catch (error) {
		console.error('Get Order Error:', error);

		return res.status(500).json({
			success: false,
			message: 'Failed to retrieve order',
			errors: [error.message],
		});
	}
};

module.exports = getOrder;
