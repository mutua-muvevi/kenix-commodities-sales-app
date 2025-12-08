/**
 * Inventory API Routes
 *
 * All routes for inventory management including:
 * - Inventory listing and filtering
 * - Product-specific inventory details
 * - Stock adjustments (admin only)
 * - Inventory reservation and release (system/internal)
 */

const express = require('express');
const router = express.Router();

// Middleware
const { authenticationMiddleware } = require('../middleware/auth/authentication');
const { getMe } = require('../middleware/user/me');
const { checkRole } = require('../middleware/rbac/checkRole');
const { validateRequest, validateObjectId } = require('../middleware/validation/validateRequest');

// Validators
const {
	adjustStockSchema,
	reserveInventorySchema,
} = require('../validators/inventoryValidators');

// Controllers
const getInventory = require('../controllers/inventory/getInventory');
const getProductInventory = require('../controllers/inventory/getProductInventory');
const adjustInventory = require('../controllers/inventory/adjustInventory');
const reserveInventory = require('../controllers/inventory/reserveInventory');
const releaseInventory = require('../controllers/inventory/releaseInventory');

// Apply authentication and getMe to all routes
router.use(authenticationMiddleware);
router.use(getMe);

/**
 * @route   GET /api/inventory
 * @desc    Get all inventory records with filtering and pagination
 * @access  Private (admin only)
 * @query   productId, status, page, limit
 */
router.get(
	'/',
	checkRole(['admin']),
	getInventory
);

/**
 * @route   GET /api/inventory/product/:productId
 * @desc    Get inventory details for a specific product
 * @access  Private (all authenticated users)
 */
router.get(
	'/product/:productId',
	validateObjectId('productId'),
	getProductInventory
);

/**
 * @route   POST /api/inventory/:productId/adjust
 * @desc    Adjust inventory quantity for a product
 * @access  Private (admin only)
 */
router.post(
	'/:productId/adjust',
	checkRole(['admin']),
	validateObjectId('productId'),
	validateRequest(adjustStockSchema),
	adjustInventory
);

/**
 * @route   POST /api/inventory/reserve
 * @desc    Reserve inventory for an order (internal/system use)
 * @access  Private (system - called during order creation)
 */
router.post(
	'/reserve',
	validateRequest(reserveInventorySchema),
	reserveInventory
);

/**
 * @route   POST /api/inventory/release
 * @desc    Release reserved inventory (internal/system use)
 * @access  Private (system - called during order cancellation)
 */
router.post(
	'/release',
	releaseInventory
);

module.exports = router;
