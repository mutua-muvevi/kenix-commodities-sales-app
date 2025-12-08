/**
 * Routes API Routes
 *
 * All routes for delivery route management including:
 * - Route creation and configuration
 * - Rider assignment
 * - Shop sequence management
 * - Route optimization
 * - Admin overrides
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
	routeCreateValidator,
	routeRiderAssignmentValidator,
	routeShopsUpdateValidator,
	routeOverrideValidator,
} = require('../validators/routeValidators');

// Controllers
const createRoute = require('../controllers/routes/createRoute');
const listRoutes = require('../controllers/routes/listRoutes');
const getRoute = require('../controllers/routes/getRoute');
const assignRider = require('../controllers/routes/assignRider');
const updateShopsSequence = require('../controllers/routes/updateShopsSequence');
const overrideSequence = require('../controllers/routes/overrideSequence');
const getActiveRoute = require('../controllers/routes/getActiveRoute');
const optimizeRoute = require('../controllers/routes/optimizeRoute');

// Apply authentication and getMe to all routes
router.use(authenticationMiddleware);
router.use(getMe);

/**
 * @route   POST /api/routes
 * @desc    Create a new route
 * @access  Private (admin only)
 */
router.post(
	'/',
	checkRole(['admin']),
	validateRequest(routeCreateValidator),
	createRoute
);

/**
 * @route   GET /api/routes
 * @desc    List all routes (filtered by role)
 * @access  Private (admin, rider)
 */
router.get('/', checkRole(['admin', 'rider']), listRoutes);

/**
 * @route   GET /api/routes/rider/:riderId/active
 * @desc    Get rider's active route
 * @access  Private (rider - own route, admin)
 */
router.get(
	'/rider/:riderId/active',
	validateObjectId('riderId'),
	getActiveRoute
);

/**
 * @route   GET /api/routes/:id
 * @desc    Get single route details
 * @access  Private (admin, assigned rider)
 */
router.get('/:id', validateObjectId('id'), getRoute);

/**
 * @route   PATCH /api/routes/:id/assign-rider
 * @desc    Assign rider to route
 * @access  Private (admin only)
 */
router.patch(
	'/:id/assign-rider',
	checkRole(['admin']),
	validateObjectId('id'),
	validateRequest(routeRiderAssignmentValidator),
	assignRider
);

/**
 * @route   PATCH /api/routes/:id/shops
 * @desc    Update shop sequence on route
 * @access  Private (admin only)
 */
router.patch(
	'/:id/shops',
	checkRole(['admin']),
	validateObjectId('id'),
	validateRequest(routeShopsUpdateValidator),
	updateShopsSequence
);

/**
 * @route   PATCH /api/routes/:id/override-sequence
 * @desc    Override sequential delivery (skip closed shop)
 * @access  Private (admin only)
 */
router.patch(
	'/:id/override-sequence',
	checkRole(['admin']),
	validateObjectId('id'),
	validateRequest(routeOverrideValidator),
	overrideSequence
);

/**
 * @route   POST /api/routes/:id/optimize
 * @desc    Optimize route shop sequence
 * @access  Private (admin only)
 */
router.post(
	'/:id/optimize',
	checkRole(['admin']),
	validateObjectId('id'),
	optimizeRoute
);

module.exports = router;
