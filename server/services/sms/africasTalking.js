/**
 * Africa's Talking SMS Service
 *
 * Provides SMS sending functionality using Africa's Talking API
 * Used for:
 * - OTP verification
 * - Order confirmations
 * - Delivery notifications
 * - Payment confirmations
 * - General notifications
 */

const logger = require('../../utils/logger');

// Initialize Africa's Talking with proper error handling
let sms = null;
let isConfigured = false;

try {
	const apiKey = process.env.AFRICASTALKING_API_KEY;
	const username = process.env.AFRICASTALKING_USERNAME || 'sandbox';

	if (!apiKey) {
		logger.warn('Africa\'s Talking API key not configured. SMS service will be disabled.');
	} else {
		const AfricasTalking = require('africastalking');
		const africastalking = AfricasTalking({
			apiKey,
			username,
		});
		sms = africastalking.SMS;
		isConfigured = true;
		logger.info('Africa\'s Talking SMS service initialized successfully');
	}
} catch (error) {
	logger.error('Failed to initialize Africa\'s Talking SMS service:', error.message);
	logger.warn('SMS service will be disabled. Server will continue to run.');
}

/**
 * Check if SMS service is configured
 * @returns {boolean} Whether the service is available
 */
const isServiceAvailable = () => {
	return isConfigured && sms !== null;
};

/**
 * Send SMS via Africa's Talking
 *
 * @param {string} to - Phone number in +254 format
 * @param {string} message - SMS message content
 * @returns {Promise<Object>} Result object with success status
 */
const sendSMS = async (to, message) => {
	try {
		// Validate inputs
		if (!to || !message) {
			throw new Error('Phone number and message are required');
		}

		// Ensure phone number is in correct format (+254...)
		let phoneNumber = to.trim();
		if (phoneNumber.startsWith('0')) {
			phoneNumber = '+254' + phoneNumber.substring(1);
		} else if (!phoneNumber.startsWith('+')) {
			phoneNumber = '+254' + phoneNumber;
		}

		// Check if Africa's Talking is initialized
		if (!sms) {
			logger.warn('Africa\'s Talking not initialized. SMS not sent.');
			return {
				success: false,
				error: 'SMS service not configured',
			};
		}

		// Send SMS
		const options = {
			to: [phoneNumber],
			message: message.trim(),
			from: process.env.AFRICASTALKING_SENDER_ID || 'KENIX',
		};

		const result = await sms.send(options);

		// Log success
		logger.info(`SMS sent to ${phoneNumber}: ${result.SMSMessageData?.Recipients?.[0]?.status || 'Success'}`);

		return {
			success: true,
			result: result.SMSMessageData,
			recipient: phoneNumber,
		};
	} catch (error) {
		logger.error(`SMS failed to ${to}:`, error);
		return {
			success: false,
			error: error.message,
			recipient: to,
		};
	}
};

/**
 * Send OTP via SMS
 *
 * @param {string} phoneNumber - Phone number to send OTP to
 * @param {string} otp - OTP code
 * @returns {Promise<Object>} Result object
 */
const sendOTP = async (phoneNumber, otp) => {
	const message = `Your Kenix verification code is: ${otp}. Valid for 10 minutes. Do not share this code with anyone.`;
	return sendSMS(phoneNumber, message);
};

/**
 * Send order confirmation SMS
 *
 * @param {string} phoneNumber - Shop owner's phone number
 * @param {string} orderId - Order ID
 * @param {number} totalAmount - Total order amount
 * @returns {Promise<Object>} Result object
 */
const sendOrderConfirmation = async (phoneNumber, orderId, totalAmount) => {
	const message = `Your Kenix order #${orderId} for KES ${totalAmount.toLocaleString()} has been confirmed. Track your delivery in the app. Thank you!`;
	return sendSMS(phoneNumber, message);
};

/**
 * Send order approval notification
 *
 * @param {string} phoneNumber - Shop owner's phone number
 * @param {string} orderId - Order ID
 * @returns {Promise<Object>} Result object
 */
const sendOrderApproval = async (phoneNumber, orderId) => {
	const message = `Great news! Your Kenix order #${orderId} has been approved and is being prepared for delivery.`;
	return sendSMS(phoneNumber, message);
};

/**
 * Send delivery notification
 *
 * @param {string} phoneNumber - Shop owner's phone number
 * @param {string} riderName - Rider's name
 * @param {number} eta - Estimated time of arrival in minutes
 * @returns {Promise<Object>} Result object
 */
const sendDeliveryNotification = async (phoneNumber, riderName, eta) => {
	const message = `Your Kenix delivery with ${riderName} will arrive in approximately ${eta} minutes. Please have payment ready.`;
	return sendSMS(phoneNumber, message);
};

/**
 * Send delivery completed notification
 *
 * @param {string} phoneNumber - Shop owner's phone number
 * @param {string} deliveryNumber - Delivery number
 * @param {number} amount - Amount paid
 * @returns {Promise<Object>} Result object
 */
const sendDeliveryCompleted = async (phoneNumber, deliveryNumber, amount) => {
	const message = `Your Kenix delivery #${deliveryNumber} has been completed. Amount paid: KES ${amount.toLocaleString()}. Thank you for your business!`;
	return sendSMS(phoneNumber, message);
};

/**
 * Send payment confirmation SMS
 *
 * @param {string} phoneNumber - Phone number
 * @param {string} mpesaRef - M-Pesa transaction reference
 * @param {number} amount - Amount paid
 * @param {string} orderId - Order ID
 * @returns {Promise<Object>} Result object
 */
const sendPaymentConfirmation = async (phoneNumber, mpesaRef, amount, orderId) => {
	const message = `Payment of KES ${amount.toLocaleString()} received for order #${orderId}. M-Pesa Ref: ${mpesaRef}. Thank you!`;
	return sendSMS(phoneNumber, message);
};

/**
 * Send loan approval notification
 *
 * @param {string} phoneNumber - Shop owner's phone number
 * @param {number} loanAmount - Approved loan amount
 * @param {string} loanReference - Loan reference number
 * @returns {Promise<Object>} Result object
 */
const sendLoanApproval = async (phoneNumber, loanAmount, loanReference) => {
	const message = `Congratulations! Your Kenix Duka loan of KES ${loanAmount.toLocaleString()} has been approved. Ref: ${loanReference}. Funds will be disbursed shortly.`;
	return sendSMS(phoneNumber, message);
};

/**
 * Send loan rejection notification
 *
 * @param {string} phoneNumber - Shop owner's phone number
 * @param {string} loanReference - Loan reference number
 * @returns {Promise<Object>} Result object
 */
const sendLoanRejection = async (phoneNumber, loanReference) => {
	const message = `Your Kenix Duka loan application (Ref: ${loanReference}) could not be approved at this time. Please contact support for more information.`;
	return sendSMS(phoneNumber, message);
};

/**
 * Send loan payment reminder
 *
 * @param {string} phoneNumber - Shop owner's phone number
 * @param {number} amount - Amount due
 * @param {string} dueDate - Due date
 * @returns {Promise<Object>} Result object
 */
const sendLoanPaymentReminder = async (phoneNumber, amount, dueDate) => {
	const message = `Reminder: Your Kenix Duka loan payment of KES ${amount.toLocaleString()} is due on ${dueDate}. Please make payment to avoid penalties.`;
	return sendSMS(phoneNumber, message);
};

/**
 * Send rider notification (route assignment)
 *
 * @param {string} phoneNumber - Rider's phone number
 * @param {number} deliveryCount - Number of deliveries
 * @param {string} routeId - Route ID
 * @returns {Promise<Object>} Result object
 */
const sendRiderRouteAssignment = async (phoneNumber, deliveryCount, routeId) => {
	const message = `You have been assigned ${deliveryCount} deliveries on route ${routeId}. Please check the app for details and start your route.`;
	return sendSMS(phoneNumber, message);
};

/**
 * Send low stock alert
 *
 * @param {string} phoneNumber - Admin phone number
 * @param {string} productName - Product name
 * @param {number} currentStock - Current stock level
 * @returns {Promise<Object>} Result object
 */
const sendLowStockAlert = async (phoneNumber, productName, currentStock) => {
	const message = `ALERT: ${productName} is running low on stock. Current quantity: ${currentStock}. Please restock soon.`;
	return sendSMS(phoneNumber, message);
};

/**
 * Send bulk SMS to multiple recipients
 *
 * @param {Array<string>} phoneNumbers - Array of phone numbers
 * @param {string} message - Message to send
 * @returns {Promise<Object>} Result object
 */
const sendBulkSMS = async (phoneNumbers, message) => {
	try {
		if (!phoneNumbers || phoneNumbers.length === 0) {
			throw new Error('At least one phone number is required');
		}

		// Format all phone numbers
		const formattedNumbers = phoneNumbers.map(num => {
			let phoneNumber = num.trim();
			if (phoneNumber.startsWith('0')) {
				return '+254' + phoneNumber.substring(1);
			} else if (!phoneNumber.startsWith('+')) {
				return '+254' + phoneNumber;
			}
			return phoneNumber;
		});

		if (!sms) {
			logger.warn('Africa\'s Talking not initialized. Bulk SMS not sent.');
			return {
				success: false,
				error: 'SMS service not configured',
			};
		}

		const options = {
			to: formattedNumbers,
			message: message.trim(),
			from: process.env.AFRICASTALKING_SENDER_ID || 'KENIX',
		};

		const result = await sms.send(options);

		logger.info(`Bulk SMS sent to ${formattedNumbers.length} recipients`);

		return {
			success: true,
			result: result.SMSMessageData,
			recipientCount: formattedNumbers.length,
		};
	} catch (error) {
		logger.error('Bulk SMS failed:', error);
		return {
			success: false,
			error: error.message,
		};
	}
};

/**
 * Send order rejection notification
 *
 * @param {string} phoneNumber - Shop owner's phone number
 * @param {string} orderId - Order ID
 * @param {string} reason - Rejection reason
 * @returns {Promise<Object>} Result object
 */
const sendOrderRejection = async (phoneNumber, orderId, reason) => {
	const message = `Your Kenix order #${orderId} has been declined. Reason: ${reason}. Contact support for assistance.`;
	return sendSMS(phoneNumber, message);
};

/**
 * Send rider order assignment notification
 *
 * @param {string} phoneNumber - Rider's phone number
 * @param {string} orderId - Order ID
 * @param {string} shopName - Shop name
 * @param {string} address - Delivery address
 * @returns {Promise<Object>} Result object
 */
const sendRiderOrderAssignment = async (phoneNumber, orderId, shopName, address) => {
	const message = `New delivery assigned! Order #${orderId} for ${shopName} at ${address}. Check the app for details.`;
	return sendSMS(phoneNumber, message);
};

module.exports = {
	sendSMS,
	sendOTP,
	sendOrderConfirmation,
	sendOrderApproval,
	sendOrderRejection,
	sendDeliveryNotification,
	sendDeliveryCompleted,
	sendPaymentConfirmation,
	sendLoanApproval,
	sendLoanRejection,
	sendLoanPaymentReminder,
	sendRiderRouteAssignment,
	sendRiderOrderAssignment,
	sendLowStockAlert,
	sendBulkSMS,
	isServiceAvailable,
};
