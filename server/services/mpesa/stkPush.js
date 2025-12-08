/**
 * M-Pesa STK Push (Lipa na M-Pesa)
 *
 * Initiates STK Push to customer's phone for payment
 */

const axios = require('axios');
const { mpesaConfig } = require('./config');
const { getMpesaAccessToken } = require('./auth');

/**
 * Generate M-Pesa password for STK Push
 *
 * @param {string} timestamp - Timestamp in format YYYYMMDDHHmmss
 * @returns {string} Base64 encoded password
 */
const generatePassword = (timestamp) => {
	const data = `${mpesaConfig.shortcode}${mpesaConfig.passkey}${timestamp}`;
	return Buffer.from(data).toString('base64');
};

/**
 * Generate timestamp for M-Pesa request
 *
 * @returns {string} Timestamp in format YYYYMMDDHHmmss
 */
const generateTimestamp = () => {
	const date = new Date();
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	const hour = String(date.getHours()).padStart(2, '0');
	const minute = String(date.getMinutes()).padStart(2, '0');
	const second = String(date.getSeconds()).padStart(2, '0');

	return `${year}${month}${day}${hour}${minute}${second}`;
};

/**
 * Format phone number to M-Pesa format (254XXXXXXXXX)
 *
 * @param {string} phoneNumber - Phone number in any format
 * @returns {string} Formatted phone number
 */
const formatPhoneNumber = (phoneNumber) => {
	// Remove all non-digits
	let cleaned = phoneNumber.replace(/\D/g, '');

	// Handle different formats
	if (cleaned.startsWith('254')) {
		return cleaned;
	} else if (cleaned.startsWith('0')) {
		return '254' + cleaned.substring(1);
	} else if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
		return '254' + cleaned;
	}

	return cleaned;
};

/**
 * Initiate STK Push for payment
 *
 * @param {Object} params - STK Push parameters
 * @param {string} params.phoneNumber - Customer phone number
 * @param {number} params.amount - Amount to charge
 * @param {string} params.accountReference - Account reference (e.g., order ID)
 * @param {string} params.transactionDesc - Transaction description
 * @returns {Promise<Object>} STK Push response
 */
const initiateStkPush = async ({ phoneNumber, amount, accountReference, transactionDesc }) => {
	try {
		// Get access token
		const accessToken = await getMpesaAccessToken();

		// Generate timestamp and password
		const timestamp = generateTimestamp();
		const password = generatePassword(timestamp);

		// Format phone number
		const formattedPhone = formatPhoneNumber(phoneNumber);

		// Validate phone number format
		if (!/^254[0-9]{9}$/.test(formattedPhone)) {
			throw new Error(`Invalid phone number format: ${formattedPhone}. Must be 254XXXXXXXXX`);
		}

		// Validate amount
		if (amount < 1) {
			throw new Error('Amount must be at least 1 KES');
		}

		// Prepare request payload
		const payload = {
			BusinessShortCode: mpesaConfig.shortcode,
			Password: password,
			Timestamp: timestamp,
			TransactionType: mpesaConfig.transactionTypes.customerPayBillOnline,
			Amount: Math.round(amount), // M-Pesa requires integer
			PartyA: formattedPhone,
			PartyB: mpesaConfig.shortcode,
			PhoneNumber: formattedPhone,
			CallBackURL: mpesaConfig.callbackUrl,
			AccountReference: accountReference || 'KENIX',
			TransactionDesc: transactionDesc || 'Payment',
		};

		const url = `${mpesaConfig.baseUrl}${mpesaConfig.endpoints.stkPush}`;

		const response = await axios.post(url, payload, {
			headers: {
				'Authorization': `Bearer ${accessToken}`,
				'Content-Type': 'application/json',
			},
		});

		// M-Pesa returns 200 even for some errors, check ResponseCode
		if (response.data.ResponseCode === '0') {
			console.log('STK Push initiated successfully:', response.data.CheckoutRequestID);
			return {
				success: true,
				checkoutRequestID: response.data.CheckoutRequestID,
				merchantRequestID: response.data.MerchantRequestID,
				responseCode: response.data.ResponseCode,
				responseDescription: response.data.ResponseDescription,
				customerMessage: response.data.CustomerMessage,
			};
		} else {
			throw new Error(response.data.ResponseDescription || 'STK Push failed');
		}
	} catch (error) {
		console.error('STK Push Error:', error.response?.data || error.message);

		return {
			success: false,
			error: error.response?.data?.errorMessage || error.message,
			responseCode: error.response?.data?.ResponseCode,
			responseDescription: error.response?.data?.ResponseDescription,
		};
	}
};

/**
 * Query STK Push transaction status
 *
 * @param {string} checkoutRequestID - Checkout Request ID from STK Push initiation
 * @returns {Promise<Object>} Query response
 */
const queryStkPushStatus = async (checkoutRequestID) => {
	try {
		const accessToken = await getMpesaAccessToken();
		const timestamp = generateTimestamp();
		const password = generatePassword(timestamp);

		const payload = {
			BusinessShortCode: mpesaConfig.shortcode,
			Password: password,
			Timestamp: timestamp,
			CheckoutRequestID: checkoutRequestID,
		};

		const url = `${mpesaConfig.baseUrl}${mpesaConfig.endpoints.stkQuery}`;

		const response = await axios.post(url, payload, {
			headers: {
				'Authorization': `Bearer ${accessToken}`,
				'Content-Type': 'application/json',
			},
		});

		return {
			success: true,
			...response.data,
		};
	} catch (error) {
		console.error('STK Query Error:', error.response?.data || error.message);

		return {
			success: false,
			error: error.response?.data?.errorMessage || error.message,
		};
	}
};

module.exports = {
	initiateStkPush,
	queryStkPushStatus,
	formatPhoneNumber,
	generateTimestamp,
};
