/**
 * Form Components Barrel Export
 * React Hook Form integrated form components for Sales Agent App
 *
 * Components:
 * - FormProvider: Form context provider with submission handling
 * - RHFTextField: Text input field with validation
 * - RHFSelect: Dropdown/select field with modal picker
 * - RHFCheckbox: Checkbox field with animation
 *
 * Usage:
 * ```tsx
 * import { FormProvider, RHFTextField, RHFSelect, RHFCheckbox } from '@/components/form';
 * import { useForm } from 'react-hook-form';
 * import { yupResolver } from '@hookform/resolvers/yup';
 * import * as yup from 'yup';
 *
 * const schema = yup.object({
 *   name: yup.string().required('Name is required'),
 *   category: yup.string().required('Category is required'),
 *   agree: yup.boolean().oneOf([true], 'You must agree'),
 * });
 *
 * function MyForm() {
 *   const methods = useForm({
 *     resolver: yupResolver(schema),
 *   });
 *
 *   const onSubmit = (data) => {
 *     console.log(data);
 *   };
 *
 *   return (
 *     <FormProvider methods={methods} onSubmit={onSubmit}>
 *       <RHFTextField
 *         name="name"
 *         label="Name"
 *         placeholder="Enter your name"
 *       />
 *       <RHFSelect
 *         name="category"
 *         label="Category"
 *         options={[
 *           { label: 'Retail', value: 'retail' },
 *           { label: 'Wholesale', value: 'wholesale' },
 *         ]}
 *       />
 *       <RHFCheckbox
 *         name="agree"
 *         label="I agree to the terms"
 *       />
 *       <Button onPress={methods.handleSubmit(onSubmit)}>
 *         Submit
 *       </Button>
 *     </FormProvider>
 *   );
 * }
 * ```
 */

// Form Provider
import FormProvider_ from './FormProvider';
export { FormProvider_ as FormProvider, useFormContext, useWatch } from './FormProvider';
export type { FormProviderProps } from './FormProvider';

// Text Field
import RHFTextField_ from './RHFTextField';
export { RHFTextField_ as RHFTextField } from './RHFTextField';
export type { RHFTextFieldProps } from './RHFTextField';

// Select Field
import RHFSelect_ from './RHFSelect';
export { RHFSelect_ as RHFSelect } from './RHFSelect';
export type { RHFSelectProps, SelectOption } from './RHFSelect';

// Checkbox
import RHFCheckbox_ from './RHFCheckbox';
export { RHFCheckbox_ as RHFCheckbox } from './RHFCheckbox';
export type { RHFCheckboxProps } from './RHFCheckbox';

/**
 * Re-export commonly used react-hook-form utilities
 */
export {
  useForm,
  useController,
  useFieldArray,
  useFormState,
} from 'react-hook-form';

export type {
  UseFormReturn,
  FieldValues,
  FieldErrors,
  RegisterOptions,
  Control,
  Path,
} from 'react-hook-form';

/**
 * Re-export yup resolver for convenience
 */
export { yupResolver } from '@hookform/resolvers/yup';

/**
 * Default export for convenience
 */
export default {
  FormProvider: FormProvider_,
  RHFTextField: RHFTextField_,
  RHFSelect: RHFSelect_,
  RHFCheckbox: RHFCheckbox_,
};
