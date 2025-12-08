// Import all required modules
const logger = require("../../../utils/logger");
const ErrorResponse = require("../../../utils/error-response");
const { newPasswordSchema } = require("../../../validation/user/password");
const { findUser } = require("../../../lib/user/find");
const { generateHash } = require("../../../middleware/password/gen-hash");
const crypto = require("crypto");

//---------------------------------------------------------------------------------
// Update password Controller
const updatePassword = async (req, res, next) => {
	let {
		body: { password },
		params: { resetToken },
	} = req;
	try {
		const start = performance.now();

		// Step : Validate all request fields
		const { error } = newPasswordSchema.validate({ password, resetToken });

		if (error) {
			return next(
				new ErrorResponse(error.details.map((detail) => detail.message).join(", "), 400),
			);
		}

		// Step : Hash the reset token for lookup
		const hashedResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");

		// Step : Find the user matching the token
		const user = await findUser(
			{
				resetPasswordToken: hashedResetToken,
				resetPasswordExpiry: { $gt: Date.now() },
			},
			"Password reset token has expired",
			403
		);

		console.log("USER FOUND", user);

		// Step : Generate hash for the new password and reset resetPasswordToken and resetPasswordExpiry
		const { hash } = await generateHash(password);
		
		user.hash = hash;
		user.resetPasswordToken = undefined;
		user.resetPasswordExpiry = undefined;

		await user.save();

		// Step : Send the response
		res.status(200).json({
			success: true,
			message: "Your password was updated successfully",
		});

		// Step : Measure the time it took to update the password
		const end = performance.now();
		const timeTaken = end - start;

		// Step : Write the logs
		logger.info(`User with id: ${user._id} updated their password in ${timeTaken}ms`);
	} catch (error) {
		logger.error(`Error in ForgotPassword Controller: ${error.message}`);
		next(new ErrorResponse("Something happened while reseting the password", 500));
	}
};

//---------------------------------------------------------------------------------
module.exports = { updatePassword };