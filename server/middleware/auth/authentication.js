const jsonwebtoken = require("jsonwebtoken");
const ErrorResponse = require("../../utils/error-response");
const logger = require("../../utils/logger");

const authenticationMiddleware = (req, res, next) => {
	try {
		// Step 1: Check the presence of the 'authorization' header
		if (!req.headers || !req.headers.authorization) {
			logger.error("Invalid headers Beacause of lack of authorization or header");
			return next(new ErrorResponse("Invalid Headers", 400));
		}

		// Step 2: Retrieve the token from the header
		const tokenParts = req.headers.authorization.split(" ");

		// Step 3: Ensure the header is correctly formatted
		if (
			tokenParts[0] !== "Bearer" ||
			!tokenParts[1] ||
			tokenParts[1].match(/\S+\.\S+\.\S+/) === null
		) {
			logger.error("Incorrectly formatted authorization header");
			
			return res.status(401).json({
				success: false,
				message: "You are not authorized",
			});
		}

		// Step 4: Verify the JWT
		if (!process.env.JWT_ACCESS_SECRET) {
			logger.error("JWT_ACCESS_SECRET is missing in environment");
			return next(new ErrorResponse("Server misconfiguration", 500));
		}
		const verification = jsonwebtoken.verify(
			tokenParts[1],
			process.env.JWT_ACCESS_SECRET
		);

		// Step 5: Append necessary data from the JWT payload to the request object
		req.jwt = { userId: verification.sub, roles: verification.roles }; // assuming the JWT contains userId and roles

		// Step 6: Proceed to the next middleware
		next();
	} catch (error) {
		// Step 7: Handle all possible errors
		logger.error(error);

		if (error.name === "JsonWebTokenError") {
			return next(new ErrorResponse("Invalid Token", 401));
		} else if (error.name === "TokenExpiredError") {
			return next(new ErrorResponse("Token has expired", 401));
		}

		next(error);
	}
};

module.exports = { authenticationMiddleware };