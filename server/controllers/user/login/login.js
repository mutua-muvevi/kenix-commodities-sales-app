// Import all required modules
const logger = require("../../../utils/logger");
const ErrorResponse = require("../../../utils/error-response");
const { loginSchema } = require("../../../validation/user/login");
const { issueAccessJWT } = require("../../../middleware/token/access");
const { issueRefreshJWT } = require("../../../middleware/token/refresh");
const { sanitizeUser } = require("../../../utils/sanitize-user");
const { checkIfUserExists } = require("../../../lib/user/exits");
const { validatePassword } = require("../../../middleware/password/validate");

// ------------------------------------------------------------------------------------

const invalidAuthMessage = "Invalid credentials, please double-check and try again.";

const userFields = [
	"_id",
	"name",
	"email",
	"role",
	"image",
	"country",
	"emailVerified",
	"isBanned",
	"business",
];

// ------------------------------------------------------------------------------------

// Login Controller
const loginJWT = async (req, res, next) => {
	const { email, password } = req.body;

	try {
		const start = performance.now();

		// Step : Validate all request fields
		const { error } = loginSchema.validate({ email, password });

		// Check for validation errors
		if (error) {
			return next(
				new ErrorResponse(error.details.map((detail) => detail.message).join(", "), 400),
			);
		}

		// Step : Check if the user already exists
		const user = await checkIfUserExists({ email });

		if (!user) {
			logger.warn(`An attempt was made to login by user with email: ${email}`);
			return next(new ErrorResponse(invalidAuthMessage, 400));
		}

		const { hash, role } = user;

		if (!hash || !role) {
			logger.warn(
				`Attempt to login was made by user with email: ${email} but the user does not have either password or role in the database`,
			);
			return next(new ErrorResponse(invalidAuthMessage, 400));
		}

		// Step : Validate password
		const isValidPassword = await validatePassword(password, hash);

		if (!isValidPassword) {
			logger.warn(
				`An attempt was made to login by user with email: ${email} with invalid password`,
			);
			return next(new ErrorResponse(invalidAuthMessage, 400));
		}

		// Step : Issue access token, refesh token, and send it to the user
		const accessToken = issueAccessJWT(user, role);
		const refreshToken = issueRefreshJWT(user, role);

		// Step : Send the response with sanitized user data
		res.status(200).json({
			success: true,
			message: "Login successful",
			accessToken,
			refreshToken,
			user: sanitizeUser(user, userFields),
		});

		// Step : Measure the time it took to login
		const end = performance.now();
		const time = (end - start) / 1000;
		
		// Step : Write the logs
		logger.info(`Login by user with email: ${email} took ${time} seconds`);

	} catch (error) {
		logger.error(`Error in login controller: ${JSON.stringify(error.message)}`);
		next(error);
	}
};

module.exports = { loginJWT };
