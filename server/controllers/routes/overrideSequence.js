/**
 * Override Sequence Controller
 *
 * PATCH /api/routes/:id/override-sequence
 * Accessible by: admin only
 *
 * Allows admin to override sequential delivery requirement
 * Used when a shop is closed or unavailable
 */

const Route = require('../../models/routes');
const Delivery = require('../../models/deliveries');
const mongoose = require('mongoose');

/**
 * @route   PATCH /api/routes/:id/override-sequence
 * @desc    Override sequential delivery for a specific shop
 * @access  Private (admin only)
 *
 * @param {string} id - Route ID
 * @body {string} currentShopId - Shop to skip
 * @body {string} nextShopId - Next shop to deliver to
 * @body {string} reason - Reason for override (required)
 *
 * @returns {Object} Updated route
 */
const overrideSequence = async (req, res) => {
	const session = await mongoose.startSession();

	try {
		session.startTransaction();

		const { id } = req.params;
		const { currentShopId, nextShopId, reason } = req.body;
		const adminId = req.user._id;

		// Find route
		const route = await Route.findById(id).session(session);

		if (!route) {
			await session.abortTransaction();
			return res.status(404).json({
				success: false,
				message: 'Route not found',
				errors: ['No route exists with the specified ID'],
			});
		}

		// Check route is in progress
		if (!route.currentProgress.isInProgress) {
			await session.abortTransaction();
			return res.status(400).json({
				success: false,
				message: 'Route is not in progress',
				errors: ['Override can only be applied to active routes'],
			});
		}

		// Find current shop in sequence
		const currentShopIndex = route.shops.findIndex(
			(s) => s.shop.toString() === currentShopId
		);

		if (currentShopIndex === -1) {
			await session.abortTransaction();
			return res.status(404).json({
				success: false,
				message: 'Shop not found on route',
				errors: ['The specified shop is not part of this route'],
			});
		}

		// Find next shop in sequence
		const nextShopIndex = route.shops.findIndex(
			(s) => s.shop.toString() === nextShopId
		);

		if (nextShopIndex === -1) {
			await session.abortTransaction();
			return res.status(404).json({
				success: false,
				message: 'Next shop not found on route',
				errors: ['The specified next shop is not part of this route'],
			});
		}

		// Validate next shop is after current shop
		if (nextShopIndex <= currentShopIndex) {
			await session.abortTransaction();
			return res.status(400).json({
				success: false,
				message: 'Invalid sequence override',
				errors: ['Next shop must be after the current shop in sequence'],
			});
		}

		// Mark skipped shop as inactive temporarily
		route.shops[currentShopIndex].isActive = false;
		route.shops[currentShopIndex].notes =
			(route.shops[currentShopIndex].notes || '') +
			`\n[SKIPPED by admin: ${reason}]`;

		// Update route progress to next shop
		route.currentProgress.currentShopIndex = nextShopIndex;

		// Set admin override
		route.adminOverrides.canSkipShops = true;
		route.adminOverrides.overrideReason = reason;
		route.adminOverrides.overrideBy = adminId;
		route.adminOverrides.overrideAt = new Date();
		route.updatedBy = adminId;

		await route.save({ session });

		// Find and mark deliveries for skipped shop
		const deliveries = await Delivery.find({
			route: route._id,
			shop: currentShopId,
		}).session(session);

		for (const delivery of deliveries) {
			delivery.status = 'skipped';
			delivery.adminOverride.isOverridden = true;
			delivery.adminOverride.reason = reason;
			delivery.adminOverride.overriddenBy = adminId;
			delivery.adminOverride.overriddenAt = new Date();

			await delivery.save({ session });

			// Enable next delivery in sequence
			const nextDelivery = await Delivery.findOne({
				route: route._id,
				previousDelivery: delivery._id,
			}).session(session);

			if (nextDelivery) {
				nextDelivery.canProceed = true;
				await nextDelivery.save({ session });
			}
		}

		await session.commitTransaction();

		// Populate route for response
		const populatedRoute = await Route.findById(route._id)
			.populate('shops.shop', 'shopName phoneNumber location')
			.populate('assignedRider', 'firstName lastName')
			.populate('adminOverrides.overrideBy', 'firstName lastName');

		// Log override for audit
		console.log(
			`Admin override applied to route ${route.routeCode}. Shop ${currentShopId} skipped. Reason: ${reason}`
		);

		return res.status(200).json({
			success: true,
			message: 'Sequence override applied successfully',
			data: {
				route: populatedRoute,
				override: {
					skippedShop: currentShopId,
					nextShop: nextShopId,
					reason,
					appliedBy: adminId,
					appliedAt: new Date(),
				},
			},
		});
	} catch (error) {
		await session.abortTransaction();
		console.error('Override Sequence Error:', error);

		return res.status(500).json({
			success: false,
			message: 'Failed to apply override',
			errors: [error.message],
		});
	} finally {
		session.endSession();
	}
};

module.exports = overrideSequence;
