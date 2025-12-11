import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Route, Delivery, Wallet } from '../types';

const KEYS = {
  ACTIVE_ROUTE: 'kenix_rider_cached_active_route',
  CURRENT_DELIVERY: 'kenix_rider_cached_current_delivery',
  PENDING_ACTIONS: 'kenix_rider_pending_offline_actions',
  LAST_SYNC: 'kenix_rider_last_sync_timestamp',
  WALLET_CACHE: 'kenix_rider_cached_wallet',
};

export interface OfflineAction {
  id: string;
  type: 'complete_delivery' | 'mark_arrival' | 'submit_payment' | 'update_location';
  payload: any;
  timestamp: number;
  retryCount: number;
}

// ==================== Route Caching ====================

export const cacheActiveRoute = async (route: Route): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.ACTIVE_ROUTE, JSON.stringify(route));
    await AsyncStorage.setItem(KEYS.LAST_SYNC, Date.now().toString());
  } catch (error) {
    console.error('Error caching route:', error);
  }
};

export const getCachedRoute = async (): Promise<Route | null> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.ACTIVE_ROUTE);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting cached route:', error);
    return null;
  }
};

export const clearCachedRoute = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(KEYS.ACTIVE_ROUTE);
  } catch (error) {
    console.error('Error clearing cached route:', error);
  }
};

// ==================== Delivery Caching ====================

export const cacheCurrentDelivery = async (delivery: Delivery): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.CURRENT_DELIVERY, JSON.stringify(delivery));
  } catch (error) {
    console.error('Error caching delivery:', error);
  }
};

export const getCachedDelivery = async (): Promise<Delivery | null> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.CURRENT_DELIVERY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting cached delivery:', error);
    return null;
  }
};

export const clearCachedDelivery = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(KEYS.CURRENT_DELIVERY);
  } catch (error) {
    console.error('Error clearing cached delivery:', error);
  }
};

// ==================== Wallet Caching ====================

export const cacheWallet = async (wallet: Wallet): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.WALLET_CACHE, JSON.stringify(wallet));
  } catch (error) {
    console.error('Error caching wallet:', error);
  }
};

export const getCachedWallet = async (): Promise<Wallet | null> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.WALLET_CACHE);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting cached wallet:', error);
    return null;
  }
};

export const clearCachedWallet = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(KEYS.WALLET_CACHE);
  } catch (error) {
    console.error('Error clearing cached wallet:', error);
  }
};

// ==================== Offline Action Queue ====================

export const queueOfflineAction = async (
  action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'>
): Promise<string> => {
  const actions = await getPendingActions();
  const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const newAction: OfflineAction = {
    ...action,
    id,
    timestamp: Date.now(),
    retryCount: 0,
  };

  actions.push(newAction);

  try {
    await AsyncStorage.setItem(KEYS.PENDING_ACTIONS, JSON.stringify(actions));
  } catch (error) {
    console.error('Error queuing offline action:', error);
  }

  console.log(`[Offline] Queued action: ${action.type} (${id})`);
  return id;
};

export const getPendingActions = async (): Promise<OfflineAction[]> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.PENDING_ACTIONS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting pending actions:', error);
    return [];
  }
};

export const removeAction = async (id: string): Promise<void> => {
  try {
    const actions = await getPendingActions();
    const filteredActions = actions.filter((a) => a.id !== id);
    await AsyncStorage.setItem(KEYS.PENDING_ACTIONS, JSON.stringify(filteredActions));
  } catch (error) {
    console.error('Error removing action:', error);
  }
};

export const updateActionRetry = async (id: string): Promise<void> => {
  try {
    const actions = await getPendingActions();
    const updatedActions = actions.map((a) =>
      a.id === id ? { ...a, retryCount: a.retryCount + 1 } : a
    );
    await AsyncStorage.setItem(KEYS.PENDING_ACTIONS, JSON.stringify(updatedActions));
  } catch (error) {
    console.error('Error updating action retry:', error);
  }
};

export const clearAllPendingActions = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(KEYS.PENDING_ACTIONS);
  } catch (error) {
    console.error('Error clearing pending actions:', error);
  }
};

export const hasPendingActions = async (): Promise<boolean> => {
  const actions = await getPendingActions();
  return actions.length > 0;
};

export const getPendingActionsCount = async (): Promise<number> => {
  const actions = await getPendingActions();
  return actions.length;
};

// ==================== Sync Timestamps ====================

export const getLastSyncTime = async (): Promise<number | null> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.LAST_SYNC);
    return data ? parseInt(data, 10) : null;
  } catch (error) {
    return null;
  }
};

export const updateLastSyncTime = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.LAST_SYNC, Date.now().toString());
  } catch (error) {
    console.error('Error updating last sync time:', error);
  }
};

// ==================== Clear All Cache ====================

export const clearAllCache = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      KEYS.ACTIVE_ROUTE,
      KEYS.CURRENT_DELIVERY,
      KEYS.PENDING_ACTIONS,
      KEYS.LAST_SYNC,
      KEYS.WALLET_CACHE,
    ]);
    console.log('[Offline] All cache cleared');
  } catch (error) {
    console.error('Error clearing all cache:', error);
  }
};

// ==================== Cache Status ====================

export const getCacheStatus = async (): Promise<{
  hasRoute: boolean;
  hasDelivery: boolean;
  hasWallet: boolean;
  pendingActionsCount: number;
  lastSync: number | null;
}> => {
  const [route, delivery, wallet, actionsCount, lastSync] = await Promise.all([
    getCachedRoute(),
    getCachedDelivery(),
    getCachedWallet(),
    getPendingActionsCount(),
    getLastSyncTime(),
  ]);

  return {
    hasRoute: route !== null,
    hasDelivery: delivery !== null,
    hasWallet: wallet !== null,
    pendingActionsCount: actionsCount,
    lastSync,
  };
};
