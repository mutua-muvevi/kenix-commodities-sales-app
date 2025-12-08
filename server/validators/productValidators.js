/**
 * Product Validation Schemas
 *
 * Joi validation schemas for product-related endpoints
 */

const Joi = require('joi');

/**
 * Validation schema for creating a new product
 */
const createProductSchema = Joi.object({
	name: Joi.string()
		.trim()
		.min(2)
		.max(200)
		.required()
		.messages({
			'string.empty': 'Product name is required',
			'string.min': 'Product name must be at least 2 characters',
			'string.max': 'Product name cannot exceed 200 characters',
		}),

	sku: Joi.string()
		.trim()
		.uppercase()
		.min(2)
		.max(50)
		.required()
		.messages({
			'string.empty': 'SKU is required',
			'string.min': 'SKU must be at least 2 characters',
			'string.max': 'SKU cannot exceed 50 characters',
		}),

	description: Joi.string()
		.trim()
		.max(1000)
		.allow('')
		.default('')
		.messages({
			'string.max': 'Description cannot exceed 1000 characters',
		}),

	category: Joi.string()
		.trim()
		.length(24)
		.required()
		.messages({
			'string.empty': 'Category is required',
			'string.length': 'Invalid category ID format',
		}),

	wholePrice: Joi.number()
		.min(0)
		.required()
		.messages({
			'number.base': 'Wholesale price must be a number',
			'number.min': 'Wholesale price cannot be negative',
			'any.required': 'Wholesale price is required',
		}),

	unitPrice: Joi.number()
		.min(0)
		.required()
		.messages({
			'number.base': 'Unit price must be a number',
			'number.min': 'Unit price cannot be negative',
			'any.required': 'Unit price is required',
		}),

	unitOfMeasure: Joi.string()
		.trim()
		.lowercase()
		.valid('kg', 'g', 'piece', 'dozen', 'crate', 'bag', 'litre', 'ml', 'pack')
		.required()
		.messages({
			'any.only': 'Unit of measure must be one of: kg, g, piece, dozen, crate, bag, litre, ml, pack',
			'any.required': 'Unit of measure is required',
		}),

	images: Joi.array()
		.items(Joi.string().uri())
		.max(10)
		.default([])
		.messages({
			'array.max': 'Cannot upload more than 10 images',
			'string.uri': 'Each image must be a valid URL',
		}),

	isActive: Joi.boolean()
		.default(true),
});

/**
 * Validation schema for updating a product
 */
const updateProductSchema = Joi.object({
	name: Joi.string()
		.trim()
		.min(2)
		.max(200)
		.messages({
			'string.min': 'Product name must be at least 2 characters',
			'string.max': 'Product name cannot exceed 200 characters',
		}),

	description: Joi.string()
		.trim()
		.max(1000)
		.allow('')
		.messages({
			'string.max': 'Description cannot exceed 1000 characters',
		}),

	category: Joi.string()
		.trim()
		.length(24)
		.messages({
			'string.length': 'Invalid category ID format',
		}),

	wholePrice: Joi.number()
		.min(0)
		.messages({
			'number.base': 'Wholesale price must be a number',
			'number.min': 'Wholesale price cannot be negative',
		}),

	unitPrice: Joi.number()
		.min(0)
		.messages({
			'number.base': 'Unit price must be a number',
			'number.min': 'Unit price cannot be negative',
		}),

	unitOfMeasure: Joi.string()
		.trim()
		.lowercase()
		.valid('kg', 'g', 'piece', 'dozen', 'crate', 'bag', 'litre', 'ml', 'pack')
		.messages({
			'any.only': 'Unit of measure must be one of: kg, g, piece, dozen, crate, bag, litre, ml, pack',
		}),

	images: Joi.array()
		.items(Joi.string().uri())
		.max(10)
		.messages({
			'array.max': 'Cannot upload more than 10 images',
			'string.uri': 'Each image must be a valid URL',
		}),

	isActive: Joi.boolean(),
}).min(1).messages({
	'object.min': 'At least one field must be provided for update',
});

/**
 * Validation schema for product query parameters (filtering, pagination)
 */
const productQuerySchema = Joi.object({
	page: Joi.number()
		.integer()
		.min(1)
		.default(1)
		.messages({
			'number.base': 'Page must be a number',
			'number.min': 'Page must be at least 1',
		}),

	limit: Joi.number()
		.integer()
		.min(1)
		.max(100)
		.default(20)
		.messages({
			'number.base': 'Limit must be a number',
			'number.min': 'Limit must be at least 1',
			'number.max': 'Limit cannot exceed 100',
		}),

	category: Joi.string()
		.trim()
		.length(24)
		.messages({
			'string.length': 'Invalid category ID format',
		}),

	search: Joi.string()
		.trim()
		.max(100)
		.messages({
			'string.max': 'Search query cannot exceed 100 characters',
		}),

	isActive: Joi.boolean(),

	sortBy: Joi.string()
		.valid('name', 'unitPrice', 'wholePrice', 'createdAt', 'updatedAt')
		.default('name')
		.messages({
			'any.only': 'Sort by must be one of: name, unitPrice, wholePrice, createdAt, updatedAt',
		}),

	sortOrder: Joi.string()
		.valid('asc', 'desc')
		.default('asc')
		.messages({
			'any.only': 'Sort order must be either asc or desc',
		}),
});

/**
 * Validation schema for updating stock status (admin declaration)
 */
const updateStockStatusSchema = Joi.object({
	isInStock: Joi.boolean()
		.required()
		.messages({
			'any.required': 'Stock status is required',
		}),
});

module.exports = {
	createProductSchema,
	updateProductSchema,
	productQuerySchema,
	updateStockStatusSchema,
};
