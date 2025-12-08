export interface User {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: 'rider';
  avatar?: string;
}

export interface LoginResponse {
  success: boolean;
  accessToken: string;
  user: User;
}

export interface Location {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface Shop {
  _id: string;
  shopName: string;
  ownerName: string;
  phoneNumber: string;
  location: Location;
  address: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
}

export interface Delivery {
  _id: string;
  shopId: Shop;
  orderId: string;
  items: OrderItem[];
  totalAmount: number;
  deliverySequence: number;
  status: 'pending' | 'in_transit' | 'arrived' | 'completed' | 'failed';
  assignedRiderId?: string;
  arrivalTime?: Date;
  completionTime?: Date;
  paymentMethod?: 'mpesa' | 'cash' | 'airtel';
  paymentStatus?: 'pending' | 'completed' | 'failed';
  signature?: string;
  photo?: string;
  notes?: string;
  location?: {
    lat: number;
    lng: number;
  };
}

export interface Route {
  _id: string;
  riderId: string;
  deliveries: Delivery[];
  status: 'assigned' | 'in_progress' | 'completed';
  totalDeliveries: number;
  completedDeliveries: number;
  estimatedCompletionTime?: Date;
  startTime?: Date;
  endTime?: Date;
}

export interface Wallet {
  riderId: string;
  balance: number;
  transactions: WalletTransaction[];
}

export interface WalletTransaction {
  _id: string;
  type: 'assignment' | 'delivery_complete' | 'adjustment';
  amount: number;
  balanceAfter: number;
  description: string;
  timestamp: Date;
  deliveryId?: string;
}

export interface Stats {
  today: {
    deliveriesCompleted: number;
    totalDeliveries: number;
    amountCollected: number;
    averageTimePerDelivery: number;
  };
  weekly: {
    deliveriesCompleted: number;
    amountCollected: number;
    rating?: number;
  };
}

export interface PaymentConfirmation {
  deliveryId: string;
  status: 'confirmed' | 'failed';
  transactionId?: string;
  amount: number;
}

// Offline Action Types
export interface OfflineAction {
  id: string;
  type: 'complete_delivery' | 'mark_arrival' | 'submit_payment' | 'update_location';
  payload: any;
  timestamp: number;
  retryCount: number;
}

// History Pagination Types
export interface HistoryPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasMore: boolean;
}

export interface DeliveryHistoryFilters {
  status?: 'completed' | 'failed';
  startDate?: string;
  endDate?: string;
}

// Sync Result Types
export interface SyncResult {
  synced: number;
  failed: number;
  remaining: number;
}

// Unlock Request Types
export interface UnlockRequest {
  deliveryId: string;
  reason: 'shop_unavailable' | 'emergency' | 'other';
  shopId: string;
  location?: {
    lat: number;
    lng: number;
  };
}
