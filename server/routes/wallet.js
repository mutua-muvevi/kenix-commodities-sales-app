/**
 * Wallet API Routes
 *
 * All routes for rider wallet management including:
 * - Wallet balance retrieval
 * - Transaction history
 * - Wallet adjustments (admin only)
 * - Wallet summary and statistics
 */

const express = require('express');
const router = express.Router();

// Middleware
const { authenticationMiddleware } = require('../middleware/auth/authentication');
const { getMe } = require('../middleware/user/me');
const { checkRole } = require('../middleware/rbac/checkRole');
const { validateRequest, validateObjectId } = require('../middleware/validation/validateRequest');

// Validators
const {
	walletAdjustmentValidator,
	transactionQueryValidator,
} = require('../validators/walletValidators');

// Controllers
const getWalletBalance = require('../controllers/wallet/getWalletBalance');
const getTransactionHistory = require('../controllers/wallet/getTransactionHistory');
const adjustWallet = require('../controllers/wallet/adjustWallet');
const getWalletSummary = require('../controllers/wallet/getWalletSummary');

// Apply authentication and getMe to all routes
router.use(authenticationMiddleware);
router.use(getMe);

/**
 * @route   GET /api/wallet/:riderId
 * @desc    Get wallet balance for a rider
 * @access  Private (rider - own wallet, admin - any wallet)
 */
router.get(
	'/:riderId',
	validateObjectId('riderId'),
	getWalletBalance
);

/**
 * @route   GET /api/wallet/:riderId/transactions
 * @desc    Get transaction history for a rider's wallet
 * @access  Private (rider - own wallet, admin - any wallet)
 * @query   page, limit, type
 */
router.get(
	'/:riderId/transactions',
	validateObjectId('riderId'),
	validateRequest(transactionQueryValidator, 'query'),
	getTransactionHistory
);

/**
 * @route   GET /api/wallet/:riderId/summary
 * @desc    Get comprehensive wallet summary with statistics
 * @access  Private (rider - own wallet, admin - any wallet)
 */
router.get(
	'/:riderId/summary',
	validateObjectId('riderId'),
	getWalletSummary
);

/**
 * @route   POST /api/wallet/:riderId/adjust
 * @desc    Manually adjust rider wallet balance
 * @access  Private (admin only)
 */
router.post(
	'/:riderId/adjust',
	checkRole(['admin']),
	validateObjectId('riderId'),
	validateRequest(walletAdjustmentValidator),
	adjustWallet
);

module.exports = router;
