# Store Quick Reference Guide

Quick access to common store operations and hooks.

## Common Imports

```typescript
// Stores
import {
  useAuthStore,
  useShopStore,
  useOrderStore,
  useRouteStore,
  useThemeStore,
  useNotificationStore
} from '@/store';

// Hooks
import {
  useUser,
  useShops,
  useCart,
  useCurrentRoute,
  useIsDark,
  useNotifications
} from '@/store';

// Mock Data
import { mockUser, mockShops, mockOrders } from '@/store';
```

## Authentication

```typescript
// Login
const login = useLogin();
await login('email@example.com', 'password');

// Check if authenticated
const isAuthenticated = useIsAuthenticated();

// Get current user
const user = useUser();

// Logout
const logout = useLogout();
await logout();

// Get user ID
const userId = useUserId();
```

## Shop Management

```typescript
// Get all shops
const shops = useShops();

// Get filtered shops
const filteredShops = useFilteredShops();

// Register new shop
const registerShop = useRegisterShop();
await registerShop(kycFormData);

// Set filter
const setFilter = useSetShopFilter();
setFilter('approved'); // 'pending' | 'approved' | 'rejected' | 'all'

// Get shop counts
const counts = useShopsCountByStatus();
// { total: 10, pending: 2, approved: 6, rejected: 1 }
```

## Order & Cart

```typescript
// Cart operations
const { addToCart, removeFromCart, updateQuantity, clearCart } = useCartActions();

addToCart(product, quantity);
removeFromCart(productId);
updateQuantity(productId, newQuantity);
clearCart();

// Cart state
const cart = useCart();
const total = useCartTotal();
const itemCount = useCartItemCount();
const isEmpty = useIsCartEmpty();

// Place order
const { placeOrder } = useOrderActions();
await placeOrder(orderFormData);

// Get orders
const orders = useOrders();
const todaysOrders = useTodaysOrders();

// Offline orders
const offlineCount = useOfflineOrderCount();
const syncOrders = useSyncOfflineOrders();
await syncOrders(); // Sync when online
```

## Route Navigation

```typescript
// Get today's route
const currentRoute = useCurrentRoute();

// Route actions
const {
  startRoute,
  pauseRoute,
  resumeRoute,
  completeRoute,
  checkInShop,
  checkOutShop
} = useRouteActions();

// Start route
await startRoute(routeId);

// Check in at shop
await checkInShop({
  routeId,
  shopId,
  location: { latitude, longitude },
  timestamp: new Date().toISOString(),
  withinGeofence: true
});

// Check out from shop
await checkOutShop({
  routeId,
  shopId,
  visitStatus: 'visited',
  orderPlaced: true,
  orderId: 'order-123',
  timestamp: new Date().toISOString(),
  duration: 25 // minutes
});

// Route progress
const progress = useRouteProgress(); // 0-100
const currentShop = useCurrentShop();
const nextShop = useNextShop();

// Route status
const isActive = useIsRouteActive();
const isPaused = useIsRoutePaused();
```

## Theme

```typescript
// Get theme state
const isDark = useIsDark();
const mode = useThemeMode(); // 'light' | 'dark' | 'system'

// Toggle theme
const toggleTheme = useToggleTheme();
toggleTheme();

// Set specific theme
const setTheme = useSetTheme();
setTheme('dark'); // 'light' | 'dark' | 'system'

// Check theme type
const isLight = useIsLightMode();
const isDarkMode = useIsDarkMode();
const isSystem = useIsSystemTheme();
```

## Notifications

```typescript
// Get notifications
const notifications = useNotifications();
const unreadNotifications = useUnreadNotifications();

// Unread count
const unreadCount = useUnreadCount();
const hasUnread = useHasUnreadNotifications();

// Notification actions
const { markAsRead, markAllAsRead, deleteNotification } = useNotificationActions();

await markAsRead(notificationId);
await markAllAsRead(userId);
await deleteNotification(notificationId);

// Filter notifications
const shopNotifs = useNotificationsByType('shop_approved');
const urgentNotifs = useUrgentNotifications();
const highPriority = useHighPriorityNotifications();

// Today's notifications
const todaysNotifs = useTodaysNotifications();
```

## Loading & Error States

```typescript
// Auth
const authLoading = useAuthLoading();
const authError = useAuthError();

// Shop
const shopLoading = useShopLoading();
const shopError = useShopError();

// Order
const orderLoading = useOrderLoading();
const orderError = useOrderError();

// Route
const routeLoading = useRouteLoading();
const routeError = useRouteError();

// Notification
const notifLoading = useNotificationLoading();
const notifError = useNotificationError();

// Clear errors
const { clearError } = useAuthStore();
clearError();
```

## Mock Data Access

```typescript
import {
  mockUser,
  mockShops,
  mockOrders,
  mockRoutes,
  mockProducts,
  mockNotifications
} from '@/store';

// Use in components
<UserProfile user={mockUser} />
<ShopList shops={mockShops} />
<OrderHistory orders={mockOrders} />
<RouteMap route={mockRoutes[0]} />
<ProductGrid products={mockProducts} />
<NotificationList notifications={mockNotifications} />
```

## Common Patterns

### Authentication Flow
```typescript
function LoginScreen() {
  const login = useLogin();
  const isLoading = useAuthLoading();
  const error = useAuthError();

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      // Navigate to home
    } catch (err) {
      // Error already in state
      Alert.alert('Error', error || 'Login failed');
    }
  };

  if (isLoading) return <Spinner />;

  return <LoginForm onSubmit={handleLogin} />;
}
```

### Cart with Total
```typescript
function CartScreen() {
  const cart = useCart();
  const total = useCartTotal();
  const { removeFromCart, updateQuantity, clearCart } = useCartActions();
  const { placeOrder } = useOrderActions();
  const isLoading = useOrderLoading();

  const handleCheckout = async () => {
    const orderData = {
      shopId: selectedShop._id,
      products: cart.map(item => ({
        productId: item.product._id,
        quantity: item.quantity,
        price: item.product.wholePrice
      })),
      paymentMethod: 'mpesa'
    };

    await placeOrder(orderData);
    clearCart();
  };

  return (
    <View>
      <FlatList
        data={cart}
        renderItem={({ item }) => (
          <CartItem
            item={item}
            onRemove={removeFromCart}
            onUpdateQuantity={updateQuantity}
          />
        )}
      />
      <Text>Total: KES {total}</Text>
      <Button
        title="Checkout"
        onPress={handleCheckout}
        loading={isLoading}
        disabled={cart.length === 0}
      />
    </View>
  );
}
```

### Route Progress Tracker
```typescript
function RouteTracker() {
  const currentRoute = useCurrentRoute();
  const progress = useRouteProgress();
  const currentShop = useCurrentShop();
  const nextShop = useNextShop();
  const { checkInShop, checkOutShop } = useRouteActions();
  const isActive = useIsRouteActive();

  const handleCheckIn = async () => {
    const location = await getCurrentLocation();
    await checkInShop({
      routeId: currentRoute._id,
      shopId: currentShop.shop._id,
      location,
      timestamp: new Date().toISOString(),
      withinGeofence: true
    });
  };

  if (!currentRoute) return <NoRouteCard />;

  return (
    <View>
      <ProgressBar value={progress} />
      <Text>{progress}% Complete</Text>
      {currentShop && (
        <CurrentShopCard
          shop={currentShop}
          onCheckIn={handleCheckIn}
        />
      )}
      {nextShop && <NextShopCard shop={nextShop} />}
    </View>
  );
}
```

### Offline Order Sync
```typescript
function OfflineSyncIndicator() {
  const offlineCount = useOfflineOrderCount();
  const syncOrders = useSyncOfflineOrders();
  const netInfo = useNetInfo();
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (netInfo.isConnected && offlineCount > 0 && !syncing) {
      setSyncing(true);
      syncOrders().finally(() => setSyncing(false));
    }
  }, [netInfo.isConnected, offlineCount]);

  if (offlineCount === 0) return null;

  return (
    <View>
      <Icon name={syncing ? 'sync' : 'cloud-offline'} />
      <Text>
        {syncing
          ? 'Syncing orders...'
          : `${offlineCount} orders pending sync`}
      </Text>
    </View>
  );
}
```

### Theme Toggle
```typescript
function ThemeToggle() {
  const isDark = useIsDark();
  const toggleTheme = useToggleTheme();

  return (
    <Switch
      value={isDark}
      onValueChange={toggleTheme}
      thumbColor={isDark ? '#3b82f6' : '#f3f4f6'}
      trackColor={{ false: '#d1d5db', true: '#1e40af' }}
    />
  );
}
```

### Notification Badge
```typescript
function NotificationBell() {
  const unreadCount = useUnreadCount();
  const navigation = useNavigation();

  return (
    <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
      <Icon name="bell" size={24} />
      {unreadCount > 0 && (
        <Badge count={unreadCount} />
      )}
    </TouchableOpacity>
  );
}
```

## Debugging

```typescript
// Enable detailed logging (development only)
import { actionLogger, errorLogger } from '@/store';

// Log specific actions
actionLogger('MyComponent', 'buttonPressed', { data });

// Log errors
try {
  await someAction();
} catch (error) {
  errorLogger('MyComponent', 'someAction', error);
}

// Check store state
const state = useAuthStore.getState();
console.log('Current auth state:', state);
```

## Type Definitions

```typescript
// Import types
import type {
  SalesAgent,
  Shop,
  Order,
  Route,
  Product,
  Notification
} from '@/types';

// Use with hooks
const user: SalesAgent | null = useUser();
const shops: Shop[] = useShops();
const orders: Order[] = useOrders();
const route: Route | null = useCurrentRoute();
```

## Performance Tips

1. **Use Selector Hooks**: Prefer specific selectors over entire store
   ```typescript
   // Good - only re-renders when user changes
   const user = useUser();

   // Avoid - re-renders on any auth state change
   const { user } = useAuth();
   ```

2. **Memoize Callbacks**: Use useCallback for action handlers
   ```typescript
   const handleAddToCart = useCallback((product: Product) => {
     addToCart(product, 1);
   }, [addToCart]);
   ```

3. **Lazy Load Data**: Fetch data only when needed
   ```typescript
   useEffect(() => {
     if (userId) {
       fetchShops(userId);
     }
   }, [userId, fetchShops]);
   ```

4. **Debounce Search**: For real-time filtering
   ```typescript
   const debouncedSetFilter = useMemo(
     () => debounce(setFilter, 300),
     [setFilter]
   );
   ```
