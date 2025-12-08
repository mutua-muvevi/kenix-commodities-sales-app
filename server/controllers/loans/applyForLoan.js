/**
 * Apply for Loan Controller
 *
 * Endpoint: POST /api/loans/apply
 * Accessible by: shop only
 *
 * Creates a new loan application
 */

const KenixDukaLoan = require('../../models/kenixDukaLoans');
const User = require('../../models/user');
const Order = require('../../models/orders');
const ErrorResponse = require('../../utils/error-response');
const logger = require('../../utils/logger');

/**
 * Generate unique loan reference
 */
const generateLoanReference = () => {
	const date = new Date();
	const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
	const random = Math.floor(1000 + Math.random() * 9000);
	return `LOAN-${dateStr}-${random}`;
};

/**
 * Calculate loan eligibility
 */
const calculateEligibility = async (shopId) => {
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

	// Check payment history (on-time payments)
	const completedOrders = await Order.countDocuments({
		orderer: shopId,
		status: 'completed',
		paymentStatus: 'confirmed',
	});

	const paymentSuccessRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

	// Calculate maximum loan amount based on criteria
	let maxLoanAmount = 0;

	if (totalOrders >= 10 && paymentSuccessRate >= 80) {
		maxLoanAmount = Math.min(averageOrderValue * 5, 100000); // 5x average order or 100k max
	} else if (totalOrders >= 5 && paymentSuccessRate >= 70) {
		maxLoanAmount = Math.min(averageOrderValue * 3, 50000);
	} else if (totalOrders >= 3 && paymentSuccessRate >= 60) {
		maxLoanAmount = Math.min(averageOrderValue * 2, 25000);
	}

	return {
		isEligible: maxLoanAmount > 1000,
		maxLoanAmount: Math.floor(maxLoanAmount),
		totalOrders,
		totalOrderValue,
		averageOrderValue,
		paymentSuccessRate,
	};
};

/**
 * Apply for a loan
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const applyForLoan = async (req, res, next) => {
	try {
		const { amount, duration, purpose } = req.body;
		const shop = req.user;

		// Check if user is a shop
		if (shop.role !== 'shop') {
			return res.status(403).json({
				success: false,
				message: 'Only shop owners can apply for loans',
				errors: ['User is not a shop owner'],
			});
		}

		// Check for existing pending or active loans
		const existingLoan = await KenixDukaLoan.findOne({
			borrower: shop._id,
			status: { $in: ['pending', 'approved', 'disbursed', 'active'] },
		});

		if (existingLoan) {
			return res.status(400).json({
				success: false,
				message: 'You already have an active or pending loan',
				errors: ['Cannot apply for multiple loans simultaneously'],
				data: {
					existingLoan: {
						loanReference: existingLoan.loanReference,
						amount: existingLoan.loanAmount,
						status: existingLoan.status,
					},
				},
			});
		}

		// Calculate eligibility
		const eligibility = await calculateEligibility(shop._id);

		if (!eligibility.isEligible) {
			return res.status(400).json({
				success: false,
				message: 'You are not eligible for a loan at this time',
				errors: ['Insufficient order history or payment record'],
				data: {
					eligibility,
					requirements: {
						minimumOrders: 3,
						minimumPaymentSuccessRate: 60,
					},
				},
			});
		}

		if (amount > eligibility.maxLoanAmount) {
			return res.status(400).json({
				success: false,
				message: 'Requested amount exceeds maximum eligible amount',
				errors: [`Maximum eligible amount is KES ${eligibility.maxLoanAmount}`],
				data: {
					requestedAmount: amount,
					maxEligibleAmount: eligibility.maxLoanAmount,
				},
			});
		}

		// Calculate interest (2% per month)
		const interestRate = 2 * duration; // 2% per month
		const interestAmount = (amount * interestRate) / 100;
		const totalRepayableAmount = amount + interestAmount;

		// Generate repayment schedule
		const monthlyPayment = totalRepayableAmount / duration;
		const repaymentSchedule = [];

		for (let i = 1; i <= duration; i++) {
			const dueDate = new Date();
			dueDate.setMonth(dueDate.getMonth() + i);

			repaymentSchedule.push({
				installmentNumber: i,
				dueDate,
				amount: monthlyPayment,
				isPaid: false,
				amountPaid: 0,
			});
		}

		// Create loan application
		const loanReference = generateLoanReference();

		const loan = new KenixDukaLoan({
			loanReference,
			borrower: shop._id,
			loanAmount: amount,
			interestRate,
			interestAmount,
			totalRepayableAmount,
			loanPeriod: duration,
			purpose,
			status: 'pending',
			repaymentSchedule,
			outstandingBalance: totalRepayableAmount,
		});

		await loan.save();

		logger.info(`Loan application created: ${loanReference} for shop ${shop._id}`);

		return res.status(201).json({
			success: true,
			message: 'Loan application submitted successfully',
			data: {
				loan: {
					loanReference: loan.loanReference,
					loanAmount: loan.loanAmount,
					interestRate: loan.interestRate,
					interestAmount: loan.interestAmount,
					totalRepayableAmount: loan.totalRepayableAmount,
					loanPeriod: loan.loanPeriod,
					monthlyPayment,
					purpose: loan.purpose,
					status: loan.status,
					applicationDate: loan.applicationDate,
					repaymentSchedule: loan.repaymentSchedule,
				},
				eligibility,
			},
		});
	} catch (error) {
		logger.error('Apply for Loan Error:', error);
		return next(new ErrorResponse('Failed to submit loan application', 500));
	}
};

module.exports = applyForLoan;
