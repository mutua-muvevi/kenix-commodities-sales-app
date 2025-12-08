/**
 * Get Loans Controller
 *
 * Endpoint: GET /api/loans
 * Accessible by: shop (own loans), admin (all)
 * Query params: ?shopId=&status=
 *
 * Returns list of loans with filtering
 */

const KenixDukaLoan = require('../../models/kenixDukaLoans');
const ErrorResponse = require('../../utils/error-response');
const logger = require('../../utils/logger');

/**
 * Get loans with filtering
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getLoans = async (req, res, next) => {
	try {
		const requestingUser = req.user;
		const { shopId, status } = req.query;

		// Build query filter
		const filter = {};

		// Authorization: shops can only see own loans, admin can see all
		if (requestingUser.role === 'shop') {
			filter.borrower = requestingUser._id;
		} else if (shopId) {
			filter.borrower = shopId;
		}

		// Filter by status
		if (status) {
			filter.status = status;
		}

		// Get loans
		const loans = await KenixDukaLoan.find(filter)
			.populate('borrower', 'firstName lastName businessName phoneNumber email')
			.populate('approvedBy', 'firstName lastName role')
			.sort({ createdAt: -1 });

		// Format response
		const formattedLoans = loans.map(loan => ({
			id: loan._id,
			loanReference: loan.loanReference,
			borrower: loan.borrower,
			loanAmount: loan.loanAmount,
			interestRate: loan.interestRate,
			interestAmount: loan.interestAmount,
			totalRepayableAmount: loan.totalRepayableAmount,
			outstandingBalance: loan.outstandingBalance,
			totalPaid: loan.totalPaid,
			loanPeriod: loan.loanPeriod,
			status: loan.status,
			purpose: loan.purpose,
			applicationDate: loan.applicationDate,
			approvedBy: loan.approvedBy,
			approvedAt: loan.approvedAt,
			disbursedAt: loan.disbursedAt,
			paymentsCount: loan.payments?.length || 0,
			isDefaulted: loan.isDefaulted,
			daysOverdue: loan.daysOverdue,
			createdAt: loan.createdAt,
		}));

		logger.info(`Loans retrieved: ${formattedLoans.length} loans`);

		return res.status(200).json({
			success: true,
			message: 'Loans retrieved successfully',
			data: {
				loans: formattedLoans,
				total: formattedLoans.length,
				filters: {
					shopId: shopId || (requestingUser.role === 'shop' ? requestingUser._id : null),
					status: status || 'all',
				},
			},
		});
	} catch (error) {
		logger.error('Get Loans Error:', error);
		return next(new ErrorResponse('Failed to retrieve loans', 500));
	}
};

module.exports = getLoans;
