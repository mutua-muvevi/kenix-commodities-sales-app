/**
 * Airtime Validation Schemas
 *
 * Joi validation schemas for airtime-related endpoints
 */

const Joi = require('joi');

/**
 * Validation schema for buying airtime
 */
const airtimeBuyValidator = Joi.object({
	provider: Joi.string()
		.trim()
		.lowercase()
		.valid('safaricom', 'airtel')
		.required()
		.messages({
			'any.only': 'Provider must be either safaricom or airtel',
			'any.required': 'Provider is required',
		}),

	phoneNumber: Joi.string()
		.trim()
		.pattern(/^(\+?254|0)?[17]\d{8}$/)
		.required()
		.messages({
			'string.pattern.base': 'Phone number must be a valid Kenyan number (07XXXXXXXX or 01XXXXXXXX)',
			'any.required': 'Phone number is required',
		}),

	amount: Joi.number()
		.min(10)
		.max(10000)
		.required()
		.messages({
			'number.base': 'Amount must be a number',
			'number.min': 'Minimum airtime amount is KES 10',
			'number.max': 'Maximum airtime amount is KES 10,000',
			'any.required': 'Amount is required',
		}),
});

/**
 * Validation schema for selling airtime
 */
const airtimeSellValidator = Joi.object({
	provider: Joi.string()
		.trim()
		.lowercase()
		.valid('safaricom', 'airtel')
		.required()
		.messages({
			'any.only': 'Provider must be either safaricom or airtel',
			'any.required': 'Provider is required',
		}),

	amount: Joi.number()
		.min(10)
		.max(10000)
		.required()
		.messages({
			'number.base': 'Amount must be a number',
			'number.min': 'Minimum airtime amount is KES 10',
			'number.max': 'Maximum airtime amount is KES 10,000',
			'any.required': 'Amount is required',
		}),
});

/**
 * Validation schema for airtime transaction query parameters
 */
const airtimeQueryValidator = Joi.object({
	page: Joi.number()
		.integer()
		.min(1)
		.default(1),

	limit: Joi.number()
		.integer()
		.min(1)
		.max(100)
		.default(20),

	type: Joi.string()
		.trim()
		.lowercase()
		.valid('purchase', 'sale'),

	provider: Joi.string()
		.trim()
		.lowercase()
		.valid('safaricom', 'airtel'),

	status: Joi.string()
		.trim()
		.lowercase()
		.valid('pending', 'success', 'failed'),

	userId: Joi.string()
		.trim()
		.length(24)
		.messages({
			'string.length': 'Invalid user ID format',
		}),
});

module.exports = {
	airtimeBuyValidator,
	airtimeSellValidator,
	airtimeQueryValidator,
};
