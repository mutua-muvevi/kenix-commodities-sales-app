# Layout Components Usage Guide

This guide demonstrates how to use the layout components in the Sales Agent App.

## Components Overview

### 1. SafeArea
Provides safe area context wrapper with configurable edges and background color.

**Props:**
- `children`: React.ReactNode (required)
- `edges`: Edge[] (default: `['top', 'bottom', 'left', 'right']`)
- `style`: ViewStyle (optional)
- `backgroundColor`: string (optional)

**Basic Usage:**
```typescript
import { SafeArea } from '@/components/layout';

<SafeArea edges={['top', 'bottom']}>
  <YourContent />
</SafeArea>
```

**Custom Background:**
```typescript
<SafeArea
  edges={['top']}
  backgroundColor="#22c55e"
>
  <YourContent />
</SafeArea>
```

---

### 2. Container
Flexible container with consistent padding and optional centering.

**Props:**
- `children`: React.ReactNode (required)
- `padding`: 'none' | 'small' | 'medium' | 'large' (default: 'medium')
- `centered`: boolean (default: false)
- `style`: ViewStyle (optional)

**Basic Usage:**
```typescript
import { Container } from '@/components/layout';

<Container padding="medium">
  <YourContent />
</Container>
```

**Centered Content:**
```typescript
<Container padding="large" centered>
  <View>
    <Text>Centered Content</Text>
  </View>
</Container>
```

**No Padding:**
```typescript
<Container padding="none">
  <FullWidthContent />
</Container>
```

---

### 3. ScreenWrapper
Complete screen layout wrapper combining SafeArea, Container, ScrollView, KeyboardAvoidingView, and optional Header.

**Props:**
- `children`: React.ReactNode (required)
- `scrollable`: boolean (default: false)
- `refreshing`: boolean (default: false)
- `onRefresh`: () => void (optional)
- `headerTitle`: string (optional)
- `showBackButton`: boolean (default: false)
- `rightAction`: React.ReactNode (optional)
- `tabBarPadding`: boolean (default: true)
- `keyboardAvoiding`: boolean (default: true)
- `padding`: 'none' | 'small' | 'medium' | 'large' (default: 'medium')
- `edges`: Edge[] (default: `['top', 'bottom']`)
- `style`: ViewStyle (optional)

**Basic Screen:**
```typescript
import { ScreenWrapper } from '@/components/layout';

<ScreenWrapper headerTitle="Dashboard">
  <View>
    <Text>Dashboard Content</Text>
  </View>
</ScreenWrapper>
```

**Scrollable with Pull-to-Refresh:**
```typescript
const [refreshing, setRefreshing] = useState(false);

const handleRefresh = async () => {
  setRefreshing(true);
  await fetchData();
  setRefreshing(false);
};

<ScreenWrapper
  headerTitle="Orders"
  scrollable
  refreshing={refreshing}
  onRefresh={handleRefresh}
  showBackButton
>
  <OrdersList />
</ScreenWrapper>
```

**With Header Actions:**
```typescript
import { Ionicons } from '@expo/vector-icons';

<ScreenWrapper
  headerTitle="Shop Details"
  showBackButton
  rightAction={
    <TouchableOpacity onPress={handleEdit}>
      <Ionicons name="create-outline" size={24} />
    </TouchableOpacity>
  }
  scrollable
>
  <ShopDetailsContent />
</ScreenWrapper>
```

**Form Screen with Keyboard Avoidance:**
```typescript
<ScreenWrapper
  headerTitle="Register Shop"
  showBackButton
  keyboardAvoiding
  scrollable
  tabBarPadding={false}
>
  <KYCForm />
</ScreenWrapper>
```

**No Tab Bar Padding (Modal/Standalone):**
```typescript
<ScreenWrapper
  headerTitle="Full Screen View"
  tabBarPadding={false}
  edges={['top']}
>
  <FullScreenContent />
</ScreenWrapper>
```

---

### 4. Header
Customizable header with back button, title, subtitle, and right action slot.

**Props:**
- `title`: string (required)
- `subtitle`: string (optional)
- `showBackButton`: boolean (default: false)
- `onBackPress`: () => void (optional)
- `rightAction`: React.ReactNode (optional)
- `transparent`: boolean (default: false)
- `style`: ViewStyle (optional)

**Basic Header:**
```typescript
import { Header } from '@/components/layout';

<Header title="Shop Details" />
```

**With Back Button:**
```typescript
<Header
  title="Order Details"
  showBackButton
/>
```

**With Subtitle:**
```typescript
<Header
  title="Shop Details"
  subtitle="ABC Retail Store"
  showBackButton
/>
```

**Custom Back Handler:**
```typescript
<Header
  title="Edit Profile"
  showBackButton
  onBackPress={() => {
    // Show confirmation dialog
    Alert.alert(
      'Discard Changes?',
      'Are you sure you want to go back?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Discard', onPress: () => router.back() }
      ]
    );
  }}
/>
```

**With Right Action:**
```typescript
import { Ionicons } from '@expo/vector-icons';

<Header
  title="Route Map"
  showBackButton
  rightAction={
    <View style={{ flexDirection: 'row', gap: 16 }}>
      <TouchableOpacity onPress={handleFilter}>
        <Ionicons name="filter-outline" size={24} />
      </TouchableOpacity>
      <TouchableOpacity onPress={handleSettings}>
        <Ionicons name="settings-outline" size={24} />
      </TouchableOpacity>
    </View>
  }
/>
```

**Transparent Header (Overlay):**
```typescript
<View style={{ flex: 1 }}>
  <MapView style={{ flex: 1 }} />
  <Header
    title="Route Map"
    transparent
    style={{ position: 'absolute', top: 0, left: 0, right: 0 }}
  />
</View>
```

---

## Common Patterns

### Pattern 1: Dashboard Screen
```typescript
import { ScreenWrapper } from '@/components/layout';

export default function DashboardScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  return (
    <ScreenWrapper
      headerTitle="Dashboard"
      scrollable
      refreshing={refreshing}
      onRefresh={handleRefresh}
    >
      <PerformanceMetrics />
      <RoutesList />
      <RecentOrders />
    </ScreenWrapper>
  );
}
```

### Pattern 2: Detail Screen
```typescript
import { ScreenWrapper } from '@/components/layout';
import { Ionicons } from '@expo/vector-icons';

export default function ShopDetailsScreen() {
  return (
    <ScreenWrapper
      headerTitle="Shop Details"
      showBackButton
      rightAction={
        <TouchableOpacity onPress={() => router.push('/edit-shop')}>
          <Ionicons name="create-outline" size={24} />
        </TouchableOpacity>
      }
      scrollable
    >
      <ShopInfo />
      <OrderHistory />
      <ActionButtons />
    </ScreenWrapper>
  );
}
```

### Pattern 3: Form Screen
```typescript
import { ScreenWrapper } from '@/components/layout';

export default function KYCScreen() {
  return (
    <ScreenWrapper
      headerTitle="Register New Shop"
      showBackButton
      keyboardAvoiding
      scrollable
    >
      <KYCForm />
    </ScreenWrapper>
  );
}
```

### Pattern 4: Custom Layout
```typescript
import { SafeArea, Container, Header } from '@/components/layout';

export default function CustomLayoutScreen() {
  return (
    <SafeArea edges={['top']}>
      <Header title="Custom Layout" showBackButton />
      <Container padding="large">
        <YourCustomContent />
      </Container>
    </SafeArea>
  );
}
```

### Pattern 5: Map Screen with Overlay Header
```typescript
import { View, StyleSheet } from 'react-native';
import { SafeArea, Header } from '@/components/layout';
import MapView from 'react-native-maps';

export default function RouteMapScreen() {
  return (
    <SafeArea edges={['top']}>
      <View style={styles.container}>
        <MapView style={styles.map} />
        <Header
          title="Route Map"
          showBackButton
          transparent
          style={styles.header}
          rightAction={
            <TouchableOpacity onPress={handleFilter}>
              <Ionicons name="filter-outline" size={24} color="#FFF" />
            </TouchableOpacity>
          }
        />
      </View>
    </SafeArea>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
});
```

---

## Best Practices

### 1. Use ScreenWrapper for Most Screens
For 90% of screens, `ScreenWrapper` provides everything you need:
- Safe area handling
- Consistent padding
- Header integration
- Pull-to-refresh
- Keyboard avoidance
- Tab bar padding

### 2. SafeArea + Container for Custom Layouts
When you need more control, combine `SafeArea` and `Container`:
```typescript
<SafeArea edges={['top', 'bottom']}>
  <CustomHeader />
  <Container padding="medium">
    <Content />
  </Container>
  <CustomFooter />
</SafeArea>
```

### 3. Tab Bar Padding
Set `tabBarPadding={false}` for:
- Modal screens
- Standalone screens
- Screens without tab bar

Keep `tabBarPadding={true}` (default) for:
- Tab navigator screens
- Screens that can be overlapped by tab bar

### 4. Keyboard Avoidance
Set `keyboardAvoiding={false}` for:
- Screens without inputs
- Screens with custom keyboard handling

Keep `keyboardAvoiding={true}` (default) for:
- Forms
- Text input screens

### 5. Refresh Control
Only add `onRefresh` when you actually need pull-to-refresh:
```typescript
// Good: Refresh when needed
<ScreenWrapper
  scrollable
  onRefresh={actualRefreshFunction}
  refreshing={isRefreshing}
>

// Avoid: No refresh needed
<ScreenWrapper scrollable>
```

---

## Theme Integration

All layout components automatically integrate with the theme system:

```typescript
import { useTheme } from '@/hooks/useTheme';

function CustomComponent() {
  const { theme } = useTheme();

  return (
    <Container padding="medium">
      <View style={{
        backgroundColor: theme.palette.background.paper,
        padding: theme.spacing.lg,
        borderRadius: theme.borderRadius.md,
      }}>
        <Text style={{ color: theme.palette.text.primary }}>
          Themed Content
        </Text>
      </View>
    </Container>
  );
}
```

---

## Platform Differences

### iOS vs Android
Layout components handle platform differences automatically:

**Header:**
- iOS: Chevron back icon
- Android: Arrow back icon

**KeyboardAvoidingView:**
- iOS: `behavior="padding"`
- Android: `behavior="height"`

**Tab Bar Padding:**
- iOS: 49px + spacing
- Android: 56px + spacing

**Safe Area:**
- iOS: Handles notch/dynamic island
- Android: Handles navigation bar

---

## Troubleshooting

### Content Hidden Behind Tab Bar
**Solution:** Ensure `tabBarPadding={true}` (default)
```typescript
<ScreenWrapper tabBarPadding>
```

### Keyboard Covers Input
**Solution:** Ensure `keyboardAvoiding={true}` (default) and `scrollable={true}`
```typescript
<ScreenWrapper keyboardAvoiding scrollable>
```

### Header Appears Twice
**Solution:** Don't use `headerTitle` with custom Header
```typescript
// Wrong
<ScreenWrapper headerTitle="Title">
  <Header title="Title" /> {/* Duplicate! */}
</ScreenWrapper>

// Correct
<ScreenWrapper>
  <Header title="Title" />
</ScreenWrapper>
```

### Safe Area Not Applied
**Solution:** Ensure react-native-safe-area-context provider is wrapping your app
```typescript
// In app/_layout.tsx
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack />
    </SafeAreaProvider>
  );
}
```

---

## Performance Tips

1. **Memoize Refresh Handlers:**
```typescript
const handleRefresh = useCallback(async () => {
  setRefreshing(true);
  await fetchData();
  setRefreshing(false);
}, []);
```

2. **Optimize ScrollView:**
```typescript
<ScreenWrapper
  scrollable
  // Only use when needed
  onRefresh={handleRefresh}
/>
```

3. **Use Static Layouts When Possible:**
```typescript
// If no scrolling needed
<ScreenWrapper scrollable={false}>
```

4. **Minimal Re-renders:**
```typescript
// Extract static right actions
const RightAction = memo(() => (
  <TouchableOpacity onPress={handleEdit}>
    <Ionicons name="create-outline" size={24} />
  </TouchableOpacity>
));

<ScreenWrapper rightAction={<RightAction />}>
```
