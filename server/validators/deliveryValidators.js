/**
 * Delivery Validation Schemas
 *
 * Joi validation schemas for delivery-related endpoints
 */

const Joi = require('joi');

/**
 * Validation schema for starting a delivery route
 */
const startDeliveryRouteSchema = Joi.object({
	routeId: Joi.string()
		.trim()
		.length(24)
		.required()
		.messages({
			'string.empty': 'Route ID is required',
			'string.length': 'Invalid route ID format',
		}),
});

/**
 * Validation schema for marking arrival at shop
 */
const markArrivalSchema = Joi.object({
	location: Joi.object({
		type: Joi.string()
			.valid('Point')
			.default('Point'),
		coordinates: Joi.array()
			.items(Joi.number())
			.length(2)
			.required()
			.messages({
				'array.length': 'Coordinates must be [longitude, latitude]',
				'any.required': 'Location coordinates are required',
			}),
	}).required(),
});

/**
 * Validation schema for completing delivery
 */
const completeDeliverySchema = Joi.object({
	recipientName: Joi.string()
		.trim()
		.max(200)
		.required()
		.messages({
			'string.empty': 'Recipient name is required',
			'string.max': 'Recipient name cannot exceed 200 characters',
		}),

	recipientPhone: Joi.string()
		.trim()
		.pattern(/^254[0-9]{9}$/)
		.required()
		.messages({
			'string.empty': 'Recipient phone is required',
			'string.pattern.base': 'Recipient phone must be in format 254XXXXXXXXX',
		}),

	signature: Joi.string()
		.uri()
		.messages({
			'string.uri': 'Signature must be a valid URL',
		}),

	photo: Joi.string()
		.uri()
		.messages({
			'string.uri': 'Photo must be a valid URL',
		}),

	notes: Joi.string()
		.trim()
		.max(1000)
		.allow('')
		.messages({
			'string.max': 'Notes cannot exceed 1000 characters',
		}),

	items: Joi.array()
		.items(
			Joi.object({
				product: Joi.string()
					.trim()
					.length(24)
					.required(),
				delivered: Joi.number()
					.integer()
					.min(0)
					.required()
					.messages({
						'number.min': 'Delivered quantity cannot be negative',
						'any.required': 'Delivered quantity is required',
					}),
			})
		),
});

/**
 * Validation schema for recording payment
 */
const recordPaymentSchema = Joi.object({
	method: Joi.string()
		.lowercase()
		.valid('cash', 'mpesa', 'credit')
		.required()
		.messages({
			'any.only': 'Payment method must be one of: cash, mpesa, credit',
			'any.required': 'Payment method is required',
		}),

	amountCollected: Joi.number()
		.min(0)
		.required()
		.messages({
			'number.base': 'Amount collected must be a number',
			'number.min': 'Amount collected cannot be negative',
			'any.required': 'Amount collected is required',
		}),

	mpesaReceiptNumber: Joi.string()
		.trim()
		.when('method', {
			is: 'mpesa',
			then: Joi.required(),
			otherwise: Joi.optional(),
		})
		.messages({
			'any.required': 'M-Pesa receipt number is required for M-Pesa payments',
		}),

	receiptNumber: Joi.string()
		.trim()
		.max(100)
		.messages({
			'string.max': 'Receipt number cannot exceed 100 characters',
		}),
});

/**
 * Validation schema for reporting delivery failure
 */
const reportFailureSchema = Joi.object({
	reason: Joi.string()
		.valid('shop_closed', 'recipient_unavailable', 'wrong_address', 'refused_delivery', 'other')
		.required()
		.messages({
			'any.only': 'Reason must be one of: shop_closed, recipient_unavailable, wrong_address, refused_delivery, other',
			'any.required': 'Failure reason is required',
		}),

	description: Joi.string()
		.trim()
		.max(1000)
		.required()
		.messages({
			'string.empty': 'Description is required',
			'string.max': 'Description cannot exceed 1000 characters',
		}),

	photo: Joi.string()
		.uri()
		.messages({
			'string.uri': 'Photo must be a valid URL',
		}),
});

/**
 * Validation schema for delivery query parameters
 */
const deliveryQuerySchema = Joi.object({
	page: Joi.number()
		.integer()
		.min(1)
		.default(1),

	limit: Joi.number()
		.integer()
		.min(1)
		.max(100)
		.default(20),

	status: Joi.string()
		.lowercase()
		.valid('pending', 'en_route', 'arrived', 'completed', 'failed', 'skipped'),

	routeId: Joi.string()
		.trim()
		.length(24),

	riderId: Joi.string()
		.trim()
		.length(24),

	shopId: Joi.string()
		.trim()
		.length(24),

	sortBy: Joi.string()
		.valid('sequenceNumber', 'createdAt', 'completedAt')
		.default('sequenceNumber'),

	sortOrder: Joi.string()
		.valid('asc', 'desc')
		.default('asc'),
});

module.exports = {
	startDeliveryRouteSchema,
	markArrivalSchema,
	completeDeliverySchema,
	recordPaymentSchema,
	reportFailureSchema,
	deliveryQuerySchema,
};
