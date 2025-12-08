// Import all required modules
const logger = require("../../../utils/logger");
const ErrorResponse = require("../../../utils/error-response");
const { findUser } = require("../../../lib/user/find");
const { banUserSchema } = require("../../../validation/user/ban");
const { isSingleMongooseIdValid } = require("../../../utils/is-valid-mongoose-id");
const User = require("../../../models/user");
const { default: mongoose } = require("mongoose");

//---------------------------------------------------------------------------------
// Ban a user
const banUser = async (req, res, next) => {
	const { body: { userId, name }, user } = req;

	try {
		const start = performance.now();

		// validate
		const { error } = banUserSchema.validate({
			userId,
			name,
		});

		if (error) {
			return next(
				new ErrorResponse(error.details.map((detail) => detail.message).join(", "), 400),
			);
		}

		// validate the userID
		if(!mongoose.Types.ObjectId.isValid(userId)) {
			logger.warn(`User id : ${userId} is not a valid`);
			return next(new ErrorResponse("User id is not valid", 400));
		}

		// ensure that the user is admin
		const isAdmin = user.role === "admin";

		if (!isAdmin) {
			logger.warn(`User with id: ${user._id} with role ${user.role} tried to ban user route to ban user ${userId} with name ${name} yet he/she is not an admin`);
			return next(new ErrorResponse("You are not the authorized", 403));
		}

		// ensure that the user exists
		const userToBan = await findUser({ _id: userId, name });

		if (!userToBan) {
			logger.warn(`An attempt to ban non existing user with id: ${userId} was made by user with id: ${user._id}`);
			return next(new ErrorResponse("User not found", 404));
		}

		//ban the user
		const bannedUser = await User.findOneAndUpdate(
			{ _id: userId, name },
			{ isBanned: true, bannedBy: user._id },
			{ new: true, upsert: true },
		);

		if(!bannedUser) {
			logger.warn(`An attempt to ban user with id: ${userId} was made by user with id: ${user._id} which has failed`);
			return next(new ErrorResponse("User not found", 404));
		}

		// Send the response
		res.status(200).json({
			sucess: true,
			message: "User banned successfully",
		});

		// End performance timer
		const end = performance.now();
		const timeTaken = end - start;
		
		// Logging user creation and performance
		logger.info(
			`User : ${bannedUser.name} banned succesfully by admin : ${user.name} in ${timeTaken}ms`,
		);

	} catch (error) {
		logger.error(`Error in Ban User Controller: ${error.message}`);
		next(error);
	}
};

//---------------------------------------------------------------------------------
module.exports = { banUser };