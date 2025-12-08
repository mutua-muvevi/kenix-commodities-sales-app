/**
 * Auth Store Slice
 * Manages authentication state, user session, and auth operations
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SalesAgent } from '../../../types/user';
import { secureStorage } from '../../middleware/persist';
import { actionLogger, errorLogger } from '../../middleware/logger';
import apiService from '../../../services/api';

interface AuthState {
  // State
  user: SalesAgent | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: SalesAgent | null) => void;
  setToken: (token: string | null) => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  updateProfile: (updates: Partial<SalesAgent>) => Promise<void>;
  refreshToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial State
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,

      // Login Action
      login: async (email: string, password: string) => {
        actionLogger('AuthStore', 'login', { email });
        try {
          set({ isLoading: true, error: null });

          const response = await apiService.login(email, password);

          // Validate role
          if (response.user.role !== 'sales_agent') {
            throw new Error('Access denied. Sales Agent account required.');
          }

          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          actionLogger('AuthStore', 'login', 'Success');
        } catch (error: any) {
          errorLogger('AuthStore', 'login', error);
          set({
            isLoading: false,
            error: error.response?.data?.message || error.message || 'Login failed',
            isAuthenticated: false,
          });
          throw error;
        }
      },

      // Register Action
      register: async (data: any) => {
        actionLogger('AuthStore', 'register', { email: data.email });
        try {
          set({ isLoading: true, error: null });

          const response = await apiService.register({
            ...data,
            role: 'sales_agent',
          });

          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          actionLogger('AuthStore', 'register', 'Success');
        } catch (error: any) {
          errorLogger('AuthStore', 'register', error);
          set({
            isLoading: false,
            error: error.response?.data?.message || error.message || 'Registration failed',
            isAuthenticated: false,
          });
          throw error;
        }
      },

      // Logout Action
      logout: async () => {
        actionLogger('AuthStore', 'logout');
        try {
          await apiService.logout();
        } catch (error) {
          errorLogger('AuthStore', 'logout', error);
        } finally {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            error: null,
          });
          actionLogger('AuthStore', 'logout', 'Success');
        }
      },

      // Set User
      setUser: (user: SalesAgent | null) => {
        actionLogger('AuthStore', 'setUser', user?._id);
        set({ user, isAuthenticated: !!user });
      },

      // Set Token
      setToken: (token: string | null) => {
        actionLogger('AuthStore', 'setToken', !!token);
        set({ token, isAuthenticated: !!token && !!get().user });
      },

      // Check Auth (Load stored session)
      checkAuth: async () => {
        actionLogger('AuthStore', 'checkAuth');
        try {
          set({ isLoading: true });

          const { user, token } = get();

          if (token && user) {
            // Optionally validate token with backend
            // const response = await apiService.validateToken(token);
            set({
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            actionLogger('AuthStore', 'checkAuth', 'Valid session');
          } else {
            set({ isLoading: false, isAuthenticated: false });
            actionLogger('AuthStore', 'checkAuth', 'No session');
          }
        } catch (error) {
          errorLogger('AuthStore', 'checkAuth', error);
          set({
            isLoading: false,
            isAuthenticated: false,
            user: null,
            token: null,
          });
        }
      },

      // Clear Error
      clearError: () => {
        set({ error: null });
      },

      // Update Profile
      updateProfile: async (updates: Partial<SalesAgent>) => {
        actionLogger('AuthStore', 'updateProfile', updates);
        try {
          set({ isLoading: true, error: null });

          const { user } = get();
          if (!user) throw new Error('No user logged in');

          // Call API to update profile
          const response = await apiService.updateProfile(user._id, updates);

          set({
            user: { ...user, ...response.user },
            isLoading: false,
            error: null,
          });

          actionLogger('AuthStore', 'updateProfile', 'Success');
        } catch (error: any) {
          errorLogger('AuthStore', 'updateProfile', error);
          set({
            isLoading: false,
            error: error.response?.data?.message || error.message || 'Profile update failed',
          });
          throw error;
        }
      },

      // Refresh Token
      refreshToken: async () => {
        actionLogger('AuthStore', 'refreshToken');
        try {
          const { token } = get();
          if (!token) throw new Error('No token to refresh');

          // Call API to refresh token
          const response = await apiService.refreshToken(token);

          set({
            token: response.token,
            error: null,
          });

          actionLogger('AuthStore', 'refreshToken', 'Success');
        } catch (error: any) {
          errorLogger('AuthStore', 'refreshToken', error);
          // If refresh fails, logout user
          get().logout();
          throw error;
        }
      },
    }),
    {
      name: 'sales-agent-auth',
      storage: secureStorage,
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
