/**
 * Release Inventory Controller
 *
 * Endpoint: POST /api/inventory/release
 * Accessible by: system (internal use by order cancellation)
 *
 * Releases reserved inventory when order is cancelled with ACID compliance
 */

const mongoose = require('mongoose');
const Inventory = require('../../models/inventory');
const Order = require('../../models/orders');
const ErrorResponse = require('../../utils/error-response');
const logger = require('../../utils/logger');

/**
 * Release reserved inventory (used during order cancellation/modification)
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const releaseInventory = async (req, res, next) => {
	// Start MongoDB session for transaction (ACID compliance)
	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		const { products, orderId, reason } = req.body;
		const userId = req.user._id;

		// Verify order exists
		const order = await Order.findById(orderId).session(session);
		if (!order) {
			await session.abortTransaction();
			session.endSession();
			return res.status(404).json({
				success: false,
				message: 'Order not found',
				errors: [`No order found with ID: ${orderId}`],
			});
		}

		const releaseResults = [];

		// Process each product release
		for (const item of products) {
			const { productId, quantity } = item;

			// Get inventory record
			const inventory = await Inventory.findOne({ product: productId }).session(session);
			if (!inventory) {
				logger.warn(`No inventory record found for product ${productId} during release`);
				continue;
			}

			// Release the reserved quantity
			const previousReserved = inventory.reservedQuantity;
			inventory.reservedQuantity = Math.max(0, inventory.reservedQuantity - quantity);

			// Add to stock history
			inventory.stockHistory.push({
				type: 'released',
				quantity: quantity,
				previousQuantity: previousReserved,
				newQuantity: inventory.reservedQuantity,
				reason: reason || 'Order cancelled/modified',
				relatedOrder: orderId,
				performedBy: userId,
				timestamp: new Date(),
			});

			// Update product availability if needed
			const availableQty = inventory.quantity - inventory.reservedQuantity;
			if (availableQty > 0 && !inventory.isInStock) {
				inventory.isInStock = true;
			}

			// Save inventory
			await inventory.save({ session });

			releaseResults.push({
				productId,
				quantityReleased: quantity,
				previousReserved,
				newReserved: inventory.reservedQuantity,
				availableAfterRelease: availableQty,
			});
		}

		// Commit transaction
		await session.commitTransaction();
		session.endSession();

		logger.info(`Inventory released successfully for order ${orderId}: ${releaseResults.length} products`);

		return res.status(200).json({
			success: true,
			message: 'Inventory released successfully',
			data: {
				orderId,
				releases: releaseResults,
				totalProductsReleased: releaseResults.length,
				reason: reason || 'Order cancelled/modified',
				timestamp: new Date(),
			},
		});
	} catch (error) {
		// Rollback transaction on error
		await session.abortTransaction();
		session.endSession();

		logger.error('Release Inventory Error:', error);
		return next(new ErrorResponse('Failed to release inventory', 500));
	}
};

module.exports = releaseInventory;
