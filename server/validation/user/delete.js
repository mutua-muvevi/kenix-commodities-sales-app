const Joi = require("joi");

const deleteUserSchema = Joi.object({
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

const deleteMultipleUserSchema = Joi.object({
	userIds: Joi.array().items(Joi.string()).required().messages({
		"array.base": "User IDs must be an array.",
		"array.empty": "User IDs cannot be empty.",
		"any.required": "User IDs are required.",
	})
});

module.exports = { deleteUserSchema, deleteMultipleUserSchema };