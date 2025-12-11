// src/auth/index.ts - Auth module exports
'use client';

// Re-export hooks
export { useAuthContext, useAuth } from './hooks';

// Re-export utils
export {
  isValidToken,
  decodeToken,
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
  setUser,
  getUser,
  getRefreshAndAccessToken,
  initializeAuth,
  isSessionValid,
  TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  USER_KEY,
} from './context/utils';
