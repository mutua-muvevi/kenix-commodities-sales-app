/**
 * Optimize Route Controller
 *
 * POST /api/routes/:id/optimize
 * Accessible by: admin only
 *
 * Optimizes shop sequence based on geospatial data
 * Uses simple nearest-neighbor algorithm (TSP approximation)
 * Can be enhanced with Google Maps Distance Matrix API
 */

const Route = require('../../models/routes');

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {Object} coord1 - {lat, lng}
 * @param {Object} coord2 - {lat, lng}
 * @returns {number} Distance in kilometers
 */
const calculateDistance = (coord1, coord2) => {
	if (!coord1 || !coord2 || !coord1.coordinates || !coord2.coordinates) {
		return Infinity;
	}

	const [lon1, lat1] = coord1.coordinates;
	const [lon2, lat2] = coord2.coordinates;

	const R = 6371; // Earth's radius in km
	const dLat = ((lat2 - lat1) * Math.PI) / 180;
	const dLon = ((lon2 - lon1) * Math.PI) / 180;

	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos((lat1 * Math.PI) / 180) *
			Math.cos((lat2 * Math.PI) / 180) *
			Math.sin(dLon / 2) *
			Math.sin(dLon / 2);

	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return R * c;
};

/**
 * Nearest neighbor TSP approximation
 * @param {Array} shops - Array of shop objects with locations
 * @returns {Array} Optimized shops array
 */
const optimizeSequence = (shops) => {
	if (shops.length <= 2) {
		return shops;
	}

	// Filter shops with valid locations
	const shopsWithLocations = shops.filter((s) => s.location && s.location.coordinates);

	if (shopsWithLocations.length === 0) {
		// No locations, return original order
		return shops;
	}

	const unvisited = [...shopsWithLocations];
	const optimized = [];

	// Start with first shop
	let current = unvisited.shift();
	optimized.push(current);

	// Nearest neighbor algorithm
	while (unvisited.length > 0) {
		let nearestIndex = 0;
		let minDistance = Infinity;

		for (let i = 0; i < unvisited.length; i++) {
			const distance = calculateDistance(current.location, unvisited[i].location);
			if (distance < minDistance) {
				minDistance = distance;
				nearestIndex = i;
			}
		}

		current = unvisited.splice(nearestIndex, 1)[0];
		optimized.push(current);
	}

	return optimized;
};

/**
 * @route   POST /api/routes/:id/optimize
 * @desc    Optimize route shop sequence based on geospatial data
 * @access  Private (admin only)
 *
 * @param {string} id - Route ID
 *
 * @returns {Object} Optimized route with distance/time savings
 */
const optimizeRoute = async (req, res) => {
	try {
		const { id } = req.params;
		const adminId = req.user._id;

		// Find route
		const route = await Route.findById(id).populate('shops.shop', 'shopName location');

		if (!route) {
			return res.status(404).json({
				success: false,
				message: 'Route not found',
				errors: ['No route exists with the specified ID'],
			});
		}

		// Check route is not in progress
		if (route.currentProgress.isInProgress) {
			return res.status(400).json({
				success: false,
				message: 'Cannot optimize route in progress',
				errors: ['Route is currently active'],
			});
		}

		// Calculate current total distance
		let currentDistance = 0;
		for (let i = 0; i < route.shops.length - 1; i++) {
			const distance = calculateDistance(route.shops[i].location, route.shops[i + 1].location);
			if (distance !== Infinity) {
				currentDistance += distance;
			}
		}

		// Optimize sequence
		const optimizedShops = optimizeSequence([...route.shops]);

		// Calculate optimized distance
		let optimizedDistance = 0;
		for (let i = 0; i < optimizedShops.length - 1; i++) {
			const distance = calculateDistance(
				optimizedShops[i].location,
				optimizedShops[i + 1].location
			);
			if (distance !== Infinity) {
				optimizedDistance += distance;
			}
		}

		// Update sequence numbers
		optimizedShops.forEach((shop, index) => {
			shop.sequenceNumber = index + 1;
		});

		// Update route
		route.shops = optimizedShops;
		route.stats.estimatedDistance = Math.round(optimizedDistance * 100) / 100;
		route.updatedBy = adminId;

		await route.save();

		// Populate for response
		const populatedRoute = await Route.findById(route._id)
			.populate('shops.shop', 'shopName phoneNumber location')
			.populate('updatedBy', 'firstName lastName');

		const distanceSaved = currentDistance - optimizedDistance;
		const percentageSaved =
			currentDistance > 0 ? ((distanceSaved / currentDistance) * 100).toFixed(2) : 0;

		return res.status(200).json({
			success: true,
			message: 'Route optimized successfully',
			data: {
				route: populatedRoute,
				optimization: {
					previousDistance: Math.round(currentDistance * 100) / 100,
					optimizedDistance: Math.round(optimizedDistance * 100) / 100,
					distanceSaved: Math.round(distanceSaved * 100) / 100,
					percentageSaved: `${percentageSaved}%`,
					estimatedTimeSaved: `${Math.round((distanceSaved / 30) * 60)} minutes`, // Assuming 30 km/h average
				},
			},
		});
	} catch (error) {
		console.error('Optimize Route Error:', error);

		return res.status(500).json({
			success: false,
			message: 'Failed to optimize route',
			errors: [error.message],
		});
	}
};

module.exports = optimizeRoute;
