/**
 * Storage Utility
 * Secure storage wrapper for tokens and sensitive data
 * Uses expo-secure-store for secure storage
 */

import * as SecureStore from 'expo-secure-store';

/**
 * Secure storage wrapper for sensitive data (tokens, credentials)
 */
export const secureStorage = {
  /**
   * Get value from secure storage
   * @param key - Storage key
   * @returns Value or null if not found
   */
  get: async (key: string): Promise<string | null> => {
    try {
      const value = await SecureStore.getItemAsync(key);
      return value;
    } catch (error) {
      console.error(`Error getting ${key} from secure storage:`, error);
      return null;
    }
  },

  /**
   * Set value in secure storage
   * @param key - Storage key
   * @param value - Value to store
   * @returns true if successful
   */
  set: async (key: string, value: string): Promise<boolean> => {
    try {
      await SecureStore.setItemAsync(key, value);
      return true;
    } catch (error) {
      console.error(`Error setting ${key} in secure storage:`, error);
      return false;
    }
  },

  /**
   * Remove value from secure storage
   * @param key - Storage key
   * @returns true if successful
   */
  remove: async (key: string): Promise<boolean> => {
    try {
      await SecureStore.deleteItemAsync(key);
      return true;
    } catch (error) {
      console.error(`Error removing ${key} from secure storage:`, error);
      return false;
    }
  },

  /**
   * Check if key exists in secure storage
   * @param key - Storage key
   * @returns true if key exists
   */
  has: async (key: string): Promise<boolean> => {
    try {
      const value = await SecureStore.getItemAsync(key);
      return value !== null;
    } catch (error) {
      console.error(`Error checking ${key} in secure storage:`, error);
      return false;
    }
  },

  /**
   * Clear all secure storage (use with caution)
   * Note: SecureStore doesn't have a clear all method, so this removes known keys
   */
  clear: async (): Promise<boolean> => {
    try {
      const keys = Object.values(STORAGE_KEYS);
      await Promise.all(keys.map((key) => SecureStore.deleteItemAsync(key)));
      return true;
    } catch (error) {
      console.error('Error clearing secure storage:', error);
      return false;
    }
  },

  /**
   * Store JSON object securely
   * @param key - Storage key
   * @param value - Object to store
   * @returns true if successful
   */
  setJSON: async (key: string, value: any): Promise<boolean> => {
    try {
      const jsonString = JSON.stringify(value);
      await SecureStore.setItemAsync(key, jsonString);
      return true;
    } catch (error) {
      console.error(`Error setting JSON ${key} in secure storage:`, error);
      return false;
    }
  },

  /**
   * Get JSON object from secure storage
   * @param key - Storage key
   * @returns Parsed object or null if not found
   */
  getJSON: async <T = any>(key: string): Promise<T | null> => {
    try {
      const value = await SecureStore.getItemAsync(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`Error getting JSON ${key} from secure storage:`, error);
      return null;
    }
  },
};

/**
 * Storage keys constants
 */
export const STORAGE_KEYS = {
  // Authentication
  AUTH_TOKEN: 'authToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_DATA: 'userData',
  USER_ID: 'userId',

  // App settings
  THEME_MODE: 'themeMode',
  LANGUAGE: 'language',
  NOTIFICATIONS_ENABLED: 'notificationsEnabled',

  // Offline/Sync
  OFFLINE_QUEUE: 'offlineQueue',
  LAST_SYNC_TIME: 'lastSyncTime',
  PENDING_UPLOADS: 'pendingUploads',

  // Location
  LAST_LOCATION: 'lastLocation',
  LOCATION_PERMISSION: 'locationPermission',

  // Cache
  SHOPS_CACHE: 'shopsCache',
  PRODUCTS_CACHE: 'productsCache',
  ROUTES_CACHE: 'routesCache',
  ORDERS_CACHE: 'ordersCache',

  // Onboarding/First time
  FIRST_LAUNCH: 'firstLaunch',
  ONBOARDING_COMPLETED: 'onboardingCompleted',

  // Session
  SESSION_ID: 'sessionId',
  LAST_ACTIVE: 'lastActive',
} as const;

/**
 * Helper functions for common storage operations
 */

/**
 * Store auth token securely
 * @param token - Auth token
 * @returns true if successful
 */
export const storeAuthToken = async (token: string): Promise<boolean> => {
  return await secureStorage.set(STORAGE_KEYS.AUTH_TOKEN, token);
};

/**
 * Get auth token from secure storage
 * @returns Auth token or null
 */
export const getAuthToken = async (): Promise<string | null> => {
  return await secureStorage.get(STORAGE_KEYS.AUTH_TOKEN);
};

/**
 * Remove auth token from secure storage
 * @returns true if successful
 */
export const removeAuthToken = async (): Promise<boolean> => {
  return await secureStorage.remove(STORAGE_KEYS.AUTH_TOKEN);
};

/**
 * Store user data securely
 * @param userData - User data object
 * @returns true if successful
 */
export const storeUserData = async (userData: any): Promise<boolean> => {
  return await secureStorage.setJSON(STORAGE_KEYS.USER_DATA, userData);
};

/**
 * Get user data from secure storage
 * @returns User data object or null
 */
export const getUserData = async <T = any>(): Promise<T | null> => {
  return await secureStorage.getJSON<T>(STORAGE_KEYS.USER_DATA);
};

/**
 * Remove user data from secure storage
 * @returns true if successful
 */
export const removeUserData = async (): Promise<boolean> => {
  return await secureStorage.remove(STORAGE_KEYS.USER_DATA);
};

/**
 * Clear all authentication data (logout)
 * @returns true if successful
 */
export const clearAuthData = async (): Promise<boolean> => {
  try {
    await Promise.all([
      secureStorage.remove(STORAGE_KEYS.AUTH_TOKEN),
      secureStorage.remove(STORAGE_KEYS.REFRESH_TOKEN),
      secureStorage.remove(STORAGE_KEYS.USER_DATA),
      secureStorage.remove(STORAGE_KEYS.USER_ID),
      secureStorage.remove(STORAGE_KEYS.SESSION_ID),
    ]);
    return true;
  } catch (error) {
    console.error('Error clearing auth data:', error);
    return false;
  }
};

/**
 * Check if user is authenticated
 * @returns true if auth token exists
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const token = await getAuthToken();
  return token !== null;
};

/**
 * Store offline queue data
 * @param queue - Queue data
 * @returns true if successful
 */
export const storeOfflineQueue = async (queue: any[]): Promise<boolean> => {
  return await secureStorage.setJSON(STORAGE_KEYS.OFFLINE_QUEUE, queue);
};

/**
 * Get offline queue data
 * @returns Queue data or empty array
 */
export const getOfflineQueue = async (): Promise<any[]> => {
  const queue = await secureStorage.getJSON<any[]>(STORAGE_KEYS.OFFLINE_QUEUE);
  return queue || [];
};

/**
 * Clear offline queue
 * @returns true if successful
 */
export const clearOfflineQueue = async (): Promise<boolean> => {
  return await secureStorage.remove(STORAGE_KEYS.OFFLINE_QUEUE);
};

/**
 * Store theme mode preference
 * @param mode - Theme mode ('light' | 'dark' | 'auto')
 * @returns true if successful
 */
export const storeThemeMode = async (mode: string): Promise<boolean> => {
  return await secureStorage.set(STORAGE_KEYS.THEME_MODE, mode);
};

/**
 * Get theme mode preference
 * @returns Theme mode or 'auto' as default
 */
export const getThemeMode = async (): Promise<string> => {
  const mode = await secureStorage.get(STORAGE_KEYS.THEME_MODE);
  return mode || 'auto';
};

/**
 * Store last sync timestamp
 * @param timestamp - ISO timestamp string
 * @returns true if successful
 */
export const storeLastSyncTime = async (timestamp: string): Promise<boolean> => {
  return await secureStorage.set(STORAGE_KEYS.LAST_SYNC_TIME, timestamp);
};

/**
 * Get last sync timestamp
 * @returns ISO timestamp string or null
 */
export const getLastSyncTime = async (): Promise<string | null> => {
  return await secureStorage.get(STORAGE_KEYS.LAST_SYNC_TIME);
};

export default {
  secureStorage,
  STORAGE_KEYS,
  storeAuthToken,
  getAuthToken,
  removeAuthToken,
  storeUserData,
  getUserData,
  removeUserData,
  clearAuthData,
  isAuthenticated,
  storeOfflineQueue,
  getOfflineQueue,
  clearOfflineQueue,
  storeThemeMode,
  getThemeMode,
  storeLastSyncTime,
  getLastSyncTime,
};
