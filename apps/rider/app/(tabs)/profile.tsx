import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { statsService } from '../../services/api';
import { isBackgroundTrackingActive, stopBackgroundTracking } from '../../services/location';
import type { Stats } from '../../types';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [gpsEnabled, setGpsEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    loadData();
    checkGpsStatus();
  }, []);

  const loadData = async () => {
    if (!user) return;

    try {
      const statsData = await statsService.getStats(user._id);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkGpsStatus = async () => {
    const isActive = await isBackgroundTrackingActive();
    setGpsEnabled(isActive);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await stopBackgroundTracking();
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const toggleGps = async (value: boolean) => {
    setGpsEnabled(value);
    if (!value) {
      await stopBackgroundTracking();
    }
    // Note: Starting GPS tracking is handled in the tabs layout when route is active
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066CC" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={48} color="#FFFFFF" />
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <Text style={styles.phone}>{user.phoneNumber}</Text>
      </View>

      {/* Today's Stats */}
      {!isLoading && stats && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Stats</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Ionicons name="checkmark-circle" size={32} color="#4CAF50" />
              <Text style={styles.statValue}>
                {stats.today.deliveriesCompleted}/{stats.today.totalDeliveries}
              </Text>
              <Text style={styles.statLabel}>Deliveries</Text>
            </View>

            <View style={styles.statBox}>
              <Ionicons name="cash" size={32} color="#0066CC" />
              <Text style={styles.statValue}>
                KES {stats.today.amountCollected.toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>Collected</Text>
            </View>

            <View style={styles.statBox}>
              <Ionicons name="time" size={32} color="#FF9800" />
              <Text style={styles.statValue}>
                {Math.round(stats.today.averageTimePerDelivery)} min
              </Text>
              <Text style={styles.statLabel}>Avg Time</Text>
            </View>
          </View>
        </View>
      )}

      {/* Weekly Performance */}
      {!isLoading && stats && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Performance</Text>

          <View style={styles.performanceItem}>
            <View style={styles.performanceIcon}>
              <Ionicons name="bicycle" size={24} color="#0066CC" />
            </View>
            <View style={styles.performanceInfo}>
              <Text style={styles.performanceLabel}>Total Deliveries</Text>
              <Text style={styles.performanceValue}>
                {stats.weekly.deliveriesCompleted}
              </Text>
            </View>
          </View>

          <View style={styles.performanceItem}>
            <View style={styles.performanceIcon}>
              <Ionicons name="cash" size={24} color="#4CAF50" />
            </View>
            <View style={styles.performanceInfo}>
              <Text style={styles.performanceLabel}>Amount Collected</Text>
              <Text style={styles.performanceValue}>
                KES {stats.weekly.amountCollected.toLocaleString()}
              </Text>
            </View>
          </View>

          {stats.weekly.rating && (
            <View style={styles.performanceItem}>
              <View style={styles.performanceIcon}>
                <Ionicons name="star" size={24} color="#FFB300" />
              </View>
              <View style={styles.performanceInfo}>
                <Text style={styles.performanceLabel}>Rating</Text>
                <Text style={styles.performanceValue}>
                  {stats.weekly.rating.toFixed(1)} / 5.0
                </Text>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="navigate" size={24} color="#0066CC" />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>GPS Tracking</Text>
              <Text style={styles.settingDescription}>
                Track location during deliveries
              </Text>
            </View>
          </View>
          <Switch
            value={gpsEnabled}
            onValueChange={toggleGps}
            trackColor={{ false: '#E0E0E0', true: '#B3D9FF' }}
            thumbColor={gpsEnabled ? '#0066CC' : '#F5F5F5'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="notifications" size={24} color="#0066CC" />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Notifications</Text>
              <Text style={styles.settingDescription}>
                Receive delivery updates
              </Text>
            </View>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#E0E0E0', true: '#B3D9FF' }}
            thumbColor={notificationsEnabled ? '#0066CC' : '#F5F5F5'}
          />
        </View>
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.actionButton} onPress={() => {}}>
          <Ionicons name="help-circle" size={24} color="#0066CC" />
          <Text style={styles.actionButtonText}>Help & Support</Text>
          <Ionicons name="chevron-forward" size={24} color="#CCCCCC" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => {}}>
          <Ionicons name="document-text" size={24} color="#0066CC" />
          <Text style={styles.actionButtonText}>Terms & Conditions</Text>
          <Ionicons name="chevron-forward" size={24} color="#CCCCCC" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => {}}>
          <Ionicons name="shield-checkmark" size={24} color="#0066CC" />
          <Text style={styles.actionButtonText}>Privacy Policy</Text>
          <Ionicons name="chevron-forward" size={24} color="#CCCCCC" />
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out" size={24} color="#FFFFFF" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* App Version */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Kenix Rider App</Text>
        <Text style={styles.footerVersion}>Version 1.0.0</Text>
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
  profileHeader: {
    backgroundColor: '#0066CC',
    padding: 32,
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 4,
  },
  phone: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
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
  },
  statBox: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
  },
  performanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  performanceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  performanceInfo: {
    flex: 1,
  },
  performanceLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  performanceValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 16,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: '#1A1A1A',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: '#666666',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    marginLeft: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#F44336',
    paddingVertical: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    padding: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  footerVersion: {
    fontSize: 12,
    color: '#999999',
  },
  bottomSpacer: {
    height: 40,
  },
});
