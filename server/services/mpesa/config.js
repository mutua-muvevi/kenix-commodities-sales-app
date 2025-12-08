/**
 * M-Pesa Daraja API Configuration
 *
 * Configuration for M-Pesa integration
 * Ensure these environment variables are set in config.env
 */

const mpesaConfig = {
	// Environment: 'sandbox' or 'production'
	environment: process.env.MPESA_ENVIRONMENT || 'sandbox',

	// M-Pesa API Credentials
	consumerKey: process.env.MPESA_CONSUMER_KEY,
	consumerSecret: process.env.MPESA_CONSUMER_SECRET,

	// STK Push credentials
	passkey: process.env.MPESA_PASSKEY,
	shortcode: process.env.MPESA_SHORTCODE,

	// Callback URL for payment notifications
	callbackUrl: process.env.MPESA_CALLBACK_URL,

	// API URLs
	baseUrl: process.env.MPESA_ENVIRONMENT === 'production'
		? 'https://api.safaricom.co.ke'
		: 'https://sandbox.safaricom.co.ke',

	// Endpoints
	endpoints: {
		auth: '/oauth/v1/generate?grant_type=client_credentials',
		stkPush: '/mpesa/stkpush/v1/processrequest',
		stkQuery: '/mpesa/stkpushquery/v1/query',
		b2c: '/mpesa/b2c/v1/paymentrequest',
		accountBalance: '/mpesa/accountbalance/v1/query',
		transactionStatus: '/mpesa/transactionstatus/v1/query',
	},

	// Transaction types
	transactionTypes: {
		customerPayBillOnline: 'CustomerPayBillOnline',
		customerBuyGoodsOnline: 'CustomerBuyGoodsOnline',
	},
};

/**
 * Validate M-Pesa configuration
 * Throws error if required credentials are missing
 */
const validateMpesaConfig = () => {
	const requiredFields = ['consumerKey', 'consumerSecret', 'passkey', 'shortcode', 'callbackUrl'];
	const missing = [];

	requiredFields.forEach(field => {
		if (!mpesaConfig[field]) {
			missing.push(field);
		}
	});

	if (missing.length > 0) {
		throw new Error(
			`M-Pesa configuration incomplete. Missing: ${missing.join(', ')}. Please set these in config.env`
		);
	}

	console.log(`M-Pesa configured for ${mpesaConfig.environment} environment`);
};

module.exports = {
	mpesaConfig,
	validateMpesaConfig,
};
