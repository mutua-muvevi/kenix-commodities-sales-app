const User = require("../../models/user");
const logger = require("../../utils/logger");
const ErrorResponse = require("../../utils/error-response");

// ------------------------------------------------------------------

const checkIfUserExists = async (fields) => {
	try {
		// Construct a query to match any of the fields
		const query = {
			$or: Object.entries(fields).map(([key, value]) => ({ [key]: value })),
		};

		// Find user based on the query
		const userExists = await User.findOne(query);

		if(!userExists) return false;

		// Return true if a user is found, otherwise false
		return userExists;

	} catch (error) {
		logger.error(`Error in checking if user exists lib: ${error.message}`);
		throw new ErrorResponse(error.message, 500);
	}
};

module.exports = { checkIfUserExists };
