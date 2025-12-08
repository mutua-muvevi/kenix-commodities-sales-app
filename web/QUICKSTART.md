# Kenix Commodities Admin Dashboard - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js 18+ installed
- Yarn package manager
- Backend server running on http://localhost:3001
- Mapbox account (free tier is fine)

---

## Step 1: Environment Setup

1. **Copy environment file:**
```bash
cd web
cp .env.local.example .env.local
```

2. **Get Mapbox Token:**
   - Go to https://account.mapbox.com/
   - Sign up or login
   - Navigate to "Access Tokens"
   - Copy your default token (or create new one)

3. **Configure `.env.local`:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WS_URL=http://localhost:3001
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1Ijoi...  # Paste your token here
```

---

## Step 2: Install & Run

```bash
# Install dependencies (one-time)
yarn install

# Start development server
yarn dev
```

Dashboard will be available at: **http://localhost:3000**

---

## Step 3: Login

1. Navigate to http://localhost:3000/auth/login
2. Use admin credentials from your backend
3. You'll be redirected to the dashboard

---

## 📱 Dashboard Features

### ✅ Completed Pages

| Page | Path | Features |
|------|------|----------|
| **Analytics Dashboard** | `/dashboard` | Stats, charts, recent activity |
| **Products Management** | `/dashboard/products` | CRUD, filters, stock management |
| **Order Details** | `/dashboard/orders/[id]` | Approve/reject, assign to route |
| **Routes List** | `/dashboard/routes` | View all routes, progress tracking |
| **Create Route** | `/dashboard/routes/create` | Interactive map, shop selection |
| **Route Details** | `/dashboard/routes/[id]` | View/edit route, assign rider |
| **Live Tracking** | `/dashboard/tracking` | Real-time map with WebSocket |
| **Shops Management** | `/dashboard/shops` | Already existed |
| **Orders List** | `/dashboard/orders` | Already existed |

---

## 🗺️ Key Features

### Products Management
- Create/Edit/Delete products
- Upload images
- Track stock status
- Manage pricing (retail, wholesale, unit)
- Filter by category and stock

### Order Approval Workflow
1. View order details
2. Click "Approve" or "Reject" (with reason)
3. Assign to route (select route + rider)
4. Track delivery status

### Route Management
1. **Create Route:** Click shops on map to add them
2. **Optimize:** Auto-sort by location
3. **Assign Rider:** Select from dropdown
4. **Track:** View real-time progress

### Live Tracking
- See all active routes on map
- Watch riders move in real-time
- Monitor delivery status
- Filter by route or rider

---

## 🎨 UI Components

### StatusBadge
Smart status indicator:
```tsx
import StatusBadge from '@/components/dashboard/StatusBadge';

<StatusBadge status="pending" type="order" />
<StatusBadge status="approved" type="approval" />
<StatusBadge status="in_transit" type="delivery" />
<StatusBadge status="in-stock" type="stock" />
```

---

## 🔧 Common Tasks

### Add New Product
1. Go to `/dashboard/products`
2. Click "Add Product"
3. Fill form (name, category, price, stock)
4. Click "Create"

### Approve Order
1. Go to `/dashboard/orders`
2. Click order to view details
3. Click "Approve" button
4. Order status changes to "Approved"

### Create Delivery Route
1. Go to `/dashboard/routes`
2. Click "Create Route"
3. Click shops on map to add them
4. Reorder with up/down arrows
5. Click "Optimize Route" (optional)
6. Assign rider
7. Click "Save Route"

### Track Live Deliveries
1. Go to `/dashboard/tracking`
2. Map shows all active routes
3. Blue markers = riders (moving in real-time)
4. Colored markers = shops (green=delivered, yellow=in-progress)
5. Click routes in sidebar to focus

---

## 📊 Charts & Analytics

Dashboard includes:
- **Orders Over Time** (30 days line chart)
- **Orders by Status** (pie chart)
- **Revenue Trend** (7 days area chart)
- **Top Products** (bar chart)

All charts auto-refresh on page load.

---

## 🔌 WebSocket Events

Live tracking uses WebSocket for real-time updates:

**Rider Location:**
```typescript
socket.on('rider:location-updated', (data) => {
  // Rider moved to new coordinates
});
```

**Delivery Status:**
```typescript
socket.on('delivery:status-changed', (data) => {
  // Delivery status changed (delivered, failed, etc.)
});
```

Connection status shown in tracking page sidebar.

---

## 🐛 Troubleshooting

### Map Not Loading
**Problem:** Blank map or "missing access token" error
**Solution:**
1. Check `.env.local` has `NEXT_PUBLIC_MAPBOX_TOKEN`
2. Restart dev server: `Ctrl+C` then `yarn dev`
3. Verify token at https://account.mapbox.com/

### WebSocket Not Connecting
**Problem:** "Live tracking disconnected" message
**Solution:**
1. Ensure backend is running on port 3001
2. Check `NEXT_PUBLIC_WS_URL` in `.env.local`
3. Look for CORS errors in browser console

### API Errors
**Problem:** "Failed to fetch" errors
**Solution:**
1. Backend must be running
2. Check `NEXT_PUBLIC_API_URL` matches backend
3. Verify you're logged in (check token in localStorage)

### Build Errors
**Problem:** TypeScript errors during `yarn build`
**Solution:**
1. Run `yarn install` again
2. Delete `.next` folder: `rm -rf .next`
3. Try `yarn build` again

---

## 📦 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **UI Library:** Material-UI v5
- **Maps:** Mapbox GL + react-map-gl
- **Charts:** Recharts
- **Forms:** React Hook Form + Zod
- **Real-time:** Socket.IO Client
- **State:** Zustand (auth store)

---

## 🚢 Deployment

### Build for Production
```bash
yarn build
yarn start  # Test production build locally
```

### Deploy to Vercel
```bash
# One-time setup
npm i -g vercel

# Deploy
vercel --prod
```

**Set environment variables in Vercel dashboard:**
- `NEXT_PUBLIC_API_URL` → Your production API URL
- `NEXT_PUBLIC_WS_URL` → Your production WebSocket URL
- `NEXT_PUBLIC_MAPBOX_TOKEN` → Your Mapbox token

---

## 📚 Resources

- **Full Documentation:** See `ADMIN_DASHBOARD.md`
- **Backend API Docs:** `server/API_TESTING_GUIDE.md`
- **Mapbox Docs:** https://docs.mapbox.com/mapbox-gl-js/
- **MUI Docs:** https://mui.com/material-ui/
- **Next.js Docs:** https://nextjs.org/docs

---

## ✅ Testing Checklist

Before deploying:
- [ ] Products: Create, edit, delete work
- [ ] Orders: Approve, reject, assign work
- [ ] Routes: Create with map works
- [ ] Tracking: Map loads, markers show
- [ ] Charts: All dashboard charts render
- [ ] WebSocket: Connection status shows "Connected"
- [ ] Mobile: Responsive on phone/tablet
- [ ] Build: `yarn build` succeeds

---

## 🎯 Next Steps

1. ✅ Setup environment
2. ✅ Start dev server
3. ✅ Login to dashboard
4. ✅ Create a test product
5. ✅ Create a test route
6. ✅ View live tracking
7. 📖 Read full docs in `ADMIN_DASHBOARD.md`

---

**Need Help?**
- Check console for errors
- Review `ADMIN_DASHBOARD.md` for detailed info
- Ensure backend is running and accessible

**Ready to go?** Start with `yarn dev` and open http://localhost:3000! 🚀
