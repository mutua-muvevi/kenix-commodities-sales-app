// Centralized API Client for Kenix Commodities
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import type {
  ApiResponse,
  User,
  Product,
  Category,
  Order,
  Route,
  Shop,
  Loan,
  Promotion,
  MpesaTransaction,
  SalesAgentPerformance,
  RiderPerformance,
  BusinessMetrics,
  PaginationParams,
  FilterParams,
  LoginCredentials,
  ShopRegistrationData,
  CreateOrderData,
  UpdateProductData,
} from '@kenix/shared-types';

// ============================================================================
// CONFIGURATION
// ============================================================================

export interface ApiClientConfig {
  baseURL?: string;
  timeout?: number;
  onTokenExpired?: () => void;
  getToken?: () => string | null;
  setToken?: (token: string) => void;
}

// ============================================================================
// API CLIENT CLASS
// ============================================================================

export class KenixApiClient {
  private client: AxiosInstance;
  private config: ApiClientConfig;

  constructor(config: ApiClientConfig = {}) {
    this.config = {
      baseURL: config.baseURL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
      timeout: config.timeout || 30000,
      ...config,
    };

    this.client = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor - attach auth token
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.config.getToken?.();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          this.config.onTokenExpired?.();
        }
        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: AxiosError): Error {
    if (error.response) {
      // Server responded with error
      const message = (error.response.data as any)?.error?.message || error.message;
      return new Error(message);
    } else if (error.request) {
      // Request made but no response
      return new Error('Network error. Please check your connection.');
    } else {
      // Request setup error
      return new Error(error.message);
    }
  }

  // ============================================================================
  // AUTHENTICATION
  // ============================================================================

  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> {
    const { data } = await this.client.post('/auth/login', credentials);
    if (data.data?.token) {
      this.config.setToken?.(data.data.token);
    }
    return data;
  }

  async logout(): Promise<void> {
    await this.client.post('/auth/logout');
    this.config.setToken?.('');
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    const { data } = await this.client.get('/auth/me');
    return data;
  }

  async resetPassword(email: string): Promise<ApiResponse> {
    const { data } = await this.client.post('/auth/reset-password', { email });
    return data;
  }

  // ============================================================================
  // USERS
  // ============================================================================

  async getUsers(params?: PaginationParams & FilterParams): Promise<ApiResponse<User[]>> {
    const { data } = await this.client.get('/users', { params });
    return data;
  }

  async getUserById(id: string): Promise<ApiResponse<User>> {
    const { data } = await this.client.get(`/users/${id}`);
    return data;
  }

  async createUser(userData: Partial<User>): Promise<ApiResponse<User>> {
    const { data } = await this.client.post('/users', userData);
    return data;
  }

  async updateUser(id: string, userData: Partial<User>): Promise<ApiResponse<User>> {
    const { data } = await this.client.patch(`/users/${id}`, userData);
    return data;
  }

  async banUser(id: string, reason?: string): Promise<ApiResponse> {
    const { data } = await this.client.post(`/users/${id}/ban`, { reason });
    return data;
  }

  async unbanUser(id: string): Promise<ApiResponse> {
    const { data } = await this.client.post(`/users/${id}/unban`);
    return data;
  }

  // ============================================================================
  // SHOPS
  // ============================================================================

  async getShops(params?: PaginationParams & FilterParams): Promise<ApiResponse<Shop[]>> {
    const { data } = await this.client.get('/shops', { params });
    return data;
  }

  async getShopById(id: string): Promise<ApiResponse<Shop>> {
    const { data } = await this.client.get(`/shops/${id}`);
    return data;
  }

  async registerShop(shopData: ShopRegistrationData): Promise<ApiResponse<Shop>> {
    const { data } = await this.client.post('/shops/register', shopData);
    return data;
  }

  async approveShop(id: string): Promise<ApiResponse<Shop>> {
    const { data } = await this.client.post(`/shops/${id}/approve`);
    return data;
  }

  async rejectShop(id: string, reason: string): Promise<ApiResponse> {
    const { data } = await this.client.post(`/shops/${id}/reject`, { reason });
    return data;
  }

  async updateShop(id: string, shopData: Partial<Shop>): Promise<ApiResponse<Shop>> {
    const { data } = await this.client.patch(`/shops/${id}`, shopData);
    return data;
  }

  // ============================================================================
  // PRODUCTS
  // ============================================================================

  async getProducts(params?: PaginationParams & FilterParams): Promise<ApiResponse<Product[]>> {
    const { data } = await this.client.get('/products', { params });
    return data;
  }

  async getProductById(id: string): Promise<ApiResponse<Product>> {
    const { data } = await this.client.get(`/products/${id}`);
    return data;
  }

  async createProduct(productData: Partial<Product>): Promise<ApiResponse<Product>> {
    const { data } = await this.client.post('/products', productData);
    return data;
  }

  async updateProduct(id: string, productData: UpdateProductData): Promise<ApiResponse<Product>> {
    const { data } = await this.client.patch(`/products/${id}`, productData);
    return data;
  }

  async deleteProduct(id: string): Promise<ApiResponse> {
    const { data } = await this.client.delete(`/products/${id}`);
    return data;
  }

  async updateProductStock(id: string, stockLevel: number): Promise<ApiResponse<Product>> {
    const { data } = await this.client.patch(`/products/${id}/stock`, { stockLevel });
    return data;
  }

  // ============================================================================
  // CATEGORIES
  // ============================================================================

  async getCategories(params?: PaginationParams): Promise<ApiResponse<Category[]>> {
    const { data } = await this.client.get('/categories', { params });
    return data;
  }

  async createCategory(categoryData: Partial<Category>): Promise<ApiResponse<Category>> {
    const { data } = await this.client.post('/categories', categoryData);
    return data;
  }

  async updateCategory(id: string, categoryData: Partial<Category>): Promise<ApiResponse<Category>> {
    const { data } = await this.client.patch(`/categories/${id}`, categoryData);
    return data;
  }

  async deleteCategory(id: string): Promise<ApiResponse> {
    const { data } = await this.client.delete(`/categories/${id}`);
    return data;
  }

  // ============================================================================
  // ORDERS
  // ============================================================================

  async getOrders(params?: PaginationParams & FilterParams): Promise<ApiResponse<Order[]>> {
    const { data } = await this.client.get('/orders', { params });
    return data;
  }

  async getOrderById(id: string): Promise<ApiResponse<Order>> {
    const { data } = await this.client.get(`/orders/${id}`);
    return data;
  }

  async createOrder(orderData: CreateOrderData): Promise<ApiResponse<Order>> {
    const { data } = await this.client.post('/orders', orderData);
    return data;
  }

  async approveOrder(id: string): Promise<ApiResponse<Order>> {
    const { data } = await this.client.post(`/orders/${id}/approve`);
    return data;
  }

  async rejectOrder(id: string, reason: string): Promise<ApiResponse> {
    const { data } = await this.client.post(`/orders/${id}/reject`, { reason });
    return data;
  }

  async cancelOrder(id: string, reason: string): Promise<ApiResponse> {
    const { data } = await this.client.post(`/orders/${id}/cancel`, { reason });
    return data;
  }

  async removeOrderItem(orderId: string, itemId: string): Promise<ApiResponse<Order>> {
    const { data } = await this.client.delete(`/orders/${orderId}/items/${itemId}`);
    return data;
  }

  // ============================================================================
  // ROUTES & DELIVERIES
  // ============================================================================

  async getRoutes(params?: PaginationParams & FilterParams): Promise<ApiResponse<Route[]>> {
    const { data } = await this.client.get('/routes', { params });
    return data;
  }

  async getRouteById(id: string): Promise<ApiResponse<Route>> {
    const { data } = await this.client.get(`/routes/${id}`);
    return data;
  }

  async createRoute(routeData: Partial<Route>): Promise<ApiResponse<Route>> {
    const { data } = await this.client.post('/routes', routeData);
    return data;
  }

  async assignRiderToRoute(routeId: string, riderId: string): Promise<ApiResponse<Route>> {
    const { data } = await this.client.post(`/routes/${routeId}/assign-rider`, { riderId });
    return data;
  }

  async optimizeRoute(routeId: string): Promise<ApiResponse<Route>> {
    const { data } = await this.client.post(`/routes/${routeId}/optimize`);
    return data;
  }

  async updateDeliveryStatus(
    routeId: string,
    stopId: string,
    status: string,
    proof?: any
  ): Promise<ApiResponse> {
    const { data } = await this.client.patch(`/routes/${routeId}/stops/${stopId}`, {
      status,
      proof,
    });
    return data;
  }

  async getRiderLocation(riderId: string): Promise<ApiResponse<{ latitude: number; longitude: number }>> {
    const { data } = await this.client.get(`/riders/${riderId}/location`);
    return data;
  }

  async updateRiderLocation(riderId: string, location: { latitude: number; longitude: number }): Promise<void> {
    await this.client.post(`/riders/${riderId}/location`, location);
  }

  // ============================================================================
  // PAYMENTS
  // ============================================================================

  async initiateMpesaPayment(orderData: {
    orderId?: string;
    phoneNumber: string;
    amount: number;
  }): Promise<ApiResponse<{ checkoutRequestId: string }>> {
    const { data } = await this.client.post('/payments/mpesa/initiate', orderData);
    return data;
  }

  async checkPaymentStatus(checkoutRequestId: string): Promise<ApiResponse<MpesaTransaction>> {
    const { data } = await this.client.get(`/payments/mpesa/status/${checkoutRequestId}`);
    return data;
  }

  async getTransactionHistory(params?: PaginationParams & FilterParams): Promise<ApiResponse<MpesaTransaction[]>> {
    const { data } = await this.client.get('/payments/transactions', { params });
    return data;
  }

  // ============================================================================
  // LOANS (KENIX DUKA)
  // ============================================================================

  async getLoans(params?: PaginationParams & FilterParams): Promise<ApiResponse<Loan[]>> {
    const { data } = await this.client.get('/loans', { params });
    return data;
  }

  async applyForLoan(loanData: { amount: number }): Promise<ApiResponse<Loan>> {
    const { data } = await this.client.post('/loans/apply', loanData);
    return data;
  }

  async approveLoan(id: string): Promise<ApiResponse<Loan>> {
    const { data } = await this.client.post(`/loans/${id}/approve`);
    return data;
  }

  async disburseLoan(id: string): Promise<ApiResponse<Loan>> {
    const { data } = await this.client.post(`/loans/${id}/disburse`);
    return data;
  }

  async repayLoan(id: string, amount: number): Promise<ApiResponse> {
    const { data } = await this.client.post(`/loans/${id}/repay`, { amount });
    return data;
  }

  // ============================================================================
  // PROMOTIONS
  // ============================================================================

  async getPromotions(params?: PaginationParams & FilterParams): Promise<ApiResponse<Promotion[]>> {
    const { data } = await this.client.get('/promotions', { params });
    return data;
  }

  async createPromotion(promotionData: Partial<Promotion>): Promise<ApiResponse<Promotion>> {
    const { data } = await this.client.post('/promotions', promotionData);
    return data;
  }

  async updatePromotion(id: string, promotionData: Partial<Promotion>): Promise<ApiResponse<Promotion>> {
    const { data } = await this.client.patch(`/promotions/${id}`, promotionData);
    return data;
  }

  async deletePromotion(id: string): Promise<ApiResponse> {
    const { data } = await this.client.delete(`/promotions/${id}`);
    return data;
  }

  // ============================================================================
  // ANALYTICS
  // ============================================================================

  async getSalesAgentPerformance(
    agentId: string,
    period: 'weekly' | 'monthly'
  ): Promise<ApiResponse<SalesAgentPerformance>> {
    const { data } = await this.client.get(`/analytics/sales-agents/${agentId}`, {
      params: { period },
    });
    return data;
  }

  async getRiderPerformance(riderId: string, period: 'weekly' | 'monthly'): Promise<ApiResponse<RiderPerformance>> {
    const { data } = await this.client.get(`/analytics/riders/${riderId}`, {
      params: { period },
    });
    return data;
  }

  async getBusinessMetrics(period: 'daily' | 'weekly' | 'monthly'): Promise<ApiResponse<BusinessMetrics>> {
    const { data } = await this.client.get('/analytics/business', {
      params: { period },
    });
    return data;
  }

  // ============================================================================
  // FILE UPLOAD
  // ============================================================================

  async uploadFile(file: File | Blob, folder?: string): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) formData.append('folder', folder);

    const { data } = await this.client.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  }
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default KenixApiClient;

// Export singleton instance creator
let apiClientInstance: KenixApiClient | null = null;

export const createApiClient = (config?: ApiClientConfig): KenixApiClient => {
  if (!apiClientInstance) {
    apiClientInstance = new KenixApiClient(config);
  }
  return apiClientInstance;
};

export const getApiClient = (): KenixApiClient => {
  if (!apiClientInstance) {
    throw new Error('API client not initialized. Call createApiClient first.');
  }
  return apiClientInstance;
};
