import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useHistoryStore } from '../../store/historyStore';
import HistoryItem from '../../components/HistoryItem';
import DeliveryDetailModal from '../../components/DeliveryDetailModal';
import type { Delivery } from '../../types';

type FilterStatus = 'all' | 'completed' | 'failed';

const FILTER_OPTIONS: { key: FilterStatus; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'all', label: 'All', icon: 'list' },
  { key: 'completed', label: 'Completed', icon: 'checkmark-circle' },
  { key: 'failed', label: 'Failed', icon: 'close-circle' },
];

export default function HistoryScreen() {
  const { user } = useAuthStore();
  const {
    deliveries,
    isLoading,
    isLoadingMore,
    error,
    pagination,
    loadHistory,
    loadMore,
    setFilters,
    clearError,
  } = useHistoryStore();

  const [activeFilter, setActiveFilter] = useState<FilterStatus>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (user?._id) {
      loadHistory(user._id);
    }
  }, [user?._id]);

  const handleFilterChange = (filter: FilterStatus) => {
    setActiveFilter(filter);
    if (filter === 'all') {
      setFilters({});
    } else {
      setFilters({ status: filter });
    }
    if (user?._id) {
      loadHistory(user._id);
    }
  };

  const handleRefresh = useCallback(async () => {
    if (!user?._id) return;
    setRefreshing(true);
    await loadHistory(user._id);
    setRefreshing(false);
  }, [user?._id, loadHistory]);

  const handleLoadMore = useCallback(() => {
    if (user?._id && pagination.hasMore && !isLoadingMore) {
      loadMore(user._id);
    }
  }, [user?._id, pagination.hasMore, isLoadingMore, loadMore]);

  const handleDeliveryPress = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedDelivery(null);
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Stats Summary */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{pagination.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, styles.successText]}>
            {deliveries.filter((d) => d.status === 'completed').length}
          </Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, styles.errorText]}>
            {deliveries.filter((d) => d.status === 'failed').length}
          </Text>
          <Text style={styles.statLabel}>Failed</Text>
        </View>
      </View>

      {/* Filter Chips */}
      <View style={styles.filterRow}>
        {FILTER_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[styles.filterChip, activeFilter === option.key && styles.filterChipActive]}
            onPress={() => handleFilterChange(option.key)}
          >
            <Ionicons
              name={option.icon}
              size={16}
              color={activeFilter === option.key ? '#FFFFFF' : '#666666'}
            />
            <Text
              style={[
                styles.filterChipText,
                activeFilter === option.key && styles.filterChipTextActive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderEmpty = () => {
    if (isLoading) return null;

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <Ionicons name="receipt-outline" size={64} color="#CCCCCC" />
        </View>
        <Text style={styles.emptyTitle}>No Deliveries Found</Text>
        <Text style={styles.emptySubtitle}>
          {activeFilter === 'all'
            ? "You haven't completed any deliveries yet"
            : `No ${activeFilter} deliveries found`}
        </Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (!isLoadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#0066CC" />
        <Text style={styles.footerText}>Loading more...</Text>
      </View>
    );
  };

  const renderItem = ({ item }: { item: Delivery }) => (
    <HistoryItem delivery={item} onPress={() => handleDeliveryPress(item)} />
  );

  if (isLoading && deliveries.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={styles.loadingText}>Loading history...</Text>
      </View>
    );
  }

  if (error && deliveries.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorIconContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#F44336" />
        </View>
        <Text style={styles.errorTitle}>Failed to Load</Text>
        <Text style={styles.errorSubtitle}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
          <Ionicons name="refresh" size={20} color="#FFFFFF" />
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={deliveries}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#0066CC']} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        showsVerticalScrollIndicator={false}
      />

      <DeliveryDetailModal
        visible={modalVisible}
        delivery={selectedDelivery}
        onClose={handleCloseModal}
      />
    </View>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 32,
  },
  errorIconContainer: {
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0066CC',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  headerContainer: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  statLabel: {
    fontSize: 12,
    color: '#999999',
    marginTop: 4,
    textTransform: 'uppercase',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
  },
  successText: {
    color: '#4CAF50',
  },
  errorText: {
    color: '#F44336',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: '#0066CC',
  },
  filterChipText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
  footerLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  footerText: {
    fontSize: 14,
    color: '#666666',
  },
});
