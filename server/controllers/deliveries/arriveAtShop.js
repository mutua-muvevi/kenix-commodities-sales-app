/**
 * Arrive at Shop Controller
 *
 * PATCH /api/deliveries/:deliveryId/arrive
 * Accessible by: rider only
 *
 * Records rider arrival at shop with geofence validation
 * USES SEQUENTIAL ENFORCEMENT MIDDLEWARE
 */

const Delivery = require('../../models/deliveries');
const { isWithinGeofence } = require('../../utils/geospatial');
const { emitToUser } = require('../../websocket/index');

/**
 * @route   PATCH /api/deliveries/:deliveryId/arrive
 * @desc    Mark arrival at shop
 * @access  Private (rider only)
 *
 * @param {string} deliveryId - Delivery ID
 * @body {Object} location - { lat, lng }
 * @body {string} timestamp - Arrival timestamp
 *
 * @returns {Object} Updated delivery with shop order details
 */
const arriveAtShop = async (req, res) => {
	try {
		const { deliveryId } = req.params;
		const { location, timestamp } = req.body;

		// Delivery and route already validated by sequentialEnforcement middleware
		const delivery = req.delivery;
		const route = req.route;

		// Check delivery status
		if (delivery.status === 'arrived') {
			return res.status(400).json({
				success: false,
				message: 'Already marked as arrived',
				errors: ['Delivery has already been marked as arrived'],
			});
		}

		if (delivery.status === 'completed') {
			return res.status(400).json({
				success: false,
				message: 'Delivery already completed',
				errors: ['This delivery is already completed'],
			});
		}

		// Geofence validation (if shop has location)
		if (delivery.shopLocation && delivery.shopLocation.coordinates) {
			const shopLocation = {
				lat: delivery.shopLocation.coordinates[1],
				lng: delivery.shopLocation.coordinates[0],
			};

			const isNearShop = isWithinGeofence(location, shopLocation, 0.2); // 200m radius

			if (!isNearShop) {
				return res.status(400).json({
					success: false,
					message: 'Location verification failed',
					errors: ['You are not within the shop delivery radius. Please move closer to the shop.'],
					data: {
						yourLocation: location,
						shopLocation: shopLocation,
						requiredRadius: '200 meters',
					},
				});
			}
		}

		// Update delivery status
		delivery.status = 'arrived';
		delivery.arrivedAtShopAt = timestamp ? new Date(timestamp) : new Date();

		// Record actual arrival location
		if (location) {
			delivery.actualArrivalLocation = {
				type: 'Point',
				coordinates: [location.lng, location.lat],
			};

			// Calculate distance from shop
			if (delivery.shopLocation && delivery.shopLocation.coordinates) {
				const shopLoc = {
					lat: delivery.shopLocation.coordinates[1],
					lng: delivery.shopLocation.coordinates[0],
				};
				const { calculateDistance } = require('../../utils/geospatial');
				const distance = calculateDistance(
					shopLoc.lat,
					shopLoc.lng,
					location.lat,
					location.lng
				);
				delivery.distanceFromShop = Math.round(distance * 1000); // Convert to meters
			}
		}

		await delivery.save();

		// Populate delivery for response
		const populatedDelivery = await Delivery.findById(delivery._id)
			.populate('order', 'orderId totalPrice paymentMethod products paymentStatus')
			.populate('order.products.product', 'productName unitPrice imageUrl')
			.populate('shop', 'shopName phoneNumber location address');

		// WebSocket: Notify shop that rider has arrived
		emitToUser(delivery.shop.toString(), 'delivery:arrived', {
			deliveryId: delivery._id,
			deliveryCode: delivery.deliveryCode,
			riderName: `${req.user.firstName} ${req.user.lastName}`,
			message: 'Rider has arrived at your shop'
		});

		return res.status(200).json({
			success: true,
			message: 'Arrival recorded successfully',
			data: {
				delivery: populatedDelivery,
				paymentOptions: ['cash', 'mpesa', 'credit'],
				nextSteps: [
					'Verify order items with shop owner',
					'Collect payment if required',
					'Get signature confirmation',
					'Complete delivery',
				],
			},
		});
	} catch (error) {
		console.error('Arrive at Shop Error:', error);

		return res.status(500).json({
			success: false,
			message: 'Failed to record arrival',
			errors: [error.message],
		});
	}
};

module.exports = arriveAtShop;
