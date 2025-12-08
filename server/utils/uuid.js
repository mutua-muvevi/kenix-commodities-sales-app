const { v4: uuidv4 } = require("uuid");

const createUniqueID = () => {
	return uuidv4();
};

module.exports = { createUniqueID };
