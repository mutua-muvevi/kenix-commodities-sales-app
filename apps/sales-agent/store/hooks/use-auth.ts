/**
 * Auth Store Hooks
 * Custom hooks for accessing auth state and actions
 */

import { useAuthStore } from '../slices/auth/auth-store';
import { SalesAgent } from '../../types/user';

/**
 * Get entire auth state
 */
export const useAuth = () => useAuthStore((state) => state);

/**
 * Get current user
 */
export const useUser = (): SalesAgent | null => useAuthStore((state) => state.user);

/**
 * Get auth token
 */
export const useToken = (): string | null => useAuthStore((state) => state.token);

/**
 * Check if user is authenticated
 */
export const useIsAuthenticated = (): boolean => useAuthStore((state) => state.isAuthenticated);

/**
 * Get auth loading state
 */
export const useAuthLoading = (): boolean => useAuthStore((state) => state.isLoading);

/**
 * Get auth error
 */
export const useAuthError = (): string | null => useAuthStore((state) => state.error);

/**
 * Get login action
 */
export const useLogin = () => useAuthStore((state) => state.login);

/**
 * Get register action
 */
export const useRegister = () => useAuthStore((state) => state.register);

/**
 * Get logout action
 */
export const useLogout = () => useAuthStore((state) => state.logout);

/**
 * Get checkAuth action
 */
export const useCheckAuth = () => useAuthStore((state) => state.checkAuth);

/**
 * Get user ID (convenience hook)
 */
export const useUserId = (): string | null => {
  const user = useAuthStore((state) => state.user);
  return user?._id || null;
};

/**
 * Get user role (convenience hook)
 */
export const useUserRole = (): 'sales_agent' | null => {
  const user = useAuthStore((state) => state.user);
  return user?.role || null;
};

/**
 * Get user approval status (convenience hook)
 */
export const useUserApprovalStatus = (): 'pending' | 'approved' | 'rejected' | null => {
  const user = useAuthStore((state) => state.user);
  return user?.approvalStatus || null;
};

/**
 * Check if user is approved
 */
export const useIsApproved = (): boolean => {
  const user = useAuthStore((state) => state.user);
  return user?.approvalStatus === 'approved';
};
