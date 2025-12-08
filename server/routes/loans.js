/**
 * Loans API Routes
 *
 * All routes for Kenix Duka Loans including:
 * - Loan applications
 * - Eligibility checking
 * - Loan approval/rejection workflow
 * - Loan payments
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
	loanApplicationValidator,
	loanRejectionValidator,
	loanPaymentValidator,
} = require('../validators/loanValidators');

// Controllers
const applyForLoan = require('../controllers/loans/applyForLoan');
const getLoanEligibility = require('../controllers/loans/getLoanEligibility');
const getLoans = require('../controllers/loans/getLoans');
const getLoanDetails = require('../controllers/loans/getLoanDetails');
const approveLoan = require('../controllers/loans/approveLoan');
const rejectLoan = require('../controllers/loans/rejectLoan');
const makePayment = require('../controllers/loans/makePayment');

// Apply authentication and getMe to all routes
router.use(authenticationMiddleware);
router.use(getMe);

/**
 * @route   POST /api/loans/apply
 * @desc    Apply for a new loan
 * @access  Private (shop only)
 */
router.post(
	'/apply',
	checkRole(['shop']),
	validateRequest(loanApplicationValidator),
	applyForLoan
);

/**
 * @route   GET /api/loans/eligibility/:shopId
 * @desc    Get loan eligibility for a shop
 * @access  Private (shop - own, admin - any)
 */
router.get(
	'/eligibility/:shopId',
	validateObjectId('shopId'),
	getLoanEligibility
);

/**
 * @route   GET /api/loans
 * @desc    Get loans (filtered by role)
 * @access  Private (shop - own loans, admin - all loans)
 * @query   shopId, status
 */
router.get('/', getLoans);

/**
 * @route   GET /api/loans/:loanId
 * @desc    Get detailed loan information
 * @access  Private (shop - own loan, admin - any loan)
 */
router.get(
	'/:loanId',
	validateObjectId('loanId'),
	getLoanDetails
);

/**
 * @route   PATCH /api/loans/:loanId/approve
 * @desc    Approve a pending loan
 * @access  Private (admin only)
 */
router.patch(
	'/:loanId/approve',
	checkRole(['admin']),
	validateObjectId('loanId'),
	approveLoan
);

/**
 * @route   PATCH /api/loans/:loanId/reject
 * @desc    Reject a pending loan
 * @access  Private (admin only)
 */
router.patch(
	'/:loanId/reject',
	checkRole(['admin']),
	validateObjectId('loanId'),
	validateRequest(loanRejectionValidator),
	rejectLoan
);

/**
 * @route   POST /api/loans/:loanId/payment
 * @desc    Make a payment on a loan
 * @access  Private (shop - own loan, admin - any loan)
 */
router.post(
	'/:loanId/payment',
	validateObjectId('loanId'),
	validateRequest(loanPaymentValidator),
	makePayment
);

module.exports = router;
