const jsonwebtoken = require("jsonwebtoken");
const ErrorResponse = require("../../utils/error-response");
const logger = require("../../utils/logger");

const issueAccessJWT = (user, role) => {
	try {
		// Step 1: Extract the user's unique identifier
		const _id = user._id;

		// Step 2: Define the JWT payload
		const payload = {
			sub: _id,
			iat: Math.floor(Date.now() / 1000),
			role,
		};

		// Extract token expiration duration from environment or default to '1d'
		const expiresIn = "1h";

		// Step 3: Sign the token
		if (!process.env.JWT_ACCESS_SECRET) {
			logger.error("JWT_ACCESS_SECRET is missing in environment");
			throw new ErrorResponse( "Something went wrong", 500);
		}
		const signedToken = jsonwebtoken.sign(payload, process.env.JWT_ACCESS_SECRET, {
			expiresIn,
		});

		// Step 4: Return the token and its expiration details
		return {
			token: "Bearer " + signedToken,
			expires: Math.floor(Date.now() / 1000) + 60 * 60 * 1, // 1 hour
		};
	} catch (error) {
		logger.error(`Error issuing JWT: ${error.message}`);
		throw new ErrorResponse("Something went wrong", 500);
	}
};

module.exports = { issueAccessJWT };