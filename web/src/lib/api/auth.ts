// src/lib/api/auth.ts
import apiClient, { setAuthToken } from './client';

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
  role: 'shop' | 'rider' | 'sales_agent';
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
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

/**
 * Login user
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/user/login', credentials);

  // Store token and user data
  if (response.data.success && response.data.data.token) {
    setAuthToken(response.data.data.token);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
  }

  return response.data;
};

/**
 * Register new user
 */
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/user/register', data);
  return response.data;
};

/**
 * Logout user
 */
export const logout = () => {
  setAuthToken(null);
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
    window.location.href = '/auth/login';
  }
};

/**
 * Get current user from localStorage
 */
export const getCurrentUser = (): User | null => {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
      }
    }
  }
  return null;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    return !!(token && user);
  }
  return false;
};
