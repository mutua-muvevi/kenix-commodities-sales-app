/**
 * Get Shop Wallet Balance Controller
 *
 * Endpoint: GET /api/shop-wallet/balance
 * Accessible by: shop (own wallet), admin (any wallet)
 *
 * Returns the current balance and summary of the shop's wallet
 */

const ShopWallet = require('../../models/shopWallet');
const ErrorResponse = require('../../utils/error-response');
const logger = require('../../utils/logger');

/**
 * Get shop wallet balance
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getBalance = async (req, res, next) => {
	try {
		const user = req.user;

		// Get or create wallet for the shop
		const wallet = await ShopWallet.getOrCreateWallet(user._id);

		if (!wallet) {
			return next(new ErrorResponse('Wallet not found', 404));
		}

		logger.info(`Shop wallet balance retrieved for shop: ${user._id}`);

		return res.status(200).json({
			success: true,
			message: 'Wallet balance retrieved successfully',
			data: {
				wallet: {
					balance: wallet.balance,
					totalCredits: wallet.totalCredits,
					totalDebits: wallet.totalDebits,
					status: wallet.status,
					lastUpdated: wallet.updatedAt,
				},
			},
		});
	} catch (error) {
		logger.error('Get Shop Wallet Balance Error:', error);
		return next(new ErrorResponse('Failed to retrieve wallet balance', 500));
	}
};

module.exports = getBalance;
