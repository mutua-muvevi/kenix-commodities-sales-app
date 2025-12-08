//package imports
const mongoose = require("mongoose");

//initialization
const { Schema } = mongoose;

//schema options
const MainSchemaOptions = {
	timestamps: true,
	collection: "offers",
	optimisticConcurrency: true,
};

/**
 * Offer Model
 *
 * Comprehensive offer/discount system supporting multiple offer types:
 * - Percentage discounts
 * - Fixed amount discounts
 * - Buy X Get Y deals
 * - Free delivery
 * - Bundle offers
 * - Category-wide discounts
 */
const OfferSchema = new Schema({
	// Basic offer info
	name: {
		type: String,
		required: true,
		trim: true,
		maxlength: 100,
	},
	description: {
		type: String,
		trim: true,
		maxlength: 500,
	},
	code: {
		type: String,
		trim: true,
		uppercase: true,
		sparse: true,
		index: true,
	},

	// Offer type
	offerType: {
		type: String,
		required: true,
		enum: [
			'percentage_discount',
			'fixed_discount',
			'buy_x_get_y',
			'free_delivery',
			'bundle_offer',
			'category_discount',
		],
		index: true,
	},

	// Discount value (percentage for percentage_discount, amount for fixed_discount)
	discountValue: {
		type: Number,
		min: 0,
	},

	// Maximum discount cap (for percentage discounts)
	maxDiscount: {
		type: Number,
		min: 0,
	},

	// What the offer applies to
	applicableTo: {
		type: String,
		required: true,
		enum: ['all', 'products', 'categories'],
		default: 'all',
	},

	// Specific products this offer applies to (if applicableTo is 'products')
	products: [{
		type: Schema.Types.ObjectId,
		ref: "Product",
	}],

	// Specific categories this offer applies to (if applicableTo is 'categories')
	categories: [{
		type: Schema.Types.ObjectId,
		ref: "Category",
	}],

	// Offer conditions
	conditions: {
		minOrderAmount: {
			type: Number,
			min: 0,
			default: 0,
		},
		minQuantity: {
			type: Number,
			min: 0,
			default: 0,
		},
		maxUses: {
			type: Number,
			min: 0,
		},
		maxUsesPerUser: {
			type: Number,
			min: 0,
		},
		// For buy_x_get_y offers
		buyQuantity: {
			type: Number,
			min: 1,
		},
		getQuantity: {
			type: Number,
			min: 1,
		},
		// For bundle offers
		bundleProducts: [{
			product: {
				type: Schema.Types.ObjectId,
				ref: "Product",
			},
			quantity: {
				type: Number,
				min: 1,
			},
		}],
		bundlePrice: {
			type: Number,
			min: 0,
		},
	},

	// Usage tracking
	usage: {
		totalUses: {
			type: Number,
			default: 0,
			min: 0,
		},
		usedBy: [{
			user: {
				type: Schema.Types.ObjectId,
				ref: "User",
			},
			order: {
				type: Schema.Types.ObjectId,
				ref: "Order",
			},
			usedAt: {
				type: Date,
				default: Date.now,
			},
			discountApplied: {
				type: Number,
			},
		}],
	},

	// Validity period
	fromDate: {
		type: Date,
		required: true,
		index: true,
	},
	toDate: {
		type: Date,
		required: true,
		index: true,
	},

	// Offer status
	status: {
		type: String,
		required: true,
		enum: ['draft', 'active', 'scheduled', 'expired', 'disabled'],
		default: 'draft',
		index: true,
	},

	// Visibility
	isVisible: {
		type: Boolean,
		default: true,
	},

	// Priority (for stacking rules)
	priority: {
		type: Number,
		default: 0,
	},

	// Can be combined with other offers
	stackable: {
		type: Boolean,
		default: false,
	},

	// Admin fields
	createdBy: {
		type: Schema.Types.ObjectId,
		ref: "User",
	},
	updatedBy: {
		type: Schema.Types.ObjectId,
		ref: "User",
	},
}, MainSchemaOptions);

/**
 * Pre-save middleware to auto-update status based on dates
 */
OfferSchema.pre("save", function (next) {
	const now = new Date();

	// Don't override disabled or draft status
	if (this.status === 'disabled' || this.status === 'draft') {
		return next();
	}

	// Auto-update status based on dates
	if (now < this.fromDate) {
		this.status = 'scheduled';
	} else if (now > this.toDate) {
		this.status = 'expired';
	} else {
		this.status = 'active';
	}

	next();
});

/**
 * Check if offer is valid for a given order
 *
 * @param {Object} order - Order to validate against
 * @param {ObjectId} userId - User attempting to use offer
 * @returns {Object} { isValid: boolean, reason?: string, discount?: number }
 */
OfferSchema.methods.isValidForOrder = async function(order, userId) {
	const now = new Date();

	// Check status
	if (this.status !== 'active') {
		return { isValid: false, reason: `Offer is ${this.status}` };
	}

	// Check date validity
	if (now < this.fromDate || now > this.toDate) {
		return { isValid: false, reason: 'Offer is not currently valid' };
	}

	// Check minimum order amount
	if (this.conditions.minOrderAmount && order.totalPrice < this.conditions.minOrderAmount) {
		return {
			isValid: false,
			reason: `Minimum order amount is KES ${this.conditions.minOrderAmount}`,
		};
	}

	// Check total uses
	if (this.conditions.maxUses && this.usage.totalUses >= this.conditions.maxUses) {
		return { isValid: false, reason: 'Offer usage limit reached' };
	}

	// Check per-user usage limit
	if (this.conditions.maxUsesPerUser) {
		const userUsage = this.usage.usedBy.filter(
			(u) => u.user.toString() === userId.toString()
		).length;

		if (userUsage >= this.conditions.maxUsesPerUser) {
			return { isValid: false, reason: 'You have reached your usage limit for this offer' };
		}
	}

	// Check product/category applicability
	if (this.applicableTo === 'products' && this.products.length > 0) {
		const orderProductIds = order.products.map((p) => p.product.toString());
		const hasApplicableProduct = this.products.some(
			(p) => orderProductIds.includes(p.toString())
		);

		if (!hasApplicableProduct) {
			return { isValid: false, reason: 'Offer does not apply to items in your cart' };
		}
	}

	// Calculate discount
	let discount = 0;

	switch (this.offerType) {
		case 'percentage_discount':
			discount = (order.totalPrice * this.discountValue) / 100;
			if (this.maxDiscount && discount > this.maxDiscount) {
				discount = this.maxDiscount;
			}
			break;

		case 'fixed_discount':
			discount = Math.min(this.discountValue, order.totalPrice);
			break;

		case 'free_delivery':
			discount = order.deliveryFee || 0;
			break;

		case 'buy_x_get_y':
			// Calculate based on qualifying products
			// This would need product-level calculation
			discount = this.discountValue || 0;
			break;

		case 'bundle_offer':
			// Bundle price difference
			if (this.conditions.bundlePrice) {
				const bundleTotal = order.totalPrice; // Simplified
				discount = Math.max(0, bundleTotal - this.conditions.bundlePrice);
			}
			break;

		case 'category_discount':
			// Apply percentage to category items
			discount = (order.totalPrice * this.discountValue) / 100;
			if (this.maxDiscount && discount > this.maxDiscount) {
				discount = this.maxDiscount;
			}
			break;
	}

	return {
		isValid: true,
		discount: Math.round(discount * 100) / 100,
		offerType: this.offerType,
	};
};

/**
 * Record usage of this offer
 *
 * @param {ObjectId} userId - User ID
 * @param {ObjectId} orderId - Order ID
 * @param {number} discountApplied - Discount amount applied
 */
OfferSchema.methods.recordUsage = async function(userId, orderId, discountApplied) {
	this.usage.totalUses += 1;
	this.usage.usedBy.push({
		user: userId,
		order: orderId,
		usedAt: new Date(),
		discountApplied,
	});

	await this.save();
};

/**
 * Static method to get active offers
 *
 * @param {Object} filter - Additional filters
 * @returns {Promise<Array>} Active offers
 */
OfferSchema.statics.getActiveOffers = async function(filter = {}) {
	const now = new Date();

	return this.find({
		status: 'active',
		fromDate: { $lte: now },
		toDate: { $gte: now },
		isVisible: true,
		...filter,
	})
	.sort({ priority: -1, createdAt: -1 })
	.populate('products', 'productName unitPrice imageUrl')
	.populate('categories', 'name');
};

/**
 * Static method to find applicable offers for an order
 *
 * @param {Object} order - Order object
 * @param {ObjectId} userId - User ID
 * @returns {Promise<Array>} Applicable offers with discount info
 */
OfferSchema.statics.findApplicableOffers = async function(order, userId) {
	const activeOffers = await this.getActiveOffers();
	const applicableOffers = [];

	for (const offer of activeOffers) {
		const validation = await offer.isValidForOrder(order, userId);
		if (validation.isValid) {
			applicableOffers.push({
				offer,
				discount: validation.discount,
				offerType: validation.offerType,
			});
		}
	}

	// Sort by discount amount (highest first)
	return applicableOffers.sort((a, b) => b.discount - a.discount);
};

// Indexes
OfferSchema.index({ status: 1, fromDate: 1, toDate: 1 });
OfferSchema.index({ applicableTo: 1, products: 1 });
OfferSchema.index({ applicableTo: 1, categories: 1 });

const Offer = mongoose.models.Offer || mongoose.model("Offer", OfferSchema);

module.exports = Offer;
