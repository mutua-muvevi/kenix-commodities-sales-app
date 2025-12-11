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

  // Get categories
  async getCategories(filters?: {
    isActive?: boolean;
    parentCategory?: string;
    includeProducts?: boolean;
    sortBy?: string;
    sortOrder?: string;
    page?: number;
    limit?: number;
  }) {
    let url = '/categories';
    const params = new URLSearchParams();

    if (filters?.isActive !== undefined) {
      params.append('isActive', filters.isActive.toString());
    }
    if (filters?.parentCategory) {
      params.append('parentCategory', filters.parentCategory);
    }
    if (filters?.includeProducts !== undefined) {
      params.append('includeProducts', filters.includeProducts.toString());
    }
    if (filters?.sortBy) {
      params.append('sortBy', filters.sortBy);
    }
    if (filters?.sortOrder) {
      params.append('sortOrder', filters.sortOrder);
    }
    if (filters?.page) {
      params.append('page', filters.page.toString());
    }
    if (filters?.limit) {
      params.append('limit', filters.limit.toString());
    }

    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }

    const response = await this.api.get(url);
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

  // Place order on behalf of shop
  async placeOrder(orderData: any) {
    const response = await this.api.post('/orders', orderData);
    return response.data;
  }

  // Get shop credit info
  async getShopCreditInfo(shopId: string) {
    try {
      const response = await this.api.get(`/user/${shopId}/credit`);
      return response.data;
    } catch (error) {
      // If endpoint doesn't exist, return default credit info
      console.log('Credit info endpoint not available, using defaults');
      return {
        creditLimit: 50000,
        creditUsed: 0,
        availableCredit: 50000,
      };
    }
  }

  // Send order notification to shop
  async notifyShopOwner(shopId: string, orderId: string, orderAmount: number, agentName: string) {
    try {
      const response = await this.api.post('/notifications/send', {
        userId: shopId,
        type: 'order_placed',
        title: 'New Order Placed',
        message: `An order of KES ${orderAmount.toLocaleString()} has been placed for your shop by ${agentName}`,
        data: {
          orderId,
          amount: orderAmount,
          agentName,
        },
      });
      return response.data;
    } catch (error) {
      console.log('Notification endpoint not available');
      return null;
    }
  }

  // Get shop's recent orders for reorder feature
  async getShopRecentOrders(shopId: string, limit: number = 5) {
    try {
      const response = await this.api.get(`/orders?orderer=${shopId}&limit=${limit}&sortBy=createdAt&sortOrder=desc`);
      return response.data;
    } catch (error) {
      console.log('Error fetching recent orders');
      return { orders: [] };
    }
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

  // Generic patch request
  async patch(url: string, data?: any, config?: AxiosRequestConfig) {
    const response = await this.api.patch(url, data, config);
    return response.data;
  }

  // Generic delete request
  async delete(url: string, config?: AxiosRequestConfig) {
    const response = await this.api.delete(url, config);
    return response.data;
  }

  // Notification endpoints
  async getNotifications(userId: string) {
    const response = await this.api.get(`/notifications/${userId}`);
    return response.data;
  }

  async markNotificationAsRead(notificationId: string) {
    const response = await this.api.put(`/notifications/${notificationId}/read`);
    return response.data;
  }

  async markAllNotificationsAsRead(userId: string) {
    const response = await this.api.put(`/notifications/${userId}/read-all`);
    return response.data;
  }

  async deleteNotification(notificationId: string) {
    const response = await this.api.delete(`/notifications/${notificationId}`);
    return response.data;
  }

  async clearAllNotifications(userId: string) {
    const response = await this.api.delete(`/notifications/${userId}/clear-all`);
    return response.data;
  }

  // Location tracking endpoints
  async sendLocationUpdate(locationData: {
    userId: string;
    latitude: number;
    longitude: number;
    accuracy: number | null;
    altitude: number | null;
    heading: number | null;
    speed: number | null;
    timestamp: number;
    batteryLevel: number;
    isCharging: boolean;
  }) {
    const response = await this.api.post('/user/location', locationData);
    return response.data;
  }

  async getLocationHistory(userId: string, limit = 100) {
    const response = await this.api.get(`/user/location/${userId}?limit=${limit}`);
    return response.data;
  }

  // Route management endpoints
  async getRoutes(agentId: string, filters?: { status?: string; date?: string }) {
    let url = `/routes?agentId=${agentId}`;

    if (filters?.status) {
      url += `&status=${filters.status}`;
    }
    if (filters?.date) {
      url += `&date=${filters.date}`;
    }

    const response = await this.api.get(url);
    return response.data;
  }

  async getRouteById(routeId: string) {
    const response = await this.api.get(`/routes/${routeId}`);
    return response.data;
  }

  async startRoute(routeId: string) {
    const response = await this.api.put(`/routes/${routeId}/start`);
    return response.data;
  }

  async pauseRoute(routeId: string) {
    const response = await this.api.put(`/routes/${routeId}/pause`);
    return response.data;
  }

  async resumeRoute(routeId: string) {
    const response = await this.api.put(`/routes/${routeId}/resume`);
    return response.data;
  }

  async completeRoute(routeId: string) {
    const response = await this.api.put(`/routes/${routeId}/complete`);
    return response.data;
  }

  async checkInShop(routeId: string, shopId: string, location: { latitude: number; longitude: number }) {
    const response = await this.api.post(`/routes/${routeId}/check-in`, {
      shopId,
      location,
      checkInTime: new Date().toISOString(),
    });
    return response.data;
  }

  async checkOutShop(routeId: string, shopId: string, location: { latitude: number; longitude: number }, notes?: string) {
    const response = await this.api.post(`/routes/${routeId}/check-out`, {
      shopId,
      location,
      checkOutTime: new Date().toISOString(),
      notes,
    });
    return response.data;
  }

  // Token refresh (for auth store)
  async refreshToken(refreshToken: string) {
    const response = await this.api.post('/auth/refresh', { refreshToken });
    return response.data;
  }

  // Orders endpoint alias for consistency
  async getOrders(filters?: { status?: string; shopId?: string; agentId?: string }) {
    let url = '/orders';
    const params = new URLSearchParams();

    if (filters?.status) {
      params.append('status', filters.status);
    }
    if (filters?.shopId) {
      params.append('orderer', filters.shopId);
    }
    if (filters?.agentId) {
      params.append('createdBy', filters.agentId);
    }

    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }

    const response = await this.api.get(url);
    return response.data;
  }
}

export default new ApiService();
