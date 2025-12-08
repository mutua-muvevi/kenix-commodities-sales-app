# QUICK START GUIDE - Kenix Commodities Frontend

## IMMEDIATE NEXT STEPS

### 1. INSTALL MISSING DEPENDENCIES

#### Web Dashboard (use YARN)
```bash
cd G:\Waks\Kenix\commodies\web

# Install missing packages
yarn add @tanstack/react-query
yarn add recharts

# Verify all dependencies installed
yarn install
```

### 2. START BACKEND SERVER

```bash
cd G:\Waks\Kenix\commodies\server

# Make sure MongoDB is running
# mongod

# Start backend server
npm start
# OR
node index.js
```

**Backend should start on**: `http://localhost:3001`

### 3. START WEB DASHBOARD

```bash
cd G:\Waks\Kenix\commodies\web

# Start development server
yarn dev
```

**Dashboard will open on**: `http://localhost:3000`

### 4. CREATE TEST ADMIN USER

Use Postman or curl to create an admin user:

```bash
POST http://localhost:3001/api/user/register
Content-Type: application/json

{
  "firstName": "Admin",
  "lastName": "User",
  "email": "admin@kenix.com",
  "password": "admin123",
  "phone": "+254712345678",
  "role": "admin"
}
```

**OR** If you have existing admin user credentials, use those.

### 5. LOGIN TO DASHBOARD

1. Navigate to `http://localhost:3000/auth/login`
2. Enter admin credentials
3. You'll be redirected to `/dashboard`

---

## WHAT WORKS RIGHT NOW

### Admin Dashboard - READY TO USE:
- Login page with authentication
- Dashboard overview with stats
- Shop management list (approve/reject shops)
- Orders list with filtering
- Navigation sidebar
- User profile menu
- Logout functionality

### Backend - FULLY READY:
- All 46 API endpoints working
- WebSocket server running
- M-Pesa integration ready
- Sequential delivery enforcement
- Role-based access control
- Geospatial calculations

---

## WHAT TO BUILD NEXT

### Priority 1: Complete Admin Dashboard Pages

#### A. Shop Details Page
**File**: `web/src/app/dashboard/shops/[id]/page.tsx`

```typescript
'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getUser } from '@/lib/api/users';

export default function ShopDetailsPage() {
  const params = useParams();
  const shopId = params.id as string;
  const [shop, setShop] = useState(null);

  useEffect(() => {
    fetchShop();
  }, []);

  const fetchShop = async () => {
    const response = await getUser(shopId);
    setShop(response.data);
  };

  // Display shop details
  // Show map with shop location
  // Display order history
  // Show approval actions
}
```

#### B. Product Management Pages
**Files needed**:
- `web/src/app/dashboard/products/page.tsx` - Product list
- `web/src/app/dashboard/products/[id]/page.tsx` - Product edit/create
- `web/src/app/dashboard/products/new/page.tsx` - Create new product

**Key features**:
- Use @tanstack/react-table for data grid
- Image upload functionality
- Category dropdown (from GET /api/categories)
- Stock management

#### C. Order Details Page
**File**: `web/src/app/dashboard/orders/[id]/page.tsx`

```typescript
'use client';

import { useParams } from 'next/navigation';
import { getOrder, approveOrder, rejectOrder } from '@/lib/api/orders';

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = params.id as string;

  // Fetch order details
  // Show product list
  // Display delivery address on map
  // Show approval buttons (if pending)
  // Show assign to route (if approved)
  // Show timeline of order status changes
}
```

#### D. Route Management Pages
**Files needed**:
- `web/src/app/dashboard/routes/page.tsx` - Route list
- `web/src/app/dashboard/routes/create/page.tsx` - Route builder with map
- `web/src/app/dashboard/routes/[id]/page.tsx` - Route details

**Key features**:
- Mapbox integration for route visualization
- Shop selection and sequencing
- Rider assignment dropdown
- Route optimization button

#### E. Live Tracking Page
**File**: `web/src/app/dashboard/tracking/page.tsx`

```typescript
'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { connectWebSocket, onRiderLocationUpdate } from '@/lib/websocket/client';

export default function LiveTrackingPage() {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    // Initialize Mapbox
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [36.817223, -1.286389], // Nairobi
      zoom: 12,
    });

    // Connect WebSocket
    connectWebSocket(localStorage.getItem('accessToken'));

    // Listen for rider location updates
    onRiderLocationUpdate((data) => {
      // Update rider marker on map
    });
  }, []);

  return <div ref={mapContainer} style={{ width: '100%', height: '100vh' }} />;
}
```

**NOTE**: You need to add your Mapbox token to `.env.local`

---

### Priority 2: Build Rider Mobile App

#### Setup Structure
```bash
cd G:\Waks\Kenix\commodies\apps\rider

# Install dependencies (use NPM)
npm install

# Create folder structure
mkdir -p app/(auth) app/(tabs)
mkdir -p components/route components/delivery components/wallet
mkdir -p services store
```

#### Create API Service
**File**: `apps/rider/services/api.ts`

```typescript
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const api = axios.create({
  baseURL: 'http://192.168.1.100:3001/api', // Change to your local IP
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

#### Create Login Screen
**File**: `apps/rider/app/(auth)/login.tsx`

```typescript
import { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import api from '../../services/api';
import { router } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await api.post('/user/login', { email, password });
      await SecureStore.setItemAsync('accessToken', response.data.data.token);
      router.replace('/(tabs)/route');
    } catch (error) {
      alert('Login failed');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
});
```

#### Create Active Route Screen
**File**: `apps/rider/app/(tabs)/route.tsx`

```typescript
import { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import api from '../../services/api';
import * as SecureStore from 'expo-secure-store';

export default function RouteScreen() {
  const [route, setRoute] = useState(null);
  const [riderId, setRiderId] = useState(null);

  useEffect(() => {
    // Get rider ID from stored user
    fetchActiveRoute();
  }, []);

  const fetchActiveRoute = async () => {
    try {
      // You'll need to store riderId on login
      const response = await api.get(`/routes/rider/${riderId}/active`);
      setRoute(response.data.data);
    } catch (error) {
      console.error('No active route');
    }
  };

  if (!route) {
    return (
      <View style={styles.container}>
        <Text>No active route assigned</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text>Route: {route.routeName}</Text>
      <Text>Current Shop: {route.currentShop?.shop?.firstName}</Text>
      <Button title="Navigate" onPress={() => {/* Open maps */}} />
      <Button title="Arrive at Shop" onPress={() => {/* Call arrive API */}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
});
```

---

## TESTING WORKFLOW

### 1. Test Admin Dashboard
1. Start backend: `cd server && npm start`
2. Start web: `cd web && yarn dev`
3. Login as admin at `http://localhost:3000/auth/login`
4. Navigate through dashboard sections
5. Try approving/rejecting shops
6. Try viewing orders

### 2. Test Rider App (After building)
1. Start backend
2. Start mobile app: `cd apps/rider && npm start`
3. Press 'a' for Android emulator or 'i' for iOS simulator
4. Login as rider
5. View active route
6. Test navigation

### 3. Test Complete Flow
1. Create test users (shop, rider, admin)
2. Shop creates order (via API or shop app)
3. Admin approves order
4. Admin creates route with shops
5. Admin assigns rider to route
6. Rider starts route
7. Rider completes deliveries
8. Track on live map

---

## COMMON ISSUES & SOLUTIONS

### Issue: Cannot connect to backend from mobile app
**Solution**: Change API URL to your computer's local IP
```typescript
// In apps/rider/services/api.ts
baseURL: 'http://192.168.1.100:3001/api' // Use your IP, not localhost
```

Find your IP:
- Windows: `ipconfig` (look for IPv4)
- Mac/Linux: `ifconfig` (look for inet)

### Issue: CORS errors in web dashboard
**Solution**: Backend should already have CORS enabled. Check `server/index.js`:
```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
```

### Issue: WebSocket not connecting
**Solution**:
1. Check WebSocket URL in `.env.local`
2. Ensure backend WebSocket server is running
3. Check browser console for connection errors

### Issue: 401 Unauthorized errors
**Solution**:
1. Check if token is stored: `localStorage.getItem('accessToken')`
2. Verify token is being sent in Authorization header
3. Check if token is expired (login again)

---

## ENVIRONMENT VARIABLES

### Web Dashboard (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WS_URL=http://localhost:3001
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your-token-here
```

### Rider App
Create `apps/rider/.env`:
```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:3001/api
EXPO_PUBLIC_WS_URL=http://192.168.1.100:3001
```

---

## USEFUL COMMANDS

### Web Dashboard
```bash
cd web
yarn dev          # Start dev server
yarn build        # Build for production
yarn start        # Start production server
yarn lint         # Run linter
```

### Rider App
```bash
cd apps/rider
npm start         # Start Expo
npm run android   # Run on Android
npm run ios       # Run on iOS
```

### Backend
```bash
cd server
npm start         # Start server
npm run dev       # Start with nodemon (auto-restart)
```

---

## FILES CREATED SO FAR

### Web Dashboard (19 files)
1. API Client: `lib/api/client.ts`
2. Auth API: `lib/api/auth.ts`
3. Orders API: `lib/api/orders.ts`
4. Routes API: `lib/api/routes.ts`
5. Products API: `lib/api/products.ts`
6. Users API: `lib/api/users.ts`
7. Categories API: `lib/api/categories.ts`
8. WebSocket Client: `lib/websocket/client.ts`
9. Auth Store: `store/authStore.ts`
10. Login Page: `app/auth/login/page.tsx`
11. Dashboard Layout: `app/dashboard/layout.tsx`
12. Dashboard Page: `app/dashboard/page.tsx`
13. Shops List: `app/dashboard/shops/page.tsx`
14. Orders List: `app/dashboard/orders/page.tsx`
15. Sidebar: `components/dashboard/DashboardSidebar.tsx`
16. TopBar: `components/dashboard/DashboardTopBar.tsx`
17. Environment: `.env.local`
18. Progress Doc: `FRONTEND_INTEGRATION_PROGRESS.md`
19. This Guide: `QUICK_START_GUIDE.md`

---

## NEXT FILES TO CREATE

### High Priority
1. `web/src/app/dashboard/shops/[id]/page.tsx` - Shop details
2. `web/src/app/dashboard/orders/[id]/page.tsx` - Order details
3. `web/src/app/dashboard/products/page.tsx` - Product list
4. `web/src/app/dashboard/routes/page.tsx` - Route list
5. `web/src/app/dashboard/tracking/page.tsx` - Live tracking

### Rider App
1. `apps/rider/app/_layout.tsx` - Root layout
2. `apps/rider/app/(auth)/login.tsx` - Login screen
3. `apps/rider/app/(tabs)/route.tsx` - Active route
4. `apps/rider/services/api.ts` - API client
5. `apps/rider/services/location.ts` - GPS tracking

---

## SUPPORT

- **Backend API Docs**: `server/API_TESTING_GUIDE.md`
- **Backend Features**: `server/PHASE2_COMPLETION_SUMMARY.md`
- **Progress Report**: `FRONTEND_INTEGRATION_PROGRESS.md`
- **This Guide**: `QUICK_START_GUIDE.md`

---

**Ready to build the best B2B delivery platform in Kenya!**

Last Updated: November 9, 2025
