/**
 * M-Pesa Retry Queue (Bull)
 *
 * Handles automatic retry of failed M-Pesa transactions with exponential backoff
 * Uses Redis-backed Bull queue for reliable job processing
 *
 * Features:
 * - Exponential backoff retry strategy
 * - Maximum retry attempts limit
 * - Transaction state tracking
 * - Comprehensive logging
 */

const Bull = require('bull');
const MpesaTransaction = require('../../models/mpesaTransactions');
const { initiateStkPush } = require('../mpesa/stkPush');
const logger = require('../../utils/logger');

/**
 * Redis configuration for Bull queue
 */
const redisConfig = {
	host: process.env.REDIS_HOST || 'localhost',
	port: process.env.REDIS_PORT || 6379,
	password: process.env.REDIS_PASSWORD || undefined,
};

/**
 * M-Pesa Retry Queue
 * Processes failed M-Pesa transactions with automatic retry logic
 */
const mpesaRetryQueue = new Bull('mpesa-retry', {
	redis: redisConfig,
	defaultJobOptions: {
		attempts: 3, // Number of retry attempts per job
		backoff: {
			type: 'exponential',
			delay: 60000, // Start with 1 minute, doubles each retry
		},
		removeOnComplete: 100, // Keep last 100 completed jobs for debugging
		removeOnFail: 50, // Keep last 50 failed jobs for analysis
	},
});

/**
 * Process M-Pesa retry job
 *
 * @param {Object} job - Bull job object
 * @param {string} job.data.transactionId - MongoDB transaction ID to retry
 * @returns {Promise<Object>} Processing result
 */
mpesaRetryQueue.process(async (job) => {
	const { transactionId } = job.data;

	try {
		logger.info(`Processing M-Pesa retry for transaction: ${transactionId}`);

		// Find the transaction
		const transaction = await MpesaTransaction.findById(transactionId);

		if (!transaction) {
			logger.error(`Transaction not found: ${transactionId}`);
			throw new Error('Transaction not found');
		}

		// Check if already successful
		if (transaction.status === 'success') {
			logger.info(`Transaction already completed: ${transactionId}`);
			return {
				success: true,
				message: 'Transaction already completed',
				transactionId,
			};
		}

		// Check if maximum retries exceeded
		if (transaction.retryCount >= transaction.maxRetries) {
			logger.warn(`Maximum retries exceeded for transaction: ${transactionId}`);

			// Mark transaction as permanently failed
			await MpesaTransaction.findByIdAndUpdate(transactionId, {
				status: 'failed',
				failureReason: 'Maximum retry attempts exceeded',
				failedAt: new Date(),
			});

			throw new Error('Maximum retries exceeded');
		}

		// Initiate new STK Push with same details
		logger.info(`Initiating STK Push retry for: ${transactionId}`);

		const result = await initiateStkPush({
			phoneNumber: transaction.payer.phoneNumber,
			amount: transaction.amount,
			accountReference: transaction.accountReference,
			transactionDesc: transaction.transactionDesc,
		});

		if (result.success) {
			// Update transaction with new checkout request
			await MpesaTransaction.findByIdAndUpdate(transactionId, {
				checkoutRequestID: result.checkoutRequestID,
				merchantRequestID: result.merchantRequestID,
				status: 'pending',
				retryCount: transaction.retryCount + 1,
				lastRetryAt: new Date(),
			});

			logger.info(`STK Push retry successful: ${transactionId}`, {
				checkoutRequestID: result.checkoutRequestID,
			});

			return {
				success: true,
				checkoutRequestID: result.checkoutRequestID,
				merchantRequestID: result.merchantRequestID,
				transactionId,
			};
		} else {
			// STK Push failed
			logger.error(`STK Push retry failed: ${transactionId}`, {
				error: result.error,
			});

			// Update retry count even on failure
			await MpesaTransaction.findByIdAndUpdate(transactionId, {
				retryCount: transaction.retryCount + 1,
				lastRetryAt: new Date(),
				errorMessage: result.error,
			});

			throw new Error(result.error || 'STK Push failed');
		}
	} catch (error) {
		logger.error(`M-Pesa retry processing error: ${transactionId}`, {
			error: error.message,
		});
		throw error;
	}
});

/**
 * Event: Job completed successfully
 */
mpesaRetryQueue.on('completed', (job, result) => {
	logger.info(`M-Pesa retry job completed: ${job.data.transactionId}`, {
		result,
		attempts: job.attemptsMade,
	});
});

/**
 * Event: Job failed after all retry attempts
 */
mpesaRetryQueue.on('failed', (job, err) => {
	logger.error(`M-Pesa retry job failed: ${job.data.transactionId}`, {
		error: err.message,
		attempts: job.attemptsMade,
		maxAttempts: job.opts.attempts,
	});
});

/**
 * Event: Job is active (started processing)
 */
mpesaRetryQueue.on('active', (job) => {
	logger.info(`M-Pesa retry job active: ${job.data.transactionId}`, {
		attempt: job.attemptsMade + 1,
	});
});

/**
 * Add a retry job to the queue
 *
 * @param {string} transactionId - MongoDB transaction ID
 * @param {number} delay - Delay before processing in milliseconds (default: 60000 = 1 minute)
 * @returns {Promise<Object>} Bull job object
 */
const addRetryJob = async (transactionId, delay = 60000) => {
	try {
		const job = await mpesaRetryQueue.add(
			{ transactionId },
			{
				delay,
				jobId: `retry-${transactionId}-${Date.now()}`, // Unique job ID
			}
		);

		logger.info(`Added M-Pesa retry job: ${transactionId}`, {
			jobId: job.id,
			delay,
		});

		return job;
	} catch (error) {
		logger.error(`Failed to add retry job: ${transactionId}`, {
			error: error.message,
		});
		throw error;
	}
};

/**
 * Get queue statistics
 *
 * @returns {Promise<Object>} Queue statistics
 */
const getQueueStats = async () => {
	try {
		const [waiting, active, completed, failed, delayed] = await Promise.all([
			mpesaRetryQueue.getWaitingCount(),
			mpesaRetryQueue.getActiveCount(),
			mpesaRetryQueue.getCompletedCount(),
			mpesaRetryQueue.getFailedCount(),
			mpesaRetryQueue.getDelayedCount(),
		]);

		return {
			waiting,
			active,
			completed,
			failed,
			delayed,
			total: waiting + active + completed + failed + delayed,
		};
	} catch (error) {
		logger.error('Failed to get queue stats', { error: error.message });
		throw error;
	}
};

/**
 * Clean old completed and failed jobs
 *
 * @param {number} grace - Grace period in milliseconds (default: 24 hours)
 * @returns {Promise<void>}
 */
const cleanOldJobs = async (grace = 24 * 60 * 60 * 1000) => {
	try {
		await mpesaRetryQueue.clean(grace, 'completed');
		await mpesaRetryQueue.clean(grace, 'failed');

		logger.info('Cleaned old M-Pesa retry jobs', { grace });
	} catch (error) {
		logger.error('Failed to clean old jobs', { error: error.message });
		throw error;
	}
};

module.exports = {
	mpesaRetryQueue,
	addRetryJob,
	getQueueStats,
	cleanOldJobs,
};
