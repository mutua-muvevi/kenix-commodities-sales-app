# Form Components

React Hook Form integrated form components for the Sales Agent App. These components provide type-safe form handling with built-in validation, error display, and accessibility features.

## Installation

Required dependencies (already in package.json):
```bash
npm install react-hook-form @hookform/resolvers yup
```

## Components Overview

### 1. FormProvider
Wrapper component that provides form context to all child form components.

### 2. RHFTextField
Text input field with validation and error display.

### 3. RHFSelect
Dropdown select field with modal-based picker and search functionality.

### 4. RHFCheckbox
Checkbox field with animated check mark and optional description.

## Basic Usage

### Complete Form Example

```tsx
import React from 'react';
import { View, Button } from 'react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  FormProvider,
  RHFTextField,
  RHFSelect,
  RHFCheckbox,
} from '@/components/form';

// Define validation schema
const schema = yup.object({
  shopName: yup.string().required('Shop name is required'),
  ownerName: yup.string().required('Owner name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string()
    .matches(/^[0-9]{10}$/, 'Phone must be 10 digits')
    .required('Phone is required'),
  category: yup.string().required('Category is required'),
  termsAccepted: yup.boolean().oneOf([true], 'You must accept terms'),
});

// Define form data type
type ShopFormData = yup.InferType<typeof schema>;

export function ShopRegistrationForm() {
  // Initialize form
  const methods = useForm<ShopFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      shopName: '',
      ownerName: '',
      email: '',
      phone: '',
      category: '',
      termsAccepted: false,
    },
  });

  // Handle form submission
  const onSubmit = async (data: ShopFormData) => {
    console.log('Form data:', data);
    // Submit to API
    // await registerShop(data);
  };

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <View style={{ padding: 16 }}>
        {/* Text Fields */}
        <RHFTextField
          name="shopName"
          label="Shop Name"
          placeholder="Enter shop name"
        />

        <RHFTextField
          name="ownerName"
          label="Owner Name"
          placeholder="Enter owner name"
        />

        <RHFTextField
          name="email"
          label="Email Address"
          placeholder="owner@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <RHFTextField
          name="phone"
          label="Phone Number"
          placeholder="1234567890"
          keyboardType="phone-pad"
        />

        {/* Select Field */}
        <RHFSelect
          name="category"
          label="Shop Category"
          placeholder="Select a category"
          options={[
            { label: 'Retail Store', value: 'retail' },
            { label: 'Wholesale', value: 'wholesale' },
            { label: 'Supermarket', value: 'supermarket' },
            { label: 'Kiosk', value: 'kiosk' },
          ]}
        />

        {/* Checkbox */}
        <RHFCheckbox
          name="termsAccepted"
          label="I accept the terms and conditions"
          description="Please read our terms before proceeding"
        />

        {/* Submit Button */}
        <Button
          title="Register Shop"
          onPress={methods.handleSubmit(onSubmit)}
        />
      </View>
    </FormProvider>
  );
}
```

## Component APIs

### FormProvider

```tsx
<FormProvider
  methods={methods}        // UseFormReturn from useForm()
  onSubmit={handleSubmit}  // Optional submit handler
  style={customStyle}      // Optional container style
>
  {/* Form fields */}
</FormProvider>
```

**Props:**
- `methods` (required): Form methods from `useForm()` hook
- `onSubmit`: Callback when form is submitted
- `style`: Custom container styles
- `testID`: Test identifier

### RHFTextField

```tsx
<RHFTextField
  name="fieldName"
  label="Field Label"
  placeholder="Enter text"
  rules={{ required: 'This field is required' }}
  leftIcon={<Icon name="email" />}
  rightIcon={<Icon name="check" />}
  onRightIconPress={() => console.log('Icon pressed')}
  secureTextEntry={false}
  keyboardType="default"
  multiline={false}
  numberOfLines={1}
  disabled={false}
/>
```

**Props:**
- `name` (required): Field name matching form schema
- `label`: Label text displayed above input
- `placeholder`: Placeholder text
- `helperText`: Helper text displayed below input
- `leftIcon`: Icon component on the left
- `rightIcon`: Icon component on the right
- `onLeftIconPress`: Handler for left icon press
- `onRightIconPress`: Handler for right icon press
- `secureTextEntry`: Password mode
- `keyboardType`: Keyboard type
- `multiline`: Enable multiline input
- `numberOfLines`: Number of lines for multiline
- `rules`: Validation rules
- `disabled`: Disable input
- All standard TextInput props

**Common Keyboard Types:**
- `default`
- `email-address`
- `numeric`
- `phone-pad`
- `decimal-pad`

**Example with Icons:**

```tsx
import { Ionicons } from '@expo/vector-icons';

<RHFTextField
  name="password"
  label="Password"
  placeholder="Enter password"
  secureTextEntry={showPassword}
  leftIcon={<Ionicons name="lock-closed" size={20} color="gray" />}
  rightIcon={
    <Ionicons
      name={showPassword ? "eye-off" : "eye"}
      size={20}
      color="gray"
    />
  }
  onRightIconPress={() => setShowPassword(!showPassword)}
/>
```

### RHFSelect

```tsx
<RHFSelect
  name="fieldName"
  label="Select Label"
  placeholder="Choose option"
  options={[
    { label: 'Option 1', value: 'opt1' },
    { label: 'Option 2', value: 'opt2' },
  ]}
  rules={{ required: 'Selection is required' }}
  searchable={true}
  searchPlaceholder="Search options..."
  disabled={false}
/>
```

**Props:**
- `name` (required): Field name matching form schema
- `label`: Label text
- `placeholder`: Placeholder when nothing selected
- `options` (required): Array of option objects
- `rules`: Validation rules
- `disabled`: Disable select
- `searchable`: Enable search functionality
- `searchPlaceholder`: Search input placeholder
- `helperText`: Helper text
- `testID`: Test identifier
- `renderValue`: Custom render for selected value
- `renderOption`: Custom render for option items

**Option Interface:**
```tsx
interface SelectOption {
  label: string;    // Display text
  value: string;    // Value stored in form
  disabled?: boolean; // Optional disable state
}
```

**Example with Custom Rendering:**

```tsx
<RHFSelect
  name="shopType"
  label="Shop Type"
  options={shopTypes}
  renderValue={(value, option) => (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Ionicons name={option.icon} size={20} />
      <Text style={{ marginLeft: 8 }}>{option.label}</Text>
    </View>
  )}
/>
```

### RHFCheckbox

```tsx
<RHFCheckbox
  name="fieldName"
  label="Checkbox Label"
  description="Optional description text"
  rules={{ required: 'Must be checked' }}
  disabled={false}
  checkboxColor="#22c55e"
  onValueChange={(value) => console.log('Changed:', value)}
/>
```

**Props:**
- `name` (required): Field name matching form schema
- `label` (required): Label text
- `description`: Optional description below label
- `rules`: Validation rules
- `disabled`: Disable checkbox
- `testID`: Test identifier
- `checkboxColor`: Custom checkbox color
- `labelStyle`: Custom label style
- `onValueChange`: Callback when value changes

## Advanced Usage

### Conditional Field Display

```tsx
function DynamicForm() {
  const methods = useForm();
  const shopType = methods.watch('shopType');

  return (
    <FormProvider methods={methods}>
      <RHFSelect
        name="shopType"
        label="Shop Type"
        options={shopTypes}
      />

      {shopType === 'retail' && (
        <RHFTextField
          name="retailLicense"
          label="Retail License Number"
          rules={{ required: 'License is required for retail' }}
        />
      )}

      {shopType === 'wholesale' && (
        <RHFTextField
          name="wholesaleTaxId"
          label="Tax ID"
          rules={{ required: 'Tax ID is required for wholesale' }}
        />
      )}
    </FormProvider>
  );
}
```

### Field Arrays (Dynamic Lists)

```tsx
import { useFieldArray } from 'react-hook-form';

function ProductListForm() {
  const methods = useForm();
  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: 'products',
  });

  return (
    <FormProvider methods={methods}>
      {fields.map((field, index) => (
        <View key={field.id}>
          <RHFTextField
            name={`products.${index}.name`}
            label={`Product ${index + 1}`}
          />
          <RHFTextField
            name={`products.${index}.quantity`}
            label="Quantity"
            keyboardType="numeric"
          />
          <Button title="Remove" onPress={() => remove(index)} />
        </View>
      ))}

      <Button
        title="Add Product"
        onPress={() => append({ name: '', quantity: '' })}
      />
    </FormProvider>
  );
}
```

### Custom Validation

```tsx
const schema = yup.object({
  password: yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Must contain uppercase, lowercase, and number'
    ),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm password'),
});
```

### Async Validation

```tsx
const schema = yup.object({
  email: yup.string()
    .email('Invalid email')
    .test('unique-email', 'Email already exists', async (value) => {
      if (!value) return true;
      const exists = await checkEmailExists(value);
      return !exists;
    }),
});
```

### Form Reset

```tsx
function MyForm() {
  const methods = useForm({
    defaultValues: {
      name: '',
      email: '',
    },
  });

  const handleReset = () => {
    methods.reset(); // Reset to default values
  };

  const handleResetWithValues = () => {
    methods.reset({
      name: 'John Doe',
      email: 'john@example.com',
    });
  };

  return (
    <FormProvider methods={methods}>
      <RHFTextField name="name" label="Name" />
      <RHFTextField name="email" label="Email" />

      <Button title="Reset" onPress={handleReset} />
      <Button title="Reset with Values" onPress={handleResetWithValues} />
    </FormProvider>
  );
}
```

### Form State Access

```tsx
function MyForm() {
  const methods = useForm();
  const { isDirty, isValid, isSubmitting, errors } = methods.formState;

  return (
    <FormProvider methods={methods}>
      <RHFTextField name="name" label="Name" />

      <Button
        title="Submit"
        disabled={!isDirty || !isValid || isSubmitting}
        onPress={methods.handleSubmit(onSubmit)}
      />

      {Object.keys(errors).length > 0 && (
        <Text>Please fix the errors above</Text>
      )}
    </FormProvider>
  );
}
```

### Watching Field Values

```tsx
function DependentFields() {
  const methods = useForm();
  const watchedValue = methods.watch('fieldName');

  // Watch multiple fields
  const [field1, field2] = methods.watch(['field1', 'field2']);

  // Watch all fields
  const allValues = methods.watch();

  return (
    <FormProvider methods={methods}>
      <RHFTextField name="fieldName" label="Field" />
      <Text>Current value: {watchedValue}</Text>
    </FormProvider>
  );
}
```

## Validation Examples

### Required Fields

```tsx
<RHFTextField
  name="shopName"
  label="Shop Name"
  rules={{ required: 'Shop name is required' }}
/>
```

### Min/Max Length

```tsx
<RHFTextField
  name="description"
  label="Description"
  rules={{
    minLength: {
      value: 10,
      message: 'Minimum 10 characters required',
    },
    maxLength: {
      value: 200,
      message: 'Maximum 200 characters allowed',
    },
  }}
/>
```

### Pattern Matching

```tsx
<RHFTextField
  name="phone"
  label="Phone"
  rules={{
    pattern: {
      value: /^[0-9]{10}$/,
      message: 'Phone must be 10 digits',
    },
  }}
/>
```

### Custom Validation

```tsx
<RHFTextField
  name="age"
  label="Age"
  rules={{
    validate: (value) => {
      const age = parseInt(value, 10);
      if (age < 18) return 'Must be 18 or older';
      if (age > 100) return 'Invalid age';
      return true;
    },
  }}
/>
```

## Styling

### Custom Theme Colors

All components use the theme system. To customize:

```tsx
// In your theme/palette.ts
export const primary: ThemeColors = {
  main: '#your-color',
  // ...
};
```

### Custom Component Styles

```tsx
<RHFTextField
  name="field"
  style={{ fontSize: 18 }} // Custom input style
/>

<RHFCheckbox
  name="agree"
  label="I agree"
  labelStyle={{ fontWeight: 'bold' }} // Custom label style
  checkboxColor="#ff0000" // Custom checkbox color
/>
```

## Testing

```tsx
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { FormProvider, RHFTextField } from '@/components/form';
import { useForm } from 'react-hook-form';

describe('Form Components', () => {
  it('should display validation error', async () => {
    const TestForm = () => {
      const methods = useForm();
      return (
        <FormProvider methods={methods}>
          <RHFTextField
            name="email"
            testID="email-input"
            rules={{ required: 'Email is required' }}
          />
        </FormProvider>
      );
    };

    const { getByTestId } = render(<TestForm />);

    const input = getByTestId('email-input-input');
    fireEvent.changeText(input, '');
    fireEvent(input, 'blur');

    await waitFor(() => {
      expect(getByTestId('email-input-helper-text')).toHaveTextContent(
        'Email is required'
      );
    });
  });
});
```

## Performance Optimization

### Using React.memo

```tsx
const MemoizedTextField = React.memo(RHFTextField);

// Use in form
<MemoizedTextField name="field" label="Field" />
```

### Debounced Validation

```tsx
const schema = yup.object({
  username: yup.string()
    .test('check-username', 'Username taken', async (value) => {
      // Debounce API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return await checkUsernameAvailability(value);
    }),
});
```

## Common Patterns

### Multi-Step Form

```tsx
function MultiStepForm() {
  const [step, setStep] = React.useState(1);
  const methods = useForm();

  const onSubmit = (data) => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Final submission
      submitForm(data);
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      {step === 1 && (
        <>
          <RHFTextField name="shopName" label="Shop Name" />
          <RHFTextField name="ownerName" label="Owner Name" />
        </>
      )}

      {step === 2 && (
        <>
          <RHFTextField name="email" label="Email" />
          <RHFTextField name="phone" label="Phone" />
        </>
      )}

      {step === 3 && (
        <>
          <RHFSelect name="category" label="Category" options={categories} />
          <RHFCheckbox name="terms" label="Accept Terms" />
        </>
      )}

      <Button title={step < 3 ? 'Next' : 'Submit'} onPress={methods.handleSubmit(onSubmit)} />
      {step > 1 && <Button title="Back" onPress={() => setStep(step - 1)} />}
    </FormProvider>
  );
}
```

## Troubleshooting

### Error: "Cannot read property 'control' of undefined"
**Solution:** Ensure all form fields are wrapped in `<FormProvider>`.

### Error: Field not updating
**Solution:** Verify the `name` prop matches your form schema exactly.

### Validation not triggering
**Solution:** Check that validation rules are properly defined and form is in touched state.

### TypeScript errors with form data
**Solution:** Use `yup.InferType<typeof schema>` for type inference or define interface explicitly.

## Best Practices

1. Always define a validation schema
2. Use TypeScript for type safety
3. Provide clear error messages
4. Set appropriate keyboard types
5. Use placeholder text as examples
6. Add helper text for complex fields
7. Disable submit button when form is invalid
8. Reset form after successful submission
9. Handle loading states during submission
10. Test validation rules thoroughly

## Resources

- [React Hook Form Documentation](https://react-hook-form.com/)
- [Yup Validation Documentation](https://github.com/jquense/yup)
- [Sales Agent App Theme System](../../theme/README.md)

## Support

For issues or questions, please refer to the main Sales Agent App documentation.
