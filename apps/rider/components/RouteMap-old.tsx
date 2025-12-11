import React, { useEffect, useState, useRef, useMemo } from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import type { Delivery } from '../types';
import { calculateDistance, formatDistance } from '../services/location';
import { formatETA } from '../utils/routeOptimization';

interface RouteMapProps {
  deliveries: Delivery[];
  currentDeliveryId?: string;
  style?: any;
  showAllStops?: boolean; // Show all stops or just current
}

export default function RouteMap({
  deliveries,
  currentDeliveryId,
  style,
  showAllStops = true,
}: RouteMapProps) {
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const mapRef = useRef<MapView>(null);

  // Memoize deliveries to prevent unnecessary re-renders
  const displayDeliveries = useMemo(() => {
    if (!showAllStops && currentDeliveryId) {
      // Show only current delivery
      return deliveries.filter((d) => d._id === currentDeliveryId);
    }
    return deliveries;
  }, [deliveries, currentDeliveryId, showAllStops]);

  // Memoize current delivery index
  const currentIndex = useMemo(() => {
    return deliveries.findIndex((d) => d._id === currentDeliveryId);
  }, [deliveries, currentDeliveryId]);

  useEffect(() => {
    let subscription: Location.LocationSubscription;

    const watchLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        console.warn('Location permission not granted');
        return;
      }

      // Get initial location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const coords = {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      };

      setCurrentLocation(coords);
      updateRegion(coords);

      // Watch location changes
      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (location) => {
          const coords = {
            lat: location.coords.latitude,
            lng: location.coords.longitude,
          };
          setCurrentLocation(coords);
        }
      );
    };

    watchLocation();

    return () => {
      subscription?.remove();
    };
  }, [deliveries]);

  const updateRegion = (currentCoords: { lat: number; lng: number }) => {
    if (displayDeliveries.length === 0) return;

    // Calculate bounds to fit all markers
    let minLat = currentCoords.lat;
    let maxLat = currentCoords.lat;
    let minLng = currentCoords.lng;
    let maxLng = currentCoords.lng;

    displayDeliveries.forEach((delivery) => {
      const shopLat = delivery.shopId.location.coordinates[1];
      const shopLng = delivery.shopId.location.coordinates[0];

      minLat = Math.min(minLat, shopLat);
      maxLat = Math.max(maxLat, shopLat);
      minLng = Math.min(minLng, shopLng);
      maxLng = Math.max(maxLng, shopLng);
    });

    // Calculate center and deltas
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    const latDelta = (maxLat - minLat) * 1.5; // Add 50% padding
    const lngDelta = (maxLng - minLng) * 1.5;

    setRegion({
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta: Math.max(latDelta, 0.01),
      longitudeDelta: Math.max(lngDelta, 0.01),
    });
  };

  // Generate polyline coordinates
  const polylineCoordinates = useMemo(() => {
    if (!currentLocation || displayDeliveries.length === 0) return [];

    const coords = [
      {
        latitude: currentLocation.lat,
        longitude: currentLocation.lng,
      },
    ];

    displayDeliveries.forEach((delivery) => {
      coords.push({
        latitude: delivery.shopId.location.coordinates[1],
        longitude: delivery.shopId.location.coordinates[0],
      });
    });

    return coords;
  }, [currentLocation, displayDeliveries]);

  // Calculate distance to next shop
  const distanceToNext = useMemo(() => {
    if (!currentLocation || displayDeliveries.length === 0) return null;

    const nextDelivery = displayDeliveries[0];
    const shopLat = nextDelivery.shopId.location.coordinates[1];
    const shopLng = nextDelivery.shopId.location.coordinates[0];

    return calculateDistance(currentLocation.lat, currentLocation.lng, shopLat, shopLng);
  }, [currentLocation, displayDeliveries]);

  if (!currentLocation || !region) {
    return (
      <View style={[styles.container, styles.loadingContainer, style]}>
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={mapRef}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        style={styles.map}
        region={region}
        showsUserLocation
        showsMyLocationButton
        followsUserLocation={false}
        loadingEnabled
      >
        {/* Polyline connecting all stops */}
        {polylineCoordinates.length > 1 && (
          <Polyline
            coordinates={polylineCoordinates}
            strokeColor="#0066CC"
            strokeWidth={3}
            lineDashPattern={[1]}
          />
        )}

        {/* Shop markers with numbers */}
        {displayDeliveries.map((delivery, index) => {
          const shop = delivery.shopId;
          const shopLat = shop.location.coordinates[1];
          const shopLng = shop.location.coordinates[0];
          const isCurrent = delivery._id === currentDeliveryId;
          const isCompleted = delivery.status === 'completed';
          const isPending = delivery.status === 'pending';

          // Determine marker color
          let pinColor = '#0066CC'; // Default blue
          if (isCompleted) {
            pinColor = '#4CAF50'; // Green for completed
          } else if (isCurrent) {
            pinColor = '#FF9800'; // Orange for current
          } else if (isPending) {
            pinColor = '#999999'; // Grey for pending
          }

          return (
            <Marker
              key={delivery._id}
              coordinate={{
                latitude: shopLat,
                longitude: shopLng,
              }}
              title={shop.shopName}
              description={`Stop ${delivery.deliverySequence} - ${shop.address}`}
              pinColor={pinColor}
            >
              {/* Custom marker with number */}
              <View
                style={[
                  styles.markerContainer,
                  isCurrent && styles.currentMarker,
                  isCompleted && styles.completedMarker,
                ]}
              >
                <Text style={styles.markerText}>{delivery.deliverySequence}</Text>
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* Distance badge */}
      {distanceToNext !== null && (
        <View style={styles.distanceBadge}>
          <Text style={styles.distanceLabel}>Next Stop</Text>
          <Text style={styles.distanceValue}>{formatDistance(distanceToNext)}</Text>
        </View>
      )}

      {/* Route summary */}
      {showAllStops && displayDeliveries.length > 1 && (
        <View style={styles.routeSummary}>
          <View style={styles.summaryRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#FF9800' }]} />
              <Text style={styles.legendText}>Current</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#0066CC' }]} />
              <Text style={styles.legendText}>Upcoming</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
              <Text style={styles.legendText}>Completed</Text>
            </View>
          </View>
          <Text style={styles.summaryText}>
            {displayDeliveries.filter((d) => d.status === 'completed').length} of{' '}
            {displayDeliveries.length} stops completed
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: 12,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
  },
  markerContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0066CC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  currentMarker: {
    backgroundColor: '#FF9800',
    borderWidth: 4,
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  completedMarker: {
    backgroundColor: '#4CAF50',
  },
  markerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  distanceBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  distanceLabel: {
    fontSize: 11,
    color: '#666666',
    fontWeight: '500',
    marginBottom: 2,
  },
  distanceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0066CC',
  },
  routeSummary: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#666666',
  },
  summaryText: {
    fontSize: 13,
    color: '#1A1A1A',
    fontWeight: '600',
    textAlign: 'center',
  },
});
