/**
 * Sell Airtime Controller
 *
 * Endpoint: POST /api/airtime/sell
 * Accessible by: shop
 *
 * Allows shops to sell airtime and get credit
 */

const AirtimeTransaction = require('../../models/airtimeTransactions');
const ShopWallet = require('../../models/shopWallet');
const ErrorResponse = require('../../utils/error-response');
const logger = require('../../utils/logger');

/**
 * Generate unique airtime transaction reference
 */
const generateAirtimeReference = () => {
	const date = new Date();
	const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
	const random = Math.floor(1000 + Math.random() * 9000);
	return `AIRTIME-${dateStr}-${random}`;
};

/**
 * Calculate shop commission for airtime sale
 */
const calculateCommission = (amount) => {
	// Example: 5% commission on airtime sales
	const commissionRate = 0.05;
	const commission = amount * commissionRate;
	const shopCredit = amount - commission; // Shop gets amount minus commission

	return {
		totalAmount: amount,
		commission,
		shopCredit,
		commissionRate: commissionRate * 100, // Percentage
	};
};

/**
 * Sell airtime
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const sellAirtime = async (req, res, next) => {
	try {
		const { provider, amount } = req.body;
		const user = req.user;

		// Generate transaction reference
		const transactionRef = generateAirtimeReference();

		// Calculate commission and credit
		const financials = calculateCommission(amount);

		// Create airtime transaction record
		const airtimeTransaction = new AirtimeTransaction({
			transactionRef,
			type: 'sale',
			user: user._id,
			recipientPhone: user.phoneNumber, // Shop's own number for sale transactions
			provider,
			amount,
			status: 'success', // Sale transactions are immediately successful
			paymentMethod: 'wallet', // Future feature: shop wallet
			initiatedBy: user._id,
			completedAt: new Date(),
			providerResponse: {
				shopCredit: financials.shopCredit,
				commission: financials.commission,
			},
		});

		await airtimeTransaction.save();

		logger.info(`Airtime sale recorded: ${transactionRef}, ${provider}, ${amount} KES, Credit: ${financials.shopCredit}`);

		// Update shop wallet with credit
		const shopWallet = await ShopWallet.getOrCreateWallet(user._id);
		await shopWallet.addCredit(
			financials.shopCredit,
			`Airtime sale: ${transactionRef}`,
			'airtime_sale',
			airtimeTransaction._id,
			user._id
		);

		logger.info(`Shop wallet credited: ${financials.shopCredit} KES for ${transactionRef}`);

		return res.status(200).json({
			success: true,
			message: 'Airtime sale recorded and wallet credited successfully',
			data: {
				transaction: {
					transactionRef: airtimeTransaction.transactionRef,
					provider,
					amount: financials.totalAmount,
					shopCredit: financials.shopCredit,
					commission: financials.commission,
					commissionRate: financials.commissionRate,
					status: airtimeTransaction.status,
					transactionDate: airtimeTransaction.completedAt,
				},
				wallet: {
					newBalance: shopWallet.balance,
					creditedAmount: financials.shopCredit,
				},
			},
		});
	} catch (error) {
		logger.error('Sell Airtime Error:', error);
		return next(new ErrorResponse('Failed to record airtime sale', 500));
	}
};

module.exports = sellAirtime;
