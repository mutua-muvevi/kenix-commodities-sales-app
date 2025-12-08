// Deliveries API service

import { DELIVERIES_MOCK, getDeliveryStats } from '../../_mock/_deliveries';
import {
  Delivery,
  DeliveryStats,
  DeliveryFilters,
  DeliveriesResponse,
  DeliveryDetailResponse,
  DeliveryStatus,
  ShopDeliveryStatus
} from '../../types/delivery';

// Simulate network delay
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Get list of deliveries with optional filters
 */
export async function getDeliveries(
  filters?: DeliveryFilters,
  page: number = 1,
  limit: number = 10
): Promise<DeliveriesResponse> {
  await delay();

  let filteredDeliveries = [...DELIVERIES_MOCK];

  // Apply filters
  if (filters) {
    if (filters.status && filters.status !== 'all') {
      filteredDeliveries = filteredDeliveries.filter(d => d.status === filters.status);
    }

    if (filters.riderId) {
      filteredDeliveries = filteredDeliveries.filter(d => d.riderId === filters.riderId);
    }

    if (filters.routeId) {
      filteredDeliveries = filteredDeliveries.filter(d => d.routeId === filters.routeId);
    }

    if (filters.paymentStatus && filters.paymentStatus !== 'all') {
      filteredDeliveries = filteredDeliveries.filter(d => d.paymentStatus === filters.paymentStatus);
    }

    if (filters.startDate) {
      filteredDeliveries = filteredDeliveries.filter(d =>
        new Date(d.createdAt) >= filters.startDate!
      );
    }

    if (filters.endDate) {
      filteredDeliveries = filteredDeliveries.filter(d =>
        new Date(d.createdAt) <= filters.endDate!
      );
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filteredDeliveries = filteredDeliveries.filter(d =>
        d.deliveryCode.toLowerCase().includes(query) ||
        d.routeName.toLowerCase().includes(query) ||
        d.riderName.toLowerCase().includes(query) ||
        d.riderPhone.includes(query)
      );
    }
  }

  // Sort by creation date (newest first)
  filteredDeliveries.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Pagination
  const total = filteredDeliveries.length;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedDeliveries = filteredDeliveries.slice(startIndex, endIndex);

  return {
    deliveries: paginatedDeliveries,
    total,
    page,
    limit
  };
}

/**
 * Get a single delivery by ID
 */
export async function getDelivery(id: string): Promise<DeliveryDetailResponse> {
  await delay();

  const delivery = DELIVERIES_MOCK.find(d => d._id === id);

  if (!delivery) {
    throw new Error(`Delivery with ID ${id} not found`);
  }

  return {
    delivery
  };
}

/**
 * Get delivery statistics
 */
export async function getDeliveryStatistics(): Promise<DeliveryStats> {
  await delay();
  return getDeliveryStats();
}

/**
 * Reassign delivery to a different rider
 */
export async function reassignDelivery(
  deliveryId: string,
  newRiderId: string,
  reason?: string
): Promise<Delivery> {
  await delay(800);

  const delivery = DELIVERIES_MOCK.find(d => d._id === deliveryId);

  if (!delivery) {
    throw new Error(`Delivery with ID ${deliveryId} not found`);
  }

  if (delivery.status === 'completed') {
    throw new Error('Cannot reassign a completed delivery');
  }

  // In a real implementation, this would update the backend
  // For mock purposes, we just return the delivery with updated rider info
  const updatedDelivery: Delivery = {
    ...delivery,
    riderId: newRiderId,
    riderName: `Rider ${newRiderId}`, // In real app, would fetch actual rider name
    updatedAt: new Date()
  };

  return updatedDelivery;
}

/**
 * Update delivery status
 */
export async function updateDeliveryStatus(
  deliveryId: string,
  status: DeliveryStatus,
  reason?: string
): Promise<Delivery> {
  await delay(800);

  const delivery = DELIVERIES_MOCK.find(d => d._id === deliveryId);

  if (!delivery) {
    throw new Error(`Delivery with ID ${deliveryId} not found`);
  }

  const now = new Date();
  const updatedDelivery: Delivery = {
    ...delivery,
    status,
    updatedAt: now
  };

  if (status === 'in-progress' && !delivery.startedAt) {
    updatedDelivery.startedAt = now;
  }

  if (status === 'completed') {
    updatedDelivery.completedAt = now;
    // Mark all shops as completed
    updatedDelivery.shops = delivery.shops.map(shop => ({
      ...shop,
      status: 'completed' as ShopDeliveryStatus,
      completedAt: shop.completedAt || now
    }));
    updatedDelivery.collectedAmount = delivery.totalAmount;
    updatedDelivery.remainingAmount = 0;
    updatedDelivery.paymentStatus = 'complete';
  }

  if (status === 'failed' && reason) {
    updatedDelivery.failureReason = reason;
  }

  return updatedDelivery;
}

/**
 * Mark a specific shop as delivered within a delivery
 */
export async function markShopDelivered(
  deliveryId: string,
  shopId: string,
  collectedAmount?: number,
  deliveryNote?: string
): Promise<Delivery> {
  await delay(600);

  const delivery = DELIVERIES_MOCK.find(d => d._id === deliveryId);

  if (!delivery) {
    throw new Error(`Delivery with ID ${deliveryId} not found`);
  }

  const shopIndex = delivery.shops.findIndex(s => s.shopId === shopId);

  if (shopIndex === -1) {
    throw new Error(`Shop with ID ${shopId} not found in delivery`);
  }

  const now = new Date();
  const updatedShops = [...delivery.shops];
  updatedShops[shopIndex] = {
    ...updatedShops[shopIndex],
    status: 'completed' as ShopDeliveryStatus,
    completedAt: now,
    deliveryNote
  };

  const newCollectedAmount = delivery.collectedAmount + (collectedAmount || 0);
  const newRemainingAmount = delivery.totalAmount - newCollectedAmount;

  let newPaymentStatus = delivery.paymentStatus;
  if (newRemainingAmount === 0) {
    newPaymentStatus = 'complete';
  } else if (newCollectedAmount > 0) {
    newPaymentStatus = 'partial';
  }

  // Check if all shops are completed
  const allShopsCompleted = updatedShops.every(s => s.status === 'completed');
  const newDeliveryStatus = allShopsCompleted ? 'completed' as DeliveryStatus : delivery.status;

  const updatedDelivery: Delivery = {
    ...delivery,
    shops: updatedShops,
    collectedAmount: newCollectedAmount,
    remainingAmount: newRemainingAmount,
    paymentStatus: newPaymentStatus,
    status: newDeliveryStatus,
    completedAt: allShopsCompleted ? now : delivery.completedAt,
    updatedAt: now
  };

  return updatedDelivery;
}

/**
 * Get unique riders from deliveries (for filter dropdown)
 */
export async function getDeliveryRiders(): Promise<Array<{ id: string; name: string }>> {
  await delay(300);

  const ridersMap = new Map<string, string>();

  DELIVERIES_MOCK.forEach(delivery => {
    if (!ridersMap.has(delivery.riderId)) {
      ridersMap.set(delivery.riderId, delivery.riderName);
    }
  });

  return Array.from(ridersMap.entries()).map(([id, name]) => ({ id, name }));
}

/**
 * Get unique routes from deliveries (for filter dropdown)
 */
export async function getDeliveryRoutes(): Promise<Array<{ id: string; name: string }>> {
  await delay(300);

  const routesMap = new Map<string, string>();

  DELIVERIES_MOCK.forEach(delivery => {
    if (!routesMap.has(delivery.routeId)) {
      routesMap.set(delivery.routeId, delivery.routeName);
    }
  });

  return Array.from(routesMap.entries()).map(([id, name]) => ({ id, name }));
}
