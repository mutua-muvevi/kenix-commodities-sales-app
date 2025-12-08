// Import all required modules
const logger = require("../../../utils/logger");
const ErrorResponse = require("../../../utils/error-response");
const { resetPasswordSchema } = require("../../../validation/user/password");
const { findUser } = require("../../../lib/user/find");
const { generateResetToken } = require("../../../middleware/password/gen-reset-token");
const { resetPasswordEmailTemplate } = require("../../../view/user/reset-password");
const SendEmail = require("../../../utils/send-mail");

//---------------------------------------------------------------------------------
// Password Request Reset Controller
const resetPassword = async (req, res, next) => {
	const {
		body: { email },
	} = req;

	try {
		// performance
		const start = performance.now();

		// Step : Validate all request fields
		const { error } = resetPasswordSchema.validate({ email });

		if (error) {
			return next(
				new ErrorResponse(error.details.map((detail) => detail.message).join(", "), 400),
			);
		}

		// Step : Ensure user already exists
		const user = await findUser({ email });

		if (!user) {
			logger.warn(`An attempt to reset password was made by user with email: ${email}`);
			return res.status(200).json({
				success: true,
				message: "If the email address exists in our system, we will send a reset link.",
			});
		}

		// Step : Generate password reset token and save it
		const resetToken = generateResetToken(user);
		await user.save();

		// Step : Construct password reset url
		const passwordResetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

		// Step : Send the email
		const emailTemplate = resetPasswordEmailTemplate(user, passwordResetUrl);

		const emailData = {
			to: user.email,
			from: process.env.SEND_EMAIL_FROM,
			subject: "Password Reset Request",
			html: emailTemplate,
		};

		try {
			await SendEmail(emailData);

			res.status(200).json({
				success: true,
				message: "Reset link sent successfully. Check your email.",
			});
		} catch (error) {
			// Cleanup/reset the reset token in case of an email error
			user.resetPasswordToken = undefined;
			user.resetPasswordExpiry = undefined;
			await user.save();

			logger.error(`Error sending email: ${error.message}`);
			return next(new ErrorResponse("Failed to send reset email. Please try again.", 500));
		}

		// Step : Measure the time it took to send the email
		const end = performance.now();
		const timeTaken = end - start;

		// Step : Write the logs
		logger.info(`Password reset email sent in ${timeTaken} ms`);

	} catch (error) {
		logger.error(`Error in ForgotPassword Controller: ${error.message}`);
		next(new ErrorResponse("An error occurred. Please try again.", 500));
	}
};

//---------------------------------------------------------------------------------
module.exports = { resetPassword };
