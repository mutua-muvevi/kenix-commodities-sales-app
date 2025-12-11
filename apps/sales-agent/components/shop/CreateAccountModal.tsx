/**
 * Create Account Modal Component
 * Modal for creating shop owner account from shop details screen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import shopAccountService from '../../services/shop-account';

interface CreateAccountModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (credentials: {
    email: string;
    password: string;
    shopName: string;
    phoneNumber: string;
  }) => void;
  shopId: string;
  shopName: string;
  phoneNumber: string;
}

export default function CreateAccountModal({
  visible,
  onClose,
  onSuccess,
  shopId,
  shopName,
  phoneNumber,
}: CreateAccountModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [sendViaSMS, setSendViaSMS] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const generatePassword = () => {
    const newPassword = shopAccountService.generateTempPassword();
    setPassword(newPassword);
  };

  const handleCreate = async () => {
    // Validate
    if (!email.trim()) {
      Alert.alert('Required', 'Please enter email');
      return;
    }

    if (!shopAccountService.validateEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Required', 'Please generate or enter a password');
      return;
    }

    const passwordValidation = shopAccountService.validatePassword(password);
    if (!passwordValidation.valid) {
      Alert.alert('Invalid Password', passwordValidation.message || 'Password is too weak');
      return;
    }

    try {
      setIsLoading(true);

      const result = await shopAccountService.createShopAccount({
        shopId,
        email: email.trim(),
        password,
        phoneNumber,
        sendCredentialsBySMS: sendViaSMS,
      });

      onSuccess({
        email: result.credentials.email,
        password: result.credentials.password,
        shopName,
        phoneNumber,
      });

      // Reset form
      setEmail('');
      setPassword('');
      setSendViaSMS(true);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Create Shop Owner Account</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.shopName}>{shopName}</Text>
            <Text style={styles.shopPhone}>{phoneNumber}</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Email <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="shopowner@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
              <Text style={styles.hint}>This will be used for shop owner login</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Temporary Password <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="Enter or generate password"
                  value={password}
                  onChangeText={setPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.generateButton}
                  onPress={generatePassword}
                  disabled={isLoading}
                >
                  <Ionicons name="refresh" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
              <Text style={styles.hint}>Minimum 8 characters</Text>
            </View>

            <View style={styles.smsToggleCard}>
              <Ionicons name="chatbubble-ellipses-outline" size={24} color="#3b82f6" />
              <View style={styles.smsToggleContent}>
                <Text style={styles.smsToggleTitle}>Send credentials via SMS</Text>
                <Text style={styles.smsToggleSubtitle}>Open SMS app with pre-filled message</Text>
              </View>
              <Switch
                value={sendViaSMS}
                onValueChange={setSendViaSMS}
                disabled={isLoading}
                trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
                thumbColor={sendViaSMS ? '#3b82f6' : '#f3f4f6'}
              />
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.createButton, isLoading && styles.createButtonDisabled]}
              onPress={handleCreate}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="person-add" size={20} color="#fff" />
                  <Text style={styles.createButtonText}>Create Account</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  shopName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  shopPhone: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
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
  hint: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  passwordContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  passwordInput: {
    flex: 1,
  },
  generateButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smsToggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  smsToggleContent: {
    flex: 1,
  },
  smsToggleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  smsToggleSubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  createButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22c55e',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  createButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
