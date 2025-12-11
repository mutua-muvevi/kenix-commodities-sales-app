import { create } from 'zustand';
import Toast from 'react-native-toast-message';
import { routeService, deliveryService, walletService } from '../services/api';
import { websocketService } from '../services/websocket';
import {
  cacheActiveRoute,
  getCachedRoute,
  queueOfflineAction,
  clearCachedRoute,
} from '../services/offline';
import {
  setActiveRouteForMonitoring,
  clearActiveRouteMonitoring,
  checkDeviationStatus,
} from '../services/location';
import {
  buildRoutePolyline,
  type RoutePoint,
  type DeviationStatus,
} from '../services/deviation';
import { useNetworkStore } from './networkStore';
import type { Route, Delivery, Wallet } from '../types';

// WebSocket event listeners for real-time updates
let websocketInitialized = false;
let deviationCheckInterval: NodeJS.Timeout | null = null;

interface RouteState {
  activeRoute: Route | null;
  currentDelivery: Delivery | null;
  wallet: Wallet | null;
  isLoading: boolean;
  error: string | null;

  // Deviation monitoring state
  deviationStatus: DeviationStatus | null;
  isDeviationMonitoring: boolean;

  // Actions
  loadActiveRoute: (riderId: string) => Promise<void>;
  loadCurrentDelivery: () => Promise<void>;
  loadWallet: (riderId: string) => Promise<void>;
  markArrival: (deliveryId: string, location: { lat: number; lng: number }) => Promise<void>;
  completeDelivery: (
    deliveryId: string,
    data: {
      paymentMethod: 'mpesa' | 'cash' | 'airtel';
      signature: string;
      photo: string;
      notes?: string;
      location: { lat: number; lng: number };
    }
  ) => Promise<void>;
  refreshRoute: (riderId: string) => Promise<void>;
  clearError: () => void;
  initializeWebSocketListeners: (riderId: string) => void;
  cleanupWebSocketListeners: () => void;

  // Deviation monitoring actions
  startDeviationMonitoring: (riderId: string, riderName: string) => void;
  stopDeviationMonitoring: () => void;
  updateDeviationStatus: (status: DeviationStatus | null) => void;
}

export const useRouteStore = create<RouteState>((set, get) => ({
  activeRoute: null,
  currentDelivery: null,
  wallet: null,
  isLoading: false,
  error: null,
  deviationStatus: null,
  isDeviationMonitoring: false,

  loadActiveRoute: async (riderId: string) => {
    set({ isLoading: true, error: null });

    const { isOnline } = useNetworkStore.getState();

    try {
      if (isOnline) {
        // Online: fetch from API and cache
        const route = await routeService.getActiveRoute(riderId);
        set({ activeRoute: route, isLoading: false });

        // Cache the route for offline use
        if (route) {
          await cacheActiveRoute(route);
          const currentDelivery = await routeService.getCurrentDelivery(route._id);
          set({ currentDelivery });

          // Update deviation monitoring with new route
          if (get().isDeviationMonitoring) {
            const { activeRoute } = get();
            if (activeRoute) {
              const remainingDeliveries = activeRoute.deliveries.filter(
                (d) => d.status !== 'completed' && d.status !== 'failed'
              );
              const remainingShops = remainingDeliveries.map((d) => d.shopId);

              // Get current location and build route
              const location = await import('../services/location').then(m => m.getCurrentLocation());
              if (location) {
                const routePolyline = buildRoutePolyline(location, remainingShops);
                const user = await import('../store/authStore').then(m => m.useAuthStore.getState().user);
                if (user) {
                  setActiveRouteForMonitoring(
                    riderId,
                    `${user.name}`,
                    activeRoute._id,
                    routePolyline
                  );
                }
              }
            }
          }
        } else {
          await clearCachedRoute();
          get().stopDeviationMonitoring();
        }
      } else {
        // Offline: load from cache
        const cachedRoute = await getCachedRoute();
        if (cachedRoute) {
          set({ activeRoute: cachedRoute, isLoading: false });
          // Find current delivery from cached route
          const currentDelivery = cachedRoute.deliveries.find(
            (d) => d.status !== 'completed' && d.status !== 'failed'
          ) || null;
          set({ currentDelivery });

          Toast.show({
            type: 'info',
            text1: 'Offline Mode',
            text2: 'Showing cached route data',
          });
        } else {
          set({
            error: 'No cached data available offline',
            isLoading: false,
          });
        }
      }
    } catch (error: any) {
      console.error('Load active route error:', error);

      // Try to load from cache on network error
      const cachedRoute = await getCachedRoute();
      if (cachedRoute) {
        set({ activeRoute: cachedRoute, isLoading: false });
        const currentDelivery = cachedRoute.deliveries.find(
          (d) => d.status !== 'completed' && d.status !== 'failed'
        ) || null;
        set({ currentDelivery });

        Toast.show({
          type: 'warning',
          text1: 'Connection Error',
          text2: 'Showing cached data',
        });
      } else {
        set({
          error: error.response?.data?.message || 'Failed to load active route',
          isLoading: false,
        });
      }
    }
  },

  loadCurrentDelivery: async () => {
    const { activeRoute } = get();
    if (!activeRoute) return;

    try {
      const currentDelivery = await routeService.getCurrentDelivery(activeRoute._id);
      set({ currentDelivery });
    } catch (error: any) {
      console.error('Load current delivery error:', error);
      set({
        error: error.response?.data?.message || 'Failed to load current delivery',
      });
    }
  },

  loadWallet: async (riderId: string) => {
    try {
      const wallet = await walletService.getWallet(riderId);
      set({ wallet });
    } catch (error: any) {
      console.error('Load wallet error:', error);
      set({
        error: error.response?.data?.message || 'Failed to load wallet',
      });
    }
  },

  markArrival: async (deliveryId: string, location: { lat: number; lng: number }) => {
    set({ isLoading: true, error: null });

    const { isOnline } = useNetworkStore.getState();

    try {
      if (isOnline) {
        const updatedDelivery = await deliveryService.markArrival(deliveryId, location);

        // Update current delivery
        set({ currentDelivery: updatedDelivery, isLoading: false });

        // Emit WebSocket event
        websocketService.emitDeliveryStatus(deliveryId, 'arrived');

        Toast.show({
          type: 'success',
          text1: 'Arrival Marked',
          text2: 'You can now proceed with the delivery',
        });
      } else {
        // Queue for later when offline
        await queueOfflineAction({ type: 'mark_arrival', payload: { deliveryId, location } });

        // Optimistically update local state
        const { currentDelivery } = get();
        if (currentDelivery && currentDelivery._id === deliveryId) {
          set({
            currentDelivery: { ...currentDelivery, status: 'arrived' },
            isLoading: false,
          });
        }

        Toast.show({
          type: 'warning',
          text1: 'Queued Offline',
          text2: 'Arrival will sync when back online',
        });
      }
    } catch (error: any) {
      console.error('Mark arrival error:', error);

      // Queue on network error
      await queueOfflineAction({ type: 'mark_arrival', payload: { deliveryId, location } });

      Toast.show({
        type: 'warning',
        text1: 'Action Queued',
        text2: 'Will sync when connection restored',
      });

      set({
        error: error.response?.data?.message || 'Failed to mark arrival',
        isLoading: false,
      });
      throw error;
    }
  },

  completeDelivery: async (
    deliveryId: string,
    data: {
      paymentMethod: 'mpesa' | 'cash' | 'airtel';
      signature: string;
      photo: string;
      notes?: string;
      location: { lat: number; lng: number };
    }
  ) => {
    set({ isLoading: true, error: null });

    const { isOnline } = useNetworkStore.getState();

    try {
      if (isOnline) {
        const updatedDelivery = await deliveryService.completeDelivery(deliveryId, data);

        // Update current delivery
        set({ currentDelivery: updatedDelivery, isLoading: false });

        // Emit WebSocket event
        websocketService.emitDeliveryStatus(deliveryId, 'completed');

        Toast.show({
          type: 'success',
          text1: 'Delivery Completed',
          text2: 'Moving to next stop...',
        });

        // Reload route and wallet to get updated data
        const { activeRoute } = get();
        if (activeRoute) {
          const riderId = activeRoute.riderId;
          await get().loadActiveRoute(riderId);
          await get().loadWallet(riderId);
        }
      } else {
        // Queue for later when offline
        await queueOfflineAction({ type: 'complete_delivery', payload: { deliveryId, data } });

        // Optimistically update local state
        const { currentDelivery, activeRoute } = get();
        if (currentDelivery && currentDelivery._id === deliveryId) {
          set({
            currentDelivery: { ...currentDelivery, status: 'completed' },
            isLoading: false,
          });
        }

        Toast.show({
          type: 'warning',
          text1: 'Queued Offline',
          text2: 'Completion will sync when back online',
        });
      }
    } catch (error: any) {
      console.error('Complete delivery error:', error);

      // Queue on network error
      await queueOfflineAction({ type: 'complete_delivery', payload: { deliveryId, data } });

      Toast.show({
        type: 'warning',
        text1: 'Action Queued',
        text2: 'Will sync when connection restored',
      });

      set({
        error: error.response?.data?.message || 'Failed to complete delivery',
        isLoading: false,
      });
      throw error;
    }
  },

  refreshRoute: async (riderId: string) => {
    try {
      await get().loadActiveRoute(riderId);
      await get().loadWallet(riderId);
    } catch (error: any) {
      console.error('Refresh route error:', error);
    }
  },

  clearError: () => set({ error: null }),

  // Initialize WebSocket listeners
  initializeWebSocketListeners: (riderId: string) => {
    if (websocketInitialized) return;

    // Listen for route updates
    websocketService.on('route:updated', async () => {
      console.log('Route updated via WebSocket, refreshing...');
      await get().loadActiveRoute(riderId);
    });

    // Listen for route assignments
    websocketService.on('route:assigned', async (data: any) => {
      console.log('New route assigned via WebSocket, refreshing...');
      await get().loadActiveRoute(riderId);

      Toast.show({
        type: 'info',
        text1: 'New Route Assigned',
        text2: data?.message || 'You have a new delivery route!',
      });
    });

    // Listen for delivery status changes
    websocketService.on('delivery:status-changed', async (data: any) => {
      console.log('Delivery status changed via WebSocket:', data);
      await get().loadActiveRoute(riderId);
    });

    // Listen for wallet updates
    websocketService.on('wallet:updated', async () => {
      console.log('Wallet updated via WebSocket, refreshing...');
      await get().loadWallet(riderId);
    });

    // Listen for payment confirmations
    websocketService.on('payment:confirmed', async (data: any) => {
      console.log('Payment confirmed via WebSocket:', data);
      await get().loadActiveRoute(riderId);
      await get().loadWallet(riderId);

      Toast.show({
        type: 'success',
        text1: 'Payment Confirmed',
        text2: `KES ${data?.amount?.toLocaleString() || ''} payment received`,
      });
    });

    // Listen for payment failures
    websocketService.on('payment:failed', async (data: any) => {
      console.log('Payment failed via WebSocket:', data);

      Toast.show({
        type: 'error',
        text1: 'Payment Failed',
        text2: data?.message || 'Please try again or use cash',
      });
    });

    // Listen for admin shop unlock
    websocketService.on('admin:shop-unlocked', async (data: any) => {
      console.log('Shop unlocked by admin via WebSocket:', data);
      await get().loadActiveRoute(riderId);

      Toast.show({
        type: 'success',
        text1: 'Shop Unlocked',
        text2: data?.message || 'Admin has unlocked this shop for you',
      });
    });

    websocketInitialized = true;
  },

  // Cleanup WebSocket listeners
  cleanupWebSocketListeners: () => {
    websocketService.off('route:updated', () => {});
    websocketService.off('route:assigned', () => {});
    websocketService.off('delivery:status-changed', () => {});
    websocketService.off('wallet:updated', () => {});
    websocketService.off('payment:confirmed', () => {});
    websocketService.off('payment:failed', () => {});
    websocketService.off('admin:shop-unlocked', () => {});
    websocketInitialized = false;
  },

  // Start deviation monitoring
  startDeviationMonitoring: (riderId: string, riderName: string) => {
    const { activeRoute, isDeviationMonitoring } = get();

    if (isDeviationMonitoring || !activeRoute) return;

    console.log('Starting deviation monitoring...');

    // Build expected route from remaining deliveries
    const remainingDeliveries = activeRoute.deliveries.filter(
      (d) => d.status !== 'completed' && d.status !== 'failed'
    );

    if (remainingDeliveries.length === 0) {
      console.log('No remaining deliveries, skipping deviation monitoring');
      return;
    }

    // Get remaining shops
    const remainingShops = remainingDeliveries.map((d) => d.shopId);

    // Start periodic deviation checks
    deviationCheckInterval = setInterval(async () => {
      try {
        const status = await checkDeviationStatus();
        if (status) {
          set({ deviationStatus: status });
        }
      } catch (error) {
        console.error('Deviation check error:', error);
      }
    }, 10000); // Check every 10 seconds

    // Initialize route monitoring in location service
    import('../services/location').then(async (m) => {
      const location = await m.getCurrentLocation();
      if (location) {
        const routePolyline = buildRoutePolyline(location, remainingShops);
        setActiveRouteForMonitoring(riderId, riderName, activeRoute._id, routePolyline);
      }
    });

    set({ isDeviationMonitoring: true });

    Toast.show({
      type: 'info',
      text1: 'Route Monitoring Active',
      text2: 'Stay on route for safe delivery',
    });
  },

  // Stop deviation monitoring
  stopDeviationMonitoring: () => {
    if (deviationCheckInterval) {
      clearInterval(deviationCheckInterval);
      deviationCheckInterval = null;
    }

    clearActiveRouteMonitoring();
    set({
      isDeviationMonitoring: false,
      deviationStatus: null,
    });

    console.log('Deviation monitoring stopped');
  },

  // Update deviation status
  updateDeviationStatus: (status: DeviationStatus | null) => {
    set({ deviationStatus: status });
  },
}));
