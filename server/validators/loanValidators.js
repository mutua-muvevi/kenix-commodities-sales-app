/**
 * Loan Validation Schemas
 *
 * Joi validation schemas for loan-related endpoints
 */

const Joi = require('joi');

/**
 * Validation schema for loan application
 */
const loanApplicationValidator = Joi.object({
	amount: Joi.number()
		.min(1000)
		.max(1000000)
		.required()
		.messages({
			'number.base': 'Amount must be a number',
			'number.min': 'Minimum loan amount is KES 1,000',
			'number.max': 'Maximum loan amount is KES 1,000,000',
			'any.required': 'Loan amount is required',
		}),

	duration: Joi.number()
		.integer()
		.min(1)
		.max(12)
		.required()
		.messages({
			'number.base': 'Duration must be a number',
			'number.min': 'Minimum loan period is 1 month',
			'number.max': 'Maximum loan period is 12 months',
			'any.required': 'Loan duration is required',
		}),

	purpose: Joi.string()
		.trim()
		.min(10)
		.max(500)
		.required()
		.messages({
			'string.empty': 'Purpose is required',
			'string.min': 'Purpose must be at least 10 characters long',
			'string.max': 'Purpose cannot exceed 500 characters',
			'any.required': 'Loan purpose is required',
		}),
});

/**
 * Validation schema for loan rejection
 */
const loanRejectionValidator = Joi.object({
	reason: Joi.string()
		.trim()
		.min(5)
		.max(500)
		.required()
		.messages({
			'string.empty': 'Rejection reason is required',
			'string.min': 'Rejection reason must be at least 5 characters long',
			'string.max': 'Rejection reason cannot exceed 500 characters',
			'any.required': 'Rejection reason is required',
		}),
});

/**
 * Validation schema for loan payment
 */
const loanPaymentValidator = Joi.object({
	amount: Joi.number()
		.min(1)
		.required()
		.messages({
			'number.base': 'Amount must be a number',
			'number.min': 'Payment amount must be at least KES 1',
			'any.required': 'Payment amount is required',
		}),

	paymentMethod: Joi.string()
		.trim()
		.lowercase()
		.valid('mpesa', 'cash', 'bank')
		.required()
		.messages({
			'any.only': 'Payment method must be one of: mpesa, cash, bank',
			'any.required': 'Payment method is required',
		}),

	mpesaTransactionId: Joi.string()
		.trim()
		.length(24)
		.when('paymentMethod', {
			is: 'mpesa',
			then: Joi.required(),
			otherwise: Joi.optional(),
		})
		.messages({
			'string.empty': 'M-Pesa transaction ID is required for M-Pesa payments',
			'string.length': 'Invalid M-Pesa transaction ID format',
			'any.required': 'M-Pesa transaction ID is required for M-Pesa payments',
		}),
});

module.exports = {
	loanApplicationValidator,
	loanRejectionValidator,
	loanPaymentValidator,
};
