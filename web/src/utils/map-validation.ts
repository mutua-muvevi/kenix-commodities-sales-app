// src/utils/map-validation.ts
// Utility functions for validating and formatting map coordinates

/**
 * Validates if coordinates are within valid ranges
 */
export const validateCoordinates = (lat: number, lng: number): { isValid: boolean; error?: string } => {
	if (isNaN(lat) || isNaN(lng)) {
		return { isValid: false, error: "Coordinates must be valid numbers" };
	}

	if (lat < -90 || lat > 90) {
		return { isValid: false, error: "Latitude must be between -90 and 90 degrees" };
	}

	if (lng < -180 || lng > 180) {
		return { isValid: false, error: "Longitude must be between -180 and 180 degrees" };
	}

	if (lat === 0 && lng === 0) {
		return { isValid: false, error: "Coordinates cannot be exactly 0,0 (Gulf of Guinea)" };
	}

	return { isValid: true };
};

/**
 * Formats coordinates to a specific decimal precision
 */
export const formatCoordinates = (lat: number, lng: number, precision: number = 6): string => {
	return `${lat.toFixed(precision)}, ${lng.toFixed(precision)}`;
};

/**
 * Converts DMS (Degrees, Minutes, Seconds) to decimal degrees
 */
export const dmsToDecimal = (
	degrees: number,
	minutes: number,
	seconds: number,
	direction: "N" | "S" | "E" | "W",
): number => {
	let decimal = degrees + minutes / 60 + seconds / 3600;
	if (direction === "S" || direction === "W") {
		decimal = -decimal;
	}
	return decimal;
};

/**
 * Converts decimal degrees to DMS format
 */
export const decimalToDms = (decimal: number, isLatitude: boolean = true): string => {
	const absolute = Math.abs(decimal);
	const degrees = Math.floor(absolute);
	const minutes = Math.floor((absolute - degrees) * 60);
	const seconds = ((absolute - degrees) * 60 - minutes) * 60;

	const direction = isLatitude ? (decimal >= 0 ? "N" : "S") : decimal >= 0 ? "E" : "W";

	return `${degrees}°${minutes}'${seconds.toFixed(2)}"${direction}`;
};

/**
 * Calculates distance between two coordinates using Haversine formula
 */
export const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
	const R = 6371; // Earth's radius in kilometers
	const dLat = toRadians(lat2 - lat1);
	const dLng = toRadians(lng2 - lng1);

	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return R * c; // Distance in kilometers
};

const toRadians = (degrees: number): number => {
	return degrees * (Math.PI / 180);
};

/**
 * Gets the appropriate zoom level based on address specificity
 */
export const getOptimalZoom = (address: { street?: string; city?: string; state?: string; country?: string }): number => {
	if (address.street) return 18; // Street level - very detailed
	if (address.city) return 12; // City level
	if (address.state) return 8; // State/Province level
	if (address.country) return 5; // Country level
	return 10; // Default zoom
};

/**
 * Checks if coordinates are likely to be accurate based on precision
 */
export const assessCoordinateAccuracy = (
	lat: number,
	lng: number,
): {
	accuracy: "high" | "medium" | "low";
	precision: number;
	description: string;
} => {
	const latStr = lat.toString();
	const lngStr = lng.toString();

	const latDecimals = latStr.includes(".") ? latStr.split(".")[1].length : 0;
	const lngDecimals = lngStr.includes(".") ? lngStr.split(".")[1].length : 0;

	const precision = Math.min(latDecimals, lngDecimals);

	if (precision >= 6) {
		return {
			accuracy: "high",
			precision,
			description: "Accurate to within ~1 meter",
		};
	} else if (precision >= 4) {
		return {
			accuracy: "medium",
			precision,
			description: "Accurate to within ~10 meters",
		};
	} else {
		return {
			accuracy: "low",
			precision,
			description: "Accurate to within ~100+ meters",
		};
	}
};

/**
 * Generates a Google Maps URL for the coordinates
 */
export const generateGoogleMapsUrl = (lat: number, lng: number, zoom: number = 15): string => {
	return `https://www.google.com/maps/@${lat},${lng},${zoom}z`;
};

/**
 * Generates a what3words-style location description (mock)
 */
export const generateLocationDescription = (lat: number, lng: number): string => {
	// This is a simplified mock - in a real app you'd use the what3words API
	const words = [
		"apple",
		"banana",
		"cherry",
		"dog",
		"elephant",
		"fish",
		"grape",
		"house",
		"ice",
		"jungle",
		"kite",
		"lemon",
		"mountain",
		"night",
		"ocean",
		"pizza",
	];

	const hash = Math.abs(Math.floor(lat * 1000000) + Math.floor(lng * 1000000));
	const word1 = words[hash % words.length];
	const word2 = words[(hash * 2) % words.length];
	const word3 = words[(hash * 3) % words.length];

	return `${word1}.${word2}.${word3}`;
};

/**
 * Extracts coordinates from various text formats
 */
export const parseCoordinatesFromText = (text: string): { lat: number; lng: number } | null => {
	// Remove extra spaces and normalize
	const cleaned = text.trim().replace(/\s+/g, " ");

	// Try various formats:
	// "lat, lng"
	// "lat lng"
	// "lat,lng"
	const patterns = [/^(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)$/, /^(-?\d+\.?\d*)\s*[,]\s*(-?\d+\.?\d*)$/];

	for (const pattern of patterns) {
		const match = cleaned.match(pattern);
		if (match) {
			const lat = parseFloat(match[1]);
			const lng = parseFloat(match[2]);

			const validation = validateCoordinates(lat, lng);
			if (validation.isValid) {
				return { lat, lng };
			}
		}
	}

	return null;
};

/**
 * Default coordinate configurations for different regions
 */
export const REGION_DEFAULTS = {
	kenya: {
		center: { lat: -1.437041393899676, lng: 37.191635586788259 },
		zoom: 6,
		name: "Kenya",
	},
	nairobi: {
		center: { lat: -1.2921, lng: 36.8219 },
		zoom: 10,
		name: "Nairobi",
	},
	usa: {
		center: { lat: 39.8283, lng: -98.5795 },
		zoom: 4,
		name: "United States",
	},
	europe: {
		center: { lat: 54.526, lng: 15.2551 },
		zoom: 4,
		name: "Europe",
	},
	world: {
		center: { lat: 0, lng: 0 },
		zoom: 2,
		name: "World",
	},
};

/**
 * Get default coordinates based on country
 */
export const getDefaultCoordinates = (country?: string): { lat: number; lng: number; zoom: number } => {
	if (!country) return REGION_DEFAULTS.kenya.center;

	const countryLower = country.toLowerCase();

	if (countryLower.includes("kenya")) {
		return REGION_DEFAULTS.kenya.center;
	}
	if (countryLower.includes("united states") || countryLower.includes("usa")) {
		return REGION_DEFAULTS.usa.center;
	}
	if (countryLower.includes("germany") || countryLower.includes("france") || countryLower.includes("italy")) {
		return REGION_DEFAULTS.europe.center;
	}

	// Default to Kenya for now
	return REGION_DEFAULTS.kenya.center;
};
