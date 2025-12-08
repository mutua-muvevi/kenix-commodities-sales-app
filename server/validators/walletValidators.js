/**
 * Wallet Validation Schemas
 *
 * Joi validation schemas for wallet-related endpoints
 */

const Joi = require('joi');

/**
 * Validation schema for wallet adjustment
 */
const walletAdjustmentValidator = Joi.object({
	amount: Joi.number()
		.required()
		.messages({
			'number.base': 'Amount must be a number',
			'any.required': 'Amount is required',
		}),

	reason: Joi.string()
		.trim()
		.min(5)
		.max(500)
		.required()
		.messages({
			'string.empty': 'Reason is required',
			'string.min': 'Reason must be at least 5 characters long',
			'string.max': 'Reason cannot exceed 500 characters',
			'any.required': 'Reason is required',
		}),

	type: Joi.string()
		.trim()
		.lowercase()
		.valid('adjustment', 'bonus', 'deduction')
		.default('adjustment')
		.messages({
			'any.only': 'Type must be one of: adjustment, bonus, deduction',
		}),
});

/**
 * Validation schema for transaction query parameters
 */
const transactionQueryValidator = Joi.object({
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

	type: Joi.string()
		.trim()
		.lowercase()
		.valid('load', 'collection', 'adjustment', 'settlement')
		.messages({
			'any.only': 'Type must be one of: load, collection, adjustment, settlement',
		}),
});

module.exports = {
	walletAdjustmentValidator,
	transactionQueryValidator,
};
