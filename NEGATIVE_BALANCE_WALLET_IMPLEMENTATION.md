# Negative Balance Wallet System Implementation

## Overview
This document describes the complete implementation of the negative balance wallet system for riders in the Kenix B2B Commodities platform. The system tracks product value loaded onto riders and credits their wallet as they complete deliveries and collect payments.

## Business Logic

### Core Concept
1. **Route Assignment**: When a rider is assigned a route, their wallet balance becomes NEGATIVE
   - The negative amount equals the TOTAL VALUE of all products they're carrying
   - Example: Route with orders worth KES 50,000 → Wallet starts at -50,000

2. **Delivery Completion**: After each successful delivery and payment collection:
   - Wallet balance INCREASES (becomes less negative)
   - Example: Deliver order worth KES 5,000 → Balance: -50,000 → -45,000

3. **Route Completion**: When all deliveries are completed and payments collected:
   - Wallet balance should be 0 (all products accounted for)
   - Any positive balance means company owes rider (bonus, incentive, etc.)

## Implementation Details

### 1. Server-Side Changes

#### File: `server/models/riderWallet.js`
**Status**: Already implemented correctly

**Key Features**:
- `balance`: Current balance (negative = rider owes company, positive = company owes rider)
- `totalLoadedAmount`: Total value of goods loaded for current route
- `totalCollected`: Total payments collected so far
- `outstandingAmount`: Auto-calculated remaining amount to collect
- `collectionPercentage`: Virtual field showing percentage collected

**Methods**:
- `loadGoodsForRoute(routeId, amount, userId)`: Creates negative balance when goods are loaded
- `recordCollection(deliveryId, amount, mpesaTransactionId, userId)`: Credits wallet when payment collected
- `settleWallet(settlementAmount, notes, userId)`: Resets wallet after settlement

#### File: `server/controllers/routes/assignRider.js`
**Changes Made**:
- Replaced manual wallet balance manipulation with `loadGoodsForRoute()` method
- Updated response to include `totalLoadedAmount` and `outstandingAmount`
- Added WebSocket notification for wallet update

**Before**:
```javascript
riderWallet.currentBalance -= totalDeliveryValue;
riderWallet.transactions.push({ type: 'debit', ... });
```

**After**:
```javascript
await riderWallet.loadGoodsForRoute(route._id, totalDeliveryValue, adminId);
```

#### File: `server/controllers/deliveries/completeDelivery.js`
**Changes Made**:
- Replaced manual wallet balance manipulation with `recordCollection()` method
- Updated response to include full wallet object with all fields
- Added WebSocket notification for wallet update

**Before**:
```javascript
riderWallet.currentBalance += order.totalPrice;
riderWallet.transactions.push({ type: 'credit', ... });
```

**After**:
```javascript
await riderWallet.recordCollection(delivery._id, order.totalPrice, null, riderId);
```

#### File: `server/controllers/wallet/getWalletBalance.js`
**Changes Made**:
- Updated response structure to match frontend expectations
- Changed `data.wallet` to `wallet` (flat structure)
- Added transactions in response (latest 20)
- Changed `id` to `_id` for consistency

### 2. Frontend Changes

#### File: `apps/rider/types/index.ts`
**Changes Made**:
- Updated `Wallet` interface to match server structure
- Updated `WalletTransaction` interface with new transaction types

**New Fields**:
```typescript
interface Wallet {
  _id: string;
  balance: number;
  totalLoadedAmount: number;
  totalCollected: number;
  outstandingAmount: number;
  collectionPercentage: number;
  currentRoute?: string;
  status: 'active' | 'suspended' | 'settled';
  transactions: WalletTransaction[];
  lastSettlement?: { ... };
}

interface WalletTransaction {
  type: 'load' | 'collection' | 'adjustment' | 'settlement';
  amount: number;
  previousBalance: number;
  newBalance: number;
  description: string;
  // ... other fields
}
```

#### File: `apps/rider/services/api.ts`
**Changes Made**:
- Fixed wallet endpoint from `/wallet/rider/:riderId` to `/wallet/:riderId`
- Ensured correct response structure handling

#### File: `apps/rider/app/(tabs)/wallet.tsx`
**Changes Made**:

1. **Enhanced Balance Card**:
   - Shows negative balance in red, positive in green
   - Dynamic hint text based on balance state
   - Added collection progress section for active routes

2. **Collection Progress Display**:
   - Three-column layout showing: Loaded | Collected | Remaining
   - Progress bar showing collection percentage
   - Only visible when `totalLoadedAmount > 0`

3. **Updated Transaction Icons**:
   - `load`: cube-outline (Orange) - Goods loaded
   - `collection`: checkmark-circle (Green) - Payment collected
   - `adjustment`: create-outline (Blue) - Admin adjustment
   - `settlement`: cash-outline (Purple) - Wallet settled

4. **Transaction Display**:
   - Changed `balanceAfter` to `newBalance` to match server structure

### 3. WebSocket Real-time Updates

#### Route Assignment (`assignRider.js`)
Emits two events when route is assigned:
1. `route:assigned` - Route details
2. `wallet:updated` - Wallet state with negative balance

#### Delivery Completion (`completeDelivery.js`)
Emits three events when delivery is completed:
1. `delivery:completed` (to shop)
2. `delivery:completed` (to admin)
3. `wallet:updated` (to rider) - Updated balance after collection

The rider app's `routeStore.ts` already has listeners for these events, so wallet updates happen in real-time.

## API Endpoints

### Get Wallet Balance
```
GET /api/wallet/:riderId
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "message": "Wallet balance retrieved successfully",
  "wallet": {
    "_id": "...",
    "rider": "...",
    "balance": -45000,
    "totalLoadedAmount": 50000,
    "totalCollected": 5000,
    "outstandingAmount": 45000,
    "collectionPercentage": 10,
    "currentRoute": "...",
    "status": "active",
    "transactions": [...],
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

### Assign Rider to Route (Admin Only)
```
PATCH /api/routes/:id/assign-rider
Authorization: Bearer <admin-token>
Body: { "riderId": "..." }
```

**Response includes**:
```json
{
  "success": true,
  "data": {
    "route": {...},
    "assignment": {
      "totalOrders": 10,
      "totalValue": 50000,
      "riderWalletBalance": -50000,
      "totalLoadedAmount": 50000,
      "outstandingAmount": 50000
    }
  }
}
```

### Complete Delivery (Rider)
```
PATCH /api/deliveries/:deliveryId/complete
Authorization: Bearer <rider-token>
Body: { signature, photo, notes, location }
```

**Response includes**:
```json
{
  "success": true,
  "data": {
    "completedDelivery": {...},
    "nextShop": {...},
    "routeProgress": {...},
    "wallet": {
      "balance": -45000,
      "totalLoadedAmount": 50000,
      "totalCollected": 5000,
      "outstandingAmount": 45000,
      "collectionPercentage": 10
    }
  }
}
```

## User Interface

### Wallet Screen
The wallet screen now displays:

1. **Balance Card** (Blue header):
   - Large balance amount (red if negative, green if positive/zero)
   - Contextual hint text
   - Collection progress section (only for active routes)

2. **Collection Progress** (shown when route is active):
   ```
   Loaded          Collected       Remaining
   KES 50,000      KES 5,000      KES 45,000

   [=====>                    ] 10% collected
   ```

3. **Today's Progress**:
   - Deliveries completed
   - Amount collected today

4. **Transaction History**:
   - Latest transactions with icons
   - Balance after each transaction
   - Transaction type indicators

### Color Coding
- **Negative Balance**: #FFCDD2 (Light Red) - Rider owes company
- **Zero Balance**: #C8E6C9 (Light Green) - All collections complete
- **Positive Balance**: #C8E6C9 (Light Green) - Company owes rider
- **Loaded Amount**: White
- **Collected Amount**: #C8E6C9 (Light Green)
- **Remaining Amount**: #FFCDD2 (Light Red)

## Transaction Types

### 1. Load (type: 'load')
- **When**: Route assigned to rider
- **Amount**: Negative (decreases balance)
- **Icon**: Cube outline (Orange)
- **Description**: "Goods loaded for route {routeCode}"

### 2. Collection (type: 'collection')
- **When**: Delivery completed and payment collected
- **Amount**: Positive (increases balance)
- **Icon**: Checkmark circle (Green)
- **Description**: "Payment collected for delivery {deliveryCode}"

### 3. Adjustment (type: 'adjustment')
- **When**: Admin manually adjusts wallet
- **Amount**: Can be positive or negative
- **Icon**: Create outline (Blue)
- **Description**: "Admin adjustment: {reason}"

### 4. Settlement (type: 'settlement')
- **When**: Admin settles rider's wallet
- **Amount**: Brings balance to zero
- **Icon**: Cash outline (Purple)
- **Description**: "Wallet settled"

## Example Flow

### Scenario: Rider completes route with 5 orders

1. **Initial State**: Wallet balance = KES 0

2. **Route Assigned**:
   - 5 orders totaling KES 50,000
   - Transaction: Load -50,000
   - **Balance: -50,000** (Rider owes KES 50,000)
   - Display: "Outstanding amount owed to Kenix"

3. **Delivery 1 Completed** (KES 10,000):
   - Transaction: Collection +10,000
   - **Balance: -40,000**
   - Progress: 20% collected

4. **Delivery 2 Completed** (KES 8,000):
   - Transaction: Collection +8,000
   - **Balance: -32,000**
   - Progress: 36% collected

5. **Delivery 3 Completed** (KES 12,000):
   - Transaction: Collection +12,000
   - **Balance: -20,000**
   - Progress: 60% collected

6. **Delivery 4 Completed** (KES 15,000):
   - Transaction: Collection +15,000
   - **Balance: -5,000**
   - Progress: 90% collected

7. **Delivery 5 Completed** (KES 5,000):
   - Transaction: Collection +5,000
   - **Balance: 0**
   - Progress: 100% collected
   - Display: "All collections completed"

## Edge Cases Handled

### 1. No Active Route
- `totalLoadedAmount = 0`
- Collection progress section hidden
- Shows only current balance

### 2. Multiple Routes
- Only current route's loaded amount tracked
- Previous routes should be settled before new assignment
- `currentRoute` field ensures wallet is linked to active route

### 3. Partial Collections
- Each delivery independently updates wallet
- Progress bar shows real-time completion percentage
- Outstanding amount clearly displayed

### 4. Admin Adjustments
- Can add bonuses (positive adjustments)
- Can deduct for damages/shortages (negative adjustments)
- All adjustments logged in transaction history

### 5. Offline Mode
- Wallet state cached locally via routeStore
- Updates queued when offline
- Synced when connectivity restored (handled by existing offline service)

## Testing Checklist

- [ ] Route assignment creates negative balance
- [ ] Negative balance equals total order value
- [ ] Delivery completion increases balance correctly
- [ ] Balance reaches zero after all deliveries
- [ ] Wallet UI shows correct colors (red for negative, green for zero/positive)
- [ ] Collection progress displays correctly
- [ ] Progress bar updates in real-time
- [ ] Transaction icons match transaction types
- [ ] WebSocket updates trigger UI refresh
- [ ] Offline mode caches wallet state
- [ ] Admin can adjust wallet balance
- [ ] Settlement resets wallet to zero

## Files Modified

### Server (Backend)
1. `server/controllers/routes/assignRider.js` - Use loadGoodsForRoute method
2. `server/controllers/deliveries/completeDelivery.js` - Use recordCollection method
3. `server/controllers/wallet/getWalletBalance.js` - Fix response structure
4. WebSocket emissions added for wallet updates

### Rider App (Frontend)
1. `apps/rider/types/index.ts` - Updated Wallet and WalletTransaction interfaces
2. `apps/rider/services/api.ts` - Fixed wallet endpoint URLs
3. `apps/rider/app/(tabs)/wallet.tsx` - Enhanced UI with collection progress
4. `apps/rider/store/routeStore.ts` - Already has wallet:updated listener

## Database Schema

The `riderWallet` model already has all required fields. No migrations needed.

**Key Indexes**:
- `rider` (unique)
- `status`
- `currentRoute`

## Security Considerations

1. **Authorization**: Riders can only view their own wallet
2. **Admin Only**: Only admins can adjust wallets manually
3. **Transaction Integrity**: All wallet operations use MongoDB transactions (ACID)
4. **Audit Trail**: All changes logged in transactions array
5. **Balance Verification**: `calculatedBalance` field for verification

## Performance Considerations

1. **Pagination**: Transaction history limited to 20 latest
2. **Indexes**: Efficient queries on rider, status, currentRoute
3. **Caching**: Frontend caches wallet state for offline access
4. **WebSocket**: Real-time updates without polling

## Future Enhancements

1. **Settlement Automation**: Auto-settle wallets at end of day
2. **Analytics Dashboard**: Rider performance metrics based on wallet data
3. **Payment Integration**: Direct M-Pesa integration for instant crediting
4. **Alerts**: Notify rider when balance approaches zero
5. **Bonus System**: Automatic bonuses for early completion

## Support & Troubleshooting

### Issue: Balance not updating after delivery
**Solution**: Check WebSocket connection, verify delivery completion response

### Issue: Negative balance not showing in red
**Solution**: Verify wallet object has `balance` field, check StyleSheet

### Issue: Collection progress not displaying
**Solution**: Ensure `totalLoadedAmount > 0` and wallet object is loaded

### Issue: Transaction icons not showing
**Solution**: Verify transaction type matches enum values

---

**Implementation Date**: 2025-12-11
**Version**: 1.0
**Status**: Complete and Ready for Testing
