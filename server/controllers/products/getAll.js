/**
 * Get All Products Controller
 *
 * Handles fetching products with filtering, search, and pagination
 */

const Product = require('../../models/products');
const Inventory = require('../../models/inventory');

/**
 * Get all products with filtering and pagination
 *
 * @route GET /api/products
 * @access Admin, Shop, Sales Agent, Rider
 */
const getAllProducts = async (req, res) => {
	try {
		const {
			page = 1,
			limit = 20,
			category,
			search,
			isActive,
			sortBy = 'name',
			sortOrder = 'asc',
		} = req.query;

		// Build filter object
		const filter = {};

		if (category) {
			filter.category = category;
		}

		if (isActive !== undefined) {
			filter.isActive = isActive;
		}

		// Search in name, description, or SKU
		if (search) {
			filter.$or = [
				{ name: { $regex: search, $options: 'i' } },
				{ description: { $regex: search, $options: 'i' } },
				{ sku: { $regex: search, $options: 'i' } },
			];
		}

		// Calculate pagination
		const skip = (parseInt(page) - 1) * parseInt(limit);
		const limitNum = parseInt(limit);

		// Build sort object
		const sort = {};
		sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

		// Execute query
		const products = await Product.find(filter)
			.populate('category', 'name description image')
			.sort(sort)
			.skip(skip)
			.limit(limitNum)
			.lean(); // Use lean() for better performance

		// Get inventory data for each product
		const productIds = products.map(p => p._id);
		const inventories = await Inventory.find({ product: { $in: productIds } })
			.select('product quantity reservedQuantity isInStock')
			.lean();

		// Create a map for quick lookup
		const inventoryMap = {};
		inventories.forEach(inv => {
			inventoryMap[inv.product.toString()] = {
				quantity: inv.quantity,
				reservedQuantity: inv.reservedQuantity,
				availableQuantity: Math.max(0, inv.quantity - inv.reservedQuantity),
				isInStock: inv.isInStock,
			};
		});

		// Attach inventory data to products
		const productsWithInventory = products.map(product => ({
			...product,
			inventory: inventoryMap[product._id.toString()] || {
				quantity: 0,
				reservedQuantity: 0,
				availableQuantity: 0,
				isInStock: false,
			},
		}));

		// Get total count for pagination
		const totalProducts = await Product.countDocuments(filter);
		const totalPages = Math.ceil(totalProducts / limitNum);

		return res.status(200).json({
			success: true,
			message: 'Products retrieved successfully',
			data: {
				products: productsWithInventory,
				pagination: {
					currentPage: parseInt(page),
					totalPages,
					totalProducts,
					limit: limitNum,
					hasNextPage: page < totalPages,
					hasPrevPage: page > 1,
				},
			},
		});
	} catch (error) {
		console.error('Get All Products Error:', error);
		return res.status(500).json({
			success: false,
			message: 'Internal server error while fetching products',
			errors: [error.message],
		});
	}
};

module.exports = { getAllProducts };
