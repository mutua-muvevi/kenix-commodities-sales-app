/**
 * Routes Screen - Route Management for Sales Agents
 *
 * Critical missing feature for the Sales Agent App
 *
 * Features:
 * - List of assigned routes with status filters
 * - Today's route prominently displayed
 * - Progress tracking (shops visited/total)
 * - Map view toggle
 * - Pull-to-refresh
 * - Empty states
 * - Status-based filtering
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { ScreenWrapper } from '../../components/layout/ScreenWrapper';
import { useRoutes, useRouteActions, useRouteLoading } from '../../store/hooks/use-route';
import { Route, RouteStatus } from '../../types/route';
import { useTheme } from '../../hooks/useTheme';

const { width } = Dimensions.get('window');

type FilterTab = 'all' | 'planned' | 'in_progress' | 'completed';

export default function RoutesScreen() {
  const { theme } = useTheme();
  const routes = useRoutes();
  const isLoading = useRouteLoading();
  const { fetchRoutes, refreshRoutes } = useRouteActions();

  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchRoutes();
  }, []);

  // Filter routes based on active filter
  const filteredRoutes = useMemo(() => {
    if (activeFilter === 'all') return routes;

    const statusMap: Record<FilterTab, RouteStatus[]> = {
      all: [],
      planned: ['planned'],
      in_progress: ['in_progress', 'paused'],
      completed: ['completed'],
    };

    return routes.filter((route) => statusMap[activeFilter]?.includes(route.status));
  }, [routes, activeFilter]);

  // Identify today's route
  const todaysRoute = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return routes.find((route) => {
      const routeDate = route.scheduledDate.split('T')[0];
      return routeDate === today && route.status !== 'completed';
    });
  }, [routes]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshRoutes();
    setRefreshing(false);
  };

  const handleStartRoute = (routeId: string) => {
    router.push(`/route/${routeId}`);
  };

  const handleViewDetails = (routeId: string) => {
    router.push(`/route/${routeId}`);
  };

  const getStatusColor = (status: RouteStatus) => {
    switch (status) {
      case 'planned':
        return theme.palette.info.main;
      case 'in_progress':
        return theme.palette.warning.main;
      case 'paused':
        return theme.palette.warning.dark;
      case 'completed':
        return theme.palette.success.main;
      case 'cancelled':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getStatusIcon = (status: RouteStatus) => {
    switch (status) {
      case 'planned':
        return 'calendar-outline';
      case 'in_progress':
        return 'navigate-circle-outline';
      case 'paused':
        return 'pause-circle-outline';
      case 'completed':
        return 'checkmark-circle-outline';
      case 'cancelled':
        return 'close-circle-outline';
      default:
        return 'help-circle-outline';
    }
  };

  const getProgressPercentage = (route: Route) => {
    if (route.totalShops === 0) return 0;
    return Math.round((route.completedShops / route.totalShops) * 100);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const dateOnly = date.toISOString().split('T')[0];
    const todayOnly = today.toISOString().split('T')[0];
    const tomorrowOnly = tomorrow.toISOString().split('T')[0];
    const yesterdayOnly = yesterday.toISOString().split('T')[0];

    if (dateOnly === todayOnly) return 'Today';
    if (dateOnly === tomorrowOnly) return 'Tomorrow';
    if (dateOnly === yesterdayOnly) return 'Yesterday';

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderFilterTab = (tab: FilterTab, label: string) => {
    const isActive = activeFilter === tab;
    const count = tab === 'all' ? routes.length : filteredRoutes.length;

    return (
      <TouchableOpacity
        key={tab}
        style={[
          styles.filterTab,
          isActive && { backgroundColor: theme.palette.primary.main },
        ]}
        onPress={() => setActiveFilter(tab)}
      >
        <Text
          style={[
            styles.filterTabText,
            { color: isActive ? theme.palette.common.white : theme.palette.text.secondary },
          ]}
        >
          {label}
        </Text>
        {isActive && (
          <View style={[styles.filterBadge, { backgroundColor: theme.palette.common.white }]}>
            <Text style={[styles.filterBadgeText, { color: theme.palette.primary.main }]}>
              {count}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderRouteCard = ({ item: route }: { item: Route }) => {
    const isToday = todaysRoute?._id === route._id;
    const progress = getProgressPercentage(route);

    return (
      <TouchableOpacity
        style={[
          styles.routeCard,
          {
            backgroundColor: theme.palette.background.paper,
            borderColor: isToday ? theme.palette.primary.main : theme.palette.divider,
            borderWidth: isToday ? 2 : 1,
          },
        ]}
        onPress={() => handleViewDetails(route._id)}
      >
        {isToday && (
          <View style={[styles.todayBadge, { backgroundColor: theme.palette.primary.main }]}>
            <Ionicons name="star" size={12} color={theme.palette.common.white} />
            <Text style={[styles.todayBadgeText, { color: theme.palette.common.white }]}>
              Today's Route
            </Text>
          </View>
        )}

        <View style={styles.routeHeader}>
          <View style={styles.routeTitle}>
            <Ionicons
              name="map-outline"
              size={20}
              color={theme.palette.primary.main}
              style={styles.routeIcon}
            />
            <Text style={[styles.routeName, { color: theme.palette.text.primary }]}>
              {route.name}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(route.status) + '20' },
            ]}
          >
            <Ionicons
              name={getStatusIcon(route.status) as any}
              size={14}
              color={getStatusColor(route.status)}
            />
            <Text style={[styles.statusText, { color: getStatusColor(route.status) }]}>
              {route.status.replace('_', ' ')}
            </Text>
          </View>
        </View>

        {route.description && (
          <Text style={[styles.routeDescription, { color: theme.palette.text.secondary }]}>
            {route.description}
          </Text>
        )}

        <View style={styles.routeStats}>
          <View style={styles.statItem}>
            <Ionicons name="calendar-outline" size={16} color={theme.palette.text.secondary} />
            <Text style={[styles.statText, { color: theme.palette.text.secondary }]}>
              {formatDate(route.scheduledDate)}
            </Text>
          </View>

          <View style={styles.statItem}>
            <Ionicons name="business-outline" size={16} color={theme.palette.text.secondary} />
            <Text style={[styles.statText, { color: theme.palette.text.secondary }]}>
              {route.completedShops}/{route.totalShops} shops
            </Text>
          </View>

          {route.totalDistance && (
            <View style={styles.statItem}>
              <Ionicons name="navigate-outline" size={16} color={theme.palette.text.secondary} />
              <Text style={[styles.statText, { color: theme.palette.text.secondary }]}>
                {route.totalDistance.toFixed(1)} km
              </Text>
            </View>
          )}
        </View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View style={[styles.progressBar, { backgroundColor: theme.palette.grey[200] }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progress}%`,
                  backgroundColor: theme.palette.primary.main,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: theme.palette.text.secondary }]}>
            {progress}%
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.routeActions}>
          {route.status === 'planned' && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.palette.primary.main }]}
              onPress={() => handleStartRoute(route._id)}
            >
              <Ionicons name="play-outline" size={16} color={theme.palette.common.white} />
              <Text style={[styles.actionButtonText, { color: theme.palette.common.white }]}>
                Start Route
              </Text>
            </TouchableOpacity>
          )}

          {route.status === 'in_progress' && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.palette.warning.main }]}
              onPress={() => handleViewDetails(route._id)}
            >
              <Ionicons name="navigate-outline" size={16} color={theme.palette.common.white} />
              <Text style={[styles.actionButtonText, { color: theme.palette.common.white }]}>
                Continue Route
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.secondaryButton,
              { borderColor: theme.palette.divider },
            ]}
            onPress={() => handleViewDetails(route._id)}
          >
            <Ionicons name="eye-outline" size={16} color={theme.palette.primary.main} />
            <Text style={[styles.actionButtonText, { color: theme.palette.primary.main }]}>
              View Details
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderMapView = () => {
    if (filteredRoutes.length === 0) {
      return renderEmptyState();
    }

    // Get all shop coordinates from filtered routes
    const markers: Array<{ lat: number; lng: number; shopId: string; routeId: string }> = [];
    const routeLines: Array<{ coordinates: Array<{ latitude: number; longitude: number }> }> = [];

    filteredRoutes.forEach((route) => {
      const coordinates: Array<{ latitude: number; longitude: number }> = [];

      route.shops.forEach((shop) => {
        if (shop.location) {
          markers.push({
            lat: shop.location.latitude,
            lng: shop.location.longitude,
            shopId: typeof shop.shop === 'string' ? shop.shop : shop.shop._id,
            routeId: route._id,
          });
          coordinates.push({
            latitude: shop.location.latitude,
            longitude: shop.location.longitude,
          });
        }
      });

      if (coordinates.length > 1) {
        routeLines.push({ coordinates });
      }
    });

    // Calculate map region
    const latitudes = markers.map((m) => m.lat);
    const longitudes = markers.map((m) => m.lng);

    const region = markers.length > 0 ? {
      latitude: (Math.max(...latitudes) + Math.min(...latitudes)) / 2,
      longitude: (Math.max(...longitudes) + Math.min(...longitudes)) / 2,
      latitudeDelta: Math.max(...latitudes) - Math.min(...latitudes) + 0.05,
      longitudeDelta: Math.max(...longitudes) - Math.min(...longitudes) + 0.05,
    } : {
      latitude: -1.2921,
      longitude: 36.8219,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    };

    return (
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={region}
        showsUserLocation
        showsMyLocationButton
      >
        {markers.map((marker, index) => (
          <Marker
            key={`${marker.routeId}-${marker.shopId}-${index}`}
            coordinate={{ latitude: marker.lat, longitude: marker.lng }}
            pinColor={theme.palette.primary.main}
          />
        ))}

        {routeLines.map((line, index) => (
          <Polyline
            key={`route-line-${index}`}
            coordinates={line.coordinates}
            strokeColor={theme.palette.primary.main}
            strokeWidth={3}
          />
        ))}
      </MapView>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="map-outline" size={64} color={theme.palette.grey[400]} />
      <Text style={[styles.emptyTitle, { color: theme.palette.text.primary }]}>
        No Routes Found
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.palette.text.secondary }]}>
        {activeFilter === 'all'
          ? 'You have no assigned routes yet'
          : `No ${activeFilter.replace('_', ' ')} routes available`}
      </Text>
    </View>
  );

  const renderMapToggle = () => (
    <TouchableOpacity
      style={styles.mapToggle}
      onPress={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
    >
      <Ionicons
        name={viewMode === 'list' ? 'map' : 'list'}
        size={24}
        color={theme.palette.primary.main}
      />
    </TouchableOpacity>
  );

  if (isLoading && routes.length === 0) {
    return (
      <ScreenWrapper headerTitle="My Routes">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.palette.primary.main} />
          <Text style={[styles.loadingText, { color: theme.palette.text.secondary }]}>
            Loading routes...
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper
      headerTitle="My Routes"
      scrollable={false}
      refreshing={refreshing}
      onRefresh={handleRefresh}
      rightAction={renderMapToggle()}
    >
      {/* Filter Tabs */}
      <View style={[styles.filterContainer, { backgroundColor: theme.palette.background.paper }]}>
        {renderFilterTab('all', 'All')}
        {renderFilterTab('planned', 'Planned')}
        {renderFilterTab('in_progress', 'In Progress')}
        {renderFilterTab('completed', 'Completed')}
      </View>

      {/* Content */}
      {viewMode === 'list' ? (
        <FlatList
          data={filteredRoutes}
          renderItem={renderRouteCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      ) : (
        renderMapView()
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    borderRadius: 12,
    marginBottom: 16,
  },
  filterTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  filterBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 20,
  },
  routeCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  todayBadge: {
    position: 'absolute',
    top: -8,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    gap: 4,
  },
  todayBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  routeTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  routeIcon: {
    marginRight: 8,
  },
  routeName: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  routeDescription: {
    fontSize: 13,
    marginBottom: 12,
    lineHeight: 18,
  },
  routeStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'right',
  },
  routeActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  mapToggle: {
    padding: 8,
  },
  map: {
    width: '100%',
    height: 600,
    borderRadius: 12,
  },
});
