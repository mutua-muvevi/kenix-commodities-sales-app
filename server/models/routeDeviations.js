/**
 * Route Deviation Model
 *
 * Logs instances where riders deviate significantly from their assigned routes
 * Used for security, theft prevention, and performance monitoring
 */

const mongoose = require('mongoose');

const routeDeviationSchema = new mongoose.Schema(
	{
		// Rider information
		riderId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			index: true,
		},
		riderName: {
			type: String,
			required: true,
		},

		// Route information
		routeId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Route',
			required: true,
			index: true,
		},
		currentDeliveryId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Delivery',
		},

		// Location data
		actualLocation: {
			type: {
				type: String,
				enum: ['Point'],
				default: 'Point',
			},
			coordinates: {
				type: [Number], // [longitude, latitude]
				required: true,
			},
		},
		expectedLocation: {
			type: {
				type: String,
				enum: ['Point'],
				default: 'Point',
			},
			coordinates: {
				type: [Number], // [longitude, latitude]
				required: true,
			},
		},

		// Deviation metrics
		deviationDistance: {
			type: Number, // Distance in kilometers
			required: true,
		},
		severity: {
			type: String,
			enum: ['none', 'minor', 'warning', 'critical'],
			required: true,
			default: 'minor',
		},

		// Additional context
		timestamp: {
			type: Date,
			default: Date.now,
			index: true,
		},
		adminNotified: {
			type: Boolean,
			default: false,
		},
		adminResponse: {
			type: String,
			enum: ['pending', 'reviewed', 'justified', 'flagged', 'ignored'],
			default: 'pending',
		},
		adminNotes: {
			type: String,
		},
		reviewedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
		reviewedAt: {
			type: Date,
		},

		// System metadata
		createdAt: {
			type: Date,
			default: Date.now,
			immutable: true,
		},
	},
	{
		timestamps: false, // We're using custom timestamp field
	}
);

// Indexes for efficient querying
routeDeviationSchema.index({ riderId: 1, timestamp: -1 });
routeDeviationSchema.index({ routeId: 1, timestamp: -1 });
routeDeviationSchema.index({ severity: 1, adminResponse: 1 });
routeDeviationSchema.index({ actualLocation: '2dsphere' });
routeDeviationSchema.index({ timestamp: -1 });

// Virtual for formatted deviation distance
routeDeviationSchema.virtual('formattedDistance').get(function () {
	if (this.deviationDistance < 1) {
		return `${Math.round(this.deviationDistance * 1000)}m`;
	}
	return `${this.deviationDistance.toFixed(1)}km`;
});

// Virtual for location in lat/lng format
routeDeviationSchema.virtual('actualLocationLatLng').get(function () {
	return {
		lat: this.actualLocation.coordinates[1],
		lng: this.actualLocation.coordinates[0],
	};
});

routeDeviationSchema.virtual('expectedLocationLatLng').get(function () {
	return {
		lat: this.expectedLocation.coordinates[1],
		lng: this.expectedLocation.coordinates[0],
	};
});

// Static method to log a deviation
routeDeviationSchema.statics.logDeviation = async function (deviationData) {
	const {
		riderId,
		riderName,
		routeId,
		currentDeliveryId,
		actualLocation,
		expectedLocation,
		deviationDistance,
		severity,
	} = deviationData;

	const deviation = new this({
		riderId,
		riderName,
		routeId,
		currentDeliveryId,
		actualLocation: {
			type: 'Point',
			coordinates: [actualLocation.lng, actualLocation.lat],
		},
		expectedLocation: {
			type: 'Point',
			coordinates: [expectedLocation.lng, expectedLocation.lat],
		},
		deviationDistance,
		severity,
		adminNotified: severity === 'warning' || severity === 'critical',
	});

	await deviation.save();
	return deviation;
};

// Static method to get deviations by rider
routeDeviationSchema.statics.getByRider = async function (
	riderId,
	options = {}
) {
	const {
		startDate,
		endDate,
		severity,
		limit = 50,
		skip = 0,
	} = options;

	const query = { riderId };

	if (startDate || endDate) {
		query.timestamp = {};
		if (startDate) query.timestamp.$gte = new Date(startDate);
		if (endDate) query.timestamp.$lte = new Date(endDate);
	}

	if (severity) {
		query.severity = severity;
	}

	const deviations = await this.find(query)
		.sort({ timestamp: -1 })
		.limit(limit)
		.skip(skip)
		.populate('riderId', 'firstName lastName phoneNumber')
		.populate('routeId', 'routeName status')
		.populate('reviewedBy', 'firstName lastName');

	const total = await this.countDocuments(query);

	return {
		deviations,
		total,
		hasMore: total > skip + limit,
	};
};

// Static method to get deviations by route
routeDeviationSchema.statics.getByRoute = async function (
	routeId,
	options = {}
) {
	const { severity, limit = 50, skip = 0 } = options;

	const query = { routeId };

	if (severity) {
		query.severity = severity;
	}

	const deviations = await this.find(query)
		.sort({ timestamp: -1 })
		.limit(limit)
		.skip(skip)
		.populate('riderId', 'firstName lastName phoneNumber')
		.populate('currentDeliveryId', 'shopId status');

	const total = await this.countDocuments(query);

	return {
		deviations,
		total,
		hasMore: total > skip + limit,
	};
};

// Static method to get pending admin reviews
routeDeviationSchema.statics.getPendingReviews = async function (options = {}) {
	const { limit = 50, skip = 0 } = options;

	const query = {
		severity: { $in: ['warning', 'critical'] },
		adminResponse: 'pending',
	};

	const deviations = await this.find(query)
		.sort({ timestamp: -1 })
		.limit(limit)
		.skip(skip)
		.populate('riderId', 'firstName lastName phoneNumber')
		.populate('routeId', 'routeName status')
		.populate('currentDeliveryId', 'shopId status');

	const total = await this.countDocuments(query);

	return {
		deviations,
		total,
		hasMore: total > skip + limit,
	};
};

// Static method to get deviation statistics for a rider
routeDeviationSchema.statics.getRiderStats = async function (
	riderId,
	options = {}
) {
	const { startDate, endDate } = options;

	const matchQuery = { riderId: mongoose.Types.ObjectId(riderId) };

	if (startDate || endDate) {
		matchQuery.timestamp = {};
		if (startDate) matchQuery.timestamp.$gte = new Date(startDate);
		if (endDate) matchQuery.timestamp.$lte = new Date(endDate);
	}

	const stats = await this.aggregate([
		{ $match: matchQuery },
		{
			$group: {
				_id: '$severity',
				count: { $sum: 1 },
				avgDistance: { $avg: '$deviationDistance' },
				maxDistance: { $max: '$deviationDistance' },
			},
		},
	]);

	const total = await this.countDocuments(matchQuery);

	const statsByType = {};
	stats.forEach((stat) => {
		statsByType[stat._id] = {
			count: stat.count,
			avgDistance: stat.avgDistance,
			maxDistance: stat.maxDistance,
		};
	});

	return {
		total,
		byType: statsByType,
	};
};

// Instance method to mark as reviewed
routeDeviationSchema.methods.markReviewed = async function (
	adminId,
	response,
	notes
) {
	this.adminResponse = response;
	this.adminNotes = notes;
	this.reviewedBy = adminId;
	this.reviewedAt = new Date();
	await this.save();
	return this;
};

// Ensure virtuals are included in JSON
routeDeviationSchema.set('toJSON', { virtuals: true });
routeDeviationSchema.set('toObject', { virtuals: true });

const RouteDeviation = mongoose.model('RouteDeviation', routeDeviationSchema);

module.exports = RouteDeviation;
