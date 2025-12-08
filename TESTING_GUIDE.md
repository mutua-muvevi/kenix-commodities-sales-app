# Kenix Commodities - Comprehensive Testing Guide

**Version:** 1.0.0
**Last Updated:** 2025-11-09
**Estimated Testing Time:** 6-8 hours (complete suite)

---

## Table of Contents

1. [Overview](#overview)
2. [Pre-Launch Testing Checklist](#pre-launch-testing-checklist)
3. [Backend API Testing](#backend-api-testing)
4. [Admin Dashboard Testing](#admin-dashboard-testing)
5. [Mobile Apps Testing](#mobile-apps-testing)
6. [Integration Testing](#integration-testing)
7. [Performance Testing](#performance-testing)
8. [Security Testing](#security-testing)
9. [User Acceptance Testing](#user-acceptance-testing)
10. [Automated Testing](#automated-testing)

---

## Overview

Comprehensive testing ensures Kenix Commodities launches without critical bugs and provides excellent user experience.

**Testing Pyramid:**
```
         ┌───────────────┐
         │   Manual UAT  │  (User Acceptance)
         └───────────────┘
       ┌───────────────────┐
       │  Integration Tests│
       └───────────────────┘
    ┌────────────────────────┐
    │    API/Unit Tests      │
    └────────────────────────┘
```

**Testing Goals:**
- Zero critical bugs at launch
- All user workflows functional
- Performance meets SLA (< 2s response time)
- Security vulnerabilities addressed
- 99.9% uptime capability verified

---

## Pre-Launch Testing Checklist

**Complete ALL items before going live:**

### Environment Preparation
- [ ] Production environment deployed (see DEPLOYMENT_GUIDE.md)
- [ ] All API keys configured correctly
- [ ] Database populated with test data
- [ ] SSL certificates valid
- [ ] DNS configured and propagated
- [ ] Monitoring tools installed (see MONITORING_GUIDE.md)

### Test Data Setup
- [ ] Create test admin user
- [ ] Create test shop owners (5-10)
- [ ] Create test sales agents (3-5)
- [ ] Create test riders (3-5)
- [ ] Add test products (20-30)
- [ ] Add test categories
- [ ] Set up test payment accounts (M-Pesa sandbox)

### Tools Required
- [ ] Postman or Insomnia (API testing)
- [ ] Chrome DevTools (Frontend debugging)
- [ ] Android device/emulator (Mobile testing)
- [ ] iOS device/simulator (Mobile testing, if applicable)
- [ ] Artillery or k6 (Load testing)
- [ ] OWASP ZAP or Burp Suite (Security testing)

---

## Backend API Testing

**Goal:** Verify all 72+ endpoints work correctly.

### 1. Authentication Endpoints

**Test: User Registration**

```bash
# POST /api/auth/register
curl -X POST https://api.kenixcommodities.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "Shop",
    "email": "testshop@example.com",
    "phone": "+254712345678",
    "password": "TestPass123!",
    "role": "shop"
  }'
```

**Expected:**
- ✅ Status: 201 Created
- ✅ Response contains: user object, access token, refresh token
- ✅ User saved to database
- ✅ Password hashed (bcrypt)
- ✅ Email validation works
- ✅ Duplicate email rejected (409 Conflict)

**Test Cases:**
- [ ] Valid registration succeeds
- [ ] Duplicate email rejected
- [ ] Invalid email format rejected
- [ ] Weak password rejected
- [ ] Missing required fields rejected (400 Bad Request)
- [ ] Invalid role rejected

---

**Test: User Login**

```bash
# POST /api/auth/login
curl -X POST https://api.kenixcommodities.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testshop@example.com",
    "password": "TestPass123!"
  }'
```

**Expected:**
- ✅ Status: 200 OK
- ✅ Returns: access token (JWT), refresh token
- ✅ Token contains correct user ID and role
- ✅ Token expiry set correctly (1 hour for access, 30 days for refresh)

**Test Cases:**
- [ ] Valid credentials succeed
- [ ] Invalid email returns 401 Unauthorized
- [ ] Invalid password returns 401 Unauthorized
- [ ] Account lockout after 5 failed attempts (if implemented)
- [ ] Disabled user cannot login

---

**Test: Token Refresh**

```bash
# POST /api/auth/refresh
curl -X POST https://api.kenixcommodities.com/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "your_refresh_token_here"
  }'
```

**Expected:**
- ✅ Status: 200 OK
- ✅ Returns: new access token
- ✅ Old access token invalidated
- ✅ Invalid/expired refresh token rejected (401)

---

**Test: Logout**

```bash
# POST /api/auth/logout
curl -X POST https://api.kenixcommodities.com/api/auth/logout \
  -H "Authorization: Bearer your_access_token"
```

**Expected:**
- ✅ Status: 200 OK
- ✅ Token invalidated (subsequent requests fail with 401)

---

### 2. User Management Endpoints

**Test: Get Current User**

```bash
# GET /api/users/me
curl https://api.kenixcommodities.com/api/users/me \
  -H "Authorization: Bearer your_access_token"
```

**Expected:**
- ✅ Status: 200 OK
- ✅ Returns current user object
- ✅ No password in response
- ✅ Unauthorized without token (401)

---

**Test: Update User Profile**

```bash
# PATCH /api/users/me
curl -X PATCH https://api.kenixcommodities.com/api/users/me \
  -H "Authorization: Bearer your_access_token" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Updated",
    "phone": "+254798765432"
  }'
```

**Expected:**
- ✅ Status: 200 OK
- ✅ User updated in database
- ✅ Cannot update email (if restricted)
- ✅ Cannot update role (security check)

---

### 3. Product Management

**Test: Create Product (Admin Only)**

```bash
# POST /api/products
curl -X POST https://api.kenixcommodities.com/api/products \
  -H "Authorization: Bearer admin_access_token" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Premium Rice",
    "description": "High quality rice",
    "category": "grains",
    "unit": "kg",
    "price": 150,
    "stock": 1000,
    "image": "https://storage.googleapis.com/bucket/rice.jpg"
  }'
```

**Expected:**
- ✅ Status: 201 Created
- ✅ Product saved to database
- ✅ Returns product with generated _id
- ✅ Non-admin users rejected (403 Forbidden)

**Test Cases:**
- [ ] Admin can create product
- [ ] Shop owner cannot create product (403)
- [ ] Rider cannot create product (403)
- [ ] Sales agent cannot create product (403)
- [ ] Duplicate product name handled
- [ ] Invalid category rejected
- [ ] Negative price rejected
- [ ] Missing required fields rejected

---

**Test: List Products (Paginated)**

```bash
# GET /api/products?page=1&limit=10&category=grains&sort=price
curl https://api.kenixcommodities.com/api/products?page=1&limit=10 \
  -H "Authorization: Bearer your_access_token"
```

**Expected:**
- ✅ Status: 200 OK
- ✅ Returns paginated products
- ✅ Includes: data, total, page, totalPages
- ✅ Filters work (category, search)
- ✅ Sorting works (price, name, createdAt)

**Test Cases:**
- [ ] Pagination works correctly
- [ ] Filtering by category works
- [ ] Search by name works
- [ ] Sorting by price (asc/desc) works
- [ ] Empty results return 200 with empty array
- [ ] Invalid page/limit handled gracefully

---

**Test: Update Product**

```bash
# PATCH /api/products/:id
curl -X PATCH https://api.kenixcommodities.com/api/products/product_id_here \
  -H "Authorization: Bearer admin_access_token" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 160,
    "stock": 900
  }'
```

**Expected:**
- ✅ Status: 200 OK
- ✅ Product updated
- ✅ Only admin can update
- ✅ Invalid ID returns 404

---

**Test: Delete Product**

```bash
# DELETE /api/products/:id
curl -X DELETE https://api.kenixcommodities.com/api/products/product_id_here \
  -H "Authorization: Bearer admin_access_token"
```

**Expected:**
- ✅ Status: 200 OK or 204 No Content
- ✅ Product deleted (or soft deleted)
- ✅ Only admin can delete
- ✅ Cannot delete product in active orders (business rule check)

---

### 4. Order Management

**Test: Create Order (Shop Owner)**

```bash
# POST /api/orders
curl -X POST https://api.kenixcommodities.com/api/orders \
  -H "Authorization: Bearer shop_access_token" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "product": "product_id_1",
        "quantity": 50,
        "price": 150
      },
      {
        "product": "product_id_2",
        "quantity": 30,
        "price": 200
      }
    ],
    "deliveryAddress": {
      "street": "123 Main St",
      "city": "Nairobi",
      "coordinates": {
        "lat": -1.286389,
        "lng": 36.817223
      }
    },
    "deliveryDate": "2025-11-15",
    "paymentMethod": "mpesa"
  }'
```

**Expected:**
- ✅ Status: 201 Created
- ✅ Order saved with status: pending
- ✅ Total calculated correctly
- ✅ Stock reserved (if implemented)
- ✅ Shop owner can only create orders for themselves
- ✅ Sales agent can create orders for shops

**Test Cases:**
- [ ] Order creation succeeds
- [ ] Total calculated correctly (sum of items)
- [ ] Delivery date validation (not in past)
- [ ] Invalid product ID rejected
- [ ] Quantity exceeds stock rejected
- [ ] Missing required fields rejected
- [ ] Shop cannot order for other shops

---

**Test: Get Orders (Filtered by Role)**

```bash
# GET /api/orders
curl https://api.kenixcommodities.com/api/orders \
  -H "Authorization: Bearer your_access_token"
```

**Expected:**
- ✅ Admin: Sees all orders
- ✅ Shop owner: Sees only their orders
- ✅ Sales agent: Sees orders they created
- ✅ Rider: Sees assigned orders

---

**Test: Update Order Status (Admin/Rider)**

```bash
# PATCH /api/orders/:id/status
curl -X PATCH https://api.kenixcommodities.com/api/orders/order_id/status \
  -H "Authorization: Bearer admin_or_rider_token" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_transit"
  }'
```

**Expected:**
- ✅ Status: 200 OK
- ✅ Order status updated
- ✅ Invalid status transition rejected (e.g., pending → delivered)
- ✅ Status history recorded
- ✅ Notification sent to shop owner

**Valid Status Flow:**
- pending → confirmed → in_transit → delivered → completed
- Any status → cancelled (by admin)

---

### 5. Delivery Management

**Test: Assign Rider to Order**

```bash
# PATCH /api/orders/:id/assign-rider
curl -X PATCH https://api.kenixcommodities.com/api/orders/order_id/assign-rider \
  -H "Authorization: Bearer admin_token" \
  -H "Content-Type: application/json" \
  -d '{
    "riderId": "rider_user_id"
  }'
```

**Expected:**
- ✅ Status: 200 OK
- ✅ Rider assigned
- ✅ Rider notified
- ✅ Order status changed to assigned

---

**Test: Sequential Delivery Enforcement**

**Scenario:** Rider has 3 orders for the day: A, B, C (in sequence)

```bash
# Try to deliver order C before B
curl -X PATCH https://api.kenixcommodities.com/api/orders/order_c_id/status \
  -H "Authorization: Bearer rider_token" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "delivered"
  }'
```

**Expected:**
- ❌ Status: 400 Bad Request
- ❌ Error: "Must deliver orders in sequence. Complete order B first."

---

**Test: Admin Override for Sequential Delivery**

```bash
# Admin can override sequence
curl -X PATCH https://api.kenixcommodities.com/api/orders/order_c_id/status \
  -H "Authorization: Bearer admin_token" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "delivered",
    "overrideSequence": true
  }'
```

**Expected:**
- ✅ Status: 200 OK
- ✅ Order marked delivered (sequence bypassed)

---

### 6. Payment Integration (M-Pesa)

**Test: Initiate M-Pesa STK Push**

```bash
# POST /api/payments/mpesa/stk-push
curl -X POST https://api.kenixcommodities.com/api/payments/mpesa/stk-push \
  -H "Authorization: Bearer shop_token" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "order_id_here",
    "phoneNumber": "254712345678",
    "amount": 7500
  }'
```

**Expected:**
- ✅ Status: 200 OK
- ✅ STK push triggered
- ✅ Returns: CheckoutRequestID, MerchantRequestID
- ✅ Customer receives M-Pesa prompt on phone
- ✅ Payment status: pending

**Test Cases:**
- [ ] STK push initiated successfully
- [ ] Invalid phone number rejected
- [ ] Amount matches order total
- [ ] M-Pesa callback received (see next test)

---

**Test: M-Pesa Callback Handling**

**Simulate M-Pesa callback:**

```bash
# POST /api/payments/mpesa/callback
curl -X POST https://api.kenixcommodities.com/api/payments/mpesa/callback \
  -H "Content-Type: application/json" \
  -d '{
    "Body": {
      "stkCallback": {
        "MerchantRequestID": "merchant_req_id",
        "CheckoutRequestID": "checkout_req_id",
        "ResultCode": 0,
        "ResultDesc": "The service request is processed successfully.",
        "CallbackMetadata": {
          "Item": [
            {"Name": "Amount", "Value": 7500},
            {"Name": "MpesaReceiptNumber", "Value": "QGR12345678"},
            {"Name": "TransactionDate", "Value": 20251109143000},
            {"Name": "PhoneNumber", "Value": 254712345678}
          ]
        }
      }
    }
  }'
```

**Expected:**
- ✅ Status: 200 OK
- ✅ Payment recorded in database
- ✅ Order status updated: payment_confirmed
- ✅ Shop owner notified
- ✅ Receipt number stored

**Test Cases:**
- [ ] Successful payment (ResultCode: 0)
- [ ] Failed payment (ResultCode: 1032 - Cancelled)
- [ ] Insufficient funds (ResultCode: 1)
- [ ] Invalid callback format handled gracefully
- [ ] Duplicate callback ignored (idempotency)

---

### 7. Rider Wallet Management

**Test: Get Rider Wallet Balance**

```bash
# GET /api/riders/:id/wallet
curl https://api.kenixcommodities.com/api/riders/rider_id/wallet \
  -H "Authorization: Bearer rider_token"
```

**Expected:**
- ✅ Status: 200 OK
- ✅ Returns: balance, pending, available
- ✅ Rider can only see own wallet
- ✅ Admin can see any rider's wallet

---

**Test: Update Wallet After Delivery**

**Scenario:** Rider delivers order worth KES 10,000, commission: 10%

```bash
# PATCH /api/orders/:id/status
# Mark order as delivered (automatically updates wallet)
curl -X PATCH https://api.kenixcommodities.com/api/orders/order_id/status \
  -H "Authorization: Bearer rider_token" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "delivered",
    "deliveryProof": {
      "photo": "https://storage.googleapis.com/bucket/delivery.jpg",
      "signature": "data:image/png;base64,...",
      "notes": "Delivered to reception"
    }
  }'
```

**Expected:**
- ✅ Status: 200 OK
- ✅ Order marked delivered
- ✅ Rider wallet credited: +KES 1,000 (10% of 10,000)
- ✅ Wallet transaction recorded

---

**Test: Rider Wallet Withdrawal**

```bash
# POST /api/riders/:id/wallet/withdraw
curl -X POST https://api.kenixcommodities.com/api/riders/rider_id/wallet/withdraw \
  -H "Authorization: Bearer rider_token" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "method": "mpesa",
    "phoneNumber": "254712345678"
  }'
```

**Expected:**
- ✅ Status: 200 OK
- ✅ Withdrawal initiated
- ✅ Wallet balance decreased
- ✅ M-Pesa payment sent (B2C API)
- ✅ Cannot withdraw more than available balance (400 Bad Request)

---

### 8. WebSocket (Real-Time Updates)

**Test: WebSocket Connection**

**Use tool:** https://www.websocket.org/echo.html or socket.io client

```javascript
// Connect to WebSocket
const socket = io('https://api.kenixcommodities.com', {
  auth: {
    token: 'your_access_token'
  }
});

socket.on('connect', () => {
  console.log('Connected:', socket.id);
});

socket.on('order:updated', (data) => {
  console.log('Order updated:', data);
});

socket.on('delivery:location', (data) => {
  console.log('Rider location:', data);
});
```

**Expected:**
- ✅ Connection successful
- ✅ Events received in real-time
- ✅ Unauthorized without token

**Test Cases:**
- [ ] Connection established
- [ ] Order updates broadcast to relevant users
- [ ] Rider location updates broadcast
- [ ] Disconnection handled gracefully
- [ ] Reconnection works

---

### 9. SMS Notifications (Africa's Talking)

**Test: SMS Sent on Order Creation**

**Create order and verify SMS sent:**

```bash
# Create order (triggers SMS)
curl -X POST https://api.kenixcommodities.com/api/orders \
  -H "Authorization: Bearer shop_token" \
  -H "Content-Type: application/json" \
  -d '{ /* order data */ }'

# Check server logs for SMS confirmation
pm2 logs kenix-api | grep "SMS sent"
```

**Expected:**
- ✅ SMS sent to shop owner's phone
- ✅ Message: "Your order #ORD-12345 has been received. Total: KES 7,500. We'll notify you when confirmed."
- ✅ SMS logged in server

**Test Cases:**
- [ ] Order creation triggers SMS
- [ ] Order confirmation triggers SMS
- [ ] Delivery status update triggers SMS
- [ ] Payment confirmation triggers SMS
- [ ] Invalid phone number handled gracefully (logged, doesn't crash)

---

### 10. File Upload (Google Cloud Storage)

**Test: Upload Product Image**

```bash
# POST /api/upload
curl -X POST https://api.kenixcommodities.com/api/upload \
  -H "Authorization: Bearer admin_token" \
  -F "file=@/path/to/image.jpg" \
  -F "folder=products"
```

**Expected:**
- ✅ Status: 200 OK
- ✅ Returns: public URL of uploaded image
- ✅ Image accessible via URL
- ✅ File uploaded to GCP bucket
- ✅ Only allowed file types accepted (jpg, png, webp)
- ✅ File size limit enforced (5 MB max)

**Test Cases:**
- [ ] Valid image uploads successfully
- [ ] Invalid file type rejected (400)
- [ ] File too large rejected (413)
- [ ] Unauthorized user rejected (401)
- [ ] Uploaded image accessible publicly

---

## Admin Dashboard Testing

**Goal:** Verify all admin dashboard features work correctly.

### 1. Authentication

**Test: Login Page**

1. Navigate to `https://dashboard.kenixcommodities.com`
2. Enter credentials:
   - Email: `admin@example.com`
   - Password: `Admin123!`
3. Click "Login"

**Expected:**
- ✅ Redirects to dashboard home
- ✅ Token stored in localStorage/cookies
- ✅ Invalid credentials show error message
- ✅ "Remember me" checkbox works (if implemented)

---

### 2. Dashboard Home

**Test: Overview Cards**

1. Navigate to `/dashboard`
2. Verify cards display:
   - Total Orders (count)
   - Total Revenue (KES)
   - Active Deliveries (count)
   - Registered Shops (count)

**Expected:**
- ✅ All cards show correct data
- ✅ Data updates in real-time (WebSocket)
- ✅ Loading states shown during data fetch
- ✅ Error states handled gracefully

---

### 3. Products Management

**Test: Product List**

1. Navigate to `/dashboard/products`
2. Verify table displays:
   - Product name, category, price, stock, status
   - Pagination controls
   - Search/filter options

**Expected:**
- ✅ Products listed correctly
- ✅ Search works (by name)
- ✅ Filter by category works
- ✅ Sorting works (price, name, stock)
- ✅ Pagination works
- ✅ "Add Product" button visible (admin only)

---

**Test: Create Product**

1. Click "Add Product" button
2. Fill form:
   - Name: "Test Product"
   - Category: "Grains"
   - Price: 250
   - Stock: 500
   - Upload image
3. Click "Create"

**Expected:**
- ✅ Form validation works (required fields)
- ✅ Image upload works
- ✅ Product created successfully
- ✅ Redirects to product list
- ✅ Success notification shown
- ✅ New product appears in list

---

**Test: Edit Product**

1. Click "Edit" on any product
2. Update price: 300
3. Click "Save"

**Expected:**
- ✅ Form pre-filled with current data
- ✅ Update successful
- ✅ Changes reflected in list
- ✅ Success notification shown

---

**Test: Delete Product**

1. Click "Delete" on a product
2. Confirm deletion

**Expected:**
- ✅ Confirmation dialog shown
- ✅ Product deleted successfully
- ✅ Removed from list
- ✅ Cannot delete product in active orders (error shown)

---

### 4. Orders Management

**Test: Order List**

1. Navigate to `/dashboard/orders`
2. Verify table displays:
   - Order ID, shop name, total, status, delivery date
   - Status badges (color-coded)
   - Action buttons

**Expected:**
- ✅ Orders listed correctly
- ✅ Filter by status works (pending, confirmed, etc.)
- ✅ Search by order ID works
- ✅ Date range filter works
- ✅ Sorting works
- ✅ Real-time updates (new orders appear automatically)

---

**Test: Order Details**

1. Click on an order
2. Verify details page shows:
   - Order items (products, quantities, prices)
   - Customer info (shop name, phone, address)
   - Delivery info (rider, status, location)
   - Payment info (method, status, receipt)
   - Timeline (status history)

**Expected:**
- ✅ All details displayed correctly
- ✅ Map shows delivery location (Mapbox)
- ✅ Rider location updates in real-time (if in transit)
- ✅ Timeline shows all status changes

---

**Test: Assign Rider**

1. Open pending order
2. Click "Assign Rider"
3. Select rider from dropdown
4. Click "Assign"

**Expected:**
- ✅ Rider assigned successfully
- ✅ Order status changes to "assigned"
- ✅ Notification sent to rider
- ✅ Rider appears in order details

---

**Test: Update Order Status**

1. Open order in "confirmed" status
2. Click "Mark as In Transit"
3. Confirm

**Expected:**
- ✅ Status updated successfully
- ✅ Timeline updated
- ✅ Notification sent to shop owner
- ✅ Cannot skip status (e.g., pending → delivered blocked)

---

### 5. Delivery Tracking

**Test: Live Tracking Map**

1. Navigate to `/dashboard/deliveries`
2. Verify map shows:
   - All active deliveries (markers)
   - Rider locations (real-time)
   - Delivery routes (lines from warehouse to shop)

**Expected:**
- ✅ Map loads correctly (Mapbox)
- ✅ Markers displayed for each delivery
- ✅ Clicking marker shows delivery details
- ✅ Rider location updates every 10 seconds
- ✅ Routes displayed correctly

---

### 6. User Management

**Test: User List**

1. Navigate to `/dashboard/users`
2. Verify table displays:
   - Name, email, role, status
   - Filter by role (admin, shop, rider, sales agent)
   - Search by name/email

**Expected:**
- ✅ Users listed correctly
- ✅ Filter by role works
- ✅ Search works
- ✅ Pagination works

---

**Test: Approve Shop Owner**

**Scenario:** Shop owner registers, awaits admin approval

1. Navigate to `/dashboard/users?status=pending`
2. Click on pending shop owner
3. Review details
4. Click "Approve"

**Expected:**
- ✅ Shop owner status changed to "approved"
- ✅ Notification sent to shop owner (email/SMS)
- ✅ Shop owner can now create orders

---

**Test: Deactivate User**

1. Click "Deactivate" on any user
2. Confirm

**Expected:**
- ✅ User status changed to "inactive"
- ✅ User cannot login
- ✅ User's active orders unaffected

---

### 7. Reports & Analytics

**Test: Sales Report**

1. Navigate to `/dashboard/reports/sales`
2. Select date range: Last 30 days
3. View report

**Expected:**
- ✅ Chart displays sales trend
- ✅ Total revenue calculated correctly
- ✅ Orders count accurate
- ✅ Export to CSV works
- ✅ Export to PDF works

---

**Test: Rider Performance Report**

1. Navigate to `/dashboard/reports/riders`
2. View metrics:
   - Deliveries completed
   - Average delivery time
   - Customer ratings
   - Earnings

**Expected:**
- ✅ Metrics calculated correctly
- ✅ Filter by rider works
- ✅ Filter by date range works
- ✅ Charts display correctly

---

### 8. Settings

**Test: Profile Settings**

1. Navigate to `/dashboard/settings/profile`
2. Update name, phone
3. Click "Save"

**Expected:**
- ✅ Profile updated successfully
- ✅ Changes reflected in header/navbar
- ✅ Success notification shown

---

**Test: Change Password**

1. Navigate to `/dashboard/settings/security`
2. Enter current password
3. Enter new password (twice)
4. Click "Change Password"

**Expected:**
- ✅ Password changed successfully
- ✅ Can login with new password
- ✅ Invalid current password rejected
- ✅ Password mismatch rejected
- ✅ Weak password rejected

---

## Mobile Apps Testing

**Goal:** Verify all 3 mobile apps work correctly.

### Test Devices
- Android: Real device (Samsung, Huawei, etc.) or emulator
- iOS: Real device (iPhone) or simulator

---

### Rider App Testing

**Test: Login**

1. Launch Kenix Rider app
2. Enter credentials:
   - Email: `rider@example.com`
   - Password: `Rider123!`
3. Tap "Login"

**Expected:**
- ✅ Login successful
- ✅ Redirects to home screen
- ✅ Token stored securely (AsyncStorage/SecureStore)
- ✅ Invalid credentials show error

---

**Test: View Assigned Deliveries**

1. Navigate to "Deliveries" tab
2. Verify list shows:
   - Today's deliveries (in sequence)
   - Order ID, shop name, address
   - Delivery status
   - Sequential order number

**Expected:**
- ✅ Deliveries listed in correct sequence
- ✅ Current delivery highlighted
- ✅ Cannot start next delivery until current one completed
- ✅ Pull to refresh works
- ✅ Real-time updates (WebSocket)

---

**Test: Navigation to Delivery**

1. Tap on current delivery
2. Tap "Start Navigation"

**Expected:**
- ✅ Google Maps opens with directions
- ✅ Or in-app map shows route (if implemented)
- ✅ Location permissions granted
- ✅ Route calculated correctly

---

**Test: Mark Delivery as Delivered**

1. Arrive at delivery location
2. Tap "Mark as Delivered"
3. Take photo of delivered goods
4. Get customer signature (if implemented)
5. Add notes (optional)
6. Tap "Confirm Delivery"

**Expected:**
- ✅ Camera opens for photo
- ✅ Photo uploaded to GCP
- ✅ Order status updated to "delivered"
- ✅ Notification sent to shop owner
- ✅ Rider wallet updated (+commission)
- ✅ Next delivery becomes active

---

**Test: Sequential Delivery Enforcement**

**Scenario:** Rider tries to skip delivery #2 and deliver #3

1. Navigate to delivery #3 (should be locked)
2. Tap "Mark as Delivered"

**Expected:**
- ❌ Button disabled or error shown: "Complete delivery #2 first"
- ✅ Cannot proceed until previous delivery completed

---

**Test: GPS Tracking**

1. Start delivery
2. Move around (simulate with emulator location changes)

**Expected:**
- ✅ Location updates sent to server every 10 seconds
- ✅ Admin can see rider location on dashboard map
- ✅ Battery usage optimized (not draining excessively)
- ✅ Works in background (when app minimized)

---

**Test: Wallet Screen**

1. Navigate to "Wallet" tab
2. View balance, transactions

**Expected:**
- ✅ Current balance displayed
- ✅ Pending earnings shown
- ✅ Transaction history listed
- ✅ "Withdraw" button visible
- ✅ Real-time updates

---

**Test: Withdraw Funds**

1. Tap "Withdraw"
2. Enter amount: 5000
3. Enter M-Pesa phone number
4. Tap "Withdraw"

**Expected:**
- ✅ Withdrawal initiated
- ✅ M-Pesa prompt received on phone
- ✅ Balance updated after confirmation
- ✅ Cannot withdraw more than available balance (error shown)

---

### Sales Agent App Testing

**Test: Login**

1. Launch Kenix Sales Agent app
2. Enter credentials
3. Login

**Expected:**
- ✅ Login successful
- ✅ Redirects to home screen

---

**Test: View Assigned Shops**

1. Navigate to "Shops" tab
2. Verify list shows:
   - Assigned shops
   - Shop name, owner, phone, address
   - Shop status (active/inactive)

**Expected:**
- ✅ Only assigned shops shown
- ✅ Search by shop name works
- ✅ Tap shop to view details

---

**Test: Create Order for Shop**

1. Tap on a shop
2. Tap "Create Order"
3. Add products:
   - Search for "Rice"
   - Select "Premium Rice"
   - Quantity: 50
   - Add to cart
4. Select delivery date
5. Tap "Submit Order"

**Expected:**
- ✅ Product search works
- ✅ Can add multiple products
- ✅ Total calculated correctly
- ✅ Delivery date validation (not in past)
- ✅ Order created successfully
- ✅ Notification sent to shop owner
- ✅ Sales agent commission tracked

---

**Test: View Order History**

1. Navigate to "Orders" tab
2. View orders created by this agent

**Expected:**
- ✅ Orders listed correctly
- ✅ Filter by status works
- ✅ Search by order ID works
- ✅ Tap order to view details

---

### Shop App Testing

**Test: Registration**

1. Launch Kenix Shop app
2. Tap "Register"
3. Fill form:
   - Shop name, owner name, email, phone, address, password
4. Tap "Register"

**Expected:**
- ✅ Registration successful
- ✅ Awaiting admin approval message shown
- ✅ Email/SMS confirmation sent
- ✅ Cannot place orders until approved

---

**Test: Login**

1. Enter credentials
2. Login

**Expected:**
- ✅ Login successful
- ✅ If not approved, dashboard shows "Awaiting approval" banner

---

**Test: Browse Products**

1. Navigate to "Products" tab
2. Browse categories
3. Search for products

**Expected:**
- ✅ Products listed with images, prices
- ✅ Categories filter works
- ✅ Search works
- ✅ Tap product to view details

---

**Test: Create Order**

1. Add products to cart:
   - Tap "Add to Cart" on multiple products
   - Set quantities
2. Navigate to "Cart"
3. Review items
4. Tap "Checkout"
5. Select delivery date
6. Select payment method: M-Pesa
7. Tap "Place Order"

**Expected:**
- ✅ Cart updates correctly
- ✅ Total calculated correctly
- ✅ Delivery date validation
- ✅ Order created successfully
- ✅ M-Pesa STK push received (if payment method selected)

---

**Test: M-Pesa Payment**

1. After placing order, M-Pesa prompt appears on phone
2. Enter PIN
3. Confirm payment

**Expected:**
- ✅ STK push received
- ✅ Payment processed successfully
- ✅ Order status updated to "payment_confirmed"
- ✅ Notification sent
- ✅ Receipt shown in app

---

**Test: View Order Status**

1. Navigate to "Orders" tab
2. Tap on an order
3. View details and status

**Expected:**
- ✅ Order details displayed correctly
- ✅ Status updates in real-time (WebSocket)
- ✅ Delivery tracking available (if in transit)
- ✅ Can see rider location on map

---

**Test: Track Delivery**

**Scenario:** Order is in transit

1. Open order details
2. View map

**Expected:**
- ✅ Map shows rider's current location
- ✅ Location updates in real-time
- ✅ Estimated arrival time shown
- ✅ Route displayed

---

**Test: Push Notifications**

**Scenario:** Order status changes

1. Admin updates order status to "confirmed"

**Expected:**
- ✅ Push notification received on shop owner's phone
- ✅ Tapping notification opens order details
- ✅ Notification shows order ID and status

**Test across different states:**
- [ ] Order confirmed
- [ ] Order assigned to rider
- [ ] Order in transit
- [ ] Order delivered

---

## Integration Testing

**Goal:** Test complete user workflows end-to-end.

### Workflow 1: Complete Order Flow

**Actors:** Shop owner, Admin, Rider, Payment system

**Steps:**

1. **Shop owner registers** (Shop app)
   - Fills registration form
   - Submits

2. **Admin approves shop** (Admin dashboard)
   - Receives notification of new shop
   - Reviews shop details
   - Approves

3. **Shop owner creates order** (Shop app)
   - Browses products
   - Adds to cart
   - Places order
   - Initiates M-Pesa payment

4. **M-Pesa payment processed**
   - STK push sent
   - Shop owner pays
   - Callback received
   - Order status: payment_confirmed

5. **Admin assigns rider** (Admin dashboard)
   - Views pending orders
   - Selects order
   - Assigns rider

6. **Rider delivers order** (Rider app)
   - Views assigned deliveries
   - Navigates to shop
   - Marks as delivered
   - Uploads proof
   - Wallet credited

7. **Shop owner receives delivery** (Shop app)
   - Receives notification
   - Views delivery confirmation
   - Order marked completed

**Verify:**
- ✅ All notifications sent
- ✅ All status updates recorded
- ✅ Payment processed correctly
- ✅ Rider wallet updated
- ✅ Data consistency across all apps

---

### Workflow 2: Sales Agent Order Flow

**Actors:** Sales agent, Shop owner, Admin, Rider

**Steps:**

1. **Sales agent visits shop** (Physical visit)
2. **Sales agent creates order** (Sales Agent app)
   - Selects shop
   - Adds products on behalf of shop
   - Submits order
3. **Shop owner receives notification** (SMS/Email)
4. **Admin confirms order** (Admin dashboard)
5. **Payment processed** (M-Pesa)
6. **Delivery completed** (Rider app)
7. **Sales agent commission credited** (Backend)

**Verify:**
- ✅ Sales agent can create orders for assigned shops
- ✅ Shop owner notified
- ✅ Commission calculated correctly

---

### Workflow 3: Sequential Delivery Flow

**Actors:** Rider, Admin, 3 Shop owners

**Setup:**
- Rider has 3 deliveries assigned for today: A, B, C

**Steps:**

1. **Rider delivers A** (Rider app)
   - Marks as delivered
   - Success

2. **Rider tries to deliver C before B** (Rider app)
   - Attempts to mark C as delivered
   - Blocked with error: "Complete delivery B first"

3. **Admin overrides sequence** (Admin dashboard)
   - Marks delivery C as delivered (override)
   - Success

4. **Rider delivers B** (Rider app)
   - No longer blocked
   - Success

**Verify:**
- ✅ Sequential enforcement works
- ✅ Admin override works
- ✅ Notifications correct

---

## Performance Testing

**Goal:** Ensure system handles expected load.

### Load Testing with Artillery

**Install Artillery:**

```bash
npm install -g artillery
```

**Create test script `loadtest.yml`:**

```yaml
config:
  target: 'https://api.kenixcommodities.com'
  phases:
    - duration: 60
      arrivalRate: 10
      name: Warm up
    - duration: 120
      arrivalRate: 50
      name: Ramp up load
    - duration: 60
      arrivalRate: 100
      name: Sustained high load
  processor: "./processor.js"

scenarios:
  - name: "Browse and order flow"
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "testuser@example.com"
            password: "Test123!"
          capture:
            - json: "$.token"
              as: "token"
      - get:
          url: "/api/products"
          headers:
            Authorization: "Bearer {{ token }}"
      - post:
          url: "/api/orders"
          headers:
            Authorization: "Bearer {{ token }}"
          json:
            items:
              - product: "product_id"
                quantity: 10
                price: 150
            deliveryDate: "2025-11-20"
```

**Run test:**

```bash
artillery run loadtest.yml
```

**Expected Results:**
- ✅ Median response time < 200ms
- ✅ 95th percentile < 500ms
- ✅ 99th percentile < 2000ms
- ✅ Error rate < 1%
- ✅ All requests successful

**If failing:**
- Increase server resources (CPU/RAM)
- Enable Redis caching
- Optimize database queries
- Add database indexes
- Enable CDN for static assets

---

### Database Performance

**Test slow queries:**

```javascript
// Enable MongoDB profiling
db.setProfilingLevel(1, { slowms: 100 });

// Run load test

// Check slow queries
db.system.profile.find({ millis: { $gt: 100 } }).sort({ ts: -1 }).limit(10);

// Expected: No queries > 100ms
```

**If slow queries found:**
- Add missing indexes
- Optimize query (use projections, avoid $where)
- Consider aggregation pipeline optimization

---

## Security Testing

**Goal:** Identify and fix security vulnerabilities.

### 1. Authentication Security

**Test: JWT Token Expiry**

```bash
# Get token
TOKEN=$(curl -X POST https://api.kenixcommodities.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}' \
  | jq -r '.token')

# Use token immediately (should work)
curl https://api.kenixcommodities.com/api/users/me \
  -H "Authorization: Bearer $TOKEN"

# Wait 1 hour (token expiry)
sleep 3600

# Try using expired token (should fail)
curl https://api.kenixcommodities.com/api/users/me \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:**
- ✅ Fresh token works
- ❌ Expired token returns 401 Unauthorized

---

**Test: Password Strength**

```bash
# Try registering with weak password
curl -X POST https://api.kenixcommodities.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"123",
    "firstName":"Test",
    "lastName":"User"
  }'
```

**Expected:**
- ❌ Rejected with 400 Bad Request
- ✅ Error message: "Password must be at least 8 characters with uppercase, lowercase, and number"

---

### 2. Authorization Security

**Test: RBAC Enforcement**

```bash
# Login as shop owner
SHOP_TOKEN=$(curl -X POST https://api.kenixcommodities.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"shop@example.com","password":"Shop123!"}' \
  | jq -r '.token')

# Try to create product (admin-only action)
curl -X POST https://api.kenixcommodities.com/api/products \
  -H "Authorization: Bearer $SHOP_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Unauthorized Product","price":100}'
```

**Expected:**
- ❌ Rejected with 403 Forbidden
- ✅ Error message: "Insufficient permissions"

---

### 3. SQL Injection / NoSQL Injection

**Test: NoSQL Injection Attempt**

```bash
# Try NoSQL injection in login
curl -X POST https://api.kenixcommodities.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": {"$gt": ""},
    "password": {"$gt": ""}
  }'
```

**Expected:**
- ❌ Rejected with 400 Bad Request
- ✅ Input sanitized (mongo-sanitize middleware)

---

### 4. XSS (Cross-Site Scripting)

**Test: XSS in Product Name**

```bash
# Try creating product with XSS payload
curl -X POST https://api.kenixcommodities.com/api/products \
  -H "Authorization: Bearer admin_token" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "<script>alert(\"XSS\")</script>",
    "price": 100
  }'
```

**Expected:**
- ✅ Script tags escaped/sanitized
- ✅ When displayed in frontend, doesn't execute

---

### 5. CSRF (Cross-Site Request Forgery)

**Test: CSRF Protection**

**If using cookies for auth:**
- ✅ CSRF tokens implemented
- ✅ SameSite cookie attribute set

**If using JWT in Authorization header:**
- ✅ CSRF protection not needed (JWT immune to CSRF)

---

### 6. Rate Limiting

**Test: API Rate Limit**

```bash
# Send 150 requests in 1 minute (exceeds 100 req/15min limit)
for i in {1..150}; do
  curl https://api.kenixcommodities.com/api/products
done
```

**Expected:**
- ✅ First 100 requests succeed
- ❌ Requests 101-150 return 429 Too Many Requests
- ✅ Error message: "Too many requests, please try again later"

---

### 7. SSL/TLS Configuration

**Test: SSL Certificate Validity**

```bash
# Check SSL certificate
curl -vI https://api.kenixcommodities.com 2>&1 | grep -i "ssl\|tls"

# Or use SSL Labs
# Visit: https://www.ssllabs.com/ssltest/analyze.html?d=api.kenixcommodities.com
```

**Expected:**
- ✅ TLS 1.2 or 1.3
- ✅ Valid certificate (not self-signed)
- ✅ Grade A or A+ on SSL Labs
- ✅ HTTPS enforced (HTTP redirects to HTTPS)

---

### 8. OWASP ZAP Scan (Automated Security Testing)

**Install OWASP ZAP:**
- Download: https://www.zaproxy.org/download/

**Run automated scan:**
1. Open ZAP
2. Automated Scan → Enter URL: `https://api.kenixcommodities.com`
3. Attack
4. Review results

**Expected:**
- ✅ No high/critical vulnerabilities
- ✅ Address any medium/low issues found

---

## User Acceptance Testing

**Goal:** Verify system meets business requirements from user perspective.

**Test with real users:**
- 2-3 shop owners
- 1-2 sales agents
- 1-2 riders
- 1 admin

**Scenarios to test:**

### Shop Owner UAT

1. Register account
2. Wait for approval
3. Browse products
4. Create order
5. Make payment via M-Pesa
6. Track delivery
7. Confirm receipt

**Feedback to gather:**
- Is registration process clear?
- Is product browsing easy?
- Is checkout process straightforward?
- Were notifications timely and clear?
- Any confusing steps?

---

### Rider UAT

1. Login
2. View assigned deliveries
3. Navigate to first delivery
4. Mark as delivered (with photo)
5. View wallet balance
6. Withdraw funds

**Feedback to gather:**
- Is delivery sequence clear?
- Is navigation helpful?
- Is photo upload easy?
- Is wallet information clear?

---

### Sales Agent UAT

1. Login
2. View assigned shops
3. Create order for shop
4. Track order status

**Feedback to gather:**
- Is shop list easy to navigate?
- Is order creation straightforward?
- Are products easy to search?

---

### Admin UAT

1. Approve new shop
2. View all orders
3. Assign rider to order
4. Track deliveries on map
5. Generate sales report

**Feedback to gather:**
- Is dashboard intuitive?
- Are maps loading correctly?
- Are reports useful?
- Any missing features?

---

## Automated Testing

**For ongoing quality assurance.**

### Backend Unit Tests

**Example using Jest:**

```javascript
// server/tests/auth.test.js
const request = require('supertest');
const app = require('../index');

describe('Authentication', () => {
  it('should register new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'newuser@example.com',
        password: 'Test123!',
        firstName: 'Test',
        lastName: 'User',
        role: 'shop'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
  });

  it('should reject duplicate email', async () => {
    // Register first user
    await request(app).post('/api/auth/register').send({/*...*/});

    // Try registering again with same email
    const res = await request(app).post('/api/auth/register').send({/*...*/});

    expect(res.statusCode).toBe(409);
  });
});
```

**Run tests:**

```bash
npm test
```

---

### Frontend E2E Tests

**Example using Cypress:**

```javascript
// web/cypress/e2e/login.cy.js
describe('Login', () => {
  it('should login successfully', () => {
    cy.visit('https://dashboard.kenixcommodities.com');
    cy.get('input[name="email"]').type('admin@example.com');
    cy.get('input[name="password"]').type('Admin123!');
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/dashboard');
    cy.contains('Welcome back, Admin');
  });
});
```

---

## Testing Checklist Summary

**Print and complete before launch:**

### Backend API
- [ ] All 72+ endpoints tested manually
- [ ] Authentication works (login, logout, refresh)
- [ ] Authorization (RBAC) enforced correctly
- [ ] All CRUD operations functional
- [ ] M-Pesa integration tested (sandbox)
- [ ] SMS notifications sent
- [ ] File uploads work (GCP)
- [ ] WebSocket connections stable
- [ ] Error handling robust
- [ ] Input validation comprehensive

### Admin Dashboard
- [ ] Login/logout works
- [ ] All pages load correctly
- [ ] Maps display (Mapbox)
- [ ] Real-time updates work (WebSocket)
- [ ] All forms functional (create, edit, delete)
- [ ] Reports generate correctly
- [ ] Responsive design works (mobile/tablet)

### Mobile Apps
- [ ] Rider app: All features tested
- [ ] Sales Agent app: All features tested
- [ ] Shop app: All features tested
- [ ] GPS tracking works
- [ ] Camera/photo upload works
- [ ] Push notifications received
- [ ] Offline mode functional (if implemented)

### Integration
- [ ] End-to-end order flow completed successfully
- [ ] Sequential delivery enforcement verified
- [ ] Admin override tested
- [ ] All notifications sent at correct times

### Performance
- [ ] Load testing passed (100 concurrent users)
- [ ] Response times < 2s (95th percentile)
- [ ] No memory leaks
- [ ] Database queries optimized

### Security
- [ ] Authentication secure (JWT expiry works)
- [ ] Authorization enforced (RBAC)
- [ ] NoSQL injection prevented
- [ ] XSS prevented
- [ ] Rate limiting works
- [ ] SSL configured correctly
- [ ] OWASP ZAP scan passed

### UAT
- [ ] Shop owners tested and approved
- [ ] Riders tested and approved
- [ ] Sales agents tested and approved
- [ ] Admin tested and approved
- [ ] All feedback addressed

---

**Testing Complete!**

**Next Steps:**
1. Review BACKUP_RECOVERY.md for backup strategy
2. Review PERFORMANCE_GUIDE.md for optimization
3. Final security audit with SECURITY_CHECKLIST.md
4. Go live!

---

**Document Version:** 1.0.0
**Last Updated:** 2025-11-09
