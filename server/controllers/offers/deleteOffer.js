/**
 * Delete (Disable) Offer Controller
 *
 * DELETE /api/offers/:id
 * Accessible by: admin only
 *
 * Soft-deletes an offer by setting status to 'disabled'
 */

const Offer = require('../../models/offers');

/**
 * @route   DELETE /api/offers/:id
 * @desc    Disable an offer (soft delete)
 * @access  Private (admin only)
 *
 * @param {string} id - Offer ID
 */
const deleteOffer = async (req, res) => {
	try {
		const { id } = req.params;
		const adminId = req.user._id;

		// Find offer
		const offer = await Offer.findById(id);

		if (!offer) {
			return res.status(404).json({
				success: false,
				message: 'Offer not found',
				errors: ['No offer exists with the specified ID'],
			});
		}

		// Already disabled
		if (offer.status === 'disabled') {
			return res.status(400).json({
				success: false,
				message: 'Offer already disabled',
				errors: ['This offer is already disabled'],
			});
		}

		// Soft delete by setting status to disabled
		offer.status = 'disabled';
		offer.isVisible = false;
		offer.updatedBy = adminId;
		await offer.save();

		return res.status(200).json({
			success: true,
			message: 'Offer disabled successfully',
			data: {
				offer: {
					_id: offer._id,
					name: offer.name,
					code: offer.code,
					status: offer.status,
				},
			},
		});
	} catch (error) {
		console.error('Delete Offer Error:', error);

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
			message: 'Failed to disable offer',
			errors: [error.message],
		});
	}
};

module.exports = deleteOffer;
