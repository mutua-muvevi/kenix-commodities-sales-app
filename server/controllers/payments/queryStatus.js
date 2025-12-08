const MpesaTransaction = require('../../models/mpesaTransactions');
const { queryStkPushStatus } = require('../../services/mpesa/stkPush');

const queryPaymentStatus = async (req, res) => {
	try {
		const { transactionRef } = req.params;

		// Find transaction
		const transaction = await MpesaTransaction.findOne({ transactionRef });

		if (!transaction) {
			return res.status(404).json({
				success: false,
				message: 'Transaction not found',
				errors: ['No transaction exists with the specified reference'],
			});
		}

		// If transaction is already completed or failed, return stored status
		if (transaction.status === 'success' || transaction.status === 'failed') {
			return res.status(200).json({
				success: true,
				message: 'Transaction status retrieved',
				data: {
					transactionRef: transaction.transactionRef,
					status: transaction.status,
					amount: transaction.amount,
					mpesaReceiptNumber: transaction.mpesaReceiptNumber,
					completedAt: transaction.completedAt,
					failedAt: transaction.failedAt,
					failureReason: transaction.failureReason,
				},
			});
		}

		// Query M-Pesa for current status
		if (transaction.checkoutRequestID) {
			const queryResult = await queryStkPushStatus(transaction.checkoutRequestID);

			if (queryResult.success && queryResult.ResultCode === '0') {
				// Payment successful - this shouldn't happen if callback was processed
				// but we update anyway for redundancy
				transaction.status = 'success';
				await transaction.save();
			}
		}

		return res.status(200).json({
			success: true,
			message: 'Transaction status retrieved',
			data: {
				transactionRef: transaction.transactionRef,
				status: transaction.status,
				amount: transaction.amount,
				initiatedAt: transaction.initiatedAt,
			},
		});
	} catch (error) {
		console.error('Query Payment Status Error:', error);
		return res.status(500).json({
			success: false,
			message: 'Internal server error while querying payment status',
			errors: [error.message],
		});
	}
};

module.exports = { queryPaymentStatus };
