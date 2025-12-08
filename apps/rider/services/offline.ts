import { MMKV } from 'react-native-mmkv';
import type { Route, Delivery, Wallet } from '../types';

// Initialize MMKV storage
const storage = new MMKV({
  id: 'kenix-rider-offline',
});

const KEYS = {
  ACTIVE_ROUTE: 'cached_active_route',
  CURRENT_DELIVERY: 'cached_current_delivery',
  PENDING_ACTIONS: 'pending_offline_actions',
  LAST_SYNC: 'last_sync_timestamp',
  WALLET_CACHE: 'cached_wallet',
};

export interface OfflineAction {
  id: string;
  type: 'complete_delivery' | 'mark_arrival' | 'submit_payment' | 'update_location';
  payload: any;
  timestamp: number;
  retryCount: number;
}

// ==================== Route Caching ====================

export const cacheActiveRoute = (route: Route): void => {
  try {
    storage.set(KEYS.ACTIVE_ROUTE, JSON.stringify(route));
    storage.set(KEYS.LAST_SYNC, Date.now().toString());
  } catch (error) {
    console.error('Error caching route:', error);
  }
};

export const getCachedRoute = (): Route | null => {
  try {
    const data = storage.getString(KEYS.ACTIVE_ROUTE);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting cached route:', error);
    return null;
  }
};

export const clearCachedRoute = (): void => {
  storage.delete(KEYS.ACTIVE_ROUTE);
};

// ==================== Delivery Caching ====================

export const cacheCurrentDelivery = (delivery: Delivery): void => {
  try {
    storage.set(KEYS.CURRENT_DELIVERY, JSON.stringify(delivery));
  } catch (error) {
    console.error('Error caching delivery:', error);
  }
};

export const getCachedDelivery = (): Delivery | null => {
  try {
    const data = storage.getString(KEYS.CURRENT_DELIVERY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting cached delivery:', error);
    return null;
  }
};

export const clearCachedDelivery = (): void => {
  storage.delete(KEYS.CURRENT_DELIVERY);
};

// ==================== Wallet Caching ====================

export const cacheWallet = (wallet: Wallet): void => {
  try {
    storage.set(KEYS.WALLET_CACHE, JSON.stringify(wallet));
  } catch (error) {
    console.error('Error caching wallet:', error);
  }
};

export const getCachedWallet = (): Wallet | null => {
  try {
    const data = storage.getString(KEYS.WALLET_CACHE);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting cached wallet:', error);
    return null;
  }
};

export const clearCachedWallet = (): void => {
  storage.delete(KEYS.WALLET_CACHE);
};

// ==================== Offline Action Queue ====================

export const queueOfflineAction = (
  action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'>
): string => {
  const actions = getPendingActions();
  const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const newAction: OfflineAction = {
    ...action,
    id,
    timestamp: Date.now(),
    retryCount: 0,
  };

  actions.push(newAction);
  storage.set(KEYS.PENDING_ACTIONS, JSON.stringify(actions));

  console.log(`[Offline] Queued action: ${action.type} (${id})`);
  return id;
};

export const getPendingActions = (): OfflineAction[] => {
  try {
    const data = storage.getString(KEYS.PENDING_ACTIONS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting pending actions:', error);
    return [];
  }
};

export const removeAction = (id: string): void => {
  const actions = getPendingActions().filter((a) => a.id !== id);
  storage.set(KEYS.PENDING_ACTIONS, JSON.stringify(actions));
};

export const updateActionRetry = (id: string): void => {
  const actions = getPendingActions().map((a) =>
    a.id === id ? { ...a, retryCount: a.retryCount + 1 } : a
  );
  storage.set(KEYS.PENDING_ACTIONS, JSON.stringify(actions));
};

export const clearAllPendingActions = (): void => {
  storage.delete(KEYS.PENDING_ACTIONS);
};

export const hasPendingActions = (): boolean => {
  return getPendingActions().length > 0;
};

export const getPendingActionsCount = (): number => {
  return getPendingActions().length;
};

// ==================== Sync Timestamps ====================

export const getLastSyncTime = (): number | null => {
  try {
    const data = storage.getString(KEYS.LAST_SYNC);
    return data ? parseInt(data, 10) : null;
  } catch (error) {
    return null;
  }
};

export const updateLastSyncTime = (): void => {
  storage.set(KEYS.LAST_SYNC, Date.now().toString());
};

// ==================== Clear All Cache ====================

export const clearAllCache = (): void => {
  storage.clearAll();
  console.log('[Offline] All cache cleared');
};

// ==================== Cache Status ====================

export const getCacheStatus = (): {
  hasRoute: boolean;
  hasDelivery: boolean;
  hasWallet: boolean;
  pendingActionsCount: number;
  lastSync: number | null;
} => {
  return {
    hasRoute: getCachedRoute() !== null,
    hasDelivery: getCachedDelivery() !== null,
    hasWallet: getCachedWallet() !== null,
    pendingActionsCount: getPendingActionsCount(),
    lastSync: getLastSyncTime(),
  };
};
