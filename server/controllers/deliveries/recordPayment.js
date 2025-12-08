/**
 * Record Payment Controller
 *
 * POST /api/deliveries/:deliveryId/payment
 * Accessible by: rider only
 *
 * Records payment collection for delivery
 * Supports cash, M-Pesa, and credit payments
 */

const Delivery = require('../../models/deliveries');
const Order = require('../../models/orders');
const MpesaTransaction = require('../../models/mpesaTransactions');

/**
 * @route   POST /api/deliveries/:deliveryId/payment
 * @desc    Record payment collection
 * @access  Private (rider only)
 *
 * @param {string} deliveryId - Delivery ID
 * @body {string} paymentMethod - Payment method (cash, mpesa, credit)
 * @body {number} amount - Amount collected
 * @body {string} [mpesaTransactionId] - M-Pesa transaction reference
 * @body {string} [receiptNumber] - Receipt number for cash payments
 *
 * @returns {Object} Updated delivery with payment status
 */
const recordPayment = async (req, res) => {
	try {
		const { deliveryId } = req.params;
		const { paymentMethod, amount, mpesaTransactionId, receiptNumber } = req.body;
		const riderId = req.user._id;

		// Find delivery
		const delivery = await Delivery.findById(deliveryId).populate('order');

		if (!delivery) {
			return res.status(404).json({
				success: false,
				message: 'Delivery not found',
				errors: ['No delivery exists with the specified ID'],
			});
		}

		// Verify rider owns this delivery
		if (delivery.rider.toString() !== riderId.toString()) {
			return res.status(403).json({
				success: false,
				message: 'Access denied',
				errors: ['You are not assigned to this delivery'],
			});
		}

		// Check delivery status
		if (delivery.status !== 'arrived') {
			return res.status(400).json({
				success: false,
				message: 'Invalid delivery status',
				errors: ['Delivery must be marked as arrived before recording payment'],
			});
		}

		// Validate amount
		if (amount !== delivery.paymentInfo.amountToCollect) {
			return res.status(400).json({
				success: false,
				message: 'Amount mismatch',
				errors: [
					`Amount should be ${delivery.paymentInfo.amountToCollect}, but ${amount} was provided`,
				],
			});
		}

		// Handle M-Pesa payment
		if (paymentMethod === 'mpesa') {
			if (!mpesaTransactionId) {
				return res.status(400).json({
					success: false,
					message: 'M-Pesa transaction ID required',
					errors: ['M-Pesa transaction ID is required for M-Pesa payments'],
				});
			}

			// Verify M-Pesa transaction exists and is successful
			const mpesaTransaction = await MpesaTransaction.findById(mpesaTransactionId);

			if (!mpesaTransaction) {
				return res.status(404).json({
					success: false,
					message: 'M-Pesa transaction not found',
					errors: ['Invalid M-Pesa transaction ID'],
				});
			}

			if (mpesaTransaction.status !== 'completed') {
				return res.status(400).json({
					success: false,
					message: 'M-Pesa payment not completed',
					errors: [`M-Pesa transaction status is ${mpesaTransaction.status}`],
				});
			}

			delivery.paymentInfo.mpesaTransaction = mpesaTransactionId;
		}

		// Update payment info
		delivery.paymentInfo.method = paymentMethod;
		delivery.paymentInfo.amountCollected = amount;
		delivery.paymentInfo.status = 'collected';
		delivery.paymentInfo.collectedAt = new Date();

		if (receiptNumber) {
			delivery.paymentInfo.receiptNumber = receiptNumber;
		}

		await delivery.save();

		// Update order payment status
		const order = await Order.findById(delivery.order);
		if (order) {
			order.paymentStatus = 'confirmed';
			order.paymentMethod = paymentMethod;
			order.paidAt = new Date();

			if (mpesaTransactionId) {
				order.mpesaTransaction = mpesaTransactionId;
			}

			await order.save();
		}

		// Populate delivery for response
		const populatedDelivery = await Delivery.findById(delivery._id)
			.populate('order', 'orderId totalPrice paymentMethod paymentStatus')
			.populate('shop', 'shopName phoneNumber');

		return res.status(200).json({
			success: true,
			message: 'Payment recorded successfully',
			data: {
				delivery: populatedDelivery,
				payment: {
					method: paymentMethod,
					amount: amount,
					status: 'collected',
					collectedAt: delivery.paymentInfo.collectedAt,
				},
			},
		});
	} catch (error) {
		console.error('Record Payment Error:', error);

		return res.status(500).json({
			success: false,
			message: 'Failed to record payment',
			errors: [error.message],
		});
	}
};

module.exports = recordPayment;
