# Kenix Commodities - Frontend Architecture & Implementation Guide

> **Enterprise-Grade Multi-Platform Frontend System**
>
> Complete architecture for Admin Dashboard (Web), Rider App (Mobile), Sales Agent App (Mobile), and Shop App (Mobile)

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Shared Infrastructure](#shared-infrastructure)
3. [Admin Dashboard (Web)](#admin-dashboard-web)
4. [Rider App (Mobile)](#rider-app-mobile)
5. [Sales Agent App (Mobile)](#sales-agent-app-mobile)
6. [Shop App (Mobile)](#shop-app-mobile)
7. [Implementation Roadmap](#implementation-roadmap)
8. [API Integration](#api-integration)
9. [Deployment Guide](#deployment-guide)

---

## System Overview

### Applications

| Application | Platform | Users | Status | Priority |
|------------|----------|-------|--------|----------|
| **Admin Dashboard** | Web (Next.js 15) | Admins | 5% → 100% | P1 |
| **Rider App** | Mobile (Expo) | Riders | 0% → 100% | P1 |
| **Sales Agent App** | Mobile (Expo) | Sales Agents | 0% → 100% | P1 |
| **Shop App** | Mobile (Expo) | Shop Owners | 25% → 100% | P2 |

### Technology Stack

```
Root
├── web/                    # Admin Dashboard (Next.js 15 + TypeScript + Tailwind)
├── apps/
│   ├── shop/              # Shop App (Expo + React Native)
│   ├── rider/             # Rider App (Expo + React Native) [NEW]
│   └── sales-agent/       # Sales Agent App (Expo + React Native) [NEW]
├── packages/              # Shared code
│   ├── shared-types/      # TypeScript type definitions
│   ├── api-client/        # Centralized API client (Axios)
│   ├── websocket-client/  # Real-time WebSocket client (Socket.io)
│   └── ui-components/     # Shared UI components
└── server/                # Backend (Express + PostgreSQL)
```

---

## Shared Infrastructure

### 1. Shared Types Package (`@kenix/shared-types`)

**Location**: `G:\Waks\Kenix\commodies\packages\shared-types`

**Key Types**:
- User types (Admin, SalesAgent, Rider, Shop)
- Product & Category types
- Order & OrderItem types
- Route & Delivery types
- Payment & Transaction types
- Loan types (Kenix Duka)
- Analytics types
- WebSocket event types

**Installation**: Already created - see `packages/shared-types/src/index.ts`

### 2. API Client Package (`@kenix/api-client`)

**Location**: `G:\Waks\Kenix\commodies\packages\api-client`

**Features**:
- Centralized Axios instance with interceptors
- Auto-attach auth tokens
- Error handling (401 redirect, network errors)
- Type-safe API methods
- File upload support

**Key Methods**:
```typescript
// Authentication
login(credentials)
logout()
getCurrentUser()

// Products
getProducts(params)
createProduct(data)
updateProduct(id, data)

// Orders
getOrders(params)
createOrder(data)
approveOrder(id)

// Routes
getRoutes(params)
optimizeRoute(id)
updateDeliveryStatus(routeId, stopId, status)

// Payments
initiateMpesaPayment(data)
checkPaymentStatus(checkoutRequestId)

// And many more...
```

**Usage**:
```typescript
import { createApiClient } from '@kenix/api-client';

const api = createApiClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  getToken: () => localStorage.getItem('token'),
  setToken: (token) => localStorage.setItem('token', token),
  onTokenExpired: () => router.push('/login')
});

// Make requests
const response = await api.getProducts({ page: 1, limit: 20 });
```

### 3. WebSocket Client Package (`@kenix/websocket-client`)

**Location**: `G:\Waks\Kenix\commodies\packages\websocket-client`

**Features**:
- Socket.io client wrapper
- Auto-reconnection
- Type-safe event handlers
- Room management
- React hooks support

**Key Events**:
- `rider:location-updated` - Rider GPS updates
- `delivery:status-changed` - Delivery status changes
- `order:status-changed` - Order status updates
- `payment:confirmed` - M-Pesa payment confirmations

**Usage**:
```typescript
import { createWebSocketClient } from '@kenix/websocket-client';

const ws = createWebSocketClient({
  url: process.env.NEXT_PUBLIC_WS_URL,
  getToken: () => localStorage.getItem('token'),
  onConnect: () => console.log('Connected'),
  onDisconnect: () => console.log('Disconnected')
});

ws.connect();

// Subscribe to events
ws.onRiderLocationUpdate((data) => {
  console.log('Rider moved:', data);
});

// Join rooms for targeted updates
ws.joinAdminRoom(); // Admin dashboard
ws.joinRiderRoom(riderId); // Rider app
ws.joinShopRoom(shopId); // Shop app
```

---

## Admin Dashboard (Web)

**Location**: `G:\Waks\Kenix\commodies\web`

**Current State**: Marketing landing page only

**Target State**: Full-featured admin dashboard

### Required Dependencies

```bash
cd web
npm install socket.io-client mapbox-gl react-map-gl recharts @tanstack/react-table date-fns lucide-react sonner react-hook-form zod
```

### Application Structure

```
web/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── forgot-password/
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx           # Dashboard layout with sidebar
│   │   │   ├── page.tsx             # Dashboard home (metrics overview)
│   │   │   ├── shops/               # Shop management
│   │   │   │   ├── page.tsx         # List all shops
│   │   │   │   ├── pending/         # Pending approvals
│   │   │   │   └── [id]/           # Shop details
│   │   │   ├── users/               # User management
│   │   │   ├── products/            # Product & inventory
│   │   │   ├── orders/              # Order management
│   │   │   ├── routes/              # Route management
│   │   │   ├── tracking/            # Real-time delivery tracking
│   │   │   ├── analytics/           # Performance analytics
│   │   │   ├── financial/           # Financial management
│   │   │   └── promotions/          # Promotions & offers
│   │   └── api/                     # API routes (if needed)
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── TopBar.tsx
│   │   │   └── StatsCard.tsx
│   │   ├── shops/
│   │   │   ├── ShopList.tsx
│   │   │   ├── ShopApprovalCard.tsx
│   │   │   └── ShopMap.tsx
│   │   ├── products/
│   │   │   ├── ProductTable.tsx
│   │   │   ├── ProductForm.tsx
│   │   │   └── StockManager.tsx
│   │   ├── orders/
│   │   │   ├── OrderTable.tsx
│   │   │   └── OrderDetails.tsx
│   │   ├── routes/
│   │   │   ├── RouteMap.tsx
│   │   │   ├── RouteBuilder.tsx
│   │   │   └── RouteOptimizer.tsx
│   │   ├── tracking/
│   │   │   ├── LiveMap.tsx
│   │   │   └── RiderMarker.tsx
│   │   ├── analytics/
│   │   │   ├── RevenueChart.tsx
│   │   │   ├── PerformanceTable.tsx
│   │   │   └── MetricCard.tsx
│   │   └── ui/                      # Reusable UI components
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useWebSocket.ts
│   │   ├── useRealTimeLocation.ts
│   │   └── useApi.ts
│   ├── lib/
│   │   ├── api.ts                   # API client instance
│   │   ├── websocket.ts             # WebSocket client instance
│   │   └── utils.ts
│   └── stores/
│       ├── authStore.ts             # Zustand auth store
│       ├── orderStore.ts
│       └── routeStore.ts
```

### Feature Implementation Guide

#### 1. Shop Management

**Routes**:
- `/dashboard/shops` - All shops (active, pending, banned)
- `/dashboard/shops/pending` - Pending approvals
- `/dashboard/shops/[id]` - Shop details

**Components**:
```typescript
// ShopApprovalCard.tsx
interface Shop {
  id: string;
  shopName: string;
  ownerName: string;
  location: { latitude: number; longitude: number };
  status: 'pending' | 'active' | 'banned';
  registeredBy: string; // Sales agent
}

function ShopApprovalCard({ shop }: { shop: Shop }) {
  const handleApprove = async () => {
    await api.approveShop(shop.id);
    // Show success toast
  };

  return (
    <Card>
      <CardHeader>{shop.shopName}</CardHeader>
      <CardBody>
        <p>Owner: {shop.ownerName}</p>
        <MapView center={shop.location} />
      </CardBody>
      <CardFooter>
        <Button onClick={handleApprove}>Approve</Button>
        <Button variant="danger">Reject</Button>
      </CardFooter>
    </Card>
  );
}
```

#### 2. Real-time Delivery Tracking

**Route**: `/dashboard/tracking`

**Features**:
- Interactive map showing all active routes
- Real-time rider locations (WebSocket updates every 10s)
- Route paths with waypoints
- Delivery status indicators
- ETA calculations

**Implementation**:
```typescript
// LiveMap.tsx
import { useEffect, useState } from 'react';
import { Map, Marker, Polyline } from 'react-map-gl';
import { useWebSocket } from '@/hooks/useWebSocket';

function LiveMap() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [riderLocations, setRiderLocations] = useState<Map<string, Coordinates>>(new Map());

  const ws = useWebSocket();

  useEffect(() => {
    // Subscribe to rider location updates
    const unsubscribe = ws.onRiderLocationUpdate((data) => {
      setRiderLocations(prev => new Map(prev).set(data.riderId, data.location));
    });

    return unsubscribe;
  }, [ws]);

  return (
    <Map
      initialViewState={{
        latitude: -1.286389,
        longitude: 36.817223,
        zoom: 12
      }}
      mapStyle="mapbox://styles/mapbox/streets-v12"
    >
      {/* Render routes */}
      {routes.map(route => (
        <Polyline
          key={route.id}
          coordinates={route.optimizedPath}
          color="#3B82F6"
        />
      ))}

      {/* Render rider markers */}
      {Array.from(riderLocations.entries()).map(([riderId, location]) => (
        <Marker
          key={riderId}
          latitude={location.latitude}
          longitude={location.longitude}
        >
          <RiderIcon />
        </Marker>
      ))}

      {/* Render shop markers */}
      {routes.flatMap(r => r.stops).map(stop => (
        <Marker
          key={stop.id}
          latitude={stop.shop.location.latitude}
          longitude={stop.shop.location.longitude}
        >
          <ShopIcon status={stop.status} />
        </Marker>
      ))}
    </Map>
  );
}
```

#### 3. Performance Analytics

**Route**: `/dashboard/analytics`

**Charts**:
- Revenue trends (daily/weekly/monthly)
- Orders over time
- Top-selling products
- Sales agent performance comparison
- Rider performance metrics

**Implementation**:
```typescript
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';

function RevenueChart() {
  const [data, setData] = useState([]);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  useEffect(() => {
    api.getBusinessMetrics(period).then(res => {
      setData(res.data);
    });
  }, [period]);

  return (
    <LineChart width={800} height={400} data={data}>
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="revenue" stroke="#3B82F6" />
      <Line type="monotone" dataKey="orders" stroke="#10B981" />
    </LineChart>
  );
}
```

---

## Rider App (Mobile)

**Location**: `G:\Waks\Kenix\commodies\apps\rider` (NEW)

**Platform**: React Native + Expo

**Primary User**: Delivery riders

### Setup

```bash
cd apps
npx create-expo-app rider --template expo-template-blank-typescript
cd rider
npx expo install expo-router expo-location expo-camera expo-image-picker react-native-maps expo-secure-store zustand axios socket.io-client
```

### Application Structure

```
apps/rider/
├── app/
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── biometric.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx              # Bottom tabs
│   │   ├── route.tsx                # Active route view
│   │   ├── wallet.tsx               # Wallet & earnings
│   │   └── performance.tsx          # Performance dashboard
│   ├── delivery/
│   │   └── [stopId].tsx             # Delivery confirmation screen
│   └── _layout.tsx
├── components/
│   ├── route/
│   │   ├── RouteMap.tsx             # Map with current delivery
│   │   ├── StopCard.tsx             # Shop delivery card
│   │   └── NavigationButton.tsx
│   ├── delivery/
│   │   ├── SignatureCapture.tsx
│   │   ├── PhotoCapture.tsx
│   │   └── PaymentSelector.tsx
│   └── wallet/
│       ├── WalletBalance.tsx
│       └── TransactionList.tsx
├── stores/
│   ├── authStore.ts
│   ├── routeStore.ts
│   └── locationStore.ts
├── services/
│   ├── api.ts
│   ├── websocket.ts
│   ├── location.ts                  # GPS tracking service
│   └── offline.ts                   # Offline sync queue
└── utils/
    ├── geofence.ts                  # Check if near shop
    └── navigation.ts                # Open native maps
```

### Key Features Implementation

#### 1. Sequential Delivery Enforcement

**Critical Requirement**: Riders can only access the current shop in sequence.

```typescript
// components/route/StopCard.tsx
interface StopCardProps {
  stop: RouteStop;
  isCurrentStop: boolean;
  index: number;
}

function StopCard({ stop, isCurrentStop, index }: StopCardProps) {
  const canAccess = isCurrentStop;
  const isCompleted = stop.status === 'delivered';
  const isPast = index < currentStopIndex;

  return (
    <View style={[
      styles.card,
      !canAccess && styles.locked
    ]}>
      <Text style={styles.sequence}>#{stop.sequence}</Text>
      <Text style={styles.shopName}>{stop.shop.shopName}</Text>

      {isCompleted && (
        <Badge variant="success">Delivered</Badge>
      )}

      {isCurrentStop && (
        <>
          <Button onPress={() => openMaps(stop.shop.location)}>
            Navigate to Shop
          </Button>
          <Button
            onPress={() => router.push(`/delivery/${stop.id}`)}
            disabled={!isNearShop(stop.shop.location)}
          >
            Start Delivery
          </Button>
        </>
      )}

      {!canAccess && !isPast && (
        <View style={styles.lockOverlay}>
          <LockIcon />
          <Text>Complete previous delivery first</Text>
        </View>
      )}
    </View>
  );
}

// utils/geofence.ts
function isNearShop(shopLocation: Coordinates): boolean {
  const currentLocation = useLocationStore.getState().currentLocation;
  if (!currentLocation) return false;

  const distance = calculateDistance(currentLocation, shopLocation);
  return distance < 100; // Within 100 meters
}
```

#### 2. M-Pesa Payment Integration

```typescript
// app/delivery/[stopId].tsx
function DeliveryConfirmationScreen({ route }) {
  const { stopId } = route.params;
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mpesa');
  const [amount, setAmount] = useState('');

  const handlePayment = async () => {
    if (paymentMethod === 'mpesa') {
      // Initiate STK Push to shop's phone
      const response = await api.initiateMpesaPayment({
        orderId: stop.order.id,
        phoneNumber: stop.shop.mpesaNumber,
        amount: parseFloat(amount)
      });

      // Show loading state
      setPaymentStatus('processing');

      // Poll for payment confirmation
      const checkStatus = setInterval(async () => {
        const status = await api.checkPaymentStatus(response.data.checkoutRequestId);
        if (status.data.status === 'paid') {
          clearInterval(checkStatus);
          setPaymentStatus('confirmed');
          proceedToDeliveryProof();
        }
      }, 3000);
    }
  };

  return (
    <View>
      <Text>Confirm Delivery: {stop.shop.shopName}</Text>

      <PaymentMethodSelector
        value={paymentMethod}
        onChange={setPaymentMethod}
        options={['mpesa', 'cash', 'airtel']}
      />

      {paymentMethod === 'mpesa' && (
        <>
          <TextInput
            placeholder="Amount"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
          <Button onPress={handlePayment}>
            Send STK Push
          </Button>
          {paymentStatus === 'processing' && (
            <Text>Check your phone...</Text>
          )}
        </>
      )}

      {paymentStatus === 'confirmed' && (
        <>
          <SignatureCapture onCapture={setSignature} />
          <PhotoCapture onCapture={setPhoto} />
          <Button onPress={submitDelivery}>
            Complete Delivery
          </Button>
        </>
      )}
    </View>
  );
}
```

#### 3. Background GPS Tracking

```typescript
// services/location.ts
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

const LOCATION_TASK_NAME = 'background-location-task';

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error(error);
    return;
  }

  if (data) {
    const { locations } = data as any;
    const location = locations[0];

    // Send to server via WebSocket
    const ws = getWebSocketClient();
    const riderId = await SecureStore.getItemAsync('riderId');

    ws.emit('rider:location-update', {
      riderId,
      location: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      },
      timestamp: new Date().toISOString()
    });
  }
});

export async function startLocationTracking() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Location permission denied');
  }

  await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
    accuracy: Location.Accuracy.High,
    timeInterval: 10000, // Update every 10 seconds
    distanceInterval: 50, // Or every 50 meters
    foregroundService: {
      notificationTitle: 'Kenix Rider',
      notificationBody: 'Tracking your delivery route'
    }
  });
}
```

---

## Sales Agent App (Mobile)

**Location**: `G:\Waks\Kenix\commodies\apps\sales-agent` (NEW)

**Platform**: React Native + Expo

**Primary User**: Sales agents who register shops and place orders

### Application Structure

```
apps/sales-agent/
├── app/
│   ├── (auth)/
│   │   └── login.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── dashboard.tsx            # Performance dashboard
│   │   ├── shops.tsx                # My shops list
│   │   └── territory.tsx            # Territory map view
│   ├── shops/
│   │   ├── register.tsx             # Multi-step registration
│   │   └── [id].tsx                 # Shop details
│   ├── orders/
│   │   └── create.tsx               # Place order for shop
│   └── _layout.tsx
├── components/
│   ├── shops/
│   │   ├── RegistrationForm.tsx
│   │   ├── LocationPicker.tsx
│   │   └── ShopPhotoCapture.tsx
│   ├── orders/
│   │   ├── ProductSelector.tsx
│   │   └── Cart.tsx
│   └── performance/
│       ├── PerformanceCard.tsx
│       └── TargetProgress.tsx
└── stores/
    ├── authStore.ts
    ├── shopStore.ts
    └── performanceStore.ts
```

### Key Features

#### 1. Shop Registration with GPS

```typescript
// app/shops/register.tsx
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';

function ShopRegistrationScreen() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<ShopRegistrationData>({
    shopName: '',
    ownerName: '',
    phone: '',
    mpesaNumber: '',
    location: null,
    shopPhoto: null
  });

  const captureLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High
    });

    setFormData(prev => ({
      ...prev,
      location: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      }
    }));
  };

  const capturePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8
    });

    if (!result.canceled) {
      setFormData(prev => ({
        ...prev,
        shopPhoto: result.assets[0].uri
      }));
    }
  };

  const submitRegistration = async () => {
    // Upload photo first
    const photoUrl = await api.uploadFile(formData.shopPhoto);

    // Submit registration
    await api.registerShop({
      ...formData,
      shopPhoto: photoUrl.data.url
    });

    // Show success message
    Alert.alert('Success', 'Shop registered! Pending admin approval.');
    router.push('/shops');
  };

  return (
    <ScrollView>
      {step === 1 && (
        <View>
          <Text style={styles.title}>Shop Details</Text>
          <TextInput
            placeholder="Shop Name"
            value={formData.shopName}
            onChangeText={(text) => setFormData(prev => ({ ...prev, shopName: text }))}
          />
          <TextInput
            placeholder="Owner Name"
            value={formData.ownerName}
            onChangeText={(text) => setFormData(prev => ({ ...prev, ownerName: text }))}
          />
          <Button onPress={() => setStep(2)}>Next</Button>
        </View>
      )}

      {step === 2 && (
        <View>
          <Text style={styles.title}>Contact Information</Text>
          <TextInput
            placeholder="Phone Number (+254...)"
            value={formData.phone}
            onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
            keyboardType="phone-pad"
          />
          <TextInput
            placeholder="M-Pesa Number"
            value={formData.mpesaNumber}
            onChangeText={(text) => setFormData(prev => ({ ...prev, mpesaNumber: text }))}
            keyboardType="phone-pad"
          />
          <Button onPress={() => setStep(3)}>Next</Button>
        </View>
      )}

      {step === 3 && (
        <View>
          <Text style={styles.title}>Shop Location</Text>
          {formData.location ? (
            <MapView
              initialRegion={{
                latitude: formData.location.latitude,
                longitude: formData.location.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01
              }}
            >
              <Marker coordinate={formData.location} />
            </MapView>
          ) : (
            <Button onPress={captureLocation}>Capture Current Location</Button>
          )}
          <Button onPress={() => setStep(4)}>Next</Button>
        </View>
      )}

      {step === 4 && (
        <View>
          <Text style={styles.title}>Shop Photo</Text>
          {formData.shopPhoto && (
            <Image source={{ uri: formData.shopPhoto }} style={styles.photo} />
          )}
          <Button onPress={capturePhoto}>Take Photo</Button>
          <Button onPress={submitRegistration}>Submit Registration</Button>
        </View>
      )}
    </ScrollView>
  );
}
```

#### 2. Performance Dashboard

```typescript
// app/(tabs)/dashboard.tsx
function DashboardScreen() {
  const [performance, setPerformance] = useState<SalesAgentPerformance | null>(null);
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');

  useEffect(() => {
    const agentId = authStore.user?.id;
    api.getSalesAgentPerformance(agentId!, period).then(res => {
      setPerformance(res.data);
    });
  }, [period]);

  if (!performance) return <LoadingSpinner />;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{period === 'weekly' ? 'This Week' : 'This Month'}</Text>

      <SegmentedControl
        values={['Weekly', 'Monthly']}
        selectedIndex={period === 'weekly' ? 0 : 1}
        onChange={(index) => setPeriod(index === 0 ? 'weekly' : 'monthly')}
      />

      <View style={styles.metricsGrid}>
        <MetricCard
          title="Shops Registered"
          value={performance.shopsRegistered}
          icon="store"
          color="#3B82F6"
        />
        <MetricCard
          title="Orders Placed"
          value={performance.ordersPlaced}
          icon="shopping-cart"
          color="#10B981"
        />
        <MetricCard
          title="Revenue Generated"
          value={`KES ${formatNumber(performance.totalRevenue)}`}
          icon="money"
          color="#F59E0B"
        />
        <MetricCard
          title="Commission Earned"
          value={`KES ${formatNumber(performance.commission)}`}
          icon="wallet"
          color="#8B5CF6"
        />
      </View>

      <View style={styles.targetSection}>
        <Text style={styles.sectionTitle}>Target Achievement</Text>
        <ProgressBar
          progress={performance.achievement}
          color="#10B981"
        />
        <Text style={styles.achievementText}>
          {performance.achievement.toFixed(1)}% of target
        </Text>
      </View>
    </ScrollView>
  );
}
```

---

## Shop App (Mobile)

**Location**: `G:\Waks\Kenix\commodies\apps\shop` (ENHANCE EXISTING)

**Current State**: 25% complete (UI with mocked data)

**Target State**: 100% functional with backend integration

### Required Enhancements

#### 1. Replace Mocked API with Real Backend

**Current**:
```typescript
// Mock data
const products = [
  { id: 1, name: 'Tomatoes', price: 100 }
];
```

**Target**:
```typescript
// Real API calls
import { createApiClient } from '@kenix/api-client';

const api = createApiClient({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  getToken: () => SecureStore.getItemAsync('token'),
  setToken: (token) => SecureStore.setItemAsync('token', token)
});

function ProductListScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await api.getProducts({ status: 'in_stock' });
      setProducts(response.data || []);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <FlatList
      data={products}
      renderItem={({ item }) => <ProductCard product={item} />}
      keyExtractor={(item) => item.id}
    />
  );
}
```

#### 2. M-Pesa Checkout Flow

```typescript
// app/checkout.tsx
function CheckoutScreen() {
  const cart = useCartStore(state => state.items);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');

  const handleCheckout = async () => {
    try {
      setPaymentStatus('processing');

      // Create order first
      const orderResponse = await api.createOrder({
        shopId: authStore.user!.id,
        items: cart.map(item => ({
          productId: item.product.id,
          quantity: item.quantity
        })),
        paymentMethod: 'mpesa'
      });

      const orderId = orderResponse.data!.id;

      // Initiate M-Pesa payment
      const paymentResponse = await api.initiateMpesaPayment({
        orderId,
        phoneNumber,
        amount: calculateTotal(cart)
      });

      // Poll for payment status
      const checkoutRequestId = paymentResponse.data!.checkoutRequestId;

      const pollInterval = setInterval(async () => {
        const statusResponse = await api.checkPaymentStatus(checkoutRequestId);

        if (statusResponse.data!.status === 'paid') {
          clearInterval(pollInterval);
          setPaymentStatus('success');

          // Clear cart
          useCartStore.getState().clear();

          // Navigate to order confirmation
          router.push(`/orders/${orderId}`);
        } else if (statusResponse.data!.status === 'failed') {
          clearInterval(pollInterval);
          setPaymentStatus('failed');
          Alert.alert('Payment Failed', 'Please try again.');
        }
      }, 3000);

    } catch (error) {
      setPaymentStatus('failed');
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Checkout</Text>

      <View style={styles.summary}>
        <Text>Total Items: {cart.length}</Text>
        <Text style={styles.total}>
          Total: KES {formatCurrency(calculateTotal(cart))}
        </Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="M-Pesa Phone Number (254...)"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
      />

      <Button
        onPress={handleCheckout}
        disabled={paymentStatus === 'processing'}
      >
        {paymentStatus === 'processing' ? 'Processing...' : 'Pay with M-Pesa'}
      </Button>

      {paymentStatus === 'processing' && (
        <View style={styles.stkPushNotice}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text>Check your phone for M-Pesa prompt...</Text>
        </View>
      )}
    </View>
  );
}
```

#### 3. Real-time Order Tracking

```typescript
// app/orders/[id].tsx
import { useWebSocket } from '@/hooks/useWebSocket';

function OrderTrackingScreen({ route }) {
  const { orderId } = route.params;
  const [order, setOrder] = useState<Order | null>(null);
  const [riderLocation, setRiderLocation] = useState<Coordinates | null>(null);

  const ws = useWebSocket();

  useEffect(() => {
    // Load initial order data
    api.getOrderById(orderId).then(res => {
      setOrder(res.data!);
    });

    // Subscribe to order status updates
    const unsubscribe1 = ws.onOrderStatusChange((data) => {
      if (data.orderId === orderId) {
        setOrder(prev => prev ? { ...prev, status: data.status } : null);
      }
    });

    // Subscribe to rider location updates (when in transit)
    const unsubscribe2 = ws.onRiderLocationUpdate((data) => {
      if (data.routeId === order?.assignedRouteId) {
        setRiderLocation(data.location);
      }
    });

    return () => {
      unsubscribe1();
      unsubscribe2();
    };
  }, [orderId]);

  if (!order) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order #{order.orderNumber}</Text>

      <OrderStatusTimeline status={order.status} />

      {order.status === 'in_transit' && riderLocation && (
        <View style={styles.mapContainer}>
          <MapView
            initialRegion={{
              latitude: order.shop!.location.latitude,
              longitude: order.shop!.location.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05
            }}
          >
            {/* Shop marker */}
            <Marker
              coordinate={order.shop!.location}
              title="Your Shop"
              pinColor="green"
            />

            {/* Rider marker */}
            <Marker
              coordinate={riderLocation}
              title="Delivery Rider"
              pinColor="blue"
            />

            {/* Route line */}
            <Polyline
              coordinates={[riderLocation, order.shop!.location]}
              strokeColor="#3B82F6"
              strokeWidth={3}
            />
          </MapView>

          <View style={styles.etaCard}>
            <Text style={styles.etaText}>
              Estimated Arrival: {calculateETA(riderLocation, order.shop!.location)}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.itemsList}>
        <Text style={styles.sectionTitle}>Order Items</Text>
        {order.items.map(item => (
          <OrderItemRow key={item.id} item={item} />
        ))}
      </View>
    </View>
  );
}
```

#### 4. Kenix Duka Loans (NEW)

```typescript
// app/loans/apply.tsx
function LoanApplicationScreen() {
  const [amount, setAmount] = useState('');
  const [eligibility, setEligibility] = useState<LoanEligibility | null>(null);

  useEffect(() => {
    // Check loan eligibility
    api.getLoanEligibility().then(res => {
      setEligibility(res.data);
    });
  }, []);

  const handleApply = async () => {
    try {
      const response = await api.applyForLoan({
        amount: parseFloat(amount)
      });

      Alert.alert(
        'Application Submitted',
        'Your loan application is under review. You will be notified once approved.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Apply for Kenix Duka Loan</Text>

      {eligibility && (
        <View style={styles.eligibilityCard}>
          <Text style={styles.label}>Your Credit Limit</Text>
          <Text style={styles.amount}>
            KES {formatCurrency(eligibility.maxAmount)}
          </Text>
          <Text style={styles.info}>
            Based on your order history and payment record
          </Text>
        </View>
      )}

      <TextInput
        style={styles.input}
        placeholder="Loan Amount (KES)"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />

      {amount && (
        <View style={styles.termsCard}>
          <Text>Interest Rate: {eligibility?.interestRate}%</Text>
          <Text>Repayment Period: 30 days</Text>
          <Text>Total Repayment: KES {calculateRepayment(parseFloat(amount), eligibility?.interestRate || 0)}</Text>
        </View>
      )}

      <Button
        onPress={handleApply}
        disabled={!amount || parseFloat(amount) > (eligibility?.maxAmount || 0)}
      >
        Submit Application
      </Button>
    </ScrollView>
  );
}

// app/loans/index.tsx - Loan dashboard
function LoansScreen() {
  const [loans, setLoans] = useState<Loan[]>([]);

  useEffect(() => {
    api.getLoans({ shopId: authStore.user!.id }).then(res => {
      setLoans(res.data || []);
    });
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Loans</Text>

      <Button onPress={() => router.push('/loans/apply')}>
        Apply for New Loan
      </Button>

      {loans.map(loan => (
        <LoanCard key={loan.id} loan={loan} />
      ))}
    </View>
  );
}
```

#### 5. Airtime Services (NEW)

```typescript
// app/airtime/index.tsx
function AirtimeServicesScreen() {
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');

  return (
    <View style={styles.container}>
      <SegmentedControl
        values={['Buy Airtime', 'Sell Airtime']}
        selectedIndex={activeTab === 'buy' ? 0 : 1}
        onChange={(index) => setActiveTab(index === 0 ? 'buy' : 'sell')}
      />

      {activeTab === 'buy' ? (
        <BuyAirtimeForm />
      ) : (
        <SellAirtimeForm />
      )}

      <AirtimeTransactionHistory />
    </View>
  );
}

function BuyAirtimeForm() {
  const [provider, setProvider] = useState<'safaricom' | 'airtel'>('safaricom');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');

  const handlePurchase = async () => {
    try {
      // Initiate M-Pesa payment for airtime
      await api.purchaseAirtime({
        provider,
        phoneNumber,
        amount: parseFloat(amount)
      });

      Alert.alert('Success', `KES ${amount} airtime sent to ${phoneNumber}`);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.form}>
      <Text style={styles.label}>Select Provider</Text>
      <SegmentedControl
        values={['Safaricom', 'Airtel']}
        selectedIndex={provider === 'safaricom' ? 0 : 1}
        onChange={(index) => setProvider(index === 0 ? 'safaricom' : 'airtel')}
      />

      <TextInput
        style={styles.input}
        placeholder="Phone Number (254...)"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
      />

      <TextInput
        style={styles.input}
        placeholder="Amount (KES)"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />

      <Button onPress={handlePurchase}>
        Buy Airtime
      </Button>
    </View>
  );
}
```

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1)
- [x] Set up shared packages (types, api-client, websocket-client)
- [ ] Create Rider app structure
- [ ] Create Sales Agent app structure
- [ ] Install all required dependencies

### Phase 2: Admin Dashboard (Week 2-3)
- [ ] Authentication & layout
- [ ] Shop management (list, approve, reject)
- [ ] User management
- [ ] Product & inventory management
- [ ] Order management

### Phase 3: Admin Dashboard Advanced (Week 4)
- [ ] Route management with maps
- [ ] Real-time delivery tracking
- [ ] Performance analytics
- [ ] Financial management
- [ ] Promotions

### Phase 4: Rider App (Week 5)
- [ ] Authentication
- [ ] Route view with sequential delivery
- [ ] GPS tracking
- [ ] M-Pesa integration
- [ ] Delivery confirmation

### Phase 5: Sales Agent App (Week 6)
- [ ] Authentication
- [ ] Shop registration with GPS
- [ ] Order placement
- [ ] Performance dashboard
- [ ] Territory view

### Phase 6: Shop App Enhancements (Week 7)
- [ ] Backend integration
- [ ] M-Pesa checkout
- [ ] Real-time order tracking
- [ ] Kenix Duka loans
- [ ] Airtime services

### Phase 7: Polish & Testing (Week 8)
- [ ] Offline support
- [ ] Error handling
- [ ] Accessibility
- [ ] Performance optimization
- [ ] End-to-end testing

---

## API Integration

All apps connect to the same backend API at `http://localhost:3001/api` (development).

### Environment Variables

**Web** (`.env.local`):
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WS_URL=http://localhost:3001
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
```

**Mobile** (`.env`):
```bash
EXPO_PUBLIC_API_URL=http://192.168.1.100:3001/api
EXPO_PUBLIC_WS_URL=http://192.168.1.100:3001
```

### Authentication Flow

1. User logs in with email/password
2. Backend returns JWT token + user data
3. Token stored securely (localStorage for web, SecureStore for mobile)
4. Token auto-attached to all API requests via interceptor
5. On 401 error, redirect to login

---

## Deployment Guide

### Admin Dashboard (Web)

**Vercel** (Recommended):
```bash
cd web
vercel --prod
```

**Environment Variables**:
- `NEXT_PUBLIC_API_URL`: Production API URL
- `NEXT_PUBLIC_WS_URL`: Production WebSocket URL
- `NEXT_PUBLIC_MAPBOX_TOKEN`: Mapbox token

### Mobile Apps

**Expo EAS Build**:

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure
cd apps/rider
eas build:configure

# Build for Android
eas build --platform android --profile production

# Build for iOS
eas build --platform ios --profile production

# Submit to stores
eas submit --platform android
eas submit --platform ios
```

**App Store Requirements**:
- Privacy policy URL
- Support URL
- App icon (1024x1024)
- Screenshots for various device sizes
- App description in English and Swahili

---

## Next Steps

1. **Review this architecture document** - Ensure all requirements are covered
2. **Set up development environment** - Install dependencies for all apps
3. **Create Rider app** - Follow the structure outlined above
4. **Create Sales Agent app** - Follow the structure outlined above
5. **Transform Admin Dashboard** - Replace marketing page with admin features
6. **Enhance Shop app** - Add missing features

---

## File Locations Summary

| Package/App | Location |
|------------|----------|
| **Shared Types** | `G:\Waks\Kenix\commodies\packages\shared-types` |
| **API Client** | `G:\Waks\Kenix\commodies\packages\api-client` |
| **WebSocket Client** | `G:\Waks\Kenix\commodies\packages\websocket-client` |
| **Admin Dashboard** | `G:\Waks\Kenix\commodies\web` |
| **Rider App** | `G:\Waks\Kenix\commodies\apps\rider` [TO CREATE] |
| **Sales Agent App** | `G:\Waks\Kenix\commodies\apps\sales-agent` [TO CREATE] |
| **Shop App** | `G:\Waks\Kenix\commodies\apps\shop` [ENHANCE] |

---

**End of Frontend Architecture Document**

Generated on 2025-11-09 by Claude Code (Frontend Integration Engineer)
