/**
 * Enhanced Payment Recording Controller with Fraud Prevention
 *
 * POST /api/deliveries/:deliveryId/payment
 * Accessible by: rider only
 *
 * Features:
 * - M-Pesa STK Push initiation
 * - Cash payment with mandatory photo proof
 * - Amount mismatch detection and flagging
 * - Geo-location tracking
 * - Timestamp and audit trail
 * - Fraud prevention mechanisms
 */

const Delivery = require('../../models/deliveries');
const Order = require('../../models/orders');
const MpesaTransaction = require('../../models/mpesaTransactions');
const RiderWallet = require('../../models/riderWallet');
const { initiateStkPush } = require('../../services/mpesa/stkPush');
const { emitToUser, emitToRole } = require('../../websocket/index');
const { uploadToGCS } = require('../../services/gcs/upload');

/**
 * @route   POST /api/deliveries/:deliveryId/payment
 * @desc    Record payment collection with fraud prevention
 * @access  Private (rider only)
 *
 * @param {string} deliveryId - Delivery ID
 * @body {string} paymentMethod - Payment method (cash, mpesa, airtel)
 * @body {number} amount - Amount collected
 * @body {string} [phoneNumber] - Phone number for M-Pesa STK Push
 * @body {string} [proofPhoto] - Base64 encoded photo proof for cash payments
 * @body {string} [notes] - Payment notes
 * @body {boolean} [isFlagged] - Whether amount mismatch was detected
 * @body {Object} [location] - Rider location {lat, lng}
 * @body {string} [timestamp] - Payment timestamp ISO string
 *
 * @returns {Object} Payment status and transaction details
 */
const recordPaymentEnhanced = async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const {
      paymentMethod,
      amount,
      phoneNumber,
      proofPhoto,
      notes,
      isFlagged,
      location,
      timestamp,
    } = req.body;
    const riderId = req.user._id;

    // Validate required fields
    if (!paymentMethod || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Payment method and amount are required',
        errors: ['Missing required payment information'],
      });
    }

    // Find delivery
    const delivery = await Delivery.findById(deliveryId)
      .populate('order')
      .populate('shop', 'shopName phoneNumber');

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

    // Check if payment already collected
    if (delivery.paymentInfo.status === 'collected') {
      return res.status(400).json({
        success: false,
        message: 'Payment already collected',
        errors: ['Payment has already been recorded for this delivery'],
      });
    }

    // FRAUD PREVENTION: Amount validation
    const expectedAmount = delivery.paymentInfo.amountToCollect;
    const amountMismatch = Math.abs(amount - expectedAmount) > 0.01; // Allow 1 cent tolerance

    if (amountMismatch && !isFlagged) {
      // Amount mismatch detected but not acknowledged by rider
      return res.status(400).json({
        success: false,
        message: 'Amount mismatch detected',
        errors: [
          `Expected amount: ${expectedAmount}, Provided: ${amount}. Please acknowledge the mismatch.`,
        ],
        data: {
          expectedAmount,
          providedAmount: amount,
          requiresFlag: true,
        },
      });
    }

    // Handle M-Pesa payment
    if (paymentMethod === 'mpesa') {
      if (!phoneNumber) {
        return res.status(400).json({
          success: false,
          message: 'Phone number required for M-Pesa',
          errors: ['Phone number is required for M-Pesa STK Push'],
        });
      }

      // Create M-Pesa transaction record
      const mpesaTransaction = await MpesaTransaction.createForDelivery(
        deliveryId,
        delivery.shop._id,
        phoneNumber,
        amount,
        riderId
      );

      // Initiate STK Push
      const stkResult = await initiateStkPush({
        phoneNumber,
        amount,
        accountReference: mpesaTransaction.accountReference,
        transactionDesc: mpesaTransaction.transactionDesc,
      });

      if (!stkResult.success) {
        mpesaTransaction.status = 'failed';
        mpesaTransaction.failureReason = stkResult.error;
        await mpesaTransaction.save();

        return res.status(400).json({
          success: false,
          message: 'Failed to initiate M-Pesa payment',
          errors: [stkResult.error],
        });
      }

      // Update M-Pesa transaction with response
      mpesaTransaction.checkoutRequestID = stkResult.checkoutRequestID;
      mpesaTransaction.merchantRequestID = stkResult.merchantRequestID;
      mpesaTransaction.status = 'pending';
      await mpesaTransaction.save();

      // Update delivery with pending payment info
      delivery.paymentInfo.method = 'mpesa';
      delivery.paymentInfo.status = 'pending';
      delivery.paymentInfo.mpesaTransaction = mpesaTransaction._id;

      if (amountMismatch) {
        delivery.paymentInfo.fraudFlags = delivery.paymentInfo.fraudFlags || [];
        delivery.paymentInfo.fraudFlags.push({
          type: 'amount_mismatch',
          description: `Amount mismatch: Expected ${expectedAmount}, Collected ${amount}`,
          flaggedAt: new Date(),
          flaggedBy: riderId,
        });
      }

      if (location) {
        delivery.paymentInfo.collectionLocation = {
          type: 'Point',
          coordinates: [location.lng, location.lat],
        };
      }

      await delivery.save();

      // Emit WebSocket event to track payment
      emitToUser(riderId.toString(), 'payment:initiated', {
        deliveryId: delivery._id,
        checkoutRequestID: stkResult.checkoutRequestID,
        amount,
        phoneNumber,
      });

      return res.status(200).json({
        success: true,
        message: 'STK Push sent successfully. Waiting for customer confirmation.',
        data: {
          transactionRef: mpesaTransaction.transactionRef,
          checkoutRequestID: stkResult.checkoutRequestID,
          amount: mpesaTransaction.amount,
          phoneNumber: mpesaTransaction.payer.phoneNumber,
          status: 'pending',
        },
      });
    }

    // Handle CASH or AIRTEL MONEY payments
    if (paymentMethod === 'cash' || paymentMethod === 'airtel') {
      // FRAUD PREVENTION: Mandatory photo proof for cash payments
      if (!proofPhoto) {
        return res.status(400).json({
          success: false,
          message: 'Photo proof required',
          errors: [
            `Photo evidence of ${paymentMethod} payment is required for fraud prevention`,
          ],
        });
      }

      // Upload proof photo to Google Cloud Storage
      let proofPhotoUrl = '';
      try {
        const fileName = `payment-proofs/${deliveryId}-${Date.now()}.jpg`;
        proofPhotoUrl = await uploadToGCS(proofPhoto, fileName, 'image/jpeg');
      } catch (uploadError) {
        console.error('Photo upload error:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload payment proof photo',
          errors: ['Photo upload failed. Please try again.'],
        });
      }

      // Update delivery payment info
      delivery.paymentInfo.method = paymentMethod;
      delivery.paymentInfo.amountCollected = amount;
      delivery.paymentInfo.status = amountMismatch ? 'flagged' : 'collected';
      delivery.paymentInfo.collectedAt = timestamp ? new Date(timestamp) : new Date();
      delivery.paymentInfo.proofPhoto = proofPhotoUrl;
      delivery.paymentInfo.collectorNotes = notes || '';

      // FRAUD PREVENTION: Flag for admin review if amount mismatch
      if (amountMismatch) {
        delivery.paymentInfo.fraudFlags = delivery.paymentInfo.fraudFlags || [];
        delivery.paymentInfo.fraudFlags.push({
          type: 'amount_mismatch',
          description: `Amount mismatch: Expected ${expectedAmount}, Collected ${amount}`,
          severity: Math.abs(amount - expectedAmount) > expectedAmount * 0.1 ? 'high' : 'low',
          flaggedAt: new Date(),
          flaggedBy: riderId,
        });

        // Notify admin of flagged payment
        emitToRole('admin', 'payment:flagged', {
          deliveryId: delivery._id,
          deliveryCode: delivery.deliveryCode,
          riderId,
          expectedAmount,
          collectedAmount: amount,
          difference: amount - expectedAmount,
          proofPhotoUrl,
        });
      }

      // Record location
      if (location) {
        delivery.paymentInfo.collectionLocation = {
          type: 'Point',
          coordinates: [location.lng, location.lat],
        };
      }

      // Record timestamp
      delivery.paymentInfo.timestamp = timestamp ? new Date(timestamp) : new Date();

      await delivery.save();

      // Update order payment status
      const order = await Order.findById(delivery.order);
      if (order) {
        order.paymentStatus = amountMismatch ? 'partial' : 'confirmed';
        order.paymentMethod = paymentMethod;
        order.paidAt = new Date();
        await order.save();
      }

      // Update rider wallet
      const riderWallet = await RiderWallet.getOrCreateWallet(riderId);
      await riderWallet.recordCollection(
        deliveryId,
        amount,
        null, // No M-Pesa transaction for cash
        riderId
      );

      // Emit WebSocket confirmation
      emitToUser(riderId.toString(), 'payment:confirmed', {
        deliveryId: delivery._id,
        status: amountMismatch ? 'flagged' : 'confirmed',
        amount,
        paymentMethod,
      });

      // Emit to shop
      emitToUser(delivery.shop._id.toString(), 'payment:received', {
        deliveryId: delivery._id,
        amount,
        paymentMethod,
        status: amountMismatch ? 'under_review' : 'confirmed',
      });

      return res.status(200).json({
        success: true,
        message: amountMismatch
          ? 'Payment recorded and flagged for admin review'
          : 'Payment recorded successfully',
        data: {
          delivery: {
            _id: delivery._id,
            deliveryCode: delivery.deliveryCode,
          },
          payment: {
            method: paymentMethod,
            amount: amount,
            expectedAmount: expectedAmount,
            status: amountMismatch ? 'flagged' : 'collected',
            collectedAt: delivery.paymentInfo.collectedAt,
            proofPhotoUrl,
            isFlagged: amountMismatch,
          },
          walletBalance: riderWallet.balance,
        },
      });
    }

    // Invalid payment method
    return res.status(400).json({
      success: false,
      message: 'Invalid payment method',
      errors: ['Payment method must be mpesa, cash, or airtel'],
    });
  } catch (error) {
    console.error('Enhanced Payment Recording Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to record payment',
      errors: [error.message],
    });
  }
};

module.exports = recordPaymentEnhanced;
