# Quick Integration Guide - Payment System with Fraud Prevention

## Step-by-Step Integration (30 minutes)

### Step 1: Update Delivery Model (5 min)

Edit `server/models/deliveries.js`, find the `paymentInfo` field (around line 145) and add these new fields inside it:

```javascript
// Inside paymentInfo object, after receiptNumber, add:
proofPhoto: {
  type: String,
  // URL to GCS - photo of cash/receipt
},
collectorNotes: {
  type: String,
  trim: true,
},
collectionLocation: {
  type: {
    type: String,
    enum: ['Point'],
  },
  coordinates: {
    type: [Number], // [lng, lat]
  },
},
timestamp: {
  type: Date,
},
fraudFlags: [{
  type: {
    type: String,
    enum: ['amount_mismatch', 'location_mismatch', 'suspicious_timing', 'duplicate_payment', 'manual_review', 'missing_proof'],
  },
  description: {
    type: String,
    trim: true,
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low',
  },
  flaggedAt: {
    type: Date,
    default: Date.now,
  },
  flaggedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  resolvedAt: {
    type: Date,
  },
  resolvedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  resolution: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved', 'escalated'],
    default: 'pending',
  },
}],
```

Also update the status enum to include 'flagged' and 'airtel':
```javascript
status: {
  type: String,
  enum: ['pending', 'collected', 'flagged', 'failed', 'not_required'],  // Added 'flagged'
  default: 'not_required',
},
method: {
  type: String,
  trim: true,
  lowercase: true,
  enum: ['cash', 'mpesa', 'airtel', 'credit', 'not_required'],  // Added 'airtel'
  default: 'not_required',
},
```

### Step 2: Update Delivery Routes (2 min)

Edit `server/routes/deliveries.js`:

```javascript
// At the top, add:
const recordPaymentEnhanced = require('../controllers/deliveries/recordPaymentEnhanced');

// Find the payment route and replace it with:
router.post('/:deliveryId/payment', authenticateRider, recordPaymentEnhanced);
```

### Step 3: Update M-Pesa Callback (2 min)

Edit `server/routes/payments.js`:

```javascript
// At the top, add:
const { processMpesaCallbackEnhanced } = require('../services/mpesa/callbackEnhanced');

// Find the callback route and update it:
router.post('/mpesa/callback', async (req, res) => {
  try {
    await processMpesaCallbackEnhanced(req.body);
    res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (error) {
    console.error('Callback error:', error);
    res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
  }
});
```

### Step 4: Update Rider API Service (3 min)

Edit `apps/rider/services/api.ts`:

Find the `submitPayment` function in `deliveryService` and update it to:

```typescript
submitPayment: async (
  deliveryId: string,
  paymentData: {
    paymentMethod: 'mpesa' | 'cash' | 'airtel';
    amount: number;
    phoneNumber?: string;
    proofPhoto?: string;      // NEW
    notes?: string;           // NEW
    isFlagged?: boolean;      // NEW
    location?: { lat: number; lng: number };  // NEW
    timestamp?: string;       // NEW
  }
): Promise<{ success: boolean; message: string; transactionId?: string; data?: any }> => {
  const response = await api.post(
    `/deliveries/${deliveryId}/payment`,
    paymentData
  );
  return response.data;
},
```

### Step 5: Update DeliveryFlowModal (15 min)

Edit `apps/rider/components/DeliveryFlowModal.tsx`:

1. **Update imports** (add Haptics):
```typescript
import * as Haptics from 'expo-haptics';
```

2. **Update FlowStep type**:
```typescript
type FlowStep = 'arrival' | 'payment' | 'payment-proof' | 'completion' | 'success';
```

3. **Add new state variables** after existing payment state (around line 44):
```typescript
const [mpesaTransactionId, setMpesaTransactionId] = useState<string>('');
const [cashProofPhoto, setCashProofPhoto] = useState('');
const [cashNotes, setCashNotes] = useState('');
const [amountMismatch, setAmountMismatch] = useState(false);
const [deliveryPhoto, setDeliveryPhoto] = useState('');
```

4. **Update payment confirmation listener** (replace existing useEffect at line 54):
```typescript
useEffect(() => {
  const handlePaymentConfirmed = (data: any) => {
    if (data.deliveryId === delivery._id && data.status === 'confirmed') {
      setPaymentConfirmed(true);
      setMpesaTransactionId(data.transactionId || '');
      setWaitingForPayment(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setStep('completion');
    }
  };

  const handlePaymentFailed = (data: any) => {
    if (data.deliveryId === delivery._id) {
      setWaitingForPayment(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        'Payment Failed',
        data.reason || 'The M-Pesa payment could not be completed.',
        [
          { text: 'Try Cash', onPress: () => setPaymentMethod('cash') },
          { text: 'Retry M-Pesa' },
        ]
      );
    }
  };

  websocketService.on('payment:confirmed', handlePaymentConfirmed);
  websocketService.on('payment:failed', handlePaymentFailed);

  return () => {
    websocketService.off('payment:confirmed', handlePaymentConfirmed);
    websocketService.off('payment:failed', handlePaymentFailed);
  };
}, [delivery._id]);
```

5. **Add amount mismatch detection**:
```typescript
useEffect(() => {
  const enteredAmount = parseFloat(paymentAmount);
  const expectedAmount = delivery.totalAmount;
  if (!isNaN(enteredAmount) && enteredAmount !== expectedAmount) {
    setAmountMismatch(true);
  } else {
    setAmountMismatch(false);
  }
}, [paymentAmount, delivery.totalAmount]);
```

6. **Update handleSubmitPayment** to include fraud prevention:
```typescript
const handleSubmitPayment = async () => {
  const amount = parseFloat(paymentAmount);

  if (isNaN(amount) || amount <= 0) {
    Alert.alert('Error', 'Please enter a valid amount');
    return;
  }

  // FRAUD PREVENTION: Check for amount mismatch
  if (amount !== delivery.totalAmount) {
    Alert.alert(
      'Amount Mismatch Detected',
      `Expected: KES ${delivery.totalAmount.toLocaleString()}\nEntered: KES ${amount.toLocaleString()}\n\nThis will be flagged for admin review.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue Anyway',
          style: 'destructive',
          onPress: () => proceedWithPayment(amount, true),
        },
      ]
    );
    return;
  }

  proceedWithPayment(amount, false);
};

const proceedWithPayment = async (amount: number, isFlagged: boolean) => {
  setIsLoading(true);
  try {
    const location = await getCurrentLocation();

    if (paymentMethod === 'mpesa') {
      await deliveryService.submitPayment(delivery._id, {
        paymentMethod: 'mpesa',
        amount,
        phoneNumber: delivery.shopId.phoneNumber,
        isFlagged,
        location: location || undefined,
      });
      setWaitingForPayment(true);
      setIsLoading(false);

      setTimeout(() => {
        if (!paymentConfirmed) {
          setWaitingForPayment(false);
          Alert.alert('Payment Timeout', 'Payment confirmation timed out.');
        }
      }, 120000);
    } else {
      // Cash/Airtel - go to proof step
      setStep('payment-proof');
      setIsLoading(false);
    }
  } catch (error: any) {
    Alert.alert('Error', error.response?.data?.message || 'Payment failed');
    setIsLoading(false);
  }
};
```

7. **Add cash proof submission handler**:
```typescript
const handleSubmitCashProof = async () => {
  if (!cashProofPhoto) {
    Alert.alert('Proof Required', 'Photo evidence is required for cash payments.');
    return;
  }

  setIsLoading(true);
  try {
    const location = await getCurrentLocation();
    const amount = parseFloat(paymentAmount);

    await deliveryService.submitPayment(delivery._id, {
      paymentMethod,
      amount,
      proofPhoto: cashProofPhoto,
      notes: cashNotes,
      isFlagged: amountMismatch,
      location: location || undefined,
      timestamp: new Date().toISOString(),
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (amountMismatch) {
      Alert.alert('Payment Recorded', 'Payment flagged for admin review due to amount mismatch.', [
        { text: 'OK', onPress: () => setStep('completion') }
      ]);
    } else {
      setStep('completion');
    }
  } catch (error: any) {
    Alert.alert('Error', error.response?.data?.message || 'Failed to record payment');
  } finally {
    setIsLoading(false);
  }
};
```

8. **Add payment-proof step in the render** (after the waiting for payment section):
```tsx
{/* Step 2.5: Payment Proof (Cash/Airtel only) */}
{step === 'payment-proof' && (
  <View style={styles.stepContent}>
    <Text style={styles.stepTitle}>Payment Proof Required</Text>
    <Text style={styles.stepDescription}>
      For fraud prevention, please provide photo evidence of the payment received.
    </Text>

    <View style={styles.warningCard}>
      <Ionicons name="shield-checkmark" size={20} color="#4CAF50" />
      <Text style={styles.warningText}>
        This proof protects both you and the company. Take a clear photo of the cash or receipt.
      </Text>
    </View>

    <View style={styles.captureSection}>
      <Text style={styles.sectionLabel}>Photo of Cash/Receipt</Text>
      <PhotoCapture onPhoto={setCashProofPhoto} />
    </View>

    <View style={styles.inputContainer}>
      <Text style={styles.sectionLabel}>Payment Notes (Optional)</Text>
      <TextInput
        style={styles.notesInput}
        value={cashNotes}
        onChangeText={setCashNotes}
        placeholder="Any notes about the payment"
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />
    </View>

    <TouchableOpacity
      style={[styles.primaryButton, (isLoading || !cashProofPhoto) && styles.buttonDisabled]}
      onPress={handleSubmitCashProof}
      disabled={isLoading || !cashProofPhoto}
    >
      {isLoading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <>
          <Ionicons name="checkmark" size={20} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>Submit Payment Proof</Text>
        </>
      )}
    </TouchableOpacity>
  </View>
)}
```

9. **Add warning card styles** to the StyleSheet:
```typescript
warningCard: {
  backgroundColor: '#FFF3E0',
  padding: 16,
  borderRadius: 8,
  marginBottom: 20,
  flexDirection: 'row',
  alignItems: 'flex-start',
  gap: 12,
},
warningText: {
  fontSize: 14,
  color: '#E65100',
  lineHeight: 20,
  flex: 1,
},
amountInputError: {
  borderColor: '#FF5722',
  backgroundColor: '#FFEBEE',
},
```

### Step 6: Install expo-haptics (if not already installed) (3 min)

```bash
cd apps/rider
npx expo install expo-haptics
```

### Step 7: Test the Implementation

1. **Start the server**:
```bash
cd server
npm run dev
```

2. **Start the rider app**:
```bash
cd apps/rider
npx expo start
```

3. **Test M-Pesa Flow**:
   - Create a test delivery
   - Mark arrival
   - Select M-Pesa
   - Send STK Push
   - Check WebSocket events in console
   - Confirm payment on test phone

4. **Test Cash Flow with Fraud Prevention**:
   - Mark arrival
   - Select Cash
   - Enter amount (try both matching and mismatching)
   - Observe warning if mismatch
   - Try to proceed without photo (should block)
   - Take photo proof
   - Submit and verify database record

### Step 8: Verify Database Records

Check MongoDB after test payments:

```javascript
// Check delivery payment info
db.deliveries.findOne({ _id: ObjectId('...') }, { paymentInfo: 1 })

// Should show:
{
  paymentInfo: {
    method: 'cash',
    amountToCollect: 5000,
    amountCollected: 5000,
    status: 'collected',
    proofPhoto: 'https://storage.googleapis.com/...',
    collectionLocation: { type: 'Point', coordinates: [36.82, -1.29] },
    timestamp: ISODate('...'),
    fraudFlags: []  // Empty if no mismatch
  }
}

// Check fraud flags collection
db.fraud_flags.find({ status: 'pending' })
```

---

## Common Issues & Solutions

### Issue 1: Photo upload fails
**Solution**: Check GCS credentials and bucket permissions in `.env`

### Issue 2: WebSocket event not received
**Solution**:
- Verify WebSocket connection in rider app
- Check server logs for emitToUser calls
- Ensure rider is authenticated

### Issue 3: Amount always flagged
**Solution**: Check floating point comparison - allow 0.01 tolerance

### Issue 4: M-Pesa callback not working
**Solution**:
- Verify callback URL is publicly accessible
- Check M-Pesa credentials in `.env`
- Test with Safaricom sandbox first

---

## Quick Test Checklist

- [ ] M-Pesa STK Push sent successfully
- [ ] WebSocket payment confirmation received
- [ ] Cash payment requires photo proof
- [ ] Amount mismatch shows warning
- [ ] Flagged payment creates FraudFlag record
- [ ] Rider wallet updated correctly
- [ ] Admin notified of flagged payments
- [ ] Geo-location captured
- [ ] Timestamp recorded

---

## Rollback Plan

If issues occur, revert these changes:

1. Restore original `recordPayment.js` controller:
```javascript
// In routes/deliveries.js
const recordPayment = require('../controllers/deliveries/recordPayment');
router.post('/:deliveryId/payment', authenticateRider, recordPayment);
```

2. Remove new DeliveryFlowModal changes - use git:
```bash
git checkout apps/rider/components/DeliveryFlowModal.tsx
```

3. MongoDB migration (if needed):
```javascript
// Remove new fields from existing deliveries
db.deliveries.updateMany(
  {},
  {
    $unset: {
      'paymentInfo.proofPhoto': '',
      'paymentInfo.collectorNotes': '',
      'paymentInfo.collectionLocation': '',
      'paymentInfo.timestamp': '',
      'paymentInfo.fraudFlags': ''
    }
  }
);
```

---

## Next Steps After Integration

1. **Monitor Production**:
   - Track fraud flag creation rate
   - Monitor payment collection times
   - Check photo upload success rate

2. **Build Admin Dashboard**:
   - Fraud flag review interface
   - Proof photo viewer
   - Rider fraud statistics

3. **Enhance System**:
   - Add AI photo verification
   - Implement geo-fence validation
   - Create automated fraud detection rules

---

**Estimated Integration Time**: 30 minutes
**Testing Time**: 15 minutes
**Total**: 45 minutes to production-ready payment system with fraud prevention
