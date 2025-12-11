import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';

interface ShopUnavailableModalProps {
  visible: boolean;
  shopName: string;
  deliveryId: string;
  onClose: () => void;
  onSubmit: (data: {
    reason: string;
    notes: string;
    photo?: string;
  }) => Promise<void>;
}

const UNAVAILABLE_REASONS = [
  {
    value: 'shop_closed',
    label: 'Shop Closed',
    icon: 'lock-closed' as const,
    description: 'Shop is closed and no one is available',
  },
  {
    value: 'owner_not_present',
    label: 'Owner Not Present',
    icon: 'person-remove' as const,
    description: 'Shop is open but owner/authorized person is not available',
  },
  {
    value: 'wrong_address',
    label: 'Wrong Address',
    icon: 'location' as const,
    description: 'Shop location does not match the address provided',
  },
  {
    value: 'refused_delivery',
    label: 'Refused Delivery',
    icon: 'close-circle' as const,
    description: 'Shop refused to accept the delivery',
  },
  {
    value: 'other',
    label: 'Other',
    icon: 'ellipsis-horizontal-circle' as const,
    description: 'Another reason not listed above',
  },
];

export default function ShopUnavailableModal({
  visible,
  shopName,
  deliveryId,
  onClose,
  onSubmit,
}: ShopUnavailableModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReasonSelect = (reason: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedReason(reason);
  };

  const handleTakePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          'Camera Permission Required',
          'Please allow camera access to take proof photos.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        setPhoto(result.assets[0].uri);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const handleSelectFromGallery = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          'Gallery Permission Required',
          'Please allow gallery access to select photos.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        setPhoto(result.assets[0].uri);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Error selecting photo:', error);
      Alert.alert('Error', 'Failed to select photo. Please try again.');
    }
  };

  const handleSubmit = async () => {
    if (!selectedReason) {
      Alert.alert('Reason Required', 'Please select a reason for the shop being unavailable.');
      return;
    }

    if (selectedReason === 'other' && !notes.trim()) {
      Alert.alert('Notes Required', 'Please provide details in the notes field.');
      return;
    }

    Alert.alert(
      'Confirm Skip Request',
      `This will notify the admin that ${shopName} is unavailable. The admin will need to approve before you can proceed to the next shop.\n\nAre you sure?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Request',
          style: 'default',
          onPress: async () => {
            setIsSubmitting(true);
            try {
              await onSubmit({
                reason: selectedReason,
                notes: notes.trim(),
                photo: photo || undefined,
              });

              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

              // Reset form
              setSelectedReason('');
              setNotes('');
              setPhoto(null);
            } catch (error) {
              console.error('Error submitting skip request:', error);
              Alert.alert(
                'Submission Failed',
                'Failed to send skip request. Please try again or contact support.'
              );
            } finally {
              setIsSubmitting(false);
            }
          },
        },
      ]
    );
  };

  const handleClose = () => {
    if (selectedReason || notes || photo) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to close?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              setSelectedReason('');
              setNotes('');
              setPhoto(null);
              onClose();
            },
          },
        ]
      );
    } else {
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleClose}
            disabled={isSubmitting}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={28} color="#1A1A1A" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Shop Unavailable</Text>
            <Text style={styles.headerSubtitle}>{shopName}</Text>
          </View>
          <View style={styles.closeButton} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <Ionicons name="information-circle" size={24} color="#FF9800" />
            <Text style={styles.infoBannerText}>
              Select a reason why this shop is unavailable. Admin will be notified and can
              unlock the next shop for you.
            </Text>
          </View>

          {/* Reason Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reason for Unavailability</Text>
            <View style={styles.reasonList}>
              {UNAVAILABLE_REASONS.map((reason) => (
                <TouchableOpacity
                  key={reason.value}
                  style={[
                    styles.reasonCard,
                    selectedReason === reason.value && styles.reasonCardSelected,
                  ]}
                  onPress={() => handleReasonSelect(reason.value)}
                  disabled={isSubmitting}
                >
                  <View style={styles.reasonHeader}>
                    <View
                      style={[
                        styles.reasonIconContainer,
                        selectedReason === reason.value && styles.reasonIconContainerSelected,
                      ]}
                    >
                      <Ionicons
                        name={reason.icon}
                        size={24}
                        color={selectedReason === reason.value ? '#FFFFFF' : '#FF9800'}
                      />
                    </View>
                    <View style={styles.reasonContent}>
                      <Text style={styles.reasonLabel}>{reason.label}</Text>
                      <Text style={styles.reasonDescription}>{reason.description}</Text>
                    </View>
                    {selectedReason === reason.value && (
                      <Ionicons name="checkmark-circle" size={24} color="#FF9800" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Additional Notes {selectedReason === 'other' && '(Required)'}
            </Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Provide additional details about the situation..."
              placeholderTextColor="#999999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={notes}
              onChangeText={setNotes}
              editable={!isSubmitting}
              maxLength={500}
            />
            <Text style={styles.characterCount}>{notes.length}/500</Text>
          </View>

          {/* Photo Evidence (Optional) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Photo Evidence (Optional)</Text>
            <Text style={styles.sectionDescription}>
              Add a photo to support your report
            </Text>

            {photo ? (
              <View style={styles.photoContainer}>
                <Image source={{ uri: photo }} style={styles.photoPreview} />
                <TouchableOpacity
                  style={styles.removePhotoButton}
                  onPress={() => setPhoto(null)}
                  disabled={isSubmitting}
                >
                  <Ionicons name="close-circle" size={32} color="#FF5252" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.photoActions}>
                <TouchableOpacity
                  style={styles.photoButton}
                  onPress={handleTakePhoto}
                  disabled={isSubmitting}
                >
                  <Ionicons name="camera" size={24} color="#0066CC" />
                  <Text style={styles.photoButtonText}>Take Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.photoButton}
                  onPress={handleSelectFromGallery}
                  disabled={isSubmitting}
                >
                  <Ionicons name="images" size={24} color="#0066CC" />
                  <Text style={styles.photoButtonText}>Choose from Gallery</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitButton, !selectedReason && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!selectedReason || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="send" size={20} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>Send Skip Request to Admin</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    alignItems: 'flex-start',
  },
  infoBannerText: {
    flex: 1,
    fontSize: 14,
    color: '#E65100',
    marginLeft: 12,
    lineHeight: 20,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
  },
  reasonList: {
    gap: 12,
  },
  reasonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  reasonCardSelected: {
    borderColor: '#FF9800',
    backgroundColor: '#FFF8F0',
  },
  reasonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reasonIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF3E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  reasonIconContainerSelected: {
    backgroundColor: '#FF9800',
  },
  reasonContent: {
    flex: 1,
  },
  reasonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  reasonDescription: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 18,
  },
  notesInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minHeight: 100,
  },
  characterCount: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'right',
    marginTop: 4,
  },
  photoActions: {
    flexDirection: 'row',
    gap: 12,
  },
  photoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#0066CC',
    borderRadius: 8,
    paddingVertical: 16,
    gap: 8,
  },
  photoButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0066CC',
  },
  photoContainer: {
    position: 'relative',
  },
  photoPreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
  },
  removePhotoButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  bottomSpacer: {
    height: 100,
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: '#FF9800',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
