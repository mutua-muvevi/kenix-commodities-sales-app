//package imports
const mongoose = require("mongoose");

//initialization
const { Schema } = mongoose;

//schema options
const MainSchemaOptions = {
	timestamps: true,
	collection: "routes",
	optimisticConcurrency: true,
};

/**
 * Route Model - Delivery Route Management with Sequential Delivery
 *
 * This model manages delivery routes with shops in a specific sequence.
 * CRITICAL BUSINESS RULE: Riders MUST deliver in sequence and cannot skip shops.
 *
 * Features:
 * - Route assignment to riders/sales agents
 * - Sequential shop ordering for deliveries
 * - Geospatial data for route optimization
 * - Progress tracking
 * - Admin override capability for closed/unavailable shops
 */
const RouteSchema = new Schema({
	routeName: {
		type: String,
		required: true,
		trim: true,
		index: true,
	},

	routeCode: {
		type: String,
		required: true,
		unique: true,
		trim: true,
		uppercase: true,
		index: true,
		// e.g., "RT-NAIROBI-001"
	},

	description: {
		type: String,
		trim: true,
	},

	// Geographic area covered by this route
	coverageArea: {
		type: {
			type: String,
			enum: ['Polygon'],
		},
		coordinates: {
			type: [[[Number]]], // Array of linear rings (polygon)
		},
	},

	// Shops on this route in SEQUENTIAL order
	shops: [
		{
			shop: {
				type: Schema.Types.ObjectId,
				ref: "User", // Reference to shop user
				required: true,
			},
			sequenceNumber: {
				type: Number,
				required: true,
				min: 1,
				// Determines delivery order - CRITICAL for business logic
			},
			estimatedArrivalTime: {
				type: String,
				trim: true,
				// Format: "HH:MM" - estimated time for this stop
			},
			location: {
				type: {
					type: String,
					enum: ['Point'],
				},
				coordinates: {
					type: [Number], // [longitude, latitude]
				},
			},
			isActive: {
				type: Boolean,
				default: true,
				// Can be set to false if shop temporarily unavailable
			},
			notes: {
				type: String,
				trim: true,
				// Delivery-specific notes for this shop
			},
		}
	],

	// Rider/sales agent assignment
	assignedRider: {
		type: Schema.Types.ObjectId,
		ref: "User",
		index: true,
	},
	assignedSalesAgent: {
		type: Schema.Types.ObjectId,
		ref: "User",
		index: true,
		// Sales agent who manages this territory
	},

	// Route status
	status: {
		type: String,
		required: true,
		trim: true,
		lowercase: true,
		enum: ['active', 'inactive', 'archived'],
		default: 'active',
		index: true,
	},

	// Current delivery progress (for active deliveries)
	currentProgress: {
		isInProgress: {
			type: Boolean,
			default: false,
		},
		currentShopIndex: {
			type: Number,
			default: 0,
			// Index in shops array - indicates which shop rider is currently at
		},
		startedAt: {
			type: Date,
		},
		expectedCompletionTime: {
			type: Date,
		},
	},

	// Admin override settings
	adminOverrides: {
		canSkipShops: {
			type: Boolean,
			default: false,
			// If true, allows rider to skip shops (emergency override)
		},
		overrideReason: {
			type: String,
			trim: true,
		},
		overrideBy: {
			type: Schema.Types.ObjectId,
			ref: "User",
		},
		overrideAt: {
			type: Date,
		},
	},

	// Route statistics
	stats: {
		totalShops: {
			type: Number,
			default: 0,
		},
		estimatedDuration: {
			type: Number,
			default: 0,
			// In minutes
		},
		estimatedDistance: {
			type: Number,
			default: 0,
			// In kilometers
		},
		averageDeliveryTime: {
			type: Number,
			default: 0,
			// Historical average in minutes
		},
	},

	// Operating schedule
	operatingDays: [
		{
			type: String,
			enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
		}
	],
	startTime: {
		type: String,
		trim: true,
		// Format: "HH:MM"
	},
	endTime: {
		type: String,
		trim: true,
		// Format: "HH:MM"
	},

	createdBy: {
		type: Schema.Types.ObjectId,
		ref: "User",
	},
	updatedBy: {
		type: Schema.Types.ObjectId,
		ref: "User",
	},

}, MainSchemaOptions);

// Middleware to update totalShops stat
RouteSchema.pre("save", function (next) {
	if (this.isModified('shops')) {
		this.stats.totalShops = this.shops.filter(s => s.isActive).length;
	}
	next();
});

// Method to get shops in sequence order
RouteSchema.methods.getShopsInSequence = function() {
	return this.shops
		.filter(s => s.isActive)
		.sort((a, b) => a.sequenceNumber - b.sequenceNumber);
};

// Method to get next shop in sequence
RouteSchema.methods.getNextShop = function() {
	const sortedShops = this.getShopsInSequence();
	if (!this.currentProgress.isInProgress) {
		return sortedShops[0] || null;
	}

	const currentIndex = this.currentProgress.currentShopIndex;
	return sortedShops[currentIndex + 1] || null;
};

// Method to validate if rider can deliver to a specific shop
RouteSchema.methods.canDeliverToShop = function(shopId) {
	const sortedShops = this.getShopsInSequence();
	const currentIndex = this.currentProgress.currentShopIndex;

	// If admin override is enabled, allow any shop
	if (this.adminOverrides.canSkipShops) {
		return {
			allowed: true,
			reason: 'Admin override enabled',
		};
	}

	// Check if it's the next shop in sequence
	const nextShop = sortedShops[currentIndex];
	if (!nextShop) {
		return {
			allowed: false,
			reason: 'No shops remaining on route',
		};
	}

	if (nextShop.shop.toString() === shopId.toString()) {
		return {
			allowed: true,
			reason: 'Next shop in sequence',
		};
	}

	return {
		allowed: false,
		reason: `Must deliver to shop at sequence ${nextShop.sequenceNumber} first`,
		nextShop: nextShop.shop,
	};
};

// Static method to optimize route order based on geospatial data
RouteSchema.statics.optimizeShopSequence = async function(routeId) {
	// This would integrate with a route optimization algorithm
	// For now, it's a placeholder for future implementation with Google Maps API or similar
	const route = await this.findById(routeId);
	if (!route) {
		throw new Error('Route not found');
	}

	// TODO: Implement actual optimization using TSP (Traveling Salesman Problem) algorithm
	// or integrate with Google Maps Distance Matrix API

	return route;
};

// Indexes for efficient queries
RouteSchema.index({ routeCode: 1 });
RouteSchema.index({ assignedRider: 1, status: 1 });
RouteSchema.index({ assignedSalesAgent: 1, status: 1 });
RouteSchema.index({ 'shops.shop': 1 });
RouteSchema.index({ coverageArea: '2dsphere' });

const Route = mongoose.models.Route || mongoose.model("Route", RouteSchema);

module.exports = Route;
