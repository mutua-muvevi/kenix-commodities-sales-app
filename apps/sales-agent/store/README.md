# Sales Agent App - Store Architecture

Professional Zustand-based state management with slices pattern, middleware, and comprehensive mock data.

## Directory Structure

```
store/
├── middleware/
│   ├── logger.ts          # Debug logging middleware
│   └── persist.ts         # SecureStore persistence adapter
├── slices/
│   ├── auth/
│   │   └── auth-store.ts       # Authentication & user management
│   ├── shop/
│   │   └── shop-store.ts       # Shop & KYC management
│   ├── order/
│   │   └── order-store.ts      # Order & cart management
│   ├── route/
│   │   └── route-store.ts      # Route & visit tracking
│   ├── theme/
│   │   └── theme-store.ts      # Theme & dark mode
│   └── notification/
│       └── notification-store.ts # Notifications & alerts
├── hooks/
│   ├── use-auth.ts        # Auth store hooks
│   ├── use-shop.ts        # Shop store hooks
│   ├── use-order.ts       # Order store hooks
│   ├── use-route.ts       # Route store hooks
│   ├── use-theme.ts       # Theme store hooks
│   └── use-notification.ts # Notification store hooks
├── data/
│   └── mock-data.ts       # Comprehensive mock data
├── index.ts               # Barrel export
└── README.md              # This file
```

## Features

### 1. Middleware

#### Logger Middleware
- Development-only state change logging
- Action logging with timestamps
- Error logging with context
- Conditional logging based on environment

```typescript
import { actionLogger, errorLogger } from '@/store';

// Log action
actionLogger('StoreName', 'actionName', { data });

// Log error
errorLogger('StoreName', 'actionName', error);
```

#### Persist Middleware
- SecureStore adapter for sensitive data (auth tokens, user data)
- AsyncStorage adapter for non-sensitive data (cart, preferences)
- Automatic state hydration on app start

```typescript
import { secureStorage, asyncStorage } from '@/store';

// Use in Zustand persist
persist(
  (set, get) => ({ /* state */ }),
  {
    name: 'store-key',
    storage: secureStorage, // or asyncStorage
  }
)
```

### 2. Store Slices

#### Auth Store
- User authentication (login, register, logout)
- Token management with secure storage
- User profile management
- Token refresh
- Approval status tracking

**Key Actions:**
- `login(email, password)` - Authenticate user
- `logout()` - Clear session
- `checkAuth()` - Validate stored session
- `updateProfile(updates)` - Update user details
- `refreshToken()` - Refresh auth token

#### Shop Store
- Shop list management
- KYC registration
- Shop filtering by status
- Shop selection and updates

**Key Actions:**
- `fetchShops(agentId, status?)` - Load shops
- `registerShop(kycData)` - Register new shop
- `setFilterStatus(status)` - Filter shops
- `getFilteredShops()` - Get filtered results

#### Order Store
- Cart management (add, remove, update)
- Order placement
- Offline order queuing
- Order history tracking

**Key Actions:**
- `addToCart(product, quantity)` - Add product to cart
- `placeOrder(orderData)` - Submit order
- `syncOfflineOrders()` - Sync queued orders
- `getCartTotal()` - Calculate cart total

#### Route Store
- Route navigation
- Visit tracking (check-in/check-out)
- Route progress monitoring
- Today's route management

**Key Actions:**
- `fetchTodaysRoute(agentId)` - Get today's route
- `startRoute(routeId)` - Begin route
- `checkInShop(data)` - Check in at shop
- `checkOutShop(data)` - Complete shop visit
- `getRouteProgress()` - Get completion %

#### Theme Store
- Light/dark mode toggle
- System theme detection
- Persistent theme preference

**Key Actions:**
- `setTheme(mode)` - Set theme (light/dark/system)
- `toggleTheme()` - Toggle between modes
- `setIsDark(isDark)` - Set from system detection

#### Notification Store
- Notification management
- Unread count tracking
- Type and priority filtering
- Mark as read functionality

**Key Actions:**
- `fetchNotifications(userId)` - Load notifications
- `markAsRead(notificationId)` - Mark single as read
- `markAllAsRead(userId)` - Mark all as read
- `getUnreadCount()` - Get unread count

### 3. Custom Hooks

All stores have corresponding selector hooks for optimized re-renders:

```typescript
// Auth hooks
const user = useUser();
const isAuthenticated = useIsAuthenticated();
const login = useLogin();

// Shop hooks
const shops = useShops();
const filteredShops = useFilteredShops();
const registerShop = useRegisterShop();

// Order hooks
const cart = useCart();
const cartTotal = useCartTotal();
const { addToCart, clearCart } = useCartActions();

// Route hooks
const currentRoute = useCurrentRoute();
const progress = useRouteProgress();
const { startRoute, checkInShop } = useRouteActions();

// Theme hooks
const isDark = useIsDark();
const toggleTheme = useToggleTheme();

// Notification hooks
const unreadCount = useUnreadCount();
const { markAsRead } = useNotificationActions();
```

### 4. Mock Data

Comprehensive mock data for development and testing:

- **Mock User**: Realistic sales agent profile
- **Mock Shops**: 10+ shops (various statuses)
- **Mock Orders**: 15+ orders (various statuses)
- **Mock Routes**: 5+ routes (different dates)
- **Mock Products**: 30+ products (multiple categories)
- **Mock Notifications**: 20+ notifications (all types)

```typescript
import {
  mockUser,
  mockShops,
  mockOrders,
  mockRoutes,
  mockProducts,
  mockNotifications
} from '@/store';

// Or import all at once
import mockData from '@/store';
```

## Usage Examples

### Authentication Flow

```typescript
import { useLogin, useIsAuthenticated, useUser } from '@/store';

function LoginScreen() {
  const login = useLogin();
  const isAuthenticated = useIsAuthenticated();
  const user = useUser();

  const handleLogin = async () => {
    try {
      await login(email, password);
      // Navigate to home
    } catch (error) {
      // Show error
    }
  };

  return <LoginForm onSubmit={handleLogin} />;
}
```

### Cart Management

```typescript
import { useCart, useCartActions, useCartTotal } from '@/store';

function CartScreen() {
  const cart = useCart();
  const total = useCartTotal();
  const { addToCart, removeFromCart, clearCart } = useCartActions();

  const handleAddProduct = (product: Product) => {
    addToCart(product, 1);
  };

  return (
    <View>
      {cart.map(item => (
        <CartItem
          key={item.product._id}
          item={item}
          onRemove={removeFromCart}
        />
      ))}
      <Text>Total: KES {total}</Text>
    </View>
  );
}
```

### Route Navigation

```typescript
import {
  useCurrentRoute,
  useRouteProgress,
  useRouteActions
} from '@/store';

function RouteScreen() {
  const currentRoute = useCurrentRoute();
  const progress = useRouteProgress();
  const { startRoute, checkInShop } = useRouteActions();

  const handleStartRoute = async () => {
    if (currentRoute) {
      await startRoute(currentRoute._id);
    }
  };

  return (
    <View>
      <Text>Progress: {progress}%</Text>
      <Button onPress={handleStartRoute} title="Start Route" />
    </View>
  );
}
```

### Theme Toggle

```typescript
import { useIsDark, useToggleTheme } from '@/store';

function SettingsScreen() {
  const isDark = useIsDark();
  const toggleTheme = useToggleTheme();

  return (
    <Switch
      value={isDark}
      onValueChange={toggleTheme}
    />
  );
}
```

### Offline Order Sync

```typescript
import {
  useOfflineOrders,
  useOfflineOrderCount,
  useSyncOfflineOrders
} from '@/store';
import { useNetInfo } from '@react-native-community/netinfo';

function SyncComponent() {
  const offlineOrders = useOfflineOrders();
  const offlineCount = useOfflineOrderCount();
  const syncOfflineOrders = useSyncOfflineOrders();
  const netInfo = useNetInfo();

  useEffect(() => {
    if (netInfo.isConnected && offlineCount > 0) {
      syncOfflineOrders();
    }
  }, [netInfo.isConnected]);

  return (
    <View>
      {offlineCount > 0 && (
        <Text>{offlineCount} orders pending sync</Text>
      )}
    </View>
  );
}
```

## Best Practices

### 1. Use Selector Hooks
Prefer specific selector hooks over accessing entire store:

```typescript
// Good
const user = useUser();
const isAuthenticated = useIsAuthenticated();

// Avoid (causes unnecessary re-renders)
const { user, isAuthenticated } = useAuth();
```

### 2. Handle Loading States

```typescript
const isLoading = useAuthLoading();
const error = useAuthError();

if (isLoading) return <Spinner />;
if (error) return <ErrorMessage error={error} />;
```

### 3. Clear Errors After Handling

```typescript
const error = useAuthError();
const { clearError } = useAuthStore();

useEffect(() => {
  if (error) {
    Alert.alert('Error', error);
    clearError();
  }
}, [error]);
```

### 4. Offline-First Approach

```typescript
// Order placement with offline fallback
const placeOrder = async (orderData) => {
  try {
    await placeOrderAction(orderData);
  } catch (error) {
    if (!navigator.onLine) {
      // Order automatically queued by store
      Alert.alert('Offline', 'Order will sync when online');
    } else {
      throw error;
    }
  }
};
```

### 5. Type Safety

All stores and hooks are fully typed. Use TypeScript for type safety:

```typescript
import { Shop, Order, Route } from '@/types';

const shops: Shop[] = useShops();
const orders: Order[] = useOrders();
const routes: Route[] = useRoutes();
```

## Testing

Use mock data for testing:

```typescript
import { mockUser, mockShops, mockOrders } from '@/store';

describe('ShopList', () => {
  it('renders shops', () => {
    // Use mock data
    render(<ShopList shops={mockShops} />);
    expect(screen.getByText(mockShops[0].shopName)).toBeTruthy();
  });
});
```

## Performance Optimization

1. **Selective Re-renders**: Use selector hooks to subscribe to specific state slices
2. **Memoization**: Store actions are automatically memoized by Zustand
3. **Persist Partialize**: Only essential state is persisted to storage
4. **Lazy Loading**: Routes and shops loaded on demand

## Migration from Old Stores

Old stores (`authStore.ts`, `shopStore.ts`) are replaced by new slices:

```typescript
// Old
import { useAuthStore } from '@/store/authStore';

// New
import { useAuth, useUser, useLogin } from '@/store';
```

## Troubleshooting

### State Not Persisting
- Ensure SecureStore/AsyncStorage permissions
- Check storage key uniqueness
- Verify partialize configuration

### Actions Not Working
- Check network connection for API calls
- Verify error handling in try-catch
- Check console for error logs

### Typescript Errors
- Ensure types are imported from `@/types`
- Update store type definitions if API changes
- Check for null/undefined handling

## Future Enhancements

- [ ] MMKV storage integration (faster than AsyncStorage)
- [ ] Redux DevTools integration
- [ ] Store hydration status tracking
- [ ] Optimistic UI updates
- [ ] Real-time sync with WebSockets
- [ ] State versioning for migrations

## Support

For issues or questions:
1. Check this README
2. Review store slice implementation
3. Check console logs for errors
4. Review types definitions in `@/types`
