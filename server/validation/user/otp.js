const Joi = require("joi");

const otpSchema = Joi.object({
	otp: Joi.string().pattern(/^\d+$/).required().messages({
		"string.base": "OTP must be a string.",
		"string.empty": "OTP cannot be empty.",
		"string.length": "OTP must be exactly 6 digits.",
		"string.pattern.base": "OTP must contain only numeric characters.",
		"any.required": "OTP is required.",
	}),
});

module.exports = { otpSchema };