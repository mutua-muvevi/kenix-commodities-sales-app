// src/lib/api/orders.ts
import apiClient from './client';

export interface OrderProduct {
  product: string;
  quantity: number;
  price?: number;
}

export interface CreateOrderData {
  products: OrderProduct[];
  paymentMethod: 'cash' | 'mpesa' | 'credit';
  deliveryNotes?: string;
  shopId?: string; // For sales agents creating orders
}

export interface Order {
  _id: string;
  orderNumber: string;
  orderer: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  products: Array<{
    product: {
      _id: string;
      productName: string;
      price: number;
      images?: string[];
    };
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  approvalStatus: 'pending' | 'approved' | 'rejected';
  deliveryStatus: 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'failed';
  paymentMethod: string;
  deliveryNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderListParams {
  page?: number;
  limit?: number;
  status?: string;
  approvalStatus?: string;
  deliveryStatus?: string;
  shopId?: string;
  riderId?: string;
  routeId?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Create new order
 */
export const createOrder = async (data: CreateOrderData) => {
  const response = await apiClient.post('/orders', data);
  return response.data;
};

/**
 * Get list of orders with filters
 */
export const getOrders = async (params?: OrderListParams) => {
  const response = await apiClient.get('/orders', { params });
  return response.data;
};

/**
 * Get single order by ID
 */
export const getOrder = async (orderId: string) => {
  const response = await apiClient.get(`/orders/${orderId}`);
  return response.data;
};

/**
 * Approve order (Admin only)
 */
export const approveOrder = async (orderId: string, notes?: string) => {
  const response = await apiClient.patch(`/orders/${orderId}/approve`, { notes });
  return response.data;
};

/**
 * Reject order (Admin only)
 */
export const rejectOrder = async (orderId: string, reason: string) => {
  const response = await apiClient.patch(`/orders/${orderId}/reject`, { reason });
  return response.data;
};

/**
 * Assign order to route (Admin only)
 */
export const assignOrderToRoute = async (
  orderId: string,
  routeId: string,
  riderId: string
) => {
  const response = await apiClient.patch(`/orders/${orderId}/assign-route`, {
    routeId,
    riderId,
  });
  return response.data;
};

/**
 * Remove product from order (Admin only)
 */
export const removeProductFromOrder = async (orderId: string, productId: string) => {
  const response = await apiClient.delete(`/orders/${orderId}/products/${productId}`);
  return response.data;
};

/**
 * Cancel order
 */
export const cancelOrder = async (orderId: string, reason: string) => {
  const response = await apiClient.patch(`/orders/${orderId}/cancel`, { reason });
  return response.data;
};
