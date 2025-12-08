/**
 * List Orders Controller
 *
 * GET /api/orders
 * Accessible by: all roles (filtered by role)
 *
 * Lists orders with role-based filtering and pagination
 */

const Order = require('../../models/orders');

/**
 * @route   GET /api/orders
 * @desc    List orders with filters and pagination
 * @access  Private (all roles - filtered by role)
 *
 * @query {string} [status] - Filter by order status
 * @query {string} [approvalStatus] - Filter by approval status
 * @query {string} [deliveryStatus] - Filter by delivery status
 * @query {string} [shopId] - Filter by shop (admin only)
 * @query {string} [riderId] - Filter by rider
 * @query {string} [routeId] - Filter by route
 * @query {string} [startDate] - Filter orders from this date
 * @query {string} [endDate] - Filter orders until this date
 * @query {number} [page=1] - Page number
 * @query {number} [limit=20] - Items per page
 * @query {string} [sort=-createdAt] - Sort field
 *
 * @returns {Object} Paginated list of orders
 */
const listOrders = async (req, res) => {
	try {
		const userId = req.user._id;
		const userRole = req.user.role;

		// Pagination
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 20;
		const skip = (page - 1) * limit;

		// Build filter based on role
		const filter = {};

		// Role-based filtering
		if (userRole === 'shop') {
			// Shops see only their orders
			filter.orderer = userId;
		} else if (userRole === 'sales_agent') {
			// Sales agents see orders they created
			filter.createdBy = userId;
		} else if (userRole === 'rider') {
			// Riders see orders assigned to their active routes
			filter.assignedRider = userId;
		}
		// Admin sees all orders (no filter)

		// Apply query filters
		if (req.query.status) {
			filter.status = req.query.status.toLowerCase();
		}

		if (req.query.approvalStatus) {
			filter.approvalStatus = req.query.approvalStatus.toLowerCase();
		}

		if (req.query.deliveryStatus) {
			filter.deliveryStatus = req.query.deliveryStatus.toLowerCase();
		}

		// Admin-only filters
		if (userRole === 'admin' && req.query.shopId) {
			filter.orderer = req.query.shopId;
		}

		if (req.query.riderId) {
			filter.assignedRider = req.query.riderId;
		}

		if (req.query.routeId) {
			filter.assignedRoute = req.query.routeId;
		}

		// Date range filter
		if (req.query.startDate || req.query.endDate) {
			filter.createdAt = {};

			if (req.query.startDate) {
				filter.createdAt.$gte = new Date(req.query.startDate);
			}

			if (req.query.endDate) {
				const endDate = new Date(req.query.endDate);
				endDate.setHours(23, 59, 59, 999);
				filter.createdAt.$lte = endDate;
			}
		}

		// Sorting
		const sort = req.query.sort || '-createdAt';

		// Execute query
		const [orders, totalCount] = await Promise.all([
			Order.find(filter)
				.sort(sort)
				.skip(skip)
				.limit(limit)
				.populate('products.product', 'productName unitPrice imageUrl')
				.populate('orderer', 'shopName phoneNumber location')
				.populate('createdBy', 'firstName lastName role')
				.populate('assignedRider', 'firstName lastName phoneNumber')
				.populate('assignedRoute', 'routeName routeCode')
				.populate('approvedBy', 'firstName lastName')
				.populate('mpesaTransaction', 'transactionId amount status')
				.lean(),
			Order.countDocuments(filter),
		]);

		// Calculate pagination metadata
		const totalPages = Math.ceil(totalCount / limit);
		const hasNextPage = page < totalPages;
		const hasPrevPage = page > 1;

		return res.status(200).json({
			success: true,
			message: 'Orders retrieved successfully',
			data: {
				orders,
				pagination: {
					currentPage: page,
					totalPages,
					totalCount,
					limit,
					hasNextPage,
					hasPrevPage,
				},
			},
		});
	} catch (error) {
		console.error('List Orders Error:', error);

		return res.status(500).json({
			success: false,
			message: 'Failed to retrieve orders',
			errors: [error.message],
		});
	}
};

module.exports = listOrders;
