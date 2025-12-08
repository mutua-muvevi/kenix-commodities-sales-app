const { initiateStkPush } = require('../../services/mpesa/stkPush');
const MpesaTransaction = require('../../models/mpesaTransactions');
const User = require('../../models/user');
const Order = require('../../models/orders');

const initiateMpesaPayment = async (req, res) => {
	try {
		const { phoneNumber, amount, orderId, deliveryId, purpose } = req.body;
		const userId = req.user._id;

		// Verify user exists
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'User not found',
				errors: ['Authenticated user does not exist'],
			});
		}

		// Verify order if provided
		let order = null;
		if (orderId) {
			order = await Order.findById(orderId);
			if (!order) {
				return res.status(404).json({
					success: false,
					message: 'Order not found',
					errors: ['The specified order does not exist'],
				});
			}
		}

		// Create transaction record
		const transactionRef = `MPESA-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

		const transaction = new MpesaTransaction({
			transactionRef,
			transactionType: 'stk_push',
			purpose: purpose || 'order_payment',
			relatedOrder: orderId || null,
			relatedDelivery: deliveryId || null,
			payer: {
				userId,
				phoneNumber,
				name: user.name,
			},
			amount,
			accountReference: orderId ? orderId.toString().substr(-10) : transactionRef.substr(-10),
			transactionDesc: orderId ? `Payment for order ${orderId}` : 'Payment',
			initiatedBy: userId,
		});

		await transaction.save();

		// Initiate STK Push
		const stkResult = await initiateStkPush({
			phoneNumber,
			amount,
			accountReference: transaction.accountReference,
			transactionDesc: transaction.transactionDesc,
		});

		if (!stkResult.success) {
			transaction.status = 'failed';
			transaction.failureReason = stkResult.error;
			await transaction.save();

			return res.status(400).json({
				success: false,
				message: 'Failed to initiate M-Pesa payment',
				errors: [stkResult.error],
			});
		}

		// Update transaction with M-Pesa response
		transaction.checkoutRequestID = stkResult.checkoutRequestID;
		transaction.merchantRequestID = stkResult.merchantRequestID;
		transaction.status = 'pending';
		await transaction.save();

		return res.status(200).json({
			success: true,
			message: 'STK Push sent successfully. Please enter your M-Pesa PIN on your phone.',
			data: {
				transactionRef: transaction.transactionRef,
				checkoutRequestID: stkResult.checkoutRequestID,
				amount: transaction.amount,
				phoneNumber: transaction.payer.phoneNumber,
			},
		});
	} catch (error) {
		console.error('Initiate M-Pesa Payment Error:', error);
		return res.status(500).json({
			success: false,
			message: 'Internal server error while initiating payment',
			errors: [error.message],
		});
	}
};

module.exports = { initiateMpesaPayment };
