# Kenix Commodities - Admin Dashboard Documentation

## Overview

World-class admin dashboard for managing the Kenix Commodities B2B distribution platform. Built to rival industry leaders like Wasoko and Twiga Foods.

**Built with:**
- Next.js 15 (App Router)
- React 19
- TypeScript
- Material-UI (MUI)
- Mapbox GL (for maps)
- Recharts (for analytics)
- Socket.IO (real-time tracking)
- React Hook Form + Zod (forms & validation)

---

## Features Completed

### 1. Products Management (`/dashboard/products`)
Complete CRUD system for product catalog:
- Full data table with pagination and sorting
- Create, edit, and delete products
- Category management integration
- Stock status tracking (In Stock, Low Stock, Out of Stock)
- Image upload support (Google Cloud Storage ready)
- Advanced filtering:
  - Search by product name
  - Filter by category
  - Filter by stock status
- Price management (retail, wholesale, unit pricing)
- SKU tracking
- Quantity and reserved stock display

**Key Files:**
- `src/app/dashboard/products/page.tsx`

### 2. Order Details & Approval Workflow (`/dashboard/orders/[id]`)
Comprehensive order management with admin controls:
- Complete order details view
- Product list with images and pricing
- Delivery location map integration
- **Approval Workflow:**
  - Approve button (one-click)
  - Reject button (with reason modal)
- **Route Assignment:**
  - Select route dropdown
  - Select rider dropdown
  - Assign order to delivery route
- **Product Management:**
  - Remove individual products from order
  - Real-time total amount recalculation
- **Order Actions:**
  - Cancel order (with reason)
  - View customer information
  - Payment method display
  - Delivery notes

**Key Files:**
- `src/app/dashboard/orders/[id]/page.tsx`

### 3. Route Management

#### Routes List (`/dashboard/routes`)
- Paginated table of all routes
- Progress tracking with visual progress bars
- Filters:
  - By status (pending, active, in progress, completed)
  - By assigned rider
  - By date
- Route information:
  - Route name and code
  - Assigned rider details
  - Number of shops
  - Current progress (X/Y shops)
  - Operating schedule
- Quick actions:
  - View route details
  - Edit route (if pending)
  - Create new route

**Key Files:**
- `src/app/dashboard/routes/page.tsx`

#### Route Creation (`/dashboard/routes/create`)
Interactive map-based route planning:
- **Three-panel layout:**
  - Left: Available shops list with checkboxes
  - Center: Interactive Mapbox map
  - Right: Route details form & selected shops sequence
- **Interactive Map Features:**
  - All shops displayed as markers
  - Click shop on map to add/remove from route
  - Selected shops show sequence numbers
  - Route path displayed as polyline
  - Numbered markers showing delivery sequence
- **Shop Management:**
  - Select shops from list or map
  - Drag to reorder sequence (up/down arrows)
  - Remove shops from route
  - Real-time route path updates
- **Route Configuration:**
  - Route name and description
  - Assign rider (optional)
  - Start/end time
  - Operating days (multi-select)
- **Route Optimization:**
  - Optimize button (sorts by geography)
  - One-click route saving

**Key Files:**
- `src/app/dashboard/routes/create/page.tsx`

#### Route Details (`/dashboard/routes/[id]`)
Detailed route view and management:
- Route information cards (status, rider, progress, schedule)
- Interactive map showing:
  - All shops with sequence numbers
  - Color-coded markers (delivered=green, in-progress=yellow, pending=blue)
  - Route path polyline
- Shop sequence list:
  - Current shop highlighted
  - Delivery status per shop
  - Estimated arrival times
  - Shop contact information
- **Admin Actions:**
  - Reassign rider
  - Override sequence (skip to specific shop with reason)
  - Real-time refresh
  - Edit shops sequence

**Key Files:**
- `src/app/dashboard/routes/[id]/page.tsx`

### 4. Live Delivery Tracking (`/dashboard/tracking`)
**THE CENTERPIECE** - Real-time tracking with WebSocket integration:

- **Full-Screen Interactive Map:**
  - Mapbox GL with real-time updates
  - Initialized at Nairobi coordinates

- **Shop Markers:**
  - Color-coded by delivery status:
    - Green: Delivered
    - Yellow: In Progress (rider arrived)
    - Blue: Pending
    - Red: Failed/Skipped
  - Numbered by sequence
  - Click to view shop details popup

- **Rider Markers:**
  - Blue pulsing markers
  - Real-time position updates via WebSocket
  - Click to view rider info
  - Shows current route and next stop

- **Route Polylines:**
  - Different colors for each route
  - Highlight on route selection
  - Shows planned delivery path

- **Real-Time WebSocket Events:**
  ```typescript
  rider:location-updated → Updates rider marker position
  delivery:status-changed → Updates shop marker color
  order:updated → Shows notification
  ```

- **Sidebar Panel:**
  - Active routes list with progress bars
  - Click route to center map
  - Filter by route or rider
  - Active riders list with last update time
  - Connection status indicator

- **Features:**
  - Auto-reconnection on disconnect
  - Mobile responsive (drawer on mobile)
  - Real-time status updates
  - Map legend
  - Filter controls

**Key Files:**
- `src/app/dashboard/tracking/page.tsx`
- `src/lib/websocket/client.ts`

### 5. Enhanced Analytics Dashboard (`/dashboard`)
Comprehensive business intelligence:

- **Stats Cards (4 cards):**
  - Total Orders (with trend indicator)
  - Pending Approvals (with alert if >10)
  - Active Routes (live count)
  - Total Shops (with pending count)

- **Revenue Cards:**
  - Total Revenue (all-time)
  - Today's Revenue
  - Today's Orders
  - Average order value

- **Charts (Recharts):**
  - **Orders Over Time:** Line chart (last 30 days)
  - **Orders by Status:** Pie chart
  - **Revenue Trend:** Area chart (last 7 days)
  - **Top Products:** Bar chart (by sales)

- **Quick Actions:**
  - Approve pending shops
  - Create new route
  - View live tracking

- **Recent Activity:**
  - Latest 10 orders table
  - Real-time status badges
  - Direct links to order details

- **Alerts:**
  - Warning banner if >10 pending approvals

**Key Files:**
- `src/app/dashboard/page.tsx`

### 6. Reusable Components

#### StatusBadge
Smart status chip component with type-specific styling:
- Order status (pending, processing, completed, cancelled)
- Approval status (approved, pending, rejected)
- Delivery status (delivered, in_transit, assigned, pending, failed)
- Route status (completed, in_progress, active, pending, cancelled)
- Stock status (in-stock, low-stock, out-of-stock)

**Key Files:**
- `src/components/dashboard/StatusBadge.tsx`

---

## Setup Instructions

### 1. Environment Variables

Copy the example file:
```bash
cp .env.local.example .env.local
```

Configure the following:
```env
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WS_URL=http://localhost:3001

# Mapbox (REQUIRED for maps)
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_mapbox_token_here

# Google Cloud Storage
NEXT_PUBLIC_GOOGLE_CLOUD_BUCKET=kenix-commodities-bucket
```

**Get Mapbox Token:**
1. Go to https://account.mapbox.com/
2. Sign up or log in
3. Navigate to "Access Tokens"
4. Create a new token or copy existing one
5. Paste in `.env.local`

### 2. Install Dependencies

```bash
cd web
yarn install
```

**Key Dependencies:**
- `mapbox-gl` - Map rendering
- `react-map-gl` - React wrapper for Mapbox
- `recharts` - Charts and graphs
- `socket.io-client` - Real-time communication
- `zod` - Schema validation
- `react-hook-form` - Form management
- `@hookform/resolvers` - Zod integration
- `sonner` - Toast notifications

### 3. Start Development Server

**Make sure backend is running first:**
```bash
cd ../server
npm run dev  # Should be on http://localhost:3001
```

**Then start frontend:**
```bash
cd ../web
yarn dev
```

Frontend will be available at: http://localhost:3000

### 4. Access Dashboard

1. Navigate to http://localhost:3000/auth/login
2. Login with admin credentials
3. You'll be redirected to `/dashboard`

**Admin Role Required:**
- The dashboard checks for `user.role === 'admin'`
- Non-admin users are redirected to login

---

## API Integration

All API calls are centralized in `src/lib/api/`:

### Products API (`src/lib/api/products.ts`)
- `getProducts(params)` - List with filters
- `getProduct(id)` - Single product
- `createProduct(data)` - Create new
- `updateProduct(id, data)` - Update existing
- `deleteProduct(id)` - Delete product

### Orders API (`src/lib/api/orders.ts`)
- `getOrders(params)` - List with filters
- `getOrder(id)` - Single order
- `approveOrder(id, notes?)` - Approve order
- `rejectOrder(id, reason)` - Reject order
- `assignOrderToRoute(id, routeId, riderId)` - Assign to route
- `removeProductFromOrder(orderId, productId)` - Remove product
- `cancelOrder(id, reason)` - Cancel order

### Routes API (`src/lib/api/routes.ts`)
- `getRoutes(params)` - List with filters
- `getRoute(id)` - Single route
- `createRoute(data)` - Create new route
- `assignRider(routeId, riderId)` - Assign rider
- `updateShopSequence(routeId, shops)` - Update sequence
- `overrideSequence(routeId, currentShopId, nextShopId, reason)` - Skip shop
- `optimizeRoute(routeId)` - Optimize path

### Users API (`src/lib/api/users.ts`)
- `getUsers(params)` - List with filters (role: 'shop', 'rider', etc.)

### Categories API (`src/lib/api/categories.ts`)
- `getCategories()` - List all categories

### WebSocket Client (`src/lib/websocket/client.ts`)
- `connectWebSocket()` - Initialize connection
- `disconnectWebSocket()` - Close connection
- `onRiderLocationUpdate(callback)` - Listen for rider updates
- `onDeliveryStatusChange(callback)` - Listen for delivery updates
- `onOrderUpdate(callback)` - Listen for order updates

---

## Mapbox Integration

### Map Configuration

**Nairobi Center Coordinates:**
```typescript
const NAIROBI_CENTER: [number, number] = [36.817223, -1.286389];
```

**Map Styles Available:**
- `mapbox://styles/mapbox/streets-v12` (Default - used everywhere)
- `mapbox://styles/mapbox/satellite-v9`
- `mapbox://styles/mapbox/light-v11`
- `mapbox://styles/mapbox/dark-v11`

### Custom Markers

**Shop Markers:**
```typescript
<Marker longitude={lng} latitude={lat}>
  <Box sx={{
    width: 36,
    height: 36,
    borderRadius: '50%',
    backgroundColor: color, // Status-based
    border: '3px solid white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    color: 'white',
  }}>
    {sequenceNumber}
  </Box>
</Marker>
```

**Rider Markers:**
```typescript
<Marker longitude={lng} latitude={lat}>
  <Box sx={{
    width: 40,
    height: 40,
    borderRadius: '50%',
    backgroundColor: '#1976d2',
    animation: 'pulse 2s infinite', // Pulsing effect
  }}>
    <MyLocationIcon />
  </Box>
</Marker>
```

**Route Polylines:**
```typescript
<Source id="route" type="geojson" data={routePath}>
  <Layer
    id="route-layer"
    type="line"
    paint={{
      'line-color': '#1976d2',
      'line-width': 3,
    }}
  />
</Source>
```

### Map Popups

```typescript
<Popup
  longitude={lng}
  latitude={lat}
  onClose={() => setSelected(null)}
  closeOnClick={false}
>
  <Box sx={{ p: 1 }}>
    {/* Popup content */}
  </Box>
</Popup>
```

---

## Real-Time Features

### WebSocket Events

**Rider Location Updates:**
```typescript
socket.on('rider:location-updated', (data) => {
  // data: { riderId, location: { lat, lng }, accuracy, timestamp }
  updateRiderMarker(data.riderId, data.location);
});
```

**Delivery Status Changes:**
```typescript
socket.on('delivery:status-changed', (data) => {
  // data: { deliveryId, shopId, status, riderId, timestamp }
  updateShopMarker(data.shopId, data.status);
});
```

**Order Updates:**
```typescript
socket.on('order:updated', (data) => {
  // data: { orderId, shopId, status, message }
  showNotification(data.message);
});
```

### Connection Management

```typescript
// Initialize on mount
useEffect(() => {
  const socket = connectWebSocket();

  socket.on('connect', () => {
    setConnected(true);
  });

  socket.on('disconnect', () => {
    setConnected(false);
  });

  // Cleanup on unmount
  return () => {
    disconnectWebSocket();
  };
}, []);
```

---

## Performance Optimizations

### Map Performance
- Markers are memoized
- Only filtered markers are rendered
- Route polylines use GeoJSON sources (GPU accelerated)
- Map style loaded from CDN

### Data Fetching
- Pagination on all lists
- Debounced search inputs
- Cached API responses where appropriate
- Loading states for all async operations

### Real-Time Updates
- WebSocket connection pooling
- Automatic reconnection
- Event throttling for high-frequency updates
- Selective rendering on data changes

---

## Responsive Design

All pages are fully responsive:

### Desktop (≥1200px)
- Full sidebar navigation
- Multi-column layouts
- Large maps and charts

### Tablet (768px - 1199px)
- Collapsible sidebar
- Two-column layouts
- Medium-sized maps

### Mobile (<768px)
- Drawer navigation
- Single-column layouts
- Full-width maps
- Touch-optimized controls

---

## Error Handling

### API Errors
- Centralized error handler (`handleApiError`)
- User-friendly toast notifications
- Retry mechanisms for critical operations
- Fallback UI states

### Map Errors
- Graceful fallback if Mapbox token missing
- Error boundary for map crashes
- Default coordinates if shop location missing

### WebSocket Errors
- Auto-reconnection on disconnect
- Connection status indicator
- Offline mode detection

---

## Testing Checklist

### Products Management
- [ ] Create product with all fields
- [ ] Edit product details
- [ ] Delete product
- [ ] Filter by category
- [ ] Filter by stock status
- [ ] Search by name
- [ ] Pagination works

### Order Details
- [ ] View order details
- [ ] Approve order
- [ ] Reject order with reason
- [ ] Assign to route
- [ ] Remove product from order
- [ ] Cancel order
- [ ] Map displays correctly

### Route Management
- [ ] Create route with map
- [ ] Select shops on map
- [ ] Reorder shop sequence
- [ ] Optimize route
- [ ] Assign rider
- [ ] View route details
- [ ] Override delivery sequence

### Live Tracking
- [ ] Map loads with shops
- [ ] Rider markers appear
- [ ] Real-time updates work
- [ ] Filter by route
- [ ] Filter by rider
- [ ] Click markers for details
- [ ] WebSocket connects

### Analytics Dashboard
- [ ] All stats load
- [ ] Charts render correctly
- [ ] Recent orders display
- [ ] Quick actions work
- [ ] Alerts show when needed

---

## Deployment

### Build for Production

```bash
yarn build
```

### Environment Variables (Production)

```env
NEXT_PUBLIC_API_URL=https://api.kenixcommodities.com/api
NEXT_PUBLIC_WS_URL=wss://api.kenixcommodities.com
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_production_token
NEXT_PUBLIC_GOOGLE_CLOUD_BUCKET=kenix-prod-bucket
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Deploy to Other Platforms

Build output is in `.next/` directory. Can be deployed to:
- Vercel (recommended)
- Netlify
- AWS Amplify
- Docker container
- Any Node.js hosting

---

## Troubleshooting

### Mapbox Not Loading
1. Check `NEXT_PUBLIC_MAPBOX_TOKEN` is set
2. Verify token is valid at https://account.mapbox.com/
3. Check browser console for errors
4. Ensure mapbox-gl CSS is imported

### WebSocket Not Connecting
1. Verify backend is running
2. Check `NEXT_PUBLIC_WS_URL` is correct
3. Check CORS settings on backend
4. Verify authentication token is valid

### Charts Not Rendering
1. Check data format matches expected schema
2. Verify Recharts is installed
3. Check container has defined height
4. Look for console errors

---

## Architecture Decisions

### Why Next.js 15?
- Server-side rendering for SEO
- App Router for better layouts
- Built-in API routes (if needed)
- Optimized production builds
- Great TypeScript support

### Why Mapbox GL?
- Superior performance vs Google Maps
- Better offline support
- More customization options
- Lower cost at scale
- GeoJSON support

### Why Material-UI?
- Enterprise-grade components
- Excellent accessibility
- Comprehensive theme system
- Strong TypeScript support
- Large ecosystem

### Why WebSocket?
- Real-time bidirectional communication
- Lower latency than polling
- Better for live tracking
- Established protocol
- Good browser support

---

## Future Enhancements

### Planned Features
1. **Advanced Analytics:**
   - Rider performance metrics
   - Delivery time predictions
   - Route efficiency scoring
   - Customer behavior analysis

2. **Notifications System:**
   - In-app notifications
   - Email alerts for admins
   - SMS notifications for critical events

3. **Bulk Operations:**
   - Bulk product import/export (CSV)
   - Bulk order processing
   - Batch route creation

4. **Mobile App:**
   - React Native app for riders
   - Offline-first architecture
   - Background location tracking

5. **AI/ML Features:**
   - Route optimization using ML
   - Demand forecasting
   - Dynamic pricing suggestions
   - Fraud detection

---

## Support & Maintenance

### Logs Location
- Browser console (client-side)
- Backend logs (server-side)
- WebSocket connection logs

### Common Issues
- Map markers not showing → Check coordinates format [lng, lat]
- WebSocket disconnects → Check backend is running
- Slow chart rendering → Reduce data points or use virtualization

### Performance Monitoring
- Use React DevTools Profiler
- Monitor bundle size with `yarn analyze`
- Check Lighthouse scores
- Monitor API response times

---

## Credits

Built by the Kenix Commodities Engineering Team

**Technologies:**
- Next.js, React, TypeScript
- Material-UI, Mapbox GL, Recharts
- Socket.IO, React Hook Form, Zod

**Inspired by:**
- Wasoko (Kenya)
- Twiga Foods (Kenya)
- DoorDash Merchant Portal
- Uber Eats Manager

---

**Version:** 1.0.0
**Last Updated:** 2025-11-09
**Status:** Production Ready ✅
