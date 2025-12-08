# Configuration Guide

## Required Configuration Before Running

### 1. Backend API URL

**File**: `services/api.ts`

Update the BASE_URL constant with your backend server IP address:

```typescript
const BASE_URL = 'http://YOUR_IP:3001/api';
```

**How to find your IP:**

**Windows:**
```bash
ipconfig
# Look for "IPv4 Address" under your active network adapter
```

**macOS/Linux:**
```bash
ifconfig
# or
ip addr show
# Look for inet address (e.g., 192.168.x.x)
```

**Example:**
```typescript
const BASE_URL = 'http://192.168.100.6:3001/api';
```

### 2. Google Maps API Key (Android)

**File**: `app.json`

Replace the placeholder with your actual Google Maps API key:

```json
{
  "expo": {
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_ACTUAL_GOOGLE_MAPS_API_KEY"
        }
      }
    }
  }
}
```

**Getting a Google Maps API Key:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable these APIs:
   - Maps SDK for Android
   - Maps SDK for iOS (if building for iOS)
4. Go to "Credentials" → "Create Credentials" → "API Key"
5. Copy the API key
6. Restrict the key to your app (optional but recommended)

### 3. Environment-Specific Configuration

For different environments (dev, staging, production), you can create multiple configuration files:

**Create**: `services/config.ts`
```typescript
const ENV = {
  dev: {
    apiUrl: 'http://192.168.100.6:3001/api',
  },
  staging: {
    apiUrl: 'http://staging.kenix.com/api',
  },
  production: {
    apiUrl: 'https://api.kenix.com/api',
  },
};

const currentEnv = __DEV__ ? 'dev' : 'production';

export default ENV[currentEnv];
```

Then update `services/api.ts`:
```typescript
import config from './config';

const BASE_URL = config.apiUrl;
```

## Optional Configuration

### 1. App Icons and Splash Screen

Replace default assets in `assets/` directory:

- `icon.png` - App icon (1024x1024)
- `adaptive-icon.png` - Android adaptive icon (1024x1024)
- `splash-icon.png` - Splash screen image
- `favicon.png` - Web favicon (48x48)

Use [Expo Asset Generator](https://www.npmjs.com/package/expo-asset-generator) to generate all sizes.

### 2. App Name and Bundle Identifiers

**File**: `app.json`

Update if needed:
```json
{
  "expo": {
    "name": "Kenix Sales Agent",
    "slug": "sales-agent",
    "ios": {
      "bundleIdentifier": "com.kenix.salesagent"
    },
    "android": {
      "package": "com.kenix.salesagent"
    }
  }
}
```

### 3. Notification Configuration

If you want to add push notifications later:

1. Install expo-notifications (already installed)
2. Add to `app.json`:
```json
{
  "expo": {
    "notification": {
      "icon": "./assets/notification-icon.png",
      "color": "#22c55e",
      "androidMode": "default"
    }
  }
}
```

### 4. Deep Linking

Already configured with scheme: `kenix-sales-agent://`

To open app from links:
```
kenix-sales-agent://shop/123
kenix-sales-agent://orders/create
```

## Build Configuration

### Development Build

For features requiring native code (camera, maps):

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for Android
eas build --platform android --profile development

# Build for iOS
eas build --platform ios --profile development
```

### Production Build

```bash
# Android APK
eas build --platform android --profile production

# iOS IPA
eas build --platform ios --profile production
```

## Testing Configuration

### Test Credentials

Create test accounts in your backend:

```
Sales Agent:
Email: agent@kenix.com
Password: [secure password]
Role: sales_agent

Shop:
Email: shop@kenix.com
Password: [secure password]
Role: shop
Status: approved
```

### Mock Data

For testing without backend, you can temporarily modify API service to return mock data:

```typescript
// services/api.ts - Development mode only
async getMyShops(agentId: string) {
  if (__DEV__) {
    return {
      users: [
        {
          _id: '1',
          shopName: 'Test Shop',
          name: 'John Doe',
          phoneNumber: '+254712345678',
          approvalStatus: 'approved',
          location: { coordinates: [36.8172, -1.2864] },
        },
      ],
    };
  }
  // ... actual API call
}
```

## Security Configuration

### 1. Token Security

Already implemented:
- Tokens stored in SecureStore (encrypted)
- HTTPS recommended for production
- Token refresh on 401

### 2. API Security

Ensure backend has:
- CORS configured for your app
- Rate limiting
- Input validation
- SQL injection prevention

### 3. Data Privacy

- No sensitive data logged in production
- Camera photos stored locally (not in cloud)
- Location data only sent to your backend

## Performance Configuration

### 1. Image Optimization

Already configured:
- Camera quality: 0.7 (line 18 in ShopPhotoCapture.tsx)
- Can adjust in `components/ShopPhotoCapture.tsx`:
```typescript
const result = await camera.takePictureAsync({
  quality: 0.7, // 0-1, lower = smaller file
  base64: false,
});
```

### 2. Network Timeout

Already configured in `services/api.ts`:
```typescript
axios.create({
  timeout: 30000, // 30 seconds
});
```

Adjust if needed for slower connections.

### 3. Caching

To add caching:
```bash
npm install @react-native-async-storage/async-storage
```

Then cache shop data:
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cache shops
await AsyncStorage.setItem('shops', JSON.stringify(shops));

// Retrieve cached shops
const cached = await AsyncStorage.getItem('shops');
```

## Troubleshooting Configuration

### Issue: Maps not showing

**Solution:**
1. Add Google Maps API key in `app.json`
2. Enable Maps SDK in Google Cloud Console
3. Rebuild the app: `npx expo prebuild --clean`

### Issue: Camera not working

**Solution:**
1. Check permissions in `app.json`
2. Grant permissions in device settings
3. Restart the app

### Issue: Network request failed

**Solution:**
1. Verify BASE_URL is correct
2. Check backend is running: `curl http://YOUR_IP:3001/api/health`
3. Ensure device and backend on same network
4. Check firewall settings

### Issue: Login fails with 401

**Solution:**
1. Verify credentials are correct
2. Check user role is "sales_agent"
3. Verify backend auth endpoint is working
4. Check token format in backend response

## Next Steps

After configuration:

1. ✅ Update BASE_URL in `services/api.ts`
2. ✅ Add Google Maps API key in `app.json`
3. ✅ Test login with sales agent credentials
4. ✅ Test shop registration
5. ✅ Test order placement
6. ✅ Build for device: `eas build`

## Support

For configuration issues:
1. Check logs: `npx expo start` (look for errors)
2. Clear cache: `npx expo start -c`
3. Reinstall: `rm -rf node_modules && npm install`
4. Rebuild: `npx expo prebuild --clean`

---

**Configuration checklist:**
- [ ] Backend API URL updated
- [ ] Google Maps API key added
- [ ] Test credentials ready
- [ ] Permissions granted on device
- [ ] Backend server running
- [ ] Same network for testing

Once configured, run: `npm start`
