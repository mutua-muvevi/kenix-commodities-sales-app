/**
 * Get Single Route Controller
 *
 * GET /api/routes/:id
 * Accessible by: admin, assigned rider
 *
 * Retrieves complete route details with shop information and progress
 */

const Route = require('../../models/routes');
const Order = require('../../models/orders');

/**
 * @route   GET /api/routes/:id
 * @desc    Get single route details
 * @access  Private (admin, assigned rider)
 *
 * @param {string} id - Route ID
 *
 * @returns {Object} Complete route details
 */
const getRoute = async (req, res) => {
	try {
		const { id } = req.params;
		const userId = req.user._id;
		const userRole = req.user.role;

		// Find route
		const route = await Route.findById(id)
			.populate('shops.shop', 'shopName phoneNumber location address')
			.populate('assignedRider', 'firstName lastName phoneNumber location')
			.populate('assignedSalesAgent', 'firstName lastName phoneNumber')
			.populate('createdBy', 'firstName lastName')
			.populate('updatedBy', 'firstName lastName');

		if (!route) {
			return res.status(404).json({
				success: false,
				message: 'Route not found',
				errors: ['No route exists with the specified ID'],
			});
		}

		// Access validation
		if (userRole === 'rider') {
			// Rider can only see their assigned routes
			if (!route.assignedRider || route.assignedRider._id.toString() !== userId.toString()) {
				return res.status(403).json({
					success: false,
					message: 'Access denied',
					errors: ['You can only view routes assigned to you'],
				});
			}
		}

		// Get orders for each shop on this route
		const shopIds = route.shops.map((s) => s.shop._id);
		const orders = await Order.find({
			orderer: { $in: shopIds },
			assignedRoute: route._id,
		})
			.populate('products.product', 'productName unitPrice imageUrl')
			.select('orderId orderer totalPrice paymentStatus deliveryStatus products')
			.lean();

		// Group orders by shop
		const ordersByShop = {};
		orders.forEach((order) => {
			const shopId = order.orderer.toString();
			if (!ordersByShop[shopId]) {
				ordersByShop[shopId] = [];
			}
			ordersByShop[shopId].push(order);
		});

		// Enhance shops with their orders
		const shopsWithOrders = route.shops.map((shop) => {
			const shopOrders = ordersByShop[shop.shop._id.toString()] || [];
			const totalValue = shopOrders.reduce((sum, order) => sum + order.totalPrice, 0);

			return {
				...shop.toObject(),
				orders: shopOrders,
				orderCount: shopOrders.length,
				totalOrderValue: totalValue,
			};
		});

		// Calculate route progress
		const totalShops = route.stats.totalShops || route.shops.length;
		const completedShops = route.currentProgress.currentShopIndex;
		const completionPercentage = totalShops > 0
			? Math.round((completedShops / totalShops) * 100)
			: 0;

		const currentShop = route.shops[route.currentProgress.currentShopIndex];
		const nextShop = route.shops[route.currentProgress.currentShopIndex + 1];

		return res.status(200).json({
			success: true,
			message: 'Route retrieved successfully',
			data: {
				route: {
					...route.toObject(),
					shops: shopsWithOrders,
				},
				progress: {
					totalShops,
					completedShops,
					completionPercentage,
					currentShop: currentShop || null,
					nextShop: nextShop || null,
					isInProgress: route.currentProgress.isInProgress,
				},
				summary: {
					totalOrders: orders.length,
					totalValue: orders.reduce((sum, order) => sum + order.totalPrice, 0),
					estimatedDuration: route.stats.estimatedDuration,
					estimatedDistance: route.stats.estimatedDistance,
				},
			},
		});
	} catch (error) {
		console.error('Get Route Error:', error);

		return res.status(500).json({
			success: false,
			message: 'Failed to retrieve route',
			errors: [error.message],
		});
	}
};

module.exports = getRoute;
