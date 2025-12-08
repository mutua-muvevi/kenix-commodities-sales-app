const paramsCleaner = (param) => {
	try {
		if (typeof param !== "string") {
			throw new Error("Invalid input: Expected a string.");
		}

		// Decode the URI component to handle encoded spaces and characters
		return decodeURIComponent(param.trim());
	} catch (error) {
		console.error("Error cleaning parameter:", error.message);
		return null;
	}
};

module.exports = { paramsCleaner };
