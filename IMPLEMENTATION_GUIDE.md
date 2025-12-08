# Kenix Commodities - Frontend Implementation Guide

> **Step-by-step guide to implement all 4 frontend applications**

---

## Quick Start

### 1. Install Dependencies for Shared Packages

```bash
# Navigate to each shared package and install dependencies
cd packages/shared-types
npm install

cd ../api-client
npm install

cd ../websocket-client
npm install
```

### 2. Create Rider Mobile App

```bash
cd ../../apps
npx create-expo-app rider --template expo-template-blank-typescript

cd rider
npx expo install expo-router expo-location expo-camera expo-image-picker react-native-maps expo-secure-store zustand axios socket.io-client expo-task-manager react-native-gesture-handler expo-notifications @react-native-community/netinfo expo-dev-client
```

### 3. Create Sales Agent Mobile App

```bash
cd ../
npx create-expo-app sales-agent --template expo-template-blank-typescript

cd sales-agent
npx expo install expo-router expo-location expo-camera expo-image-picker react-native-maps expo-secure-store zustand axios socket.io-client react-native-gesture-handler expo-notifications @react-native-community/netinfo expo-dev-client
```

### 4. Install Admin Dashboard Dependencies

```bash
cd ../../web
npm install socket.io-client mapbox-gl react-map-gl recharts @tanstack/react-table lucide-react sonner
```

### 5. Configure Environment Variables

**Admin Dashboard** (`web/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WS_URL=http://localhost:3001
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
```

**Rider App** (`apps/rider/.env`):
```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:3001/api
EXPO_PUBLIC_WS_URL=http://192.168.1.100:3001
```

**Sales Agent App** (`apps/sales-agent/.env`):
```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:3001/api
EXPO_PUBLIC_WS_URL=http://192.168.1.100:3001
```

**Shop App** (`apps/shop/.env`):
```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:3001/api
EXPO_PUBLIC_WS_URL=http://192.168.1.100:3001
```

---

## Detailed Implementation Steps

### STEP 1: Configure Expo Router for Mobile Apps

#### Rider App Configuration

**`apps/rider/app.json`**:
```json
{
  "expo": {
    "name": "Kenix Rider",
    "slug": "kenix-rider",
    "scheme": "kenix-rider",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#10B981"
    },
    "plugins": [
      "expo-router",
      "expo-secure-store",
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Allow Kenix Rider to use your location for delivery tracking."
        }
      ],
      [
        "expo-camera",
        {
          "cameraPermission": "Allow Kenix Rider to access your camera to capture delivery proof."
        }
      ]
    ],
    "ios": {
      "bundleIdentifier": "com.kenix.rider",
      "supportsTablet": false,
      "infoPlist": {
        "UIBackgroundModes": ["location"]
      }
    },
    "android": {
      "package": "com.kenix.rider",
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_BACKGROUND_LOCATION",
        "CAMERA",
        "WRITE_EXTERNAL_STORAGE"
      ]
    }
  }
}
```

**`apps/rider/app/_layout.tsx`**:
```typescript
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { AuthProvider } from '@/providers/AuthProvider';
import { ApiProvider } from '@/providers/ApiProvider';
import { WebSocketProvider } from '@/providers/WebSocketProvider';

export default function RootLayout() {
  return (
    <AuthProvider>
      <ApiProvider>
        <WebSocketProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="delivery/[stopId]" options={{ presentation: 'modal' }} />
          </Stack>
        </WebSocketProvider>
      </ApiProvider>
    </AuthProvider>
  );
}
```

**`apps/rider/app/index.tsx`**:
```typescript
import { Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';

export default function Index() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/route" />;
  }

  return <Redirect href="/(auth)/login" />;
}
```

#### Sales Agent App Configuration

**`apps/sales-agent/app.json`**:
```json
{
  "expo": {
    "name": "Kenix Sales Agent",
    "slug": "kenix-sales-agent",
    "scheme": "kenix-sales-agent",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#3B82F6"
    },
    "plugins": [
      "expo-router",
      "expo-secure-store",
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Allow Kenix Sales Agent to use your location to register shop locations."
        }
      ],
      [
        "expo-camera",
        {
          "cameraPermission": "Allow Kenix Sales Agent to access your camera to capture shop photos."
        }
      ]
    ],
    "ios": {
      "bundleIdentifier": "com.kenix.salesagent",
      "supportsTablet": false
    },
    "android": {
      "package": "com.kenix.salesagent",
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "CAMERA",
        "WRITE_EXTERNAL_STORAGE"
      ]
    }
  }
}
```

---

### STEP 2: Create Zustand Stores

#### Auth Store (Shared across all apps)

**`app/stores/authStore.ts`**:
```typescript
import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import type { User } from '@kenix/shared-types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  loadStoredAuth: async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      const userJson = await SecureStore.getItemAsync('user');

      if (token && userJson) {
        const user = JSON.parse(userJson);
        set({ user, token, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Failed to load stored auth:', error);
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    const api = getApiClient();
    const response = await api.login({ email, password });

    const { user, token } = response.data!;

    await SecureStore.setItemAsync('token', token);
    await SecureStore.setItemAsync('user', JSON.stringify(user));

    set({ user, token, isAuthenticated: true });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('user');

    set({ user: null, token: null, isAuthenticated: false });
  },
}));
```

---

### STEP 3: Create API Client Instances

#### Mobile Apps API Configuration

**`app/lib/api.ts`**:
```typescript
import { createApiClient } from '@kenix/api-client';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

export const api = createApiClient({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  getToken: () => SecureStore.getItemAsync('token'),
  setToken: (token) => SecureStore.setItemAsync('token', token),
  onTokenExpired: () => {
    // Clear auth and redirect to login
    SecureStore.deleteItemAsync('token');
    SecureStore.deleteItemAsync('user');
    router.replace('/(auth)/login');
  }
});
```

#### Web App API Configuration

**`web/src/lib/api.ts`**:
```typescript
import { createApiClient } from '@kenix/api-client';

export const api = createApiClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  getToken: () => localStorage.getItem('token'),
  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  },
  onTokenExpired: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
});
```

---

### STEP 4: Create WebSocket Client Instances

#### Mobile Apps WebSocket Configuration

**`app/lib/websocket.ts`**:
```typescript
import { createWebSocketClient } from '@kenix/websocket-client';
import * as SecureStore from 'expo-secure-store';

export const ws = createWebSocketClient({
  url: process.env.EXPO_PUBLIC_WS_URL,
  getToken: async () => await SecureStore.getItemAsync('token'),
  onConnect: () => console.log('WebSocket connected'),
  onDisconnect: () => console.log('WebSocket disconnected'),
  onError: (error) => console.error('WebSocket error:', error)
});
```

#### Web App WebSocket Configuration

**`web/src/lib/websocket.ts`**:
```typescript
import { createWebSocketClient } from '@kenix/websocket-client';

export const ws = createWebSocketClient({
  url: process.env.NEXT_PUBLIC_WS_URL,
  getToken: () => localStorage.getItem('token'),
  onConnect: () => console.log('WebSocket connected'),
  onDisconnect: () => console.log('WebSocket disconnected'),
  onError: (error) => console.error('WebSocket error:', error)
});
```

---

### STEP 5: Key Component Templates

#### Rider App - Route Map Component

**`apps/rider/components/route/RouteMap.tsx`**:
```typescript
import React, { useEffect, useState } from 'react';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { StyleSheet, View } from 'react-native';
import type { RouteStop, Coordinates } from '@kenix/shared-types';

interface RouteMapProps {
  currentStop: RouteStop;
  upcomingStops: RouteStop[];
  currentLocation: Coordinates | null;
}

export default function RouteMap({ currentStop, upcomingStops, currentLocation }: RouteMapProps) {
  const routePath = currentLocation && currentStop
    ? [currentLocation, currentStop.shop.location]
    : [];

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: currentStop.shop.location.latitude,
          longitude: currentStop.shop.location.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        showsUserLocation
        showsMyLocationButton
      >
        {/* Current stop marker */}
        <Marker
          coordinate={currentStop.shop.location}
          title={currentStop.shop.shopName}
          description="Current delivery"
          pinColor="red"
        />

        {/* Upcoming stops (grayed out) */}
        {upcomingStops.map((stop) => (
          <Marker
            key={stop.id}
            coordinate={stop.shop.location}
            title={stop.shop.shopName}
            description={`Stop #${stop.sequence}`}
            pinColor="gray"
            opacity={0.5}
          />
        ))}

        {/* Route line */}
        {routePath.length > 0 && (
          <Polyline
            coordinates={routePath}
            strokeColor="#3B82F6"
            strokeWidth={4}
          />
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});
```

#### Admin Dashboard - Live Tracking Map

**`web/src/components/tracking/LiveMap.tsx`**:
```typescript
'use client';

import { useEffect, useState } from 'react';
import Map, { Marker, Source, Layer } from 'react-map-gl';
import { ws } from '@/lib/websocket';
import type { Route, Coordinates } from '@kenix/shared-types';

export default function LiveMap() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [riderLocations, setRiderLocations] = useState<Map<string, Coordinates>>(new Map());

  useEffect(() => {
    // Load active routes
    api.getRoutes({ status: 'in_progress' }).then(res => {
      setRoutes(res.data || []);
    });

    // Subscribe to rider location updates
    ws.connect();
    ws.joinAdminRoom();

    const unsubscribe = ws.onRiderLocationUpdate((data) => {
      setRiderLocations(prev => new Map(prev).set(data.riderId, data.location));
    });

    return () => {
      unsubscribe();
      ws.disconnect();
    };
  }, []);

  return (
    <div style={{ width: '100%', height: '600px' }}>
      <Map
        initialViewState={{
          latitude: -1.286389,
          longitude: 36.817223,
          zoom: 12
        }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      >
        {/* Rider markers */}
        {Array.from(riderLocations.entries()).map(([riderId, location]) => (
          <Marker
            key={riderId}
            latitude={location.latitude}
            longitude={location.longitude}
          >
            <div style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              backgroundColor: '#3B82F6',
              border: '3px solid white',
              boxShadow: '0 0 10px rgba(0,0,0,0.3)'
            }} />
          </Marker>
        ))}

        {/* Shop markers */}
        {routes.flatMap(route => route.stops).map(stop => (
          <Marker
            key={stop.id}
            latitude={stop.shop.location.latitude}
            longitude={stop.shop.location.longitude}
          >
            <div style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              backgroundColor: stop.status === 'delivered' ? '#10B981' : '#F59E0B',
              border: '2px solid white'
            }} />
          </Marker>
        ))}
      </Map>
    </div>
  );
}
```

---

### STEP 6: Authentication Screens

#### Mobile Login Screen Template

**`app/(auth)/login.tsx`**:
```typescript
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const login = useAuthStore(state => state.login);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kenix Rider</Text>
      <Text style={styles.subtitle}>Login to your account</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Logging in...' : 'Login'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#10B981',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

---

### STEP 7: Running the Applications

#### Development Mode

**Admin Dashboard**:
```bash
cd web
npm run dev
# Open http://localhost:3000
```

**Rider App**:
```bash
cd apps/rider
npx expo start
# Scan QR code with Expo Go app
```

**Sales Agent App**:
```bash
cd apps/sales-agent
npx expo start
```

**Shop App**:
```bash
cd apps/shop
npx expo start
```

---

### STEP 8: Testing Checklist

#### Admin Dashboard
- [ ] Login as admin
- [ ] View pending shop approvals
- [ ] Approve/reject shops
- [ ] Create products
- [ ] View orders
- [ ] Create routes
- [ ] See live rider locations on map

#### Rider App
- [ ] Login as rider
- [ ] View assigned route
- [ ] Navigate to shop
- [ ] Complete delivery with photo/signature
- [ ] M-Pesa payment flow
- [ ] View wallet balance

#### Sales Agent App
- [ ] Login as sales agent
- [ ] Register new shop with GPS location
- [ ] Upload shop photo
- [ ] View performance dashboard
- [ ] Place order for shop

#### Shop App
- [ ] Login as shop owner
- [ ] Browse products
- [ ] Add to cart
- [ ] Checkout with M-Pesa
- [ ] Track order in real-time
- [ ] Apply for loan
- [ ] Buy airtime

---

## Common Issues & Solutions

### Issue: Expo not found
```bash
npm install -g expo-cli
```

### Issue: Metro bundler error
```bash
npx expo start -c  # Clear cache
```

### Issue: WebSocket connection failed
- Ensure backend server is running
- Check that WS_URL in .env matches your backend URL
- For mobile, use your computer's local IP (not localhost)

### Issue: Maps not showing
- Ensure you have valid Mapbox token (web) or Google Maps API key (mobile)
- Check permissions for location access

---

## Performance Optimization

### Code Splitting (Web)
```typescript
// Use dynamic imports for heavy components
const LiveMap = dynamic(() => import('@/components/tracking/LiveMap'), {
  ssr: false,
  loading: () => <LoadingSpinner />
});
```

### Image Optimization (Mobile)
```typescript
import { Image } from 'expo-image';

<Image
  source={{ uri: product.image }}
  style={styles.image}
  contentFit="cover"
  transition={200}
  cachePolicy="memory-disk"
/>
```

### Virtual Lists (Mobile)
```typescript
import { FlashList } from '@shopify/flash-list';

<FlashList
  data={products}
  renderItem={({ item }) => <ProductCard product={item} />}
  estimatedItemSize={100}
/>
```

---

## Security Best Practices

1. **Never commit .env files** - Add to .gitignore
2. **Use HTTPS in production** - Enable SSL for API
3. **Validate all inputs** - Use Zod or Yup schemas
4. **Sanitize user data** - Prevent XSS attacks
5. **Implement rate limiting** - Prevent API abuse
6. **Use secure storage** - SecureStore for mobile, httpOnly cookies for web

---

## Next Steps

1. Read the `FRONTEND_ARCHITECTURE.md` for detailed feature specifications
2. Follow this guide to set up all applications
3. Implement features incrementally following the roadmap
4. Test each feature thoroughly before moving to the next
5. Coordinate with backend team for API endpoints

---

**End of Implementation Guide**
