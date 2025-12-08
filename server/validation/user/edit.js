const Joi = require("joi");

// Define a custom validation for ObjectId
const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const editUserSchema = Joi.object({
	name: Joi.string().required().messages({
		"string.base": "Name must be a string.",
		"string.empty": "Name cannot be empty.",
		"any.required": "Name is required.",
	}),
	country: Joi.string().required().messages({
		"string.base": "Country must be a string.",
		"string.empty": "Country cannot be empty.",
		"any.required": "Country is required.",
	}),
	role: Joi.string().valid("user", "admin", "business").messages({
		"string.base": "Role must be a string.",
		"any.only": 'Role must be either "user" or "admin".',
		"string.empty": "Role cannot be empty.",
	}),
	email: Joi.string().email().required().messages({
		"string.base": "Email must be a valid string.",
		"string.email": "Email must be a valid email address.",
		"string.empty": "Email cannot be empty.",
		"any.required": "Email is required.",
	}),

	updatedBy: Joi.alternatives()
		.try(
			Joi.string().pattern(objectIdRegex).messages({
				"string.pattern.base": "Created by must be a valid Mongoose ObjectId.",
			}),
			Joi.string().allow(null, "").messages({
				"string.base": "Created by must be a string.",
				"string.empty": "Created by can be empty.",
			}),
		)
		.messages({
			"alternatives.types": "Created by must be either a valid Mongoose ObjectId or empty.",
		}),
});

module.exports = { editUserSchema };
