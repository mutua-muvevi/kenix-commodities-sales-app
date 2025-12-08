/**
 * Get Loan Details Controller
 *
 * Endpoint: GET /api/loans/:loanId
 * Accessible by: shop (own), admin
 *
 * Returns detailed information about a specific loan
 */

const KenixDukaLoan = require('../../models/kenixDukaLoans');
const ErrorResponse = require('../../utils/error-response');
const logger = require('../../utils/logger');

/**
 * Get detailed loan information
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getLoanDetails = async (req, res, next) => {
	try {
		const { loanId } = req.params;
		const requestingUser = req.user;

		// Get loan
		const loan = await KenixDukaLoan.findById(loanId)
			.populate('borrower', 'firstName lastName businessName phoneNumber email')
			.populate('approvedBy', 'firstName lastName role')
			.populate('payments.recordedBy', 'firstName lastName role')
			.populate('payments.mpesaTransaction', 'transactionCode amount status');

		if (!loan) {
			return res.status(404).json({
				success: false,
				message: 'Loan not found',
				errors: [`No loan found with ID: ${loanId}`],
			});
		}

		// Authorization check
		if (requestingUser.role !== 'admin' && requestingUser._id.toString() !== loan.borrower._id.toString()) {
			return res.status(403).json({
				success: false,
				message: 'Access denied. You can only view your own loans.',
				errors: ['Unauthorized access'],
			});
		}

		// Calculate next payment due
		const nextPayment = loan.repaymentSchedule.find(installment => !installment.isPaid);

		// Calculate days overdue
		let daysOverdue = 0;
		if (nextPayment) {
			const today = new Date();
			const dueDate = new Date(nextPayment.dueDate);
			if (today > dueDate) {
				daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
			}
		}

		// Calculate payment progress
		const paidInstallments = loan.repaymentSchedule.filter(i => i.isPaid).length;
		const totalInstallments = loan.repaymentSchedule.length;
		const paymentProgress = (paidInstallments / totalInstallments) * 100;

		logger.info(`Loan details retrieved: ${loan.loanReference}`);

		return res.status(200).json({
			success: true,
			message: 'Loan details retrieved successfully',
			data: {
				loan: {
					id: loan._id,
					loanReference: loan.loanReference,
					borrower: loan.borrower,
					loanDetails: {
						loanAmount: loan.loanAmount,
						interestRate: loan.interestRate,
						interestAmount: loan.interestAmount,
						totalRepayableAmount: loan.totalRepayableAmount,
						loanPeriod: loan.loanPeriod,
						monthlyPayment: loan.totalRepayableAmount / loan.loanPeriod,
					},
					balances: {
						outstandingBalance: loan.outstandingBalance,
						totalPaid: loan.totalPaid,
						percentagePaid: ((loan.totalPaid / loan.totalRepayableAmount) * 100).toFixed(2),
					},
					status: {
						current: loan.status,
						isDefaulted: loan.isDefaulted,
						daysOverdue,
					},
					dates: {
						applicationDate: loan.applicationDate,
						approvedAt: loan.approvedAt,
						disbursedAt: loan.disbursedAt,
					},
					purpose: loan.purpose,
					approvedBy: loan.approvedBy,
					rejectionReason: loan.rejectionReason,
					disbursement: {
						method: loan.disbursementMethod,
						reference: loan.disbursementReference,
					},
					repaymentSchedule: loan.repaymentSchedule.map(installment => ({
						installmentNumber: installment.installmentNumber,
						dueDate: installment.dueDate,
						amount: installment.amount,
						isPaid: installment.isPaid,
						amountPaid: installment.amountPaid,
						paidAt: installment.paidAt,
						remainingAmount: installment.amount - installment.amountPaid,
					})),
					paymentProgress: {
						paidInstallments,
						totalInstallments,
						percentageComplete: parseFloat(paymentProgress.toFixed(2)),
					},
					nextPayment: nextPayment ? {
						installmentNumber: nextPayment.installmentNumber,
						dueDate: nextPayment.dueDate,
						amount: nextPayment.amount,
						isOverdue: daysOverdue > 0,
						daysOverdue,
					} : null,
					payments: loan.payments.map(payment => ({
						amount: payment.amount,
						paymentDate: payment.paymentDate,
						paymentMethod: payment.paymentMethod,
						mpesaTransaction: payment.mpesaTransaction,
						receiptNumber: payment.receiptNumber,
						recordedBy: payment.recordedBy,
					})),
					createdAt: loan.createdAt,
					updatedAt: loan.updatedAt,
				},
			},
		});
	} catch (error) {
		logger.error('Get Loan Details Error:', error);
		return next(new ErrorResponse('Failed to retrieve loan details', 500));
	}
};

module.exports = getLoanDetails;
