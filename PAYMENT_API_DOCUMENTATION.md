# Payment Collection API Documentation

## Overview

This document details the enhanced payment collection API endpoints with fraud prevention features for the Kenix Rider App.

---

## Endpoints

### 1. Record Payment (Enhanced)

Submit payment collection with fraud prevention.

**Endpoint**: `POST /api/deliveries/:deliveryId/payment`

**Authentication**: Required (Rider only)

**Headers**:
```
Authorization: Bearer <rider_jwt_token>
Content-Type: application/json
```

**URL Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| deliveryId | string | Yes | MongoDB ObjectId of the delivery |

**Request Body**:

#### For M-Pesa Payments:
```json
{
  "paymentMethod": "mpesa",
  "amount": 5000,
  "phoneNumber": "254712345678",
  "isFlagged": false,
  "location": {
    "lat": -1.2921,
    "lng": 36.8219
  }
}
```

#### For Cash Payments:
```json
{
  "paymentMethod": "cash",
  "amount": 5000,
  "proofPhoto": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "notes": "Change given: KES 500. Receipt number: 12345",
  "isFlagged": true,
  "location": {
    "lat": -1.2921,
    "lng": 36.8219
  },
  "timestamp": "2025-12-11T10:30:00.000Z"
}
```

#### For Airtel Money Payments:
```json
{
  "paymentMethod": "airtel",
  "amount": 5000,
  "proofPhoto": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "notes": "Transaction ref: ATM123456789",
  "isFlagged": false,
  "location": {
    "lat": -1.2921,
    "lng": 36.8219
  },
  "timestamp": "2025-12-11T10:30:00.000Z"
}
```

**Request Body Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| paymentMethod | string | Yes | Payment method: "mpesa", "cash", or "airtel" |
| amount | number | Yes | Amount collected in KES |
| phoneNumber | string | Conditional | Required for M-Pesa. Format: 254XXXXXXXXX |
| proofPhoto | string | Conditional | Required for cash/airtel. Base64-encoded image |
| notes | string | No | Additional notes about payment collection |
| isFlagged | boolean | No | Set to true if rider acknowledges amount mismatch |
| location | object | No | GPS coordinates {lat, lng} where payment was collected |
| timestamp | string | No | ISO 8601 timestamp when payment was collected |

**Response (M-Pesa - Success)**:

Status Code: `200 OK`

```json
{
  "success": true,
  "message": "STK Push sent successfully. Waiting for customer confirmation.",
  "data": {
    "transactionRef": "MPESA-1702294200000-ABC123",
    "checkoutRequestID": "ws_CO_11122023103000000001",
    "amount": 5000,
    "phoneNumber": "254712345678",
    "status": "pending"
  }
}
```

**Response (Cash/Airtel - Success)**:

Status Code: `200 OK`

```json
{
  "success": true,
  "message": "Payment recorded successfully",
  "data": {
    "delivery": {
      "_id": "6579a1b2c3d4e5f6a7b8c9d0",
      "deliveryCode": "DEL-20251211-001"
    },
    "payment": {
      "method": "cash",
      "amount": 5000,
      "expectedAmount": 5000,
      "status": "collected",
      "collectedAt": "2025-12-11T10:30:00.000Z",
      "proofPhotoUrl": "https://storage.googleapis.com/kenix-payment-proofs/payment-proofs/6579a1b2c3d4e5f6a7b8c9d0-1702294200000.jpg",
      "isFlagged": false
    },
    "walletBalance": -45000
  }
}
```

**Response (Cash with Amount Mismatch - Flagged)**:

Status Code: `200 OK`

```json
{
  "success": true,
  "message": "Payment recorded and flagged for admin review",
  "data": {
    "delivery": {
      "_id": "6579a1b2c3d4e5f6a7b8c9d0",
      "deliveryCode": "DEL-20251211-001"
    },
    "payment": {
      "method": "cash",
      "amount": 4800,
      "expectedAmount": 5000,
      "status": "flagged",
      "collectedAt": "2025-12-11T10:30:00.000Z",
      "proofPhotoUrl": "https://storage.googleapis.com/kenix-payment-proofs/payment-proofs/6579a1b2c3d4e5f6a7b8c9d0-1702294200000.jpg",
      "isFlagged": true
    },
    "walletBalance": -45200
  }
}
```

**Error Responses**:

**400 Bad Request - Missing Required Fields**:
```json
{
  "success": false,
  "message": "Payment method and amount are required",
  "errors": ["Missing required payment information"]
}
```

**400 Bad Request - Amount Mismatch Not Acknowledged**:
```json
{
  "success": false,
  "message": "Amount mismatch detected",
  "errors": [
    "Expected amount: 5000, Provided: 4800. Please acknowledge the mismatch."
  ],
  "data": {
    "expectedAmount": 5000,
    "providedAmount": 4800,
    "requiresFlag": true
  }
}
```

**400 Bad Request - Missing Photo Proof for Cash**:
```json
{
  "success": false,
  "message": "Photo proof required",
  "errors": [
    "Photo evidence of cash payment is required for fraud prevention"
  ]
}
```

**400 Bad Request - Invalid Delivery Status**:
```json
{
  "success": false,
  "message": "Invalid delivery status",
  "errors": ["Delivery must be marked as arrived before recording payment"]
}
```

**400 Bad Request - Payment Already Collected**:
```json
{
  "success": false,
  "message": "Payment already collected",
  "errors": ["Payment has already been recorded for this delivery"]
}
```

**403 Forbidden - Not Assigned to Delivery**:
```json
{
  "success": false,
  "message": "Access denied",
  "errors": ["You are not assigned to this delivery"]
}
```

**404 Not Found - Delivery Not Found**:
```json
{
  "success": false,
  "message": "Delivery not found",
  "errors": ["No delivery exists with the specified ID"]
}
```

**500 Internal Server Error - Photo Upload Failed**:
```json
{
  "success": false,
  "message": "Failed to upload payment proof photo",
  "errors": ["Photo upload failed. Please try again."]
}
```

**500 Internal Server Error - M-Pesa STK Push Failed**:
```json
{
  "success": false,
  "message": "Failed to initiate M-Pesa payment",
  "errors": ["Invalid phone number format"]
}
```

---

## WebSocket Events

### Events Emitted by Server

#### 1. payment:confirmed

Sent to rider when M-Pesa payment is confirmed or cash payment is recorded.

**Event Name**: `payment:confirmed`

**Target**: Rider (userId)

**Payload**:
```json
{
  "deliveryId": "6579a1b2c3d4e5f6a7b8c9d0",
  "status": "confirmed",
  "amount": 5000,
  "expectedAmount": 5000,
  "transactionId": "6579a1b2c3d4e5f6a7b8c9e1",
  "mpesaReceiptNumber": "QGH123ABC",
  "timestamp": "2025-12-11T10:30:00.000Z"
}
```

**Payload (Flagged)**:
```json
{
  "deliveryId": "6579a1b2c3d4e5f6a7b8c9d0",
  "status": "flagged",
  "amount": 4800,
  "expectedAmount": 5000,
  "paymentMethod": "cash",
  "timestamp": "2025-12-11T10:30:00.000Z"
}
```

#### 2. payment:failed

Sent to rider when M-Pesa payment fails.

**Event Name**: `payment:failed`

**Target**: Rider (userId)

**Payload**:
```json
{
  "deliveryId": "6579a1b2c3d4e5f6a7b8c9d0",
  "reason": "User cancelled the transaction",
  "resultCode": 1032
}
```

#### 3. payment:initiated

Sent to rider when M-Pesa STK Push is successfully sent.

**Event Name**: `payment:initiated`

**Target**: Rider (userId)

**Payload**:
```json
{
  "deliveryId": "6579a1b2c3d4e5f6a7b8c9d0",
  "checkoutRequestID": "ws_CO_11122023103000000001",
  "amount": 5000,
  "phoneNumber": "254712345678"
}
```

#### 4. payment:flagged

Sent to all admins when a payment is flagged for review.

**Event Name**: `payment:flagged`

**Target**: Admin Role

**Payload**:
```json
{
  "deliveryId": "6579a1b2c3d4e5f6a7b8c9d0",
  "deliveryCode": "DEL-20251211-001",
  "riderId": "6579a1b2c3d4e5f6a7b8c9d2",
  "riderName": "John Doe",
  "expectedAmount": 5000,
  "collectedAmount": 4800,
  "difference": -200,
  "paymentMethod": "cash",
  "proofPhotoUrl": "https://storage.googleapis.com/kenix-payment-proofs/payment-proofs/6579a1b2c3d4e5f6a7b8c9d0-1702294200000.jpg"
}
```

#### 5. payment:received

Sent to shop when payment is recorded.

**Event Name**: `payment:received`

**Target**: Shop (userId)

**Payload**:
```json
{
  "deliveryId": "6579a1b2c3d4e5f6a7b8c9d0",
  "amount": 5000,
  "mpesaReceiptNumber": "QGH123ABC",
  "status": "confirmed"
}
```

**Payload (Flagged)**:
```json
{
  "deliveryId": "6579a1b2c3d4e5f6a7b8c9d0",
  "amount": 4800,
  "paymentMethod": "cash",
  "status": "under_review"
}
```

---

## Frontend Integration Examples

### React Native (Rider App)

#### Listen for Payment Confirmation:
```typescript
import { websocketService } from '../services/websocket';
import * as Haptics from 'expo-haptics';

useEffect(() => {
  const handlePaymentConfirmed = (data: any) => {
    if (data.deliveryId === currentDelivery._id) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      if (data.status === 'confirmed') {
        showSuccessMessage('Payment confirmed!');
        proceedToCompletion();
      } else if (data.status === 'flagged') {
        showWarningMessage('Payment flagged for review');
        proceedToCompletion();
      }
    }
  };

  const handlePaymentFailed = (data: any) => {
    if (data.deliveryId === currentDelivery._id) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Payment Failed', data.reason);
    }
  };

  websocketService.on('payment:confirmed', handlePaymentConfirmed);
  websocketService.on('payment:failed', handlePaymentFailed);

  return () => {
    websocketService.off('payment:confirmed', handlePaymentConfirmed);
    websocketService.off('payment:failed', handlePaymentFailed);
  };
}, [currentDelivery]);
```

#### Submit M-Pesa Payment:
```typescript
const submitMpesaPayment = async () => {
  try {
    const location = await getCurrentLocation();

    const response = await deliveryService.submitPayment(deliveryId, {
      paymentMethod: 'mpesa',
      amount: orderTotal,
      phoneNumber: shopPhoneNumber,
      location,
    });

    if (response.success) {
      setCheckoutRequestID(response.data.checkoutRequestID);
      setWaitingForPayment(true);

      // Set timeout for 2 minutes
      setTimeout(() => {
        if (waitingForPayment) {
          Alert.alert('Timeout', 'Payment confirmation timed out');
          setWaitingForPayment(false);
        }
      }, 120000);
    }
  } catch (error) {
    Alert.alert('Error', error.message);
  }
};
```

#### Submit Cash Payment with Photo Proof:
```typescript
const submitCashPayment = async (photoUri: string) => {
  try {
    // Convert image to base64
    const base64Image = await FileSystem.readAsStringAsync(photoUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const location = await getCurrentLocation();
    const enteredAmount = parseFloat(amountInput);
    const expectedAmount = orderTotal;

    const response = await deliveryService.submitPayment(deliveryId, {
      paymentMethod: 'cash',
      amount: enteredAmount,
      proofPhoto: `data:image/jpeg;base64,${base64Image}`,
      notes: paymentNotes,
      isFlagged: enteredAmount !== expectedAmount,
      location,
      timestamp: new Date().toISOString(),
    });

    if (response.success) {
      if (response.data.payment.isFlagged) {
        Alert.alert(
          'Payment Recorded',
          'Payment flagged for admin review due to amount mismatch.',
          [{ text: 'OK', onPress: () => proceedToCompletion() }]
        );
      } else {
        showSuccessMessage('Payment recorded successfully');
        proceedToCompletion();
      }
    }
  } catch (error) {
    Alert.alert('Error', error.message);
  }
};
```

---

## Admin Dashboard Integration Examples

### Get Pending Fraud Flags:
```typescript
const getPendingFraudFlags = async () => {
  try {
    const response = await api.get('/admin/fraud-flags', {
      params: {
        status: 'pending',
        page: 1,
        limit: 50,
      },
    });

    return response.data.fraudFlags;
  } catch (error) {
    console.error('Error fetching fraud flags:', error);
  }
};
```

### Listen for New Flagged Payments:
```typescript
useEffect(() => {
  const handlePaymentFlagged = (data: any) => {
    // Show notification
    showNotification({
      title: 'Payment Flagged',
      message: `Delivery ${data.deliveryCode} has a payment discrepancy of KES ${Math.abs(data.difference)}`,
      severity: 'warning',
    });

    // Refresh fraud flags list
    refreshFraudFlags();
  };

  websocketService.on('payment:flagged', handlePaymentFlagged);

  return () => {
    websocketService.off('payment:flagged', handlePaymentFlagged);
  };
}, []);
```

---

## Database Schema

### Delivery.paymentInfo Field:
```javascript
{
  method: 'cash' | 'mpesa' | 'airtel' | 'credit' | 'not_required',
  amountToCollect: Number,
  amountCollected: Number,
  status: 'pending' | 'collected' | 'flagged' | 'failed' | 'not_required',
  mpesaTransaction: ObjectId,
  collectedAt: Date,
  receiptNumber: String,

  // Fraud Prevention
  proofPhoto: String,  // GCS URL
  collectorNotes: String,
  collectionLocation: {
    type: 'Point',
    coordinates: [Number, Number]  // [lng, lat]
  },
  timestamp: Date,
  fraudFlags: [{
    type: String,
    description: String,
    severity: 'low' | 'medium' | 'high',
    flaggedAt: Date,
    flaggedBy: ObjectId,
    resolvedAt: Date,
    resolvedBy: ObjectId,
    resolution: String,
    status: 'pending' | 'reviewed' | 'resolved' | 'escalated'
  }]
}
```

### FraudFlag Collection:
```javascript
{
  _id: ObjectId,
  delivery: ObjectId,
  rider: ObjectId,
  shop: ObjectId,
  order: ObjectId,
  type: String,
  description: String,
  severity: 'low' | 'medium' | 'high',
  expectedAmount: Number,
  collectedAmount: Number,
  discrepancy: Number,
  paymentMethod: String,
  proofPhotoUrl: String,
  collectionLocation: { type: 'Point', coordinates: [Number, Number] },
  expectedLocation: { type: 'Point', coordinates: [Number, Number] },
  distanceFromExpected: Number,
  status: 'pending' | 'under_review' | 'resolved' | 'escalated' | 'dismissed',
  priority: 'low' | 'normal' | 'high' | 'urgent',
  flaggedAt: Date,
  flaggedBy: ObjectId,
  reviewedAt: Date,
  reviewedBy: ObjectId,
  resolvedAt: Date,
  resolvedBy: ObjectId,
  resolution: String,
  adminNotes: String,
  actionsTaken: [{
    action: String,
    performedBy: ObjectId,
    performedAt: Date,
    notes: String
  }],
  riskScore: Number  // 1-100
}
```

---

## Security Considerations

### Rate Limiting
- Implement rate limiting on payment endpoints
- Max 5 payment attempts per delivery
- Max 10 payment submissions per minute per rider

### Authentication
- All endpoints require valid JWT token
- Rider can only access their own deliveries
- Admin role required for fraud flag management

### Data Validation
- Amount must be positive number
- Phone number must match E.164 format for M-Pesa
- Photo proof must be valid base64 image (max 10MB)
- Location coordinates validated

### Photo Upload
- Images sanitized before upload
- Max file size: 10MB
- Allowed formats: JPEG, PNG
- Stored with UUID filenames
- Accessible only to authenticated admin/rider

---

## Testing

### Postman Collection

Download the Postman collection: [Payment API Tests.postman_collection.json]

### Test Scenarios

1. **Happy Path - M-Pesa**:
   - Submit M-Pesa payment with correct amount
   - Wait for callback
   - Verify WebSocket event
   - Check delivery status updated

2. **Happy Path - Cash**:
   - Submit cash payment with photo proof
   - Verify photo uploaded to GCS
   - Check payment recorded
   - Verify wallet updated

3. **Fraud Detection - Amount Mismatch**:
   - Submit payment with different amount
   - Verify error if not flagged
   - Resubmit with isFlagged: true
   - Verify FraudFlag created
   - Check admin notification sent

4. **Error Cases**:
   - Missing photo proof for cash
   - Invalid delivery status
   - Payment already collected
   - Unauthorized access
   - Invalid phone number for M-Pesa

---

## Troubleshooting

### M-Pesa STK Push Not Received
- Verify phone number format (254XXXXXXXXX)
- Check M-Pesa credentials in .env
- Confirm business shortcode is active
- Test in Safaricom sandbox first

### WebSocket Event Not Received
- Check WebSocket connection status
- Verify authentication token valid
- Check server logs for emit calls
- Ensure rider userId matches

### Photo Upload Fails
- Check GCS credentials and permissions
- Verify bucket exists and is writable
- Check image size < 10MB
- Validate base64 encoding

### Amount Always Flagged
- Check for floating point precision issues
- Ensure amount comparison uses tolerance (0.01)
- Verify order total matches delivery amount

---

**Last Updated**: December 11, 2025
**Version**: 1.0.0
**Maintainer**: Kenix Development Team
