/**
 * Validation Utility
 * Input validation functions and form validators
 */

import { CONFIG } from '../constants/config';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface FieldValidationResult {
  isValid: boolean;
  error: string | null;
}

/**
 * Validate email format
 * @param email - Email address to validate
 * @returns true if valid email format
 */
export const validateEmail = (email: string | null | undefined): boolean => {
  if (!email) return false;
  return CONFIG.EMAIL_REGEX.test(email.trim());
};

/**
 * Validate phone number (Kenyan format: +254XXXXXXXXX)
 * @param phone - Phone number to validate
 * @returns true if valid phone format
 */
export const validatePhone = (phone: string | null | undefined): boolean => {
  if (!phone) return false;
  return CONFIG.PHONE_REGEX.test(phone.trim());
};

/**
 * Validate name (letters, spaces, hyphens, apostrophes only)
 * @param name - Name to validate
 * @returns true if valid name format
 */
export const validateName = (name: string | null | undefined): boolean => {
  if (!name) return false;
  return CONFIG.NAME_REGEX.test(name.trim());
};

/**
 * Validate required field
 * @param value - Value to validate
 * @param fieldName - Name of the field for error message
 * @returns Error message or null if valid
 */
export const validateRequired = (value: any, fieldName: string): string | null => {
  if (value === null || value === undefined) {
    return `${fieldName} is required`;
  }

  if (typeof value === 'string' && !value.trim()) {
    return `${fieldName} is required`;
  }

  if (Array.isArray(value) && value.length === 0) {
    return `${fieldName} must have at least one item`;
  }

  return null;
};

/**
 * Validate minimum length
 * @param value - String to validate
 * @param minLength - Minimum length required
 * @param fieldName - Name of the field for error message
 * @returns Error message or null if valid
 */
export const validateMinLength = (
  value: string | null | undefined,
  minLength: number,
  fieldName: string
): string | null => {
  if (!value) return `${fieldName} is required`;
  if (value.trim().length < minLength) {
    return `${fieldName} must be at least ${minLength} characters`;
  }
  return null;
};

/**
 * Validate maximum length
 * @param value - String to validate
 * @param maxLength - Maximum length allowed
 * @param fieldName - Name of the field for error message
 * @returns Error message or null if valid
 */
export const validateMaxLength = (
  value: string | null | undefined,
  maxLength: number,
  fieldName: string
): string | null => {
  if (!value) return null; // Only validate if value exists
  if (value.trim().length > maxLength) {
    return `${fieldName} must not exceed ${maxLength} characters`;
  }
  return null;
};

/**
 * Validate minimum value
 * @param value - Number to validate
 * @param min - Minimum value allowed
 * @param fieldName - Name of the field for error message
 * @returns Error message or null if valid
 */
export const validateMin = (
  value: number | null | undefined,
  min: number,
  fieldName: string
): string | null => {
  if (value === null || value === undefined) return `${fieldName} is required`;
  if (value < min) {
    return `${fieldName} must be at least ${min}`;
  }
  return null;
};

/**
 * Validate maximum value
 * @param value - Number to validate
 * @param max - Maximum value allowed
 * @param fieldName - Name of the field for error message
 * @returns Error message or null if valid
 */
export const validateMax = (
  value: number | null | undefined,
  max: number,
  fieldName: string
): string | null => {
  if (value === null || value === undefined) return null;
  if (value > max) {
    return `${fieldName} must not exceed ${max}`;
  }
  return null;
};

/**
 * Validate file size
 * @param fileSize - File size in bytes
 * @param maxSize - Maximum size allowed in bytes (default: from CONFIG)
 * @returns Error message or null if valid
 */
export const validateFileSize = (
  fileSize: number,
  maxSize: number = CONFIG.MAX_FILE_SIZE
): string | null => {
  if (fileSize > maxSize) {
    const maxSizeMB = maxSize / (1024 * 1024);
    return `File size must not exceed ${maxSizeMB}MB`;
  }
  return null;
};

/**
 * Validate file type
 * @param fileType - MIME type of the file
 * @param allowedTypes - Array of allowed MIME types
 * @returns Error message or null if valid
 */
export const validateFileType = (
  fileType: string,
  allowedTypes: string[] = CONFIG.ALLOWED_IMAGE_TYPES
): string | null => {
  if (!allowedTypes.includes(fileType)) {
    return `File type ${fileType} is not allowed`;
  }
  return null;
};

/**
 * Validate shop registration form
 * @param data - Shop form data
 * @returns Validation result with errors
 */
export const validateShopForm = (data: any): ValidationResult => {
  const errors: Record<string, string> = {};

  // Required fields
  const shopNameError = validateRequired(data.shopName, 'Shop name');
  if (shopNameError) errors.shopName = shopNameError;

  const ownerNameError = validateRequired(data.ownerName, 'Owner name');
  if (ownerNameError) errors.ownerName = ownerNameError;
  else if (!validateName(data.ownerName)) {
    errors.ownerName = 'Owner name contains invalid characters';
  }

  const phoneError = validateRequired(data.phoneNumber, 'Phone number');
  if (phoneError) errors.phoneNumber = phoneError;
  else if (!validatePhone(data.phoneNumber)) {
    errors.phoneNumber = 'Invalid phone format. Use +254XXXXXXXXX';
  }

  // Optional email validation
  if (data.email && !validateEmail(data.email)) {
    errors.email = 'Invalid email format';
  }

  // Location validation
  if (data.location) {
    if (!data.location.latitude || !data.location.longitude) {
      errors.location = 'Location coordinates are required';
    }
  } else {
    errors.location = 'Location is required';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
};

/**
 * Validate login form
 * @param data - Login form data
 * @returns Validation result with errors
 */
export const validateLoginForm = (data: any): ValidationResult => {
  const errors: Record<string, string> = {};

  const emailError = validateRequired(data.email, 'Email');
  if (emailError) errors.email = emailError;
  else if (!validateEmail(data.email)) {
    errors.email = 'Invalid email format';
  }

  const passwordError = validateRequired(data.password, 'Password');
  if (passwordError) errors.password = passwordError;

  return { isValid: Object.keys(errors).length === 0, errors };
};

/**
 * Validate order form
 * @param data - Order form data
 * @returns Validation result with errors
 */
export const validateOrderForm = (data: any): ValidationResult => {
  const errors: Record<string, string> = {};

  const shopIdError = validateRequired(data.shopId, 'Shop');
  if (shopIdError) errors.shopId = shopIdError;

  const itemsError = validateRequired(data.items, 'Order items');
  if (itemsError) {
    errors.items = itemsError;
  } else if (Array.isArray(data.items)) {
    if (data.items.length === 0) {
      errors.items = 'Add at least one item to the order';
    }

    if (data.items.length > CONFIG.MAX_ORDER_ITEMS) {
      errors.items = `Maximum ${CONFIG.MAX_ORDER_ITEMS} items allowed per order`;
    }

    // Validate each item
    data.items.forEach((item: any, index: number) => {
      if (!item.productId) {
        errors[`items.${index}.productId`] = 'Product is required';
      }
      if (!item.quantity || item.quantity <= 0) {
        errors[`items.${index}.quantity`] = 'Quantity must be greater than 0';
      }
    });
  }

  // Validate total amount
  if (data.totalAmount !== undefined) {
    const minAmountError = validateMin(
      data.totalAmount,
      CONFIG.MIN_ORDER_AMOUNT,
      'Order amount'
    );
    if (minAmountError) errors.totalAmount = minAmountError;
  }

  return { isValid: Object.keys(errors).length === 0, errors };
};

/**
 * Validate change password form
 * @param data - Change password form data
 * @returns Validation result with errors
 */
export const validateChangePasswordForm = (data: any): ValidationResult => {
  const errors: Record<string, string> = {};

  const currentPasswordError = validateRequired(data.currentPassword, 'Current password');
  if (currentPasswordError) errors.currentPassword = currentPasswordError;

  const newPasswordError = validateRequired(data.newPassword, 'New password');
  if (newPasswordError) {
    errors.newPassword = newPasswordError;
  } else {
    const lengthError = validateMinLength(data.newPassword, 8, 'New password');
    if (lengthError) errors.newPassword = lengthError;
  }

  const confirmPasswordError = validateRequired(data.confirmPassword, 'Confirm password');
  if (confirmPasswordError) {
    errors.confirmPassword = confirmPasswordError;
  } else if (data.newPassword !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
};

/**
 * Validate profile update form
 * @param data - Profile form data
 * @returns Validation result with errors
 */
export const validateProfileForm = (data: any): ValidationResult => {
  const errors: Record<string, string> = {};

  const nameError = validateRequired(data.name, 'Name');
  if (nameError) {
    errors.name = nameError;
  } else if (!validateName(data.name)) {
    errors.name = 'Name contains invalid characters';
  }

  const phoneError = validateRequired(data.phone, 'Phone number');
  if (phoneError) {
    errors.phone = phoneError;
  } else if (!validatePhone(data.phone)) {
    errors.phone = 'Invalid phone format. Use +254XXXXXXXXX';
  }

  if (data.email && !validateEmail(data.email)) {
    errors.email = 'Invalid email format';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
};

/**
 * Validate KYC document upload
 * @param file - File object
 * @returns Validation result
 */
export const validateKYCDocument = (file: any): FieldValidationResult => {
  if (!file) {
    return { isValid: false, error: 'Please select a file' };
  }

  const sizeError = validateFileSize(file.size);
  if (sizeError) {
    return { isValid: false, error: sizeError };
  }

  const typeError = validateFileType(file.type, CONFIG.ALLOWED_DOCUMENT_TYPES);
  if (typeError) {
    return { isValid: false, error: 'Only PDF and image files are allowed' };
  }

  return { isValid: true, error: null };
};

/**
 * Validate coordinates
 * @param latitude - Latitude value
 * @param longitude - Longitude value
 * @returns true if valid coordinates
 */
export const validateCoordinates = (
  latitude: number | null | undefined,
  longitude: number | null | undefined
): boolean => {
  if (latitude === null || latitude === undefined || longitude === null || longitude === undefined) {
    return false;
  }

  return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
};

/**
 * Sanitize input string (remove potentially harmful characters)
 * @param input - String to sanitize
 * @returns Sanitized string
 */
export const sanitizeInput = (input: string | null | undefined): string => {
  if (!input) return '';

  // Remove HTML tags and potentially harmful characters
  return input
    .trim()
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers like onclick=
};

export default {
  validateEmail,
  validatePhone,
  validateName,
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validateMin,
  validateMax,
  validateFileSize,
  validateFileType,
  validateShopForm,
  validateLoginForm,
  validateOrderForm,
  validateChangePasswordForm,
  validateProfileForm,
  validateKYCDocument,
  validateCoordinates,
  sanitizeInput,
};
