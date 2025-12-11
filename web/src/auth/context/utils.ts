// src/auth/context/utils.ts - Auth utility functions for token management
'use client';

import { jwtDecode } from 'jwt-decode';
import axiosInstance from '@/lib/api/client';

// Types
interface JwtPayload {
  sub: string;
  exp: number;
  iat: number;
  role?: string;
}

// Storage keys
const TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';

/**
 * Check if a JWT token is valid (not expired)
 */
export function isValidToken(token: string | null): boolean {
  if (!token) return false;

  try {
    // Remove "Bearer " prefix if present
    const actualToken = token.startsWith('Bearer ') ? token.slice(7) : token;

    // Check token format
    const parts = actualToken.split('.');
    if (parts.length !== 3) return false;

    // Decode and check expiration
    const decoded = jwtDecode<JwtPayload>(actualToken);
    const currentTime = Math.floor(Date.now() / 1000);

    // Add 60 second buffer for token expiration
    return decoded.exp > currentTime + 60;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
}

/**
 * Decode JWT token to get payload
 */
export function decodeToken(token: string): JwtPayload | null {
  try {
    const actualToken = token.startsWith('Bearer ') ? token.slice(7) : token;
    return jwtDecode<JwtPayload>(actualToken);
  } catch {
    return null;
  }
}

/**
 * Get stored access token
 */
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;

  // Try multiple storage locations for compatibility
  return (
    sessionStorage.getItem(TOKEN_KEY) ||
    sessionStorage.getItem('token') ||
    localStorage.getItem(TOKEN_KEY) ||
    null
  );
}

/**
 * Get stored refresh token
 */
export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;

  return (
    sessionStorage.getItem(REFRESH_TOKEN_KEY) ||
    localStorage.getItem(REFRESH_TOKEN_KEY) ||
    null
  );
}

/**
 * Store tokens in session storage
 */
export function setTokens(accessToken: string, refreshToken?: string): void {
  if (typeof window === 'undefined') return;

  // Store access token
  const tokenValue = accessToken.startsWith('Bearer ') ? accessToken : `Bearer ${accessToken}`;
  sessionStorage.setItem(TOKEN_KEY, tokenValue);
  sessionStorage.setItem('token', tokenValue); // Legacy support

  // Store refresh token if provided
  if (refreshToken) {
    const refreshValue = refreshToken.startsWith('Bearer ') ? refreshToken : `Bearer ${refreshToken}`;
    sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshValue);
  }
}

/**
 * Clear all stored tokens and user data
 */
export function clearTokens(): void {
  if (typeof window === 'undefined') return;

  // Clear session storage
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('expires');
  sessionStorage.removeItem('refreshTokenExpires');

  // Clear local storage
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/**
 * Store user data
 */
export function setUser(user: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * Get stored user data
 */
export function getUser(): Record<string, unknown> | null {
  if (typeof window === 'undefined') return null;

  try {
    const userStr = sessionStorage.getItem(USER_KEY) || localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
}

/**
 * Refresh tokens using the refresh token
 */
export async function getRefreshAndAccessToken(refreshToken: string): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  try {
    // Try cookie-based refresh first (new system)
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        // Store new tokens
        setTokens(data.accessToken, data.refreshToken);
        return {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken || refreshToken,
        };
      }
    }

    // Fallback to direct API refresh (legacy system)
    const cleanToken = refreshToken.startsWith('Bearer ')
      ? refreshToken.slice(7)
      : refreshToken;

    const apiResponse = await axiosInstance.post('/user/refresh', {
      refreshToken: cleanToken,
    });

    if (apiResponse.data?.accessToken) {
      const newAccessToken = apiResponse.data.accessToken.token || apiResponse.data.accessToken;
      const newRefreshToken = apiResponse.data.refreshToken?.token || apiResponse.data.refreshToken || refreshToken;

      setTokens(newAccessToken, newRefreshToken);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    }

    throw new Error('Failed to refresh token');
  } catch (error) {
    console.error('Token refresh error:', error);
    clearTokens();
    throw error;
  }
}

/**
 * Initialize auth state from storage
 */
export async function initializeAuth(): Promise<{
  isAuthenticated: boolean;
  user: Record<string, unknown> | null;
  token: string | null;
}> {
  const token = getAccessToken();
  const user = getUser();

  if (!token || !isValidToken(token)) {
    // Try to refresh if we have a refresh token
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        const result = await getRefreshAndAccessToken(refreshToken);
        return {
          isAuthenticated: true,
          user,
          token: result.accessToken,
        };
      } catch {
        clearTokens();
        return { isAuthenticated: false, user: null, token: null };
      }
    }

    clearTokens();
    return { isAuthenticated: false, user: null, token: null };
  }

  return {
    isAuthenticated: true,
    user,
    token,
  };
}

/**
 * Check if current session is valid
 */
export function isSessionValid(): boolean {
  const token = getAccessToken();
  return isValidToken(token);
}

// Re-export for compatibility
export {
  TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  USER_KEY,
};
