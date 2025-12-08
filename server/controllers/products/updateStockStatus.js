/**
 * Update Product Stock Status Controller
 *
 * Handles admin declaration of product stock availability
 * This is a manual override regardless of actual inventory quantity
 * Only admins can update stock status
 */

const Inventory = require('../../models/inventory');
const Product = require('../../models/products');

/**
 * Update product stock availability status
 *
 * @route PATCH /api/products/:id/stock-status
 * @access Admin only
 */
const updateStockStatus = async (req, res) => {
	try {
		const { id } = req.params;
		const { isInStock } = req.body;
		const userId = req.user._id;

		// Verify product exists
		const product = await Product.findById(id);

		if (!product) {
			return res.status(404).json({
				success: false,
				message: 'Product not found',
				errors: ['No product exists with the specified ID'],
			});
		}

		// Find inventory record
		let inventory = await Inventory.findOne({ product: id });

		if (!inventory) {
			// Create inventory if it doesn't exist
			inventory = new Inventory({
				product: id,
				quantity: 0,
				reservedQuantity: 0,
				isInStock,
				lastUpdatedBy: userId,
			});
		} else {
			// Update existing inventory
			inventory.isInStock = isInStock;
			inventory.lastUpdatedBy = userId;
			inventory.lastStockUpdate = new Date();
		}

		await inventory.save();

		return res.status(200).json({
			success: true,
			message: `Product marked as ${isInStock ? 'in stock' : 'out of stock'}`,
			data: {
				product: {
					_id: product._id,
					name: product.name,
					sku: product.sku,
				},
				inventory: {
					isInStock: inventory.isInStock,
					quantity: inventory.quantity,
					availableQuantity: Math.max(0, inventory.quantity - inventory.reservedQuantity),
					lastStockUpdate: inventory.lastStockUpdate,
				},
			},
		});
	} catch (error) {
		console.error('Update Stock Status Error:', error);
		return res.status(500).json({
			success: false,
			message: 'Internal server error while updating stock status',
			errors: [error.message],
		});
	}
};

module.exports = { updateStockStatus };
