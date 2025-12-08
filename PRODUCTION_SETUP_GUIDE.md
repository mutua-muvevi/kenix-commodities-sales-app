# Kenix Commodities - Production Setup Guide

**Version:** 1.0.0
**Last Updated:** 2025-11-09
**Target Audience:** DevOps Engineers, System Administrators

---

## Table of Contents

1. [Overview](#overview)
2. [Required API Keys & Credentials](#required-api-keys--credentials)
3. [Production Environment Files](#production-environment-files)
4. [Security Hardening](#security-hardening)
5. [Domain & DNS Configuration](#domain--dns-configuration)
6. [SSL/TLS Certificates](#ssltls-certificates)
7. [Quick Setup Checklist](#quick-setup-checklist)

---

## Overview

This guide walks you through configuring all required API keys, credentials, and environment variables needed to run Kenix Commodities in production.

**System Components:**
- Backend API Server (Node.js/Express)
- Admin Dashboard (Next.js)
- Mobile Apps (React Native/Expo):
  - Rider App
  - Sales Agent App
  - Shop App

**Critical Services:**
- MongoDB Atlas (Database)
- M-Pesa Daraja API (Payments)
- Africa's Talking (SMS Notifications)
- Google Maps API (Mobile Apps)
- Mapbox API (Admin Dashboard)
- Google Cloud Storage (Product Images)

---

## Required API Keys & Credentials

### 1. MongoDB Atlas (Database)

**Why:** Primary database for all application data.

**Setup Steps:**

1. **Create Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for free or select paid tier based on your needs:
     - **Free Tier (M0):** Good for development/testing (512 MB storage)
     - **M10:** Recommended minimum for production (2 GB RAM, 10 GB storage) - ~$57/month
     - **M30:** For high-traffic production (8 GB RAM, 40 GB storage) - ~$240/month

2. **Create Cluster**
   - Click "Build a Database"
   - Select your cloud provider (AWS/Azure/GCP)
   - Choose region closest to your users (e.g., Africa - Cape Town, Europe - Frankfurt)
   - Select cluster tier
   - Name your cluster: `kenix-production`

3. **Configure Security**
   - **Database Access:** Create database user
     ```
     Username: kenix_prod_user
     Password: [Generate strong 32-character password]
     ```
     - Save credentials securely (use password manager)

   - **Network Access:** Add IP whitelist
     - For testing: Add your current IP
     - For production server: Add your server's static IP
     - For flexibility (less secure): Add `0.0.0.0/0` (all IPs)
     - **Recommended:** Use VPC peering for maximum security

4. **Get Connection String**
   - Click "Connect" → "Connect your application"
   - Select Driver: Node.js, Version: 4.1 or later
   - Copy connection string:
     ```
     mongodb+srv://kenix_prod_user:<password>@kenix-production.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your actual password
   - Add database name: `/kenix_production` before the `?`
   - Final format:
     ```
     mongodb+srv://kenix_prod_user:YourPassword123@kenix-production.xxxxx.mongodb.net/kenix_production?retryWrites=true&w=majority
     ```

5. **Enable Backups**
   - Go to "Backup" tab
   - Enable continuous backups (included in M10+)
   - Configure retention period: **7 days minimum**

6. **Add to Environment**
   ```env
   MONGO_URI=mongodb+srv://kenix_prod_user:YourPassword123@kenix-production.xxxxx.mongodb.net/kenix_production?retryWrites=true&w=majority
   ```

**Cost Estimate:** $57-240/month (M10-M30)

---

### 2. M-Pesa Daraja API (Critical - Payment Processing)

**Why:** Process mobile money payments from customers.

**Setup Steps:**

1. **Create Developer Account**
   - Go to https://developer.safaricom.co.ke/
   - Click "Sign Up" → Fill in details
   - Verify email address
   - Login to portal

2. **Create Application**
   - Go to "My Apps" → "Add a New App"
   - App Name: `Kenix Commodities Production`
   - Select Products:
     - ✅ M-Pesa Sandbox (for testing)
     - ✅ Lipa Na M-Pesa Online (STK Push)
     - ✅ M-Pesa Express
   - Click "Create App"

3. **Get Sandbox Credentials (Testing)**
   - Click on your app → "Keys" tab
   - Copy:
     ```
     Consumer Key: [20-character string]
     Consumer Secret: [40-character string]
     ```
   - **Test Credentials** (Sandbox):
     ```
     Business Shortcode: 174379
     Passkey: bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
     Test Phone: 254708374149
     ```

4. **Apply for Production Access**
   - Complete "Go Live" application:
     - Business registration documents
     - KRA PIN certificate
     - Paybill/Till number
     - Bank account details
   - Wait for approval (2-5 business days)
   - Once approved, you'll receive:
     - Production Consumer Key
     - Production Consumer Secret
     - Production Passkey
     - Your actual Till/Paybill number

5. **Configure Callback URL**
   - In Daraja Portal → Your App → Settings
   - Set Callback URL:
     ```
     https://api.kenixcommodities.com/api/payments/mpesa/callback
     ```
   - Set Timeout URL (optional):
     ```
     https://api.kenixcommodities.com/api/payments/mpesa/timeout
     ```

6. **Add to Environment**

   **Sandbox (Testing):**
   ```env
   MPESA_CONSUMER_KEY=sandbox_consumer_key_here
   MPESA_CONSUMER_SECRET=sandbox_consumer_secret_here
   MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
   MPESA_SHORTCODE=174379
   MPESA_CALLBACK_URL=https://api.kenixcommodities.com/api/payments/mpesa/callback
   MPESA_ENVIRONMENT=sandbox
   ```

   **Production (Live):**
   ```env
   MPESA_CONSUMER_KEY=production_consumer_key_here
   MPESA_CONSUMER_SECRET=production_consumer_secret_here
   MPESA_PASSKEY=production_passkey_from_safaricom
   MPESA_SHORTCODE=your_till_or_paybill_number
   MPESA_CALLBACK_URL=https://api.kenixcommodities.com/api/payments/mpesa/callback
   MPESA_ENVIRONMENT=production
   ```

**Important Notes:**
- Start with sandbox for testing
- Never commit these credentials to Git
- Store in environment variables only
- M-Pesa charges: 1-4% transaction fee (varies by agreement)

**Cost:** Transaction fees only (no API fees)

---

### 3. Africa's Talking (SMS Notifications)

**Why:** Send SMS notifications for orders, deliveries, OTPs.

**Setup Steps:**

1. **Create Account**
   - Go to https://africastalking.com/
   - Click "Get Started" → Sign up
   - Verify email

2. **Sandbox Testing (Free)**
   - Login → Dashboard
   - You're automatically in sandbox mode
   - Free credits: 50 SMS for testing
   - Test phone numbers: Use your actual number prefixed with country code
   - Example: `+254712345678` (Kenya)

3. **Go Live (Production)**
   - Click "Go Live" button
   - Complete verification:
     - Business details
     - ID/Passport copy
     - Business registration (if applicable)
   - Wait for approval (1-2 days)

4. **Top Up Account**
   - Go to "Billing" → "Add Credits"
   - Minimum: $5 USD
   - Payment methods: M-Pesa, Credit Card, Bank Transfer
   - SMS rates:
     - Kenya: ~$0.01 per SMS
     - Other countries: $0.02-0.08 per SMS

5. **Get API Key**
   - Dashboard → "Account" → "API Key"
   - Click "Generate" if not visible
   - Copy API Key (40-character string)

6. **Get Username**
   - Usually your account username or "sandbox" for testing
   - Production: Usually your registered business name (lowercase, no spaces)
   - Example: `kenixcommodities`

7. **Register Sender ID**
   - Go to "SMS" → "Sender ID"
   - Request Sender ID: `KENIX` (11 characters max, alphanumeric)
   - Provide justification
   - Wait for approval (1-3 days)
   - Once approved, SMS will show "From: KENIX"

8. **Add to Environment**

   **Sandbox:**
   ```env
   AFRICASTALKING_API_KEY=sandbox_api_key_here
   AFRICASTALKING_USERNAME=sandbox
   AFRICASTALKING_SENDER_ID=AFRICASTLKNG
   ```

   **Production:**
   ```env
   AFRICASTALKING_API_KEY=your_production_api_key
   AFRICASTALKING_USERNAME=kenixcommodities
   AFRICASTALKING_SENDER_ID=KENIX
   ```

**Cost Estimate:**
- $0.01 per SMS × estimated 1000 SMS/month = **$10/month**
- Prepaid model (top up as needed)

---

### 4. Google Maps API (Mobile Apps)

**Why:** Maps, navigation, location services for Rider, Shop, and Sales Agent apps.

**Setup Steps:**

1. **Create Google Cloud Project**
   - Go to https://console.cloud.google.com/
   - Sign in with Google account
   - Click "Select a project" → "New Project"
   - Project name: `Kenix Commodities`
   - Organization: (leave blank if personal)
   - Click "Create"

2. **Enable Billing**
   - Go to "Billing" in left menu
   - Link a billing account (required for production)
   - Add credit card
   - **Note:** Google provides $200 free credit per month
   - Maps API is free up to certain limits

3. **Enable Required APIs**
   - Go to "APIs & Services" → "Library"
   - Search and enable each:
     - ✅ **Maps SDK for Android** (required)
     - ✅ **Maps SDK for iOS** (required)
     - ✅ **Places API** (for address autocomplete)
     - ✅ **Directions API** (for route navigation)
     - ✅ **Distance Matrix API** (for delivery distance calculation)
     - ✅ **Geocoding API** (for address coordinates)
     - ✅ **Geolocation API** (for GPS positioning)

4. **Create API Key**
   - Go to "APIs & Services" → "Credentials"
   - Click "+ CREATE CREDENTIALS" → "API key"
   - API key will be generated (40-character string)
   - Copy and save immediately

5. **Restrict API Key (Critical for Security)**

   **Option A: Application Restrictions (Recommended)**
   - Click on the API key you just created
   - Under "Application restrictions":
     - Select "Android apps"
     - Click "+ Add an item"
     - Add package names:
       ```
       com.kenix.rider
       com.kenix.salesagent
       com.kenix.shop
       ```
     - Get SHA-1 certificate fingerprint:
       ```bash
       # For debug builds
       keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

       # For release builds (use your actual keystore)
       keytool -list -v -keystore /path/to/release.keystore -alias your-key-alias
       ```
     - Copy SHA-1 fingerprint and add to each package

   **Option B: API Restrictions (Additional Layer)**
   - Under "API restrictions":
     - Select "Restrict key"
     - Select the APIs you enabled above

   **Option C: HTTP Referrer (For Web Dashboard - Separate Key)**
   - If using maps in web dashboard, create separate key
   - Set referrer: `https://dashboard.kenixcommodities.com/*`

6. **Set Usage Limits (Prevent Bill Shock)**
   - Go to "APIs & Services" → "Quotas"
   - For each API, set daily quota:
     - Maps SDK for Android: 25,000 requests/day
     - Directions API: 10,000 requests/day
     - Distance Matrix: 10,000 requests/day
     - Geocoding: 10,000 requests/day
   - Set up billing alerts:
     - Go to "Billing" → "Budgets & alerts"
     - Create budget: $50/month
     - Set alert at 50%, 90%, 100%

7. **Add to Mobile Apps**

   Edit each app.json file:

   **apps/rider/app.json:**
   ```json
   {
     "expo": {
       "android": {
         "config": {
           "googleMaps": {
             "apiKey": "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
           }
         }
       },
       "ios": {
         "config": {
           "googleMapsApiKey": "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
         }
       }
     }
   }
   ```

   **apps/sales-agent/app.json:** (Same format)

   **apps/shop/app.json:** (Same format)

**Cost Estimate:**
- $200 free credit/month covers most small-medium businesses
- After free tier: ~$0.005-0.02 per request (varies by API)
- Typical usage: $0-50/month

---

### 5. Mapbox API (Admin Dashboard)

**Why:** Interactive maps in the admin dashboard for tracking deliveries.

**Setup Steps:**

1. **Create Account**
   - Go to https://account.mapbox.com/
   - Sign up with email or GitHub
   - Verify email

2. **Get Access Token**
   - Login → Dashboard
   - You'll see a "Default public token" (starts with `pk.`)
   - This token is safe to expose in client-side code
   - Copy the token

3. **Create Production Token (Optional)**
   - Go to "Access tokens" page
   - Click "Create a token"
   - Token name: `Kenix Admin Dashboard Production`
   - Select scopes:
     - ✅ styles:read
     - ✅ fonts:read
     - ✅ datasets:read
     - ✅ vision:read (if using premium features)
   - URL restrictions (optional but recommended):
     - Add: `https://dashboard.kenixcommodities.com/*`
   - Click "Create token"
   - Copy token (starts with `pk.`)

4. **Add to Admin Dashboard**

   **web/.env.local (Development):**
   ```env
   NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoiZGV2dXNlciIsImEiOiJjbHh4eHh4eHgifQ.xxxxxxxxxxxxxxxxxxx
   ```

   **web/.env.production (Production):**
   ```env
   NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoicHJvZHVzZXIiLCJhIjoiY2x4eHh4eHh4In0.xxxxxxxxxxxxxxxxxxx
   ```

5. **Set Usage Limits**
   - Free tier: 50,000 map loads/month
   - After free tier: $0.50 per 1,000 loads
   - Set up billing alerts in dashboard

**Cost Estimate:** $0/month (free tier sufficient for most use cases)

---

### 6. Google Cloud Storage (Product Images)

**Why:** Store and serve product images, delivery photos.

**Setup Steps:**

1. **Use Existing Google Cloud Project**
   - Use the same project created for Google Maps API
   - Or create new project: `Kenix Storage`

2. **Enable Cloud Storage API**
   - Go to "APIs & Services" → "Library"
   - Search: "Cloud Storage API"
   - Click "Enable"

3. **Create Storage Bucket**
   - Go to "Cloud Storage" → "Buckets"
   - Click "CREATE BUCKET"
   - Name: `kenix-products-production` (globally unique)
   - Location type: "Region"
   - Location: Choose closest to your users (e.g., `africa-south1` for South Africa)
   - Storage class: "Standard"
   - Access control: "Uniform"
   - Protection tools: Enable "Object versioning" (optional)
   - Click "Create"

4. **Set Bucket Permissions**
   - Click on your bucket
   - Go to "Permissions" tab
   - Click "+ GRANT ACCESS"
   - Add principals:
     - `allUsers` → Role: "Storage Object Viewer" (for public read access)
   - This makes all images publicly accessible via URL

5. **Create Service Account**
   - Go to "IAM & Admin" → "Service Accounts"
   - Click "+ CREATE SERVICE ACCOUNT"
   - Name: `kenix-backend-storage`
   - Description: "Backend API access to Cloud Storage"
   - Click "Create and Continue"
   - Grant role: "Storage Admin" (or "Storage Object Admin" for less privilege)
   - Click "Continue" → "Done"

6. **Generate JSON Key**
   - Click on the service account you just created
   - Go to "Keys" tab
   - Click "ADD KEY" → "Create new key"
   - Key type: JSON
   - Click "Create"
   - JSON file will download automatically
   - **Save this file securely** (do NOT commit to Git)
   - Rename file: `kenix-gcp-production-key.json`

7. **Upload Key to Server**
   - Copy JSON key to your production server:
     ```bash
     # Via SCP
     scp kenix-gcp-production-key.json user@your-server:/var/www/kenix-commodities/server/config/

     # Set permissions
     chmod 600 /var/www/kenix-commodities/server/config/kenix-gcp-production-key.json
     ```

8. **Add to Environment**
   ```env
   GCP_PROJECT_ID=kenix-commodities
   GCP_BUCKET_NAME=kenix-products-production
   GCP_KEY_FILE=/var/www/kenix-commodities/server/config/kenix-gcp-production-key.json
   ```

9. **Configure CORS (if accessing from browser)**

   Create `cors.json`:
   ```json
   [
     {
       "origin": ["https://dashboard.kenixcommodities.com"],
       "method": ["GET", "HEAD"],
       "responseHeader": ["Content-Type"],
       "maxAgeSeconds": 3600
     }
   ]
   ```

   Apply CORS:
   ```bash
   gsutil cors set cors.json gs://kenix-products-production
   ```

**Cost Estimate:**
- Storage: $0.020 per GB/month (Standard class, Africa region)
- Network egress: $0.12 per GB (to internet)
- Operations: $0.05 per 10,000 operations
- Typical usage: **$5-20/month** (depends on image volume)

---

### 7. Email Service (SparkPost / SendGrid)

**Why:** Send transactional emails (order confirmations, password resets).

**Current Setup:** You're using SparkPost API key in config.env

**Verify/Update:**

1. **Login to SparkPost**
   - Go to https://app.sparkpost.com/
   - Login with credentials

2. **Verify API Key**
   - Go to "Account" → "API Keys"
   - Check if key `ac51eaa1199346bf64308e7d2b15c280cfc635d9` is active
   - If not, create new key with permissions:
     - ✅ Transmissions: Read/Write
     - ✅ Templates: Read/Write

3. **Verify Sending Domain**
   - Go to "Account" → "Sending Domains"
   - Ensure `mails.afrigorithm.com` is verified
   - If using new domain, add and verify:
     - Add domain: `mails.kenixcommodities.com`
     - Add DNS records (SPF, DKIM, CNAME)
     - Wait for verification

4. **Add to Environment**
   ```env
   SEND_EMAIL_FROM=info@mails.kenixcommodities.com
   SEND_EMAIL_API_KEY=ac51eaa1199346bf64308e7d2b15c280cfc635d9
   OUR_CONTACT_EMAIL=kenixcommodities@gmail.com
   ```

**Cost:** $20/month (15,000 emails free, then $0.20 per 1,000 emails)

---

## Production Environment Files

### Server Environment (server/config.env.production)

Create this file with production values:

```env
# ============================================
# KENIX COMMODITIES - PRODUCTION CONFIGURATION
# ============================================
# IMPORTANT: Never commit this file to version control
# Store securely and use environment-specific configs

# -----------------
# Server Configuration
# -----------------
NODE_ENV=production
PORT=3001
RESTART_DELAY=1000

# -----------------
# Client URLs
# -----------------
CLIENT_URL=https://dashboard.kenixcommodities.com

# -----------------
# Database
# -----------------
MONGO_URI=mongodb+srv://kenix_prod_user:STRONG_PASSWORD_HERE@kenix-production.xxxxx.mongodb.net/kenix_production?retryWrites=true&w=majority

# -----------------
# JWT Secrets (CHANGE THESE!)
# -----------------
# Generate using: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_ACCESS_SECRET=CHANGE_TO_RANDOM_64_CHAR_STRING_PRODUCTION_1234567890abcdef
JWT_EXPIRY=1h

JWT_REFRESH_SECRET=CHANGE_TO_DIFFERENT_RANDOM_64_CHAR_STRING_PRODUCTION_fedcba0987654321
JWT_REFRESH_EXPIRY=30d

USER_TOKEN_EXPIRY=1d

# -----------------
# Google Cloud Platform
# -----------------
GCP_PROJECT_ID=kenix-commodities
GCP_BUCKET_NAME=kenix-products-production
GCP_KEY_FILE=/var/www/kenix-commodities/server/config/kenix-gcp-production-key.json

# -----------------
# Email Service (SparkPost)
# -----------------
SEND_EMAIL_FROM=info@mails.kenixcommodities.com
SEND_EMAIL_API_KEY=your_sparkpost_production_api_key
OUR_CONTACT_EMAIL=kenixcommodities@gmail.com

# -----------------
# M-Pesa Payment Gateway
# -----------------
MPESA_CONSUMER_KEY=your_production_consumer_key
MPESA_CONSUMER_SECRET=your_production_consumer_secret
MPESA_PASSKEY=your_production_passkey_from_safaricom
MPESA_SHORTCODE=your_till_or_paybill_number
MPESA_CALLBACK_URL=https://api.kenixcommodities.com/api/payments/mpesa/callback
MPESA_TIMEOUT_URL=https://api.kenixcommodities.com/api/payments/mpesa/timeout
MPESA_ENVIRONMENT=production

# -----------------
# Africa's Talking SMS
# -----------------
AFRICASTALKING_API_KEY=your_production_api_key
AFRICASTALKING_USERNAME=kenixcommodities
AFRICASTALKING_SENDER_ID=KENIX

# -----------------
# Notifications
# -----------------
MAX_NOTIFICATIONS_BEFORE_CLEANUP=10000
NOTIFICATION_RETENTION_DAYS=30

# -----------------
# Security Settings
# -----------------
HELMET_ENABLED=true
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
CORS_ORIGIN=https://dashboard.kenixcommodities.com

# -----------------
# Logging
# -----------------
LOG_LEVEL=error
LOG_TO_MONGODB=true
LOG_RETENTION_DAYS=90

# -----------------
# Session Configuration
# -----------------
SESSION_SECRET=CHANGE_TO_RANDOM_64_CHAR_STRING_SESSION_SECRET
COOKIE_SECURE=true
COOKIE_HTTP_ONLY=true
COOKIE_SAME_SITE=strict

# -----------------
# Performance
# -----------------
REDIS_URL=redis://localhost:6379
CACHE_TTL=3600
```

### Admin Dashboard Environment (web/.env.production)

```env
# ============================================
# ADMIN DASHBOARD - PRODUCTION
# ============================================

# API Configuration
NEXT_PUBLIC_API_URL=https://api.kenixcommodities.com/api
NEXT_PUBLIC_WS_URL=https://api.kenixcommodities.com

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_production_mapbox_token_here

# Google Cloud Storage
NEXT_PUBLIC_GCP_BUCKET_NAME=kenix-products-production
NEXT_PUBLIC_GCP_BUCKET_URL=https://storage.googleapis.com/kenix-products-production

# Application Settings
NEXT_PUBLIC_APP_NAME=Kenix Commodities Admin
NEXT_PUBLIC_APP_VERSION=1.0.0

# Analytics (Optional)
NEXT_PUBLIC_GA_TRACKING_ID=G-XXXXXXXXXX
```

### Mobile Apps Environment (apps/rider/.env.production)

**Same for rider, sales-agent, and shop apps:**

```env
# ============================================
# MOBILE APP - PRODUCTION
# ============================================

# API Configuration
EXPO_PUBLIC_API_URL=https://api.kenixcommodities.com/api
EXPO_PUBLIC_WS_URL=https://api.kenixcommodities.com

# Google Cloud Storage
EXPO_PUBLIC_GCP_BUCKET_URL=https://storage.googleapis.com/kenix-products-production

# App Configuration
EXPO_PUBLIC_APP_VERSION=1.0.0
EXPO_PUBLIC_ENVIRONMENT=production
```

---

## Security Hardening

### Critical Security Checklist

**Before deploying to production, complete ALL items:**

#### Server Security

- [ ] **Change all default secrets**
  ```bash
  # Generate strong JWT secrets
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```
  - Replace `JWT_ACCESS_SECRET`
  - Replace `JWT_REFRESH_SECRET`
  - Replace `SESSION_SECRET`

- [ ] **Enable HTTPS/SSL**
  - Use Let's Encrypt (free) or Cloudflare
  - Force HTTPS redirects in Nginx
  - Set `COOKIE_SECURE=true`

- [ ] **Configure CORS strictly**
  ```javascript
  // Only allow your domains
  CORS_ORIGIN=https://dashboard.kenixcommodities.com
  ```

- [ ] **Enable rate limiting**
  - Current: 100 requests per 15 minutes
  - Adjust based on load testing

- [ ] **Disable error stack traces**
  ```javascript
  // In production, never expose stack traces
  app.use((err, req, res, next) => {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      // NO stack trace in production
    });
  });
  ```

- [ ] **Enable MongoDB authentication**
  - Already done with Atlas
  - Ensure strong password (20+ characters)

- [ ] **Use environment variables for ALL secrets**
  - Never hardcode API keys
  - Use `.env` files (not committed to Git)
  - Add to `.gitignore`:
    ```
    config.env
    config.env.production
    .env.local
    .env.production
    *.json (for GCP keys)
    ```

- [ ] **Set up firewall rules**
  - Allow only: 22 (SSH), 80 (HTTP), 443 (HTTPS), 3001 (API)
  - Block all other ports
  - Use UFW (Ubuntu) or AWS Security Groups

- [ ] **Enable MongoDB IP whitelist**
  - In Atlas: Network Access
  - Add only your server's static IP
  - Remove `0.0.0.0/0` if present

- [ ] **Set up DDoS protection**
  - Use Cloudflare (free tier sufficient)
  - Enable "Under Attack Mode" if needed

- [ ] **Implement request logging**
  - Use Morgan middleware (already integrated)
  - Log to file and MongoDB
  - Rotate logs daily

- [ ] **Regular security updates**
  ```bash
  # Check for vulnerabilities
  npm audit

  # Fix automatically
  npm audit fix

  # Fix with breaking changes (test first)
  npm audit fix --force
  ```

#### Application Security

- [ ] **Validate all user inputs**
  - Already implemented with express-validator
  - Review all endpoints for validation

- [ ] **Sanitize database queries**
  - Already done with mongo-sanitize
  - Prevents NoSQL injection

- [ ] **Implement CSP headers**
  - Already done with Helmet middleware
  - Review CSP policy for your domains

- [ ] **Use prepared statements**
  - Already done with Mongoose
  - Never concatenate user input into queries

- [ ] **Encrypt sensitive data at rest**
  - Passwords: bcrypt (already implemented)
  - Consider encrypting PII (phone numbers, addresses)

- [ ] **Use HTTPS for all API calls**
  - Mobile apps: Update API_URL to `https://`
  - Admin dashboard: Update API_URL to `https://`

- [ ] **Implement rate limiting per user**
  - Prevent abuse from individual accounts
  - Add IP-based + user-based limits

- [ ] **Add CAPTCHA for critical endpoints (Optional)**
  - Registration
  - Login
  - Password reset

- [ ] **Set up 2FA for admin accounts (Optional)**
  - Use Google Authenticator
  - Require for super admin role

#### Database Security

- [ ] **Enable MongoDB authentication**
  - Done via Atlas
  - Use strong passwords

- [ ] **Enable encryption at rest**
  - Enabled by default in Atlas M10+
  - Verify in cluster settings

- [ ] **Enable encryption in transit**
  - Use SSL in connection string (already included)
  - Verify connection uses TLS 1.2+

- [ ] **Set up automated backups**
  - Configure in Atlas (see BACKUP_RECOVERY.md)
  - Daily backups, 7-day retention minimum

- [ ] **Enable point-in-time recovery**
  - Available in Atlas M10+
  - Recover to any point in last 7 days

- [ ] **Separate environments**
  - Development: `kenix_development`
  - Staging: `kenix_staging`
  - Production: `kenix_production`

- [ ] **Monitor for unusual queries**
  - Use Atlas Performance Advisor
  - Set up alerts for slow queries (>1s)

#### API Key Security

- [ ] **Google Maps API key restricted**
  - Application restrictions: Package names + SHA-1
  - API restrictions: Only enabled APIs
  - Usage limits: 25,000 requests/day

- [ ] **M-Pesa credentials secured**
  - Stored in environment variables only
  - Use production credentials (not sandbox)
  - Rotate credentials every 90 days

- [ ] **Africa's Talking API key secured**
  - Never expose in client-side code
  - Use backend proxy for SMS sending

- [ ] **GCP service account key secured**
  - File permissions: 600 (read only by owner)
  - Not committed to Git
  - Rotate key every 90 days

---

## Domain & DNS Configuration

### Required Domains

You'll need 2 domains (or subdomains):

1. **API Server:** `api.kenixcommodities.com`
2. **Admin Dashboard:** `dashboard.kenixcommodities.com`

### DNS Configuration

**Assuming you own `kenixcommodities.com`:**

1. **API Server (A Record)**
   - Login to your domain registrar (e.g., Namecheap, GoDaddy)
   - Go to DNS management
   - Add A record:
     ```
     Type: A
     Host: api
     Value: [Your server IP address]
     TTL: 300 (5 minutes)
     ```

2. **Admin Dashboard (CNAME Record)**
   - If deploying to Vercel:
     ```
     Type: CNAME
     Host: dashboard
     Value: cname.vercel-dns.com
     TTL: 300
     ```
   - Vercel will handle the rest

3. **Root Domain (Optional)**
   - Redirect `kenixcommodities.com` → `dashboard.kenixcommodities.com`
   - Add A record for root:
     ```
     Type: A
     Host: @
     Value: [Dashboard server IP]
     TTL: 300
     ```

### Cloudflare Setup (Recommended)

**Benefits:** Free SSL, DDoS protection, CDN, caching

1. **Add Site to Cloudflare**
   - Go to https://dash.cloudflare.com/
   - Click "Add a Site"
   - Enter: `kenixcommodities.com`
   - Select Free plan
   - Click "Add Site"

2. **Update Nameservers**
   - Cloudflare will provide 2 nameservers:
     ```
     ns1.cloudflare.com
     ns2.cloudflare.com
     ```
   - Login to your domain registrar
   - Replace existing nameservers with Cloudflare's
   - Wait 24-48 hours for propagation

3. **Configure DNS in Cloudflare**
   - Add records:
     ```
     Type: A, Name: api, Content: [Server IP], Proxy: ON (orange cloud)
     Type: CNAME, Name: dashboard, Content: cname.vercel-dns.com, Proxy: OFF (gray cloud)
     ```

4. **Enable SSL**
   - Go to SSL/TLS → Overview
   - Select "Full (strict)"
   - SSL certificates will auto-provision

5. **Configure Page Rules (Optional)**
   - Cache API responses (carefully, avoid caching dynamic data)
   - Always Use HTTPS

---

## SSL/TLS Certificates

### Option 1: Cloudflare (Easiest)

Automatic when using Cloudflare (see above).

### Option 2: Let's Encrypt (Free, Self-Managed)

**If NOT using Cloudflare:**

1. **Install Certbot**
   ```bash
   sudo apt update
   sudo apt install certbot python3-certbot-nginx
   ```

2. **Obtain Certificate**
   ```bash
   sudo certbot --nginx -d api.kenixcommodities.com
   ```

3. **Follow Prompts**
   - Enter email address
   - Agree to terms
   - Choose: Redirect HTTP to HTTPS (recommended)

4. **Auto-Renewal**
   ```bash
   # Test renewal
   sudo certbot renew --dry-run

   # Certbot auto-renews via cron job
   # Verify cron job exists:
   sudo systemctl status certbot.timer
   ```

### Option 3: Paid SSL (AWS Certificate Manager, DigiCert)

For enterprise deployments with SLA requirements.

---

## Quick Setup Checklist

**Print this and check off as you complete:**

### Pre-Production

- [ ] All API keys obtained and tested in sandbox/dev
- [ ] MongoDB Atlas cluster created and configured
- [ ] M-Pesa production credentials approved
- [ ] Africa's Talking account topped up ($50 minimum)
- [ ] Google Maps API key created and restricted
- [ ] Mapbox token created for dashboard
- [ ] GCP bucket created and service account configured
- [ ] Domains purchased and DNS configured
- [ ] SSL certificates obtained

### Environment Configuration

- [ ] `server/config.env.production` created with all production values
- [ ] `web/.env.production` created
- [ ] `apps/rider/.env.production` created
- [ ] `apps/sales-agent/.env.production` created
- [ ] `apps/shop/.env.production` created
- [ ] All JWT secrets changed from defaults
- [ ] All API keys verified working
- [ ] GCP key file uploaded to server with correct permissions

### Security

- [ ] All items in Security Hardening checklist completed
- [ ] Firewall configured
- [ ] HTTPS enforced
- [ ] MongoDB IP whitelist configured
- [ ] API keys restricted
- [ ] Rate limiting enabled
- [ ] Error logging configured (no stack traces in production)

### Testing

- [ ] All endpoints tested in staging environment
- [ ] M-Pesa payment flow tested end-to-end
- [ ] SMS notifications received
- [ ] Mobile apps can connect to production API
- [ ] Admin dashboard loads and authenticates
- [ ] WebSocket connections stable
- [ ] Load testing completed (see TESTING_GUIDE.md)

### Monitoring

- [ ] Error tracking configured (Sentry)
- [ ] Uptime monitoring configured (UptimeRobot)
- [ ] Database monitoring enabled (Atlas)
- [ ] Log management configured
- [ ] Billing alerts set up for all paid services

### Backups

- [ ] MongoDB automated backups enabled
- [ ] Backup restoration tested
- [ ] Disaster recovery plan documented

---

## Next Steps

Once all setup is complete:

1. **Review DEPLOYMENT_GUIDE.md** for deployment instructions
2. **Review SECURITY_CHECKLIST.md** for final security audit
3. **Review TESTING_GUIDE.md** for comprehensive testing
4. **Review MONITORING_GUIDE.md** for post-deployment monitoring

---

## Support & Troubleshooting

### Common Issues

**Issue:** MongoDB connection refused
- Check IP whitelist in Atlas
- Verify connection string format
- Ensure server has internet access

**Issue:** M-Pesa callback not received
- Verify callback URL is publicly accessible (not localhost)
- Check firewall allows incoming requests on port 80/443
- Verify callback URL matches Daraja portal settings
- Check server logs for incoming requests

**Issue:** Google Maps not loading in mobile app
- Verify API key is correct in app.json
- Check SHA-1 fingerprint matches (Android)
- Ensure Maps SDK for Android/iOS are enabled
- Check API key restrictions

**Issue:** Images not uploading to GCP
- Verify service account key file path
- Check file permissions (600)
- Ensure bucket name is correct
- Verify bucket is publicly accessible

### Contact Information

**Technical Support:**
- Email: kenixcommodities@gmail.com
- Emergency: [Add phone number]

**Service Providers:**
- MongoDB Atlas: https://support.mongodb.com/
- Safaricom Daraja: developer@safaricom.co.ke
- Africa's Talking: support@africastalking.com
- Google Cloud: https://cloud.google.com/support
- Mapbox: https://support.mapbox.com/

---

**Document Version:** 1.0.0
**Last Updated:** 2025-11-09
**Next Review:** 2025-12-09
