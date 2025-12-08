/**
 * FormProvider Component
 * Wrapper for react-hook-form FormProvider with form submission handling
 *
 * Features:
 * - Type-safe form context
 * - Automatic form submission handling
 * - Integration with react-hook-form
 *
 * Usage:
 * ```tsx
 * const methods = useForm<FormData>({
 *   resolver: yupResolver(schema),
 * });
 *
 * <FormProvider methods={methods} onSubmit={handleSubmit}>
 *   <RHFTextField name="email" label="Email" />
 *   <Button type="submit">Submit</Button>
 * </FormProvider>
 * ```
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { FormProvider as RHFFormProvider, FieldValues, UseFormReturn } from 'react-hook-form';

/**
 * FormProvider Props
 */
export interface FormProviderProps<T extends FieldValues> {
  /**
   * React Hook Form methods from useForm hook
   */
  methods: UseFormReturn<T>;

  /**
   * Form content
   */
  children: React.ReactNode;

  /**
   * Form submission handler
   * Called when form is valid and submitted
   */
  onSubmit?: (data: T) => void | Promise<void>;

  /**
   * Additional styles for form container
   */
  style?: object;

  /**
   * Test ID for testing
   */
  testID?: string;
}

/**
 * FormProvider Component
 * Wraps react-hook-form's FormProvider and handles form submission
 */
export function FormProvider<T extends FieldValues>({
  methods,
  children,
  onSubmit,
  style,
  testID = 'form-provider',
}: FormProviderProps<T>) {
  /**
   * Handle form submission
   * This is passed to the form's onSubmit handler
   */
  const handleSubmit = React.useCallback(
    (data: T) => {
      if (onSubmit) {
        // Handle both sync and async submission
        const result = onSubmit(data);

        // If it's a promise, we can add error handling here if needed
        if (result instanceof Promise) {
          result.catch((error) => {
            console.error('Form submission error:', error);
            // You can add toast notification here
          });
        }
      }
    },
    [onSubmit]
  );

  return (
    <RHFFormProvider {...methods}>
      <View style={[styles.container, style]} testID={testID}>
        {children}
      </View>
    </RHFFormProvider>
  );
}

/**
 * Hook to access form submission handler
 * Use this with Button components to trigger form submission
 *
 * @example
 * ```tsx
 * function MyForm() {
 *   const methods = useForm();
 *   const { handleSubmit } = methods;
 *
 *   return (
 *     <FormProvider methods={methods} onSubmit={onSubmit}>
 *       <RHFTextField name="email" />
 *       <Button onPress={handleSubmit(onSubmit)}>Submit</Button>
 *     </FormProvider>
 *   );
 * }
 * ```
 */
export { useFormContext, useWatch } from 'react-hook-form';

/**
 * Styles
 */
const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});

/**
 * Default export
 */
export default FormProvider;
