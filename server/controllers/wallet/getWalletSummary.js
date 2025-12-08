/**
 * Get Wallet Summary Controller
 *
 * Endpoint: GET /api/wallet/:riderId/summary
 * Accessible by: rider (own), admin
 *
 * Returns comprehensive wallet summary with statistics
 */

const RiderWallet = require('../../models/riderWallet');
const User = require('../../models/user');
const Delivery = require('../../models/deliveries');
const Order = require('../../models/orders');
const ErrorResponse = require('../../utils/error-response');
const logger = require('../../utils/logger');

/**
 * Get comprehensive wallet summary for a rider
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getWalletSummary = async (req, res, next) => {
	try {
		const { riderId } = req.params;
		const requestingUser = req.user;

		// Authorization check - rider can only view own wallet, admin can view any
		if (requestingUser.role !== 'admin' && requestingUser._id.toString() !== riderId) {
			return res.status(403).json({
				success: false,
				message: 'Access denied. You can only view your own wallet summary.',
				errors: ['Unauthorized access to wallet summary'],
			});
		}

		// Verify rider exists
		const rider = await User.findById(riderId);
		if (!rider) {
			return res.status(404).json({
				success: false,
				message: 'Rider not found',
				errors: [`No rider found with ID: ${riderId}`],
			});
		}

		if (rider.role !== 'rider') {
			return res.status(400).json({
				success: false,
				message: 'User is not a rider',
				errors: ['The specified user does not have the rider role'],
			});
		}

		// Get or create wallet
		const wallet = await RiderWallet.getOrCreateWallet(riderId);
		await wallet.populate('rider', 'firstName lastName phoneNumber');
		if (wallet.currentRoute) {
			await wallet.populate('currentRoute', 'routeId status');
		}

		// Calculate delivery statistics
		const completedDeliveries = await Delivery.find({
			rider: riderId,
			status: 'delivered',
		});

		const pendingDeliveries = await Delivery.find({
			rider: riderId,
			status: { $in: ['assigned', 'in_transit', 'at_location'] },
		}).populate('order', 'totalPrice');

		// Calculate total amount collected (from completed deliveries)
		const totalCollectedFromDeliveries = completedDeliveries.reduce((sum, delivery) => {
			return sum + (delivery.paymentCollected || 0);
		}, 0);

		// Calculate pending deliveries value
		const pendingDeliveriesValue = pendingDeliveries.reduce((sum, delivery) => {
			return sum + (delivery.order?.totalPrice || 0);
		}, 0);

		// Calculate average delivery value
		const totalDeliveries = completedDeliveries.length;
		const averageDeliveryValue = totalDeliveries > 0
			? totalCollectedFromDeliveries / totalDeliveries
			: 0;

		// Transaction statistics
		const totalTransactions = wallet.transactions.length;
		const loadTransactions = wallet.transactions.filter(txn => txn.type === 'load').length;
		const collectionTransactions = wallet.transactions.filter(txn => txn.type === 'collection').length;
		const adjustmentTransactions = wallet.transactions.filter(txn => txn.type === 'adjustment').length;

		// Calculate total bonuses and deductions
		const totalBonuses = wallet.transactions
			.filter(txn => txn.type === 'adjustment' && txn.amount > 0)
			.reduce((sum, txn) => sum + txn.amount, 0);

		const totalDeductions = wallet.transactions
			.filter(txn => txn.type === 'adjustment' && txn.amount < 0)
			.reduce((sum, txn) => sum + Math.abs(txn.amount), 0);

		// Settlement information
		const hasSettlementHistory = wallet.lastSettlement && wallet.lastSettlement.amount;

		logger.info(`Wallet summary retrieved for rider ${riderId}`);

		return res.status(200).json({
			success: true,
			message: 'Wallet summary retrieved successfully',
			data: {
				summary: {
					rider: {
						id: wallet.rider._id,
						name: `${wallet.rider.firstName} ${wallet.rider.lastName}`,
						phoneNumber: wallet.rider.phoneNumber,
					},
					wallet: {
						balance: wallet.balance,
						totalLoadedAmount: wallet.totalLoadedAmount,
						totalCollected: wallet.totalCollected,
						outstandingAmount: wallet.outstandingAmount,
						status: wallet.status,
						collectionPercentage: wallet.collectionPercentage,
						currentRoute: wallet.currentRoute,
					},
					deliveryStats: {
						completedDeliveries: completedDeliveries.length,
						pendingDeliveries: pendingDeliveries.length,
						totalDeliveries: completedDeliveries.length + pendingDeliveries.length,
						totalAmountCollected: totalCollectedFromDeliveries,
						pendingDeliveriesValue,
						averageDeliveryValue: parseFloat(averageDeliveryValue.toFixed(2)),
					},
					transactionStats: {
						totalTransactions,
						loadTransactions,
						collectionTransactions,
						adjustmentTransactions,
						totalBonuses,
						totalDeductions,
					},
					settlement: hasSettlementHistory ? {
						lastSettlementAmount: wallet.lastSettlement.amount,
						lastSettlementDate: wallet.lastSettlement.settledAt,
						daysSinceLastSettlement: wallet.lastSettlement.settledAt
							? Math.floor((new Date() - new Date(wallet.lastSettlement.settledAt)) / (1000 * 60 * 60 * 24))
							: null,
					} : null,
					performance: {
						averageCollectionPercentage: wallet.collectionPercentage,
						isInGoodStanding: wallet.balance >= -1000, // Example threshold
						needsSettlement: wallet.balance >= 0 && wallet.totalCollected > 0,
					},
				},
			},
		});
	} catch (error) {
		logger.error('Get Wallet Summary Error:', error);
		return next(new ErrorResponse('Failed to retrieve wallet summary', 500));
	}
};

module.exports = getWalletSummary;
