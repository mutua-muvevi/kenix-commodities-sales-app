import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '../../store/authStore';
import { useRouteStore } from '../../store/routeStore';
import { websocketService } from '../../services/websocket';
import { api, deliveryService } from '../../services/api';
import ShopCard from '../../components/ShopCard';
import RouteMap from '../../components/RouteMap';
import DeliveryFlowModal from '../../components/DeliveryFlowModal';
import ShopUnavailableModal from '../../components/ShopUnavailableModal';
import {
  getCurrentLocation,
  isWithinGeofence,
  navigateToShop,
  formatDistance,
  calculateDistance,
} from '../../services/location';

export default function ActiveRouteScreen() {
  const { user } = useAuthStore();
  const {
    activeRoute,
    currentDelivery,
    optimizedDeliveries,
    loadActiveRoute,
    optimizeRoute,
    isLoading,
  } = useRouteStore();
  const [refreshing, setRefreshing] = useState(false);
  const [showDeliveryFlow, setShowDeliveryFlow] = useState(false);
  const [showShopUnavailable, setShowShopUnavailable] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [distanceToShop, setDistanceToShop] = useState<number | null>(null);
  const [expandedDeliveries, setExpandedDeliveries] = useState(true);

  useEffect(() => {
    if (user) {
      loadActiveRoute(user._id);
    }
  }, [user]);

  useEffect(() => {
    // Update current location periodically and re-optimize route
    const interval = setInterval(async () => {
      const location = await getCurrentLocation();
      if (location) {
        setCurrentLocation(location);

        // Calculate distance to current shop
        if (currentDelivery) {
          const shopLat = currentDelivery.shopId.location.coordinates[1];
          const shopLng = currentDelivery.shopId.location.coordinates[0];
          const distance = calculateDistance(
            location.lat,
            location.lng,
            shopLat,
            shopLng
          );
          setDistanceToShop(distance);
        }

        // Re-optimize route based on new location (every 30 seconds)
        if (activeRoute && activeRoute.deliveries.length > 1) {
          optimizeRoute(location);
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [currentDelivery, activeRoute]);

  const onRefresh = async () => {
    if (user) {
      setRefreshing(true);
      await loadActiveRoute(user._id);
      setRefreshing(false);
    }
  };

  const handleNavigate = () => {
    if (currentDelivery) {
      const shop = currentDelivery.shopId;
      navigateToShop(
        shop.location.coordinates[1],
        shop.location.coordinates[0],
        shop.shopName
      );
    }
  };

  const handleArrived = async () => {
    if (!currentDelivery || !currentLocation) return;

    const shop = currentDelivery.shopId;
    const shopLat = shop.location.coordinates[1];
    const shopLng = shop.location.coordinates[0];

    // Check geofence
    const withinGeofence = isWithinGeofence(
      currentLocation.lat,
      currentLocation.lng,
      shopLat,
      shopLng,
      0.1 // 100 meters
    );

    if (!withinGeofence) {
      Alert.alert(
        'Too Far',
        `You're ${formatDistance(distanceToShop || 0)} from the shop. Please get closer before marking arrival.`,
        [{ text: 'OK' }]
      );
      return;
    }

    // Open delivery flow modal
    setShowDeliveryFlow(true);
  };

  const handleShopUnavailable = () => {
    if (!currentDelivery) return;
    setShowShopUnavailable(true);
  };

  const handleSkipRequest = async (data: {
    reason: string;
    notes: string;
    photo?: string;
  }) => {
    if (!currentDelivery || !user) {
      throw new Error('Missing delivery or user information');
    }

    try {
      // Try API call first
      const response = await deliveryService.requestSkip({
        deliveryId: currentDelivery._id,
        shopId: currentDelivery.shopId._id,
        reason: data.reason,
        notes: data.notes,
        photo: data.photo,
        location: currentLocation || undefined,
      });

      Toast.show({
        type: 'success',
        text1: 'Request Sent',
        text2: 'Admin has been notified. Please wait for approval.',
      });

      setShowShopUnavailable(false);
    } catch (error) {
      console.error('Skip request API error:', error);

      // Fallback to WebSocket
      try {
        websocketService.requestShopSkip({
          deliveryId: currentDelivery._id,
          shopId: currentDelivery.shopId._id,
          reason: data.reason,
          notes: data.notes,
          photo: data.photo,
          location: currentLocation || undefined,
        });

        Toast.show({
          type: 'info',
          text1: 'Request Sent via WebSocket',
          text2: 'Waiting for admin approval.',
        });

        setShowShopUnavailable(false);
      } catch (wsError) {
        throw new Error('Failed to send skip request. Please try again.');
      }
    }
  };

  const handleLockedDeliveryPress = () => {
    Alert.alert(
      'Delivery Locked',
      'You must complete deliveries in sequence. Please complete the current delivery before proceeding to the next one.',
      [{ text: 'OK' }]
    );
  };

  if (isLoading && !activeRoute) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={styles.loadingText}>Loading route...</Text>
      </View>
    );
  }

  // No active route
  if (!activeRoute || activeRoute.deliveries.length === 0) {
    return (
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.emptyState}>
          <Ionicons name="bicycle-outline" size={80} color="#CCCCCC" />
          <Text style={styles.emptyTitle}>No Active Deliveries</Text>
          <Text style={styles.emptySubtitle}>
            You don't have any deliveries assigned today.
          </Text>
          <Text style={styles.emptySubtitle}>Pull down to refresh.</Text>
        </View>
      </ScrollView>
    );
  }

  // No current delivery (all completed)
  if (!currentDelivery) {
    return (
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.emptyState}>
          <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
          <Text style={styles.emptyTitle}>All Deliveries Complete!</Text>
          <Text style={styles.emptySubtitle}>
            Great job! You've completed all deliveries for this route.
          </Text>
        </View>
      </ScrollView>
    );
  }

  const currentSequence = currentDelivery.deliverySequence;
  const totalDeliveries = activeRoute.totalDeliveries;
  const remainingDeliveries = totalDeliveries - currentSequence;
  const canArrive =
    currentLocation &&
    distanceToShop !== null &&
    distanceToShop <= 0.1 &&
    currentDelivery.status !== 'arrived' &&
    currentDelivery.status !== 'completed';

  // Sort deliveries by sequence
  const sortedDeliveries = [...activeRoute.deliveries].sort(
    (a, b) => a.deliverySequence - b.deliverySequence
  );

  return (
    <>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Progress Banner */}
        <View style={styles.progressBanner}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressLabel}>Route Progress</Text>
            <Text style={styles.progressText}>
              {currentSequence} of {totalDeliveries} deliveries
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(currentSequence / totalDeliveries) * 100}%` },
              ]}
            />
          </View>
        </View>

        {/* Sequential Enforcement Notice */}
        <View style={styles.noticeCard}>
          <Ionicons name="information-circle" size={24} color="#0066CC" />
          <View style={styles.noticeContent}>
            <Text style={styles.noticeTitle}>Sequential Delivery Required</Text>
            <Text style={styles.noticeText}>
              Deliveries must be completed in order. You cannot skip ahead without admin approval.
            </Text>
          </View>
        </View>

        {/* Current Shop Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Stop</Text>
          <ShopCard
            delivery={currentDelivery}
            currentSequence={currentSequence}
            totalDeliveries={totalDeliveries}
            isLocked={false}
          />
        </View>

        {/* Map - Show full route with all stops */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Route Map</Text>
          <RouteMap
            deliveries={optimizedDeliveries.length > 0 ? optimizedDeliveries : activeRoute.deliveries}
            currentDeliveryId={currentDelivery._id}
            style={styles.map}
            showAllStops={true}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.navigateButton} onPress={handleNavigate}>
            <Ionicons name="navigate" size={20} color="#FFFFFF" />
            <Text style={styles.navigateButtonText}>Navigate to Shop</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.arriveButton,
              !canArrive && styles.arriveButtonDisabled,
            ]}
            onPress={handleArrived}
            disabled={!canArrive}
          >
            <Ionicons
              name="checkmark-circle"
              size={20}
              color={canArrive ? '#FFFFFF' : '#999999'}
            />
            <Text
              style={[
                styles.arriveButtonText,
                !canArrive && styles.arriveButtonTextDisabled,
              ]}
            >
              I've Arrived
            </Text>
          </TouchableOpacity>

          {/* Shop Unavailable Button - only show when at geofence */}
          {canArrive && (
            <TouchableOpacity
              style={styles.shopUnavailableButton}
              onPress={handleShopUnavailable}
            >
              <Ionicons name="close-circle" size={20} color="#FF9800" />
              <Text style={styles.shopUnavailableText}>Shop Unavailable</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Upcoming Deliveries */}
        {remainingDeliveries > 0 && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.upcomingHeader}
              onPress={() => setExpandedDeliveries(!expandedDeliveries)}
            >
              <Text style={styles.sectionTitle}>
                Upcoming Stops ({remainingDeliveries})
              </Text>
              <Ionicons
                name={expandedDeliveries ? 'chevron-up' : 'chevron-down'}
                size={24}
                color="#1A1A1A"
              />
            </TouchableOpacity>

            {expandedDeliveries && (
              <View style={styles.upcomingDeliveries}>
                {sortedDeliveries
                  .filter((d) => d.deliverySequence > currentSequence)
                  .map((delivery) => (
                    <ShopCard
                      key={delivery._id}
                      delivery={delivery}
                      currentSequence={delivery.deliverySequence}
                      totalDeliveries={totalDeliveries}
                      isLocked={!delivery.canProceed}
                      onPressLocked={handleLockedDeliveryPress}
                    />
                  ))}
              </View>
            )}
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Delivery Flow Modal */}
      {showDeliveryFlow && currentDelivery && (
        <DeliveryFlowModal
          delivery={currentDelivery}
          visible={showDeliveryFlow}
          onClose={() => setShowDeliveryFlow(false)}
          onComplete={() => {
            setShowDeliveryFlow(false);
            if (user) {
              loadActiveRoute(user._id);
            }
          }}
        />
      )}

      {/* Shop Unavailable Modal */}
      {showShopUnavailable && currentDelivery && (
        <ShopUnavailableModal
          visible={showShopUnavailable}
          shopName={currentDelivery.shopId.shopName}
          deliveryId={currentDelivery._id}
          onClose={() => setShowShopUnavailable(false)}
          onSubmit={handleSkipRequest}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  progressBanner: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 8,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#666666',
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  noticeCard: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderLeftWidth: 4,
    borderLeftColor: '#0066CC',
  },
  noticeContent: {
    flex: 1,
    marginLeft: 12,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0066CC',
    marginBottom: 4,
  },
  noticeText: {
    fontSize: 14,
    color: '#1565C0',
    lineHeight: 20,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  upcomingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  upcomingDeliveries: {
    gap: 0,
  },
  map: {
    height: 400,
  },
  actions: {
    padding: 16,
    gap: 12,
  },
  navigateButton: {
    flexDirection: 'row',
    backgroundColor: '#0066CC',
    paddingVertical: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  navigateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  arriveButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  arriveButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  arriveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  arriveButtonTextDisabled: {
    color: '#999999',
  },
  shopUnavailableButton: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FF9800',
    paddingVertical: 14,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  shopUnavailableText: {
    color: '#FF9800',
    fontSize: 15,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 40,
  },
});
