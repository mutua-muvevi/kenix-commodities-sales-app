import { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import MapView, { Marker, Polyline, Polygon, Circle, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import type { Shop } from '../types';
import {
  createRouteCorridor,
  type RoutePoint,
  type DeviationStatus,
} from '../services/deviation';

interface RouteMapProps {
  shop: Shop;
  style?: any;
  deviationStatus?: DeviationStatus | null;
  showCorridor?: boolean;
  remainingShops?: Shop[];
}

export default function RouteMap({
  shop,
  style,
  deviationStatus,
  showCorridor = true,
  remainingShops = [],
}: RouteMapProps) {
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [region, setRegion] = useState<Region | null>(null);

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
  }, [shop]);

  const updateRegion = (currentCoords: { lat: number; lng: number }) => {
    const shopLat = shop.location.coordinates[1];
    const shopLng = shop.location.coordinates[0];

    // Calculate midpoint
    const midLat = (currentCoords.lat + shopLat) / 2;
    const midLng = (currentCoords.lng + shopLng) / 2;

    // Calculate deltas to fit both points
    const latDelta = Math.abs(currentCoords.lat - shopLat) * 2.5;
    const lngDelta = Math.abs(currentCoords.lng - shopLng) * 2.5;

    setRegion({
      latitude: midLat,
      longitude: midLng,
      latitudeDelta: Math.max(latDelta, 0.01),
      longitudeDelta: Math.max(lngDelta, 0.01),
    });
  };

  if (!currentLocation || !region) {
    return (
      <View style={[styles.container, styles.loadingContainer, style]}>
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  const shopLat = shop.location.coordinates[1];
  const shopLng = shop.location.coordinates[0];

  // Build route polyline (current location -> current shop -> remaining shops)
  const routePolyline: RoutePoint[] = [
    currentLocation,
    { lat: shopLat, lng: shopLng },
    ...remainingShops.map((s) => ({
      lat: s.location.coordinates[1],
      lng: s.location.coordinates[0],
    })),
  ];

  // Create route corridor for visualization
  const corridorPolygon = showCorridor
    ? createRouteCorridor(routePolyline.slice(0, 2)) // Just show corridor to next shop
    : [];

  // Get deviation color based on status
  const deviationColor = deviationStatus?.color || '#4CAF50';
  const deviationText =
    deviationStatus?.message || 'Monitoring route...';

  return (
    <View style={[styles.container, style]}>
      <MapView
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        style={styles.map}
        region={region}
        showsUserLocation
        showsMyLocationButton
        followsUserLocation
      >
        {/* Route Corridor (acceptable deviation zone) */}
        {showCorridor && corridorPolygon.length > 0 && (
          <Polygon
            coordinates={corridorPolygon.map((p) => ({
              latitude: p.lat,
              longitude: p.lng,
            }))}
            fillColor="rgba(0, 102, 204, 0.1)"
            strokeColor="rgba(0, 102, 204, 0.3)"
            strokeWidth={1}
          />
        )}

        {/* Geofence Circle around current shop (100m arrival zone) */}
        <Circle
          center={{
            latitude: shopLat,
            longitude: shopLng,
          }}
          radius={100} // 100 meters
          fillColor="rgba(76, 175, 80, 0.1)"
          strokeColor="rgba(76, 175, 80, 0.5)"
          strokeWidth={2}
        />

        {/* Current Shop Marker */}
        <Marker
          coordinate={{
            latitude: shopLat,
            longitude: shopLng,
          }}
          title={shop.shopName}
          description={shop.address}
          pinColor="#FF0000"
        />

        {/* Remaining Shops Markers (if provided) */}
        {remainingShops.map((s, index) => (
          <Marker
            key={s._id}
            coordinate={{
              latitude: s.location.coordinates[1],
              longitude: s.location.coordinates[0],
            }}
            title={`Stop ${index + 2}: ${s.shopName}`}
            description={s.address}
            pinColor="#FFA500"
            opacity={0.6}
          />
        ))}

        {/* Route Line from current location to current shop */}
        <Polyline
          coordinates={[
            {
              latitude: currentLocation.lat,
              longitude: currentLocation.lng,
            },
            {
              latitude: shopLat,
              longitude: shopLng,
            },
          ]}
          strokeColor={deviationColor}
          strokeWidth={4}
          lineDashPattern={
            deviationStatus?.severity === 'warning' ||
            deviationStatus?.severity === 'critical'
              ? [10, 5]
              : undefined
          }
        />

        {/* Route Line through remaining shops (if provided) */}
        {remainingShops.length > 0 && (
          <Polyline
            coordinates={remainingShops.map((s) => ({
              latitude: s.location.coordinates[1],
              longitude: s.location.coordinates[0],
            }))}
            strokeColor="#0066CC"
            strokeWidth={3}
            lineDashPattern={[5, 5]}
            opacity={0.5}
          />
        )}
      </MapView>

      {/* Deviation Status Banner */}
      {deviationStatus && (
        <View
          style={[
            styles.deviationBanner,
            { backgroundColor: deviationColor },
          ]}
        >
          <View
            style={[
              styles.deviationIndicator,
              {
                backgroundColor:
                  deviationStatus.severity === 'none'
                    ? '#FFFFFF'
                    : deviationStatus.severity === 'minor'
                    ? '#FFEB3B'
                    : deviationStatus.severity === 'warning'
                    ? '#FF9800'
                    : '#F44336',
              },
            ]}
          />
          <Text style={styles.deviationText}>{deviationText}</Text>
          {deviationStatus.distanceFromRoute > 0 && (
            <Text style={styles.deviationDistance}>
              {deviationStatus.distanceFromRoute < 1
                ? `${Math.round(deviationStatus.distanceFromRoute * 1000)}m`
                : `${deviationStatus.distanceFromRoute.toFixed(1)}km`}{' '}
              from route
            </Text>
          )}
        </View>
      )}

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
          <Text style={styles.legendText}>Arrival Zone (100m)</Text>
        </View>
        {showCorridor && (
          <View style={styles.legendItem}>
            <View
              style={[styles.legendDot, { backgroundColor: '#0066CC', opacity: 0.3 }]}
            />
            <Text style={styles.legendText}>Safe Corridor (500m)</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: 12,
    position: 'relative',
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
  deviationBanner: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  deviationIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  deviationText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  deviationDistance: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  legend: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
    color: '#333333',
  },
});
