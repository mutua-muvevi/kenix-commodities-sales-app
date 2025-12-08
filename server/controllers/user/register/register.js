// Import all required modules
const crypto = require("crypto");
const { generateHash } = require("../../../middleware/password/gen-hash");
const { issueAccessJWT } = require("../../../middleware/token/access");
const { issueRefreshJWT } = require("../../../middleware/token/refresh");
const { sanitizeUser } = require("../../../utils/sanitize-user");
const { checkIfUserExists } = require("../../../lib/user/exits");
const { registerSchema } = require("../../../validation/user/register");
const { adminRegisterEmailView, registerUserEmailView } = require("../../../view/user/register");
const SendEmail = require("../../../utils/send-mail");
const logger = require("../../../utils/logger");
const ErrorResponse = require("../../../utils/error-response");
const User = require("../../../models/user");
const { createUniqueID } = require("../../../utils/uuid");

//-------------------------------------------------------------------------------------

const sanitizedUserFields = [
	"_id",
	"name",
	"email",
	"role",
	"image",
	"country",
	"emailVerified",
	"isBanned",
	"business",
	"createdBy",
];

//-------------------------------------------------------------------------------------

// Register Controller
const registerJWT = async (req, res, next) => {
	const { name, email, role, password, country, createdBy } = req.body;

	try {
		// Performance
		const start = performance.now();

		// Step : Validate all request fields
		const { error } = registerSchema.validate({
			name,
			email,
			password,
			country,
			role,
			createdBy,
		});

		if (error) {
			// Return validation errors to the client
			return next(
				new ErrorResponse(error.details.map((detail) => detail.message).join(", "), 400),
			);
		}

		// Step: Find createdby so that you can check if the user is an admin
		let admin = null;

		if (createdBy) {
			admin = await checkIfUserExists({ _id: createdBy });
			console.log("admin", admin);

			if (!admin) {
				logger.warn(
					`An attempt was made to register a user by a non admin user with id: ${createdBy}`,
				);
				return next(new ErrorResponse("You are not authorized to access this route", 403));
			}

			// Step: Ensure that the user is admin
			if (admin.role !== "admin") {
				logger.warn(
					`An attempt to register a user by a non admin user with id: ${admin._id} was made`
				)
				return next(new ErrorResponse("You are not authorized to access this route", 403));
			}
		}

		// Step: Check if the user already exists
		const userExists = await checkIfUserExists({ email, name });

		if (userExists) {
			logger.warn(`An attempt was made to register a user with email: ${email}`);
			return next(new ErrorResponse("User with the credentials given already exists", 400));
		}

		// Generate hashed password
		const { hash } = await generateHash(password);
		console.log("hash", hash);

		// Step : Create the user
		const user = new User({
			name,
			email,
			hash,
			country,
			role,
			createdBy,
		});

		if (!user) {
			logger.error("Error creating user");
			return next(new ErrorResponse("Error creating user, please try again", 500));
		}

		// Step : Generate six digit otp and send it to the user email address
		const OTP = crypto.randomInt(100000, 999999);
		console.log("OTP", OTP);

		user.emailOTP = OTP;
		user.emailOTPExpiry = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours

		const userUUID = createUniqueID()
		user.UUID = userUUID

		await user.save();

		// Step : Issue access token, refesh token, and send it to the user
		const accessToken = issueAccessJWT(user, role);

		const refreshToken = issueRefreshJWT(user, role);

		// Step : Create email html for both the admin and the user and send them to both admin and user respectively

		const adminEmailHtml = adminRegisterEmailView(user.name, user.email, password, OTP);

		const userEmailHtml = registerUserEmailView(user.name, user.email, OTP);

		const emailVerificationData = {
			to: user.email,
			from: process.env.SEND_EMAIL_FROM,
			subject: "Email Verification",
			html: admin ? adminEmailHtml : userEmailHtml,
		};

		// Step : Measure the time it took to Send the email

		try {
			const startSendEmailPerformance = performance.now();

			await SendEmail(emailVerificationData);

			const endSendEmailPerformance = performance.now();
			const timeTakenSendEmail = endSendEmailPerformance - startSendEmailPerformance;
			logger.info(`Email sent successfully in ${timeTakenSendEmail}ms`);
		
		} catch (error) {
			logger.error(`Error sending email: ${error.message}`);
		}

		// Step : Send the response with sanitized user data
		res.status(201).json({
			success: true,
			message: "User created successfully",
			accessToken,
			refreshToken,
			user: sanitizeUser(user, sanitizedUserFields),
		});

		// Step : Measure the time it took to create the user
		const end = performance.now();
		const timeTaken = end - start;

		// Step : Write the logs
		logger.info(
			admin
				? `Admin ${admin._id} has created user successfully: ${user.name} in ${timeTaken}ms`
				: `User created successfully: ${user.name} in ${timeTaken}ms`,
		);
	} catch (error) {
		logger.error(`Error in RegisterJWT Controller: ${error.message}`);
		next(error);
	}
};

module.exports = { registerJWT };
