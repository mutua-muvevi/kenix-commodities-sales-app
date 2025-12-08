/**
 * Performance API Routes
 *
 * All routes for sales agent performance tracking including:
 * - Weekly performance metrics
 * - Monthly performance metrics
 * - Performance leaderboard
 */

const express = require('express');
const router = express.Router();

// Middleware
const { authenticationMiddleware } = require('../middleware/auth/authentication');
const { getMe } = require('../middleware/user/me');
const { checkRole } = require('../middleware/rbac/checkRole');
const { validateObjectId } = require('../middleware/validation/validateRequest');

// Controllers
const getWeeklyPerformance = require('../controllers/performance/getWeeklyPerformance');
const getMonthlyPerformance = require('../controllers/performance/getMonthlyPerformance');
const getAllAgentsPerformance = require('../controllers/performance/getAllAgentsPerformance');

// Apply authentication and getMe to all routes
router.use(authenticationMiddleware);
router.use(getMe);

/**
 * @route   GET /api/performance/sales-agents/:agentId/weekly
 * @desc    Get weekly performance for a specific sales agent
 * @access  Private (sales_agent - own, admin - any)
 * @query   week (current/number), year
 */
router.get(
	'/sales-agents/:agentId/weekly',
	validateObjectId('agentId'),
	getWeeklyPerformance
);

/**
 * @route   GET /api/performance/sales-agents/:agentId/monthly
 * @desc    Get monthly performance for a specific sales agent
 * @access  Private (sales_agent - own, admin - any)
 * @query   month (number), year
 */
router.get(
	'/sales-agents/:agentId/monthly',
	validateObjectId('agentId'),
	getMonthlyPerformance
);

/**
 * @route   GET /api/performance/sales-agents
 * @desc    Get performance leaderboard for all sales agents
 * @access  Private (admin only)
 * @query   period (week/month), sortBy (revenue/orders/registrations/commission)
 */
router.get(
	'/sales-agents',
	checkRole(['admin']),
	getAllAgentsPerformance
);

module.exports = router;
