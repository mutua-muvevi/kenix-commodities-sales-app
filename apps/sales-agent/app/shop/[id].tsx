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
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import apiService from '../../services/api';

export default function ShopDetailsScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [shop, setShop] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadShopDetails();
  }, [params.id]);

  const loadShopDetails = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getShopById(params.id as string);
      setShop(data.user || data);
    } catch (error) {
      console.error('Error loading shop details:', error);
    } finally {
      setIsLoading(false);
    }
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
    router.push({
      pathname: '/(tabs)/orders',
      params: { shopId: shop._id, shopName: shop.shopName },
    });
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { bg: '#fef3c7', color: '#f59e0b', text: 'Pending Approval', icon: 'time' },
      approved: { bg: '#dcfce7', color: '#22c55e', text: 'Approved', icon: 'checkmark-circle' },
      rejected: { bg: '#fee2e2', color: '#ef4444', text: 'Rejected', icon: 'close-circle' },
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

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
    <ScrollView style={styles.container}>
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

        {/* Registration Date */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Registration Details</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={20} color="#6b7280" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Registered On</Text>
                <Text style={styles.infoValue}>
                  {new Date(shop.createdAt).toLocaleDateString('en-US', {
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

      {/* Action Buttons */}
      {shop.approvalStatus === 'approved' && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.callButton} onPress={() => handleCall(shop.phoneNumber)}>
            <Ionicons name="call" size={20} color="#fff" />
            <Text style={styles.callButtonText}>Call Owner</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.orderButton} onPress={handlePlaceOrder}>
            <Ionicons name="cart" size={20} color="#fff" />
            <Text style={styles.orderButtonText}>Place Order</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
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
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
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
});
