/**
 * Shop Wallet API Routes
 *
 * All routes for shop wallet services including:
 * - Getting wallet balance
 * - Transaction history
 */

const express = require('express');
const router = express.Router();

// Middleware
const { authenticationMiddleware } = require('../middleware/auth/authentication');
const { getMe } = require('../middleware/user/me');
const { checkRole } = require('../middleware/rbac/checkRole');

// Controllers
const getBalance = require('../controllers/shopWallet/getBalance');
const getHistory = require('../controllers/shopWallet/getHistory');

// Apply authentication and getMe to all routes
router.use(authenticationMiddleware);
router.use(getMe);

/**
 * @route   GET /api/shop-wallet/balance
 * @desc    Get shop wallet balance and summary
 * @access  Private (shop only)
 */
router.get(
	'/balance',
	checkRole(['shop']),
	getBalance
);

/**
 * @route   GET /api/shop-wallet/history
 * @desc    Get shop wallet transaction history
 * @access  Private (shop - own wallet, admin - any wallet)
 * @query   shopId (admin only), page, limit, type, source, startDate, endDate
 */
router.get(
	'/history',
	checkRole(['shop', 'admin']),
	getHistory
);

module.exports = router;
