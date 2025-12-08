/**
 * Offer Validators
 *
 * Joi validation schemas for offer-related requests
 */

const Joi = require('joi');

/**
 * Create Offer Validation Schema
 */
const createOfferSchema = Joi.object({
	name: Joi.string()
		.trim()
		.min(3)
		.max(100)
		.required()
		.messages({
			'string.min': 'Offer name must be at least 3 characters',
			'string.max': 'Offer name cannot exceed 100 characters',
			'any.required': 'Offer name is required',
		}),

	description: Joi.string()
		.trim()
		.max(500)
		.optional()
		.messages({
			'string.max': 'Description cannot exceed 500 characters',
		}),

	code: Joi.string()
		.trim()
		.uppercase()
		.max(20)
		.optional()
		.messages({
			'string.max': 'Offer code cannot exceed 20 characters',
		}),

	offerType: Joi.string()
		.valid(
			'percentage_discount',
			'fixed_discount',
			'buy_x_get_y',
			'free_delivery',
			'bundle_offer',
			'category_discount'
		)
		.required()
		.messages({
			'any.only': 'Invalid offer type',
			'any.required': 'Offer type is required',
		}),

	discountValue: Joi.number()
		.min(0)
		.when('offerType', {
			is: Joi.string().valid('percentage_discount', 'fixed_discount', 'category_discount'),
			then: Joi.required(),
			otherwise: Joi.optional(),
		})
		.messages({
			'number.min': 'Discount value cannot be negative',
			'any.required': 'Discount value is required for this offer type',
		}),

	maxDiscount: Joi.number()
		.min(0)
		.optional()
		.messages({
			'number.min': 'Maximum discount cannot be negative',
		}),

	applicableTo: Joi.string()
		.valid('all', 'products', 'categories')
		.default('all')
		.messages({
			'any.only': 'Invalid applicability option',
		}),

	products: Joi.array()
		.items(Joi.string().hex().length(24))
		.when('applicableTo', {
			is: 'products',
			then: Joi.array().min(1).required(),
			otherwise: Joi.optional(),
		})
		.messages({
			'array.min': 'At least one product must be selected',
		}),

	categories: Joi.array()
		.items(Joi.string().hex().length(24))
		.when('applicableTo', {
			is: 'categories',
			then: Joi.array().min(1).required(),
			otherwise: Joi.optional(),
		})
		.messages({
			'array.min': 'At least one category must be selected',
		}),

	conditions: Joi.object({
		minOrderAmount: Joi.number().min(0).default(0),
		minQuantity: Joi.number().min(0).default(0),
		maxUses: Joi.number().min(1).optional(),
		maxUsesPerUser: Joi.number().min(1).optional(),
		buyQuantity: Joi.number().min(1).optional(),
		getQuantity: Joi.number().min(1).optional(),
		bundleProducts: Joi.array().items(
			Joi.object({
				product: Joi.string().hex().length(24).required(),
				quantity: Joi.number().min(1).required(),
			})
		).optional(),
		bundlePrice: Joi.number().min(0).optional(),
	}).optional(),

	fromDate: Joi.date()
		.iso()
		.required()
		.messages({
			'date.format': 'Invalid start date format',
			'any.required': 'Start date is required',
		}),

	toDate: Joi.date()
		.iso()
		.greater(Joi.ref('fromDate'))
		.required()
		.messages({
			'date.format': 'Invalid end date format',
			'date.greater': 'End date must be after start date',
			'any.required': 'End date is required',
		}),

	status: Joi.string()
		.valid('draft', 'active', 'scheduled', 'disabled')
		.default('draft')
		.messages({
			'any.only': 'Invalid status',
		}),

	isVisible: Joi.boolean().default(true),

	priority: Joi.number().integer().default(0),

	stackable: Joi.boolean().default(false),
});

/**
 * Update Offer Validation Schema
 */
const updateOfferSchema = Joi.object({
	name: Joi.string()
		.trim()
		.min(3)
		.max(100)
		.optional()
		.messages({
			'string.min': 'Offer name must be at least 3 characters',
			'string.max': 'Offer name cannot exceed 100 characters',
		}),

	description: Joi.string()
		.trim()
		.max(500)
		.optional()
		.allow('')
		.messages({
			'string.max': 'Description cannot exceed 500 characters',
		}),

	code: Joi.string()
		.trim()
		.uppercase()
		.max(20)
		.optional()
		.allow('')
		.messages({
			'string.max': 'Offer code cannot exceed 20 characters',
		}),

	offerType: Joi.string()
		.valid(
			'percentage_discount',
			'fixed_discount',
			'buy_x_get_y',
			'free_delivery',
			'bundle_offer',
			'category_discount'
		)
		.optional()
		.messages({
			'any.only': 'Invalid offer type',
		}),

	discountValue: Joi.number()
		.min(0)
		.optional()
		.messages({
			'number.min': 'Discount value cannot be negative',
		}),

	maxDiscount: Joi.number()
		.min(0)
		.optional()
		.allow(null)
		.messages({
			'number.min': 'Maximum discount cannot be negative',
		}),

	applicableTo: Joi.string()
		.valid('all', 'products', 'categories')
		.optional()
		.messages({
			'any.only': 'Invalid applicability option',
		}),

	products: Joi.array()
		.items(Joi.string().hex().length(24))
		.optional(),

	categories: Joi.array()
		.items(Joi.string().hex().length(24))
		.optional(),

	conditions: Joi.object({
		minOrderAmount: Joi.number().min(0).optional(),
		minQuantity: Joi.number().min(0).optional(),
		maxUses: Joi.number().min(1).optional().allow(null),
		maxUsesPerUser: Joi.number().min(1).optional().allow(null),
		buyQuantity: Joi.number().min(1).optional(),
		getQuantity: Joi.number().min(1).optional(),
		bundleProducts: Joi.array().items(
			Joi.object({
				product: Joi.string().hex().length(24).required(),
				quantity: Joi.number().min(1).required(),
			})
		).optional(),
		bundlePrice: Joi.number().min(0).optional(),
	}).optional(),

	fromDate: Joi.date()
		.iso()
		.optional()
		.messages({
			'date.format': 'Invalid start date format',
		}),

	toDate: Joi.date()
		.iso()
		.optional()
		.messages({
			'date.format': 'Invalid end date format',
		}),

	status: Joi.string()
		.valid('draft', 'active', 'scheduled', 'expired', 'disabled')
		.optional()
		.messages({
			'any.only': 'Invalid status',
		}),

	isVisible: Joi.boolean().optional(),

	priority: Joi.number().integer().optional(),

	stackable: Joi.boolean().optional(),
}).min(1).messages({
	'object.min': 'At least one field must be provided for update',
});

/**
 * Query Offers Validation Schema
 */
const queryOffersSchema = Joi.object({
	page: Joi.number().integer().min(1).default(1),
	limit: Joi.number().integer().min(1).max(100).default(20),
	status: Joi.string().valid('draft', 'active', 'scheduled', 'expired', 'disabled').optional(),
	offerType: Joi.string().valid(
		'percentage_discount',
		'fixed_discount',
		'buy_x_get_y',
		'free_delivery',
		'bundle_offer',
		'category_discount'
	).optional(),
	applicableTo: Joi.string().valid('all', 'products', 'categories').optional(),
	search: Joi.string().trim().max(100).optional(),
});

module.exports = {
	createOfferSchema,
	updateOfferSchema,
	queryOffersSchema,
};
