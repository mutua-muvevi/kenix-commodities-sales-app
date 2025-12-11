/**
 * Delete Category Controller
 *
 * Handles deleting a category with protection for products
 */

const Category = require('../../models/categories');
const Product = require('../../models/products');
const mongoose = require('mongoose');

/**
 * Delete a category
 *
 * @route DELETE /api/categories/:id
 * @access Admin only
 *
 * Business Rules:
 * 1. Cannot delete a category that has products assigned to it
 * 2. Cannot delete a category that has subcategories
 * 3. Use transactions to ensure atomicity
 */
const deleteCategory = async (req, res) => {
	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		const { id } = req.params;

		// Find the category to delete
		const category = await Category.findById(id).session(session);

		if (!category) {
			await session.abortTransaction();
			session.endSession();
			return res.status(404).json({
				success: false,
				message: 'Category not found',
				errors: ['No category exists with the provided ID'],
			});
		}

		// Check if category has products assigned to it
		const productCount = await Product.countDocuments({ category: id }).session(session);

		if (productCount > 0) {
			await session.abortTransaction();
			session.endSession();
			return res.status(409).json({
				success: false,
				message: 'Cannot delete category with assigned products',
				errors: [
					`This category has ${productCount} product(s) assigned to it. Please reassign or delete these products before deleting the category.`
				],
				data: {
					productCount,
					categoryId: id,
					categoryName: category.name,
				},
			});
		}

		// Check if category has subcategories
		const subcategoryCount = await Category.countDocuments({ parentCategory: id }).session(session);

		if (subcategoryCount > 0) {
			await session.abortTransaction();
			session.endSession();
			return res.status(409).json({
				success: false,
				message: 'Cannot delete category with subcategories',
				errors: [
					`This category has ${subcategoryCount} subcategory/subcategories. Please reassign or delete these subcategories before deleting the category.`
				],
				data: {
					subcategoryCount,
					categoryId: id,
					categoryName: category.name,
				},
			});
		}

		// Perform the deletion
		await Category.findByIdAndDelete(id).session(session);

		// Commit the transaction
		await session.commitTransaction();
		session.endSession();

		return res.status(200).json({
			success: true,
			message: 'Category deleted successfully',
			data: {
				deletedCategoryId: id,
				deletedCategoryName: category.name,
			},
		});
	} catch (error) {
		await session.abortTransaction();
		session.endSession();
		console.error('Delete Category Error:', error);

		return res.status(500).json({
			success: false,
			message: 'Internal server error while deleting category',
			errors: [error.message],
		});
	}
};

module.exports = { deleteCategory };
