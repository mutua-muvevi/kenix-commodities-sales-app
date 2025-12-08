/**
 * Get Weekly Performance Controller
 *
 * Endpoint: GET /api/performance/sales-agents/:agentId/weekly
 * Accessible by: sales_agent (own), admin
 * Query params: ?week=current&year=2025
 *
 * Returns weekly performance metrics for a sales agent
 */

const SalesPerformance = require('../../models/salesPerformance');
const User = require('../../models/user');
const Order = require('../../models/orders');
const ErrorResponse = require('../../utils/error-response');
const logger = require('../../utils/logger');

/**
 * Calculate week number and date range
 */
const getWeekDateRange = (week, year) => {
	const currentDate = new Date();
	const currentYear = year || currentDate.getFullYear();

	let weekNumber;
	if (week === 'current' || !week) {
		// Calculate current week number
		const firstDayOfYear = new Date(currentYear, 0, 1);
		const pastDaysOfYear = (currentDate - firstDayOfYear) / 86400000;
		weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
	} else {
		weekNumber = parseInt(week);
	}

	// Calculate start and end dates for the week
	const firstDayOfYear = new Date(currentYear, 0, 1);
	const daysOffset = (weekNumber - 1) * 7;
	const startDate = new Date(firstDayOfYear.getTime() + daysOffset * 86400000);
	const endDate = new Date(startDate.getTime() + 7 * 86400000);

	const periodIdentifier = `${currentYear}-W${String(weekNumber).padStart(2, '0')}`;

	return { startDate, endDate, weekNumber, periodIdentifier };
};

/**
 * Get weekly performance for a sales agent
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getWeeklyPerformance = async (req, res, next) => {
	try {
		const { agentId } = req.params;
		const requestingUser = req.user;

		// Query parameters
		const { week, year } = req.query;

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

		// Calculate week date range
		const { startDate, endDate, weekNumber, periodIdentifier } = getWeekDateRange(week, year);

		// Try to get existing performance record
		let performance = await SalesPerformance.findOne({
			salesAgent: agentId,
			periodIdentifier,
		}).populate('salesAgent', 'firstName lastName phoneNumber email');

		// If no performance record exists, calculate from actual data
		if (!performance) {
			// Count shops registered in this week
			const shopsRegistered = await User.countDocuments({
				role: 'shop',
				createdBy: agentId,
				createdAt: { $gte: startDate, $lt: endDate },
			});

			// Count and calculate orders placed in this week
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
			const totalCommission = baseCommission + registrationBonus;

			// Get active shops count
			const activeShops = await User.countDocuments({
				role: 'shop',
				createdBy: agentId,
				'banStatus.isBanned': false,
			});

			// Create performance object (not saved to DB, just for response)
			performance = {
				salesAgent: agent,
				period: 'weekly',
				startDate,
				endDate,
				periodIdentifier,
				metrics: {
					shopsRegistered,
					registrationTarget: 5, // Default target
					ordersPlaced,
					ordersTarget: 20, // Default target
					totalOrderValue,
					shopsVisited: 0, // Would need visit logging
					visitsTarget: 10, // Default target
					activeShops,
				},
				commission: {
					baseCommission,
					registrationBonus,
					performanceBonus: 0,
					totalCommission,
					isPaid: false,
				},
				registeredShops: [],
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

		logger.info(`Weekly performance retrieved for agent ${agentId}, week ${weekNumber}`);

		return res.status(200).json({
			success: true,
			message: 'Weekly performance retrieved successfully',
			data: {
				performance: {
					agent: {
						id: performance.salesAgent._id || agent._id,
						name: `${agent.firstName} ${agent.lastName}`,
						phoneNumber: agent.phoneNumber,
						email: agent.email,
					},
					period: {
						type: 'weekly',
						week: weekNumber,
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
					overallAchievement: parseFloat(((registrationAchievement + ordersAchievement + visitsAchievement) / 3).toFixed(2)),
				},
			},
		});
	} catch (error) {
		logger.error('Get Weekly Performance Error:', error);
		return next(new ErrorResponse('Failed to retrieve weekly performance', 500));
	}
};

module.exports = getWeeklyPerformance;
