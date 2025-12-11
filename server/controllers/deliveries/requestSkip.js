/**
 * Request Skip Controller
 *
 * POST /api/deliveries/:id/request-skip
 * Accessible by: rider only
 *
 * Allows rider to request skipping a shop that is unavailable
 * Sends real-time notification to admin for approval
 */

const Delivery = require('../../models/deliveries');
const Route = require('../../models/routes');
const { emitToRole } = require('../../websocket');
const logger = require('../../utils/logger');

/**
 * @route   POST /api/deliveries/:id/request-skip
 * @desc    Request to skip unavailable shop
 * @access  Private (rider only)
 *
 * @param {string} id - Delivery ID
 * @body {string} shopId - Shop ID
 * @body {string} reason - Reason for skip (shop_closed, owner_not_present, wrong_address, refused_delivery, other)
 * @body {string} notes - Additional notes (required)
 * @body {string} [photo] - Optional photo evidence URL
 * @body {object} [location] - Rider's current location
 *
 * @returns {Object} Skip request details
 */
const requestSkip = async (req, res) => {
	try {
		const { id } = req.params;
		const { shopId, reason, notes, photo, location } = req.body;
		const riderId = req.user._id;

		// Validation
		if (!shopId) {
			return res.status(400).json({
				success: false,
				message: 'Shop ID is required',
				errors: ['shopId is required'],
			});
		}

		if (!reason || !['shop_closed', 'owner_not_present', 'wrong_address', 'refused_delivery', 'other'].includes(reason)) {
			return res.status(400).json({
				success: false,
				message: 'Valid reason is required',
				errors: ['reason must be one of: shop_closed, owner_not_present, wrong_address, refused_delivery, other'],
			});
		}

		if (!notes || notes.trim().length === 0) {
			return res.status(400).json({
				success: false,
				message: 'Notes are required',
				errors: ['notes must not be empty'],
			});
		}

		// Find delivery
		const delivery = await Delivery.findById(id)
			.populate('shop', 'shopName ownerName phoneNumber')
			.populate('rider', 'firstName lastName')
			.populate('route');

		if (!delivery) {
			return res.status(404).json({
				success: false,
				message: 'Delivery not found',
				errors: ['No delivery exists with the specified ID'],
			});
		}

		// Verify rider owns this delivery
		if (delivery.rider._id.toString() !== riderId.toString()) {
			return res.status(403).json({
				success: false,
				message: 'Unauthorized',
				errors: ['You can only request skip for your own deliveries'],
			});
		}

		// Check if delivery is already completed or skipped
		if (delivery.status === 'completed' || delivery.status === 'skipped') {
			return res.status(400).json({
				success: false,
				message: 'Cannot skip completed or already skipped delivery',
				errors: [`Delivery status is ${delivery.status}`],
			});
		}

		// Check if there's already a pending skip request
		if (delivery.skipRequest.requested && delivery.skipRequest.status === 'pending') {
			return res.status(400).json({
				success: false,
				message: 'Skip request already pending',
				errors: ['This delivery already has a pending skip request'],
			});
		}

		// Update delivery with skip request
		delivery.skipRequest.requested = true;
		delivery.skipRequest.requestedAt = new Date();
		delivery.skipRequest.reason = reason;
		delivery.skipRequest.notes = notes;
		delivery.skipRequest.photo = photo || null;
		delivery.skipRequest.status = 'pending';

		if (location && location.lat && location.lng) {
			delivery.skipRequest.requestLocation = {
				type: 'Point',
				coordinates: [location.lng, location.lat],
			};
		}

		await delivery.save();

		// Create notification payload for admin
		const notificationData = {
			type: 'skip_request',
			deliveryId: delivery._id,
			riderId: delivery.rider._id,
			riderName: `${delivery.rider.firstName} ${delivery.rider.lastName}`,
			shopId: delivery.shop._id,
			shopName: delivery.shop.shopName,
			routeId: delivery.route._id,
			reason: reason,
			notes: notes,
			photo: photo,
			location: location,
			requestedAt: delivery.skipRequest.requestedAt,
			message: `${delivery.rider.firstName} ${delivery.rider.lastName} requests to skip ${delivery.shop.shopName}`,
		};

		// Emit to admin via WebSocket
		try {
			emitToRole('admin', 'rider:request-skip', notificationData);
			logger.info(`Skip request sent to admin for delivery ${delivery._id}`);
		} catch (wsError) {
			logger.error('WebSocket error sending skip request:', wsError);
			// Continue even if WebSocket fails - admin can still see it in DB
		}

		// Also emit acknowledgment back to rider
		try {
			const { emitToUser } = require('../../websocket');
			emitToUser(riderId.toString(), 'rider:skip-request-received', {
				deliveryId: delivery._id,
				message: 'Your skip request has been received and sent to admin',
			});
		} catch (error) {
			// Silent fail - rider will get HTTP response anyway
		}

		return res.status(200).json({
			success: true,
			message: 'Skip request sent to admin successfully',
			data: {
				requestId: delivery._id,
				deliveryId: delivery._id,
				status: 'pending',
				requestedAt: delivery.skipRequest.requestedAt,
				shop: {
					id: delivery.shop._id,
					name: delivery.shop.shopName,
				},
			},
		});
	} catch (error) {
		logger.error('Request Skip Error:', error);

		return res.status(500).json({
			success: false,
			message: 'Failed to submit skip request',
			errors: [error.message],
		});
	}
};

module.exports = requestSkip;
