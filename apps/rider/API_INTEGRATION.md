# Kenix Rider App - Backend API Integration

## Base Configuration

```typescript
// apps/rider/services/api.ts
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.100:3001/api';
const WS_URL = process.env.EXPO_PUBLIC_WS_URL || 'http://192.168.1.100:3001';
```

## Authentication

All API requests (except login) require Bearer token in header:

```typescript
Authorization: Bearer <accessToken>
```

Token is automatically added by Axios interceptor.

## API Endpoints

### 1. User Authentication

#### Login

```http
POST /api/user/login
Content-Type: application/json

{
  "email": "rider@kenix.com",
  "password": "rider123"
}
```

**Response (200)**:
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Kamau",
    "email": "rider@kenix.com",
    "phoneNumber": "+254712345678",
    "role": "rider",
    "avatar": "https://..."
  }
}
```

**Usage in App**:
```typescript
// services/api.ts
const response = await authService.login(email, password);
await SecureStore.setItemAsync('accessToken', response.accessToken);
await SecureStore.setItemAsync('user', JSON.stringify(response.user));
```

### 2. Routes

#### Get Active Route

```http
GET /api/routes/rider/:riderId/active
Authorization: Bearer <token>
```

**Response (200)**:
```json
{
  "success": true,
  "route": {
    "_id": "507f1f77bcf86cd799439022",
    "riderId": "507f1f77bcf86cd799439011",
    "status": "in_progress",
    "totalDeliveries": 15,
    "completedDeliveries": 3,
    "startTime": "2025-11-09T06:00:00.000Z",
    "deliveries": [
      {
        "_id": "507f1f77bcf86cd799439033",
        "shopId": {
          "_id": "507f1f77bcf86cd799439044",
          "shopName": "Mama Njoki's Shop",
          "ownerName": "Jane Njoki",
          "phoneNumber": "+254722334455",
          "address": "Kawangware, Nairobi",
          "location": {
            "type": "Point",
            "coordinates": [36.7219, -1.2921]
          }
        },
        "orderId": "507f1f77bcf86cd799439055",
        "items": [
          {
            "productId": "507f1f77bcf86cd799439066",
            "productName": "Maize Flour 2kg",
            "quantity": 10,
            "pricePerUnit": 150,
            "totalPrice": 1500
          },
          {
            "productId": "507f1f77bcf86cd799439077",
            "productName": "Sugar 1kg",
            "quantity": 5,
            "pricePerUnit": 180,
            "totalPrice": 900
          }
        ],
        "totalAmount": 2400,
        "deliverySequence": 4,
        "status": "pending",
        "assignedRiderId": "507f1f77bcf86cd799439011"
      }
    ]
  }
}
```

**Response (404)** - No active route:
```json
{
  "success": false,
  "message": "No active route found for rider"
}
```

**Usage in App**:
```typescript
// store/routeStore.ts
const route = await routeService.getActiveRoute(riderId);
set({ activeRoute: route });
```

#### Get Current Delivery

```http
GET /api/routes/:routeId/current-delivery
Authorization: Bearer <token>
```

**Response (200)**:
```json
{
  "success": true,
  "delivery": {
    "_id": "507f1f77bcf86cd799439033",
    "shopId": { /* full shop object */ },
    "items": [ /* order items */ ],
    "totalAmount": 2400,
    "deliverySequence": 4,
    "status": "pending"
  }
}
```

### 3. Deliveries

#### Mark Arrival

```http
PATCH /api/deliveries/:deliveryId/arrive
Authorization: Bearer <token>
Content-Type: application/json

{
  "location": {
    "lat": -1.2921,
    "lng": 36.7219
  },
  "timestamp": "2025-11-09T08:30:00.000Z"
}
```

**Response (200)**:
```json
{
  "success": true,
  "delivery": {
    "_id": "507f1f77bcf86cd799439033",
    "status": "arrived",
    "arrivalTime": "2025-11-09T08:30:00.000Z",
    "arrivalLocation": {
      "lat": -1.2921,
      "lng": 36.7219
    }
  }
}
```

**Usage in App**:
```typescript
// store/routeStore.ts
const location = await getCurrentLocation();
await markArrival(deliveryId, location);
```

#### Submit Payment

```http
POST /api/deliveries/:deliveryId/payment
Authorization: Bearer <token>
Content-Type: application/json

{
  "paymentMethod": "mpesa",
  "amount": 2400,
  "phoneNumber": "+254722334455"
}
```

**Response (200)** - M-Pesa:
```json
{
  "success": true,
  "message": "STK push sent to +254722334455",
  "transactionId": "MPE123456789"
}
```

**Response (200)** - Cash/Airtel:
```json
{
  "success": true,
  "message": "Payment recorded successfully"
}
```

**WebSocket Event** (M-Pesa confirmation):
```json
{
  "event": "payment:confirmed",
  "data": {
    "deliveryId": "507f1f77bcf86cd799439033",
    "status": "confirmed",
    "transactionId": "MPE123456789",
    "amount": 2400
  }
}
```

**Usage in App**:
```typescript
// components/DeliveryFlowModal.tsx
const response = await deliveryService.submitPayment(deliveryId, {
  paymentMethod: 'mpesa',
  amount: totalAmount,
  phoneNumber: shopPhoneNumber,
});

// Listen for confirmation
websocketService.on('payment:confirmed', (data) => {
  if (data.deliveryId === deliveryId) {
    setPaymentConfirmed(true);
    setStep('completion');
  }
});
```

#### Complete Delivery

```http
PATCH /api/deliveries/:deliveryId/complete
Authorization: Bearer <token>
Content-Type: application/json

{
  "paymentMethod": "mpesa",
  "signature": "M 10 20 L 30 40 L 50 30...",
  "photo": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "notes": "Left at reception",
  "location": {
    "lat": -1.2921,
    "lng": 36.7219
  },
  "timestamp": "2025-11-09T08:45:00.000Z"
}
```

**Response (200)**:
```json
{
  "success": true,
  "delivery": {
    "_id": "507f1f77bcf86cd799439033",
    "status": "completed",
    "completionTime": "2025-11-09T08:45:00.000Z",
    "paymentMethod": "mpesa",
    "signature": "M 10 20 L 30 40...",
    "photo": "https://storage.kenix.com/deliveries/...",
    "notes": "Left at reception"
  }
}
```

**Usage in App**:
```typescript
// components/DeliveryFlowModal.tsx
await deliveryService.completeDelivery(deliveryId, {
  paymentMethod,
  signature,
  photo,
  notes,
  location,
});

// Reload route and wallet
await loadActiveRoute(riderId);
await loadWallet(riderId);
```

### 4. Location Tracking

#### Update Rider Location

```http
POST /api/maps/rider/:riderId/location
Authorization: Bearer <token>
Content-Type: application/json

{
  "lat": -1.2921,
  "lng": 36.7219
}
```

**Response (200)**:
```json
{
  "success": true,
  "message": "Location updated"
}
```

**Usage in App**:
```typescript
// services/location.ts (Background Task)
TaskManager.defineTask('rider-background-location', async ({ data }) => {
  const { locations } = data;
  const location = locations[0];

  await locationService.updateRiderLocation(riderId, {
    lat: location.coords.latitude,
    lng: location.coords.longitude,
  });

  websocketService.emitLocation({
    lat: location.coords.latitude,
    lng: location.coords.longitude,
  });
});
```

### 5. Wallet

#### Get Wallet Balance

```http
GET /api/wallet/rider/:riderId
Authorization: Bearer <token>
```

**Response (200)**:
```json
{
  "success": true,
  "wallet": {
    "riderId": "507f1f77bcf86cd799439011",
    "balance": -45000,
    "transactions": [
      {
        "_id": "507f1f77bcf86cd799439088",
        "type": "delivery_complete",
        "amount": -2400,
        "balanceAfter": -45000,
        "description": "Delivery to Mama Njoki's Shop",
        "timestamp": "2025-11-09T08:45:00.000Z",
        "deliveryId": "507f1f77bcf86cd799439033"
      },
      {
        "_id": "507f1f77bcf86cd799439099",
        "type": "assignment",
        "amount": 150000,
        "balanceAfter": -42600,
        "description": "Route assignment: 15 deliveries",
        "timestamp": "2025-11-09T06:00:00.000Z"
      }
    ]
  }
}
```

**Usage in App**:
```typescript
// app/(tabs)/wallet.tsx
const wallet = await walletService.getWallet(riderId);
set({ wallet });
```

#### Get Transactions

```http
GET /api/wallet/rider/:riderId/transactions?limit=50
Authorization: Bearer <token>
```

**Response (200)**:
```json
{
  "success": true,
  "transactions": [ /* array of transactions */ ]
}
```

### 6. Statistics

#### Get Rider Stats

```http
GET /api/stats/rider/:riderId
Authorization: Bearer <token>
```

**Response (200)**:
```json
{
  "success": true,
  "stats": {
    "today": {
      "deliveriesCompleted": 8,
      "totalDeliveries": 15,
      "amountCollected": 125000,
      "averageTimePerDelivery": 18.5
    },
    "weekly": {
      "deliveriesCompleted": 67,
      "amountCollected": 845000,
      "rating": 4.8
    }
  }
}
```

**Usage in App**:
```typescript
// app/(tabs)/profile.tsx
const stats = await statsService.getStats(riderId);
setStats(stats);
```

## WebSocket Events

### Connection

```typescript
// services/websocket.ts
const socket = io(WS_URL, {
  auth: { token: accessToken },
  transports: ['websocket'],
});
```

### Events Emitted by App

#### Update Location

```typescript
socket.emit('rider:update-location', {
  location: {
    lat: -1.2921,
    lng: 36.7219
  }
});
```

#### Update Delivery Status

```typescript
socket.emit('delivery:status-update', {
  deliveryId: '507f1f77bcf86cd799439033',
  status: 'arrived'
});
```

### Events Received by App

#### Payment Confirmed

```typescript
socket.on('payment:confirmed', (data) => {
  // data: { deliveryId, status, transactionId, amount }
  console.log('Payment confirmed:', data);
});
```

#### Route Updated

```typescript
socket.on('route:updated', (data) => {
  // data: { routeId, changes }
  console.log('Route updated:', data);
  // Reload active route
});
```

#### Delivery Assigned

```typescript
socket.on('delivery:assigned', (data) => {
  // data: { deliveryId, shopName, sequence }
  console.log('New delivery assigned:', data);
  // Show notification
});
```

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "error": "VALIDATION_ERROR" // Optional error code
}
```

### Common HTTP Status Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request (validation error)
- **401**: Unauthorized (invalid/expired token)
- **404**: Not Found
- **500**: Internal Server Error

### Error Handling in App

```typescript
// services/api.ts
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired - logout user
      await SecureStore.deleteItemAsync('accessToken');
      router.replace('/(auth)/login');
    }

    // Show user-friendly error
    const message = error.response?.data?.message || 'An error occurred';
    Alert.alert('Error', message);

    return Promise.reject(error);
  }
);
```

## Request/Response Flow Examples

### Complete Delivery Flow

```
1. User arrives at shop
   → GET /api/routes/rider/:riderId/active
   ← Current delivery data

2. Check geofence (client-side)
   → Calculate distance to shop
   ← Within 100m? Enable "I've Arrived"

3. Mark arrival
   → PATCH /api/deliveries/:deliveryId/arrive
   ← Delivery status: "arrived"

4. Collect payment (M-Pesa)
   → POST /api/deliveries/:deliveryId/payment
   ← STK push sent

5. Wait for confirmation
   ← WebSocket: payment:confirmed
   → Proceed to completion

6. Complete delivery
   → PATCH /api/deliveries/:deliveryId/complete
   ← Delivery status: "completed"

7. Update wallet
   → GET /api/wallet/rider/:riderId
   ← New balance and transactions

8. Load next delivery
   → GET /api/routes/:routeId/current-delivery
   ← Next shop data
```

### Background Location Updates

```
Every 10 seconds (or 50 meters):

1. Background task gets location
   → lat: -1.2921, lng: 36.7219

2. Send to API
   → POST /api/maps/rider/:riderId/location

3. Emit via WebSocket
   → socket.emit('rider:update-location', { location })

Backend processes:
- Updates rider location in database
- Broadcasts to admin dashboard
- Calculates ETA for shops
```

## Testing API Integration

### Using Postman/cURL

```bash
# Login
curl -X POST http://localhost:3001/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"email":"rider@kenix.com","password":"rider123"}'

# Get active route
curl -X GET http://localhost:3001/api/routes/rider/507f1f77bcf86cd799439011/active \
  -H "Authorization: Bearer <token>"

# Mark arrival
curl -X PATCH http://localhost:3001/api/deliveries/507f1f77bcf86cd799439033/arrive \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"location":{"lat":-1.2921,"lng":36.7219},"timestamp":"2025-11-09T08:30:00Z"}'
```

### Mock API Responses

For development without backend, create mock responses:

```typescript
// services/api.mock.ts
export const mockRouteService = {
  getActiveRoute: async () => ({
    _id: '1',
    riderId: '1',
    status: 'in_progress',
    totalDeliveries: 5,
    completedDeliveries: 2,
    deliveries: [/* mock deliveries */],
  }),
};
```

## Performance Optimization

### Request Caching

```typescript
// Cache active route for 30 seconds
const cacheKey = `route-${riderId}`;
const cached = await AsyncStorage.getItem(cacheKey);

if (cached) {
  const { data, timestamp } = JSON.parse(cached);
  if (Date.now() - timestamp < 30000) {
    return data;
  }
}

const route = await api.get(`/routes/rider/${riderId}/active`);
await AsyncStorage.setItem(cacheKey, JSON.stringify({
  data: route,
  timestamp: Date.now(),
}));
```

### Retry Logic

```typescript
// Retry failed requests up to 3 times
const MAX_RETRIES = 3;

async function apiRequestWithRetry(requestFn, retries = 0) {
  try {
    return await requestFn();
  } catch (error) {
    if (retries < MAX_RETRIES && error.response?.status >= 500) {
      await delay(1000 * (retries + 1));
      return apiRequestWithRetry(requestFn, retries + 1);
    }
    throw error;
  }
}
```

## Security Best Practices

1. **Never log tokens**: Don't console.log sensitive data
2. **Use HTTPS in production**: Update API_URL to https://
3. **Validate responses**: Check response structure before using
4. **Handle expired tokens**: Auto-logout on 401
5. **Sanitize inputs**: Validate all user inputs before sending
6. **Rate limiting**: Backend should implement rate limits
7. **CORS**: Backend should restrict origins in production

## Troubleshooting

### Connection Issues

```typescript
// Check API connectivity
const healthCheck = async () => {
  try {
    const response = await api.get('/health');
    console.log('API is reachable:', response.data);
  } catch (error) {
    console.error('API unreachable:', error);
  }
};
```

### WebSocket Issues

```typescript
// Monitor WebSocket connection
socket.on('connect', () => {
  console.log('WebSocket connected');
});

socket.on('disconnect', (reason) => {
  console.log('WebSocket disconnected:', reason);
  if (reason === 'io server disconnect') {
    socket.connect(); // Manual reconnect
  }
});

socket.on('connect_error', (error) => {
  console.error('WebSocket error:', error);
});
```
