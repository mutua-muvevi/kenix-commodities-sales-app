/**
 * Get All Agents Performance Controller
 *
 * Endpoint: GET /api/performance/sales-agents
 * Accessible by: admin only
 * Query params: ?period=week&sortBy=revenue
 *
 * Returns performance leaderboard for all sales agents
 */

const User = require('../../models/user');
const Order = require('../../models/orders');
const ErrorResponse = require('../../utils/error-response');
const logger = require('../../utils/logger');

/**
 * Calculate current week/month date range
 */
const getDateRange = (period) => {
	const currentDate = new Date();
	const currentYear = currentDate.getFullYear();

	if (period === 'week') {
		// Calculate current week
		const firstDayOfYear = new Date(currentYear, 0, 1);
		const pastDaysOfYear = (currentDate - firstDayOfYear) / 86400000;
		const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
		const daysOffset = (weekNumber - 1) * 7;
		const startDate = new Date(firstDayOfYear.getTime() + daysOffset * 86400000);
		const endDate = new Date(startDate.getTime() + 7 * 86400000);
		return { startDate, endDate };
	} else {
		// Calculate current month
		const startDate = new Date(currentYear, currentDate.getMonth(), 1);
		const endDate = new Date(currentYear, currentDate.getMonth() + 1, 1);
		return { startDate, endDate };
	}
};

/**
 * Get performance for all sales agents
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getAllAgentsPerformance = async (req, res, next) => {
	try {
		// Query parameters
		const period = req.query.period === 'month' ? 'month' : 'week'; // Default to week
		const sortBy = req.query.sortBy || 'revenue'; // revenue, orders, registrations

		// Get date range
		const { startDate, endDate } = getDateRange(period);

		// Get all sales agents
		const salesAgents = await User.find({
			role: 'sales_agent',
			'banStatus.isBanned': false,
		}).select('firstName lastName phoneNumber email');

		if (salesAgents.length === 0) {
			return res.status(200).json({
				success: true,
				message: 'No sales agents found',
				data: {
					leaderboard: [],
					period: {
						type: period,
						startDate,
						endDate,
					},
				},
			});
		}

		// Calculate performance for each agent
		const performanceData = await Promise.all(salesAgents.map(async (agent) => {
			// Count shops registered
			const shopsRegistered = await User.countDocuments({
				role: 'shop',
				createdBy: agent._id,
				createdAt: { $gte: startDate, $lt: endDate },
			});

			// Count and calculate orders
			const orders = await Order.find({
				createdBy: agent._id,
				createdAt: { $gte: startDate, $lt: endDate },
			});

			const ordersPlaced = orders.length;
			const totalOrderValue = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

			// Calculate commission
			const commissionRate = 0.02;
			const baseCommission = totalOrderValue * commissionRate;
			const registrationBonus = shopsRegistered * 500;
			const totalCommission = baseCommission + registrationBonus;

			// Get active shops managed
			const activeShops = await User.countDocuments({
				role: 'shop',
				createdBy: agent._id,
				'banStatus.isBanned': false,
			});

			// Calculate average order value
			const averageOrderValue = ordersPlaced > 0 ? totalOrderValue / ordersPlaced : 0;

			return {
				agent: {
					id: agent._id,
					name: `${agent.firstName} ${agent.lastName}`,
					phoneNumber: agent.phoneNumber,
					email: agent.email,
				},
				metrics: {
					shopsRegistered,
					ordersPlaced,
					totalOrderValue,
					averageOrderValue,
					activeShops,
				},
				commission: {
					baseCommission,
					registrationBonus,
					totalCommission,
				},
			};
		}));

		// Sort based on sortBy parameter
		const sortedPerformance = performanceData.sort((a, b) => {
			switch (sortBy) {
				case 'revenue':
					return b.metrics.totalOrderValue - a.metrics.totalOrderValue;
				case 'orders':
					return b.metrics.ordersPlaced - a.metrics.ordersPlaced;
				case 'registrations':
					return b.metrics.shopsRegistered - a.metrics.shopsRegistered;
				case 'commission':
					return b.commission.totalCommission - a.commission.totalCommission;
				default:
					return b.metrics.totalOrderValue - a.metrics.totalOrderValue;
			}
		});

		// Add rank to each agent
		const leaderboard = sortedPerformance.map((performance, index) => ({
			rank: index + 1,
			...performance,
		}));

		// Calculate totals
		const totals = {
			totalShopsRegistered: performanceData.reduce((sum, p) => sum + p.metrics.shopsRegistered, 0),
			totalOrdersPlaced: performanceData.reduce((sum, p) => sum + p.metrics.ordersPlaced, 0),
			totalRevenue: performanceData.reduce((sum, p) => sum + p.metrics.totalOrderValue, 0),
			totalCommission: performanceData.reduce((sum, p) => sum + p.commission.totalCommission, 0),
		};

		logger.info(`Performance leaderboard retrieved for ${salesAgents.length} agents, period: ${period}`);

		return res.status(200).json({
			success: true,
			message: 'Sales agents performance retrieved successfully',
			data: {
				leaderboard,
				period: {
					type: period,
					startDate,
					endDate,
				},
				summary: {
					totalAgents: salesAgents.length,
					sortedBy: sortBy,
					totals,
					averages: {
						averageShopsPerAgent: parseFloat((totals.totalShopsRegistered / salesAgents.length).toFixed(2)),
						averageOrdersPerAgent: parseFloat((totals.totalOrdersPlaced / salesAgents.length).toFixed(2)),
						averageRevenuePerAgent: parseFloat((totals.totalRevenue / salesAgents.length).toFixed(2)),
						averageCommissionPerAgent: parseFloat((totals.totalCommission / salesAgents.length).toFixed(2)),
					},
				},
			},
		});
	} catch (error) {
		logger.error('Get All Agents Performance Error:', error);
		return next(new ErrorResponse('Failed to retrieve agents performance', 500));
	}
};

module.exports = getAllAgentsPerformance;
