/**
 * Health Check Routes
 *
 * Provides server health status and external service availability
 */

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Import service availability checkers
const { isServiceAvailable: isSmsAvailable } = require('../services/sms/africasTalking');
const { isServiceAvailable: isAirtimeAvailable } = require('../services/airtime/africasTalking');

/**
 * @route   GET /api/health
 * @desc    Get server health status
 * @access  Public
 */
router.get('/', (req, res) => {
	const dbStatus = mongoose.connection.readyState;
	const dbStatusText = {
		0: 'disconnected',
		1: 'connected',
		2: 'connecting',
		3: 'disconnecting',
	};

	res.status(200).json({
		success: true,
		message: 'Server is running',
		timestamp: new Date().toISOString(),
		uptime: process.uptime(),
		services: {
			database: {
				status: dbStatusText[dbStatus] || 'unknown',
				available: dbStatus === 1,
			},
			sms: {
				status: isSmsAvailable() ? 'configured' : 'not configured',
				available: isSmsAvailable(),
				provider: 'Africa\'s Talking',
			},
			airtime: {
				status: isAirtimeAvailable() ? 'configured' : 'not configured',
				available: isAirtimeAvailable(),
				provider: 'Africa\'s Talking',
			},
		},
		environment: process.env.NODE_ENV || 'development',
	});
});

/**
 * @route   GET /api/health/ping
 * @desc    Simple ping endpoint
 * @access  Public
 */
router.get('/ping', (req, res) => {
	res.status(200).json({
		success: true,
		message: 'pong',
		timestamp: new Date().toISOString(),
	});
});

/**
 * @route   GET /api/health/ready
 * @desc    Readiness check - returns 200 if all critical services are ready
 * @access  Public
 */
router.get('/ready', (req, res) => {
	const dbReady = mongoose.connection.readyState === 1;

	if (dbReady) {
		res.status(200).json({
			success: true,
			message: 'Server is ready',
			timestamp: new Date().toISOString(),
		});
	} else {
		res.status(503).json({
			success: false,
			message: 'Server is not ready',
			reason: 'Database not connected',
			timestamp: new Date().toISOString(),
		});
	}
});

module.exports = router;
