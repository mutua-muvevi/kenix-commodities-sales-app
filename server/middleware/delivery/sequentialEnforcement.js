/**
 * Sequential Delivery Enforcement Middleware
 *
 * CRITICAL BUSINESS RULE: Riders MUST deliver in sequence and cannot skip shops
 * unless admin override is enabled.
 *
 * This middleware ensures:
 * 1. Rider can only access deliveries in sequential order
 * 2. Previous delivery must be completed before next delivery
 * 3. Payment must be collected before proceeding
 * 4. Admin overrides are logged and tracked
 */

const Delivery = require('../../models/deliveries');
const Route = require('../../models/routes');

/**
 * Enforce sequential delivery order
 *
 * Validates that rider is attempting to deliver to the correct shop in sequence
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const enforceSequentialDelivery = async (req, res, next) => {
	try {
		const { deliveryId } = req.params;
		const userId = req.user._id;
		const userRole = req.user.role;

		// Find the delivery
		const delivery = await Delivery.findById(deliveryId)
			.populate('route')
			.populate('previousDelivery');

		if (!delivery) {
			return res.status(404).json({
				success: false,
				message: 'Delivery not found',
				errors: ['No delivery exists with the specified ID'],
			});
		}

		// Check if user is the assigned rider or admin
		if (userRole !== 'admin' && delivery.rider.toString() !== userId.toString()) {
			return res.status(403).json({
				success: false,
				message: 'Access denied',
				errors: ['You are not assigned to this delivery'],
			});
		}

		// Admin override check
		if (userRole === 'admin' || delivery.adminOverride.isOverridden) {
			// Admins can bypass, or if admin override is set
			console.log(`Sequential check bypassed for delivery ${deliveryId} by ${userRole}`);
			req.delivery = delivery;
			return next();
		}

		// Check route-level admin override
		const route = await Route.findById(delivery.route);
		if (route && route.adminOverrides.canSkipShops) {
			console.log(`Route-level override enabled for delivery ${deliveryId}`);
			req.delivery = delivery;
			return next();
		}

		// Enforce sequential delivery
		const validation = await delivery.validateSequentialDelivery();

		if (!validation.valid) {
			// Log the attempt to skip
			console.warn(`Sequential delivery violation attempt:`, {
				deliveryId: delivery._id,
				deliveryCode: delivery.deliveryCode,
				riderId: userId,
				reason: validation.reason,
				timestamp: new Date(),
			});

			return res.status(403).json({
				success: false,
				message: 'Sequential delivery violation',
				errors: [validation.reason],
				data: {
					currentDelivery: {
						_id: delivery._id,
						deliveryCode: delivery.deliveryCode,
						sequenceNumber: delivery.sequenceNumber,
						canProceed: delivery.canProceed,
					},
					previousDelivery: validation.previousDeliveryCode ? {
						deliveryCode: validation.previousDeliveryCode,
					} : null,
					requiresSequential: true,
				},
			});
		}

		// Check if previous delivery's payment was collected (if required)
		if (delivery.previousDelivery) {
			const prevDelivery = await Delivery.findById(delivery.previousDelivery);

			if (prevDelivery &&
				prevDelivery.paymentInfo.method !== 'not_required' &&
				prevDelivery.paymentInfo.method !== 'credit' &&
				prevDelivery.paymentInfo.status !== 'collected') {

				return res.status(403).json({
					success: false,
					message: 'Payment collection required',
					errors: ['Previous delivery payment must be collected before proceeding'],
					data: {
						previousDelivery: {
							deliveryCode: prevDelivery.deliveryCode,
							paymentStatus: prevDelivery.paymentInfo.status,
							amountToCollect: prevDelivery.paymentInfo.amountToCollect,
						},
					},
				});
			}
		}

		// Validation passed - attach delivery to request
		req.delivery = delivery;
		next();
	} catch (error) {
		console.error('Sequential Enforcement Error:', error);
		return res.status(500).json({
			success: false,
			message: 'Internal server error during sequential delivery validation',
			errors: [error.message],
		});
	}
};

/**
 * Get next allowed delivery for rider
 *
 * Helper function to determine which delivery the rider should do next
 *
 * @param {string} riderId - Rider user ID
 * @param {string} routeId - Route ID
 * @returns {Promise<Object>} Next delivery or null
 */
const getNextAllowedDelivery = async (riderId, routeId) => {
	try {
		// Find the next delivery that can proceed
		const nextDelivery = await Delivery.findOne({
			rider: riderId,
			route: routeId,
			status: { $in: ['pending', 'en_route'] },
			canProceed: true,
		})
			.sort({ sequenceNumber: 1 })
			.populate('shop', 'shopName phoneNumber location')
			.populate('order', 'orderId totalPrice');

		return nextDelivery;
	} catch (error) {
		console.error('Get Next Delivery Error:', error);
		throw error;
	}
};

/**
 * Log sequential violation attempt
 *
 * Logs attempts to violate sequential delivery for audit purposes
 *
 * @param {Object} details - Violation details
 */
const logSequentialViolation = (details) => {
	// TODO: Implement proper logging to database or monitoring service
	console.warn('SEQUENTIAL DELIVERY VIOLATION:', {
		timestamp: new Date().toISOString(),
		...details,
	});

	// In production, you might want to:
	// 1. Store violations in a dedicated collection
	// 2. Send alerts to admins
	// 3. Track repeat offenders
	// 4. Generate reports
};

module.exports = {
	enforceSequentialDelivery,
	getNextAllowedDelivery,
	logSequentialViolation,
};
