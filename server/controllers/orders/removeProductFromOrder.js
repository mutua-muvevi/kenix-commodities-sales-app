/**
 * Remove Product from Order Controller
 *
 * DELETE /api/orders/:id/products/:productId
 * Accessible by: admin only
 *
 * Removes a product from order and releases inventory
 * Only allowed for pending or approved orders (not yet in transit)
 */

const Order = require('../../models/orders');
const Inventory = require('../../models/inventory');
const mongoose = require('mongoose');

/**
 * @route   DELETE /api/orders/:id/products/:productId
 * @desc    Remove a product from an order
 * @access  Private (admin only)
 *
 * @param {string} id - Order ID
 * @param {string} productId - Product ID to remove
 *
 * @returns {Object} Updated order
 */
const removeProductFromOrder = async (req, res) => {
	const session = await mongoose.startSession();

	try {
		session.startTransaction();

		const { id, productId } = req.params;
		const adminId = req.user._id;

		// Find order
		const order = await Order.findById(id).session(session);

		if (!order) {
			await session.abortTransaction();
			return res.status(404).json({
				success: false,
				message: 'Order not found',
				errors: ['No order exists with the specified ID'],
			});
		}

		// Check order status - only pending or approved orders can be modified
		if (!['pending', 'approved'].includes(order.approvalStatus)) {
			await session.abortTransaction();
			return res.status(400).json({
				success: false,
				message: 'Order cannot be modified',
				errors: [`Order with status ${order.approvalStatus} cannot be modified`],
			});
		}

		// Check if order is already in transit
		if (['in_transit', 'delivered'].includes(order.deliveryStatus)) {
			await session.abortTransaction();
			return res.status(400).json({
				success: false,
				message: 'Order cannot be modified',
				errors: [`Order is already ${order.deliveryStatus}`],
			});
		}

		// Find product in order
		const productIndex = order.products.findIndex(
			(p) => p.product.toString() === productId
		);

		if (productIndex === -1) {
			await session.abortTransaction();
			return res.status(404).json({
				success: false,
				message: 'Product not found in order',
				errors: ['The specified product is not part of this order'],
			});
		}

		// Check if it's the only product
		if (order.products.length === 1) {
			await session.abortTransaction();
			return res.status(400).json({
				success: false,
				message: 'Cannot remove product',
				errors: ['Order must have at least one product. Consider canceling the order instead.'],
			});
		}

		// Get product details before removal
		const removedProduct = order.products[productIndex];
		const removedQuantity = removedProduct.quantity;
		const removedPrice = removedProduct.priceAtOrderTime * removedQuantity;

		// Remove product from order
		order.products.splice(productIndex, 1);

		// Recalculate total price
		order.totalPrice = order.products.reduce((sum, item) => {
			return sum + item.priceAtOrderTime * item.quantity;
		}, 0);

		// Release inventory (ACID compliance)
		const inventory = await Inventory.findOne({
			product: productId,
		}).session(session);

		if (inventory) {
			const previousReserved = inventory.reservedQuantity;
			inventory.reservedQuantity = Math.max(
				0,
				inventory.reservedQuantity - removedQuantity
			);

			// Add to stock history
			inventory.stockHistory.push({
				type: 'released',
				quantity: removedQuantity,
				previousQuantity: previousReserved,
				newQuantity: inventory.reservedQuantity,
				reason: 'Product removed from order by admin',
				relatedOrder: order._id,
				performedBy: adminId,
				timestamp: new Date(),
			});

			await inventory.save({ session });
		}

		await order.save({ session });

		await session.commitTransaction();

		// Populate order for response
		const populatedOrder = await Order.findById(order._id)
			.populate('products.product', 'productName unitPrice imageUrl')
			.populate('orderer', 'shopName phoneNumber')
			.populate('approvedBy', 'firstName lastName');

		return res.status(200).json({
			success: true,
			message: 'Product removed from order successfully',
			data: {
				order: populatedOrder,
				removed: {
					productId,
					quantity: removedQuantity,
					priceReduction: removedPrice,
				},
			},
		});
	} catch (error) {
		await session.abortTransaction();
		console.error('Remove Product from Order Error:', error);

		return res.status(500).json({
			success: false,
			message: 'Failed to remove product from order',
			errors: [error.message],
		});
	} finally {
		session.endSession();
	}
};

module.exports = removeProductFromOrder;
