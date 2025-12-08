/**
 * API Endpoints Constants for Sales Agent App
 * Centralized API endpoint definitions for all backend calls
 * Based on existing backend structure
 */

export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    LOGIN: '/api/user/login',
    LOGOUT: '/api/user/logout',
    REGISTER: '/api/user/register',
    PROFILE: '/api/user/profile',
    UPDATE_PROFILE: '/api/user/profile',
    CHANGE_PASSWORD: '/api/user/change-password',
    FORGOT_PASSWORD: '/api/user/forgot-password',
    RESET_PASSWORD: '/api/user/reset-password',
    VERIFY_OTP: '/api/user/verify-otp',
    RESEND_OTP: '/api/user/resend-otp',
  },

  // Shop management endpoints
  SHOPS: {
    LIST: '/api/user/fetch/all',
    DETAILS: '/api/user/fetch',
    REGISTER: '/api/user/register',
    UPDATE: '/api/user/update',
    NEARBY: '/api/shops/nearby',
    SEARCH: '/api/shops/search',
    KYC_UPLOAD: '/api/shops/kyc-upload',
    CHECK_DUPLICATE: '/api/shops/check-duplicate',
  },

  // Order management endpoints
  ORDERS: {
    LIST: '/api/orders',
    CREATE: '/api/orders',
    DETAILS: '/api/orders',
    UPDATE: '/api/orders',
    CANCEL: '/api/orders/cancel',
    HISTORY: '/api/orders/history',
    PENDING: '/api/orders/pending',
    STATISTICS: '/api/orders/statistics',
  },

  // Product/Inventory endpoints
  PRODUCTS: {
    LIST: '/api/products',
    DETAILS: '/api/products',
    CATEGORIES: '/api/products/categories',
    SEARCH: '/api/products/search',
    STOCK: '/api/products/stock',
    PRICES: '/api/products/prices',
  },

  // Route management endpoints
  ROUTES: {
    LIST: '/api/routes',
    DETAILS: '/api/routes',
    ASSIGNED: '/api/routes/assigned',
    START: '/api/routes/start',
    COMPLETE: '/api/routes/complete',
    VISIT: '/api/routes/visit',
    OPTIMIZE: '/api/routes/optimize',
    UPDATE_STATUS: '/api/routes/update-status',
  },

  // Reports and analytics endpoints
  REPORTS: {
    WEEKLY: '/api/reports/sales-agents',
    MONTHLY: '/api/reports/sales-agents',
    DAILY: '/api/reports/sales-agents/daily',
    PERFORMANCE: '/api/reports/sales-agents/performance',
    EARNINGS: '/api/reports/sales-agents/earnings',
    COMMISSION: '/api/reports/sales-agents/commission',
    EXPORT: '/api/reports/sales-agents/export',
  },

  // Notifications endpoints
  NOTIFICATIONS: {
    LIST: '/api/notifications',
    UNREAD: '/api/notifications/unread',
    MARK_READ: '/api/notifications/mark-read',
    MARK_ALL_READ: '/api/notifications/mark-all-read',
    DELETE: '/api/notifications',
    SETTINGS: '/api/notifications/settings',
  },

  // Location/GPS endpoints
  LOCATION: {
    UPDATE: '/api/location/update',
    TRACK: '/api/location/track',
    HISTORY: '/api/location/history',
  },

  // Sync endpoints for offline support
  SYNC: {
    PUSH: '/api/sync/push',
    PULL: '/api/sync/pull',
    STATUS: '/api/sync/status',
    CONFLICTS: '/api/sync/conflicts',
  },

  // File upload endpoints
  UPLOAD: {
    IMAGE: '/api/upload/image',
    DOCUMENT: '/api/upload/document',
    KYC: '/api/upload/kyc',
  },
} as const;

// Helper function to build endpoint with parameters
export const buildEndpoint = (endpoint: string, params?: Record<string, string | number>): string => {
  if (!params) return endpoint;

  let url = endpoint;
  Object.keys(params).forEach((key) => {
    url = url.replace(`:${key}`, String(params[key]));
  });

  return url;
};

// Helper function to build query string
export const buildQueryString = (params?: Record<string, any>): string => {
  if (!params || Object.keys(params).length === 0) return '';

  const queryParams = Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== null)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');

  return queryParams ? `?${queryParams}` : '';
};

export default API_ENDPOINTS;
