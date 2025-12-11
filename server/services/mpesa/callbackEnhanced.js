/**
 * Enhanced M-Pesa Callback Processing Service
 *
 * Processes M-Pesa STK Push callbacks and triggers WebSocket notifications
 * to the rider app for real-time payment confirmation.
 */

const MpesaTransaction = require('../../models/mpesaTransactions');
const Delivery = require('../../models/deliveries');
const Order = require('../../models/orders');
const RiderWallet = require('../../models/riderWallet');
const { FraudFlag } = require('../../models/paymentFraudPrevention');
const { emitToUser, emitToRole } = require('../../websocket/index');

/**
 * Process M-Pesa STK Push Callback
 * @param {Object} callbackData - M-Pesa callback payload
 * @returns {Object} Processing result
 */
const processMpesaCallbackEnhanced = async (callbackData) => {
	try {
		console.log('[M-Pesa Callback] Processing:', JSON.stringify(callbackData, null, 2));

		// Extract callback data
		const stkCallback = callbackData.Body?.stkCallback;

		if (!stkCallback) {
			console.error('[M-Pesa Callback] Invalid callback structure');
			return {
				success: false,
				error: 'Invalid callback structure',
			};
		}

		const { CheckoutRequestID, ResultCode, ResultDesc } = stkCallback;

		// Find transaction by CheckoutRequestID
		const transaction = await MpesaTransaction.findOne({ checkoutRequestID: CheckoutRequestID });

		if (!transaction) {
			console.error('[M-Pesa Callback] Transaction not found:', CheckoutRequestID);
			return {
				success: false,
				error: 'Transaction not found',
			};
		}

		// Process callback using transaction method
		await transaction.processCallback(callbackData);

		// Handle successful payment
		if (ResultCode === 0) {
			console.log('[M-Pesa Callback] Payment successful:', transaction.mpesaReceiptNumber);

			// If this is a delivery payment, update delivery
			if (transaction.relatedDelivery) {
				const delivery = await Delivery.findById(transaction.relatedDelivery)
					.populate('order')
					.populate('shop', 'shopName phoneNumber')
					.populate('rider', 'name phoneNumber');

				if (delivery) {
					// Extract payment amount from callback
					const callbackMetadata = stkCallback.CallbackMetadata?.Item || [];
					const amountData = callbackMetadata.find(item => item.Name === 'Amount');
					const paidAmount = amountData?.Value || transaction.amount;

					// Update delivery payment info
					delivery.paymentInfo.method = 'mpesa';
					delivery.paymentInfo.amountCollected = paidAmount;
					delivery.paymentInfo.status = 'collected';
					delivery.paymentInfo.collectedAt = new Date();
					delivery.paymentInfo.mpesaTransaction = transaction._id;
					delivery.paymentInfo.receiptNumber = transaction.mpesaReceiptNumber;

					// Check for amount mismatch
					const expectedAmount = delivery.paymentInfo.amountToCollect;
					const amountMismatch = Math.abs(paidAmount - expectedAmount) > 0.01;

					if (amountMismatch) {
						// Create fraud flag
						const fraudFlag = new FraudFlag({
							delivery: delivery._id,
							rider: delivery.rider._id,
							shop: delivery.shop._id,
							order: delivery.order._id,
							type: 'amount_mismatch',
							description: `M-Pesa amount mismatch: Expected ${expectedAmount}, Received ${paidAmount}`,
							severity: Math.abs(paidAmount - expectedAmount) > expectedAmount * 0.1 ? 'high' : 'low',
							expectedAmount,
							collectedAmount: paidAmount,
							paymentMethod: 'mpesa',
							flaggedBy: delivery.rider._id,
							riskScore: Math.min(100, Math.abs((paidAmount - expectedAmount) / expectedAmount) * 100),
						});

						await fraudFlag.save();

						delivery.paymentInfo.fraudFlags = delivery.paymentInfo.fraudFlags || [];
						delivery.paymentInfo.fraudFlags.push({
							type: 'amount_mismatch',
							description: `M-Pesa amount mismatch: Expected ${expectedAmount}, Received ${paidAmount}`,
							severity: fraudFlag.severity,
							flaggedAt: new Date(),
							flaggedBy: delivery.rider._id,
							status: 'pending',
						});

						delivery.paymentInfo.status = 'flagged';

						// Notify admin
						emitToRole('admin', 'payment:flagged', {
							deliveryId: delivery._id,
							deliveryCode: delivery.deliveryCode,
							riderId: delivery.rider._id,
							riderName: delivery.rider.name,
							expectedAmount,
							collectedAmount: paidAmount,
							difference: paidAmount - expectedAmount,
							paymentMethod: 'mpesa',
							mpesaReceiptNumber: transaction.mpesaReceiptNumber,
						});
					}

					await delivery.save();

					// Update order
					const order = await Order.findById(delivery.order);
					if (order) {
						order.paymentStatus = amountMismatch ? 'partial' : 'confirmed';
						order.paymentMethod = 'mpesa';
						order.paidAt = new Date();
						order.mpesaTransaction = transaction._id;
						await order.save();
					}

					// Update rider wallet
					const riderWallet = await RiderWallet.getOrCreateWallet(delivery.rider._id);
					await riderWallet.recordCollection(
						delivery._id,
						paidAmount,
						transaction._id,
						delivery.rider._id
					);

					// Emit WebSocket event to RIDER APP for real-time confirmation
					emitToUser(delivery.rider._id.toString(), 'payment:confirmed', {
						deliveryId: delivery._id.toString(),
						status: amountMismatch ? 'flagged' : 'confirmed',
						amount: paidAmount,
						expectedAmount,
						transactionId: transaction._id.toString(),
						mpesaReceiptNumber: transaction.mpesaReceiptNumber,
						timestamp: new Date().toISOString(),
					});

					// Emit to shop
					emitToUser(delivery.shop._id.toString(), 'payment:received', {
						deliveryId: delivery._id,
						amount: paidAmount,
						mpesaReceiptNumber: transaction.mpesaReceiptNumber,
						status: amountMismatch ? 'under_review' : 'confirmed',
					});

					console.log('[M-Pesa Callback] Delivery payment updated and notifications sent');
				}
			}

			// If this is an order payment (shop placing order)
			if (transaction.relatedOrder) {
				const order = await Order.findById(transaction.relatedOrder);
				if (order) {
					order.paymentStatus = 'confirmed';
					order.paymentMethod = 'mpesa';
					order.paidAt = new Date();
					order.mpesaTransaction = transaction._id;
					await order.save();

					// Emit to shop
					emitToUser(order.orderer.toString(), 'payment:confirmed', {
						orderId: order._id,
						amount: transaction.amount,
						mpesaReceiptNumber: transaction.mpesaReceiptNumber,
					});

					console.log('[M-Pesa Callback] Order payment confirmed');
				}
			}

			return {
				success: true,
				transaction: transaction._id,
				mpesaReceiptNumber: transaction.mpesaReceiptNumber,
			};
		} else {
			// Payment failed
			console.error('[M-Pesa Callback] Payment failed:', ResultDesc);

			// If this is a delivery payment, notify rider
			if (transaction.relatedDelivery) {
				const delivery = await Delivery.findById(transaction.relatedDelivery).populate('rider');

				if (delivery) {
					// Emit failure event to rider
					emitToUser(delivery.rider._id.toString(), 'payment:failed', {
						deliveryId: delivery._id.toString(),
						reason: ResultDesc,
						resultCode: ResultCode,
					});

					// Update delivery status
					delivery.paymentInfo.status = 'failed';
					await delivery.save();
				}
			}

			return {
				success: false,
				error: ResultDesc,
				resultCode: ResultCode,
			};
		}
	} catch (error) {
		console.error('[M-Pesa Callback] Processing error:', error);
		return {
			success: false,
			error: error.message,
		};
	}
};

/**
 * Query M-Pesa payment status (for checking pending payments)
 * @param {string} checkoutRequestID - Checkout Request ID
 * @returns {Object} Payment status
 */
const queryMpesaStatus = async (checkoutRequestID) => {
	try {
		const transaction = await MpesaTransaction.findOne({ checkoutRequestID });

		if (!transaction) {
			return {
				success: false,
				error: 'Transaction not found',
			};
		}

		return {
			success: true,
			status: transaction.status,
			amount: transaction.amount,
			mpesaReceiptNumber: transaction.mpesaReceiptNumber,
			transactionRef: transaction.transactionRef,
		};
	} catch (error) {
		console.error('[M-Pesa Status Query] Error:', error);
		return {
			success: false,
			error: error.message,
		};
	}
};

module.exports = {
	processMpesaCallbackEnhanced,
	queryMpesaStatus,
};
