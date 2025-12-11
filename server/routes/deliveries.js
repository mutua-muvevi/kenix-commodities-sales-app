/**
 * Deliveries API Routes
 *
 * All routes for delivery management including:
 * - Route start and completion
 * - Shop arrival and delivery completion
 * - Payment collection
 * - Sequential delivery enforcement
 */

const express = require('express');
const router = express.Router();

// Middleware
const { authenticationMiddleware } = require('../middleware/auth/authentication');
const { getMe } = require('../middleware/user/me');
const { checkRole } = require('../middleware/rbac/checkRole');
const { validateRequest, validateObjectId } = require('../middleware/validation/validateRequest');
const { enforceSequentialDelivery } = require('../middleware/delivery/sequentialEnforcement');

// Validators
const {
	deliveryArrivalValidator,
	deliveryCompletionValidator,
	deliveryPaymentValidator,
} = require('../validators/deliveryValidators');

// Controllers
const startRoute = require('../controllers/deliveries/startRoute');
const arriveAtShop = require('../controllers/deliveries/arriveAtShop');
const completeDelivery = require('../controllers/deliveries/completeDelivery');
const recordPayment = require('../controllers/deliveries/recordPayment');
const getNextShop = require('../controllers/deliveries/getNextShop');
const getDeliveryStatus = require('../controllers/deliveries/getDeliveryStatus');
const getDeliveryHistory = require('../controllers/deliveries/getDeliveryHistory');
const requestUnlock = require('../controllers/deliveries/requestUnlock');
const adminUnlockDelivery = require('../controllers/deliveries/adminUnlockDelivery');
const requestSkip = require('../controllers/deliveries/requestSkip');
const resolveSkipRequest = require('../controllers/deliveries/resolveSkipRequest');

// Apply authentication and getMe to all routes
router.use(authenticationMiddleware);
router.use(getMe);

/**
 * @route   GET /api/deliveries/rider/:riderId/history
 * @desc    Get delivery history for a rider
 * @access  Private (rider - own history, admin - any)
 */
router.get(
	'/rider/:riderId/history',
	checkRole(['rider', 'admin']),
	validateObjectId('riderId'),
	getDeliveryHistory
);

/**
 * @route   POST /api/deliveries/:routeId/start
 * @desc    Start a delivery route
 * @access  Private (rider only)
 */
router.post(
	'/:routeId/start',
	checkRole(['rider']),
	validateObjectId('routeId'),
	startRoute
);

/**
 * @route   PATCH /api/deliveries/:deliveryId/arrive
 * @desc    Mark arrival at shop (sequential enforcement)
 * @access  Private (rider only)
 */
router.patch(
	'/:deliveryId/arrive',
	checkRole(['rider']),
	validateObjectId('deliveryId'),
	enforceSequentialDelivery, // CRITICAL: Enforces sequential delivery
	validateRequest(deliveryArrivalValidator),
	arriveAtShop
);

/**
 * @route   POST /api/deliveries/:deliveryId/payment
 * @desc    Record payment collection
 * @access  Private (rider only)
 */
router.post(
	'/:deliveryId/payment',
	checkRole(['rider']),
	validateObjectId('deliveryId'),
	validateRequest(deliveryPaymentValidator),
	recordPayment
);

/**
 * @route   PATCH /api/deliveries/:deliveryId/complete
 * @desc    Complete delivery (sequential enforcement)
 * @access  Private (rider only)
 */
router.patch(
	'/:deliveryId/complete',
	checkRole(['rider']),
	validateObjectId('deliveryId'),
	enforceSequentialDelivery, // CRITICAL: Enforces sequential delivery
	validateRequest(deliveryCompletionValidator),
	completeDelivery
);

/**
 * @route   GET /api/deliveries/:deliveryId/next
 * @desc    Get next shop in sequence (sequential enforcement)
 * @access  Private (rider only)
 */
router.get(
	'/:deliveryId/next',
	checkRole(['rider']),
	validateObjectId('deliveryId'),
	enforceSequentialDelivery, // CRITICAL: Enforces sequential delivery
	getNextShop
);

/**
 * @route   GET /api/deliveries/:deliveryId
 * @desc    Get delivery status
 * @access  Private (rider, shop, admin)
 */
router.get(
	'/:deliveryId',
	validateObjectId('deliveryId'),
	getDeliveryStatus
);

/**
 * @route   POST /api/deliveries/:deliveryId/request-unlock
 * @desc    Request admin to unlock a delivery (shop unavailable)
 * @access  Private (rider only)
 */
router.post(
	'/:deliveryId/request-unlock',
	checkRole(['rider']),
	validateObjectId('deliveryId'),
	requestUnlock
);

/**
 * @route   POST /api/deliveries/:deliveryId/admin-unlock
 * @desc    Admin override to unlock a delivery
 * @access  Private (admin only)
 */
router.post(
	'/:deliveryId/admin-unlock',
	checkRole(['admin']),
	validateObjectId('deliveryId'),
	adminUnlockDelivery
);

module.exports = router;
