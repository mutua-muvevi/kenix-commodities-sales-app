/**
 * Route Validation Schemas
 *
 * Joi validation schemas for route-related endpoints
 */

const Joi = require('joi');

/**
 * Validation schema for creating a new route
 */
const createRouteSchema = Joi.object({
	routeName: Joi.string()
		.trim()
		.min(2)
		.max(100)
		.required()
		.messages({
			'string.empty': 'Route name is required',
			'string.min': 'Route name must be at least 2 characters',
			'string.max': 'Route name cannot exceed 100 characters',
		}),

	routeCode: Joi.string()
		.trim()
		.uppercase()
		.min(2)
		.max(50)
		.required()
		.messages({
			'string.empty': 'Route code is required',
			'string.min': 'Route code must be at least 2 characters',
			'string.max': 'Route code cannot exceed 50 characters',
		}),

	description: Joi.string()
		.trim()
		.max(500)
		.allow('')
		.messages({
			'string.max': 'Description cannot exceed 500 characters',
		}),

	assignedSalesAgent: Joi.string()
		.trim()
		.length(24)
		.messages({
			'string.length': 'Invalid sales agent ID format',
		}),

	operatingDays: Joi.array()
		.items(
			Joi.string().lowercase().valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')
		)
		.messages({
			'any.only': 'Operating days must be valid day names',
		}),

	startTime: Joi.string()
		.trim()
		.pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
		.messages({
			'string.pattern.base': 'Start time must be in HH:MM format',
		}),

	endTime: Joi.string()
		.trim()
		.pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
		.messages({
			'string.pattern.base': 'End time must be in HH:MM format',
		}),
});

/**
 * Validation schema for updating a route
 */
const updateRouteSchema = Joi.object({
	routeName: Joi.string()
		.trim()
		.min(2)
		.max(100)
		.messages({
			'string.min': 'Route name must be at least 2 characters',
			'string.max': 'Route name cannot exceed 100 characters',
		}),

	description: Joi.string()
		.trim()
		.max(500)
		.allow(''),

	assignedSalesAgent: Joi.string()
		.trim()
		.length(24)
		.allow(null),

	status: Joi.string()
		.lowercase()
		.valid('active', 'inactive', 'archived'),

	operatingDays: Joi.array()
		.items(
			Joi.string().lowercase().valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')
		),

	startTime: Joi.string()
		.trim()
		.pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),

	endTime: Joi.string()
		.trim()
		.pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
}).min(1);

/**
 * Validation schema for assigning rider to route
 */
const assignRiderSchema = Joi.object({
	riderId: Joi.string()
		.trim()
		.length(24)
		.required()
		.messages({
			'string.empty': 'Rider ID is required',
			'string.length': 'Invalid rider ID format',
		}),
});

/**
 * Validation schema for setting shop sequence
 */
const setShopSequenceSchema = Joi.object({
	shops: Joi.array()
		.items(
			Joi.object({
				shopId: Joi.string()
					.trim()
					.length(24)
					.required()
					.messages({
						'string.empty': 'Shop ID is required',
						'string.length': 'Invalid shop ID format',
					}),

				sequenceNumber: Joi.number()
					.integer()
					.min(1)
					.required()
					.messages({
						'number.min': 'Sequence number must be at least 1',
						'any.required': 'Sequence number is required',
					}),

				estimatedArrivalTime: Joi.string()
					.trim()
					.pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
					.messages({
						'string.pattern.base': 'Estimated arrival time must be in HH:MM format',
					}),

				notes: Joi.string()
					.trim()
					.max(500)
					.allow(''),
			})
		)
		.min(1)
		.required()
		.messages({
			'array.min': 'At least one shop must be provided',
			'any.required': 'Shops array is required',
		}),
});

/**
 * Validation schema for admin override
 */
const adminOverrideSchema = Joi.object({
	canSkipShops: Joi.boolean()
		.required()
		.messages({
			'any.required': 'Override permission is required',
		}),

	overrideReason: Joi.string()
		.trim()
		.max(500)
		.when('canSkipShops', {
			is: true,
			then: Joi.required(),
			otherwise: Joi.optional(),
		})
		.messages({
			'string.max': 'Override reason cannot exceed 500 characters',
			'any.required': 'Reason is required when enabling shop skipping',
		}),
});

module.exports = {
	createRouteSchema,
	updateRouteSchema,
	assignRiderSchema,
	setShopSequenceSchema,
	adminOverrideSchema,
};
