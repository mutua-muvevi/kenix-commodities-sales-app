//package imports
const mongoose = require("mongoose");

//initialization
const { Schema } = mongoose;

//shema options
const MainSchemaOptions = {
	timestamps: true,
	collection: "orders",
	optimisticConcurrency: true,
};

const OrderSchema = new Schema({
	orderer: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: true,
		index: true,
	},
	products: [
		{
			product: {
				type: Schema.Types.ObjectId,
				ref: "Product",
			},
			quantity: {
				type: Number,
				required: true,
				min: 1,
			},
			priceAtOrderTime: {
				type: Number,
				required: true,
				min: 0,
				// Price when order was placed (for historical accuracy)
			},
		},
	],
	createdBy: {
		type: Schema.Types.ObjectId,
		ref: "User",
	},
	orderId: {
		type: String,
		required: true,
		unique: true,
		index: true
	},

	// Approval workflow
	approvalStatus: {
		type: String,
		required: true,
		trim: true,
		lowercase: true,
		index: true,
		enum: ["pending", "approved", "rejected"],
		default: "pending",
	},
	approvedBy: {
		type: Schema.Types.ObjectId,
		ref: "User",
		// Admin who approved/rejected the order
	},
	approvedAt: {
		type: Date,
	},
	rejectionReason: {
		type: String,
		trim: true,
	},

	// Delivery information
	deliveryStatus: {
		type: String,
		required: true,
		trim: true,
		lowercase: true,
		index: true,
		enum: ["pending", "assigned", "in_transit", "delivered", "failed"],
		default: "pending",
	},
	assignedRoute: {
		type: Schema.Types.ObjectId,
		ref: "Route",
	},
	assignedRider: {
		type: Schema.Types.ObjectId,
		ref: "User",
	},
	deliveryAddress: {
		location: {
			type: {
				type: String,
				enum: ['Point'],
			},
			coordinates: {
				type: [Number], // [longitude, latitude]
			},
		},
		address: {
			type: String,
			trim: true,
		},
		deliveryNotes: {
			type: String,
			trim: true,
		},
	},
	deliveredAt: {
		type: Date,
	},

	// Payment information
	paymentMethod: {
		type: String,
		required: true,
		trim: true,
		lowercase: true,
		index: true,
		enum: ["cash", "mpesa", "credit"],
	},
	paymentStatus: {
		type: String,
		required: true,
		trim: true,
		lowercase: true,
		index: true,
		enum: ["pending", "confirmed", "failed"],
		default: "pending",
	},
	mpesaTransaction: {
		type: Schema.Types.ObjectId,
		ref: "MpesaTransaction",
	},
	paidAt: {
		type: Date,
	},

	// Order status and pricing
	status: {
		type: String,
		required: true,
		trim: true,
		lowercase: true,
		index: true,
		enum: ["pending", "processing", "completed", "cancelled"],
		default: "pending",
	},
	totalPrice: {
		type: Number,
		required: true,
		min: 0,
	},

	// Offers/discounts applied
	appliedOffers: [{
		offer: {
			type: Schema.Types.ObjectId,
			ref: "Offer",
		},
		offerName: {
			type: String,
		},
		offerCode: {
			type: String,
		},
		offerType: {
			type: String,
			enum: [
				'percentage_discount',
				'fixed_discount',
				'buy_x_get_y',
				'free_delivery',
				'bundle_offer',
				'category_discount',
			],
		},
		discountApplied: {
			type: Number,
			min: 0,
		},
	}],

	// Original price before discounts
	originalPrice: {
		type: Number,
		min: 0,
	},

	// Total discount amount
	totalDiscount: {
		type: Number,
		default: 0,
		min: 0,
	},
}, MainSchemaOptions);

const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);

//middleware that will calculate the total price of the order based on products
//NOTE: This requires products to be populated with actual product data including price
OrderSchema.pre("save", async function (next) {
	try {
		// Only calculate if products exist and totalPrice is not already set
		if (this.products && this.products.length > 0 && !this.totalPrice) {
			// Populate products if not already populated
			await this.populate('products.product');

			this.totalPrice = this.products.reduce((acc, item) => {
				const price = item.product?.unitPrice || 0;
				return acc + (item.quantity * price);
			}, 0);
		}
		next();
	} catch (error) {
		next(error);
	}
})

module.exports = Order;