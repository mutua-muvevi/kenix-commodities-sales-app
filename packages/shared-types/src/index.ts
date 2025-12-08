// Core type definitions shared across all Kenix applications

// ============================================================================
// USER TYPES
// ============================================================================

export enum UserRole {
  ADMIN = 'admin',
  SALES_AGENT = 'sales_agent',
  RIDER = 'rider',
  SHOP = 'shop',
}

export enum UserStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  BANNED = 'banned',
  INACTIVE = 'inactive',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Admin extends User {
  role: UserRole.ADMIN;
  permissions?: string[];
}

export interface SalesAgent extends User {
  role: UserRole.SALES_AGENT;
  territoryId?: string;
  weeklyTarget?: number;
  monthlyTarget?: number;
  commissionRate?: number;
}

export interface Rider extends User {
  role: UserRole.RIDER;
  vehicleType?: string;
  licensePlate?: string;
  walletBalance: number;
  currentLocation?: Coordinates;
}

export interface Shop extends User {
  role: UserRole.SHOP;
  shopName: string;
  businessRegistration?: string;
  mpesaNumber: string;
  location: Coordinates;
  address: string;
  operatingHours?: {
    open: string;
    close: string;
  };
  registeredBy?: string; // Sales agent ID
  approvedBy?: string; // Admin ID
  shopPhoto?: string;
}

// ============================================================================
// PRODUCT TYPES
// ============================================================================

export enum ProductStatus {
  IN_STOCK = 'in_stock',
  OUT_OF_STOCK = 'out_of_stock',
  LOW_STOCK = 'low_stock',
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  category?: Category;
  price: number; // Wholesale price in KES
  unit: string; // e.g., "kg", "packet", "carton"
  images: string[];
  status: ProductStatus;
  stockLevel?: number;
  minStockLevel?: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// ORDER TYPES
// ============================================================================

export enum OrderStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum PaymentMethod {
  MPESA = 'mpesa',
  CASH = 'cash',
  AIRTEL = 'airtel',
  PAY_RIDER = 'pay_rider',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export interface OrderItem {
  id: string;
  productId: string;
  product?: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  shopId: string;
  shop?: Shop;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  mpesaTransactionId?: string;
  notes?: string;
  assignedRouteId?: string;
  deliveredAt?: string;
  deliveryProof?: {
    signature?: string;
    photo?: string;
    notes?: string;
    riderId: string;
    timestamp: string;
  };
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// ROUTE & DELIVERY TYPES
// ============================================================================

export enum RouteStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum DeliveryStatus {
  PENDING = 'pending',
  ARRIVED = 'arrived',
  DELIVERED = 'delivered',
  SKIPPED = 'skipped', // Shop closed
  FAILED = 'failed',
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface RouteStop {
  id: string;
  routeId: string;
  shopId: string;
  shop?: Shop;
  orderId: string;
  order?: Order;
  sequence: number;
  status: DeliveryStatus;
  estimatedArrival?: string;
  actualArrival?: string;
  completedAt?: string;
  skipReason?: string;
}

export interface Route {
  id: string;
  name: string;
  date: string;
  riderId: string;
  rider?: Rider;
  stops: RouteStop[];
  status: RouteStatus;
  totalDistance?: number; // in km
  estimatedDuration?: number; // in minutes
  optimizedPath?: Coordinates[];
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// PAYMENT & FINANCIAL TYPES
// ============================================================================

export enum TransactionType {
  ORDER_PAYMENT = 'order_payment',
  LOAN_DISBURSEMENT = 'loan_disbursement',
  LOAN_REPAYMENT = 'loan_repayment',
  COMMISSION_PAYOUT = 'commission_payout',
  WALLET_DEDUCTION = 'wallet_deduction',
  AIRTIME_PURCHASE = 'airtime_purchase',
  AIRTIME_SALE = 'airtime_sale',
}

export interface MpesaTransaction {
  id: string;
  transactionId: string;
  phoneNumber: string;
  amount: number;
  type: TransactionType;
  status: PaymentStatus;
  checkoutRequestId?: string;
  merchantRequestId?: string;
  resultCode?: number;
  resultDesc?: string;
  relatedOrderId?: string;
  relatedLoanId?: string;
  createdAt: string;
  updatedAt: string;
}

export enum LoanStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  DISBURSED = 'disbursed',
  REPAID = 'repaid',
  DEFAULTED = 'defaulted',
}

export interface Loan {
  id: string;
  shopId: string;
  shop?: Shop;
  amount: number;
  interestRate: number;
  totalRepayment: number;
  amountPaid: number;
  status: LoanStatus;
  disbursedAt?: string;
  dueDate: string;
  repaymentSchedule?: {
    date: string;
    amount: number;
    paid: boolean;
  }[];
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// PROMOTION TYPES
// ============================================================================

export enum PromotionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  SCHEDULED = 'scheduled',
  CANCELLED = 'cancelled',
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  productIds: string[];
  products?: Product[];
  startDate: string;
  endDate: string;
  status: PromotionStatus;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface SalesAgentPerformance {
  agentId: string;
  agent?: SalesAgent;
  period: 'weekly' | 'monthly';
  shopsRegistered: number;
  ordersPlaced: number;
  totalRevenue: number;
  target: number;
  achievement: number; // percentage
  commission: number;
}

export interface RiderPerformance {
  riderId: string;
  rider?: Rider;
  period: 'weekly' | 'monthly';
  deliveriesCompleted: number;
  paymentCollectionRate: number; // percentage
  averageDeliveryTime: number; // in minutes
  totalDistance: number; // in km
  earnings: number;
}

export interface BusinessMetrics {
  period: 'daily' | 'weekly' | 'monthly';
  totalOrders: number;
  totalRevenue: number;
  newCustomers: number;
  activeCustomers: number;
  topProducts: {
    productId: string;
    product?: Product;
    quantitySold: number;
    revenue: number;
  }[];
}

// ============================================================================
// WEBSOCKET EVENT TYPES
// ============================================================================

export enum WebSocketEvent {
  RIDER_LOCATION_UPDATED = 'rider:location-updated',
  DELIVERY_STATUS_CHANGED = 'delivery:status-changed',
  ORDER_STATUS_CHANGED = 'order:status-changed',
  PAYMENT_CONFIRMED = 'payment:confirmed',
  ROUTE_UPDATED = 'route:updated',
}

export interface RiderLocationUpdate {
  riderId: string;
  location: Coordinates;
  timestamp: string;
  routeId?: string;
  currentStopId?: string;
}

export interface DeliveryStatusUpdate {
  routeId: string;
  stopId: string;
  status: DeliveryStatus;
  timestamp: string;
  riderId: string;
}

export interface OrderStatusUpdate {
  orderId: string;
  status: OrderStatus;
  timestamp: string;
  updatedBy: string;
}

export interface PaymentConfirmation {
  orderId: string;
  transactionId: string;
  amount: number;
  timestamp: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  [key: string]: any;
}

// ============================================================================
// FORM DATA TYPES
// ============================================================================

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ShopRegistrationData {
  shopName: string;
  ownerName: string;
  email: string;
  phone: string;
  mpesaNumber: string;
  location: Coordinates;
  address: string;
  businessRegistration?: string;
  operatingHours?: {
    open: string;
    close: string;
  };
  shopPhoto?: string;
}

export interface CreateOrderData {
  shopId: string;
  items: {
    productId: string;
    quantity: number;
  }[];
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  price?: number;
  categoryId?: string;
  status?: ProductStatus;
  stockLevel?: number;
  images?: string[];
}
