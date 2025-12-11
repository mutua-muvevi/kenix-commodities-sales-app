import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  ActivityIndicator,
  RefreshControl,
  Alert,
  FlatList,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import apiService from '../../services/api';
import shopAccountService from '../../services/shop-account';
import CreateAccountModal from '../../components/shop/CreateAccountModal';
import CredentialsModal from '../../components/shop/CredentialsModal';
import { useAuthStore } from '../../store/authStore';
import type { Shop } from '../../types/shop';
import type { Order } from '../../types/order';

export default function ShopDetailsScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();

  const [shop, setShop] = useState<Shop | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Account creation states
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{
    email: string;
    password: string;
    shopName: string;
    phoneNumber: string;
  } | null>(null);

  // Statistics
  const [shopStats, setShopStats] = useState({
    totalOrders: 0,
    totalOrderValue: 0,
    lastOrderDate: null as string | null,
  });

  useEffect(() => {
    loadShopDetails();
    loadShopOrders();
  }, [params.id]);

  const loadShopDetails = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getShopById(params.id as string);
      const shopData = data.user || data;
      setShop(shopData);

      // Calculate stats from shop data
      setShopStats({
        totalOrders: shopData.totalOrders || 0,
        totalOrderValue: shopData.totalSpent || 0,
        lastOrderDate: shopData.lastOrderDate || null,
      });
    } catch (error: any) {
      console.error('Error loading shop details:', error);
      Alert.alert('Error', 'Failed to load shop details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadShopOrders = async () => {
    try {
      setOrdersLoading(true);
      const response = await apiService.getMyOrders(user?._id || '', {
        shopId: params.id as string,
      });
      const ordersData = response.orders || response || [];
      setOrders(ordersData);

      // Calculate stats from orders
      if (ordersData.length > 0) {
        const totalValue = ordersData.reduce((sum: number, order: Order) => sum + order.finalPrice, 0);
        const sortedOrders = [...ordersData].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setShopStats({
          totalOrders: ordersData.length,
          totalOrderValue: totalValue,
          lastOrderDate: sortedOrders[0]?.createdAt || null,
        });
      }
    } catch (error: any) {
      console.error('Error loading shop orders:', error);
      // Don't show alert for orders, as shop details is more important
    } finally {
      setOrdersLoading(false);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([loadShopDetails(), loadShopOrders()]);
    setIsRefreshing(false);
  };

  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleNavigate = () => {
    if (shop?.location?.coordinates) {
      const [lng, lat] = shop.location.coordinates;
      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      Linking.openURL(url);
    }
  };

  const handlePlaceOrder = () => {
    if (!shop) return;
    router.push({
      pathname: '/(tabs)/orders',
      params: { shopId: shop._id, shopName: shop.shopName },
    });
  };

  const handleEditShop = () => {
    if (!shop) return;
    router.push(`/shop/edit/${shop._id}`);
  };

  const handleViewOrder = (orderId: string) => {
    // Navigate to order details if screen exists
    console.log('View order:', orderId);
    Alert.alert('Order Details', `Order ID: ${orderId}`, [{ text: 'OK' }]);
  };

  const handleCreateAccount = () => {
    if (!shop) return;
    setShowCreateAccountModal(true);
  };

  const handleAccountCreated = (credentials: {
    email: string;
    password: string;
    shopName: string;
    phoneNumber: string;
  }) => {
    setCreatedCredentials(credentials);
    setShowCreateAccountModal(false);
    setShowCredentialsModal(true);

    // Reload shop details to update account status
    loadShopDetails();
  };

  const handleResendCredentials = async () => {
    if (!shop) return;

    Alert.alert(
      'Resend Credentials',
      'This will open your SMS app with a message to send the login instructions to the shop owner.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: async () => {
            try {
              await shopAccountService.resendCredentials(shop._id);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to resend credentials');
            }
          },
        },
      ]
    );
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { bg: '#fef3c7', color: '#f59e0b', text: 'Pending Approval', icon: 'time' },
      approved: { bg: '#dcfce7', color: '#22c55e', text: 'Approved', icon: 'checkmark-circle' },
      rejected: { bg: '#fee2e2', color: '#ef4444', text: 'Rejected', icon: 'close-circle' },
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  const getOrderStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; color: string }> = {
      pending: { bg: '#fef3c7', color: '#f59e0b' },
      confirmed: { bg: '#dbeafe', color: '#3b82f6' },
      processing: { bg: '#e0e7ff', color: '#6366f1' },
      ready_for_dispatch: { bg: '#e9d5ff', color: '#a855f7' },
      dispatched: { bg: '#fce7f3', color: '#ec4899' },
      in_transit: { bg: '#fef3c7', color: '#f59e0b' },
      out_for_delivery: { bg: '#dbeafe', color: '#3b82f6' },
      delivered: { bg: '#dcfce7', color: '#22c55e' },
      cancelled: { bg: '#fee2e2', color: '#ef4444' },
      failed: { bg: '#fee2e2', color: '#ef4444' },
    };
    return badges[status] || badges.pending;
  };

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
  };

  const renderOrderItem = ({ item }: { item: Order }) => {
    const statusBadge = getOrderStatusBadge(item.status);
    const productCount = item.products?.length || 0;

    return (
      <TouchableOpacity style={styles.orderCard} onPress={() => handleViewOrder(item._id)}>
        <View style={styles.orderHeader}>
          <View style={styles.orderMain}>
            <Text style={styles.orderId}>Order #{item.orderId}</Text>
            <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
          </View>
          <View style={[styles.orderStatusBadge, { backgroundColor: statusBadge.bg }]}>
            <Text style={[styles.orderStatusText, { color: statusBadge.color }]}>
              {item.status.replace(/_/g, ' ')}
            </Text>
          </View>
        </View>

        <View style={styles.orderBody}>
          <View style={styles.orderInfoRow}>
            <Ionicons name="cube-outline" size={16} color="#6b7280" />
            <Text style={styles.orderInfoText}>
              {productCount} {productCount === 1 ? 'item' : 'items'}
            </Text>
          </View>
          <View style={styles.orderInfoRow}>
            <Ionicons name="cash-outline" size={16} color="#6b7280" />
            <Text style={styles.orderInfoText}>{formatCurrency(item.finalPrice)}</Text>
          </View>
        </View>

        <View style={styles.orderFooter}>
          <Ionicons name="chevron-forward" size={20} color="#6b7280" />
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyOrders = () => (
    <View style={styles.emptyOrders}>
      <Ionicons name="receipt-outline" size={48} color="#9ca3af" />
      <Text style={styles.emptyOrdersText}>No orders yet</Text>
      <Text style={styles.emptyOrdersSubtext}>
        Place the first order for this shop
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22c55e" />
        <Text style={styles.loadingText}>Loading shop details...</Text>
      </View>
    );
  }

  if (!shop) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
        <Text style={styles.errorText}>Shop not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const badge = getStatusBadge(shop.approvalStatus);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={['#22c55e']} />
        }
      >
        {/* Header with Photo */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backIcon} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          {shop.shopPhoto ? (
            <Image source={{ uri: shop.shopPhoto }} style={styles.shopPhoto} />
          ) : (
            <View style={styles.shopPhotoPlaceholder}>
              <Ionicons name="storefront" size={64} color="#9ca3af" />
            </View>
          )}
        </View>

        {/* Shop Info */}
        <View style={styles.content}>
          {/* Status Badge */}
          <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
            <Ionicons name={badge.icon as any} size={20} color={badge.color} />
            <Text style={[styles.statusText, { color: badge.color }]}>{badge.text}</Text>
          </View>

          {/* Shop Name */}
          <Text style={styles.shopName}>{shop.shopName}</Text>
          <Text style={styles.ownerName}>Owner: {shop.name}</Text>

          {/* Rejection Reason */}
          {shop.approvalStatus === 'rejected' && shop.rejectionReason && (
            <View style={styles.rejectionCard}>
              <Ionicons name="information-circle" size={24} color="#ef4444" />
              <View style={styles.rejectionContent}>
                <Text style={styles.rejectionTitle}>Rejection Reason</Text>
                <Text style={styles.rejectionText}>{shop.rejectionReason}</Text>
              </View>
            </View>
          )}

          {/* Shop Statistics */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Ionicons name="receipt-outline" size={24} color="#3b82f6" />
              <Text style={styles.statValue}>{shopStats.totalOrders}</Text>
              <Text style={styles.statLabel}>Total Orders</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="cash-outline" size={24} color="#22c55e" />
              <Text style={styles.statValue}>{formatCurrency(shopStats.totalOrderValue)}</Text>
              <Text style={styles.statLabel}>Total Value</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="calendar-outline" size={24} color="#f59e0b" />
              <Text style={styles.statValue}>
                {shopStats.lastOrderDate ? formatDate(shopStats.lastOrderDate) : 'Never'}
              </Text>
              <Text style={styles.statLabel}>Last Order</Text>
            </View>
          </View>

          {/* Contact Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Ionicons name="call" size={20} color="#22c55e" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Phone Number</Text>
                  <Text style={styles.infoValue}>{shop.phoneNumber}</Text>
                </View>
                <TouchableOpacity onPress={() => handleCall(shop.phoneNumber)}>
                  <Ionicons name="call-outline" size={24} color="#22c55e" />
                </TouchableOpacity>
              </View>

              {shop.email && (
                <View style={styles.infoRow}>
                  <Ionicons name="mail" size={20} color="#22c55e" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Email</Text>
                    <Text style={styles.infoValue}>{shop.email}</Text>
                  </View>
                </View>
              )}

              {shop.businessRegNumber && (
                <View style={styles.infoRow}>
                  <Ionicons name="document-text" size={20} color="#22c55e" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Business Registration</Text>
                    <Text style={styles.infoValue}>{shop.businessRegNumber}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Location */}
          {shop.location?.coordinates && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Location</Text>

              <View style={styles.mapContainer}>
                <MapView
                  provider={PROVIDER_GOOGLE}
                  style={styles.map}
                  initialRegion={{
                    latitude: shop.location.coordinates[1],
                    longitude: shop.location.coordinates[0],
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                  }}
                >
                  <Marker
                    coordinate={{
                      latitude: shop.location.coordinates[1],
                      longitude: shop.location.coordinates[0],
                    }}
                    title={shop.shopName}
                  >
                    <View style={styles.mapMarker}>
                      <Ionicons name="location" size={32} color="#22c55e" />
                    </View>
                  </Marker>
                </MapView>

                <TouchableOpacity style={styles.navigateButton} onPress={handleNavigate}>
                  <Ionicons name="navigate" size={20} color="#fff" />
                  <Text style={styles.navigateButtonText}>Navigate</Text>
                </TouchableOpacity>
              </View>

              {shop.address && (
                <View style={styles.addressCard}>
                  <Ionicons name="location" size={20} color="#6b7280" />
                  <View style={styles.addressContent}>
                    {shop.address.street && <Text style={styles.addressText}>{shop.address.street}</Text>}
                    {shop.address.area && <Text style={styles.addressText}>{shop.address.area}</Text>}
                    <Text style={styles.addressText}>
                      {[shop.address.city, shop.address.county].filter(Boolean).join(', ')}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Operating Hours */}
          {shop.operatingHours && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Operating Hours</Text>

              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Ionicons name="time" size={20} color="#22c55e" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Hours</Text>
                    <Text style={styles.infoValue}>
                      {shop.operatingHours.open || '08:00'} - {shop.operatingHours.close || '20:00'}
                    </Text>
                  </View>
                </View>

                {shop.operatingHours.days && shop.operatingHours.days.length > 0 && (
                  <View style={styles.infoRow}>
                    <Ionicons name="calendar" size={20} color="#22c55e" />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Days</Text>
                      <View style={styles.daysContainer}>
                        {shop.operatingHours.days.map((day: string) => (
                          <View key={day} style={styles.dayChip}>
                            <Text style={styles.dayChipText}>{day.substring(0, 3)}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Special Notes */}
          {shop.specialNotes && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Additional Notes</Text>
              <View style={styles.notesCard}>
                <Text style={styles.notesText}>{shop.specialNotes}</Text>
              </View>
            </View>
          )}

          {/* Order History */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order History</Text>

            {ordersLoading ? (
              <View style={styles.ordersLoading}>
                <ActivityIndicator size="small" color="#22c55e" />
                <Text style={styles.ordersLoadingText}>Loading orders...</Text>
              </View>
            ) : orders.length > 0 ? (
              <FlatList
                data={orders.slice(0, 5)} // Show only last 5 orders
                renderItem={renderOrderItem}
                keyExtractor={(item) => item._id}
                scrollEnabled={false}
                ListFooterComponent={
                  orders.length > 5 ? (
                    <TouchableOpacity
                      style={styles.viewAllButton}
                      onPress={() => {
                        // Navigate to orders filtered by shop
                        router.push({
                          pathname: '/(tabs)/orders',
                          params: { shopId: shop._id },
                        });
                      }}
                    >
                      <Text style={styles.viewAllButtonText}>View All Orders</Text>
                      <Ionicons name="chevron-forward" size={16} color="#22c55e" />
                    </TouchableOpacity>
                  ) : null
                }
              />
            ) : (
              renderEmptyOrders()
            )}
          </View>

          {/* Account Status */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shop Owner Account</Text>

            {shop.accountActivated && shop.email ? (
              <View style={styles.accountCard}>
                <View style={styles.accountHeader}>
                  <View style={styles.accountBadge}>
                    <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                    <Text style={styles.accountBadgeText}>Active</Text>
                  </View>
                </View>

                <View style={styles.accountInfo}>
                  <Ionicons name="mail" size={20} color="#6b7280" />
                  <View style={styles.accountInfoContent}>
                    <Text style={styles.accountInfoLabel}>Login Email</Text>
                    <Text style={styles.accountInfoValue}>{shop.email}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.resendButton}
                  onPress={handleResendCredentials}
                >
                  <Ionicons name="send" size={20} color="#3b82f6" />
                  <Text style={styles.resendButtonText}>Resend Credentials</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.noAccountCard}>
                <Ionicons name="person-circle-outline" size={48} color="#9ca3af" />
                <Text style={styles.noAccountText}>No login account created</Text>
                <Text style={styles.noAccountSubtext}>
                  Create a login account for the shop owner to access the Kenix Shop app
                </Text>
                <TouchableOpacity
                  style={styles.createAccountButton}
                  onPress={handleCreateAccount}
                >
                  <Ionicons name="person-add" size={20} color="#fff" />
                  <Text style={styles.createAccountButtonText}>Create Account</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Registration Date */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Registration Details</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={20} color="#6b7280" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Registered On</Text>
                  <Text style={styles.infoValue}>
                    {new Date(shop.createdAt!).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Create Account Modal */}
      {shop && (
        <CreateAccountModal
          visible={showCreateAccountModal}
          onClose={() => setShowCreateAccountModal(false)}
          onSuccess={handleAccountCreated}
          shopId={shop._id}
          shopName={shop.shopName}
          phoneNumber={shop.phoneNumber}
        />
      )}

      {/* Credentials Modal */}
      {createdCredentials && (
        <CredentialsModal
          visible={showCredentialsModal}
          onClose={() => setShowCredentialsModal(false)}
          credentials={createdCredentials}
        />
      )}

      {/* Action Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.callButton}
          onPress={() => handleCall(shop.phoneNumber)}
        >
          <Ionicons name="call" size={20} color="#fff" />
          <Text style={styles.callButtonText}>Call</Text>
        </TouchableOpacity>

        {shop.approvalStatus === 'pending' && (
          <TouchableOpacity style={styles.editButton} onPress={handleEditShop}>
            <Ionicons name="create-outline" size={20} color="#3b82f6" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        )}

        {shop.approvalStatus === 'approved' && (
          <TouchableOpacity style={styles.orderButton} onPress={handlePlaceOrder}>
            <Ionicons name="cart" size={20} color="#fff" />
            <Text style={styles.orderButtonText}>Place Order</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#f9fafb',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
  },
  backButton: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    height: 250,
    backgroundColor: '#22c55e',
    position: 'relative',
  },
  backIcon: {
    position: 'absolute',
    top: 48,
    left: 16,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shopPhoto: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  shopPhotoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 20,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  shopName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  ownerName: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
  },
  rejectionCard: {
    flexDirection: 'row',
    backgroundColor: '#fee2e2',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
  },
  rejectionContent: {
    flex: 1,
  },
  rejectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
    marginBottom: 4,
  },
  rejectionText: {
    fontSize: 14,
    color: '#991b1b',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  mapContainer: {
    height: 250,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  mapMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navigateButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22c55e',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  navigateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  addressCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addressContent: {
    flex: 1,
  },
  addressText: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 4,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  dayChip: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  dayChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#22c55e',
  },
  notesCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notesText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  ordersLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  ordersLoadingText: {
    fontSize: 14,
    color: '#6b7280',
  },
  orderCard: {
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
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderMain: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  orderStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  orderStatusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  orderBody: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  orderInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  orderInfoText: {
    fontSize: 14,
    color: '#4b5563',
  },
  orderFooter: {
    alignItems: 'flex-end',
  },
  emptyOrders: {
    alignItems: 'center',
    padding: 32,
  },
  emptyOrdersText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 12,
  },
  emptyOrdersSubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  viewAllButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#22c55e',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  callButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  editButtonText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22c55e',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  orderButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  accountCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  accountHeader: {
    marginBottom: 16,
  },
  accountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
    alignSelf: 'flex-start',
  },
  accountBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#15803d',
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  accountInfoContent: {
    flex: 1,
  },
  accountInfoLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  accountInfoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  resendButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  noAccountCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noAccountText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  noAccountSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  createAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22c55e',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  createAccountButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
