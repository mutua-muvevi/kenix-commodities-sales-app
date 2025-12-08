import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import apiService from '../../services/api';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    weekly: {
      shopsRegistered: 0,
      ordersPlaced: 0,
      ordersValue: 0,
      shopsVisited: 0,
      targetShops: 20,
    },
    monthly: {
      shopsRegistered: 0,
      ordersPlaced: 0,
      ordersValue: 0,
      shopsVisited: 0,
      commissionEarned: 0,
    },
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    if (!user?._id) return;

    try {
      setIsLoading(true);

      // Fetch shops and orders to calculate stats
      const [shops, orders] = await Promise.all([
        apiService.getMyShops(user._id),
        apiService.getMyOrders(user._id),
      ]);

      const allShops = shops.users || shops;
      const allOrders = orders.orders || orders;

      // Calculate weekly stats (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const weeklyShops = allShops.filter(
        (shop: any) => new Date(shop.createdAt) >= weekAgo
      );
      const weeklyOrders = allOrders.filter(
        (order: any) => new Date(order.createdAt) >= weekAgo
      );
      const weeklyOrdersValue = weeklyOrders.reduce(
        (sum: number, order: any) => sum + (order.totalPrice || 0),
        0
      );

      // Calculate monthly stats (last 30 days)
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);

      const monthlyShops = allShops.filter(
        (shop: any) => new Date(shop.createdAt) >= monthAgo
      );
      const monthlyOrders = allOrders.filter(
        (order: any) => new Date(order.createdAt) >= monthAgo
      );
      const monthlyOrdersValue = monthlyOrders.reduce(
        (sum: number, order: any) => sum + (order.totalPrice || 0),
        0
      );

      // Assume 5% commission on orders
      const commissionEarned = monthlyOrdersValue * 0.05;

      setStats({
        weekly: {
          shopsRegistered: weeklyShops.length,
          ordersPlaced: weeklyOrders.length,
          ordersValue: weeklyOrdersValue,
          shopsVisited: weeklyShops.length, // Assuming visited = registered for now
          targetShops: 20,
        },
        monthly: {
          shopsRegistered: monthlyShops.length,
          ordersPlaced: monthlyOrders.length,
          ordersValue: monthlyOrdersValue,
          shopsVisited: monthlyShops.length,
          commissionEarned,
        },
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* User Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.name || 'Sales Agent'}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#ef4444" />
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsRow}>
          <TouchableOpacity
            style={[styles.quickActionCard, styles.primaryAction]}
            onPress={() => router.push('/shop/register')}
          >
            <Ionicons name="add-circle" size={32} color="#fff" />
            <Text style={styles.quickActionTextPrimary}>Register Shop</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push('/(tabs)/orders')}
          >
            <Ionicons name="cart" size={28} color="#22c55e" />
            <Text style={styles.quickActionText}>Place Order</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.quickActionCard, styles.fullWidth]}
          onPress={() => router.push('/(tabs)/shops')}
        >
          <Ionicons name="storefront" size={28} color="#3b82f6" />
          <Text style={styles.quickActionText}>View My Shops</Text>
        </TouchableOpacity>
      </View>

      {/* This Week Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>This Week</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#dcfce7' }]}>
              <Ionicons name="storefront" size={24} color="#22c55e" />
            </View>
            <Text style={styles.statValue}>{stats.weekly.shopsRegistered}</Text>
            <Text style={styles.statLabel}>Shops Registered</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#dbeafe' }]}>
              <Ionicons name="receipt" size={24} color="#3b82f6" />
            </View>
            <Text style={styles.statValue}>{stats.weekly.ordersPlaced}</Text>
            <Text style={styles.statLabel}>Orders Placed</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#fef3c7' }]}>
              <Ionicons name="cash" size={24} color="#f59e0b" />
            </View>
            <Text style={styles.statValue}>{formatCurrency(stats.weekly.ordersValue)}</Text>
            <Text style={styles.statLabel}>Order Value</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#e0e7ff' }]}>
              <Ionicons name="location" size={24} color="#6366f1" />
            </View>
            <Text style={styles.statValue}>{stats.weekly.shopsVisited}</Text>
            <Text style={styles.statLabel}>Shops Visited</Text>
          </View>
        </View>

        {/* Target Progress */}
        <View style={styles.targetCard}>
          <View style={styles.targetHeader}>
            <Text style={styles.targetTitle}>Weekly Target</Text>
            <Text style={styles.targetValue}>
              {stats.weekly.shopsRegistered}/{stats.weekly.targetShops} shops
            </Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${Math.min((stats.weekly.shopsRegistered / stats.weekly.targetShops) * 100, 100)}%`,
                },
              ]}
            />
          </View>
          <Text style={styles.targetSubtext}>
            {stats.weekly.targetShops - stats.weekly.shopsRegistered > 0
              ? `${stats.weekly.targetShops - stats.weekly.shopsRegistered} more to reach target`
              : 'Target achieved!'}
          </Text>
        </View>
      </View>

      {/* This Month Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>This Month</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#dcfce7' }]}>
              <Ionicons name="storefront" size={24} color="#22c55e" />
            </View>
            <Text style={styles.statValue}>{stats.monthly.shopsRegistered}</Text>
            <Text style={styles.statLabel}>Shops Registered</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#dbeafe' }]}>
              <Ionicons name="receipt" size={24} color="#3b82f6" />
            </View>
            <Text style={styles.statValue}>{stats.monthly.ordersPlaced}</Text>
            <Text style={styles.statLabel}>Orders Placed</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#fef3c7' }]}>
              <Ionicons name="cash" size={24} color="#f59e0b" />
            </View>
            <Text style={styles.statValue}>{formatCurrency(stats.monthly.ordersValue)}</Text>
            <Text style={styles.statLabel}>Order Value</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#fce7f3' }]}>
              <Ionicons name="wallet" size={24} color="#ec4899" />
            </View>
            <Text style={styles.statValue}>{formatCurrency(stats.monthly.commissionEarned)}</Text>
            <Text style={styles.statLabel}>Commission Earned</Text>
          </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  greeting: {
    fontSize: 14,
    color: '#6b7280',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 4,
  },
  logoutButton: {
    padding: 8,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryAction: {
    backgroundColor: '#22c55e',
  },
  fullWidth: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 8,
  },
  quickActionTextPrimary: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginTop: 8,
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
    width: (width - 52) / 2,
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
  targetCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  targetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  targetTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  targetValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#22c55e',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#22c55e',
    borderRadius: 4,
  },
  targetSubtext: {
    fontSize: 12,
    color: '#6b7280',
  },
});
