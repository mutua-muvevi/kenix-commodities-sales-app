/**
 * Create Order Controller
 *
 * POST /api/orders
 * Accessible by: shop, sales_agent
 *
 * Creates a new order with inventory reservation and validation
 * ACID compliant - uses transactions for inventory management
 */

const Order = require('../../models/orders');
const Product = require('../../models/products');
const Inventory = require('../../models/inventory');
const User = require('../../models/user');
const Offer = require('../../models/offers');
const mongoose = require('mongoose');

/**
 * @route   POST /api/orders
 * @desc    Create a new order
 * @access  Private (shop, sales_agent)
 *
 * @body {Object[]} products - Array of { product: ObjectId, quantity: Number }
 * @body {string} paymentMethod - Payment method (cash, mpesa, credit)
 * @body {string} [deliveryNotes] - Optional delivery instructions
 *
 * @returns {Object} Created order with populated products
 */
const createOrder = async (req, res) => {
	const session = await mongoose.startSession();

	try {
		session.startTransaction();

		const { products, paymentMethod, deliveryNotes, offerCode } = req.body;
		const userId = req.user._id;
		const userRole = req.user.role;

		// Determine orderer based on role
		let orderer = userId;
		let createdBy = userId;

		// If sales agent is creating order for a shop
		if (userRole === 'sales_agent' && req.body.shopId) {
			// Validate shop exists
			const shop = await User.findOne({
				_id: req.body.shopId,
				role: 'shop',
			}).session(session);

			if (!shop) {
				await session.abortTransaction();
				return res.status(404).json({
					success: false,
					message: 'Shop not found',
					errors: ['The specified shop does not exist'],
				});
			}

			orderer = shop._id;
			createdBy = userId;
		}

		// Validate products exist and calculate total
		let totalPrice = 0;
		const validatedProducts = [];
		const inventoryReservations = [];

		for (const item of products) {
			// Find product
			const product = await Product.findById(item.product).session(session);

			if (!product) {
				await session.abortTransaction();
				return res.status(404).json({
					success: false,
					message: 'Product not found',
					errors: [`Product ${item.product} does not exist`],
				});
			}

			// Check product is active
			if (!product.isActive) {
				await session.abortTransaction();
				return res.status(400).json({
					success: false,
					message: 'Product unavailable',
					errors: [`Product ${product.productName} is currently inactive`],
				});
			}

			// Check inventory availability
			const inventory = await Inventory.findOne({ product: product._id }).session(session);

			if (!inventory) {
				await session.abortTransaction();
				return res.status(404).json({
					success: false,
					message: 'Inventory not found',
					errors: [`No inventory record for product ${product.productName}`],
				});
			}

			// Check if in stock (admin override check)
			if (!inventory.isInStock) {
				await session.abortTransaction();
				return res.status(400).json({
					success: false,
					message: 'Product out of stock',
					errors: [`Product ${product.productName} is currently out of stock`],
				});
			}

			// Check available quantity
			const availableQty = inventory.quantity - inventory.reservedQuantity;
			if (availableQty < item.quantity) {
				await session.abortTransaction();
				return res.status(400).json({
					success: false,
					message: 'Insufficient stock',
					errors: [
						`Insufficient stock for ${product.productName}. Available: ${availableQty}, Requested: ${item.quantity}`,
					],
				});
			}

			// Calculate price
			const itemPrice = product.unitPrice * item.quantity;
			totalPrice += itemPrice;

			// Store validated product with priceAtOrderTime
			validatedProducts.push({
				product: product._id,
				quantity: item.quantity,
				priceAtOrderTime: product.unitPrice,
			});

			// Track inventory reservation for later
			inventoryReservations.push({
				productId: product._id,
				quantity: item.quantity,
			});
		}

		// Store original price before discounts
		const originalPrice = totalPrice;
		let totalDiscount = 0;
		const appliedOffers = [];

		// Process offer code if provided
		if (offerCode) {
			const offer = await Offer.findOne({
				code: offerCode.toUpperCase(),
				status: 'active',
			}).session(session);

			if (!offer) {
				await session.abortTransaction();
				return res.status(400).json({
					success: false,
					message: 'Invalid offer code',
					errors: ['The offer code is invalid or has expired'],
				});
			}

			// Create temporary order object for validation
			const tempOrder = {
				products: validatedProducts,
				totalPrice,
			};

			// Validate offer
			const validation = await offer.isValidForOrder(tempOrder, orderer);

			if (!validation.isValid) {
				await session.abortTransaction();
				return res.status(400).json({
					success: false,
					message: 'Offer cannot be applied',
					errors: [validation.reason],
				});
			}

			// Apply discount
			totalDiscount = validation.discount;
			totalPrice = Math.max(0, totalPrice - totalDiscount);

			appliedOffers.push({
				offer: offer._id,
				offerName: offer.name,
				offerCode: offer.code,
				offerType: offer.offerType,
				discountApplied: validation.discount,
			});
		} else {
			// Check for auto-applicable offers (no code required)
			const autoOffers = await Offer.find({
				status: 'active',
				code: { $exists: false },
				isVisible: true,
				fromDate: { $lte: new Date() },
				toDate: { $gte: new Date() },
			}).session(session);

			for (const offer of autoOffers) {
				if (!offer.stackable && appliedOffers.length > 0) {
					continue; // Skip non-stackable offers if one is already applied
				}

				const tempOrder = {
					products: validatedProducts,
					totalPrice,
				};

				const validation = await offer.isValidForOrder(tempOrder, orderer);

				if (validation.isValid && validation.discount > 0) {
					totalDiscount += validation.discount;
					totalPrice = Math.max(0, totalPrice - validation.discount);

					appliedOffers.push({
						offer: offer._id,
						offerName: offer.name,
						offerCode: offer.code || null,
						offerType: offer.offerType,
						discountApplied: validation.discount,
					});

					// Only apply one non-stackable offer
					if (!offer.stackable) {
						break;
					}
				}
			}
		}

		// Generate unique order ID
		const orderCount = await Order.countDocuments().session(session);
		const orderId = `ORD-${Date.now()}-${String(orderCount + 1).padStart(4, '0')}`;

		// Get shop location for delivery address
		const shopUser = await User.findById(orderer).session(session);
		const deliveryAddress = {
			location: shopUser.location || undefined,
			address: shopUser.address || '',
			deliveryNotes: deliveryNotes || '',
		};

		// Create order
		const order = new Order({
			orderer,
			createdBy,
			orderId,
			products: validatedProducts,
			totalPrice,
			originalPrice,
			totalDiscount,
			appliedOffers,
			paymentMethod,
			paymentStatus: paymentMethod === 'credit' ? 'confirmed' : 'pending',
			deliveryAddress,
			approvalStatus: 'pending',
			deliveryStatus: 'pending',
			status: 'pending',
		});

		await order.save({ session });

		// Reserve inventory for each product (ACID compliance)
		for (const reservation of inventoryReservations) {
			const inventory = await Inventory.findOne({
				product: reservation.productId,
			}).session(session);

			const previousReserved = inventory.reservedQuantity;
			inventory.reservedQuantity += reservation.quantity;

			// Add to stock history
			inventory.stockHistory.push({
				type: 'reserved',
				quantity: reservation.quantity,
				previousQuantity: previousReserved,
				newQuantity: inventory.reservedQuantity,
				reason: 'Order placement',
				relatedOrder: order._id,
				performedBy: userId,
				timestamp: new Date(),
			});

			await inventory.save({ session });
		}

		await session.commitTransaction();

		// Record offer usage (outside transaction - non-critical)
		for (const applied of appliedOffers) {
			try {
				const offer = await Offer.findById(applied.offer);
				if (offer) {
					await offer.recordUsage(orderer, order._id, applied.discountApplied);
				}
			} catch (usageError) {
				console.error('Failed to record offer usage:', usageError);
				// Non-critical - don't fail the order
			}
		}

		// Populate order for response
		const populatedOrder = await Order.findById(order._id)
			.populate('products.product', 'productName unitPrice imageUrl category')
			.populate('orderer', 'shopName phoneNumber location')
			.populate('createdBy', 'firstName lastName role')
			.populate('appliedOffers.offer', 'name code offerType');

		// Calculate estimated delivery date (example: 2 business days)
		const estimatedDeliveryDate = new Date();
		estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 2);

		return res.status(201).json({
			success: true,
			message: totalDiscount > 0
				? `Order created successfully. You saved KES ${totalDiscount}!`
				: 'Order created successfully',
			data: {
				order: populatedOrder,
				estimatedDeliveryDate,
				savings: totalDiscount > 0 ? {
					originalPrice,
					discount: totalDiscount,
					finalPrice: totalPrice,
					appliedOffers: appliedOffers.map((a) => ({
						name: a.offerName,
						code: a.offerCode,
						type: a.offerType,
						discount: a.discountApplied,
					})),
				} : null,
			},
		});
	} catch (error) {
		await session.abortTransaction();
		console.error('Create Order Error:', error);

		return res.status(500).json({
			success: false,
			message: 'Failed to create order',
			errors: [error.message],
		});
	} finally {
		session.endSession();
	}
};

module.exports = createOrder;
