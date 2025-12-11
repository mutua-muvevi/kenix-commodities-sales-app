import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { useLocationStore } from '../../store/slices/location/location-store';
import apiService from '../../services/api';
import locationService from '../../services/location';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const {
    isTrackingEnabled,
    isForegroundTracking,
    isBackgroundTracking,
    permissions,
    currentLocation,
    lastUpdateTimestamp,
    setTrackingEnabled,
    requestPermissions,
    checkPermissions,
    getTrackingStatus,
  } = useLocationStore();

  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Load location tracking status on mount
  useEffect(() => {
    const loadLocationStatus = async () => {
      await checkPermissions();
      await getTrackingStatus();

      // Initialize location service with user ID
      if (user?._id) {
        locationService.initialize(user._id);
      }
    };

    loadLocationStatus();
  }, [user?._id]);

  const handleSaveProfile = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    if (!formData.email.trim()) {
      Alert.alert('Error', 'Email is required');
      return;
    }

    try {
      setIsSaving(true);
      await apiService.put('/user/profile', {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
      });

      Alert.alert('Success', 'Profile updated successfully');
      setIsEditing(false);
    } catch (error: any) {
      Alert.alert(
        'Update Failed',
        error.response?.data?.message || 'Could not update profile'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword) {
      Alert.alert('Error', 'Current password is required');
      return;
    }

    if (!passwordData.newPassword || passwordData.newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      setIsSaving(true);
      await apiService.put('/user/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      Alert.alert('Success', 'Password changed successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setIsChangingPassword(false);
    } catch (error: any) {
      Alert.alert(
        'Password Change Failed',
        error.response?.data?.message || 'Could not change password'
      );
    } finally {
      setIsSaving(false);
    }
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

  const handleToggleTracking = async (enabled: boolean) => {
    if (enabled) {
      // Check if we have permissions
      if (!permissions.foreground || !permissions.background) {
        Alert.alert(
          'Location Permissions Required',
          'This app needs location permissions (always) to track your position for route optimization. Please grant permissions in the next prompt.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Grant Permissions',
              onPress: async () => {
                const granted = await requestPermissions();

                if (granted.foreground) {
                  setTrackingEnabled(true);
                  Alert.alert(
                    'GPS Tracking Enabled',
                    granted.background
                      ? 'Location tracking is now active in foreground and background.'
                      : 'Location tracking is active in foreground only. Background permission was not granted.'
                  );
                } else {
                  Alert.alert(
                    'Permission Denied',
                    'Location permissions are required for GPS tracking. Please enable them in your device settings.'
                  );
                }
              },
            },
          ]
        );
      } else {
        setTrackingEnabled(true);
        Alert.alert('GPS Tracking Enabled', 'Your location is now being tracked.');
      }
    } else {
      Alert.alert(
        'Disable GPS Tracking',
        'Are you sure you want to stop location tracking? This may affect route optimization.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: () => {
              setTrackingEnabled(false);
            },
          },
        ]
      );
    }
  };

  const formatLastUpdate = (timestamp: number | null) => {
    if (!timestamp) return 'Never';

    const now = Date.now();
    const diff = now - timestamp;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase() || 'S'}
            </Text>
          </View>
        </View>
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userRole}>Sales Agent</Text>
      </View>

      {/* Profile Information */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          {!isEditing && (
            <TouchableOpacity onPress={() => setIsEditing(true)}>
              <Ionicons name="create-outline" size={24} color="#22c55e" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(value) =>
                  setFormData({ ...formData, name: value })
                }
                placeholder="Enter your name"
              />
            ) : (
              <Text style={styles.value}>{user?.name}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(value) =>
                  setFormData({ ...formData, email: value })
                }
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            ) : (
              <Text style={styles.value}>{user?.email}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone Number</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={formData.phoneNumber}
                onChangeText={(value) =>
                  setFormData({ ...formData, phoneNumber: value })
                }
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={styles.value}>{user?.phoneNumber || 'Not set'}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Role</Text>
            <Text style={styles.value}>Sales Agent</Text>
          </View>

          {isEditing && (
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setIsEditing(false);
                  setFormData({
                    name: user?.name || '',
                    email: user?.email || '',
                    phoneNumber: user?.phoneNumber || '',
                  });
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                onPress={handleSaveProfile}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* GPS Tracking */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>GPS Tracking</Text>

        <View style={styles.card}>
          <View style={styles.trackingHeader}>
            <View style={styles.menuItemLeft}>
              <Ionicons
                name={isTrackingEnabled ? 'location' : 'location-outline'}
                size={24}
                color={isTrackingEnabled ? '#22c55e' : '#6b7280'}
              />
              <View>
                <Text style={styles.trackingTitle}>Location Tracking</Text>
                <Text style={styles.trackingSubtitle}>
                  {isTrackingEnabled
                    ? 'Tracking active for route optimization'
                    : 'Enable to track your location'}
                </Text>
              </View>
            </View>
            <Switch
              value={isTrackingEnabled}
              onValueChange={handleToggleTracking}
              trackColor={{ false: '#d1d5db', true: '#86efac' }}
              thumbColor={isTrackingEnabled ? '#22c55e' : '#f3f4f6'}
            />
          </View>

          {isTrackingEnabled && (
            <View style={styles.trackingDetails}>
              <View style={styles.trackingDetailRow}>
                <Ionicons name="radio-button-on" size={16} color="#22c55e" />
                <Text style={styles.trackingDetailLabel}>Foreground:</Text>
                <Text
                  style={[
                    styles.trackingDetailValue,
                    isForegroundTracking && styles.trackingDetailValueActive,
                  ]}
                >
                  {isForegroundTracking ? 'Active' : 'Inactive'}
                </Text>
              </View>

              <View style={styles.trackingDetailRow}>
                <Ionicons name="radio-button-on" size={16} color="#22c55e" />
                <Text style={styles.trackingDetailLabel}>Background:</Text>
                <Text
                  style={[
                    styles.trackingDetailValue,
                    isBackgroundTracking && styles.trackingDetailValueActive,
                  ]}
                >
                  {isBackgroundTracking ? 'Active' : 'Inactive'}
                </Text>
              </View>

              <View style={styles.trackingDetailRow}>
                <Ionicons name="time-outline" size={16} color="#6b7280" />
                <Text style={styles.trackingDetailLabel}>Last Update:</Text>
                <Text style={styles.trackingDetailValue}>
                  {formatLastUpdate(lastUpdateTimestamp)}
                </Text>
              </View>

              {currentLocation && (
                <View style={styles.trackingDetailRow}>
                  <Ionicons name="location-outline" size={16} color="#6b7280" />
                  <Text style={styles.trackingDetailLabel}>Position:</Text>
                  <Text style={styles.trackingDetailValue}>
                    {currentLocation.latitude.toFixed(6)},{' '}
                    {currentLocation.longitude.toFixed(6)}
                  </Text>
                </View>
              )}

              <View style={styles.permissionStatus}>
                <Text style={styles.permissionStatusTitle}>Permissions:</Text>
                <View style={styles.permissionRow}>
                  <Ionicons
                    name={
                      permissions.foreground
                        ? 'checkmark-circle'
                        : 'close-circle'
                    }
                    size={16}
                    color={permissions.foreground ? '#22c55e' : '#ef4444'}
                  />
                  <Text style={styles.permissionText}>Foreground Location</Text>
                </View>
                <View style={styles.permissionRow}>
                  <Ionicons
                    name={
                      permissions.background
                        ? 'checkmark-circle'
                        : 'close-circle'
                    }
                    size={16}
                    color={permissions.background ? '#22c55e' : '#ef4444'}
                  />
                  <Text style={styles.permissionText}>Background Location</Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Security */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>

        <View style={styles.card}>
          {!isChangingPassword ? (
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setIsChangingPassword(true)}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons name="lock-closed" size={20} color="#6b7280" />
                <Text style={styles.menuItemText}>Change Password</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          ) : (
            <View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Current Password</Text>
                <TextInput
                  style={styles.input}
                  value={passwordData.currentPassword}
                  onChangeText={(value) =>
                    setPasswordData({ ...passwordData, currentPassword: value })
                  }
                  placeholder="Enter current password"
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>New Password</Text>
                <TextInput
                  style={styles.input}
                  value={passwordData.newPassword}
                  onChangeText={(value) =>
                    setPasswordData({ ...passwordData, newPassword: value })
                  }
                  placeholder="Enter new password"
                  secureTextEntry
                  autoCapitalize="none"
                />
                <Text style={styles.hint}>Minimum 6 characters</Text>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirm New Password</Text>
                <TextInput
                  style={styles.input}
                  value={passwordData.confirmPassword}
                  onChangeText={(value) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: value,
                    })
                  }
                  placeholder="Confirm new password"
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setIsChangingPassword(false);
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                    });
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    isSaving && styles.saveButtonDisabled,
                  ]}
                  onPress={handleChangePassword}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.saveButtonText}>Update Password</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* App Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>

        <View style={styles.card}>
          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="information-circle" size={20} color="#6b7280" />
              <Text style={styles.menuItemText}>App Version</Text>
            </View>
            <Text style={styles.menuItemValue}>1.0.0</Text>
          </View>

          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="business" size={20} color="#6b7280" />
              <Text style={styles.menuItemText}>Kenix Commodities</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Logout Button */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out" size={20} color="#fff" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
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
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 16,
    color: '#6b7280',
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  value: {
    fontSize: 16,
    color: '#1f2937',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  hint: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#22c55e',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: '#1f2937',
  },
  menuItemValue: {
    fontSize: 14,
    color: '#6b7280',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  trackingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
  },
  trackingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  trackingSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  trackingDetails: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  trackingDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  trackingDetailLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginRight: 8,
  },
  trackingDetailValue: {
    fontSize: 14,
    color: '#9ca3af',
    flex: 1,
  },
  trackingDetailValueActive: {
    color: '#22c55e',
    fontWeight: '600',
  },
  permissionStatus: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  permissionStatusTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  permissionText: {
    fontSize: 14,
    color: '#6b7280',
  },
});
