/**
 * Africa's Talking Airtime Service
 *
 * Handles airtime distribution using Africa's Talking API
 * Gracefully handles missing credentials - server will continue to run
 */

const logger = require('../../utils/logger');

// Initialize Africa's Talking with error handling
let airtime = null;
let isConfigured = false;

try {
	const apiKey = process.env.AFRICASTALKING_API_KEY;
	const username = process.env.AFRICASTALKING_USERNAME || 'sandbox';

	if (!apiKey) {
		logger.warn('Africa\'s Talking API key not configured. Airtime service will be disabled.');
	} else {
		const AfricasTalking = require('africastalking');
		const africastalking = AfricasTalking({
			apiKey,
			username,
		});
		airtime = africastalking.AIRTIME;
		isConfigured = true;
		logger.info('Africa\'s Talking Airtime service initialized successfully');
	}
} catch (error) {
	logger.error('Failed to initialize Africa\'s Talking Airtime service:', error.message);
	logger.warn('Airtime service will be disabled. Server will continue to run.');
}

/**
 * Check if airtime service is configured
 * @returns {boolean} Whether the service is available
 */
const isServiceAvailable = () => {
	return isConfigured && airtime !== null;
};

/**
 * Format phone number to international format (+254...)
 *
 * @param {string} phoneNumber - Phone number to format
 * @returns {string} Formatted phone number
 */
const formatPhoneNumber = (phoneNumber) => {
	let formatted = phoneNumber.trim();

	// Remove all spaces and dashes
	formatted = formatted.replace(/[\s-]/g, '');

	// Handle different formats
	if (formatted.startsWith('0')) {
		formatted = '+254' + formatted.substring(1);
	} else if (formatted.startsWith('254')) {
		formatted = '+' + formatted;
	} else if (!formatted.startsWith('+')) {
		formatted = '+254' + formatted;
	}

	return formatted;
};

/**
 * Send airtime to a phone number
 *
 * @param {string} phoneNumber - Recipient phone number
 * @param {number} amount - Amount in KES
 * @param {string} currencyCode - Currency code (default: KES)
 * @returns {Promise<Object>} Airtime sending result
 */
const sendAirtime = async (phoneNumber, amount, currencyCode = 'KES') => {
	try {
		// Check if service is available
		if (!isServiceAvailable()) {
			logger.warn('Airtime service not configured. Request skipped.');
			return {
				success: false,
				phoneNumber,
				amount,
				currencyCode,
				error: 'Airtime service not configured',
				message: 'Airtime service is currently unavailable. Please configure Africa\'s Talking credentials.',
			};
		}

		const formattedPhone = formatPhoneNumber(phoneNumber);

		const options = {
			recipients: [
				{
					phoneNumber: formattedPhone,
					currencyCode,
					amount: parseFloat(amount),
				},
			],
		};

		logger.info(`Sending airtime: ${currencyCode} ${amount} to ${formattedPhone}`);

		const response = await airtime.send(options);

		logger.debug('Airtime Response:', JSON.stringify(response, null, 2));

		// Check if successful
		if (response.responses && response.responses.length > 0) {
			const result = response.responses[0];

			if (result.status === 'Sent') {
				return {
					success: true,
					phoneNumber: formattedPhone,
					amount,
					currencyCode,
					requestId: result.requestId,
					discount: result.discount || 0,
					status: result.status,
					message: `Airtime of ${currencyCode} ${amount} sent successfully to ${formattedPhone}`,
				};
			} else {
				return {
					success: false,
					phoneNumber: formattedPhone,
					amount,
					currencyCode,
					status: result.status,
					errorMessage: result.errorMessage || 'Unknown error',
					message: `Failed to send airtime: ${result.errorMessage || result.status}`,
				};
			}
		}

		return {
			success: false,
			phoneNumber: formattedPhone,
			amount,
			currencyCode,
			message: 'No response from airtime service',
			rawResponse: response,
		};
	} catch (error) {
		logger.error('Africa\'s Talking Airtime Error:', error);

		return {
			success: false,
			phoneNumber,
			amount,
			currencyCode,
			error: error.message,
			message: `Airtime sending failed: ${error.message}`,
		};
	}
};

/**
 * Check account balance for airtime
 *
 * @returns {Promise<Object>} Balance information
 */
const checkBalance = async () => {
	try {
		// Check if service is available
		if (!isServiceAvailable()) {
			return {
				success: false,
				error: 'Airtime service not configured',
				message: 'Cannot check balance - Africa\'s Talking is not configured',
			};
		}

		// Re-initialize to get application data
		const AfricasTalking = require('africastalking');
		const africastalking = AfricasTalking({
			apiKey: process.env.AFRICASTALKING_API_KEY,
			username: process.env.AFRICASTALKING_USERNAME || 'sandbox',
		});
		const application = africastalking.APPLICATION;
		const response = await application.fetchApplicationData();

		return {
			success: true,
			balance: response.UserData.balance,
		};
	} catch (error) {
		logger.error('Balance Check Error:', error);

		return {
			success: false,
			error: error.message,
		};
	}
};

module.exports = {
	sendAirtime,
	checkBalance,
	formatPhoneNumber,
	isServiceAvailable,
};
