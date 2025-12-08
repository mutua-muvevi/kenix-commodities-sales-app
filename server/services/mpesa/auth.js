/**
 * M-Pesa OAuth Authentication
 *
 * Handles obtaining OAuth access tokens from M-Pesa API
 */

const axios = require('axios');
const { mpesaConfig } = require('./config');

// Cache for access token
let cachedToken = null;
let tokenExpiry = null;

/**
 * Get M-Pesa OAuth access token
 * Uses cached token if still valid, otherwise fetches new one
 *
 * @returns {Promise<string>} Access token
 * @throws {Error} If authentication fails
 */
const getMpesaAccessToken = async () => {
	try {
		// Return cached token if still valid
		if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
			return cachedToken;
		}

		// Create Basic Auth header
		const auth = Buffer.from(
			`${mpesaConfig.consumerKey}:${mpesaConfig.consumerSecret}`
		).toString('base64');

		const url = `${mpesaConfig.baseUrl}${mpesaConfig.endpoints.auth}`;

		const response = await axios.get(url, {
			headers: {
				'Authorization': `Basic ${auth}`,
			},
		});

		if (!response.data.access_token) {
			throw new Error('No access token received from M-Pesa');
		}

		// Cache the token (expires in 1 hour, cache for 55 minutes to be safe)
		cachedToken = response.data.access_token;
		tokenExpiry = Date.now() + (55 * 60 * 1000);

		console.log('M-Pesa access token obtained successfully');
		return cachedToken;
	} catch (error) {
		console.error('M-Pesa Auth Error:', error.response?.data || error.message);

		// Clear cached token on error
		cachedToken = null;
		tokenExpiry = null;

		throw new Error(
			error.response?.data?.errorMessage || 'Failed to authenticate with M-Pesa API'
		);
	}
};

/**
 * Clear cached token (useful for testing or forced refresh)
 */
const clearCachedToken = () => {
	cachedToken = null;
	tokenExpiry = null;
};

module.exports = {
	getMpesaAccessToken,
	clearCachedToken,
};
