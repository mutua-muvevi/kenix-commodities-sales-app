# Quick Start Guide - Kenix Sales Agent App

## Get Started in 5 Minutes

### Step 1: Configure Backend URL

Open `services/api.ts` and update the BASE_URL:

```typescript
const BASE_URL = 'http://192.168.100.6:3001/api';  // Replace with your IP
```

**Find your IP:**
- Windows: `ipconfig` (look for IPv4)
- Mac/Linux: `ifconfig` or `ip addr`

### Step 2: Start the App

```bash
cd apps/sales-agent
npm start
```

### Step 3: Run on Device

Choose your platform:

**Android:**
- Press `a` in the terminal
- Or scan QR code with Expo Go app

**iOS:**
- Press `i` in the terminal
- Or scan QR code with Camera app

### Step 4: Login

```
Email: agent@kenix.com
Password: [Your sales agent password]
```

## Main Features

### 📊 Dashboard
- View weekly and monthly performance
- Track targets and commissions
- Quick actions for common tasks

### 🏪 Register Shop (4 Steps)
1. **Basic Info**: Name, owner, contact
2. **Location**: Pin on map with GPS
3. **Photo**: Take shop front photo
4. **Hours**: Operating days and times

### 📋 My Shops
- **List View**: See all registered shops
- **Map View**: Visualize shop locations
- **Filters**: All | Pending | Approved | Rejected

### 🛒 Orders
- **Create**: Select shop → Add products → Submit
- **History**: View all past orders

## Common Tasks

### Register a New Shop
1. Tap "Dashboard" → "Register Shop"
2. Fill in shop details
3. Pin location on map
4. Take shop photo
5. Set operating hours
6. Submit for approval

### Place an Order
1. Go to "Orders" tab
2. Tap "Create Order"
3. Select shop from approved list
4. Search and add products
5. Review cart total
6. Submit order

### View Shop Details
1. Go to "My Shops" tab
2. Tap any shop card
3. View complete information
4. Call owner or navigate to location

## Tips

✅ **Enable Location Services**: Required for accurate shop locations
✅ **Allow Camera Access**: Needed for shop photos
✅ **Stay Connected**: Internet required for all operations
✅ **Check Status**: Shops must be approved before placing orders

## Troubleshooting

**Can't login?**
- Verify you're using a sales_agent account
- Check backend URL is correct
- Ensure backend server is running

**Maps not showing?**
- Add Google Maps API key in `app.json`
- Rebuild the app

**Camera not working?**
- Grant camera permission in device settings
- Restart the app

## Need Help?

Check the full README.md for detailed documentation.

---

**Happy Selling! 🚀**
