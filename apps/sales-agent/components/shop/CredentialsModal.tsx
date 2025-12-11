/**
 * Credentials Modal Component
 * Displays shop owner login credentials with sharing options
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import shopAccountService from '../../services/shop-account';

interface CredentialsModalProps {
  visible: boolean;
  onClose: () => void;
  credentials: {
    email: string;
    password: string;
    shopName: string;
    phoneNumber: string;
  };
}

export default function CredentialsModal({
  visible,
  onClose,
  credentials,
}: CredentialsModalProps) {
  const [confirmed, setConfirmed] = useState(false);

  const handleCopyEmail = async () => {
    await Clipboard.setStringAsync(credentials.email);
    Alert.alert('Copied', 'Email copied to clipboard');
  };

  const handleCopyPassword = async () => {
    await Clipboard.setStringAsync(credentials.password);
    Alert.alert('Copied', 'Password copied to clipboard');
  };

  const handleCopyBoth = async () => {
    const text = `Email: ${credentials.email}\nPassword: ${credentials.password}`;
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied', 'Credentials copied to clipboard');
  };

  const handleShareWhatsApp = async () => {
    try {
      await shopAccountService.shareViaWhatsApp(
        credentials.phoneNumber,
        credentials.email,
        credentials.password,
        credentials.shopName
      );
      setConfirmed(true);
    } catch (error) {
      console.error('Error sharing via WhatsApp:', error);
    }
  };

  const handleShareSMS = async () => {
    try {
      await shopAccountService.sendCredentialsBySMS(
        credentials.phoneNumber,
        credentials.email,
        credentials.password
      );
      setConfirmed(true);
      Alert.alert('Success', 'SMS app opened with credentials');
    } catch (error) {
      console.error('Error sharing via SMS:', error);
    }
  };

  const handleDone = () => {
    if (!confirmed) {
      Alert.alert(
        'Confirm',
        'Have you shared the credentials with the shop owner?',
        [
          { text: 'Not Yet', style: 'cancel' },
          {
            text: 'Yes, Done',
            onPress: () => {
              setConfirmed(true);
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
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleDone}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons name="checkmark-circle" size={32} color="#22c55e" />
            </View>
            <Text style={styles.title}>Account Created!</Text>
            <Text style={styles.subtitle}>
              Share these credentials with {credentials.shopName}
            </Text>
          </View>

          {/* Credentials */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.warningCard}>
              <Ionicons name="information-circle" size={24} color="#f59e0b" />
              <Text style={styles.warningText}>
                Important: Share these credentials securely with the shop owner. They will need
                them to log in to the Kenix Shop app.
              </Text>
            </View>

            <View style={styles.credentialCard}>
              <Text style={styles.credentialLabel}>Shop Name</Text>
              <View style={styles.credentialRow}>
                <Text style={styles.credentialValue}>{credentials.shopName}</Text>
              </View>
            </View>

            <View style={styles.credentialCard}>
              <Text style={styles.credentialLabel}>Email</Text>
              <View style={styles.credentialRow}>
                <Text style={styles.credentialValue}>{credentials.email}</Text>
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={handleCopyEmail}
                >
                  <Ionicons name="copy-outline" size={20} color="#3b82f6" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.credentialCard}>
              <Text style={styles.credentialLabel}>Temporary Password</Text>
              <View style={styles.credentialRow}>
                <Text style={styles.credentialValue}>{credentials.password}</Text>
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={handleCopyPassword}
                >
                  <Ionicons name="copy-outline" size={20} color="#3b82f6" />
                </TouchableOpacity>
              </View>
              <Text style={styles.hint}>
                The shop owner can change this password after logging in
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsSection}>
              <Text style={styles.actionsTitle}>Share Credentials</Text>

              <TouchableOpacity style={styles.actionButton} onPress={handleCopyBoth}>
                <Ionicons name="copy" size={24} color="#3b82f6" />
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>Copy All</Text>
                  <Text style={styles.actionSubtitle}>Copy email and password</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={handleShareWhatsApp}>
                <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>Share via WhatsApp</Text>
                  <Text style={styles.actionSubtitle}>Send credentials directly</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={handleShareSMS}>
                <Ionicons name="chatbubble" size={24} color="#22c55e" />
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>Share via SMS</Text>
                  <Text style={styles.actionSubtitle}>Send text message</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            {/* Confirmation Checkbox */}
            {confirmed && (
              <View style={styles.confirmationBadge}>
                <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                <Text style={styles.confirmationText}>Credentials shared successfully!</Text>
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.doneButton, !confirmed && styles.doneButtonWarning]}
              onPress={handleDone}
            >
              <Text style={styles.doneButtonText}>
                {confirmed ? 'Done' : "I've Shared the Credentials"}
              </Text>
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
    maxHeight: '90%',
  },
  header: {
    alignItems: 'center',
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  warningCard: {
    flexDirection: 'row',
    backgroundColor: '#fef3c7',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 20,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#92400e',
    lineHeight: 18,
  },
  credentialCard: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  credentialLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  credentialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  credentialValue: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    fontFamily: 'monospace',
  },
  copyButton: {
    padding: 8,
    marginLeft: 8,
  },
  hint: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 8,
    fontStyle: 'italic',
  },
  actionsSection: {
    marginTop: 8,
    marginBottom: 20,
  },
  actionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 13,
    color: '#6b7280',
  },
  confirmationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 20,
  },
  confirmationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#15803d',
  },
  footer: {
    padding: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  doneButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  doneButtonWarning: {
    backgroundColor: '#f59e0b',
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
