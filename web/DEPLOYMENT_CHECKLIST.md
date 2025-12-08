# Kenix Commodities Admin Dashboard - Deployment Checklist

## 🚀 Pre-Deployment Checklist

### Environment Setup
- [ ] Create `.env.local` from `.env.local.example`
- [ ] Set `NEXT_PUBLIC_API_URL` to backend URL
- [ ] Set `NEXT_PUBLIC_WS_URL` to WebSocket URL
- [ ] Set `NEXT_PUBLIC_MAPBOX_TOKEN` (get from https://account.mapbox.com/)
- [ ] Set `NEXT_PUBLIC_GOOGLE_CLOUD_BUCKET` (if using image uploads)
- [ ] Verify backend is accessible from frontend

### Dependencies
- [ ] Run `yarn install`
- [ ] Verify no security vulnerabilities: `yarn audit`
- [ ] Check for outdated packages: `yarn outdated`
- [ ] All dependencies resolve correctly

### Code Quality
- [ ] No TypeScript errors: `yarn tsc --noEmit`
- [ ] No ESLint errors: `yarn lint`
- [ ] Clean build: `yarn build` succeeds
- [ ] No console errors in development

---

## 🧪 Testing Checklist

### Products Management (`/dashboard/products`)
- [ ] Can create new product
- [ ] Can edit existing product
- [ ] Can delete product
- [ ] Search works correctly
- [ ] Category filter works
- [ ] Stock status filter works
- [ ] Pagination works
- [ ] Form validation prevents invalid data
- [ ] Stock status toggle works
- [ ] Prices display correctly

### Order Details (`/dashboard/orders/[id]`)
- [ ] Order details display correctly
- [ ] Product list shows with images
- [ ] Map displays shop location
- [ ] Approve button works
- [ ] Reject button requires reason
- [ ] Assign to route workflow works
- [ ] Can select route from dropdown
- [ ] Can select rider from dropdown
- [ ] Remove product button works
- [ ] Cancel order button works
- [ ] Customer info displays correctly
- [ ] All status badges show correct colors

### Routes List (`/dashboard/routes`)
- [ ] Routes table loads
- [ ] Progress bars display correctly
- [ ] Status filter works
- [ ] Rider filter works
- [ ] Date filter works
- [ ] Pagination works
- [ ] Click route navigates to details
- [ ] Create button navigates to creation page

### Route Creation (`/dashboard/routes/create`)
- [ ] Map loads at Nairobi center
- [ ] All shops display as markers
- [ ] Click shop adds to route
- [ ] Click again removes from route
- [ ] Selected shops show numbers
- [ ] Route path displays
- [ ] Can reorder shops (up/down)
- [ ] Can remove shops
- [ ] Optimize route button works
- [ ] Rider dropdown populates
- [ ] Operating days selector works
- [ ] Time pickers work
- [ ] Save route creates successfully

### Route Details (`/dashboard/routes/[id]`)
- [ ] Route info loads correctly
- [ ] Map displays all shops
- [ ] Markers colored by status
- [ ] Route polyline shows
- [ ] Shop list displays
- [ ] Current shop highlighted
- [ ] Reassign rider works
- [ ] Override sequence works
- [ ] Refresh button updates data

### Live Tracking (`/dashboard/tracking`)
- [ ] Map loads full screen
- [ ] Shop markers display
- [ ] Markers colored correctly (green/yellow/blue/red)
- [ ] Rider markers appear
- [ ] WebSocket connects (check sidebar)
- [ ] Route filter works
- [ ] Rider filter works
- [ ] Click route centers map
- [ ] Click marker shows popup
- [ ] Active routes list displays
- [ ] Progress bars update
- [ ] Connection status shows
- [ ] Mobile drawer works (on mobile)

### Analytics Dashboard (`/dashboard`)
- [ ] All 4 stat cards load
- [ ] Revenue cards display
- [ ] Orders over time chart renders
- [ ] Orders by status pie chart renders
- [ ] Revenue trend chart renders
- [ ] Top products chart renders
- [ ] Recent orders table loads
- [ ] Quick actions buttons work
- [ ] Alert shows if >10 pending approvals
- [ ] Trend indicators show correctly

### General
- [ ] Sidebar navigation works
- [ ] All links navigate correctly
- [ ] StatusBadge colors correct
- [ ] Toast notifications appear
- [ ] Loading states show
- [ ] Error messages user-friendly
- [ ] Forms validate inputs
- [ ] API errors handled gracefully

---

## 📱 Cross-Browser Testing

### Desktop Browsers
- [ ] Chrome (latest) - All features work
- [ ] Firefox (latest) - All features work
- [ ] Safari (latest) - All features work
- [ ] Edge (latest) - All features work

### Mobile Browsers
- [ ] Chrome Mobile - Responsive layout
- [ ] Safari iOS - Responsive layout
- [ ] Samsung Internet - Responsive layout

### Screen Sizes
- [ ] Desktop (1920x1080) - Full layout
- [ ] Laptop (1366x768) - Optimized layout
- [ ] Tablet (768x1024) - Responsive grid
- [ ] Mobile (375x667) - Single column

---

## 🔒 Security Checklist

### Authentication
- [ ] Login required for all dashboard pages
- [ ] Admin role verified on mount
- [ ] Non-admin redirected to login
- [ ] Banned users cannot access
- [ ] Token stored securely in localStorage
- [ ] Token sent in Authorization header

### API Security
- [ ] All API calls use HTTPS in production
- [ ] CORS configured correctly
- [ ] No API keys in client code
- [ ] Error messages don't leak sensitive data
- [ ] Input sanitization on all forms

### WebSocket Security
- [ ] WSS (secure WebSocket) in production
- [ ] Authentication token sent on connect
- [ ] Connection auto-reconnects securely
- [ ] No sensitive data in WebSocket messages

---

## ⚡ Performance Checklist

### Loading Speed
- [ ] Initial page load < 3 seconds
- [ ] Dashboard loads < 2 seconds
- [ ] Maps load < 2 seconds
- [ ] Charts render < 1 second
- [ ] API calls complete < 500ms (local)

### Optimization
- [ ] Images optimized (WebP if possible)
- [ ] Bundle size < 1MB gzipped
- [ ] Code splitting enabled
- [ ] Lazy loading for routes
- [ ] Map markers virtualized (if >100)
- [ ] Table pagination implemented
- [ ] Debounced search inputs

### Real-Time
- [ ] WebSocket connects < 1 second
- [ ] Rider updates < 500ms latency
- [ ] Status changes reflect immediately
- [ ] No memory leaks on updates
- [ ] Reconnection works automatically

---

## 📊 Accessibility Checklist

### WCAG 2.1 AA
- [ ] All images have alt text
- [ ] Color contrast ratio ≥ 4.5:1
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Form labels associated
- [ ] Error messages clear
- [ ] Status badges screen-reader friendly

### Screen Readers
- [ ] Works with NVDA (Windows)
- [ ] Works with JAWS (Windows)
- [ ] Works with VoiceOver (Mac/iOS)

---

## 🚢 Production Deployment

### Pre-Deploy
- [ ] All tests passed
- [ ] Code reviewed
- [ ] Documentation up to date
- [ ] Environment variables set
- [ ] Database migrations run (if any)
- [ ] Backend deployed and accessible

### Build
```bash
yarn build
```
- [ ] Build succeeds with no errors
- [ ] Build warnings reviewed
- [ ] Bundle size acceptable
- [ ] Source maps generated

### Deploy to Vercel
```bash
vercel --prod
```
- [ ] Domain configured
- [ ] Environment variables set in dashboard
- [ ] DNS configured (if custom domain)
- [ ] SSL certificate active
- [ ] CDN configured

### Post-Deploy
- [ ] Health check passes
- [ ] All pages load correctly
- [ ] API connections work
- [ ] WebSocket connects
- [ ] Maps display correctly
- [ ] Error tracking configured (Sentry)
- [ ] Analytics configured (if any)

---

## 🔍 Monitoring Setup

### Error Tracking
- [ ] Sentry configured (optional)
- [ ] Error boundaries in place
- [ ] API error logging
- [ ] WebSocket error logging
- [ ] Map error fallbacks

### Analytics
- [ ] Vercel Analytics enabled (optional)
- [ ] Page view tracking
- [ ] User interaction tracking
- [ ] Performance monitoring

### Alerts
- [ ] High error rate alert
- [ ] API downtime alert
- [ ] WebSocket disconnect alert
- [ ] Performance degradation alert

---

## 📝 Documentation Checklist

### User Documentation
- [ ] Admin user guide created
- [ ] Feature documentation complete
- [ ] Screenshots/videos captured
- [ ] FAQ section written
- [ ] Troubleshooting guide ready

### Developer Documentation
- [ ] `ADMIN_DASHBOARD.md` reviewed
- [ ] `QUICKSTART.md` tested
- [ ] API integration documented
- [ ] Architecture diagrams created (optional)
- [ ] Code comments added

### Deployment Documentation
- [ ] Deployment steps documented
- [ ] Environment variables documented
- [ ] Rollback procedure documented
- [ ] Scaling guide created (if needed)

---

## 🎯 Post-Deployment Tasks

### Day 1
- [ ] Monitor error logs
- [ ] Check user feedback
- [ ] Verify all features working
- [ ] Performance metrics baseline
- [ ] WebSocket stability

### Week 1
- [ ] User training completed
- [ ] Feedback collected
- [ ] Bug fixes deployed
- [ ] Performance optimizations
- [ ] Documentation updates

### Month 1
- [ ] Usage analytics reviewed
- [ ] Feature requests collected
- [ ] Performance trends analyzed
- [ ] Security audit completed
- [ ] Backup/restore tested

---

## 🚨 Rollback Plan

### If Deployment Fails
1. [ ] Identify issue from logs
2. [ ] Attempt quick fix if possible
3. [ ] If not fixable in 15 minutes, rollback
4. [ ] Restore previous version
5. [ ] Verify rollback successful
6. [ ] Notify team

### Rollback Commands
```bash
# Vercel rollback
vercel rollback

# Or redeploy previous commit
git checkout <previous-commit>
vercel --prod
```

---

## ✅ Final Sign-Off

### Development Team
- [ ] Frontend engineer approved
- [ ] Backend engineer approved
- [ ] QA engineer approved
- [ ] Product manager approved

### Stakeholders
- [ ] Business owner approved
- [ ] Operations manager approved
- [ ] Finance approved (if applicable)

### Go-Live
- [ ] Deployment window scheduled
- [ ] Team notified
- [ ] Support team ready
- [ ] Monitoring active
- [ ] Communication plan ready

---

## 📞 Support Contacts

**During Deployment:**
- Backend Team: [Contact]
- DevOps Team: [Contact]
- QA Team: [Contact]

**Post-Deployment:**
- On-Call Engineer: [Contact]
- Product Manager: [Contact]
- Support Team: [Contact]

---

## 🎉 Success Criteria

Deployment is considered successful when:
- ✅ All pages load without errors
- ✅ All features work as expected
- ✅ WebSocket connects reliably
- ✅ Maps display correctly
- ✅ No critical errors in logs
- ✅ Performance meets SLA
- ✅ Users can complete key workflows
- ✅ Admin can approve orders
- ✅ Admin can create routes
- ✅ Live tracking shows real-time updates

---

**Deployment Date:** _______________
**Deployed By:** _______________
**Production URL:** _______________
**Rollback URL:** _______________

**Notes:**
_____________________________________________________________________________
_____________________________________________________________________________
_____________________________________________________________________________

---

**Once all checkboxes are complete, you're ready to deploy! 🚀**
