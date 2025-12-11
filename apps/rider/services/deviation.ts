/**
 * Route Deviation Detection Service
 *
 * Monitors rider location against expected route corridor
 * Detects deviations and triggers admin alerts to prevent theft
 */

import * as Location from 'expo-location';
import { calculateDistance } from './location';
import { websocketService } from './websocket';
import { api } from './api';

// Deviation thresholds
export const GEOFENCE_ARRIVAL_RADIUS = 0.1; // 100 meters - must be within to mark arrival
export const ROUTE_CORRIDOR_WIDTH = 0.5; // 500 meters - acceptable deviation from route
export const CRITICAL_DEVIATION_DISTANCE = 1.0; // 1km - critical alert threshold
export const DEVIATION_CHECK_INTERVAL = 10000; // Check every 10 seconds

// Deviation severity levels
export type DeviationSeverity = 'none' | 'minor' | 'warning' | 'critical';

export interface DeviationStatus {
  severity: DeviationSeverity;
  distanceFromRoute: number; // in kilometers
  message: string;
  color: string;
  shouldAlert: boolean;
}

export interface RoutePoint {
  lat: number;
  lng: number;
}

export interface DeviationLog {
  riderId: string;
  routeId: string;
  location: {
    lat: number;
    lng: number;
  };
  expectedLocation: RoutePoint;
  deviationDistance: number;
  severity: DeviationSeverity;
  timestamp: Date;
  currentDeliveryId?: string;
}

/**
 * Calculate minimum distance from a point to a line segment (route segment)
 * Uses perpendicular distance formula
 */
export const pointToLineDistance = (
  point: RoutePoint,
  lineStart: RoutePoint,
  lineEnd: RoutePoint
): number => {
  const x0 = point.lng;
  const y0 = point.lat;
  const x1 = lineStart.lng;
  const y1 = lineStart.lat;
  const x2 = lineEnd.lng;
  const y2 = lineEnd.lat;

  // Calculate perpendicular distance from point to line
  const numerator = Math.abs(
    (y2 - y1) * x0 - (x2 - x1) * y0 + x2 * y1 - y2 * x1
  );
  const denominator = Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2));

  if (denominator === 0) {
    // Line segment is a point, calculate direct distance
    return calculateDistance(point.lat, point.lng, lineStart.lat, lineStart.lng);
  }

  const distanceToLine = numerator / denominator;

  // Convert from degrees to approximate kilometers (rough approximation)
  // 1 degree ≈ 111 km at equator
  return distanceToLine * 111;
};

/**
 * Calculate minimum distance from current location to the route polyline
 */
export const distanceToRoute = (
  currentLocation: RoutePoint,
  routePolyline: RoutePoint[]
): number => {
  if (routePolyline.length < 2) {
    // If no route, calculate distance to first point
    return routePolyline.length === 1
      ? calculateDistance(
          currentLocation.lat,
          currentLocation.lng,
          routePolyline[0].lat,
          routePolyline[0].lng
        )
      : Infinity;
  }

  let minDistance = Infinity;

  // Check distance to each segment of the route
  for (let i = 0; i < routePolyline.length - 1; i++) {
    const segmentDistance = pointToLineDistance(
      currentLocation,
      routePolyline[i],
      routePolyline[i + 1]
    );

    minDistance = Math.min(minDistance, segmentDistance);
  }

  // Also check direct distances to route points (for sharp turns)
  routePolyline.forEach((point) => {
    const directDistance = calculateDistance(
      currentLocation.lat,
      currentLocation.lng,
      point.lat,
      point.lng
    );
    minDistance = Math.min(minDistance, directDistance);
  });

  return minDistance;
};

/**
 * Build route polyline from current location through all remaining delivery shops
 */
export const buildRoutePolyline = (
  currentLocation: RoutePoint,
  remainingShops: Array<{ location: { coordinates: [number, number] } }>
): RoutePoint[] => {
  const polyline: RoutePoint[] = [currentLocation];

  remainingShops.forEach((shop) => {
    polyline.push({
      lng: shop.location.coordinates[0],
      lat: shop.location.coordinates[1],
    });
  });

  return polyline;
};

/**
 * Determine deviation severity based on distance from route
 */
export const getDeviationStatus = (
  distanceFromRoute: number
): DeviationStatus => {
  if (distanceFromRoute <= ROUTE_CORRIDOR_WIDTH * 0.5) {
    // Within 250m - all good
    return {
      severity: 'none',
      distanceFromRoute,
      message: 'On route',
      color: '#4CAF50', // Green
      shouldAlert: false,
    };
  } else if (distanceFromRoute <= ROUTE_CORRIDOR_WIDTH) {
    // 250m - 500m - minor deviation
    return {
      severity: 'minor',
      distanceFromRoute,
      message: 'Slightly off route',
      color: '#FFC107', // Yellow
      shouldAlert: false,
    };
  } else if (distanceFromRoute <= CRITICAL_DEVIATION_DISTANCE) {
    // 500m - 1km - warning
    return {
      severity: 'warning',
      distanceFromRoute,
      message: 'Off route - returning to route',
      color: '#FF9800', // Orange
      shouldAlert: true,
    };
  } else {
    // > 1km - critical
    return {
      severity: 'critical',
      distanceFromRoute,
      message: 'Major deviation detected',
      color: '#F44336', // Red
      shouldAlert: true,
    };
  }
};

/**
 * Send deviation alert to admin via WebSocket and API
 */
export const alertAdminOfDeviation = async (
  riderId: string,
  riderName: string,
  routeId: string,
  currentLocation: RoutePoint,
  expectedRoute: RoutePoint[],
  deviationStatus: DeviationStatus
): Promise<void> => {
  const alertData = {
    riderId,
    riderName,
    routeId,
    currentLocation,
    expectedRoute,
    deviationDistance: deviationStatus.distanceFromRoute,
    severity: deviationStatus.severity,
    timestamp: new Date(),
  };

  // Send via WebSocket for real-time alert
  try {
    websocketService.emit('rider:route-deviation', alertData);
  } catch (error) {
    console.error('Failed to send deviation alert via WebSocket:', error);
  }

  // Also log to API for persistent record
  try {
    await api.post('/rider/log-deviation', {
      ...alertData,
      location: currentLocation,
    });
  } catch (error) {
    console.error('Failed to log deviation to API:', error);
  }
};

/**
 * Log deviation to local storage for later sync if offline
 */
export const logDeviationLocally = async (
  deviationLog: DeviationLog
): Promise<void> => {
  // TODO: Implement MMKV storage for offline deviation logs
  // For now, just console log
  console.warn('Deviation detected:', deviationLog);
};

/**
 * Check if rider can mark arrival based on geofence
 */
export const canMarkArrival = (
  currentLocation: RoutePoint,
  shopLocation: { coordinates: [number, number] }
): { allowed: boolean; distance: number; message: string } => {
  const shopLat = shopLocation.coordinates[1];
  const shopLng = shopLocation.coordinates[0];

  const distance = calculateDistance(
    currentLocation.lat,
    currentLocation.lng,
    shopLat,
    shopLng
  );

  if (distance <= GEOFENCE_ARRIVAL_RADIUS) {
    return {
      allowed: true,
      distance,
      message: 'You can mark arrival',
    };
  } else {
    return {
      allowed: false,
      distance,
      message: `Get closer to shop (${Math.round(distance * 1000)}m away)`,
    };
  }
};

/**
 * Create route corridor polygon for visualization
 * Returns array of points forming a polygon around the route
 */
export const createRouteCorridor = (
  routePolyline: RoutePoint[],
  corridorWidth: number = ROUTE_CORRIDOR_WIDTH
): RoutePoint[] => {
  if (routePolyline.length < 2) return [];

  const corridor: RoutePoint[] = [];

  // This is a simplified version - for production, use a proper buffer algorithm
  // For now, we'll just create parallel lines offset by corridor width
  // This is adequate for visualization purposes

  routePolyline.forEach((point) => {
    // Approximate offset (this is simplified)
    const offset = corridorWidth / 111; // Convert km to degrees (rough)

    corridor.push({
      lat: point.lat + offset,
      lng: point.lng + offset,
    });
  });

  // Add points in reverse for bottom boundary
  for (let i = routePolyline.length - 1; i >= 0; i--) {
    const offset = corridorWidth / 111;
    corridor.push({
      lat: routePolyline[i].lat - offset,
      lng: routePolyline[i].lng - offset,
    });
  }

  return corridor;
};

/**
 * Background deviation monitoring class
 */
export class DeviationMonitor {
  private monitoringInterval: NodeJS.Timeout | null = null;
  private riderId: string;
  private riderName: string;
  private routeId: string;
  private expectedRoute: RoutePoint[];
  private lastAlertTime: number = 0;
  private alertCooldown: number = 60000; // Don't spam alerts - 1 minute cooldown

  constructor(
    riderId: string,
    riderName: string,
    routeId: string,
    expectedRoute: RoutePoint[]
  ) {
    this.riderId = riderId;
    this.riderName = riderName;
    this.routeId = routeId;
    this.expectedRoute = expectedRoute;
  }

  /**
   * Start monitoring for route deviations
   */
  async startMonitoring(
    onDeviationDetected?: (status: DeviationStatus) => void
  ): Promise<void> {
    if (this.monitoringInterval) {
      console.warn('Deviation monitoring already active');
      return;
    }

    console.log('Starting deviation monitoring...');

    this.monitoringInterval = setInterval(async () => {
      try {
        // Get current location
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const currentLocation: RoutePoint = {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        };

        // Calculate distance from route
        const distance = distanceToRoute(currentLocation, this.expectedRoute);

        // Get deviation status
        const deviationStatus = getDeviationStatus(distance);

        // Trigger callback if provided
        if (onDeviationDetected) {
          onDeviationDetected(deviationStatus);
        }

        // Alert admin if deviation is significant and cooldown has passed
        if (deviationStatus.shouldAlert) {
          const now = Date.now();
          if (now - this.lastAlertTime >= this.alertCooldown) {
            await alertAdminOfDeviation(
              this.riderId,
              this.riderName,
              this.routeId,
              currentLocation,
              this.expectedRoute,
              deviationStatus
            );

            // Log deviation
            await logDeviationLocally({
              riderId: this.riderId,
              routeId: this.routeId,
              location: currentLocation,
              expectedLocation: this.expectedRoute[0],
              deviationDistance: distance,
              severity: deviationStatus.severity,
              timestamp: new Date(),
            });

            this.lastAlertTime = now;
          }
        }
      } catch (error) {
        console.error('Deviation monitoring error:', error);
      }
    }, DEVIATION_CHECK_INTERVAL);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('Deviation monitoring stopped');
    }
  }

  /**
   * Update expected route (when deliveries are completed)
   */
  updateExpectedRoute(newRoute: RoutePoint[]): void {
    this.expectedRoute = newRoute;
  }

  /**
   * Check if monitoring is active
   */
  isMonitoring(): boolean {
    return this.monitoringInterval !== null;
  }
}
