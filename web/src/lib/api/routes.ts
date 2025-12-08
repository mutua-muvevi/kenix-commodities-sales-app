// src/lib/api/routes.ts
import apiClient from './client';

export interface RouteShop {
  shopId: string;
  sequenceNumber: number;
  estimatedArrivalTime?: string;
  notes?: string;
}

export interface CreateRouteData {
  routeName: string;
  description?: string;
  shops: RouteShop[];
  assignedRider?: string;
  startTime: string;
  endTime: string;
  operatingDays: string[];
}

export interface Route {
  _id: string;
  routeCode: string;
  routeName: string;
  description?: string;
  shops: Array<{
    shop: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      address: string;
      location: {
        type: string;
        coordinates: [number, number];
      };
    };
    sequenceNumber: number;
    estimatedArrivalTime?: string;
    notes?: string;
  }>;
  assignedRider?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  status: 'pending' | 'active' | 'in_progress' | 'completed' | 'cancelled';
  startTime: string;
  endTime: string;
  operatingDays: string[];
  currentShopIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface RouteListParams {
  page?: number;
  limit?: number;
  status?: string;
  riderId?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Create new route
 */
export const createRoute = async (data: CreateRouteData) => {
  const response = await apiClient.post('/routes', data);
  return response.data;
};

/**
 * Get list of routes
 */
export const getRoutes = async (params?: RouteListParams) => {
  const response = await apiClient.get('/routes', { params });
  return response.data;
};

/**
 * Get single route by ID
 */
export const getRoute = async (routeId: string) => {
  const response = await apiClient.get(`/routes/${routeId}`);
  return response.data;
};

/**
 * Get active route for rider
 */
export const getActiveRoute = async (riderId: string) => {
  const response = await apiClient.get(`/routes/rider/${riderId}/active`);
  return response.data;
};

/**
 * Assign rider to route
 */
export const assignRider = async (routeId: string, riderId: string) => {
  const response = await apiClient.patch(`/routes/${routeId}/assign-rider`, { riderId });
  return response.data;
};

/**
 * Update shop sequence
 */
export const updateShopSequence = async (routeId: string, shops: RouteShop[]) => {
  const response = await apiClient.patch(`/routes/${routeId}/shops`, { shops });
  return response.data;
};

/**
 * Override delivery sequence
 */
export const overrideSequence = async (
  routeId: string,
  currentShopId: string,
  nextShopId: string,
  reason: string
) => {
  const response = await apiClient.patch(`/routes/${routeId}/override-sequence`, {
    currentShopId,
    nextShopId,
    reason,
  });
  return response.data;
};

/**
 * Optimize route
 */
export const optimizeRoute = async (routeId: string) => {
  const response = await apiClient.post(`/routes/${routeId}/optimize`);
  return response.data;
};
