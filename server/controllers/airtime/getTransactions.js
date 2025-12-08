/**
 * Get Airtime Transactions Controller
 *
 * Endpoint: GET /api/airtime/transactions
 * Accessible by: shop (own), admin (all)
 * Query params: ?type=buy|sell&provider=&page=1
 *
 * Returns airtime transaction history with filtering and pagination
 */

const AirtimeTransaction = require('../../models/airtimeTransactions');
const ErrorResponse = require('../../utils/error-response');
const logger = require('../../utils/logger');

/**
 * Get airtime transactions
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getTransactions = async (req, res, next) => {
	try {
		const requestingUser = req.user;

		// Query parameters with defaults
		const page = parseInt(req.query.page) || 1;
		const limit = Math.min(parseInt(req.query.limit) || 20, 100);
		const type = req.query.type; // purchase, sale
		const provider = req.query.provider; // safaricom, airtel
		const status = req.query.status; // pending, success, failed

		// Build query filter
		const filter = {};

		// Authorization: shops can only see own transactions, admin can see all
		if (requestingUser.role === 'shop') {
			filter.user = requestingUser._id;
		} else if (req.query.userId) {
			filter.user = req.query.userId;
		}

		// Filter by transaction type
		if (type) {
			filter.type = type;
		}

		// Filter by provider
		if (provider) {
			filter.provider = provider;
		}

		// Filter by status
		if (status) {
			filter.status = status;
		}

		// Execute query with pagination
		const skip = (page - 1) * limit;
		const totalTransactions = await AirtimeTransaction.countDocuments(filter);

		const transactions = await AirtimeTransaction.find(filter)
			.populate('user', 'firstName lastName businessName phoneNumber email')
			.populate('initiatedBy', 'firstName lastName role')
			.populate('mpesaTransaction', 'transactionCode amount status')
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit);

		// Calculate pagination info
		const totalPages = Math.ceil(totalTransactions / limit);

		// Calculate summary statistics
		const totalAmount = transactions.reduce((sum, txn) => sum + txn.amount, 0);
		const successfulTransactions = transactions.filter(txn => txn.status === 'success').length;

		// Format response
		const formattedTransactions = transactions.map(txn => ({
			id: txn._id,
			transactionRef: txn.transactionRef,
			type: txn.type,
			user: txn.user,
			recipientPhone: txn.recipientPhone,
			provider: txn.provider,
			amount: txn.amount,
			status: txn.status,
			paymentMethod: txn.paymentMethod,
			mpesaTransaction: txn.mpesaTransaction,
			providerReference: txn.providerReference,
			initiatedAt: txn.initiatedAt,
			completedAt: txn.completedAt,
		}));

		logger.info(`Airtime transactions retrieved: ${transactions.length} transactions`);

		return res.status(200).json({
			success: true,
			message: 'Airtime transactions retrieved successfully',
			data: {
				transactions: formattedTransactions,
				pagination: {
					currentPage: page,
					totalPages,
					totalTransactions,
					transactionsPerPage: limit,
					hasNextPage: page < totalPages,
					hasPreviousPage: page > 1,
				},
				summary: {
					totalAmount,
					successfulTransactions,
					failedTransactions: transactions.length - successfulTransactions,
					successRate: transactions.length > 0
						? parseFloat(((successfulTransactions / transactions.length) * 100).toFixed(2))
						: 0,
				},
				filters: {
					type: type || 'all',
					provider: provider || 'all',
					status: status || 'all',
					userId: requestingUser.role === 'shop' ? requestingUser._id : req.query.userId || 'all',
				},
			},
		});
	} catch (error) {
		logger.error('Get Airtime Transactions Error:', error);
		return next(new ErrorResponse('Failed to retrieve airtime transactions', 500));
	}
};

module.exports = getTransactions;
