/**
 * Delete Product Controller
 *
 * Handles soft deletion of products
 * Only admins can delete products
 */

const Product = require('../../models/products');

/**
 * Soft delete a product (set isActive to false)
 *
 * @route DELETE /api/products/:id
 * @access Admin only
 */
const deleteProduct = async (req, res) => {
	try {
		const { id } = req.params;
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

		if (!product.isActive) {
			return res.status(400).json({
				success: false,
				message: 'Product is already inactive',
				errors: ['This product has already been deactivated'],
			});
		}

		// Soft delete by setting isActive to false
		product.isActive = false;
		product.updatedBy = userId;

		await product.save();

		return res.status(200).json({
			success: true,
			message: 'Product deactivated successfully',
			data: {
				product: {
					_id: product._id,
					name: product.name,
					sku: product.sku,
					isActive: product.isActive,
				},
			},
		});
	} catch (error) {
		console.error('Delete Product Error:', error);
		return res.status(500).json({
			success: false,
			message: 'Internal server error while deactivating product',
			errors: [error.message],
		});
	}
};

module.exports = { deleteProduct };
