// Import all required modules
const User = require("../../../models/user");
const ErrorResponse = require("../../../utils/error-response");
const logger = require("../../../utils/logger");
const { editUserSchema } = require("../../../validation/user/edit");
const { sanitizeUser } = require("../../../utils/sanitize-user");
const { checkIfUserExists } = require("../../../lib/user/exits");

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


// Edit User Controller
const editUser = async (req, res, next) => {
	let {  name, country, email, role,  } = req.body;
	const { userId } = req.params;
	let { user } = req;

	try {
		// Performance
		const start = performance.now();

		// Step : Validate all request fields
		const { error } = editUserSchema.validate({
			name,
			country,
			email,
			role,
		});

		// Check for validation errors
		if (error) {
			return next(
				new ErrorResponse(error.details.map((detail) => detail.message).join(", "), 400),
			);
		}

		const userToEdit = await checkIfUserExists({ _id: userId });

		if (!userToEdit) {
			logger.warn(`An attempt to edit non existing user with id: ${userId} was made by user with id: ${user._id}`);
			return next(new ErrorResponse("User not found", 404));
		}

		
		if(userId.toString() !== user._id.toString() && user.role !== "admin") {
			logger.warn(`User with id: ${user._id} tried to edit user with id: ${userId}`);
			return next(new ErrorResponse("You are not authorized to edit this user", 401));
		}
		
		// Step : Check whether there is a user with the same name or email that is not me
		const checkUserWithSameNameAndEmail = await User.findOne({
			$or: [{ name }, { email }],
			_id: { $ne: userToEdit._id },
		});

		if (checkUserWithSameNameAndEmail) {
			logger.warn(`An attempt to edit user : ${userId} failed because there is a user ${checkUserWithSameNameAndEmail._id} with the same name or email`);
			return next(
				new ErrorResponse(
					"User with this name or email already exists, try out different name or email",
					404,
				),
			);
		}
		
		// Step : If the user is not an admin he can  not change the role or email
		if (user.role !== "admin") {
			role = userToEdit.role;
			email = userToEdit.email;
		}
		
		// Step : Update the user
		const editedUser = await User.findOneAndUpdate(
			{ _id: userToEdit._id },
			{ name, country, email, role },
			{ new: true },
		);

		if (!editedUser) {
			logger.warn(`An attempt to edit non existing user with id: ${userId} was made by user with id: ${user._id}`);
			return next(new ErrorResponse("User not found", 404));
		}
		
		// Step : Send the response
		res.status(201).json({
			success: true,
			message: "User was edited successfully.",
			user: sanitizeUser(editedUser, sanitizedUserFields),
		});
		
		// Step : Measure the time it took to update the user
		const end = performance.now();
		const timeTaken = end - start;
		
		// Step : Write the logs
		logger.info(
			`User ${userToEdit.name} was edited successfully by ${user.name} in ${timeTaken}ms`
		);
		
	} catch (error) {
		logger.error(`Error in Edit User Controller: ${error.message}`);
		next(error);
	}
}

module.exports = { editUser };