// Sales Agent Approval Status
export type SalesAgentApprovalStatus = 'pending' | 'approved' | 'banned';

// Performance Metrics
export interface SalesAgentPerformance {
  orders: number;
  revenue: number;
  commission: number;
  shopRegistrations: number;
}

// Main Sales Agent Interface
export interface SalesAgent {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  approvalStatus: SalesAgentApprovalStatus;
  shopsRegistered: number;
  ordersPlaced: number;
  totalRevenue: number;
  totalCommission: number;
  commissionRate: number; // Percentage
  weeklyMetrics: SalesAgentPerformance;
  monthlyMetrics: SalesAgentPerformance;
  createdAt: Date;
  updatedAt: Date;
  banReason?: string;
  bannedAt?: Date;
}

// Overall Stats
export interface SalesAgentStats {
  totalAgents: number;
  approvedAgents: number;
  pendingAgents: number;
  bannedAgents: number;
  totalShopsRegistered: number;
  totalOrdersPlaced: number;
  totalRevenue: number;
  totalCommissionPaid: number;
  weeklyRevenue: number;
  weeklyCommission: number;
  monthlyRevenue: number;
  monthlyCommission: number;
}

// Filters
export interface SalesAgentFilters {
  approvalStatus?: SalesAgentApprovalStatus | 'all';
  search?: string;
  sortBy?: 'name' | 'revenue' | 'commission' | 'shops' | 'orders' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// API Response Types
export interface SalesAgentsResponse {
  success: boolean;
  data: {
    agents: SalesAgent[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface SalesAgentDetailResponse {
  success: boolean;
  data: {
    agent: SalesAgent;
    recentShops?: Array<{
      _id: string;
      name: string;
      registeredAt: Date;
    }>;
    recentOrders?: Array<{
      _id: string;
      shopName: string;
      amount: number;
      createdAt: Date;
    }>;
  };
}

export interface SalesAgentStatsResponse {
  success: boolean;
  data: SalesAgentStats;
}

// Action Response
export interface SalesAgentActionResponse {
  success: boolean;
  message: string;
  data?: {
    agent: SalesAgent;
  };
}
