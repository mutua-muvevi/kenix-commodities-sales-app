# Kenix Commodities - Production Security Checklist

**Version:** 1.0.0
**Last Updated:** 2025-11-09
**Security Standard:** OWASP Top 10 Compliance

---

## Table of Contents

1. [Overview](#overview)
2. [Critical Security Checklist](#critical-security-checklist)
3. [Authentication & Authorization](#authentication--authorization)
4. [Data Protection](#data-protection)
5. [Network Security](#network-security)
6. [Application Security](#application-security)
7. [Infrastructure Security](#infrastructure-security)
8. [API Security](#api-security)
9. [Mobile App Security](#mobile-app-security)
10. [Compliance & Privacy](#compliance--privacy)
11. [Security Monitoring](#security-monitoring)
12. [Incident Response Plan](#incident-response-plan)

---

## Overview

This comprehensive security checklist ensures Kenix Commodities meets industry security standards before production launch.

**Security Priorities:**
1. Protect user data (PII, payment information)
2. Prevent unauthorized access
3. Ensure service availability
4. Maintain data integrity
5. Comply with regulations (GDPR, PCI-DSS if applicable)

**OWASP Top 10 (2021):**
1. Broken Access Control
2. Cryptographic Failures
3. Injection
4. Insecure Design
5. Security Misconfiguration
6. Vulnerable Components
7. Authentication Failures
8. Software and Data Integrity Failures
9. Security Logging Failures
10. Server-Side Request Forgery (SSRF)

---

## Critical Security Checklist

**Complete ALL items before production launch:**

### Pre-Launch Security Audit

- [ ] All default passwords changed
- [ ] All API keys secured in environment variables
- [ ] HTTPS enforced on all domains
- [ ] Database authentication enabled
- [ ] Firewall configured
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] SQL/NoSQL injection prevention verified
- [ ] XSS prevention verified
- [ ] CSRF protection enabled (if using cookies)
- [ ] Security headers configured (Helmet.js)
- [ ] Dependency vulnerabilities resolved
- [ ] Secrets not committed to Git
- [ ] Error messages don't expose sensitive info
- [ ] Logging configured (no sensitive data logged)
- [ ] Backup encryption enabled
- [ ] SSL certificates valid
- [ ] Security monitoring enabled
- [ ] Incident response plan documented

---

## Authentication & Authorization

### 1. Password Security

**Requirements:**

- [ ] **Minimum Password Strength Enforced**
  ```javascript
  // Already implemented in backend
  // Verify: Password must be 8+ chars, uppercase, lowercase, number

  // Test:
  curl -X POST https://api.kenixcommodities.com/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"weak"}'

  // Should reject: 400 Bad Request
  ```

- [ ] **Passwords Hashed with bcrypt**
  ```javascript
  // Verify in code: server/models/User.js
  const hashedPassword = await bcrypt.hash(password, 12);  // Salt rounds: 12+

  // Test: Check database
  mongo "your_mongo_uri"
  db.users.findOne({email:"test@example.com"})
  // password field should be: $2b$12$... (bcrypt hash)
  ```

- [ ] **No Password in Logs/Responses**
  ```javascript
  // Verify User model excludes password
  userSchema.methods.toJSON = function() {
    const obj = this.toObject();
    delete obj.password;
    return obj;
  };
  ```

- [ ] **Password Reset Secure**
  - Tokens expire after 1 hour
  - Token usable only once
  - Token cryptographically random
  - Sent via email (not SMS for security)

**Test:**
```bash
# Weak password rejected
curl -X POST .../api/auth/register -d '{"password":"123"}'
# Expected: 400 Bad Request

# Strong password accepted
curl -X POST .../api/auth/register -d '{"password":"Test123!Pass"}'
# Expected: 201 Created
```

---

### 2. JWT Token Security

- [ ] **Tokens Signed with Strong Secret**
  ```bash
  # Verify JWT secret is 64+ characters
  cat server/config.env | grep JWT_ACCESS_SECRET
  # Should be: random 64-char hex string

  # Generate new secret:
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```

- [ ] **Access Token Expires (Short)**
  ```javascript
  // Verify: JWT_EXPIRY=1h or less
  // Test: Token should expire after 1 hour
  ```

- [ ] **Refresh Token Expires**
  ```javascript
  // Verify: JWT_REFRESH_EXPIRY=30d (or less)
  ```

- [ ] **Token in Authorization Header (not URL)**
  ```javascript
  // GOOD: Authorization: Bearer <token>
  // BAD: ?token=<token> (logged in server access logs)
  ```

- [ ] **Token Validation on Every Request**
  ```javascript
  // Verify middleware checks token expiry, signature
  ```

**Test:**
```bash
# Expired token rejected
curl https://api.kenixcommodities.com/api/users/me \
  -H "Authorization: Bearer <expired_token>"
# Expected: 401 Unauthorized

# Invalid token rejected
curl https://api.kenixcommodities.com/api/users/me \
  -H "Authorization: Bearer invalidtoken123"
# Expected: 401 Unauthorized
```

---

### 3. Role-Based Access Control (RBAC)

- [ ] **Roles Defined and Enforced**
  - Admin: Full access
  - Shop: Own orders only
  - Rider: Assigned deliveries only
  - Sales Agent: Assigned shops only

- [ ] **Permission Checks on All Endpoints**
  ```javascript
  // Example: Only admin can create products
  app.post('/api/products',
    authMiddleware,  // Verify user logged in
    roleMiddleware(['admin']),  // Verify user is admin
    productController.createProduct
  );
  ```

**Test:**
```bash
# Shop owner tries to create product (should fail)
curl -X POST https://api.kenixcommodities.com/api/products \
  -H "Authorization: Bearer <shop_token>" \
  -d '{"name":"Unauthorized Product"}'
# Expected: 403 Forbidden

# Admin can create product (should succeed)
curl -X POST https://api.kenixcommodities.com/api/products \
  -H "Authorization: Bearer <admin_token>" \
  -d '{"name":"Authorized Product"}'
# Expected: 201 Created
```

- [ ] **User Can Only Access Own Data**
  ```javascript
  // Shop owner can only see their orders
  // Test:
  curl https://api.kenixcommodities.com/api/orders \
    -H "Authorization: Bearer <shop1_token>"
  // Should only return shop1's orders, not shop2's
  ```

---

### 4. Multi-Factor Authentication (Optional, Recommended for Admins)

- [ ] **2FA Enabled for Admin Accounts**
  - Use Google Authenticator or SMS
  - Required for super admin role
  - Optional for regular admins

**Implementation (if not done):**

```bash
npm install speakeasy qrcode --save
```

```javascript
const speakeasy = require('speakeasy');

// Generate secret for user
const secret = speakeasy.generateSecret({ name: 'Kenix Admin' });

// Verify code
const verified = speakeasy.totp.verify({
  secret: user.twoFactorSecret,
  encoding: 'base32',
  token: req.body.code
});
```

---

## Data Protection

### 1. Data Encryption

- [ ] **Data in Transit Encrypted (HTTPS)**
  ```bash
  # Test all endpoints use HTTPS
  curl -I http://api.kenixcommodities.com
  # Should redirect to https://

  curl -I https://api.kenixcommodities.com
  # Should return: 200 OK
  ```

- [ ] **Data at Rest Encrypted**
  - MongoDB Atlas: Encryption enabled by default (M10+)
  - GCP Storage: Server-side encryption enabled
  - Verify:
    ```bash
    # MongoDB Atlas: Cluster → Security → Encryption at Rest (should show enabled)

    # GCP:
    gsutil encryption get gs://kenix-products-production
    # Should show: Google-managed encryption
    ```

- [ ] **Sensitive Fields Encrypted in Database (Optional)**
  ```javascript
  // For PII (phone numbers, addresses), consider field-level encryption
  // Example with crypto:
  const crypto = require('crypto');

  function encrypt(text) {
    const cipher = crypto.createCipher('aes-256-cbc', process.env.ENCRYPTION_KEY);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }
  ```

- [ ] **Backup Files Encrypted**
  - See BACKUP_RECOVERY.md
  - Config backups encrypted with AES-256

---

### 2. Personal Data Protection

- [ ] **Minimal Data Collection**
  - Only collect necessary data
  - No excessive PII storage

- [ ] **Data Retention Policy**
  - Delete old data per policy
  - User can request data deletion (GDPR right to be forgotten)

- [ ] **Audit Logs for Data Access**
  ```javascript
  // Log when PII accessed
  auditLog.create({
    user: req.user._id,
    action: 'viewed_user_details',
    targetUser: userId,
    timestamp: new Date()
  });
  ```

---

### 3. Payment Data Security

- [ ] **PCI-DSS Compliance (if storing card data)**
  - **Recommendation:** Don't store card data
  - Use M-Pesa (no card storage needed)
  - If storing: Use PCI-compliant provider

- [ ] **M-Pesa API Keys Secured**
  - Stored in environment variables only
  - Not committed to Git
  - Rotated every 90 days

- [ ] **Payment Callbacks Verified**
  ```javascript
  // Verify M-Pesa callback authenticity
  // Check source IP (Safaricom IPs only)
  const safaricomIPs = ['196.201.214.0/24', '196.201.213.0/24'];

  app.post('/api/payments/mpesa/callback', (req, res) => {
    const clientIP = req.ip;
    if (!safaricomIPs.includes(clientIP)) {
      return res.status(403).send('Forbidden');
    }
    // Process callback
  });
  ```

---

## Network Security

### 1. HTTPS/SSL Configuration

- [ ] **SSL Certificate Valid**
  ```bash
  # Check expiry
  echo | openssl s_client -servername api.kenixcommodities.com -connect api.kenixcommodities.com:443 2>/dev/null | openssl x509 -noout -dates
  # Should show valid dates (not expired)
  ```

- [ ] **TLS 1.2+ Only (No TLS 1.0/1.1)**
  ```bash
  # Test SSL configuration
  nmap --script ssl-enum-ciphers -p 443 api.kenixcommodities.com
  # Should only show TLSv1.2, TLSv1.3
  ```

- [ ] **Strong Cipher Suites**
  - Use Mozilla SSL Configuration Generator
  - https://ssl-config.mozilla.org/

- [ ] **HTTP Strict Transport Security (HSTS)**
  ```nginx
  # In Nginx config
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
  ```

- [ ] **SSL/TLS Grade A or A+**
  - Test: https://www.ssllabs.com/ssltest/
  - Enter: api.kenixcommodities.com
  - Should score A or A+

---

### 2. Firewall Configuration

- [ ] **UFW Firewall Enabled (Ubuntu)**
  ```bash
  sudo ufw status
  # Should show: Status: active

  # Only ports 22, 80, 443 open
  sudo ufw status numbered
  # Should show:
  # [1] 22/tcp    ALLOW IN
  # [2] 80/tcp    ALLOW IN
  # [3] 443/tcp   ALLOW IN
  ```

- [ ] **AWS Security Groups Configured (if using AWS)**
  - Inbound: 22 (SSH from your IP only), 80, 443
  - Outbound: All (for MongoDB Atlas, GCP, etc.)

- [ ] **Database Port Not Exposed**
  - MongoDB: Not accessible from internet
  - MongoDB Atlas: IP whitelist configured

---

### 3. DDoS Protection

- [ ] **Cloudflare DDoS Protection Enabled**
  - Or AWS Shield (if using AWS)
  - Rate limiting configured

- [ ] **Rate Limiting at Application Level**
  ```javascript
  // Verify express-rate-limit configured
  // Test: Send 200 requests in 1 minute
  for i in {1..200}; do
    curl https://api.kenixcommodities.com/api/products
  done

  # After 100 requests, should return:
  # 429 Too Many Requests
  ```

---

## Application Security

### 1. Input Validation

- [ ] **All User Inputs Validated**
  ```javascript
  // Using express-validator (already implemented)
  // Verify all endpoints have validation

  // Example: Create order
  app.post('/api/orders', [
    body('items').isArray().notEmpty(),
    body('deliveryDate').isISO8601(),
    body('paymentMethod').isIn(['mpesa', 'cash'])
  ], validate, orderController.createOrder);
  ```

- [ ] **Email Format Validated**
  ```javascript
  body('email').isEmail().normalizeEmail()
  ```

- [ ] **Phone Number Format Validated**
  ```javascript
  body('phone').matches(/^\+254[17]\d{8}$/)  // Kenya format
  ```

- [ ] **SQL/NoSQL Injection Prevention**
  ```javascript
  // Using mongo-sanitize (already implemented)
  const mongoSanitize = require('express-mongo-sanitize');
  app.use(mongoSanitize());

  // Test:
  curl -X POST .../api/auth/login \
    -d '{"email":{"$gt":""},"password":{"$gt":""}}'
  # Should reject: 400 Bad Request
  ```

- [ ] **XSS Prevention**
  ```javascript
  // Using helmet and sanitization
  const xss = require('xss-clean');
  app.use(xss());

  // Test: Try creating product with script tag
  curl -X POST .../api/products \
    -d '{"name":"<script>alert(\"XSS\")</script>"}'
  # Script should be escaped/removed
  ```

---

### 2. Security Headers (Helmet.js)

- [ ] **Helmet.js Configured**
  ```javascript
  const helmet = require('helmet');
  app.use(helmet());
  ```

- [ ] **Verify Security Headers Present**
  ```bash
  curl -I https://api.kenixcommodities.com/api/products

  # Should include:
  # X-Content-Type-Options: nosniff
  # X-Frame-Options: DENY
  # X-XSS-Protection: 1; mode=block
  # Strict-Transport-Security: max-age=31536000
  # Content-Security-Policy: ...
  ```

- [ ] **Content Security Policy (CSP)**
  ```javascript
  app.use(helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://storage.googleapis.com"]
    }
  }));
  ```

---

### 3. CORS Configuration

- [ ] **CORS Restricted to Known Origins**
  ```javascript
  const cors = require('cors');

  const allowedOrigins = [
    'https://dashboard.kenixcommodities.com',
    // Add mobile app origins if needed
  ];

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  }));
  ```

- [ ] **Test CORS**
  ```bash
  # Allowed origin: Should work
  curl -H "Origin: https://dashboard.kenixcommodities.com" \
    -I https://api.kenixcommodities.com/api/products
  # Should include: Access-Control-Allow-Origin

  # Disallowed origin: Should fail
  curl -H "Origin: https://evil.com" \
    -I https://api.kenixcommodities.com/api/products
  # Should NOT include: Access-Control-Allow-Origin
  ```

---

### 4. Error Handling

- [ ] **No Stack Traces in Production**
  ```javascript
  // Error handler
  app.use((err, req, res, next) => {
    console.error(err.stack);  // Log server-side only

    res.status(err.status || 500).json({
      success: false,
      message: process.env.NODE_ENV === 'production'
        ? 'Internal server error'  // Generic message
        : err.message  // Detailed message in dev only
      // Never send: stack trace, file paths, etc.
    });
  });
  ```

- [ ] **Test Error Messages Don't Leak Info**
  ```bash
  # Trigger error
  curl https://api.kenixcommodities.com/api/products/invalid_id

  # Should return:
  # {"success":false,"message":"Product not found"}

  # Should NOT return:
  # Stack trace, file paths, database errors, etc.
  ```

---

### 5. Dependency Security

- [ ] **No Known Vulnerabilities**
  ```bash
  cd server
  npm audit

  # Should show: 0 vulnerabilities
  # If vulnerabilities found:
  npm audit fix

  # If high/critical vulnerabilities:
  npm audit fix --force  # May break things, test thoroughly
  ```

- [ ] **Dependencies Up to Date**
  ```bash
  npm outdated

  # Update all packages
  npm update

  # Test after updates!
  ```

- [ ] **Automated Security Scanning (GitHub Dependabot)**
  - Enable in GitHub: Settings → Security → Dependabot alerts

---

## Infrastructure Security

### 1. Server Hardening

- [ ] **SSH Hardened**
  ```bash
  # Disable password authentication (use keys only)
  sudo nano /etc/ssh/sshd_config
  # Set:
  PasswordAuthentication no
  PermitRootLogin no

  sudo systemctl restart sshd
  ```

- [ ] **Fail2Ban Installed**
  ```bash
  # Install fail2ban (blocks brute force attacks)
  sudo apt install fail2ban

  sudo systemctl enable fail2ban
  sudo systemctl start fail2ban

  # Check banned IPs
  sudo fail2ban-client status sshd
  ```

- [ ] **Automatic Security Updates**
  ```bash
  # Install unattended-upgrades
  sudo apt install unattended-upgrades
  sudo dpkg-reconfigure -plow unattended-upgrades
  # Select: Yes
  ```

- [ ] **No Unnecessary Services Running**
  ```bash
  sudo systemctl list-units --type=service --state=running
  # Should only show: ssh, nginx, pm2, mongodb (if local), etc.
  # Disable unnecessary services
  ```

---

### 2. Database Security

- [ ] **MongoDB Authentication Enabled**
  - Atlas: Authentication enabled by default
  - Self-hosted: Enable authentication

- [ ] **Database User Has Minimal Permissions**
  - Create read-write user (not admin)
  - Separate users for dev/staging/production

- [ ] **Database IP Whitelist Configured**
  ```bash
  # MongoDB Atlas: Network Access
  # Add only server IP (not 0.0.0.0/0)
  ```

- [ ] **Database Backups Encrypted**
  - See BACKUP_RECOVERY.md

---

### 3. Secrets Management

- [ ] **No Secrets in Git**
  ```bash
  # Check git history for secrets
  git log -p | grep -i "password\|secret\|key"

  # If secrets found, rotate them immediately!
  ```

- [ ] **.gitignore Configured**
  ```bash
  # Verify .gitignore includes:
  config.env
  .env
  .env.local
  .env.production
  *.pem
  *.key
  *.json  # GCP service account keys
  ```

- [ ] **Environment Variables Used**
  ```bash
  # All secrets in config.env, not hardcoded
  grep -r "mongodb://" server/  # Should only appear in config.env
  ```

- [ ] **Secrets Rotated Regularly**
  - JWT secrets: Every 90 days
  - API keys: Every 90 days
  - Database passwords: Every 180 days

---

## API Security

### 1. Rate Limiting

- [ ] **Global Rate Limit**
  ```javascript
  const rateLimit = require('express-rate-limit');

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 100,  // 100 requests per window
    message: 'Too many requests, please try again later'
  });

  app.use(limiter);
  ```

- [ ] **Endpoint-Specific Limits**
  ```javascript
  // Stricter limit on auth endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,  // Only 5 login attempts per 15 min
    skipSuccessfulRequests: true
  });

  app.post('/api/auth/login', authLimiter, authController.login);
  ```

- [ ] **Test Rate Limiting**
  ```bash
  # Send 101 requests
  for i in {1..101}; do
    curl https://api.kenixcommodities.com/api/products
  done

  # 101st request should return: 429 Too Many Requests
  ```

---

### 2. Request Validation

- [ ] **Request Size Limits**
  ```javascript
  app.use(express.json({ limit: '10mb' }));  // Prevent huge payloads
  ```

- [ ] **File Upload Validation**
  ```javascript
  // Multer configuration
  const upload = multer({
    limits: { fileSize: 5 * 1024 * 1024 },  // 5MB max
    fileFilter: (req, file, cb) => {
      // Only allow images
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only images allowed'));
      }
    }
  });
  ```

---

### 3. API Versioning

- [ ] **API Versioned**
  ```javascript
  // All routes under /api/v1/
  app.use('/api/v1', routes);

  // Allows backward compatibility when making breaking changes
  ```

---

## Mobile App Security

### 1. API Communication

- [ ] **HTTPS Only**
  ```javascript
  // In mobile app, enforce HTTPS
  const API_URL = 'https://api.kenixcommodities.com/api';  // Must be https://
  ```

- [ ] **Certificate Pinning (Optional, Advanced)**
  ```javascript
  // Prevents man-in-the-middle attacks
  // React Native: Use react-native-ssl-pinning
  ```

---

### 2. Token Storage

- [ ] **Tokens Stored Securely**
  ```javascript
  // Use Expo SecureStore (encrypted storage)
  import * as SecureStore from 'expo-secure-store';

  // Save token
  await SecureStore.setItemAsync('access_token', token);

  // Never use AsyncStorage for tokens (not encrypted)
  ```

---

### 3. Code Obfuscation (Android)

- [ ] **ProGuard Enabled (Android Release)**
  ```json
  // app.json
  {
    "expo": {
      "android": {
        "enableProguardInReleaseBuilds": true
      }
    }
  }
  ```

---

## Compliance & Privacy

### 1. GDPR Compliance (If serving EU users)

- [ ] **Privacy Policy Published**
  - URL: https://kenixcommodities.com/privacy
  - Covers: Data collection, usage, retention, user rights

- [ ] **Cookie Consent (if using cookies)**
  - Banner shown on first visit
  - User can opt-out

- [ ] **User Rights Implemented**
  - Right to access: User can download their data
  - Right to erasure: User can delete account
  - Right to portability: User can export data

- [ ] **Data Breach Notification Plan**
  - Notify users within 72 hours of breach

---

### 2. Data Minimization

- [ ] **Only Collect Necessary Data**
  - Don't collect unnecessary PII
  - Example: Don't collect date of birth if not needed

- [ ] **Retention Policy**
  - Delete old logs after 90 days
  - Delete inactive accounts after 2 years

---

## Security Monitoring

### 1. Logging

- [ ] **All Authentication Attempts Logged**
  ```javascript
  // Log successful and failed logins
  auditLog.create({
    action: 'login_attempt',
    user: email,
    success: true/false,
    ip: req.ip,
    timestamp: new Date()
  });
  ```

- [ ] **Admin Actions Logged**
  ```javascript
  // Log product creation, user approval, etc.
  ```

- [ ] **No Sensitive Data in Logs**
  - Never log passwords, tokens, credit cards
  - Mask PII in logs (phone: +254XXX...XXX)

---

### 2. Intrusion Detection

- [ ] **Failed Login Alerts**
  - Alert after 10 failed logins from same IP

- [ ] **Unusual Activity Alerts**
  - Bulk data download
  - API calls from new countries
  - Admin login from new IP

---

### 3. Security Scanning

- [ ] **Regular Security Audits**
  - Monthly: npm audit
  - Quarterly: OWASP ZAP scan
  - Yearly: Professional penetration test

- [ ] **Automated Scanning (GitHub)**
  - Enable: Code scanning (CodeQL)
  - Enable: Secret scanning

---

## Incident Response Plan

### Security Incident Procedures

**If security breach detected:**

1. **Containment**
   - Isolate affected systems
   - Stop attacker access
   - Preserve evidence

2. **Assessment**
   - Determine scope of breach
   - Identify data compromised
   - Document everything

3. **Notification**
   - Internal: Notify management immediately
   - External: Notify users within 72 hours (if PII compromised)
   - Legal: Report to authorities if required

4. **Recovery**
   - Restore from clean backups
   - Patch vulnerabilities
   - Change all passwords/keys
   - Review access logs

5. **Post-Incident**
   - Root cause analysis
   - Update security measures
   - Train team
   - Document lessons learned

**Emergency Contacts:**
- Security Lead: [Name, Phone, Email]
- Legal: [Contact]
- Hosting Provider: [AWS/Azure Support]

---

## Final Security Checklist

**Print and complete before production launch:**

### Authentication
- [ ] Strong password policy enforced (8+ chars, uppercase, lowercase, number)
- [ ] Passwords hashed with bcrypt (12+ salt rounds)
- [ ] JWT tokens signed with 64+ char secret
- [ ] Access tokens expire (1 hour or less)
- [ ] Refresh tokens expire (30 days or less)
- [ ] RBAC enforced on all endpoints
- [ ] User can only access own data

### Data Protection
- [ ] HTTPS enforced (HTTP redirects to HTTPS)
- [ ] TLS 1.2+ only (no TLS 1.0/1.1)
- [ ] SSL certificate valid (not expired)
- [ ] SSL/TLS grade A or A+ (SSLLabs test)
- [ ] Data at rest encrypted (MongoDB Atlas, GCP Storage)
- [ ] Backups encrypted
- [ ] No PII in logs

### Network Security
- [ ] Firewall enabled (UFW or AWS Security Groups)
- [ ] Only necessary ports open (22, 80, 443)
- [ ] DDoS protection enabled (Cloudflare)
- [ ] Rate limiting configured (100 req/15min)
- [ ] Database not exposed to internet
- [ ] Database IP whitelist configured

### Application Security
- [ ] All inputs validated (express-validator)
- [ ] NoSQL injection prevented (mongo-sanitize)
- [ ] XSS prevented (xss-clean, helmet)
- [ ] Security headers configured (helmet.js)
- [ ] CORS restricted to known origins
- [ ] No stack traces in production errors
- [ ] No secrets in Git repository
- [ ] All secrets in environment variables
- [ ] Dependencies have no vulnerabilities (npm audit)

### Infrastructure
- [ ] SSH password authentication disabled (keys only)
- [ ] Fail2ban installed (blocks brute force)
- [ ] Automatic security updates enabled
- [ ] MongoDB authentication enabled
- [ ] Database user has minimal permissions
- [ ] Secrets rotated (JWT, API keys, passwords)

### API Security
- [ ] Global rate limiting enabled
- [ ] Stricter limits on auth endpoints (5 req/15min)
- [ ] Request size limits enforced (10MB max)
- [ ] File upload validation (5MB max, images only)
- [ ] API versioned (/api/v1/)

### Mobile App Security
- [ ] HTTPS enforced (no HTTP)
- [ ] Tokens stored in SecureStore (encrypted)
- [ ] ProGuard enabled (Android release)

### Monitoring
- [ ] All auth attempts logged
- [ ] Admin actions logged
- [ ] Failed login alerts configured
- [ ] Security monitoring enabled (Sentry)
- [ ] Incident response plan documented

### Compliance
- [ ] Privacy policy published
- [ ] GDPR compliance (if serving EU)
- [ ] Data retention policy defined
- [ ] Data breach notification plan ready

---

## Security Testing

**Run these tests before launch:**

### 1. Authentication Tests
```bash
# Weak password rejected
# Expired token rejected
# Invalid token rejected
# RBAC enforced (shop can't create products)
# User can only see own data
```

### 2. Input Validation Tests
```bash
# NoSQL injection blocked
# XSS payloads escaped
# Invalid email rejected
# Oversized requests rejected
```

### 3. Network Tests
```bash
# HTTP redirects to HTTPS
# TLS 1.2+ only
# SSL grade A or A+ (SSLLabs)
# Rate limiting works (429 after 100 requests)
```

### 4. Security Scan
```bash
# OWASP ZAP scan: No high/critical issues
# npm audit: 0 vulnerabilities
# GitHub security: No alerts
```

---

## Security Maintenance

**Ongoing security tasks:**

### Daily
- [ ] Review error logs for anomalies
- [ ] Check failed login attempts
- [ ] Monitor resource usage (DDoS detection)

### Weekly
- [ ] Review access logs
- [ ] Check for new vulnerability advisories
- [ ] Verify backups working

### Monthly
- [ ] Run npm audit
- [ ] Review user permissions
- [ ] Test backup restoration
- [ ] Update dependencies

### Quarterly
- [ ] OWASP ZAP security scan
- [ ] Rotate API keys
- [ ] Review and update firewall rules
- [ ] Disaster recovery drill

### Yearly
- [ ] Professional penetration test
- [ ] Comprehensive security audit
- [ ] Review and update security policies
- [ ] Team security training

---

**Your application is now secure!**

Congratulations on completing all production deployment guides. Kenix Commodities is now ready for launch with enterprise-grade security, performance, monitoring, and backup strategies in place.

---

**Document Version:** 1.0.0
**Last Updated:** 2025-11-09
**Next Review:** 2025-12-09
