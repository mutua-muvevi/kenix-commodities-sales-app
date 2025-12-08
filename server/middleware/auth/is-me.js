const { isSingleMongooseIdValid } = require("../../utils/is-valid-mongoose-id");
const logger = require("../../utils/logger");

const ensureIsMe = (req, next, givenId) => {
	try {
		const { _id } = req.user;

		isSingleMongooseIdValid(givenId);

		if(givenId !== _id) {
			logger.warn(`The user with id : ${givenId} is not the user making the request who is ${_id}`);
			return next(new ErrorResponse("You are not the user", 403));
		}

		return true

	} catch (error) {
		logger.error(`Error in ensuring that i am the user: ${error.message}`);
		return next(new ErrorResponse(error.message, 500));
	}
}

module.exports = { ensureIsMe };