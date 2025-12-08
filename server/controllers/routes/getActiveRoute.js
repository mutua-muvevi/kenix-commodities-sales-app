/**
 * Get Active Route Controller
 *
 * GET /api/routes/rider/:riderId/active
 * Accessible by: rider (own route), admin
 *
 * Gets the currently active route for a rider
 * Security: Riders only see current shop, not future shops
 */

const Route = require('../../models/routes');
const Delivery = require('../../models/deliveries');
const RiderWallet = require('../../models/riderWallet');

/**
 * @route   GET /api/routes/rider/:riderId/active
 * @desc    Get rider's active route
 * @access  Private (rider - own route, admin)
 *
 * @param {string} riderId - Rider user ID
 *
 * @returns {Object} Active route with current shop details only
 */
const getActiveRoute = async (req, res) => {
	try {
		const { riderId } = req.params;
		const userId = req.user._id;
		const userRole = req.user.role;

		// Access validation
		if (userRole === 'rider' && userId.toString() !== riderId) {
			return res.status(403).json({
				success: false,
				message: 'Access denied',
				errors: ['You can only view your own active route'],
			});
		}

		// Find active route for rider
		const route = await Route.findOne({
			assignedRider: riderId,
			'currentProgress.isInProgress': true,
			status: 'active',
		})
			.populate('shops.shop', 'shopName phoneNumber location address')
			.populate('assignedRider', 'firstName lastName phoneNumber');

		if (!route) {
			return res.status(404).json({
				success: false,
				message: 'No active route found',
				data: {
					route: null,
				},
			});
		}

		// Get current shop index
		const currentShopIndex = route.currentProgress.currentShopIndex;
		const currentShop = route.shops[currentShopIndex];

		if (!currentShop) {
			return res.status(200).json({
				success: true,
				message: 'Route completed',
				data: {
					route: {
						_id: route._id,
						routeName: route.routeName,
						routeCode: route.routeCode,
						status: 'completed',
					},
					currentShop: null,
					hasNext: false,
				},
			});
		}

		// Get deliveries for current shop
		const currentDeliveries = await Delivery.find({
			route: route._id,
			shop: currentShop.shop._id,
		})
			.populate('order', 'orderId totalPrice paymentMethod products')
			.populate('order.products.product', 'productName unitPrice imageUrl')
			.lean();

		// Get rider wallet balance
		const riderWallet = await RiderWallet.findOne({ rider: riderId });

		// SECURITY: Only show current shop, hide future shops for riders
		const responseData = {
			route: {
				_id: route._id,
				routeName: route.routeName,
				routeCode: route.routeCode,
				status: route.status,
				totalShops: route.stats.totalShops,
				completedShops: currentShopIndex,
				startedAt: route.currentProgress.startedAt,
			},
			currentShop: {
				...currentShop.toObject(),
				deliveries: currentDeliveries,
			},
			hasNext: currentShopIndex < route.shops.length - 1,
			walletBalance: riderWallet ? riderWallet.currentBalance : 0,
		};

		// Admin can see all shops
		if (userRole === 'admin') {
			responseData.allShops = route.shops;
			responseData.nextShop = route.shops[currentShopIndex + 1] || null;
		}

		return res.status(200).json({
			success: true,
			message: 'Active route retrieved successfully',
			data: responseData,
		});
	} catch (error) {
		console.error('Get Active Route Error:', error);

		return res.status(500).json({
			success: false,
			message: 'Failed to retrieve active route',
			errors: [error.message],
		});
	}
};

module.exports = getActiveRoute;
