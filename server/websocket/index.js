/**
 * WebSocket Server - Real-time Communication
 *
 * Provides real-time updates for:
 * - Rider location tracking
 * - Delivery status changes
 * - Order updates
 * - Admin dashboard notifications
 * - Route deviation alerts (theft prevention)
 *
 * Authentication: JWT token required for connection
 */

const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const RouteDeviation = require('../models/routeDeviations');
const logger = require('../utils/logger');

let io;

/**
 * Initialize WebSocket server
 *
 * @param {Object} server - HTTP server instance
 * @returns {Object} Socket.IO instance
 */
const initializeWebSocket = (server) => {
	io = socketIO(server, {
		cors: {
			origin: process.env.CLIENT_URL || 'http://localhost:3000',
			credentials: true,
			methods: ['GET', 'POST'],
		},
		pingTimeout: 60000,
		pingInterval: 25000,
	});

	// Authentication middleware
	io.use(async (socket, next) => {
		try {
			// Get token from handshake auth or query
			const token =
				socket.handshake.auth.token ||
				socket.handshake.query.token;

			if (!token) {
				return next(new Error('Authentication token required'));
			}

			// Verify JWT
			const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

			// Find user
			const user = await User.findById(decoded.sub).select('-salt -hash');

			if (!user) {
				return next(new Error('User not found'));
			}

			// Check if user is banned
			if (user.banStatus && user.banStatus.isBanned) {
				return next(new Error('User account is banned'));
			}

			// Attach user to socket
			socket.user = user;
			next();
		} catch (error) {
			if (error.name === 'JsonWebTokenError') {
				return next(new Error('Invalid token'));
			} else if (error.name === 'TokenExpiredError') {
				return next(new Error('Token expired'));
			}
			return next(new Error('Authentication failed'));
		}
	});

	// Connection handler
	io.on('connection', (socket) => {
		const user = socket.user;
		logger.info(`WebSocket: User connected - ${user._id} (${user.role})`);

		// Join role-specific room
		socket.join(user.role);

		// Join user-specific room
		socket.join(`user:${user._id}`);

		// Send connection confirmation
		socket.emit('connected', {
			message: 'Connected to real-time server',
			userId: user._id,
			role: user.role,
			timestamp: new Date(),
		});

		/**
		 * RIDER LOCATION UPDATES
		 * Riders broadcast their location to admin dashboard
		 */
		socket.on('rider:update-location', async (data) => {
			if (user.role !== 'rider') {
				socket.emit('error', { message: 'Only riders can update location' });
				return;
			}

			try {
				const { location, accuracy, timestamp } = data;

				// Validate location data
				if (!location || !location.lat || !location.lng) {
					socket.emit('error', { message: 'Invalid location data' });
					return;
				}

				// Broadcast to admin dashboard
				io.to('admin').emit('rider:location-updated', {
					riderId: user._id,
					riderName: `${user.firstName} ${user.lastName}`,
					location: location,
					accuracy: accuracy || null,
					timestamp: timestamp || new Date(),
				});

				socket.emit('rider:location-acknowledged', {
					message: 'Location updated successfully',
					timestamp: new Date(),
				});
			} catch (error) {
				logger.error('Rider location update error:', error);
				socket.emit('error', { message: 'Failed to update location' });
			}
		});

		/**
		 * ROUTE DEVIATION ALERT (NEW - Theft Prevention)
		 * Riders (or background service) report route deviations
		 * Admin dashboard receives real-time alerts
		 */
		socket.on('rider:route-deviation', async (data) => {
			if (user.role !== 'rider') {
				socket.emit('error', { message: 'Only riders can report deviations' });
				return;
			}

			try {
				const {
					routeId,
					currentLocation,
					expectedRoute,
					deviationDistance,
					severity,
					currentDeliveryId,
				} = data;

				// Validate deviation data
				if (!routeId || !currentLocation || !deviationDistance || !severity) {
					socket.emit('error', { message: 'Invalid deviation data' });
					return;
				}

				// Log deviation to database
				const deviation = await RouteDeviation.logDeviation({
					riderId: user._id,
					riderName: `${user.firstName} ${user.lastName}`,
					routeId,
					currentDeliveryId,
					actualLocation: currentLocation,
					expectedLocation: expectedRoute && expectedRoute[0] ? expectedRoute[0] : currentLocation,
					deviationDistance,
					severity,
				});

				// Send real-time alert to admin dashboard (only for warning/critical)
				if (severity === 'warning' || severity === 'critical') {
					io.to('admin').emit('rider:route-deviation-alert', {
						deviationId: deviation._id,
						riderId: user._id,
						riderName: `${user.firstName} ${user.lastName}`,
						routeId,
						currentLocation,
						expectedRoute,
						deviationDistance,
						severity,
						timestamp: new Date(),
						message: severity === 'critical'
							? `CRITICAL: Rider ${user.firstName} is ${deviationDistance.toFixed(1)}km off route!`
							: `Warning: Rider ${user.firstName} is deviating from route`,
					});

					logger.warn(`Route deviation detected: Rider ${user._id}, ${deviationDistance}km, ${severity}`);
				}

				// Acknowledge to rider app
				socket.emit('rider:deviation-acknowledged', {
					deviationId: deviation._id,
					message: 'Deviation logged',
					timestamp: new Date(),
				});
			} catch (error) {
				logger.error('Route deviation alert error:', error);
				socket.emit('error', { message: 'Failed to process deviation alert' });
			}
		});

		/**
		 * SHOP UNLOCK REQUEST (Existing - Enhanced with location)
		 * Rider requests admin to unlock next shop when current shop is unavailable
		 */
		socket.on('rider:request-shop-unlock', async (data) => {
			if (user.role !== 'rider') {
				socket.emit('error', { message: 'Only riders can request unlock' });
				return;
			}

			try {
				const { deliveryId, reason, shopId, location } = data;

				// Notify admin dashboard
				io.to('admin').emit('rider:unlock-request', {
					riderId: user._id,
					riderName: `${user.firstName} ${user.lastName}`,
					deliveryId,
					shopId,
					reason,
					location,
					timestamp: new Date(),
					message: `${user.firstName} ${user.lastName} requests to unlock next shop: ${reason}`,
				});

				// Acknowledge to rider
				socket.emit('rider:unlock-requested', {
					message: 'Admin has been notified',
					timestamp: new Date(),
				});

				logger.info(`Shop unlock requested: Rider ${user._id}, Delivery ${deliveryId}, Reason: ${reason}`);
			} catch (error) {
				logger.error('Shop unlock request error:', error);
				socket.emit('error', { message: 'Failed to request unlock' });
			}
		});

		/**
		 * ADMIN SHOP UNLOCK (Admin sends unlock confirmation to rider)
		 */
		socket.on('admin:unlock-shop', (data) => {
			if (user.role !== 'admin') {
				socket.emit('error', { message: 'Only admins can unlock shops' });
				return;
			}

			try {
				const { riderId, deliveryId, message } = data;

				// Notify rider
				io.to(`user:${riderId}`).emit('admin:shop-unlocked', {
					deliveryId,
					message: message || 'Admin has unlocked the next shop for you',
					timestamp: new Date(),
				});

				logger.info(`Admin ${user._id} unlocked shop for rider ${riderId}, delivery ${deliveryId}`);
			} catch (error) {
				logger.error('Admin shop unlock error:', error);
			}
		});

		/**
		 * SKIP REQUEST FROM RIDER
		 * Rider requests to skip unavailable shop
		 */
		socket.on('rider:request-skip', (data) => {
			if (user.role !== 'rider') {
				socket.emit('error', { message: 'Only riders can request skip' });
				return;
			}

			try {
				const { deliveryId, shopId, reason, notes, photo, location, timestamp } = data;

				// Validate required data
				if (!deliveryId || !shopId || !reason || !notes) {
					socket.emit('error', { message: 'Missing required skip request data' });
					return;
				}

				// Broadcast to admin dashboard
				io.to('admin').emit('rider:request-skip', {
					type: 'skip_request',
					deliveryId,
					riderId: user._id,
					riderName: `${user.firstName} ${user.lastName}`,
					shopId,
					reason,
					notes,
					photo,
					location,
					requestedAt: timestamp || new Date(),
					message: `${user.firstName} ${user.lastName} requests to skip a shop`,
				});

				// Acknowledge to rider
				socket.emit('rider:skip-request-received', {
					deliveryId,
					message: 'Your skip request has been sent to admin',
					timestamp: new Date(),
				});

				logger.info(`Skip request from rider ${user._id} for delivery ${deliveryId}`);
			} catch (error) {
				logger.error('Skip request error:', error);
				socket.emit('error', { message: 'Failed to process skip request' });
			}
		});

		/**
		 * SKIP APPROVAL FROM ADMIN
		 * Admin approves or rejects skip request
		 */
		socket.on('admin:resolve-skip', (data) => {
			if (user.role !== 'admin') {
				socket.emit('error', { message: 'Only admins can resolve skip requests' });
				return;
			}

			try {
				const { deliveryId, riderId, approved, message } = data;

				// Validate required data
				if (!deliveryId || !riderId || typeof approved !== 'boolean') {
					socket.emit('error', { message: 'Missing required resolution data' });
					return;
				}

				// Send resolution to rider
				const event = approved ? 'admin:skip-approved' : 'admin:skip-rejected';
				io.to(`user:${riderId}`).emit(event, {
					deliveryId,
					approved,
					message: message || (approved ? 'Skip approved. Proceed to next shop.' : 'Skip rejected. Please attempt delivery.'),
					resolvedBy: user._id,
					resolvedAt: new Date(),
				});

				logger.info(`Skip ${approved ? 'approved' : 'rejected'} by admin ${user._id} for delivery ${deliveryId}`);
			} catch (error) {
				logger.error('Skip resolution error:', error);
				socket.emit('error', { message: 'Failed to process skip resolution' });
			}
		});

		/**
		 * DELIVERY STATUS CHANGES
		 * Notify relevant parties when delivery status changes
		 */
		socket.on('delivery:status-change', (data) => {
			try {
				const { deliveryId, orderId, shopId, status, message } = data;

				// Notify shop about their delivery
				if (shopId) {
					io.to(`user:${shopId}`).emit('delivery:status-changed', {
						deliveryId,
						orderId,
						status,
						message,
						timestamp: new Date(),
					});
				}

				// Notify admin dashboard
				io.to('admin').emit('delivery:status-changed', {
					deliveryId,
					orderId,
					riderId: user._id,
					riderName: `${user.firstName} ${user.lastName}`,
					shopId,
					status,
					message,
					timestamp: new Date(),
				});

				logger.info(`Delivery ${deliveryId} status changed to ${status}`);
			} catch (error) {
				logger.error('Delivery status change error:', error);
				socket.emit('error', { message: 'Failed to broadcast status change' });
			}
		});

		/**
		 * ORDER UPDATES
		 * Notify shops when their orders are approved/rejected
		 */
		socket.on('order:update', (data) => {
			if (user.role !== 'admin') {
				socket.emit('error', { message: 'Only admins can send order updates' });
				return;
			}

			try {
				const { orderId, shopId, status, message } = data;

				// Notify shop
				if (shopId) {
					io.to(`user:${shopId}`).emit('order:updated', {
						orderId,
						status,
						message,
						timestamp: new Date(),
					});
				}

				logger.info(`Order ${orderId} updated to ${status}`);
			} catch (error) {
				logger.error('Order update error:', error);
			}
		});

		/**
		 * ROUTE ASSIGNMENT
		 * Notify rider when assigned to a route
		 */
		socket.on('route:assigned', (data) => {
			if (user.role !== 'admin') {
				socket.emit('error', { message: 'Only admins can assign routes' });
				return;
			}

			try {
				const { routeId, riderId, routeName, totalOrders } = data;

				// Notify rider
				io.to(`user:${riderId}`).emit('route:assigned-to-you', {
					routeId,
					routeName,
					totalOrders,
					message: `You have been assigned to route: ${routeName}`,
					timestamp: new Date(),
				});

				logger.info(`Route ${routeId} assigned to rider ${riderId}`);
			} catch (error) {
				logger.error('Route assignment error:', error);
			}
		});

		/**
		 * CHAT/MESSAGING
		 * Support for future chat functionality
		 */
		socket.on('message:send', (data) => {
			try {
				const { recipientId, message } = data;

				// Send message to recipient
				io.to(`user:${recipientId}`).emit('message:received', {
					senderId: user._id,
					senderName: `${user.firstName} ${user.lastName}`,
					senderRole: user.role,
					message,
					timestamp: new Date(),
				});

				// Acknowledge to sender
				socket.emit('message:sent', {
					recipientId,
					message,
					timestamp: new Date(),
				});
			} catch (error) {
				logger.error('Message send error:', error);
				socket.emit('error', { message: 'Failed to send message' });
			}
		});

		/**
		 * PING/PONG - Keep connection alive
		 */
		socket.on('ping', () => {
			socket.emit('pong', { timestamp: new Date() });
		});

		/**
		 * DISCONNECT HANDLER
		 */
		socket.on('disconnect', (reason) => {
			logger.info(
				`WebSocket: User disconnected - ${user._id} (${user.role}). Reason: ${reason}`
			);

			// Notify admin if rider disconnects
			if (user.role === 'rider') {
				io.to('admin').emit('rider:disconnected', {
					riderId: user._id,
					riderName: `${user.firstName} ${user.lastName}`,
					timestamp: new Date(),
				});
			}
		});

		/**
		 * ERROR HANDLER
		 */
		socket.on('error', (error) => {
			logger.error(`WebSocket error for user ${user._id}:`, error);
		});
	});

	logger.info('WebSocket server initialized successfully');
	return io;
};

/**
 * Get Socket.IO instance
 *
 * @returns {Object} Socket.IO instance
 * @throws {Error} If WebSocket not initialized
 */
const getIO = () => {
	if (!io) {
		throw new Error('WebSocket server not initialized. Call initializeWebSocket first.');
	}
	return io;
};

/**
 * Emit event to specific user
 *
 * @param {string} userId - User ID
 * @param {string} event - Event name
 * @param {Object} data - Event data
 */
const emitToUser = (userId, event, data) => {
	if (!io) {
		logger.warn('WebSocket not initialized. Cannot emit event.');
		return;
	}

	io.to(`user:${userId}`).emit(event, {
		...data,
		timestamp: new Date(),
	});
};

/**
 * Emit event to all users with specific role
 *
 * @param {string} role - User role (admin, rider, shop, sales_agent)
 * @param {string} event - Event name
 * @param {Object} data - Event data
 */
const emitToRole = (role, event, data) => {
	if (!io) {
		logger.warn('WebSocket not initialized. Cannot emit event.');
		return;
	}

	io.to(role).emit(event, {
		...data,
		timestamp: new Date(),
	});
};

/**
 * Broadcast event to all connected clients
 *
 * @param {string} event - Event name
 * @param {Object} data - Event data
 */
const broadcast = (event, data) => {
	if (!io) {
		logger.warn('WebSocket not initialized. Cannot broadcast.');
		return;
	}

	io.emit(event, {
		...data,
		timestamp: new Date(),
	});
};

module.exports = {
	initializeWebSocket,
	getIO,
	emitToUser,
	emitToRole,
	broadcast,
};
