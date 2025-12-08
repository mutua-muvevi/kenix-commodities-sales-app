const User = require("../../models/user");
const logger = require("../../utils/logger");
const ErrorResponse = require("../../utils/error-response");

// ------------------------------------------------------------------

const findUser = async (fields, errorMessage, statusCode) => {
	try {
		// Construct a query to match any of the fields
		const query = {
			$or: Object.entries(fields).map(([key, value]) => ({ [key]: value })),
		}

		// Find user based on the query
		const user = await User.findOne(query);

		if (!user) {
			logger.warn(`An attempt to find non existing user with fields: ${JSON.stringify(fields)}`);
			throw new ErrorResponse(errorMessage || "User not found", statusCode || 404);
		}

		// return the user
		return user

	} catch (error) {
		logger.error(`Error in finding user lib: ${error.message}`);
		throw new ErrorResponse(error.message, 500);
	}
}

// ------------------------------------------------------------------

const findUsers = async (fields) => {
	try {
		// Construct a query to match any of the fields
		const query = {
			$or: Object.entries(fields).map(([key, value]) => ({ [key]: value })),
		}

		// Find user based on the query
		const users = await User.find(query);

		if (!users) {
			logger.warn(`An attempt to find non existing users with fields: ${JSON.stringify(fields)}`);
			throw new ErrorResponse("Users not found", 404);
		}

		// return the user
		return users

	} catch (error) {
		logger.error(`Error in finding users lib: ${error.message}`);
		throw new ErrorResponse(error.message, 500);
	}
}

module.exports = { findUser, findUsers }