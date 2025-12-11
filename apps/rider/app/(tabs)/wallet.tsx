import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useRouteStore } from '../../store/routeStore';
import type { WalletTransaction } from '../../types';

export default function WalletScreen() {
  const { user } = useAuthStore();
  const { wallet, activeRoute, loadWallet, loadActiveRoute } = useRouteStore();
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setIsLoading(true);
    await Promise.all([loadWallet(user._id), loadActiveRoute(user._id)]);
    setIsLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString()}`;
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTodayStats = () => {
    if (!activeRoute) {
      return {
        deliveriesCompleted: 0,
        totalDeliveries: 0,
        amountCollected: 0,
        progress: 0,
      };
    }

    const completedDeliveries = activeRoute.deliveries.filter(
      (d) => d.status === 'completed'
    ).length;

    const amountCollected = activeRoute.deliveries
      .filter((d) => d.status === 'completed')
      .reduce((sum, d) => sum + d.totalAmount, 0);

    return {
      deliveriesCompleted: completedDeliveries,
      totalDeliveries: activeRoute.totalDeliveries,
      amountCollected,
      progress: (completedDeliveries / activeRoute.totalDeliveries) * 100,
    };
  };

  const todayStats = getTodayStats();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={styles.loadingText}>Loading wallet...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Wallet Balance</Text>
        <Text
          style={[
            styles.balanceAmount,
            (wallet?.balance || 0) < 0 ? styles.balanceNegative : styles.balancePositive,
          ]}
        >
          {formatCurrency(wallet?.balance || 0)}
        </Text>
        <Text style={styles.balanceHint}>
          {(wallet?.balance || 0) < 0
            ? 'Outstanding amount owed to Kenix'
            : wallet?.balance === 0
            ? 'All collections completed'
            : 'Kenix owes you this amount'}
        </Text>

        {/* Collection Progress for Active Routes */}
        {wallet && wallet.totalLoadedAmount > 0 && (
          <View style={styles.collectionProgress}>
            <View style={styles.progressRow}>
              <View style={styles.progressItem}>
                <Text style={styles.progressLabel}>Loaded</Text>
                <Text style={styles.progressValue}>
                  {formatCurrency(wallet.totalLoadedAmount)}
                </Text>
              </View>
              <View style={styles.progressItem}>
                <Text style={styles.progressLabel}>Collected</Text>
                <Text style={[styles.progressValue, styles.collectedValue]}>
                  {formatCurrency(wallet.totalCollected)}
                </Text>
              </View>
              <View style={styles.progressItem}>
                <Text style={styles.progressLabel}>Remaining</Text>
                <Text style={[styles.progressValue, styles.remainingValue]}>
                  {formatCurrency(wallet.outstandingAmount)}
                </Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.collectionProgressBar}>
              <View
                style={[
                  styles.collectionProgressFill,
                  { width: `${wallet.collectionPercentage || 0}%` },
                ]}
              />
            </View>
            <Text style={styles.collectionPercentage}>
              {Math.round(wallet.collectionPercentage || 0)}% collected
            </Text>
          </View>
        )}
      </View>

      {/* Today's Progress */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Progress</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons name="bicycle" size={24} color="#0066CC" />
            </View>
            <Text style={styles.statValue}>
              {todayStats.deliveriesCompleted} / {todayStats.totalDeliveries}
            </Text>
            <Text style={styles.statLabel}>Deliveries</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons name="cash" size={24} color="#4CAF50" />
            </View>
            <Text style={styles.statValue}>
              {formatCurrency(todayStats.amountCollected)}
            </Text>
            <Text style={styles.statLabel}>Collected</Text>
          </View>
        </View>

        {/* Progress Bar */}
        {todayStats.totalDeliveries > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.todayProgressLabel}>Completion</Text>
              <Text style={styles.progressPercentage}>
                {Math.round(todayStats.progress)}%
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${todayStats.progress}%` }]}
              />
            </View>
          </View>
        )}
      </View>

      {/* Transaction History */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Transaction History</Text>

        {!wallet?.transactions || wallet.transactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={48} color="#CCCCCC" />
            <Text style={styles.emptyText}>No transactions yet</Text>
          </View>
        ) : (
          <View style={styles.transactionList}>
            {wallet.transactions.slice(0, 20).map((transaction, index) => (
              <TransactionItem key={transaction._id || index} transaction={transaction} />
            ))}
          </View>
        )}
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

function TransactionItem({ transaction }: { transaction: WalletTransaction }) {
  const formatCurrency = (amount: number) => {
    return `KES ${Math.abs(amount).toLocaleString()}`;
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const today = new Date();
    const isToday = d.toDateString() === today.toDateString();

    if (isToday) {
      return d.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
    });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'load':
        return 'cube-outline'; // Goods loaded
      case 'collection':
        return 'checkmark-circle'; // Payment collected
      case 'adjustment':
        return 'create-outline'; // Admin adjustment
      case 'settlement':
        return 'cash-outline'; // Wallet settled
      default:
        return 'ellipse';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'load':
        return '#FF9800'; // Orange for loading goods
      case 'collection':
        return '#4CAF50'; // Green for collections
      case 'adjustment':
        return '#2196F3'; // Blue for adjustments
      case 'settlement':
        return '#9C27B0'; // Purple for settlements
      default:
        return '#999999';
    }
  };

  const isPositive = transaction.amount > 0;

  return (
    <View style={styles.transactionItem}>
      <View style={styles.transactionIcon}>
        <Ionicons
          name={getIcon(transaction.type)}
          size={24}
          color={getIconColor(transaction.type)}
        />
      </View>

      <View style={styles.transactionInfo}>
        <Text style={styles.transactionDescription}>{transaction.description}</Text>
        <Text style={styles.transactionDate}>{formatDate(transaction.timestamp)}</Text>
      </View>

      <View style={styles.transactionAmount}>
        <Text
          style={[
            styles.transactionAmountText,
            isPositive ? styles.amountPositive : styles.amountNegative,
          ]}
        >
          {isPositive ? '+' : '-'}
          {formatCurrency(transaction.amount)}
        </Text>
        <Text style={styles.transactionBalance}>
          Bal: KES {transaction.newBalance.toLocaleString()}
        </Text>
      </View>
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
  balanceCard: {
    backgroundColor: '#0066CC',
    padding: 32,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  balanceNegative: {
    color: '#FFCDD2',
  },
  balancePositive: {
    color: '#C8E6C9',
  },
  balanceHint: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  collectionProgress: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  progressItem: {
    flex: 1,
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 4,
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  collectedValue: {
    color: '#C8E6C9',
  },
  remainingValue: {
    color: '#FFCDD2',
  },
  collectionProgressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  collectionProgressFill: {
    height: '100%',
    backgroundColor: '#C8E6C9',
    borderRadius: 4,
  },
  collectionPercentage: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666666',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  todayProgressLabel: {
    fontSize: 14,
    color: '#666666',
  },
  progressPercentage: {
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
    marginTop: 12,
  },
  transactionList: {
    gap: 0,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 15,
    color: '#1A1A1A',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 13,
    color: '#666666',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  transactionAmountText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  amountPositive: {
    color: '#4CAF50',
  },
  amountNegative: {
    color: '#F44336',
  },
  transactionBalance: {
    fontSize: 12,
    color: '#999999',
  },
  bottomSpacer: {
    height: 40,
  },
});
