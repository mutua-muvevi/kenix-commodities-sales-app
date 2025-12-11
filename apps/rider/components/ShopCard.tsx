import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Delivery } from '../types';

interface ShopCardProps {
  delivery: Delivery;
  currentSequence: number;
  totalDeliveries: number;
  isLocked?: boolean;
  onPressLocked?: () => void;
}

export default function ShopCard({ delivery, currentSequence, totalDeliveries, isLocked = false, onPressLocked }: ShopCardProps) {
  const shop = delivery.shopId;

  const handleCall = () => {
    if (isLocked) {
      onPressLocked?.();
      return;
    }
    Linking.openURL(`tel:${shop.phoneNumber}`);
  };

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString()}`;
  };

  const handleCardPress = () => {
    if (isLocked && onPressLocked) {
      onPressLocked();
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, isLocked && styles.containerLocked]}
      onPress={handleCardPress}
      disabled={!isLocked}
      activeOpacity={isLocked ? 0.7 : 1}
    >
      {/* Lock Overlay */}
      {isLocked && (
        <View style={styles.lockOverlay}>
          <View style={styles.lockIconContainer}>
            <Ionicons name="lock-closed" size={48} color="#999999" />
            <Text style={styles.lockTitle}>Locked</Text>
            <Text style={styles.lockMessage}>Complete previous delivery first</Text>
          </View>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.sequenceBadge, isLocked && styles.sequenceBadgeLocked]}>
          {isLocked && <Ionicons name="lock-closed" size={14} color="#FFFFFF" style={styles.lockIcon} />}
          <Text style={styles.sequenceText}>
            Stop {currentSequence} of {totalDeliveries}
          </Text>
        </View>
        <View style={[styles.statusBadge, getStatusStyle(delivery.status)]}>
          <Text style={styles.statusText}>{delivery.status}</Text>
        </View>
      </View>

      {/* Shop Info */}
      <View style={styles.shopInfo}>
        <Text style={styles.shopName}>{shop.shopName}</Text>
        <Text style={styles.ownerName}>{shop.ownerName}</Text>

        <View style={styles.addressRow}>
          <Ionicons name="location" size={16} color="#666666" />
          <Text style={styles.address}>{shop.address}</Text>
        </View>

        <TouchableOpacity style={styles.phoneRow} onPress={handleCall}>
          <Ionicons name="call" size={16} color="#0066CC" />
          <Text style={styles.phoneNumber}>{shop.phoneNumber}</Text>
        </TouchableOpacity>
      </View>

      {/* Order Items */}
      <View style={styles.orderSection}>
        <Text style={styles.sectionTitle}>Order Items</Text>
        {delivery.items.map((item, index) => (
          <View key={index} style={styles.orderItem}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.productName}</Text>
              <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
            </View>
            <Text style={styles.itemPrice}>{formatCurrency(item.totalPrice)}</Text>
          </View>
        ))}
      </View>

      {/* Total */}
      <View style={styles.totalSection}>
        <Text style={styles.totalLabel}>Total to Collect</Text>
        <Text style={styles.totalAmount}>{formatCurrency(delivery.totalAmount)}</Text>
      </View>
    </TouchableOpacity>
  );
}

function getStatusStyle(status: string) {
  switch (status) {
    case 'pending':
      return { backgroundColor: '#FFF3E0' };
    case 'in_transit':
      return { backgroundColor: '#E3F2FD' };
    case 'arrived':
      return { backgroundColor: '#F3E5F5' };
    case 'completed':
      return { backgroundColor: '#E8F5E9' };
    default:
      return { backgroundColor: '#F5F5F5' };
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  containerLocked: {
    opacity: 0.6,
    backgroundColor: '#F5F5F5',
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  lockIconContainer: {
    alignItems: 'center',
  },
  lockTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#666666',
    marginTop: 12,
  },
  lockMessage: {
    fontSize: 14,
    color: '#999999',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  lockIcon: {
    marginRight: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sequenceBadge: {
    backgroundColor: '#0066CC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sequenceBadgeLocked: {
    backgroundColor: '#999999',
  },
  sequenceText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
    color: '#1A1A1A',
  },
  shopInfo: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  shopName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  ownerName: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 12,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  address: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
    flex: 1,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneNumber: {
    fontSize: 16,
    color: '#0066CC',
    marginLeft: 8,
    fontWeight: '600',
  },
  orderSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    color: '#1A1A1A',
    marginBottom: 2,
  },
  itemQuantity: {
    fontSize: 13,
    color: '#666666',
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0066CC',
  },
});
