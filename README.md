# Kenix Commodities Platform

> **Enterprise B2B Fresh Produce Distribution System for Kenya**

Complete multi-platform solution for B2B commodity distribution, featuring web admin dashboard and three mobile applications for shops, riders, and sales agents.

---

## Overview

Kenix Commodities is an enterprise-grade platform that streamlines the distribution of fresh produce to retail shops across Kenya. The system rivals platforms like Wasoko and Twiga Foods with advanced features including:

- Real-time GPS tracking and delivery management
- M-Pesa payment integration
- Microfinance (Kenix Duka loans)
- Route optimization
- Performance analytics
- Multi-role access control

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    KENIX COMMODITIES                         │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   ADMIN      │  │    RIDER     │  │ SALES AGENT  │  │     SHOP     │
│  Dashboard   │  │     App      │  │     App      │  │     App      │
│   (Web)      │  │  (Mobile)    │  │  (Mobile)    │  │  (Mobile)    │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
       │                 │                 │                 │
       └─────────────────┴─────────────────┴─────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │  Backend API      │
                    │  (Express.js)     │
                    │  PostgreSQL       │
                    │  Socket.io        │
                    └───────────────────┘
```

---

## Applications

| Application | Platform | Technology | Status | Users |
|------------|----------|------------|--------|-------|
| **Admin Dashboard** | Web | Next.js 15, React, TypeScript, Tailwind | In Development | Admins |
| **Rider App** | iOS/Android | React Native, Expo | In Development | Delivery Riders |
| **Sales Agent App** | iOS/Android | React Native, Expo | In Development | Sales Agents |
| **Shop App** | iOS/Android | React Native, Expo | In Development | Shop Owners |

---

## Features by Application

### Admin Dashboard (Web)

**Shop Management**
- Approve/reject shop registrations
- View all shops on interactive map
- Edit shop details
- Ban/unban shops

**Product & Inventory**
- Create/edit/delete products
- Upload product images
- Manage categories
- Stock status management
- Low stock alerts

**Order Management**
- Approve/reject orders
- Assign orders to routes
- Remove items from orders
- Cancel orders
- Track delivery status

**Route Management**
- Create delivery routes
- Assign shops to routes
- Assign riders to routes
- Route optimization
- Interactive map with waypoints

**Real-time Tracking**
- Live rider GPS locations
- Delivery progress
- Interactive map with all active deliveries
- ETA calculations
- Payment collection status

**Performance Analytics**
- Sales agent performance (shops registered, orders, targets)
- Rider performance (deliveries, collection rate, average time)
- Business metrics (revenue, orders, top products)
- Charts and graphs
- Exportable reports

**Financial Management**
- M-Pesa transaction logs
- Payment reconciliation
- Kenix Duka loan management
- Rider wallet tracking
- Commission payouts

**Promotions**
- Create promotional offers
- Set discounts and date ranges
- Assign to products
- Push notifications

---

### Rider App (Mobile)

**Active Route**
- View assigned route for the day
- List of shops in delivery sequence
- Interactive map with current location
- Navigation to current shop
- Cannot access future shops (sequential enforcement)

**Delivery Process**
- Arrive at shop (GPS verification)
- Select payment method (M-Pesa, Cash, Airtel)
- M-Pesa STK Push integration
- Capture delivery proof (signature + photo)
- Delivery notes
- Mark delivery complete

**Rider Wallet**
- Current balance (negative, decreasing with deliveries)
- Transaction history
- Daily/weekly earnings
- Projected end-of-day balance

**Performance**
- Deliveries completed
- Payment collection rate
- Average delivery time
- Weekly/monthly stats

**Real-time Updates**
- Route assignments
- Payment confirmations
- Admin messages
- Push notifications

---

### Sales Agent App (Mobile)

**Shop Registration**
- Multi-step registration wizard
- Capture shop details
- GPS location capture with map
- Shop photo capture
- Operating hours
- Submit for admin approval

**Order Placement**
- Select shop from assigned list
- Browse product catalog
- Add to cart
- Place order on behalf of shop
- View order status

**Performance Dashboard**
- Shops registered (weekly/monthly)
- Orders placed
- Targets vs achievements
- Commission earned
- Top products

**Territory Management**
- View assigned shops on map
- Navigate to shops
- Visit logging
- Shop contact information

---

### Shop App (Mobile)

**Product Catalog**
- Browse all products
- Filter by category
- Search products
- View stock availability
- Real-time pricing

**Shopping Cart**
- Add/remove items
- Adjust quantities
- View total
- Persistent cart (offline)

**Checkout & Payment**
- M-Pesa STK Push payment
- Pay rider option
- Payment confirmation
- Order receipt

**Order Tracking**
- View order history
- Track current order status
- Real-time delivery tracking on map
- Rider location updates
- ETA display
- Delivery confirmation

**Kenix Duka Loans**
- Apply for business loans
- View eligibility
- Loan repayment schedule
- Outstanding balance
- Payment history
- M-Pesa repayment

**Airtime Services**
- Buy airtime (Safaricom, Airtel)
- Sell airtime
- Transaction history
- M-Pesa payment

---

## Technology Stack

### Frontend

**Web (Admin Dashboard)**
- Framework: Next.js 15 (App Router)
- UI: React 19, TypeScript, Tailwind CSS
- UI Components: Material-UI (MUI)
- State: Zustand
- Forms: React Hook Form + Zod
- Charts: Recharts, ApexCharts
- Maps: Mapbox GL JS
- Real-time: Socket.io Client

**Mobile (All Apps)**
- Framework: React Native + Expo
- Navigation: Expo Router
- State: Zustand
- Forms: React Hook Form + Yup
- Maps: React Native Maps
- Storage: Expo SecureStore
- Camera: Expo Camera
- Location: Expo Location
- Real-time: Socket.io Client

### Backend

- Runtime: Node.js
- Framework: Express.js
- Database: PostgreSQL
- ORM: Prisma
- Authentication: JWT
- Real-time: Socket.io
- Payments: M-Pesa Daraja API
- File Storage: Google Cloud Storage
- Email: Nodemailer

### Shared Packages

- `@kenix/shared-types` - TypeScript type definitions
- `@kenix/api-client` - Centralized API client (Axios)
- `@kenix/websocket-client` - Real-time WebSocket client

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI (`npm install -g expo-cli`)
- PostgreSQL database
- M-Pesa Daraja API credentials
- Mapbox API token (for maps)
- Google Cloud Storage bucket (for file uploads)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd commodies
```

2. **Install shared packages**
```bash
cd packages/shared-types && npm install
cd ../api-client && npm install
cd ../websocket-client && npm install
```

3. **Install backend dependencies**
```bash
cd ../../server
npm install
```

4. **Set up environment variables**

Create `.env` files in each application directory:

**Backend** (`server/.env`):
```env
DATABASE_URL=postgresql://user:password@localhost:5432/kenix
JWT_SECRET=your_jwt_secret_here
MPESA_CONSUMER_KEY=your_mpesa_consumer_key
MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
MPESA_PASSKEY=your_mpesa_passkey
GCS_PROJECT_ID=your_gcp_project_id
GCS_BUCKET_NAME=your_bucket_name
```

**Admin Dashboard** (`web/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WS_URL=http://localhost:3001
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
```

**Mobile Apps** (`.env` in each app directory):
```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:3001/api
EXPO_PUBLIC_WS_URL=http://192.168.1.100:3001
```

5. **Run database migrations**
```bash
cd server
npx prisma migrate dev
npx prisma generate
```

6. **Seed the database** (optional)
```bash
npm run seed
```

7. **Start the backend**
```bash
npm run dev
```

8. **Start the admin dashboard**
```bash
cd ../web
npm install
npm run dev
```

9. **Start mobile apps**
```bash
# Rider app
cd ../apps/rider
npm install
npx expo start

# Sales agent app
cd ../sales-agent
npm install
npx expo start

# Shop app
cd ../shop
npm install
npx expo start
```

---

## Project Structure

```
commodies/
├── web/                        # Admin Dashboard (Next.js)
│   ├── src/
│   │   ├── app/               # App router pages
│   │   ├── components/        # React components
│   │   ├── lib/               # API client, utils
│   │   ├── stores/            # Zustand stores
│   │   └── hooks/             # Custom hooks
│   └── package.json
│
├── apps/                       # Mobile applications
│   ├── rider/                 # Rider app (Expo)
│   │   ├── app/              # Expo Router pages
│   │   ├── components/       # React Native components
│   │   ├── stores/           # Zustand stores
│   │   ├── services/         # API, WebSocket, Location
│   │   └── package.json
│   │
│   ├── sales-agent/          # Sales Agent app (Expo)
│   └── shop/                 # Shop app (Expo)
│
├── packages/                  # Shared packages
│   ├── shared-types/         # TypeScript types
│   ├── api-client/           # API client
│   └── websocket-client/     # WebSocket client
│
├── server/                    # Backend API
│   ├── src/
│   │   ├── routes/           # API routes
│   │   ├── controllers/      # Controllers
│   │   ├── services/         # Business logic
│   │   ├── middleware/       # Auth, validation
│   │   └── utils/            # Helpers
│   └── package.json
│
├── assets/                    # Shared assets
├── FRONTEND_ARCHITECTURE.md   # Detailed frontend architecture
├── IMPLEMENTATION_GUIDE.md    # Step-by-step implementation guide
└── README.md                  # This file
```

---

## Documentation

- **[Frontend Architecture](./FRONTEND_ARCHITECTURE.md)** - Comprehensive frontend architecture with detailed feature specifications for all 4 applications
- **[Implementation Guide](./IMPLEMENTATION_GUIDE.md)** - Step-by-step guide to set up and implement all features
- **API Documentation** - (See server/README.md)
- **Deployment Guide** - (See DEPLOYMENT.md)

---

## Development Workflow

### Running Locally

1. **Backend**: `cd server && npm run dev` (Port 3001)
2. **Admin Dashboard**: `cd web && npm run dev` (Port 3000)
3. **Rider App**: `cd apps/rider && npx expo start`
4. **Sales Agent App**: `cd apps/sales-agent && npx expo start`
5. **Shop App**: `cd apps/shop && npx expo start`

### Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Type checking
npm run type-check
```

### Building for Production

**Admin Dashboard**:
```bash
cd web
npm run build
npm run start
```

**Mobile Apps**:
```bash
cd apps/rider
eas build --platform android --profile production
eas build --platform ios --profile production
```

---

## Key Features Implementation Status

### Completed
- [x] Shared packages infrastructure (types, api-client, websocket-client)
- [x] Backend API structure
- [x] Database schema
- [x] Authentication system

### In Progress
- [ ] Admin Dashboard - All features
- [ ] Rider App - All features
- [ ] Sales Agent App - All features
- [ ] Shop App - Enhanced features

### Planned
- [ ] Push notifications
- [ ] Offline support
- [ ] Analytics dashboard
- [ ] Advanced reporting
- [ ] Mobile app optimization

---

## M-Pesa Integration

The platform integrates with M-Pesa Daraja API for:

1. **Shop Payments** - Shops pay for orders via M-Pesa STK Push
2. **Rider Collections** - Riders collect payments on delivery
3. **Loan Disbursements** - Kenix Duka loans disbursed to M-Pesa
4. **Loan Repayments** - Shops repay loans via M-Pesa
5. **Airtime Services** - Buy/sell airtime via M-Pesa

### STK Push Flow

```
1. User initiates payment
2. Backend calls M-Pesa API
3. User receives STK Push on phone
4. User enters PIN
5. M-Pesa sends callback to backend
6. Backend updates payment status
7. Frontend receives WebSocket notification
8. UI updates with confirmation
```

---

## Real-time Features

All real-time features use WebSocket (Socket.io):

1. **Rider Location Tracking** - Updates every 10 seconds
2. **Delivery Status Updates** - Instant notifications
3. **Order Status Changes** - Real-time updates
4. **Payment Confirmations** - Instant M-Pesa confirmations
5. **Route Updates** - Live route modifications

---

## Security

- JWT-based authentication
- Secure token storage (SecureStore for mobile, httpOnly cookies for web)
- Role-based access control (RBAC)
- Input validation (Zod/Yup schemas)
- SQL injection prevention (Prisma ORM)
- XSS protection
- CORS configured
- Rate limiting
- HTTPS in production

---

## Performance Optimization

- Code splitting (Next.js automatic)
- Image optimization (next/image, expo-image)
- Virtual lists (FlashList for mobile)
- Lazy loading
- Memoization (React.memo, useMemo)
- Database indexing
- API response caching
- WebSocket connection pooling

---

## Accessibility

- WCAG 2.1 AA compliance
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Screen reader support
- High contrast mode
- Touch target sizes (44x44 minimum)

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

Private - Kenix Commodities © 2025

---

## Support

For support, email support@kenixcommodities.co.ke or create an issue in the repository.

---

## Authors

- **Kenix Commodities Team**
- Frontend Architecture: Claude Code (AI Frontend Integration Engineer)

---

## Acknowledgments

- Expo team for the excellent mobile development framework
- Next.js team for the powerful web framework
- M-Pesa Daraja API for payment integration
- Mapbox for mapping services

---

**Built with ❤️ for Kenyan businesses**

_Last updated: November 9, 2025_
