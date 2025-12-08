//package imports
const mongoose = require("mongoose");

//initialization
const { Schema } = mongoose;

//schema options
const MainSchemaOptions = {
	timestamps: true,
	collection: "mpesa_transactions",
	optimisticConcurrency: true,
};

/**
 * M-Pesa Transaction Model
 *
 * This model tracks all M-Pesa payment transactions for:
 * - Order payments
 * - Delivery payments
 * - Loan repayments
 * - Any other M-Pesa transactions
 *
 * Features:
 * - STK Push tracking
 * - Callback data storage
 * - Payment reconciliation
 * - Transaction status tracking
 */
const MpesaTransactionSchema = new Schema({
	// Kenix internal transaction reference
	transactionRef: {
		type: String,
		required: true,
		unique: true,
		trim: true,
		uppercase: true,
		index: true,
		// Format: "MPESA-YYYYMMDD-XXXX"
	},

	// M-Pesa specific fields
	mpesaReceiptNumber: {
		type: String,
		unique: true,
		sparse: true, // Allows null values for pending transactions
		trim: true,
		index: true,
		// M-Pesa confirmation code (e.g., "QGH123ABC")
	},

	checkoutRequestID: {
		type: String,
		unique: true,
		sparse: true,
		trim: true,
		index: true,
		// From STK Push initiation response
	},

	merchantRequestID: {
		type: String,
		trim: true,
		// From STK Push initiation response
	},

	// Transaction type
	transactionType: {
		type: String,
		required: true,
		trim: true,
		lowercase: true,
		enum: ['stk_push', 'b2c', 'c2b', 'paybill'],
		default: 'stk_push',
		index: true,
	},

	// Purpose of payment
	purpose: {
		type: String,
		required: true,
		trim: true,
		lowercase: true,
		enum: ['order_payment', 'delivery_payment', 'loan_repayment', 'airtime_purchase', 'other'],
		index: true,
	},

	// Related entities
	relatedOrder: {
		type: Schema.Types.ObjectId,
		ref: "Order",
		index: true,
	},
	relatedDelivery: {
		type: Schema.Types.ObjectId,
		ref: "Delivery",
		index: true,
	},
	relatedLoan: {
		type: Schema.Types.ObjectId,
		ref: "KenixDukaLoan",
		index: true,
	},

	// Payer information
	payer: {
		userId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		phoneNumber: {
			type: String,
			required: true,
			trim: true,
			// Format: 254XXXXXXXXX
		},
		name: {
			type: String,
			trim: true,
		},
	},

	// Payment details
	amount: {
		type: Number,
		required: true,
		min: 1,
	},
	accountReference: {
		type: String,
		trim: true,
		// Account reference sent to M-Pesa (e.g., Order ID)
	},
	transactionDesc: {
		type: String,
		trim: true,
		// Transaction description sent to M-Pesa
	},

	// Transaction status
	status: {
		type: String,
		required: true,
		trim: true,
		lowercase: true,
		enum: ['initiated', 'pending', 'success', 'failed', 'cancelled', 'timeout'],
		default: 'initiated',
		index: true,
	},

	// Status timestamps
	initiatedAt: {
		type: Date,
		default: Date.now,
	},
	completedAt: {
		type: Date,
	},
	failedAt: {
		type: Date,
	},

	// M-Pesa callback data (stored as received)
	callbackData: {
		resultCode: {
			type: Number,
		},
		resultDesc: {
			type: String,
			trim: true,
		},
		transactionDate: {
			type: String,
		},
		mpesaReceivedAmount: {
			type: Number,
		},
		balance: {
			type: String,
		},
		phoneNumber: {
			type: String,
			trim: true,
		},
		// Full callback payload
		rawCallback: {
			type: Schema.Types.Mixed,
		},
	},

	// Failure information
	failureReason: {
		type: String,
		trim: true,
	},
	errorCode: {
		type: String,
		trim: true,
	},
	errorMessage: {
		type: String,
		trim: true,
	},

	// Retry information
	retryCount: {
		type: Number,
		default: 0,
		min: 0,
	},
	maxRetries: {
		type: Number,
		default: 3,
	},
	nextRetryAt: {
		type: Date,
	},
	lastRetryAt: {
		type: Date,
	},

	// Reconciliation
	isReconciled: {
		type: Boolean,
		default: false,
		index: true,
	},
	reconciledAt: {
		type: Date,
	},
	reconciledBy: {
		type: Schema.Types.ObjectId,
		ref: "User",
	},
	reconciliationNotes: {
		type: String,
		trim: true,
	},

	// Metadata
	metadata: {
		type: Schema.Types.Mixed,
		// Any additional data needed for specific transaction types
	},

	// Audit trail
	initiatedBy: {
		type: Schema.Types.ObjectId,
		ref: "User",
		// User who initiated the transaction (rider, admin, etc.)
	},
	ipAddress: {
		type: String,
		trim: true,
	},
	userAgent: {
		type: String,
		trim: true,
	},

}, MainSchemaOptions);

// Middleware to update status timestamps
MpesaTransactionSchema.pre("save", function (next) {
	if (this.isModified('status')) {
		if (this.status === 'success') {
			this.completedAt = new Date();
		} else if (this.status === 'failed') {
			this.failedAt = new Date();
		}
	}
	next();
});

// Method to process M-Pesa callback
MpesaTransactionSchema.methods.processCallback = async function(callbackPayload) {
	try {
		// Extract result code from callback
		const resultCode = callbackPayload.Body?.stkCallback?.ResultCode;
		const resultDesc = callbackPayload.Body?.stkCallback?.ResultDesc;

		this.callbackData.resultCode = resultCode;
		this.callbackData.resultDesc = resultDesc;
		this.callbackData.rawCallback = callbackPayload;

		if (resultCode === 0) {
			// Success
			const callbackMetadata = callbackPayload.Body?.stkCallback?.CallbackMetadata?.Item || [];

			// Extract callback data
			const amountData = callbackMetadata.find(item => item.Name === 'Amount');
			const receiptData = callbackMetadata.find(item => item.Name === 'MpesaReceiptNumber');
			const dateData = callbackMetadata.find(item => item.Name === 'TransactionDate');
			const phoneData = callbackMetadata.find(item => item.Name === 'PhoneNumber');

			this.callbackData.mpesaReceivedAmount = amountData?.Value;
			this.mpesaReceiptNumber = receiptData?.Value;
			this.callbackData.transactionDate = dateData?.Value?.toString();
			this.callbackData.phoneNumber = phoneData?.Value?.toString();

			this.status = 'success';

			// Validate amount matches
			if (this.callbackData.mpesaReceivedAmount !== this.amount) {
				this.reconciliationNotes = `Amount mismatch: Expected ${this.amount}, Received ${this.callbackData.mpesaReceivedAmount}`;
			}
		} else {
			// Failed
			this.status = 'failed';
			this.failureReason = resultDesc;
		}

		await this.save();
		return this;
	} catch (error) {
		console.error('Error processing M-Pesa callback:', error);
		throw error;
	}
};

// Method to retry failed transaction
MpesaTransactionSchema.methods.retryTransaction = async function() {
	if (this.retryCount >= this.maxRetries) {
		throw new Error('Maximum retry attempts reached');
	}

	this.retryCount += 1;
	this.lastRetryAt = new Date();
	this.status = 'initiated';

	await this.save();

	// TODO: Implement actual retry logic to call M-Pesa API
	return this;
};

// Static method to create transaction for order payment
MpesaTransactionSchema.statics.createForOrder = async function(orderId, userId, phoneNumber, amount) {
	const transactionRef = `MPESA-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

	const transaction = new this({
		transactionRef,
		transactionType: 'stk_push',
		purpose: 'order_payment',
		relatedOrder: orderId,
		payer: {
			userId,
			phoneNumber,
		},
		amount,
		accountReference: orderId.toString().substr(-10),
		transactionDesc: `Payment for order ${orderId}`,
		initiatedBy: userId,
	});

	await transaction.save();
	return transaction;
};

// Static method to create transaction for delivery payment
MpesaTransactionSchema.statics.createForDelivery = async function(deliveryId, userId, phoneNumber, amount, initiatedBy) {
	const transactionRef = `MPESA-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

	const transaction = new this({
		transactionRef,
		transactionType: 'stk_push',
		purpose: 'delivery_payment',
		relatedDelivery: deliveryId,
		payer: {
			userId,
			phoneNumber,
		},
		amount,
		accountReference: deliveryId.toString().substr(-10),
		transactionDesc: `Payment for delivery ${deliveryId}`,
		initiatedBy,
	});

	await transaction.save();
	return transaction;
};

// Indexes for efficient queries
MpesaTransactionSchema.index({ transactionRef: 1 });
MpesaTransactionSchema.index({ mpesaReceiptNumber: 1 });
MpesaTransactionSchema.index({ checkoutRequestID: 1 });
MpesaTransactionSchema.index({ 'payer.userId': 1, status: 1 });
MpesaTransactionSchema.index({ 'payer.phoneNumber': 1 });
MpesaTransactionSchema.index({ status: 1, createdAt: -1 });
MpesaTransactionSchema.index({ relatedOrder: 1 });
MpesaTransactionSchema.index({ relatedDelivery: 1 });
MpesaTransactionSchema.index({ isReconciled: 1 });

const MpesaTransaction = mongoose.models.MpesaTransaction || mongoose.model("MpesaTransaction", MpesaTransactionSchema);

module.exports = MpesaTransaction;
