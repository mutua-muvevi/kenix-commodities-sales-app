// src/auth/hooks/index.ts - Auth hooks bridging old code with new auth store
'use client';

import { useAuthStore } from '@/store/authStore';
import { useCallback, useMemo, useState } from 'react';
import { login as loginApi } from '@/lib/api/auth';

/**
 * Hook to access auth context - bridges old useAuthContext pattern with new Zustand store
 */
export function useAuthContext() {
  const {
    user,
    isAuthenticated,
    lastActivity,
    loginAttempts,
    setUser,
    logout,
    updateLastActivity,
    incrementLoginAttempts,
    resetLoginAttempts,
    checkSession,
  } = useAuthStore();

  const [loading, setLoading] = useState(false);

  const authenticated = useMemo(() => isAuthenticated && !!user, [isAuthenticated, user]);

  const loginHandler = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      try {
        const response = await loginApi({ email, password });
        if (response.data?.user) {
          setUser(response.data.user);
          resetLoginAttempts();
        }
        return response;
      } catch (error) {
        incrementLoginAttempts();
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setUser, incrementLoginAttempts, resetLoginAttempts]
  );

  const logoutHandler = useCallback(async () => {
    logout();
  }, [logout]);

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setUser(data.user);
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  }, [setUser]);

  return {
    // User data
    user,
    token: null, // Tokens are now in HTTP-only cookies

    // Status flags
    authenticated,
    loading,
    isAuthenticated,
    isLoading: loading,
    lastActivity,
    loginAttempts,

    // Methods
    login: loginHandler,
    logout: logoutHandler,
    checkAuthenticated: checkAuth,
    checkAuth,
    updateUser: setUser,
    setUser,
    updateLastActivity,
    checkSession,
    incrementLoginAttempts,
    resetLoginAttempts,

    // Deprecated methods for compatibility
    initialize: checkAuth,
  };
}

/**
 * Alias for backward compatibility
 */
export const useAuth = useAuthContext;

export default useAuthContext;
