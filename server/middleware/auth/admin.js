const ErrorResponse = require("../../utils/error-response");
const logger = require("../../utils/logger");

const ensureIsAdmin = (req, next) => {
	try {
		const { user : { role, _id } } = req;

		if (role !== "admin") {
			logger.warn(`User with id: ${_id} with role ${role} tried to access admin routes`);
			return next(new ErrorResponse("You are not the authorized", 403));
		}
		
		return true;
		
	} catch (error) {
		logger.error(`Error in ensuring that i am the admin: ${error.message}`);
		return next(new ErrorResponse(error.message, 500));
	}

}

module.exports = { ensureIsAdmin };