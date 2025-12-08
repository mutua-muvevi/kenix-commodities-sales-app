/**
 * Adjust Wallet Controller
 *
 * Endpoint: POST /api/wallet/:riderId/adjust
 * Accessible by: admin only
 *
 * Allows admin to manually adjust a rider's wallet balance
 */

const mongoose = require('mongoose');
const RiderWallet = require('../../models/riderWallet');
const User = require('../../models/user');
const ErrorResponse = require('../../utils/error-response');
const logger = require('../../utils/logger');

/**
 * Manually adjust a rider's wallet balance
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const adjustWallet = async (req, res, next) => {
	// Start MongoDB session for transaction (ACID compliance)
	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		const { riderId } = req.params;
		const { amount, reason, type } = req.body;
		const adminUser = req.user;

		// Verify rider exists and has rider role
		const rider = await User.findById(riderId).session(session);
		if (!rider) {
			await session.abortTransaction();
			session.endSession();
			return res.status(404).json({
				success: false,
				message: 'Rider not found',
				errors: [`No rider found with ID: ${riderId}`],
			});
		}

		if (rider.role !== 'rider') {
			await session.abortTransaction();
			session.endSession();
			return res.status(400).json({
				success: false,
				message: 'User is not a rider',
				errors: ['The specified user does not have the rider role'],
			});
		}

		// Get or create wallet
		let wallet = await RiderWallet.findOne({ rider: riderId }).session(session);
		if (!wallet) {
			wallet = new RiderWallet({
				rider: riderId,
				balance: 0,
			});
		}

		// Record previous balance
		const previousBalance = wallet.balance;

		// Apply adjustment based on type
		let adjustmentAmount = amount;
		let description = reason;

		switch (type) {
			case 'adjustment':
				// Direct adjustment (can be positive or negative)
				wallet.balance += adjustmentAmount;
				description = `Admin adjustment: ${reason}`;
				break;
			case 'bonus':
				// Bonus (always positive)
				adjustmentAmount = Math.abs(amount);
				wallet.balance += adjustmentAmount;
				description = `Bonus: ${reason}`;
				break;
			case 'deduction':
				// Deduction (always negative)
				adjustmentAmount = -Math.abs(amount);
				wallet.balance += adjustmentAmount;
				description = `Deduction: ${reason}`;
				break;
			default:
				await session.abortTransaction();
				session.endSession();
				return res.status(400).json({
					success: false,
					message: 'Invalid adjustment type',
					errors: ['Type must be one of: adjustment, bonus, deduction'],
				});
		}

		// Add transaction record
		wallet.transactions.push({
			type: 'adjustment',
			amount: adjustmentAmount,
			previousBalance,
			newBalance: wallet.balance,
			description,
			performedBy: adminUser._id,
			timestamp: new Date(),
		});

		// Save wallet
		await wallet.save({ session });

		// Commit transaction
		await session.commitTransaction();
		session.endSession();

		// Populate for response
		await wallet.populate('rider', 'firstName lastName phoneNumber');

		logger.info(`Wallet adjusted for rider ${riderId} by admin ${adminUser._id}: ${adjustmentAmount}`);

		// Log notification (actual notification implementation would go here)
		logger.info(`NOTIFICATION: Rider ${riderId} - Wallet ${type}: ${adjustmentAmount} KES. Reason: ${reason}`);

		return res.status(200).json({
			success: true,
			message: `Wallet ${type} applied successfully`,
			data: {
				wallet: {
					id: wallet._id,
					rider: wallet.rider,
					previousBalance,
					newBalance: wallet.balance,
					adjustmentAmount,
					adjustmentType: type,
					reason,
					performedBy: {
						id: adminUser._id,
						name: `${adminUser.firstName} ${adminUser.lastName}`,
						role: adminUser.role,
					},
					timestamp: new Date(),
				},
			},
		});
	} catch (error) {
		// Rollback transaction on error
		await session.abortTransaction();
		session.endSession();

		logger.error('Adjust Wallet Error:', error);
		return next(new ErrorResponse('Failed to adjust wallet', 500));
	}
};

module.exports = adjustWallet;
