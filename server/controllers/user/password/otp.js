// Import all required modules
const logger = require("../../../utils/logger");
const ErrorResponse = require("../../../utils/error-response");
const { findUser } = require("../../../lib/user/find");
const { otpSchema } = require("../../../validation/user/otp");

//---------------------------------------------------------------------------------
// OTP Controller
const verifyOtp = async (req, res, next) => {
	const {
		body: { otp },
		user,
	} = req;

	try {
		const { error } = otpSchema.validate({ otp });

		if (error) {
			new ErrorResponse(error.details.map((detail) => detail.message).join(", "), 400);
		}

		const start = performance.now();

		// Step : Ensure user already exists
		const userWithOTP = await findUser({ emailOTP : otp });

		if (userWithOTP.emailOTP !== otp) {
			console.log("Database otp", userWithOTP.emailOTP, "User entered otp", otp);
			logger.warn(`Invalid OTP was entered by user with id: ${user._id}`);
			return next(new ErrorResponse("Incorrect OTP", 400));
		}

		// Step : Update the emailVerified field to true and reset the emailOtp and emailOtpExpiry
		userWithOTP.emailVerified = true;
		userWithOTP.emailOTP = null;
		userWithOTP.emailOTPExpiry = null;

		await userWithOTP.save();

		// Step: Send success response
		res.status(200).json({
			success: true,
			message: "OTP verified successfully.",
		});

		// Step: Measure the time it took to verify the email
		const end = performance.now();
		const timeTaken = end - start;

		logger.info(`Time taken to verify OTP: ${timeTaken} seconds`);
		
	} catch (error) {
		logger.error(`Error in Verify Otp Controller: ${error.message}`);
		next(error);
	}
};

//---------------------------------------------------------------------------------

module.exports = { verifyOtp };
