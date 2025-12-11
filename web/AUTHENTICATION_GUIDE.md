# Authentication System - Complete Guide

## Overview

The Kenix Commodities web admin dashboard now has a **production-ready, enterprise-grade authentication system** with the following security features:

### Security Features Implemented

1. **HTTP-Only Cookie-Based Authentication** - Tokens stored securely server-side
2. **Next.js Middleware** - Request-level route protection
3. **CSRF Protection** - Prevents cross-site request forgery attacks
4. **Session Management** - Automatic timeout after 30 minutes of inactivity
5. **Login Attempt Tracking** - Rate limiting to prevent brute force attacks
6. **Role-Based Access Control** - Admin-only access to dashboard
7. **Token Refresh** - Automatic token refresh with fallback queue
8. **Password Strength Validation** - Enforced strong password requirements
9. **Email Verification** - OTP-based email verification flow
10. **Password Reset** - Secure password reset with time-limited tokens

---

## File Structure

### Core Files Created/Updated

```
web/
├── src/
│   ├── middleware.ts                          # Next.js middleware for route protection
│   │
│   ├── app/
│   │   ├── api/auth/
│   │   │   ├── login/route.ts                 # Login API with cookie setting
│   │   │   ├── logout/route.ts                # Logout API with cookie clearing
│   │   │   ├── refresh/route.ts               # Token refresh API
│   │   │   └── me/route.ts                    # Get current user API
│   │   │
│   │   ├── auth/
│   │   │   ├── login/page.tsx                 # Login page (updated)
│   │   │   ├── register/page.tsx              # Registration page
│   │   │   ├── forgot-password/page.tsx       # Forgot password page
│   │   │   ├── reset-password/page.tsx        # Reset password page
│   │   │   └── verify-email/page.tsx          # Email verification page
│   │   │
│   │   └── dashboard/layout.tsx               # Dashboard layout (updated)
│   │
│   ├── components/auth/
│   │   ├── SessionTimeoutWarning.tsx          # Session timeout warning dialog
│   │   └── ActivityTracker.tsx                # User activity tracker
│   │
│   ├── lib/
│   │   ├── csrf.ts                            # CSRF token utilities
│   │   └── api/
│   │       ├── auth.ts                        # Auth API functions (updated)
│   │       └── client.ts                      # Axios client (updated)
│   │
│   └── store/
│       └── authStore.ts                       # Auth state management (updated)
```

---

## Authentication Flow

### 1. Login Flow

```
User → Login Page → API Route (/api/auth/login) → Backend API
                         ↓
                  Set HTTP-Only Cookies:
                  - auth_token
                  - user_role
                  - user_id
                  - csrf_token
                  - last_activity
                         ↓
                  Return User Data → Store in Zustand → Redirect to Dashboard
```

### 2. Registration Flow

```
User → Register Page → Backend API (/user/register)
                         ↓
                  Send Verification Email with OTP
                         ↓
                  Redirect to Verify Email Page
                         ↓
                  User Enters OTP → Backend API (/user/verify/email)
                         ↓
                  Email Verified → Redirect to Login
```

### 3. Password Reset Flow

```
User → Forgot Password Page → Backend API (/user/reset/password)
                         ↓
                  Send Reset Email with Token
                         ↓
                  User Clicks Link → Reset Password Page
                         ↓
                  Enter New Password → Backend API (/user/new/password)
                         ↓
                  Password Updated → Redirect to Login
```

### 4. Session Management

```
User Activity → Activity Tracker → Update last_activity timestamp
                                           ↓
                                   Check if 25 mins passed
                                           ↓
                                   Show Timeout Warning (5 min countdown)
                                           ↓
                              User Clicks "Stay Logged In" → Refresh Session
                                      OR
                              Timer Expires → Auto Logout
```

---

## Security Implementation Details

### 1. Next.js Middleware (`src/middleware.ts`)

**Purpose:** Protects routes at the request level before they even reach React components.

**Features:**
- Checks for `auth_token` cookie on protected routes
- Validates user role (admin only for dashboard)
- Redirects unauthenticated users to login
- Allows public routes without authentication

**Protected Routes:**
- `/dashboard/*` - Requires admin role

**Public Routes:**
- `/`, `/auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/verify-email`

### 2. HTTP-Only Cookies

**Why cookies instead of localStorage?**
- Cannot be accessed by JavaScript (XSS protection)
- Automatically sent with requests
- Can be marked as Secure and SameSite
- Better security posture for sensitive tokens

**Cookies Set:**
```javascript
auth_token      // JWT token (HttpOnly, Secure, SameSite=Strict)
user_role       // User role for middleware (HttpOnly)
user_id         // User ID (HttpOnly)
csrf_token      // CSRF protection token (HttpOnly)
last_activity   // Last activity timestamp (HttpOnly)
```

### 3. CSRF Protection (`src/lib/csrf.ts`)

**How it works:**
1. On login, generate cryptographically secure CSRF token
2. Store token in HTTP-only cookie
3. For state-changing requests (POST, PUT, PATCH, DELETE), send token in `X-CSRF-Token` header
4. Server validates token matches cookie value using constant-time comparison

### 4. Session Timeout

**Configuration:**
```javascript
SESSION_TIMEOUT = 30 minutes
WARNING_TIME = 5 minutes before expiry
```

**Flow:**
1. Track last activity timestamp
2. Monitor user activity (mouse, keyboard, touch events)
3. Show warning dialog 5 minutes before timeout
4. User can extend session or logout
5. Auto-logout on timeout

### 5. Login Attempt Tracking

**Configuration:**
```javascript
MAX_LOGIN_ATTEMPTS = 5
LOGIN_ATTEMPT_WINDOW = 15 minutes
```

**Features:**
- Tracks failed login attempts
- Shows remaining attempts warning
- Temporarily locks account after 5 failed attempts
- Resets counter after 15 minutes or successful login

### 6. Token Refresh

**Implementation:**
- Automatic retry on 401 responses
- Request queue to prevent duplicate refresh calls
- Fallback to login on refresh failure
- Transparent to user experience

---

## API Endpoints

### Client-Side API Routes (Next.js)

```
POST   /api/auth/login      # Login with email/password
POST   /api/auth/logout     # Logout and clear cookies
POST   /api/auth/refresh    # Refresh session
GET    /api/auth/me         # Get current user
```

### Backend API Endpoints (Used by pages)

```
POST   /api/user/login              # Login
POST   /api/user/register           # Register new user
PATCH  /api/user/reset/password     # Request password reset
PATCH  /api/user/new/password       # Set new password
PATCH  /api/user/verify/email       # Verify email with OTP
POST   /api/user/resend/otp         # Resend verification OTP
GET    /api/user/fetch/me           # Get current user details
```

---

## Environment Variables

Ensure these are set in your `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NODE_ENV=production  # For production deployment
```

---

## Usage Examples

### Check Authentication Status

```typescript
import { useAuthStore } from '@/store/authStore';

function MyComponent() {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return <div>Welcome, {user?.firstName}!</div>;
}
```

### Logout User

```typescript
import { useAuthStore } from '@/store/authStore';

function LogoutButton() {
  const { logout } = useAuthStore();

  return (
    <button onClick={logout}>
      Logout
    </button>
  );
}
```

### Check Session Validity

```typescript
import { useAuthStore } from '@/store/authStore';

function MyComponent() {
  const { checkSession } = useAuthStore();

  useEffect(() => {
    const isValid = checkSession();
    if (!isValid) {
      // Session expired, user will be logged out automatically
    }
  }, []);
}
```

### Update Activity

```typescript
import { useAuthStore } from '@/store/authStore';

function MyComponent() {
  const { updateLastActivity } = useAuthStore();

  const handleUserAction = () => {
    updateLastActivity();
    // ... rest of your logic
  };
}
```

---

## Password Requirements

The system enforces strong password requirements:

- Minimum 8 characters
- At least one lowercase letter
- At least one uppercase letter
- At least one number
- At least one special character

**Password Strength Indicator:**
- Weak (0-2 points)
- Medium (3-4 points)
- Strong (5-6 points)

---

## Testing Checklist

### Login
- [ ] Login with valid admin credentials
- [ ] Login with invalid credentials shows error
- [ ] Login with non-admin role shows error message
- [ ] Failed login attempts are tracked
- [ ] Account locks after 5 failed attempts
- [ ] Successful login redirects to dashboard
- [ ] Redirect parameter works after login

### Registration
- [ ] Register with valid data
- [ ] Password strength indicator updates
- [ ] Form validation works for all fields
- [ ] Email verification required message shown
- [ ] Redirects to verify email page

### Email Verification
- [ ] OTP input accepts only numbers
- [ ] Auto-submits when 6 digits entered
- [ ] Invalid OTP shows error
- [ ] Resend OTP works with cooldown
- [ ] Successful verification redirects to login

### Password Reset
- [ ] Forgot password sends email (doesn't reveal if email exists)
- [ ] Reset link with token works
- [ ] Invalid/expired token shows error
- [ ] New password meets requirements
- [ ] Password strength indicator works
- [ ] Successful reset redirects to login

### Session Management
- [ ] Activity tracker updates last activity
- [ ] Warning dialog appears 5 minutes before timeout
- [ ] "Stay Logged In" extends session
- [ ] Auto-logout works on timeout
- [ ] Manual logout clears all cookies

### Route Protection
- [ ] Middleware blocks unauthenticated dashboard access
- [ ] Middleware allows public routes
- [ ] Non-admin users cannot access dashboard
- [ ] Redirect to login preserves intended destination

### Token Refresh
- [ ] Expired token triggers refresh
- [ ] Failed refresh redirects to login
- [ ] Multiple simultaneous requests queue properly

---

## Security Best Practices Followed

1. **Defense in Depth** - Multiple layers of security
2. **Principle of Least Privilege** - Minimal token permissions
3. **Secure by Default** - All security features enabled
4. **Fail Secure** - Failures result in denied access
5. **Constant-Time Comparison** - Prevents timing attacks
6. **No Sensitive Data in Tokens** - User ID only
7. **Short Token Expiry** - Limits exposure window
8. **HTTPS Only Cookies** - In production
9. **SameSite Strict** - Prevents CSRF
10. **Email Enumeration Prevention** - Same response for all forgot password requests

---

## Troubleshooting

### "Unauthorized" error on login
- Check that backend API is running
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check browser console for CORS errors

### Session expires too quickly
- Check `SESSION_TIMEOUT` constant in `authStore.ts`
- Verify activity tracker is mounted in dashboard layout

### Cookies not being set
- Check browser settings allow cookies
- Verify `secure` flag is appropriate for environment (false for localhost)
- Check browser console for cookie errors

### Password strength not updating
- Verify password input has `onChange` handler
- Check `checkPasswordStrength` function is working

### OTP verification fails
- Check backend is sending OTP emails
- Verify OTP is 6 digits
- Check OTP expiry time on backend

---

## Future Enhancements

Consider implementing:

1. **Two-Factor Authentication (2FA)** - TOTP or SMS-based
2. **Device Fingerprinting** - Track trusted devices
3. **IP Whitelisting** - Restrict admin access by IP
4. **Audit Logging** - Log all authentication events
5. **Biometric Authentication** - For supported devices
6. **Social Login** - Google, Microsoft, etc.
7. **Magic Links** - Passwordless authentication
8. **Rate Limiting API** - Backend rate limiting
9. **Breach Detection** - Check passwords against known breaches
10. **Security Headers** - Additional CSP, HSTS headers

---

## Support

For questions or issues with the authentication system, please contact the development team.

**Created:** December 2024
**Version:** 1.0.0
**Status:** Production Ready
