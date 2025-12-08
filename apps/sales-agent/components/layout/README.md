# Layout Components

Production-ready layout components for the Sales Agent App, providing consistent screen structure, safe area handling, and navigation patterns.

## Overview

This directory contains 5 core layout components that form the foundation of all screens in the Sales Agent App:

1. **SafeArea** - Safe area context wrapper with configurable edges
2. **Container** - Flexible container with consistent padding
3. **ScreenWrapper** - Complete screen layout with all features
4. **Header** - Navigation header with back button and actions
5. **index.ts** - Barrel export for easy imports

## Quick Start

### Installation

All required dependencies are already included in the Sales Agent App:
- `react-native-safe-area-context` - Safe area handling
- `expo-router` - Navigation
- `@expo/vector-icons` - Icons

### Basic Usage

```typescript
import { ScreenWrapper } from '@/components/layout';

export default function MyScreen() {
  return (
    <ScreenWrapper headerTitle="My Screen" scrollable>
      <Text>Screen Content</Text>
    </ScreenWrapper>
  );
}
```

## Components

### 1. SafeArea

Wraps content in safe area context, handling device-specific insets (notch, dynamic island, navigation bars).

**Use Cases:**
- Custom layouts requiring granular control
- Screens with custom headers/footers
- Overlay components (modals, sheets)

**Example:**
```typescript
<SafeArea edges={['top', 'bottom']}>
  <YourContent />
</SafeArea>
```

### 2. Container

Provides consistent horizontal padding with optional centering.

**Use Cases:**
- Content sections within screens
- Wrapping components with standard padding
- Centering content

**Example:**
```typescript
<Container padding="medium" centered>
  <Logo />
  <Text>Welcome</Text>
</Container>
```

### 3. ScreenWrapper

All-in-one screen wrapper combining SafeArea, Container, ScrollView, KeyboardAvoidingView, and Header.

**Use Cases:**
- 90% of screens in the app
- Standard screen layouts
- Forms, lists, detail views

**Features:**
- Safe area handling
- Optional scrolling with pull-to-refresh
- Keyboard avoidance
- Tab bar padding
- Header integration

**Example:**
```typescript
<ScreenWrapper
  headerTitle="Shop Details"
  showBackButton
  scrollable
  onRefresh={handleRefresh}
  refreshing={isRefreshing}
>
  <ShopInfo />
  <OrderHistory />
</ScreenWrapper>
```

### 4. Header

Customizable navigation header with back button, title, subtitle, and right action slot.

**Use Cases:**
- Screen navigation headers
- Overlay headers on maps
- Custom navigation patterns

**Example:**
```typescript
<Header
  title="Route Map"
  subtitle="5 shops remaining"
  showBackButton
  rightAction={
    <TouchableOpacity onPress={handleFilter}>
      <Ionicons name="filter-outline" size={24} />
    </TouchableOpacity>
  }
/>
```

## File Structure

```
components/layout/
├── SafeArea.tsx           # Safe area wrapper
├── Container.tsx          # Padding container
├── ScreenWrapper.tsx      # Complete screen layout
├── Header.tsx             # Navigation header
├── index.ts               # Barrel exports
├── README.md             # This file
└── USAGE_GUIDE.md        # Detailed usage examples
```

## Props Reference

### SafeArea Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | React.ReactNode | required | Child components |
| `edges` | Edge[] | `['top','bottom','left','right']` | Safe area edges |
| `style` | ViewStyle | undefined | Custom styles |
| `backgroundColor` | string | theme color | Background color |

### Container Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | React.ReactNode | required | Child components |
| `padding` | 'none'\|'small'\|'medium'\|'large' | 'medium' | Padding level |
| `centered` | boolean | false | Center content |
| `style` | ViewStyle | undefined | Custom styles |

### ScreenWrapper Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | React.ReactNode | required | Child components |
| `scrollable` | boolean | false | Enable scrolling |
| `refreshing` | boolean | false | Refresh state |
| `onRefresh` | () => void | undefined | Refresh handler |
| `headerTitle` | string | undefined | Header title |
| `showBackButton` | boolean | false | Show back button |
| `rightAction` | React.ReactNode | undefined | Right action component |
| `tabBarPadding` | boolean | true | Add tab bar padding |
| `keyboardAvoiding` | boolean | true | Keyboard avoidance |
| `padding` | 'none'\|'small'\|'medium'\|'large' | 'medium' | Container padding |
| `edges` | Edge[] | `['top','bottom']` | Safe area edges |
| `style` | ViewStyle | undefined | Custom styles |

### Header Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | string | required | Header title |
| `subtitle` | string | undefined | Header subtitle |
| `showBackButton` | boolean | false | Show back button |
| `onBackPress` | () => void | undefined | Custom back handler |
| `rightAction` | React.ReactNode | undefined | Right action component |
| `transparent` | boolean | false | Transparent header |
| `style` | ViewStyle | undefined | Custom styles |

## Design Tokens

All components use theme-based design tokens:

**Spacing:**
- `padding="none"` → 0px
- `padding="small"` → 8px
- `padding="medium"` → 16px
- `padding="large"` → 24px

**Colors:**
- Background: `theme.palette.background.default`
- Paper: `theme.palette.background.paper`
- Text: `theme.palette.text.primary`

**Dimensions:**
- Header Height: 44px (iOS), 56px (Android)
- Tab Bar Height: 49px (iOS), 56px (Android)

## Common Patterns

### Dashboard Screen
```typescript
<ScreenWrapper
  headerTitle="Dashboard"
  scrollable
  onRefresh={handleRefresh}
  refreshing={isRefreshing}
>
  <PerformanceMetrics />
  <RoutesList />
  <RecentOrders />
</ScreenWrapper>
```

### Detail Screen
```typescript
<ScreenWrapper
  headerTitle="Shop Details"
  showBackButton
  scrollable
  rightAction={<EditButton />}
>
  <ShopInfo />
  <OrderHistory />
</ScreenWrapper>
```

### Form Screen
```typescript
<ScreenWrapper
  headerTitle="Register Shop"
  showBackButton
  keyboardAvoiding
  scrollable
>
  <KYCForm />
</ScreenWrapper>
```

### Map Screen
```typescript
<SafeArea edges={['top']}>
  <MapView />
  <Header
    title="Route Map"
    transparent
    style={{ position: 'absolute', top: 0 }}
  />
</SafeArea>
```

## Best Practices

### 1. Prefer ScreenWrapper
For most screens, use `ScreenWrapper` instead of combining primitives:
```typescript
// Good
<ScreenWrapper headerTitle="Title" scrollable>

// Avoid (unless you need custom layout)
<SafeArea>
  <Header title="Title" />
  <Container>
    <ScrollView>
```

### 2. Tab Bar Padding
- Set `tabBarPadding={true}` (default) for tab navigator screens
- Set `tabBarPadding={false}` for modal/standalone screens

### 3. Keyboard Avoidance
- Keep `keyboardAvoiding={true}` (default) for forms
- Set `keyboardAvoiding={false}` for screens without inputs

### 4. Performance
- Memoize refresh handlers with `useCallback`
- Extract static right actions to prevent re-renders
- Only enable `scrollable` when needed

### 5. Accessibility
- Always provide meaningful `headerTitle`
- Use semantic actions in `rightAction`
- Ensure back button is visible when needed

## Platform Handling

Components automatically handle platform differences:

**iOS:**
- Chevron back icon
- Notch/dynamic island safe area
- 44px header height
- 49px tab bar height

**Android:**
- Arrow back icon
- Navigation bar safe area
- 56px header height
- 56px tab bar height

## Theme Integration

All components integrate with the theme system:
```typescript
import { useTheme } from '@/hooks/useTheme';

const { theme } = useTheme();
// Components automatically use theme.palette, theme.spacing, etc.
```

## TypeScript Support

All components are fully typed with exported interfaces:
```typescript
import type {
  SafeAreaProps,
  ContainerProps,
  ScreenWrapperProps,
  HeaderProps
} from '@/components/layout';
```

## Testing

Example test for ScreenWrapper:
```typescript
import { render } from '@testing-library/react-native';
import { ScreenWrapper } from '../ScreenWrapper';

describe('ScreenWrapper', () => {
  it('renders children', () => {
    const { getByText } = render(
      <ScreenWrapper headerTitle="Test">
        <Text>Content</Text>
      </ScreenWrapper>
    );
    expect(getByText('Content')).toBeTruthy();
  });

  it('shows header when headerTitle provided', () => {
    const { getByText } = render(
      <ScreenWrapper headerTitle="Test Title">
        <Text>Content</Text>
      </ScreenWrapper>
    );
    expect(getByText('Test Title')).toBeTruthy();
  });
});
```

## Migration from Old Components

If upgrading from previous implementations:

**Before:**
```typescript
<View style={{ flex: 1, padding: 16 }}>
  <CustomHeader title="Title" />
  <ScrollView>
    <Content />
  </ScrollView>
</View>
```

**After:**
```typescript
<ScreenWrapper headerTitle="Title" scrollable>
  <Content />
</ScreenWrapper>
```

## Troubleshooting

### Content Hidden Behind Tab Bar
- Ensure `tabBarPadding={true}` (default)

### Keyboard Covers Input
- Ensure `keyboardAvoiding={true}` (default)
- Ensure `scrollable={true}` for forms

### Header Appears Twice
- Don't use both `headerTitle` and custom `<Header>`
- Choose one approach

### Safe Area Not Working
- Ensure `SafeAreaProvider` wraps your app in `app/_layout.tsx`

## Related Documentation

- [USAGE_GUIDE.md](./USAGE_GUIDE.md) - Detailed usage examples and patterns
- [../../theme/README.md](../../theme/README.md) - Theme system documentation
- [Expo Router Docs](https://docs.expo.dev/router/introduction/) - Navigation

## Support

For issues or questions:
1. Check [USAGE_GUIDE.md](./USAGE_GUIDE.md) for examples
2. Review common patterns above
3. Check theme integration
4. Verify SafeAreaProvider setup

## Version

- Version: 1.0.0
- Last Updated: 2025-12-08
- Compatible with: React Native 0.81.5, Expo 54.0.23
