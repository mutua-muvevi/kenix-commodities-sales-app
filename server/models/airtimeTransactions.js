//package imports
const mongoose = require("mongoose");

//initialization
const { Schema } = mongoose;

//schema options
const MainSchemaOptions = {
	timestamps: true,
	collection: "airtime_transactions",
	optimisticConcurrency: true,
};

/**
 * Airtime Transactions Model
 *
 * Tracks airtime buy/sell transactions
 * Integrates with Safaricom/Airtel APIs
 */
const AirtimeTransactionSchema = new Schema({
	transactionRef: {
		type: String,
		required: true,
		unique: true,
		trim: true,
		uppercase: true,
		index: true,
		// Format: "AIRTIME-YYYYMMDD-XXXX"
	},

	// Transaction type
	type: {
		type: String,
		required: true,
		enum: ['purchase', 'sale'],
		index: true,
	},

	// User
	user: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: true,
		index: true,
	},

	// Recipient (for purchases)
	recipientPhone: {
		type: String,
		required: true,
		trim: true,
		// Format: 254XXXXXXXXX
	},

	// Network provider
	provider: {
		type: String,
		required: true,
		enum: ['safaricom', 'airtel'],
		index: true,
	},

	// Amount
	amount: {
		type: Number,
		required: true,
		min: 5,
		max: 10000,
	},

	// Transaction status
	status: {
		type: String,
		required: true,
		enum: ['pending', 'success', 'failed'],
		default: 'pending',
		index: true,
	},

	// Provider response
	providerReference: {
		type: String,
		trim: true,
	},
	providerResponse: {
		type: Schema.Types.Mixed,
	},

	// Payment (if applicable)
	paymentMethod: {
		type: String,
		enum: ['mpesa', 'wallet', 'cash'],
	},
	mpesaTransaction: {
		type: Schema.Types.ObjectId,
		ref: "MpesaTransaction",
	},

	// Timestamps
	initiatedAt: {
		type: Date,
		default: Date.now,
	},
	completedAt: {
		type: Date,
	},

	initiatedBy: {
		type: Schema.Types.ObjectId,
		ref: "User",
	},

}, MainSchemaOptions);

// Indexes
AirtimeTransactionSchema.index({ transactionRef: 1 });
AirtimeTransactionSchema.index({ user: 1, status: 1 });
AirtimeTransactionSchema.index({ recipientPhone: 1 });

const AirtimeTransaction = mongoose.models.AirtimeTransaction || mongoose.model("AirtimeTransaction", AirtimeTransactionSchema);

module.exports = AirtimeTransaction;
