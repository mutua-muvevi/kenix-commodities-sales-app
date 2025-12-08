//package imports
const mongoose = require("mongoose");

//initialization
const { Schema } = mongoose;

//schema options
const MainSchemaOptions = {
	timestamps: true,
	collection: "rider_wallets",
	optimisticConcurrency: true,
};

/**
 * Rider Wallet Model
 *
 * Tracks rider wallet balance which starts negative (cost of goods)
 * and decreases as deliveries are completed and payments collected.
 *
 * Business Logic:
 * - Rider wallet starts at negative balance (cost of goods loaded)
 * - As deliveries are completed and payments collected, balance increases
 * - When balance reaches zero or positive, rider has completed all deliveries
 */
const RiderWalletSchema = new Schema({
	rider: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: true,
		unique: true, // One wallet per rider
		index: true,
	},

	// Current balance (negative = rider owes company, positive = company owes rider)
	balance: {
		type: Number,
		required: true,
		default: 0,
	},

	// Total loaded amount for current active route
	totalLoadedAmount: {
		type: Number,
		default: 0,
		min: 0,
	},

	// Total collected so far
	totalCollected: {
		type: Number,
		default: 0,
		min: 0,
	},

	// Outstanding amount to collect
	outstandingAmount: {
		type: Number,
		default: 0,
	},

	// Active route
	currentRoute: {
		type: Schema.Types.ObjectId,
		ref: "Route",
	},

	// Transaction history
	transactions: [
		{
			type: {
				type: String,
				enum: ['load', 'collection', 'adjustment', 'settlement'],
				required: true,
			},
			amount: {
				type: Number,
				required: true,
			},
			previousBalance: {
				type: Number,
				required: true,
			},
			newBalance: {
				type: Number,
				required: true,
			},
			description: {
				type: String,
				trim: true,
			},
			relatedRoute: {
				type: Schema.Types.ObjectId,
				ref: "Route",
			},
			relatedDelivery: {
				type: Schema.Types.ObjectId,
				ref: "Delivery",
			},
			relatedTransaction: {
				type: Schema.Types.ObjectId,
				ref: "MpesaTransaction",
			},
			performedBy: {
				type: Schema.Types.ObjectId,
				ref: "User",
			},
			timestamp: {
				type: Date,
				default: Date.now,
			},
		}
	],

	// Wallet status
	status: {
		type: String,
		required: true,
		enum: ['active', 'suspended', 'settled'],
		default: 'active',
		index: true,
	},

	// Last settlement information
	lastSettlement: {
		amount: {
			type: Number,
		},
		settledAt: {
			type: Date,
		},
		settledBy: {
			type: Schema.Types.ObjectId,
			ref: "User",
		},
		notes: {
			type: String,
			trim: true,
		},
	},

}, MainSchemaOptions);

// Virtual for collection percentage
RiderWalletSchema.virtual('collectionPercentage').get(function() {
	if (this.totalLoadedAmount === 0) return 0;
	return (this.totalCollected / this.totalLoadedAmount) * 100;
});

// Middleware to calculate outstanding amount
RiderWalletSchema.pre("save", function (next) {
	this.outstandingAmount = this.totalLoadedAmount - this.totalCollected;
	next();
});

// Method to load goods for route (creates negative balance)
RiderWalletSchema.methods.loadGoodsForRoute = async function(routeId, amount, userId) {
	const previousBalance = this.balance;

	// Decrease balance (make it more negative)
	this.balance -= amount;
	this.totalLoadedAmount += amount;
	this.currentRoute = routeId;

	// Add transaction record
	this.transactions.push({
		type: 'load',
		amount: -amount,
		previousBalance,
		newBalance: this.balance,
		description: `Goods loaded for route ${routeId}`,
		relatedRoute: routeId,
		performedBy: userId,
	});

	await this.save();
	return this;
};

// Method to record payment collection
RiderWalletSchema.methods.recordCollection = async function(deliveryId, amount, mpesaTransactionId, userId) {
	const previousBalance = this.balance;

	// Increase balance (reduce negative or increase positive)
	this.balance += amount;
	this.totalCollected += amount;

	// Add transaction record
	this.transactions.push({
		type: 'collection',
		amount: amount,
		previousBalance,
		newBalance: this.balance,
		description: `Payment collected for delivery ${deliveryId}`,
		relatedDelivery: deliveryId,
		relatedTransaction: mpesaTransactionId,
		performedBy: userId,
	});

	await this.save();
	return this;
};

// Method to settle wallet (admin action)
RiderWalletSchema.methods.settleWallet = async function(settlementAmount, notes, userId) {
	const previousBalance = this.balance;

	this.balance = 0;
	this.totalLoadedAmount = 0;
	this.totalCollected = 0;
	this.outstandingAmount = 0;
	this.currentRoute = null;

	// Record last settlement
	this.lastSettlement = {
		amount: settlementAmount,
		settledAt: new Date(),
		settledBy: userId,
		notes,
	};

	// Add transaction record
	this.transactions.push({
		type: 'settlement',
		amount: settlementAmount,
		previousBalance,
		newBalance: 0,
		description: notes || 'Wallet settled',
		performedBy: userId,
	});

	await this.save();
	return this;
};

// Static method to get or create wallet for rider
RiderWalletSchema.statics.getOrCreateWallet = async function(riderId) {
	let wallet = await this.findOne({ rider: riderId });

	if (!wallet) {
		wallet = new this({
			rider: riderId,
			balance: 0,
		});
		await wallet.save();
	}

	return wallet;
};

// Indexes
RiderWalletSchema.index({ rider: 1 });
RiderWalletSchema.index({ status: 1 });
RiderWalletSchema.index({ currentRoute: 1 });

const RiderWallet = mongoose.models.RiderWallet || mongoose.model("RiderWallet", RiderWalletSchema);

module.exports = RiderWallet;
