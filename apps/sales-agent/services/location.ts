/**
 * Location Tracking Service
 * Handles foreground and background location tracking for sales agents
 * Integrates with backend via API and WebSocket
 */

import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as Battery from 'expo-battery';
import { Platform } from 'react-native';
import apiService from './api';
import websocketService from './websocket';

const LOCATION_TASK_NAME = 'sales-agent-location-tracking';
const FOREGROUND_UPDATE_INTERVAL = 30000; // 30 seconds
const BACKGROUND_UPDATE_INTERVAL = 60000; // 1 minute in background

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  altitude: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: number;
}

export interface LocationUpdate extends LocationData {
  userId: string;
  batteryLevel: number;
  isCharging: boolean;
}

class LocationService {
  private foregroundSubscription: Location.LocationSubscription | null = null;
  private isTrackingForeground = false;
  private isTrackingBackground = false;
  private lastLocationUpdate: number = 0;
  private userId: string | null = null;

  /**
   * Initialize location service with user ID
   */
  initialize(userId: string) {
    this.userId = userId;
    console.log('Location service initialized for user:', userId);
  }

  /**
   * Request location permissions (foreground + background)
   */
  async requestPermissions(): Promise<{
    foreground: boolean;
    background: boolean;
  }> {
    try {
      // Request foreground permission first
      const foregroundStatus = await Location.requestForegroundPermissionsAsync();

      if (foregroundStatus.status !== 'granted') {
        console.log('Foreground location permission denied');
        return { foreground: false, background: false };
      }

      // Request background permission (iOS and Android 10+)
      const backgroundStatus = await Location.requestBackgroundPermissionsAsync();

      return {
        foreground: foregroundStatus.status === 'granted',
        background: backgroundStatus.status === 'granted',
      };
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return { foreground: false, background: false };
    }
  }

  /**
   * Check current permission status
   */
  async checkPermissions(): Promise<{
    foreground: boolean;
    background: boolean;
  }> {
    try {
      const foregroundStatus = await Location.getForegroundPermissionsAsync();
      const backgroundStatus = await Location.getBackgroundPermissionsAsync();

      return {
        foreground: foregroundStatus.status === 'granted',
        background: backgroundStatus.status === 'granted',
      };
    } catch (error) {
      console.error('Error checking location permissions:', error);
      return { foreground: false, background: false };
    }
  }

  /**
   * Get current location once
   */
  async getCurrentLocation(): Promise<LocationData | null> {
    try {
      const { foreground } = await this.checkPermissions();

      if (!foreground) {
        console.log('Location permission not granted');
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        altitude: location.coords.altitude,
        heading: location.coords.heading,
        speed: location.coords.speed,
        timestamp: location.timestamp,
      };
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }

  /**
   * Start foreground location tracking
   */
  async startForegroundTracking(): Promise<boolean> {
    try {
      if (this.isTrackingForeground) {
        console.log('Foreground tracking already active');
        return true;
      }

      const { foreground } = await this.checkPermissions();

      if (!foreground) {
        console.log('Foreground location permission required');
        return false;
      }

      this.foregroundSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: FOREGROUND_UPDATE_INTERVAL,
          distanceInterval: 10, // Update every 10 meters minimum
        },
        async (location) => {
          await this.handleLocationUpdate(location);
        }
      );

      this.isTrackingForeground = true;
      console.log('Foreground location tracking started');
      return true;
    } catch (error) {
      console.error('Error starting foreground tracking:', error);
      return false;
    }
  }

  /**
   * Stop foreground location tracking
   */
  async stopForegroundTracking(): Promise<void> {
    try {
      if (this.foregroundSubscription) {
        this.foregroundSubscription.remove();
        this.foregroundSubscription = null;
      }

      this.isTrackingForeground = false;
      console.log('Foreground location tracking stopped');
    } catch (error) {
      console.error('Error stopping foreground tracking:', error);
    }
  }

  /**
   * Start background location tracking
   */
  async startBackgroundTracking(): Promise<boolean> {
    try {
      if (this.isTrackingBackground) {
        console.log('Background tracking already active');
        return true;
      }

      const { background } = await this.checkPermissions();

      if (!background) {
        console.log('Background location permission required');
        return false;
      }

      // Define the background task
      await this.defineBackgroundTask();

      // Start location updates in background
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: BACKGROUND_UPDATE_INTERVAL,
        distanceInterval: 50, // Update every 50 meters in background
        foregroundService: {
          notificationTitle: 'Kenix Sales Agent',
          notificationBody: 'Tracking your location for route optimization',
          notificationColor: '#22c55e',
        },
        pausesUpdatesAutomatically: true,
        showsBackgroundLocationIndicator: true,
      });

      this.isTrackingBackground = true;
      console.log('Background location tracking started');
      return true;
    } catch (error) {
      console.error('Error starting background tracking:', error);
      return false;
    }
  }

  /**
   * Stop background location tracking
   */
  async stopBackgroundTracking(): Promise<void> {
    try {
      const isTaskDefined = await TaskManager.isTaskDefinedAsync(LOCATION_TASK_NAME);

      if (isTaskDefined) {
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      }

      this.isTrackingBackground = false;
      console.log('Background location tracking stopped');
    } catch (error) {
      console.error('Error stopping background tracking:', error);
    }
  }

  /**
   * Start complete tracking (foreground + background)
   */
  async startTracking(): Promise<{
    foreground: boolean;
    background: boolean;
  }> {
    const foreground = await this.startForegroundTracking();
    const background = await this.startBackgroundTracking();

    return { foreground, background };
  }

  /**
   * Stop all tracking
   */
  async stopTracking(): Promise<void> {
    await this.stopForegroundTracking();
    await this.stopBackgroundTracking();
  }

  /**
   * Check if tracking is active
   */
  isTracking(): {
    foreground: boolean;
    background: boolean;
  } {
    return {
      foreground: this.isTrackingForeground,
      background: this.isTrackingBackground,
    };
  }

  /**
   * Handle location update (foreground)
   */
  private async handleLocationUpdate(location: Location.LocationObject): Promise<void> {
    try {
      // Throttle updates (minimum 10 seconds between sends)
      const now = Date.now();
      if (now - this.lastLocationUpdate < 10000) {
        return;
      }

      this.lastLocationUpdate = now;

      const locationData: LocationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        altitude: location.coords.altitude,
        heading: location.coords.heading,
        speed: location.coords.speed,
        timestamp: location.timestamp,
      };

      // Get battery info
      const batteryLevel = await Battery.getBatteryLevelAsync();
      const batteryState = await Battery.getBatteryStateAsync();

      const update: LocationUpdate = {
        ...locationData,
        userId: this.userId || '',
        batteryLevel: Math.round(batteryLevel * 100),
        isCharging: batteryState === Battery.BatteryState.CHARGING,
      };

      // Send via WebSocket if connected (foreground)
      if (websocketService.isConnected()) {
        websocketService.emit('agent:location-update', update);
        console.log('Location update sent via WebSocket');
      } else {
        // Fallback to API
        await this.sendLocationToAPI(update);
      }
    } catch (error) {
      console.error('Error handling location update:', error);
    }
  }

  /**
   * Send location to backend API
   */
  private async sendLocationToAPI(update: LocationUpdate): Promise<void> {
    try {
      await apiService.post('/user/location', update);
      console.log('Location update sent via API');
    } catch (error) {
      console.error('Error sending location to API:', error);
      // Location will be queued by offline middleware if no connection
    }
  }

  /**
   * Define background location task
   */
  private async defineBackgroundTask(): Promise<void> {
    const isTaskDefined = await TaskManager.isTaskDefinedAsync(LOCATION_TASK_NAME);

    if (!isTaskDefined) {
      TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
        if (error) {
          console.error('Background location task error:', error);
          return;
        }

        if (data) {
          const { locations } = data as { locations: Location.LocationObject[] };

          if (locations && locations.length > 0) {
            const location = locations[0];

            try {
              // Get battery info
              const batteryLevel = await Battery.getBatteryLevelAsync();
              const batteryState = await Battery.getBatteryStateAsync();

              const update: LocationUpdate = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                accuracy: location.coords.accuracy,
                altitude: location.coords.altitude,
                heading: location.coords.heading,
                speed: location.coords.speed,
                timestamp: location.timestamp,
                userId: this.userId || '',
                batteryLevel: Math.round(batteryLevel * 100),
                isCharging: batteryState === Battery.BatteryState.CHARGING,
              };

              // In background, we can only use API (WebSocket not reliable)
              await apiService.post('/user/location', update);
              console.log('Background location update sent');
            } catch (error) {
              console.error('Error processing background location:', error);
            }
          }
        }
      });
    }
  }

  /**
   * Get tracking status summary
   */
  async getTrackingStatus(): Promise<{
    isTracking: boolean;
    foreground: boolean;
    background: boolean;
    permissions: {
      foreground: boolean;
      background: boolean;
    };
  }> {
    const permissions = await this.checkPermissions();
    const tracking = this.isTracking();

    return {
      isTracking: tracking.foreground || tracking.background,
      foreground: tracking.foreground,
      background: tracking.background,
      permissions,
    };
  }
}

export default new LocationService();
