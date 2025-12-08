import { create } from 'zustand';
import NetInfo, { NetInfoState, NetInfoSubscription } from '@react-native-community/netinfo';

interface NetworkState {
  isOnline: boolean;
  connectionType: string | null;
  isInternetReachable: boolean | null;

  initialize: () => NetInfoSubscription;
  checkConnection: () => Promise<boolean>;
}

export const useNetworkStore = create<NetworkState>((set) => ({
  isOnline: true,
  connectionType: null,
  isInternetReachable: null,

  initialize: () => {
    // Get initial state
    NetInfo.fetch().then((state: NetInfoState) => {
      set({
        isOnline: state.isConnected ?? true,
        connectionType: state.type,
        isInternetReachable: state.isInternetReachable,
      });
    });

    // Subscribe to changes
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      set({
        isOnline: state.isConnected ?? true,
        connectionType: state.type,
        isInternetReachable: state.isInternetReachable,
      });
    });

    return unsubscribe;
  },

  checkConnection: async () => {
    const state = await NetInfo.fetch();
    const isOnline = state.isConnected ?? false;
    set({
      isOnline,
      connectionType: state.type,
      isInternetReachable: state.isInternetReachable,
    });
    return isOnline;
  },
}));
