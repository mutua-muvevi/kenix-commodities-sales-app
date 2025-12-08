# UI Components Library

Production-ready, reusable UI components for the Sales Agent App.

## Overview

This directory contains 8 core UI components with:
- Theme-aware styling
- React Native Reanimated animations
- Expo Haptics feedback
- TypeScript strict typing
- Accessibility support
- JSDoc documentation

## Components

### 1. Button

A highly customizable button with animations and haptic feedback.

**Features:**
- 5 variants: primary, secondary, outlined, text, danger
- 3 sizes: small, medium, large
- Loading state with spinner
- Icon support (left/right)
- Full width option
- Press animations
- Haptic feedback

**Usage:**
```tsx
import { Button } from '@/components/ui';

<Button
  variant="primary"
  size="large"
  loading={isLoading}
  leftIcon={<Ionicons name="add" size={20} color="white" />}
  onPress={handleSubmit}
>
  Add Shop
</Button>
```

**Props:**
- `variant?: 'primary' | 'secondary' | 'outlined' | 'text' | 'danger'` - Button style (default: 'primary')
- `size?: 'small' | 'medium' | 'large'` - Button size (default: 'medium')
- `loading?: boolean` - Show loading spinner (default: false)
- `disabled?: boolean` - Disable interaction (default: false)
- `leftIcon?: React.ReactNode` - Icon on left side
- `rightIcon?: React.ReactNode` - Icon on right side
- `fullWidth?: boolean` - Take full container width (default: false)
- `onPress: () => void` - Press handler (required)
- `children: React.ReactNode` - Button label (required)

---

### 2. Input

Comprehensive text input with validation and animations.

**Features:**
- Label and helper text
- Error state with validation messages
- Left and right icon slots
- Password visibility toggle
- Multiline support
- Focus animations
- Theme-aware styling

**Usage:**
```tsx
import { Input } from '@/components/ui';

<Input
  label="Email"
  placeholder="Enter your email"
  value={email}
  onChangeText={setEmail}
  error={errors.email}
  keyboardType="email-address"
  leftIcon={<Ionicons name="mail-outline" size={20} />}
/>
```

**Props:**
- `label?: string` - Label text above input
- `placeholder?: string` - Placeholder text
- `value: string` - Current value (required)
- `onChangeText: (text: string) => void` - Change handler (required)
- `error?: string` - Error message
- `helperText?: string` - Helper text below input
- `leftIcon?: React.ReactNode` - Left side icon
- `rightIcon?: React.ReactNode` - Right side icon
- `secureTextEntry?: boolean` - Password mode (default: false)
- `keyboardType?: KeyboardTypeOptions` - Keyboard type (default: 'default')
- `multiline?: boolean` - Enable multiline (default: false)
- `numberOfLines?: number` - Lines for multiline (default: 4)
- `disabled?: boolean` - Disable input (default: false)

---

### 3. Card

Flexible container with elevation and press feedback.

**Features:**
- 3 variants: default, elevated, outlined
- Optional press feedback
- Theme-aware shadows
- Press animations
- Customizable styling

**Usage:**
```tsx
import { Card } from '@/components/ui';

<Card variant="elevated" onPress={() => navigate('ShopDetails')}>
  <Text style={styles.shopName}>{shop.name}</Text>
  <Text style={styles.location}>{shop.location}</Text>
</Card>
```

**Props:**
- `variant?: 'default' | 'elevated' | 'outlined'` - Card style (default: 'default')
- `onPress?: () => void` - Makes card touchable
- `children: React.ReactNode` - Card content (required)
- `style?: ViewStyle` - Custom container style
- `disabled?: boolean` - Disable interaction (default: false)

---

### 4. Badge

Small label for status, counts, or categories.

**Features:**
- 6 color variants: primary, secondary, success, warning, error, info
- 3 sizes: small, medium, large
- Dot mode for notifications
- Pill-shaped design
- Theme-aware colors

**Usage:**
```tsx
import { Badge } from '@/components/ui';

<Badge variant="success" size="small">Active</Badge>
<Badge variant="error" dot />
```

**Props:**
- `variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'` - Color variant (default: 'primary')
- `size?: 'small' | 'medium' | 'large'` - Badge size (default: 'medium')
- `dot?: boolean` - Show as dot indicator (default: false)
- `children?: React.ReactNode` - Badge content

---

### 5. StatusBadge

Specialized badge for order/route status with auto-color mapping.

**Features:**
- Auto-color based on status
- Icon + text combination
- 2 sizes: small, medium
- Supports all order and route statuses
- Theme-aware styling

**Usage:**
```tsx
import { StatusBadge } from '@/components/ui';

<StatusBadge status="delivered" />
<StatusBadge status="pending" size="small" />
<StatusBadge status="in_progress" />
```

**Props:**
- `status: BadgeStatus` - Status value (required)
- `size?: 'small' | 'medium'` - Badge size (default: 'medium')

**Supported Statuses:**
- Order: pending, confirmed, processing, approved, rejected, ready_for_dispatch, dispatched, in_transit, out_for_delivery, shipped, delivered, cancelled, failed
- Route: pending, in_progress, completed

---

### 6. EmptyState

Display component for empty lists/views.

**Features:**
- Icon support via Ionicons
- Title and description
- Optional action button
- Centered layout
- Accessibility support

**Usage:**
```tsx
import { EmptyState } from '@/components/ui';

<EmptyState
  icon="file-tray-outline"
  title="No Orders Yet"
  description="You haven't placed any orders yet. Start by visiting shops."
  actionLabel="View Routes"
  onAction={() => navigation.navigate('Routes')}
/>
```

**Props:**
- `icon?: string` - Ionicons name (default: 'file-tray-outline')
- `iconSize?: number` - Icon size (default: 64)
- `iconColor?: string` - Icon color
- `title: string` - Title text (required)
- `description?: string` - Description text
- `actionLabel?: string` - Action button label
- `onAction?: () => void` - Action button handler

---

### 7. LoadingSpinner

Flexible loading indicator with fullscreen option.

**Features:**
- 3 sizes: small, medium, large
- Fullscreen overlay mode
- Optional message text
- Custom color support
- Accessibility support

**Usage:**
```tsx
import { LoadingSpinner } from '@/components/ui';

<LoadingSpinner size="large" fullScreen message="Loading data..." />
<LoadingSpinner size="small" />
```

**Props:**
- `size?: 'small' | 'medium' | 'large'` - Spinner size (default: 'medium')
- `color?: string` - Spinner color (default: theme.palette.primary.main)
- `fullScreen?: boolean` - Show as fullscreen overlay (default: false)
- `message?: string` - Loading message text

---

### 8. Avatar

Circular user avatar with image or initials fallback.

**Features:**
- Image display from URL
- Initials fallback
- Status badge overlay
- 4 sizes: small, medium, large, xlarge
- Auto-generated colors
- Accessibility support

**Usage:**
```tsx
import { Avatar } from '@/components/ui';

<Avatar
  source="https://example.com/avatar.jpg"
  name="John Doe"
  size="large"
  badge="online"
/>

<Avatar name="Jane Smith" size="medium" />
```

**Props:**
- `source?: string` - Image URL
- `name?: string` - User name for initials
- `size?: 'small' | 'medium' | 'large' | 'xlarge'` - Avatar size (default: 'medium')
- `badge?: 'online' | 'offline' | 'busy'` - Status indicator

---

## Import Options

### Named Imports (Recommended)
```tsx
import { Button, Input, Card } from '@/components/ui';
```

### Individual Imports
```tsx
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
```

### Type Imports
```tsx
import type { ButtonProps, InputProps } from '@/components/ui';
```

## Theme Integration

All components use the centralized theme system from `@/theme`:

```tsx
import { theme } from '@/theme';

// Access theme properties
theme.palette.primary.main
theme.spacing.md
theme.typography.button
theme.shadows.z4
theme.borderRadius.md
```

## Animations

Components use `react-native-reanimated` for performant animations:
- Button: Scale + opacity on press
- Input: Border color + width on focus
- Card: Scale + elevation on press

## Haptic Feedback

Interactive components (Button, Card) provide haptic feedback:
- Light impact on press in
- Medium impact on press completion

## Accessibility

All components include:
- Proper `accessibilityRole`
- `accessibilityLabel` support
- `accessibilityState` for disabled/loading states
- Screen reader friendly text

## Testing

All components support `testID` prop for testing:

```tsx
<Button testID="submit-button" onPress={handleSubmit}>
  Submit
</Button>
```

## File Structure

```
components/ui/
├── Button.tsx          - Button component with variants
├── Input.tsx           - Text input with validation
├── Card.tsx            - Container with elevation
├── Badge.tsx           - Label for status/counts
├── StatusBadge.tsx     - Auto-colored status badge
├── EmptyState.tsx      - Empty view placeholder
├── LoadingSpinner.tsx  - Loading indicator
├── Avatar.tsx          - User avatar component
├── index.ts            - Barrel export
└── README.md           - This file
```

## Dependencies

- react-native
- react-native-reanimated
- expo-haptics
- @expo/vector-icons (Ionicons)
- Custom theme system (@/theme)

## Best Practices

1. **Always use theme tokens** - Don't hardcode colors, spacing, or typography
2. **Provide accessibility labels** - Use `accessibilityLabel` for screen readers
3. **Include test IDs** - Add `testID` for component testing
4. **Handle loading states** - Use `loading` prop on buttons during async operations
5. **Validate inputs** - Display error messages via `error` prop on Input
6. **Use appropriate variants** - Choose variant that matches action severity
7. **Optimize re-renders** - Components use React.memo where appropriate

## Examples

### Form with Validation
```tsx
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [errors, setErrors] = useState({});

<Input
  label="Email"
  value={email}
  onChangeText={setEmail}
  error={errors.email}
  keyboardType="email-address"
/>

<Input
  label="Password"
  value={password}
  onChangeText={setPassword}
  error={errors.password}
  secureTextEntry
/>

<Button
  variant="primary"
  fullWidth
  loading={isSubmitting}
  onPress={handleSubmit}
>
  Sign In
</Button>
```

### Shop Card List
```tsx
<FlatList
  data={shops}
  renderItem={({ item }) => (
    <Card variant="elevated" onPress={() => navigate('Shop', { id: item._id })}>
      <View style={styles.header}>
        <Avatar name={item.name} size="medium" />
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <StatusBadge status={item.status} size="small" />
        </View>
      </View>
    </Card>
  )}
  ListEmptyComponent={
    <EmptyState
      icon="storefront-outline"
      title="No Shops Found"
      description="Start by adding shops to your route"
      actionLabel="Add Shop"
      onAction={handleAddShop}
    />
  }
/>
```

### Loading Overlay
```tsx
{isLoading && (
  <LoadingSpinner
    fullScreen
    size="large"
    message="Syncing data..."
  />
)}
```

## Contributing

When adding new UI components:
1. Follow existing component structure
2. Include comprehensive JSDoc comments
3. Add TypeScript types for all props
4. Support theme tokens
5. Include accessibility features
6. Add to index.ts barrel export
7. Update this README

## License

Internal use only - Sales Agent App
