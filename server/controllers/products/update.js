/**
 * Update Product Controller
 *
 * Handles updating existing products
 * Only admins can update products
 */

const Product = require('../../models/products');
const Category = require('../../models/categories');

/**
 * Update an existing product
 *
 * @route PATCH /api/products/:id
 * @access Admin only
 */
const updateProduct = async (req, res) => {
	try {
		const { id } = req.params;
		const updates = req.body;
		const userId = req.user._id;

		// Find the product
		const product = await Product.findById(id);

		if (!product) {
			return res.status(404).json({
				success: false,
				message: 'Product not found',
				errors: ['No product exists with the specified ID'],
			});
		}

		// If category is being updated, validate it exists
		if (updates.category) {
			const categoryExists = await Category.findById(updates.category);
			if (!categoryExists) {
				return res.status(404).json({
					success: false,
					message: 'Category not found',
					errors: ['The specified category does not exist'],
				});
			}

			if (!categoryExists.isActive) {
				return res.status(400).json({
					success: false,
					message: 'Cannot update product',
					errors: ['The specified category is inactive'],
				});
			}
		}

		// If SKU is being updated, check for duplicates
		if (updates.sku && updates.sku !== product.sku) {
			const existingSKU = await Product.findOne({ sku: updates.sku });
			if (existingSKU) {
				return res.status(409).json({
					success: false,
					message: 'Product with this SKU already exists',
					errors: [`SKU '${updates.sku}' is already in use`],
				});
			}
		}

		// Update the product
		Object.keys(updates).forEach(key => {
			product[key] = updates[key];
		});

		product.updatedBy = userId;

		await product.save();

		// Populate category in response
		await product.populate('category', 'name description');

		return res.status(200).json({
			success: true,
			message: 'Product updated successfully',
			data: {
				product,
			},
		});
	} catch (error) {
		console.error('Update Product Error:', error);

		// Handle duplicate key error
		if (error.code === 11000) {
			const field = Object.keys(error.keyPattern)[0];
			return res.status(409).json({
				success: false,
				message: `Product with this ${field} already exists`,
				errors: [`Duplicate value for field: ${field}`],
			});
		}

		return res.status(500).json({
			success: false,
			message: 'Internal server error while updating product',
			errors: [error.message],
		});
	}
};

module.exports = { updateProduct };
