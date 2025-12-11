/**
 * Get Wallet Balance Controller
 *
 * Endpoint: GET /api/wallet/:riderId
 * Accessible by: rider (own wallet), admin
 *
 * Returns the current wallet balance for a rider
 */

const RiderWallet = require('../../models/riderWallet');
const User = require('../../models/user');
const ErrorResponse = require('../../utils/error-response');
const logger = require('../../utils/logger');

/**
 * Get wallet balance for a specific rider
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getWalletBalance = async (req, res, next) => {
	try {
		const { riderId } = req.params;
		const requestingUser = req.user;

		// Authorization check - rider can only view own wallet, admin can view any
		if (requestingUser.role !== 'admin' && requestingUser._id.toString() !== riderId) {
			return res.status(403).json({
				success: false,
				message: 'Access denied. You can only view your own wallet.',
				errors: ['Unauthorized access to wallet'],
			});
		}

		// Verify rider exists and has rider role
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

		// Get or create wallet for rider
		let wallet = await RiderWallet.getOrCreateWallet(riderId);

		// Populate related data
		wallet = await wallet.populate('rider', 'firstName lastName phoneNumber');
		if (wallet.currentRoute) {
			await wallet.populate('currentRoute', 'routeId status');
		}

		// Calculate current balance from transactions (for verification)
		const calculatedBalance = wallet.transactions.reduce((sum, txn) => {
			return sum + txn.amount;
		}, 0);

		logger.info(`Wallet balance retrieved for rider ${riderId}: ${wallet.balance}`);

		return res.status(200).json({
			success: true,
			message: 'Wallet balance retrieved successfully',
			wallet: {
				_id: wallet._id,
				rider: wallet.rider,
				balance: wallet.balance,
				totalLoadedAmount: wallet.totalLoadedAmount,
				totalCollected: wallet.totalCollected,
				outstandingAmount: wallet.outstandingAmount,
				currentRoute: wallet.currentRoute,
				status: wallet.status,
				collectionPercentage: wallet.collectionPercentage,
				lastSettlement: wallet.lastSettlement,
				transactions: wallet.transactions.slice(0, 20), // Latest 20 transactions
				calculatedBalance, // For verification purposes
				createdAt: wallet.createdAt,
				updatedAt: wallet.updatedAt,
			},
		});
	} catch (error) {
		logger.error('Get Wallet Balance Error:', error);
		return next(new ErrorResponse('Failed to retrieve wallet balance', 500));
	}
};

module.exports = getWalletBalance;
