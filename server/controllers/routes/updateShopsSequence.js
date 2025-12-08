/**
 * Update Shops Sequence Controller
 *
 * PATCH /api/routes/:id/shops
 * Accessible by: admin only
 *
 * Updates the sequence of shops on a route
 * Only allowed before route starts or while not in progress
 */

const Route = require('../../models/routes');
const User = require('../../models/user');

/**
 * @route   PATCH /api/routes/:id/shops
 * @desc    Update shop sequence on route
 * @access  Private (admin only)
 *
 * @param {string} id - Route ID
 * @body {Object[]} shops - Array of { shopId, sequenceNumber }
 *
 * @returns {Object} Updated route
 */
const updateShopsSequence = async (req, res) => {
	try {
		const { id } = req.params;
		const { shops } = req.body;
		const adminId = req.user._id;

		// Find route
		const route = await Route.findById(id);

		if (!route) {
			return res.status(404).json({
				success: false,
				message: 'Route not found',
				errors: ['No route exists with the specified ID'],
			});
		}

		// Check route is not in progress or completed
		if (route.currentProgress.isInProgress) {
			return res.status(400).json({
				success: false,
				message: 'Cannot update route in progress',
				errors: ['Route is currently active. Complete deliveries first.'],
			});
		}

		if (route.status === 'archived') {
			return res.status(400).json({
				success: false,
				message: 'Cannot update archived route',
				errors: ['This route is archived'],
			});
		}

		// Validate all shops exist
		const shopIds = shops.map((s) => s.shopId);
		const shopUsers = await User.find({
			_id: { $in: shopIds },
			role: 'shop',
		});

		if (shopUsers.length !== shopIds.length) {
			return res.status(404).json({
				success: false,
				message: 'Some shops not found',
				errors: ['One or more shop IDs are invalid'],
			});
		}

		// Validate sequence numbers are unique
		const sequenceNumbers = shops.map((s) => s.sequenceNumber);
		const uniqueSequences = new Set(sequenceNumbers);

		if (uniqueSequences.size !== sequenceNumbers.length) {
			return res.status(400).json({
				success: false,
				message: 'Invalid sequence numbers',
				errors: ['Sequence numbers must be unique'],
			});
		}

		// Build updated shops array
		const updatedShops = shops.map((shopInput) => {
			// Find existing shop data if it exists
			const existingShop = route.shops.find(
				(s) => s.shop.toString() === shopInput.shopId
			);

			const shopUser = shopUsers.find(
				(u) => u._id.toString() === shopInput.shopId
			);

			return {
				shop: shopInput.shopId,
				sequenceNumber: shopInput.sequenceNumber,
				estimatedArrivalTime: existingShop?.estimatedArrivalTime || '',
				location: shopUser.location || undefined,
				isActive: existingShop?.isActive !== undefined ? existingShop.isActive : true,
				notes: existingShop?.notes || '',
			};
		});

		// Sort by sequence number
		updatedShops.sort((a, b) => a.sequenceNumber - b.sequenceNumber);

		// Update route
		route.shops = updatedShops;
		route.currentProgress.currentShopIndex = 0; // Reset to start
		route.updatedBy = adminId;

		await route.save();

		// Populate route for response
		const populatedRoute = await Route.findById(route._id)
			.populate('shops.shop', 'shopName phoneNumber location')
			.populate('assignedRider', 'firstName lastName')
			.populate('updatedBy', 'firstName lastName');

		return res.status(200).json({
			success: true,
			message: 'Shop sequence updated successfully',
			data: {
				route: populatedRoute,
			},
		});
	} catch (error) {
		console.error('Update Shops Sequence Error:', error);

		return res.status(500).json({
			success: false,
			message: 'Failed to update shop sequence',
			errors: [error.message],
		});
	}
};

module.exports = updateShopsSequence;
