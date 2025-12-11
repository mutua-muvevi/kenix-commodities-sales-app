# Background Geolocation Tracking - Sales Agent App

## Overview

This document outlines the comprehensive background geolocation tracking system implemented for the Sales Agent app. The system tracks agent locations in real-time for route optimization, visit verification, and performance analytics.

## Features

### Core Capabilities
- **Foreground Tracking**: High-accuracy location updates every 30 seconds when app is active
- **Background Tracking**: Battery-optimized location updates every 60 seconds when app is in background
- **Auto-Start/Stop**: Automatically starts tracking on login and stops on logout
- **Permission Management**: Comprehensive permission request flow with user-friendly prompts
- **Offline Support**: Queues location updates when offline, syncs when connection restored
- **WebSocket Integration**: Real-time location streaming to backend via WebSocket
- **API Fallback**: Falls back to REST API when WebSocket unavailable
- **Battery Optimization**: Reduces update frequency in background, monitors battery level
- **Location History**: Maintains last 10 location points locally

## Architecture

### Files Structure

```
apps/sales-agent/
├── services/
│   ├── location.ts                    # Location tracking service
│   ├── api.ts                         # Updated with location endpoints
│   └── websocket.ts                   # Updated with location events
├── store/
│   ├── slices/
│   │   └── location/
│   │       └── location-store.ts      # Location state management
│   ├── hooks/
│   │   └── use-location.ts           # Location custom hook
│   └── authStore.ts                   # Updated with location integration
├── app/
│   └── (tabs)/
│       └── profile.tsx                # Profile screen with GPS toggle
└── app.json                           # Updated with location permissions
```

## Implementation Details

### 1. Location Service (`services/location.ts`)

**Key Features:**
- Singleton pattern for consistent tracking across app
- Separate foreground and background tracking modes
- TaskManager integration for background updates
- Battery level monitoring via expo-battery
- Throttling to prevent excessive API calls (minimum 10s between updates)

**Main Methods:**
```typescript
// Initialize with user ID
locationService.initialize(userId: string)

// Permission handling
locationService.requestPermissions(): Promise<{ foreground: boolean, background: boolean }>
locationService.checkPermissions(): Promise<{ foreground: boolean, background: boolean }>

// Location retrieval
locationService.getCurrentLocation(): Promise<LocationData | null>

// Tracking control
locationService.startForegroundTracking(): Promise<boolean>
locationService.stopForegroundTracking(): Promise<void>
locationService.startBackgroundTracking(): Promise<boolean>
locationService.stopBackgroundTracking(): Promise<void>
locationService.startTracking(): Promise<{ foreground: boolean, background: boolean }>
locationService.stopTracking(): Promise<void>

// Status
locationService.isTracking(): { foreground: boolean, background: boolean }
locationService.getTrackingStatus(): Promise<TrackingStatus>
```

### 2. Location Store (`store/slices/location/location-store.ts`)

**State:**
```typescript
{
  currentLocation: LocationData | null;
  isTrackingEnabled: boolean;
  isForegroundTracking: boolean;
  isBackgroundTracking: boolean;
  permissions: { foreground: boolean; background: boolean };
  lastUpdateTimestamp: number | null;
  locationHistory: LocationHistoryItem[];
  isLoading: boolean;
  error: string | null;
}
```

**Actions:**
- `requestPermissions()`: Request location permissions
- `checkPermissions()`: Check current permission status
- `getCurrentLocation()`: Get current location once
- `startTracking()`: Start location tracking
- `stopTracking()`: Stop location tracking
- `setTrackingEnabled(enabled)`: Toggle tracking with persistence
- `updateCurrentLocation(location)`: Update current location
- `getTrackingStatus()`: Get full tracking status

**Persistence:**
Persists tracking enabled state and location history using Zustand persist middleware with secure storage.

### 3. API Integration (`services/api.ts`)

**New Endpoints:**
```typescript
// Send location update
POST /api/user/location
Body: {
  userId: string;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  altitude: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: number;
  batteryLevel: number;
  isCharging: boolean;
}

// Get location history
GET /api/user/location/:userId?limit=100
```

### 4. WebSocket Integration (`services/websocket.ts`)

**New Events:**

**Emitted (Client → Server):**
```typescript
// Location update
socket.emit('agent:location-update', {
  userId: string;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  altitude: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: number;
  batteryLevel: number;
  isCharging: boolean;
});
```

**Received (Server → Client):**
```typescript
// Location update acknowledgment
socket.on('location:updated', (data) => {
  // data: { success: boolean, timestamp: number }
});

// Location error
socket.on('location:error', (data) => {
  // data: { error: string, code: number }
});
```

### 5. Auth Flow Integration (`store/authStore.ts`)

**Login Flow:**
1. User logs in successfully
2. Location service initialized with user ID
3. Check if tracking was previously enabled (from SecureStore)
4. If enabled and permissions granted, auto-start tracking
5. Connect WebSocket for real-time updates

**Logout Flow:**
1. Stop all location tracking (foreground + background)
2. Disconnect WebSocket
3. Clear user session

**App Launch Flow:**
1. Load stored auth credentials
2. If authenticated, initialize location service
3. Auto-start tracking if previously enabled
4. Connect WebSocket

### 6. Profile Screen UI (`app/(tabs)/profile.tsx`)

**GPS Tracking Section Features:**
- Toggle switch to enable/disable tracking
- Real-time tracking status (foreground/background)
- Last update timestamp with human-readable format
- Current GPS coordinates display
- Permission status indicators (foreground/background)
- Permission request flow with explanatory alerts

**UI Components:**
- Tracking header with icon and switch
- Expandable tracking details (shown when enabled)
- Status indicators for foreground/background tracking
- Last update time formatter
- Current position display
- Permission status with checkmarks/crosses

## Permissions

### iOS (app.json)
```json
{
  "NSLocationWhenInUseUsageDescription": "We need your location to mark shop locations and optimize your routes during work hours.",
  "NSLocationAlwaysAndWhenInUseUsageDescription": "We track your location in the background to optimize route planning and provide accurate shop visit tracking throughout your work day.",
  "NSLocationAlwaysUsageDescription": "We track your location in the background to optimize route planning and provide accurate shop visit tracking throughout your work day.",
  "UIBackgroundModes": ["location", "fetch"]
}
```

### Android (app.json)
```json
{
  "permissions": [
    "ACCESS_FINE_LOCATION",
    "ACCESS_COARSE_LOCATION",
    "ACCESS_BACKGROUND_LOCATION",
    "FOREGROUND_SERVICE",
    "FOREGROUND_SERVICE_LOCATION"
  ]
}
```

### expo-location Plugin
```json
{
  "locationAlwaysAndWhenInUsePermission": "...",
  "locationWhenInUsePermission": "...",
  "isAndroidBackgroundLocationEnabled": true,
  "isIosBackgroundLocationEnabled": true
}
```

## Usage

### Enable Tracking Programmatically
```typescript
import { useLocation } from '../store/hooks/use-location';

function MyComponent() {
  const { setTrackingEnabled, isTrackingEnabled, currentLocation } = useLocation();

  const handleEnableTracking = async () => {
    await setTrackingEnabled(true);
  };

  return (
    <View>
      <Text>Tracking: {isTrackingEnabled ? 'ON' : 'OFF'}</Text>
      {currentLocation && (
        <Text>
          Location: {currentLocation.latitude}, {currentLocation.longitude}
        </Text>
      )}
    </View>
  );
}
```

### Request Permissions
```typescript
const { requestPermissions, permissions } = useLocation();

const handleRequestPermissions = async () => {
  const granted = await requestPermissions();

  if (granted.foreground && granted.background) {
    console.log('All permissions granted');
  } else if (granted.foreground) {
    console.log('Foreground permission granted only');
  } else {
    console.log('Permissions denied');
  }
};
```

### Get Current Location
```typescript
const { getCurrentLocation, currentLocation } = useLocation();

const handleGetLocation = async () => {
  await getCurrentLocation();
  // currentLocation will be updated
};
```

## Battery Optimization

### Foreground Mode
- Update interval: 30 seconds
- Accuracy: High (GPS)
- Distance interval: 10 meters minimum

### Background Mode
- Update interval: 60 seconds (battery-friendly)
- Accuracy: Balanced
- Distance interval: 50 meters minimum
- Pauses automatically when device is stationary
- Includes battery level in location updates

### Throttling
- Minimum 10 seconds between API/WebSocket sends
- Prevents excessive network usage
- Batches rapid location changes

## Error Handling

### Permission Denied
- User-friendly alert explaining why permissions are needed
- Option to open device settings
- Graceful degradation (app continues to function without tracking)

### No Internet Connection
- Location updates queued locally
- Automatic sync when connection restored
- Visual feedback in UI (last update time)

### Low Battery
- Battery level sent with each update
- Backend can adjust tracking requirements based on battery status
- Consider implementing client-side battery thresholds

### Location Services Disabled
- Detect when location services are off
- Prompt user to enable in device settings
- Show appropriate error messages

## Security Considerations

### Data Protection
- Location data sent over HTTPS only
- Auth token required for all location API calls
- User ID validated on backend
- Location history encrypted in local storage

### Privacy
- Location tracking only active when user enables it
- Clear opt-in/opt-out mechanism
- Tracking automatically stops on logout
- Location history limited to 10 recent points locally

### Best Practices
- Never log raw location coordinates to console in production
- Sanitize location data before sending to backend
- Implement rate limiting on backend
- Monitor for unusual location patterns (anti-spoofing)

## Testing

### Manual Testing Checklist
- [ ] Enable tracking from Profile screen
- [ ] Verify foreground tracking starts
- [ ] Verify background tracking starts (check notification on Android)
- [ ] Move device and verify location updates
- [ ] Check WebSocket connection (location:updated events)
- [ ] Disable internet, verify offline queueing
- [ ] Re-enable internet, verify sync
- [ ] Disable tracking, verify it stops
- [ ] Logout, verify tracking stops
- [ ] Login, verify auto-start if previously enabled
- [ ] Kill app, reopen, verify auto-start
- [ ] Test permission denial scenarios
- [ ] Test low battery scenarios
- [ ] Verify location history updates
- [ ] Check last update timestamp accuracy

### Simulated Location Testing
**iOS:**
1. Xcode → Debug → Simulate Location → Select route
2. Verify location updates track simulated route

**Android:**
1. Enable Developer Options
2. Select mock location app
3. Use GPS emulator app
4. Verify location updates

## Troubleshooting

### Tracking Not Starting
1. Check permissions in device settings
2. Verify location services enabled
3. Check console for initialization errors
4. Confirm user is logged in
5. Verify expo-location and expo-task-manager installed

### Background Tracking Not Working
**iOS:**
- Ensure UIBackgroundModes includes "location"
- Check if "Always Allow" location permission granted
- Verify app is not force-killed by user

**Android:**
- Check FOREGROUND_SERVICE permission granted
- Verify foreground notification appears
- Ensure battery optimization disabled for app
- Check if background location permission granted (Android 10+)

### Location Updates Not Reaching Backend
1. Check internet connection
2. Verify WebSocket connected (check console logs)
3. Test API endpoint manually
4. Check auth token validity
5. Review backend logs for errors

### High Battery Drain
1. Reduce foreground update frequency
2. Increase background distance interval
3. Use Balanced accuracy instead of High
4. Implement pause tracking when stationary
5. Consider geofencing instead of continuous tracking

## Future Enhancements

### Planned Features
- [ ] Geofencing for automatic shop check-in/check-out
- [ ] Route deviation alerts
- [ ] Location-based push notifications
- [ ] Heatmap of agent coverage
- [ ] Location-based performance analytics
- [ ] Smart tracking pause (when stationary for 10+ minutes)
- [ ] Location sharing with team members
- [ ] Visit duration tracking
- [ ] Mileage tracking for reimbursement

### Performance Optimizations
- [ ] Implement location prediction to reduce GPS usage
- [ ] Batch location updates when offline
- [ ] Compress location data before sending
- [ ] Implement differential location updates (only send changes)
- [ ] Use significant location changes API for ultra-low power

### Analytics
- [ ] Track distance traveled per day
- [ ] Monitor tracking uptime percentage
- [ ] Analyze location accuracy metrics
- [ ] Battery impact reporting
- [ ] Network usage monitoring

## Dependencies

```json
{
  "expo-location": "^19.0.7",
  "expo-task-manager": "^12.0.3",
  "expo-battery": "^8.0.6",
  "expo-secure-store": "^15.0.7",
  "socket.io-client": "^4.8.1",
  "zustand": "^5.0.8"
}
```

## Platform Compatibility

- **iOS**: 13.0+
- **Android**: API 23+ (Android 6.0+)
- **Expo**: SDK 54
- **React Native**: 0.81.5

## Support

For issues or questions:
1. Check console logs for error messages
2. Review this documentation
3. Check Expo Location docs: https://docs.expo.dev/versions/latest/sdk/location/
4. Contact development team

---

**Last Updated**: 2025-12-11
**Version**: 1.0.0
**Maintained By**: Sales Agent App Development Team
