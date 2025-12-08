const mongoose = require('mongoose');
const Delivery = require('../../models/deliveries');

/**
 * Get delivery history for a rider
 * GET /api/deliveries/rider/:riderId/history
 *
 * Query params:
 * - page (default: 1)
 * - limit (default: 20)
 * - status (optional: completed, failed)
 * - startDate (optional: ISO date)
 * - endDate (optional: ISO date)
 */
const getDeliveryHistory = async (req, res) => {
  try {
    const { riderId } = req.params;
    const { page = 1, limit = 20, status, startDate, endDate } = req.query;

    // Verify rider is accessing own data or user is admin
    if (req.user.role !== 'admin' && req.user._id.toString() !== riderId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this history',
      });
    }

    // Build query - only show completed or failed deliveries in history
    const query = {
      assignedRider: new mongoose.Types.ObjectId(riderId),
    };

    // If status filter provided, use it; otherwise show completed and failed
    if (status) {
      query.status = status;
    } else {
      query.status = { $in: ['completed', 'failed'] };
    }

    // Date range filter
    if (startDate || endDate) {
      query.completedAt = {};
      if (startDate) query.completedAt.$gte = new Date(startDate);
      if (endDate) query.completedAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [deliveries, total] = await Promise.all([
      Delivery.find(query)
        .populate('shopId', 'shopName address phoneNumber location ownerName')
        .populate('orderId', 'orderId totalPrice items')
        .sort({ completedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Delivery.countDocuments(query),
    ]);

    const pages = Math.ceil(total / parseInt(limit));

    return res.status(200).json({
      success: true,
      message: 'Delivery history retrieved successfully',
      data: {
        deliveries,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages,
          hasMore: parseInt(page) < pages,
        },
      },
    });
  } catch (error) {
    console.error('Get Delivery History Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch delivery history',
      errors: [error.message],
    });
  }
};

module.exports = getDeliveryHistory;
