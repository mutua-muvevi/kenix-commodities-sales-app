/* eslint-disable @typescript-eslint/no-explicit-any */

export const isFile = (object : any) => object instanceof File;

export const getFilenameFromUrl = (url : any) => {
	try {
		const pathname = new URL(url).pathname;
		const filename = pathname.split("/").pop(); // Extracts the last segment of the URL path

		// Regular expression to remove leading numbers, hyphens, and encoded characters
		const sanitizedFilename = filename
			? filename.replace(/^[\d%-]+/, "").replace(/%20/g, " ")
			: null;

		return sanitizedFilename;
	} catch (error : any) {
		console.error("Invalid URL:", error);
		return null;
	}
};
