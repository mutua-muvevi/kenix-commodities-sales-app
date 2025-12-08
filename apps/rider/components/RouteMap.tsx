import { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import type { Shop } from '../types';

interface RouteMapProps {
  shop: Shop;
  style?: any;
}

export default function RouteMap({ shop, style }: RouteMapProps) {
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
        {/* Shop Marker */}
        <Marker
          coordinate={{
            latitude: shopLat,
            longitude: shopLng,
          }}
          title={shop.shopName}
          description={shop.address}
          pinColor="#FF0000"
        />

        {/* Route Line */}
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
          strokeColor="#0066CC"
          strokeWidth={3}
        />
      </MapView>
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
});
