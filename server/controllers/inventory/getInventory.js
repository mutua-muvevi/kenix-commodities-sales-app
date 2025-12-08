/**
 * Get Inventory Controller
 *
 * Endpoint: GET /api/inventory
 * Accessible by: admin
 * Query params: ?productId=&status=&page=1
 *
 * Returns list of inventory records with filtering and pagination
 */

const Inventory = require('../../models/inventory');
const ErrorResponse = require('../../utils/error-response');
const logger = require('../../utils/logger');

/**
 * Get all inventory records with filtering and pagination
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getInventory = async (req, res, next) => {
	try {
		// Query parameters with defaults
		const page = parseInt(req.query.page) || 1;
		const limit = Math.min(parseInt(req.query.limit) || 20, 100);
		const productId = req.query.productId;
		const status = req.query.status; // low-stock, out-of-stock, in-stock

		// Build query filter
		const filter = {};

		// Filter by specific product
		if (productId) {
			filter.product = productId;
		}

		// Filter by stock status
		if (status) {
			switch (status) {
				case 'out-of-stock':
					filter.quantity = 0;
					break;
				case 'low-stock':
					// Will filter this after query using virtual property
					break;
				case 'in-stock':
					filter.isInStock = true;
					filter.quantity = { $gt: 0 };
					break;
				case 'not-available':
					filter.isInStock = false;
					break;
			}
		}

		// Execute query with pagination
		const skip = (page - 1) * limit;
		const totalRecords = await Inventory.countDocuments(filter);

		let inventoryRecords = await Inventory.find(filter)
			.populate('product', 'name description price images category')
			.populate('lastUpdatedBy', 'firstName lastName role')
			.sort({ lastStockUpdate: -1 })
			.skip(skip)
			.limit(limit);

		// Apply low-stock filter if needed (using virtual property)
		if (status === 'low-stock') {
			inventoryRecords = inventoryRecords.filter(inv => {
				const availableQty = inv.quantity - inv.reservedQuantity;
				return availableQty > 0 && availableQty <= inv.lowStockThreshold;
			});
		}

		// Calculate pagination info
		const totalPages = Math.ceil(totalRecords / limit);

		// Format response data
		const formattedInventory = inventoryRecords.map(inv => {
			const availableQty = inv.quantity - inv.reservedQuantity;
			return {
				id: inv._id,
				product: inv.product,
				quantity: inv.quantity,
				reservedQuantity: inv.reservedQuantity,
				availableQuantity: availableQty,
				isInStock: inv.isInStock,
				lowStockThreshold: inv.lowStockThreshold,
				reorderPoint: inv.reorderPoint,
				isLowStock: availableQty <= inv.lowStockThreshold && availableQty > 0,
				needsReorder: availableQty <= inv.reorderPoint,
				lastStockUpdate: inv.lastStockUpdate,
				lastUpdatedBy: inv.lastUpdatedBy,
				createdAt: inv.createdAt,
				updatedAt: inv.updatedAt,
			};
		});

		logger.info(`Inventory list retrieved: ${inventoryRecords.length} records`);

		return res.status(200).json({
			success: true,
			message: 'Inventory records retrieved successfully',
			data: {
				inventory: formattedInventory,
				pagination: {
					currentPage: page,
					totalPages,
					totalRecords,
					recordsPerPage: limit,
					hasNextPage: page < totalPages,
					hasPreviousPage: page > 1,
				},
				filters: {
					productId: productId || null,
					status: status || 'all',
				},
			},
		});
	} catch (error) {
		logger.error('Get Inventory Error:', error);
		return next(new ErrorResponse('Failed to retrieve inventory records', 500));
	}
};

module.exports = getInventory;
