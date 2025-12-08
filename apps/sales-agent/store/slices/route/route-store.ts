/**
 * Route Store Slice
 * Manages route data, navigation, and visit tracking
 */

import { create } from 'zustand';
import { Route, RouteStatus, VisitLog, CheckInData, CheckOutData } from '../../../types/route';
import { actionLogger, errorLogger } from '../../middleware/logger';
import apiService from '../../../services/api';

interface RouteState {
  // State
  routes: Route[];
  currentRoute: Route | null;
  selectedRoute: Route | null;
  visitLogs: VisitLog[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchRoutes: (agentId: string, status?: RouteStatus) => Promise<void>;
  fetchRouteById: (routeId: string) => Promise<Route>;
  fetchTodaysRoute: (agentId: string) => Promise<Route | null>;
  setCurrentRoute: (route: Route | null) => void;
  setSelectedRoute: (route: Route | null) => void;
  startRoute: (routeId: string) => Promise<void>;
  pauseRoute: (routeId: string) => Promise<void>;
  resumeRoute: (routeId: string) => Promise<void>;
  completeRoute: (routeId: string) => Promise<void>;
  checkInShop: (checkInData: CheckInData) => Promise<void>;
  checkOutShop: (checkOutData: CheckOutData) => Promise<void>;
  updateRouteProgress: (routeId: string, shopId: string, updates: any) => void;
  getRouteProgress: () => number;
  getCurrentShop: () => any;
  getNextShop: () => any;
  clearError: () => void;
  refreshRoutes: (agentId: string) => Promise<void>;
}

export const useRouteStore = create<RouteState>((set, get) => ({
  // Initial State
  routes: [],
  currentRoute: null,
  selectedRoute: null,
  visitLogs: [],
  isLoading: false,
  error: null,

  // Fetch Routes
  fetchRoutes: async (agentId: string, status?: RouteStatus) => {
    actionLogger('RouteStore', 'fetchRoutes', { agentId, status });
    try {
      set({ isLoading: true, error: null });

      const routes = await apiService.getRoutes(agentId, status);

      set({
        routes,
        isLoading: false,
        error: null,
      });

      actionLogger('RouteStore', 'fetchRoutes', `Loaded ${routes.length} routes`);
    } catch (error: any) {
      errorLogger('RouteStore', 'fetchRoutes', error);
      set({
        error: error.response?.data?.message || error.message || 'Failed to fetch routes',
        isLoading: false,
      });
      throw error;
    }
  },

  // Fetch Route By ID
  fetchRouteById: async (routeId: string) => {
    actionLogger('RouteStore', 'fetchRouteById', routeId);
    try {
      set({ isLoading: true, error: null });

      const route = await apiService.getRouteById(routeId);

      // Update route in list if exists
      const { routes } = get();
      const updatedRoutes = routes.map((r) => (r._id === routeId ? route : r));

      set({
        routes: updatedRoutes,
        selectedRoute: route,
        isLoading: false,
        error: null,
      });

      actionLogger('RouteStore', 'fetchRouteById', 'Success');
      return route;
    } catch (error: any) {
      errorLogger('RouteStore', 'fetchRouteById', error);
      set({
        error: error.response?.data?.message || error.message || 'Failed to fetch route',
        isLoading: false,
      });
      throw error;
    }
  },

  // Fetch Today's Route
  fetchTodaysRoute: async (agentId: string) => {
    actionLogger('RouteStore', 'fetchTodaysRoute', agentId);
    try {
      set({ isLoading: true, error: null });

      const today = new Date().toISOString().split('T')[0];
      const routes = await apiService.getRoutes(agentId, 'planned');

      const todaysRoute = routes.find(
        (route: Route) => route.scheduledDate.split('T')[0] === today
      );

      set({
        currentRoute: todaysRoute || null,
        isLoading: false,
        error: null,
      });

      actionLogger('RouteStore', 'fetchTodaysRoute', todaysRoute ? 'Found' : 'Not found');
      return todaysRoute || null;
    } catch (error: any) {
      errorLogger('RouteStore', 'fetchTodaysRoute', error);
      set({
        error: error.response?.data?.message || error.message || "Failed to fetch today's route",
        isLoading: false,
      });
      throw error;
    }
  },

  // Set Current Route
  setCurrentRoute: (route: Route | null) => {
    actionLogger('RouteStore', 'setCurrentRoute', route?._id);
    set({ currentRoute: route });
  },

  // Set Selected Route
  setSelectedRoute: (route: Route | null) => {
    actionLogger('RouteStore', 'setSelectedRoute', route?._id);
    set({ selectedRoute: route });
  },

  // Start Route
  startRoute: async (routeId: string) => {
    actionLogger('RouteStore', 'startRoute', routeId);
    try {
      set({ isLoading: true, error: null });

      const route = await apiService.startRoute(routeId);

      // Update route in list and set as current
      const { routes } = get();
      const updatedRoutes = routes.map((r) => (r._id === routeId ? route : r));

      set({
        routes: updatedRoutes,
        currentRoute: route,
        isLoading: false,
        error: null,
      });

      actionLogger('RouteStore', 'startRoute', 'Success');
    } catch (error: any) {
      errorLogger('RouteStore', 'startRoute', error);
      set({
        error: error.response?.data?.message || error.message || 'Failed to start route',
        isLoading: false,
      });
      throw error;
    }
  },

  // Pause Route
  pauseRoute: async (routeId: string) => {
    actionLogger('RouteStore', 'pauseRoute', routeId);
    try {
      set({ isLoading: true, error: null });

      const route = await apiService.pauseRoute(routeId);

      // Update route
      const { routes, currentRoute } = get();
      const updatedRoutes = routes.map((r) => (r._id === routeId ? route : r));

      set({
        routes: updatedRoutes,
        currentRoute: currentRoute?._id === routeId ? route : currentRoute,
        isLoading: false,
        error: null,
      });

      actionLogger('RouteStore', 'pauseRoute', 'Success');
    } catch (error: any) {
      errorLogger('RouteStore', 'pauseRoute', error);
      set({
        error: error.response?.data?.message || error.message || 'Failed to pause route',
        isLoading: false,
      });
      throw error;
    }
  },

  // Resume Route
  resumeRoute: async (routeId: string) => {
    actionLogger('RouteStore', 'resumeRoute', routeId);
    try {
      set({ isLoading: true, error: null });

      const route = await apiService.resumeRoute(routeId);

      // Update route
      const { routes, currentRoute } = get();
      const updatedRoutes = routes.map((r) => (r._id === routeId ? route : r));

      set({
        routes: updatedRoutes,
        currentRoute: currentRoute?._id === routeId ? route : currentRoute,
        isLoading: false,
        error: null,
      });

      actionLogger('RouteStore', 'resumeRoute', 'Success');
    } catch (error: any) {
      errorLogger('RouteStore', 'resumeRoute', error);
      set({
        error: error.response?.data?.message || error.message || 'Failed to resume route',
        isLoading: false,
      });
      throw error;
    }
  },

  // Complete Route
  completeRoute: async (routeId: string) => {
    actionLogger('RouteStore', 'completeRoute', routeId);
    try {
      set({ isLoading: true, error: null });

      const route = await apiService.completeRoute(routeId);

      // Update route
      const { routes } = get();
      const updatedRoutes = routes.map((r) => (r._id === routeId ? route : r));

      set({
        routes: updatedRoutes,
        currentRoute: null, // Clear current route
        isLoading: false,
        error: null,
      });

      actionLogger('RouteStore', 'completeRoute', 'Success');
    } catch (error: any) {
      errorLogger('RouteStore', 'completeRoute', error);
      set({
        error: error.response?.data?.message || error.message || 'Failed to complete route',
        isLoading: false,
      });
      throw error;
    }
  },

  // Check In Shop
  checkInShop: async (checkInData: CheckInData) => {
    actionLogger('RouteStore', 'checkInShop', checkInData);
    try {
      set({ isLoading: true, error: null });

      const visitLog = await apiService.checkInShop(checkInData);

      // Add to visit logs
      const { visitLogs } = get();
      set({
        visitLogs: [visitLog, ...visitLogs],
        isLoading: false,
        error: null,
      });

      // Update route progress
      get().updateRouteProgress(checkInData.routeId, checkInData.shopId, {
        visitStatus: 'visited',
        checkInTime: checkInData.timestamp,
      });

      actionLogger('RouteStore', 'checkInShop', 'Success');
    } catch (error: any) {
      errorLogger('RouteStore', 'checkInShop', error);
      set({
        error: error.response?.data?.message || error.message || 'Failed to check in',
        isLoading: false,
      });
      throw error;
    }
  },

  // Check Out Shop
  checkOutShop: async (checkOutData: CheckOutData) => {
    actionLogger('RouteStore', 'checkOutShop', checkOutData);
    try {
      set({ isLoading: true, error: null });

      await apiService.checkOutShop(checkOutData);

      // Update route progress
      get().updateRouteProgress(checkOutData.routeId, checkOutData.shopId, {
        visitStatus: checkOutData.visitStatus,
        checkOutTime: checkOutData.timestamp,
        duration: checkOutData.duration,
        orderPlaced: checkOutData.orderPlaced,
        orderId: checkOutData.orderId,
        notes: checkOutData.notes,
      });

      set({
        isLoading: false,
        error: null,
      });

      actionLogger('RouteStore', 'checkOutShop', 'Success');
    } catch (error: any) {
      errorLogger('RouteStore', 'checkOutShop', error);
      set({
        error: error.response?.data?.message || error.message || 'Failed to check out',
        isLoading: false,
      });
      throw error;
    }
  },

  // Update Route Progress
  updateRouteProgress: (routeId: string, shopId: string, updates: any) => {
    actionLogger('RouteStore', 'updateRouteProgress', { routeId, shopId, updates });

    const { routes, currentRoute } = get();

    const updateRouteShops = (route: Route) => {
      return {
        ...route,
        shops: route.shops.map((shop: any) =>
          shop.shop === shopId || shop.shop._id === shopId
            ? { ...shop, ...updates }
            : shop
        ),
        completedShops: route.shops.filter(
          (shop: any) => shop.visitStatus === 'visited'
        ).length,
      };
    };

    const updatedRoutes = routes.map((r) =>
      r._id === routeId ? updateRouteShops(r) : r
    );

    set({
      routes: updatedRoutes,
      currentRoute:
        currentRoute?._id === routeId ? updateRouteShops(currentRoute) : currentRoute,
    });
  },

  // Get Route Progress
  getRouteProgress: () => {
    const { currentRoute } = get();
    if (!currentRoute || currentRoute.totalShops === 0) return 0;
    return (currentRoute.completedShops / currentRoute.totalShops) * 100;
  },

  // Get Current Shop
  getCurrentShop: () => {
    const { currentRoute } = get();
    if (!currentRoute) return null;

    return currentRoute.shops.find((shop: any) => shop.visitStatus === 'pending');
  },

  // Get Next Shop
  getNextShop: () => {
    const { currentRoute } = get();
    if (!currentRoute) return null;

    const pendingShops = currentRoute.shops.filter(
      (shop: any) => shop.visitStatus === 'pending'
    );
    return pendingShops[1] || null; // Second pending shop
  },

  // Clear Error
  clearError: () => {
    set({ error: null });
  },

  // Refresh Routes
  refreshRoutes: async (agentId: string) => {
    actionLogger('RouteStore', 'refreshRoutes', agentId);
    await get().fetchRoutes(agentId);
  },
}));
