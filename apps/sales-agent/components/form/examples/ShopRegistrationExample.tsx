/**
 * Shop Registration Form Example
 * Complete example demonstrating all form components
 *
 * This example shows:
 * - Form setup with react-hook-form
 * - Yup validation schema
 * - All form components (TextField, Select, Checkbox)
 * - Error handling and display
 * - Form submission
 * - Loading states
 * - Success/error feedback
 */

import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  FormProvider,
  RHFTextField,
  RHFSelect,
  RHFCheckbox,
} from '../index';
import { theme } from '../../../theme';

/**
 * Validation Schema
 */
const shopRegistrationSchema = yup.object({
  // Basic Information
  shopName: yup
    .string()
    .required('Shop name is required')
    .min(3, 'Shop name must be at least 3 characters')
    .max(50, 'Shop name must be less than 50 characters'),

  ownerName: yup
    .string()
    .required('Owner name is required')
    .min(3, 'Owner name must be at least 3 characters'),

  // Contact Information
  email: yup
    .string()
    .email('Invalid email address')
    .required('Email is required'),

  phone: yup
    .string()
    .matches(/^[0-9]{10}$/, 'Phone must be exactly 10 digits')
    .required('Phone number is required'),

  // Location
  address: yup
    .string()
    .required('Address is required')
    .min(10, 'Please provide complete address'),

  city: yup.string().required('City is required'),

  state: yup.string().required('State is required'),

  pincode: yup
    .string()
    .matches(/^[0-9]{6}$/, 'Pincode must be 6 digits')
    .required('Pincode is required'),

  // Business Details
  category: yup
    .string()
    .required('Shop category is required'),

  businessType: yup
    .string()
    .required('Business type is required'),

  gstNumber: yup
    .string()
    .matches(
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
      'Invalid GST number format'
    )
    .notRequired(),

  // Terms and Conditions
  termsAccepted: yup
    .boolean()
    .oneOf([true], 'You must accept the terms and conditions'),

  marketingConsent: yup.boolean(),
});

/**
 * Form Data Type
 */
type ShopRegistrationFormData = yup.InferType<typeof shopRegistrationSchema>;

/**
 * Shop Categories
 */
const SHOP_CATEGORIES = [
  { label: 'Retail Store', value: 'retail' },
  { label: 'Wholesale', value: 'wholesale' },
  { label: 'Supermarket', value: 'supermarket' },
  { label: 'Kiosk', value: 'kiosk' },
  { label: 'Pharmacy', value: 'pharmacy' },
  { label: 'General Store', value: 'general' },
];

/**
 * Business Types
 */
const BUSINESS_TYPES = [
  { label: 'Sole Proprietorship', value: 'sole' },
  { label: 'Partnership', value: 'partnership' },
  { label: 'Private Limited', value: 'pvt_ltd' },
  { label: 'Limited Liability Partnership', value: 'llp' },
];

/**
 * Indian States
 */
const STATES = [
  { label: 'Maharashtra', value: 'MH' },
  { label: 'Karnataka', value: 'KA' },
  { label: 'Tamil Nadu', value: 'TN' },
  { label: 'Gujarat', value: 'GJ' },
  { label: 'Delhi', value: 'DL' },
  { label: 'West Bengal', value: 'WB' },
  { label: 'Uttar Pradesh', value: 'UP' },
  { label: 'Rajasthan', value: 'RJ' },
  // Add more states as needed
];

/**
 * Shop Registration Form Component
 */
export function ShopRegistrationExample() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  /**
   * Initialize form with default values
   */
  const methods = useForm<ShopRegistrationFormData>({
    resolver: yupResolver(shopRegistrationSchema),
    mode: 'onBlur', // Validate on blur
    defaultValues: {
      shopName: '',
      ownerName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      category: '',
      businessType: '',
      gstNumber: '',
      termsAccepted: false,
      marketingConsent: false,
    },
  });

  /**
   * Handle form submission
   */
  const onSubmit = async (data: ShopRegistrationFormData) => {
    try {
      setIsSubmitting(true);

      // Simulate API call
      console.log('Submitting shop registration:', data);

      // Mock API delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Success
      Alert.alert(
        'Success',
        `Shop "${data.shopName}" registered successfully!`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              methods.reset();
            },
          },
        ]
      );
    } catch (error) {
      // Error handling
      Alert.alert(
        'Error',
        'Failed to register shop. Please try again.',
        [{ text: 'OK' }]
      );
      console.error('Registration error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Get form state
   */
  const { isDirty, isValid } = methods.formState;

  /**
   * Watch category to show conditional fields
   */
  const selectedCategory = methods.watch('category');

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <FormProvider methods={methods} onSubmit={onSubmit}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Register New Shop</Text>
          <Text style={styles.subtitle}>
            Complete all required fields to register a new shop
          </Text>
        </View>

        {/* Basic Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <RHFTextField
            name="shopName"
            label="Shop Name *"
            placeholder="e.g., ABC General Store"
            autoCapitalize="words"
            testID="shop-name-field"
          />

          <RHFTextField
            name="ownerName"
            label="Owner Name *"
            placeholder="e.g., John Doe"
            autoCapitalize="words"
            testID="owner-name-field"
          />
        </View>

        {/* Contact Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>

          <RHFTextField
            name="email"
            label="Email Address *"
            placeholder="shop@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            testID="email-field"
          />

          <RHFTextField
            name="phone"
            label="Phone Number *"
            placeholder="9876543210"
            keyboardType="phone-pad"
            maxLength={10}
            testID="phone-field"
          />
        </View>

        {/* Location Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location Details</Text>

          <RHFTextField
            name="address"
            label="Complete Address *"
            placeholder="Street, Area, Landmark"
            multiline
            numberOfLines={3}
            testID="address-field"
          />

          <RHFTextField
            name="city"
            label="City *"
            placeholder="e.g., Mumbai"
            autoCapitalize="words"
            testID="city-field"
          />

          <RHFSelect
            name="state"
            label="State *"
            placeholder="Select state"
            options={STATES}
            searchable
            searchPlaceholder="Search state..."
            testID="state-field"
          />

          <RHFTextField
            name="pincode"
            label="Pincode *"
            placeholder="400001"
            keyboardType="numeric"
            maxLength={6}
            testID="pincode-field"
          />
        </View>

        {/* Business Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Details</Text>

          <RHFSelect
            name="category"
            label="Shop Category *"
            placeholder="Select category"
            options={SHOP_CATEGORIES}
            testID="category-field"
          />

          <RHFSelect
            name="businessType"
            label="Business Type *"
            placeholder="Select business type"
            options={BUSINESS_TYPES}
            testID="business-type-field"
          />

          {/* Conditional GST field for wholesale */}
          {selectedCategory === 'wholesale' && (
            <RHFTextField
              name="gstNumber"
              label="GST Number"
              placeholder="22AAAAA0000A1Z5"
              autoCapitalize="characters"
              helperText="Optional for wholesale shops"
              testID="gst-field"
            />
          )}
        </View>

        {/* Terms and Conditions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Agreement</Text>

          <RHFCheckbox
            name="termsAccepted"
            label="I accept the terms and conditions *"
            description="You must agree to the terms to register your shop"
            testID="terms-checkbox"
          />

          <RHFCheckbox
            name="marketingConsent"
            label="I agree to receive marketing communications"
            description="Optional: Get updates about offers and new products"
            testID="marketing-checkbox"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!isDirty || !isValid || isSubmitting) && styles.submitButtonDisabled,
          ]}
          onPress={methods.handleSubmit(onSubmit)}
          disabled={!isDirty || !isValid || isSubmitting}
          testID="submit-button"
        >
          {isSubmitting ? (
            <ActivityIndicator color={theme.palette.common.white} />
          ) : (
            <Text style={styles.submitButtonText}>Register Shop</Text>
          )}
        </TouchableOpacity>

        {/* Debug Info (Remove in production) */}
        {__DEV__ && (
          <View style={styles.debugSection}>
            <Text style={styles.debugTitle}>Form State (Dev Only)</Text>
            <Text style={styles.debugText}>
              Is Dirty: {isDirty ? 'Yes' : 'No'}
            </Text>
            <Text style={styles.debugText}>
              Is Valid: {isValid ? 'Yes' : 'No'}
            </Text>
            <Text style={styles.debugText}>
              Errors: {Object.keys(methods.formState.errors).length}
            </Text>
          </View>
        )}
      </FormProvider>
    </ScrollView>
  );
}

/**
 * Styles
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.palette.background.default,
  },
  contentContainer: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    ...theme.typography.h4,
    color: theme.palette.text.primary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.body2,
    color: theme.palette.text.secondary,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.h6,
    color: theme.palette.text.primary,
    marginBottom: theme.spacing.md,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: theme.palette.primary.main,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    marginTop: theme.spacing.lg,
    ...theme.shadows.z4,
  },
  submitButtonDisabled: {
    backgroundColor: theme.palette.action.disabled,
    ...theme.shadows.z1,
  },
  submitButtonText: {
    ...theme.typography.button,
    color: theme.palette.common.white,
    fontWeight: '600',
  },
  debugSection: {
    marginTop: theme.spacing.xl,
    padding: theme.spacing.md,
    backgroundColor: theme.palette.grey[100],
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.palette.grey[300],
  },
  debugTitle: {
    ...theme.typography.subtitle2,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
  },
  debugText: {
    ...theme.typography.caption,
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing.xs,
  },
});

/**
 * Default export
 */
export default ShopRegistrationExample;
