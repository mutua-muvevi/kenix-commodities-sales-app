import { _salesAgents, getSalesAgentStats } from '@/_mock/_sales-agents';
import type {
  SalesAgent,
  SalesAgentFilters,
  SalesAgentsResponse,
  SalesAgentDetailResponse,
  SalesAgentStatsResponse,
  SalesAgentActionResponse,
} from '@/types/sales-agent';

// Simulate API delay
const delay = (ms: number = 500) => new Promise((resolve) => setTimeout(resolve, ms));

// Get all sales agents with optional filters
export async function getSalesAgents(
  filters?: SalesAgentFilters
): Promise<SalesAgentsResponse> {
  await delay();

  let filteredAgents = [..._salesAgents];

  // Apply status filter
  if (filters?.approvalStatus && filters.approvalStatus !== 'all') {
    filteredAgents = filteredAgents.filter(
      (agent) => agent.approvalStatus === filters.approvalStatus
    );
  }

  // Apply search filter
  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    filteredAgents = filteredAgents.filter(
      (agent) =>
        agent.firstName.toLowerCase().includes(searchLower) ||
        agent.lastName.toLowerCase().includes(searchLower) ||
        agent.email.toLowerCase().includes(searchLower) ||
        agent.phone.includes(searchLower)
    );
  }

  // Apply sorting
  if (filters?.sortBy) {
    filteredAgents.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (filters.sortBy) {
        case 'name':
          aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
          bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
          break;
        case 'revenue':
          aValue = a.totalRevenue;
          bValue = b.totalRevenue;
          break;
        case 'commission':
          aValue = a.totalCommission;
          bValue = b.totalCommission;
          break;
        case 'shops':
          aValue = a.shopsRegistered;
          bValue = b.shopsRegistered;
          break;
        case 'orders':
          aValue = a.ordersPlaced;
          bValue = b.ordersPlaced;
          break;
        case 'createdAt':
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }

  return {
    success: true,
    data: {
      agents: filteredAgents,
      total: filteredAgents.length,
      page: 1,
      limit: filteredAgents.length,
    },
  };
}

// Get single sales agent by ID
export async function getSalesAgent(id: string): Promise<SalesAgent | null> {
  await delay();

  const agent = _salesAgents.find((a) => a._id === id);
  return agent || null;
}

// Get sales agent detail with additional information
export async function getSalesAgentDetail(id: string): Promise<SalesAgentDetailResponse> {
  await delay();

  const agent = _salesAgents.find((a) => a._id === id);

  if (!agent) {
    throw new Error('Sales agent not found');
  }

  // Mock recent shops
  const recentShops = Array.from({ length: 5 }, (_, i) => ({
    _id: `shop-${agent._id}-${i}`,
    name: `Shop ${i + 1} - ${agent.firstName}`,
    registeredAt: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000),
  }));

  // Mock recent orders
  const recentOrders = Array.from({ length: 10 }, (_, i) => ({
    _id: `order-${agent._id}-${i}`,
    shopName: `Shop ${(i % 5) + 1}`,
    amount: Math.floor(Math.random() * 500000) + 50000,
    createdAt: new Date(Date.now() - i * 2 * 24 * 60 * 60 * 1000),
  }));

  return {
    success: true,
    data: {
      agent,
      recentShops,
      recentOrders,
    },
  };
}

// Get overall sales agent stats
export async function getSalesAgentStatsApi(): Promise<SalesAgentStatsResponse> {
  await delay();

  const stats = getSalesAgentStats();

  return {
    success: true,
    data: stats,
  };
}

// Approve a sales agent
export async function approveSalesAgent(id: string): Promise<SalesAgentActionResponse> {
  await delay();

  const agentIndex = _salesAgents.findIndex((a) => a._id === id);

  if (agentIndex === -1) {
    throw new Error('Sales agent not found');
  }

  if (_salesAgents[agentIndex].approvalStatus === 'approved') {
    return {
      success: false,
      message: 'Agent is already approved',
    };
  }

  // Update agent status
  _salesAgents[agentIndex] = {
    ..._salesAgents[agentIndex],
    approvalStatus: 'approved',
    updatedAt: new Date(),
  };

  return {
    success: true,
    message: 'Sales agent approved successfully',
    data: {
      agent: _salesAgents[agentIndex],
    },
  };
}

// Ban a sales agent
export async function banSalesAgent(
  id: string,
  reason: string
): Promise<SalesAgentActionResponse> {
  await delay();

  const agentIndex = _salesAgents.findIndex((a) => a._id === id);

  if (agentIndex === -1) {
    throw new Error('Sales agent not found');
  }

  if (_salesAgents[agentIndex].approvalStatus === 'banned') {
    return {
      success: false,
      message: 'Agent is already banned',
    };
  }

  // Update agent status
  _salesAgents[agentIndex] = {
    ..._salesAgents[agentIndex],
    approvalStatus: 'banned',
    banReason: reason,
    bannedAt: new Date(),
    updatedAt: new Date(),
  };

  return {
    success: true,
    message: 'Sales agent banned successfully',
    data: {
      agent: _salesAgents[agentIndex],
    },
  };
}

// Unban a sales agent
export async function unbanSalesAgent(id: string): Promise<SalesAgentActionResponse> {
  await delay();

  const agentIndex = _salesAgents.findIndex((a) => a._id === id);

  if (agentIndex === -1) {
    throw new Error('Sales agent not found');
  }

  if (_salesAgents[agentIndex].approvalStatus !== 'banned') {
    return {
      success: false,
      message: 'Agent is not currently banned',
    };
  }

  // Update agent status
  _salesAgents[agentIndex] = {
    ..._salesAgents[agentIndex],
    approvalStatus: 'pending',
    banReason: undefined,
    bannedAt: undefined,
    updatedAt: new Date(),
  };

  return {
    success: true,
    message: 'Sales agent unbanned successfully. Status set to pending for review.',
    data: {
      agent: _salesAgents[agentIndex],
    },
  };
}
