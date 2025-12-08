const { default: mongoose } = require("mongoose");
const ErrorResponse = require("./error-response");
const logger = require("./logger");

const isSingleMongooseIdValid = (id,) => {
	try {
		if (!id || !mongoose.Types.ObjectId.isValid(id)) {
			return false;
		}

		return true;

	} catch (error) {
		logger.warn(`User id : ${id} is not a valid`);
		throw new ErrorResponse(error.message, 500);
	}
};

const isMultipleMongooseIdsValid = (ids, error, statusCode, next) => {
	try {
		if (
			!ids ||
			!Array.isArray(ids) ||
			ids.length === 0 ||
			!ids.every((id) => mongoose.Types.ObjectId.isValid(id))
		) {
			logger.warn(`Error: ${error}`);
			return next(new ErrorResponse(error, statusCode));
		}
		
		return true;
	} catch (error) {
		logger.warn(`User ids : ${JSON.stringify(ids)} is not a valid`);
		throw new ErrorResponse(error.message, 500);
	}
};


module.exports = { isSingleMongooseIdValid, isMultipleMongooseIdsValid };