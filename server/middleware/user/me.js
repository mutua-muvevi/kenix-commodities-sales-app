
const { performance } = require("perf_hooks");
const User = require("../../models/user");
const ErrorResponse = require("../../utils/error-response");
const logger = require("../../utils/logger");
const { populateUser } = require("../../population/user/main");

exports.getMe = async (req, res, next) => {
	try {
		// Step 1: Extract JWT from the request
		const { jwt } = req;

		// Step 2: Validate the JWT and extract user ID
		if (!jwt) {
			logger.error("JWT not provided");
			return next(new ErrorResponse(invalidJWT, 401));
		};

		const userID = jwt.userId;

		// Step 3: Fetch the user data from the database
		const start = performance.now();

		let user;

		try {
			user = await User.findById(userID)
				.select("-salt -hash -imageID")
				.populate(populateUser);
			
		} catch (error) {
			logger.error("Error populating user data:", error);
			return next(new ErrorResponse("Error fetching user details", 500));	
		}


		const end = performance.now();

		if (!user) {
			logger.error("User not found");
			return next(new ErrorResponse("User not found", 404));
		}

		// Step 4: Add the user data to the request object
		req.user = user;

		// Step 5: Log the time taken for fetching the user data
		logger.info(`Time taken for fetching user data: ${end - start} ms`);

		// Step 6: Call the next middleware
		next();

	} catch (error) {
		logger.error(`Error in GetMe Middleware: ${error} ${JSON.stringify(error)}`);
		next(error);
	}
};