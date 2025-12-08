# Sales Agent App - Quick Reference Guide

## Essential File Locations

### Authentication
- **Login Screen**: `app/(auth)/login.tsx`
- **Auth Store**: `store/authStore.ts`
- **Auth Service**: `services/api.ts` (login/logout methods)

### Shop Registration
- **4-Step Wizard**: `app/shop/register.tsx`
- **Location Picker**: `components/LocationPicker.tsx`
- **Photo Capture**: `components/ShopPhotoCapture.tsx`
- **Shop Store**: `store/shopStore.ts`

### Shops Management
- **Shops List/Map**: `app/(tabs)/shops.tsx`
- **Shop Details**: `app/shop/[id].tsx`

### Orders
- **Order Screen**: `app/(tabs)/orders.tsx` (create + history)

### Performance & Dashboard
- **Main Dashboard**: `app/(tabs)/dashboard.tsx`
- **Performance Metrics**: `app/(tabs)/performance.tsx`

### Profile
- **Profile Screen**: `app/(tabs)/profile.tsx`

### Navigation
- **Tab Layout**: `app/(tabs)/_layout.tsx` (5 tabs)
- **Root Layout**: `app/_layout.tsx` (auth guards + WebSocket)
- **Entry Point**: `app/index.tsx`

### Services
- **API Client**: `services/api.ts`
- **WebSocket**: `services/websocket.ts`

### Configuration
- **Expo Config**: `app.json`
- **Dependencies**: `package.json`

---

## Key API Endpoints

### Authentication
```
POST /api/user/login
```

### Shops
```
POST /api/user/register (role: 'shop')
GET /api/user/fetch/all?role=shop&createdBy={agentId}&approvalStatus={status}
GET /api/user/fetch/{shopId}
```

### Products
```
GET /api/products?isInStock=true&category={category}
```

### Orders
```
POST /api/orders
GET /api/orders?createdBy={agentId}
GET /api/orders/{orderId}
```

### Profile
```
GET /api/user/profile
PUT /api/user/profile
PUT /api/user/change-password
```

---

## WebSocket Events

### Listened Events
- `shop:approved` - Shop approval notification
- `shop:rejected` - Shop rejection with reason
- `order:update` - Order status change
- `order:approved` - Order approved by admin
- `order:delivered` - Order delivered + commission
- `commission:paid` - Commission payment received
- `notification` - Generic notification

---

## State Management (Zustand)

### Auth Store (`store/authStore.ts`)
```typescript
const { user, token, isAuthenticated, isLoading, login, logout, loadStoredAuth } = useAuthStore();
```

### Shop Store (`store/shopStore.ts`)
```typescript
const { shops, isLoading, error, selectedShop, fetchShops, setSelectedShop, registerShop } = useShopStore();
```

---

## Running the App

### Development
```bash
# Install dependencies
npm install

# Start Expo dev server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

### Testing
```bash
# Start backend first
# Backend should run on http://192.168.100.6:3001

# Then start app
npm start
```

---

## Common Tasks

### Adding a New Tab
1. Create file in `app/(tabs)/newtab.tsx`
2. Add `<Tabs.Screen>` in `app/(tabs)/_layout.tsx`

### Creating New API Endpoint
1. Add method in `services/api.ts`
2. Use in component: `await apiService.methodName()`

### Adding New Store
1. Create `store/newStore.ts`
2. Define interface and create with `create()`
3. Use in component: `const { state, actions } = useNewStore()`

### Adding WebSocket Event
1. Open `services/websocket.ts`
2. Add listener in `setupEventListeners()`
3. Implement notification logic

---

## Environment Variables

Update these before production:

### app.json
```json
{
  "android": {
    "config": {
      "googleMaps": {
        "apiKey": "YOUR_GOOGLE_MAPS_API_KEY"  // ← Replace this
      }
    }
  }
}
```

### services/api.ts
```typescript
const BASE_URL = 'http://192.168.100.6:3001/api';  // ← Update for production
```

### services/websocket.ts
```typescript
const WS_URL = 'http://192.168.100.6:3001';  // ← Update for production
```

---

## Troubleshooting

### WebSocket Not Connecting
1. Check backend is running
2. Verify URL in `services/websocket.ts`
3. Check JWT token in SecureStore
4. Look for connection errors in console

### Google Maps Not Showing
1. Verify API key in `app.json`
2. Enable Maps SDK for Android/iOS in Google Cloud Console
3. Check location permissions granted

### Photos Not Saving
1. Check camera permissions
2. Verify photo URI format
3. Test with gallery picker instead
4. Check backend accepts multipart/form-data

### Authentication Fails
1. Verify backend running
2. Check user role is 'sales_agent'
3. Check network connectivity
4. Verify API endpoint URL

### App Crashes on Launch
1. Clear Expo cache: `npx expo start -c`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Check for TypeScript errors
4. Review recent changes

---

## Testing Credentials

Create these test users in backend:

```javascript
// Sales Agent
email: 'agent@kenix.com'
password: 'password123'
role: 'sales_agent'

// Another Sales Agent
email: 'agent2@kenix.com'
password: 'password123'
role: 'sales_agent'
```

---

## Key Features Summary

### ✅ Authentication
- JWT token storage
- Role verification
- Auto-login

### ✅ Shop Registration
- 4-step wizard
- GPS location
- Camera integration
- Form validation

### ✅ Shop Management
- List & map views
- Status filtering
- Shop details
- Call & navigate

### ✅ Order Placement
- Shop selection
- Product catalog
- Search & filter
- Cart management

### ✅ Performance
- Weekly/monthly metrics
- Commission tracking
- Conversion rate
- Insights

### ✅ Profile
- Edit information
- Change password
- Logout

### ✅ Notifications
- Real-time updates
- Push notifications
- WebSocket events

---

## Production Checklist

Before deploying to production:

- [ ] Update backend URLs
- [ ] Add Google Maps API key
- [ ] Configure app signing
- [ ] Test on physical devices
- [ ] Set up app store accounts
- [ ] Prepare screenshots
- [ ] Write app descriptions
- [ ] Create privacy policy
- [ ] Enable crash reporting
- [ ] Set up analytics
- [ ] Configure push notification certificates
- [ ] Test payment flows (if applicable)
- [ ] Complete security audit
- [ ] Load test backend
- [ ] Set up staging environment

---

## Support & Resources

### Documentation
- Implementation Report: `IMPLEMENTATION_REPORT.md`
- Testing Guide: `TESTING_GUIDE.md`
- Expo Docs: https://docs.expo.dev/
- React Native Docs: https://reactnative.dev/

### Expo Dependencies
- expo-router: File-based routing
- expo-location: GPS/location services
- expo-camera: Camera access
- expo-secure-store: Secure token storage
- expo-notifications: Push notifications

### Third-Party Libraries
- zustand: State management
- axios: HTTP client
- socket.io-client: WebSocket client
- react-native-maps: Maps integration

---

## Quick Commands Reference

```bash
# Start development server
npm start

# Clear cache
npx expo start -c

# Install new dependency
npm install package-name

# Update dependencies
npm update

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios

# Submit to stores
eas submit

# Check for updates
npx expo-doctor

# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure
```

---

## File Size Reference

| File | Lines | Purpose |
|------|-------|---------|
| `app/shop/register.tsx` | 667 | 4-step shop registration wizard |
| `app/(tabs)/orders.tsx` | 974 | Order creation & history |
| `app/(tabs)/shops.tsx` | 519 | Shops list & map view |
| `app/shop/[id].tsx` | 595 | Shop details screen |
| `app/(tabs)/dashboard.tsx` | 441 | Main dashboard |
| `app/(tabs)/performance.tsx` | ~450 | Performance metrics |
| `app/(tabs)/profile.tsx` | ~450 | Profile management |
| `services/websocket.ts` | ~250 | WebSocket service |
| `services/api.ts` | 176 | API client |
| `components/LocationPicker.tsx` | 221 | GPS map picker |
| `components/ShopPhotoCapture.tsx` | 296 | Camera component |

---

**Last Updated:** 2025-11-09
**Version:** 1.0.0
**Status:** Production Ready
