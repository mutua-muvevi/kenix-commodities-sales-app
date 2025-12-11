// src/lib/api/auth.ts
import apiClient from './client';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  role?: 'admin' | 'shop' | 'rider' | 'sales_agent';
  address?: string;
  location?: {
    lat: number;
    lng: number;
  };
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  approvalStatus?: 'pending' | 'approved' | 'banned';
  isBanned: boolean;
  isEmailVerified?: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
  };
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface VerifyEmailData {
  email: string;
  otp: string;
}

export interface ResendOTPData {
  email: string;
}

/**
 * Login user - now uses cookie-based auth
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(credentials),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Login failed');
  }

  return data;
};

/**
 * Register new user
 */
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/user/register', data);
  return response.data;
};

/**
 * Logout user - clears cookies via API route
 */
export const logout = async () => {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
  } catch (error) {
    console.error('Logout error:', error);
  }

  if (typeof window !== 'undefined') {
    window.location.href = '/auth/login';
  }
};

/**
 * Get current user
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};

/**
 * Refresh authentication token
 */
export const refreshToken = async (): Promise<boolean> => {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });

    return response.ok;
  } catch (error) {
    console.error('Token refresh error:', error);
    return false;
  }
};

/**
 * Request password reset email
 */
export const forgotPassword = async (data: ForgotPasswordData): Promise<AuthResponse> => {
  const response = await apiClient.patch<AuthResponse>('/user/reset/password', {
    email: data.email,
  });
  return response.data;
};

/**
 * Reset password with token
 */
export const resetPassword = async (data: ResetPasswordData): Promise<AuthResponse> => {
  const response = await apiClient.patch<AuthResponse>('/user/new/password', {
    resetToken: data.token,
    newPassword: data.password,
  });
  return response.data;
};

/**
 * Verify email with OTP
 */
export const verifyEmail = async (data: VerifyEmailData): Promise<AuthResponse> => {
  const response = await apiClient.patch<AuthResponse>('/user/verify/email', {
    email: data.email,
    otp: data.otp,
  });
  return response.data;
};

/**
 * Resend OTP for email verification
 */
export const resendOTP = async (data: ResendOTPData): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/user/resend/otp', {
    email: data.email,
  });
  return response.data;
};

/**
 * Check if user is authenticated (client-side check only)
 */
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  // Check if auth cookies exist
  const cookies = document.cookie.split(';');
  const hasAuthToken = cookies.some((cookie) => cookie.trim().startsWith('auth_token='));

  return hasAuthToken;
};

/**
 * Check password strength
 */
export const checkPasswordStrength = (password: string): {
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('Password should be at least 8 characters');
  }

  if (password.length >= 12) {
    score += 1;
  }

  // Complexity checks
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add lowercase letters');
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add uppercase letters');
  }

  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add numbers');
  }

  if (/[^a-zA-Z0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add special characters');
  }

  return { score, feedback };
};
