// Import all required modules
const User = require("../../../models/user");
const logger = require("../../../utils/logger");
const ErrorResponse = require("../../../utils/error-response");
const { deleteMultipleUserSchema } = require("../../../validation/user/delete");
const { findUsers } = require("../../../lib/user/find");

// Delete Many Users Controller
const deleteManyUsers = async (req, res, next) => {
	let {
		user,
		query: { userIds },
	} = req;

	try {
		// Performance
		const start = performance.now();

		// Remove repeating userIds
		userIds = [...new Set(userIds)];

		// Step : Validate all request fields
		const { error } = deleteMultipleUserSchema.validate({ userIds });

		if (error) {
			// Return validation errors to the client
			return next(
				new ErrorResponse(error.details.map((detail) => detail.message).join(", "), 400),
			);
		}

		// Step : Ensure user is the admin
		ensureAdmin(user, next);

		// Step : Find all the users with the given id and delete them

		const users = await findUsers({ _id: { $in: userIds } });

		if (users.length === 0) {
			logger.warn(
				`An attempt to delete non existing users with ids: ${userIds} was made by user with id: ${user._id}`,
			);
			return next(new ErrorResponse("Users not found", 404));
		}

		// Step : Delete the users
		await User.deleteMany({ _id: { $in: userIds } });

		// Step : Send the response
		res.status(200).json({
			success: true,
			message: "Users deleted successfully",
			users: users.length,
		});

		// Step : Measure the time it took to delete the users
		const end = performance.now();
		const timeTaken = end - start;

		// Step : Write the logs
		logger.info(
			`${users.length} users were deleted sucessfully by user with id: ${user._id} in ${timeTaken}ms`,
		);

	} catch (error) {
		logger.error(`Error in delete multiple users Controller: ${error.message}`);
		next(error);
	}
};

//---------------------------------------------------------------------------------------------------------------

module.exports = { deleteManyUsers }