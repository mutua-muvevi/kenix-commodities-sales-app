const Joi = require("joi");

//forgot password
const resetPasswordSchema = Joi.object({
	email: Joi.string().email().required().messages({
		"string.base": "Email must be a valid string.",
		"string.email": "Email must be a valid email address.",
		"string.empty": "Email cannot be empty.",
		"any.required": "Email is required.",
	}),
});

//reset password
const newPasswordSchema = Joi.object({
	password: Joi.string().min(6).required().messages({
		"string.base": "Password must be a string.",
		"string.min": "Password must be at least 6 characters long.",
		"string.empty": "Password cannot be empty.",
		"any.required": "Password is required.",
	}),
	resetToken: Joi.string().required().messages({
		"string.base": "Reset token must be a string.",
		"string.empty": "Reset token cannot be empty.",
		"any.required": "Reset token is required.",
	}),
});

module.exports = { resetPasswordSchema, newPasswordSchema };