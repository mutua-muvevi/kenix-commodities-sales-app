/**
 * RHFSelect Component
 * React Hook Form integrated select/dropdown field
 *
 * Features:
 * - Connected to react-hook-form via useController
 * - Modal-based selection with FlatList
 * - Auto-displays validation errors
 * - Search functionality
 * - Custom rendering support
 *
 * Usage:
 * ```tsx
 * <RHFSelect
 *   name="category"
 *   label="Shop Category"
 *   placeholder="Select category"
 *   options={[
 *     { label: 'Retail', value: 'retail' },
 *     { label: 'Wholesale', value: 'wholesale' },
 *   ]}
 *   rules={{ required: 'Category is required' }}
 * />
 * ```
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  FlatList,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useController, RegisterOptions, useFormContext } from 'react-hook-form';
import { theme } from '../../theme';

/**
 * Select option interface
 */
export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

/**
 * RHFSelect Props
 */
export interface RHFSelectProps {
  /**
   * Field name (must match form schema)
   */
  name: string;

  /**
   * Select label
   */
  label?: string;

  /**
   * Placeholder text
   */
  placeholder?: string;

  /**
   * Select options
   */
  options: SelectOption[];

  /**
   * Validation rules
   */
  rules?: RegisterOptions;

  /**
   * Disabled state
   */
  disabled?: boolean;

  /**
   * Enable search
   */
  searchable?: boolean;

  /**
   * Search placeholder
   */
  searchPlaceholder?: string;

  /**
   * Helper text
   */
  helperText?: string;

  /**
   * Test ID for testing
   */
  testID?: string;

  /**
   * Custom render for selected value
   */
  renderValue?: (value: string, option?: SelectOption) => React.ReactNode;

  /**
   * Custom render for option
   */
  renderOption?: (option: SelectOption, isSelected: boolean) => React.ReactNode;
}

/**
 * Chevron Down Icon
 */
const ChevronDownIcon = ({ color = theme.palette.text.secondary }: { color?: string }) => (
  <View style={styles.chevronIcon}>
    <Text style={[styles.chevronText, { color }]}>▼</Text>
  </View>
);

/**
 * Check Icon
 */
const CheckIcon = ({ color = theme.palette.primary.main }: { color?: string }) => (
  <View style={styles.checkIcon}>
    <Text style={[styles.checkText, { color }]}>✓</Text>
  </View>
);

/**
 * RHFSelect Component
 */
export function RHFSelect({
  name,
  label,
  placeholder = 'Select an option',
  options,
  rules,
  disabled = false,
  searchable = false,
  searchPlaceholder = 'Search...',
  helperText,
  testID,
  renderValue,
  renderOption,
}: RHFSelectProps) {
  const { control } = useFormContext();

  const {
    field: { onChange, value, ref },
    fieldState: { error, isTouched },
  } = useController({
    name,
    control,
    rules,
    defaultValue: '',
  });

  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const hasError = Boolean(error && isTouched);

  /**
   * Get selected option
   */
  const selectedOption = React.useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value]
  );

  /**
   * Filter options based on search
   */
  const filteredOptions = React.useMemo(() => {
    if (!searchable || !searchQuery.trim()) {
      return options;
    }
    const query = searchQuery.toLowerCase();
    return options.filter((option) =>
      option.label.toLowerCase().includes(query)
    );
  }, [options, searchQuery, searchable]);

  /**
   * Handle option select
   */
  const handleSelect = React.useCallback(
    (optionValue: string) => {
      onChange(optionValue);
      setIsOpen(false);
      setSearchQuery('');
    },
    [onChange]
  );

  /**
   * Handle modal close
   */
  const handleClose = React.useCallback(() => {
    setIsOpen(false);
    setSearchQuery('');
  }, []);

  /**
   * Render option item
   */
  const renderOptionItem = ({ item }: { item: SelectOption }) => {
    const isSelected = item.value === value;
    const isDisabled = item.disabled || disabled;

    if (renderOption) {
      return (
        <TouchableOpacity
          onPress={() => !isDisabled && handleSelect(item.value)}
          disabled={isDisabled}
          style={[
            styles.optionItem,
            isSelected && styles.optionItemSelected,
            isDisabled && styles.optionItemDisabled,
          ]}
        >
          {renderOption(item, isSelected)}
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        onPress={() => !isDisabled && handleSelect(item.value)}
        disabled={isDisabled}
        style={[
          styles.optionItem,
          isSelected && styles.optionItemSelected,
          isDisabled && styles.optionItemDisabled,
        ]}
        testID={`${testID}-option-${item.value}`}
      >
        <Text
          style={[
            styles.optionText,
            isSelected && styles.optionTextSelected,
            isDisabled && styles.optionTextDisabled,
          ]}
        >
          {item.label}
        </Text>
        {isSelected && <CheckIcon />}
      </TouchableOpacity>
    );
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

      {/* Select Button */}
      <Pressable
        ref={ref}
        onPress={() => !disabled && setIsOpen(true)}
        disabled={disabled}
        style={[
          styles.selectButton,
          {
            borderColor: hasError
              ? theme.palette.error.main
              : theme.palette.grey[300],
            backgroundColor: disabled
              ? theme.palette.action.disabledBackground
              : theme.palette.background.default,
          },
        ]}
        testID={`${testID}-button`}
      >
        {/* Value Display */}
        <View style={styles.valueContainer}>
          {renderValue && selectedOption ? (
            renderValue(value, selectedOption)
          ) : (
            <Text
              style={[
                styles.valueText,
                !selectedOption && styles.placeholderText,
                disabled && styles.valueTextDisabled,
              ]}
            >
              {selectedOption?.label || placeholder}
            </Text>
          )}
        </View>

        {/* Chevron Icon */}
        <ChevronDownIcon
          color={
            disabled
              ? theme.palette.text.disabled
              : theme.palette.text.secondary
          }
        />
      </Pressable>

      {/* Helper Text / Error Message */}
      {(helperText || hasError) && (
        <Text
          style={[styles.helperText, hasError && styles.errorText]}
          testID={`${testID}-helper-text`}
        >
          {hasError ? error?.message : helperText}
        </Text>
      )}

      {/* Selection Modal */}
      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={handleClose}
        testID={`${testID}-modal`}
      >
        <Pressable style={styles.modalOverlay} onPress={handleClose}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label || 'Select Option'}</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            {searchable && (
              <View style={styles.searchContainer}>
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder={searchPlaceholder}
                  placeholderTextColor={theme.palette.text.disabled}
                  style={styles.searchInput}
                  testID={`${testID}-search`}
                />
              </View>
            )}

            {/* Options List */}
            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => item.value}
              renderItem={renderOptionItem}
              style={styles.optionsList}
              contentContainerStyle={styles.optionsListContent}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No options found</Text>
                </View>
              }
              testID={`${testID}-options-list`}
            />
          </View>
        </Pressable>
      </Modal>
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
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    minHeight: 48,
    backgroundColor: theme.palette.background.default,
  },
  valueContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  valueText: {
    ...theme.typography.body1,
    color: theme.palette.text.primary,
  },
  placeholderText: {
    color: theme.palette.text.disabled,
  },
  valueTextDisabled: {
    color: theme.palette.text.disabled,
  },
  chevronIcon: {
    marginLeft: theme.spacing.sm,
  },
  chevronText: {
    fontSize: 12,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.palette.background.default,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: '80%',
    paddingBottom: theme.spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.palette.divider,
  },
  modalTitle: {
    ...theme.typography.h6,
    color: theme.palette.text.primary,
    fontWeight: '600',
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  closeButtonText: {
    ...theme.typography.h5,
    color: theme.palette.text.secondary,
  },
  searchContainer: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.palette.divider,
  },
  searchInput: {
    ...theme.typography.body1,
    borderWidth: 1,
    borderColor: theme.palette.grey[300],
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.palette.background.default,
  },
  optionsList: {
    flex: 1,
  },
  optionsListContent: {
    paddingVertical: theme.spacing.xs,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.palette.divider,
  },
  optionItemSelected: {
    backgroundColor: theme.palette.primary.lighter,
  },
  optionItemDisabled: {
    opacity: 0.5,
  },
  optionText: {
    ...theme.typography.body1,
    color: theme.palette.text.primary,
    flex: 1,
  },
  optionTextSelected: {
    color: theme.palette.primary.main,
    fontWeight: '600',
  },
  optionTextDisabled: {
    color: theme.palette.text.disabled,
  },
  checkIcon: {
    marginLeft: theme.spacing.sm,
  },
  checkText: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    ...theme.typography.body2,
    color: theme.palette.text.secondary,
  },
});

/**
 * Default export
 */
export default RHFSelect;
