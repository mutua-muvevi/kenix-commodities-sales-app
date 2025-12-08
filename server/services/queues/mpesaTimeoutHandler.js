/**
 * M-Pesa Timeout Handler
 *
 * Monitors pending M-Pesa transactions and handles timeouts
 * by adding them to the retry queue
 */

const MpesaTransaction = require('../../models/mpesaTransactions');
const { addRetryJob } = require('./mpesaRetryQueue');

// Timeout threshold in milliseconds (2 minutes)
const TIMEOUT_THRESHOLD = 2 * 60 * 1000;

// Check interval in milliseconds (1 minute)
const CHECK_INTERVAL = 60 * 1000;

let timeoutCheckInterval = null;

/**
 * Check for timed out transactions
 *
 * @returns {Promise<number>} Number of transactions processed
 */
const checkTimedOutTransactions = async () => {
	try {
		const cutoffTime = new Date(Date.now() - TIMEOUT_THRESHOLD);

		// Find pending transactions older than threshold
		const timedOutTransactions = await MpesaTransaction.find({
			status: 'pending',
			createdAt: { $lt: cutoffTime },
			retryCount: { $lt: 3 }, // Only retry if under max attempts
		}).limit(50); // Process in batches

		console.log(`Found ${timedOutTransactions.length} timed out transactions`);

		let processedCount = 0;

		for (const transaction of timedOutTransactions) {
			try {
				// Mark as timeout
				transaction.status = 'timeout';
				transaction.timeoutAt = new Date();
				await transaction.save();

				// Add to retry queue
				await addRetryJob(
					transaction._id.toString(),
					transaction.payer.phoneNumber,
					transaction.amount,
					transaction.accountReference,
					transaction.transactionDesc || 'Payment retry'
				);

				processedCount++;
				console.log(`Queued timeout transaction ${transaction.transactionRef} for retry`);
			} catch (error) {
				console.error(`Failed to process timeout for ${transaction.transactionRef}:`, error);
			}
		}

		return processedCount;
	} catch (error) {
		console.error('Timeout check error:', error);
		return 0;
	}
};

/**
 * Start the timeout checker
 *
 * @param {number} interval - Check interval in milliseconds (default: 1 minute)
 */
const startTimeoutChecker = (interval = CHECK_INTERVAL) => {
	if (timeoutCheckInterval) {
		console.log('Timeout checker already running');
		return;
	}

	console.log(`Starting M-Pesa timeout checker (interval: ${interval / 1000}s)`);

	// Run immediately
	checkTimedOutTransactions();

	// Then run at interval
	timeoutCheckInterval = setInterval(checkTimedOutTransactions, interval);
};

/**
 * Stop the timeout checker
 */
const stopTimeoutChecker = () => {
	if (timeoutCheckInterval) {
		clearInterval(timeoutCheckInterval);
		timeoutCheckInterval = null;
		console.log('M-Pesa timeout checker stopped');
	}
};

/**
 * Get timeout handler status
 *
 * @returns {Object} Status information
 */
const getTimeoutHandlerStatus = () => {
	return {
		isRunning: timeoutCheckInterval !== null,
		timeoutThreshold: TIMEOUT_THRESHOLD / 1000 + ' seconds',
		checkInterval: CHECK_INTERVAL / 1000 + ' seconds',
	};
};

module.exports = {
	checkTimedOutTransactions,
	startTimeoutChecker,
	stopTimeoutChecker,
	getTimeoutHandlerStatus,
};
