import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import apiService from '../services/api';
import locationService from '../services/location';
import websocketService from '../services/websocket';

interface User {
  _id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  role: string;
  approvalStatus?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true });
      const response = await apiService.login(email, password);

      // Validate role
      if (response.user.role !== 'sales_agent') {
        throw new Error('Access denied. Sales Agent account required.');
      }

      // Store token and user data
      await SecureStore.setItemAsync('authToken', response.token);
      await SecureStore.setItemAsync('userData', JSON.stringify(response.user));

      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
      });

      // Initialize location service with user ID
      locationService.initialize(response.user._id);

      // Auto-start location tracking if previously enabled
      const trackingEnabled = await SecureStore.getItemAsync('locationTrackingEnabled');
      if (trackingEnabled === 'true') {
        // Check permissions before starting
        const permissions = await locationService.checkPermissions();
        if (permissions.foreground) {
          await locationService.startTracking();
          console.log('Auto-started location tracking on login');
        }
      }

      // Connect to WebSocket
      websocketService.connect();
    } catch (error: any) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      // Stop location tracking
      await locationService.stopTracking();
      console.log('Location tracking stopped on logout');

      // Disconnect WebSocket
      websocketService.disconnect();

      await apiService.logout();
      set({
        user: null,
        token: null,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Clear state anyway
      set({
        user: null,
        token: null,
        isAuthenticated: false,
      });
    }
  },

  loadStoredAuth: async () => {
    try {
      set({ isLoading: true });
      const token = await SecureStore.getItemAsync('authToken');
      const userData = await SecureStore.getItemAsync('userData');

      if (token && userData) {
        const user = JSON.parse(userData);
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });

        // Initialize location service with user ID
        locationService.initialize(user._id);

        // Auto-start location tracking if previously enabled
        const trackingEnabled = await SecureStore.getItemAsync('locationTrackingEnabled');
        if (trackingEnabled === 'true') {
          // Check permissions before starting
          const permissions = await locationService.checkPermissions();
          if (permissions.foreground) {
            await locationService.startTracking();
            console.log('Auto-started location tracking on app launch');
          }
        }

        // Connect to WebSocket
        websocketService.connect();
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
      set({ isLoading: false });
    }
  },
}));
