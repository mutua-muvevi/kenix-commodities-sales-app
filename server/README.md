# Kenix Commodities Backend API

Enterprise-grade B2B fresh produce distribution platform for the Kenyan market, competing with Wasoko and Twiga Foods.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Database Models](#database-models)
- [M-Pesa Integration](#m-pesa-integration)
- [Security](#security)
- [Testing](#testing)
- [Deployment](#deployment)

## Architecture Overview

```
server/
├── config/                 # Configuration files
├── controllers/            # Request handlers
│   ├── products/
│   ├── categories/
│   ├── orders/
│   ├── deliveries/
│   ├── routes/
│   ├── payments/
│   └── user/
├── models/                 # MongoDB schemas
├── routes/                 # API route definitions
├── middleware/             # Custom middleware
│   ├── auth/
│   ├── rbac/
│   ├── validation/
│   └── delivery/
├── services/               # Business logic & external services
│   └── mpesa/
├── validators/             # Joi validation schemas
└── index.js               # App entry point
```

## Features

### Core Platform Features

- **Product Management**: Complete CRUD operations with category hierarchy
- **Inventory Management**: Real-time stock tracking with ACID-compliant transactions
- **Order Management**: Multi-step approval workflow (shop → admin → delivery)
- **Route Management**: Geographic route planning with shop sequencing
- **Sequential Delivery**: Enforced delivery order with payment collection
- **M-Pesa Integration**: STK Push payments with automatic reconciliation
- **Role-Based Access Control**: Admin, Shop, Sales Agent, Rider roles
- **Rider Wallet System**: Negative balance tracking for accountability
- **Sales Performance Tracking**: KPI monitoring for sales agents
- **Kenix Duka Loans**: Credit facility for shops

### Business-Critical Features

1. **Sequential Delivery Enforcement**
   - Riders MUST deliver in assigned sequence
   - Cannot skip shops without admin override
   - Payment collection required before proceeding
   - All violations logged for audit

2. **ACID-Compliant Inventory**
   - Atomic stock reservations
   - Transaction rollback on failures
   - Prevents overselling
   - Audit trail for all stock movements

3. **M-Pesa Payment Integration**
   - Real-time STK Push to customer phones
   - Automatic callback processing
   - Payment reconciliation
   - Support for order and delivery payments

## Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.x
- **Database**: MongoDB 6.x with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Joi
- **Payment Gateway**: M-Pesa Daraja API
- **Caching/Queues**: Redis + Bull
- **Real-time**: Socket.io
- **Testing**: Jest + Supertest
- **File Storage**: Google Cloud Storage
- **Email**: SparkPost
- **Maps**: Google Maps API

## Installation

### Prerequisites

- Node.js 18+ and Yarn
- MongoDB 6+
- Redis 7+

### Steps

1. **Clone the repository**
```bash
cd server
```

2. **Install dependencies**
```bash
yarn install
```

3. **Configure environment**
```bash
cp config.env.example config.env
# Edit config.env with your credentials
```

4. **Start MongoDB and Redis**
```bash
# MongoDB
mongod --dbpath=/path/to/data

# Redis
redis-server
```

5. **Run the server**
```bash
# Development
yarn server

# Production
yarn start
```

## Configuration

### Required Environment Variables

```env
# Database
MONGODB_URI=mongodb://localhost:27017/kenix-commodities

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRY=7d

# M-Pesa (get from developer.safaricom.co.ke)
MPESA_ENVIRONMENT=sandbox
MPESA_CONSUMER_KEY=your-key
MPESA_CONSUMER_SECRET=your-secret
MPESA_PASSKEY=your-passkey
MPESA_SHORTCODE=174379
MPESA_CALLBACK_URL=https://yourdomain.com/api/payments/mpesa/callback

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Google Maps
GOOGLE_MAPS_API_KEY=your-api-key
```

## API Documentation

### Base URL
```
Development: http://localhost:5000/api
Production: https://api.kenixcommodities.co.ke/api
```

### Authentication

All endpoints except login/register require JWT token in header:
```
Authorization: Bearer <jwt-token>
```

### Key Endpoints

#### Products
- `POST /products` - Create product (Admin)
- `GET /products` - List products with filters
- `GET /products/:id` - Get single product
- `PATCH /products/:id` - Update product (Admin)
- `DELETE /products/:id` - Deactivate product (Admin)
- `PATCH /products/:id/stock-status` - Update stock status (Admin)

#### Categories
- `POST /categories` - Create category (Admin)
- `GET /categories` - List categories
- `PATCH /categories/:id` - Update category (Admin)

#### Orders
- `POST /orders` - Create order (Shop/Sales Agent)
- `GET /orders` - List orders (role-filtered)
- `GET /orders/:id` - Get order details
- `PATCH /orders/:id/approve` - Approve/reject order (Admin)
- `PATCH /orders/:id/assign-route` - Assign to route (Admin)

#### Payments (M-Pesa)
- `POST /payments/mpesa/initiate` - Initiate STK Push
- `POST /payments/mpesa/callback` - M-Pesa callback (webhook)
- `GET /payments/mpesa/:transactionRef/status` - Query payment status

#### Deliveries
- `POST /deliveries/:routeId/start` - Start delivery route (Rider)
- `PATCH /deliveries/:deliveryId/arrive` - Mark arrival (Rider)
- `PATCH /deliveries/:deliveryId/complete` - Complete delivery (Rider)
- `POST /deliveries/:deliveryId/payment` - Record payment (Rider)
- `GET /deliveries/:deliveryId/next` - Get next allowed shop

### Response Format

All responses follow this structure:

**Success:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error 1", "Detailed error 2"]
}
```

## Database Models

### Core Models

1. **User** - Shop owners, riders, sales agents, admins
2. **Product** - Product catalog with pricing
3. **Category** - Hierarchical product categories
4. **Inventory** - Real-time stock management
5. **Order** - Customer orders with approval workflow
6. **Route** - Delivery routes with shop sequences
7. **Delivery** - Individual delivery tracking
8. **MpesaTransaction** - Payment transaction records
9. **RiderWallet** - Rider accountability system
10. **SalesPerformance** - Sales agent KPIs
11. **KenixDukaLoan** - Shop credit facility
12. **AirtimeTransaction** - Airtime services

### Key Relationships

```
User (Shop) → Places → Order
Order → Assigned To → Route
Route → Contains → Deliveries (sequential)
Delivery → Linked To → MpesaTransaction
Rider → Has → RiderWallet
Product → Has → Inventory
```

## M-Pesa Integration

### STK Push Flow

1. **Initiate Payment**
   ```bash
   POST /api/payments/mpesa/initiate
   {
     "phoneNumber": "254712345678",
     "amount": 1000,
     "orderId": "order_id_here"
   }
   ```

2. **Customer receives STK Push on phone**

3. **Customer enters M-Pesa PIN**

4. **M-Pesa sends callback to `/api/payments/mpesa/callback`**

5. **System updates order/delivery payment status**

6. **Rider wallet updated if delivery payment**

### M-Pesa Configuration

Get credentials from [Safaricom Developer Portal](https://developer.safaricom.co.ke):
- Register your app
- Get Consumer Key and Consumer Secret
- Generate Passkey for STK Push
- Configure callback URL (must be HTTPS in production)

## Security

### Implemented Security Measures

1. **Authentication**
   - JWT-based authentication
   - Bcrypt password hashing (10 salt rounds)
   - Password reset with expiring tokens

2. **Authorization**
   - Role-based access control (RBAC)
   - Endpoint-level permission checks
   - User approval workflow

3. **Input Validation**
   - Joi schema validation on all endpoints
   - MongoDB injection prevention
   - SQL injection prevention (sanitization)

4. **HTTP Security**
   - Helmet.js for security headers
   - CORS with whitelist
   - Rate limiting (100 requests/15 minutes)
   - Request size limits

5. **Data Protection**
   - Sensitive data not logged
   - M-Pesa credentials encrypted
   - HTTPS enforced in production

## Testing

### Run Tests

```bash
# Run all tests
yarn test

# Run with coverage
yarn test --coverage

# Run specific test suite
yarn test controllers/products
```

### Test Structure

```
tests/
├── unit/
│   ├── models/
│   ├── services/
│   └── middleware/
├── integration/
│   └── api/
└── e2e/
    └── workflows/
```

## Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use production MongoDB cluster
- [ ] Configure production M-Pesa credentials
- [ ] Set up HTTPS with valid SSL certificate
- [ ] Configure production M-Pesa callback URL
- [ ] Set strong JWT secret (32+ characters)
- [ ] Enable MongoDB replica set for transactions
- [ ] Set up Redis for caching
- [ ] Configure error monitoring (Sentry)
- [ ] Set up log aggregation
- [ ] Configure automated backups
- [ ] Load test all critical endpoints
- [ ] Set up CI/CD pipeline

### PM2 Deployment

```bash
# Start with PM2
pm2 start index.js --name kenix-api

# View logs
pm2 logs kenix-api

# Monitor
pm2 monit

# Restart
pm2 restart kenix-api
```

## Critical Business Rules

### 1. Sequential Delivery Enforcement

Riders MUST deliver in the assigned shop sequence. This cannot be bypassed except by admin override. The system enforces this at multiple levels:

- Middleware validates sequence before allowing delivery actions
- Previous delivery must be marked complete
- Payment must be collected before proceeding (unless credit)
- All violation attempts are logged

### 2. ACID-Compliant Stock Management

All inventory operations use MongoDB transactions:

```javascript
// Stock is reserved atomically when order is placed
await Inventory.reserveStock(productId, quantity, orderId, userId);

// Stock is released if order is cancelled
await Inventory.releaseStock(productId, quantity, orderId, userId, reason);

// Stock is decremented when delivery is completed
await Inventory.completeTransaction(productId, quantity, orderId, userId);
```

### 3. Rider Wallet Accountability

- Rider wallet starts at 0
- When route is assigned, wallet goes negative (cost of goods loaded)
- As deliveries complete and payments collected, balance increases
- Rider settles wallet at end of route

## Support

For issues or questions:
- Email: tech@kenixcommodities.co.ke
- Documentation: https://docs.kenixcommodities.co.ke
- Developer Portal: https://developers.kenixcommodities.co.ke

## License

Proprietary - Kenix Commodities Limited
