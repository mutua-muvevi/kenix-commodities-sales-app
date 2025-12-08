import { deliveryService, locationService } from './api';
import {
  getPendingActions,
  removeAction,
  updateActionRetry,
  updateLastSyncTime,
  OfflineAction,
} from './offline';
import { useNetworkStore } from '../store/networkStore';

const MAX_RETRIES = 3;

interface SyncResult {
  synced: number;
  failed: number;
  pending: number;
  errors: string[];
}

export const syncOfflineActions = async (): Promise<SyncResult> => {
  const actions = getPendingActions();
  const result: SyncResult = {
    synced: 0,
    failed: 0,
    pending: actions.length,
    errors: [],
  };

  if (actions.length === 0) {
    return result;
  }

  console.log(`[Sync] Starting sync of ${actions.length} offline actions`);

  for (const action of actions) {
    try {
      await processAction(action);
      removeAction(action.id);
      result.synced++;
      console.log(`[Sync] Successfully synced action: ${action.type}`);
    } catch (error: any) {
      console.error(`[Sync] Failed to sync action ${action.type}:`, error.message);

      if (action.retryCount >= MAX_RETRIES) {
        removeAction(action.id);
        result.failed++;
        result.errors.push(`${action.type}: Max retries exceeded`);
      } else {
        updateActionRetry(action.id);
        result.errors.push(`${action.type}: ${error.message}`);
      }
    }
  }

  if (result.synced > 0) {
    updateLastSyncTime();
  }

  console.log(`[Sync] Complete - Synced: ${result.synced}, Failed: ${result.failed}`);
  return result;
};

const processAction = async (action: OfflineAction): Promise<void> => {
  switch (action.type) {
    case 'complete_delivery':
      await deliveryService.completeDelivery(
        action.payload.deliveryId,
        action.payload.data
      );
      break;

    case 'mark_arrival':
      await deliveryService.markArrival(
        action.payload.deliveryId,
        action.payload.location
      );
      break;

    case 'submit_payment':
      await deliveryService.submitPayment(
        action.payload.deliveryId,
        action.payload.data
      );
      break;

    case 'update_location':
      await locationService.updateRiderLocation(
        action.payload.riderId,
        action.payload.location
      );
      break;

    default:
      throw new Error(`Unknown action type: ${(action as any).type}`);
  }
};

// Background sync listener that auto-syncs when coming online
let syncInProgress = false;
let unsubscribe: (() => void) | null = null;

export const startSyncListener = (): () => void => {
  // Subscribe to network state changes
  unsubscribe = useNetworkStore.subscribe(
    (state) => state.isOnline,
    async (isOnline, previousIsOnline) => {
      // Only sync when transitioning from offline to online
      if (isOnline && !previousIsOnline && !syncInProgress) {
        syncInProgress = true;
        try {
          const result = await syncOfflineActions();
          if (result.synced > 0) {
            console.log(`[Sync] Auto-synced ${result.synced} actions`);
          }
        } catch (error) {
          console.error('[Sync] Auto-sync failed:', error);
        } finally {
          syncInProgress = false;
        }
      }
    }
  );

  return () => {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
  };
};

export const stopSyncListener = (): void => {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
};

export const isSyncInProgress = (): boolean => syncInProgress;

export const manualSync = async (): Promise<SyncResult> => {
  if (syncInProgress) {
    return {
      synced: 0,
      failed: 0,
      pending: getPendingActions().length,
      errors: ['Sync already in progress'],
    };
  }

  const { isOnline } = useNetworkStore.getState();
  if (!isOnline) {
    return {
      synced: 0,
      failed: 0,
      pending: getPendingActions().length,
      errors: ['Device is offline'],
    };
  }

  syncInProgress = true;
  try {
    return await syncOfflineActions();
  } finally {
    syncInProgress = false;
  }
};
