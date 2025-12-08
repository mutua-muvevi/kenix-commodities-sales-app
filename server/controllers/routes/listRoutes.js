/**
 * List Routes Controller
 *
 * GET /api/routes
 * Accessible by: admin (all routes), rider (own routes)
 *
 * Lists routes with filters and pagination
 */

const Route = require('../../models/routes');

/**
 * @route   GET /api/routes
 * @desc    List all routes with filters
 * @access  Private (admin, rider)
 *
 * @query {string} [status] - Filter by status (active, inactive, archived)
 * @query {string} [riderId] - Filter by assigned rider
 * @query {string} [date] - Filter by specific date
 * @query {string} [inProgress] - Filter by in-progress status (true/false)
 * @query {number} [page=1] - Page number
 * @query {number} [limit=20] - Items per page
 *
 * @returns {Object} Paginated list of routes
 */
const listRoutes = async (req, res) => {
	try {
		const userId = req.user._id;
		const userRole = req.user.role;

		// Pagination
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 20;
		const skip = (page - 1) * limit;

		// Build filter
		const filter = {};

		// Role-based filtering
		if (userRole === 'rider') {
			// Riders see only their assigned routes
			filter.assignedRider = userId;
		}
		// Admin sees all routes

		// Apply query filters
		if (req.query.status) {
			filter.status = req.query.status.toLowerCase();
		}

		if (req.query.riderId) {
			filter.assignedRider = req.query.riderId;
		}

		if (req.query.inProgress) {
			filter['currentProgress.isInProgress'] = req.query.inProgress === 'true';
		}

		// Date filter (for routes with specific date field - optional)
		if (req.query.date) {
			const targetDate = new Date(req.query.date);
			const nextDay = new Date(targetDate);
			nextDay.setDate(nextDay.getDate() + 1);

			filter.createdAt = {
				$gte: targetDate,
				$lt: nextDay,
			};
		}

		// Sorting
		const sort = req.query.sort || '-createdAt';

		// Execute query
		const [routes, totalCount] = await Promise.all([
			Route.find(filter)
				.sort(sort)
				.skip(skip)
				.limit(limit)
				.populate('shops.shop', 'shopName phoneNumber location')
				.populate('assignedRider', 'firstName lastName phoneNumber')
				.populate('assignedSalesAgent', 'firstName lastName')
				.populate('createdBy', 'firstName lastName')
				.lean(),
			Route.countDocuments(filter),
		]);

		// Calculate completion percentage for each route
		const routesWithProgress = routes.map((route) => {
			const totalShops = route.stats.totalShops || route.shops.length;
			const completedShops = route.currentProgress.currentShopIndex;
			const completionPercentage = totalShops > 0
				? Math.round((completedShops / totalShops) * 100)
				: 0;

			return {
				...route,
				completionPercentage,
			};
		});

		// Pagination metadata
		const totalPages = Math.ceil(totalCount / limit);
		const hasNextPage = page < totalPages;
		const hasPrevPage = page > 1;

		return res.status(200).json({
			success: true,
			message: 'Routes retrieved successfully',
			data: {
				routes: routesWithProgress,
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
		console.error('List Routes Error:', error);

		return res.status(500).json({
			success: false,
			message: 'Failed to retrieve routes',
			errors: [error.message],
		});
	}
};

module.exports = listRoutes;
