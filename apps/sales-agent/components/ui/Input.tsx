/**
 * Input Component
 * A comprehensive text input component with validation, icons, and animations.
 *
 * Features:
 * - Label and helper text support
 * - Error state with validation messages
 * - Left and right icon slots
 * - Password visibility toggle
 * - Multiline support
 * - Disabled state
 * - Focus animations
 * - Theme-aware styling
 * - Keyboard type options
 *
 * @example
 * ```tsx
 * <Input
 *   label="Email"
 *   placeholder="Enter your email"
 *   value={email}
 *   onChangeText={setEmail}
 *   error={emailError}
 *   keyboardType="email-address"
 *   leftIcon={<Ionicons name="mail-outline" size={20} />}
 * />
 * ```
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  KeyboardTypeOptions,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/theme';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

export interface InputProps {
  /**
   * Label text displayed above input
   */
  label?: string;

  /**
   * Placeholder text
   */
  placeholder?: string;

  /**
   * Current input value
   */
  value: string;

  /**
   * Change handler
   */
  onChangeText: (text: string) => void;

  /**
   * Error message to display
   */
  error?: string;

  /**
   * Helper text displayed below input
   */
  helperText?: string;

  /**
   * Icon displayed on the left side
   */
  leftIcon?: React.ReactNode;

  /**
   * Icon displayed on the right side
   */
  rightIcon?: React.ReactNode;

  /**
   * Enable secure text entry (password)
   * @default false
   */
  secureTextEntry?: boolean;

  /**
   * Keyboard type
   * @default 'default'
   */
  keyboardType?: KeyboardTypeOptions;

  /**
   * Enable multiline input
   * @default false
   */
  multiline?: boolean;

  /**
   * Number of lines for multiline input
   * @default 4
   */
  numberOfLines?: number;

  /**
   * Disable input
   * @default false
   */
  disabled?: boolean;

  /**
   * Auto-capitalize behavior
   */
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';

  /**
   * Auto-correct behavior
   */
  autoCorrect?: boolean;

  /**
   * Auto-focus on mount
   */
  autoFocus?: boolean;

  /**
   * Maximum character length
   */
  maxLength?: number;

  /**
   * Custom container style
   */
  style?: ViewStyle;

  /**
   * Custom input style
   */
  inputStyle?: TextStyle;

  /**
   * Blur handler
   */
  onBlur?: () => void;

  /**
   * Focus handler
   */
  onFocus?: () => void;

  /**
   * Test ID for testing
   */
  testID?: string;
}

/**
 * Input Component
 */
export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  helperText,
  leftIcon,
  rightIcon,
  secureTextEntry = false,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 4,
  disabled = false,
  autoCapitalize = 'none',
  autoCorrect = false,
  autoFocus = false,
  maxLength,
  style,
  inputStyle,
  onBlur,
  onFocus,
  testID,
}) => {
  // State
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // Animation values
  const borderColor = useSharedValue(theme.palette.grey[300]);
  const borderWidth = useSharedValue(1);

  // Handle focus
  const handleFocus = useCallback(() => {
    setIsFocused(true);
    borderColor.value = withTiming(theme.palette.primary.main, { duration: 200 });
    borderWidth.value = withTiming(2, { duration: 200 });
    onFocus?.();
  }, [borderColor, borderWidth, onFocus]);

  // Handle blur
  const handleBlur = useCallback(() => {
    setIsFocused(false);
    const newColor = error
      ? theme.palette.error.main
      : theme.palette.grey[300];
    borderColor.value = withTiming(newColor, { duration: 200 });
    borderWidth.value = withTiming(1, { duration: 200 });
    onBlur?.();
  }, [borderColor, borderWidth, error, onBlur]);

  // Toggle password visibility
  const togglePasswordVisibility = useCallback(() => {
    setIsPasswordVisible((prev) => !prev);
  }, []);

  // Animated border style
  const animatedBorderStyle = useAnimatedStyle(() => ({
    borderColor: borderColor.value,
    borderWidth: borderWidth.value,
  }));

  // Determine if we should show password toggle
  const showPasswordToggle = secureTextEntry && !rightIcon;

  // Get input container styles
  const getContainerStyles = (): ViewStyle => {
    const baseStyle: ViewStyle = {};

    if (error) {
      return {
        ...baseStyle,
        borderColor: theme.palette.error.main,
        borderWidth: 1,
      };
    }

    if (disabled) {
      return {
        ...baseStyle,
        backgroundColor: theme.palette.action.disabledBackground,
        borderColor: theme.palette.grey[200],
      };
    }

    return baseStyle;
  };

  return (
    <View style={[styles.wrapper, style]}>
      {/* Label */}
      {label && (
        <Animated.Text
          style={[
            styles.label,
            isFocused && styles.labelFocused,
            error && styles.labelError,
          ]}
        >
          {label}
        </Animated.Text>
      )}

      {/* Input Container */}
      <Animated.View
        style={[
          styles.container,
          animatedBorderStyle,
          getContainerStyles(),
          multiline && styles.multilineContainer,
        ]}
      >
        {/* Left Icon */}
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        {/* Input Field */}
        <AnimatedTextInput
          style={[
            styles.input,
            multiline && styles.multilineInput,
            inputStyle,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.palette.text.disabled}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          editable={!disabled}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          autoFocus={autoFocus}
          maxLength={maxLength}
          onFocus={handleFocus}
          onBlur={handleBlur}
          testID={testID}
        />

        {/* Password Toggle */}
        {showPasswordToggle && (
          <TouchableOpacity
            style={styles.rightIcon}
            onPress={togglePasswordVisibility}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={theme.palette.text.secondary}
            />
          </TouchableOpacity>
        )}

        {/* Right Icon */}
        {rightIcon && !showPasswordToggle && (
          <View style={styles.rightIcon}>{rightIcon}</View>
        )}
      </Animated.View>

      {/* Helper Text or Error */}
      {(error || helperText) && (
        <Animated.Text
          style={[styles.helperText, error && styles.errorText]}
        >
          {error || helperText}
        </Animated.Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: theme.spacing.md,
  },
  label: {
    ...theme.typography.subtitle2,
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing.xs,
    fontWeight: '500',
  },
  labelFocused: {
    color: theme.palette.primary.main,
  },
  labelError: {
    color: theme.palette.error.main,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.palette.background.default,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.palette.grey[300],
    paddingHorizontal: theme.spacing.md,
    minHeight: 48,
  },
  multilineContainer: {
    alignItems: 'flex-start',
    paddingVertical: theme.spacing.md,
    minHeight: 100,
  },
  input: {
    flex: 1,
    ...theme.typography.body1,
    color: theme.palette.text.primary,
    paddingVertical: theme.spacing.sm,
  },
  multilineInput: {
    textAlignVertical: 'top',
    paddingTop: 0,
  },
  leftIcon: {
    marginRight: theme.spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightIcon: {
    marginLeft: theme.spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
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

export default Input;
