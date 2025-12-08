/**
 * Africa's Talking Airtime Service
 *
 * Handles airtime distribution using Africa's Talking API
 */

const AfricasTalking = require('africastalking');

// Initialize Africa's Talking
const africastalking = AfricasTalking({
	apiKey: process.env.AFRICASTALKING_API_KEY,
	username: process.env.AFRICASTALKING_USERNAME || 'sandbox',
});

// Get airtime service
const airtime = africastalking.AIRTIME;

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

		console.log(`Sending airtime: ${currencyCode} ${amount} to ${formattedPhone}`);

		const response = await airtime.send(options);

		console.log('Airtime Response:', JSON.stringify(response, null, 2));

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
		console.error('Africa\'s Talking Airtime Error:', error);

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
		const application = africastalking.APPLICATION;
		const response = await application.fetchApplicationData();

		return {
			success: true,
			balance: response.UserData.balance,
		};
	} catch (error) {
		console.error('Balance Check Error:', error);

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
};
