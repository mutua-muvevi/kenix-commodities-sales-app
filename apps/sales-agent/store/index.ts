/**
 * Store Barrel Export
 * Central export point for all store modules
 */

// ========================
// MIDDLEWARE
// ========================
export { logger, conditionalLogger, actionLogger, errorLogger } from './middleware/logger';
export { secureStorage, asyncStorage, getStorageAdapter } from './middleware/persist';

// ========================
// STORES
// ========================
export { useAuthStore } from './slices/auth/auth-store';
export { useShopStore } from './slices/shop/shop-store';
export { useOrderStore } from './slices/order/order-store';
export { useRouteStore } from './slices/route/route-store';
export { useThemeStore, type ThemeMode } from './slices/theme/theme-store';
export { useNotificationStore } from './slices/notification/notification-store';
export { useCategoriesStore } from './slices/categories/categories-store';

// ========================
// HOOKS - AUTH
// ========================
export {
  useAuth,
  useUser,
  useToken,
  useIsAuthenticated,
  useAuthLoading,
  useAuthError,
  useLogin,
  useRegister,
  useLogout,
  useCheckAuth,
  useUserId,
  useUserRole,
  useUserApprovalStatus,
  useIsApproved,
} from './hooks/use-auth';

// ========================
// HOOKS - SHOP
// ========================
export {
  useShop,
  useShops,
  useFilteredShops,
  useSelectedShop,
  useShopLoading,
  useShopError,
  useShopFilter,
  useFetchShops,
  useRegisterShop,
  useSetSelectedShop,
  useSetShopFilter,
  useShopsCountByStatus,
  useApprovedShops,
  usePendingShops,
  useShopById,
} from './hooks/use-shop';

// ========================
// HOOKS - ORDER
// ========================
export {
  useOrder,
  useOrders,
  useCart,
  useSelectedOrder,
  useOrderLoading,
  useOrderError,
  useCartTotal,
  useCartItemCount,
  useCartActions,
  useOrderActions,
  useOfflineOrders,
  useOfflineOrderCount,
  useSyncOfflineOrders,
  useOrdersByStatus,
  useOrderCountsByStatus,
  useTodaysOrders,
  useIsCartEmpty,
  useCartItem,
} from './hooks/use-order';

// ========================
// HOOKS - ROUTE
// ========================
export {
  useRoute,
  useRoutes,
  useCurrentRoute,
  useSelectedRoute,
  useRouteLoading,
  useRouteError,
  useRouteActions,
  useRouteProgress,
  useCurrentShop,
  useNextShop,
  useRoutesByStatus,
  useRouteCountsByStatus,
  useTodaysRoutes,
  useIsRouteActive,
  useIsRoutePaused,
  useRouteById,
  useVisitLogs,
} from './hooks/use-route';

// ========================
// HOOKS - THEME
// ========================
export {
  useTheme,
  useThemeMode,
  useIsDark,
  useSetTheme,
  useToggleTheme,
  useSetIsDark,
  useIsLightMode,
  useIsDarkMode,
  useIsSystemTheme,
} from './hooks/use-theme';

// ========================
// HOOKS - NOTIFICATION
// ========================
export {
  useNotification,
  useNotifications,
  useUnreadCount,
  useNotificationLoading,
  useNotificationError,
  useNotificationActions,
  useUnreadNotifications,
  useReadNotifications,
  useNotificationsByType,
  useNotificationsByPriority,
  useUrgentNotifications,
  useHighPriorityNotifications,
  useNotificationCountByType,
  useHasUnreadNotifications,
  useTodaysNotifications,
} from './hooks/use-notification';

// ========================
// MOCK DATA
// ========================
export {
  mockUser,
  mockShops,
  mockOrders,
  mockRoutes,
  mockProducts,
  mockNotifications,
} from './data/mock-data';

// Default export for convenience
export { default as mockData } from './data/mock-data';
