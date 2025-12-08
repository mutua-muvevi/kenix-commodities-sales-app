/**
 * Order Type Definitions
 * Defines types for orders, order placement, and order tracking
 */

import { Shop } from './shop';
import { Product } from './product';
import { Address } from './shop';

export interface Order {
  _id: string;
  orderId: string;
  shop: string | Shop;
  products: OrderProduct[];
  totalPrice: number;
  discountAmount?: number;
  finalPrice: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  deliveryDate?: string;
  deliveryAddress?: Address;
  deliveryNotes?: string;
  createdBy: string;
  assignedRider?: string;
  trackingNumber?: string;
  estimatedDeliveryTime?: string;
  actualDeliveryTime?: string;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'ready_for_dispatch'
  | 'dispatched'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'failed';

export type PaymentMethod = 'cash' | 'mpesa' | 'credit' | 'bank_transfer';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partial';

export interface OrderProduct {
  product: string | Product;
  quantity: number;
  price: number;
  discount?: number;
  subtotal: number;
}

export interface OrderFormData {
  shopId: string;
  products: OrderProductInput[];
  paymentMethod: PaymentMethod;
  deliveryDate?: string;
  deliveryAddress?: Address;
  deliveryNotes?: string;
  specialInstructions?: string;
}

export interface OrderProductInput {
  productId: string;
  quantity: number;
  price: number;
}

export interface CreateOrderResponse {
  success: boolean;
  data: {
    order: Order;
  };
  message: string;
}

export interface OrderSummary {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}

export interface OrderListItem {
  _id: string;
  orderId: string;
  shopName: string;
  totalPrice: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  deliveryDate?: string;
  itemCount: number;
}

export interface OrderStatusUpdate {
  orderId: string;
  status: OrderStatus;
  timestamp: string;
  notes?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface OrderTracking {
  orderId: string;
  currentStatus: OrderStatus;
  statusHistory: OrderStatusUpdate[];
  estimatedDelivery?: string;
  riderInfo?: {
    name: string;
    phone: string;
    location?: {
      latitude: number;
      longitude: number;
    };
  };
}

export interface OfflineOrder {
  localId: string;
  orderData: OrderFormData;
  createdAt: string;
  synced: boolean;
  syncAttempts: number;
  lastSyncAttempt?: string;
  error?: string;
}
