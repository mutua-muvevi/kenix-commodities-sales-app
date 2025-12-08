/**
 * Create Route Controller
 *
 * POST /api/routes
 * Accessible by: admin only
 *
 * Creates a new delivery route with sequential shop ordering
 */

const Route = require('../../models/routes');
const User = require('../../models/user');

/**
 * @route   POST /api/routes
 * @desc    Create a new delivery route
 * @access  Private (admin only)
 *
 * @body {string} routeName - Name of the route
 * @body {string} [description] - Route description
 * @body {Object[]} shops - Array of { shopId, sequenceNumber, estimatedArrivalTime?, notes? }
 * @body {string} [assignedRider] - Optional rider assignment
 * @body {string} [startTime] - Route start time (HH:MM)
 * @body {string} [endTime] - Route end time (HH:MM)
 * @body {string[]} [operatingDays] - Days route operates
 *
 * @returns {Object} Created route with populated shop details
 */
const createRoute = async (req, res) => {
	try {
		const {
			routeName,
			description,
			shops,
			assignedRider,
			startTime,
			endTime,
			operatingDays,
		} = req.body;
		const adminId = req.user._id;

		// Validate all shops exist and have locations
		const shopIds = shops.map((s) => s.shopId);
		const shopUsers = await User.find({
			_id: { $in: shopIds },
			role: 'shop',
		});

		if (shopUsers.length !== shopIds.length) {
			return res.status(404).json({
				success: false,
				message: 'Some shops not found',
				errors: ['One or more shop IDs are invalid or not shop users'],
			});
		}

		// Validate sequence numbers are unique and sequential
		const sequenceNumbers = shops.map((s) => s.sequenceNumber);
		const uniqueSequences = new Set(sequenceNumbers);

		if (uniqueSequences.size !== sequenceNumbers.length) {
			return res.status(400).json({
				success: false,
				message: 'Invalid sequence numbers',
				errors: ['Sequence numbers must be unique'],
			});
		}

		// Validate rider if provided
		if (assignedRider) {
			const rider = await User.findOne({
				_id: assignedRider,
				role: 'rider',
			});

			if (!rider) {
				return res.status(404).json({
					success: false,
					message: 'Rider not found',
					errors: ['The specified rider does not exist or is not a rider'],
				});
			}
		}

		// Build shops array with location data
		const routeShops = shops.map((shopInput) => {
			const shopUser = shopUsers.find(
				(u) => u._id.toString() === shopInput.shopId
			);

			return {
				shop: shopInput.shopId,
				sequenceNumber: shopInput.sequenceNumber,
				estimatedArrivalTime: shopInput.estimatedArrivalTime || '',
				location: shopUser.location || undefined,
				isActive: true,
				notes: shopInput.notes || '',
			};
		});

		// Sort shops by sequence number
		routeShops.sort((a, b) => a.sequenceNumber - b.sequenceNumber);

		// Generate unique route code
		const routeCount = await Route.countDocuments();
		const routeCode = `RT-${Date.now()}-${String(routeCount + 1).padStart(3, '0')}`;

		// Create route
		const route = new Route({
			routeName,
			routeCode,
			description,
			shops: routeShops,
			assignedRider: assignedRider || undefined,
			status: assignedRider ? 'active' : 'active',
			startTime,
			endTime,
			operatingDays,
			createdBy: adminId,
			updatedBy: adminId,
			currentProgress: {
				isInProgress: false,
				currentShopIndex: 0,
			},
		});

		await route.save();

		// Populate route for response
		const populatedRoute = await Route.findById(route._id)
			.populate('shops.shop', 'shopName phoneNumber location address')
			.populate('assignedRider', 'firstName lastName phoneNumber')
			.populate('createdBy', 'firstName lastName');

		return res.status(201).json({
			success: true,
			message: 'Route created successfully',
			data: {
				route: populatedRoute,
			},
		});
	} catch (error) {
		console.error('Create Route Error:', error);

		return res.status(500).json({
			success: false,
			message: 'Failed to create route',
			errors: [error.message],
		});
	}
};

module.exports = createRoute;
