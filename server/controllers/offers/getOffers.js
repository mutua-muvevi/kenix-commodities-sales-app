/**
 * Get Offers Controller
 *
 * GET /api/offers
 * Accessible by: authenticated users (shops see active only, admins see all)
 *
 * Returns list of offers with filtering and pagination
 */

const Offer = require('../../models/offers');

/**
 * @route   GET /api/offers
 * @desc    Get list of offers
 * @access  Private (authenticated)
 *
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Items per page (default: 20)
 * @query {string} status - Filter by status
 * @query {string} offerType - Filter by offer type
 * @query {string} applicableTo - Filter by applicability
 * @query {string} search - Search by name or code
 */
const getOffers = async (req, res) => {
	try {
		const userRole = req.user.role;
		const { page = 1, limit = 20, status, offerType, applicableTo, search } = req.query;

		// Build query
		const query = {};

		// Non-admins only see active, visible offers
		if (userRole !== 'admin') {
			const now = new Date();
			query.status = 'active';
			query.isVisible = true;
			query.fromDate = { $lte: now };
			query.toDate = { $gte: now };
		} else {
			// Admin filters
			if (status) {
				query.status = status;
			}
		}

		// Common filters
		if (offerType) {
			query.offerType = offerType;
		}

		if (applicableTo) {
			query.applicableTo = applicableTo;
		}

		// Search
		if (search) {
			query.$or = [
				{ name: { $regex: search, $options: 'i' } },
				{ code: { $regex: search, $options: 'i' } },
				{ description: { $regex: search, $options: 'i' } },
			];
		}

		// Pagination
		const pageNum = parseInt(page, 10);
		const limitNum = Math.min(parseInt(limit, 10), 100);
		const skip = (pageNum - 1) * limitNum;

		// Execute query
		const [offers, totalCount] = await Promise.all([
			Offer.find(query)
				.populate('products', 'productName unitPrice imageUrl')
				.populate('categories', 'name')
				.populate('createdBy', 'firstName lastName')
				.sort({ priority: -1, createdAt: -1 })
				.skip(skip)
				.limit(limitNum),
			Offer.countDocuments(query),
		]);

		return res.status(200).json({
			success: true,
			message: 'Offers retrieved successfully',
			data: {
				offers,
				pagination: {
					currentPage: pageNum,
					totalPages: Math.ceil(totalCount / limitNum),
					totalItems: totalCount,
					itemsPerPage: limitNum,
					hasNextPage: skip + offers.length < totalCount,
					hasPrevPage: pageNum > 1,
				},
			},
		});
	} catch (error) {
		console.error('Get Offers Error:', error);

		return res.status(500).json({
			success: false,
			message: 'Failed to retrieve offers',
			errors: [error.message],
		});
	}
};

module.exports = getOffers;
