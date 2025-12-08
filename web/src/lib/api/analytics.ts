// src/lib/api/analytics.ts
import apiClient from './client';

export interface OverviewMetrics {
  totalOrders: number;
  totalRevenue: number;
  activeRiders: number;
  activeShops: number;
  averageOrderValue: number;
  ordersChange: number; // Percentage change from previous period
  revenueChange: number;
}

export interface DailyOrdersData {
  date: string;
  orders: number;
  revenue: number;
}

export interface TopProduct {
  _id: string;
  productName: string;
  totalQuantity: number;
  totalRevenue: number;
  orderCount: number;
}

export interface OrdersByStatus {
  status: string;
  count: number;
  percentage: number;
}

export interface RevenueByMonth {
  month: string;
  revenue: number;
}

export interface SalesAgentPerformance {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  shopsRegistered: number;
  ordersPlaced: number;
  totalRevenue: number;
  totalCommission: number;
}

export interface RiderPerformance {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  deliveriesCompleted: number;
  collectionRate: number; // Percentage
  averageDeliveryTime: number; // In minutes
  totalDelivered: number;
  totalCollected: number;
}

export interface AnalyticsParams {
  startDate?: string;
  endDate?: string;
  period?: 'day' | 'week' | 'month' | 'year';
}

/**
 * Get overview metrics
 */
export const getOverviewMetrics = async (params?: AnalyticsParams) => {
  const response = await apiClient.get('/analytics/overview', { params });
  return response.data;
};

/**
 * Get daily orders data
 */
export const getDailyOrders = async (params?: AnalyticsParams) => {
  const response = await apiClient.get('/analytics/daily-orders', { params });
  return response.data;
};

/**
 * Get top products
 */
export const getTopProducts = async (params?: AnalyticsParams & { limit?: number }) => {
  const response = await apiClient.get('/analytics/top-products', { params });
  return response.data;
};

/**
 * Get orders by status
 */
export const getOrdersByStatus = async (params?: AnalyticsParams) => {
  const response = await apiClient.get('/analytics/orders-by-status', { params });
  return response.data;
};

/**
 * Get revenue by month
 */
export const getRevenueByMonth = async (params?: { months?: number }) => {
  const response = await apiClient.get('/analytics/revenue-by-month', { params });
  return response.data;
};

/**
 * Get sales agent performance
 */
export const getSalesAgentPerformance = async (params?: AnalyticsParams) => {
  const response = await apiClient.get('/performance/sales-agents', { params });
  return response.data;
};

/**
 * Get rider performance
 */
export const getRiderPerformance = async (params?: AnalyticsParams) => {
  const response = await apiClient.get('/performance/riders', { params });
  return response.data;
};
