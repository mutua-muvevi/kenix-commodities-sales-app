// Import all required modules
const logger = require("../../../utils/logger");
const ErrorResponse = require("../../../utils/error-response");
const { sanitizeUser } = require("../../../utils/sanitize-user");

//-------------------------------------------------------------------------------------

const sanitizedUserFields = [
	"_id",
	"name",
	"email",
	"role",
	"permisions",
	"memberType",
	"image",
	"country",
	"emailVerified",
	"isBanned",
	"isDeleted",
	"myBusinesses",
	"myReviews",
	"myEnquiries",
	"myReplies",
	"myBusinessClaims",
	"myStats",
	"createdBy",
];

//-------------------------------------------------------------------------------------
// Fetch Me Controller
const fetchMe = async ( req, res, next ) => {
	try {
		const { user } = req;

		if (!user) {
			logger.error("User data is not attached to the request.");
			return next(new ErrorResponse("User data not available.", 500));
		}

		res.status(200).json({
			success: true,
			user: sanitizeUser(user, sanitizedUserFields),
		});

	} catch (error) {
		logger.error(`Error in fetchMe Controller: ${error.message}`);
		next(new ErrorResponse("An error occurred. Please try again.", 500));
	}
}



//-------------------------------------------------------------------------------------

module.exports = { fetchMe };