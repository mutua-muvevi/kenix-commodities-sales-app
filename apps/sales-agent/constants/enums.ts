/**
 * Enums for Sales Agent App
 * Type-safe enumerations for various entity states and types
 */

// Shop-related enums
export enum ShopStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended',
  INACTIVE = 'inactive',
}

export enum ShopType {
  RETAIL = 'retail',
  WHOLESALE = 'wholesale',
  KIOSK = 'kiosk',
  SUPERMARKET = 'supermarket',
  OTHER = 'other',
}

// Order-related enums
export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  PACKED = 'packed',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REJECTED = 'rejected',
}

export enum OrderPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

// Route-related enums
export enum RouteStatus {
  PLANNED = 'planned',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  PAUSED = 'paused',
}

export enum VisitStatus {
  PENDING = 'pending',
  VISITED = 'visited',
  SKIPPED = 'skipped',
  RESCHEDULED = 'rescheduled',
  NO_SHOW = 'no_show',
}

export enum VisitOutcome {
  ORDER_PLACED = 'order_placed',
  NO_ORDER = 'no_order',
  SHOP_CLOSED = 'shop_closed',
  OUT_OF_STOCK = 'out_of_stock',
  CREDIT_ISSUE = 'credit_issue',
  OTHER = 'other',
}

// Payment-related enums
export enum PaymentMethod {
  CASH = 'cash',
  MPESA = 'mpesa',
  CREDIT = 'credit',
  BANK_TRANSFER = 'bank_transfer',
  CHEQUE = 'cheque',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  PARTIAL = 'partial',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

// Notification-related enums
export enum NotificationType {
  SHOP_APPROVED = 'shop_approved',
  SHOP_REJECTED = 'shop_rejected',
  ORDER_STATUS = 'order_status',
  ORDER_CONFIRMED = 'order_confirmed',
  ORDER_DELIVERED = 'order_delivered',
  ROUTE_ASSIGNED = 'route_assigned',
  ROUTE_UPDATED = 'route_updated',
  COMMISSION_PAID = 'commission_paid',
  TARGET_ACHIEVED = 'target_achieved',
  STOCK_ALERT = 'stock_alert',
  PRICE_UPDATE = 'price_update',
  SYSTEM = 'system',
  PROMOTION = 'promotion',
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

// User-related enums
export enum UserRole {
  SALES_AGENT = 'sales_agent',
  ADMIN = 'admin',
  MANAGER = 'manager',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
}

// Product-related enums
export enum ProductCategory {
  BEVERAGES = 'beverages',
  SNACKS = 'snacks',
  GROCERIES = 'groceries',
  HOUSEHOLD = 'household',
  PERSONAL_CARE = 'personal_care',
  OTHER = 'other',
}

export enum ProductUnit {
  PIECE = 'piece',
  BOX = 'box',
  CARTON = 'carton',
  PACK = 'pack',
  SACHET = 'sachet',
  BOTTLE = 'bottle',
  CAN = 'can',
  KG = 'kg',
  LITER = 'liter',
}

export enum StockStatus {
  IN_STOCK = 'in_stock',
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
  DISCONTINUED = 'discontinued',
}

// Sync-related enums
export enum SyncStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CONFLICT = 'conflict',
}

export enum SyncAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

// App state enums
export enum NetworkStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  POOR = 'poor',
}

export enum LoadingState {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
}

// Location/GPS enums
export enum LocationPermissionStatus {
  GRANTED = 'granted',
  DENIED = 'denied',
  UNDETERMINED = 'undetermined',
}

export enum TrackingStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  STOPPED = 'stopped',
}

// Document/KYC enums
export enum DocumentType {
  ID_CARD = 'id_card',
  BUSINESS_PERMIT = 'business_permit',
  TAX_PIN = 'tax_pin',
  SHOP_PHOTO = 'shop_photo',
  OWNER_PHOTO = 'owner_photo',
  OTHER = 'other',
}

export enum DocumentStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

// Report/Analytics enums
export enum ReportPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
  CUSTOM = 'custom',
}

export enum PerformanceMetric {
  VISITS = 'visits',
  ORDERS = 'orders',
  REVENUE = 'revenue',
  COMMISSION = 'commission',
  CONVERSION_RATE = 'conversion_rate',
  AVERAGE_ORDER_VALUE = 'average_order_value',
}

// Helper function to get enum values as array
export const getEnumValues = <T extends Record<string, string>>(enumObj: T): T[keyof T][] => {
  return Object.values(enumObj);
};

// Helper function to get enum keys as array
export const getEnumKeys = <T extends Record<string, string>>(enumObj: T): (keyof T)[] => {
  return Object.keys(enumObj) as (keyof T)[];
};

// Helper function to check if value is valid enum value
export const isValidEnumValue = <T extends Record<string, string>>(
  enumObj: T,
  value: any
): value is T[keyof T] => {
  return Object.values(enumObj).includes(value);
};

export default {
  ShopStatus,
  ShopType,
  OrderStatus,
  OrderPriority,
  RouteStatus,
  VisitStatus,
  VisitOutcome,
  PaymentMethod,
  PaymentStatus,
  NotificationType,
  NotificationPriority,
  UserRole,
  UserStatus,
  ProductCategory,
  ProductUnit,
  StockStatus,
  SyncStatus,
  SyncAction,
  NetworkStatus,
  LoadingState,
  LocationPermissionStatus,
  TrackingStatus,
  DocumentType,
  DocumentStatus,
  ReportPeriod,
  PerformanceMetric,
};
