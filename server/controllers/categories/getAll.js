const Category = require('../../models/categories');
const Product = require('../../models/products');

const getAllCategories = async (req, res) => {
	try {
		const { page = 1, limit = 20, isActive, parentCategory, includeProducts, sortBy = 'displayOrder', sortOrder = 'asc' } = req.query;

		const filter = {};
		if (isActive !== undefined) filter.isActive = isActive;
		if (parentCategory) filter.parentCategory = parentCategory;

		const skip = (parseInt(page) - 1) * parseInt(limit);
		const sort = {};
		sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

		const categories = await Category.find(filter)
			.populate('parentCategory', 'name')
			.sort(sort)
			.skip(skip)
			.limit(parseInt(limit))
			.lean();

		// Include products if requested
		if (includeProducts === 'true' || includeProducts === true) {
			for (let category of categories) {
				const products = await Product.find({ category: category._id, isActive: true })
					.select('name sku unitPrice wholePrice images')
					.limit(10)
					.lean();
				category.products = products;
				category.productCount = await Product.countDocuments({ category: category._id, isActive: true });
			}
		}

		const totalCategories = await Category.countDocuments(filter);
		const totalPages = Math.ceil(totalCategories / parseInt(limit));

		return res.status(200).json({
			success: true,
			message: 'Categories retrieved successfully',
			data: {
				categories,
				pagination: {
					currentPage: parseInt(page),
					totalPages,
					totalCategories,
					limit: parseInt(limit),
				},
			},
		});
	} catch (error) {
		console.error('Get All Categories Error:', error);
		return res.status(500).json({
			success: false,
			message: 'Internal server error while fetching categories',
			errors: [error.message],
		});
	}
};

module.exports = { getAllCategories };
