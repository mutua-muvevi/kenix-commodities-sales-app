import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';
import { locationService } from './api';
import { websocketService } from './websocket';
import {
  distanceToRoute,
  getDeviationStatus,
  alertAdminOfDeviation,
  type RoutePoint,
  type DeviationStatus,
} from './deviation';

const LOCATION_TASK_NAME = 'rider-background-location';
const DEVIATION_CHECK_TASK_NAME = 'rider-deviation-check';

// Store active route info for background monitoring
let activeRouteInfo: {
  riderId: string;
  riderName: string;
  routeId: string;
  expectedRoute: RoutePoint[];
} | null = null;

let lastDeviationAlertTime = 0;
const DEVIATION_ALERT_COOLDOWN = 60000; // 1 minute between alerts

// Calculate distance between two coordinates using Haversine formula
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance; // Returns distance in kilometers
};

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

// Check if rider is within geofence radius
export const isWithinGeofence = (
  currentLat: number,
  currentLng: number,
  shopLat: number,
  shopLng: number,
  radiusKm: number = 0.1 // Default 100 meters
): boolean => {
  const distance = calculateDistance(currentLat, currentLng, shopLat, shopLng);
  return distance <= radiusKm;
};

// Format distance for display
export const formatDistance = (distanceKm: number): string => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  }
  return `${distanceKm.toFixed(1)}km`;
};

// Calculate ETA based on distance and average speed
export const calculateETA = (
  distanceKm: number,
  averageSpeedKmh: number = 25
): number => {
  // Returns ETA in minutes
  const timeHours = distanceKm / averageSpeedKmh;
  return Math.round(timeHours * 60);
};

// Format ETA for display
export const formatETA = (minutes: number): string => {
  if (minutes < 1) {
    return 'Less than 1 min';
  }
  if (minutes < 60) {
    return `${minutes} min${minutes !== 1 ? 's' : ''}`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  if (remainingMins === 0) {
    return `${hours} hr${hours !== 1 ? 's' : ''}`;
  }
  return `${hours}h ${remainingMins}m`;
};

// Calculate bearing between two coordinates (direction in degrees)
export const calculateBearing = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const dLon = toRad(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
  const bearing = Math.atan2(y, x);
  return (((bearing * 180) / Math.PI) + 360) % 360;
};

// Get cardinal direction from bearing
export const getCardinalDirection = (bearing: number): string => {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(bearing / 45) % 8;
  return directions[index];
};

// Calculate midpoint between two coordinates
export const calculateMidpoint = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): { lat: number; lng: number } => {
  const dLon = toRad(lon2 - lon1);
  const bx = Math.cos(toRad(lat2)) * Math.cos(dLon);
  const by = Math.cos(toRad(lat2)) * Math.sin(dLon);
  const lat3 =
    (Math.atan2(
      Math.sin(toRad(lat1)) + Math.sin(toRad(lat2)),
      Math.sqrt(
        (Math.cos(toRad(lat1)) + bx) * (Math.cos(toRad(lat1)) + bx) + by * by
      )
    ) *
      180) /
    Math.PI;
  const lon3 = lon1 + (Math.atan2(by, Math.cos(toRad(lat1)) + bx) * 180) / Math.PI;
  return { lat: lat3, lng: lon3 };
};

// Request location permissions
export const requestLocationPermissions = async (): Promise<boolean> => {
  try {
    const { status: foregroundStatus } =
      await Location.requestForegroundPermissionsAsync();

    if (foregroundStatus !== 'granted') {
      console.warn('Foreground location permission not granted');
      return false;
    }

    const { status: backgroundStatus } =
      await Location.requestBackgroundPermissionsAsync();

    if (backgroundStatus !== 'granted') {
      console.warn('Background location permission not granted');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error requesting location permissions:', error);
    return false;
  }
};

// Get current location
export const getCurrentLocation = async (): Promise<{
  lat: number;
  lng: number;
} | null> => {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();

    if (status !== 'granted') {
      console.warn('Location permission not granted');
      return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    return {
      lat: location.coords.latitude,
      lng: location.coords.longitude,
    };
  } catch (error) {
    console.error('Error getting current location:', error);
    return null;
  }
};

// Watch location changes (for foreground tracking)
export const watchLocation = async (
  callback: (location: { lat: number; lng: number }) => void
): Promise<{ remove: () => void } | null> => {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();

    if (status !== 'granted') {
      console.warn('Location permission not granted');
      return null;
    }

    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 10000, // Update every 10 seconds
        distanceInterval: 50, // Update every 50 meters
      },
      (location) => {
        callback({
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        });
      }
    );

    return subscription;
  } catch (error) {
    console.error('Error watching location:', error);
    return null;
  }
};

/**
 * Set active route for deviation monitoring
 */
export const setActiveRouteForMonitoring = (
  riderId: string,
  riderName: string,
  routeId: string,
  expectedRoute: RoutePoint[]
): void => {
  activeRouteInfo = {
    riderId,
    riderName,
    routeId,
    expectedRoute,
  };
  console.log('Active route set for deviation monitoring:', routeId);
};

/**
 * Clear active route monitoring
 */
export const clearActiveRouteMonitoring = (): void => {
  activeRouteInfo = null;
  console.log('Active route monitoring cleared');
};

/**
 * Check current location against route and return deviation status
 */
export const checkDeviationStatus = async (): Promise<DeviationStatus | null> => {
  if (!activeRouteInfo) {
    return null;
  }

  try {
    const currentLocation = await getCurrentLocation();
    if (!currentLocation) {
      return null;
    }

    const distance = distanceToRoute(currentLocation, activeRouteInfo.expectedRoute);
    const deviationStatus = getDeviationStatus(distance);

    // Alert admin if significant deviation and cooldown passed
    if (deviationStatus.shouldAlert) {
      const now = Date.now();
      if (now - lastDeviationAlertTime >= DEVIATION_ALERT_COOLDOWN) {
        await alertAdminOfDeviation(
          activeRouteInfo.riderId,
          activeRouteInfo.riderName,
          activeRouteInfo.routeId,
          currentLocation,
          activeRouteInfo.expectedRoute,
          deviationStatus
        );
        lastDeviationAlertTime = now;
      }
    }

    return deviationStatus;
  } catch (error) {
    console.error('Error checking deviation status:', error);
    return null;
  }
};

// Define background location task with deviation monitoring
TaskManager.defineTask(
  LOCATION_TASK_NAME,
  async ({ data, error }: TaskManager.TaskManagerTaskBody<{ locations: Location.LocationObject[] }>) => {
    if (error) {
      console.error('Background location task error:', error);
      return;
    }

    if (data) {
      const { locations } = data;
      const location = locations[0];

      if (location) {
        const coords = {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        };

        try {
          // Emit location via WebSocket
          websocketService.emitLocation(coords);

          // Check for route deviation if route is active
          if (activeRouteInfo) {
            const distance = distanceToRoute(coords, activeRouteInfo.expectedRoute);
            const deviationStatus = getDeviationStatus(distance);

            // Alert admin if deviation is significant
            if (deviationStatus.shouldAlert) {
              const now = Date.now();
              if (now - lastDeviationAlertTime >= DEVIATION_ALERT_COOLDOWN) {
                await alertAdminOfDeviation(
                  activeRouteInfo.riderId,
                  activeRouteInfo.riderName,
                  activeRouteInfo.routeId,
                  coords,
                  activeRouteInfo.expectedRoute,
                  deviationStatus
                );
                lastDeviationAlertTime = now;
              }
            }
          }
        } catch (error) {
          console.error('Error updating location:', error);
        }
      }
    }
  }
);

// Start background location tracking with deviation monitoring
export const startBackgroundTracking = async (): Promise<boolean> => {
  try {
    const hasPermission = await requestLocationPermissions();

    if (!hasPermission) {
      console.warn('Location permissions not granted');
      return false;
    }

    const isTaskDefined = await TaskManager.isTaskDefinedAsync(
      LOCATION_TASK_NAME
    );

    if (!isTaskDefined) {
      console.warn('Location task not defined');
      return false;
    }

    const isTracking = await Location.hasStartedLocationUpdatesAsync(
      LOCATION_TASK_NAME
    );

    if (isTracking) {
      console.log('Background tracking already started');
      return true;
    }

    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.High,
      timeInterval: 10000, // Update every 10 seconds
      distanceInterval: 50, // Update every 50 meters
      foregroundService: {
        notificationTitle: 'Kenix Delivery Active',
        notificationBody: 'Tracking your location for active deliveries',
        notificationColor: '#0066CC',
      },
      pausesUpdatesAutomatically: false,
      showsBackgroundLocationIndicator: Platform.OS === 'ios',
    });

    console.log('Background tracking started');
    return true;
  } catch (error) {
    console.error('Error starting background tracking:', error);
    return false;
  }
};

// Stop background location tracking
export const stopBackgroundTracking = async (): Promise<void> => {
  try {
    const isTracking = await Location.hasStartedLocationUpdatesAsync(
      LOCATION_TASK_NAME
    );

    if (isTracking) {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      console.log('Background tracking stopped');
    }

    // Clear active route monitoring
    clearActiveRouteMonitoring();
  } catch (error) {
    console.error('Error stopping background tracking:', error);
  }
};

// Check if background tracking is active
export const isBackgroundTrackingActive = async (): Promise<boolean> => {
  try {
    return await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
  } catch (error) {
    console.error('Error checking tracking status:', error);
    return false;
  }
};

// Open device navigation app to shop
export const navigateToShop = (shopLat: number, shopLng: number, shopName: string): void => {
  const scheme = Platform.select({
    ios: 'maps:',
    android: 'geo:',
  });
  const url = Platform.select({
    ios: `${scheme}?q=${shopLat},${shopLng}&label=${encodeURIComponent(shopName)}`,
    android: `${scheme}${shopLat},${shopLng}?q=${shopLat},${shopLng}(${encodeURIComponent(shopName)})`,
  });

  if (url) {
    const { Linking } = require('react-native');
    Linking.openURL(url).catch((err: Error) =>
      console.error('Error opening maps:', err)
    );
  }
};
