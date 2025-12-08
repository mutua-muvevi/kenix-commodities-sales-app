const Category = require('../../models/categories');

const createCategory = async (req, res) => {
	try {
		const { name, description, parentCategory, image, displayOrder, isActive } = req.body;
		const userId = req.user._id;

		// Check if parent category exists
		if (parentCategory) {
			const parent = await Category.findById(parentCategory);
			if (!parent) {
				return res.status(404).json({
					success: false,
					message: 'Parent category not found',
					errors: ['The specified parent category does not exist'],
				});
			}
		}

		const category = new Category({
			name,
			description,
			parentCategory,
			image,
			displayOrder,
			isActive,
			createdBy: userId,
			updatedBy: userId,
		});

		await category.save();

		return res.status(201).json({
			success: true,
			message: 'Category created successfully',
			data: { category },
		});
	} catch (error) {
		console.error('Create Category Error:', error);
		if (error.code === 11000) {
			return res.status(409).json({
				success: false,
				message: 'Category with this name already exists',
				errors: ['Duplicate category name'],
			});
		}
		return res.status(500).json({
			success: false,
			message: 'Internal server error while creating category',
			errors: [error.message],
		});
	}
};

module.exports = { createCategory };
