/**
 * Reject Loan Controller
 *
 * Endpoint: PATCH /api/loans/:loanId/reject
 * Accessible by: admin only
 *
 * Rejects a pending loan application
 */

const KenixDukaLoan = require('../../models/kenixDukaLoans');
const ErrorResponse = require('../../utils/error-response');
const logger = require('../../utils/logger');
const { sendLoanRejection } = require('../../services/sms/africasTalking');

/**
 * Reject a loan application
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const rejectLoan = async (req, res, next) => {
	try {
		const { loanId } = req.params;
		const { reason } = req.body;
		const adminUser = req.user;

		// Get loan
		const loan = await KenixDukaLoan.findById(loanId).populate('borrower', 'firstName lastName phoneNumber businessName');

		if (!loan) {
			return res.status(404).json({
				success: false,
				message: 'Loan not found',
				errors: [`No loan found with ID: ${loanId}`],
			});
		}

		// Check if loan is in pending status
		if (loan.status !== 'pending') {
			return res.status(400).json({
				success: false,
				message: 'Only pending loans can be rejected',
				errors: [`Current loan status: ${loan.status}`],
			});
		}

		// Update loan status
		loan.status = 'rejected';
		loan.rejectionReason = reason;
		loan.approvedBy = adminUser._id; // Record who rejected it
		loan.approvedAt = new Date();

		await loan.save();

		// Send SMS notification to borrower
		await sendLoanRejection(
			loan.borrower.phoneNumber,
			loan.loanReference
		);

		logger.info(`Loan rejected: ${loan.loanReference} by admin ${adminUser._id}. Reason: ${reason}`);

		return res.status(200).json({
			success: true,
			message: 'Loan rejected successfully',
			data: {
				loan: {
					id: loan._id,
					loanReference: loan.loanReference,
					borrower: loan.borrower,
					loanAmount: loan.loanAmount,
					status: loan.status,
					rejectionReason: loan.rejectionReason,
					rejectedBy: {
						id: adminUser._id,
						name: `${adminUser.firstName} ${adminUser.lastName}`,
					},
					rejectedAt: loan.approvedAt,
				},
			},
		});
	} catch (error) {
		logger.error('Reject Loan Error:', error);
		return next(new ErrorResponse('Failed to reject loan', 500));
	}
};

module.exports = rejectLoan;
