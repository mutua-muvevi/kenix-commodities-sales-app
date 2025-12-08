# Kenix Rider App - Quick Start Guide

## Get Running in 5 Minutes

### Step 1: Install Dependencies (1 minute)

```bash
cd G:\Waks\Kenix\commodies\apps\rider
npm install
```

### Step 2: Configure Environment (2 minutes)

Create `.env` file:

```bash
# Windows
copy .env.example .env

# Then edit .env
```

**Find your local IP**:
- Windows: Open CMD → `ipconfig` → Look for "IPv4 Address"
- Mac: Open Terminal → `ifconfig` → Look for "inet"

**Update .env**:
```env
EXPO_PUBLIC_API_URL=http://YOUR_IP_HERE:3001/api
EXPO_PUBLIC_WS_URL=http://YOUR_IP_HERE:3001

# Example:
# EXPO_PUBLIC_API_URL=http://192.168.1.100:3001/api
# EXPO_PUBLIC_WS_URL=http://192.168.1.100:3001
```

**Get Google Maps API Key** (optional for testing):
1. Go to https://console.cloud.google.com/
2. Create new project
3. Enable "Maps SDK for Android" and "Maps SDK for iOS"
4. Create API key
5. Add to `.env`: `GOOGLE_MAPS_API_KEY=your_key_here`

### Step 3: Start Backend Server (30 seconds)

Ensure the Kenix backend is running:

```bash
# In a separate terminal
cd G:\Waks\Kenix\commodies\apps\backend
npm run dev

# Should see: "Server running on port 3001"
```

### Step 4: Run the App (1 minute)

```bash
cd G:\Waks\Kenix\commodies\apps\rider
npm start
```

**Scan QR Code**:
- Android: Open Expo Go app → Scan QR
- iOS: Open Camera → Scan QR → Opens in Expo Go

### Step 5: Login (30 seconds)

```
Email: rider@kenix.com
Password: rider123
```

## Testing Checklist

Once logged in, test these flows:

### 1. View Active Route (1 minute)
- [ ] See current shop card
- [ ] See map with your location
- [ ] See "Navigate to Shop" button
- [ ] See "I've Arrived" button (disabled if >100m from shop)

### 2. Test Delivery Flow (5 minutes)

**Note**: For testing, you may need to mock your location to be near a shop.

#### A. Mark Arrival
- [ ] Get within 100m of shop (or mock location)
- [ ] Click "I've Arrived"
- [ ] See payment screen

#### B. Collect Payment
- [ ] Select payment method (M-Pesa, Cash, or Airtel)
- [ ] Enter amount (or use pre-filled)
- [ ] For M-Pesa: Wait for confirmation
- [ ] For Cash/Airtel: Immediately proceed
- [ ] See completion screen

#### C. Complete Delivery
- [ ] Draw signature on canvas
- [ ] Take photo with camera
- [ ] Add notes (optional)
- [ ] Click "Complete Delivery"
- [ ] See success message
- [ ] Next shop loads automatically

### 3. Check Wallet (30 seconds)
- [ ] See current balance
- [ ] See today's deliveries count
- [ ] See amount collected
- [ ] See transaction history

### 4. Check Profile (30 seconds)
- [ ] See rider info
- [ ] See today's stats
- [ ] Toggle GPS tracking
- [ ] Logout

## Common Issues & Quick Fixes

### Issue: "Network request failed"
**Fix**: Check that:
1. Backend server is running
2. Your phone and computer are on the same WiFi
3. `.env` has correct IP address
4. Firewall isn't blocking port 3001

**Quick test**:
```bash
# On your phone's browser, visit:
http://YOUR_IP:3001/health

# Should see: {"status": "ok"}
```

### Issue: Map not showing
**Fix**:
1. Get Google Maps API key (see Step 2)
2. Add to `.env` and restart app
3. For testing without API key, map will be blank but app still works

### Issue: "I've Arrived" always disabled
**Fix**: You're too far from the shop location
1. Check shop coordinates in backend
2. Mock your location using Expo Dev Menu:
   - Shake phone → Dev Menu → Debug Remote JS
   - Use location mocking tools
3. Or test with geofence disabled (for development only)

### Issue: M-Pesa payment not confirming
**Fix**:
1. Check WebSocket connection in backend logs
2. Verify backend emits `payment:confirmed` event
3. For testing, use Cash payment instead

### Issue: Camera not working
**Fix**:
1. Grant camera permissions when prompted
2. For Android: Settings → Apps → Expo Go → Permissions → Camera
3. For iOS: Settings → Expo Go → Camera

## Development Tips

### Hot Reload
- Press `r` in terminal to reload app
- Shake phone → Reload
- Changes auto-reload on file save

### Clear Cache
```bash
npx expo start -c
```

### View Logs
- Logs appear in terminal
- Or shake phone → Debug Remote JS → Open Chrome DevTools

### Test Different Scenarios

**No Active Route**:
```bash
# In backend, ensure rider has no assigned route
# Should see empty state message
```

**Multiple Deliveries**:
```bash
# In backend, create route with 5+ deliveries
# Should see "Stop 1 of 5"
```

**Completed Route**:
```bash
# Complete all deliveries
# Should see "All Deliveries Complete!"
```

## File Locations Reference

```
G:\Waks\Kenix\commodies\apps\rider\

Key files:
├── app/(tabs)/index.tsx          # Main screen (active route)
├── components/DeliveryFlowModal.tsx  # Delivery flow
├── services/api.ts               # API endpoints
├── services/websocket.ts         # WebSocket
├── services/location.ts          # GPS tracking
├── store/authStore.ts            # Login state
├── store/routeStore.ts           # Route state
└── .env                          # Your configuration

Documentation:
├── README.md                     # Full documentation
├── DEPLOYMENT.md                 # Testing guide
├── API_INTEGRATION.md            # API details
├── BUILD_SUMMARY.md              # What we built
└── QUICKSTART.md                 # This file
```

## Next Steps

1. **Read Full Documentation**: `README.md`
2. **Test All Features**: Follow `DEPLOYMENT.md` checklist
3. **Understand API**: Read `API_INTEGRATION.md`
4. **Production Build**: Follow `DEPLOYMENT.md` production section

## Need Help?

1. **Check logs**: Terminal shows detailed error messages
2. **Backend logs**: Check backend terminal for API errors
3. **Documentation**: See README.md, DEPLOYMENT.md, API_INTEGRATION.md
4. **Code location**: All code is in `G:\Waks\Kenix\commodies\apps\rider\`

---

**You're all set! Happy testing!**

Login → View Route → Navigate → Arrive → Pay → Complete → Next Shop
