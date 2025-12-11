/**
 * Get Category By ID Controller
 *
 * Handles fetching a single category by its ID
 */

const Category = require('../../models/categories');
const Product = require('../../models/products');

/**
 * Get a single category by ID
 *
 * @route GET /api/categories/:id
 * @access Admin, Shop, Sales Agent, Rider
 */
const getCategoryById = async (req, res) => {
	try {
		const { id } = req.params;
		const { includeProducts } = req.query;

		// Find category by ID and populate parent category
		const category = await Category.findById(id)
			.populate('parentCategory', 'name description image')
			.populate('createdBy', 'firstName lastName email')
			.populate('updatedBy', 'firstName lastName email')
			.lean();

		if (!category) {
			return res.status(404).json({
				success: false,
				message: 'Category not found',
				errors: ['No category exists with the provided ID'],
			});
		}

		// Include products if requested
		if (includeProducts === 'true' || includeProducts === true) {
			const products = await Product.find({ category: id, isActive: true })
				.select('name sku unitPrice wholePrice images')
				.limit(20)
				.lean();

			const productCount = await Product.countDocuments({ category: id, isActive: true });

			category.products = products;
			category.productCount = productCount;
		}

		// Count total products in this category (including inactive)
		category.totalProducts = await Product.countDocuments({ category: id });

		// Find subcategories
		const subcategories = await Category.find({ parentCategory: id })
			.select('name description image isActive displayOrder')
			.sort({ displayOrder: 1 })
			.lean();

		category.subcategories = subcategories;
		category.subcategoryCount = subcategories.length;

		return res.status(200).json({
			success: true,
			message: 'Category retrieved successfully',
			data: { category },
		});
	} catch (error) {
		console.error('Get Category By ID Error:', error);
		return res.status(500).json({
			success: false,
			message: 'Internal server error while fetching category',
			errors: [error.message],
		});
	}
};

module.exports = { getCategoryById };
