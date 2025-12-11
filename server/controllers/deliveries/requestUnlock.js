/**
 * Request Unlock Controller
 *
 * POST /api/deliveries/:deliveryId/request-unlock
 * Accessible by: rider only
 *
 * Allows riders to request admin to unlock a delivery
 * when a shop is unavailable
 */

const Delivery = require('../../models/deliveries');
const { emitToRole } = require('../../websocket/index');
const { sendSMS } = require('../../services/sms/africasTalking');

/**
 * @route   POST /api/deliveries/:deliveryId/request-unlock
 * @desc    Request admin to unlock a delivery (shop unavailable)
 * @access  Private (rider only)
 *
 * @param {string} deliveryId - Delivery ID
 * @body {string} reason - Reason for request (shop_closed, owner_absent, etc.)
 * @body {string} [notes] - Additional notes
 * @body {Object} [location] - Current location { lat, lng }
 * @body {string} [photo] - Evidence photo URL
 *
 * @returns {Object} Request confirmation
 */
const requestUnlock = async (req, res) => {
	try {
		const { deliveryId } = req.params;
		const { reason, notes, location, photo } = req.body;
		const riderId = req.user._id;

		// Validate required fields
		if (!reason) {
			return res.status(400).json({
				success: false,
				message: 'Reason is required',
				errors: ['Please provide a reason for the unlock request'],
			});
		}

		// Find the delivery
		const delivery = await Delivery.findById(deliveryId)
			.populate('shop', 'shopName phoneNumber')
			.populate('route', 'routeCode');

		if (!delivery) {
			return res.status(404).json({
				success: false,
				message: 'Delivery not found',
				errors: ['No delivery exists with the specified ID'],
			});
		}

		// Verify rider owns this delivery
		if (delivery.rider.toString() !== riderId.toString()) {
			return res.status(403).json({
				success: false,
				message: 'Access denied',
				errors: ['You are not assigned to this delivery'],
			});
		}

		// Check if delivery is already completed
		if (delivery.status === 'completed') {
			return res.status(400).json({
				success: false,
				message: 'Delivery already completed',
				errors: ['This delivery is already completed'],
			});
		}

		// Check if already unlocked
		if (delivery.adminOverride.isOverridden) {
			return res.status(400).json({
				success: false,
				message: 'Delivery already unlocked',
				errors: ['This delivery has already been unlocked by admin'],
			});
		}

		// Record the request in delivery notes
		const requestNote = `[Unlock Request - ${new Date().toISOString()}]\n` +
			`Rider: ${req.user.firstName} ${req.user.lastName}\n` +
			`Reason: ${reason}\n` +
			`Notes: ${notes || 'None'}\n` +
			`Location: ${location ? `${location.lat}, ${location.lng}` : 'Not provided'}\n`;

		delivery.riderNotes = (delivery.riderNotes ? delivery.riderNotes + '\n\n' : '') + requestNote;

		// Add photo evidence if provided
		if (photo) {
			delivery.failureInfo = {
				...delivery.failureInfo,
				reason: reason,
				description: notes,
				photo: photo,
				reportedAt: new Date(),
			};
		}

		await delivery.save();

		// Emit WebSocket event to all admins
		emitToRole('admin', 'rider:unlock-request', {
			deliveryId: delivery._id,
			deliveryCode: delivery.deliveryCode,
			riderId: riderId,
			riderName: `${req.user.firstName} ${req.user.lastName}`,
			shopName: delivery.shop?.shopName,
			routeCode: delivery.route?.routeCode,
			reason: reason,
			notes: notes,
			location: location,
			photo: photo,
			timestamp: new Date(),
			message: `Rider ${req.user.firstName} ${req.user.lastName} requests unlock for ${delivery.shop?.shopName}`,
		});

		// TODO: Send SMS to admin phone numbers
		// This would require an Admin model with phone numbers
		// await sendSMS(adminPhones, `Unlock request: ${delivery.shop?.shopName} - Reason: ${reason}`);

		return res.status(200).json({
			success: true,
			message: 'Unlock request sent to admin',
			data: {
				deliveryId: delivery._id,
				deliveryCode: delivery.deliveryCode,
				shopName: delivery.shop?.shopName,
				reason: reason,
				requestedAt: new Date(),
				status: 'pending_admin_approval',
				message: 'Your request has been sent to the admin. You will be notified when the shop is unlocked.',
			},
		});
	} catch (error) {
		console.error('Request Unlock Error:', error);

		return res.status(500).json({
			success: false,
			message: 'Failed to send unlock request',
			errors: [error.message],
		});
	}
};

module.exports = requestUnlock;
