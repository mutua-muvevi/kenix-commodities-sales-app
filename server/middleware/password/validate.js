const bcrypt = require("bcrypt");
const ErrorResponse = require("../../utils/error-response");
const logger = require("../../utils/logger");

// Validate password against the stored hash
const validatePassword = async (password, hash) => {
	try {
		// Step 1: Use bcrypt's compare function to validate the password
		const isValid = await bcrypt.compare(password, hash);

		return isValid;
		
	} catch (error) {
		logger.error(`Error validating password: ${error.message}`);
		throw new ErrorResponse("Failed to validate password", 500);
	}
};

module.exports = {
	validatePassword
};
