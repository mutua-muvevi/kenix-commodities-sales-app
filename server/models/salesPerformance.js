//package imports
const mongoose = require("mongoose");

//initialization
const { Schema } = mongoose;

//schema options
const MainSchemaOptions = {
	timestamps: true,
	collection: "sales_performance",
	optimisticConcurrency: true,
};

/**
 * Sales Performance Model - Sales Agent Metrics Tracking
 *
 * Tracks weekly/monthly performance for sales agents including:
 * - Shop registrations
 * - Orders placed
 * - Visits logged
 * - Commission calculations
 */
const SalesPerformanceSchema = new Schema({
	salesAgent: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: true,
		index: true,
	},

	// Period tracking
	period: {
		type: String,
		required: true,
		enum: ['weekly', 'monthly'],
		default: 'weekly',
	},
	startDate: {
		type: Date,
		required: true,
	},
	endDate: {
		type: Date,
		required: true,
	},
	periodIdentifier: {
		type: String,
		required: true,
		index: true,
		// Format: "2025-W01" for weekly, "2025-01" for monthly
	},

	// Performance metrics
	metrics: {
		// Shop registration
		shopsRegistered: {
			type: Number,
			default: 0,
			min: 0,
		},
		registrationTarget: {
			type: Number,
			default: 0,
		},

		// Orders
		ordersPlaced: {
			type: Number,
			default: 0,
			min: 0,
		},
		ordersTarget: {
			type: Number,
			default: 0,
		},
		totalOrderValue: {
			type: Number,
			default: 0,
			min: 0,
		},

		// Visits
		shopsVisited: {
			type: Number,
			default: 0,
			min: 0,
		},
		visitsTarget: {
			type: Number,
			default: 0,
		},

		// Active shops managed
		activeShops: {
			type: Number,
			default: 0,
		},
	},

	// Detailed records
	registeredShops: [
		{
			shop: {
				type: Schema.Types.ObjectId,
				ref: "User",
			},
			registeredAt: {
				type: Date,
				default: Date.now,
			},
		}
	],

	visits: [
		{
			shop: {
				type: Schema.Types.ObjectId,
				ref: "User",
			},
			visitDate: {
				type: Date,
				default: Date.now,
			},
			purpose: {
				type: String,
				trim: true,
			},
			notes: {
				type: String,
				trim: true,
			},
			location: {
				type: {
					type: String,
					enum: ['Point'],
				},
				coordinates: {
					type: [Number],
				},
			},
		}
	],

	// Commission
	commission: {
		baseCommission: {
			type: Number,
			default: 0,
			min: 0,
		},
		registrationBonus: {
			type: Number,
			default: 0,
		},
		performanceBonus: {
			type: Number,
			default: 0,
		},
		totalCommission: {
			type: Number,
			default: 0,
		},
		isPaid: {
			type: Boolean,
			default: false,
		},
		paidAt: {
			type: Date,
		},
	},

	// Performance rating
	rating: {
		type: String,
		enum: ['excellent', 'good', 'average', 'below_average', 'poor'],
	},

}, MainSchemaOptions);

// Middleware to calculate total commission
SalesPerformanceSchema.pre("save", function (next) {
	this.commission.totalCommission =
		this.commission.baseCommission +
		this.commission.registrationBonus +
		this.commission.performanceBonus;
	next();
});

// Method to record shop visit
SalesPerformanceSchema.methods.recordVisit = async function(shopId, purpose, notes, location) {
	this.visits.push({
		shop: shopId,
		visitDate: new Date(),
		purpose,
		notes,
		location,
	});

	this.metrics.shopsVisited = this.visits.length;
	await this.save();
	return this;
};

// Compound index for unique period per sales agent
SalesPerformanceSchema.index({ salesAgent: 1, periodIdentifier: 1 }, { unique: true });

const SalesPerformance = mongoose.models.SalesPerformance || mongoose.model("SalesPerformance", SalesPerformanceSchema);

module.exports = SalesPerformance;
