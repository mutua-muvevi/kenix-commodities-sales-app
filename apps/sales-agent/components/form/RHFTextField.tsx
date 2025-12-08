/**
 * RHFTextField Component
 * React Hook Form integrated text input field
 *
 * Features:
 * - Connected to react-hook-form via useController
 * - Auto-displays validation errors
 * - Supports all TextInput props
 * - Icon support (left/right)
 * - Multiline support
 *
 * Usage:
 * ```tsx
 * <RHFTextField
 *   name="email"
 *   label="Email Address"
 *   placeholder="Enter your email"
 *   rules={{ required: 'Email is required' }}
 *   keyboardType="email-address"
 * />
 * ```
 */

import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardTypeOptions,
  TextInputProps,
  Pressable,
} from 'react-native';
import { useController, RegisterOptions, useFormContext } from 'react-hook-form';
import { theme } from '../../theme';

/**
 * RHFTextField Props
 */
export interface RHFTextFieldProps extends Omit<TextInputProps, 'value' | 'onChangeText' | 'onBlur'> {
  /**
   * Field name (must match form schema)
   */
  name: string;

  /**
   * Input label
   */
  label?: string;

  /**
   * Placeholder text
   */
  placeholder?: string;

  /**
   * Helper text (shown below input)
   */
  helperText?: string;

  /**
   * Left icon component
   */
  leftIcon?: React.ReactNode;

  /**
   * Right icon component
   */
  rightIcon?: React.ReactNode;

  /**
   * Secure text entry (for passwords)
   */
  secureTextEntry?: boolean;

  /**
   * Keyboard type
   */
  keyboardType?: KeyboardTypeOptions;

  /**
   * Multiline input
   */
  multiline?: boolean;

  /**
   * Number of lines (for multiline)
   */
  numberOfLines?: number;

  /**
   * Validation rules
   */
  rules?: RegisterOptions;

  /**
   * Disabled state
   */
  disabled?: boolean;

  /**
   * Test ID for testing
   */
  testID?: string;

  /**
   * On right icon press
   */
  onRightIconPress?: () => void;

  /**
   * On left icon press
   */
  onLeftIconPress?: () => void;
}

/**
 * RHFTextField Component
 */
export function RHFTextField({
  name,
  label,
  placeholder,
  helperText,
  leftIcon,
  rightIcon,
  secureTextEntry,
  keyboardType,
  multiline = false,
  numberOfLines = 1,
  rules,
  disabled = false,
  testID,
  onRightIconPress,
  onLeftIconPress,
  style,
  ...otherProps
}: RHFTextFieldProps) {
  const { control } = useFormContext();

  const {
    field: { onChange, onBlur, value, ref },
    fieldState: { error, isTouched },
  } = useController({
    name,
    control,
    rules,
    defaultValue: '',
  });

  const [isFocused, setIsFocused] = React.useState(false);

  const hasError = Boolean(error && isTouched);

  /**
   * Handle focus
   */
  const handleFocus = React.useCallback(() => {
    setIsFocused(true);
  }, []);

  /**
   * Handle blur
   */
  const handleBlur = React.useCallback(() => {
    setIsFocused(false);
    onBlur();
  }, [onBlur]);

  /**
   * Get border color based on state
   */
  const getBorderColor = () => {
    if (hasError) return theme.palette.error.main;
    if (isFocused) return theme.palette.primary.main;
    if (disabled) return theme.palette.action.disabled;
    return theme.palette.grey[300];
  };

  return (
    <View style={styles.container} testID={testID}>
      {/* Label */}
      {label && (
        <Text
          style={[
            styles.label,
            hasError && styles.labelError,
            disabled && styles.labelDisabled,
          ]}
        >
          {label}
        </Text>
      )}

      {/* Input Container */}
      <View
        style={[
          styles.inputContainer,
          multiline && styles.inputContainerMultiline,
          {
            borderColor: getBorderColor(),
            backgroundColor: disabled
              ? theme.palette.action.disabledBackground
              : theme.palette.background.default,
          },
        ]}
      >
        {/* Left Icon */}
        {leftIcon && (
          <Pressable
            onPress={onLeftIconPress}
            disabled={!onLeftIconPress || disabled}
            style={styles.leftIconContainer}
          >
            {leftIcon}
          </Pressable>
        )}

        {/* Text Input */}
        <TextInput
          ref={ref}
          value={value}
          onChangeText={onChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          placeholderTextColor={theme.palette.text.disabled}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          editable={!disabled}
          style={[
            styles.input,
            multiline && styles.inputMultiline,
            disabled && styles.inputDisabled,
            style,
          ]}
          testID={`${testID}-input`}
          {...otherProps}
        />

        {/* Right Icon */}
        {rightIcon && (
          <Pressable
            onPress={onRightIconPress}
            disabled={!onRightIconPress || disabled}
            style={styles.rightIconContainer}
          >
            {rightIcon}
          </Pressable>
        )}
      </View>

      {/* Helper Text / Error Message */}
      {(helperText || hasError) && (
        <Text
          style={[
            styles.helperText,
            hasError && styles.errorText,
          ]}
          testID={`${testID}-helper-text`}
        >
          {hasError ? error?.message : helperText}
        </Text>
      )}
    </View>
  );
}

/**
 * Styles
 */
const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: theme.spacing.md,
  },
  label: {
    ...theme.typography.subtitle2,
    color: theme.palette.text.primary,
    marginBottom: theme.spacing.xs,
    fontWeight: '500',
  },
  labelError: {
    color: theme.palette.error.main,
  },
  labelDisabled: {
    color: theme.palette.text.disabled,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    minHeight: 48,
    backgroundColor: theme.palette.background.default,
  },
  inputContainerMultiline: {
    alignItems: 'flex-start',
    minHeight: 100,
    paddingVertical: theme.spacing.sm,
  },
  leftIconContainer: {
    marginRight: theme.spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightIconContainer: {
    marginLeft: theme.spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    ...theme.typography.body1,
    flex: 1,
    color: theme.palette.text.primary,
    paddingVertical: theme.spacing.sm,
    minHeight: 20,
  },
  inputMultiline: {
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
    textAlignVertical: 'top',
  },
  inputDisabled: {
    color: theme.palette.text.disabled,
  },
  helperText: {
    ...theme.typography.caption,
    color: theme.palette.text.secondary,
    marginTop: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
  },
  errorText: {
    color: theme.palette.error.main,
  },
});

/**
 * Default export
 */
export default RHFTextField;
