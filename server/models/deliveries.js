//package imports
const mongoose = require("mongoose");

//initialization
const { Schema } = mongoose;

//schema options
const MainSchemaOptions = {
	timestamps: true,
	collection: "deliveries",
	optimisticConcurrency: true,
};

/**
 * Delivery Model - Individual Delivery Tracking with Sequential Enforcement
 *
 * This model tracks each delivery on a route.
 * CRITICAL BUSINESS RULE: Sequential delivery enforcement - cannot skip shops.
 *
 * Features:
 * - Links orders to routes and shops
 * - Sequential delivery validation
 * - Payment collection tracking
 * - Delivery confirmation (signature/photo)
 * - Real-time status updates
 */
const DeliverySchema = new Schema({
	deliveryCode: {
		type: String,
		required: true,
		unique: true,
		trim: true,
		uppercase: true,
		index: true,
		// e.g., "DEL-20250101-001"
	},

	// Link to order
	order: {
		type: Schema.Types.ObjectId,
		ref: "Order",
		required: true,
		index: true,
	},

	// Link to route
	route: {
		type: Schema.Types.ObjectId,
		ref: "Route",
		required: true,
		index: true,
	},

	// Destination shop
	shop: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: true,
		index: true,
	},

	// Assigned rider
	rider: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: true,
		index: true,
	},

	// Sequential position on route
	sequenceNumber: {
		type: Number,
		required: true,
		min: 1,
		// Must match the sequence in the route
	},

	// Delivery status
	status: {
		type: String,
		required: true,
		trim: true,
		lowercase: true,
		enum: ['pending', 'en_route', 'arrived', 'completed', 'failed', 'skipped'],
		default: 'pending',
		index: true,
	},

	// Sequential enforcement
	canProceed: {
		type: Boolean,
		default: false,
		// Set to true only when previous delivery is completed
	},
	previousDelivery: {
		type: Schema.Types.ObjectId,
		ref: "Delivery",
		// Reference to the delivery that must be completed first
	},

	// Timing information
	scheduledTime: {
		type: Date,
	},
	departedWarehouseAt: {
		type: Date,
	},
	arrivedAtShopAt: {
		type: Date,
	},
	completedAt: {
		type: Date,
	},
	actualDuration: {
		type: Number,
		// In minutes, calculated from departed to completed
	},

	// Location tracking
	shopLocation: {
		type: {
			type: String,
			enum: ['Point'],
		},
		coordinates: {
			type: [Number], // [longitude, latitude]
		},
	},
	actualArrivalLocation: {
		type: {
			type: String,
			enum: ['Point'],
		},
		coordinates: {
			type: [Number], // [longitude, latitude]
			// Where rider actually marked arrival
		},
	},
	distanceFromShop: {
		type: Number,
		// In meters, calculated from actualArrivalLocation to shopLocation
	},

	// Payment collection
	paymentInfo: {
		method: {
			type: String,
			trim: true,
			lowercase: true,
			enum: ['cash', 'mpesa', 'credit', 'not_required'],
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
			enum: ['pending', 'collected', 'failed', 'not_required'],
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
	},

	// Delivery confirmation
	confirmation: {
		recipientName: {
			type: String,
			trim: true,
		},
		recipientPhone: {
			type: String,
			trim: true,
		},
		signature: {
			type: String,
			// URL to signature image in GCP bucket
		},
		photo: {
			type: String,
			// URL to delivery photo in GCP bucket
		},
		notes: {
			type: String,
			trim: true,
		},
		confirmedAt: {
			type: Date,
		},
	},

	// Failure tracking (if delivery fails)
	failureInfo: {
		reason: {
			type: String,
			enum: ['shop_closed', 'recipient_unavailable', 'wrong_address', 'refused_delivery', 'other'],
		},
		description: {
			type: String,
			trim: true,
		},
		photo: {
			type: String,
			// Evidence photo in case of failure
		},
		reportedAt: {
			type: Date,
		},
	},

	// Admin override for skipping
	adminOverride: {
		isOverridden: {
			type: Boolean,
			default: false,
		},
		reason: {
			type: String,
			trim: true,
		},
		overriddenBy: {
			type: Schema.Types.ObjectId,
			ref: "User",
		},
		overriddenAt: {
			type: Date,
		},
	},

	// Delivery items (from order)
	items: [
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
			delivered: {
				type: Number,
				default: 0,
				// Actual quantity delivered (may differ from ordered)
			},
		}
	],

	// Notes and issues
	riderNotes: {
		type: String,
		trim: true,
		// Rider's notes about the delivery
	},
	shopFeedback: {
		type: String,
		trim: true,
		// Shop's feedback/comments
	},
	issues: [
		{
			type: String,
			trim: true,
		}
	],

}, MainSchemaOptions);

// Middleware to calculate actual duration
DeliverySchema.pre("save", function (next) {
	if (this.departedWarehouseAt && this.completedAt) {
		const duration = (this.completedAt - this.departedWarehouseAt) / (1000 * 60); // Convert to minutes
		this.actualDuration = Math.round(duration);
	}
	next();
});

// Method to validate sequential delivery
DeliverySchema.methods.validateSequentialDelivery = async function() {
	if (this.adminOverride.isOverridden) {
		return {
			valid: true,
			reason: 'Admin override enabled',
		};
	}

	if (!this.previousDelivery) {
		// First delivery on route
		return {
			valid: true,
			reason: 'First delivery on route',
		};
	}

	// Check if previous delivery is completed
	const previousDel = await mongoose.model('Delivery').findById(this.previousDelivery);

	if (!previousDel) {
		return {
			valid: false,
			reason: 'Previous delivery not found',
		};
	}

	if (previousDel.status !== 'completed' && previousDel.status !== 'skipped') {
		return {
			valid: false,
			reason: `Previous delivery (${previousDel.deliveryCode}) must be completed first`,
			previousDeliveryCode: previousDel.deliveryCode,
		};
	}

	return {
		valid: true,
		reason: 'Previous delivery completed',
	};
};

// Method to mark delivery as arrived
DeliverySchema.methods.markArrived = async function(location, userId) {
	const validation = await this.validateSequentialDelivery();

	if (!validation.valid) {
		throw new Error(validation.reason);
	}

	this.status = 'arrived';
	this.arrivedAtShopAt = new Date();

	if (location && location.coordinates) {
		this.actualArrivalLocation = location;

		// Calculate distance from shop (if shop location is set)
		if (this.shopLocation && this.shopLocation.coordinates) {
			// Use MongoDB geospatial query or calculate distance
			// For simplicity, we'll use Haversine formula in a separate utility
		}
	}

	await this.save();
	return this;
};

// Method to complete delivery
DeliverySchema.methods.completeDelivery = async function(confirmationData, userId) {
	if (this.status !== 'arrived') {
		throw new Error('Delivery must be marked as arrived before completion');
	}

	// Validate payment is collected if required
	if (this.paymentInfo.amountToCollect > 0 && this.paymentInfo.status !== 'collected') {
		throw new Error('Payment must be collected before completing delivery');
	}

	this.status = 'completed';
	this.completedAt = new Date();

	// Update confirmation data
	if (confirmationData) {
		this.confirmation = {
			...this.confirmation,
			...confirmationData,
			confirmedAt: new Date(),
		};
	}

	await this.save();

	// Enable next delivery in sequence
	const nextDelivery = await mongoose.model('Delivery').findOne({
		route: this.route,
		previousDelivery: this._id,
	});

	if (nextDelivery) {
		nextDelivery.canProceed = true;
		await nextDelivery.save();
	}

	return this;
};

// Static method to create deliveries from route and orders
DeliverySchema.statics.createDeliveriesForRoute = async function(routeId, orders, riderId) {
	const Route = mongoose.model('Route');
	const route = await Route.findById(routeId);

	if (!route) {
		throw new Error('Route not found');
	}

	const sortedShops = route.getShopsInSequence();
	const deliveries = [];
	let previousDelivery = null;

	for (let i = 0; i < sortedShops.length; i++) {
		const shopInRoute = sortedShops[i];

		// Find orders for this shop
		const shopOrders = orders.filter(
			order => order.orderer.toString() === shopInRoute.shop.toString()
		);

		for (const order of shopOrders) {
			const deliveryCode = `DEL-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

			const delivery = new this({
				deliveryCode,
				order: order._id,
				route: routeId,
				shop: shopInRoute.shop,
				rider: riderId,
				sequenceNumber: shopInRoute.sequenceNumber,
				shopLocation: shopInRoute.location,
				previousDelivery: previousDelivery ? previousDelivery._id : null,
				canProceed: i === 0, // First delivery can proceed
				items: order.products.map(p => ({
					product: p.product,
					quantity: p.quantity,
					delivered: 0,
				})),
				paymentInfo: {
					method: order.paymentMethod,
					amountToCollect: order.totalPrice,
					status: order.paymentMethod === 'credit' ? 'not_required' : 'pending',
				},
			});

			await delivery.save();
			deliveries.push(delivery);
			previousDelivery = delivery;
		}
	}

	return deliveries;
};

// Indexes for efficient queries
DeliverySchema.index({ deliveryCode: 1 });
DeliverySchema.index({ order: 1 });
DeliverySchema.index({ route: 1, sequenceNumber: 1 });
DeliverySchema.index({ rider: 1, status: 1 });
DeliverySchema.index({ shop: 1, status: 1 });
DeliverySchema.index({ shopLocation: '2dsphere' });

const Delivery = mongoose.models.Delivery || mongoose.model("Delivery", DeliverySchema);

module.exports = Delivery;
