# Kenix Sales Agent Mobile App

The Sales Agent mobile app for Kenix Commodities, built with React Native and Expo.

## Features

### 1. Authentication
- Secure login with email and password
- Role-based access control (sales_agent only)
- Token-based authentication with secure storage

### 2. Performance Dashboard
- **This Week Stats**: Shops registered, orders placed, order value, shops visited
- **This Month Stats**: Monthly performance metrics, commission earned
- **Target Progress**: Visual progress bar for weekly shop registration targets
- **Quick Actions**: Register shop, place order, view shops

### 3. Shop Registration (Multi-Step Wizard)
- **Step 1 - Basic Information**: Shop name, owner details, contact info
- **Step 2 - Location**: Interactive map with GPS location picker
- **Step 3 - Photo**: Camera integration for shop front photo
- **Step 4 - Operating Hours**: Days and hours of operation

### 4. My Shops Management
- **Tabbed Filters**: All, Pending, Approved, Rejected
- **List View**: Shop cards with status badges, contact info, quick actions
- **Map View**: Color-coded markers showing all shops on Google Maps
- **Shop Details**: Complete shop information with navigation support

### 5. Order Management
- **Create Orders**:
  - Select approved shop
  - Browse product catalog with search and category filters
  - Add products to cart with quantity controls
  - Review order summary with total
  - Add delivery notes
- **Order History**: View all orders with status tracking

## Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router (file-based routing)
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Maps**: react-native-maps with Google Maps
- **Camera**: expo-camera
- **Location**: expo-location
- **Secure Storage**: expo-secure-store

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm
- Expo CLI
- Android Studio (for Android) or Xcode (for iOS)

### Installation

1. Navigate to the sales-agent directory:
```bash
cd apps/sales-agent
```

2. Install dependencies:
```bash
npm install
```

3. Configure the backend API URL:
   - Open `services/api.ts`
   - Update `BASE_URL` with your backend server IP:
   ```typescript
   const BASE_URL = 'http://YOUR_IP:3001/api';
   ```

4. Configure Google Maps (for Android):
   - Get a Google Maps API key from Google Cloud Console
   - Open `app.json`
   - Replace `YOUR_GOOGLE_MAPS_API_KEY` with your actual API key

### Running the App

#### Development Mode
```bash
npm start
```

#### Android
```bash
npm run android
```

#### iOS
```bash
npm run ios
```

## Project Structure

```
apps/sales-agent/
├── app/
│   ├── _layout.tsx                 # Root layout with auth guard
│   ├── index.tsx                   # Entry point with redirect logic
│   ├── (auth)/
│   │   └── login.tsx               # Login screen
│   ├── (tabs)/
│   │   ├── _layout.tsx             # Bottom tabs layout
│   │   ├── dashboard.tsx           # Performance dashboard
│   │   ├── shops.tsx               # My shops list/map view
│   │   └── orders.tsx              # Order history and creation
│   └── shop/
│       ├── register.tsx            # Multi-step registration wizard
│       └── [id].tsx                # Shop details page
├── components/
│   ├── LocationPicker.tsx          # Map-based location selector
│   └── ShopPhotoCapture.tsx        # Camera photo capture
├── services/
│   └── api.ts                      # API client with auth interceptors
├── store/
│   ├── authStore.ts                # Authentication state
│   └── shopStore.ts                # Shop management state
└── app.json                        # Expo configuration
```

## API Endpoints Used

### Authentication
- `POST /api/user/login` - Sales agent login

### Shop Management
- `POST /api/user/register` - Register new shop
- `GET /api/user/fetch/all` - Get shops by criteria
- `GET /api/user/fetch/:id` - Get shop details

### Products
- `GET /api/products` - Get product catalog

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get orders by criteria
- `GET /api/orders/:id` - Get order details

### Reports (Optional)
- `GET /api/reports/sales-agents/:id/weekly` - Weekly performance
- `GET /api/reports/sales-agents/:id/monthly` - Monthly performance

## Key Features Implementation

### Location Tracking
- Uses `expo-location` for GPS coordinates
- Interactive map with draggable marker
- Real-time coordinate display
- Current location button

### Photo Capture
- Camera integration with `expo-camera`
- Gallery picker with `expo-image-picker`
- Photo preview and retake functionality
- Image quality optimization (0.7)

### Shop Registration Flow
1. Sales agent fills out 4-step wizard
2. Shop data submitted to backend
3. Shop status set to "pending"
4. Admin reviews and approves/rejects
5. Sales agent receives notification of approval status

### Order Placement Flow
1. Select approved shop from list
2. Browse product catalog
3. Add products to cart
4. Review order summary
5. Submit order (pending admin approval)
6. View order in history

## Permissions Required

### Android
- `ACCESS_FINE_LOCATION` - GPS location
- `ACCESS_COARSE_LOCATION` - Network location
- `CAMERA` - Photo capture
- `READ_EXTERNAL_STORAGE` - Gallery access
- `WRITE_EXTERNAL_STORAGE` - Save photos

### iOS
- Camera usage permission
- Location when in use permission
- Photo library permission

## Color Scheme

- Primary: `#22c55e` (Green - Growth, Sales)
- Secondary: `#3b82f6` (Blue)
- Warning: `#f59e0b` (Amber)
- Danger: `#ef4444` (Red)
- Success: `#22c55e` (Green)
- Gray Scale: Tailwind CSS grays

## Status Badges

- **Pending**: Yellow/Amber - Awaiting approval
- **Approved**: Green - Ready for orders
- **Rejected**: Red - Not approved
- **Processing**: Blue - Order being processed
- **Delivered**: Green - Order completed

## Testing Credentials

Use your backend sales agent credentials:
```
Email: agent@kenix.com
Password: [Your password]
```

## Troubleshooting

### Maps not showing
- Verify Google Maps API key is correct
- Enable Maps SDK for Android/iOS in Google Cloud Console
- Rebuild the app after adding API key

### Camera not working
- Check permissions in device settings
- Ensure app has camera access granted
- Restart the app

### Login failing
- Verify backend API URL is correct
- Check network connectivity
- Ensure backend server is running
- Verify credentials and role (must be sales_agent)

## Future Enhancements

1. **Visit Logging**: Track shop visits with GPS verification
2. **Offline Mode**: Queue registrations and orders when offline
3. **Push Notifications**: Order status updates
4. **Analytics**: Detailed performance charts
5. **Commission Tracking**: Real-time commission calculations
6. **Shop Photos Gallery**: Multiple photos per shop
7. **Voice Notes**: Record visit notes with audio

## Support

For issues or questions, contact the development team.

## License

Proprietary - Kenix Commodities Ltd.
