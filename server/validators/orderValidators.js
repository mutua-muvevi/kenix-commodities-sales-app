/**
 * Order Validation Schemas
 *
 * Joi validation schemas for order-related endpoints
 */

const Joi = require('joi');

/**
 * Validation schema for creating a new order
 */
const createOrderSchema = Joi.object({
	products: Joi.array()
		.items(
			Joi.object({
				product: Joi.string()
					.trim()
					.length(24)
					.required()
					.messages({
						'string.empty': 'Product ID is required',
						'string.length': 'Invalid product ID format',
					}),

				quantity: Joi.number()
					.integer()
					.min(1)
					.required()
					.messages({
						'number.base': 'Quantity must be a number',
						'number.min': 'Quantity must be at least 1',
						'any.required': 'Quantity is required',
					}),
			})
		)
		.min(1)
		.required()
		.messages({
			'array.min': 'Order must contain at least one product',
			'any.required': 'Products array is required',
		}),

	paymentMethod: Joi.string()
		.trim()
		.lowercase()
		.valid('cash', 'mpesa', 'credit')
		.required()
		.messages({
			'any.only': 'Payment method must be one of: cash, mpesa, credit',
			'any.required': 'Payment method is required',
		}),

	deliveryAddress: Joi.object({
		location: Joi.object({
			type: Joi.string()
				.valid('Point')
				.default('Point'),
			coordinates: Joi.array()
				.items(Joi.number())
				.length(2)
				.messages({
					'array.length': 'Coordinates must be [longitude, latitude]',
				}),
		}),
		address: Joi.string()
			.trim()
			.max(500)
			.messages({
				'string.max': 'Address cannot exceed 500 characters',
			}),
		deliveryNotes: Joi.string()
			.trim()
			.max(500)
			.messages({
				'string.max': 'Delivery notes cannot exceed 500 characters',
			}),
	}),
});

/**
 * Validation schema for order query parameters
 */
const orderQuerySchema = Joi.object({
	page: Joi.number()
		.integer()
		.min(1)
		.default(1),

	limit: Joi.number()
		.integer()
		.min(1)
		.max(100)
		.default(20),

	approvalStatus: Joi.string()
		.lowercase()
		.valid('pending', 'approved', 'rejected'),

	deliveryStatus: Joi.string()
		.lowercase()
		.valid('pending', 'assigned', 'in_transit', 'delivered', 'failed'),

	paymentStatus: Joi.string()
		.lowercase()
		.valid('pending', 'confirmed', 'failed'),

	status: Joi.string()
		.lowercase()
		.valid('pending', 'processing', 'completed', 'cancelled'),

	orderer: Joi.string()
		.trim()
		.length(24)
		.messages({
			'string.length': 'Invalid user ID format',
		}),

	sortBy: Joi.string()
		.valid('createdAt', 'updatedAt', 'totalPrice')
		.default('createdAt'),

	sortOrder: Joi.string()
		.valid('asc', 'desc')
		.default('desc'),
});

/**
 * Validation schema for approving an order
 */
const approveOrderSchema = Joi.object({
	approvalStatus: Joi.string()
		.lowercase()
		.valid('approved', 'rejected')
		.required()
		.messages({
			'any.only': 'Approval status must be either approved or rejected',
			'any.required': 'Approval status is required',
		}),

	rejectionReason: Joi.string()
		.trim()
		.max(500)
		.when('approvalStatus', {
			is: 'rejected',
			then: Joi.required(),
			otherwise: Joi.optional(),
		})
		.messages({
			'string.max': 'Rejection reason cannot exceed 500 characters',
			'any.required': 'Rejection reason is required when rejecting an order',
		}),
});

/**
 * Validation schema for assigning order to route
 */
const assignRouteSchema = Joi.object({
	routeId: Joi.string()
		.trim()
		.length(24)
		.required()
		.messages({
			'string.empty': 'Route ID is required',
			'string.length': 'Invalid route ID format',
		}),

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
 * Validation schema for removing product from order
 */
const removeProductSchema = Joi.object({
	productId: Joi.string()
		.trim()
		.length(24)
		.required()
		.messages({
			'string.empty': 'Product ID is required',
			'string.length': 'Invalid product ID format',
		}),
});

module.exports = {
	createOrderSchema,
	orderQuerySchema,
	approveOrderSchema,
	assignRouteSchema,
	removeProductSchema,
};
