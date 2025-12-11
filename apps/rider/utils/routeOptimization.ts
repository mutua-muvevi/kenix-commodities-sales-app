/**
 * Route Optimization Utilities
 *
 * Implements nearest-neighbor algorithm for optimizing delivery routes
 * based on geographic distance using Haversine formula
 */

import { calculateDistance } from '../services/location';
import type { Delivery, Shop } from '../types';

export interface OptimizedDelivery extends Delivery {
  distanceFromPrevious?: number;
  estimatedArrivalTime?: Date;
}

/**
 * Optimize deliveries using nearest-neighbor algorithm
 * Starting from current location, always pick the nearest unvisited shop
 *
 * @param deliveries - Array of deliveries to optimize
 * @param currentLocation - Rider's current location { lat, lng }
 * @returns Optimized array of deliveries with distances
 */
export const optimizeDeliveryRoute = (
  deliveries: Delivery[],
  currentLocation: { lat: number; lng: number } | null
): OptimizedDelivery[] => {
  if (deliveries.length === 0) {
    return [];
  }

  // Filter out completed/failed deliveries
  const pendingDeliveries = deliveries.filter(
    (d) => d.status !== 'completed' && d.status !== 'failed'
  );

  if (pendingDeliveries.length === 0) {
    return deliveries as OptimizedDelivery[];
  }

  if (pendingDeliveries.length === 1) {
    const delivery = pendingDeliveries[0];
    const optimized: OptimizedDelivery = {
      ...delivery,
      distanceFromPrevious: currentLocation
        ? calculateDistance(
            currentLocation.lat,
            currentLocation.lng,
            delivery.shopId.location.coordinates[1],
            delivery.shopId.location.coordinates[0]
          )
        : undefined,
    };
    return [optimized];
  }

  const unvisited = [...pendingDeliveries];
  const optimized: OptimizedDelivery[] = [];

  // Current position for tracking (start with rider's location or first shop)
  let currentLat = currentLocation?.lat;
  let currentLng = currentLocation?.lng;

  // If no current location, start with first delivery
  if (!currentLat || !currentLng) {
    const firstDelivery = unvisited.shift()!;
    optimized.push({
      ...firstDelivery,
      distanceFromPrevious: 0,
    });
    currentLat = firstDelivery.shopId.location.coordinates[1];
    currentLng = firstDelivery.shopId.location.coordinates[0];
  }

  // Nearest neighbor algorithm
  while (unvisited.length > 0) {
    let nearestIndex = 0;
    let minDistance = Infinity;

    // Find nearest unvisited shop
    for (let i = 0; i < unvisited.length; i++) {
      const shop = unvisited[i].shopId;
      const shopLat = shop.location.coordinates[1];
      const shopLng = shop.location.coordinates[0];

      const distance = calculateDistance(currentLat!, currentLng!, shopLat, shopLng);

      if (distance < minDistance) {
        minDistance = distance;
        nearestIndex = i;
      }
    }

    // Add nearest shop to optimized route
    const nearestDelivery = unvisited.splice(nearestIndex, 1)[0];
    const shop = nearestDelivery.shopId;

    optimized.push({
      ...nearestDelivery,
      distanceFromPrevious: minDistance,
      deliverySequence: optimized.length + 1, // Update sequence
    });

    // Update current position
    currentLat = shop.location.coordinates[1];
    currentLng = shop.location.coordinates[0];
  }

  return optimized;
};

/**
 * Calculate total route distance
 *
 * @param deliveries - Array of deliveries
 * @param currentLocation - Starting location
 * @returns Total distance in kilometers
 */
export const calculateTotalRouteDistance = (
  deliveries: Delivery[],
  currentLocation: { lat: number; lng: number } | null
): number => {
  if (deliveries.length === 0) {
    return 0;
  }

  let totalDistance = 0;
  let prevLat = currentLocation?.lat;
  let prevLng = currentLocation?.lng;

  for (const delivery of deliveries) {
    const shopLat = delivery.shopId.location.coordinates[1];
    const shopLng = delivery.shopId.location.coordinates[0];

    if (prevLat && prevLng) {
      totalDistance += calculateDistance(prevLat, prevLng, shopLat, shopLng);
    }

    prevLat = shopLat;
    prevLng = shopLng;
  }

  return totalDistance;
};

/**
 * Calculate ETA for each delivery stop
 * Assumes average speed of 25 km/h in urban areas
 *
 * @param deliveries - Optimized deliveries array
 * @param averageSpeedKmh - Average speed in km/h (default 25)
 * @param stopTimeMinutes - Average time spent at each stop (default 10)
 * @returns Array of deliveries with ETAs
 */
export const calculateETAs = (
  deliveries: OptimizedDelivery[],
  averageSpeedKmh: number = 25,
  stopTimeMinutes: number = 10
): OptimizedDelivery[] => {
  if (deliveries.length === 0) {
    return [];
  }

  const now = new Date();
  let accumulatedTime = 0; // in minutes

  return deliveries.map((delivery, index) => {
    // Add travel time
    if (delivery.distanceFromPrevious) {
      const travelTimeHours = delivery.distanceFromPrevious / averageSpeedKmh;
      const travelTimeMinutes = travelTimeHours * 60;
      accumulatedTime += travelTimeMinutes;
    }

    // Add stop time for previous stops
    if (index > 0) {
      accumulatedTime += stopTimeMinutes;
    }

    const eta = new Date(now.getTime() + accumulatedTime * 60 * 1000);

    return {
      ...delivery,
      estimatedArrivalTime: eta,
    };
  });
};

/**
 * Format ETA for display
 *
 * @param eta - Estimated arrival time
 * @returns Formatted string like "2:30 PM" or "in 15 mins"
 */
export const formatETA = (eta: Date | undefined): string => {
  if (!eta) {
    return 'N/A';
  }

  const now = new Date();
  const diffMs = eta.getTime() - now.getTime();
  const diffMins = Math.round(diffMs / (1000 * 60));

  if (diffMins < 0) {
    return 'Now';
  }

  if (diffMins < 60) {
    return `in ${diffMins} min${diffMins !== 1 ? 's' : ''}`;
  }

  const hours = eta.getHours();
  const minutes = eta.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;

  return `${displayHours}:${displayMinutes} ${ampm}`;
};

/**
 * Get optimization metrics comparing original vs optimized route
 *
 * @param originalDeliveries - Original delivery order
 * @param optimizedDeliveries - Optimized delivery order
 * @param currentLocation - Starting location
 * @returns Optimization metrics
 */
export const getOptimizationMetrics = (
  originalDeliveries: Delivery[],
  optimizedDeliveries: OptimizedDelivery[],
  currentLocation: { lat: number; lng: number } | null
) => {
  const originalDistance = calculateTotalRouteDistance(originalDeliveries, currentLocation);
  const optimizedDistance = calculateTotalRouteDistance(optimizedDeliveries, currentLocation);

  const distanceSaved = originalDistance - optimizedDistance;
  const percentageSaved = originalDistance > 0
    ? ((distanceSaved / originalDistance) * 100).toFixed(1)
    : 0;

  // Assuming average speed of 25 km/h
  const timeSavedMinutes = Math.round((distanceSaved / 25) * 60);

  return {
    originalDistance: Math.round(originalDistance * 10) / 10,
    optimizedDistance: Math.round(optimizedDistance * 10) / 10,
    distanceSaved: Math.round(distanceSaved * 10) / 10,
    percentageSaved: Number(percentageSaved),
    timeSavedMinutes,
  };
};
