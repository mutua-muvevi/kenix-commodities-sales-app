// API service for Riders Management
// Currently uses mock data - will be replaced with real API calls

import { MOCK_RIDERS, MOCK_RIDER_WALLET_TRANSACTIONS, getRiderStats } from '@/_mock/_riders';
import type {
  Rider,
  RiderFilters,
  RidersResponse,
  RiderDetailResponse,
  RiderStats,
  RiderWalletTransaction
} from '@/types/rider';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Get all riders with optional filters
export const getRiders = async (filters?: RiderFilters): Promise<RidersResponse> => {
  await delay(500); // Simulate network delay

  let filteredRiders = [...MOCK_RIDERS];

  // Apply status filter
  if (filters?.status && filters.status !== 'all') {
    filteredRiders = filteredRiders.filter(r => r.approvalStatus === filters.status);
  }

  // Apply active filter
  if (filters?.isActive !== undefined) {
    filteredRiders = filteredRiders.filter(r => r.isActive === filters.isActive);
  }

  // Apply search filter
  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    filteredRiders = filteredRiders.filter(r =>
      r.firstName.toLowerCase().includes(searchLower) ||
      r.lastName.toLowerCase().includes(searchLower) ||
      r.email.toLowerCase().includes(searchLower) ||
      r.phone.includes(filters.search!)
    );
  }

  return {
    riders: filteredRiders,
    total: filteredRiders.length,
    page: 1,
    limit: 50,
  };
};

// Get single rider by ID
export const getRider = async (riderId: string): Promise<Rider | null> => {
  await delay(300);

  const rider = MOCK_RIDERS.find(r => r._id === riderId);
  return rider || null;
};

// Get rider with full details (wallet, performance)
export const getRiderDetail = async (riderId: string): Promise<RiderDetailResponse | null> => {
  await delay(400);

  const rider = MOCK_RIDERS.find(r => r._id === riderId);
  if (!rider) return null;

  const transactions = MOCK_RIDER_WALLET_TRANSACTIONS[riderId] || [];

  return {
    rider,
    wallet: {
      balance: rider.walletBalance,
      totalEarnings: rider.totalEarnings,
      totalCollections: rider.totalCollections,
      transactions,
    },
    performance: {
      deliveriesCompleted: rider.deliveriesCompleted,
      deliveriesThisMonth: rider.deliveriesThisMonth,
      deliveriesThisWeek: rider.deliveriesThisWeek,
      collectionRate: rider.collectionRate,
      averageDeliveryTime: rider.averageDeliveryTime,
      rating: rider.rating,
    },
  };
};

// Get rider wallet transactions
export const getRiderWallet = async (riderId: string): Promise<RiderWalletTransaction[]> => {
  await delay(300);
  return MOCK_RIDER_WALLET_TRANSACTIONS[riderId] || [];
};

// Get rider statistics
export const getRiderStatsApi = async (): Promise<RiderStats> => {
  await delay(200);
  return getRiderStats();
};

// Approve a rider
export const approveRider = async (riderId: string): Promise<{ success: boolean; message: string }> => {
  await delay(500);

  const riderIndex = MOCK_RIDERS.findIndex(r => r._id === riderId);
  if (riderIndex === -1) {
    return { success: false, message: 'Rider not found' };
  }

  // In real implementation, this would update the database
  // For mock, we just return success
  return { success: true, message: 'Rider approved successfully' };
};

// Ban a rider
export const banRider = async (riderId: string, reason: string): Promise<{ success: boolean; message: string }> => {
  await delay(500);

  const riderIndex = MOCK_RIDERS.findIndex(r => r._id === riderId);
  if (riderIndex === -1) {
    return { success: false, message: 'Rider not found' };
  }

  // In real implementation, this would update the database
  return { success: true, message: `Rider banned. Reason: ${reason}` };
};

// Unban a rider
export const unbanRider = async (riderId: string): Promise<{ success: boolean; message: string }> => {
  await delay(500);

  const riderIndex = MOCK_RIDERS.findIndex(r => r._id === riderId);
  if (riderIndex === -1) {
    return { success: false, message: 'Rider not found' };
  }

  return { success: true, message: 'Rider unbanned successfully' };
};

// Update rider profile
export const updateRider = async (riderId: string, data: Partial<Rider>): Promise<{ success: boolean; message: string }> => {
  await delay(500);

  const riderIndex = MOCK_RIDERS.findIndex(r => r._id === riderId);
  if (riderIndex === -1) {
    return { success: false, message: 'Rider not found' };
  }

  return { success: true, message: 'Rider updated successfully' };
};

// Adjust rider wallet (admin only)
export const adjustRiderWallet = async (
  riderId: string,
  amount: number,
  reason: string
): Promise<{ success: boolean; message: string }> => {
  await delay(500);

  const rider = MOCK_RIDERS.find(r => r._id === riderId);
  if (!rider) {
    return { success: false, message: 'Rider not found' };
  }

  return {
    success: true,
    message: `Wallet adjusted by KES ${amount.toLocaleString()}. Reason: ${reason}`
  };
};
