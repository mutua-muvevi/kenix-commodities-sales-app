/**
 * Location Hook
 * Custom hook for accessing location tracking functionality
 */

import { useLocationStore } from '../slices/location/location-store';

export const useLocation = () => {
  const {
    currentLocation,
    isTrackingEnabled,
    isForegroundTracking,
    isBackgroundTracking,
    permissions,
    lastUpdateTimestamp,
    locationHistory,
    isLoading,
    error,
    requestPermissions,
    checkPermissions,
    getCurrentLocation,
    startTracking,
    stopTracking,
    setTrackingEnabled,
    updateCurrentLocation,
    addToHistory,
    clearHistory,
    getTrackingStatus,
    clearError,
  } = useLocationStore();

  return {
    // State
    currentLocation,
    isTrackingEnabled,
    isForegroundTracking,
    isBackgroundTracking,
    permissions,
    lastUpdateTimestamp,
    locationHistory,
    isLoading,
    error,

    // Actions
    requestPermissions,
    checkPermissions,
    getCurrentLocation,
    startTracking,
    stopTracking,
    setTrackingEnabled,
    updateCurrentLocation,
    addToHistory,
    clearHistory,
    getTrackingStatus,
    clearError,
  };
};
