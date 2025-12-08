// Import all required modules
const logger = require("../../../utils/logger");
const ErrorResponse = require("../../../utils/error-response");
const { sanitizeUser } = require("../../../utils/sanitize-user");
const { performance } = require("perf_hooks");
const User = require("../../../models/user");

//----------------------------------------------------------------------

const userFields = [
	"_id",
	"name",
	"email",
	"role",
	"image",
	"country",
	"emailVerified",
	"isBanned",
	"business",
	"createdAt",
	"updatedAt",
	"createdBy",
];

const userPopulation = [
	{
		path: "createdBy",
		select: "name email"
	}
]

//----------------------------------------------------------------------
// Fetch All Controller
const fetchAllUsers = async (req, res, next) => {
	const { page = 1, limit = 10 } = req.query;

	try {
		const start = performance.now();

		const { user } = req;

		if(user.role !== "admin"){
			logger.warn(`User with id: ${user._id} with role ${user.role} tried to access admin routes to fetch all users`);
			return next(new ErrorResponse("You are not the authorized", 403));
		}

		// Step: Calculate pagination metadata
		const pageNum = Math.max(1, parseInt(page));
		const pageSize = Math.max(1, parseInt(limit));
		const skip = (pageNum - 1) * pageSize;

		// Step: Fetch all users with pagination
		const [users, totalUsers] = await Promise.all([
			User.find().skip(skip).limit(limit).populate(userPopulation),
			User.countDocuments(),
		])

		const totalPages = Math.ceil(totalUsers / limit);

		res.status(200).json({
			success: true,
			users: users.map((user) => sanitizeUser(user, userFields)),
			meta: {
				pageNum,
				limit,
				totalUsers,
				totalPages,
			},
			pagination: {
				totalItems: totalUsers,
				totalPages,
				currentPage: pageNum,
				pageSize
			}
		});

		const end = performance.now();
		const executionTime = end - start;

		logger.info(`fetchAllUsers Controller executed in ${executionTime} ms`);

	} catch (error) {
		logger.error(`Error in fetchAllUsers Controller: ${error.message}`);
		next(new ErrorResponse("An error occurred. Please try again.", 500));
	}
}

module.exports = { fetchAllUsers };