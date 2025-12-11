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
			logSequentialViolation({
				deliveryId: delivery._id,
				deliveryCode: delivery.deliveryCode,
				riderId: userId,
				riderEmail: req.user.email,
				sequenceNumber: delivery.sequenceNumber,
				reason: validation.reason,
				previousDeliveryCode: validation.previousDeliveryCode,
				route: delivery.route._id,
				shop: delivery.shop,
			});

			return res.status(403).json({
				success: false,
				message: 'Sequential Delivery Enforcement',
				errors: [validation.reason],
				data: {
					currentDelivery: {
						_id: delivery._id,
						deliveryCode: delivery.deliveryCode,
						sequenceNumber: delivery.sequenceNumber,
						canProceed: delivery.canProceed,
						status: delivery.status,
					},
					previousDelivery: validation.previousDeliveryCode ? {
						deliveryCode: validation.previousDeliveryCode,
						message: 'You must complete this delivery first',
					} : null,
					requiresSequential: true,
					helpText: 'Deliveries must be completed in order. If the shop is unavailable, use the "Shop Unavailable" button to request admin unlock.',
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
	const logEntry = {
		timestamp: new Date().toISOString(),
		level: 'WARNING',
		type: 'SEQUENTIAL_DELIVERY_VIOLATION',
		...details,
	};

	// Console logging with enhanced formatting
	console.warn('========================================');
	console.warn('SEQUENTIAL DELIVERY VIOLATION DETECTED');
	console.warn('========================================');
	console.warn(`Timestamp: ${logEntry.timestamp}`);
	console.warn(`Rider: ${details.riderEmail} (${details.riderId})`);
	console.warn(`Delivery: ${details.deliveryCode} (Sequence: ${details.sequenceNumber})`);
	console.warn(`Reason: ${details.reason}`);
	if (details.previousDeliveryCode) {
		console.warn(`Previous Delivery: ${details.previousDeliveryCode} (must complete first)`);
	}
	console.warn('========================================\n');

	// TODO: In production, implement:
	// 1. Store violations in a dedicated MongoDB collection
	// 2. Send real-time alerts to admins via WebSocket/Email
	// 3. Track repeat offenders and flag suspicious behavior
	// 4. Generate daily/weekly reports for compliance
	// 5. Integrate with monitoring services (Datadog, Sentry, etc.)

	// Example MongoDB logging (commented out):
	// await ViolationLog.create(logEntry);

	// Example admin alert (commented out):
	// emitToRole('admin', 'security:violation', logEntry);
};

module.exports = {
	enforceSequentialDelivery,
	getNextAllowedDelivery,
	logSequentialViolation,
};
