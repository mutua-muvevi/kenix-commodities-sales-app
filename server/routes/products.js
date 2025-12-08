/**
 * Product Routes
 *
 * RESTful API endpoints for product management
 */

const express = require('express');
const router = express.Router();

// Controllers
const { createProduct } = require('../controllers/products/create');
const { getAllProducts } = require('../controllers/products/getAll');
const { getOneProduct } = require('../controllers/products/getOne');
const { updateProduct } = require('../controllers/products/update');
const { deleteProduct } = require('../controllers/products/delete');
const { updateStockStatus } = require('../controllers/products/updateStockStatus');

// Middleware
const { authenticationMiddleware } = require('../middleware/auth/authentication');
const { getMe } = require('../middleware/user/me');
const { isAdmin, checkRole } = require('../middleware/rbac/checkRole');
const { validateBody, validateQuery, validateObjectId } = require('../middleware/validation/validateRequest');

// Validators
const {
	createProductSchema,
	updateProductSchema,
	productQuerySchema,
	updateStockStatusSchema,
} = require('../validators/productValidators');

/**
 * @route   POST /api/products
 * @desc    Create a new product
 * @access  Admin only
 */
router.post(
	'/',
	authenticationMiddleware,
	getMe,
	isAdmin,
	validateBody(createProductSchema),
	createProduct
);

/**
 * @route   GET /api/products
 * @desc    Get all products with filtering and pagination
 * @access  All authenticated users
 */
router.get(
	'/',
	authenticationMiddleware,
	getMe,
	checkRole(['admin', 'shop', 'sales_agent', 'rider']),
	validateQuery(productQuerySchema),
	getAllProducts
);

/**
 * @route   GET /api/products/:id
 * @desc    Get single product by ID
 * @access  All authenticated users
 */
router.get(
	'/:id',
	authenticationMiddleware,
	getMe,
	checkRole(['admin', 'shop', 'sales_agent', 'rider']),
	validateObjectId('id'),
	getOneProduct
);

/**
 * @route   PATCH /api/products/:id
 * @desc    Update product
 * @access  Admin only
 */
router.patch(
	'/:id',
	authenticationMiddleware,
	getMe,
	isAdmin,
	validateObjectId('id'),
	validateBody(updateProductSchema),
	updateProduct
);

/**
 * @route   DELETE /api/products/:id
 * @desc    Soft delete product (deactivate)
 * @access  Admin only
 */
router.delete(
	'/:id',
	authenticationMiddleware,
	getMe,
	isAdmin,
	validateObjectId('id'),
	deleteProduct
);

/**
 * @route   PATCH /api/products/:id/stock-status
 * @desc    Update product stock availability status (admin declaration)
 * @access  Admin only
 */
router.patch(
	'/:id/stock-status',
	authenticationMiddleware,
	getMe,
	isAdmin,
	validateObjectId('id'),
	validateBody(updateStockStatusSchema),
	updateStockStatus
);

module.exports = router;
