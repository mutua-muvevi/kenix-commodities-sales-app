// Delivery types and interfaces

export type DeliveryStatus = 'pending' | 'in-progress' | 'completed' | 'failed';

export type PaymentStatus = 'pending' | 'partial' | 'complete';

export type ShopDeliveryStatus = 'pending' | 'in-progress' | 'completed' | 'failed';

export interface DeliveryShop {
  shopId: string;
  shopName: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  sequenceNumber: number;
  status: ShopDeliveryStatus;
  arrivedAt?: Date;
  completedAt?: Date;
  deliveryNote?: string;
}

export interface Delivery {
  _id: string;
  deliveryCode: string;
  routeId: string;
  routeName: string;
  riderId: string;
  riderName: string;
  riderPhone: string;
  shops: DeliveryShop[];
  orderIds: string[];
  status: DeliveryStatus;
  totalAmount: number;
  collectedAmount: number;
  remainingAmount: number;
  paymentStatus: PaymentStatus;
  startedAt?: Date;
  completedAt?: Date;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeliveryStats {
  totalDeliveries: number;
  activeDeliveries: number;
  completedDeliveries: number;
  failedDeliveries: number;
  todayDeliveries: number;
  totalRevenue: number;
  pendingRevenue: number;
  averageDeliveryTime: number; // in hours
  onTimeRate: number; // percentage
}

export interface DeliveryFilters {
  status?: DeliveryStatus | 'all';
  riderId?: string;
  routeId?: string;
  startDate?: Date;
  endDate?: Date;
  paymentStatus?: PaymentStatus | 'all';
  searchQuery?: string;
}

export interface DeliveriesResponse {
  deliveries: Delivery[];
  total: number;
  page: number;
  limit: number;
}

export interface DeliveryDetailResponse {
  delivery: Delivery;
}

export interface ReassignDeliveryRequest {
  deliveryId: string;
  newRiderId: string;
  reason?: string;
}

export interface UpdateDeliveryStatusRequest {
  deliveryId: string;
  status: DeliveryStatus;
  reason?: string;
}

export interface MarkShopDeliveredRequest {
  deliveryId: string;
  shopId: string;
  collectedAmount?: number;
  deliveryNote?: string;
}
