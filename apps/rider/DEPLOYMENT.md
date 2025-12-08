# Kenix Rider App - Deployment & Testing Guide

## Quick Start Guide

### Prerequisites

1. **Development Machine**:
   - Node.js 20.15.1 or higher
   - NPM 10.7.0 or higher
   - Expo CLI: `npm install -g @expo/cli`
   - EAS CLI: `npm install -g eas-cli` (for production builds)

2. **Backend Server**:
   - Kenix backend running on `http://localhost:3001` (or your IP)
   - All API endpoints functional
   - WebSocket server active

3. **Testing Device**:
   - Android 8.0+ or iOS 13.0+
   - Expo Go app installed (for development)
   - GPS enabled
   - Camera permissions granted

### Step 1: Install Dependencies

```bash
cd apps/rider
npm install
```

### Step 2: Configure Environment

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env` and replace with your local IP:

```env
# Find your IP: Windows (ipconfig) / Mac (ifconfig)
EXPO_PUBLIC_API_URL=http://192.168.1.100:3001/api
EXPO_PUBLIC_WS_URL=http://192.168.1.100:3001
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### Step 3: Update Google Maps API Key

Edit `app.json` line 48:

```json
"googleMaps": {
  "apiKey": "YOUR_ACTUAL_GOOGLE_MAPS_API_KEY"
}
```

**Get API Key**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select project
3. Enable "Maps SDK for Android" and "Maps SDK for iOS"
4. Create API key in Credentials
5. Restrict to your app's package name: `com.kenix.rider`

### Step 4: Start Development Server

```bash
npm start
```

This will show a QR code. Scan with:
- **Android**: Expo Go app camera
- **iOS**: Camera app (opens in Expo Go)

## Testing the App

### 1. Authentication Flow

**Test Login**:
```
Email: rider@kenix.com
Password: rider123
```

**Expected Behavior**:
- ✅ Shows loading spinner during login
- ✅ Stores token securely
- ✅ Redirects to tabs on success
- ✅ Shows error alert on invalid credentials
- ✅ Auto-login on app restart

**Test Cases**:
- [ ] Valid credentials → Success
- [ ] Invalid credentials → Error message
- [ ] Empty fields → Validation error
- [ ] Network error → User-friendly message
- [ ] Token expiry → Auto-logout and redirect

### 2. Active Route Screen

**Setup**:
1. Ensure backend has created a route with deliveries assigned to rider
2. Run: `GET /api/routes/rider/{riderId}/active`

**Expected Behavior**:
- ✅ Shows current shop card (name, address, phone, order items)
- ✅ Displays "Stop X of Y" badge
- ✅ Shows map with rider location (blue) and shop (red)
- ✅ Calculates distance to shop in real-time
- ✅ "Navigate" button opens Google Maps
- ✅ "I've Arrived" disabled if >100m from shop
- ✅ "I've Arrived" enabled if ≤100m from shop
- ✅ Shows remaining deliveries count

**Test Cases**:
- [ ] No active route → Empty state message
- [ ] Active route loads on startup
- [ ] Map centers on rider and shop
- [ ] Distance updates every 5 seconds
- [ ] Geofence validation at 100m
- [ ] Navigation opens external maps app
- [ ] Pull to refresh updates data

### 3. Delivery Flow

#### Step 1: Arrival

**Test Geofencing**:
1. Walk >100m from shop location
2. Try "I've Arrived" → Should show alert "Too far from shop"
3. Walk within 100m
4. Try "I've Arrived" → Should succeed

**Expected Behavior**:
- ✅ Validates geofence before allowing arrival
- ✅ Shows distance in error message
- ✅ Updates delivery status to "arrived"
- ✅ Proceeds to payment step

**Test Cases**:
- [ ] Arrival rejected if >100m
- [ ] Arrival accepted if ≤100m
- [ ] Location sent to backend
- [ ] WebSocket emits arrival event

#### Step 2: Payment Collection

**Test M-Pesa**:
1. Select "M-Pesa" payment method
2. Verify amount is pre-filled
3. Click "Send STK Push"
4. Check shop's phone for M-Pesa prompt
5. Shop accepts payment
6. Backend emits `payment:confirmed` via WebSocket
7. App proceeds to completion

**Expected Behavior**:
- ✅ Shows M-Pesa, Cash, Airtel options
- ✅ Pre-fills order total amount
- ✅ Sends STK Push to shop's phone
- ✅ Shows waiting screen with loading animation
- ✅ Listens for WebSocket `payment:confirmed`
- ✅ Proceeds to completion on confirmation
- ✅ Shows timeout after 2 minutes if not confirmed

**Test M-Pesa Cases**:
- [ ] STK Push sent successfully
- [ ] Shop receives M-Pesa prompt
- [ ] Payment confirmation received
- [ ] Timeout after 2 minutes
- [ ] Retry on failure
- [ ] Cancel and switch to cash

**Test Cash/Airtel**:
1. Select "Cash" or "Airtel"
2. Enter amount
3. Click "Payment Received"
4. Should immediately proceed to completion

**Expected Behavior**:
- ✅ No waiting for confirmation
- ✅ Immediately proceeds to completion step

**Test Cases**:
- [ ] Cash payment recorded
- [ ] Airtel payment recorded
- [ ] Amount validation (must be > 0)

#### Step 3: Delivery Completion

**Test Signature Capture**:
1. Draw signature on canvas
2. Should see signature appear
3. Click "Clear" → Signature removed
4. Draw new signature

**Expected Behavior**:
- ✅ Canvas captures finger/stylus movements
- ✅ Signature saved as SVG path string
- ✅ Clear button resets canvas
- ✅ Shows "Signature captured" indicator

**Test Photo Capture**:
1. Click "Take Photo"
2. Grant camera permissions
3. Take photo of delivered goods
4. Photo preview shown
5. Click "Retake" to take new photo

**Expected Behavior**:
- ✅ Requests camera permissions
- ✅ Opens camera
- ✅ Shows photo preview
- ✅ Compresses image (70% quality)
- ✅ Allows retake

**Test Delivery Notes**:
1. Enter optional notes (e.g., "Left at reception")
2. Should accept multiline text

**Test Complete Delivery**:
1. Ensure signature and photo are captured
2. Click "Complete Delivery"
3. Should show success animation
4. Wallet balance updates
5. Next shop loads automatically

**Expected Behavior**:
- ✅ Validates signature exists
- ✅ Validates photo exists
- ✅ Sends all data to backend
- ✅ Shows success message
- ✅ Updates wallet balance
- ✅ Auto-loads next delivery
- ✅ Closes modal after 2 seconds

**Test Cases**:
- [ ] Signature required validation
- [ ] Photo required validation
- [ ] Notes optional
- [ ] Success animation shown
- [ ] Next shop loaded
- [ ] Wallet updated
- [ ] Transaction recorded

### 4. Background GPS Tracking

**Test Tracking Start**:
1. Login with active route
2. Check notification: "Kenix Delivery Active"
3. Location should update every 10 seconds

**Test Background Tracking**:
1. Lock phone screen
2. Wait 1 minute
3. Check backend logs → Location updates received
4. Check WebSocket → Location events emitted

**Test Tracking Stop**:
1. Complete all deliveries
2. Tracking should stop automatically
3. Notification should disappear

**Expected Behavior**:
- ✅ Starts automatically with active route
- ✅ Shows foreground notification (Android)
- ✅ Updates every 10 seconds or 50 meters
- ✅ Continues in background
- ✅ Sends to backend API
- ✅ Emits via WebSocket
- ✅ Stops when route complete

**Test Cases**:
- [ ] Tracking starts on route load
- [ ] Updates in foreground
- [ ] Updates in background
- [ ] Notification shown (Android)
- [ ] Location sent to backend
- [ ] WebSocket events emitted
- [ ] Stops on route completion
- [ ] Manual toggle in profile

### 5. Wallet Screen

**Test Balance Display**:
1. Complete a delivery
2. Check wallet → Balance should update
3. Negative balance = rider owes Kenix
4. Positive balance = Kenix owes rider

**Expected Behavior**:
- ✅ Shows current balance prominently
- ✅ Red color for negative (owe)
- ✅ Green color for positive (owed)
- ✅ Today's deliveries count
- ✅ Amount collected today
- ✅ Progress bar
- ✅ Transaction history

**Test Transaction History**:
1. Each delivery creates transaction
2. Shows type, amount, timestamp, balance after
3. Recent transactions at top

**Test Cases**:
- [ ] Balance updates after delivery
- [ ] Today's stats accurate
- [ ] Transactions list populated
- [ ] Transaction types correct
- [ ] Pull to refresh works

### 6. Profile Screen

**Test Stats Display**:
1. Complete deliveries
2. Check stats update in real-time

**Expected Behavior**:
- ✅ Shows today's deliveries
- ✅ Shows amount collected
- ✅ Shows average time per delivery
- ✅ Shows weekly performance
- ✅ Shows rider info

**Test Settings**:
1. Toggle GPS tracking on/off
2. Toggle notifications on/off

**Test Logout**:
1. Click "Logout"
2. Shows confirmation alert
3. On confirm: stops GPS, clears token, redirects to login

**Test Cases**:
- [ ] Stats update in real-time
- [ ] GPS toggle works
- [ ] Notifications toggle works
- [ ] Logout confirmation shown
- [ ] Logout clears auth state
- [ ] Redirects to login

## Production Build

### Android APK Build

```bash
# Configure EAS
eas login
eas build:configure

# Build preview APK (for testing)
eas build --platform android --profile preview

# Download and install on device
# Find build in: https://expo.dev/accounts/[your-account]/projects/kenix-rider/builds
```

### Google Play Store Build

```bash
# Build production bundle
eas build --platform android --profile production

# Submit to Google Play
eas submit --platform android
```

### iOS Build

```bash
# Build for TestFlight
eas build --platform ios --profile preview

# Build for App Store
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

## Production Checklist

### Before Production

- [ ] Update API URLs to production server
- [ ] Add production Google Maps API key
- [ ] Configure app signing keys
- [ ] Set up error tracking (Sentry, Bugsnag)
- [ ] Test on multiple devices
- [ ] Test offline scenarios
- [ ] Test poor network conditions
- [ ] Verify all permissions granted
- [ ] Check battery usage
- [ ] Optimize image sizes
- [ ] Enable ProGuard (Android)
- [ ] Enable code obfuscation

### Production Environment Variables

```bash
# Set in EAS secrets
eas secret:create --name EXPO_PUBLIC_API_URL --value "https://api.kenix.com/api"
eas secret:create --name EXPO_PUBLIC_WS_URL --value "https://api.kenix.com"
eas secret:create --name GOOGLE_MAPS_API_KEY --value "your_production_key"
```

### App Store Requirements

**Android (Google Play)**:
- Min SDK: 26 (Android 8.0)
- Target SDK: 34 (Android 14)
- Package: com.kenix.rider
- Icon: 512x512 PNG
- Screenshots: 5+ in various sizes
- Privacy policy URL required

**iOS (App Store)**:
- Min iOS: 13.0
- Bundle ID: com.kenix.rider
- Icon: 1024x1024 PNG
- Screenshots: 5+ for each device size
- Privacy policy URL required
- Location usage description

## Monitoring & Analytics

### Crash Reporting

Install Sentry:

```bash
npm install @sentry/react-native
```

Configure in `app/_layout.tsx`:

```typescript
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'your-sentry-dsn',
  environment: process.env.NODE_ENV,
});
```

### Usage Analytics

Install Firebase Analytics:

```bash
npx expo install @react-native-firebase/app @react-native-firebase/analytics
```

Track key events:
- Login success/failure
- Delivery started
- Delivery completed
- Payment method used
- App crashes

## Common Issues & Solutions

### Issue: Map not showing
**Solution**: Verify Google Maps API key, enable billing, check permissions

### Issue: GPS not tracking in background
**Solution**: Check background location permission granted, verify notification shown

### Issue: M-Pesa payment timeout
**Solution**: Check WebSocket connection, verify backend emits event, check shop's phone

### Issue: App crashes on startup
**Solution**: Clear cache (`npx expo start -c`), reinstall dependencies

### Issue: Photos not uploading
**Solution**: Check camera permissions, verify image compression, check network

### Issue: Signature not capturing
**Solution**: Update react-native-svg, check PanResponder handlers

## Support

For issues or questions:
- Backend: Check `G:\Waks\Kenix\commodies\apps\backend\README.md`
- Frontend: Check `G:\Waks\Kenix\commodies\apps\rider\README.md`
- Email: dev@kenix.com
