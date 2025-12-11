// src/store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/lib/api/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  lastActivity: number | null;
  loginAttempts: number;
  lastLoginAttempt: number | null;

  // Actions
  setUser: (user: User | null) => void;
  logout: () => void;
  updateLastActivity: () => void;
  incrementLoginAttempts: () => void;
  resetLoginAttempts: () => void;
  checkSession: () => boolean;
}

// Session timeout: 30 minutes of inactivity
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_ATTEMPT_WINDOW = 15 * 60 * 1000; // 15 minutes

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      lastActivity: null,
      loginAttempts: 0,
      lastLoginAttempt: null,

      setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user,
          lastActivity: user ? Date.now() : null,
        });
      },

      logout: async () => {
        try {
          // Call logout API to clear cookies
          await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include',
          });
        } catch (error) {
          console.error('Logout error:', error);
        }

        // Clear state
        set({
          user: null,
          isAuthenticated: false,
          lastActivity: null,
          loginAttempts: 0,
          lastLoginAttempt: null,
        });

        // Redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
      },

      updateLastActivity: () => {
        const state = get();
        if (state.isAuthenticated) {
          set({ lastActivity: Date.now() });
        }
      },

      incrementLoginAttempts: () => {
        const state = get();
        const now = Date.now();

        // Reset attempts if outside the window
        if (
          state.lastLoginAttempt &&
          now - state.lastLoginAttempt > LOGIN_ATTEMPT_WINDOW
        ) {
          set({
            loginAttempts: 1,
            lastLoginAttempt: now,
          });
        } else {
          set({
            loginAttempts: state.loginAttempts + 1,
            lastLoginAttempt: now,
          });
        }
      },

      resetLoginAttempts: () => {
        set({
          loginAttempts: 0,
          lastLoginAttempt: null,
        });
      },

      checkSession: () => {
        const state = get();

        if (!state.isAuthenticated || !state.lastActivity) {
          return false;
        }

        const now = Date.now();
        const timeSinceLastActivity = now - state.lastActivity;

        // Check if session has expired
        if (timeSinceLastActivity > SESSION_TIMEOUT) {
          // Session expired, logout
          get().logout();
          return false;
        }

        return true;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        lastActivity: state.lastActivity,
        loginAttempts: state.loginAttempts,
        lastLoginAttempt: state.lastLoginAttempt,
      }),
    }
  )
);

// Export constants for use in components
export { SESSION_TIMEOUT, MAX_LOGIN_ATTEMPTS, LOGIN_ATTEMPT_WINDOW };
