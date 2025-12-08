import { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

interface PhotoCaptureProps {
  onPhoto: (photo: string) => void;
}

export default function PhotoCapture({ onPhoto }: PhotoCaptureProps) {
  const [photo, setPhoto] = useState<string | null>(null);

  const handleTakePhoto = async () => {
    try {
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Camera permission is required to take photos of delivered goods.'
        );
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7, // Compress to reduce file size
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        setPhoto(uri);
        onPhoto(uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const handleRetake = () => {
    setPhoto(null);
    onPhoto('');
    handleTakePhoto();
  };

  return (
    <View style={styles.container}>
      {photo ? (
        <View style={styles.photoContainer}>
          <Image source={{ uri: photo }} style={styles.photo} />
          <TouchableOpacity style={styles.retakeButton} onPress={handleRetake}>
            <Ionicons name="camera" size={16} color="#FFFFFF" />
            <Text style={styles.retakeButtonText}>Retake Photo</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.captureButton} onPress={handleTakePhoto}>
          <Ionicons name="camera" size={40} color="#0066CC" />
          <Text style={styles.captureButtonText}>Take Photo</Text>
          <Text style={styles.captureButtonHint}>Photo of delivered goods</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  captureButton: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  captureButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0066CC',
    marginTop: 12,
  },
  captureButtonHint: {
    fontSize: 14,
    color: '#999999',
    marginTop: 4,
  },
  photoContainer: {
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#0066CC',
  },
  retakeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
