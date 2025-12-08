// Import all required modules
const User = require("../../../models/user");
const logger = require("../../../utils/logger");
const ErrorResponse = require("../../../utils/error-response");
const { deleteUserSchema } = require("../../../validation/user/delete");
const { findUser } = require("../../../lib/user/find");
const { isSingleMongooseIdValid } = require("../../../utils/is-valid-mongoose-id");
const { ensureIsMe } = require("../../../middleware/auth/is-me");


// Delete Single User Controller
const deleteSingleUser = async (req, res, next) => {
	const { user, query : { userId, name } } = req;
	console.log({ userId, name })

	try {
		// Performance
		const start = performance.now();
		
		// Step : Validate all request fields
		const { error } = deleteUserSchema.validate({ userId, name });

		if (error) {
			// Return validation errors to the client
			return next(
				new ErrorResponse(error.details.map((detail) => detail.message).join(", "), 400),
			);
		}

		if(!isSingleMongooseIdValid(userId)) {
			logger.warn(`User id : ${userId} is not a valid`);
			return next(new ErrorResponse("User id is not valid", 400));
		}

		// Step : Ensure user exists
		const userExist = await findUser({ _id: userId, name });

		if (!userExist) {
			logger.warn(`An attempt to delete non existing user with id: ${userExist._id} was made by user with id: ${user._id}`);
			return next(new ErrorResponse("User not found", 404));
		}

		// Step: If user role is not admin, instead of deleting mark the user as deleted
		if (user.role !== "admin") {

			// Step : Ensure that the user is me
			ensureIsMe(req, next, userId);

			// Step : Mark the user as deleted
			await User.updateOne({ _id: userId }, { isDeleted: true });

			res.status(200).json({
				success: true,
				message: "User was marked as deleted",
			});
		} else {

			// Step : Delete the user
			await User.deleteOne({ _id: userId });
			
			// Step : Send the response
			res.status(200).json({
				success: true,
				message: "User was deleted sucessfully",
			})
		}

		
		
		// Step : Measure the time it took to delete the user
		const end = performance.now();
		const timeTaken = end - start;
		
		// Step : Write the logs
		logger.info(
			`User ${userToEdit.name} was edited successfully by ${user.name} in ${timeTaken}ms`
		);
	} catch (error) {
		logger.error(`Error in delete single user Controller: ${error.message}`);
		next(error);
	}
}

//---------------------------------------------------------------------------------------------------
module.exports = {  deleteSingleUser };