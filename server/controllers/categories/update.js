/**
 * Update Category Controller
 *
 * Handles updating an existing category
 */

const Category = require('../../models/categories');
const mongoose = require('mongoose');

/**
 * Update an existing category
 *
 * @route PATCH /api/categories/:id
 * @access Admin only
 */
const updateCategory = async (req, res) => {
	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		const { id } = req.params;
		const { name, description, parentCategory, image, displayOrder, isActive } = req.body;
		const userId = req.user._id;

		// Find the category to update
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

		// Prevent circular reference if updating parent category
		if (parentCategory) {
			// Check if parent category exists
			const parent = await Category.findById(parentCategory).session(session);
			if (!parent) {
				await session.abortTransaction();
				session.endSession();
				return res.status(404).json({
					success: false,
					message: 'Parent category not found',
					errors: ['The specified parent category does not exist'],
				});
			}

			// Prevent setting category as its own parent
			if (parentCategory === id) {
				await session.abortTransaction();
				session.endSession();
				return res.status(400).json({
					success: false,
					message: 'Invalid parent category',
					errors: ['A category cannot be its own parent'],
				});
			}

			// Prevent circular reference by checking if the parent is a descendant
			let currentParent = parent;
			while (currentParent.parentCategory) {
				if (currentParent.parentCategory.toString() === id) {
					await session.abortTransaction();
					session.endSession();
					return res.status(400).json({
						success: false,
						message: 'Circular reference detected',
						errors: ['Cannot set a subcategory as parent category - this would create a circular reference'],
					});
				}
				currentParent = await Category.findById(currentParent.parentCategory).session(session);
				if (!currentParent) break;
			}
		}

		// Check for duplicate name if name is being updated
		if (name && name !== category.name) {
			const existingCategory = await Category.findOne({ name, _id: { $ne: id } }).session(session);
			if (existingCategory) {
				await session.abortTransaction();
				session.endSession();
				return res.status(409).json({
					success: false,
					message: 'Category with this name already exists',
					errors: ['Duplicate category name'],
				});
			}
		}

		// Update category fields
		if (name !== undefined) category.name = name;
		if (description !== undefined) category.description = description;
		if (parentCategory !== undefined) category.parentCategory = parentCategory;
		if (image !== undefined) category.image = image;
		if (displayOrder !== undefined) category.displayOrder = displayOrder;
		if (isActive !== undefined) category.isActive = isActive;
		category.updatedBy = userId;

		// Save the updated category
		await category.save({ session });

		// Commit the transaction
		await session.commitTransaction();
		session.endSession();

		// Populate parent category for response
		await category.populate('parentCategory', 'name description image');
		await category.populate('updatedBy', 'firstName lastName email');

		return res.status(200).json({
			success: true,
			message: 'Category updated successfully',
			data: { category },
		});
	} catch (error) {
		await session.abortTransaction();
		session.endSession();
		console.error('Update Category Error:', error);

		if (error.code === 11000) {
			return res.status(409).json({
				success: false,
				message: 'Category with this name already exists',
				errors: ['Duplicate category name'],
			});
		}

		return res.status(500).json({
			success: false,
			message: 'Internal server error while updating category',
			errors: [error.message],
		});
	}
};

module.exports = { updateCategory };
