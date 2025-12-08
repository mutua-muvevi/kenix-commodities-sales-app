/**
 * Approve Loan Controller
 *
 * Endpoint: PATCH /api/loans/:loanId/approve
 * Accessible by: admin only
 *
 * Approves a pending loan application
 */

const KenixDukaLoan = require('../../models/kenixDukaLoans');
const User = require('../../models/user');
const ErrorResponse = require('../../utils/error-response');
const logger = require('../../utils/logger');
const { sendLoanApproval } = require('../../services/sms/africasTalking');

/**
 * Approve a loan application
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const approveLoan = async (req, res, next) => {
	try {
		const { loanId } = req.params;
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
				message: 'Only pending loans can be approved',
				errors: [`Current loan status: ${loan.status}`],
			});
		}

		// Update loan status
		loan.status = 'approved';
		loan.approvedBy = adminUser._id;
		loan.approvedAt = new Date();
		loan.disbursedAt = new Date(); // Assuming immediate disbursement
		loan.disbursementMethod = 'mpesa'; // Default method

		await loan.save();

		// Send SMS notification to borrower
		await sendLoanApproval(
			loan.borrower.phoneNumber,
			loan.loanAmount,
			loan.loanReference
		);

		logger.info(`Loan approved: ${loan.loanReference} by admin ${adminUser._id}`);

		return res.status(200).json({
			success: true,
			message: 'Loan approved successfully',
			data: {
				loan: {
					id: loan._id,
					loanReference: loan.loanReference,
					borrower: loan.borrower,
					loanAmount: loan.loanAmount,
					status: loan.status,
					approvedBy: {
						id: adminUser._id,
						name: `${adminUser.firstName} ${adminUser.lastName}`,
					},
					approvedAt: loan.approvedAt,
					disbursedAt: loan.disbursedAt,
				},
			},
		});
	} catch (error) {
		logger.error('Approve Loan Error:', error);
		return next(new ErrorResponse('Failed to approve loan', 500));
	}
};

module.exports = approveLoan;
