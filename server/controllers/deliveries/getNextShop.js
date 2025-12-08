/**
 * Get Next Shop Controller
 *
 * GET /api/deliveries/:deliveryId/next
 * Accessible by: rider only
 *
 * Gets the next shop in delivery sequence
 * USES SEQUENTIAL ENFORCEMENT MIDDLEWARE
 */

const Delivery = require('../../models/deliveries');

/**
 * @route   GET /api/deliveries/:deliveryId/next
 * @desc    Get next shop in delivery sequence
 * @access  Private (rider only)
 *
 * @param {string} deliveryId - Current delivery ID
 *
 * @returns {Object} Next shop details or null if route completed
 */
const getNextShop = async (req, res) => {
	try {
		const { deliveryId } = req.params;
		const riderId = req.user._id;

		// Find current delivery
		const currentDelivery = await Delivery.findById(deliveryId).populate('route');

		if (!currentDelivery) {
			return res.status(404).json({
				success: false,
				message: 'Delivery not found',
				errors: ['No delivery exists with the specified ID'],
			});
		}

		// Verify rider owns this delivery
		if (currentDelivery.rider.toString() !== riderId.toString()) {
			return res.status(403).json({
				success: false,
				message: 'Access denied',
				errors: ['You are not assigned to this delivery'],
			});
		}

		// Check if current delivery is completed
		if (currentDelivery.status !== 'completed' && currentDelivery.status !== 'skipped') {
			return res.status(400).json({
				success: false,
				message: 'Current delivery not completed',
				errors: ['You must complete the current delivery before accessing the next one'],
			});
		}

		// Find next delivery in sequence
		const nextDelivery = await Delivery.findOne({
			route: currentDelivery.route._id,
			previousDelivery: currentDelivery._id,
		})
			.populate('order', 'orderId totalPrice paymentMethod products')
			.populate('order.products.product', 'productName unitPrice imageUrl')
			.populate('shop', 'shopName phoneNumber location address');

		if (!nextDelivery) {
			// No more deliveries - route completed
			return res.status(200).json({
				success: true,
				message: 'Route completed',
				data: {
					nextShop: null,
					routeCompleted: true,
				},
			});
		}

		// Check if next delivery can proceed
		if (!nextDelivery.canProceed) {
			return res.status(400).json({
				success: false,
				message: 'Next delivery not ready',
				errors: ['The next delivery is not yet available for processing'],
			});
		}

		return res.status(200).json({
			success: true,
			message: 'Next shop retrieved successfully',
			data: {
				nextDelivery: {
					_id: nextDelivery._id,
					deliveryCode: nextDelivery.deliveryCode,
					sequenceNumber: nextDelivery.sequenceNumber,
					shop: nextDelivery.shop,
					order: nextDelivery.order,
					items: nextDelivery.items,
					paymentInfo: nextDelivery.paymentInfo,
					status: nextDelivery.status,
				},
				routeCompleted: false,
			},
		});
	} catch (error) {
		console.error('Get Next Shop Error:', error);

		return res.status(500).json({
			success: false,
			message: 'Failed to retrieve next shop',
			errors: [error.message],
		});
	}
};

module.exports = getNextShop;
