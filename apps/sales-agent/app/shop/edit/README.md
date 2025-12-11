# Shop Edit Screen Documentation

## File Location
`G:\Waks\Kenix\commodies\apps\sales-agent\app\shop\edit\[id].tsx`

## Overview
The Shop Edit screen allows sales agents to modify shop information for pending shops they have registered. It provides a comprehensive form with validation, change tracking, and authorization controls.

## Key Features

### 1. Authorization & Security
- **Status Check**: Only shops with `pending` status can be edited
- **Ownership Verification**: Only the sales agent who created the shop can edit it
- **Not Authorized Screen**: Shows clear error message if user lacks permission
- **Auto-redirect**: Returns to previous screen if shop not found or unauthorized

### 2. Form Management
- **Pre-populated Fields**: All fields automatically filled with existing shop data
- **Change Detection**: Real-time tracking of modified fields
- **Change Highlighting**: Modified fields highlighted with blue border and light blue background
- **Unsaved Changes Warning**: Alert shown when attempting to leave with unsaved changes
- **Original vs New Values**: Confirmation dialog shows which fields will be updated

### 3. Editable Fields

#### Basic Information
- Shop Name (required)
- Owner Name (required)
- Phone Number (required, validated as +254 format)
- Email (optional)
- Business Registration Number (optional)

#### Location
- Interactive Map with draggable marker
- Street/Building
- Area/Neighborhood (required)
- City
- County

#### Shop Photo
- Current photo displayed
- Option to replace with new photo
- Camera capture support
- Gallery selection support
- Image compression before upload

#### Operating Hours
- Days of operation (multi-select)
- Opening time (24-hour format)
- Closing time (24-hour format)
- Special notes (optional)

### 4. Validation Rules
- Shop name cannot be empty
- Owner name cannot be empty
- Phone number required in format: +254712345678
- Area/neighborhood required
- Shop photo required
- At least one operating day must be selected

### 5. Update Flow
1. Load existing shop data
2. Pre-populate form with current values
3. User modifies fields
4. System detects and highlights changes
5. User clicks "Save Changes"
6. System shows confirmation with list of changed fields
7. API sends PATCH request with only changed fields
8. Success toast displayed
9. Navigate back to shop details

### 6. UI/UX Features
- **Loading States**: Skeleton screens while fetching data
- **Save Button**: Disabled until changes are made
- **Changes Indicator**: Yellow banner showing "You have unsaved changes"
- **Section Organization**: Organized into logical sections (Basic Info, Location, Hours)
- **Keyboard Avoidance**: Form adjusts when keyboard appears
- **Scroll Support**: Full scrollable form with proper spacing

## API Integration

### Endpoint
```typescript
PATCH /api/user/edit/:shopId
```

### Request Body
Only changed fields are sent to minimize payload:
```typescript
{
  shopName?: string;
  name?: string;  // Owner name
  phoneNumber?: string;
  email?: string;
  businessRegNumber?: string;
  location?: {
    type: 'Point';
    coordinates: [longitude, latitude];
  };
  address?: {
    street: string;
    area: string;
    city: string;
    county: string;
  };
  shopPhoto?: string;
  operatingHours?: {
    open: string;
    close: string;
    days: string[];
  };
  specialNotes?: string;
}
```

### Response
```typescript
{
  success: boolean;
  message: string;
  user: Shop;
}
```

## State Management

### Local State
- `shop`: Current shop data
- `isLoading`: Loading state for initial fetch
- `isSaving`: Loading state for save operation
- `hasChanges`: Boolean indicating if form has changes
- `formData`: Current form values
- `originalData`: Original shop values for comparison

### Zustand Store Integration
The edit screen integrates with `useShopStore` for:
- Fetching shop details
- Updating shop in local cache after successful edit
- Maintaining consistency across app

## Component Reuse

### LocationPicker
```typescript
<LocationPicker
  onLocationChange={(loc) => updateFormData('location', loc)}
  initialLocation={formData.location}
/>
```

### ShopPhotoCapture
```typescript
<ShopPhotoCapture
  onPhotoTaken={(uri) => updateFormData('shopPhoto', uri)}
  initialPhoto={formData.shopPhoto}
/>
```

## Navigation Flow

### Entry Points
1. **Shop Details Screen**: "Edit" button (only visible for pending shops)
   ```typescript
   router.push(`/shop/edit/${shop._id}`);
   ```

### Exit Points
1. **Success**: After successful save, navigates back to shop details
2. **Cancel**: Back button with discard confirmation if changes exist
3. **Not Authorized**: Back button to return to previous screen

## Error Handling

### Loading Errors
- Shows error alert
- Auto-navigates back to previous screen

### Validation Errors
- Alert with specific validation message
- Form remains open for correction

### Save Errors
- Alert with API error message
- Form remains open with changes preserved
- User can retry save operation

### Network Errors
- Caught and displayed as user-friendly messages
- Save button re-enabled for retry

## Testing Suggestions

### Unit Tests
```typescript
describe('EditShopScreen', () => {
  test('loads shop data on mount', async () => {
    // Mock API call
    // Render component
    // Wait for loading to complete
    // Assert form is populated
  });

  test('detects field changes', () => {
    // Render with initial data
    // Change a field
    // Assert hasChanges is true
    // Assert save button is enabled
  });

  test('validates phone number format', () => {
    // Enter invalid phone
    // Click save
    // Assert validation error shown
  });

  test('sends only changed fields on save', async () => {
    // Change specific fields
    // Mock API call
    // Trigger save
    // Assert API called with only changed fields
  });

  test('blocks unauthorized access', () => {
    // Mock shop with different createdBy
    // Assert not authorized screen shown
  });
});
```

### Integration Tests
```typescript
describe('Edit Shop Flow', () => {
  test('complete edit and save flow', async () => {
    // Navigate to edit screen
    // Modify fields
    // Save changes
    // Verify success message
    // Verify navigation back
  });

  test('discard changes flow', () => {
    // Make changes
    // Click cancel
    // Confirm discard
    // Verify navigation back
  });
});
```

### Manual Testing Checklist
- [ ] Edit button appears only for pending shops
- [ ] Edit button hidden for approved/rejected shops
- [ ] Not authorized screen for shops created by other agents
- [ ] All fields pre-populate correctly
- [ ] Location picker shows correct initial position
- [ ] Photo picker shows current photo
- [ ] Change detection works for all fields
- [ ] Changed fields highlighted correctly
- [ ] Save button disabled when no changes
- [ ] Save button enabled when changes exist
- [ ] Phone number validation works
- [ ] Required field validation works
- [ ] Confirmation dialog shows correct changed fields
- [ ] API receives only changed fields
- [ ] Success toast appears after save
- [ ] Navigation back works after save
- [ ] Discard confirmation works
- [ ] Changes preserved after validation error
- [ ] Error messages clear and helpful

## Performance Optimizations

### Implemented
- **Change Detection**: Uses JSON comparison only when needed
- **Memoization**: `useCallback` for authorization and change checks
- **Conditional Rendering**: Different screens based on state
- **Optimistic Updates**: Could be added to shop store

### Future Improvements
- Add debouncing for change detection
- Implement field-level validation instead of form-level
- Add optimistic updates to show changes immediately
- Cache shop data to reduce API calls
- Add offline support with queue

## Accessibility
- Form labels properly associated with inputs
- Required fields marked with asterisk
- Error messages announced
- Touch targets sized appropriately (48px minimum)
- Color not sole indicator (borders + background for changes)

## Edge Cases Handled
1. **Shop Not Found**: Shows error screen with back button
2. **Unauthorized Access**: Shows not authorized screen
3. **No Changes**: Prevents save, shows alert
4. **Validation Failures**: Shows specific error, keeps form open
5. **Network Errors**: Shows error, allows retry
6. **Duplicate Navigation**: Prevents double submission with loading state
7. **Missing Optional Fields**: Sends undefined to clear on backend
8. **Photo Changes**: Handles both camera and gallery selections

## Integration with Existing Codebase

### Files Modified
1. **Shop Details Screen** (`app/shop/[id].tsx`)
   - Updated `handleEditShop` to navigate to edit screen

2. **Shop Store** (`store/shopStore.ts`)
   - Added `updateShop` method for local state update

3. **API Service** (`services/api.ts`)
   - Added `patch` method for semantic correctness

### Files Created
1. **Edit Screen** (`app/shop/edit/[id].tsx`)
   - Complete edit functionality

## Code Quality
- **TypeScript**: Full type safety with Shop interface
- **Clean Code**: Single Responsibility Principle
- **DRY**: Reuses existing components (LocationPicker, ShopPhotoCapture)
- **SOLID**: Open for extension, closed for modification
- **Error Handling**: Comprehensive try-catch blocks
- **User Feedback**: Loading states, success/error messages

## Security Considerations
- Authorization check on mount
- Only sends changed fields (principle of least privilege)
- Phone number format validation prevents injection
- Secure token already handled in API interceptor
- No sensitive data logged to console

## Future Enhancements
1. Add photo preview before upload
2. Implement field-level change tracking UI
3. Add "Restore Original" button for individual fields
4. Show edit history/audit trail
5. Add admin override for editing approved shops
6. Implement draft save (auto-save)
7. Add image cropper for shop photo
8. Support multiple shop photos
9. Add geofence validation (ensure location makes sense)
10. Add duplicate shop detection before save
