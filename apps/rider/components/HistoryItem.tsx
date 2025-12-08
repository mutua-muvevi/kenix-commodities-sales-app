import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Delivery } from '../types';

interface HistoryItemProps {
  delivery: Delivery;
  onPress: () => void;
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

export default function HistoryItem({ delivery, onPress }: HistoryItemProps) {
  const statusConfig = getStatusConfig(delivery.status);
  const shop = delivery.shopId;
  const paymentAmount = delivery.paymentInfo?.amountCollected || delivery.totalAmount || 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.shopInfo}>
          <Text style={styles.shopName} numberOfLines={1}>
            {shop?.shopName || 'Unknown Shop'}
          </Text>
          <Text style={styles.address} numberOfLines={1}>
            {shop?.address || 'No address'}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusConfig.backgroundColor }]}>
          <Ionicons name={statusConfig.icon} size={14} color={statusConfig.textColor} />
          <Text style={[styles.statusText, { color: statusConfig.textColor }]}>
            {statusConfig.label}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.footer}>
        <View style={styles.dateContainer}>
          <Ionicons name="calendar-outline" size={16} color="#999999" />
          <Text style={styles.dateText}>{formatDate(delivery.completedAt)}</Text>
        </View>
        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Collected</Text>
          <Text style={styles.amount}>{formatCurrency(paymentAmount)}</Text>
        </View>
      </View>

      <View style={styles.chevronContainer}>
        <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  shopInfo: {
    flex: 1,
    marginRight: 12,
  },
  shopName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    color: '#666666',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 13,
    color: '#999999',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amountLabel: {
    fontSize: 11,
    color: '#999999',
    textTransform: 'uppercase',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4CAF50',
  },
  chevronContainer: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -10,
  },
});
