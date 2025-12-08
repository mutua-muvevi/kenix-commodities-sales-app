const multer = require("multer");
const logger = require("../../utils/logger");

const multerErrorHandler = (err, req, res, next) => {
	console.log("Multer Error", err);
	if (err) {
		logger.error(`Multer error: ${err.message}`);
	}
	
	if (err instanceof multer.MulterError) {
		return res.status(400).json({ error: `Multer error: ${err.message}` });
	} else if (err) {
		return res.status(500).json({ error: `Server error: ${err.message}` });
	}

	next();
};

module.exports = { multerErrorHandler };
