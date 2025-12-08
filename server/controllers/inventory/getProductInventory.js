/**
 * Get Product Inventory Controller
 *
 * Endpoint: GET /api/inventory/product/:productId
 * Accessible by: all authenticated users
 *
 * Returns inventory details for a specific product
 */

const Inventory = require('../../models/inventory');
const Product = require('../../models/products');
const ErrorResponse = require('../../utils/error-response');
const logger = require('../../utils/logger');

/**
 * Get inventory details for a specific product
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getProductInventory = async (req, res, next) => {
	try {
		const { productId } = req.params;

		// Verify product exists
		const product = await Product.findById(productId);
		if (!product) {
			return res.status(404).json({
				success: false,
				message: 'Product not found',
				errors: [`No product found with ID: ${productId}`],
			});
		}

		// Get inventory record
		let inventory = await Inventory.findOne({ product: productId })
			.populate('product', 'name description price images category isInStock')
			.populate('lastUpdatedBy', 'firstName lastName role');

		// If no inventory record exists, create a default one
		if (!inventory) {
			inventory = new Inventory({
				product: productId,
				quantity: 0,
				reservedQuantity: 0,
				isInStock: false,
			});
			await inventory.save();
			await inventory.populate('product', 'name description price images category isInStock');
		}

		// Calculate available quantity
		const availableQuantity = Math.max(0, inventory.quantity - inventory.reservedQuantity);

		// Get recent stock history (last 20 entries)
		const recentHistory = inventory.stockHistory
			.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
			.slice(0, 20);

		// Calculate stock movement summary
		const last30Days = new Date();
		last30Days.setDate(last30Days.getDate() - 30);

		const recentMovements = inventory.stockHistory.filter(
			h => new Date(h.timestamp) >= last30Days
		);

		const incoming = recentMovements
			.filter(h => h.type === 'incoming')
			.reduce((sum, h) => sum + h.quantity, 0);

		const outgoing = recentMovements
			.filter(h => h.type === 'outgoing')
			.reduce((sum, h) => sum + Math.abs(h.quantity), 0);

		logger.info(`Product inventory retrieved for product ${productId}`);

		return res.status(200).json({
			success: true,
			message: 'Product inventory retrieved successfully',
			data: {
				inventory: {
					id: inventory._id,
					product: inventory.product,
					quantities: {
						total: inventory.quantity,
						reserved: inventory.reservedQuantity,
						available: availableQuantity,
					},
					status: {
						isInStock: inventory.isInStock,
						isLowStock: availableQuantity <= inventory.lowStockThreshold && availableQuantity > 0,
						needsReorder: availableQuantity <= inventory.reorderPoint,
						isOutOfStock: availableQuantity === 0,
					},
					thresholds: {
						lowStockThreshold: inventory.lowStockThreshold,
						reorderPoint: inventory.reorderPoint,
					},
					stockMovementSummary: {
						period: 'Last 30 days',
						incoming,
						outgoing,
						netChange: incoming - outgoing,
					},
					recentHistory: recentHistory.map(h => ({
						type: h.type,
						quantity: h.quantity,
						previousQuantity: h.previousQuantity,
						newQuantity: h.newQuantity,
						reason: h.reason,
						performedBy: h.performedBy,
						timestamp: h.timestamp,
					})),
					lastUpdate: {
						date: inventory.lastStockUpdate,
						by: inventory.lastUpdatedBy,
					},
					createdAt: inventory.createdAt,
					updatedAt: inventory.updatedAt,
				},
			},
		});
	} catch (error) {
		logger.error('Get Product Inventory Error:', error);
		return next(new ErrorResponse('Failed to retrieve product inventory', 500));
	}
};

module.exports = getProductInventory;
