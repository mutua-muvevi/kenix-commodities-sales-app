import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { statsService } from '../../services/api';
import type { Stats } from '../../types';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function PerformanceScreen() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const data = await statsService.getStats(user._id);
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString()}`;
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${Math.round(minutes)} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  const calculateCollectionRate = () => {
    if (!stats?.today.totalDeliveries) return 0;
    return (stats.today.deliveriesCompleted / stats.today.totalDeliveries) * 100;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={styles.loadingText}>Loading performance data...</Text>
      </View>
    );
  }

  const collectionRate = calculateCollectionRate();

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Today's Performance */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Performance</Text>

        <View style={styles.metricsGrid}>
          {/* Deliveries Completed */}
          <View style={styles.metricCard}>
            <View style={styles.metricIcon}>
              <Ionicons name="checkmark-done" size={28} color="#4CAF50" />
            </View>
            <Text style={styles.metricValue}>
              {stats?.today.deliveriesCompleted || 0}
            </Text>
            <Text style={styles.metricLabel}>Deliveries</Text>
            <Text style={styles.metricSubtext}>
              of {stats?.today.totalDeliveries || 0} total
            </Text>
          </View>

          {/* Amount Collected */}
          <View style={styles.metricCard}>
            <View style={styles.metricIcon}>
              <Ionicons name="cash" size={28} color="#0066CC" />
            </View>
            <Text style={styles.metricValue}>
              {formatCurrency(stats?.today.amountCollected || 0)}
            </Text>
            <Text style={styles.metricLabel}>Collected</Text>
          </View>
        </View>

        <View style={styles.metricsGrid}>
          {/* Collection Rate */}
          <View style={styles.metricCard}>
            <View style={styles.metricIcon}>
              <Ionicons name="trending-up" size={28} color="#FF9800" />
            </View>
            <Text style={styles.metricValue}>{Math.round(collectionRate)}%</Text>
            <Text style={styles.metricLabel}>Collection Rate</Text>
          </View>

          {/* Average Time */}
          <View style={styles.metricCard}>
            <View style={styles.metricIcon}>
              <Ionicons name="time" size={28} color="#9C27B0" />
            </View>
            <Text style={styles.metricValue}>
              {formatTime(stats?.today.averageTimePerDelivery || 0)}
            </Text>
            <Text style={styles.metricLabel}>Avg. Time</Text>
            <Text style={styles.metricSubtext}>per delivery</Text>
          </View>
        </View>

        {/* Progress Ring */}
        <View style={styles.progressSection}>
          <View style={styles.progressRing}>
            <Text style={styles.progressPercentage}>
              {Math.round(collectionRate)}%
            </Text>
            <Text style={styles.progressLabel}>Complete</Text>
          </View>

          <View style={styles.progressInfo}>
            <Text style={styles.progressTitle}>Daily Target Progress</Text>
            <Text style={styles.progressDescription}>
              You've completed {stats?.today.deliveriesCompleted || 0} out of{' '}
              {stats?.today.totalDeliveries || 0} deliveries assigned today.
            </Text>
          </View>
        </View>
      </View>

      {/* Weekly Performance */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>This Week</Text>

        <View style={styles.weeklyStats}>
          <View style={styles.weeklyStatRow}>
            <View style={styles.weeklyStatIcon}>
              <Ionicons name="bicycle" size={24} color="#0066CC" />
            </View>
            <View style={styles.weeklyStatInfo}>
              <Text style={styles.weeklyStatLabel}>Total Deliveries</Text>
              <Text style={styles.weeklyStatValue}>
                {stats?.weekly.deliveriesCompleted || 0}
              </Text>
            </View>
          </View>

          <View style={styles.weeklyStatRow}>
            <View style={styles.weeklyStatIcon}>
              <Ionicons name="cash-outline" size={24} color="#4CAF50" />
            </View>
            <View style={styles.weeklyStatInfo}>
              <Text style={styles.weeklyStatLabel}>Total Collected</Text>
              <Text style={styles.weeklyStatValue}>
                {formatCurrency(stats?.weekly.amountCollected || 0)}
              </Text>
            </View>
          </View>

          {stats?.weekly.rating !== undefined && (
            <View style={styles.weeklyStatRow}>
              <View style={styles.weeklyStatIcon}>
                <Ionicons name="star" size={24} color="#FF9800" />
              </View>
              <View style={styles.weeklyStatInfo}>
                <Text style={styles.weeklyStatLabel}>Average Rating</Text>
                <View style={styles.ratingContainer}>
                  <Text style={styles.weeklyStatValue}>
                    {stats.weekly.rating.toFixed(1)}
                  </Text>
                  <View style={styles.starsContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons
                        key={star}
                        name={star <= stats.weekly.rating! ? 'star' : 'star-outline'}
                        size={16}
                        color="#FF9800"
                      />
                    ))}
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Performance Tips */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performance Tips</Text>

        <View style={styles.tipCard}>
          <Ionicons name="bulb" size={24} color="#FF9800" />
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Maintain High Collection Rate</Text>
            <Text style={styles.tipDescription}>
              Complete all assigned deliveries to maximize your earnings and maintain a
              positive wallet balance.
            </Text>
          </View>
        </View>

        <View style={styles.tipCard}>
          <Ionicons name="time-outline" size={24} color="#0066CC" />
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Optimize Delivery Time</Text>
            <Text style={styles.tipDescription}>
              Plan your route efficiently and communicate with shops to reduce waiting
              time.
            </Text>
          </View>
        </View>

        <View style={styles.tipCard}>
          <Ionicons name="star-outline" size={24} color="#4CAF50" />
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Provide Excellent Service</Text>
            <Text style={styles.tipDescription}>
              Be professional, punctual, and courteous to earn better ratings and
              bonuses.
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
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
  section: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  metricIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  metricSubtext: {
    fontSize: 12,
    color: '#999999',
    marginTop: 2,
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
    borderRadius: 12,
    marginTop: 8,
  },
  progressRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 8,
    borderColor: '#0066CC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  progressPercentage: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0066CC',
  },
  progressLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  progressInfo: {
    flex: 1,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  progressDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  weeklyStats: {
    gap: 16,
  },
  weeklyStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
  },
  weeklyStatIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  weeklyStatInfo: {
    flex: 1,
  },
  weeklyStatLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  weeklyStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  tipContent: {
    flex: 1,
    marginLeft: 12,
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 40,
  },
});
