/**
 * Get Single Product Controller
 *
 * Handles fetching a single product by ID
 */

const Product = require('../../models/products');
const Inventory = require('../../models/inventory');

/**
 * Get a single product by ID
 *
 * @route GET /api/products/:id
 * @access Admin, Shop, Sales Agent, Rider
 */
const getOneProduct = async (req, res) => {
	try {
		const { id } = req.params;

		// Find product
		const product = await Product.findById(id)
			.populate('category', 'name description image parentCategory')
			.populate('createdBy', 'name email')
			.populate('updatedBy', 'name email')
			.lean();

		if (!product) {
			return res.status(404).json({
				success: false,
				message: 'Product not found',
				errors: ['No product exists with the specified ID'],
			});
		}

		// Get inventory data
		const inventory = await Inventory.findOne({ product: id })
			.select('quantity reservedQuantity isInStock lowStockThreshold reorderPoint lastStockUpdate')
			.lean();

		// Calculate available quantity
		const inventoryData = inventory ? {
			quantity: inventory.quantity,
			reservedQuantity: inventory.reservedQuantity,
			availableQuantity: Math.max(0, inventory.quantity - inventory.reservedQuantity),
			isInStock: inventory.isInStock,
			lowStockThreshold: inventory.lowStockThreshold,
			reorderPoint: inventory.reorderPoint,
			isLowStock: (inventory.quantity - inventory.reservedQuantity) <= inventory.lowStockThreshold,
			needsReorder: (inventory.quantity - inventory.reservedQuantity) <= inventory.reorderPoint,
			lastStockUpdate: inventory.lastStockUpdate,
		} : {
			quantity: 0,
			reservedQuantity: 0,
			availableQuantity: 0,
			isInStock: false,
			isLowStock: false,
			needsReorder: true,
		};

		return res.status(200).json({
			success: true,
			message: 'Product retrieved successfully',
			data: {
				product: {
					...product,
					inventory: inventoryData,
				},
			},
		});
	} catch (error) {
		console.error('Get One Product Error:', error);
		return res.status(500).json({
			success: false,
			message: 'Internal server error while fetching product',
			errors: [error.message],
		});
	}
};

module.exports = { getOneProduct };
