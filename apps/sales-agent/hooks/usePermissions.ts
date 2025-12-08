import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Linking, Platform } from 'react-native';

export type PermissionStatus = 'granted' | 'denied' | 'undetermined';

interface PermissionState {
  location: PermissionStatus;
  camera: PermissionStatus;
  mediaLibrary: PermissionStatus;
}

interface UsePermissionsReturn {
  permissions: PermissionState;
  isChecking: boolean;
  checkPermissions: () => Promise<void>;
  requestLocationPermission: () => Promise<boolean>;
  requestCameraPermission: () => Promise<boolean>;
  requestMediaLibraryPermission: () => Promise<boolean>;
  requestAllPermissions: () => Promise<boolean>;
  hasLocation: boolean;
  hasCamera: boolean;
  hasMediaLibrary: boolean;
  hasAllPermissions: boolean;
  openSettings: () => void;
}

/**
 * usePermissions Hook
 *
 * Manages all app permissions including location, camera, and media library.
 * Provides granular control and bulk permission requests.
 * Handles permission denial with user-friendly prompts to open settings.
 *
 * @returns Permission state and request functions
 *
 * @example
 * const {
 *   hasLocation,
 *   hasCamera,
 *   requestLocationPermission,
 *   openSettings
 * } = usePermissions();
 *
 * const handleUseLocation = async () => {
 *   if (!hasLocation) {
 *     const granted = await requestLocationPermission();
 *     if (!granted) {
 *       Alert.alert('Permission required', 'Please enable location access');
 *     }
 *   }
 * };
 */
export const usePermissions = (): UsePermissionsReturn => {
  const [permissions, setPermissions] = useState<PermissionState>({
    location: 'undetermined',
    camera: 'undetermined',
    mediaLibrary: 'undetermined',
  });
  const [isChecking, setIsChecking] = useState(false);

  /**
   * Check current status of all permissions
   */
  const checkPermissions = useCallback(async () => {
    setIsChecking(true);
    try {
      const [locationStatus, cameraStatus, mediaStatus] = await Promise.all([
        Location.getForegroundPermissionsAsync(),
        Camera.getCameraPermissionsAsync(),
        ImagePicker.getMediaLibraryPermissionsAsync(),
      ]);

      setPermissions({
        location: locationStatus.status as PermissionStatus,
        camera: cameraStatus.status as PermissionStatus,
        mediaLibrary: mediaStatus.status as PermissionStatus,
      });
    } catch (error) {
      console.error('Error checking permissions:', error);
    } finally {
      setIsChecking(false);
    }
  }, []);

  /**
   * Request location permission with user-friendly error handling
   */
  const requestLocationPermission = useCallback(async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const newStatus = status as PermissionStatus;

      setPermissions(prev => ({ ...prev, location: newStatus }));

      if (newStatus === 'denied') {
        Alert.alert(
          'Location Permission Required',
          'Location access is needed to show nearby shops and optimize your route. Please enable it in settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
      }

      return newStatus === 'granted';
    } catch (error) {
      console.error('Error requesting location permission:', error);
      Alert.alert('Error', 'Failed to request location permission. Please try again.');
      return false;
    }
  }, []);

  /**
   * Request camera permission with user-friendly error handling
   */
  const requestCameraPermission = useCallback(async (): Promise<boolean> => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      const newStatus = status as PermissionStatus;

      setPermissions(prev => ({ ...prev, camera: newStatus }));

      if (newStatus === 'denied') {
        Alert.alert(
          'Camera Permission Required',
          'Camera access is needed to capture shop photos for KYC registration. Please enable it in settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
      }

      return newStatus === 'granted';
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      Alert.alert('Error', 'Failed to request camera permission. Please try again.');
      return false;
    }
  }, []);

  /**
   * Request media library permission with user-friendly error handling
   */
  const requestMediaLibraryPermission = useCallback(async (): Promise<boolean> => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const newStatus = status as PermissionStatus;

      setPermissions(prev => ({ ...prev, mediaLibrary: newStatus }));

      if (newStatus === 'denied') {
        Alert.alert(
          'Media Library Permission Required',
          'Photo library access is needed to upload shop images. Please enable it in settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
      }

      return newStatus === 'granted';
    } catch (error) {
      console.error('Error requesting media library permission:', error);
      Alert.alert('Error', 'Failed to request media library permission. Please try again.');
      return false;
    }
  }, []);

  /**
   * Request all permissions at once
   * Useful for initial app setup or permission review
   */
  const requestAllPermissions = useCallback(async (): Promise<boolean> => {
    try {
      const [location, camera, media] = await Promise.all([
        requestLocationPermission(),
        requestCameraPermission(),
        requestMediaLibraryPermission(),
      ]);

      return location && camera && media;
    } catch (error) {
      console.error('Error requesting all permissions:', error);
      return false;
    }
  }, [requestLocationPermission, requestCameraPermission, requestMediaLibraryPermission]);

  /**
   * Open device settings
   * Fallback for when permissions are permanently denied
   */
  const openSettings = useCallback(() => {
    Linking.openSettings().catch(() => {
      Alert.alert('Error', 'Unable to open settings. Please open settings manually.');
    });
  }, []);

  // Check permissions on mount
  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  return {
    permissions,
    isChecking,
    checkPermissions,
    requestLocationPermission,
    requestCameraPermission,
    requestMediaLibraryPermission,
    requestAllPermissions,
    hasLocation: permissions.location === 'granted',
    hasCamera: permissions.camera === 'granted',
    hasMediaLibrary: permissions.mediaLibrary === 'granted',
    hasAllPermissions:
      permissions.location === 'granted' &&
      permissions.camera === 'granted' &&
      permissions.mediaLibrary === 'granted',
    openSettings,
  };
};

/**
 * useLocationPermission Hook
 *
 * Simplified hook for location permission only.
 * Useful when only location is needed (e.g., route screens).
 *
 * @example
 * const { hasPermission, requestPermission } = useLocationPermission();
 */
export const useLocationPermission = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const checkPermission = useCallback(async () => {
    setIsChecking(true);
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setHasPermission(status === 'granted');
    } catch (error) {
      console.error('Error checking location permission:', error);
    } finally {
      setIsChecking(false);
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      setHasPermission(granted);

      if (!granted) {
        Alert.alert(
          'Location Permission Required',
          'Location access is needed for this feature.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
      }

      return granted;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  }, []);

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  return {
    hasPermission,
    isChecking,
    requestPermission,
    checkPermission,
  };
};

/**
 * useCameraPermission Hook
 *
 * Simplified hook for camera permission only.
 * Useful when only camera is needed (e.g., KYC photo capture).
 *
 * @example
 * const { hasPermission, requestPermission } = useCameraPermission();
 */
export const useCameraPermission = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const checkPermission = useCallback(async () => {
    setIsChecking(true);
    try {
      const { status } = await Camera.getCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    } catch (error) {
      console.error('Error checking camera permission:', error);
    } finally {
      setIsChecking(false);
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      const granted = status === 'granted';
      setHasPermission(granted);

      if (!granted) {
        Alert.alert(
          'Camera Permission Required',
          'Camera access is needed to capture photos.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
      }

      return granted;
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      return false;
    }
  }, []);

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  return {
    hasPermission,
    isChecking,
    requestPermission,
    checkPermission,
  };
};
