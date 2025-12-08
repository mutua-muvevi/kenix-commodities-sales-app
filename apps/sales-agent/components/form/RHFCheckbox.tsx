/**
 * RHFCheckbox Component
 * React Hook Form integrated checkbox field
 *
 * Features:
 * - Connected to react-hook-form via useController
 * - Animated checkbox with smooth transitions
 * - Auto-displays validation errors
 * - Optional description text
 * - Accessible and keyboard-friendly
 *
 * Usage:
 * ```tsx
 * <RHFCheckbox
 *   name="terms"
 *   label="I accept the terms and conditions"
 *   description="Please read our terms before proceeding"
 *   rules={{ required: 'You must accept the terms' }}
 * />
 * ```
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { useController, RegisterOptions, useFormContext } from 'react-hook-form';
import { theme } from '../../theme';

/**
 * RHFCheckbox Props
 */
export interface RHFCheckboxProps {
  /**
   * Field name (must match form schema)
   */
  name: string;

  /**
   * Checkbox label
   */
  label: string;

  /**
   * Optional description text
   */
  description?: string;

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
   * Custom checkbox color
   */
  checkboxColor?: string;

  /**
   * Custom label style
   */
  labelStyle?: object;

  /**
   * On value change callback
   */
  onValueChange?: (value: boolean) => void;
}

/**
 * Animated Check Mark Component
 */
const AnimatedCheckMark = ({ isChecked }: { isChecked: boolean }) => {
  const scaleAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: isChecked ? 1 : 0,
      friction: 6,
      tension: 100,
      useNativeDriver: true,
    }).start();
  }, [isChecked, scaleAnim]);

  return (
    <Animated.View
      style={[
        styles.checkMark,
        {
          transform: [{ scale: scaleAnim }],
          opacity: scaleAnim,
        },
      ]}
    >
      <Text style={styles.checkMarkText}>✓</Text>
    </Animated.View>
  );
};

/**
 * RHFCheckbox Component
 */
export function RHFCheckbox({
  name,
  label,
  description,
  rules,
  disabled = false,
  testID,
  checkboxColor = theme.palette.primary.main,
  labelStyle,
  onValueChange,
}: RHFCheckboxProps) {
  const { control } = useFormContext();

  const {
    field: { onChange, value, ref },
    fieldState: { error, isTouched },
  } = useController({
    name,
    control,
    rules,
    defaultValue: false,
  });

  const hasError = Boolean(error && isTouched);
  const isChecked = Boolean(value);

  /**
   * Handle checkbox toggle
   */
  const handleToggle = React.useCallback(() => {
    if (!disabled) {
      const newValue = !isChecked;
      onChange(newValue);
      onValueChange?.(newValue);
    }
  }, [disabled, isChecked, onChange, onValueChange]);

  /**
   * Get checkbox border color
   */
  const getBorderColor = () => {
    if (hasError) return theme.palette.error.main;
    if (isChecked) return checkboxColor;
    if (disabled) return theme.palette.action.disabled;
    return theme.palette.grey[400];
  };

  /**
   * Get checkbox background color
   */
  const getBackgroundColor = () => {
    if (disabled && isChecked) return theme.palette.action.disabled;
    if (isChecked) return checkboxColor;
    return 'transparent';
  };

  return (
    <View style={styles.container} testID={testID}>
      <Pressable
        ref={ref}
        onPress={handleToggle}
        disabled={disabled}
        style={[
          styles.checkboxContainer,
          disabled && styles.checkboxContainerDisabled,
        ]}
        testID={`${testID}-pressable`}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isChecked, disabled }}
        accessibilityLabel={label}
      >
        {/* Checkbox Box */}
        <View
          style={[
            styles.checkbox,
            {
              borderColor: getBorderColor(),
              backgroundColor: getBackgroundColor(),
            },
          ]}
        >
          <AnimatedCheckMark isChecked={isChecked} />
        </View>

        {/* Label and Description */}
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.label,
              hasError && styles.labelError,
              disabled && styles.labelDisabled,
              labelStyle,
            ]}
          >
            {label}
          </Text>

          {description && (
            <Text
              style={[
                styles.description,
                disabled && styles.descriptionDisabled,
              ]}
            >
              {description}
            </Text>
          )}
        </View>
      </Pressable>

      {/* Error Message */}
      {hasError && (
        <Text style={styles.errorText} testID={`${testID}-error`}>
          {error?.message}
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkboxContainerDisabled: {
    opacity: 0.5,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 2,
    marginRight: theme.spacing.sm,
    marginTop: 2, // Align with first line of text
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    position: 'absolute',
  },
  checkMarkText: {
    color: theme.palette.common.white,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 18,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    ...theme.typography.body1,
    color: theme.palette.text.primary,
    lineHeight: 22,
  },
  labelError: {
    color: theme.palette.error.main,
  },
  labelDisabled: {
    color: theme.palette.text.disabled,
  },
  description: {
    ...theme.typography.caption,
    color: theme.palette.text.secondary,
    marginTop: theme.spacing.xs,
    lineHeight: 16,
  },
  descriptionDisabled: {
    color: theme.palette.text.disabled,
  },
  errorText: {
    ...theme.typography.caption,
    color: theme.palette.error.main,
    marginTop: theme.spacing.xs,
    marginLeft: 32, // Align with label text (checkbox width + margin)
  },
});

/**
 * Default export
 */
export default RHFCheckbox;
