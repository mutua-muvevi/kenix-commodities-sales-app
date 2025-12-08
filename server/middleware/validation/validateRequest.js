/**
 * Request Validation Middleware
 *
 * Generic middleware factory for validating request data using Joi schemas
 *
 * Usage:
 * const { validateRequest } = require('../middleware/validation/validateRequest');
 * const { createProductSchema } = require('../validators/productValidators');
 *
 * router.post('/products',
 *   authenticationMiddleware,
 *   getMe,
 *   isAdmin,
 *   validateRequest(createProductSchema, 'body'),
 *   createProduct
 * );
 */

/**
 * Validate request data against a Joi schema
 *
 * @param {Object} schema - Joi validation schema
 * @param {string} source - Where to find the data ('body', 'query', 'params')
 * @returns {Function} Express middleware function
 */
const validateRequest = (schema, source = 'body') => {
	return (req, res, next) => {
		try {
			// Get the data to validate from the specified source
			const dataToValidate = req[source];

			if (!dataToValidate) {
				return res.status(400).json({
					success: false,
					message: `No ${source} data provided for validation`,
					errors: [`Request ${source} is empty or undefined`],
				});
			}

			// Validate the data against the schema
			const { error, value } = schema.validate(dataToValidate, {
				abortEarly: false, // Return all errors, not just the first one
				stripUnknown: true, // Remove unknown fields
				convert: true, // Convert types (e.g., string to number)
			});

			if (error) {
				// Format validation errors into a readable array
				const errors = error.details.map(detail => ({
					field: detail.path.join('.'),
					message: detail.message,
					type: detail.type,
				}));

				return res.status(400).json({
					success: false,
					message: 'Validation failed',
					errors: errors,
				});
			}

			// Replace the original data with validated and sanitized data
			req[source] = value;

			next();
		} catch (err) {
			console.error('Validation Middleware Error:', err);
			return res.status(500).json({
				success: false,
				message: 'Internal server error during validation',
				errors: [err.message],
			});
		}
	};
};

/**
 * Validate request body
 * Convenience wrapper for validateRequest(schema, 'body')
 */
const validateBody = (schema) => validateRequest(schema, 'body');

/**
 * Validate request query parameters
 * Convenience wrapper for validateRequest(schema, 'query')
 */
const validateQuery = (schema) => validateRequest(schema, 'query');

/**
 * Validate request URL parameters
 * Convenience wrapper for validateRequest(schema, 'params')
 */
const validateParams = (schema) => validateRequest(schema, 'params');

/**
 * Validate MongoDB ObjectId format
 * Useful for validating route parameters like :id
 */
const validateObjectId = (paramName = 'id') => {
	return (req, res, next) => {
		const id = req.params[paramName];

		if (!id) {
			return res.status(400).json({
				success: false,
				message: `Parameter '${paramName}' is required`,
				errors: [`Missing required parameter: ${paramName}`],
			});
		}

		// MongoDB ObjectId regex pattern
		const objectIdPattern = /^[0-9a-fA-F]{24}$/;

		if (!objectIdPattern.test(id)) {
			return res.status(400).json({
				success: false,
				message: `Invalid ${paramName} format`,
				errors: [`${paramName} must be a valid MongoDB ObjectId (24 hex characters)`],
			});
		}

		next();
	};
};

module.exports = {
	validateRequest,
	validateBody,
	validateQuery,
	validateParams,
	validateObjectId,
};
