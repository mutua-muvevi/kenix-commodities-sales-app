const multer = require("multer");
const path = require("path");
const { allowedExtensions } = require("../constants/allowed-extensions");


// Step 1: Define the memory storage
const storage = multer.memoryStorage();

// Step 2: Set up the file filtering mechanism
const fileFilter = (req, file, cb) => {
	// console.log("file >>>>", file)
	try {
		// Convert extension to lowercase
		const ext = path.extname(file.originalname).toLowerCase();
		
		if (!allowedExtensions.includes(ext)) {
			cb(new Error(`Only ${allowedExtensions.join(", ")} files are allowed`), false);
			return;
		}
		cb(null, true);
		
	} catch (error) {
		throw new Error(error.message);
	}
};

// Step 3: Create a multer instance with the specified storage and filter
const upload = multer({
	storage: storage,
	fileFilter: fileFilter,
	limits: { fileSize: 10 * 1024 * 1024 }  
});

module.exports = { upload };