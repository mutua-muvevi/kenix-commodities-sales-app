//package imports
const mongoose = require("mongoose");

//initialization
const { Schema } = mongoose;

//schema options
const MainSchemaOptions = {
	timestamps: true,
	collection: "inventory",
	optimisticConcurrency: true,
};

/**
 * Inventory Model - Real-time Stock Management
 *
 * This model tracks actual stock levels separate from product definitions.
 * It supports:
 * - Real-time stock tracking
 * - Reserved quantities (for pending orders)
 * - Stock history and audit trail
 * - Admin-declared stock availability overrides
 *
 * ACID Compliance: All stock updates must use atomic operations
 */
const InventorySchema = new Schema({
	product: {
		type: Schema.Types.ObjectId,
		ref: "Product",
		required: true,
		unique: true, // One inventory record per product
		index: true,
	},

	// Current available quantity
	quantity: {
		type: Number,
		required: true,
		default: 0,
		min: 0,
	},

	// Quantity reserved for pending orders (not yet delivered)
	reservedQuantity: {
		type: Number,
		default: 0,
		min: 0,
	},

	// Actual available = quantity - reservedQuantity
	// This should be calculated, not stored, but we include a virtual for convenience

	// Admin can manually declare if item is in stock regardless of quantity
	isInStock: {
		type: Boolean,
		default: true,
		index: true,
		// Admin override - if false, product unavailable even if quantity > 0
	},

	// Low stock threshold for alerts
	lowStockThreshold: {
		type: Number,
		default: 10,
		min: 0,
	},

	// Reorder point for automatic procurement alerts
	reorderPoint: {
		type: Number,
		default: 20,
		min: 0,
	},

	// Stock movements history (for audit trail)
	stockHistory: [
		{
			type: {
				type: String,
				enum: ['incoming', 'outgoing', 'adjustment', 'reserved', 'released'],
				required: true,
			},
			quantity: {
				type: Number,
				required: true,
			},
			previousQuantity: {
				type: Number,
				required: true,
			},
			newQuantity: {
				type: Number,
				required: true,
			},
			reason: {
				type: String,
				trim: true,
			},
			relatedOrder: {
				type: Schema.Types.ObjectId,
				ref: "Order",
			},
			performedBy: {
				type: Schema.Types.ObjectId,
				ref: "User",
			},
			timestamp: {
				type: Date,
				default: Date.now,
			},
		}
	],

	// Last stock update information
	lastStockUpdate: {
		type: Date,
		default: Date.now,
	},
	lastUpdatedBy: {
		type: Schema.Types.ObjectId,
		ref: "User",
	},

}, MainSchemaOptions);

// Virtual for actual available quantity
InventorySchema.virtual('availableQuantity').get(function() {
	return Math.max(0, this.quantity - this.reservedQuantity);
});

// Virtual to check if stock is low
InventorySchema.virtual('isLowStock').get(function() {
	return this.availableQuantity <= this.lowStockThreshold;
});

// Virtual to check if reorder is needed
InventorySchema.virtual('needsReorder').get(function() {
	return this.availableQuantity <= this.reorderPoint;
});

// Middleware to update lastStockUpdate timestamp
InventorySchema.pre("save", function (next) {
	if (this.isModified('quantity') || this.isModified('reservedQuantity')) {
		this.lastStockUpdate = new Date();
	}
	next();
});

// Static method to reserve stock atomically (ACID compliance)
InventorySchema.statics.reserveStock = async function(productId, quantity, orderId, userId) {
	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		const inventory = await this.findOne({ product: productId }).session(session);

		if (!inventory) {
			throw new Error('Product not found in inventory');
		}

		if (!inventory.isInStock) {
			throw new Error('Product is currently out of stock');
		}

		const availableQty = inventory.quantity - inventory.reservedQuantity;
		if (availableQty < quantity) {
			throw new Error(`Insufficient stock. Available: ${availableQty}, Requested: ${quantity}`);
		}

		const previousQty = inventory.reservedQuantity;
		inventory.reservedQuantity += quantity;

		// Add to stock history
		inventory.stockHistory.push({
			type: 'reserved',
			quantity: quantity,
			previousQuantity: previousQty,
			newQuantity: inventory.reservedQuantity,
			reason: 'Order placement',
			relatedOrder: orderId,
			performedBy: userId,
		});

		await inventory.save({ session });
		await session.commitTransaction();

		return inventory;
	} catch (error) {
		await session.abortTransaction();
		throw error;
	} finally {
		session.endSession();
	}
};

// Static method to release reserved stock (e.g., order cancelled)
InventorySchema.statics.releaseStock = async function(productId, quantity, orderId, userId, reason) {
	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		const inventory = await this.findOne({ product: productId }).session(session);

		if (!inventory) {
			throw new Error('Product not found in inventory');
		}

		const previousQty = inventory.reservedQuantity;
		inventory.reservedQuantity = Math.max(0, inventory.reservedQuantity - quantity);

		// Add to stock history
		inventory.stockHistory.push({
			type: 'released',
			quantity: quantity,
			previousQuantity: previousQty,
			newQuantity: inventory.reservedQuantity,
			reason: reason || 'Order cancelled/modified',
			relatedOrder: orderId,
			performedBy: userId,
		});

		await inventory.save({ session });
		await session.commitTransaction();

		return inventory;
	} catch (error) {
		await session.abortTransaction();
		throw error;
	} finally {
		session.endSession();
	}
};

// Static method to complete stock transaction (order delivered)
InventorySchema.statics.completeTransaction = async function(productId, quantity, orderId, userId) {
	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		const inventory = await this.findOne({ product: productId }).session(session);

		if (!inventory) {
			throw new Error('Product not found in inventory');
		}

		const previousQty = inventory.quantity;
		const previousReserved = inventory.reservedQuantity;

		// Decrease actual quantity and reserved quantity
		inventory.quantity = Math.max(0, inventory.quantity - quantity);
		inventory.reservedQuantity = Math.max(0, inventory.reservedQuantity - quantity);

		// Add to stock history
		inventory.stockHistory.push({
			type: 'outgoing',
			quantity: quantity,
			previousQuantity: previousQty,
			newQuantity: inventory.quantity,
			reason: 'Order delivered',
			relatedOrder: orderId,
			performedBy: userId,
		});

		await inventory.save({ session });
		await session.commitTransaction();

		return inventory;
	} catch (error) {
		await session.abortTransaction();
		throw error;
	} finally {
		session.endSession();
	}
};

// Index for efficient queries
InventorySchema.index({ product: 1, isInStock: 1 });
InventorySchema.index({ quantity: 1, reservedQuantity: 1 });

const Inventory = mongoose.models.Inventory || mongoose.model("Inventory", InventorySchema);

module.exports = Inventory;
