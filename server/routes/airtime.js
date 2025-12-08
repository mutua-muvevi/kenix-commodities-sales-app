/**
 * Airtime API Routes
 *
 * All routes for airtime services including:
 * - Buying airtime for customers
 * - Selling airtime for shop credit
 * - Transaction history
 */

const express = require('express');
const router = express.Router();

// Middleware
const { authenticationMiddleware } = require('../middleware/auth/authentication');
const { getMe } = require('../middleware/user/me');
const { checkRole } = require('../middleware/rbac/checkRole');
const { validateRequest } = require('../middleware/validation/validateRequest');

// Validators
const {
	airtimeBuyValidator,
	airtimeSellValidator,
	airtimeQueryValidator,
} = require('../validators/airtimeValidators');

// Controllers
const buyAirtime = require('../controllers/airtime/buyAirtime');
const sellAirtime = require('../controllers/airtime/sellAirtime');
const getTransactions = require('../controllers/airtime/getTransactions');

// Apply authentication and getMe to all routes
router.use(authenticationMiddleware);
router.use(getMe);

/**
 * @route   POST /api/airtime/buy
 * @desc    Buy airtime for a customer
 * @access  Private (shop only)
 */
router.post(
	'/buy',
	checkRole(['shop']),
	validateRequest(airtimeBuyValidator),
	buyAirtime
);

/**
 * @route   POST /api/airtime/sell
 * @desc    Sell airtime and get shop credit
 * @access  Private (shop only)
 */
router.post(
	'/sell',
	checkRole(['shop']),
	validateRequest(airtimeSellValidator),
	sellAirtime
);

/**
 * @route   GET /api/airtime/transactions
 * @desc    Get airtime transaction history
 * @access  Private (shop - own transactions, admin - all transactions)
 * @query   type, provider, status, page, limit
 */
router.get(
	'/transactions',
	validateRequest(airtimeQueryValidator, 'query'),
	getTransactions
);

module.exports = router;
