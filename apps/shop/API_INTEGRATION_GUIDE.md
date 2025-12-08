# Shop App - API Integration Quick Reference

## Base Configuration

**Backend Base URL**: `http://192.168.1.100:3001`
**WebSocket URL**: `http://192.168.1.100:3001`
**Auth Header**: `Authorization: Bearer <accessToken>`

Update in `.env`:
```env
EXPO_PUBLIC_API_URL=http://YOUR_IP:3001
EXPO_PUBLIC_WS_URL=http://YOUR_IP:3001
```

---

## API Endpoints Used

### Products
```
GET /api/products?isInStock=true&limit=20&search=rice&category=grains
```
**Usage**: `productApi.getAllProducts({ search, category, limit })`
**Location**: `store/api/product-api.ts`

### Categories
```
GET /api/categories
```
**Usage**: `categoryApi.getAllCategories()`
**Location**: `store/api/category-api.ts`

### Orders
```
POST /api/orders
Headers: { Authorization: Bearer <token> }
Body: {
  orderer: string,
  products: [{ product: string, quantity: number }],
  paymentMethod: "mpesa" | "cash",
  deliveryAddress?: string,
  deliveryNotes?: string
}
```
**Usage**: `orderApi.createOrder(data, token)`

```
GET /api/orders/my?page=1&limit=20
Headers: { Authorization: Bearer <token> }
```
**Usage**: `orderApi.getMyOrders(token, page, limit)`

```
GET /api/orders/:id
Headers: { Authorization: Bearer <token> }
```
**Usage**: `orderApi.getOrderById(id, token)`

**Location**: `store/api/order-api.ts`

### M-Pesa Payments
```
POST /api/payments/mpesa/initiate
Headers: { Authorization: Bearer <token> }
Body: {
  orderId: string,
  phoneNumber: string,  // Format: 254712345678
  amount: number
}
```
**Usage**: `initiateMpesaPayment(orderId, phoneNumber, amount, token)`

```
GET /api/payments/mpesa/:transactionId/status
Headers: { Authorization: Bearer <token> }
```
**Usage**: `checkMpesaPaymentStatus(transactionId, token)`

**Location**: `services/mpesa.ts`

### Push Notifications
```
POST /api/user/push-token
Headers: { Authorization: Bearer <token> }
Body: { pushToken: string }
```
**Usage**: `sendPushTokenToBackend(token, authToken)`
**Location**: `services/notifications.ts`

---

## WebSocket Events

### Client Listens For:

#### Payment Confirmation
```typescript
socket.on('payment:confirmed', (data) => {
  // data: { orderId, transactionId, mpesaReceiptNumber, amount, status }
});
```
**Usage**: `onPaymentConfirmation(callback)`
**Location**: `services/websocket.ts`

#### Payment Failed
```typescript
socket.on('payment:failed', (data) => {
  // data: { orderId, reason }
});
```
**Usage**: `onPaymentFailed(callback)`

#### Rider Location Update
```typescript
socket.on('rider:location-updated', (data) => {
  // data: { routeId, location: { latitude, longitude }, timestamp }
});
```
**Usage**: `onRiderLocationUpdate(callback)`

#### Delivery Status Change
```typescript
socket.on('delivery:status-changed', (data) => {
  // data: { orderId, status, timestamp }
});
```
**Usage**: `onDeliveryStatusChange(callback)`

---

## Data Flow Examples

### 1. Product Browsing
```
User opens app
  → productApi.getAllProducts({ isInStock: true })
  → GET /api/products?isInStock=true
  → Response cached for 5 minutes
  → Products displayed in grid
```

### 2. Checkout Flow
```
User in cart taps "Checkout"
  → Navigate to /checkout
  → User enters delivery info
  → User selects M-Pesa payment
  → User enters phone: "0712345678"
  → Phone formatted to: "254712345678"
  → User taps "Place Order"

  → orderApi.createOrder(data, token)
  → POST /api/orders
  → Backend creates order with status "pending"
  → Response: { order: { orderId: "ORDER-xxx", ... } }

  → initiateMpesaPayment(orderId, "254712345678", 1500, token)
  → POST /api/payments/mpesa/initiate
  → Backend triggers STK push to phone
  → Response: { transactionId: "TX-xxx" }

  → listenForPaymentConfirmation(orderId, onSuccess, onFailure)
  → WebSocket listener registered
  → Loading screen shown (2-minute countdown)

  [User enters PIN on phone]

  → Backend receives M-Pesa callback
  → Backend emits: socket.emit('payment:confirmed', { orderId, ... })
  → App receives event
  → onSuccess callback triggered
  → Navigate to success screen
  → clearCart()
```

### 3. Order Tracking
```
User taps order in list
  → Navigate to /orders/:id
  → orderApi.getOrderById(id, token)
  → GET /api/orders/:id
  → Order details displayed

  If order status = "In Transit":
    → connectWebSocket()
    → onRiderLocationUpdate((data) => {
        if (data.routeId === order.assignedRoute) {
          setRiderLocation(data.location)
          updateMap()
        }
      })
    → Map shows:
        • Shop location (red marker)
        • Rider location (blue marker, updates every 3-5 seconds)
        • Route line between them
        • ETA calculated from distance
```

### 4. Real-Time Payment Confirmation
```
[Backend receives M-Pesa callback]

Backend:
  1. Validates M-Pesa response
  2. Updates order payment status
  3. Finds user's socket connection
  4. Emits event:
     socket.emit('payment:confirmed', {
       orderId: "ORDER-123",
       transactionId: "TX-456",
       mpesaReceiptNumber: "ABC123XYZ",
       amount: 1500,
       status: "success"
     })

App (WebSocket listener):
  1. Receives event
  2. Checks if orderId matches current order
  3. Triggers success callback
  4. Shows success screen
  5. Displays receipt number
  6. Clears cart
  7. Offers "Track Order" button
```

---

## Error Handling

### Network Errors
```typescript
try {
  const orders = await orderApi.getMyOrders(token);
} catch (error) {
  // error is already parsed by parseApiError()
  Toast.show({
    type: 'error',
    text1: 'Error',
    text2: error.message
  });
}
```

### M-Pesa Timeout
```typescript
// Automatic 2-minute timeout in listenForPaymentConfirmation()
// If no response after 120 seconds:
onFailure("Payment timeout - please try again");
```

### WebSocket Reconnection
```typescript
// Automatic reconnection in websocket.ts
socket = io(WEBSOCKET_URL, {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5
});
```

---

## Testing API Integration

### 1. Test Product Loading
```bash
# Backend should be running
curl http://192.168.1.100:3001/api/products?isInStock=true

# App: Open home screen, products should load
```

### 2. Test Order Creation
```bash
# Get auth token first
TOKEN="your-jwt-token"

curl -X POST http://192.168.1.100:3001/api/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderer": "user-id",
    "products": [{ "product": "product-id", "quantity": 2 }],
    "paymentMethod": "mpesa"
  }'

# App: Add items to cart, go to checkout, place order
```

### 3. Test M-Pesa STK Push
```bash
curl -X POST http://192.168.1.100:3001/api/payments/mpesa/initiate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORDER-123",
    "phoneNumber": "254712345678",
    "amount": 100
  }'

# App: Complete checkout, check phone for M-Pesa prompt
```

### 4. Test WebSocket Connection
```javascript
// In app, check console logs:
// "[WebSocket] Connected to server" - Success
// "[WebSocket] Connection error: ..." - Check backend
```

### 5. Test Real-Time Updates
```bash
# Manually emit WebSocket event from backend (for testing):
socket.to(userId).emit('payment:confirmed', {
  orderId: "ORDER-123",
  transactionId: "TX-456",
  mpesaReceiptNumber: "ABC123",
  amount: 100,
  status: "success"
});

# App should immediately show success screen
```

---

## Common Issues & Solutions

### Products Not Loading
**Symptom**: Empty product grid
**Check**:
1. Is backend running? `curl http://192.168.1.100:3001/api/products`
2. Are products in stock? Check `isInStock: true` in database
3. Network error? Check `.env` file has correct IP
4. Check console logs for API errors

**Fix**:
```typescript
// In product-api.ts, check response:
console.log('Products response:', response.data);
```

### WebSocket Not Connecting
**Symptom**: No real-time updates
**Check**:
1. Backend WebSocket server running?
2. Correct WebSocket URL in `.env`?
3. JWT token valid?

**Fix**:
```typescript
// In websocket.ts, add logs:
socket.on('connect', () => {
  console.log('[WebSocket] Connected!');
});
```

### M-Pesa STK Push Not Received
**Symptom**: No M-Pesa prompt on phone
**Check**:
1. Phone number format: `254712345678` (no +, no spaces)
2. Phone has network connection
3. M-Pesa service active (Safaricom Kenya)
4. Backend M-Pesa credentials configured

**Fix**:
```typescript
// Check formatted phone:
console.log('Formatted phone:', formatPhoneNumber('0712345678'));
// Should output: "254712345678"
```

### Payment Timeout
**Symptom**: "Payment timeout" error after 2 minutes
**Possible Causes**:
1. User didn't enter PIN
2. User cancelled prompt
3. Network delay
4. M-Pesa service down

**Solution**: Offer "Retry Payment" button (already implemented)

### Map Not Showing
**Symptom**: Blank map in order tracking
**Check (Android)**:
1. Google Maps API key configured?
2. API key has Maps SDK for Android enabled?
3. Billing enabled on Google Cloud?

**Check (iOS)**:
- iOS uses Apple Maps, should work automatically

**Fix**:
```json
// In app.json
{
  "android": {
    "config": {
      "googleMaps": {
        "apiKey": "YOUR_ACTUAL_KEY_HERE"
      }
    }
  }
}
```

---

## Performance Optimization

### Caching Strategy
```typescript
// Products cached for 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

// Clear cache manually:
productApi.clearCache();
categoryApi.clearCache();
```

### Debounced Search
```typescript
// Search waits 500ms after user stops typing
const debouncedSearch = useDebounce(searchTerm, 500);

useEffect(() => {
  if (debouncedSearch) {
    productApi.getAllProducts({ search: debouncedSearch });
  }
}, [debouncedSearch]);
```

### WebSocket Cleanup
```typescript
// Always cleanup WebSocket listeners:
useEffect(() => {
  const cleanup = onRiderLocationUpdate(handleUpdate);
  return cleanup; // Cleanup on unmount
}, []);
```

---

## Security Considerations

### Token Storage
- ✅ Tokens stored in `expo-secure-store` (encrypted)
- ✅ Tokens sent in Authorization header
- ❌ Never log tokens to console in production

### Phone Number Validation
```typescript
// Always validate before sending to backend
if (!validatePhoneNumber(phone)) {
  Alert.alert('Invalid Phone', 'Enter valid Kenya number');
  return;
}
```

### Input Sanitization
```typescript
// Data sanitizer automatically removes unsafe fields
const sanitized = sanitizeProduct(product, PRODUCT_FIELDS);
```

---

## Monitoring & Debugging

### Network Monitoring
```bash
# React Native Debugger
# View → Toggle Developer Tools → Network tab
```

### WebSocket Monitoring
```typescript
// Enable verbose logging:
socket.on('connect', () => console.log('✅ Connected'));
socket.on('disconnect', () => console.log('❌ Disconnected'));
socket.on('error', (err) => console.error('❌ Error:', err));
```

### Payment Flow Logging
```typescript
// In checkout.tsx, log each step:
console.log('1. Creating order...');
console.log('2. Order created:', orderId);
console.log('3. Initiating M-Pesa...');
console.log('4. STK push sent:', transactionId);
console.log('5. Waiting for confirmation...');
console.log('6. Payment confirmed!');
```

---

## Production Readiness Checklist

- [x] API endpoints configured
- [x] Error handling implemented
- [x] Loading states for all async operations
- [x] WebSocket reconnection logic
- [x] Phone number validation
- [x] Payment timeout handling
- [x] Empty states for lists
- [x] Pull-to-refresh on lists
- [ ] Backend URL updated for production
- [ ] Google Maps API key updated
- [ ] Expo project ID updated
- [ ] Push notification icons added
- [ ] Error tracking (Sentry) added
- [ ] Analytics added
- [ ] Beta testing completed

---

**Last Updated**: 2025-11-09
**Status**: Development Complete ✅
**Ready For**: Testing & Production Deployment
