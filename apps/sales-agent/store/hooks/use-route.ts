/**
 * Route Store Hooks
 * Custom hooks for accessing route state and actions
 */

import { useRouteStore } from '../slices/route/route-store';
import { Route, RouteStatus } from '../../types/route';

/**
 * Get entire route state
 */
export const useRoute = () => useRouteStore((state) => state);

/**
 * Get all routes
 */
export const useRoutes = (): Route[] => useRouteStore((state) => state.routes);

/**
 * Get current route (today's route)
 */
export const useCurrentRoute = (): Route | null => useRouteStore((state) => state.currentRoute);

/**
 * Get selected route
 */
export const useSelectedRoute = (): Route | null => useRouteStore((state) => state.selectedRoute);

/**
 * Get route loading state
 */
export const useRouteLoading = (): boolean => useRouteStore((state) => state.isLoading);

/**
 * Get route error
 */
export const useRouteError = (): string | null => useRouteStore((state) => state.error);

/**
 * Get route actions
 */
export const useRouteActions = () => ({
  fetchRoutes: useRouteStore((state) => state.fetchRoutes),
  fetchRouteById: useRouteStore((state) => state.fetchRouteById),
  fetchTodaysRoute: useRouteStore((state) => state.fetchTodaysRoute),
  setCurrentRoute: useRouteStore((state) => state.setCurrentRoute),
  setSelectedRoute: useRouteStore((state) => state.setSelectedRoute),
  startRoute: useRouteStore((state) => state.startRoute),
  pauseRoute: useRouteStore((state) => state.pauseRoute),
  resumeRoute: useRouteStore((state) => state.resumeRoute),
  completeRoute: useRouteStore((state) => state.completeRoute),
  checkInShop: useRouteStore((state) => state.checkInShop),
  checkOutShop: useRouteStore((state) => state.checkOutShop),
  refreshRoutes: useRouteStore((state) => state.refreshRoutes),
});

/**
 * Get route progress percentage
 */
export const useRouteProgress = (): number => {
  const getRouteProgress = useRouteStore((state) => state.getRouteProgress);
  return getRouteProgress();
};

/**
 * Get current shop in route
 */
export const useCurrentShop = () => {
  const getCurrentShop = useRouteStore((state) => state.getCurrentShop);
  return getCurrentShop();
};

/**
 * Get next shop in route
 */
export const useNextShop = () => {
  const getNextShop = useRouteStore((state) => state.getNextShop);
  return getNextShop();
};

/**
 * Get routes by status
 */
export const useRoutesByStatus = (status: RouteStatus): Route[] => {
  const routes = useRouteStore((state) => state.routes);
  return routes.filter((r) => r.status === status);
};

/**
 * Get route counts by status
 */
export const useRouteCountsByStatus = () => {
  const routes = useRouteStore((state) => state.routes);

  return {
    total: routes.length,
    planned: routes.filter((r) => r.status === 'planned').length,
    inProgress: routes.filter((r) => r.status === 'in_progress').length,
    paused: routes.filter((r) => r.status === 'paused').length,
    completed: routes.filter((r) => r.status === 'completed').length,
    cancelled: routes.filter((r) => r.status === 'cancelled').length,
  };
};

/**
 * Get today's routes
 */
export const useTodaysRoutes = (): Route[] => {
  const routes = useRouteStore((state) => state.routes);
  const today = new Date().toISOString().split('T')[0];
  return routes.filter((r) => r.scheduledDate.split('T')[0] === today);
};

/**
 * Check if route is active
 */
export const useIsRouteActive = (): boolean => {
  const currentRoute = useRouteStore((state) => state.currentRoute);
  return currentRoute?.status === 'in_progress';
};

/**
 * Check if route is paused
 */
export const useIsRoutePaused = (): boolean => {
  const currentRoute = useRouteStore((state) => state.currentRoute);
  return currentRoute?.status === 'paused';
};

/**
 * Get route by ID
 */
export const useRouteById = (routeId: string): Route | undefined => {
  const routes = useRouteStore((state) => state.routes);
  return routes.find((r) => r._id === routeId);
};

/**
 * Get visit logs
 */
export const useVisitLogs = () => useRouteStore((state) => state.visitLogs);
