const rateLimit = require("express-rate-limit");

const isDevelopment = process.env.NODE_ENV !== 'production';

const requestWindow = 5 * 60 * 1000; // 15 minutes
const maxRequestsInDev = 1000;
const maxRequestsInProd = 100;

const config = {
	windowMs: requestWindow,
	limit: 300,
	max: isDevelopment ? maxRequestsInDev : maxRequestsInProd,
	message: "Too many requests, please try again later.",
	skipSucessfulRequests: true,
	delayMs: 0,
	skip: (req, res) => false,
};

module.exports = rateLimit(config);