const logger = require("../utils/logger"); // Import your logger
const { isObject, isArray } = require("lodash"); // Use lodash for type checking (install via npm)

// Helper function to sanitize a string
const sanitizeString = (str) => {
	if (typeof str !== "string") {
		return str; // Return non-string values as-is
	}

	return str
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#x27;")
		.replace(/\//g, "&#x2F;");
};

// Helper function to sanitize an object
const sanitizeObject = (obj) => {
	const sanitized = {};

	for (const key in obj) {
		if (Object.prototype.hasOwnProperty.call(obj, key)) {
			const value = obj[key];

			// Sanitize the value
			sanitized[key] = sanitizeValue(value);
		}
	}

	return sanitized;
};

// Helper function to sanitize a value
const sanitizeValue = (value) => {
	if (isObject(value)) {
		return sanitizeObject(value); // Recursively sanitize nested objects
	}

	if (isArray(value)) {
		return value.map(sanitizeValue); // Recursively sanitize arrays
	}

	if (typeof value === "string") {
		return sanitizeString(value); // Sanitize strings
	}

	return value; // Return non-string values as-is
};

// Express sanitizer middleware
const expressSanitizer = (req, res, next) => {
	try {
		// Sanitize request body
		if (req.body && isObject(req.body)) {
			req.body = sanitizeObject(req.body);
		}

		// Sanitize request query
		if (req.query && isObject(req.query)) {
			req.query = sanitizeObject(req.query);
		}

		// Sanitize request params
		if (req.params && isObject(req.params)) {
			req.params = sanitizeObject(req.params);
		}

		next(); // Proceed to the next middleware
	} catch (error) {
		// Log the error using your logger
		logger.error(`Express sanitizer error: ${error.message}`, { stack: error.stack });

		// Check if the error is due to a potential hacking attempt
		if (isPotentialHack(error)) {
			logger.warn(`Potential hacking attempt detected: ${error.message}`, {
				ip: req.ip,
				url: req.originalUrl,
				body: req.body,
				query: req.query,
				params: req.params,
			});
		}

		// Send a generic error response to the client
		res.status(400).json({ message: "Invalid request data" });
	}
};

// Helper function to detect potential hacking attempts
const isPotentialHack = (error) => {
	// Check for common XSS or injection patterns
	const injectionPatterns = [
		/<script>/i,
		/<\/script>/i,
		/onerror=/i,
		/onload=/i,
		/javascript:/i,
		/eval\(/i,
		/alert\(/i,
		/document\.cookie/i,
	];

	return injectionPatterns.some((pattern) => pattern.test(error.message));
};

module.exports = expressSanitizer;

