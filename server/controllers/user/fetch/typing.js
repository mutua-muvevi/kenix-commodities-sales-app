// Import all required modules
const logger = require("../../../utils/logger");
const { performance } = require("perf_hooks");
const User = require("../../../models/user");

//----------------------------------------------------------------------

// Fetch user as he types

const fetchUsersAsTheyType = async (req, res, next) => {
	const {
		query: { search },
	} = req;

	try {
		const start = performance.now();

		const users = await User.find({
			$or: [
				{ name: { $regex: search, $options: "i" } }, // case insensitive
				{ email: { $regex: search, $options: "i" } },
			],
		}).select("name email _id");

		const end = performance.now();
		const timeTaken = end - start;

		res.status(200).json({ success: true, users });

		logger.info(`Users fetched successfully in ${timeTaken}ms`);
	} catch (error) {
		logger.error(`Error fetching users: ${error.message}`, { stack: error.stack });
		res.status(500).json({ error: "Failed to fetch users" });
	}
};

//----------------------------------------------------------------------

module.exports = { fetchUsersAsTheyType };
