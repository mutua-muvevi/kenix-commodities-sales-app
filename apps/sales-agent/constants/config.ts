/**
 * Configuration Constants for Sales Agent App
 * Environment-specific and app-wide configuration settings
 */

export const CONFIG = {
  // API Configuration
  API_BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://192.168.100.6:3001',
  WS_URL: process.env.EXPO_PUBLIC_WS_URL || 'http://192.168.100.6:3001',
  API_TIMEOUT: 30000, // 30 seconds
  API_RETRY_ATTEMPTS: 3,
  API_RETRY_DELAY: 1000, // 1 second

  // App Configuration
  APP_NAME: 'Sales Agent App',
  APP_VERSION: '1.0.0',
  APP_BUILD: '1',

  // Business Rules
  DEFAULT_TARGET_SHOPS: 20,
  COMMISSION_RATE: 0.05, // 5% commission on sales
  MIN_ORDER_AMOUNT: 500, // Minimum order amount in KES
  MAX_ORDER_ITEMS: 50, // Maximum items per order

  // Map Configuration
  MAP_DEFAULT_REGION: {
    latitude: -1.2921, // Nairobi coordinates
    longitude: 36.8219,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  MAP_ZOOM_LEVEL: 15,
  GEOFENCE_RADIUS: 100, // meters
  LOCATION_UPDATE_INTERVAL: 300000, // 5 minutes

  // Validation Regex
  PHONE_REGEX: /^\+254\d{9}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  NAME_REGEX: /^[a-zA-Z\s'-]{2,50}$/,

  // Image/File Upload
  IMAGE_QUALITY: 0.7,
  IMAGE_MAX_WIDTH: 1200,
  IMAGE_MAX_HEIGHT: 1200,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png'] as string[],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'] as string[],

  // Offline/Sync Configuration
  MAX_OFFLINE_QUEUE_SIZE: 100,
  SYNC_INTERVAL: 60000, // 1 minute
  MAX_RECONNECT_ATTEMPTS: 5,
  RECONNECT_DELAY: 5000, // 5 seconds

  // Cache Configuration
  CACHE_DURATION: 3600000, // 1 hour
  CACHE_MAX_SIZE: 50 * 1024 * 1024, // 50MB

  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,

  // Toast/Notification Duration
  TOAST_DURATION: 3000, // 3 seconds
  ERROR_TOAST_DURATION: 5000, // 5 seconds
  SUCCESS_TOAST_DURATION: 2000, // 2 seconds

  // Performance
  DEBOUNCE_DELAY: 300, // milliseconds
  THROTTLE_DELAY: 1000, // milliseconds
  ANIMATION_DURATION: 300, // milliseconds

  // Security
  TOKEN_REFRESH_INTERVAL: 900000, // 15 minutes
  SESSION_TIMEOUT: 3600000, // 1 hour
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 900000, // 15 minutes

  // Features Flags (for gradual rollout)
  FEATURES: {
    AI_ORDER_SUGGESTIONS: true,
    BARCODE_SCANNING: true,
    OFFLINE_MODE: true,
    VOICE_NOTES: false,
    CUSTOMER_INSIGHTS: true,
    ROUTE_OPTIMIZATION: true,
    REAL_TIME_TRACKING: true,
    MULTI_LANGUAGE: false,
  },

  // Distance/Duration thresholds
  NEARBY_SHOP_RADIUS: 5000, // 5km
  AUTO_CHECKIN_RADIUS: 50, // 50 meters
  MAX_ROUTE_DISTANCE: 100, // 100km

  // Date/Time formats
  DATE_FORMAT: 'DD/MM/YYYY',
  TIME_FORMAT: 'HH:mm',
  DATETIME_FORMAT: 'DD/MM/YYYY HH:mm',

  // Currency
  CURRENCY: 'KES',
  CURRENCY_SYMBOL: 'KES',
  CURRENCY_LOCALE: 'en-KE',
} as const;

// Environment-specific configurations
export const ENV_CONFIG = {
  development: {
    API_BASE_URL: 'http://192.168.100.6:3001',
    DEBUG_MODE: true,
    LOG_LEVEL: 'debug',
  },
  staging: {
    API_BASE_URL: 'https://staging-api.example.com',
    DEBUG_MODE: true,
    LOG_LEVEL: 'info',
  },
  production: {
    API_BASE_URL: 'https://api.example.com',
    DEBUG_MODE: false,
    LOG_LEVEL: 'error',
  },
};

// Get current environment config
export const getCurrentConfig = () => {
  const env = (process.env.EXPO_PUBLIC_ENV || 'development') as keyof typeof ENV_CONFIG;
  return {
    ...CONFIG,
    ...ENV_CONFIG[env],
  };
};

export default CONFIG;
