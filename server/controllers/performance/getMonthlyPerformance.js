/**
 * Get Monthly Performance Controller
 *
 * Endpoint: GET /api/performance/sales-agents/:agentId/monthly
 * Accessible by: sales_agent (own), admin
 * Query params: ?month=11&year=2025
 *
 * Returns monthly performance metrics for a sales agent
 */

const SalesPerformance = require('../../models/salesPerformance');
const User = require('../../models/user');
const Order = require('../../models/orders');
const ErrorResponse = require('../../utils/error-response');
const logger = require('../../utils/logger');

/**
 * Calculate month date range
 */
const getMonthDateRange = (month, year) => {
	const currentDate = new Date();
	const currentYear = year || currentDate.getFullYear();
	const currentMonth = month || (currentDate.getMonth() + 1);

	const monthNumber = parseInt(currentMonth);

	// Start of month
	const startDate = new Date(currentYear, monthNumber - 1, 1);
	// Start of next month (end date)
	const endDate = new Date(currentYear, monthNumber, 1);

	const periodIdentifier = `${currentYear}-${String(monthNumber).padStart(2, '0')}`;

	return { startDate, endDate, monthNumber, periodIdentifier };
};

/**
 * Get monthly performance for a sales agent
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getMonthlyPerformance = async (req, res, next) => {
	try {
		const { agentId } = req.params;
		const requestingUser = req.user;

		// Query parameters
		const { month, year } = req.query;

		// Authorization check - sales agent can only view own performance, admin can view any
		if (requestingUser.role !== 'admin' && requestingUser._id.toString() !== agentId) {
			return res.status(403).json({
				success: false,
				message: 'Access denied. You can only view your own performance.',
				errors: ['Unauthorized access to performance data'],
			});
		}

		// Verify sales agent exists
		const agent = await User.findById(agentId);
		if (!agent) {
			return res.status(404).json({
				success: false,
				message: 'Sales agent not found',
				errors: [`No user found with ID: ${agentId}`],
			});
		}

		if (agent.role !== 'sales_agent') {
			return res.status(400).json({
				success: false,
				message: 'User is not a sales agent',
				errors: ['The specified user does not have the sales_agent role'],
			});
		}

		// Calculate month date range
		const { startDate, endDate, monthNumber, periodIdentifier } = getMonthDateRange(month, year);

		// Try to get existing performance record
		let performance = await SalesPerformance.findOne({
			salesAgent: agentId,
			periodIdentifier,
		}).populate('salesAgent', 'firstName lastName phoneNumber email');

		// If no performance record exists, calculate from actual data
		if (!performance) {
			// Count shops registered in this month
			const shopsRegistered = await User.countDocuments({
				role: 'shop',
				createdBy: agentId,
				createdAt: { $gte: startDate, $lt: endDate },
			});

			// Get registered shops details
			const registeredShopsList = await User.find({
				role: 'shop',
				createdBy: agentId,
				createdAt: { $gte: startDate, $lt: endDate },
			}).select('firstName lastName businessName createdAt');

			// Count and calculate orders placed in this month
			const orders = await Order.find({
				createdBy: agentId,
				createdAt: { $gte: startDate, $lt: endDate },
			});

			const ordersPlaced = orders.length;
			const totalOrderValue = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

			// Calculate commission (2% of order value as example)
			const commissionRate = 0.02;
			const baseCommission = totalOrderValue * commissionRate;
			const registrationBonus = shopsRegistered * 500; // 500 KES per shop registration

			// Performance bonus based on achievement
			let performanceBonus = 0;
			if (shopsRegistered >= 20) performanceBonus += 2000; // Met monthly target
			if (ordersPlaced >= 80) performanceBonus += 3000; // Met monthly target

			const totalCommission = baseCommission + registrationBonus + performanceBonus;

			// Get active shops count
			const activeShops = await User.countDocuments({
				role: 'shop',
				createdBy: agentId,
				'banStatus.isBanned': false,
			});

			// Create performance object (not saved to DB, just for response)
			performance = {
				salesAgent: agent,
				period: 'monthly',
				startDate,
				endDate,
				periodIdentifier,
				metrics: {
					shopsRegistered,
					registrationTarget: 20, // Monthly target
					ordersPlaced,
					ordersTarget: 80, // Monthly target
					totalOrderValue,
					shopsVisited: 0, // Would need visit logging
					visitsTarget: 40, // Monthly target
					activeShops,
				},
				commission: {
					baseCommission,
					registrationBonus,
					performanceBonus,
					totalCommission,
					isPaid: false,
				},
				registeredShops: registeredShopsList.map(shop => ({
					shop: shop._id,
					registeredAt: shop.createdAt,
				})),
				visits: [],
			};
		}

		// Calculate achievement percentages
		const registrationAchievement = performance.metrics.registrationTarget > 0
			? (performance.metrics.shopsRegistered / performance.metrics.registrationTarget) * 100
			: 0;

		const ordersAchievement = performance.metrics.ordersTarget > 0
			? (performance.metrics.ordersPlaced / performance.metrics.ordersTarget) * 100
			: 0;

		const visitsAchievement = performance.metrics.visitsTarget > 0
			? (performance.metrics.shopsVisited / performance.metrics.visitsTarget) * 100
			: 0;

		const averageOrderValue = performance.metrics.ordersPlaced > 0
			? performance.metrics.totalOrderValue / performance.metrics.ordersPlaced
			: 0;

		// Get month name
		const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
			'July', 'August', 'September', 'October', 'November', 'December'];
		const monthName = monthNames[monthNumber - 1];

		logger.info(`Monthly performance retrieved for agent ${agentId}, ${monthName} ${year || new Date().getFullYear()}`);

		return res.status(200).json({
			success: true,
			message: 'Monthly performance retrieved successfully',
			data: {
				performance: {
					agent: {
						id: performance.salesAgent._id || agent._id,
						name: `${agent.firstName} ${agent.lastName}`,
						phoneNumber: agent.phoneNumber,
						email: agent.email,
					},
					period: {
						type: 'monthly',
						month: monthNumber,
						monthName,
						year: year || new Date().getFullYear(),
						startDate,
						endDate,
						identifier: periodIdentifier,
					},
					metrics: {
						shopsRegistered: performance.metrics.shopsRegistered,
						registrationTarget: performance.metrics.registrationTarget,
						registrationAchievement: parseFloat(registrationAchievement.toFixed(2)),
						ordersPlaced: performance.metrics.ordersPlaced,
						ordersTarget: performance.metrics.ordersTarget,
						ordersAchievement: parseFloat(ordersAchievement.toFixed(2)),
						totalOrderValue: performance.metrics.totalOrderValue,
						averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
						shopsVisited: performance.metrics.shopsVisited,
						visitsTarget: performance.metrics.visitsTarget,
						visitsAchievement: parseFloat(visitsAchievement.toFixed(2)),
						activeShops: performance.metrics.activeShops,
					},
					commission: {
						baseCommission: performance.commission.baseCommission,
						registrationBonus: performance.commission.registrationBonus,
						performanceBonus: performance.commission.performanceBonus,
						totalCommission: performance.commission.totalCommission,
						isPaid: performance.commission.isPaid,
						paidAt: performance.commission.paidAt,
					},
					registeredShops: performance.registeredShops,
					overallAchievement: parseFloat(((registrationAchievement + ordersAchievement + visitsAchievement) / 3).toFixed(2)),
				},
			},
		});
	} catch (error) {
		logger.error('Get Monthly Performance Error:', error);
		return next(new ErrorResponse('Failed to retrieve monthly performance', 500));
	}
};

module.exports = getMonthlyPerformance;
