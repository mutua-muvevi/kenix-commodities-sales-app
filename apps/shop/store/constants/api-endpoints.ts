// store/constants/api-endpoints.ts - Complete API endpoints for Kenix Shop
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.100:3001";
const WS_URL = process.env.EXPO_PUBLIC_WS_URL || "http://192.168.1.100:3001";

export const API_BASE_URL = BASE_URL;
export const WEBSOCKET_URL = WS_URL;

export const API_ENDPOINTS = {
	// User endpoints
	REGISTER: `${BASE_URL}/api/user/register`,
	LOGIN: `${BASE_URL}/api/user/login`,
	RESET_PASSWORD: `${BASE_URL}/api/user/reset/password`,
	NEW_PASSWORD: (resetToken: string) => `${BASE_URL}/api/user/new/password/${resetToken}`,
	VERIFY_EMAIL: `${BASE_URL}/api/user/verify/email`,

	EDIT_USER: (userId: string) => `${BASE_URL}/api/user/edit/${userId}`,
	BAN_USER: `${BASE_URL}/api/user/ban/user`,
	DELETE_USER: `${BASE_URL}/api/user/delete/user`,
	DELETE_MANY_USERS: `${BASE_URL}/api/user/delete/many`,

	FETCH_ME: `${BASE_URL}/api/user/fetch/me`,
	FETCH_ALL_USERS: `${BASE_URL}/api/user/fetch/all`,
	FETCH_USERS_TYPING: `${BASE_URL}/api/user/fetch/typing`,
	UPDATE_PUSH_TOKEN: `${BASE_URL}/api/user/push-token`,

	// Product endpoints
	PRODUCTS: `${BASE_URL}/api/products`,
	PRODUCT_BY_ID: (id: string) => `${BASE_URL}/api/products/${id}`,
	SEARCH_PRODUCTS: `${BASE_URL}/api/products/search`,

	// Category endpoints
	CATEGORIES: `${BASE_URL}/api/categories`,
	CATEGORY_BY_ID: (id: string) => `${BASE_URL}/api/categories/${id}`,

	// Order endpoints
	ORDERS: `${BASE_URL}/api/orders`,
	ORDER_BY_ID: (id: string) => `${BASE_URL}/api/orders/${id}`,
	MY_ORDERS: `${BASE_URL}/api/orders/my`,
	UPDATE_ORDER_STATUS: (id: string) => `${BASE_URL}/api/orders/${id}/status`,

	// Payment endpoints
	MPESA_INITIATE: `${BASE_URL}/api/payments/mpesa/initiate`,
	MPESA_STATUS: (txId: string) => `${BASE_URL}/api/payments/mpesa/${txId}/status`,
	PAYMENT_CALLBACK: `${BASE_URL}/api/payments/mpesa/callback`,

	// Loans endpoints (when available)
	LOANS: `${BASE_URL}/api/loans`,
	LOAN_BY_ID: (id: string) => `${BASE_URL}/api/loans/${id}`,
	LOAN_APPLY: `${BASE_URL}/api/loans/apply`,
	LOAN_PAYMENTS: (id: string) => `${BASE_URL}/api/loans/${id}/payments`,
	MAKE_LOAN_PAYMENT: `${BASE_URL}/api/loans/pay`,

	// Airtime endpoints (when available)
	AIRTIME_BUY: `${BASE_URL}/api/airtime/buy`,
	AIRTIME_SELL: `${BASE_URL}/api/airtime/sell`,
	AIRTIME_TRANSACTIONS: `${BASE_URL}/api/airtime/transactions`,

	// Route tracking endpoints
	ROUTE_BY_ID: (id: string) => `${BASE_URL}/api/routes/${id}`,
	RIDER_LOCATION: (routeId: string) => `${BASE_URL}/api/routes/${routeId}/location`,
};

export const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
export const PAGE_SIZE = 20;
