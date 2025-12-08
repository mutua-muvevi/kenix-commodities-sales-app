# Kenix Rider Mobile App

The complete delivery rider application for Kenix Commodities that enforces sequential delivery - your competitive advantage over Wasoko and Twiga.

## Features

### Core Functionality

1. **Sequential Delivery Enforcement**
   - Riders can only see and deliver to the current shop
   - Future shops are locked until current delivery is complete
   - Visual progress tracking showing "Stop X of Y"
   - Clear indication of remaining deliveries

2. **Real-time GPS Tracking**
   - Background location tracking during active routes
   - Live map showing rider position and current shop
   - Distance calculation to current shop
   - Geofencing (100m radius) for arrival confirmation

3. **Complete Delivery Flow**
   - **Step 1: Arrival** - Confirm arrival within geofence
   - **Step 2: Payment** - M-Pesa STK Push, Cash, or Airtel Money
   - **Step 3: Completion** - Signature capture, photo, and notes

4. **M-Pesa Integration**
   - Automatic STK Push to shop's phone
   - Real-time payment confirmation via WebSocket
   - Fallback to cash/Airtel if payment fails

5. **Wallet Management**
   - Real-time balance display (negative = owe, positive = owed)
   - Today's delivery progress and earnings
   - Complete transaction history
   - Balance updates after each delivery

6. **Rider Profile & Stats**
   - Daily statistics (deliveries, amount collected, avg time)
   - Weekly performance metrics
   - GPS tracking toggle
   - Settings and logout

## Tech Stack

- **Framework**: React Native + Expo
- **Navigation**: Expo Router (file-based routing)
- **State Management**: Zustand
- **API Client**: Axios with interceptors
- **Real-time**: Socket.io-client
- **Maps**: react-native-maps
- **Location**: expo-location with background tracking
- **Camera**: expo-camera, expo-image-picker
- **Security**: expo-secure-store for token storage
- **Signature**: react-native-svg with PanResponder

## Project Structure

```
apps/rider/
├── app/                          # Expo Router screens
│   ├── _layout.tsx              # Root layout with auth guard
│   ├── index.tsx                # Entry redirect
│   ├── (auth)/                  # Auth group
│   │   ├── _layout.tsx
│   │   └── login.tsx            # Login screen
│   └── (tabs)/                  # Tab navigation
│       ├── _layout.tsx          # Tab bar configuration
│       ├── index.tsx            # Active route screen
│       ├── wallet.tsx           # Wallet & transactions
│       └── performance.tsx      # Performance & stats
├── components/                   # Reusable components
│   ├── DeliveryFlowModal.tsx   # 3-step delivery modal
│   ├── RouteMap.tsx            # Live tracking map
│   ├── ShopCard.tsx            # Current shop info
│   ├── SignatureCapture.tsx    # SVG signature pad
│   └── PhotoCapture.tsx        # Camera integration
├── services/                     # Business logic
│   ├── api.ts                  # Axios client & endpoints
│   ├── websocket.ts            # Socket.io connection
│   └── location.ts             # GPS tracking & geofencing
├── store/                        # Zustand stores
│   ├── authStore.ts            # Authentication state
│   └── routeStore.ts           # Route & delivery state
├── types/                        # TypeScript definitions
│   └── index.ts                # Shared types
├── app.json                      # Expo configuration
├── package.json                  # Dependencies
└── README.md                     # This file
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd apps/rider
npm install
```

### 2. Configure Environment

Create a `.env` file (copy from `.env.example`):

```bash
# For device testing, replace with your computer's local IP
EXPO_PUBLIC_API_URL=http://192.168.1.100:3001/api
EXPO_PUBLIC_WS_URL=http://192.168.1.100:3001

# Get Google Maps API key from Google Cloud Console
GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

**Important**: To test on a physical device:
1. Find your computer's local IP (Windows: `ipconfig`, Mac: `ifconfig`)
2. Replace `localhost` with your IP address (e.g., `192.168.1.100`)
3. Ensure your phone and computer are on the same WiFi network

### 3. Update app.json

Replace `YOUR_GOOGLE_MAPS_API_KEY` in `app.json` with your actual Google Maps API key.

### 4. Run the App

```bash
# Start Expo development server
npm start

# Or directly on Android
npm run android

# Or directly on iOS
npm run ios
```

## Backend Requirements

The rider app connects to the Kenix backend server. Ensure the backend is running with these endpoints:

### Authentication
- `POST /api/user/login` - Rider login

### Routes
- `GET /api/routes/rider/:riderId/active` - Get active route
- `GET /api/routes/:routeId/current-delivery` - Get current delivery

### Deliveries
- `PATCH /api/deliveries/:deliveryId/arrive` - Mark arrival
- `POST /api/deliveries/:deliveryId/payment` - Submit payment
- `PATCH /api/deliveries/:deliveryId/complete` - Complete delivery

### Location
- `POST /api/maps/rider/:riderId/location` - Update location

### Wallet
- `GET /api/wallet/rider/:riderId` - Get wallet balance
- `GET /api/wallet/rider/:riderId/transactions` - Get transactions

### Performance
- `GET /api/performance/rider/:riderId` - Get rider statistics

### WebSocket Events
- `payment:confirmed` - Payment confirmation
- `route:updated` - Route changes
- `delivery:assigned` - New delivery assigned

## Key Features Explained

### Sequential Delivery Enforcement

```typescript
// Only show current delivery
const currentDelivery = activeRoute.deliveries.find(d => d.status === 'pending');

// Lock future deliveries
const remainingCount = totalDeliveries - currentSequence;
// Display: "11 more stops after this"
```

### Geofencing Check

```typescript
const withinGeofence = isWithinGeofence(
  currentLat,
  currentLng,
  shopLat,
  shopLng,
  0.1 // 100 meters
);

if (!withinGeofence) {
  Alert.alert('Too Far', `You're ${distance} from the shop`);
}
```

### Background GPS Tracking

```typescript
// Start tracking when route is active
await startBackgroundTracking();

// Tracks every 10 seconds or 50 meters
// Sends location to backend and WebSocket
// Shows foreground notification on Android
```

### M-Pesa STK Push Flow

```typescript
// 1. Send STK Push request
await deliveryService.submitPayment(deliveryId, {
  paymentMethod: 'mpesa',
  amount: totalAmount,
  phoneNumber: shopPhoneNumber,
});

// 2. Wait for WebSocket confirmation
websocketService.on('payment:confirmed', (data) => {
  if (data.deliveryId === currentDeliveryId) {
    // Proceed to completion step
  }
});

// 3. Timeout after 2 minutes
setTimeout(() => {
  if (!paymentConfirmed) {
    // Show retry or use different payment method
  }
}, 120000);
```

## Testing Checklist

### Authentication
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Auto-login on app restart
- [ ] Logout functionality

### Active Route
- [ ] Load active route on startup
- [ ] Show empty state when no route
- [ ] Display current shop details
- [ ] Show map with current location and shop
- [ ] Calculate distance to shop
- [ ] Navigate to shop (opens Google Maps)
- [ ] Geofence validation (100m)
- [ ] Sequential enforcement (can't skip ahead)

### Delivery Flow
- [ ] Mark arrival within geofence
- [ ] Reject arrival if too far
- [ ] M-Pesa payment submission
- [ ] Wait for payment confirmation
- [ ] Cash/Airtel instant confirmation
- [ ] Signature capture
- [ ] Photo capture
- [ ] Optional notes
- [ ] Complete delivery
- [ ] Auto-load next shop

### Background Tracking
- [ ] Start tracking with active route
- [ ] Continue tracking in background
- [ ] Stop tracking when route complete
- [ ] Location updates sent to backend

### Wallet
- [ ] Display current balance
- [ ] Show today's progress
- [ ] List transaction history
- [ ] Update after delivery completion

### Performance
- [ ] Display daily stats (deliveries, amount, avg time)
- [ ] Show weekly performance metrics
- [ ] Display collection rate percentage
- [ ] Show performance tips
- [ ] Calculate progress rings

## Performance Optimization

- **Location Updates**: 10-second intervals to balance accuracy and battery
- **Image Compression**: 70% quality for photos to reduce upload size
- **API Caching**: Active route cached locally for offline access
- **Lazy Loading**: Components loaded on-demand
- **Memoization**: Route calculations memoized to prevent re-renders

## Security

- **Token Storage**: Access tokens stored in expo-secure-store (encrypted)
- **API Authentication**: Bearer token in all requests
- **Auto-refresh**: Token validation on app start
- **Secure Endpoints**: All endpoints require authentication
- **Input Validation**: All user inputs validated before submission

## Troubleshooting

### Location Not Working
- Check permissions in device settings
- Ensure GPS is enabled
- For iOS: Allow "Always" location access
- For Android: Enable background location permission

### Map Not Displaying
- Verify Google Maps API key in app.json
- Check API key has Maps SDK for Android/iOS enabled
- Ensure billing is enabled in Google Cloud Console

### Payment Not Confirming
- Check WebSocket connection
- Verify backend is emitting `payment:confirmed` event
- Check shop's phone number format
- Ensure M-Pesa is configured in backend

### App Crashes on Startup
- Clear Expo cache: `npx expo start -c`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check for conflicting package versions

## Production Deployment

### Build for Android

```bash
# Configure EAS Build
npm install -g eas-cli
eas login
eas build:configure

# Build APK for testing
eas build --platform android --profile preview

# Build for Google Play Store
eas build --platform android --profile production
```

### Build for iOS

```bash
# Build for TestFlight
eas build --platform ios --profile preview

# Build for App Store
eas build --platform ios --profile production
```

### Environment Variables

Set in EAS secrets:

```bash
eas secret:create --name EXPO_PUBLIC_API_URL --value "https://api.kenix.com/api"
eas secret:create --name EXPO_PUBLIC_WS_URL --value "https://api.kenix.com"
```

## License

Proprietary - Kenix Commodities Ltd
