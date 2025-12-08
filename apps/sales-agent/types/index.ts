/**
 * Central Type Definitions Barrel Export
 *
 * This file aggregates and re-exports all type definitions used in the Sales Agent App.
 * Import from this file to access any type: import { SalesAgent, Shop, Order } from '@/types';
 */

// User & Authentication Types
export type {
  SalesAgent,
  LoginFormData,
  RegisterFormData,
  OTPFormData,
  AuthState,
  AuthResponse,
  PerformanceMetrics,
  AgentStats,
} from './user';

// Shop Types
export type {
  Shop,
  ShopStatus,
  ShopCategory,
  CustomerSegment,
  GeoLocation,
  Address,
  OperatingHours,
  ShopFormData,
  KYCFormData,
  KYCUploadResponse,
  ShopListItem,
  RFMSegment,
  ShopInsights,
} from './shop';

// Product Types
export type {
  Product,
  ProductDiscount,
  CartItem,
  Cart,
  ProductCategory,
  InventoryStatus,
  PriceHistory,
  ProductRecommendation,
  BarcodeResult,
} from './product';

// Order Types
export type {
  Order,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  OrderProduct,
  OrderFormData,
  OrderProductInput,
  CreateOrderResponse,
  OrderSummary,
  OrderListItem,
  OrderStatusUpdate,
  OrderTracking,
  OfflineOrder,
} from './order';

// Route Types
export type {
  Route,
  RouteShop,
  RouteStatus,
  VisitStatus,
  RouteListItem,
  RouteOptimization,
  RouteProgress,
  VisitLog,
  RouteAssignment,
  GeoFence,
  CheckInData,
  CheckOutData,
  RouteMetrics,
} from './route';

// Notification Types
export type {
  Notification,
  NotificationType,
  NotificationPriority,
  NotificationData,
  PushNotificationPayload,
  NotificationPreferences,
  NotificationSettings,
  ToastConfig,
  InAppAlert,
  AlertAction,
  NotificationBadge,
  NotificationGroup,
} from './notification';

// Common API Response Types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
  errors?: ValidationError[];
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  message: string;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// Sync & Offline Types
export interface SyncQueueItem {
  id: string;
  type: 'order' | 'shop' | 'visit' | 'kyc';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: string;
  attempts: number;
  lastAttempt?: string;
  status: 'pending' | 'syncing' | 'failed' | 'synced';
  error?: string;
}

export interface SyncStatus {
  lastSync?: string;
  pendingItems: number;
  failedItems: number;
  isSyncing: boolean;
  isOnline: boolean;
}

// Location Types
export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
}

export interface LocationPermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
  status: 'granted' | 'denied' | 'undetermined';
}

// Media Types
export interface ImageUpload {
  uri: string;
  type: string;
  name: string;
  size?: number;
}

export interface ImageUploadResponse {
  success: boolean;
  url: string;
  publicId?: string;
  error?: string;
}

// Filter & Sort Types
export interface FilterOptions {
  status?: string[];
  dateFrom?: string;
  dateTo?: string;
  category?: string[];
  search?: string;
}

export interface SortOptions {
  field: string;
  order: 'asc' | 'desc';
}

// Statistics Types
export interface DashboardStats {
  today: {
    routesAssigned: number;
    shopsVisited: number;
    ordersPlaced: number;
    revenue: number;
  };
  week: {
    routesCompleted: number;
    shopsVisited: number;
    ordersPlaced: number;
    revenue: number;
  };
  month: {
    routesCompleted: number;
    shopsVisited: number;
    ordersPlaced: number;
    revenue: number;
    newShops: number;
    commission: number;
  };
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

export type ErrorCode =
  | 'NETWORK_ERROR'
  | 'AUTH_ERROR'
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'PERMISSION_DENIED'
  | 'SERVER_ERROR'
  | 'OFFLINE_ERROR'
  | 'SYNC_ERROR'
  | 'LOCATION_ERROR'
  | 'CAMERA_ERROR'
  | 'UNKNOWN_ERROR';
