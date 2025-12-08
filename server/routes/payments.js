const express = require('express');
const router = express.Router();

const { initiateMpesaPayment } = require('../controllers/payments/initiateMpesa');
const { handleMpesaCallback } = require('../controllers/payments/mpesaCallback');
const { queryPaymentStatus } = require('../controllers/payments/queryStatus');
const { authenticationMiddleware } = require('../middleware/auth/authentication');
const { getMe } = require('../middleware/user/me');

// Initiate M-Pesa payment (authenticated users)
router.post('/mpesa/initiate', authenticationMiddleware, getMe, initiateMpesaPayment);

// M-Pesa callback (public - called by M-Pesa servers)
router.post('/mpesa/callback', handleMpesaCallback);

// Query payment status (authenticated users)
router.get('/mpesa/:transactionRef/status', authenticationMiddleware, getMe, queryPaymentStatus);

module.exports = router;
