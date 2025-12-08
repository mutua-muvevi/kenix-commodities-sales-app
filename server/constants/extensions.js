// constants/extensions.js
const imageExtensions = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".tiff", ".bmp"];
const videoExtensions = [".mp4", ".mkv", ".avi", ".mov", ".wmv", ".flv"];
const otherExtensions = [".pdf", ".doc", ".docx", ".txt", ".zip", ".rar"];

const allowedExtensions = [...imageExtensions, ...videoExtensions, ...otherExtensions];

module.exports = { allowedExtensions, imageExtensions, videoExtensions, otherExtensions };
