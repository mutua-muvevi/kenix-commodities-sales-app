/**
 * Make Loan Payment Controller
 *
 * Endpoint: POST /api/loans/:loanId/payment
 * Accessible by: shop (own loan)
 *
 * Records a payment for a loan with ACID compliance
 */

const mongoose = require('mongoose');
const KenixDukaLoan = require('../../models/kenixDukaLoans');
const MpesaTransaction = require('../../models/mpesaTransactions');
const ErrorResponse = require('../../utils/error-response');
const logger = require('../../utils/logger');

/**
 * Make a loan payment
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const makePayment = async (req, res, next) => {
	// Start MongoDB session for transaction (ACID compliance)
	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		const { loanId } = req.params;
		const { amount, paymentMethod, mpesaTransactionId } = req.body;
		const user = req.user;

		// Get loan
		const loan = await KenixDukaLoan.findById(loanId).session(session);

		if (!loan) {
			await session.abortTransaction();
			session.endSession();
			return res.status(404).json({
				success: false,
				message: 'Loan not found',
				errors: [`No loan found with ID: ${loanId}`],
			});
		}

		// Authorization check
		if (user.role !== 'admin' && user._id.toString() !== loan.borrower.toString()) {
			await session.abortTransaction();
			session.endSession();
			return res.status(403).json({
				success: false,
				message: 'Access denied. You can only make payments on your own loans.',
				errors: ['Unauthorized access'],
			});
		}

		// Check if loan is in approved/active status
		if (!['approved', 'disbursed', 'active'].includes(loan.status)) {
			await session.abortTransaction();
			session.endSession();
			return res.status(400).json({
				success: false,
				message: 'Cannot make payment on this loan',
				errors: [`Loan status: ${loan.status}`],
			});
		}

		// Verify M-Pesa transaction if applicable
		if (paymentMethod === 'mpesa') {
			if (!mpesaTransactionId) {
				await session.abortTransaction();
				session.endSession();
				return res.status(400).json({
					success: false,
					message: 'M-Pesa transaction ID is required for M-Pesa payments',
					errors: ['Missing M-Pesa transaction ID'],
				});
			}

			// Verify M-Pesa transaction exists and is successful
			const mpesaTransaction = await MpesaTransaction.findById(mpesaTransactionId).session(session);
			if (!mpesaTransaction || mpesaTransaction.resultCode !== '0') {
				await session.abortTransaction();
				session.endSession();
				return res.status(400).json({
					success: false,
					message: 'Invalid or unsuccessful M-Pesa transaction',
					errors: ['M-Pesa transaction not found or failed'],
				});
			}
		}

		// Validate amount
		if (amount <= 0) {
			await session.abortTransaction();
			session.endSession();
			return res.status(400).json({
				success: false,
				message: 'Payment amount must be greater than zero',
				errors: ['Invalid payment amount'],
			});
		}

		if (amount > loan.outstandingBalance) {
			await session.abortTransaction();
			session.endSession();
			return res.status(400).json({
				success: false,
				message: 'Payment amount exceeds outstanding balance',
				errors: [`Outstanding balance: KES ${loan.outstandingBalance}`],
			});
		}

		// Record payment using model method
		await loan.recordPayment(amount, paymentMethod, mpesaTransactionId, user._id);

		// Update loan status if fully paid
		if (loan.outstandingBalance <= 0) {
			loan.status = 'completed';
		} else if (loan.status === 'approved' || loan.status === 'disbursed') {
			loan.status = 'active';
		}

		await loan.save({ session });

		// Commit transaction
		await session.commitTransaction();
		session.endSession();

		// Populate for response
		await loan.populate('borrower', 'firstName lastName businessName phoneNumber');

		logger.info(`Loan payment recorded: ${loan.loanReference}, Amount: ${amount}`);

		return res.status(200).json({
			success: true,
			message: loan.status === 'completed' ? 'Loan fully paid!' : 'Payment recorded successfully',
			data: {
				payment: {
					amount,
					paymentMethod,
					paymentDate: new Date(),
					mpesaTransactionId,
				},
				loan: {
					id: loan._id,
					loanReference: loan.loanReference,
					borrower: loan.borrower,
					previousBalance: loan.outstandingBalance + amount,
					newBalance: loan.outstandingBalance,
					totalPaid: loan.totalPaid,
					status: loan.status,
					isFullyPaid: loan.status === 'completed',
				},
			},
		});
	} catch (error) {
		// Rollback transaction on error
		await session.abortTransaction();
		session.endSession();

		logger.error('Make Loan Payment Error:', error);
		return next(new ErrorResponse('Failed to record payment', 500));
	}
};

module.exports = makePayment;
