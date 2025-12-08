const bcrypt = require("bcrypt");
const ErrorResponse = require("../../utils/error-response");
const logger = require("../../utils/logger");

const SALT_ROUNDS = 12;

// Generate password hash
const generateHash = async (password) => {
	try {
		// Step 1: Generate a hashed password with bcrypt
		const hash = await bcrypt.hash(password, SALT_ROUNDS);

		return {
			hash: hash
		};

	} catch (error) {
		logger.error(`Error generating password hash: ${error.message}`);
		throw new ErrorResponse("Failed to generate password hash", 500);
	}
};

module.exports = {
	generateHash
};