/**
 * Geospatial Utility Functions
 *
 * Provides functions for distance calculations and geofencing
 * Used for delivery location verification
 */

/**
 * Calculate distance between two coordinates using Haversine formula
 *
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
	const R = 6371; // Earth's radius in kilometers
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
 * Check if a location is within a geofence (circular radius)
 *
 * @param {Object} location1 - { lat, lng }
 * @param {Object} location2 - { lat, lng }
 * @param {number} radius - Radius in kilometers (default: 0.1 = 100 meters)
 * @returns {boolean} True if location1 is within radius of location2
 */
const isWithinGeofence = (location1, location2, radius = 0.1) => {
	if (!location1 || !location2 || !location1.lat || !location1.lng || !location2.lat || !location2.lng) {
		return false;
	}

	const distance = calculateDistance(
		location1.lat,
		location1.lng,
		location2.lat,
		location2.lng
	);

	return distance <= radius;
};

/**
 * Calculate bearing (direction) between two points
 *
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Bearing in degrees (0-360)
 */
const calculateBearing = (lat1, lon1, lat2, lon2) => {
	const dLon = ((lon2 - lon1) * Math.PI) / 180;
	const y = Math.sin(dLon) * Math.cos((lat2 * Math.PI) / 180);
	const x =
		Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
		Math.sin((lat1 * Math.PI) / 180) *
			Math.cos((lat2 * Math.PI) / 180) *
			Math.cos(dLon);

	let bearing = (Math.atan2(y, x) * 180) / Math.PI;
	bearing = (bearing + 360) % 360;

	return bearing;
};

/**
 * Convert distance to human-readable format
 *
 * @param {number} distanceKm - Distance in kilometers
 * @returns {string} Formatted distance (e.g., "1.5 km" or "500 m")
 */
const formatDistance = (distanceKm) => {
	if (distanceKm < 1) {
		return `${Math.round(distanceKm * 1000)} m`;
	}
	return `${distanceKm.toFixed(2)} km`;
};

/**
 * Estimate travel time based on distance
 *
 * @param {number} distanceKm - Distance in kilometers
 * @param {number} avgSpeed - Average speed in km/h (default: 30)
 * @returns {number} Estimated time in minutes
 */
const estimateTravelTime = (distanceKm, avgSpeed = 30) => {
	const hours = distanceKm / avgSpeed;
	return Math.round(hours * 60); // Convert to minutes
};

/**
 * Check if a point is within a polygon (for coverage areas)
 *
 * @param {Object} point - { lat, lng }
 * @param {Array} polygon - Array of { lat, lng } points
 * @returns {boolean} True if point is inside polygon
 */
const isPointInPolygon = (point, polygon) => {
	const x = point.lng;
	const y = point.lat;

	let inside = false;
	for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
		const xi = polygon[i].lng;
		const yi = polygon[i].lat;
		const xj = polygon[j].lng;
		const yj = polygon[j].lat;

		const intersect =
			yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

		if (intersect) inside = !inside;
	}

	return inside;
};

/**
 * Calculate center point (centroid) of multiple coordinates
 *
 * @param {Array} coordinates - Array of { lat, lng } objects
 * @returns {Object} Center point { lat, lng }
 */
const calculateCentroid = (coordinates) => {
	if (!coordinates || coordinates.length === 0) {
		return null;
	}

	let totalLat = 0;
	let totalLng = 0;

	coordinates.forEach((coord) => {
		totalLat += coord.lat;
		totalLng += coord.lng;
	});

	return {
		lat: totalLat / coordinates.length,
		lng: totalLng / coordinates.length,
	};
};

module.exports = {
	calculateDistance,
	isWithinGeofence,
	calculateBearing,
	formatDistance,
	estimateTravelTime,
	isPointInPolygon,
	calculateCentroid,
};
