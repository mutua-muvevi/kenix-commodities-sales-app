import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import LocationPicker from '../../../components/LocationPicker';
import ShopPhotoCapture from '../../../components/ShopPhotoCapture';
import { useAuthStore } from '../../../store/authStore';
import { useShopStore } from '../../../store/shopStore';
import apiService from '../../../services/api';
import type { Shop } from '../../../types/shop';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function EditShopScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();

  const [shop, setShop] = useState<Shop | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const [formData, setFormData] = useState({
    // Basic Information
    shopName: '',
    ownerName: '',
    phoneNumber: '',
    email: '',
    businessRegNumber: '',

    // Location
    location: { latitude: -1.286389, longitude: 36.817223 },
    address: {
      street: '',
      area: '',
      city: 'Nairobi',
      county: '',
    },

    // Photo
    shopPhoto: '',

    // Operating Hours
    operatingHours: {
      open: '08:00',
      close: '20:00',
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    },
    specialNotes: '',
  });

  const [originalData, setOriginalData] = useState<typeof formData | null>(null);

  useEffect(() => {
    loadShopDetails();
  }, [params.id]);

  const loadShopDetails = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getShopById(params.id as string);
      const shopData = data.user || data;
      setShop(shopData);

      // Pre-populate form with existing data
      const initialFormData = {
        shopName: shopData.shopName || '',
        ownerName: shopData.name || '',
        phoneNumber: shopData.phoneNumber || '',
        email: shopData.email || '',
        businessRegNumber: shopData.businessRegNumber || '',
        location: shopData.location?.coordinates
          ? {
              latitude: shopData.location.coordinates[1],
              longitude: shopData.location.coordinates[0],
            }
          : { latitude: -1.286389, longitude: 36.817223 },
        address: {
          street: shopData.address?.street || '',
          area: shopData.address?.area || '',
          city: shopData.address?.city || 'Nairobi',
          county: shopData.address?.county || '',
        },
        shopPhoto: shopData.shopPhoto || '',
        operatingHours: {
          open: shopData.operatingHours?.open || '08:00',
          close: shopData.operatingHours?.close || '20:00',
          days: shopData.operatingHours?.days || [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
          ],
        },
        specialNotes: shopData.specialNotes || '',
      };

      setFormData(initialFormData);
      setOriginalData(JSON.parse(JSON.stringify(initialFormData)));
    } catch (error: any) {
      console.error('Error loading shop details:', error);
      Alert.alert('Error', 'Failed to load shop details. Please try again.');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user is authorized to edit
  const isAuthorized = useCallback(() => {
    if (!shop || !user) return false;

    // Only allow editing if shop is pending
    if (shop.approvalStatus !== 'pending') {
      return false;
    }

    // Check if shop was created by this agent
    if (shop.createdBy !== user._id) {
      return false;
    }

    return true;
  }, [shop, user]);

  // Check if there are changes
  const checkForChanges = useCallback(() => {
    if (!originalData) return false;

    const hasChanged =
      JSON.stringify(formData) !== JSON.stringify(originalData);

    setHasChanges(hasChanged);
    return hasChanged;
  }, [formData, originalData]);

  useEffect(() => {
    checkForChanges();
  }, [formData, checkForChanges]);

  const updateFormData = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const updateNestedData = (parent: string, key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: { ...(prev as any)[parent], [key]: value },
    }));
  };

  const toggleDay = (day: string) => {
    const currentDays = formData.operatingHours.days;
    const newDays = currentDays.includes(day)
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day];

    updateNestedData('operatingHours', 'days', newDays);
  };

  const validateForm = () => {
    if (!formData.shopName.trim()) {
      Alert.alert('Required', 'Please enter shop name');
      return false;
    }
    if (!formData.ownerName.trim()) {
      Alert.alert('Required', 'Please enter owner name');
      return false;
    }
    if (!formData.phoneNumber.trim()) {
      Alert.alert('Required', 'Please enter phone number');
      return false;
    }
    // Validate phone number format
    if (!/^\+254\d{9}$/.test(formData.phoneNumber)) {
      Alert.alert('Invalid Format', 'Phone number must be in format: +254712345678');
      return false;
    }
    if (!formData.address.area.trim()) {
      Alert.alert('Required', 'Please enter area/neighborhood');
      return false;
    }
    if (!formData.shopPhoto) {
      Alert.alert('Required', 'Please provide a shop photo');
      return false;
    }
    if (formData.operatingHours.days.length === 0) {
      Alert.alert('Required', 'Please select at least one operating day');
      return false;
    }
    return true;
  };

  const getChangedFields = () => {
    if (!originalData) return {};

    const changes: any = {};

    // Compare each field
    if (formData.shopName !== originalData.shopName) {
      changes.shopName = formData.shopName.trim();
    }
    if (formData.ownerName !== originalData.ownerName) {
      changes.name = formData.ownerName.trim();
    }
    if (formData.phoneNumber !== originalData.phoneNumber) {
      changes.phoneNumber = formData.phoneNumber.trim();
    }
    if (formData.email !== originalData.email) {
      changes.email = formData.email.trim() || undefined;
    }
    if (formData.businessRegNumber !== originalData.businessRegNumber) {
      changes.businessRegNumber = formData.businessRegNumber.trim() || undefined;
    }

    // Location
    if (
      formData.location.latitude !== originalData.location.latitude ||
      formData.location.longitude !== originalData.location.longitude
    ) {
      changes.location = {
        type: 'Point',
        coordinates: [formData.location.longitude, formData.location.latitude],
      };
    }

    // Address
    if (JSON.stringify(formData.address) !== JSON.stringify(originalData.address)) {
      changes.address = {
        street: formData.address.street.trim(),
        area: formData.address.area.trim(),
        city: formData.address.city.trim(),
        county: formData.address.county.trim(),
      };
    }

    // Photo
    if (formData.shopPhoto !== originalData.shopPhoto) {
      changes.shopPhoto = formData.shopPhoto;
    }

    // Operating Hours
    if (JSON.stringify(formData.operatingHours) !== JSON.stringify(originalData.operatingHours)) {
      changes.operatingHours = formData.operatingHours;
    }

    // Special Notes
    if (formData.specialNotes !== originalData.specialNotes) {
      changes.specialNotes = formData.specialNotes.trim() || undefined;
    }

    return changes;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const changes = getChangedFields();

    if (Object.keys(changes).length === 0) {
      Alert.alert('No Changes', 'No changes detected. Please modify at least one field.');
      return;
    }

    // Show confirmation with changes
    const changesList = Object.keys(changes)
      .map((key) => {
        const labels: Record<string, string> = {
          shopName: 'Shop Name',
          name: 'Owner Name',
          phoneNumber: 'Phone Number',
          email: 'Email',
          businessRegNumber: 'Business Registration',
          location: 'Location',
          address: 'Address',
          shopPhoto: 'Shop Photo',
          operatingHours: 'Operating Hours',
          specialNotes: 'Special Notes',
        };
        return `• ${labels[key] || key}`;
      })
      .join('\n');

    Alert.alert(
      'Confirm Changes',
      `The following fields will be updated:\n\n${changesList}\n\nDo you want to proceed?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save Changes',
          onPress: async () => {
            try {
              setIsSaving(true);
              await apiService.put(`/user/edit/${params.id}`, changes);

              Alert.alert(
                'Success!',
                'Shop details updated successfully.',
                [
                  {
                    text: 'OK',
                    onPress: () => router.back(),
                  },
                ],
                { cancelable: false }
              );
            } catch (error: any) {
              console.error('Error updating shop:', error);
              Alert.alert(
                'Update Failed',
                error.response?.data?.message || error.message || 'Could not update shop details'
              );
            } finally {
              setIsSaving(false);
            }
          },
        },
      ]
    );
  };

  const handleDiscard = () => {
    if (!hasChanges) {
      router.back();
      return;
    }

    Alert.alert(
      'Discard Changes?',
      'You have unsaved changes. Are you sure you want to discard them?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => router.back(),
        },
      ]
    );
  };

  const getChangedFieldStyle = (fieldName: string) => {
    if (!originalData) return {};

    const isChanged =
      JSON.stringify((formData as any)[fieldName]) !==
      JSON.stringify((originalData as any)[fieldName]);

    return isChanged ? styles.changedField : {};
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22c55e" />
        <Text style={styles.loadingText}>Loading shop details...</Text>
      </View>
    );
  }

  if (!shop) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
        <Text style={styles.errorText}>Shop not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!isAuthorized()) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="lock-closed-outline" size={64} color="#ef4444" />
        <Text style={styles.errorText}>Not Authorized</Text>
        <Text style={styles.errorSubtext}>
          {shop.approvalStatus !== 'pending'
            ? 'Only pending shops can be edited.'
            : 'You can only edit shops you have registered.'}
        </Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={handleDiscard} style={styles.backIcon}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Shop</Text>
        <View style={{ width: 40 }} />
      </View>

      {hasChanges && (
        <View style={styles.changesIndicator}>
          <Ionicons name="alert-circle" size={16} color="#f59e0b" />
          <Text style={styles.changesText}>You have unsaved changes</Text>
        </View>
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Shop Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, getChangedFieldStyle('shopName')]}
              placeholder="e.g., Mama Ngina Groceries"
              value={formData.shopName}
              onChangeText={(value) => updateFormData('shopName', value)}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Owner Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, getChangedFieldStyle('ownerName')]}
              placeholder="e.g., Jane Ngina"
              value={formData.ownerName}
              onChangeText={(value) => updateFormData('ownerName', value)}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Phone Number <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, getChangedFieldStyle('phoneNumber')]}
              placeholder="+254712345678"
              value={formData.phoneNumber}
              onChangeText={(value) => updateFormData('phoneNumber', value)}
              keyboardType="phone-pad"
            />
            <Text style={styles.hint}>Format: +254712345678</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email (Optional)</Text>
            <TextInput
              style={[styles.input, getChangedFieldStyle('email')]}
              placeholder="shop@example.com"
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Business Registration Number (Optional)</Text>
            <TextInput
              style={[styles.input, getChangedFieldStyle('businessRegNumber')]}
              placeholder="Enter registration number if available"
              value={formData.businessRegNumber}
              onChangeText={(value) => updateFormData('businessRegNumber', value)}
            />
          </View>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>

          <View style={styles.inputContainer}>
            <LocationPicker
              onLocationChange={(loc) => updateFormData('location', loc)}
              initialLocation={formData.location}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Street / Building</Text>
            <TextInput
              style={[styles.input, getChangedFieldStyle('address')]}
              placeholder="e.g., Moi Avenue, Building 12"
              value={formData.address.street}
              onChangeText={(value) => updateNestedData('address', 'street', value)}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Area / Neighborhood <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, getChangedFieldStyle('address')]}
              placeholder="e.g., Westlands, Kilimani"
              value={formData.address.area}
              onChangeText={(value) => updateNestedData('address', 'area', value)}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.flex1]}>
              <Text style={styles.label}>City</Text>
              <TextInput
                style={[styles.input, getChangedFieldStyle('address')]}
                placeholder="Nairobi"
                value={formData.address.city}
                onChangeText={(value) => updateNestedData('address', 'city', value)}
              />
            </View>

            <View style={[styles.inputContainer, styles.flex1]}>
              <Text style={styles.label}>County</Text>
              <TextInput
                style={[styles.input, getChangedFieldStyle('address')]}
                placeholder="Nairobi"
                value={formData.address.county}
                onChangeText={(value) => updateNestedData('address', 'county', value)}
              />
            </View>
          </View>
        </View>

        {/* Shop Photo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shop Photo</Text>
          <View style={styles.inputContainer}>
            <ShopPhotoCapture
              onPhotoTaken={(uri) => updateFormData('shopPhoto', uri)}
              initialPhoto={formData.shopPhoto}
            />
          </View>
        </View>

        {/* Operating Hours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Operating Hours</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Days of Operation <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.daysContainer}>
              {DAYS_OF_WEEK.map((day) => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayChip,
                    formData.operatingHours.days.includes(day) && styles.dayChipActive,
                  ]}
                  onPress={() => toggleDay(day)}
                >
                  <Text
                    style={[
                      styles.dayChipText,
                      formData.operatingHours.days.includes(day) && styles.dayChipTextActive,
                    ]}
                  >
                    {day.substring(0, 3)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.flex1]}>
              <Text style={styles.label}>Opening Time</Text>
              <TextInput
                style={[styles.input, getChangedFieldStyle('operatingHours')]}
                placeholder="08:00"
                value={formData.operatingHours.open}
                onChangeText={(value) => updateNestedData('operatingHours', 'open', value)}
              />
              <Text style={styles.hint}>24-hour format (e.g., 08:00)</Text>
            </View>

            <View style={[styles.inputContainer, styles.flex1]}>
              <Text style={styles.label}>Closing Time</Text>
              <TextInput
                style={[styles.input, getChangedFieldStyle('operatingHours')]}
                placeholder="20:00"
                value={formData.operatingHours.close}
                onChangeText={(value) => updateNestedData('operatingHours', 'close', value)}
              />
              <Text style={styles.hint}>24-hour format (e.g., 20:00)</Text>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Special Notes (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea, getChangedFieldStyle('specialNotes')]}
              placeholder="Any special information about the shop..."
              value={formData.specialNotes}
              onChangeText={(value) => updateFormData('specialNotes', value)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleDiscard}
          disabled={isSaving}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.saveButton,
            (!hasChanges || isSaving) && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={!hasChanges || isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#f9fafb',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  backButton: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  backIcon: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  changesIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef3c7',
    paddingVertical: 8,
    gap: 8,
  },
  changesText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f59e0b',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#ef4444',
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
  changedField: {
    borderColor: '#3b82f6',
    borderWidth: 2,
    backgroundColor: '#eff6ff',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  hint: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  dayChipActive: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  dayChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  dayChipTextActive: {
    color: '#fff',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
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
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22c55e',
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
