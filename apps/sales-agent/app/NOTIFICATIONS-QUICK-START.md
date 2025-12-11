# Notifications Screen - Quick Start Guide

## Installation

### 1. Install New Dependencies
```bash
cd G:\Waks\Kenix\commodies\apps\sales-agent
npm install
```

This installs:
- `expo-haptics` (haptic feedback)
- `react-native-toast-message` (toast notifications)

### 2. Start the App
```bash
npm start
```

## Usage

### Navigate to Notifications Screen
```typescript
import { router } from 'expo-router';

// From any screen
router.push('/notifications');
```

### Add Notifications Bell Icon to Header

Example for Dashboard or any screen:

```typescript
import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useUnreadCount } from '../store/hooks/use-notification';

function DashboardHeader() {
  const unreadCount = useUnreadCount();

  return (
    <View style={styles.header}>
      <Text style={styles.title}>Dashboard</Text>
      <TouchableOpacity
        style={styles.notificationButton}
        onPress={() => router.push('/notifications')}
      >
        <Ionicons name="notifications-outline" size={24} color="#1f2937" />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#F44336',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
  },
});
```

## Features Available

### 1. Filter Notifications
Tap the filter tabs at the top:
- **All**: Shows all notifications
- **Unread**: Only unread notifications
- **Shops**: Shop approvals/rejections
- **Orders**: Order updates
- **Payments**: Commission payments

### 2. Swipe Actions
- **Swipe LEFT**: Delete notification
- **Swipe RIGHT**: Mark as read (unread only)

### 3. Tap Notification
- Marks as read automatically
- Navigates to related screen:
  - Shop notifications → Shop details
  - Order notifications → Order details
  - Route notifications → Routes tab
  - Commission notifications → Performance tab

### 4. Pull to Refresh
Pull down on the list to refresh notifications

### 5. Bulk Actions
- **Mark All Read**: Tap checkmark icon in header
- **Clear All**: Tap trash icon in header (shows confirmation)

## Backend Requirements

### Required API Endpoints

Your backend needs these endpoints (already configured in `services/api.ts`):

```typescript
// Get all notifications for a user
GET /api/notifications/:userId

// Mark a notification as read
PUT /api/notifications/:notificationId/read

// Mark all notifications as read
PUT /api/notifications/:userId/read-all

// Delete a notification
DELETE /api/notifications/:notificationId

// Clear all notifications
DELETE /api/notifications/:userId/clear-all
```

### Expected Response Format

```typescript
// GET /api/notifications/:userId
[
  {
    "_id": "notification_id",
    "type": "shop_approved",
    "title": "Shop Approved!",
    "message": "Shop Name has been approved",
    "data": {
      "entityId": "shop_id",
      "entityType": "shop"
    },
    "read": false,
    "priority": "high",
    "actionable": true,
    "createdAt": "2025-12-11T10:30:00Z"
  }
]
```

## Testing

### Manual Test Steps

1. **Load Notifications**
   - Navigate to notifications screen
   - Verify notifications load

2. **Test Filters**
   - Tap each filter tab
   - Verify correct notifications show

3. **Test Swipe**
   - Swipe left on a notification
   - Tap delete button
   - Verify notification deleted

4. **Test Mark as Read**
   - Swipe right on unread notification
   - Tap mark read button
   - Verify notification marked read

5. **Test Navigation**
   - Tap a notification
   - Verify navigates to correct screen

6. **Test Pull to Refresh**
   - Pull down on list
   - Verify refreshes

7. **Test Mark All Read**
   - Tap checkmark icon in header
   - Verify all marked read

8. **Test Clear All**
   - Tap trash icon in header
   - Confirm dialog
   - Verify all deleted

## Common Issues

### Notifications not showing
- Check if user is logged in
- Verify backend is running
- Check API endpoint returns data

### Swipe not working
- Already fixed: GestureHandlerRootView in _layout.tsx
- If issue persists, restart app

### Haptics not working
- Test on physical device (not simulator)
- Ensure haptics enabled in device settings

### Toast not showing
- Already fixed: Toast in _layout.tsx
- If issue persists, restart app

## File Locations

```
apps/sales-agent/
├── app/
│   ├── notifications.tsx              # Main screen
│   ├── _layout.tsx                    # Updated with Toast
│   └── notifications-IMPLEMENTATION.md # Full docs
├── components/
│   └── ToastConfig.tsx                # Toast styling
├── services/
│   └── api.ts                         # Updated with endpoints
├── store/
│   ├── slices/notification/
│   │   └── notification-store.ts      # Notification state
│   └── hooks/
│       └── use-notification.ts        # Notification hooks
└── types/
    └── notification.ts                # Type definitions
```

## Next Steps

1. **Install dependencies**: `npm install`
2. **Start app**: `npm start`
3. **Test notifications screen**: Navigate to `/notifications`
4. **Add bell icon**: Add to dashboard/header
5. **Test with real data**: Create notifications via backend

## Need Help?

Refer to detailed documentation:
- `app/notifications-IMPLEMENTATION.md` - Full technical docs
- `NOTIFICATIONS-SUMMARY.md` - Complete feature summary

## Code Snippet: Create Test Notification

For testing, you can manually add a notification via the store:

```typescript
import { useNotificationStore } from '../store/slices/notification/notification-store';

// In your component
const addNotification = useNotificationStore((state) => state.addNotification);

// Add test notification
addNotification({
  _id: 'test_' + Date.now(),
  type: 'shop_approved',
  title: 'Test Notification',
  message: 'This is a test notification',
  data: {
    entityId: 'shop_123',
    entityType: 'shop',
  },
  read: false,
  priority: 'high',
  actionable: true,
  createdAt: new Date().toISOString(),
});
```

That's it! Your notifications screen is ready to use.
