/**
 * Rider Routes
 *
 * Endpoints for rider-specific operations:
 * - Route deviation logging
 * - Shop unlock requests
 * - Performance metrics
 */

const express = require('express');
const router = express.Router();
const RouteDeviation = require('../models/routeDeviations');
const Delivery = require('../models/deliveries');
const Route = require('../models/routes');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { emitToRole } = require('../websocket');

/**
 * POST /rider/log-deviation
 * Log route deviation for theft prevention
 */
router.post('/log-deviation', authenticateToken, requireRole('rider'), async (req, res) => {
	try {
		const riderId = req.user.sub;
		const {
			routeId,
			location,
			currentDeliveryId,
			deviationDistance,
			severity,
			expectedLocation,
		} = req.body;

		// Validate required fields
		if (!routeId || !location || !deviationDistance || !severity) {
			return res.status(400).json({
				success: false,
				message: 'Missing required fields',
			});
		}

		// Verify route belongs to rider
		const route = await Route.findById(routeId);
		if (!route || route.riderId.toString() !== riderId) {
			return res.status(403).json({
				success: false,
				message: 'Unauthorized to log deviation for this route',
			});
		}

		// Log deviation
		const deviation = await RouteDeviation.logDeviation({
			riderId,
			riderName: `${req.user.firstName} ${req.user.lastName}`,
			routeId,
			currentDeliveryId,
			actualLocation: location,
			expectedLocation: expectedLocation || location,
			deviationDistance,
			severity,
		});

		// Send real-time alert to admin for critical deviations
		if (severity === 'warning' || severity === 'critical') {
			emitToRole('admin', 'rider:route-deviation-alert', {
				deviationId: deviation._id,
				riderId,
				riderName: `${req.user.firstName} ${req.user.lastName}`,
				routeId,
				currentLocation: location,
				deviationDistance,
				severity,
				timestamp: new Date(),
			});
		}

		res.status(201).json({
			success: true,
			message: 'Deviation logged successfully',
			data: deviation,
		});
	} catch (error) {
		console.error('Log deviation error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to log deviation',
			error: error.message,
		});
	}
});

/**
 * GET /rider/deviations
 * Get rider's deviation history
 */
router.get('/deviations', authenticateToken, requireRole('rider'), async (req, res) => {
	try {
		const riderId = req.user.sub;
		const { startDate, endDate, severity, limit = 50, skip = 0 } = req.query;

		const result = await RouteDeviation.getByRider(riderId, {
			startDate,
			endDate,
			severity,
			limit: parseInt(limit),
			skip: parseInt(skip),
		});

		res.json({
			success: true,
			data: result.deviations,
			pagination: {
				total: result.total,
				limit: parseInt(limit),
				skip: parseInt(skip),
				hasMore: result.hasMore,
			},
		});
	} catch (error) {
		console.error('Get deviations error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to fetch deviations',
			error: error.message,
		});
	}
});

/**
 * POST /rider/request-unlock
 * Request admin to unlock next shop when current shop is unavailable
 */
router.post('/request-unlock', authenticateToken, requireRole('rider'), async (req, res) => {
	try {
		const riderId = req.user.sub;
		const { deliveryId, reason, shopId, location } = req.body;

		// Validate required fields
		if (!deliveryId || !reason || !shopId) {
			return res.status(400).json({
				success: false,
				message: 'Missing required fields',
			});
		}

		// Verify delivery belongs to rider's active route
		const delivery = await Delivery.findById(deliveryId).populate('routeId');
		if (!delivery || delivery.routeId.riderId.toString() !== riderId) {
			return res.status(403).json({
				success: false,
				message: 'Unauthorized to request unlock for this delivery',
			});
		}

		// Send real-time notification to admin
		emitToRole('admin', 'rider:unlock-request', {
			riderId,
			riderName: `${req.user.firstName} ${req.user.lastName}`,
			deliveryId,
			shopId,
			reason,
			location,
			timestamp: new Date(),
		});

		res.json({
			success: true,
			message: 'Unlock request sent to admin',
		});
	} catch (error) {
		console.error('Request unlock error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to request unlock',
			error: error.message,
		});
	}
});

/**
 * GET /rider/deviation-stats
 * Get rider's deviation statistics
 */
router.get('/deviation-stats', authenticateToken, requireRole('rider'), async (req, res) => {
	try {
		const riderId = req.user.sub;
		const { startDate, endDate } = req.query;

		const stats = await RouteDeviation.getRiderStats(riderId, {
			startDate,
			endDate,
		});

		res.json({
			success: true,
			data: stats,
		});
	} catch (error) {
		console.error('Get deviation stats error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to fetch deviation statistics',
			error: error.message,
		});
	}
});

module.exports = router;
