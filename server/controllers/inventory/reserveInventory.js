/**
 * Reserve Inventory Controller
 *
 * Endpoint: POST /api/inventory/reserve
 * Accessible by: system (internal use by order creation)
 *
 * Reserves inventory for an order with ACID compliance
 */

const mongoose = require('mongoose');
const Inventory = require('../../models/inventory');
const Product = require('../../models/products');
const Order = require('../../models/orders');
const ErrorResponse = require('../../utils/error-response');
const logger = require('../../utils/logger');

/**
 * Reserve inventory for multiple products (used during order creation)
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const reserveInventory = async (req, res, next) => {
	// Start MongoDB session for transaction (ACID compliance)
	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		const { products, orderId } = req.body;
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

		const reservationResults = [];
		const failedReservations = [];

		// Process each product reservation
		for (const item of products) {
			const { productId, quantity } = item;

			// Verify product exists
			const product = await Product.findById(productId).session(session);
			if (!product) {
				failedReservations.push({
					productId,
					reason: 'Product not found',
				});
				continue;
			}

			// Get inventory record
			let inventory = await Inventory.findOne({ product: productId }).session(session);
			if (!inventory) {
				// Create inventory record if doesn't exist
				inventory = new Inventory({
					product: productId,
					quantity: 0,
					reservedQuantity: 0,
					isInStock: false,
				});
			}

			// Check if product is in stock
			if (!inventory.isInStock) {
				failedReservations.push({
					productId,
					productName: product.name,
					reason: 'Product is currently out of stock',
				});
				continue;
			}

			// Check if sufficient quantity available
			const availableQty = inventory.quantity - inventory.reservedQuantity;
			if (availableQty < quantity) {
				failedReservations.push({
					productId,
					productName: product.name,
					reason: `Insufficient stock. Available: ${availableQty}, Requested: ${quantity}`,
					available: availableQty,
					requested: quantity,
				});
				continue;
			}

			// Reserve the quantity
			const previousReserved = inventory.reservedQuantity;
			inventory.reservedQuantity += quantity;

			// Add to stock history
			inventory.stockHistory.push({
				type: 'reserved',
				quantity: quantity,
				previousQuantity: previousReserved,
				newQuantity: inventory.reservedQuantity,
				reason: 'Order placement',
				relatedOrder: orderId,
				performedBy: userId,
				timestamp: new Date(),
			});

			// Save inventory
			await inventory.save({ session });

			reservationResults.push({
				productId,
				productName: product.name,
				quantityReserved: quantity,
				previousReserved,
				newReserved: inventory.reservedQuantity,
				availableAfterReservation: inventory.quantity - inventory.reservedQuantity,
			});
		}

		// If any reservation failed, rollback all
		if (failedReservations.length > 0) {
			await session.abortTransaction();
			session.endSession();

			logger.warn(`Inventory reservation failed for order ${orderId}: ${failedReservations.length} products failed`);

			return res.status(400).json({
				success: false,
				message: 'Inventory reservation failed',
				errors: failedReservations.map(f => f.reason),
				data: {
					failedProducts: failedReservations,
					successfulReservations: 0,
					totalProducts: products.length,
				},
			});
		}

		// Commit transaction - all reservations successful
		await session.commitTransaction();
		session.endSession();

		logger.info(`Inventory reserved successfully for order ${orderId}: ${reservationResults.length} products`);

		return res.status(200).json({
			success: true,
			message: 'Inventory reserved successfully',
			data: {
				orderId,
				reservations: reservationResults,
				totalProductsReserved: reservationResults.length,
				timestamp: new Date(),
			},
		});
	} catch (error) {
		// Rollback transaction on error
		await session.abortTransaction();
		session.endSession();

		logger.error('Reserve Inventory Error:', error);
		return next(new ErrorResponse('Failed to reserve inventory', 500));
	}
};

module.exports = reserveInventory;
