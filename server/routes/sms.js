/**
 * SMS Testing Routes
 *
 * Routes for testing SMS functionality (admin only)
 */

const express = require('express');
const router = express.Router();

// Middleware
const { authenticationMiddleware } = require('../middleware/auth/authentication');
const { getMe } = require('../middleware/user/me');
const { checkRole } = require('../middleware/rbac/checkRole');

// SMS service
const { sendSMS, sendBulkSMS } = require('../services/sms/africasTalking');

// Apply authentication and admin check to all routes
router.use(authenticationMiddleware);
router.use(getMe);
router.use(checkRole(['admin']));

/**
 * @route   POST /api/sms/test
 * @desc    Test SMS sending
 * @access  Private (admin only)
 */
router.post('/test', async (req, res) => {
	try {
		const { phoneNumber, message } = req.body;

		if (!phoneNumber || !message) {
			return res.status(400).json({
				success: false,
				message: 'Phone number and message are required',
				errors: ['Missing required fields'],
			});
		}

		const result = await sendSMS(phoneNumber, message);

		return res.status(result.success ? 200 : 500).json({
			success: result.success,
			message: result.success ? 'Test SMS sent successfully' : 'Failed to send test SMS',
			data: result,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: 'Failed to send test SMS',
			errors: [error.message],
		});
	}
});

/**
 * @route   POST /api/sms/bulk
 * @desc    Test bulk SMS sending
 * @access  Private (admin only)
 */
router.post('/bulk', async (req, res) => {
	try {
		const { phoneNumbers, message } = req.body;

		if (!phoneNumbers || !Array.isArray(phoneNumbers) || phoneNumbers.length === 0 || !message) {
			return res.status(400).json({
				success: false,
				message: 'Phone numbers array and message are required',
				errors: ['Missing required fields'],
			});
		}

		const result = await sendBulkSMS(phoneNumbers, message);

		return res.status(result.success ? 200 : 500).json({
			success: result.success,
			message: result.success ? 'Bulk SMS sent successfully' : 'Failed to send bulk SMS',
			data: result,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: 'Failed to send bulk SMS',
			errors: [error.message],
		});
	}
});

module.exports = router;
