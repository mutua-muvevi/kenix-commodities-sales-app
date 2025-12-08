/**
 * Create Product Controller
 *
 * Handles creation of new products in the system
 * Only admins can create products
 */

const Product = require('../../models/products');
const Inventory = require('../../models/inventory');
const Category = require('../../models/categories');

/**
 * Create a new product
 *
 * @route POST /api/products
 * @access Admin only
 */
const createProduct = async (req, res) => {
	try {
		const {
			name,
			sku,
			description,
			category,
			wholePrice,
			unitPrice,
			unitOfMeasure,
			images,
			isActive,
		} = req.body;

		const userId = req.user._id;

		// Check if category exists
		const categoryExists = await Category.findById(category);
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
				message: 'Cannot create product',
				errors: ['The specified category is inactive'],
			});
		}

		// Check if SKU already exists
		const existingSKU = await Product.findOne({ sku });
		if (existingSKU) {
			return res.status(409).json({
				success: false,
				message: 'Product with this SKU already exists',
				errors: [`SKU '${sku}' is already in use`],
			});
		}

		// Create the product
		const product = new Product({
			name,
			sku,
			description,
			category,
			wholePrice,
			unitPrice,
			unitOfMeasure,
			images: images || [],
			isActive: isActive !== undefined ? isActive : true,
			createdBy: userId,
			updatedBy: userId,
		});

		await product.save();

		// Create corresponding inventory entry
		const inventory = new Inventory({
			product: product._id,
			quantity: 0,
			reservedQuantity: 0,
			isInStock: false, // Admin will set this when stock arrives
			lowStockThreshold: 10,
			reorderPoint: 20,
			lastUpdatedBy: userId,
		});

		await inventory.save();

		// Populate category in response
		await product.populate('category', 'name description');

		return res.status(201).json({
			success: true,
			message: 'Product created successfully',
			data: {
				product,
				inventory: {
					quantity: inventory.quantity,
					isInStock: inventory.isInStock,
				},
			},
		});
	} catch (error) {
		console.error('Create Product Error:', error);

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
			message: 'Internal server error while creating product',
			errors: [error.message],
		});
	}
};

module.exports = { createProduct };
