/**
 * Create Offer Controller
 *
 * POST /api/offers
 * Accessible by: admin only
 *
 * Creates a new offer/discount
 */

const Offer = require('../../models/offers');

/**
 * @route   POST /api/offers
 * @desc    Create a new offer
 * @access  Private (admin only)
 */
const createOffer = async (req, res) => {
	try {
		const adminId = req.user._id;
		const offerData = req.body;

		// Check for duplicate code if provided
		if (offerData.code) {
			const existingOffer = await Offer.findOne({ code: offerData.code });
			if (existingOffer) {
				return res.status(400).json({
					success: false,
					message: 'Offer code already exists',
					errors: ['An offer with this code already exists'],
				});
			}
		}

		// Create the offer
		const offer = new Offer({
			...offerData,
			createdBy: adminId,
			updatedBy: adminId,
		});

		await offer.save();

		// Populate for response
		const populatedOffer = await Offer.findById(offer._id)
			.populate('products', 'productName unitPrice imageUrl')
			.populate('categories', 'name')
			.populate('createdBy', 'firstName lastName');

		return res.status(201).json({
			success: true,
			message: 'Offer created successfully',
			data: {
				offer: populatedOffer,
			},
		});
	} catch (error) {
		console.error('Create Offer Error:', error);

		return res.status(500).json({
			success: false,
			message: 'Failed to create offer',
			errors: [error.message],
		});
	}
};

module.exports = createOffer;
