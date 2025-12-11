import { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Delivery } from '../types';
import { useRouteStore } from '../store/routeStore';
import { useAuthStore } from '../store/authStore';
import { deliveryService } from '../services/api';
import { getCurrentLocation } from '../services/location';
import { websocketService } from '../services/websocket';
import SignatureCapture from './SignatureCapture';
import PhotoCapture from './PhotoCapture';

interface DeliveryFlowModalProps {
  delivery: Delivery;
  visible: boolean;
  onClose: () => void;
  onComplete: () => void;
}

type FlowStep = 'arrival' | 'payment' | 'completion' | 'success';

export default function DeliveryFlowModal({
  delivery,
  visible,
  onClose,
  onComplete,
}: DeliveryFlowModalProps) {
  const { user } = useAuthStore();
  const { markArrival } = useRouteStore();
  const [step, setStep] = useState<FlowStep>('arrival');
  const [isLoading, setIsLoading] = useState(false);

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'cash' | 'airtel'>('mpesa');
  const [paymentAmount, setPaymentAmount] = useState(delivery.totalAmount.toString());
  const [waitingForPayment, setWaitingForPayment] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  // Completion state
  const [signature, setSignature] = useState('');
  const [photo, setPhoto] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    // Listen for payment confirmation via WebSocket
    const handlePaymentConfirmed = (data: any) => {
      if (data.deliveryId === delivery._id && data.status === 'confirmed') {
        setPaymentConfirmed(true);
        setWaitingForPayment(false);
        setStep('completion');
      }
    };

    websocketService.on('payment:confirmed', handlePaymentConfirmed);

    return () => {
      websocketService.off('payment:confirmed', handlePaymentConfirmed);
    };
  }, [delivery._id]);

  const handleMarkArrival = async () => {
    setIsLoading(true);
    try {
      const location = await getCurrentLocation();
      if (!location) {
        Alert.alert('Error', 'Could not get your current location');
        setIsLoading(false);
        return;
      }

      await markArrival(delivery._id, location);
      setStep('payment');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to mark arrival');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitPayment = async () => {
    const amount = parseFloat(paymentAmount);

    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setIsLoading(true);

    try {
      const response = await deliveryService.submitPayment(delivery._id, {
        paymentMethod,
        amount,
        phoneNumber: delivery.shopId.phoneNumber,
      });

      if (paymentMethod === 'mpesa') {
        // Wait for WebSocket confirmation
        setWaitingForPayment(true);
        setIsLoading(false);

        // Set timeout for payment confirmation (2 minutes)
        setTimeout(() => {
          if (!paymentConfirmed) {
            setWaitingForPayment(false);
            Alert.alert(
              'Payment Timeout',
              'Payment confirmation timed out. Please try again or use a different payment method.',
              [{ text: 'OK' }]
            );
          }
        }, 120000);
      } else {
        // Cash or Airtel - proceed immediately
        setStep('completion');
        setIsLoading(false);
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Payment submission failed');
      setIsLoading(false);
    }
  };

  const handleCompleteDelivery = async () => {
    if (!signature) {
      Alert.alert('Error', 'Please capture shop owner signature');
      return;
    }

    if (!photo) {
      Alert.alert('Error', 'Please take a photo of delivered goods');
      return;
    }

    setIsLoading(true);

    try {
      const location = await getCurrentLocation();
      if (!location) {
        Alert.alert('Error', 'Could not get your current location');
        setIsLoading(false);
        return;
      }

      await deliveryService.completeDelivery(delivery._id, {
        paymentMethod,
        signature,
        photo,
        notes: notes.trim() || undefined,
        location,
      });

      setStep('success');
      setIsLoading(false);

      // Auto-close after showing success
      setTimeout(() => {
        onComplete();
      }, 2000);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to complete delivery');
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString()}`;
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} disabled={isLoading}>
            <Ionicons name="close" size={28} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {step === 'arrival' && 'Confirm Arrival'}
            {step === 'payment' && 'Collect Payment'}
            {step === 'completion' && 'Complete Delivery'}
            {step === 'success' && 'Success!'}
          </Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Step Indicator */}
        <View style={styles.stepIndicator}>
          <View style={[styles.stepDot, step !== 'arrival' && styles.stepDotActive]}>
            <Text style={styles.stepNumber}>1</Text>
          </View>
          <View style={[styles.stepLine, step !== 'arrival' && styles.stepLineActive]} />
          <View
            style={[
              styles.stepDot,
              (step === 'completion' || step === 'success') && styles.stepDotActive,
            ]}
          >
            <Text style={styles.stepNumber}>2</Text>
          </View>
          <View
            style={[
              styles.stepLine,
              step === 'success' && styles.stepLineActive,
            ]}
          />
          <View style={[styles.stepDot, step === 'success' && styles.stepDotActive]}>
            <Text style={styles.stepNumber}>3</Text>
          </View>
        </View>

        <ScrollView style={styles.content}>
          {/* Step 1: Arrival */}
          {step === 'arrival' && (
            <View style={styles.stepContent}>
              <View style={styles.iconContainer}>
                <Ionicons name="location" size={64} color="#0066CC" />
              </View>
              <Text style={styles.stepTitle}>Confirm Your Arrival</Text>
              <Text style={styles.stepDescription}>
                You are at {delivery.shopId.shopName}. Please confirm your arrival to
                proceed with payment collection.
              </Text>

              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>Shop</Text>
                <Text style={styles.infoValue}>{delivery.shopId.shopName}</Text>
                <Text style={[styles.infoLabel, { marginTop: 12 }]}>
                  Address
                </Text>
                <Text style={styles.infoValue}>{delivery.shopId.address}</Text>
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
                onPress={handleMarkArrival}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                    <Text style={styles.primaryButtonText}>Confirm Arrival</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Step 2: Payment */}
          {step === 'payment' && !waitingForPayment && (
            <View style={styles.stepContent}>
              <View style={styles.iconContainer}>
                <Ionicons name="card" size={64} color="#0066CC" />
              </View>
              <Text style={styles.stepTitle}>Collect Payment</Text>
              <Text style={styles.stepDescription}>
                Total amount to collect: {formatCurrency(delivery.totalAmount)}
              </Text>

              {/* Payment Method Selector */}
              <View style={styles.paymentMethods}>
                <Text style={styles.sectionLabel}>Payment Method</Text>

                <TouchableOpacity
                  style={[
                    styles.paymentOption,
                    paymentMethod === 'mpesa' && styles.paymentOptionActive,
                  ]}
                  onPress={() => setPaymentMethod('mpesa')}
                >
                  <View style={styles.paymentOptionContent}>
                    <Ionicons
                      name="phone-portrait"
                      size={24}
                      color={paymentMethod === 'mpesa' ? '#0066CC' : '#666666'}
                    />
                    <View style={styles.paymentOptionText}>
                      <Text
                        style={[
                          styles.paymentOptionTitle,
                          paymentMethod === 'mpesa' && styles.paymentOptionTitleActive,
                        ]}
                      >
                        M-Pesa
                      </Text>
                      <Text style={styles.paymentOptionSubtitle}>Recommended</Text>
                    </View>
                  </View>
                  {paymentMethod === 'mpesa' && (
                    <Ionicons name="checkmark-circle" size={24} color="#0066CC" />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.paymentOption,
                    paymentMethod === 'cash' && styles.paymentOptionActive,
                  ]}
                  onPress={() => setPaymentMethod('cash')}
                >
                  <View style={styles.paymentOptionContent}>
                    <Ionicons
                      name="cash"
                      size={24}
                      color={paymentMethod === 'cash' ? '#0066CC' : '#666666'}
                    />
                    <Text
                      style={[
                        styles.paymentOptionTitle,
                        paymentMethod === 'cash' && styles.paymentOptionTitleActive,
                      ]}
                    >
                      Cash
                    </Text>
                  </View>
                  {paymentMethod === 'cash' && (
                    <Ionicons name="checkmark-circle" size={24} color="#0066CC" />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.paymentOption,
                    paymentMethod === 'airtel' && styles.paymentOptionActive,
                  ]}
                  onPress={() => setPaymentMethod('airtel')}
                >
                  <View style={styles.paymentOptionContent}>
                    <Ionicons
                      name="phone-portrait"
                      size={24}
                      color={paymentMethod === 'airtel' ? '#0066CC' : '#666666'}
                    />
                    <Text
                      style={[
                        styles.paymentOptionTitle,
                        paymentMethod === 'airtel' && styles.paymentOptionTitleActive,
                      ]}
                    >
                      Airtel Money
                    </Text>
                  </View>
                  {paymentMethod === 'airtel' && (
                    <Ionicons name="checkmark-circle" size={24} color="#0066CC" />
                  )}
                </TouchableOpacity>
              </View>

              {/* Amount Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.sectionLabel}>Amount</Text>
                <TextInput
                  style={styles.amountInput}
                  value={paymentAmount}
                  onChangeText={setPaymentAmount}
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>

              {paymentMethod === 'mpesa' && (
                <View style={styles.infoCard}>
                  <Ionicons name="information-circle" size={20} color="#0066CC" />
                  <Text style={styles.infoText}>
                    An STK push will be sent to the shop's phone number. Wait for them to
                    confirm the payment.
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
                onPress={handleSubmitPayment}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                    <Text style={styles.primaryButtonText}>
                      {paymentMethod === 'mpesa' ? 'Send STK Push' : 'Payment Received'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Waiting for M-Pesa Confirmation */}
          {waitingForPayment && (
            <View style={styles.stepContent}>
              <View style={styles.iconContainer}>
                <ActivityIndicator size="large" color="#0066CC" />
              </View>
              <Text style={styles.stepTitle}>Waiting for Payment</Text>
              <Text style={styles.stepDescription}>
                Please wait for the shop to confirm the M-Pesa payment on their phone.
              </Text>

              <View style={styles.infoCard}>
                <Ionicons name="phone-portrait" size={40} color="#0066CC" />
                <Text style={styles.infoText}>
                  Check the shop's phone ({delivery.shopId.phoneNumber}) for the M-Pesa
                  prompt.
                </Text>
              </View>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => {
                  setWaitingForPayment(false);
                  Alert.alert(
                    'Change Payment Method',
                    'Would you like to try a different payment method?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Yes',
                        onPress: () => setPaymentMethod('cash'),
                      },
                    ]
                  );
                }}
              >
                <Text style={styles.secondaryButtonText}>Cancel / Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Step 3: Completion */}
          {step === 'completion' && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Complete Delivery</Text>
              <Text style={styles.stepDescription}>
                Capture signature and photo to finalize the delivery.
              </Text>

              {/* Signature Capture */}
              <View style={styles.captureSection}>
                <Text style={styles.sectionLabel}>Shop Owner Signature</Text>
                <SignatureCapture onSignature={setSignature} />
              </View>

              {/* Photo Capture */}
              <View style={styles.captureSection}>
                <Text style={styles.sectionLabel}>Photo of Delivered Goods</Text>
                <PhotoCapture onPhoto={setPhoto} />
              </View>

              {/* Notes */}
              <View style={styles.inputContainer}>
                <Text style={styles.sectionLabel}>Delivery Notes (Optional)</Text>
                <TextInput
                  style={styles.notesInput}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Any issues or special notes?"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
                onPress={handleCompleteDelivery}
                disabled={isLoading || !signature || !photo}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="checkmark-done" size={20} color="#FFFFFF" />
                    <Text style={styles.primaryButtonText}>Complete Delivery</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Success */}
          {step === 'success' && (
            <View style={styles.stepContent}>
              <View style={styles.iconContainer}>
                <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
              </View>
              <Text style={styles.successTitle}>Delivery Complete!</Text>
              <Text style={styles.stepDescription}>
                Great job! The delivery has been completed successfully.
              </Text>

              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>Amount Collected</Text>
                <Text style={styles.successAmount}>
                  {formatCurrency(delivery.totalAmount)}
                </Text>
                <Text style={[styles.infoLabel, { marginTop: 12 }]}>
                  Payment Method
                </Text>
                <Text style={styles.infoValue}>
                  {paymentMethod === 'mpesa'
                    ? 'M-Pesa'
                    : paymentMethod === 'cash'
                    ? 'Cash'
                    : 'Airtel Money'}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotActive: {
    backgroundColor: '#0066CC',
  },
  stepNumber: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: '#E0E0E0',
  },
  stepLineActive: {
    backgroundColor: '#0066CC',
  },
  content: {
    flex: 1,
  },
  stepContent: {
    padding: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  infoCard: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  infoText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginLeft: 12,
    flex: 1,
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: '#0066CC',
    paddingVertical: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0066CC',
  },
  secondaryButtonText: {
    color: '#0066CC',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    backgroundColor: '#B0B0B0',
  },
  paymentMethods: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  paymentOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 12,
  },
  paymentOptionActive: {
    borderColor: '#0066CC',
    backgroundColor: '#F0F7FF',
  },
  paymentOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paymentOptionText: {
    gap: 2,
  },
  paymentOptionTitle: {
    fontSize: 16,
    color: '#666666',
  },
  paymentOptionTitleActive: {
    color: '#0066CC',
    fontWeight: '600',
  },
  paymentOptionSubtitle: {
    fontSize: 12,
    color: '#4CAF50',
  },
  inputContainer: {
    marginBottom: 20,
  },
  amountInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 16,
    textAlign: 'center',
  },
  notesInput: {
    fontSize: 16,
    color: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
  },
  captureSection: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 8,
  },
  successAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0066CC',
  },
});
