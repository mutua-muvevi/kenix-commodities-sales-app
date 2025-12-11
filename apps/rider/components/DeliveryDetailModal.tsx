import { useState } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Delivery } from '../types';

interface DeliveryDetailModalProps {
  visible: boolean;
  delivery: Delivery | null;
  onClose: () => void;
}

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'completed':
      return {
        backgroundColor: '#E8F5E9',
        textColor: '#2E7D32',
        icon: 'checkmark-circle' as const,
        label: 'Completed',
      };
    case 'failed':
      return {
        backgroundColor: '#FFEBEE',
        textColor: '#C62828',
        icon: 'close-circle' as const,
        label: 'Failed',
      };
    default:
      return {
        backgroundColor: '#FFF3E0',
        textColor: '#EF6C00',
        icon: 'time' as const,
        label: status,
      };
  }
};

const formatDate = (dateString: string | Date | undefined): string => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatCurrency = (amount: number | undefined): string => {
  if (amount === undefined || amount === null) return 'KES 0';
  return `KES ${amount.toLocaleString()}`;
};

const getPaymentMethodLabel = (method: string | undefined): string => {
  switch (method) {
    case 'mpesa':
      return 'M-Pesa';
    case 'cash':
      return 'Cash';
    case 'airtel':
      return 'Airtel Money';
    default:
      return method || 'N/A';
  }
};

export default function DeliveryDetailModal({
  visible,
  delivery,
  onClose,
}: DeliveryDetailModalProps) {
  if (!delivery) return null;

  const shop = delivery.shopId;
  const order = delivery.orderId;
  const statusConfig = getStatusConfig(delivery.status);

  const handleCall = () => {
    if (shop?.phoneNumber) {
      Linking.openURL(`tel:${shop.phoneNumber}`);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Delivery Details</Text>
          <View style={styles.spacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Status Banner */}
          <View style={[styles.statusBanner, { backgroundColor: statusConfig.backgroundColor }]}>
            <Ionicons name={statusConfig.icon} size={24} color={statusConfig.textColor} />
            <Text style={[styles.statusText, { color: statusConfig.textColor }]}>
              {statusConfig.label}
            </Text>
          </View>

          {/* Shop Info Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shop Information</Text>
            <View style={styles.card}>
              <View style={styles.infoRow}>
                <Ionicons name="storefront-outline" size={20} color="#0066CC" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Shop Name</Text>
                  <Text style={styles.infoValue}>{shop?.shopName || 'N/A'}</Text>
                </View>
              </View>

              {shop?.ownerName && (
                <View style={styles.infoRow}>
                  <Ionicons name="person-outline" size={20} color="#0066CC" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Owner</Text>
                    <Text style={styles.infoValue}>{shop.ownerName}</Text>
                  </View>
                </View>
              )}

              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={20} color="#0066CC" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Address</Text>
                  <Text style={styles.infoValue}>{shop?.address || 'N/A'}</Text>
                </View>
              </View>

              {shop?.phoneNumber && (
                <TouchableOpacity style={styles.infoRow} onPress={handleCall}>
                  <Ionicons name="call-outline" size={20} color="#0066CC" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Phone</Text>
                    <Text style={[styles.infoValue, styles.linkText]}>{shop.phoneNumber}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#0066CC" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Order Items Section */}
          {delivery.items && delivery.items.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Order Items</Text>
              <View style={styles.card}>
                {delivery.items.map((item: any, index: number) => (
                  <View
                    key={index}
                    style={[styles.itemRow, index < delivery.items.length - 1 && styles.itemBorder]}
                  >
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.productName || item.name}</Text>
                      <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
                    </View>
                    <Text style={styles.itemPrice}>
                      {formatCurrency(item.totalPrice || item.pricePerUnit * item.quantity)}
                    </Text>
                  </View>
                ))}
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>
                    {formatCurrency(delivery.totalAmount)}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Payment Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Information</Text>
            <View style={styles.card}>
              <View style={styles.infoRow}>
                <Ionicons name="card-outline" size={20} color="#4CAF50" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Payment Method</Text>
                  <Text style={styles.infoValue}>
                    {getPaymentMethodLabel(delivery.paymentInfo?.method)}
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="cash-outline" size={20} color="#4CAF50" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Amount Collected</Text>
                  <Text style={[styles.infoValue, styles.amountText]}>
                    {formatCurrency(delivery.paymentInfo?.amountCollected)}
                  </Text>
                </View>
              </View>

              {delivery.paymentInfo?.collectedAt && (
                <View style={styles.infoRow}>
                  <Ionicons name="time-outline" size={20} color="#4CAF50" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Payment Time</Text>
                    <Text style={styles.infoValue}>
                      {formatDate(delivery.paymentInfo.collectedAt)}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Timestamps Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Timeline</Text>
            <View style={styles.card}>
              {delivery.arrivedAt && (
                <View style={styles.infoRow}>
                  <Ionicons name="enter-outline" size={20} color="#FF9800" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Arrived At</Text>
                    <Text style={styles.infoValue}>{formatDate(delivery.arrivedAt)}</Text>
                  </View>
                </View>
              )}

              {delivery.completedAt && (
                <View style={styles.infoRow}>
                  <Ionicons name="checkmark-done-outline" size={20} color="#4CAF50" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Completed At</Text>
                    <Text style={styles.infoValue}>{formatDate(delivery.completedAt)}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Confirmation Section */}
          {delivery.confirmation && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Delivery Confirmation</Text>
              <View style={styles.card}>
                {delivery.confirmation.recipientName && (
                  <View style={styles.infoRow}>
                    <Ionicons name="person-circle-outline" size={20} color="#0066CC" />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Received By</Text>
                      <Text style={styles.infoValue}>{delivery.confirmation.recipientName}</Text>
                    </View>
                  </View>
                )}

                {delivery.confirmation.notes && (
                  <View style={styles.notesContainer}>
                    <Text style={styles.notesLabel}>Notes</Text>
                    <Text style={styles.notesText}>{delivery.confirmation.notes}</Text>
                  </View>
                )}

                {delivery.confirmation.photo && (
                  <View style={styles.photoContainer}>
                    <Text style={styles.photoLabel}>Proof of Delivery</Text>
                    <Image
                      source={{ uri: delivery.confirmation.photo }}
                      style={styles.photo}
                      resizeMode="cover"
                    />
                  </View>
                )}
              </View>
            </View>
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* Close Button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  spacer: {
    width: 36,
  },
  content: {
    flex: 1,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    padding: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  linkText: {
    color: '#0066CC',
  },
  amountText: {
    color: '#4CAF50',
    fontWeight: '700',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  itemQty: {
    fontSize: 12,
    color: '#999999',
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  totalLabel: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 18,
    color: '#0066CC',
    fontWeight: '700',
  },
  notesContainer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    marginTop: 8,
  },
  notesLabel: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#1A1A1A',
    lineHeight: 20,
  },
  photoContainer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    marginTop: 8,
  },
  photoLabel: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 8,
  },
  photo: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  bottomSpacer: {
    height: 100,
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  closeBtn: {
    backgroundColor: '#0066CC',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
