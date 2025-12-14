# Geofencing & Route Deviation Detection Implementation

## Overview

This document describes the comprehensive geofencing and route deviation detection system implemented to prevent rider theft and ensure delivery integrity in the Kenix Rider App.

## Features Implemented

### 1. Arrival Geofencing
- **Radius**: 100 meters from shop location
- **Enforcement**: Riders can only mark "Arrived" when within the geofence
- **Real-time Validation**: Continuous GPS monitoring with 5-second interval checks
- **Visual Feedback**:
  - Green circle on map showing arrival zone
  - Distance indicator showing proximity to shop
  - Button enabled/disabled based on geofence status

### 2. Route Deviation Detection
- **Route Corridor**: 500-meter acceptable deviation from expected route
- **Critical Threshold**: 1km deviation triggers critical alert
- **Severity Levels**:
  - **None** (< 250m): Green - On route
  - **Minor** (250m - 500m): Yellow - Slightly off route
  - **Warning** (500m - 1km): Orange - Off route
  - **Critical** (> 1km): Red - Major deviation
- **Background Monitoring**: Continuous checking every 10 seconds
- **Route Polyline Calculation**: Builds expected path through all remaining shops

### 3. Admin Real-time Alerts
- **WebSocket Events**: Instant notifications to admin dashboard
- **Alert Data Includes**:
  - Rider name and ID
  - Current location (lat/lng)
  - Expected route polyline
  - Deviation distance
  - Severity level
  - Timestamp
- **Event Name**: `rider:route-deviation-alert`
- **Trigger Conditions**: Warning or Critical severity levels

### 4. Deviation Logging
- **MongoDB Collection**: `routeDeviations`
- **Logged Information**:
  - Rider and route identifiers
  - Actual vs expected location
  - Deviation distance and severity
  - Timestamp
  - Admin response status (pending/reviewed/flagged)
- **API Endpoints**:
  - `POST /api/rider/log-deviation` - Log deviation
  - `GET /api/rider/deviations` - Get deviation history
  - `GET /api/rider/deviation-stats` - Get statistics

### 5. UI Indicators
- **Map Overlay**: Real-time deviation status banner
- **Color-coded Route Line**: Changes color based on deviation
- **Route Corridor Visualization**: Semi-transparent polygon showing acceptable zone
- **Legend**: Clear explanation of map elements
- **Status Messages**:
  - "On route" (green)
  - "Slightly off route" (yellow)
  - "Off route - returning to route" (orange)
  - "Major deviation detected" (red)

### 6. Background Monitoring
- **Expo Location Background Task**: Continues when app is backgrounded
- **Android Foreground Service**: Persistent notification during active deliveries
- **iOS Background Indicator**: Shows blue status bar during tracking
- **Permission Requirements**:
  - Foreground location (ALWAYS)
  - Background location (ALWAYS)
- **Update Frequency**:
  - Time interval: 10 seconds
  - Distance interval: 50 meters

## File Structure

### Rider App Files

```
apps/rider/
├── services/
│   ├── deviation.ts           # Core deviation detection logic
│   ├── location.ts            # Location tracking with deviation monitoring
│   └── websocket.ts           # WebSocket service with deviation events
├── store/
│   └── routeStore.ts          # State management with deviation status
├── components/
│   └── RouteMap.tsx           # Map with corridor and deviation indicators
├── app/(tabs)/
│   └── index.tsx              # Home screen with geofence validation
└── types/
    └── index.ts               # TypeScript interfaces
```

### Server Files

```
server/
├── models/
│   └── routeDeviations.js     # MongoDB model for deviation logs
├── routes/
│   └── rider.js               # Rider-specific API endpoints
└── websocket/
    └── index.js               # WebSocket server with deviation events
```

## Key Functions & Algorithms

### Distance Calculations

**Haversine Formula** (Point-to-Point Distance):
```typescript
calculateDistance(lat1, lng1, lat2, lng2) → kilometers
```

**Point-to-Line Distance** (Deviation Detection):
```typescript
pointToLineDistance(point, lineStart, lineEnd) → kilometers
```

**Route Corridor Distance**:
```typescript
distanceToRoute(currentLocation, routePolyline) → kilometers
```

### Geofence Validation

```typescript
canMarkArrival(currentLocation, shopLocation) → {
  allowed: boolean,
  distance: number,
  message: string
}
```

**Logic**:
- Calculate distance from current location to shop
- If distance ≤ 100m → allowed = true
- Else → allowed = false with distance message

### Deviation Severity Determination

```typescript
getDeviationStatus(distanceFromRoute) → DeviationStatus
```

**Algorithm**:
```
if distance ≤ 250m     → severity: "none", color: green
else if distance ≤ 500m → severity: "minor", color: yellow
else if distance ≤ 1km  → severity: "warning", color: orange, alert: true
else                    → severity: "critical", color: red, alert: true
```

## Usage Example

### Starting Deviation Monitoring

```typescript
import { useRouteStore } from './store/routeStore';

const { startDeviationMonitoring } = useRouteStore();

// When route is assigned
useEffect(() => {
  if (activeRoute && user) {
    startDeviationMonitoring(user._id, user.name);
  }
}, [activeRoute]);
```

### Checking Geofence Before Arrival

```typescript
import { canMarkArrival } from './services/deviation';

const handleArrived = () => {
  const arrivalCheck = canMarkArrival(
    currentLocation,
    shop.location
  );

  if (!arrivalCheck.allowed) {
    Alert.alert('Too Far', arrivalCheck.message);
    return;
  }

  // Proceed with delivery flow
  openDeliveryModal();
};
```

### Admin Listening to Deviation Alerts

```javascript
// Admin Dashboard
websocket.on('rider:route-deviation-alert', (data) => {
  const {
    riderId,
    riderName,
    deviationDistance,
    severity,
    currentLocation
  } = data;

  if (severity === 'critical') {
    showCriticalAlert(
      `${riderName} is ${deviationDistance.toFixed(1)}km off route!`,
      currentLocation
    );
  }
});
```

## Configuration

### Thresholds (Configurable in `deviation.ts`)

```typescript
export const GEOFENCE_ARRIVAL_RADIUS = 0.1;      // 100 meters
export const ROUTE_CORRIDOR_WIDTH = 0.5;         // 500 meters
export const CRITICAL_DEVIATION_DISTANCE = 1.0;  // 1 kilometer
export const DEVIATION_CHECK_INTERVAL = 10000;   // 10 seconds
```

### Background Tracking Settings

```typescript
// apps/rider/services/location.ts
await Location.startLocationUpdatesAsync(TASK_NAME, {
  accuracy: Location.Accuracy.High,
  timeInterval: 10000,        // 10 seconds
  distanceInterval: 50,       // 50 meters
  foregroundService: {
    notificationTitle: 'Kenix Delivery Active',
    notificationBody: 'Tracking your location for active deliveries',
  },
});
```

## Permissions Required

### Android (app.json)

```json
{
  "android": {
    "permissions": [
      "ACCESS_FINE_LOCATION",
      "ACCESS_COARSE_LOCATION",
      "ACCESS_BACKGROUND_LOCATION",
      "FOREGROUND_SERVICE"
    ]
  }
}
```

### iOS (app.json)

```json
{
  "ios": {
    "infoPlist": {
      "NSLocationWhenInUseUsageDescription": "We need your location to navigate to delivery shops",
      "NSLocationAlwaysUsageDescription": "We track your route in the background to ensure safe delivery",
      "UIBackgroundModes": ["location"]
    }
  }
}
```

## Database Schema

### RouteDeviation Model

```javascript
{
  riderId: ObjectId,
  riderName: String,
  routeId: ObjectId,
  currentDeliveryId: ObjectId,
  actualLocation: {
    type: "Point",
    coordinates: [longitude, latitude]
  },
  expectedLocation: {
    type: "Point",
    coordinates: [longitude, latitude]
  },
  deviationDistance: Number,      // in kilometers
  severity: "none" | "minor" | "warning" | "critical",
  adminNotified: Boolean,
  adminResponse: "pending" | "reviewed" | "justified" | "flagged",
  adminNotes: String,
  timestamp: Date
}
```

### Indexes

- `{ riderId: 1, timestamp: -1 }` - Rider deviation history
- `{ routeId: 1, timestamp: -1 }` - Route deviation logs
- `{ severity: 1, adminResponse: 1 }` - Pending reviews
- `{ actualLocation: "2dsphere" }` - Geospatial queries

## API Endpoints

### POST /api/rider/log-deviation
Log route deviation incident

**Request Body**:
```json
{
  "routeId": "route_id",
  "location": { "lat": -1.286389, "lng": 36.817223 },
  "deviationDistance": 0.75,
  "severity": "warning",
  "currentDeliveryId": "delivery_id",
  "expectedLocation": { "lat": -1.290000, "lng": 36.820000 }
}
```

**Response**:
```json
{
  "success": true,
  "message": "Deviation logged successfully",
  "data": { /* deviation object */ }
}
```

### GET /api/rider/deviations
Get rider's deviation history

**Query Params**:
- `startDate` (optional)
- `endDate` (optional)
- `severity` (optional)
- `limit` (default: 50)
- `skip` (default: 0)

### GET /api/rider/deviation-stats
Get deviation statistics for rider

**Response**:
```json
{
  "success": true,
  "data": {
    "total": 15,
    "byType": {
      "minor": { "count": 8, "avgDistance": 0.35, "maxDistance": 0.48 },
      "warning": { "count": 5, "avgDistance": 0.72, "maxDistance": 0.95 },
      "critical": { "count": 2, "avgDistance": 1.3, "maxDistance": 1.8 }
    }
  }
}
```

## WebSocket Events

### Client → Server

**`rider:route-deviation`**
```javascript
{
  routeId: "route_id",
  currentLocation: { lat: -1.286389, lng: 36.817223 },
  expectedRoute: [{ lat, lng }, ...],
  deviationDistance: 0.75,
  severity: "warning",
  currentDeliveryId: "delivery_id"
}
```

### Server → Admin

**`rider:route-deviation-alert`**
```javascript
{
  deviationId: "deviation_id",
  riderId: "rider_id",
  riderName: "John Doe",
  routeId: "route_id",
  currentLocation: { lat: -1.286389, lng: 36.817223 },
  deviationDistance: 0.75,
  severity: "warning",
  timestamp: "2025-12-11T18:30:00.000Z",
  message: "Warning: Rider John is deviating from route"
}
```

## Testing

### Manual Testing Checklist

1. **Geofence Arrival**:
   - [ ] Button disabled when > 100m from shop
   - [ ] Button enabled when ≤ 100m from shop
   - [ ] Distance updates in real-time
   - [ ] Alert shown if trying to arrive too far away

2. **Route Deviation**:
   - [ ] Green indicator when on route
   - [ ] Yellow indicator when slightly off route
   - [ ] Orange indicator when deviating
   - [ ] Red indicator for critical deviation
   - [ ] Admin receives alerts for warning/critical

3. **Background Tracking**:
   - [ ] Location updates when app backgrounded (Android)
   - [ ] Foreground service notification shows (Android)
   - [ ] Background indicator shows (iOS)
   - [ ] Deviation monitoring continues in background

4. **Offline Handling**:
   - [ ] Deviations queued when offline
   - [ ] Synced when connection restored
   - [ ] No crashes with poor connectivity

## Performance Considerations

- **Battery Usage**: Moderate - High accuracy GPS with 10s intervals
- **Data Usage**: Minimal - Small JSON payloads every 10s
- **Memory**: Lightweight - No large data structures cached
- **Optimization Tips**:
  - Use `distanceInterval` to reduce unnecessary updates
  - Implement adaptive polling (faster when on route, slower when stationary)
  - Clean up deviation logs older than 90 days

## Security

- **Authentication**: JWT required for all API calls and WebSocket connections
- **Authorization**: Riders can only log deviations for their own routes
- **Data Validation**: All coordinates validated for reasonable ranges
- **Admin Alerts**: Only sent to users with `admin` role
- **No Location Spoofing**: Consider implementing additional GPS integrity checks

## Future Enhancements

1. **Machine Learning**: Detect patterns of suspicious behavior
2. **Adaptive Corridors**: Wider corridors in rural areas, tighter in urban
3. **Traffic Awareness**: Adjust thresholds based on traffic conditions
4. **Route Optimization Suggestions**: Suggest better routes based on deviation data
5. **Rider Scoring**: Performance score based on route adherence
6. **Photo Evidence**: Require photo when marking arrival to prevent spoofing

## Troubleshooting

### Location Not Updating
- Check location permissions granted (Always)
- Verify GPS is enabled on device
- Ensure app has background location permission

### Deviation Not Detected
- Check `activeRouteInfo` is set in location service
- Verify WebSocket connection established
- Check console logs for errors

### Admin Not Receiving Alerts
- Verify admin is connected to WebSocket
- Check severity is "warning" or "critical"
- Ensure alert cooldown period (1 min) has passed

## Contact & Support

For issues or questions about the geofencing system:
- Technical Lead: [Your Name]
- Email: [Your Email]
- Slack: #kenix-rider-dev
