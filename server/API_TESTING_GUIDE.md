# API TESTING GUIDE - KENIX COMMODITIES

Quick reference for testing all Phase 2 endpoints.

## AUTHENTICATION

All requests require JWT token:
```
Authorization: Bearer <token>
```

Get token from `/api/user/login` endpoint.

---

## ORDERS API

### 1. Create Order
```http
POST /api/orders
Content-Type: application/json
Authorization: Bearer <token>

{
  "products": [
    {
      "product": "507f1f77bcf86cd799439011",
      "quantity": 10
    }
  ],
  "paymentMethod": "mpesa",
  "deliveryNotes": "Please call before delivery"
}
```

**Sales Agent creating for shop**:
```json
{
  "shopId": "507f1f77bcf86cd799439012",
  "products": [...],
  "paymentMethod": "cash"
}
```

### 2. List Orders
```http
GET /api/orders?page=1&limit=20&status=pending&approvalStatus=approved
```

**Filters**:
- status: pending, processing, completed, cancelled
- approvalStatus: pending, approved, rejected
- deliveryStatus: pending, assigned, in_transit, delivered, failed
- shopId, riderId, routeId
- startDate, endDate (YYYY-MM-DD)

### 3. Get Single Order
```http
GET /api/orders/:id
```

### 4. Approve Order (Admin)
```http
PATCH /api/orders/:id/approve
Content-Type: application/json

{
  "notes": "Approved for next day delivery"
}
```

### 5. Reject Order (Admin)
```http
PATCH /api/orders/:id/reject
Content-Type: application/json

{
  "reason": "Insufficient stock"
}
```

### 6. Assign to Route (Admin)
```http
PATCH /api/orders/:id/assign-route
Content-Type: application/json

{
  "routeId": "507f1f77bcf86cd799439013",
  "riderId": "507f1f77bcf86cd799439014"
}
```

### 7. Remove Product (Admin)
```http
DELETE /api/orders/:id/products/:productId
```

### 8. Cancel Order
```http
PATCH /api/orders/:id/cancel
Content-Type: application/json

{
  "reason": "Customer requested cancellation"
}
```

---

## ROUTES API

### 1. Create Route (Admin)
```http
POST /api/routes
Content-Type: application/json

{
  "routeName": "Nairobi East Route",
  "description": "Covers Eastlands area",
  "shops": [
    {
      "shopId": "507f1f77bcf86cd799439015",
      "sequenceNumber": 1,
      "estimatedArrivalTime": "09:00",
      "notes": "First delivery"
    },
    {
      "shopId": "507f1f77bcf86cd799439016",
      "sequenceNumber": 2,
      "estimatedArrivalTime": "10:00"
    }
  ],
  "assignedRider": "507f1f77bcf86cd799439017",
  "startTime": "08:00",
  "endTime": "17:00",
  "operatingDays": ["monday", "tuesday", "wednesday", "thursday", "friday"]
}
```

### 2. List Routes
```http
GET /api/routes?page=1&status=active&riderId=507f1f77bcf86cd799439017
```

### 3. Get Single Route
```http
GET /api/routes/:id
```

### 4. Assign Rider (Admin)
```http
PATCH /api/routes/:id/assign-rider
Content-Type: application/json

{
  "riderId": "507f1f77bcf86cd799439017"
}
```

### 5. Update Shop Sequence (Admin)
```http
PATCH /api/routes/:id/shops
Content-Type: application/json

{
  "shops": [
    {
      "shopId": "507f1f77bcf86cd799439015",
      "sequenceNumber": 2
    },
    {
      "shopId": "507f1f77bcf86cd799439016",
      "sequenceNumber": 1
    }
  ]
}
```

### 6. Override Sequence (Admin)
```http
PATCH /api/routes/:id/override-sequence
Content-Type: application/json

{
  "currentShopId": "507f1f77bcf86cd799439015",
  "nextShopId": "507f1f77bcf86cd799439016",
  "reason": "Shop is closed today"
}
```

### 7. Get Active Route (Rider/Admin)
```http
GET /api/routes/rider/:riderId/active
```

### 8. Optimize Route (Admin)
```http
POST /api/routes/:id/optimize
```

---

## DELIVERIES API

### 1. Start Route (Rider)
```http
POST /api/deliveries/:routeId/start
```

### 2. Arrive at Shop (Rider)
```http
PATCH /api/deliveries/:deliveryId/arrive
Content-Type: application/json

{
  "location": {
    "lat": -1.286389,
    "lng": 36.817223
  },
  "timestamp": "2025-11-09T10:30:00Z"
}
```

### 3. Record Payment (Rider)
```http
POST /api/deliveries/:deliveryId/payment
Content-Type: application/json

{
  "paymentMethod": "cash",
  "amount": 5000,
  "receiptNumber": "RCP-001"
}
```

**M-Pesa Payment**:
```json
{
  "paymentMethod": "mpesa",
  "amount": 5000,
  "mpesaTransactionId": "507f1f77bcf86cd799439018"
}
```

### 4. Complete Delivery (Rider)
```http
PATCH /api/deliveries/:deliveryId/complete
Content-Type: application/json

{
  "signature": "https://storage.googleapis.com/bucket/signature.png",
  "photo": "https://storage.googleapis.com/bucket/delivery.jpg",
  "notes": "Delivered successfully",
  "recipientName": "John Doe",
  "recipientPhone": "+254712345678",
  "location": {
    "lat": -1.286389,
    "lng": 36.817223
  }
}
```

### 5. Get Next Shop (Rider)
```http
GET /api/deliveries/:deliveryId/next
```

### 6. Get Delivery Status
```http
GET /api/deliveries/:deliveryId
```

---

## WEBSOCKET CONNECTION

### Connect to WebSocket
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3001', {
  auth: {
    token: 'your-jwt-token'
  }
});

socket.on('connected', (data) => {
  console.log('Connected:', data);
});
```

### Rider Location Update
```javascript
socket.emit('rider:update-location', {
  location: { lat: -1.286389, lng: 36.817223 },
  accuracy: 10,
  timestamp: new Date().toISOString()
});
```

### Listen for Delivery Updates
```javascript
socket.on('delivery:status-changed', (data) => {
  console.log('Delivery update:', data);
});
```

### Listen for Order Updates (Shop)
```javascript
socket.on('order:updated', (data) => {
  console.log('Order update:', data);
});
```

### Listen for Route Assignment (Rider)
```javascript
socket.on('route:assigned-to-you', (data) => {
  console.log('Route assigned:', data);
});
```

---

## TESTING SCENARIOS

### Scenario 1: Complete Order Flow

1. **Shop creates order**:
   ```
   POST /api/orders
   → Order created with status: pending
   ```

2. **Admin approves**:
   ```
   PATCH /api/orders/:id/approve
   → Order status: approved
   ```

3. **Admin assigns to route**:
   ```
   PATCH /api/orders/:id/assign-route
   → Order status: assigned, Rider wallet debited
   ```

4. **Rider starts route**:
   ```
   POST /api/deliveries/:routeId/start
   → Route in_progress, Deliveries created
   ```

5. **Rider arrives at shop**:
   ```
   PATCH /api/deliveries/:deliveryId/arrive
   → Geofence validated, Status: arrived
   ```

6. **Rider collects payment**:
   ```
   POST /api/deliveries/:deliveryId/payment
   → Payment recorded
   ```

7. **Rider completes delivery**:
   ```
   PATCH /api/deliveries/:deliveryId/complete
   → Inventory updated, Wallet credited, Next shop enabled
   ```

### Scenario 2: Sequential Enforcement Test

1. Rider starts route with 3 shops
2. Rider tries to arrive at shop #2:
   ```
   PATCH /api/deliveries/:shop2DeliveryId/arrive
   → BLOCKED: "You must complete the current delivery before proceeding"
   ```

3. Rider arrives at shop #1:
   ```
   PATCH /api/deliveries/:shop1DeliveryId/arrive
   → SUCCESS
   ```

4. Rider completes shop #1:
   ```
   PATCH /api/deliveries/:shop1DeliveryId/complete
   → SUCCESS, Shop #2 now enabled
   ```

5. Rider can now arrive at shop #2:
   ```
   PATCH /api/deliveries/:shop2DeliveryId/arrive
   → SUCCESS
   ```

### Scenario 3: Admin Override

1. Route in progress, shop #2 is closed
2. Admin overrides:
   ```
   PATCH /api/routes/:routeId/override-sequence
   {
     "currentShopId": "shop2",
     "nextShopId": "shop3",
     "reason": "Shop closed for maintenance"
   }
   → Shop #2 skipped, Shop #3 enabled
   ```

---

## RESPONSE FORMATS

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    "Detailed error 1",
    "Detailed error 2"
  ]
}
```

### Paginated Response
```json
{
  "success": true,
  "message": "Data retrieved",
  "data": {
    "items": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalCount": 100,
      "limit": 20,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

## COMMON ERRORS

### 401 Unauthorized
- Missing or invalid JWT token
- Token expired

### 403 Forbidden
- User doesn't have required role
- User account banned
- Trying to access another user's data

### 404 Not Found
- Resource doesn't exist
- Invalid ObjectId format

### 400 Bad Request
- Validation errors
- Invalid data format
- Business logic violations

### 500 Internal Server Error
- Database errors
- Server configuration issues

---

## POSTMAN COLLECTION

Import this collection structure into Postman:

```
Kenix Commodities API/
├── Auth/
│   ├── Login
│   └── Register
├── Orders/
│   ├── Create Order
│   ├── List Orders
│   ├── Get Order
│   ├── Approve Order
│   ├── Reject Order
│   ├── Assign to Route
│   ├── Remove Product
│   └── Cancel Order
├── Routes/
│   ├── Create Route
│   ├── List Routes
│   ├── Get Route
│   ├── Assign Rider
│   ├── Update Sequence
│   ├── Override Sequence
│   ├── Get Active Route
│   └── Optimize Route
└── Deliveries/
    ├── Start Route
    ├── Arrive at Shop
    ├── Record Payment
    ├── Complete Delivery
    ├── Get Next Shop
    └── Get Delivery Status
```

**Environment Variables**:
- `baseUrl`: http://localhost:3001
- `token`: {{token}} (set after login)

---

## TIPS

1. Always authenticate first and save the token
2. Use the correct role for each endpoint
3. Test sequential enforcement thoroughly
4. Verify geofencing with real coordinates
5. Check WebSocket events in browser console
6. Monitor MongoDB transactions during testing
7. Test error scenarios (invalid IDs, wrong status, etc.)

---

**Happy Testing!**
