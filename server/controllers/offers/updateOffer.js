/**
 * Update Offer Controller
 *
 * PATCH /api/offers/:id
 * Accessible by: admin only
 *
 * Updates an existing offer
 */

const Offer = require('../../models/offers');

/**
 * @route   PATCH /api/offers/:id
 * @desc    Update an offer
 * @access  Private (admin only)
 *
 * @param {string} id - Offer ID
 */
const updateOffer = async (req, res) => {
	try {
		const { id } = req.params;
		const adminId = req.user._id;
		const updateData = req.body;

		// Find offer
		const offer = await Offer.findById(id);

		if (!offer) {
			return res.status(404).json({
				success: false,
				message: 'Offer not found',
				errors: ['No offer exists with the specified ID'],
			});
		}

		// Check for duplicate code if being updated
		if (updateData.code && updateData.code !== offer.code) {
			const existingOffer = await Offer.findOne({ code: updateData.code });
			if (existingOffer) {
				return res.status(400).json({
					success: false,
					message: 'Offer code already exists',
					errors: ['An offer with this code already exists'],
				});
			}
		}

		// Prevent updating expired offers to active
		if (updateData.status === 'active' && offer.status === 'expired') {
			const now = new Date();
			const toDate = updateData.toDate ? new Date(updateData.toDate) : offer.toDate;
			if (toDate < now) {
				return res.status(400).json({
					success: false,
					message: 'Cannot activate expired offer',
					errors: ['Please update the end date to a future date before activating'],
				});
			}
		}

		// Update offer
		Object.assign(offer, updateData, { updatedBy: adminId });
		await offer.save();

		// Populate for response
		const populatedOffer = await Offer.findById(offer._id)
			.populate('products', 'productName unitPrice imageUrl')
			.populate('categories', 'name')
			.populate('createdBy', 'firstName lastName')
			.populate('updatedBy', 'firstName lastName');

		return res.status(200).json({
			success: true,
			message: 'Offer updated successfully',
			data: {
				offer: populatedOffer,
			},
		});
	} catch (error) {
		console.error('Update Offer Error:', error);

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
			message: 'Failed to update offer',
			errors: [error.message],
		});
	}
};

module.exports = updateOffer;
