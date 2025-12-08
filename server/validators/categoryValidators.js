/**
 * Category Validation Schemas
 *
 * Joi validation schemas for category-related endpoints
 */

const Joi = require('joi');

/**
 * Validation schema for creating a new category
 */
const createCategorySchema = Joi.object({
	name: Joi.string()
		.trim()
		.min(2)
		.max(100)
		.required()
		.messages({
			'string.empty': 'Category name is required',
			'string.min': 'Category name must be at least 2 characters',
			'string.max': 'Category name cannot exceed 100 characters',
		}),

	description: Joi.string()
		.trim()
		.max(500)
		.allow('')
		.default('')
		.messages({
			'string.max': 'Description cannot exceed 500 characters',
		}),

	parentCategory: Joi.string()
		.trim()
		.length(24)
		.allow(null)
		.default(null)
		.messages({
			'string.length': 'Invalid parent category ID format',
		}),

	image: Joi.string()
		.uri()
		.allow('')
		.default('')
		.messages({
			'string.uri': 'Image must be a valid URL',
		}),

	displayOrder: Joi.number()
		.integer()
		.min(0)
		.default(0)
		.messages({
			'number.base': 'Display order must be a number',
			'number.min': 'Display order cannot be negative',
		}),

	isActive: Joi.boolean()
		.default(true),
});

/**
 * Validation schema for updating a category
 */
const updateCategorySchema = Joi.object({
	name: Joi.string()
		.trim()
		.min(2)
		.max(100)
		.messages({
			'string.min': 'Category name must be at least 2 characters',
			'string.max': 'Category name cannot exceed 100 characters',
		}),

	description: Joi.string()
		.trim()
		.max(500)
		.allow('')
		.messages({
			'string.max': 'Description cannot exceed 500 characters',
		}),

	parentCategory: Joi.string()
		.trim()
		.length(24)
		.allow(null)
		.messages({
			'string.length': 'Invalid parent category ID format',
		}),

	image: Joi.string()
		.uri()
		.allow('')
		.messages({
			'string.uri': 'Image must be a valid URL',
		}),

	displayOrder: Joi.number()
		.integer()
		.min(0)
		.messages({
			'number.base': 'Display order must be a number',
			'number.min': 'Display order cannot be negative',
		}),

	isActive: Joi.boolean(),
}).min(1).messages({
	'object.min': 'At least one field must be provided for update',
});

/**
 * Validation schema for category query parameters
 */
const categoryQuerySchema = Joi.object({
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

	isActive: Joi.boolean(),

	parentCategory: Joi.string()
		.trim()
		.length(24)
		.messages({
			'string.length': 'Invalid parent category ID format',
		}),

	includeProducts: Joi.boolean()
		.default(false),

	sortBy: Joi.string()
		.valid('name', 'displayOrder', 'createdAt', 'updatedAt')
		.default('displayOrder')
		.messages({
			'any.only': 'Sort by must be one of: name, displayOrder, createdAt, updatedAt',
		}),

	sortOrder: Joi.string()
		.valid('asc', 'desc')
		.default('asc')
		.messages({
			'any.only': 'Sort order must be either asc or desc',
		}),
});

module.exports = {
	createCategorySchema,
	updateCategorySchema,
	categoryQuerySchema,
};
