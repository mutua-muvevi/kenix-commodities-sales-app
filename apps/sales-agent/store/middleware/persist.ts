/**
 * SecureStore Persistence Adapter for Zustand
 * Provides encrypted storage for sensitive data
 */

import * as SecureStore from 'expo-secure-store';
import { StateStorage } from 'zustand/middleware';

/**
 * SecureStore adapter for Zustand persist middleware
 * Uses expo-secure-store for encrypted storage
 */
export const secureStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      const value = await SecureStore.getItemAsync(name);
      return value;
    } catch (error) {
      console.error('Error getting item from secure storage:', error);
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(name, value);
    } catch (error) {
      console.error('Error setting item in secure storage:', error);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(name);
    } catch (error) {
      console.error('Error removing item from secure storage:', error);
    }
  },
};

/**
 * MMKV Storage adapter for non-sensitive data
 * Note: Import MMKV when available
 */
// import { MMKV } from 'react-native-mmkv';
// const storage = new MMKV();

// export const mmkvStorage: StateStorage = {
//   getItem: (name: string): string | null => {
//     const value = storage.getString(name);
//     return value ?? null;
//   },
//   setItem: (name: string, value: string): void => {
//     storage.set(name, value);
//   },
//   removeItem: (name: string): void => {
//     storage.delete(name);
//   },
// };

/**
 * AsyncStorage adapter for backward compatibility
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

export const asyncStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      const value = await AsyncStorage.getItem(name);
      return value;
    } catch (error) {
      console.error('Error getting item from async storage:', error);
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(name, value);
    } catch (error) {
      console.error('Error setting item in async storage:', error);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(name);
    } catch (error) {
      console.error('Error removing item from async storage:', error);
    }
  },
};

/**
 * Storage selector - use secure storage for sensitive data, async storage for others
 */
export const getStorageAdapter = (isSensitive: boolean = false): StateStorage => {
  return isSensitive ? secureStorage : asyncStorage;
};
