const logger = require("../../utils/logger");

const ensureIsPublicUser = (req, next) => {
	try {
		const { user : { role } } = req;

		if (role !== "public-user") {
			return false;
		}

		next();
		
	} catch (error) {
		logger.error(`Error in ensuring that i am the public-user: ${error.message}`);
		return next(new ErrorResponse(error.message, 500));
	}
}

module.exports = { ensureIsPublicUser };