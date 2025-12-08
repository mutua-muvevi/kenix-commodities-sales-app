const { Storage } = require("@google-cloud/storage");
const path = require("path");
const { extensionMappings } = require("../config/extension-mapping");
const logger = require("./logger");

//--------------------------------------------------------------------

// Step 1: Configure Google Cloud Storage
const storage = new Storage({
	projectId: process.env.GCP_PROJECT_ID,
	keyFilename: path.join(__dirname, "../gcpkeys.json"),
});

const bucket = storage.bucket(process.env.GCP_BUCKET_NAME);
const bucketName = process.env.GCP_BUCKET_NAME;

//--------------------------------------------------------------------

const getFolderByExtension = (extension) => {
	return extensionMappings[extension] || "others";
};

//--------------------------------------------------------------------

// Upload file to Google Cloud Storage
const uploadToGCS = async (file, user) => {
	console.log("uploadToGCS is running");
	return new Promise((resolve, reject) => {
		if (!file) {
			logger.error("No file provided");
			return reject(new Error("No file provided"));
		}

		if (!user || !user.email) {
			logger.error("User email not provided");
			return reject(new Error("User information is incomplete or not provided"));
		}

		const extension = path.extname(file.originalname).toLowerCase();
		const folderName = getFolderByExtension(extension);
		const newFileName = `${user.email}/${folderName}/${Date.now()}-${file.originalname}`;

		let fileUpload = bucket.file(newFileName);

		const blobStream = fileUpload.createWriteStream({
			metadata: {
				contentType: file.mimetype,
			},
		});

		blobStream.on("error", (error) => {
			logger.error(`Unable to upload. Error: ${error.message}, { stack: error.stack }`);
			reject(new Error(`Unable to upload. Error: ${error.message}`));
		});

		blobStream.on("finish", () => {
			logger.info("File uploaded successfully ");
			// Make the file public
			fileUpload.makePublic((err, _) => {
				if (err) {
					reject(new Error(`Failed to make the file public. Error: ${err.message}`));
				} else {
					const url = `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`;
					resolve(url);
				}
			});
		});

		blobStream.end(file.buffer);
	});
};

// -----------------------------------------------------------------------------

const updateInGCS = async (oldFileName, file, user) => {
	try {
		// Step 1: Upload the new file
		const newFileURL = await uploadToGCS(file, user);

		// Step 2: Delete the old file
		await deleteFromGCS(user, oldFileName);

		// Step 3: Return the new file's URL
		return newFileURL;
	} catch (error) {
		throw new Error(`Unable to update. Error: ${error.message}`);
	}
};

//-----------------------------------------------------------------------------

const deleteFromGCS = async (user, oldFileName) => {
	if (!oldFileName || typeof oldFileName !== "string") {
		throw new Error("No filename provided or is not a valid string");
	}

	const extension = path.extname(oldFileName).toLowerCase();
	const folderName = getFolderByExtension(extension);

	let fullPath = `${user.email}/${folderName}/${oldFileName.split("/").pop()}`;

	const file = bucket.file(fullPath);

	try {
		await file.delete();
		return `Successfully deleted ${fullPath}`;
	} catch (err) {
		throw new Error(`Unable to delete. Error: ${err.message}`);
	}
};

//-----------------------------------------------------------------------------

const getStorageDetails = async (email) => {
	try {
		const [files] = await bucket.getFiles({ prefix: `${email}/` });
		return files;
	} catch (error) {
		console.error("Error fetching storage details:", error);
		throw error;
	}
};

//-----------------------------------------------------------------------------

const calculateStorageUsage = (files) => {
	const storageData = {};

	files.forEach((file) => {
		const folder = file.name.split("/")[1];
		const fileSize = parseInt(file.metadata.size, 10) || 0;
		const uploadedDate = file.metadata.timeCreated;

		if (!storageData[folder]) {
			storageData[folder] = { files: [], size: 0 };
		}

		storageData[folder].files.push({
			number: storageData[folder].files.length + 1,
			file: `https://storage.googleapis.com/${bucketName}/${file.name}`,
			size: fileSize,
			uploaded: new Date(uploadedDate).toISOString(),
		});

		storageData[folder].size += fileSize;
	});

	return storageData;
};

//-----------------------------------------------------------------------------

const downloadFromGCS = async (user, filename) => {
	if (!filename) {
		throw new Error("Filename is required");
	}

	if (!user || !user.email) {
		throw new Error("User information is incomplete or not provided");
	}

	const extension = path.extname(filename).toLowerCase();
	const folderName = getFolderByExtension(extension);

	const fullPath = `${user.email}/${folderName}/${filename}`;
	const file = bucket.file(fullPath);

	try {
		const exists = await file.exists();
		if (!exists[0]) {
			throw new Error("File does not exist in GCS");
		}

		const readStream = file.createReadStream();
		return readStream;
	} catch (error) {
		throw new Error(`Error in downloading from GCS: ${error.message}`);
	}
};

//-----------------------------------------------------------------------------

module.exports = {
	uploadToGCS,
	updateInGCS,
	deleteFromGCS,
	downloadFromGCS,

	getStorageDetails,
	calculateStorageUsage,
};
