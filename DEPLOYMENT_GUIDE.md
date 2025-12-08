# Kenix Commodities - Deployment Guide

**Version:** 1.0.0
**Last Updated:** 2025-11-09
**Estimated Deployment Time:** 2-4 hours

---

## Table of Contents

1. [Overview](#overview)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Option 1: Cloud Deployment (Recommended)](#option-1-cloud-deployment-recommended)
   - [Backend Deployment (AWS EC2)](#backend-deployment-aws-ec2)
   - [Admin Dashboard (Vercel)](#admin-dashboard-vercel)
   - [Mobile Apps (Expo EAS)](#mobile-apps-expo-eas)
4. [Option 2: Alternative Cloud Providers](#option-2-alternative-cloud-providers)
5. [Option 3: Self-Hosted Deployment](#option-3-self-hosted-deployment)
6. [Option 4: Docker Deployment](#option-4-docker-deployment)
7. [Post-Deployment Verification](#post-deployment-verification)
8. [Rollback Procedures](#rollback-procedures)

---

## Overview

This guide provides step-by-step instructions for deploying all components of the Kenix Commodities platform to production.

**Platform Components:**
- **Backend API:** Node.js/Express server with Socket.IO
- **Admin Dashboard:** Next.js web application
- **Mobile Apps:** 3 React Native/Expo applications (Rider, Sales Agent, Shop)

**Recommended Architecture:**
```
┌─────────────────┐
│  Users/Clients  │
└────────┬────────┘
         │
    ┌────▼────┐
    │Cloudflare│ (DDoS Protection, SSL, CDN)
    └────┬────┘
         │
    ┌────┴────────────────────────┐
    │                             │
┌───▼────────┐           ┌────────▼───────┐
│   Vercel   │           │    AWS EC2     │
│ (Dashboard)│           │  (Backend API) │
└────────────┘           └────────┬───────┘
                                  │
                         ┌────────▼──────────┐
                         │  MongoDB Atlas    │
                         │   (Database)      │
                         └───────────────────┘
```

---

## Pre-Deployment Checklist

**Complete BEFORE deploying:**

### 1. Environment Configuration
- [ ] All API keys obtained (see PRODUCTION_SETUP_GUIDE.md)
- [ ] Production environment files created:
  - `server/config.env.production`
  - `web/.env.production`
  - `apps/rider/.env.production`
  - `apps/sales-agent/.env.production`
  - `apps/shop/.env.production`
- [ ] All secrets changed from defaults (JWT, session secrets)
- [ ] GCP service account key file ready

### 2. Infrastructure
- [ ] Domain purchased and DNS configured
- [ ] SSL certificate obtained or Cloudflare configured
- [ ] Cloud account created (AWS/Azure/GCP)
- [ ] MongoDB Atlas cluster ready
- [ ] Server instance provisioned (if using VPS)

### 3. Code Repository
- [ ] Code pushed to Git repository (GitHub/GitLab/Bitbucket)
- [ ] All environment files added to `.gitignore`
- [ ] Latest changes tested locally
- [ ] Dependencies up to date (`npm audit fix`)

### 4. Testing
- [ ] All endpoints tested in staging
- [ ] Integration tests passed
- [ ] Load testing completed
- [ ] Security audit completed

---

## Option 1: Cloud Deployment (Recommended)

### Backend Deployment (AWS EC2)

**Recommended Instance:** t3.medium (2 vCPU, 4 GB RAM) - $30/month

#### Step 1: Launch EC2 Instance

1. **Login to AWS Console**
   - Go to https://console.aws.amazon.com/
   - Navigate to EC2 Dashboard

2. **Launch Instance**
   - Click "Launch Instance"
   - Name: `kenix-api-production`
   - Application and OS Images:
     - Select "Ubuntu Server 22.04 LTS"
     - Architecture: 64-bit (x86)
   - Instance type: `t3.medium`
   - Key pair: Create new or select existing
     - Download `.pem` file and save securely
   - Network settings:
     - Create security group: `kenix-api-sg`
     - Allow SSH (22) from your IP
     - Allow HTTP (80) from anywhere
     - Allow HTTPS (443) from anywhere
     - Allow Custom TCP (3001) from anywhere (for API)
   - Storage: 30 GB gp3 (General Purpose SSD)
   - Click "Launch Instance"

3. **Allocate Elastic IP (Static IP)**
   - Go to "Elastic IPs" in EC2 console
   - Click "Allocate Elastic IP address"
   - Click "Allocate"
   - Select the new IP → Actions → "Associate Elastic IP address"
   - Select your instance → Associate
   - **Save this IP** (needed for DNS)

4. **Update DNS**
   - Go to your domain registrar
   - Update A record for `api.kenixcommodities.com`:
     ```
     Type: A
     Host: api
     Value: [Your Elastic IP]
     TTL: 300
     ```

#### Step 2: Connect to Server

```bash
# Set permissions on key file
chmod 400 kenix-api-key.pem

# Connect via SSH
ssh -i kenix-api-key.pem ubuntu@[Your Elastic IP]
```

#### Step 3: Install Dependencies

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 18 (LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v18.x.x
npm --version

# Install Yarn package manager
npm install -g yarn

# Install PM2 (process manager)
npm install -g pm2

# Install Nginx (reverse proxy)
sudo apt install -y nginx

# Install Certbot (SSL certificates)
sudo apt install -y certbot python3-certbot-nginx

# Install Git
sudo apt install -y git
```

#### Step 4: Clone Repository

```bash
# Create application directory
sudo mkdir -p /var/www/kenix-commodities
sudo chown -R ubuntu:ubuntu /var/www/kenix-commodities

# Clone repository
cd /var/www
git clone https://github.com/yourusername/kenix-commodities.git
cd kenix-commodities
```

**If using private repository:**
```bash
# Generate SSH key on server
ssh-keygen -t ed25519 -C "server@kenixcommodities.com"

# Display public key
cat ~/.ssh/id_ed25519.pub

# Add this key to GitHub: Settings → SSH and GPG keys → New SSH key
# Then clone:
git clone git@github.com:yourusername/kenix-commodities.git
```

#### Step 5: Install Backend Dependencies

```bash
cd /var/www/kenix-commodities/server

# Install packages
yarn install --production

# Verify no critical vulnerabilities
npm audit
```

#### Step 6: Configure Environment

```bash
# Create production config
nano config.env

# Paste your production environment variables (see PRODUCTION_SETUP_GUIDE.md)
# Save: Ctrl+O, Enter, Ctrl+X
```

**Example config.env:**
```env
NODE_ENV=production
PORT=3001
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/kenix_production
JWT_ACCESS_SECRET=your_64_char_secret_here
JWT_REFRESH_SECRET=your_different_64_char_secret_here
MPESA_CONSUMER_KEY=production_key
MPESA_CONSUMER_SECRET=production_secret
# ... (see PRODUCTION_SETUP_GUIDE.md for full config)
```

#### Step 7: Upload GCP Service Account Key

**From your local machine:**
```bash
# Copy GCP key to server
scp -i kenix-api-key.pem kenix-gcp-production-key.json ubuntu@[Your IP]:/var/www/kenix-commodities/server/config/

# Set secure permissions
ssh -i kenix-api-key.pem ubuntu@[Your IP]
chmod 600 /var/www/kenix-commodities/server/config/kenix-gcp-production-key.json
```

#### Step 8: Start Application with PM2

```bash
cd /var/www/kenix-commodities/server

# Start application
pm2 start index.js --name kenix-api

# Save PM2 process list
pm2 save

# Configure PM2 to start on system boot
pm2 startup systemd
# Copy and run the command PM2 outputs

# Verify running
pm2 status

# View logs
pm2 logs kenix-api

# Monitor resources
pm2 monit
```

**PM2 Commands Reference:**
```bash
pm2 list                 # List all processes
pm2 logs kenix-api       # View logs
pm2 restart kenix-api    # Restart app
pm2 stop kenix-api       # Stop app
pm2 delete kenix-api     # Remove from PM2
pm2 monit                # Monitor CPU/Memory
```

#### Step 9: Configure Nginx Reverse Proxy

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/kenix-api
```

**Paste this configuration:**
```nginx
# Kenix Commodities API - Production
# Rate limiting zone
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

# Upstream backend
upstream kenix_backend {
    server 127.0.0.1:3001;
    keepalive 64;
}

server {
    listen 80;
    listen [::]:80;
    server_name api.kenixcommodities.com;

    # Rate limiting
    limit_req zone=api_limit burst=20 nodelay;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # API routes
    location / {
        proxy_pass http://kenix_backend;
        proxy_http_version 1.1;

        # Headers
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # Buffering
        proxy_buffering off;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support (Socket.IO)
    location /socket.io/ {
        proxy_pass http://kenix_backend/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # M-Pesa callback endpoint (high timeout for Safaricom)
    location /api/payments/mpesa/ {
        proxy_pass http://kenix_backend/api/payments/mpesa/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Access logs
    access_log /var/log/nginx/kenix-api-access.log;
    error_log /var/log/nginx/kenix-api-error.log;

    # Client body size (for file uploads)
    client_max_body_size 10M;
}
```

**Save and enable site:**
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/kenix-api /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Verify Nginx is running
sudo systemctl status nginx
```

#### Step 10: Obtain SSL Certificate

```bash
# Use Certbot with Nginx plugin
sudo certbot --nginx -d api.kenixcommodities.com

# Follow prompts:
# 1. Enter email: your-email@example.com
# 2. Agree to Terms of Service: Yes
# 3. Share email with EFF: Your choice
# 4. Redirect HTTP to HTTPS: Yes (option 2)

# Verify auto-renewal
sudo certbot renew --dry-run
```

**Certbot will automatically:**
- Obtain SSL certificate from Let's Encrypt
- Modify Nginx config to use HTTPS
- Set up auto-renewal cron job

**Verify HTTPS:**
```bash
curl https://api.kenixcommodities.com/health
# Should return: healthy
```

#### Step 11: Configure Firewall

```bash
# Enable UFW firewall
sudo ufw enable

# Allow SSH (port 22)
sudo ufw allow 22/tcp

# Allow HTTP (port 80)
sudo ufw allow 80/tcp

# Allow HTTPS (port 443)
sudo ufw allow 443/tcp

# Deny direct access to API port (Nginx will proxy)
# Don't need to allow 3001 externally

# Check status
sudo ufw status

# Should show:
# To                         Action      From
# --                         ------      ----
# 22/tcp                     ALLOW       Anywhere
# 80/tcp                     ALLOW       Anywhere
# 443/tcp                    ALLOW       Anywhere
```

#### Step 12: Set Up Log Rotation

```bash
# Create logrotate config
sudo nano /etc/logrotate.d/kenix-api
```

**Paste:**
```
/var/log/nginx/kenix-api-*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        [ -f /var/run/nginx.pid ] && kill -USR1 `cat /var/run/nginx.pid`
    endscript
}

/home/ubuntu/.pm2/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    copytruncate
}
```

#### Step 13: Verify Backend Deployment

```bash
# Check PM2 status
pm2 status

# Check API health
curl https://api.kenixcommodities.com/health

# Test login endpoint
curl -X POST https://api.kenixcommodities.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"test"}'

# Should return JSON response (may be error if user doesn't exist, but proves API works)

# View logs
pm2 logs kenix-api --lines 50

# Check Nginx logs
sudo tail -f /var/log/nginx/kenix-api-access.log
sudo tail -f /var/log/nginx/kenix-api-error.log
```

---

### Admin Dashboard (Vercel)

**Recommended Platform:** Vercel (free for hobby, $20/month for pro)

#### Step 1: Prepare Repository

```bash
# On your local machine
cd /path/to/kenix-commodities/web

# Create production environment file
nano .env.production
```

**Paste:**
```env
NEXT_PUBLIC_API_URL=https://api.kenixcommodities.com/api
NEXT_PUBLIC_WS_URL=https://api.kenixcommodities.com
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_production_mapbox_token
NEXT_PUBLIC_GCP_BUCKET_NAME=kenix-products-production
NEXT_PUBLIC_GCP_BUCKET_URL=https://storage.googleapis.com/kenix-products-production
```

**Commit changes:**
```bash
git add .env.production
git commit -m "Add production environment configuration"
git push origin main
```

**Wait!** Don't commit `.env.production` if it contains secrets. Instead, set environment variables in Vercel dashboard (next steps).

**Better approach:**
```bash
# Add to .gitignore
echo ".env.production" >> .gitignore
git add .gitignore
git commit -m "Ignore production env file"
git push origin main
```

#### Step 2: Deploy to Vercel

1. **Sign Up / Login**
   - Go to https://vercel.com/
   - Sign up with GitHub account (easiest)
   - Authorize Vercel to access your repositories

2. **Import Project**
   - Click "Add New..." → "Project"
   - Select your repository: `kenix-commodities`
   - Click "Import"

3. **Configure Project**
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `web` (click "Edit" and type `web`)
   - Build Command: `yarn build` (default is fine)
   - Output Directory: `.next` (default is fine)
   - Install Command: `yarn install` (default is fine)

4. **Add Environment Variables**
   - Click "Environment Variables"
   - Add each variable:
     ```
     Name: NEXT_PUBLIC_API_URL
     Value: https://api.kenixcommodities.com/api
     Environments: Production ✓

     Name: NEXT_PUBLIC_WS_URL
     Value: https://api.kenixcommodities.com
     Environments: Production ✓

     Name: NEXT_PUBLIC_MAPBOX_TOKEN
     Value: pk.your_production_mapbox_token
     Environments: Production ✓

     Name: NEXT_PUBLIC_GCP_BUCKET_NAME
     Value: kenix-products-production
     Environments: Production ✓

     Name: NEXT_PUBLIC_GCP_BUCKET_URL
     Value: https://storage.googleapis.com/kenix-products-production
     Environments: Production ✓
     ```

5. **Deploy**
   - Click "Deploy"
   - Wait 2-5 minutes for build to complete
   - You'll get a URL like: `kenix-commodities-web.vercel.app`

#### Step 3: Configure Custom Domain

1. **Add Domain**
   - In Vercel project settings → "Domains"
   - Click "Add"
   - Enter: `dashboard.kenixcommodities.com`
   - Click "Add"

2. **Configure DNS**
   - Vercel will show DNS instructions
   - Go to your domain registrar
   - Add CNAME record:
     ```
     Type: CNAME
     Name: dashboard
     Value: cname.vercel-dns.com
     TTL: 300
     ```
   - Wait 5-10 minutes for DNS propagation

3. **Verify SSL**
   - Vercel automatically provisions SSL
   - Visit: https://dashboard.kenixcommodities.com
   - Should load your dashboard

#### Step 4: Configure Auto-Deployment

**Already configured!** Vercel auto-deploys on every push to `main` branch.

**To deploy specific branch:**
- Project Settings → Git → Production Branch
- Change to your preferred branch

**To disable auto-deploy:**
- Project Settings → Git → uncheck "Automatically deploy branches"

#### Step 5: Verify Dashboard Deployment

```bash
# Test dashboard loads
curl -I https://dashboard.kenixcommodities.com

# Should return 200 OK

# Test in browser
# Open: https://dashboard.kenixcommodities.com
# Should see login page
# Try logging in with admin credentials
```

---

### Mobile Apps (Expo EAS)

**Platform:** Expo Application Services (EAS Build)

#### Prerequisites

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo account
eas login

# If you don't have account:
# 1. Go to https://expo.dev/
# 2. Sign up
# 3. Run: eas login
```

#### Step 1: Configure EAS for Each App

**Rider App:**
```bash
cd /path/to/kenix-commodities/apps/rider

# Initialize EAS
eas build:configure

# This creates eas.json
```

**Edit `eas.json`:**
```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "autoIncrement": true
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

**Update `app.json`:**
```json
{
  "expo": {
    "name": "Kenix Rider",
    "slug": "kenix-rider",
    "version": "1.0.0",
    "scheme": "kenix-rider",
    "android": {
      "package": "com.kenix.rider",
      "versionCode": 1,
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_GOOGLE_MAPS_API_KEY"
        }
      }
    },
    "ios": {
      "bundleIdentifier": "com.kenix.rider",
      "buildNumber": "1.0.0"
    },
    "extra": {
      "eas": {
        "projectId": "your-project-id-will-be-generated"
      }
    }
  }
}
```

**Create `.env.production`:**
```env
EXPO_PUBLIC_API_URL=https://api.kenixcommodities.com/api
EXPO_PUBLIC_WS_URL=https://api.kenixcommodities.com
EXPO_PUBLIC_GCP_BUCKET_URL=https://storage.googleapis.com/kenix-products-production
```

**Repeat for Sales Agent and Shop apps.**

#### Step 2: Build Android APK (All Apps)

**Rider App:**
```bash
cd apps/rider

# Build production APK
eas build --platform android --profile production

# EAS will:
# 1. Ask to create project (first time) - Yes
# 2. Ask to generate new keystore - Yes (first time)
# 3. Upload code to EAS servers
# 4. Build APK (takes 10-20 minutes)
# 5. Provide download link

# Download APK
# Link will be shown in terminal and at: https://expo.dev/accounts/[your-account]/projects/kenix-rider/builds
```

**Sales Agent App:**
```bash
cd apps/sales-agent
eas build --platform android --profile production
```

**Shop App:**
```bash
cd apps/shop
eas build --platform android --profile production
```

#### Step 3: Build iOS App (All Apps)

**Prerequisites:**
- Apple Developer Account ($99/year)
- App Store Connect access
- Certificates and provisioning profiles

```bash
cd apps/rider

# Build production IPA
eas build --platform ios --profile production

# EAS will:
# 1. Ask for Apple ID credentials
# 2. Generate certificates (first time)
# 3. Create provisioning profile
# 4. Build IPA (takes 15-25 minutes)
# 5. Provide download link
```

**Repeat for other apps.**

#### Step 4: Internal Testing (Before Store Submission)

**Android:**
```bash
# Build preview APK for testing
eas build --platform android --profile preview

# Share download link with testers
# Or download APK and distribute via email/drive
```

**iOS (TestFlight):**
```bash
# Build and submit to TestFlight
eas build --platform ios --profile production
eas submit --platform ios

# Add testers in App Store Connect:
# 1. Go to https://appstoreconnect.apple.com/
# 2. Select your app
# 3. TestFlight tab
# 4. Add internal/external testers
```

#### Step 5: Submit to App Stores

**Google Play Store (Android):**

1. **Create Google Play Console Account**
   - Go to https://play.google.com/console/
   - Pay one-time $25 registration fee
   - Complete account setup

2. **Create App**
   - Click "Create app"
   - App name: "Kenix Rider" (repeat for other apps)
   - Default language: English
   - App or game: App
   - Free or paid: Free
   - Click "Create app"

3. **Complete Store Listing**
   - App details:
     - Short description (80 chars)
     - Full description (4000 chars)
     - App icon (512x512 PNG)
     - Feature graphic (1024x500)
     - Screenshots (at least 2, various sizes)
   - Categorization:
     - App category: Business
     - Content rating: Complete questionnaire
   - Contact details:
     - Email: kenixcommodities@gmail.com
     - Privacy policy: https://kenixcommodities.com/privacy (create this)

4. **Upload APK**
   - Go to "Production" → "Create new release"
   - Upload APK from EAS build
   - Release notes: "Initial release"
   - Save → Review release → Start rollout to production

5. **Wait for Review**
   - Takes 1-7 days
   - You'll receive email when approved

**Apple App Store (iOS):**

1. **Create App Store Connect Account**
   - Included with Apple Developer account
   - Go to https://appstoreconnect.apple.com/

2. **Create App**
   - Click "+" → "New App"
   - Platform: iOS
   - Name: "Kenix Rider"
   - Primary language: English
   - Bundle ID: com.kenix.rider
   - SKU: kenix-rider-001
   - User access: Full Access

3. **Complete App Information**
   - Privacy policy URL: Required
   - App category: Business
   - Content rights: Own or licensed

4. **Complete Pricing**
   - Price: Free
   - Availability: All countries (or select specific)

5. **Prepare for Submission**
   - Screenshots (required for all device sizes)
   - App previews (optional videos)
   - Description
   - Keywords
   - Support URL
   - Marketing URL (optional)

6. **Upload Build**
   ```bash
   eas submit --platform ios
   # Or upload via EAS website
   ```

7. **Submit for Review**
   - Fill out "App Review Information"
   - Add notes for reviewer
   - Submit
   - Wait 1-3 days for review

#### Step 6: Update Production Environment in Apps

**After stores approve:**

Users will download from:
- Google Play: https://play.google.com/store/apps/details?id=com.kenix.rider
- Apple App Store: https://apps.apple.com/app/kenix-rider/id[app-id]

**For updates:**
```bash
# Increment version in app.json
# Android: versionCode++
# iOS: buildNumber++

# Rebuild
eas build --platform android --profile production
eas build --platform ios --profile production

# Resubmit
eas submit --platform android
eas submit --platform ios
```

---

## Option 2: Alternative Cloud Providers

### Backend on Azure

**Azure App Service:**
```bash
# Install Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Login
az login

# Create resource group
az group create --name kenix-production --location eastus

# Create app service plan
az appservice plan create \
  --name kenix-plan \
  --resource-group kenix-production \
  --sku B1 --is-linux

# Create web app
az webapp create \
  --resource-group kenix-production \
  --plan kenix-plan \
  --name kenix-api \
  --runtime "NODE|18-lts"

# Deploy code
cd server
zip -r deploy.zip .
az webapp deployment source config-zip \
  --resource-group kenix-production \
  --name kenix-api \
  --src deploy.zip

# Set environment variables
az webapp config appsettings set \
  --resource-group kenix-production \
  --name kenix-api \
  --settings MONGO_URI="mongodb+srv://..." JWT_ACCESS_SECRET="..."

# Configure custom domain
az webapp config hostname add \
  --webapp-name kenix-api \
  --resource-group kenix-production \
  --hostname api.kenixcommodities.com
```

### Backend on Google Cloud (GCP)

**Google App Engine:**
```bash
# Install gcloud CLI
curl https://sdk.cloud.google.com | bash

# Initialize
gcloud init

# Create app.yaml
cd server
cat > app.yaml << EOF
runtime: nodejs18
env: standard
instance_class: F2

env_variables:
  NODE_ENV: production
  MONGO_URI: "mongodb+srv://..."
  # Add all environment variables
EOF

# Deploy
gcloud app deploy

# View logs
gcloud app logs tail -s default
```

### Backend on DigitalOcean

**App Platform:**
1. Go to https://cloud.digitalocean.com/
2. Create → Apps
3. Connect GitHub repository
4. Select `server` directory
5. Configure environment variables
6. Deploy

**Cost:** $12-25/month (Basic plan)

---

## Option 3: Self-Hosted Deployment

**For organizations with their own servers.**

### Requirements
- Ubuntu 22.04 LTS server
- 4 GB RAM minimum
- 2 CPU cores
- 50 GB storage
- Static IP address
- Root access

### Steps

Follow "Backend Deployment (AWS EC2)" steps above, but:
- Skip EC2-specific steps (Elastic IP, Security Groups)
- Use your server's IP for DNS
- Configure firewall with `ufw` (shown in guide)
- Set up monitoring (see MONITORING_GUIDE.md)

---

## Option 4: Docker Deployment

**For scalable, containerized deployment.**

### Step 1: Create Dockerfiles

**Backend Dockerfile (server/Dockerfile):**
```dockerfile
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
COPY yarn.lock ./
RUN yarn install --production

# Copy app source
COPY . .

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start app
CMD ["node", "index.js"]
```

**Frontend Dockerfile (web/Dockerfile):**
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
COPY yarn.lock ./
RUN yarn install

COPY . .
RUN yarn build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["yarn", "start"]
```

### Step 2: Create docker-compose.yml

```yaml
version: '3.8'

services:
  # Backend API
  api:
    build: ./server
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - MONGO_URI=${MONGO_URI}
      - JWT_ACCESS_SECRET=${JWT_ACCESS_SECRET}
      # Add all environment variables
    volumes:
      - ./server/config:/usr/src/app/config
    restart: unless-stopped
    networks:
      - kenix-network
    depends_on:
      - redis

  # Redis cache
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    restart: unless-stopped
    networks:
      - kenix-network

  # Nginx reverse proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    restart: unless-stopped
    networks:
      - kenix-network
    depends_on:
      - api

volumes:
  redis-data:

networks:
  kenix-network:
    driver: bridge
```

### Step 3: Deploy with Docker Compose

```bash
# Build and start containers
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop containers
docker-compose down

# Restart
docker-compose restart api
```

### Step 4: Kubernetes (Advanced)

**For high-availability, auto-scaling deployments.**

See separate Kubernetes deployment guide if needed.

---

## Post-Deployment Verification

**Run through this checklist after deployment:**

### Backend API

```bash
# Health check
curl https://api.kenixcommodities.com/health
# Expected: "healthy"

# Test authentication endpoint
curl -X POST https://api.kenixcommodities.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
# Expected: JSON response (success or error)

# Test protected endpoint (requires auth)
curl https://api.kenixcommodities.com/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN"
# Expected: User data or 401 Unauthorized

# WebSocket connection
# Use tool like: https://www.websocket.org/echo.html
# Connect to: wss://api.kenixcommodities.com/socket.io/
# Expected: Successful connection

# Check SSL certificate
curl -vI https://api.kenixcommodities.com 2>&1 | grep -i "SSL\|TLS"
# Expected: Shows TLS 1.2 or 1.3

# Load test (optional)
npm install -g artillery
artillery quick --count 100 --num 10 https://api.kenixcommodities.com/health
# Expected: No errors, avg response < 200ms
```

### Admin Dashboard

```bash
# Check dashboard loads
curl -I https://dashboard.kenixcommodities.com
# Expected: 200 OK

# Check SSL
curl -vI https://dashboard.kenixcommodities.com 2>&1 | grep -i "SSL"

# Test in browser:
# 1. Open https://dashboard.kenixcommodities.com
# 2. Should see login page
# 3. Login with admin credentials
# 4. Check all pages load
# 5. Test real-time updates (WebSocket)
# 6. Test map displays correctly (Mapbox)
# 7. Test creating/editing data
```

### Mobile Apps

**Android:**
```bash
# Install APK on test device
adb install kenix-rider.apk

# Test:
# 1. App launches without crashes
# 2. Login works
# 3. GPS tracking functional
# 4. Maps display correctly
# 5. Camera permissions granted
# 6. M-Pesa payment flow works
# 7. Push notifications received
# 8. Real-time updates work
```

**iOS:**
- Install via TestFlight
- Run same tests as Android

### Database

```bash
# Connect to MongoDB Atlas
mongo "mongodb+srv://cluster.mongodb.net/kenix_production" --username admin

# Check collections exist
show collections

# Verify indexes
db.products.getIndexes()
db.orders.getIndexes()

# Check document counts
db.users.countDocuments()
db.products.countDocuments()
db.orders.countDocuments()
```

### Third-Party Services

**M-Pesa:**
```bash
# Test STK push from admin dashboard
# Create test order
# Trigger payment
# Check callback logs:
pm2 logs kenix-api | grep "mpesa"
```

**SMS (Africa's Talking):**
```bash
# Trigger SMS (e.g., new user registration)
# Check logs:
pm2 logs kenix-api | grep "sms"
# Verify SMS received on test phone
```

**Google Cloud Storage:**
```bash
# Upload test image via admin dashboard
# Verify image accessible:
curl https://storage.googleapis.com/kenix-products-production/test-image.jpg
# Expected: Image downloads
```

---

## Rollback Procedures

**If deployment fails or critical issues arise:**

### Backend Rollback

```bash
# SSH into server
ssh -i kenix-api-key.pem ubuntu@[Your IP]

# Stop current version
pm2 stop kenix-api

# Checkout previous version
cd /var/www/kenix-commodities
git log --oneline  # Find previous commit hash
git checkout [previous-commit-hash]

# Reinstall dependencies (if package.json changed)
cd server
yarn install --production

# Restart
pm2 restart kenix-api

# Verify
pm2 logs kenix-api
curl https://api.kenixcommodities.com/health
```

### Dashboard Rollback (Vercel)

```bash
# Go to Vercel dashboard
# Select project → Deployments
# Find previous working deployment
# Click "..." → "Promote to Production"
```

### Mobile App Rollback

**Cannot rollback apps already on store.**

**Mitigation:**
1. Release hotfix update quickly
2. Use feature flags to disable broken features
3. Monitor crash reports in real-time

---

## Monitoring & Alerts

**After deployment, set up monitoring:**

1. **See MONITORING_GUIDE.md** for comprehensive setup
2. **Critical alerts:**
   - Server CPU > 80%
   - Memory > 90%
   - API response time > 2s
   - Error rate > 1%
   - Database connections exhausted
   - Disk space < 10%

---

## Maintenance Schedule

**Recommended ongoing tasks:**

- **Daily:** Check error logs, monitor performance
- **Weekly:** Review database backups, check SSL certificate expiry
- **Monthly:** Update dependencies (`npm audit fix`), review security advisories
- **Quarterly:** Load testing, disaster recovery drill, rotate API keys

---

## Support & Troubleshooting

**Common deployment issues:**

### Issue: PM2 app crashes on start

```bash
# Check logs
pm2 logs kenix-api --lines 100

# Common causes:
# 1. Missing environment variable
# 2. MongoDB connection failed
# 3. Port already in use

# Verify config.env exists and has correct values
cat /var/www/kenix-commodities/server/config.env

# Test MongoDB connection
mongo "your_mongo_uri"
```

### Issue: Nginx 502 Bad Gateway

```bash
# Check if backend is running
pm2 status

# Check Nginx error logs
sudo tail -f /var/log/nginx/kenix-api-error.log

# Test backend directly
curl http://localhost:3001/health

# Restart services
pm2 restart kenix-api
sudo systemctl restart nginx
```

### Issue: SSL certificate not working

```bash
# Check certificate status
sudo certbot certificates

# Renew manually
sudo certbot renew

# Check Nginx config
sudo nginx -t

# Common cause: Firewall blocking port 80
sudo ufw status
sudo ufw allow 80/tcp
```

### Issue: Mobile app can't connect to API

**Check:**
1. API URL in `.env.production` is correct (https://)
2. SSL certificate valid (test in browser)
3. CORS enabled for mobile apps
4. Firewall allows HTTPS traffic

---

**Deployment Complete!**

**Next Steps:**
1. Review MONITORING_GUIDE.md for post-deployment monitoring
2. Review TESTING_GUIDE.md for comprehensive testing
3. Review SECURITY_CHECKLIST.md for final security audit

---

**Document Version:** 1.0.0
**Last Updated:** 2025-11-09
