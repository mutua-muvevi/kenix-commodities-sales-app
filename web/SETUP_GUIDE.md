# Kenix Commodities Admin Dashboard - Setup Guide

## Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Backend API running at `http://localhost:3001`
- Mapbox account (for maps functionality)

### Installation

1. **Install Dependencies**
```bash
cd web
npm install
```

2. **Configure Environment Variables**

Create or update `.env.local` file:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WS_URL=http://localhost:3001

# Mapbox Configuration (Required for Tracking & Routes pages)
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token-here

# Google Cloud Storage
NEXT_PUBLIC_GCS_BUCKET=kenix-commodities

# App Configuration
NEXT_PUBLIC_APP_NAME=Kenix Commodities
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Getting Mapbox Token:**
1. Sign up at https://mapbox.com
2. Go to Account → Tokens
3. Create a new token or copy default public token
4. Paste into `.env.local`

3. **Start Development Server**
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Default Login Credentials

Use the admin credentials from your backend setup. If not configured, contact your backend administrator.

Typical default:
- **Email:** admin@kenixcommodities.com
- **Password:** (provided by backend admin)

---

## Project Structure

```
web/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── dashboard/          # Protected dashboard pages
│   │   │   ├── analytics/      # Performance metrics
│   │   │   ├── inventory/      # Stock management
│   │   │   ├── loans/          # Loan processing
│   │   │   ├── settings/       # System config
│   │   │   ├── tracking/       # Real-time delivery tracking
│   │   │   ├── routes/         # Route management
│   │   │   ├── products/       # Product catalog
│   │   │   ├── shops/          # Shop management
│   │   │   └── orders/         # Order processing
│   │   └── auth/               # Authentication pages
│   ├── components/             # Reusable components
│   │   └── dashboard/          # Dashboard-specific components
│   ├── lib/                    # Utilities and helpers
│   │   ├── api/                # API service layer
│   │   └── websocket/          # WebSocket client
│   └── types/                  # TypeScript type definitions
├── public/                     # Static assets
└── .env.local                  # Environment variables
```

---

## Available Pages

### Authentication
- `/` - Login page
- `/auth/register` - Registration (if enabled)

### Dashboard
- `/dashboard` - Overview dashboard
- `/dashboard/analytics` - Performance analytics & charts
- `/dashboard/inventory` - Stock management & adjustments
- `/dashboard/tracking` - Real-time delivery tracking
- `/dashboard/routes` - Route management
- `/dashboard/routes/create` - Create new route
- `/dashboard/routes/[id]` - Route details
- `/dashboard/products` - Product catalog
- `/dashboard/shops` - Shop management
- `/dashboard/orders` - Order list
- `/dashboard/orders/[id]` - Order details
- `/dashboard/loans` - Loan overview
- `/dashboard/loans/pending` - Pending loan applications
- `/dashboard/loans/active` - Active loans
- `/dashboard/loans/[id]` - Loan details
- `/dashboard/settings` - System configuration

---

## Development Workflow

### Running the App
```bash
# Development mode (with hot reload)
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Linting
npm run lint
```

### Clearing Build Cache
If you encounter build issues:
```bash
# Windows
rmdir /s /q .next
npm run build

# Mac/Linux
rm -rf .next
npm run build
```

---

## API Integration

### Backend Requirements
Ensure your backend API is running and accessible at the URL specified in `NEXT_PUBLIC_API_URL`.

**Required Backend Endpoints (72+):**

#### Authentication (4)
- POST /api/auth/login
- POST /api/auth/register
- POST /api/auth/refresh
- POST /api/auth/logout

#### Inventory (6)
- GET /api/inventory
- GET /api/inventory/:productId
- PATCH /api/inventory/:productId/adjust
- GET /api/inventory/:productId/history
- PATCH /api/inventory/:productId/min-stock
- GET /api/inventory/export

#### Analytics (7)
- GET /api/analytics/overview
- GET /api/analytics/daily-orders
- GET /api/analytics/top-products
- GET /api/analytics/orders-by-status
- GET /api/analytics/revenue-by-month
- GET /api/performance/sales-agents
- GET /api/performance/riders

#### Loans (7)
- GET /api/loans
- GET /api/loans/:loanId
- GET /api/loans/:loanId/schedule
- GET /api/loans/:loanId/repayments
- PATCH /api/loans/:loanId/approve
- PATCH /api/loans/:loanId/reject
- PATCH /api/loans/:loanId/disburse

#### Settings (4)
- GET /api/settings
- PATCH /api/settings
- PATCH /api/settings/mpesa
- PATCH /api/settings/sms

... (plus 48+ existing endpoints for products, orders, routes, users, etc.)

### WebSocket Integration
The tracking page uses WebSocket for real-time updates:

**WebSocket URL:** `NEXT_PUBLIC_WS_URL`

**Events:**
- `rider:location-updated` - Rider GPS updates
- `delivery:status-changed` - Delivery status changes
- `order:updated` - Order updates
- `route:assigned-to-you` - Route assignments

---

## Troubleshooting

### Common Issues

**1. "Module not found: react-map-gl"**
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

**2. "Network Error" when fetching data**
- Check backend API is running: `http://localhost:3001/api`
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`
- Check CORS settings on backend

**3. Maps not displaying**
- Verify Mapbox token is set in `.env.local`
- Check browser console for errors
- Ensure token has proper permissions

**4. WebSocket not connecting**
- Verify backend WebSocket server is running
- Check `NEXT_PUBLIC_WS_URL` configuration
- Look for firewall/proxy blocking WebSocket

**5. "401 Unauthorized" errors**
- Token expired - log out and log back in
- Check authentication token in localStorage
- Verify backend JWT configuration

---

## Testing

### Manual Testing Checklist

**Authentication:**
- [ ] Login with valid credentials
- [ ] Login with invalid credentials shows error
- [ ] Logout clears session
- [ ] Protected routes redirect to login

**Inventory Management:**
- [ ] View inventory list
- [ ] Filter by stock status
- [ ] Adjust stock (add/remove/set)
- [ ] View stock history
- [ ] Set minimum stock level
- [ ] Export to CSV

**Analytics:**
- [ ] View overview metrics
- [ ] Change date range
- [ ] Charts display data
- [ ] Performance tables load
- [ ] Responsive on mobile

**Loan Management:**
- [ ] View pending applications
- [ ] Approve a loan
- [ ] Reject a loan with reason
- [ ] View active loans
- [ ] Filter active loans
- [ ] View loan details
- [ ] See repayment schedule
- [ ] View payment history

**Settings:**
- [ ] Update system settings
- [ ] View M-Pesa config
- [ ] View SMS config
- [ ] View admin users

**Tracking:**
- [ ] Map loads correctly
- [ ] Rider markers display
- [ ] Shop markers show sequence
- [ ] Routes draw on map
- [ ] WebSocket updates work
- [ ] Filters work

---

## Performance Tips

1. **Enable Production Mode:**
   ```bash
   npm run build
   npm run start
   ```

2. **Optimize Images:**
   - Use WebP format where possible
   - Compress images before upload
   - Use MUI Avatar for lazy loading

3. **Reduce Bundle Size:**
   - Tree-shaking is automatic
   - Avoid importing entire libraries
   - Use dynamic imports for heavy components

4. **Database Queries:**
   - Pagination enabled on all lists
   - Limit results to reasonable defaults
   - Index frequently queried fields

---

## Browser Support

**Desktop:**
- Chrome 120+ ✓
- Firefox 121+ ✓
- Safari 17+ ✓
- Edge 120+ ✓

**Mobile:**
- Chrome Mobile ✓
- Safari iOS 17+ ✓
- Firefox Mobile ✓

---

## Environment-Specific Configuration

### Development (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WS_URL=http://localhost:3001
```

### Staging (.env.staging)
```env
NEXT_PUBLIC_API_URL=https://staging-api.kenixcommodities.com/api
NEXT_PUBLIC_WS_URL=wss://staging-api.kenixcommodities.com
```

### Production (.env.production)
```env
NEXT_PUBLIC_API_URL=https://api.kenixcommodities.com/api
NEXT_PUBLIC_WS_URL=wss://api.kenixcommodities.com
NEXT_PUBLIC_MAPBOX_TOKEN=<production-token>
NEXT_PUBLIC_GCS_BUCKET=kenix-commodities-prod
NEXT_PUBLIC_APP_URL=https://admin.kenixcommodities.com
```

---

## Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

### Docker
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t kenix-admin .
docker run -p 3000:3000 kenix-admin
```

### Manual Deployment
```bash
# Build
npm run build

# Copy files to server
scp -r .next package.json server:/var/www/kenix-admin/

# On server
cd /var/www/kenix-admin
npm install --production
pm2 start npm --name "kenix-admin" -- start
```

---

## Security Checklist

- [ ] HTTPS enabled in production
- [ ] Environment variables not committed to git
- [ ] API authentication tokens secure
- [ ] CORS properly configured
- [ ] Rate limiting enabled on API
- [ ] Input validation on all forms
- [ ] XSS protection enabled
- [ ] CSRF tokens implemented
- [ ] Secure password policies
- [ ] Regular dependency updates

---

## Getting Help

### Resources
- **Next.js Docs:** https://nextjs.org/docs
- **Material-UI Docs:** https://mui.com
- **Recharts Docs:** https://recharts.org
- **Mapbox GL Docs:** https://docs.mapbox.com/mapbox-gl-js

### Support
- Check `IMPLEMENTATION_REPORT.md` for detailed feature documentation
- Review inline code comments
- Inspect browser console for errors
- Check network tab for API errors

---

## Next Steps

After setup:

1. **Configure Mapbox Token** - Required for tracking and routes
2. **Test Backend Connection** - Ensure all API endpoints work
3. **Create Test Data** - Add products, shops, routes for testing
4. **Review Settings** - Configure system settings in dashboard
5. **Test User Flows** - Walk through common admin tasks
6. **Set Up Monitoring** - Configure error logging and analytics

---

**Project Status:** ✅ **READY FOR DEVELOPMENT**

For production deployment, see `DEPLOYMENT_CHECKLIST.md` (create this for production readiness).

---

*Last Updated: November 9, 2025*
