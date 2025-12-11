// src/lib/api/client.ts
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getCSRFToken } from '@/lib/csrf';

// API base URL from environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
  withCredentials: true, // Send cookies with requests
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });

  failedQueue = [];
};

// Request interceptor - add auth token from cookie
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // For client-side requests, try to get token from cookie via API
    if (typeof window !== 'undefined') {
      // Add CSRF token to headers for state-changing requests
      const csrfToken = getCSRFToken();
      if (csrfToken && ['post', 'put', 'patch', 'delete'].includes(config.method || '')) {
        config.headers['X-CSRF-Token'] = csrfToken;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors and token refresh
apiClient.interceptors.response.use(
  (response) => {
    // Return the data directly for successful responses
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Try to refresh the token
        await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        });

        processQueue();
        isRefreshing = false;

        // Retry original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        isRefreshing = false;

        // Redirect to login on refresh failure
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }

        return Promise.reject(refreshError);
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('Access forbidden:', error.response.data);
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network error - Please check your connection');
    }

    return Promise.reject(error);
  }
);

// Helper function to get auth token from localStorage (for WebSocket)
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;

  try {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      return parsed?.state?.token || null;
    }
  } catch {
    // Ignore parsing errors
  }
  return null;
};

// Helper function to handle API errors
export const handleApiError = (error: AxiosError | Error | unknown): string => {
  const axiosError = error as AxiosError<{ message?: string; error?: string; errors?: string[] }>;
  if (axiosError.response) {
    // Server responded with error
    const message = axiosError.response.data?.message || axiosError.response.data?.error;
    if (message) return message;

    // Handle validation errors
    if (axiosError.response.data?.errors && Array.isArray(axiosError.response.data.errors)) {
      return axiosError.response.data.errors.join(', ');
    }

    return `Error: ${axiosError.response.status} - ${axiosError.response.statusText}`;
  } else if (axiosError.request) {
    // Request was made but no response
    return 'No response from server. Please check your connection.';
  } else {
    // Something else happened
    const err = error as Error;
    return err.message || 'An unexpected error occurred';
  }
};

export default apiClient;
