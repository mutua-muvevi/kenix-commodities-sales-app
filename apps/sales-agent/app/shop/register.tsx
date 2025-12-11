import React, { useState } from 'react';
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
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import LocationPicker from '../../components/LocationPicker';
import ShopPhotoCapture from '../../components/ShopPhotoCapture';
import CredentialsModal from '../../components/shop/CredentialsModal';
import { useAuthStore } from '../../store/authStore';
import { useShopStore } from '../../store/shopStore';
import shopAccountService from '../../services/shop-account';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function RegisterShopScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { registerShop, isLoading } = useShopStore();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    shopName: '',
    ownerName: '',
    phoneNumber: '',
    email: '',
    businessRegNumber: '',

    // Step 2: Location
    location: { latitude: -1.286389, longitude: 36.817223 },
    address: {
      street: '',
      area: '',
      city: 'Nairobi',
      county: '',
    },

    // Step 3: Photo
    shopPhoto: '',

    // Step 4: Operating Hours
    operatingHours: {
      open: '08:00',
      close: '20:00',
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    },
    specialNotes: '',
  });

  // Step 5: Account Creation
  const [createAccount, setCreateAccount] = useState(false);
  const [accountEmail, setAccountEmail] = useState('');
  const [accountPassword, setAccountPassword] = useState('');
  const [sendViaSMS, setSendViaSMS] = useState(true);
  const [showCredentials, setShowCredentials] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{
    email: string;
    password: string;
    shopName: string;
    phoneNumber: string;
  } | null>(null);

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

  const generatePassword = () => {
    const password = shopAccountService.generateTempPassword();
    setAccountPassword(password);
  };

  const validateStep = () => {
    switch (step) {
      case 1:
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
        return true;

      case 2:
        if (!formData.address.area.trim()) {
          Alert.alert('Required', 'Please enter area/neighborhood');
          return false;
        }
        return true;

      case 3:
        if (!formData.shopPhoto) {
          Alert.alert('Required', 'Please take a photo of the shop');
          return false;
        }
        return true;

      case 4:
        if (formData.operatingHours.days.length === 0) {
          Alert.alert('Required', 'Please select at least one operating day');
          return false;
        }
        return true;

      case 5:
        if (createAccount) {
          if (!accountEmail.trim()) {
            Alert.alert('Required', 'Please enter email for shop owner account');
            return false;
          }
          if (!shopAccountService.validateEmail(accountEmail)) {
            Alert.alert('Invalid Email', 'Please enter a valid email address');
            return false;
          }
          if (!accountPassword.trim()) {
            Alert.alert('Required', 'Please generate or enter a password');
            return false;
          }
          const passwordValidation = shopAccountService.validatePassword(accountPassword);
          if (!passwordValidation.valid) {
            Alert.alert('Invalid Password', passwordValidation.message || 'Password is too weak');
            return false;
          }
        }
        return true;

      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    try {
      const shopData = {
        name: formData.ownerName.trim(),
        email: createAccount ? accountEmail.trim() : (formData.email.trim() || undefined),
        phoneNumber: formData.phoneNumber.trim(),
        role: 'shop',
        shopName: formData.shopName.trim(),
        location: {
          type: 'Point',
          coordinates: [formData.location.longitude, formData.location.latitude],
        },
        address: {
          street: formData.address.street.trim(),
          area: formData.address.area.trim(),
          city: formData.address.city.trim(),
          county: formData.address.county.trim(),
        },
        operatingHours: formData.operatingHours,
        shopPhoto: formData.shopPhoto,
        businessRegNumber: formData.businessRegNumber.trim() || undefined,
        specialNotes: formData.specialNotes.trim() || undefined,
        createdBy: user?._id,
      };

      const newShop = await registerShop(shopData);

      // Create account if requested
      if (createAccount && accountEmail && accountPassword) {
        try {
          const accountResult = await shopAccountService.createShopAccount({
            shopId: newShop._id,
            email: accountEmail.trim(),
            password: accountPassword,
            phoneNumber: formData.phoneNumber.trim(),
            sendCredentialsBySMS: sendViaSMS,
          });

          // Show credentials modal
          setCreatedCredentials({
            email: accountResult.credentials.email,
            password: accountResult.credentials.password,
            shopName: formData.shopName,
            phoneNumber: formData.phoneNumber,
          });
          setShowCredentials(true);
        } catch (accountError: any) {
          // Shop was created but account creation failed
          Alert.alert(
            'Account Creation Failed',
            `Shop registered successfully, but account creation failed: ${accountError.message}\n\nYou can create the account later from the shop details screen.`,
            [
              {
                text: 'OK',
                onPress: () => router.replace('/(tabs)/shops'),
              },
            ]
          );
          return;
        }
      } else {
        // No account creation, just show success
        Alert.alert(
          'Success!',
          'Shop registered successfully and is pending admin approval.',
          [
            {
              text: 'View My Shops',
              onPress: () => router.replace('/(tabs)/shops'),
            },
          ]
        );
      }
    } catch (error: any) {
      Alert.alert(
        'Registration Failed',
        error.response?.data?.message || error.message || 'Could not register shop'
      );
    }
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      {[1, 2, 3, 4, 5].map((s) => (
        <View key={s} style={styles.progressStepContainer}>
          <View style={[styles.progressStep, s <= step && styles.progressStepActive]}>
            {s < step ? (
              <Ionicons name="checkmark" size={16} color="#fff" />
            ) : (
              <Text style={[styles.progressStepText, s <= step && styles.progressStepTextActive]}>
                {s}
              </Text>
            )}
          </View>
          {s < 5 && <View style={[styles.progressLine, s < step && styles.progressLineActive]} />}
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Basic Information</Text>
      <Text style={styles.stepSubtitle}>Enter the shop and owner details</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>
          Shop Name <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
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
          style={styles.input}
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
          style={styles.input}
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
          style={styles.input}
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
          style={styles.input}
          placeholder="Enter registration number if available"
          value={formData.businessRegNumber}
          onChangeText={(value) => updateFormData('businessRegNumber', value)}
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Location</Text>
      <Text style={styles.stepSubtitle}>Pin the exact shop location on the map</Text>

      <View style={styles.inputContainer}>
        <LocationPicker
          onLocationChange={(loc) => updateFormData('location', loc)}
          initialLocation={formData.location}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Street / Building</Text>
        <TextInput
          style={styles.input}
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
          style={styles.input}
          placeholder="e.g., Westlands, Kilimani"
          value={formData.address.area}
          onChangeText={(value) => updateNestedData('address', 'area', value)}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.inputContainer, styles.flex1]}>
          <Text style={styles.label}>City</Text>
          <TextInput
            style={styles.input}
            placeholder="Nairobi"
            value={formData.address.city}
            onChangeText={(value) => updateNestedData('address', 'city', value)}
          />
        </View>

        <View style={[styles.inputContainer, styles.flex1]}>
          <Text style={styles.label}>County</Text>
          <TextInput
            style={styles.input}
            placeholder="Nairobi"
            value={formData.address.county}
            onChangeText={(value) => updateNestedData('address', 'county', value)}
          />
        </View>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Shop Photo</Text>
      <Text style={styles.stepSubtitle}>Take a clear photo of the shop front</Text>

      <View style={styles.inputContainer}>
        <ShopPhotoCapture
          onPhotoTaken={(uri) => updateFormData('shopPhoto', uri)}
          initialPhoto={formData.shopPhoto}
        />
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Operating Hours</Text>
      <Text style={styles.stepSubtitle}>When is the shop open for business?</Text>

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
            style={styles.input}
            placeholder="08:00"
            value={formData.operatingHours.open}
            onChangeText={(value) => updateNestedData('operatingHours', 'open', value)}
          />
          <Text style={styles.hint}>24-hour format (e.g., 08:00)</Text>
        </View>

        <View style={[styles.inputContainer, styles.flex1]}>
          <Text style={styles.label}>Closing Time</Text>
          <TextInput
            style={styles.input}
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
          style={[styles.input, styles.textArea]}
          placeholder="Any special information about the shop..."
          value={formData.specialNotes}
          onChangeText={(value) => updateFormData('specialNotes', value)}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>
    </View>
  );

  const renderStep5 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Shop Owner Account</Text>
      <Text style={styles.stepSubtitle}>Create login credentials for the shop owner</Text>

      <View style={styles.accountToggleCard}>
        <View style={styles.accountToggleHeader}>
          <Ionicons name="person-circle-outline" size={32} color="#22c55e" />
          <View style={styles.accountToggleContent}>
            <Text style={styles.accountToggleTitle}>Create Login Account</Text>
            <Text style={styles.accountToggleSubtitle}>
              Allow shop owner to access the Kenix Shop app
            </Text>
          </View>
          <Switch
            value={createAccount}
            onValueChange={setCreateAccount}
            trackColor={{ false: '#d1d5db', true: '#86efac' }}
            thumbColor={createAccount ? '#22c55e' : '#f3f4f6'}
          />
        </View>
      </View>

      {createAccount && (
        <>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Email <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="shopowner@example.com"
              value={accountEmail}
              onChangeText={setAccountEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
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
                value={accountPassword}
                onChangeText={setAccountPassword}
                secureTextEntry={false}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity style={styles.generateButton} onPress={generatePassword}>
                <Ionicons name="refresh" size={20} color="#fff" />
                <Text style={styles.generateButtonText}>Generate</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.hint}>
              Minimum 8 characters. Shop owner can change this after first login.
            </Text>
          </View>

          <View style={styles.smsToggleCard}>
            <Ionicons name="chatbubble-ellipses-outline" size={24} color="#3b82f6" />
            <View style={styles.smsToggleContent}>
              <Text style={styles.smsToggleTitle}>Send credentials via SMS</Text>
              <Text style={styles.smsToggleSubtitle}>
                Open SMS app with pre-filled credentials
              </Text>
            </View>
            <Switch
              value={sendViaSMS}
              onValueChange={setSendViaSMS}
              trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
              thumbColor={sendViaSMS ? '#3b82f6' : '#f3f4f6'}
            />
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={20} color="#3b82f6" />
            <Text style={styles.infoText}>
              After registration, you'll be able to share the credentials via WhatsApp, SMS, or
              copy them to clipboard.
            </Text>
          </View>
        </>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Register New Shop</Text>
        <View style={{ width: 40 }} />
      </View>

      {renderProgressBar()}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
        {step === 5 && renderStep5()}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Credentials Modal */}
      {createdCredentials && (
        <CredentialsModal
          visible={showCredentials}
          onClose={() => {
            setShowCredentials(false);
            router.replace('/(tabs)/shops');
          }}
          credentials={createdCredentials}
        />
      )}

      <View style={styles.footer}>
        {step > 1 && (
          <TouchableOpacity style={styles.backButtonFooter} onPress={handleBack}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}

        {step < 5 ? (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Next</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.submitButtonText}>Register Shop</Text>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#f9fafb',
  },
  progressStepContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressStep: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressStepActive: {
    backgroundColor: '#22c55e',
  },
  progressStepText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  progressStepTextActive: {
    color: '#fff',
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 4,
  },
  progressLineActive: {
    backgroundColor: '#22c55e',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepContainer: {
    paddingTop: 24,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  stepSubtitle: {
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
  backButtonFooter: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  nextButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22c55e',
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  submitButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22c55e',
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  accountToggleCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  accountToggleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  accountToggleContent: {
    flex: 1,
  },
  accountToggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  accountToggleSubtitle: {
    fontSize: 13,
    color: '#6b7280',
  },
  passwordContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  passwordInput: {
    flex: 1,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  generateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  smsToggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
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
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#dbeafe',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1e3a8a',
    lineHeight: 18,
  },
});
