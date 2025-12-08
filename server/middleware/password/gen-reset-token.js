
const crypto = require("crypto");

const TOKEN_LENGTH = 20;
const TOKEN_EXPIRY_HOURS = 6;

const generateResetToken = (user) => {
	try {
		// Step 1: Generate reset token
		const resetToken = crypto.randomBytes(TOKEN_LENGTH).toString("hex");

		// Step 2: Hash the token for secure storage
		user.resetPasswordToken = crypto
			.createHash("sha256")
			.update(resetToken)
			.digest("hex");

		// Step 3: Set token expiry
		user.resetPasswordExpiry =
			Date.now() + TOKEN_EXPIRY_HOURS * (60 * 60 * 1000);

		// Step 4: Return plain token
		return resetToken;

	} catch (error) {
		throw new Error("Error generating reset token.");
	}
};

module.exports = { generateResetToken };
