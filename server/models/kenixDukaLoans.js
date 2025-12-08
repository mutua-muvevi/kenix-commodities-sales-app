//package imports
const mongoose = require("mongoose");

//initialization
const { Schema } = mongoose;

//schema options
const MainSchemaOptions = {
	timestamps: true,
	collection: "kenix_duka_loans",
	optimisticConcurrency: true,
};

/**
 * Kenix Duka Loans Model - Loan Management System
 *
 * Manages loan applications, approvals, and repayments for shops
 */
const KenixDukaLoanSchema = new Schema({
	loanReference: {
		type: String,
		required: true,
		unique: true,
		trim: true,
		uppercase: true,
		index: true,
		// Format: "LOAN-YYYYMMDD-XXXX"
	},

	// Borrower (shop)
	borrower: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: true,
		index: true,
	},

	// Loan details
	loanAmount: {
		type: Number,
		required: true,
		min: 1,
	},
	interestRate: {
		type: Number,
		required: true,
		min: 0,
		// Percentage (e.g., 10 for 10%)
	},
	interestAmount: {
		type: Number,
		default: 0,
	},
	totalRepayableAmount: {
		type: Number,
		required: true,
	},
	loanPeriod: {
		type: Number,
		required: true,
		min: 1,
		// In months
	},

	// Loan status
	status: {
		type: String,
		required: true,
		trim: true,
		lowercase: true,
		enum: ['pending', 'approved', 'rejected', 'disbursed', 'active', 'completed', 'defaulted'],
		default: 'pending',
		index: true,
	},

	// Application details
	applicationDate: {
		type: Date,
		default: Date.now,
	},
	purpose: {
		type: String,
		trim: true,
	},

	// Approval workflow
	approvedBy: {
		type: Schema.Types.ObjectId,
		ref: "User",
	},
	approvedAt: {
		type: Date,
	},
	rejectionReason: {
		type: String,
		trim: true,
	},

	// Disbursement
	disbursedAt: {
		type: Date,
	},
	disbursementMethod: {
		type: String,
		enum: ['mpesa', 'bank_transfer', 'cash'],
	},
	disbursementReference: {
		type: String,
		trim: true,
	},

	// Repayment schedule
	repaymentSchedule: [
		{
			installmentNumber: {
				type: Number,
				required: true,
			},
			dueDate: {
				type: Date,
				required: true,
			},
			amount: {
				type: Number,
				required: true,
			},
			isPaid: {
				type: Boolean,
				default: false,
			},
			paidAt: {
				type: Date,
			},
			amountPaid: {
				type: Number,
				default: 0,
			},
		}
	],

	// Outstanding balance
	outstandingBalance: {
		type: Number,
		default: 0,
	},
	totalPaid: {
		type: Number,
		default: 0,
	},

	// Payment history
	payments: [
		{
			amount: {
				type: Number,
				required: true,
			},
			paymentDate: {
				type: Date,
				default: Date.now,
			},
			paymentMethod: {
				type: String,
				enum: ['mpesa', 'cash', 'bank_transfer'],
			},
			mpesaTransaction: {
				type: Schema.Types.ObjectId,
				ref: "MpesaTransaction",
			},
			receiptNumber: {
				type: String,
				trim: true,
			},
			recordedBy: {
				type: Schema.Types.ObjectId,
				ref: "User",
			},
		}
	],

	// Default tracking
	daysOverdue: {
		type: Number,
		default: 0,
	},
	isDefaulted: {
		type: Boolean,
		default: false,
		index: true,
	},

}, MainSchemaOptions);

// Middleware to calculate interest and total repayable
KenixDukaLoanSchema.pre("save", function (next) {
	if (this.isModified('loanAmount') || this.isModified('interestRate')) {
		this.interestAmount = (this.loanAmount * this.interestRate) / 100;
		this.totalRepayableAmount = this.loanAmount + this.interestAmount;
	}

	if (this.isModified('payments')) {
		this.totalPaid = this.payments.reduce((sum, payment) => sum + payment.amount, 0);
		this.outstandingBalance = this.totalRepayableAmount - this.totalPaid;
	}

	next();
});

// Method to record payment
KenixDukaLoanSchema.methods.recordPayment = async function(amount, method, mpesaTransactionId, userId) {
	this.payments.push({
		amount,
		paymentDate: new Date(),
		paymentMethod: method,
		mpesaTransaction: mpesaTransactionId,
		recordedBy: userId,
	});

	// Update outstanding balance
	this.totalPaid += amount;
	this.outstandingBalance = this.totalRepayableAmount - this.totalPaid;

	// Check if loan is fully paid
	if (this.outstandingBalance <= 0) {
		this.status = 'completed';
	}

	await this.save();
	return this;
};

// Indexes
KenixDukaLoanSchema.index({ loanReference: 1 });
KenixDukaLoanSchema.index({ borrower: 1, status: 1 });
KenixDukaLoanSchema.index({ status: 1, createdAt: -1 });

const KenixDukaLoan = mongoose.models.KenixDukaLoan || mongoose.model("KenixDukaLoan", KenixDukaLoanSchema);

module.exports = KenixDukaLoan;
