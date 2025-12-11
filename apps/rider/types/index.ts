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
  status: 'pending' | 'in_transit' | 'arrived' | 'completed' | 'failed' | 'skipped';
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
  // Sequential enforcement fields
  canProceed: boolean;
  previousDelivery?: string | null;
  adminOverride?: {
    isOverridden: boolean;
    reason?: string;
    overriddenBy?: string;
    overriddenAt?: Date;
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
  _id: string;
  rider: string;
  balance: number; // Current balance (negative = rider owes company, positive = company owes rider)
  totalLoadedAmount: number; // Total value of goods loaded for current route
  totalCollected: number; // Total payments collected so far
  outstandingAmount: number; // Remaining amount to collect (calculated)
  currentRoute?: string; // Active route ID
  transactions: WalletTransaction[];
  status: 'active' | 'suspended' | 'settled';
  collectionPercentage: number; // Virtual field: percentage of total collected
  lastSettlement?: {
    amount: number;
    settledAt: Date;
    settledBy: string;
    notes?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface WalletTransaction {
  _id?: string;
  type: 'load' | 'collection' | 'adjustment' | 'settlement';
  amount: number;
  previousBalance: number;
  newBalance: number;
  description: string;
  relatedRoute?: string;
  relatedDelivery?: string;
  relatedTransaction?: string;
  performedBy?: string;
  timestamp: Date;
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

// Skip Request Types
export interface SkipRequest {
  deliveryId: string;
  shopId: string;
  riderId: string;
  reason: 'shop_closed' | 'owner_not_present' | 'wrong_address' | 'refused_delivery' | 'other';
  notes: string;
  photo?: string;
  location?: {
    lat: number;
    lng: number;
  };
  timestamp: string;
}

export interface SkipApproval {
  deliveryId: string;
  shopId: string;
  approved: boolean;
  approvedBy: string;
  reason?: string;
  timestamp: string;
}
