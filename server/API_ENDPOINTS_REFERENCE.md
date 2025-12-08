# KENIX COMMODITIES - API ENDPOINTS QUICK REFERENCE

**Total Endpoints**: 72+
**Backend Status**: 100% COMPLETE

---

## AUTHENTICATION
All endpoints require authentication via JWT Bearer token:
```
Authorization: Bearer <token>
```

---

## 1. USER MANAGEMENT (`/api/user`)
- `POST /api/user/register` - Register new user
- `POST /api/user/login` - User login
- `GET /api/user/me` - Get current user
- `PUT /api/user/profile` - Update profile
- `GET /api/user/shops` - List all shops (admin)
- `GET /api/user/riders` - List all riders (admin)
- `PATCH /api/user/:id/ban` - Ban/unban user (admin)

---

## 2. PRODUCT MANAGEMENT (`/api/products`)
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)
- `PATCH /api/products/:id/stock` - Update stock status (admin)
- `GET /api/products/category/:categoryId` - Get products by category
- `GET /api/products/search` - Search products

---

## 3. CATEGORY MANAGEMENT (`/api/categories`)
- `GET /api/categories` - List all categories
- `GET /api/categories/:id` - Get single category
- `POST /api/categories` - Create category (admin)
- `PUT /api/categories/:id` - Update category (admin)
- `DELETE /api/categories/:id` - Delete category (admin)

---

## 4. ORDER MANAGEMENT (`/api/orders`)
- `POST /api/orders` - Create order (shop, sales_agent)
- `GET /api/orders` - List orders (filtered by role)
- `GET /api/orders/:id` - Get order details
- `PATCH /api/orders/:id/approve` - Approve order (admin)
- `PATCH /api/orders/:id/reject` - Reject order (admin)
- `PATCH /api/orders/:id/assign-route` - Assign to route (admin)
- `DELETE /api/orders/:id/products/:productId` - Remove product (admin)
- `PATCH /api/orders/:id/cancel` - Cancel order

---

## 5. ROUTE MANAGEMENT (`/api/routes`)
- `POST /api/routes` - Create route (admin)
- `GET /api/routes` - List routes
- `GET /api/routes/:id` - Get route details
- `PATCH /api/routes/:id/assign-rider` - Assign rider (admin)
- `PATCH /api/routes/:id/start` - Start route (rider)
- `PATCH /api/routes/:id/complete` - Complete route (rider)

---

## 6. DELIVERY MANAGEMENT (`/api/deliveries`)
- `GET /api/deliveries` - List deliveries (filtered by role)
- `GET /api/deliveries/:id` - Get delivery details
- `PATCH /api/deliveries/:id/start` - Start delivery (rider)
- `PATCH /api/deliveries/:id/arrive` - Mark arrived (rider)
- `PATCH /api/deliveries/:id/complete` - Complete delivery (rider)
- `PATCH /api/deliveries/:id/fail` - Mark failed (rider)
- `GET /api/deliveries/rider/:riderId` - Get rider deliveries
- `GET /api/deliveries/shop/:shopId` - Get shop deliveries

---

## 7. PAYMENT MANAGEMENT (`/api/payments`)
- `POST /api/payments/mpesa/stk-push` - Initiate M-Pesa payment
- `POST /api/payments/mpesa/callback` - M-Pesa callback (system)
- `GET /api/payments/transaction/:id` - Get transaction status
- `POST /api/payments/record` - Record manual payment (admin)
- `GET /api/payments/order/:orderId` - Get order payments
- `GET /api/payments/history` - Payment history

---

## 8. RIDER WALLET (`/api/wallet`) - NEW
- `GET /api/wallet/:riderId` - Get wallet balance
- `GET /api/wallet/:riderId/transactions` - Get transaction history
  - Query: `?page=1&limit=20&type=load|collection|adjustment|settlement`
- `GET /api/wallet/:riderId/summary` - Get wallet summary with stats
- `POST /api/wallet/:riderId/adjust` - Adjust wallet (admin only)
  - Body: `{ amount, reason, type: 'adjustment'|'bonus'|'deduction' }`

**Access**: Rider (own wallet), Admin (all)

---

## 9. SALES PERFORMANCE (`/api/performance`) - NEW
- `GET /api/performance/sales-agents/:agentId/weekly` - Weekly performance
  - Query: `?week=current&year=2025`
- `GET /api/performance/sales-agents/:agentId/monthly` - Monthly performance
  - Query: `?month=11&year=2025`
- `GET /api/performance/sales-agents` - Performance leaderboard (admin only)
  - Query: `?period=week|month&sortBy=revenue|orders|registrations|commission`

**Access**: Sales Agent (own), Admin (all)

---

## 10. INVENTORY MANAGEMENT (`/api/inventory`) - NEW
- `GET /api/inventory` - List all inventory (admin)
  - Query: `?productId=&status=low-stock|out-of-stock|in-stock&page=1`
- `GET /api/inventory/product/:productId` - Get product inventory (all)
- `POST /api/inventory/:productId/adjust` - Adjust inventory (admin)
  - Body: `{ type: 'restock'|'adjustment'|'wastage', quantity, reason }`
- `POST /api/inventory/reserve` - Reserve inventory (system/internal)
  - Body: `{ products: [{ productId, quantity }], orderId }`
- `POST /api/inventory/release` - Release inventory (system/internal)
  - Body: `{ products: [{ productId, quantity }], orderId, reason }`

**ACID Compliant**: All inventory operations use MongoDB transactions

---

## 11. KENIX DUKA LOANS (`/api/loans`) - NEW
- `POST /api/loans/apply` - Apply for loan (shop)
  - Body: `{ amount, duration, purpose }`
- `GET /api/loans/eligibility/:shopId` - Get loan eligibility
- `GET /api/loans` - List loans (filtered by role)
  - Query: `?shopId=&status=pending|approved|rejected|active|completed`
- `GET /api/loans/:loanId` - Get loan details
- `PATCH /api/loans/:loanId/approve` - Approve loan (admin)
- `PATCH /api/loans/:loanId/reject` - Reject loan (admin)
  - Body: `{ reason }`
- `POST /api/loans/:loanId/payment` - Make payment
  - Body: `{ amount, paymentMethod: 'mpesa'|'cash'|'bank', mpesaTransactionId? }`

**Features**:
- Automatic eligibility calculation
- SMS notifications
- ACID-compliant payments

---

## 12. AIRTIME SERVICES (`/api/airtime`) - NEW
- `POST /api/airtime/buy` - Buy airtime (shop)
  - Body: `{ provider: 'safaricom'|'airtel', phoneNumber, amount }`
- `POST /api/airtime/sell` - Sell airtime (shop)
  - Body: `{ provider: 'safaricom'|'airtel', amount }`
- `GET /api/airtime/transactions` - Get transaction history
  - Query: `?type=purchase|sale&provider=&status=&page=1`

**Limits**: KES 10 - 10,000

---

## 13. SMS TESTING (`/api/sms`) - NEW
- `POST /api/sms/test` - Test SMS (admin)
  - Body: `{ phoneNumber, message }`
- `POST /api/sms/bulk` - Bulk SMS (admin)
  - Body: `{ phoneNumbers: [], message }`

---

## ROLE-BASED ACCESS CONTROL (RBAC)

### Roles:
- **admin**: Full system access
- **shop**: Shop owners - orders, loans, airtime
- **sales_agent**: Field agents - shop registration, performance
- **rider**: Delivery personnel - routes, deliveries, wallet

### Access Patterns:
- **Own Resources**: Users can only access their own data
- **Admin Override**: Admins can access all resources
- **System/Internal**: Some endpoints are for internal use only

---

## RESPONSE FORMAT

All endpoints return standardized responses:

### Success Response:
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  }
}
```

### Error Response:
```json
{
  "success": false,
  "message": "Error message",
  "errors": ["Detailed error 1", "Detailed error 2"]
}
```

---

## PAGINATION

List endpoints support pagination:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

Response includes:
```json
{
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalRecords": 100,
    "recordsPerPage": 20,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

---

## ERROR CODES

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (no token or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `422` - Unprocessable Entity
- `500` - Internal Server Error

---

## VALIDATION

All request bodies are validated using Joi schemas:
- Required fields
- Type checking
- Format validation
- Range validation
- Custom business rules

Validation errors return detailed field-level errors.

---

## ACID TRANSACTIONS

The following operations use MongoDB transactions for ACID compliance:
- Wallet adjustments
- Inventory adjustments
- Inventory reservation/release
- Loan payments

These operations guarantee:
- **Atomicity**: All or nothing
- **Consistency**: Data integrity maintained
- **Isolation**: Concurrent operations don't interfere
- **Durability**: Changes are permanent

---

## SMS NOTIFICATIONS

Automatic SMS sent for:
- OTP verification
- Order confirmations
- Order approvals
- Delivery notifications
- Payment confirmations
- Loan approvals/rejections
- Loan payment reminders
- Rider route assignments
- Low stock alerts (admin)

Provider: Africa's Talking

---

## TESTING

### Test Accounts Needed:
- Admin user
- Shop user
- Sales agent user
- Rider user

### Test Data:
- Products with inventory
- Categories
- Sample orders
- M-Pesa test credentials

### Integration Points:
- M-Pesa sandbox
- Africa's Talking sandbox

---

## DEPLOYMENT CHECKLIST

Before production:
1. Set production environment variables
2. Configure Africa's Talking production account
3. Configure M-Pesa production credentials
4. Set strong JWT secrets
5. Configure production MongoDB
6. Set up SSL/TLS
7. Configure CORS for production domains
8. Enable production logging
9. Set up error monitoring
10. Configure database backups

---

**Documentation Version**: 1.0
**Last Updated**: November 9, 2025
**Backend Status**: 100% COMPLETE
