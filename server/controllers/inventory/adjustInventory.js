/**
 * Adjust Inventory Controller
 *
 * Endpoint: POST /api/inventory/:productId/adjust
 * Accessible by: admin only
 *
 * Allows admin to adjust inventory quantities with ACID compliance
 */

const mongoose = require('mongoose');
const Inventory = require('../../models/inventory');
const Product = require('../../models/products');
const ErrorResponse = require('../../utils/error-response');
const logger = require('../../utils/logger');

/**
 * Adjust inventory for a product
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const adjustInventory = async (req, res, next) => {
	// Start MongoDB session for transaction (ACID compliance)
	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		const { productId } = req.params;
		const { type, quantity, reason } = req.body;
		const adminUser = req.user;

		// Verify product exists
		const product = await Product.findById(productId).session(session);
		if (!product) {
			await session.abortTransaction();
			session.endSession();
			return res.status(404).json({
				success: false,
				message: 'Product not found',
				errors: [`No product found with ID: ${productId}`],
			});
		}

		// Get or create inventory record
		let inventory = await Inventory.findOne({ product: productId }).session(session);
		if (!inventory) {
			inventory = new Inventory({
				product: productId,
				quantity: 0,
				reservedQuantity: 0,
			});
		}

		const previousQuantity = inventory.quantity;
		let newQuantity = previousQuantity;
		let adjustmentAmount = quantity;

		// Apply adjustment based on type
		switch (type) {
			case 'restock':
				// Add stock (positive adjustment)
				adjustmentAmount = Math.abs(quantity);
				newQuantity = previousQuantity + adjustmentAmount;
				break;

			case 'adjustment':
				// Direct adjustment (can be positive or negative)
				newQuantity = previousQuantity + quantity;
				if (newQuantity < 0) {
					await session.abortTransaction();
					session.endSession();
					return res.status(400).json({
						success: false,
						message: 'Adjustment would result in negative inventory',
						errors: [`Current quantity: ${previousQuantity}, Adjustment: ${quantity}`],
					});
				}
				break;

			case 'wastage':
				// Remove stock due to wastage (negative adjustment)
				adjustmentAmount = -Math.abs(quantity);
				newQuantity = previousQuantity + adjustmentAmount;
				if (newQuantity < 0) {
					await session.abortTransaction();
					session.endSession();
					return res.status(400).json({
						success: false,
						message: 'Wastage amount exceeds available quantity',
						errors: [`Current quantity: ${previousQuantity}, Wastage: ${Math.abs(adjustmentAmount)}`],
					});
				}
				break;

			default:
				await session.abortTransaction();
				session.endSession();
				return res.status(400).json({
					success: false,
					message: 'Invalid adjustment type',
					errors: ['Type must be one of: restock, adjustment, wastage'],
				});
		}

		// Update inventory quantity
		inventory.quantity = newQuantity;
		inventory.lastUpdatedBy = adminUser._id;

		// Add to stock history
		inventory.stockHistory.push({
			type: type === 'restock' ? 'incoming' : 'adjustment',
			quantity: adjustmentAmount,
			previousQuantity,
			newQuantity,
			reason: `${type}: ${reason}`,
			performedBy: adminUser._id,
			timestamp: new Date(),
		});

		// Update product isInStock status based on new quantity
		const availableQuantity = newQuantity - inventory.reservedQuantity;
		inventory.isInStock = availableQuantity > 0;
		product.isInStock = availableQuantity > 0;

		// Save both documents in transaction
		await inventory.save({ session });
		await product.save({ session });

		// Commit transaction
		await session.commitTransaction();
		session.endSession();

		// Populate for response
		await inventory.populate('product', 'name price category');
		await inventory.populate('lastUpdatedBy', 'firstName lastName role');

		logger.info(`Inventory adjusted for product ${productId}: ${type}, quantity: ${adjustmentAmount}`);

		return res.status(200).json({
			success: true,
			message: `Inventory ${type} completed successfully`,
			data: {
				inventory: {
					id: inventory._id,
					product: inventory.product,
					previousQuantity,
					newQuantity,
					adjustmentAmount,
					adjustmentType: type,
					reservedQuantity: inventory.reservedQuantity,
					availableQuantity: newQuantity - inventory.reservedQuantity,
					isInStock: inventory.isInStock,
					reason,
					performedBy: {
						id: adminUser._id,
						name: `${adminUser.firstName} ${adminUser.lastName}`,
						role: adminUser.role,
					},
					timestamp: new Date(),
				},
			},
		});
	} catch (error) {
		// Rollback transaction on error
		await session.abortTransaction();
		session.endSession();

		logger.error('Adjust Inventory Error:', error);
		return next(new ErrorResponse('Failed to adjust inventory', 500));
	}
};

module.exports = adjustInventory;
