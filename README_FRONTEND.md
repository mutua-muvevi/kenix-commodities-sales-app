# Kenix Commodities - Frontend Applications

## Overview

This project contains 4 frontend applications for the Kenix Commodities B2B delivery platform:

1. **Admin Web Dashboard** (Next.js) - 40% Complete
2. **Rider Mobile App** (React Native/Expo) - 0% Complete
3. **Sales Agent Mobile App** (React Native/Expo) - 0% Complete
4. **Shop Mobile App** (React Native/Expo) - 25% Complete

## Quick Start

### Prerequisites
- Node.js 18+ installed
- MongoDB running
- Backend server running on `http://localhost:3001`

### 1. Start Admin Dashboard

```bash
# Install dependencies
cd web
yarn install

# Start development server
yarn dev

# Open http://localhost:3000/auth/login
```

**Test Credentials**: Create admin user via API or use existing credentials.

### 2. Start Rider App

```bash
# Install dependencies
cd apps/rider
npm install

# Start Expo
npm start

# Press 'a' for Android or 'i' for iOS
```

### 3. Start Sales Agent App

```bash
cd apps/sales-agent
npm install
npm start
```

### 4. Start Shop App

```bash
cd apps/shop
npm install
npm start
```

## Project Structure

```
commodies/
├── web/                          # Admin Web Dashboard (Next.js)
│   ├── src/
│   │   ├── app/                 # Next.js App Router pages
│   │   │   ├── auth/            # Authentication pages
│   │   │   │   └── login/       # Login page ✓
│   │   │   └── dashboard/       # Dashboard pages
│   │   │       ├── page.tsx     # Overview ✓
│   │   │       ├── shops/       # Shop management ✓
│   │   │       ├── orders/      # Order management ✓
│   │   │       ├── products/    # Product management (TODO)
│   │   │       ├── routes/      # Route management (TODO)
│   │   │       └── tracking/    # Live tracking (TODO)
│   │   ├── components/
│   │   │   └── dashboard/       # Dashboard components ✓
│   │   ├── lib/
│   │   │   ├── api/             # API client layer ✓
│   │   │   └── websocket/       # WebSocket client ✓
│   │   └── store/               # Zustand stores ✓
│   └── package.json             # Use YARN
│
├── apps/
│   ├── rider/                   # Rider Mobile App (Expo)
│   │   ├── app/                 # Expo Router screens (TODO)
│   │   ├── components/          # UI components (TODO)
│   │   ├── services/            # API & GPS services (TODO)
│   │   └── package.json         # Use NPM
│   │
│   ├── sales-agent/             # Sales Agent App (Expo)
│   │   └── package.json         # Use NPM
│   │
│   └── shop/                    # Shop App (Expo)
│       ├── app/                 # Existing screens
│       ├── components/          # UI components
│       ├── store/               # State management
│       └── package.json         # Use NPM
│
├── server/                       # Backend (Node.js/Express)
│   ├── API_TESTING_GUIDE.md     # API documentation
│   └── PHASE2_COMPLETION_SUMMARY.md
│
└── docs/                         # Documentation
    ├── FRONTEND_INTEGRATION_PROGRESS.md
    ├── QUICK_START_GUIDE.md
    └── FRONTEND_DELIVERY_SUMMARY.md
```

## Technology Stack

### Admin Web Dashboard
- **Framework**: Next.js 15 (App Router)
- **UI Library**: Material-UI v5
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Real-time**: Socket.io-client
- **Forms**: React Hook Form + Yup
- **Maps**: Mapbox GL
- **Charts**: Recharts
- **Language**: TypeScript

### Mobile Apps
- **Framework**: React Native (Expo SDK 54)
- **Navigation**: Expo Router
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Real-time**: Socket.io-client
- **Maps**: React Native Maps
- **Storage**: Expo SecureStore
- **GPS**: Expo Location
- **Language**: TypeScript

## Features Implemented

### Admin Dashboard ✓
- [x] User authentication (login/logout)
- [x] Protected routes with role checking
- [x] Dashboard overview with stats
- [x] Shop list with approval workflow
- [x] Order list with filtering
- [x] Navigation sidebar
- [x] User profile menu
- [ ] Shop details page
- [ ] Order details page
- [ ] Product management
- [ ] Route management
- [ ] Live tracking map

### Rider App
- [ ] Authentication
- [ ] Active route view
- [ ] GPS tracking
- [ ] Delivery flow (arrive, payment, complete)
- [ ] Signature capture
- [ ] Photo capture
- [ ] Wallet view
- [ ] Performance metrics

### Sales Agent App
- [ ] Shop registration wizard
- [ ] GPS location capture
- [ ] Shop photo capture
- [ ] Order placement
- [ ] Performance dashboard

### Shop App
- [x] Basic UI (25% complete)
- [ ] Backend integration
- [ ] Product browsing
- [ ] Order placement
- [ ] M-Pesa payment
- [ ] Order tracking

## API Integration

All frontend apps connect to: `http://localhost:3001/api`

### Key Endpoints Used

**Authentication**:
- `POST /api/user/login` - User login
- `POST /api/user/register` - User registration

**Orders**:
- `GET /api/orders` - List orders
- `PATCH /api/orders/:id/approve` - Approve order
- `PATCH /api/orders/:id/reject` - Reject order

**Routes**:
- `GET /api/routes` - List routes
- `POST /api/routes` - Create route
- `GET /api/routes/rider/:riderId/active` - Get active route

**Users**:
- `GET /api/user/fetch/all` - List users (shops, riders)
- `PATCH /api/users/:userId/approve` - Approve user

Full API documentation: `server/API_TESTING_GUIDE.md`

## Environment Variables

### Web Dashboard (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WS_URL=http://localhost:3001
NEXT_PUBLIC_MAPBOX_TOKEN=your-token-here
```

### Mobile Apps (`.env`)
```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:3001/api
EXPO_PUBLIC_WS_URL=http://192.168.1.100:3001
```

Note: Replace `192.168.1.100` with your computer's local IP address.

## Development Workflow

### Adding a New Page (Admin Dashboard)

1. Create page file in `web/src/app/dashboard/[section]/page.tsx`
2. Use existing API services from `lib/api/`
3. Follow Material-UI component patterns
4. Add to sidebar navigation in `DashboardSidebar.tsx`

Example:
```typescript
'use client';

import { useEffect, useState } from 'react';
import { getOrders } from '@/lib/api/orders';

export default function NewPage() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const response = await getOrders();
    setData(response.data.items);
  };

  return <div>{/* Your UI */}</div>;
}
```

### Adding a New Screen (Mobile Apps)

1. Create screen file in `app/[screen].tsx`
2. Use services from `services/api.ts`
3. Follow React Native styling patterns

Example:
```typescript
import { View, Text } from 'react-native';
import api from '../services/api';

export default function NewScreen() {
  // Your logic
  return (
    <View>
      <Text>Content</Text>
    </View>
  );
}
```

## Testing

### Manual Testing Checklist

**Admin Dashboard**:
- [ ] Login with admin credentials
- [ ] Navigate to dashboard - see stats
- [ ] Navigate to shops - see list
- [ ] Approve a pending shop
- [ ] Navigate to orders - see list
- [ ] Filter orders by status
- [ ] Logout

**Rider App** (when built):
- [ ] Login as rider
- [ ] View active route
- [ ] Start route
- [ ] Navigate to shop
- [ ] Arrive at shop
- [ ] Complete delivery

## Package Managers

**CRITICAL**: Do not mix package managers!

- **Web Dashboard**: Use `yarn` only
- **Rider App**: Use `npm` only
- **Sales Agent App**: Use `npm` only
- **Shop App**: Use `npm` only

## Common Issues

### Cannot connect to backend
**Solution**: Check if backend is running on `http://localhost:3001`

### 401 Unauthorized errors
**Solution**: Login again to refresh token

### WebSocket not connecting
**Solution**: Verify `NEXT_PUBLIC_WS_URL` in `.env.local`

### Mobile app cannot reach API
**Solution**: Use your computer's local IP instead of localhost

## Documentation

- **API Reference**: `server/API_TESTING_GUIDE.md`
- **Progress Report**: `FRONTEND_INTEGRATION_PROGRESS.md`
- **Setup Guide**: `QUICK_START_GUIDE.md`
- **Delivery Summary**: `FRONTEND_DELIVERY_SUMMARY.md`

## Contributing

When adding new features:

1. Follow existing code patterns
2. Use TypeScript strict mode
3. Add error handling
4. Add loading states
5. Update documentation
6. Test thoroughly

## Next Steps

### High Priority
1. Complete Order Details page
2. Complete Product Management
3. Complete Route Management
4. Build Rider App authentication
5. Build Rider App delivery flow

### Medium Priority
1. Build Sales Agent App
2. Integrate Shop App with backend
3. Add live tracking map
4. Add reporting features

### Low Priority
1. Dark mode implementation
2. Advanced analytics
3. Export functionality
4. Chat/messaging

## Support

For questions or issues:

1. Check existing documentation files
2. Review API testing guide
3. Check browser console for errors
4. Verify backend is running
5. Check environment variables

## License

Proprietary - Kenix Commodities

---

**Last Updated**: November 9, 2025
**Status**: Foundation Complete (35%)
**Next Milestone**: Admin Dashboard 100% (60% remaining)
