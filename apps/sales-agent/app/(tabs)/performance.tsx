import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import apiService from '../../services/api';

const { width } = Dimensions.get('window');
type Period = 'week' | 'month';

export default function PerformanceScreen() {
  const { user } = useAuthStore();
  const [period, setPeriod] = useState<Period>('week');
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    shopsRegistered: 0,
    shopsApproved: 0,
    ordersPlaced: 0,
    totalOrderValue: 0,
    commissionEarned: 0,
    shopsVisited: 0,
    conversionRate: 0,
  });

  useEffect(() => {
    loadPerformanceData();
  }, [user, period]);

  const loadPerformanceData = async () => {
    if (!user?._id) return;

    try {
      // Fetch shops and orders
      const [shops, orders] = await Promise.all([
        apiService.getMyShops(user._id),
        apiService.getMyOrders(user._id),
      ]);

      const allShops = shops.users || shops;
      const allOrders = orders.orders || orders;

      // Calculate date range
      const now = new Date();
      const startDate = new Date();
      if (period === 'week') {
        startDate.setDate(now.getDate() - 7);
      } else {
        startDate.setDate(now.getDate() - 30);
      }

      // Filter data by period
      const periodShops = allShops.filter(
        (shop: any) => new Date(shop.createdAt) >= startDate
      );
      const periodOrders = allOrders.filter(
        (order: any) => new Date(order.createdAt) >= startDate
      );

      // Calculate stats
      const shopsApproved = periodShops.filter(
        (shop: any) => shop.approvalStatus === 'approved'
      ).length;

      const totalOrderValue = periodOrders.reduce(
        (sum: number, order: any) => sum + (order.totalPrice || 0),
        0
      );

      // Assume 5% commission rate
      const commissionEarned = totalOrderValue * 0.05;

      const conversionRate =
        periodShops.length > 0
          ? (shopsApproved / periodShops.length) * 100
          : 0;

      setStats({
        shopsRegistered: periodShops.length,
        shopsApproved,
        ordersPlaced: periodOrders.length,
        totalOrderValue,
        commissionEarned,
        shopsVisited: periodShops.length,
        conversionRate,
      });
    } catch (error) {
      console.error('Error loading performance data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPerformanceData();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString('en-KE', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  const StatCard = ({
    icon,
    label,
    value,
    color,
    bgColor,
    valuePrefix = '',
    valueSuffix = '',
  }: {
    icon: string;
    label: string;
    value: string | number;
    color: string;
    bgColor: string;
    valuePrefix?: string;
    valueSuffix?: string;
  }) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: bgColor }]}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <Text style={styles.statValue}>
        {valuePrefix}
        {value}
        {valueSuffix}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Period Selector */}
      <View style={styles.periodSelector}>
        <TouchableOpacity
          style={[
            styles.periodButton,
            period === 'week' && styles.periodButtonActive,
          ]}
          onPress={() => setPeriod('week')}
        >
          <Text
            style={[
              styles.periodButtonText,
              period === 'week' && styles.periodButtonTextActive,
            ]}
          >
            This Week
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.periodButton,
            period === 'month' && styles.periodButtonActive,
          ]}
          onPress={() => setPeriod('month')}
        >
          <Text
            style={[
              styles.periodButtonText,
              period === 'month' && styles.periodButtonTextActive,
            ]}
          >
            This Month
          </Text>
        </TouchableOpacity>
      </View>

      {/* Performance Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performance Summary</Text>

        <View style={styles.statsGrid}>
          <StatCard
            icon="storefront"
            label="Shops Registered"
            value={stats.shopsRegistered}
            color="#22c55e"
            bgColor="#dcfce7"
          />
          <StatCard
            icon="checkmark-circle"
            label="Shops Approved"
            value={stats.shopsApproved}
            color="#3b82f6"
            bgColor="#dbeafe"
          />
          <StatCard
            icon="receipt"
            label="Orders Placed"
            value={stats.ordersPlaced}
            color="#f59e0b"
            bgColor="#fef3c7"
          />
          <StatCard
            icon="trending-up"
            label="Conversion Rate"
            value={stats.conversionRate.toFixed(1)}
            valueSuffix="%"
            color="#8b5cf6"
            bgColor="#ddd6fe"
          />
        </View>
      </View>

      {/* Financial Performance */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Financial Performance</Text>

        <View style={styles.financialCard}>
          <View style={styles.financialRow}>
            <View style={styles.financialIcon}>
              <Ionicons name="cash" size={28} color="#22c55e" />
            </View>
            <View style={styles.financialContent}>
              <Text style={styles.financialLabel}>Total Order Value</Text>
              <Text style={styles.financialValue}>
                {formatCurrency(stats.totalOrderValue)}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.financialRow}>
            <View style={styles.financialIcon}>
              <Ionicons name="wallet" size={28} color="#ec4899" />
            </View>
            <View style={styles.financialContent}>
              <Text style={styles.financialLabel}>Commission Earned (5%)</Text>
              <Text style={[styles.financialValue, { color: '#ec4899' }]}>
                {formatCurrency(stats.commissionEarned)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Activity Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Activity Summary</Text>

        <View style={styles.activityCard}>
          <View style={styles.activityRow}>
            <View style={styles.activityLeft}>
              <Ionicons name="location" size={20} color="#6b7280" />
              <Text style={styles.activityLabel}>Shops Visited</Text>
            </View>
            <Text style={styles.activityValue}>{stats.shopsVisited}</Text>
          </View>

          <View style={styles.activityRow}>
            <View style={styles.activityLeft}>
              <Ionicons name="document-text" size={20} color="#6b7280" />
              <Text style={styles.activityLabel}>Pending Approvals</Text>
            </View>
            <Text style={styles.activityValue}>
              {stats.shopsRegistered - stats.shopsApproved}
            </Text>
          </View>

          <View style={styles.activityRow}>
            <View style={styles.activityLeft}>
              <Ionicons name="cart" size={20} color="#6b7280" />
              <Text style={styles.activityLabel}>Average Order Value</Text>
            </View>
            <Text style={styles.activityValue}>
              {stats.ordersPlaced > 0
                ? formatCurrency(stats.totalOrderValue / stats.ordersPlaced)
                : formatCurrency(0)}
            </Text>
          </View>
        </View>
      </View>

      {/* Performance Insights */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Insights</Text>

        <View style={styles.insightsCard}>
          {stats.shopsRegistered === 0 ? (
            <View style={styles.insightRow}>
              <Ionicons name="information-circle" size={24} color="#3b82f6" />
              <Text style={styles.insightText}>
                Start registering shops to track your performance
              </Text>
            </View>
          ) : (
            <>
              {stats.conversionRate < 50 && (
                <View style={styles.insightRow}>
                  <Ionicons name="trending-down" size={24} color="#f59e0b" />
                  <Text style={styles.insightText}>
                    Your conversion rate is {stats.conversionRate.toFixed(1)}%.
                    Focus on registering quality shops to improve approval rates.
                  </Text>
                </View>
              )}

              {stats.conversionRate >= 50 && stats.conversionRate < 80 && (
                <View style={styles.insightRow}>
                  <Ionicons name="trending-up" size={24} color="#3b82f6" />
                  <Text style={styles.insightText}>
                    Good job! {stats.conversionRate.toFixed(1)}% conversion rate.
                    Keep up the great work!
                  </Text>
                </View>
              )}

              {stats.conversionRate >= 80 && (
                <View style={styles.insightRow}>
                  <Ionicons name="trophy" size={24} color="#22c55e" />
                  <Text style={styles.insightText}>
                    Excellent! {stats.conversionRate.toFixed(1)}% conversion rate.
                    You're doing amazing!
                  </Text>
                </View>
              )}

              {stats.ordersPlaced === 0 && stats.shopsApproved > 0 && (
                <View style={styles.insightRow}>
                  <Ionicons name="cart-outline" size={24} color="#f59e0b" />
                  <Text style={styles.insightText}>
                    You have {stats.shopsApproved} approved shops. Start placing orders to earn commissions!
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 4,
    margin: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  periodButtonActive: {
    backgroundColor: '#22c55e',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  periodButtonTextActive: {
    color: '#fff',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: (width - 44) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  financialCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  financialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  financialIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  financialContent: {
    flex: 1,
  },
  financialLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  financialValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#22c55e',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 20,
  },
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activityLabel: {
    fontSize: 14,
    color: '#4b5563',
  },
  activityValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  insightsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  insightRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 8,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
});
