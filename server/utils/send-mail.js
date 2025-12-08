const ErrorResponse = require("./error-response");

const SparkPost = require("sparkpost");
const logger = require("./logger");
const client = new SparkPost(process.env.SEND_EMAIL_API_KEY, {
	origin: "https://api.eu.sparkpost.com",
});

const SendEmail = async ({ to, from, subject, html }) => {
	try {
		console.log("Value from email is", to, from, subject, html)

		const response = await client.transmissions.send({
			content: {
				from,
				subject,
				html,
			},
			recipients: [{ address: to }],
		});

		return response;
		
	} catch (error) {
		logger.error(`Send Email Failed from SparkPost: ${error.message}`);
		throw new ErrorResponse("Failed to send email", 500);
	}
};

module.exports = SendEmail;
