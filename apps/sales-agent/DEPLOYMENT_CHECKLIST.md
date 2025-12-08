# Deployment Checklist - Kenix Sales Agent App

## Pre-Deployment Tasks

### 1. Configuration
- [ ] Update `BASE_URL` in `services/api.ts` with production backend URL
- [ ] Add Google Maps API key in `app.json`
- [ ] Verify app name and bundle identifiers in `app.json`
- [ ] Replace placeholder app icons in `assets/` directory
- [ ] Replace splash screen in `assets/` directory

### 2. Backend Verification
- [ ] Backend API is running and accessible
- [ ] HTTPS is configured for production
- [ ] CORS is configured to allow mobile app requests
- [ ] Test sales agent account exists
- [ ] At least one shop exists for testing orders
- [ ] At least one product exists for testing orders
- [ ] All API endpoints are working:
  - [ ] POST /api/user/login
  - [ ] POST /api/user/register
  - [ ] GET /api/user/fetch/all
  - [ ] GET /api/user/fetch/:id
  - [ ] GET /api/products
  - [ ] POST /api/orders
  - [ ] GET /api/orders

### 3. Testing
- [ ] Test login with sales_agent account
- [ ] Test login failure with wrong credentials
- [ ] Test role validation (non-sales_agent cannot login)
- [ ] Test shop registration (all 4 steps)
- [ ] Test location picker with GPS
- [ ] Test camera photo capture
- [ ] Test gallery photo selection
- [ ] Test shop approval workflow
- [ ] Test order placement
- [ ] Test order history
- [ ] Test network error handling
- [ ] Test offline behavior
- [ ] Test with slow network
- [ ] Test on Android device
- [ ] Test on iOS device (if applicable)

### 4. Performance
- [ ] App launches in < 3 seconds
- [ ] Lists scroll smoothly
- [ ] Maps load quickly
- [ ] Camera opens instantly
- [ ] No memory leaks
- [ ] Images are optimized
- [ ] API responses are fast

### 5. Security
- [ ] Tokens are stored securely (SecureStore)
- [ ] API uses HTTPS in production
- [ ] No sensitive data in logs
- [ ] Camera photos are handled securely
- [ ] Location data is protected
- [ ] Input validation is working

---

## Development Build

### Install EAS CLI
```bash
npm install -g eas-cli
```

### Configure EAS
```bash
cd apps/sales-agent
eas build:configure
```

### Create Development Build

**Android:**
```bash
eas build --profile development --platform android
```

**iOS:**
```bash
eas build --profile development --platform ios
```

### Install on Device
- Download APK/IPA from EAS build page
- Install on device
- Test all features

---

## Production Build

### 1. Pre-Build Checklist
- [ ] All tests passing
- [ ] No console errors or warnings
- [ ] Production API URL configured
- [ ] Google Maps API key added
- [ ] App icons replaced
- [ ] Splash screen updated
- [ ] Version number updated in `app.json`

### 2. Update Version
In `app.json`:
```json
{
  "expo": {
    "version": "1.0.0",
    "ios": {
      "buildNumber": "1"
    },
    "android": {
      "versionCode": 1
    }
  }
}
```

### 3. Create Production Build

**Android:**
```bash
eas build --profile production --platform android
```

**iOS:**
```bash
eas build --profile production --platform ios
```

### 4. Download Build
- Go to expo.dev builds page
- Download APK (Android) or IPA (iOS)
- Test on physical device

---

## Google Play Store (Android)

### 1. Prerequisites
- [ ] Google Play Developer account ($25 one-time fee)
- [ ] App signing key (handled by EAS)
- [ ] High-res app icon (512x512)
- [ ] Feature graphic (1024x500)
- [ ] Screenshots (at least 2)
- [ ] Privacy policy URL
- [ ] Content rating questionnaire

### 2. App Information
- **Title**: Kenix Sales Agent
- **Short Description**: Manage shops and orders for Kenix Commodities
- **Full Description**: [See below]
- **Category**: Business
- **Content Rating**: Everyone
- **Contact Email**: support@kenix.com

### 3. App Description Template
```
Kenix Sales Agent App

Grow your business with Kenix Commodities. The Sales Agent app helps you:

✓ Register new shops quickly and easily
✓ Track your performance metrics
✓ Place orders on behalf of your shops
✓ View all your shops on a map
✓ Monitor your commissions

Features:
• Multi-step shop registration with photo and location
• Interactive dashboard with weekly and monthly stats
• Product catalog with search and filters
• Order management and history
• Real-time commission tracking

For sales agents of Kenix Commodities only.
```

### 4. Screenshots Required
- [ ] Dashboard screen
- [ ] Shop registration wizard
- [ ] My Shops list view
- [ ] Order placement screen
- [ ] Login screen

### 5. Upload to Play Store
1. Go to Google Play Console
2. Create new application
3. Fill in app details
4. Upload APK from EAS build
5. Complete content rating
6. Set pricing (Free)
7. Select countries
8. Submit for review

---

## Apple App Store (iOS)

### 1. Prerequisites
- [ ] Apple Developer account ($99/year)
- [ ] App Store Connect access
- [ ] App icon (1024x1024)
- [ ] Screenshots (various iPhone sizes)
- [ ] Privacy policy URL
- [ ] App description

### 2. App Store Connect Setup
1. Create new app in App Store Connect
2. Fill in app information:
   - **Name**: Kenix Sales Agent
   - **Subtitle**: Manage shops and orders
   - **Category**: Business
   - **Price**: Free

### 3. Screenshots Required (per device size)
- [ ] 6.7" iPhone (1290 x 2796)
- [ ] 6.5" iPhone (1242 x 2688)
- [ ] 5.5" iPhone (1242 x 2208)

### 4. Upload Build
```bash
eas build --profile production --platform ios
eas submit --platform ios
```

### 5. App Review Information
- **Demo Account**: Provide test sales agent credentials
- **Notes**: "Sales agent app for Kenix Commodities. Test with provided credentials."

---

## Post-Deployment

### 1. Monitor
- [ ] Check crash reports
- [ ] Monitor user feedback
- [ ] Track download numbers
- [ ] Monitor performance metrics
- [ ] Check API usage

### 2. User Support
- [ ] Set up support email
- [ ] Create FAQ document
- [ ] Prepare troubleshooting guide
- [ ] Set up feedback channel

### 3. Updates
- [ ] Plan for bug fixes
- [ ] Schedule feature updates
- [ ] Version control strategy
- [ ] Release notes template

---

## Rollback Plan

If critical issues are found:

1. **Immediate**:
   - Notify users via email/notification
   - Provide workaround if possible

2. **Short-term**:
   - Fix bug in codebase
   - Create hotfix build
   - Submit for expedited review

3. **Long-term**:
   - Improve testing process
   - Add automated tests
   - Enhance error monitoring

---

## Environment-Specific Configs

### Development
```typescript
// services/api.ts
const BASE_URL = 'http://192.168.100.6:3001/api';
```

### Staging
```typescript
// services/api.ts
const BASE_URL = 'https://staging-api.kenix.com/api';
```

### Production
```typescript
// services/api.ts
const BASE_URL = 'https://api.kenix.com/api';
```

---

## Version Update Strategy

### Patch (1.0.X)
- Bug fixes
- Minor UI improvements
- No new features

### Minor (1.X.0)
- New features
- Enhancements
- Backward compatible

### Major (X.0.0)
- Breaking changes
- Major redesign
- New architecture

---

## Success Metrics to Track

### Downloads
- [ ] Total downloads
- [ ] Daily active users
- [ ] Weekly active users
- [ ] Monthly active users

### Usage
- [ ] Shops registered per day
- [ ] Orders placed per day
- [ ] Average order value
- [ ] Active sales agents

### Performance
- [ ] App crash rate (< 1%)
- [ ] API response time (< 2s)
- [ ] App launch time (< 3s)
- [ ] User retention rate

### Quality
- [ ] App store rating (target: 4.5+)
- [ ] User reviews
- [ ] Support tickets
- [ ] Bug reports

---

## Final Checklist Before Submission

- [ ] All features tested
- [ ] No critical bugs
- [ ] Performance optimized
- [ ] Security reviewed
- [ ] Privacy policy in place
- [ ] Terms of service created
- [ ] Support email set up
- [ ] Screenshots prepared
- [ ] App description written
- [ ] Metadata complete
- [ ] Test account provided
- [ ] Production build created
- [ ] Build tested on real devices

---

## Emergency Contacts

**Technical Issues**:
- Backend Team: [Contact]
- Mobile Team: [Contact]

**Business Issues**:
- Product Owner: [Contact]
- Project Manager: [Contact]

**Store Issues**:
- Google Play Support: [Link]
- Apple App Store Support: [Link]

---

## Timeline Estimate

- [ ] Configuration & Testing: 1-2 days
- [ ] Production Build: 1 day
- [ ] App Store Submission: 1 day
- [ ] Google Play Review: 1-3 days
- [ ] Apple Review: 2-7 days
- [ ] **Total**: 5-13 days

---

**Ready for Deployment!** 🚀

Once all items are checked, the app is ready to go live.

Good luck with the launch!
