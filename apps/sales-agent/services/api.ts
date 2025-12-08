import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = 'http://192.168.100.6:3001/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      async (config) => {
        const token = await SecureStore.getItemAsync('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          await SecureStore.deleteItemAsync('authToken');
          await SecureStore.deleteItemAsync('userData');
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.api.post('/user/login', { email, password });
    return response.data;
  }

  async logout() {
    await SecureStore.deleteItemAsync('authToken');
    await SecureStore.deleteItemAsync('userData');
  }

  // Shop registration
  async registerShop(shopData: any) {
    const response = await this.api.post('/user/register', shopData);
    return response.data;
  }

  // Get shops created by this sales agent
  async getMyShops(agentId: string, status?: string) {
    let url = `/user/fetch/all?role=shop&createdBy=${agentId}`;
    if (status) {
      url += `&approvalStatus=${status}`;
    }
    const response = await this.api.get(url);
    return response.data;
  }

  // Get shop details
  async getShopById(shopId: string) {
    const response = await this.api.get(`/user/fetch/${shopId}`);
    return response.data;
  }

  // Get products
  async getProducts(filters?: { isInStock?: boolean; category?: string }) {
    let url = '/products';
    const params = new URLSearchParams();

    if (filters?.isInStock !== undefined) {
      params.append('isInStock', filters.isInStock.toString());
    }
    if (filters?.category) {
      params.append('category', filters.category);
    }

    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }

    const response = await this.api.get(url);
    return response.data;
  }

  // Create order
  async createOrder(orderData: any) {
    const response = await this.api.post('/orders', orderData);
    return response.data;
  }

  // Get orders created by this sales agent
  async getMyOrders(agentId: string, filters?: { status?: string; shopId?: string }) {
    let url = `/orders?createdBy=${agentId}`;

    if (filters?.status) {
      url += `&status=${filters.status}`;
    }
    if (filters?.shopId) {
      url += `&orderer=${filters.shopId}`;
    }

    const response = await this.api.get(url);
    return response.data;
  }

  // Get order details
  async getOrderById(orderId: string) {
    const response = await this.api.get(`/orders/${orderId}`);
    return response.data;
  }

  // Get performance reports
  async getWeeklyReport(agentId: string) {
    try {
      const response = await this.api.get(`/reports/sales-agents/${agentId}/weekly`);
      return response.data;
    } catch (error) {
      // If endpoint doesn't exist, return mock data
      console.log('Weekly report endpoint not available, using calculated data');
      return null;
    }
  }

  async getMonthlyReport(agentId: string) {
    try {
      const response = await this.api.get(`/reports/sales-agents/${agentId}/monthly`);
      return response.data;
    } catch (error) {
      // If endpoint doesn't exist, return mock data
      console.log('Monthly report endpoint not available, using calculated data');
      return null;
    }
  }

  // Generic get request
  async get(url: string, config?: AxiosRequestConfig) {
    const response = await this.api.get(url, config);
    return response.data;
  }

  // Generic post request
  async post(url: string, data?: any, config?: AxiosRequestConfig) {
    const response = await this.api.post(url, data, config);
    return response.data;
  }

  // Generic put request
  async put(url: string, data?: any, config?: AxiosRequestConfig) {
    const response = await this.api.put(url, data, config);
    return response.data;
  }

  // Generic delete request
  async delete(url: string, config?: AxiosRequestConfig) {
    const response = await this.api.delete(url, config);
    return response.data;
  }
}

export default new ApiService();
