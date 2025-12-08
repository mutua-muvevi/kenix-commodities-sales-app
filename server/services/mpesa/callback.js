/**
 * M-Pesa Callback Handler
 *
 * Processes M-Pesa payment callbacks
 */

const MpesaTransaction = require('../../models/mpesaTransactions');
const Order = require('../../models/orders');
const Delivery = require('../../models/deliveries');
const RiderWallet = require('../../models/riderWallet');
const { emitToUser } = require('../../websocket/index');
const { addRetryJob } = require('../queues/mpesaRetryQueue');

/**
 * Process M-Pesa STK Push callback
 *
 * @param {Object} callbackData - Callback payload from M-Pesa
 * @returns {Promise<Object>} Processing result
 */
const processMpesaCallback = async (callbackData) => {
	try {
		console.log('Processing M-Pesa callback:', JSON.stringify(callbackData, null, 2));

		// Extract callback data
		const stkCallback = callbackData.Body?.stkCallback;
		if (!stkCallback) {
			throw new Error('Invalid callback format: missing stkCallback');
		}

		const checkoutRequestID = stkCallback.CheckoutRequestID;
		const merchantRequestID = stkCallback.MerchantRequestID;
		const resultCode = stkCallback.ResultCode;
		const resultDesc = stkCallback.ResultDesc;

		// Find the transaction by checkoutRequestID
		const transaction = await MpesaTransaction.findOne({ checkoutRequestID });

		if (!transaction) {
			console.error(`Transaction not found for CheckoutRequestID: ${checkoutRequestID}`);
			return {
				success: false,
				error: 'Transaction not found',
			};
		}

		// Process the callback using the model method
		await transaction.processCallback(callbackData);

		// If payment was successful, update related entities
		if (resultCode === 0) {
			await handleSuccessfulPayment(transaction);
		} else {
			await handleFailedPayment(transaction, resultDesc);
		}

		return {
			success: true,
			transaction,
		};
	} catch (error) {
		console.error('Callback Processing Error:', error);
		return {
			success: false,
			error: error.message,
		};
	}
};

/**
 * Handle successful payment
 *
 * @param {Object} transaction - MpesaTransaction document
 */
const handleSuccessfulPayment = async (transaction) => {
	try {
		// Update related order if exists
		if (transaction.relatedOrder) {
			const order = await Order.findById(transaction.relatedOrder);
			if (order) {
				order.paymentStatus = 'confirmed';
				order.paidAt = new Date();
				order.mpesaTransaction = transaction._id;
				await order.save();
				console.log(`Order ${order.orderId} payment confirmed`);
			}
		}

		// Update related delivery if exists
		if (transaction.relatedDelivery) {
			const delivery = await Delivery.findById(transaction.relatedDelivery);
			if (delivery) {
				delivery.paymentInfo.status = 'collected';
				delivery.paymentInfo.mpesaTransaction = transaction._id;
				delivery.paymentInfo.collectedAt = new Date();
				delivery.paymentInfo.amountCollected = transaction.amount;
				delivery.paymentInfo.receiptNumber = transaction.mpesaReceiptNumber;
				await delivery.save();

				// Update rider wallet
				if (delivery.rider) {
					const wallet = await RiderWallet.getOrCreateWallet(delivery.rider);
					await wallet.recordCollection(
						delivery._id,
						transaction.amount,
						transaction._id,
						delivery.rider
					);
					console.log(`Rider wallet updated for delivery ${delivery.deliveryCode}`);
				}

				console.log(`Delivery ${delivery.deliveryCode} payment recorded`);
			}
		}

		// WebSocket: Notify user of successful payment
		if (transaction.payer?.userId) {
			emitToUser(transaction.payer.userId.toString(), 'payment:confirmed', {
				transactionRef: transaction.transactionRef,
				mpesaRef: transaction.mpesaReceiptNumber,
				amount: transaction.amount,
				orderId: transaction.relatedOrder?.toString(),
				message: 'Payment confirmed successfully'
			});
		}
	} catch (error) {
		console.error('Error handling successful payment:', error);
		// Don't throw - we've already marked the transaction as successful
	}
};

/**
 * Handle failed payment
 *
 * @param {Object} transaction - MpesaTransaction document
 * @param {string} reason - Failure reason
 */
const handleFailedPayment = async (transaction, reason) => {
	try {
		// Update related order if exists
		if (transaction.relatedOrder) {
			const order = await Order.findById(transaction.relatedOrder);
			if (order && order.paymentMethod === 'mpesa') {
				order.paymentStatus = 'failed';
				await order.save();
				console.log(`Order ${order.orderId} payment failed: ${reason}`);
			}
		}

		// Update related delivery if exists
		if (transaction.relatedDelivery) {
			const delivery = await Delivery.findById(transaction.relatedDelivery);
			if (delivery) {
				delivery.paymentInfo.status = 'failed';
				await delivery.save();
				console.log(`Delivery ${delivery.deliveryCode} payment failed: ${reason}`);
			}
		}

		// WebSocket: Notify user of failed payment
		if (transaction.payer?.userId) {
			emitToUser(transaction.payer.userId.toString(), 'payment:failed', {
				transactionRef: transaction.transactionRef,
				reason: reason || 'Payment failed',
				orderId: transaction.relatedOrder?.toString(),
				message: 'Payment failed. Please try again.'
			});
		}

		// Add to retry queue if retries not exhausted
		const maxRetries = transaction.maxRetries || 3;
		const currentRetries = transaction.retryCount || 0;

		if (currentRetries < maxRetries) {
			try {
				await addRetryJob(transaction._id.toString());
				console.log(`Added transaction ${transaction.transactionRef} to retry queue`);
			} catch (queueError) {
				console.error('Failed to add retry job:', queueError);
			}
		}
	} catch (error) {
		console.error('Error handling failed payment:', error);
		// Don't throw - we've already marked the transaction as failed
	}
};

module.exports = {
	processMpesaCallback,
	handleSuccessfulPayment,
	handleFailedPayment,
};
