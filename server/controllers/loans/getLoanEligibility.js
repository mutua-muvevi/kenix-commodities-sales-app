/**
 * Get Loan Eligibility Controller
 *
 * Endpoint: GET /api/loans/eligibility/:shopId
 * Accessible by: shop (own), admin
 *
 * Returns loan eligibility information for a shop
 */

const User = require('../../models/user');
const Order = require('../../models/orders');
const KenixDukaLoan = require('../../models/kenixDukaLoans');
const ErrorResponse = require('../../utils/error-response');
const logger = require('../../utils/logger');

/**
 * Get loan eligibility for a shop
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getLoanEligibility = async (req, res, next) => {
	try {
		const { shopId } = req.params;
		const requestingUser = req.user;

		// Authorization check
		if (requestingUser.role !== 'admin' && requestingUser._id.toString() !== shopId) {
			return res.status(403).json({
				success: false,
				message: 'Access denied. You can only check your own eligibility.',
				errors: ['Unauthorized access'],
			});
		}

		// Verify shop exists
		const shop = await User.findById(shopId);
		if (!shop) {
			return res.status(404).json({
				success: false,
				message: 'Shop not found',
				errors: [`No shop found with ID: ${shopId}`],
			});
		}

		if (shop.role !== 'shop') {
			return res.status(400).json({
				success: false,
				message: 'User is not a shop owner',
				errors: ['Only shop owners are eligible for loans'],
			});
		}

		// Count total orders
		const totalOrders = await Order.countDocuments({
			orderer: shopId,
			approvalStatus: 'approved',
		});

		// Calculate total order value
		const orders = await Order.find({
			orderer: shopId,
			approvalStatus: 'approved',
		});

		const totalOrderValue = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
		const averageOrderValue = totalOrders > 0 ? totalOrderValue / totalOrders : 0;

		// Check payment history
		const completedOrders = await Order.countDocuments({
			orderer: shopId,
			status: 'completed',
			paymentStatus: 'confirmed',
		});

		const paymentSuccessRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

		// Check for active loans
		const activeLoan = await KenixDukaLoan.findOne({
			borrower: shopId,
			status: { $in: ['pending', 'approved', 'disbursed', 'active'] },
		});

		// Calculate loan history
		const previousLoans = await KenixDukaLoan.find({
			borrower: shopId,
			status: { $in: ['completed', 'defaulted'] },
		});

		const completedLoans = previousLoans.filter(l => l.status === 'completed').length;
		const defaultedLoans = previousLoans.filter(l => l.status === 'defaulted').length;

		// Calculate maximum loan amount
		let maxLoanAmount = 0;
		let eligibilityLevel = 'not_eligible';
		let reasons = [];

		if (activeLoan) {
			reasons.push('You have an active loan. Clear it before applying for a new one.');
		} else if (defaultedLoans > 0) {
			reasons.push('You have defaulted loans. Please settle them first.');
		} else if (totalOrders < 3) {
			reasons.push(`You need at least 3 orders. Current: ${totalOrders}`);
		} else if (paymentSuccessRate < 60) {
			reasons.push(`Payment success rate must be at least 60%. Current: ${paymentSuccessRate.toFixed(1)}%`);
		} else {
			// Eligible - calculate amount
			if (totalOrders >= 10 && paymentSuccessRate >= 80) {
				maxLoanAmount = Math.min(averageOrderValue * 5, 100000);
				eligibilityLevel = 'excellent';
			} else if (totalOrders >= 5 && paymentSuccessRate >= 70) {
				maxLoanAmount = Math.min(averageOrderValue * 3, 50000);
				eligibilityLevel = 'good';
			} else {
				maxLoanAmount = Math.min(averageOrderValue * 2, 25000);
				eligibilityLevel = 'fair';
			}

			maxLoanAmount = Math.floor(maxLoanAmount);
			reasons.push('You are eligible for a loan!');
		}

		const isEligible = maxLoanAmount > 1000 && !activeLoan && defaultedLoans === 0;

		logger.info(`Loan eligibility checked for shop ${shopId}: ${isEligible ? 'Eligible' : 'Not eligible'}`);

		return res.status(200).json({
			success: true,
			message: 'Loan eligibility retrieved successfully',
			data: {
				eligibility: {
					isEligible,
					eligibilityLevel,
					maxLoanAmount,
					reasons,
					hasActiveLoan: !!activeLoan,
				},
				orderHistory: {
					totalOrders,
					totalOrderValue,
					averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
					completedOrders,
					paymentSuccessRate: parseFloat(paymentSuccessRate.toFixed(2)),
				},
				loanHistory: {
					totalLoans: previousLoans.length,
					completedLoans,
					defaultedLoans,
					activeLoan: activeLoan ? {
						loanReference: activeLoan.loanReference,
						amount: activeLoan.loanAmount,
						outstandingBalance: activeLoan.outstandingBalance,
						status: activeLoan.status,
					} : null,
				},
				requirements: {
					minimumOrders: 3,
					minimumPaymentSuccessRate: 60,
					noActiveLoan: true,
					noDefaultedLoans: true,
				},
			},
		});
	} catch (error) {
		logger.error('Get Loan Eligibility Error:', error);
		return next(new ErrorResponse('Failed to retrieve loan eligibility', 500));
	}
};

module.exports = getLoanEligibility;
