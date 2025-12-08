const { processMpesaCallback } = require('../../services/mpesa/callback');

const handleMpesaCallback = async (req, res) => {
	try {
		console.log('M-Pesa Callback Received:', JSON.stringify(req.body, null, 2));

		// Process the callback
		const result = await processMpesaCallback(req.body);

		// Always return 200 to M-Pesa to acknowledge receipt
		// Even if processing failed, we've logged it
		return res.status(200).json({
			ResultCode: 0,
			ResultDesc: 'Callback received successfully',
		});
	} catch (error) {
		console.error('M-Pesa Callback Handler Error:', error);

		// Still return 200 to M-Pesa
		return res.status(200).json({
			ResultCode: 0,
			ResultDesc: 'Callback received',
		});
	}
};

module.exports = { handleMpesaCallback };
