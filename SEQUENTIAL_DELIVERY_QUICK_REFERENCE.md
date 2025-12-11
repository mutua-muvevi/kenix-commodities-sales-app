# Sequential Delivery Enforcement - Quick Reference

## Implementation Summary

### Client-Side Files Modified
1. **apps/rider/types/index.ts** - Added `canProceed`, `previousDelivery`, `adminOverride` fields
2. **apps/rider/components/ShopCard.tsx** - Added lock overlay UI and locked state styling
3. **apps/rider/app/(tabs)/index.tsx** - Added sequential notice card and upcoming stops section
4. **apps/rider/store/routeStore.ts** - Added client-side validation in `markArrival()` and `completeDelivery()`

### Server-Side Files Modified
1. **server/middleware/delivery/sequentialEnforcement.js** - Enhanced error responses and logging
2. **server/routes/deliveries.js** - Added unlock endpoints

### Server-Side Files Created
1. **server/controllers/deliveries/requestUnlock.js** - Rider unlock request handler
2. **server/controllers/deliveries/adminUnlockDelivery.js** - Admin unlock handler

---

## Key Features

### UI Enforcement
- Current delivery: Unlocked, blue badge, fully interactive
- Future deliveries: Locked, grey badge with lock icon, semi-transparent overlay
- Tap locked delivery → Alert: "Complete previous delivery first"
- Sequential notice card: Explains enforcement policy

### Client Validation
```typescript
// Before marking arrival or completing delivery
if (currentDelivery._id !== deliveryId || !currentDelivery.canProceed) {
  throw new Error('Sequential delivery violation');
}
```

### Server Enforcement
```javascript
// Middleware on arrival and completion endpoints
enforceSequentialDelivery → validates sequence → rejects if out of order
```

### Admin Override
```javascript
POST /api/deliveries/:deliveryId/admin-unlock
Body: { reason: 'shop_closed', notes: '...' }
→ Sets canProceed = true
→ Notifies rider via WebSocket
```

---

## User Flows

### Normal Flow
1. Open app → See route with current + future deliveries
2. Current delivery unlocked, future locked
3. Complete delivery → Next automatically unlocks
4. Proceed sequentially

### Shop Unavailable
1. Tap "Shop Unavailable" button
2. Request sent to admin
3. Admin unlocks via dashboard
4. Rider notified, next shop unlocked

### Attempted Skip (Blocked)
1. Tap locked delivery → Alert shown
2. Direct API call → 403 error with detailed message
3. Violation logged for audit

---

## API Endpoints

### Protected Endpoints (Sequential Enforcement Active)
```
PATCH /api/deliveries/:deliveryId/arrive
PATCH /api/deliveries/:deliveryId/complete
GET   /api/deliveries/:deliveryId/next
```

### New Endpoints
```
POST /api/deliveries/:deliveryId/request-unlock  (rider)
POST /api/deliveries/:deliveryId/admin-unlock    (admin)
```

---

## Data Fields

### Delivery Model
```javascript
{
  canProceed: Boolean,           // Can rider proceed with this delivery?
  previousDelivery: ObjectId,    // Must complete this first
  adminOverride: {
    isOverridden: Boolean,
    reason: String,
    overriddenBy: ObjectId,
    overriddenAt: Date
  }
}
```

---

## WebSocket Events

### Rider → Admin
```
Event: 'rider:unlock-request'
Data: { deliveryId, shopName, reason, notes, location }
```

### Admin → Rider
```
Event: 'admin:shop-unlocked'
Data: { deliveryId, reason, message }
```

---

## Testing Commands

### Check Delivery Sequence
```javascript
db.deliveries.find({ route: routeId }).sort({ sequenceNumber: 1 });
```

### Check Locked Deliveries
```javascript
db.deliveries.find({ canProceed: false, status: 'pending' });
```

### Check Admin Overrides
```javascript
db.deliveries.find({ 'adminOverride.isOverridden': true });
```

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Delivery locked but should be unlocked | Verify `canProceed` field and previous delivery status |
| Admin unlock not working | Check admin role, deliveryId, WebSocket connection |
| Violations not logged | Check server logs, middleware execution |
| UI shows wrong lock state | Refresh route data, check `canProceed` value |

---

## Success Metrics

- **Violation Attempts**: Should be near zero
- **Compliance Rate**: Target 99%+
- **Admin Response Time**: < 5 minutes
- **API Response Time**: < 200ms

---

## Security Layers

1. **UI**: Lock indicators prevent accidental clicks
2. **Client**: Validation blocks unauthorized API calls
3. **Server**: Middleware enforces on every request
4. **Audit**: All violations and overrides logged
5. **RBAC**: Only admins can override

---

## Next Steps

1. Deploy server changes
2. Submit mobile app update
3. Monitor violation logs
4. Train riders on new UX
5. Collect feedback and iterate
