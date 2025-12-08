import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Linking,
  Alert,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { useShopStore } from '../../store/shopStore';

type FilterTab = 'all' | 'pending' | 'approved' | 'rejected';
type ViewMode = 'list' | 'map';

export default function ShopsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { shops, isLoading, fetchShops } = useShopStore();

  const [filter, setFilter] = useState<FilterTab>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?._id) {
      loadShops();
    }
  }, [user, filter]);

  const loadShops = async () => {
    if (!user?._id) return;

    const statusFilter = filter === 'all' ? undefined : filter;
    await fetchShops(user._id, statusFilter);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadShops();
    setRefreshing(false);
  };

  const getFilteredShops = () => {
    if (filter === 'all') return shops;
    return shops.filter((shop) => shop.approvalStatus === filter);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { bg: '#fef3c7', color: '#f59e0b', text: 'Pending' },
      approved: { bg: '#dcfce7', color: '#22c55e', text: 'Approved' },
      rejected: { bg: '#fee2e2', color: '#ef4444', text: 'Rejected' },
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleViewDetails = (shopId: string) => {
    router.push(`/shop/${shopId}`);
  };

  const handlePlaceOrder = (shop: any) => {
    if (shop.approvalStatus !== 'approved') {
      Alert.alert('Not Available', 'Can only place orders for approved shops');
      return;
    }
    router.push({
      pathname: '/(tabs)/orders',
      params: { shopId: shop._id, shopName: shop.shopName },
    });
  };

  const renderShopCard = ({ item }: { item: any }) => {
    const badge = getStatusBadge(item.approvalStatus);

    return (
      <View style={styles.shopCard}>
        <View style={styles.shopCardHeader}>
          <View style={styles.shopCardMain}>
            <Text style={styles.shopName}>{item.shopName}</Text>
            <Text style={styles.ownerName}>{item.name}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.badgeText, { color: badge.color }]}>{badge.text}</Text>
          </View>
        </View>

        <View style={styles.shopCardBody}>
          <View style={styles.infoRow}>
            <Ionicons name="call" size={16} color="#6b7280" />
            <Text style={styles.infoText}>{item.phoneNumber}</Text>
            <TouchableOpacity onPress={() => handleCall(item.phoneNumber)}>
              <Ionicons name="call-outline" size={20} color="#22c55e" />
            </TouchableOpacity>
          </View>

          {item.address && (
            <View style={styles.infoRow}>
              <Ionicons name="location" size={16} color="#6b7280" />
              <Text style={styles.infoText} numberOfLines={1}>
                {[item.address.area, item.address.city].filter(Boolean).join(', ')}
              </Text>
            </View>
          )}

          {item.rejectionReason && item.approvalStatus === 'rejected' && (
            <View style={[styles.infoRow, styles.rejectionBox]}>
              <Ionicons name="information-circle" size={16} color="#ef4444" />
              <Text style={styles.rejectionText}>{item.rejectionReason}</Text>
            </View>
          )}
        </View>

        <View style={styles.shopCardFooter}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleViewDetails(item._id)}
          >
            <Ionicons name="eye-outline" size={18} color="#3b82f6" />
            <Text style={styles.actionButtonText}>Details</Text>
          </TouchableOpacity>

          {item.approvalStatus === 'approved' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryActionButton]}
              onPress={() => handlePlaceOrder(item)}
            >
              <Ionicons name="cart-outline" size={18} color="#fff" />
              <Text style={styles.primaryActionButtonText}>Place Order</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderMapView = () => {
    const validShops = getFilteredShops().filter(
      (shop) => shop.location?.coordinates && shop.location.coordinates.length === 2
    );

    if (validShops.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="map-outline" size={64} color="#9ca3af" />
          <Text style={styles.emptyText}>No shops with location data</Text>
        </View>
      );
    }

    // Calculate map region to fit all markers
    const latitudes = validShops.map((shop) => shop.location!.coordinates[1]);
    const longitudes = validShops.map((shop) => shop.location!.coordinates[0]);

    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);

    const region = {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max(maxLat - minLat, 0.02) * 1.5,
      longitudeDelta: Math.max(maxLng - minLng, 0.02) * 1.5,
    };

    return (
      <MapView provider={PROVIDER_GOOGLE} style={styles.map} initialRegion={region} region={region}>
        {validShops.map((shop) => {
          const badge = getStatusBadge(shop.approvalStatus);
          return (
            <Marker
              key={shop._id}
              coordinate={{
                latitude: shop.location!.coordinates[1],
                longitude: shop.location!.coordinates[0],
              }}
              title={shop.shopName}
              description={shop.name}
              onCalloutPress={() => handleViewDetails(shop._id)}
            >
              <View style={[styles.mapMarker, { backgroundColor: badge.color }]}>
                <Ionicons name="storefront" size={20} color="#fff" />
              </View>
            </Marker>
          );
        })}
      </MapView>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="storefront-outline" size={64} color="#9ca3af" />
      <Text style={styles.emptyText}>No shops found</Text>
      <Text style={styles.emptySubtext}>
        {filter === 'all'
          ? 'Start by registering your first shop'
          : `No ${filter} shops at the moment`}
      </Text>
      {filter === 'all' && (
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => router.push('/shop/register')}
        >
          <Ionicons name="add-circle" size={20} color="#fff" />
          <Text style={styles.emptyButtonText}>Register Shop</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const filteredShops = getFilteredShops();

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, filter === 'all' && styles.tabActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.tabText, filter === 'all' && styles.tabTextActive]}>
            All ({shops.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, filter === 'pending' && styles.tabActive]}
          onPress={() => setFilter('pending')}
        >
          <Text style={[styles.tabText, filter === 'pending' && styles.tabTextActive]}>
            Pending ({shops.filter((s) => s.approvalStatus === 'pending').length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, filter === 'approved' && styles.tabActive]}
          onPress={() => setFilter('approved')}
        >
          <Text style={[styles.tabText, filter === 'approved' && styles.tabTextActive]}>
            Approved ({shops.filter((s) => s.approvalStatus === 'approved').length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, filter === 'rejected' && styles.tabActive]}
          onPress={() => setFilter('rejected')}
        >
          <Text style={[styles.tabText, filter === 'rejected' && styles.tabTextActive]}>
            Rejected ({shops.filter((s) => s.approvalStatus === 'rejected').length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* View Mode Toggle */}
      <View style={styles.viewModeContainer}>
        <View style={styles.viewModeToggle}>
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === 'list' && styles.viewModeButtonActive]}
            onPress={() => setViewMode('list')}
          >
            <Ionicons name="list" size={20} color={viewMode === 'list' ? '#fff' : '#6b7280'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === 'map' && styles.viewModeButtonActive]}
            onPress={() => setViewMode('map')}
          >
            <Ionicons name="map" size={20} color={viewMode === 'map' ? '#fff' : '#6b7280'} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/shop/register')}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Add Shop</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {viewMode === 'list' ? (
        <FlatList
          data={filteredShops}
          renderItem={renderShopCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={renderEmptyList}
        />
      ) : (
        renderMapView()
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#22c55e',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  tabTextActive: {
    color: '#22c55e',
  },
  viewModeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  viewModeToggle: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 2,
  },
  viewModeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  viewModeButtonActive: {
    backgroundColor: '#22c55e',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22c55e',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  shopCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  shopCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  shopCardMain: {
    flex: 1,
    marginRight: 8,
  },
  shopName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  ownerName: {
    fontSize: 14,
    color: '#6b7280',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  shopCardBody: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#4b5563',
  },
  rejectionBox: {
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
    marginTop: 4,
  },
  rejectionText: {
    flex: 1,
    fontSize: 12,
    color: '#ef4444',
  },
  shopCardFooter: {
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
    borderWidth: 1,
    borderColor: '#3b82f6',
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  primaryActionButton: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  primaryActionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  map: {
    flex: 1,
  },
  mapMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22c55e',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
    gap: 8,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
