// package imports
const mongoose = require("mongoose");

// initialization
const { Schema } = mongoose;

// schema options
const MainSchemaOptions = {
	timestamps: true,
	collection: "shop_wallets",
	optimisticConcurrency: true,
};

/**
 * Shop Wallet Model
 *
 * Tracks shop wallet balance for airtime sales and credits.
 *
 * Business Logic:
 * - Shop wallet accumulates credits from airtime sales
 * - Balance can be debited for various operations (withdrawals, adjustments)
 * - All transactions are logged with full audit trail
 * - Wallet can be suspended or frozen by admin if needed
 */
const ShopWalletSchema = new Schema({
	shop: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: true,
		unique: true, // One wallet per shop
		index: true,
	},

	// Current balance (positive = shop has credit)
	balance: {
		type: Number,
		required: true,
		default: 0,
		min: 0, // Shop balance cannot go negative
	},

	// Total credits received
	totalCredits: {
		type: Number,
		default: 0,
		min: 0,
	},

	// Total debits made
	totalDebits: {
		type: Number,
		default: 0,
		min: 0,
	},

	// Transaction history
	transactions: [
		{
			type: {
				type: String,
				enum: ['credit', 'debit', 'adjustment'],
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
				required: true,
			},
			source: {
				type: String,
				enum: ['airtime_sale', 'order_credit', 'admin_adjustment', 'withdrawal'],
				required: true,
			},
			relatedTransaction: {
				type: Schema.Types.ObjectId,
				refPath: 'transactions.transactionModel',
			},
			transactionModel: {
				type: String,
				enum: ['AirtimeTransaction', 'Order'],
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
		enum: ['active', 'suspended', 'frozen'],
		default: 'active',
		index: true,
	},

}, MainSchemaOptions);

/**
 * Method to add credit to shop wallet
 *
 * @param {Number} amount - Amount to credit
 * @param {String} description - Transaction description
 * @param {String} source - Source of credit (airtime_sale, order_credit, admin_adjustment)
 * @param {ObjectId} relatedId - ID of related transaction (optional)
 * @param {ObjectId} userId - ID of user performing the action
 * @returns {Promise<ShopWallet>} Updated wallet
 */
ShopWalletSchema.methods.addCredit = async function(amount, description, source, relatedId, userId) {
	if (amount <= 0) {
		throw new Error('Credit amount must be positive');
	}

	if (this.status !== 'active') {
		throw new Error(`Cannot add credit to ${this.status} wallet`);
	}

	const previousBalance = this.balance;

	// Increase balance
	this.balance += amount;
	this.totalCredits += amount;

	// Determine transaction model based on source
	let transactionModel = null;
	if (source === 'airtime_sale') {
		transactionModel = 'AirtimeTransaction';
	} else if (source === 'order_credit') {
		transactionModel = 'Order';
	}

	// Add transaction record
	this.transactions.push({
		type: 'credit',
		amount: amount,
		previousBalance,
		newBalance: this.balance,
		description,
		source,
		relatedTransaction: relatedId || null,
		transactionModel,
		performedBy: userId,
	});

	await this.save();
	return this;
};

/**
 * Method to deduct from shop wallet
 *
 * @param {Number} amount - Amount to deduct
 * @param {String} description - Transaction description
 * @param {String} source - Source of debit (withdrawal, admin_adjustment)
 * @param {ObjectId} relatedId - ID of related transaction (optional)
 * @param {ObjectId} userId - ID of user performing the action
 * @returns {Promise<ShopWallet>} Updated wallet
 * @throws {Error} If insufficient balance or wallet is not active
 */
ShopWalletSchema.methods.deductCredit = async function(amount, description, source, relatedId, userId) {
	if (amount <= 0) {
		throw new Error('Debit amount must be positive');
	}

	if (this.status !== 'active') {
		throw new Error(`Cannot deduct from ${this.status} wallet`);
	}

	if (this.balance < amount) {
		throw new Error(`Insufficient balance. Available: ${this.balance}, Required: ${amount}`);
	}

	const previousBalance = this.balance;

	// Decrease balance
	this.balance -= amount;
	this.totalDebits += amount;

	// Add transaction record
	this.transactions.push({
		type: 'debit',
		amount: amount,
		previousBalance,
		newBalance: this.balance,
		description,
		source,
		relatedTransaction: relatedId || null,
		performedBy: userId,
	});

	await this.save();
	return this;
};

/**
 * Static method to get or create wallet for shop
 *
 * @param {ObjectId} shopId - ID of the shop user
 * @returns {Promise<ShopWallet>} Shop wallet
 */
ShopWalletSchema.statics.getOrCreateWallet = async function(shopId) {
	let wallet = await this.findOne({ shop: shopId });

	if (!wallet) {
		wallet = new this({
			shop: shopId,
			balance: 0,
		});
		await wallet.save();
	}

	return wallet;
};

// Indexes
ShopWalletSchema.index({ shop: 1 });
ShopWalletSchema.index({ status: 1 });
ShopWalletSchema.index({ 'transactions.timestamp': -1 });

const ShopWallet = mongoose.models.ShopWallet || mongoose.model("ShopWallet", ShopWalletSchema);

module.exports = ShopWallet;
