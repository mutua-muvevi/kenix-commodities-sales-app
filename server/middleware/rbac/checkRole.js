/**
 * Role-Based Access Control (RBAC) Middleware
 *
 * This middleware enforces role-based permissions on API endpoints.
 *
 * Roles hierarchy:
 * - admin: Full access to all resources
 * - shop: Shop owners - can create orders, view products
 * - sales_agent: Field agents - can register shops, create orders, manage territory
 * - rider: Delivery personnel - can manage deliveries, update delivery status
 *
 * Usage:
 * router.post('/products', authenticationMiddleware, getMe, checkRole(['admin']), createProduct);
 * router.get('/orders', authenticationMiddleware, getMe, checkRole(['admin', 'shop', 'sales_agent']), getOrders);
 */

/**
 * Check if user has required role(s) to access endpoint
 *
 * @param {Array<string>} allowedRoles - Array of roles allowed to access this endpoint
 * @returns {Function} Express middleware function
 *
 * @example
 * // Only admins can access
 * router.post('/products', authenticationMiddleware, getMe, checkRole(['admin']), createProduct);
 *
 * @example
 * // Multiple roles can access
 * router.get('/orders', authenticationMiddleware, getMe, checkRole(['admin', 'shop', 'sales_agent']), getOrders);
 */
const checkRole = (allowedRoles) => {
	return (req, res, next) => {
		try {
			// User should be attached to req by authenticationMiddleware and getMe
			const user = req.user;

			if (!user) {
				return res.status(401).json({
					success: false,
					message: 'Authentication required. User not found in request.',
					errors: ['No authenticated user found'],
				});
			}

			// Check if user has a role
			if (!user.role) {
				return res.status(403).json({
					success: false,
					message: 'Access denied. User role not defined.',
					errors: ['User does not have an assigned role'],
				});
			}

			// Check if user's role is in allowed roles
			if (!allowedRoles.includes(user.role)) {
				return res.status(403).json({
					success: false,
					message: `Access denied. This endpoint requires one of the following roles: ${allowedRoles.join(', ')}`,
					errors: [
						`Current role '${user.role}' is not authorized to access this resource`,
					],
					requiredRoles: allowedRoles,
					currentRole: user.role,
				});
			}

			// Check if user is banned
			if (user.banStatus && user.banStatus.isBanned) {
				return res.status(403).json({
					success: false,
					message: 'Access denied. Your account has been suspended.',
					errors: ['User account is banned'],
				});
			}

			// Check if user is approved (if applicable)
			if (user.approved && user.approved.isApproved === false) {
				return res.status(403).json({
					success: false,
					message: 'Access denied. Your account is pending approval.',
					errors: ['User account not yet approved'],
				});
			}

			// User has required role and is in good standing
			next();
		} catch (error) {
			console.error('RBAC Middleware Error:', error);
			return res.status(500).json({
				success: false,
				message: 'Internal server error during authorization check',
				errors: [error.message],
			});
		}
	};
};

/**
 * Check if user is admin
 * Convenience middleware for admin-only endpoints
 */
const isAdmin = checkRole(['admin']);

/**
 * Check if user is shop owner
 * Convenience middleware for shop-only endpoints
 */
const isShop = checkRole(['shop']);

/**
 * Check if user is sales agent
 * Convenience middleware for sales agent-only endpoints
 */
const isSalesAgent = checkRole(['sales_agent']);

/**
 * Check if user is rider
 * Convenience middleware for rider-only endpoints
 */
const isRider = checkRole(['rider']);

/**
 * Check if user is admin or sales agent
 * Convenience middleware for management-level endpoints
 */
const isManagement = checkRole(['admin', 'sales_agent']);

/**
 * Check if user can place orders (shop or sales agent)
 */
const canPlaceOrders = checkRole(['shop', 'sales_agent']);

/**
 * Check if user can manage deliveries (admin or rider)
 */
const canManageDeliveries = checkRole(['admin', 'rider']);

module.exports = {
	checkRole,
	isAdmin,
	isShop,
	isSalesAgent,
	isRider,
	isManagement,
	canPlaceOrders,
	canManageDeliveries,
};
