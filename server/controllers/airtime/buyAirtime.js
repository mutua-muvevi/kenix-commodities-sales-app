/**
 * Buy Airtime Controller
 *
 * Endpoint: POST /api/airtime/buy
 * Accessible by: shop
 *
 * Allows shops to buy airtime for customers
 */

const AirtimeTransaction = require('../../models/airtimeTransactions');
const MpesaTransaction = require('../../models/mpesaTransactions');
const ErrorResponse = require('../../utils/error-response');
const logger = require('../../utils/logger');
const { sendAirtime } = require('../../services/airtime/africasTalking');

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
 * Process airtime purchase using Africa's Talking SDK
 *
 * @param {string} provider - Network provider (safaricom/airtel)
 * @param {string} phoneNumber - Recipient phone number
 * @param {number} amount - Amount in KES
 * @returns {Promise<Object>} Purchase result
 */
const processAirtimePurchase = async (provider, phoneNumber, amount) => {
	const result = await sendAirtime(phoneNumber, amount, 'KES');

	if (result.success) {
		return {
			success: true,
			providerReference: result.requestId || `${provider.toUpperCase()}-${Date.now()}`,
			message: result.message,
			discount: result.discount || 0,
		};
	} else {
		return {
			success: false,
			providerReference: null,
			message: result.message || 'Airtime purchase failed',
			error: result.error || result.errorMessage,
		};
	}
};

/**
 * Buy airtime
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const buyAirtime = async (req, res, next) => {
	try {
		const { provider, phoneNumber, amount } = req.body;
		const user = req.user;

		// Validate phone number format
		let formattedPhone = phoneNumber.trim();
		if (formattedPhone.startsWith('0')) {
			formattedPhone = '254' + formattedPhone.substring(1);
		} else if (formattedPhone.startsWith('+')) {
			formattedPhone = formattedPhone.substring(1);
		} else if (!formattedPhone.startsWith('254')) {
			formattedPhone = '254' + formattedPhone;
		}

		// Validate phone number for provider
		if (provider === 'safaricom' && !formattedPhone.startsWith('2547')) {
			return res.status(400).json({
				success: false,
				message: 'Invalid phone number for Safaricom',
				errors: ['Safaricom numbers must start with 07'],
			});
		}

		if (provider === 'airtel' && !formattedPhone.startsWith('2541')) {
			return res.status(400).json({
				success: false,
				message: 'Invalid phone number for Airtel',
				errors: ['Airtel numbers must start with 01'],
			});
		}

		// Generate transaction reference
		const transactionRef = generateAirtimeReference();

		// Create airtime transaction record
		const airtimeTransaction = new AirtimeTransaction({
			transactionRef,
			type: 'purchase',
			user: user._id,
			recipientPhone: formattedPhone,
			provider,
			amount,
			status: 'pending',
			paymentMethod: 'mpesa', // Assuming M-Pesa payment
			initiatedBy: user._id,
		});

		// TODO: Initiate M-Pesa payment
		// For now, we'll assume payment is successful

		// Process airtime purchase with provider
		const purchaseResult = await processAirtimePurchase(provider, formattedPhone, amount);

		if (purchaseResult.success) {
			airtimeTransaction.status = 'success';
			airtimeTransaction.providerReference = purchaseResult.providerReference;
			airtimeTransaction.providerResponse = purchaseResult;
			airtimeTransaction.completedAt = new Date();
		} else {
			airtimeTransaction.status = 'failed';
			airtimeTransaction.providerResponse = purchaseResult;
		}

		await airtimeTransaction.save();

		logger.info(`Airtime purchase ${airtimeTransaction.status}: ${transactionRef}, ${provider}, ${amount} KES`);

		return res.status(purchaseResult.success ? 200 : 400).json({
			success: purchaseResult.success,
			message: purchaseResult.success
				? 'Airtime purchased successfully'
				: 'Airtime purchase failed',
			data: {
				transaction: {
					transactionRef: airtimeTransaction.transactionRef,
					provider,
					recipientPhone: formattedPhone,
					amount,
					status: airtimeTransaction.status,
					providerReference: airtimeTransaction.providerReference,
					message: purchaseResult.message,
					initiatedAt: airtimeTransaction.initiatedAt,
					completedAt: airtimeTransaction.completedAt,
				},
			},
		});
	} catch (error) {
		logger.error('Buy Airtime Error:', error);
		return next(new ErrorResponse('Failed to purchase airtime', 500));
	}
};

module.exports = buyAirtime;
