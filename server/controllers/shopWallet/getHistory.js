/**
 * Get Shop Wallet Transaction History Controller
 *
 * GET /api/shop-wallet/history
 * Accessible by: shop (own wallet), admin (any wallet)
 *
 * Returns paginated transaction history with filtering options
 */

const ShopWallet = require('../../models/shopWallet');

/**
 * @route   GET /api/shop-wallet/history
 * @desc    Get shop wallet transaction history
 * @access  Private (shop - own wallet, admin - any wallet)
 *
 * @query {string} [shopId] - Shop ID (admin only)
 * @query {number} [page=1] - Page number
 * @query {number} [limit=20] - Items per page
 * @query {string} [type] - Filter by transaction type (credit, debit, adjustment)
 * @query {string} [source] - Filter by source (airtime_sale, order_credit, admin_adjustment, withdrawal)
 * @query {string} [startDate] - Filter from date (ISO string)
 * @query {string} [endDate] - Filter to date (ISO string)
 *
 * @returns {Object} Paginated transaction history
 */
const getHistory = async (req, res) => {
	try {
		const { shopId, page = 1, limit = 20, type, source, startDate, endDate } = req.query;
		const userId = req.user._id;
		const userRole = req.user.role;

		// Determine which shop's wallet to access
		let targetShopId = userId;

		if (shopId && userRole === 'admin') {
			targetShopId = shopId;
		} else if (shopId && userRole !== 'admin') {
			return res.status(403).json({
				success: false,
				message: 'Access denied',
				errors: ['Only admins can view other shop wallets'],
			});
		}

		// Get wallet
		const wallet = await ShopWallet.findOne({ shop: targetShopId });

		if (!wallet) {
			return res.status(404).json({
				success: false,
				message: 'Wallet not found',
				errors: ['No wallet exists for this shop'],
			});
		}

		// Filter transactions
		let transactions = [...wallet.transactions];

		// Filter by type
		if (type) {
			transactions = transactions.filter((t) => t.type === type);
		}

		// Filter by source
		if (source) {
			transactions = transactions.filter((t) => t.source === source);
		}

		// Filter by date range
		if (startDate) {
			const start = new Date(startDate);
			transactions = transactions.filter((t) => new Date(t.timestamp) >= start);
		}

		if (endDate) {
			const end = new Date(endDate);
			end.setHours(23, 59, 59, 999);
			transactions = transactions.filter((t) => new Date(t.timestamp) <= end);
		}

		// Sort by timestamp descending (most recent first)
		transactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

		// Pagination
		const pageNum = parseInt(page, 10);
		const limitNum = Math.min(parseInt(limit, 10), 100);
		const startIndex = (pageNum - 1) * limitNum;
		const endIndex = startIndex + limitNum;

		const paginatedTransactions = transactions.slice(startIndex, endIndex);

		return res.status(200).json({
			success: true,
			message: 'Transaction history retrieved successfully',
			data: {
				transactions: paginatedTransactions,
				pagination: {
					currentPage: pageNum,
					totalPages: Math.ceil(transactions.length / limitNum),
					totalItems: transactions.length,
					itemsPerPage: limitNum,
					hasNextPage: endIndex < transactions.length,
					hasPrevPage: pageNum > 1,
				},
				wallet: {
					balance: wallet.balance,
					status: wallet.status,
				},
			},
		});
	} catch (error) {
		console.error('Get Wallet History Error:', error);

		return res.status(500).json({
			success: false,
			message: 'Failed to retrieve transaction history',
			errors: [error.message],
		});
	}
};

module.exports = getHistory;
