// TypeScript types for Rider Management

export type RiderApprovalStatus = 'pending' | 'approved' | 'banned';

export type WalletTransactionType = 'assignment' | 'collection' | 'adjustment' | 'settlement';

export interface RiderWalletTransaction {
  _id: string;
  type: WalletTransactionType;
  amount: number;
  description: string;
  balanceAfter: number;
  createdAt: string;
}

export interface RiderWallet {
  balance: number;
  totalEarnings: number;
  totalCollections: number;
  transactions: RiderWalletTransaction[];
}

export interface RiderPerformance {
  deliveriesCompleted: number;
  deliveriesThisMonth: number;
  deliveriesThisWeek: number;
  collectionRate: number;
  averageDeliveryTime: number;
  rating: number;
}

export interface Rider {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  approvalStatus: RiderApprovalStatus;
  isActive: boolean;
  deliveriesCompleted: number;
  deliveriesThisMonth: number;
  deliveriesThisWeek: number;
  collectionRate: number;
  averageDeliveryTime: number;
  rating: number;
  walletBalance: number;
  totalEarnings: number;
  totalCollections: number;
  currentRouteId?: string;
  currentRouteName?: string;
  lastDeliveryAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RiderStats {
  total: number;
  approved: number;
  pending: number;
  banned: number;
  active: number;
  totalDeliveries: number;
  totalCollections: number;
  avgCollectionRate: number;
}

export interface RiderFilters {
  status?: RiderApprovalStatus | 'all';
  isActive?: boolean;
  search?: string;
}

export interface RidersResponse {
  riders: Rider[];
  total: number;
  page: number;
  limit: number;
}

export interface RiderDetailResponse {
  rider: Rider;
  wallet: RiderWallet;
  performance: RiderPerformance;
}
