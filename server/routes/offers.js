/**
 * Offers API Routes
 *
 * All routes for offer/discount management:
 * - List offers
 * - Get single offer
 * - Create offer (admin)
 * - Update offer (admin)
 * - Delete offer (admin)
 */

const express = require('express');
const router = express.Router();

// Middleware
const { authenticationMiddleware } = require('../middleware/auth/authentication');
const { getMe } = require('../middleware/user/me');
const { checkRole } = require('../middleware/rbac/checkRole');
const { validateRequest } = require('../middleware/validation/validateRequest');

// Validators
const {
	createOfferSchema,
	updateOfferSchema,
	queryOffersSchema,
} = require('../validators/offerValidators');

// Controllers
const createOffer = require('../controllers/offers/createOffer');
const getOffers = require('../controllers/offers/getOffers');
const getOffer = require('../controllers/offers/getOffer');
const updateOffer = require('../controllers/offers/updateOffer');
const deleteOffer = require('../controllers/offers/deleteOffer');

// Apply authentication and getMe to all routes
router.use(authenticationMiddleware);
router.use(getMe);

/**
 * @route   GET /api/offers
 * @desc    Get list of offers
 * @access  Private (authenticated - shops see active only, admins see all)
 * @query   page, limit, status, offerType, applicableTo, search
 */
router.get(
	'/',
	validateRequest(queryOffersSchema, 'query'),
	getOffers
);

/**
 * @route   GET /api/offers/:id
 * @desc    Get a single offer
 * @access  Private (authenticated)
 */
router.get(
	'/:id',
	getOffer
);

/**
 * @route   POST /api/offers
 * @desc    Create a new offer
 * @access  Private (admin only)
 */
router.post(
	'/',
	checkRole(['admin']),
	validateRequest(createOfferSchema),
	createOffer
);

/**
 * @route   PATCH /api/offers/:id
 * @desc    Update an offer
 * @access  Private (admin only)
 */
router.patch(
	'/:id',
	checkRole(['admin']),
	validateRequest(updateOfferSchema),
	updateOffer
);

/**
 * @route   DELETE /api/offers/:id
 * @desc    Disable an offer (soft delete)
 * @access  Private (admin only)
 */
router.delete(
	'/:id',
	checkRole(['admin']),
	deleteOffer
);

module.exports = router;
