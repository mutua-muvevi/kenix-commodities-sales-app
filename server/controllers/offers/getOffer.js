/**
 * Get Single Offer Controller
 *
 * GET /api/offers/:id
 * Accessible by: authenticated users
 *
 * Returns a single offer by ID
 */

const Offer = require('../../models/offers');

/**
 * @route   GET /api/offers/:id
 * @desc    Get a single offer
 * @access  Private (authenticated)
 *
 * @param {string} id - Offer ID
 */
const getOffer = async (req, res) => {
	try {
		const { id } = req.params;
		const userRole = req.user.role;

		// Build query
		const query = { _id: id };

		// Non-admins only see active, visible offers
		if (userRole !== 'admin') {
			const now = new Date();
			query.status = 'active';
			query.isVisible = true;
			query.fromDate = { $lte: now };
			query.toDate = { $gte: now };
		}

		const offer = await Offer.findOne(query)
			.populate('products', 'productName unitPrice imageUrl category')
			.populate('categories', 'name description')
			.populate('createdBy', 'firstName lastName')
			.populate('updatedBy', 'firstName lastName');

		if (!offer) {
			return res.status(404).json({
				success: false,
				message: 'Offer not found',
				errors: ['No offer exists with the specified ID or it is not available'],
			});
		}

		return res.status(200).json({
			success: true,
			message: 'Offer retrieved successfully',
			data: {
				offer,
			},
		});
	} catch (error) {
		console.error('Get Offer Error:', error);

		// Handle invalid ObjectId
		if (error.name === 'CastError') {
			return res.status(400).json({
				success: false,
				message: 'Invalid offer ID',
				errors: ['The provided ID is not valid'],
			});
		}

		return res.status(500).json({
			success: false,
			message: 'Failed to retrieve offer',
			errors: [error.message],
		});
	}
};

module.exports = getOffer;
