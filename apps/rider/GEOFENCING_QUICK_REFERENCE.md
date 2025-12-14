# Geofencing Quick Reference

## Quick Start

### Import Services
```typescript
import { canMarkArrival, getDeviationStatus } from './services/deviation';
import { getCurrentLocation, startBackgroundTracking } from './services/location';
import { useRouteStore } from './store/routeStore';
```

### Start Monitoring
```typescript
const { startDeviationMonitoring } = useRouteStore();

useEffect(() => {
  if (activeRoute && user) {
    startBackgroundTracking();
    startDeviationMonitoring(user._id, user.name);
  }

  return () => {
    stopBackgroundTracking();
    stopDeviationMonitoring();
  };
}, [activeRoute]);
```

### Check Geofence
```typescript
const currentLocation = await getCurrentLocation();
const arrivalCheck = canMarkArrival(currentLocation, shop.location);

if (arrivalCheck.allowed) {
  // Proceed with arrival
} else {
  Alert.alert('Too Far', arrivalCheck.message);
}
```

## Constants

```typescript
GEOFENCE_ARRIVAL_RADIUS = 0.1 km     // 100 meters
ROUTE_CORRIDOR_WIDTH = 0.5 km        // 500 meters
CRITICAL_DEVIATION_DISTANCE = 1.0 km // 1 kilometer
DEVIATION_CHECK_INTERVAL = 10000 ms  // 10 seconds
```

## Severity Levels

| Level    | Distance | Color   | Admin Alert |
|----------|----------|---------|-------------|
| none     | < 250m   | #4CAF50 | No          |
| minor    | < 500m   | #FFC107 | No          |
| warning  | < 1km    | #FF9800 | Yes         |
| critical | > 1km    | #F44336 | Yes         |

## Key Functions

### `calculateDistance(lat1, lng1, lat2, lng2)`
Returns distance in kilometers using Haversine formula.

### `canMarkArrival(currentLocation, shopLocation)`
Returns:
```typescript
{
  allowed: boolean,
  distance: number,
  message: string
}
```

### `getDeviationStatus(distanceFromRoute)`
Returns:
```typescript
{
  severity: 'none' | 'minor' | 'warning' | 'critical',
  distanceFromRoute: number,
  message: string,
  color: string,
  shouldAlert: boolean
}
```

### `buildRoutePolyline(currentLocation, remainingShops)`
Returns array of RoutePoint objects representing expected path.

## API Endpoints

```
POST   /api/rider/log-deviation       - Log deviation
GET    /api/rider/deviations          - Get history
GET    /api/rider/deviation-stats     - Get statistics
POST   /api/rider/request-unlock      - Request shop unlock
```

## WebSocket Events

### Emit from Rider App
```typescript
websocketService.emitRouteDeviation({
  routeId: "...",
  currentLocation: { lat, lng },
  expectedRoute: [...],
  deviationDistance: 0.75,
  severity: "warning"
});
```

### Listen in Admin Dashboard
```javascript
socket.on('rider:route-deviation-alert', (data) => {
  // Handle alert
});
```

## Map Components

### RouteMap Props
```typescript
<RouteMap
  shop={currentShop}
  deviationStatus={deviationStatus}     // Optional
  showCorridor={true}                   // Optional
  remainingShops={[...]}                // Optional
/>
```

## State Management

```typescript
const {
  deviationStatus,              // Current deviation status
  isDeviationMonitoring,        // Is monitoring active
  startDeviationMonitoring,     // Start function
  stopDeviationMonitoring,      // Stop function
  updateDeviationStatus,        // Update status
} = useRouteStore();
```

## Permissions

### Android
```json
{
  "permissions": [
    "ACCESS_FINE_LOCATION",
    "ACCESS_COARSE_LOCATION",
    "ACCESS_BACKGROUND_LOCATION",
    "FOREGROUND_SERVICE"
  ]
}
```

### iOS
```json
{
  "infoPlist": {
    "NSLocationWhenInUseUsageDescription": "...",
    "NSLocationAlwaysUsageDescription": "...",
    "UIBackgroundModes": ["location"]
  }
}
```

## Troubleshooting

### Location not updating
1. Check permissions granted (Always)
2. Verify GPS enabled
3. Check console for errors

### Button not enabling at shop
1. Verify distance < 100m
2. Check currentLocation is not null
3. Ensure delivery status is not 'arrived' or 'completed'

### Admin not receiving alerts
1. Check WebSocket connected
2. Verify severity is 'warning' or 'critical'
3. Ensure cooldown period passed (1 min)

### Deviation not detected
1. Check activeRouteInfo is set
2. Verify monitoring interval running
3. Check route polyline built correctly

## Common Code Patterns

### Geofence Check with UI Update
```typescript
const [canArrive, setCanArrive] = useState(false);

useEffect(() => {
  const interval = setInterval(async () => {
    const location = await getCurrentLocation();
    const check = canMarkArrival(location, shop.location);
    setCanArrive(check.allowed);
  }, 5000);

  return () => clearInterval(interval);
}, [shop]);
```

### Manual Deviation Check
```typescript
const checkDeviation = async () => {
  const status = await checkDeviationStatus();
  if (status?.severity === 'critical') {
    Alert.alert('Warning', 'You are significantly off route');
  }
};
```

### Listen to Deviation Changes
```typescript
const { deviationStatus } = useRouteStore();

useEffect(() => {
  if (deviationStatus?.severity === 'critical') {
    // Show warning to rider
  }
}, [deviationStatus]);
```

## Testing Snippets

### Mock GPS Location (Development)
```typescript
const mockLocation = { lat: -1.286389, lng: 36.817223 };
```

### Simulate Deviation
```typescript
// In RouteMap, temporarily offset current location
const offsetLocation = {
  lat: currentLocation.lat + 0.01,  // ~1km north
  lng: currentLocation.lng
};
```

### Test Geofence Boundary
```typescript
const testDistances = [50, 90, 100, 110, 150]; // meters

testDistances.forEach(distance => {
  const offsetLat = shop.lat + (distance / 111000); // rough conversion
  const check = canMarkArrival(
    { lat: offsetLat, lng: shop.lng },
    shop.location
  );
  console.log(`${distance}m: ${check.allowed}`);
});
```

## Performance Tips

1. **Reduce Update Frequency**: Change `timeInterval` to 15000ms (15s)
2. **Use Distance Interval**: Rely more on `distanceInterval` (50m)
3. **Clean Old Logs**: Delete deviation logs > 90 days
4. **Debounce UI Updates**: Don't update map on every location change
5. **Lazy Load Map**: Only render map when section is visible

## Links

- Full Documentation: `GEOFENCING_IMPLEMENTATION.md`
- Summary: `GEOFENCING_SUMMARY.md`
- Deviation Service: `apps/rider/services/deviation.ts`
- Location Service: `apps/rider/services/location.ts`
- Database Model: `server/models/routeDeviations.js`
