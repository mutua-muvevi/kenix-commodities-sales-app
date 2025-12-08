/**
 * Get Transaction History Controller
 *
 * Endpoint: GET /api/wallet/:riderId/transactions
 * Accessible by: rider (own), admin
 * Query params: ?page=1&limit=20&type=
 *
 * Returns paginated transaction history for a rider's wallet
 */

const RiderWallet = require('../../models/riderWallet');
const User = require('../../models/user');
const ErrorResponse = require('../../utils/error-response');
const logger = require('../../utils/logger');

/**
 * Get transaction history for a rider's wallet
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getTransactionHistory = async (req, res, next) => {
	try {
		const { riderId } = req.params;
		const requestingUser = req.user;

		// Query parameters with defaults
		const page = parseInt(req.query.page) || 1;
		const limit = Math.min(parseInt(req.query.limit) || 20, 100); // Max 100 per page
		const type = req.query.type; // Optional: filter by transaction type

		// Authorization check - rider can only view own wallet, admin can view any
		if (requestingUser.role !== 'admin' && requestingUser._id.toString() !== riderId) {
			return res.status(403).json({
				success: false,
				message: 'Access denied. You can only view your own transaction history.',
				errors: ['Unauthorized access to wallet transactions'],
			});
		}

		// Verify rider exists
		const rider = await User.findById(riderId);
		if (!rider) {
			return res.status(404).json({
				success: false,
				message: 'Rider not found',
				errors: [`No rider found with ID: ${riderId}`],
			});
		}

		if (rider.role !== 'rider') {
			return res.status(400).json({
				success: false,
				message: 'User is not a rider',
				errors: ['The specified user does not have the rider role'],
			});
		}

		// Get wallet
		const wallet = await RiderWallet.findOne({ rider: riderId })
			.populate('rider', 'firstName lastName phoneNumber')
			.populate('transactions.performedBy', 'firstName lastName role')
			.populate('transactions.relatedRoute', 'routeId')
			.populate('transactions.relatedDelivery', 'deliveryNumber');

		if (!wallet) {
			return res.status(404).json({
				success: false,
				message: 'Wallet not found',
				errors: [`No wallet found for rider: ${riderId}`],
			});
		}

		// Filter transactions by type if specified
		let transactions = wallet.transactions;
		if (type && ['load', 'collection', 'adjustment', 'settlement'].includes(type)) {
			transactions = transactions.filter(txn => txn.type === type);
		}

		// Sort transactions by timestamp (newest first)
		transactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

		// Calculate pagination
		const totalTransactions = transactions.length;
		const totalPages = Math.ceil(totalTransactions / limit);
		const startIndex = (page - 1) * limit;
		const endIndex = startIndex + limit;

		// Get paginated transactions
		const paginatedTransactions = transactions.slice(startIndex, endIndex);

		logger.info(`Transaction history retrieved for rider ${riderId}: ${paginatedTransactions.length} transactions`);

		return res.status(200).json({
			success: true,
			message: 'Transaction history retrieved successfully',
			data: {
				rider: {
					id: wallet.rider._id,
					name: `${wallet.rider.firstName} ${wallet.rider.lastName}`,
					phoneNumber: wallet.rider.phoneNumber,
				},
				currentBalance: wallet.balance,
				transactions: paginatedTransactions.map(txn => ({
					id: txn._id,
					type: txn.type,
					amount: txn.amount,
					previousBalance: txn.previousBalance,
					newBalance: txn.newBalance,
					description: txn.description,
					relatedRoute: txn.relatedRoute,
					relatedDelivery: txn.relatedDelivery,
					performedBy: txn.performedBy,
					timestamp: txn.timestamp,
				})),
				pagination: {
					currentPage: page,
					totalPages,
					totalTransactions,
					transactionsPerPage: limit,
					hasNextPage: page < totalPages,
					hasPreviousPage: page > 1,
				},
				filters: {
					type: type || 'all',
				},
			},
		});
	} catch (error) {
		logger.error('Get Transaction History Error:', error);
		return next(new ErrorResponse('Failed to retrieve transaction history', 500));
	}
};

module.exports = getTransactionHistory;
