const logger = require("../../utils/logger");

const ensureIsBusiness = (req, next) => {
	try {
		const { user : { role } } = req;

		if (role !== "business") {
			return false;
		}
		next();
		
	} catch (error) {
		logger.error(`Error in ensuring that i am the business: ${error.message}`);
		return next(new ErrorResponse(error.message, 500));
	}
}

module.exports = { ensureIsBusiness };