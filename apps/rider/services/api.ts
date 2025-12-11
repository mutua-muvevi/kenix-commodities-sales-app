import axios, { AxiosError } from 'axios';
import axiosRetry from 'axios-retry';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';
import type {
  LoginResponse,
  Route,
  Delivery,
  Wallet,
  Stats,
  PaymentConfirmation,
  SkipRequest,
} from '../types';

// Get API URL from environment or use default
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.100:3001/api';

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Configure retry logic with exponential backoff
axiosRetry(api, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    // Retry on network errors or 5xx server errors
    return (
      axiosRetry.isNetworkOrIdempotentRequestError(error) ||
      (error.response?.status ?? 0) >= 500
    );
  },
  onRetry: (retryCount, error, requestConfig) => {
    console.log(`[API] Retry attempt ${retryCount} for ${requestConfig.url}`);
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token from SecureStore:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('user');
      // Navigation to login will be handled by auth state
    }

    // Show user-friendly error messages
    const errorMessage = getErrorMessage(error);
    console.error('API Error:', errorMessage);

    return Promise.reject(error);
  }
);

// Helper function to extract error messages
function getErrorMessage(error: AxiosError): string {
  if (error.response?.data) {
    const data = error.response.data as any;
    return data.message || data.error || 'An error occurred';
  }
  if (error.request) {
    return 'Network error. Please check your connection.';
  }
  return error.message || 'An unexpected error occurred';
}

// API Service Methods
export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/user/login', {
      email,
      password,
    });
    return response.data;
  },

  logout: async (): Promise<void> => {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('user');
  },
};

export const routeService = {
  getActiveRoute: async (riderId: string): Promise<Route | null> => {
    try {
      const response = await api.get<{ success: boolean; route: Route }>(
        `/routes/rider/${riderId}/active`
      );
      return response.data.route;
    } catch (error) {
      if ((error as AxiosError).response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  getCurrentDelivery: async (routeId: string): Promise<Delivery | null> => {
    try {
      const response = await api.get<{ success: boolean; delivery: Delivery }>(
        `/routes/${routeId}/current-delivery`
      );
      return response.data.delivery;
    } catch (error) {
      if ((error as AxiosError).response?.status === 404) {
        return null;
      }
      throw error;
    }
  },
};

export const deliveryService = {
  markArrival: async (
    deliveryId: string,
    location: { lat: number; lng: number }
  ): Promise<Delivery> => {
    const response = await api.patch<{ success: boolean; delivery: Delivery }>(
      `/deliveries/${deliveryId}/arrive`,
      {
        location,
        timestamp: new Date().toISOString(),
      }
    );
    return response.data.delivery;
  },

  submitPayment: async (
    deliveryId: string,
    paymentData: {
      paymentMethod: 'mpesa' | 'cash' | 'airtel';
      amount: number;
      phoneNumber?: string;
    }
  ): Promise<{ success: boolean; message: string; transactionId?: string }> => {
    const response = await api.post(
      `/deliveries/${deliveryId}/payment`,
      paymentData
    );
    return response.data;
  },

  completeDelivery: async (
    deliveryId: string,
    completionData: {
      paymentMethod: 'mpesa' | 'cash' | 'airtel';
      signature: string;
      photo: string;
      notes?: string;
      location: { lat: number; lng: number };
    }
  ): Promise<Delivery> => {
    const response = await api.patch<{ success: boolean; delivery: Delivery }>(
      `/deliveries/${deliveryId}/complete`,
      {
        ...completionData,
        timestamp: new Date().toISOString(),
      }
    );
    return response.data.delivery;
  },

  requestSkip: async (
    skipRequest: Omit<SkipRequest, 'riderId' | 'timestamp'>
  ): Promise<{
    success: boolean;
    message: string;
    requestId: string;
  }> => {
    const response = await api.post<{
      success: boolean;
      message: string;
      data: { requestId: string };
    }>(`/deliveries/${skipRequest.deliveryId}/request-skip`, {
      ...skipRequest,
      timestamp: new Date().toISOString(),
    });
    return {
      success: response.data.success,
      message: response.data.message,
      requestId: response.data.data.requestId,
    };
  },

  getHistory: async (
    riderId: string,
    params: {
      page?: number;
      limit?: number;
      status?: 'completed' | 'failed';
      startDate?: string;
      endDate?: string;
    } = {}
  ): Promise<{
    deliveries: Delivery[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasMore: boolean;
    };
  }> => {
    const response = await api.get(`/deliveries/rider/${riderId}/history`, {
      params,
    });
    return response.data.data;
  },
};

export const locationService = {
  updateRiderLocation: async (
    riderId: string,
    location: { lat: number; lng: number }
  ): Promise<void> => {
    await api.post(`/maps/rider/${riderId}/location`, location);
  },
};

export const walletService = {
  getWallet: async (riderId: string): Promise<Wallet> => {
    const response = await api.get<{ success: boolean; wallet: Wallet }>(
      `/wallet/${riderId}`
    );
    return response.data.wallet;
  },

  getTransactions: async (
    riderId: string,
    limit: number = 50
  ): Promise<Wallet['transactions']> => {
    const response = await api.get<{
      success: boolean;
      transactions: Wallet['transactions'];
    }>(`/wallet/${riderId}/transactions`, {
      params: { limit },
    });
    return response.data.transactions;
  },
};

export const statsService = {
  getStats: async (riderId: string): Promise<Stats> => {
    const response = await api.get<{ success: boolean; stats: Stats }>(
      `/performance/rider/${riderId}`
    );
    return response.data.stats;
  },
};

export const paymentService = {
  initiateMpesa: async (
    orderId: string,
    phoneNumber: string,
    amount: number
  ): Promise<{
    success: boolean;
    message: string;
    checkoutRequestId?: string;
  }> => {
    const response = await api.post('/payments/mpesa/initiate', {
      orderId,
      phoneNumber,
      amount,
    });
    return response.data;
  },

  checkMpesaStatus: async (
    checkoutRequestId: string
  ): Promise<{
    success: boolean;
    status: 'pending' | 'success' | 'failed';
    transactionId?: string;
  }> => {
    const response = await api.get(
      `/payments/mpesa/status/${checkoutRequestId}`
    );
    return response.data;
  },
};

// Export error handler for components
export const handleApiError = (error: unknown, fallbackMessage: string = 'An error occurred'): string => {
  if (axios.isAxiosError(error)) {
    return getErrorMessage(error);
  }
  return fallbackMessage;
};
