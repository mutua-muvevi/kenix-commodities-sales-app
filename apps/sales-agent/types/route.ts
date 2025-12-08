/**
 * Route Type Definitions
 * Defines types for routes, route optimization, and visit tracking
 */

import { Shop } from './shop';

export interface Route {
  _id: string;
  name: string;
  description?: string;
  shops: RouteShop[];
  status: RouteStatus;
  scheduledDate: string;
  estimatedDuration?: number; // minutes
  totalDistance?: number; // km
  assignedAgent: string;
  completedShops: number;
  totalShops: number;
  startedAt?: string;
  completedAt?: string;
  pausedAt?: string;
  resumedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RouteShop {
  shop: string | Shop;
  order: number;
  visitStatus: VisitStatus;
  visitedAt?: string;
  notes?: string;
  orderPlaced?: boolean;
  orderId?: string;
  checkInTime?: string;
  checkOutTime?: string;
  duration?: number; // minutes
  location?: {
    latitude: number;
    longitude: number;
  };
  distanceFromPrevious?: number; // km
}

export type RouteStatus =
  | 'planned'
  | 'in_progress'
  | 'paused'
  | 'completed'
  | 'cancelled'
  | 'expired';

export type VisitStatus =
  | 'pending'
  | 'visited'
  | 'skipped'
  | 'failed'
  | 'rescheduled';

export interface RouteListItem {
  _id: string;
  name: string;
  scheduledDate: string;
  status: RouteStatus;
  totalShops: number;
  completedShops: number;
  progress: number; // percentage
  estimatedDuration?: number;
  totalDistance?: number;
}

export interface RouteOptimization {
  originalRoute: RouteShop[];
  optimizedRoute: RouteShop[];
  distanceSaved: number; // km
  timeSaved: number; // minutes
  algorithm: 'nearest_neighbor' | 'genetic' | 'api_based';
}

export interface RouteProgress {
  routeId: string;
  currentShop?: RouteShop;
  nextShop?: RouteShop;
  completedShops: number;
  totalShops: number;
  percentage: number;
  timeElapsed: number; // minutes
  estimatedTimeRemaining: number; // minutes
}

export interface VisitLog {
  routeId: string;
  shopId: string;
  visitStatus: VisitStatus;
  checkInTime: string;
  checkOutTime?: string;
  duration?: number;
  orderPlaced: boolean;
  orderId?: string;
  notes?: string;
  photos?: string[];
  location: {
    latitude: number;
    longitude: number;
  };
  skippedReason?: string;
}

export interface RouteAssignment {
  routeId: string;
  agentId: string;
  assignedAt: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  deadline?: string;
  instructions?: string;
}

export interface GeoFence {
  shopId: string;
  latitude: number;
  longitude: number;
  radius: number; // meters
  isActive: boolean;
}

export interface CheckInData {
  routeId: string;
  shopId: string;
  location: {
    latitude: number;
    longitude: number;
  };
  timestamp: string;
  withinGeofence: boolean;
  distance?: number; // meters from shop
}

export interface CheckOutData {
  routeId: string;
  shopId: string;
  visitStatus: VisitStatus;
  orderPlaced: boolean;
  orderId?: string;
  notes?: string;
  photos?: string[];
  timestamp: string;
  duration: number; // minutes
}

export interface RouteMetrics {
  totalDistance: number;
  totalDuration: number;
  averageVisitDuration: number;
  shopsVisited: number;
  ordersPlaced: number;
  conversionRate: number; // percentage
  onTimeCompletion: boolean;
}
