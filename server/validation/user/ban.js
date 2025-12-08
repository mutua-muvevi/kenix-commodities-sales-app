const Joi = require("joi");

const banUserSchema = Joi.object({
	userId: Joi.string().required().messages({
		"string.base": "User ID must be a string.",
		"string.empty": "User ID cannot be empty.",
		"any.required": "User ID is required.",
	}),
	name: Joi.string().required().messages({
		"string.base": "Name must be a string.",
		"string.empty": "Name cannot be empty.",
		"any.required": "Name is required.",
	})
});

module.exports = { banUserSchema };