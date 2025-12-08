// Mock data for Riders Management
// This will be replaced with real API calls later

export interface MockRiderWalletTransaction {
  _id: string;
  type: 'assignment' | 'collection' | 'adjustment' | 'settlement';
  amount: number;
  description: string;
  balanceAfter: number;
  createdAt: string;
}

export interface MockRider {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  approvalStatus: 'pending' | 'approved' | 'banned';
  isActive: boolean;
  deliveriesCompleted: number;
  deliveriesThisMonth: number;
  deliveriesThisWeek: number;
  collectionRate: number;
  averageDeliveryTime: number; // in minutes
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

export const MOCK_RIDERS: MockRider[] = [
  {
    _id: 'rider-001',
    firstName: 'John',
    lastName: 'Kamau',
    email: 'john.kamau@rider.com',
    phone: '+254712345678',
    avatar: '/assets/images/avatar/avatar-1.webp',
    approvalStatus: 'approved',
    isActive: true,
    deliveriesCompleted: 256,
    deliveriesThisMonth: 45,
    deliveriesThisWeek: 12,
    collectionRate: 96.5,
    averageDeliveryTime: 28,
    rating: 4.8,
    walletBalance: 15600,
    totalEarnings: 125000,
    totalCollections: 890000,
    currentRouteId: 'route-001',
    currentRouteName: 'Westlands Route A',
    lastDeliveryAt: '2025-12-08T10:30:00Z',
    createdAt: '2024-06-15T08:00:00Z',
    updatedAt: '2025-12-08T10:30:00Z',
  },
  {
    _id: 'rider-002',
    firstName: 'Peter',
    lastName: 'Ochieng',
    email: 'peter.ochieng@rider.com',
    phone: '+254723456789',
    avatar: '/assets/images/avatar/avatar-2.webp',
    approvalStatus: 'approved',
    isActive: true,
    deliveriesCompleted: 189,
    deliveriesThisMonth: 38,
    deliveriesThisWeek: 9,
    collectionRate: 94.2,
    averageDeliveryTime: 32,
    rating: 4.6,
    walletBalance: 8900,
    totalEarnings: 98000,
    totalCollections: 650000,
    currentRouteId: 'route-002',
    currentRouteName: 'Kilimani Route B',
    lastDeliveryAt: '2025-12-08T09:45:00Z',
    createdAt: '2024-07-20T08:00:00Z',
    updatedAt: '2025-12-08T09:45:00Z',
  },
  {
    _id: 'rider-003',
    firstName: 'James',
    lastName: 'Mwangi',
    email: 'james.mwangi@rider.com',
    phone: '+254734567890',
    avatar: '/assets/images/avatar/avatar-3.webp',
    approvalStatus: 'approved',
    isActive: false,
    deliveriesCompleted: 312,
    deliveriesThisMonth: 52,
    deliveriesThisWeek: 14,
    collectionRate: 98.1,
    averageDeliveryTime: 25,
    rating: 4.9,
    walletBalance: 22400,
    totalEarnings: 156000,
    totalCollections: 1120000,
    lastDeliveryAt: '2025-12-07T18:30:00Z',
    createdAt: '2024-03-10T08:00:00Z',
    updatedAt: '2025-12-07T18:30:00Z',
  },
  {
    _id: 'rider-004',
    firstName: 'David',
    lastName: 'Njoroge',
    email: 'david.njoroge@rider.com',
    phone: '+254745678901',
    approvalStatus: 'pending',
    isActive: false,
    deliveriesCompleted: 0,
    deliveriesThisMonth: 0,
    deliveriesThisWeek: 0,
    collectionRate: 0,
    averageDeliveryTime: 0,
    rating: 0,
    walletBalance: 0,
    totalEarnings: 0,
    totalCollections: 0,
    createdAt: '2025-12-05T14:00:00Z',
    updatedAt: '2025-12-05T14:00:00Z',
  },
  {
    _id: 'rider-005',
    firstName: 'Samuel',
    lastName: 'Kiprop',
    email: 'samuel.kiprop@rider.com',
    phone: '+254756789012',
    avatar: '/assets/images/avatar/avatar-5.webp',
    approvalStatus: 'approved',
    isActive: true,
    deliveriesCompleted: 145,
    deliveriesThisMonth: 28,
    deliveriesThisWeek: 7,
    collectionRate: 92.8,
    averageDeliveryTime: 35,
    rating: 4.4,
    walletBalance: 6200,
    totalEarnings: 72000,
    totalCollections: 480000,
    currentRouteId: 'route-003',
    currentRouteName: 'Karen Route',
    lastDeliveryAt: '2025-12-08T11:00:00Z',
    createdAt: '2024-09-01T08:00:00Z',
    updatedAt: '2025-12-08T11:00:00Z',
  },
  {
    _id: 'rider-006',
    firstName: 'Michael',
    lastName: 'Wafula',
    email: 'michael.wafula@rider.com',
    phone: '+254767890123',
    approvalStatus: 'banned',
    isActive: false,
    deliveriesCompleted: 78,
    deliveriesThisMonth: 0,
    deliveriesThisWeek: 0,
    collectionRate: 76.5,
    averageDeliveryTime: 45,
    rating: 3.2,
    walletBalance: -2500,
    totalEarnings: 35000,
    totalCollections: 180000,
    lastDeliveryAt: '2025-11-15T16:00:00Z',
    createdAt: '2024-08-15T08:00:00Z',
    updatedAt: '2025-11-20T10:00:00Z',
  },
  {
    _id: 'rider-007',
    firstName: 'Joseph',
    lastName: 'Otieno',
    email: 'joseph.otieno@rider.com',
    phone: '+254778901234',
    avatar: '/assets/images/avatar/avatar-7.webp',
    approvalStatus: 'approved',
    isActive: true,
    deliveriesCompleted: 203,
    deliveriesThisMonth: 41,
    deliveriesThisWeek: 11,
    collectionRate: 95.7,
    averageDeliveryTime: 29,
    rating: 4.7,
    walletBalance: 11800,
    totalEarnings: 108000,
    totalCollections: 720000,
    currentRouteId: 'route-004',
    currentRouteName: 'Lavington Route',
    lastDeliveryAt: '2025-12-08T10:15:00Z',
    createdAt: '2024-05-20T08:00:00Z',
    updatedAt: '2025-12-08T10:15:00Z',
  },
  {
    _id: 'rider-008',
    firstName: 'Brian',
    lastName: 'Mutua',
    email: 'brian.mutua@rider.com',
    phone: '+254789012345',
    approvalStatus: 'pending',
    isActive: false,
    deliveriesCompleted: 0,
    deliveriesThisMonth: 0,
    deliveriesThisWeek: 0,
    collectionRate: 0,
    averageDeliveryTime: 0,
    rating: 0,
    walletBalance: 0,
    totalEarnings: 0,
    totalCollections: 0,
    createdAt: '2025-12-07T09:00:00Z',
    updatedAt: '2025-12-07T09:00:00Z',
  },
  {
    _id: 'rider-009',
    firstName: 'Charles',
    lastName: 'Kimani',
    email: 'charles.kimani@rider.com',
    phone: '+254790123456',
    avatar: '/assets/images/avatar/avatar-9.webp',
    approvalStatus: 'approved',
    isActive: true,
    deliveriesCompleted: 167,
    deliveriesThisMonth: 33,
    deliveriesThisWeek: 8,
    collectionRate: 93.4,
    averageDeliveryTime: 31,
    rating: 4.5,
    walletBalance: 9400,
    totalEarnings: 86000,
    totalCollections: 560000,
    lastDeliveryAt: '2025-12-08T09:30:00Z',
    createdAt: '2024-07-01T08:00:00Z',
    updatedAt: '2025-12-08T09:30:00Z',
  },
  {
    _id: 'rider-010',
    firstName: 'Daniel',
    lastName: 'Okello',
    email: 'daniel.okello@rider.com',
    phone: '+254701234567',
    avatar: '/assets/images/avatar/avatar-10.webp',
    approvalStatus: 'approved',
    isActive: false,
    deliveriesCompleted: 98,
    deliveriesThisMonth: 18,
    deliveriesThisWeek: 4,
    collectionRate: 89.5,
    averageDeliveryTime: 38,
    rating: 4.1,
    walletBalance: 4200,
    totalEarnings: 52000,
    totalCollections: 320000,
    lastDeliveryAt: '2025-12-06T17:00:00Z',
    createdAt: '2024-10-15T08:00:00Z',
    updatedAt: '2025-12-06T17:00:00Z',
  },
  {
    _id: 'rider-011',
    firstName: 'Patrick',
    lastName: 'Wanyama',
    email: 'patrick.wanyama@rider.com',
    phone: '+254712098765',
    approvalStatus: 'pending',
    isActive: false,
    deliveriesCompleted: 0,
    deliveriesThisMonth: 0,
    deliveriesThisWeek: 0,
    collectionRate: 0,
    averageDeliveryTime: 0,
    rating: 0,
    walletBalance: 0,
    totalEarnings: 0,
    totalCollections: 0,
    createdAt: '2025-12-08T08:00:00Z',
    updatedAt: '2025-12-08T08:00:00Z',
  },
  {
    _id: 'rider-012',
    firstName: 'George',
    lastName: 'Omondi',
    email: 'george.omondi@rider.com',
    phone: '+254723098765',
    avatar: '/assets/images/avatar/avatar-12.webp',
    approvalStatus: 'approved',
    isActive: true,
    deliveriesCompleted: 278,
    deliveriesThisMonth: 48,
    deliveriesThisWeek: 13,
    collectionRate: 97.2,
    averageDeliveryTime: 26,
    rating: 4.85,
    walletBalance: 18900,
    totalEarnings: 142000,
    totalCollections: 980000,
    currentRouteId: 'route-005',
    currentRouteName: 'CBD Route',
    lastDeliveryAt: '2025-12-08T11:15:00Z',
    createdAt: '2024-04-01T08:00:00Z',
    updatedAt: '2025-12-08T11:15:00Z',
  },
];

export const MOCK_RIDER_WALLET_TRANSACTIONS: Record<string, MockRiderWalletTransaction[]> = {
  'rider-001': [
    { _id: 'tx-001', type: 'assignment', amount: 5000, description: 'Route assignment - Westlands Route A', balanceAfter: 20600, createdAt: '2025-12-08T06:00:00Z' },
    { _id: 'tx-002', type: 'collection', amount: -2500, description: 'Delivered to Shop ABC', balanceAfter: 18100, createdAt: '2025-12-08T08:30:00Z' },
    { _id: 'tx-003', type: 'collection', amount: -1800, description: 'Delivered to Shop XYZ', balanceAfter: 16300, createdAt: '2025-12-08T09:15:00Z' },
    { _id: 'tx-004', type: 'collection', amount: -700, description: 'Delivered to Shop DEF', balanceAfter: 15600, createdAt: '2025-12-08T10:30:00Z' },
  ],
  'rider-002': [
    { _id: 'tx-005', type: 'assignment', amount: 4500, description: 'Route assignment - Kilimani Route B', balanceAfter: 13400, createdAt: '2025-12-08T06:30:00Z' },
    { _id: 'tx-006', type: 'collection', amount: -3200, description: 'Delivered to Shop GHI', balanceAfter: 10200, createdAt: '2025-12-08T08:00:00Z' },
    { _id: 'tx-007', type: 'collection', amount: -1300, description: 'Delivered to Shop JKL', balanceAfter: 8900, createdAt: '2025-12-08T09:45:00Z' },
  ],
  'rider-003': [
    { _id: 'tx-008', type: 'settlement', amount: -15000, description: 'Weekly settlement', balanceAfter: 7400, createdAt: '2025-12-07T18:00:00Z' },
    { _id: 'tx-009', type: 'adjustment', amount: 15000, description: 'Settlement reversal - error correction', balanceAfter: 22400, createdAt: '2025-12-07T18:30:00Z' },
  ],
};

// Helper functions for mock data
export const getRiderStats = () => {
  const total = MOCK_RIDERS.length;
  const approved = MOCK_RIDERS.filter(r => r.approvalStatus === 'approved').length;
  const pending = MOCK_RIDERS.filter(r => r.approvalStatus === 'pending').length;
  const banned = MOCK_RIDERS.filter(r => r.approvalStatus === 'banned').length;
  const active = MOCK_RIDERS.filter(r => r.isActive).length;
  const totalDeliveries = MOCK_RIDERS.reduce((sum, r) => sum + r.deliveriesCompleted, 0);
  const totalCollections = MOCK_RIDERS.reduce((sum, r) => sum + r.totalCollections, 0);
  const avgCollectionRate = MOCK_RIDERS.filter(r => r.collectionRate > 0).reduce((sum, r) => sum + r.collectionRate, 0) / approved;

  return {
    total,
    approved,
    pending,
    banned,
    active,
    totalDeliveries,
    totalCollections,
    avgCollectionRate: Math.round(avgCollectionRate * 10) / 10,
  };
};
