/**
 * Get Delivery Status Controller
 *
 * GET /api/deliveries/:deliveryId
 * Accessible by: rider, shop (own delivery), admin
 *
 * Gets current status and details of a delivery
 */

const Delivery = require('../../models/deliveries');

/**
 * @route   GET /api/deliveries/:deliveryId
 * @desc    Get delivery status and details
 * @access  Private (rider, shop, admin)
 *
 * @param {string} deliveryId - Delivery ID
 *
 * @returns {Object} Complete delivery status
 */
const getDeliveryStatus = async (req, res) => {
	try {
		const { deliveryId } = req.params;
		const userId = req.user._id;
		const userRole = req.user.role;

		// Find delivery
		const delivery = await Delivery.findById(deliveryId)
			.populate('order', 'orderId totalPrice paymentMethod paymentStatus products')
			.populate('order.products.product', 'productName unitPrice imageUrl')
			.populate('shop', 'shopName phoneNumber location address')
			.populate('rider', 'firstName lastName phoneNumber location')
			.populate('route', 'routeName routeCode currentProgress')
			.populate('previousDelivery', 'deliveryCode status')
			.populate('adminOverride.overriddenBy', 'firstName lastName');

		if (!delivery) {
			return res.status(404).json({
				success: false,
				message: 'Delivery not found',
				errors: ['No delivery exists with the specified ID'],
			});
		}

		// Access validation
		let hasAccess = false;

		if (userRole === 'admin') {
			hasAccess = true;
		} else if (userRole === 'rider') {
			hasAccess = delivery.rider._id.toString() === userId.toString();
		} else if (userRole === 'shop') {
			hasAccess = delivery.shop._id.toString() === userId.toString();
		}

		if (!hasAccess) {
			return res.status(403).json({
				success: false,
				message: 'Access denied',
				errors: ['You do not have permission to view this delivery'],
			});
		}

		// Calculate ETA if delivery is in progress
		let eta = null;
		if (delivery.status === 'en_route' && delivery.rider.location) {
			const { calculateDistance, estimateTravelTime } = require('../../utils/geospatial');

			if (delivery.shopLocation && delivery.shopLocation.coordinates) {
				const riderLocation = delivery.rider.location;
				const shopLocation = delivery.shopLocation;

				const distance = calculateDistance(
					riderLocation.coordinates[1],
					riderLocation.coordinates[0],
					shopLocation.coordinates[1],
					shopLocation.coordinates[0]
				);

				const travelTime = estimateTravelTime(distance);
				eta = new Date(Date.now() + travelTime * 60000); // Convert minutes to milliseconds
			}
		}

		// Build status summary
		const statusSummary = {
			status: delivery.status,
			canProceed: delivery.canProceed,
			sequenceNumber: delivery.sequenceNumber,
			isSequentiallyValid: delivery.canProceed || delivery.adminOverride.isOverridden,
			timeline: {
				scheduled: delivery.scheduledTime,
				departed: delivery.departedWarehouseAt,
				arrived: delivery.arrivedAtShopAt,
				completed: delivery.completedAt,
				duration: delivery.actualDuration,
			},
			payment: {
				method: delivery.paymentInfo.method,
				amountToCollect: delivery.paymentInfo.amountToCollect,
				amountCollected: delivery.paymentInfo.amountCollected,
				status: delivery.paymentInfo.status,
				collectedAt: delivery.paymentInfo.collectedAt,
			},
			eta: eta,
		};

		// Hide sensitive rider info from shops
		const responseData = {
			delivery: userRole === 'shop' ? {
				...delivery.toObject(),
				rider: {
					firstName: delivery.rider.firstName,
					lastName: delivery.rider.lastName,
					// Hide location and phone from shop for privacy
				},
			} : delivery,
			statusSummary,
		};

		return res.status(200).json({
			success: true,
			message: 'Delivery status retrieved successfully',
			data: responseData,
		});
	} catch (error) {
		console.error('Get Delivery Status Error:', error);

		return res.status(500).json({
			success: false,
			message: 'Failed to retrieve delivery status',
			errors: [error.message],
		});
	}
};

module.exports = getDeliveryStatus;
