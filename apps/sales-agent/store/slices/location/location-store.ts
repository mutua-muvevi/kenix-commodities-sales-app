/**
 * Location Store Slice
 * Manages location tracking state, permissions, and history
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import locationService, { LocationData } from '../../../services/location';
import { actionLogger, errorLogger } from '../../middleware/logger';
import { secureStorage } from '../../middleware/persist';

export interface LocationPermissions {
  foreground: boolean;
  background: boolean;
}

export interface LocationHistoryItem extends LocationData {
  id: string;
}

interface LocationState {
  // State
  currentLocation: LocationData | null;
  isTrackingEnabled: boolean;
  isForegroundTracking: boolean;
  isBackgroundTracking: boolean;
  permissions: LocationPermissions;
  lastUpdateTimestamp: number | null;
  locationHistory: LocationHistoryItem[];
  isLoading: boolean;
  error: string | null;

  // Actions
  requestPermissions: () => Promise<LocationPermissions>;
  checkPermissions: () => Promise<void>;
  getCurrentLocation: () => Promise<void>;
  startTracking: () => Promise<void>;
  stopTracking: () => Promise<void>;
  setTrackingEnabled: (enabled: boolean) => void;
  updateCurrentLocation: (location: LocationData) => void;
  addToHistory: (location: LocationData) => void;
  clearHistory: () => void;
  getTrackingStatus: () => Promise<void>;
  clearError: () => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set, get) => ({
      // Initial State
      currentLocation: null,
      isTrackingEnabled: false,
      isForegroundTracking: false,
      isBackgroundTracking: false,
      permissions: {
        foreground: false,
        background: false,
      },
      lastUpdateTimestamp: null,
      locationHistory: [],
      isLoading: false,
      error: null,

      // Request Permissions
      requestPermissions: async () => {
        actionLogger('LocationStore', 'requestPermissions');
        try {
          set({ isLoading: true, error: null });

          const permissions = await locationService.requestPermissions();

          set({
            permissions,
            isLoading: false,
          });

          actionLogger('LocationStore', 'requestPermissions', permissions);
          return permissions;
        } catch (error: any) {
          errorLogger('LocationStore', 'requestPermissions', error);
          set({
            isLoading: false,
            error: error.message || 'Failed to request permissions',
          });
          throw error;
        }
      },

      // Check Permissions
      checkPermissions: async () => {
        actionLogger('LocationStore', 'checkPermissions');
        try {
          const permissions = await locationService.checkPermissions();

          set({ permissions });

          actionLogger('LocationStore', 'checkPermissions', permissions);
        } catch (error: any) {
          errorLogger('LocationStore', 'checkPermissions', error);
          set({
            error: error.message || 'Failed to check permissions',
          });
        }
      },

      // Get Current Location
      getCurrentLocation: async () => {
        actionLogger('LocationStore', 'getCurrentLocation');
        try {
          set({ isLoading: true, error: null });

          const location = await locationService.getCurrentLocation();

          if (location) {
            set({
              currentLocation: location,
              lastUpdateTimestamp: location.timestamp,
              isLoading: false,
            });

            // Add to history
            get().addToHistory(location);

            actionLogger('LocationStore', 'getCurrentLocation', 'Success');
          } else {
            set({
              isLoading: false,
              error: 'Could not get current location',
            });
          }
        } catch (error: any) {
          errorLogger('LocationStore', 'getCurrentLocation', error);
          set({
            isLoading: false,
            error: error.message || 'Failed to get current location',
          });
        }
      },

      // Start Tracking
      startTracking: async () => {
        actionLogger('LocationStore', 'startTracking');
        try {
          set({ isLoading: true, error: null });

          const result = await locationService.startTracking();

          set({
            isForegroundTracking: result.foreground,
            isBackgroundTracking: result.background,
            isTrackingEnabled: result.foreground || result.background,
            isLoading: false,
          });

          if (!result.foreground && !result.background) {
            set({
              error: 'Failed to start tracking. Please check permissions.',
            });
          }

          actionLogger('LocationStore', 'startTracking', result);
        } catch (error: any) {
          errorLogger('LocationStore', 'startTracking', error);
          set({
            isLoading: false,
            error: error.message || 'Failed to start tracking',
          });
          throw error;
        }
      },

      // Stop Tracking
      stopTracking: async () => {
        actionLogger('LocationStore', 'stopTracking');
        try {
          set({ isLoading: true, error: null });

          await locationService.stopTracking();

          set({
            isForegroundTracking: false,
            isBackgroundTracking: false,
            isTrackingEnabled: false,
            isLoading: false,
          });

          actionLogger('LocationStore', 'stopTracking', 'Success');
        } catch (error: any) {
          errorLogger('LocationStore', 'stopTracking', error);
          set({
            isLoading: false,
            error: error.message || 'Failed to stop tracking',
          });
          throw error;
        }
      },

      // Set Tracking Enabled
      setTrackingEnabled: async (enabled: boolean) => {
        actionLogger('LocationStore', 'setTrackingEnabled', enabled);
        set({ isTrackingEnabled: enabled });

        // Persist tracking preference
        await SecureStore.setItemAsync('locationTrackingEnabled', enabled.toString());

        if (enabled) {
          await get().startTracking();
        } else {
          await get().stopTracking();
        }
      },

      // Update Current Location
      updateCurrentLocation: (location: LocationData) => {
        actionLogger('LocationStore', 'updateCurrentLocation', {
          lat: location.latitude,
          lng: location.longitude,
        });

        set({
          currentLocation: location,
          lastUpdateTimestamp: location.timestamp,
        });

        // Add to history
        get().addToHistory(location);
      },

      // Add to History (keep last 10)
      addToHistory: (location: LocationData) => {
        const { locationHistory } = get();

        const historyItem: LocationHistoryItem = {
          ...location,
          id: `${location.timestamp}-${location.latitude}-${location.longitude}`,
        };

        const newHistory = [historyItem, ...locationHistory].slice(0, 10);

        set({ locationHistory: newHistory });
      },

      // Clear History
      clearHistory: () => {
        actionLogger('LocationStore', 'clearHistory');
        set({ locationHistory: [] });
      },

      // Get Tracking Status
      getTrackingStatus: async () => {
        actionLogger('LocationStore', 'getTrackingStatus');
        try {
          const status = await locationService.getTrackingStatus();

          set({
            isTrackingEnabled: status.isTracking,
            isForegroundTracking: status.foreground,
            isBackgroundTracking: status.background,
            permissions: status.permissions,
          });

          actionLogger('LocationStore', 'getTrackingStatus', status);
        } catch (error: any) {
          errorLogger('LocationStore', 'getTrackingStatus', error);
          set({
            error: error.message || 'Failed to get tracking status',
          });
        }
      },

      // Clear Error
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'sales-agent-location',
      storage: secureStorage,
      partialize: (state) => ({
        isTrackingEnabled: state.isTrackingEnabled,
        permissions: state.permissions,
        locationHistory: state.locationHistory,
      }),
    }
  )
);
