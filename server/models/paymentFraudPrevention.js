/**
 * Payment Fraud Prevention Schema Extension
 *
 * This file contains the enhanced paymentInfo schema with fraud prevention features.
 * Use this to update the Delivery model's paymentInfo field.
 *
 * Features:
 * - Photo proof requirement for cash payments
 * - Geo-location tracking
 * - Fraud flag system
 * - Audit trail
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Enhanced PaymentInfo Schema with Fraud Prevention
 */
const EnhancedPaymentInfoSchema = {
	method: {
		type: String,
		trim: true,
		lowercase: true,
		enum: ['cash', 'mpesa', 'airtel', 'credit', 'not_required'],
		default: 'not_required',
	},
	amountToCollect: {
		type: Number,
		default: 0,
		min: 0,
	},
	amountCollected: {
		type: Number,
		default: 0,
		min: 0,
	},
	status: {
		type: String,
		enum: ['pending', 'collected', 'flagged', 'failed', 'not_required'],
		default: 'not_required',
	},
	mpesaTransaction: {
		type: Schema.Types.ObjectId,
		ref: "MpesaTransaction",
	},
	collectedAt: {
		type: Date,
	},
	receiptNumber: {
		type: String,
		trim: true,
	},
	// FRAUD PREVENTION: Proof of payment for cash/airtel
	proofPhoto: {
		type: String,
		// URL to GCS bucket - photo of cash or receipt
	},
	collectorNotes: {
		type: String,
		trim: true,
		// Notes from rider about payment collection
	},
	collectionLocation: {
		type: {
			type: String,
			enum: ['Point'],
		},
		coordinates: {
			type: [Number], // [longitude, latitude]
		},
		// Where payment was collected (geo-location)
	},
	timestamp: {
		type: Date,
		// Exact timestamp when payment was recorded
	},
	// FRAUD PREVENTION: Fraud detection flags
	fraudFlags: [
		{
			type: {
				type: String,
				enum: [
					'amount_mismatch',
					'location_mismatch',
					'suspicious_timing',
					'duplicate_payment',
					'manual_review',
					'missing_proof'
				],
			},
			description: {
				type: String,
				trim: true,
			},
			severity: {
				type: String,
				enum: ['low', 'medium', 'high'],
				default: 'low',
			},
			flaggedAt: {
				type: Date,
				default: Date.now,
			},
			flaggedBy: {
				type: Schema.Types.ObjectId,
				ref: "User",
			},
			resolvedAt: {
				type: Date,
			},
			resolvedBy: {
				type: Schema.Types.ObjectId,
				ref: "User",
			},
			resolution: {
				type: String,
				trim: true,
			},
			status: {
				type: String,
				enum: ['pending', 'reviewed', 'resolved', 'escalated'],
				default: 'pending',
			},
		}
	],
};

/**
 * Fraud Flag Model - Separate collection for tracking all fraud flags
 */
const FraudFlagSchema = new Schema({
	// Related entities
	delivery: {
		type: Schema.Types.ObjectId,
		ref: "Delivery",
		required: true,
		index: true,
	},
	rider: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: true,
		index: true,
	},
	shop: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: true,
		index: true,
	},
	order: {
		type: Schema.Types.ObjectId,
		ref: "Order",
		index: true,
	},

	// Flag type and details
	type: {
		type: String,
		required: true,
		enum: [
			'amount_mismatch',
			'location_mismatch',
			'suspicious_timing',
			'duplicate_payment',
			'manual_review',
			'missing_proof',
			'excessive_discrepancy'
		],
		index: true,
	},
	description: {
		type: String,
		required: true,
		trim: true,
	},
	severity: {
		type: String,
		required: true,
		enum: ['low', 'medium', 'high'],
		default: 'low',
		index: true,
	},

	// Payment details
	expectedAmount: {
		type: Number,
		required: true,
	},
	collectedAmount: {
		type: Number,
		required: true,
	},
	discrepancy: {
		type: Number,
		// Difference between expected and collected
	},
	paymentMethod: {
		type: String,
		required: true,
		enum: ['cash', 'mpesa', 'airtel'],
	},

	// Evidence
	proofPhotoUrl: {
		type: String,
		// URL to GCS bucket
	},
	collectionLocation: {
		type: {
			type: String,
			enum: ['Point'],
		},
		coordinates: {
			type: [Number], // [longitude, latitude]
		},
	},
	expectedLocation: {
		type: {
			type: String,
			enum: ['Point'],
		},
		coordinates: {
			type: [Number], // [longitude, latitude]
		},
	},
	distanceFromExpected: {
		type: Number,
		// In meters
	},

	// Status and resolution
	status: {
		type: String,
		required: true,
		enum: ['pending', 'under_review', 'resolved', 'escalated', 'dismissed'],
		default: 'pending',
		index: true,
	},
	priority: {
		type: String,
		enum: ['low', 'normal', 'high', 'urgent'],
		default: 'normal',
		index: true,
	},

	// Audit trail
	flaggedAt: {
		type: Date,
		required: true,
		default: Date.now,
		index: true,
	},
	flaggedBy: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	reviewedAt: {
		type: Date,
	},
	reviewedBy: {
		type: Schema.Types.ObjectId,
		ref: "User",
	},
	resolvedAt: {
		type: Date,
	},
	resolvedBy: {
		type: Schema.Types.ObjectId,
		ref: "User",
	},
	resolution: {
		type: String,
		trim: true,
	},
	adminNotes: {
		type: String,
		trim: true,
	},

	// Actions taken
	actionsTaken: [
		{
			action: {
				type: String,
				enum: [
					'warning_issued',
					'payment_adjusted',
					'rider_suspended',
					'manual_correction',
					'false_positive',
					'escalated_to_management'
				],
			},
			performedBy: {
				type: Schema.Types.ObjectId,
				ref: "User",
			},
			performedAt: {
				type: Date,
				default: Date.now,
			},
			notes: {
				type: String,
				trim: true,
			},
		}
	],

	// Risk score (1-100)
	riskScore: {
		type: Number,
		min: 1,
		max: 100,
		default: 50,
	},

}, {
	timestamps: true,
	collection: 'fraud_flags',
});

// Middleware to calculate discrepancy
FraudFlagSchema.pre('save', function(next) {
	if (this.expectedAmount && this.collectedAmount) {
		this.discrepancy = this.collectedAmount - this.expectedAmount;
	}
	next();
});

// Method to escalate flag
FraudFlagSchema.methods.escalate = async function(userId, reason) {
	this.status = 'escalated';
	this.priority = 'urgent';
	this.actionsTaken.push({
		action: 'escalated_to_management',
		performedBy: userId,
		notes: reason,
	});
	await this.save();
	return this;
};

// Method to resolve flag
FraudFlagSchema.methods.resolve = async function(userId, resolution, action) {
	this.status = 'resolved';
	this.resolvedAt = new Date();
	this.resolvedBy = userId;
	this.resolution = resolution;

	if (action) {
		this.actionsTaken.push({
			action,
			performedBy: userId,
			notes: resolution,
		});
	}

	await this.save();
	return this;
};

// Static method to get fraud statistics
FraudFlagSchema.statics.getStatistics = async function(riderId, startDate, endDate) {
	const match = {
		rider: riderId,
		flaggedAt: {
			$gte: startDate,
			$lte: endDate,
		},
	};

	const stats = await this.aggregate([
		{ $match: match },
		{
			$group: {
				_id: null,
				totalFlags: { $sum: 1 },
				pendingFlags: {
					$sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
				},
				resolvedFlags: {
					$sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
				},
				highSeverity: {
					$sum: { $cond: [{ $eq: ['$severity', 'high'] }, 1, 0] }
				},
				totalDiscrepancy: { $sum: '$discrepancy' },
				avgRiskScore: { $avg: '$riskScore' },
			},
		},
	]);

	return stats[0] || {
		totalFlags: 0,
		pendingFlags: 0,
		resolvedFlags: 0,
		highSeverity: 0,
		totalDiscrepancy: 0,
		avgRiskScore: 0,
	};
};

// Indexes
FraudFlagSchema.index({ delivery: 1 });
FraudFlagSchema.index({ rider: 1, flaggedAt: -1 });
FraudFlagSchema.index({ shop: 1 });
FraudFlagSchema.index({ status: 1, priority: -1 });
FraudFlagSchema.index({ flaggedAt: -1 });
FraudFlagSchema.index({ severity: 1, status: 1 });
FraudFlagSchema.index({ collectionLocation: '2dsphere' });

const FraudFlag = mongoose.models.FraudFlag || mongoose.model('FraudFlag', FraudFlagSchema);

module.exports = {
	EnhancedPaymentInfoSchema,
	FraudFlag,
};
