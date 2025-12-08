/**
 * RouteMap Component
 * Google Maps integration displaying route with shop markers.
 *
 * Features:
 * - Google Maps integration (react-native-maps)
 * - Shop markers with custom colors
 * - Route polyline connecting shops
 * - Current location marker
 * - Fit to show all markers
 * - Shop callouts with info
 *
 * @example
 * ```tsx
 * <RouteMap
 *   route={route}
 *   currentLocation={{ latitude: -1.2921, longitude: 36.8219 }}
 *   onShopPress={(shop) => navigate(`/shops/${shop._id}`)}
 * />
 * ```
 */

import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';
import { ShopMarker } from './ShopMarker';
import { theme } from '@/theme';
import type { Route, RouteShop } from '@/types';

export interface RouteMapProps {
  /**
   * Route data
   */
  route: Route;

  /**
   * Current location coordinates
   */
  currentLocation?: {
    latitude: number;
    longitude: number;
  };

  /**
   * Handler for shop marker press
   */
  onShopPress?: (shop: RouteShop) => void;

  /**
   * Map style
   */
  style?: any;

  /**
   * Test ID
   */
  testID?: string;
}

/**
 * Default Nairobi center coordinates
 */
const DEFAULT_REGION = {
  latitude: -1.2921,
  longitude: 36.8219,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

/**
 * RouteMap Component
 */
export const RouteMap: React.FC<RouteMapProps> = ({
  route,
  currentLocation,
  onShopPress,
  style,
  testID,
}) => {
  const mapRef = useRef<MapView>(null);

  /**
   * Get coordinates from route shops
   */
  const getShopCoordinates = (): Array<{ latitude: number; longitude: number }> => {
    return route.shops
      .filter((rs) => rs.location)
      .map((rs) => ({
        latitude: rs.location!.latitude,
        longitude: rs.location!.longitude,
      }));
  };

  /**
   * Fit map to show all markers
   */
  useEffect(() => {
    const coordinates = getShopCoordinates();

    if (coordinates.length > 0 && mapRef.current) {
      // Add current location if available
      if (currentLocation) {
        coordinates.push(currentLocation);
      }

      // Fit to coordinates
      setTimeout(() => {
        mapRef.current?.fitToCoordinates(coordinates, {
          edgePadding: {
            top: 50,
            right: 50,
            bottom: 50,
            left: 50,
          },
          animated: true,
        });
      }, 500);
    }
  }, [route.shops, currentLocation]);

  const shopCoordinates = getShopCoordinates();

  return (
    <View style={[styles.container, style]} testID={testID}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={DEFAULT_REGION}
        showsUserLocation={!!currentLocation}
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
        loadingEnabled={true}
      >
        {/* Current Location Marker */}
        {currentLocation && (
          <Marker
            coordinate={currentLocation}
            title="Your Location"
            description="Current position"
          >
            <View style={styles.currentLocationMarker}>
              <Ionicons
                name="navigate"
                size={24}
                color={theme.palette.info.main}
              />
            </View>
          </Marker>
        )}

        {/* Route Polyline */}
        {shopCoordinates.length > 1 && (
          <Polyline
            coordinates={shopCoordinates}
            strokeColor={theme.palette.primary.main}
            strokeWidth={3}
            lineDashPattern={[10, 5]}
          />
        )}

        {/* Shop Markers */}
        {route.shops.map((routeShop, index) => {
          if (!routeShop.location) return null;

          return (
            <ShopMarker
              key={`shop-marker-${index}`}
              shop={routeShop}
              index={index + 1}
              onPress={() => onShopPress?.(routeShop)}
            />
          );
        })}
      </MapView>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendDot,
              { backgroundColor: theme.palette.success.main },
            ]}
          />
          <Animated.Text style={styles.legendText}>
            Visited
          </Animated.Text>
        </View>

        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendDot,
              { backgroundColor: theme.palette.warning.main },
            ]}
          />
          <Animated.Text style={styles.legendText}>
            Current
          </Animated.Text>
        </View>

        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendDot,
              { backgroundColor: theme.palette.grey[400] },
            ]}
          />
          <Animated.Text style={styles.legendText}>
            Pending
          </Animated.Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  currentLocationMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.z4,
  },
  legend: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.z8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.palette.text.primary,
  },
});

export default RouteMap;
