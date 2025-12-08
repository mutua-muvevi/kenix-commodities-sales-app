# UI Components Integration Guide

This guide explains how to integrate the UI components into your Sales Agent App screens.

## Setup Complete

All 8 UI components have been created with:
- ✅ TypeScript strict typing
- ✅ Theme integration
- ✅ React Native Reanimated animations
- ✅ Expo Haptics feedback
- ✅ Accessibility support
- ✅ JSDoc documentation

## Component Files Created

```
G:\Waks\Kenix\commodies\apps\sales-agent\components\ui\
├── Button.tsx           (9KB)  - 5 variants, 3 sizes, loading state
├── Input.tsx            (9KB)  - Validation, icons, password toggle
├── Card.tsx             (5KB)  - 3 variants, press animations
├── Badge.tsx            (6KB)  - 6 color variants, dot mode
├── StatusBadge.tsx      (7KB)  - Auto-colored status display
├── EmptyState.tsx       (4KB)  - Empty view placeholder
├── LoadingSpinner.tsx   (4KB)  - Loading indicator with overlay
├── Avatar.tsx           (6KB)  - User avatar with initials
├── index.ts             (1KB)  - Barrel exports
├── README.md           (12KB)  - Full documentation
├── EXAMPLES.tsx        (17KB)  - Usage examples
└── INTEGRATION.md       (this file)
```

## Quick Start

### 1. Import Components

```tsx
// Named imports (recommended)
import { Button, Input, Card } from '@/components/ui';

// Type imports
import type { ButtonProps, InputProps } from '@/components/ui';
```

### 2. Use in Your Screens

**Login Screen Example:**
```tsx
import React, { useState } from 'react';
import { View } from 'react-native';
import { Button, Input } from '@/components/ui';

export const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      // API call here
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <Input
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button
        variant="primary"
        fullWidth
        loading={loading}
        onPress={handleLogin}
      >
        Sign In
      </Button>
    </View>
  );
};
```

## Integration with Existing Screens

### Home/Dashboard Screen
```tsx
import { Card, StatusBadge, Avatar } from '@/components/ui';

// Display route cards
<Card variant="elevated" onPress={() => navigate('RouteDetails', { id })}>
  <View style={styles.routeCard}>
    <Text style={styles.routeName}>{route.name}</Text>
    <StatusBadge status={route.status} />
    <Text>{route.shopsCount} shops</Text>
  </View>
</Card>
```

### Shop List Screen
```tsx
import { Card, Avatar, StatusBadge, EmptyState } from '@/components/ui';

<FlatList
  data={shops}
  renderItem={({ item }) => (
    <Card onPress={() => navigate('ShopDetails', { id: item._id })}>
      <View style={styles.row}>
        <Avatar name={item.name} size="medium" />
        <View style={styles.info}>
          <Text>{item.name}</Text>
          <StatusBadge status={item.status} size="small" />
        </View>
      </View>
    </Card>
  )}
  ListEmptyComponent={
    <EmptyState
      icon="storefront-outline"
      title="No Shops"
      description="No shops found in this route"
    />
  }
/>
```

### Order Form Screen
```tsx
import { Input, Button, LoadingSpinner } from '@/components/ui';

{isLoading && <LoadingSpinner fullScreen message="Loading products..." />}

<Input
  label="Quantity"
  value={quantity}
  onChangeText={setQuantity}
  keyboardType="numeric"
  error={errors.quantity}
/>

<Button
  variant="primary"
  fullWidth
  loading={isSubmitting}
  onPress={handleSubmitOrder}
>
  Place Order
</Button>
```

### Profile Screen
```tsx
import { Avatar, Card, Badge } from '@/components/ui';

<Card variant="elevated">
  <View style={styles.profileHeader}>
    <Avatar
      source={user.avatar}
      name={user.name}
      size="xlarge"
      badge="online"
    />
    <Text style={styles.name}>{user.name}</Text>
    <Badge variant="success">Active Agent</Badge>
  </View>
</Card>
```

## Common Patterns

### Form with Validation
```tsx
import { Input, Button } from '@/components/ui';
import { useForm } from '@/hooks/useForm';

const { values, errors, handleChange, handleSubmit } = useForm({
  initialValues: { shopName: '', location: '' },
  validate: (values) => {
    const errors = {};
    if (!values.shopName) errors.shopName = 'Required';
    return errors;
  },
  onSubmit: async (values) => {
    // Submit logic
  },
});

<Input
  label="Shop Name"
  value={values.shopName}
  onChangeText={handleChange('shopName')}
  error={errors.shopName}
/>

<Button
  variant="primary"
  onPress={handleSubmit}
>
  Submit
</Button>
```

### List with Loading and Empty States
```tsx
import { Card, LoadingSpinner, EmptyState } from '@/components/ui';

if (isLoading) {
  return <LoadingSpinner size="large" message="Loading orders..." />;
}

if (orders.length === 0) {
  return (
    <EmptyState
      icon="file-tray-outline"
      title="No Orders"
      description="You haven't placed any orders yet"
      actionLabel="Create Order"
      onAction={() => navigate('NewOrder')}
    />
  );
}

return (
  <FlatList
    data={orders}
    renderItem={({ item }) => (
      <Card onPress={() => navigate('OrderDetails', { id: item._id })}>
        {/* Order content */}
      </Card>
    )}
  />
);
```

### Status Display
```tsx
import { StatusBadge } from '@/components/ui';

// Order status
<StatusBadge status={order.status} />

// Route status
<StatusBadge status={route.status} size="small" />

// Supported statuses:
// Orders: pending, confirmed, processing, approved, rejected,
//         ready_for_dispatch, dispatched, in_transit,
//         out_for_delivery, shipped, delivered, cancelled, failed
// Routes: pending, in_progress, completed
```

### Action Buttons
```tsx
import { Button } from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';

// Primary action
<Button
  variant="primary"
  leftIcon={<Ionicons name="add" size={20} color="white" />}
  onPress={handleAdd}
>
  Add Shop
</Button>

// Secondary action
<Button variant="outlined" onPress={handleCancel}>
  Cancel
</Button>

// Danger action
<Button variant="danger" onPress={handleDelete}>
  Delete
</Button>

// Loading state
<Button variant="primary" loading={isSaving} onPress={handleSave}>
  Save
</Button>
```

## Theme Integration

All components automatically use the theme system. To customize:

```tsx
import { theme } from '@/theme';

// Access theme values
const customColor = theme.palette.primary.main;
const customSpacing = theme.spacing.lg;

// Components respect theme mode (light/dark)
// No additional configuration needed
```

## Accessibility

All components include accessibility features:

```tsx
<Button
  variant="primary"
  onPress={handleSubmit}
  accessibilityLabel="Submit registration form"
>
  Submit
</Button>

<Input
  label="Email"
  value={email}
  onChangeText={setEmail}
  // Automatic accessibility labels from label prop
/>
```

## Testing

Components support testID for testing:

```tsx
<Button
  testID="login-button"
  variant="primary"
  onPress={handleLogin}
>
  Login
</Button>

// In tests
const loginButton = getByTestId('login-button');
fireEvent.press(loginButton);
```

## Performance Tips

1. **Memoize callbacks** when passing to components:
```tsx
const handlePress = useCallback(() => {
  // Handler logic
}, [dependencies]);

<Button onPress={handlePress}>Submit</Button>
```

2. **Use FlatList optimizations** with Card:
```tsx
<FlatList
  data={items}
  renderItem={({ item }) => <Card>{/* content */}</Card>}
  keyExtractor={(item) => item._id}
  removeClippedSubviews
  maxToRenderPerBatch={10}
  windowSize={5}
/>
```

3. **Conditional rendering** for LoadingSpinner:
```tsx
{isLoading && <LoadingSpinner fullScreen />}
// Don't mount it with visible={false}
```

## Migration from Existing Components

If you have existing custom components, migrate gradually:

1. **Replace one component type at a time**
   - Week 1: Replace all buttons
   - Week 2: Replace all inputs
   - Week 3: Replace all cards

2. **Test thoroughly** after each migration

3. **Update imports**:
```tsx
// Before
import { CustomButton } from '@/components/CustomButton';

// After
import { Button } from '@/components/ui';
```

4. **Adjust props** if needed:
```tsx
// Before
<CustomButton type="primary" onClick={handleClick}>Submit</CustomButton>

// After
<Button variant="primary" onPress={handleClick}>Submit</Button>
```

## Troubleshooting

### Theme Import Errors
If you get theme import errors, ensure your tsconfig.json has:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./apps/sales-agent/*"]
    }
  }
}
```

### Animation Performance Issues
If animations are laggy:
1. Enable Hermes (should be enabled by default in Expo)
2. Use `react-native-reanimated` worklet syntax
3. Avoid heavy computations during animations

### Haptics Not Working
Ensure expo-haptics is installed:
```bash
npx expo install expo-haptics
```

## Next Steps

1. **Replace existing UI components** in screens
2. **Test on both iOS and Android** devices
3. **Verify accessibility** with screen readers
4. **Test dark mode** if implementing
5. **Add custom components** following the same patterns

## Support

For questions or issues:
- Review EXAMPLES.tsx for usage patterns
- Check README.md for API reference
- Ensure all dependencies are installed
- Verify theme system is properly configured

## Component Checklist

- [x] Button - 5 variants, animations, haptics
- [x] Input - Validation, icons, password toggle
- [x] Card - Press feedback, shadows
- [x] Badge - Color variants, dot mode
- [x] StatusBadge - Auto-colored statuses
- [x] EmptyState - Icon, title, action
- [x] LoadingSpinner - Sizes, fullscreen
- [x] Avatar - Image/initials, status badge
- [x] Barrel export (index.ts)
- [x] Documentation (README.md)
- [x] Examples (EXAMPLES.tsx)
- [x] Integration guide (this file)

## Dependencies Verified

```json
{
  "react-native": "^0.81.5",
  "react-native-reanimated": "latest",
  "expo-haptics": "latest",
  "@expo/vector-icons": "latest"
}
```

All components are production-ready and follow React Native best practices!
