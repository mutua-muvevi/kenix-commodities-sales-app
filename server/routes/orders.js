/**
 * Orders API Routes
 *
 * All routes for order management including:
 * - Order creation
 * - Order approval workflow
 * - Route assignment
 * - Order modification and cancellation
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
	orderCreateValidator,
	orderApprovalValidator,
	orderRejectionValidator,
	orderRouteAssignmentValidator,
	orderCancellationValidator,
} = require('../validators/orderValidators');

// Controllers
const createOrder = require('../controllers/orders/createOrder');
const listOrders = require('../controllers/orders/listOrders');
const getOrder = require('../controllers/orders/getOrder');
const approveOrder = require('../controllers/orders/approveOrder');
const rejectOrder = require('../controllers/orders/rejectOrder');
const assignOrderToRoute = require('../controllers/orders/assignOrderToRoute');
const removeProductFromOrder = require('../controllers/orders/removeProductFromOrder');
const cancelOrder = require('../controllers/orders/cancelOrder');

// Apply authentication and getMe to all routes
router.use(authenticationMiddleware);
router.use(getMe);

/**
 * @route   POST /api/orders
 * @desc    Create a new order
 * @access  Private (shop, sales_agent)
 */
router.post(
	'/',
	checkRole(['shop', 'sales_agent']),
	validateRequest(orderCreateValidator),
	createOrder
);

/**
 * @route   GET /api/orders
 * @desc    List all orders (filtered by role)
 * @access  Private (all roles)
 */
router.get('/', listOrders);

/**
 * @route   GET /api/orders/:id
 * @desc    Get single order details
 * @access  Private (all roles - ownership check)
 */
router.get('/:id', validateObjectId('id'), getOrder);

/**
 * @route   PATCH /api/orders/:id/approve
 * @desc    Approve a pending order
 * @access  Private (admin only)
 */
router.patch(
	'/:id/approve',
	checkRole(['admin']),
	validateObjectId('id'),
	validateRequest(orderApprovalValidator),
	approveOrder
);

/**
 * @route   PATCH /api/orders/:id/reject
 * @desc    Reject a pending order
 * @access  Private (admin only)
 */
router.patch(
	'/:id/reject',
	checkRole(['admin']),
	validateObjectId('id'),
	validateRequest(orderRejectionValidator),
	rejectOrder
);

/**
 * @route   PATCH /api/orders/:id/assign-route
 * @desc    Assign order to route and rider
 * @access  Private (admin only)
 */
router.patch(
	'/:id/assign-route',
	checkRole(['admin']),
	validateObjectId('id'),
	validateRequest(orderRouteAssignmentValidator),
	assignOrderToRoute
);

/**
 * @route   DELETE /api/orders/:id/products/:productId
 * @desc    Remove a product from an order
 * @access  Private (admin only)
 */
router.delete(
	'/:id/products/:productId',
	checkRole(['admin']),
	validateObjectId('id'),
	validateObjectId('productId'),
	removeProductFromOrder
);

/**
 * @route   PATCH /api/orders/:id/cancel
 * @desc    Cancel an order
 * @access  Private (admin, shop with restrictions)
 */
router.patch(
	'/:id/cancel',
	validateObjectId('id'),
	validateRequest(orderCancellationValidator),
	cancelOrder
);

module.exports = router;
