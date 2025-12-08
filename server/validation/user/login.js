const Joi = require("joi");

const loginSchema = Joi.object({
	email: Joi.string().email().required().messages({
		"string.base": "Email must be a valid string.",
		"string.email": "Email must be a valid email address.",
		"string.empty": "Email cannot be empty.",
		"any.required": "Email is required.",
	}),
	password: Joi.string().required().messages({
		"string.base": "Password must be a string.",
		"string.empty": "Password cannot be empty.",
		"any.required": "Password is required.",
	}),
});

module.exports = { loginSchema };
