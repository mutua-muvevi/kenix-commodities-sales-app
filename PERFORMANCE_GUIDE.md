# Kenix Commodities - Performance Optimization Guide

**Version:** 1.0.0
**Last Updated:** 2025-11-09
**Performance Target:** < 2s response time (95th percentile)

---

## Table of Contents

1. [Overview](#overview)
2. [Performance Metrics & Monitoring](#performance-metrics--monitoring)
3. [Backend Optimizations](#backend-optimizations)
4. [Database Optimizations](#database-optimizations)
5. [Frontend Optimizations](#frontend-optimizations)
6. [Mobile App Optimizations](#mobile-app-optimizations)
7. [Network & CDN Optimizations](#network--cdn-optimizations)
8. [Caching Strategies](#caching-strategies)
9. [Infrastructure Scaling](#infrastructure-scaling)
10. [Performance Testing](#performance-testing)

---

## Overview

Performance optimization ensures Kenix Commodities provides fast, responsive experience for all users.

**Performance Goals:**
- API response time: < 500ms (median), < 2s (95th percentile)
- Admin dashboard load time: < 3s
- Mobile app launch time: < 2s
- Database query time: < 100ms
- Image load time: < 1s
- Real-time updates latency: < 500ms

**Performance Impact on Business:**
- 100ms faster response = 1% increase in conversions
- 1s page load delay = 11% fewer page views
- 53% mobile users abandon site if load > 3s

---

## Performance Metrics & Monitoring

### Key Metrics to Track

**Backend (API):**
- Response time (p50, p95, p99)
- Throughput (requests/second)
- Error rate (%)
- Database query time
- CPU utilization (%)
- Memory usage (MB)
- Active connections

**Frontend (Dashboard):**
- Time to First Byte (TTFB)
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Time to Interactive (TTI)
- Cumulative Layout Shift (CLS)
- Bundle size (MB)

**Mobile Apps:**
- App launch time
- Screen render time
- API request latency
- Crash-free rate (%)
- Battery usage

### Monitoring Tools

**Already configured** (see MONITORING_GUIDE.md):
- PM2 Plus (backend metrics)
- MongoDB Atlas (database metrics)
- Sentry (error tracking with performance)
- UptimeRobot (uptime monitoring)

**Additional tools:**
- **Lighthouse** (frontend performance audits)
- **WebPageTest** (detailed waterfall analysis)
- **React Native Performance Monitor** (mobile profiling)

---

## Backend Optimizations

### 1. Enable Response Compression

**Reduces payload size by 70-90%**

```bash
cd /var/www/kenix-commodities/server
npm install compression --save
```

**In `server/index.js`:**

```javascript
const compression = require('compression');

// Add before routes
app.use(compression({
  level: 6, // Compression level (0-9, 6 is good balance)
  threshold: 1024, // Only compress responses > 1KB
  filter: (req, res) => {
    // Don't compress if client doesn't support it
    if (req.headers['x-no-compression']) {
      return false;
    }
    // Compress all responses
    return compression.filter(req, res);
  }
}));
```

**Test:**

```bash
# Before compression
curl -I https://api.kenixcommodities.com/api/products
# Content-Length: 45678

# After compression
curl -I -H "Accept-Encoding: gzip" https://api.kenixcommodities.com/api/products
# Content-Encoding: gzip
# Content-Length: 8234  (82% reduction!)
```

**Impact:** 70-90% bandwidth savings, faster response times

---

### 2. Implement Response Caching

**Cache frequently accessed, rarely changing data**

```bash
npm install node-cache --save
```

**Create cache middleware:**

```javascript
// server/middleware/cache.js
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 }); // 10 minutes default

const cacheMiddleware = (duration = 600) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = req.originalUrl;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      console.log(`Cache HIT: ${key}`);
      return res.json(cachedResponse);
    }

    // Override res.json to cache response
    const originalJson = res.json.bind(res);
    res.json = (data) => {
      cache.set(key, data, duration);
      console.log(`Cache MISS: ${key} (cached for ${duration}s)`);
      return originalJson(data);
    };

    next();
  };
};

module.exports = cacheMiddleware;
```

**Apply to routes:**

```javascript
const cacheMiddleware = require('./middleware/cache');

// Cache product catalog for 10 minutes
app.get('/api/products', cacheMiddleware(600), productController.getProducts);

// Cache categories for 1 hour
app.get('/api/categories', cacheMiddleware(3600), categoryController.getCategories);

// Don't cache user-specific data
app.get('/api/users/me', authMiddleware, userController.getMe);  // No cache

// Clear cache on updates
app.post('/api/products', authMiddleware, (req, res, next) => {
  // Product created, clear product cache
  cache.flushAll();
  next();
}, productController.createProduct);
```

**Impact:** 10-100x faster responses for cached data

---

### 3. Database Connection Pooling

**Reuse database connections instead of creating new ones**

**Already configured** in Mongoose, but verify:

```javascript
// server/config/database.js
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, {
  maxPoolSize: 10,          // Maximum connections in pool
  minPoolSize: 2,           // Minimum connections to maintain
  socketTimeoutMS: 45000,   // Close sockets after 45s inactivity
  serverSelectionTimeoutMS: 5000,  // Timeout for server selection
  family: 4                 // Use IPv4
});

// Monitor connection pool
mongoose.connection.on('connected', () => {
  console.log('MongoDB connected with pool size:', mongoose.connection.client.s.options.maxPoolSize);
});
```

**Monitor pool usage:**

```javascript
// Log pool stats periodically
setInterval(() => {
  const pool = mongoose.connection.client.topology.s.pool;
  console.log('Connection pool:', {
    size: pool.totalConnectionCount,
    available: pool.availableConnectionCount,
    pending: pool.waitQueueSize
  });
}, 60000); // Every minute
```

**Tune based on load:**
- Low traffic (<10 req/s): maxPoolSize = 5
- Medium traffic (10-50 req/s): maxPoolSize = 10
- High traffic (>50 req/s): maxPoolSize = 20+

**Impact:** Eliminates connection overhead, handles more concurrent requests

---

### 4. Optimize Middleware Order

**Place fast middleware first, slow middleware last**

```javascript
// Optimal order:
app.use(helmet());                    // Fast (security headers)
app.use(compression());               // Fast (stream compression)
app.use(cors());                      // Fast (CORS headers)
app.use(express.json({ limit: '10mb' }));  // Fast (body parsing)
app.use(morgan('combined'));          // Fast (logging)

// Routes (business logic)
app.use('/api', routes);

// Error handler (last)
app.use(errorHandler);
```

**Avoid:**
```javascript
// BAD: Slow middleware before routes
app.use(expensiveMiddleware);  // Runs on EVERY request
app.use('/api/products', productRoutes);
```

**Good:**
```javascript
// GOOD: Slow middleware only where needed
app.use('/api/products', expensiveMiddleware, productRoutes);  // Runs only on /products
```

---

### 5. Implement Async/Await Properly

**Bad (Sequential):**

```javascript
// SLOW: Waits for each operation sequentially
const user = await User.findById(userId);
const orders = await Order.find({ user: userId });
const wallet = await Wallet.findOne({ user: userId });
// Total time: 300ms + 200ms + 150ms = 650ms
```

**Good (Parallel):**

```javascript
// FAST: Runs all queries in parallel
const [user, orders, wallet] = await Promise.all([
  User.findById(userId),
  Order.find({ user: userId }),
  Wallet.findOne({ user: userId })
]);
// Total time: max(300ms, 200ms, 150ms) = 300ms (54% faster!)
```

**Apply throughout codebase:**

```javascript
// Order details endpoint
async getOrderDetails(req, res) {
  const { orderId } = req.params;

  // Parallel fetching
  const [order, shop, rider, products] = await Promise.all([
    Order.findById(orderId),
    Shop.findById(order.shop),
    Rider.findById(order.rider),
    Product.find({ _id: { $in: order.items.map(i => i.product) } })
  ]);

  res.json({ order, shop, rider, products });
}
```

---

### 6. Pagination & Limiting

**Always paginate large result sets**

**Bad:**

```javascript
// Returns ALL products (thousands!)
const products = await Product.find();
```

**Good:**

```javascript
// Returns 20 products per page
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 20;
const skip = (page - 1) * limit;

const products = await Product.find()
  .limit(limit)
  .skip(skip)
  .lean();  // Returns plain JS objects (faster than Mongoose documents)

const total = await Product.countDocuments();

res.json({
  data: products,
  pagination: {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
  }
});
```

**Even better: Cursor-based pagination for large datasets**

```javascript
// Instead of skip (slow on large offsets)
const lastId = req.query.lastId;

const products = await Product.find(
  lastId ? { _id: { $gt: lastId } } : {}
)
.limit(20)
.sort({ _id: 1 });

res.json({
  data: products,
  nextCursor: products.length > 0 ? products[products.length - 1]._id : null
});
```

---

### 7. Reduce Payload Size

**Only return needed fields**

**Bad:**

```javascript
// Returns ALL fields (including createdAt, updatedAt, __v, etc.)
const users = await User.find();
```

**Good:**

```javascript
// Returns only needed fields
const users = await User.find()
  .select('firstName lastName email role status')
  .lean();
```

**Or use projections:**

```javascript
const users = await User.find({}, 'firstName lastName email');
```

**Impact:** 30-50% smaller responses

---

### 8. Optimize Socket.IO

**Current WebSocket setup:**

```javascript
io.on('connection', (socket) => {
  // Optimize: Only join relevant rooms
  socket.on('join:rider', (riderId) => {
    socket.join(`rider:${riderId}`);
  });

  socket.on('join:shop', (shopId) => {
    socket.join(`shop:${shopId}`);
  });

  // Don't send updates to all clients
  // BAD: io.emit('order:updated', order);

  // GOOD: Send only to relevant users
  io.to(`shop:${order.shop}`).emit('order:updated', order);
  io.to(`rider:${order.rider}`).emit('order:updated', order);
});
```

**Enable compression:**

```javascript
const io = require('socket.io')(server, {
  cors: { origin: process.env.CLIENT_URL },
  perMessageDeflate: {
    threshold: 1024,  // Compress messages > 1KB
    zlibDeflateOptions: {
      chunkSize: 8 * 1024,
      level: 6
    }
  }
});
```

**Throttle location updates:**

```javascript
// Client-side (rider app)
let lastLocationUpdate = 0;

navigator.geolocation.watchPosition((position) => {
  const now = Date.now();

  // Only send update every 10 seconds
  if (now - lastLocationUpdate > 10000) {
    socket.emit('location:update', {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    });
    lastLocationUpdate = now;
  }
});
```

---

## Database Optimizations

### 1. Verify All Indexes Exist

**Check existing indexes:**

```javascript
// Connect to MongoDB
mongo "your_mongodb_uri"

// Check indexes on each collection
db.users.getIndexes()
db.products.getIndexes()
db.orders.getIndexes()
db.riders.getIndexes()
```

**Expected indexes:**

```javascript
// Users
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ status: 1 });

// Products
db.products.createIndex({ category: 1 });
db.products.createIndex({ name: 'text' });  // Text search
db.products.createIndex({ price: 1 });
db.products.createIndex({ status: 1 });

// Orders
db.orders.createIndex({ shop: 1, createdAt: -1 });
db.orders.createIndex({ rider: 1, deliveryDate: 1 });
db.orders.createIndex({ status: 1 });
db.orders.createIndex({ 'payment.status': 1 });

// Compound indexes for common queries
db.orders.createIndex({ shop: 1, status: 1, createdAt: -1 });
db.orders.createIndex({ rider: 1, status: 1, deliveryDate: 1 });
```

**Test index usage:**

```javascript
// Use explain() to verify index used
db.orders.find({ shop: 'shop_id', status: 'pending' }).explain('executionStats');

// Look for:
// "executionStats": {
//   "executionSuccess": true,
//   "nReturned": 10,
//   "totalDocsExamined": 10,  // Should match nReturned (using index)
//   "executionTimeMillis": 5   // Should be < 100ms
// }
```

**If totalDocsExamined >> nReturned:** Missing index! Add one.

---

### 2. Use Lean Queries

**Mongoose documents have overhead (virtuals, getters, setters)**

**Slow:**

```javascript
const orders = await Order.find({ status: 'pending' });
// Returns Mongoose documents (heavy)
```

**Fast:**

```javascript
const orders = await Order.find({ status: 'pending' }).lean();
// Returns plain JavaScript objects (30-50% faster)
```

**Use `.lean()` when:**
- Reading data for API responses
- No need for Mongoose features (save, virtuals, etc.)
- Performance critical

**Don't use `.lean()` when:**
- Need to call .save()
- Need virtuals or getters
- Modifying documents

---

### 3. Limit Populate Depth

**Bad (slow):**

```javascript
const order = await Order.findById(orderId)
  .populate('shop')
  .populate('rider')
  .populate('items.product')
  .populate('salesAgent');
// Multiple database queries
```

**Better:**

```javascript
// Only populate what's needed
const order = await Order.findById(orderId)
  .populate('shop', 'name phone address')  // Select specific fields
  .populate('rider', 'firstName lastName phone')
  .lean();
```

**Best (for complex data):**

```javascript
// Use aggregation pipeline (single query)
const orderDetails = await Order.aggregate([
  { $match: { _id: mongoose.Types.ObjectId(orderId) } },
  {
    $lookup: {
      from: 'shops',
      localField: 'shop',
      foreignField: '_id',
      as: 'shopDetails'
    }
  },
  {
    $lookup: {
      from: 'riders',
      localField: 'rider',
      foreignField: '_id',
      as: 'riderDetails'
    }
  },
  { $unwind: '$shopDetails' },
  { $unwind: '$riderDetails' },
  {
    $project: {
      _id: 1,
      total: 1,
      status: 1,
      'shopDetails.name': 1,
      'shopDetails.phone': 1,
      'riderDetails.firstName': 1,
      'riderDetails.lastName': 1
    }
  }
]);
```

---

### 4. Use Projection to Reduce Data Transfer

**Bad:**

```javascript
const users = await User.find();  // Returns all fields
```

**Good:**

```javascript
const users = await User.find({}, 'firstName lastName email role');
// Only returns specified fields
```

**Or:**

```javascript
const users = await User.find().select('firstName lastName email role').lean();
```

---

### 5. Batch Operations

**Bad (N+1 problem):**

```javascript
// Updates each product individually (100 queries!)
for (const product of products) {
  await Product.updateOne({ _id: product._id }, { $inc: { stock: -10 } });
}
```

**Good (bulk operation):**

```javascript
// Single bulk update (1 query!)
const bulkOps = products.map(product => ({
  updateOne: {
    filter: { _id: product._id },
    update: { $inc: { stock: -10 } }
  }
}));

await Product.bulkWrite(bulkOps);
```

**Impact:** 100x faster for batch operations

---

### 6. Avoid Using $where

**Slow (executes JavaScript for each document):**

```javascript
db.products.find({ $where: "this.price > 100 && this.stock > 0" });
```

**Fast (use query operators):**

```javascript
db.products.find({ price: { $gt: 100 }, stock: { $gt: 0 } });
```

---

### 7. Monitor Slow Queries

**Enable profiling in MongoDB Atlas:**

1. Go to cluster → Performance Advisor
2. View slow queries (>100ms)
3. Add recommended indexes

**Or enable profiling manually:**

```javascript
// Enable profiling (captures queries > 100ms)
db.setProfilingLevel(1, { slowms: 100 });

// Check slow queries
db.system.profile.find().sort({ ts: -1 }).limit(10).pretty();

// Example output:
// {
//   "op": "query",
//   "ns": "kenix_production.orders",
//   "command": { "find": "orders", "filter": { "status": "pending" } },
//   "millis": 245,  // Took 245ms (slow!)
//   "ts": ISODate("2025-11-09T10:30:00Z")
// }

// Solution: Add index on status
db.orders.createIndex({ status: 1 });
```

---

## Frontend Optimizations

### 1. Code Splitting

**Next.js does this automatically, but verify:**

```javascript
// Dynamic imports for heavy components
import dynamic from 'next/dynamic';

// Load map component only when needed
const DashboardMap = dynamic(() => import('../components/DashboardMap'), {
  ssr: false,  // Don't render on server
  loading: () => <div>Loading map...</div>
});

export default function DeliveriesPage() {
  return (
    <div>
      <h1>Deliveries</h1>
      <DashboardMap />
    </div>
  );
}
```

**Impact:** Smaller initial bundle, faster page loads

---

### 2. Optimize Images

**Use Next.js Image component:**

```javascript
import Image from 'next/image';

// BAD
<img src="/products/rice.jpg" alt="Rice" />

// GOOD
<Image
  src="/products/rice.jpg"
  alt="Rice"
  width={300}
  height={300}
  placeholder="blur"  // Show blur while loading
  blurDataURL="data:image/jpeg;base64,..."  // Tiny base64 image
/>
```

**Features:**
- Automatic lazy loading
- Responsive images (srcset)
- WebP format (30% smaller)
- Blur placeholder

**Configure in `next.config.js`:**

```javascript
module.exports = {
  images: {
    domains: ['storage.googleapis.com'],  // Allow GCP images
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};
```

---

### 3. Lazy Load Maps

**Mapbox is heavy (500+ KB), load only when visible:**

```javascript
import { useEffect, useState, useRef } from 'react';

function DeliveryMap({ deliveries }) {
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef();

  useEffect(() => {
    // Intersection Observer to detect when map is visible
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !mapLoaded) {
          setMapLoaded(true);  // Load map
        }
      },
      { threshold: 0.1 }
    );

    if (mapRef.current) {
      observer.observe(mapRef.current);
    }

    return () => observer.disconnect();
  }, [mapLoaded]);

  return (
    <div ref={mapRef} style={{ height: '600px' }}>
      {mapLoaded ? (
        <MapboxMap deliveries={deliveries} />
      ) : (
        <div>Scroll down to load map...</div>
      )}
    </div>
  );
}
```

---

### 4. Debounce Search Inputs

**Avoid API calls on every keystroke:**

```javascript
import { useState, useEffect } from 'react';
import { debounce } from 'lodash';

function ProductSearch() {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);

  // Debounce API call (wait 300ms after user stops typing)
  const debouncedSearch = debounce(async (query) => {
    if (query) {
      const res = await fetch(`/api/products?search=${query}`);
      const data = await res.json();
      setResults(data.products);
    }
  }, 300);

  useEffect(() => {
    debouncedSearch(search);
  }, [search]);

  return (
    <input
      type="text"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Search products..."
    />
  );
}
```

**Impact:** Reduces API calls from 10+ to 1-2 per search

---

### 5. Memoize Expensive Calculations

**Use React.memo and useMemo:**

```javascript
import { useMemo } from 'react';

function OrdersList({ orders }) {
  // Expensive calculation (runs only when orders change)
  const totalRevenue = useMemo(() => {
    return orders.reduce((sum, order) => sum + order.total, 0);
  }, [orders]);

  return (
    <div>
      <h2>Total Revenue: KES {totalRevenue}</h2>
      {orders.map(order => <OrderCard key={order._id} order={order} />)}
    </div>
  );
}

// Prevent re-render if props unchanged
export default React.memo(OrdersList);
```

---

### 6. Optimize Bundle Size

**Analyze bundle:**

```bash
cd web
npm run build

# Analyze (if configured)
npm run analyze
```

**Remove unused dependencies:**

```bash
npm install -g depcheck
depcheck
```

**Use tree-shaking (automatic in Next.js):**

```javascript
// BAD: Imports entire library
import _ from 'lodash';

// GOOD: Import only what's needed
import debounce from 'lodash/debounce';
```

---

## Mobile App Optimizations

### 1. Optimize Images

**Use React Native Fast Image:**

```bash
cd apps/rider
npm install react-native-fast-image
```

```javascript
import FastImage from 'react-native-fast-image';

// Instead of <Image>
<FastImage
  source={{
    uri: 'https://storage.googleapis.com/bucket/product.jpg',
    priority: FastImage.priority.normal,
    cache: FastImage.cacheControl.immutable
  }}
  resizeMode={FastImage.resizeMode.contain}
  style={{ width: 200, height: 200 }}
/>
```

**Features:**
- Caching (disk and memory)
- Priority loading
- Preloading support

---

### 2. Reduce Re-Renders

**Use React.memo and useCallback:**

```javascript
import { memo, useCallback } from 'react';

const DeliveryCard = memo(({ delivery, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text>{delivery.shopName}</Text>
    </TouchableOpacity>
  );
});

function DeliveriesList({ deliveries }) {
  const handlePress = useCallback((delivery) => {
    navigation.navigate('DeliveryDetails', { id: delivery._id });
  }, [navigation]);

  return (
    <FlatList
      data={deliveries}
      renderItem={({ item }) => (
        <DeliveryCard delivery={item} onPress={() => handlePress(item)} />
      )}
      keyExtractor={(item) => item._id}
      removeClippedSubviews  // Optimize for large lists
      maxToRenderPerBatch={10}
      windowSize={5}
    />
  );
}
```

---

### 3. Optimize FlatList

**Use getItemLayout for fixed-height items:**

```javascript
<FlatList
  data={products}
  renderItem={renderProduct}
  keyExtractor={(item) => item._id}
  getItemLayout={(data, index) => ({
    length: 80,  // Height of each item
    offset: 80 * index,
    index
  })}
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  windowSize={5}
  removeClippedSubviews
/>
```

---

### 4. Reduce API Calls

**Cache data in AsyncStorage:**

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

async function getProducts() {
  try {
    // Check cache first
    const cached = await AsyncStorage.getItem('products');
    const cacheTime = await AsyncStorage.getItem('products_timestamp');

    if (cached && Date.now() - parseInt(cacheTime) < 600000) {
      // Cache valid for 10 minutes
      return JSON.parse(cached);
    }

    // Fetch from API
    const response = await fetch('https://api.kenixcommodities.com/api/products');
    const data = await response.json();

    // Update cache
    await AsyncStorage.setItem('products', JSON.stringify(data));
    await AsyncStorage.setItem('products_timestamp', Date.now().toString());

    return data;
  } catch (error) {
    console.error('Error fetching products:', error);
  }
}
```

---

### 5. Optimize GPS Tracking

**Throttle location updates:**

```javascript
const LOCATION_UPDATE_INTERVAL = 10000; // 10 seconds
let lastUpdate = 0;

const watchId = Geolocation.watchPosition(
  (position) => {
    const now = Date.now();
    if (now - lastUpdate >= LOCATION_UPDATE_INTERVAL) {
      // Send to server
      socket.emit('location:update', {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
      lastUpdate = now;
    }
  },
  (error) => console.error(error),
  {
    enableHighAccuracy: false,  // Use network location (faster, less battery)
    distanceFilter: 50,  // Only update if moved 50m
    interval: 10000,
    fastestInterval: 5000
  }
);
```

---

## Network & CDN Optimizations

### 1. Enable Cloudflare CDN

**Already done if using Cloudflare for DNS**

**Verify:**
- Go to Cloudflare dashboard
- Ensure orange cloud (proxy) enabled for:
  - `dashboard.kenixcommodities.com`

**Configure caching:**
- Page Rules → Create rule:
  - URL: `dashboard.kenixcommodities.com/_next/static/*`
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 month

**Result:** Static assets served from edge locations (faster, reduces server load)

---

### 2. Enable HTTP/2

**Nginx supports HTTP/2 automatically with SSL**

**Verify:**

```bash
curl -I --http2 https://api.kenixcommodities.com/health

# Should show:
# HTTP/2 200
```

**If not enabled:**

```nginx
# /etc/nginx/sites-available/kenix-api
server {
    listen 443 ssl http2;  # Add http2
    # ...
}
```

---

### 3. Use CDN for Images

**GCP Cloud Storage has built-in CDN**

**Enable:**

```bash
gsutil defstorageclass set STANDARD gs://kenix-products-production
```

**Or use Cloudflare Images (paid):**
- Automatic optimization
- Resizing
- WebP/AVIF conversion
- Global CDN

---

## Caching Strategies

### 1. Redis Caching (Recommended for Scale)

**Install Redis:**

```bash
sudo apt install redis-server
redis-cli ping  # Should return: PONG
```

**Install Node.js client:**

```bash
cd /var/www/kenix-commodities/server
npm install redis --save
```

**Configure Redis cache:**

```javascript
// server/config/redis.js
const redis = require('redis');

const client = redis.createClient({
  host: 'localhost',
  port: 6379,
  password: process.env.REDIS_PASSWORD || undefined
});

client.on('error', (err) => console.error('Redis error:', err));
client.on('connect', () => console.log('Redis connected'));

module.exports = client;
```

**Use in routes:**

```javascript
const redisClient = require('./config/redis');

app.get('/api/products', async (req, res) => {
  const cacheKey = 'products:all';

  // Check cache
  redisClient.get(cacheKey, async (err, cachedData) => {
    if (cachedData) {
      console.log('Cache HIT');
      return res.json(JSON.parse(cachedData));
    }

    console.log('Cache MISS');
    const products = await Product.find().lean();

    // Cache for 10 minutes
    redisClient.setex(cacheKey, 600, JSON.stringify(products));

    res.json(products);
  });
});

// Clear cache on updates
app.post('/api/products', async (req, res) => {
  const product = await Product.create(req.body);

  // Clear product cache
  redisClient.del('products:all');

  res.status(201).json(product);
});
```

**Impact:** 10-100x faster for frequently accessed data

---

### 2. Browser Caching

**Set cache headers in Nginx:**

```nginx
# /etc/nginx/sites-available/kenix-api
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location /api/ {
    # No caching for API responses
    add_header Cache-Control "no-cache, no-store, must-revalidate";
    proxy_pass http://localhost:3001/api/;
}
```

---

## Infrastructure Scaling

### Vertical Scaling (Increase Server Resources)

**Current:** t3.medium (2 vCPU, 4 GB RAM)

**When to upgrade:**
- CPU > 80% sustained
- Memory > 90% sustained
- Response time degrading

**Options:**
- t3.large (2 vCPU, 8 GB RAM) - $60/month
- t3.xlarge (4 vCPU, 16 GB RAM) - $120/month

**How to upgrade:**

```bash
# Via AWS Console
# EC2 → Instances → Select instance → Instance state → Stop
# Actions → Instance settings → Change instance type → t3.large
# Start instance
```

---

### Horizontal Scaling (Multiple Servers)

**For high traffic (>1000 concurrent users)**

**Setup:**

1. **Load Balancer**
   - AWS Application Load Balancer (ALB)
   - Distributes traffic across multiple servers

2. **Multiple API Servers**
   - Launch 2-3 identical EC2 instances
   - Deploy same application code
   - Point to same MongoDB Atlas cluster

3. **Sticky Sessions (for Socket.IO)**
   - Use Redis for session storage
   - Socket.IO adapter for multi-server

**Configure Socket.IO for multiple servers:**

```javascript
const io = require('socket.io')(server);
const redisAdapter = require('@socket.io/redis-adapter');
const { createClient } = require('redis');

const pubClient = createClient({ host: 'redis-host', port: 6379 });
const subClient = pubClient.duplicate();

io.adapter(redisAdapter(pubClient, subClient));
```

---

## Performance Testing

### Load Testing with Artillery

**Test current performance:**

```bash
npm install -g artillery

# Create test script
cat > loadtest.yml << EOF
config:
  target: 'https://api.kenixcommodities.com'
  phases:
    - duration: 60
      arrivalRate: 10
      name: Warm up
    - duration: 120
      arrivalRate: 50
      name: Sustained load

scenarios:
  - name: "Product browsing"
    flow:
      - get:
          url: "/api/products"
      - think: 2
      - get:
          url: "/api/categories"
EOF

# Run test
artillery run loadtest.yml
```

**Results:**

```
Summary report @ 14:30:00(+0000)
  Scenarios launched:  6000
  Scenarios completed: 6000
  Requests completed:  12000
  Mean response time: 145ms
  95th percentile:    320ms
  99th percentile:    850ms
  Errors:             0 (0%)
```

**Goals:**
- Mean < 200ms: PASS
- 95th percentile < 500ms: PASS
- 99th percentile < 2000ms: PASS
- Error rate < 1%: PASS

---

## Performance Checklist

**Complete before launch:**

### Backend
- [ ] Response compression enabled
- [ ] Caching middleware implemented
- [ ] Database connection pooling optimized
- [ ] All indexes created
- [ ] Lean queries used where appropriate
- [ ] Pagination implemented on all list endpoints
- [ ] Async operations parallelized (Promise.all)

### Database
- [ ] All collections indexed
- [ ] Slow query monitoring enabled
- [ ] Profiling reviewed (no queries > 100ms)
- [ ] Projection used to limit fields returned

### Frontend
- [ ] Code splitting configured
- [ ] Images optimized (Next.js Image)
- [ ] Bundle size < 500 KB
- [ ] Maps lazy loaded
- [ ] Search inputs debounced

### Mobile
- [ ] Images cached (react-native-fast-image)
- [ ] FlatList optimized
- [ ] API responses cached locally
- [ ] GPS updates throttled

### Infrastructure
- [ ] HTTP/2 enabled
- [ ] CDN configured (Cloudflare or GCP)
- [ ] Redis caching set up (optional, for scale)
- [ ] Load testing completed
- [ ] Monitoring in place (see MONITORING_GUIDE.md)

---

**Performance Optimized!**

**Next Steps:**
1. Run load tests to establish baseline
2. Monitor performance in production
3. Iterate and optimize based on real data

---

**Document Version:** 1.0.0
**Last Updated:** 2025-11-09
