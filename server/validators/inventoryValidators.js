/**
 * Inventory Validation Schemas
 *
 * Joi validation schemas for inventory-related endpoints
 */

const Joi = require('joi');

/**
 * Validation schema for adding stock
 */
const addStockSchema = Joi.object({
	productId: Joi.string()
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

	reason: Joi.string()
		.trim()
		.max(500)
		.default('Stock addition')
		.messages({
			'string.max': 'Reason cannot exceed 500 characters',
		}),
});

/**
 * Validation schema for adjusting stock
 */
const adjustStockSchema = Joi.object({
	type: Joi.string()
		.trim()
		.lowercase()
		.valid('restock', 'adjustment', 'wastage')
		.required()
		.messages({
			'any.only': 'Type must be one of: restock, adjustment, wastage',
			'any.required': 'Adjustment type is required',
		}),

	quantity: Joi.number()
		.integer()
		.required()
		.messages({
			'number.base': 'Quantity must be a number',
			'any.required': 'Quantity is required',
		}),

	reason: Joi.string()
		.trim()
		.min(5)
		.max(500)
		.required()
		.messages({
			'string.min': 'Reason must be at least 5 characters long',
			'string.max': 'Reason cannot exceed 500 characters',
			'any.required': 'Reason for adjustment is required',
		}),
});

/**
 * Validation schema for reserving inventory
 */
const reserveInventorySchema = Joi.object({
	products: Joi.array()
		.items(
			Joi.object({
				productId: Joi.string()
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
						'number.min': 'Quantity must be at least 1',
						'any.required': 'Quantity is required',
					}),
			})
		)
		.min(1)
		.required()
		.messages({
			'array.min': 'At least one product is required',
			'any.required': 'Products array is required',
		}),

	orderId: Joi.string()
		.trim()
		.length(24)
		.required()
		.messages({
			'string.empty': 'Order ID is required',
			'string.length': 'Invalid order ID format',
		}),
});

/**
 * Validation schema for updating stock thresholds
 */
const updateThresholdsSchema = Joi.object({
	productId: Joi.string()
		.trim()
		.length(24)
		.required()
		.messages({
			'string.empty': 'Product ID is required',
			'string.length': 'Invalid product ID format',
		}),

	lowStockThreshold: Joi.number()
		.integer()
		.min(0)
		.messages({
			'number.base': 'Low stock threshold must be a number',
			'number.min': 'Low stock threshold cannot be negative',
		}),

	reorderPoint: Joi.number()
		.integer()
		.min(0)
		.messages({
			'number.base': 'Reorder point must be a number',
			'number.min': 'Reorder point cannot be negative',
		}),
}).min(1).messages({
	'object.min': 'At least one threshold must be provided',
});

/**
 * Validation schema for inventory query parameters
 */
const inventoryQuerySchema = Joi.object({
	page: Joi.number()
		.integer()
		.min(1)
		.default(1),

	limit: Joi.number()
		.integer()
		.min(1)
		.max(100)
		.default(20),

	isInStock: Joi.boolean(),

	lowStock: Joi.boolean(),

	needsReorder: Joi.boolean(),

	productId: Joi.string()
		.trim()
		.length(24)
		.messages({
			'string.length': 'Invalid product ID format',
		}),

	sortBy: Joi.string()
		.valid('quantity', 'availableQuantity', 'lastStockUpdate')
		.default('lastStockUpdate'),

	sortOrder: Joi.string()
		.valid('asc', 'desc')
		.default('desc'),
});

module.exports = {
	addStockSchema,
	adjustStockSchema,
	updateThresholdsSchema,
	inventoryQuerySchema,
	reserveInventorySchema,
};
