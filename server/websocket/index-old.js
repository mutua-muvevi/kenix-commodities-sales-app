/**
 * WebSocket Server - Real-time Communication
 *
 * Provides real-time updates for:
 * - Rider location tracking
 * - Delivery status changes
 * - Order updates
 * - Admin dashboard notifications
 *
 * Authentication: JWT token required for connection
 */

const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
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

				// TODO: Optionally update location in database
				// await User.findByIdAndUpdate(user._id, { location: { type: 'Point', coordinates: [location.lng, location.lat] } });

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
