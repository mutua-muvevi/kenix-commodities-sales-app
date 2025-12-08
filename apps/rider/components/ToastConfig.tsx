import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BaseToastProps } from 'react-native-toast-message';

interface ToastProps extends BaseToastProps {
  text1?: string;
  text2?: string;
}

const SuccessToast = ({ text1, text2 }: ToastProps) => (
  <View style={[styles.container, styles.successContainer]}>
    <View style={[styles.iconContainer, styles.successIcon]}>
      <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
    </View>
    <View style={styles.textContainer}>
      {text1 && <Text style={styles.title}>{text1}</Text>}
      {text2 && <Text style={styles.message}>{text2}</Text>}
    </View>
  </View>
);

const ErrorToast = ({ text1, text2 }: ToastProps) => (
  <View style={[styles.container, styles.errorContainer]}>
    <View style={[styles.iconContainer, styles.errorIcon]}>
      <Ionicons name="alert-circle" size={24} color="#F44336" />
    </View>
    <View style={styles.textContainer}>
      {text1 && <Text style={styles.title}>{text1}</Text>}
      {text2 && <Text style={styles.message}>{text2}</Text>}
    </View>
  </View>
);

const InfoToast = ({ text1, text2 }: ToastProps) => (
  <View style={[styles.container, styles.infoContainer]}>
    <View style={[styles.iconContainer, styles.infoIcon]}>
      <Ionicons name="information-circle" size={24} color="#0066CC" />
    </View>
    <View style={styles.textContainer}>
      {text1 && <Text style={styles.title}>{text1}</Text>}
      {text2 && <Text style={styles.message}>{text2}</Text>}
    </View>
  </View>
);

const WarningToast = ({ text1, text2 }: ToastProps) => (
  <View style={[styles.container, styles.warningContainer]}>
    <View style={[styles.iconContainer, styles.warningIcon]}>
      <Ionicons name="warning" size={24} color="#FF9800" />
    </View>
    <View style={styles.textContainer}>
      {text1 && <Text style={styles.title}>{text1}</Text>}
      {text2 && <Text style={styles.message}>{text2}</Text>}
    </View>
  </View>
);

export const toastConfig = {
  success: (props: ToastProps) => <SuccessToast {...props} />,
  error: (props: ToastProps) => <ErrorToast {...props} />,
  info: (props: ToastProps) => <InfoToast {...props} />,
  warning: (props: ToastProps) => <WarningToast {...props} />,
};

const styles = StyleSheet.create({
  container: {
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  successContainer: {
    backgroundColor: '#E8F5E9',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  infoContainer: {
    backgroundColor: '#E3F2FD',
    borderLeftWidth: 4,
    borderLeftColor: '#0066CC',
  },
  warningContainer: {
    backgroundColor: '#FFF3E0',
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIcon: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  errorIcon: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  infoIcon: {
    backgroundColor: 'rgba(0, 102, 204, 0.1)',
  },
  warningIcon: {
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  message: {
    fontSize: 13,
    color: '#666666',
    marginTop: 4,
    lineHeight: 18,
  },
});
