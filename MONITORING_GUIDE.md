# Kenix Commodities - Monitoring & Logging Guide

**Version:** 1.0.0
**Last Updated:** 2025-11-09
**Target Audience:** DevOps Engineers, System Administrators

---

## Table of Contents

1. [Overview](#overview)
2. [Application Monitoring](#application-monitoring)
3. [Error Tracking](#error-tracking)
4. [Database Monitoring](#database-monitoring)
5. [Uptime Monitoring](#uptime-monitoring)
6. [Log Management](#log-management)
7. [Performance Monitoring](#performance-monitoring)
8. [Alerting Strategy](#alerting-strategy)
9. [Metrics Dashboard](#metrics-dashboard)
10. [Incident Response](#incident-response)

---

## Overview

Comprehensive monitoring is critical for production systems. This guide covers all monitoring layers for Kenix Commodities.

**Monitoring Layers:**
```
┌──────────────────────────────────┐
│   Uptime Monitoring              │  External health checks
├──────────────────────────────────┤
│   Application Performance        │  Response times, throughput
├──────────────────────────────────┤
│   Error Tracking                 │  Exceptions, crashes
├──────────────────────────────────┤
│   Log Management                 │  Centralized logging
├──────────────────────────────────┤
│   Infrastructure Monitoring      │  CPU, Memory, Disk
├──────────────────────────────────┤
│   Database Monitoring            │  Query performance, connections
└──────────────────────────────────┘
```

**Goals:**
- Detect issues before users report them
- Minimize Mean Time To Recovery (MTTR)
- Maintain 99.9% uptime (43 minutes downtime/month max)
- Identify performance bottlenecks
- Track business metrics

---

## Application Monitoring

### Option 1: PM2 Plus (Recommended for Small-Medium Scale)

**Why:** Built-in PM2 integration, easy setup, free tier available.

**Cost:** Free for 1 server, $29/month for 5 servers

#### Setup

```bash
# SSH into your server
ssh -i kenix-api-key.pem ubuntu@[Your IP]

# Install PM2 modules
pm2 install pm2-logrotate
pm2 install pm2-server-monit

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
pm2 set pm2-logrotate:compress true
pm2 set pm2-logrotate:dateFormat YYYY-MM-DD_HH-mm-ss
pm2 set pm2-logrotate:rotateModule true

# Link to PM2 Plus dashboard (optional)
pm2 plus
# Follow prompts to link your app
# Visit: https://app.pm2.io/
```

#### Features You Get

**Real-time Monitoring:**
- CPU usage per process
- Memory usage
- Event loop latency
- HTTP request rate
- Active handles
- GC statistics

**Logs:**
- Live log streaming
- Historical logs (retained based on plan)
- Log search
- Export logs

**Alerts:**
- CPU > 80%
- Memory > 90%
- Process restarts
- Custom metrics

**Dashboard:**
- https://app.pm2.io/
- Real-time metrics
- Process list
- Error tracking

#### Custom Metrics

**Add to your backend code:**

```javascript
// server/index.js
const pmx = require('@pm2/io');

// Custom metrics
const activeUsers = pmx.metric({
  name: 'Active Users',
  type: 'metric',
  unit: 'users',
});

const ordersPerMinute = pmx.counter({
  name: 'Orders/minute',
  type: 'counter',
});

const avgResponseTime = pmx.histogram({
  name: 'Response Time',
  measurement: 'mean',
  unit: 'ms',
});

// Update metrics
io.on('connection', (socket) => {
  activeUsers.set(io.engine.clientsCount);
});

app.post('/api/orders', async (req, res) => {
  const start = Date.now();
  // ... order processing
  ordersPerMinute.inc();
  avgResponseTime.update(Date.now() - start);
});
```

#### Alerts Configuration

**PM2 Plus Dashboard:**
1. Go to https://app.pm2.io/
2. Select your app
3. Click "Alerting" tab
4. Add alerts:
   - CPU > 80% for 5 minutes → Email
   - Memory > 90% for 2 minutes → Email + SMS
   - Process restart → Email
   - Exception count > 10/minute → Email + SMS

---

### Option 2: New Relic (Enterprise-Grade)

**Why:** Comprehensive APM, distributed tracing, AI-powered insights.

**Cost:** Free tier (100 GB/month), Pro $99/month, Enterprise $349/month

#### Setup

```bash
# Install New Relic Node.js agent
cd /var/www/kenix-commodities/server
npm install newrelic --save
```

**Create `newrelic.js` in server root:**

```javascript
'use strict';

exports.config = {
  app_name: ['Kenix Commodities API'],
  license_key: 'YOUR_NEW_RELIC_LICENSE_KEY',
  logging: {
    level: 'info',
  },
  distributed_tracing: {
    enabled: true,
  },
  transaction_tracer: {
    enabled: true,
    transaction_threshold: 'apdex_f',
    record_sql: 'obfuscated',
  },
  error_collector: {
    enabled: true,
    ignore_status_codes: [404],
  },
};
```

**Modify `index.js` to load New Relic first:**

```javascript
// MUST be first line
require('newrelic');

// Rest of your code
const express = require('express');
// ...
```

**Restart application:**

```bash
pm2 restart kenix-api
```

**View Dashboard:**
- Go to https://one.newrelic.com/
- Navigate to APM → Applications → Kenix Commodities API

**Features:**
- Transaction tracing
- Slow query identification
- External service calls tracking
- Error analytics
- Custom instrumentation
- Service maps

---

### Option 3: Datadog (Full-Stack Observability)

**Why:** Unified platform for infrastructure, APM, logs, and traces.

**Cost:** $15/host/month (Infrastructure), $31/host/month (APM)

#### Setup

```bash
# Install Datadog agent
DD_API_KEY=your_datadog_api_key DD_SITE="datadoghq.com" bash -c "$(curl -L https://s3.amazonaws.com/dd-agent/scripts/install_script.sh)"

# Install Node.js tracer
cd /var/www/kenix-commodities/server
npm install dd-trace --save
```

**Modify `index.js`:**

```javascript
// MUST be first line
require('dd-trace').init({
  service: 'kenix-api',
  env: 'production',
  logInjection: true,
  runtimeMetrics: true,
});

// Rest of your code
const express = require('express');
// ...
```

**Configure Datadog Agent:**

```bash
sudo nano /etc/datadog-agent/datadog.yaml
```

Add:
```yaml
api_key: your_datadog_api_key
site: datadoghq.com
logs_enabled: true
process_config:
  enabled: true
apm_config:
  enabled: true
```

**Restart agent:**

```bash
sudo systemctl restart datadog-agent
```

**Dashboard:** https://app.datadoghq.com/

---

## Error Tracking

### Option 1: Sentry (Recommended)

**Why:** Best-in-class error tracking, easy integration, generous free tier.

**Cost:** Free for 5K events/month, $26/month for 50K events

#### Backend Setup

```bash
cd /var/www/kenix-commodities/server
npm install @sentry/node @sentry/profiling-node --save
```

**Modify `server/index.js`:**

```javascript
const express = require('express');
const Sentry = require('@sentry/node');
const { ProfilingIntegration } = require('@sentry/profiling-node');

const app = express();

// Initialize Sentry BEFORE other middleware
Sentry.init({
  dsn: 'https://your-sentry-dsn@sentry.io/project-id',
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0, // Capture 100% of transactions (reduce for high traffic)
  profilesSampleRate: 1.0, // Profiling
  integrations: [
    new ProfilingIntegration(),
  ],
});

// Request handler must be first middleware
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

// Your routes
app.use('/api', routes);

// Error handler must be before other error middleware
app.use(Sentry.Handlers.errorHandler());

// Fallback error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    // In production, don't expose stack trace
  });
});

// Start server
app.listen(PORT);
```

#### Frontend Setup (Admin Dashboard)

```bash
cd web
npm install @sentry/nextjs --save
```

**Run Sentry wizard:**

```bash
npx @sentry/wizard@latest -i nextjs
```

This auto-configures Sentry for Next.js.

**Or manually create `sentry.client.config.js`:**

```javascript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: 'https://your-frontend-sentry-dsn@sentry.io/project-id',
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});
```

#### Mobile Apps Setup

```bash
cd apps/rider
npm install @sentry/react-native --save
```

**Initialize in `App.tsx`:**

```typescript
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://your-mobile-sentry-dsn@sentry.io/project-id',
  tracesSampleRate: 1.0,
  enableAutoSessionTracking: true,
  sessionTrackingIntervalMillis: 30000,
});

export default Sentry.wrap(App);
```

#### Features

**Sentry Dashboard:** https://sentry.io/

**You Get:**
- Real-time error alerts
- Stack traces with source maps
- User context (who experienced the error)
- Breadcrumbs (actions leading to error)
- Release tracking
- Performance monitoring
- Issue assignment and resolution tracking

**Configure Alerts:**
1. Go to your project → Settings → Alerts
2. Create alert rule:
   - Condition: Error count > 10 in 1 minute
   - Action: Send email to kenixcommodities@gmail.com
   - Action: Send webhook to Slack (optional)

---

### Option 2: Rollbar

**Alternative to Sentry, similar features.**

**Cost:** Free for 5K events/month, $25/month for 25K events

```bash
npm install rollbar --save
```

---

## Database Monitoring

### MongoDB Atlas Built-in Monitoring (Recommended)

**Included free with Atlas.**

#### Setup

1. **Login to MongoDB Atlas**
   - Go to https://cloud.mongodb.com/
   - Select your cluster

2. **Metrics Tab**
   - Real-time metrics dashboard
   - Historical data (last 7 days free, longer with paid tiers)

**Metrics Available:**
- Operations per second (read/write)
- Query execution time
- Connection count
- Disk IOPS
- Network throughput
- Replication lag
- Opcounters
- Index usage

3. **Performance Advisor**
   - Go to cluster → Performance Advisor
   - Shows:
     - Slow queries (>100ms)
     - Index recommendations
     - Schema anti-patterns

4. **Real-time Performance Panel**
   - Click "Real-time" tab
   - Shows live queries
   - Operation types
   - Duration
   - Kill long-running queries

5. **Alerts**
   - Go to Project → Alerts
   - Create alert:
     - Metric: Connections % of configured limit
     - Threshold: > 80%
     - Action: Email kenixcommodities@gmail.com

**Recommended Alerts:**
- [ ] Connections > 80% of limit
- [ ] Replication lag > 10 seconds
- [ ] Disk utilization > 75%
- [ ] CPU > 80% for 5 minutes
- [ ] Slow queries > 100/minute

#### Query Profiler

**Enable profiling:**

```javascript
// Connect to MongoDB
mongo "mongodb+srv://cluster.mongodb.net/kenix_production" --username admin

// Enable profiling (captures queries > 100ms)
db.setProfilingLevel(1, { slowms: 100 });

// View slow queries
db.system.profile.find().sort({ ts: -1 }).limit(10).pretty();

// Disable profiling (after debugging)
db.setProfilingLevel(0);
```

---

### Option 2: MongoDB Compass

**Free GUI tool for local monitoring.**

1. **Download:** https://www.mongodb.com/products/compass
2. **Connect to cluster:** Use your MongoDB URI
3. **Features:**
   - Visual explain plans
   - Index management
   - Schema analysis
   - Query performance

---

## Uptime Monitoring

### Option 1: UptimeRobot (Recommended)

**Why:** Simple, reliable, free tier generous.

**Cost:** Free for 50 monitors (5-minute checks), $7/month for 1-minute checks

#### Setup

1. **Sign Up**
   - Go to https://uptimerobot.com/
   - Create free account

2. **Add Monitors**

   **Backend API Health Check:**
   - Monitor Type: HTTP(s)
   - Friendly Name: Kenix API - Health
   - URL: https://api.kenixcommodities.com/health
   - Monitoring Interval: 5 minutes (free) or 1 minute (paid)
   - Alert Contacts: Add your email

   **Backend API Login Endpoint:**
   - Monitor Type: HTTP(s) - Keyword
   - Friendly Name: Kenix API - Login
   - URL: https://api.kenixcommodities.com/api/auth/login
   - HTTP Method: HEAD
   - Keyword: (leave blank, just check 200 response)
   - Monitoring Interval: 5 minutes

   **Admin Dashboard:**
   - Monitor Type: HTTP(s)
   - Friendly Name: Kenix Dashboard
   - URL: https://dashboard.kenixcommodities.com
   - Monitoring Interval: 5 minutes

   **MongoDB Atlas:**
   - Cannot directly monitor (not publicly accessible)
   - Monitor indirectly via API health check

3. **Configure Alerts**
   - Alert Contacts → Add Contact
   - Email: kenixcommodities@gmail.com
   - SMS: +254XXXXXXXXX (optional, requires paid plan)
   - Webhook: https://hooks.slack.com/... (if using Slack)

4. **Create Public Status Page (Optional)**
   - Go to "Public Status Pages"
   - Create page: https://status.kenixcommodities.com
   - Select monitors to display
   - Share URL with stakeholders

**Features:**
- Email/SMS/Webhook alerts
- Downtime history
- Response time tracking
- SSL certificate monitoring (expiry alerts)
- Public status page

---

### Option 2: Pingdom

**Premium alternative with advanced features.**

**Cost:** $10/month (10 monitors), $42/month (50 monitors)

**Features:**
- Transaction monitoring (multi-step user flows)
- Real user monitoring (RUM)
- Page speed monitoring
- Global check locations

---

### Option 3: StatusCake

**Another alternative, similar to UptimeRobot.**

**Cost:** Free for 10 monitors (5-minute checks)

---

## Log Management

### Option 1: PM2 Logs + Log Rotation (Built-in)

**For small-scale deployments.**

```bash
# View logs
pm2 logs kenix-api

# View last 100 lines
pm2 logs kenix-api --lines 100

# Stream only errors
pm2 logs kenix-api --err

# Clear logs
pm2 flush

# Logs location
ls ~/.pm2/logs/
# kenix-api-out.log (stdout)
# kenix-api-error.log (stderr)
```

**Log rotation already configured** (see Application Monitoring section).

**Search logs:**

```bash
# Search for error keyword
grep "error" ~/.pm2/logs/kenix-api-error.log

# Search for specific date
grep "2025-11-09" ~/.pm2/logs/kenix-api-out.log

# Count errors today
grep "$(date +%Y-%m-%d)" ~/.pm2/logs/kenix-api-error.log | wc -l
```

---

### Option 2: CloudWatch Logs (AWS)

**If deploying on AWS EC2.**

#### Setup

```bash
# Install CloudWatch agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i amazon-cloudwatch-agent.deb

# Configure agent
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-config-wizard
```

**Follow wizard, configure:**
- Collect logs: Yes
- Log file path: `/home/ubuntu/.pm2/logs/kenix-api-out.log`
- Log group name: `kenix-production-logs`
- Log stream name: `{instance_id}-application`

**Start agent:**

```bash
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config \
  -m ec2 \
  -s \
  -c file:/opt/aws/amazon-cloudwatch-agent/etc/config.json
```

**View logs:**
- Go to AWS Console → CloudWatch → Log groups
- Search, filter, and create metric filters

**Cost:** $0.50 per GB ingested, $0.03 per GB stored/month

---

### Option 3: Papertrail (Centralized Logging)

**Why:** Easy setup, powerful search, 7-day retention free.

**Cost:** Free for 50 MB/month, $7/month for 1 GB

#### Setup

1. **Sign Up**
   - Go to https://papertrailapp.com/
   - Create account

2. **Get Destination**
   - Settings → Log Destinations
   - Copy: `logs7.papertrailapp.com:XXXXX`

3. **Configure rsyslog on Server**

```bash
# Install rsyslog (usually pre-installed)
sudo apt install rsyslog

# Configure remote logging
echo "*.*          @logs7.papertrailapp.com:XXXXX" | sudo tee /etc/rsyslog.d/95-papertrail.conf

# Restart rsyslog
sudo systemctl restart rsyslog
```

4. **Send PM2 logs to Papertrail**

```bash
# Install remote_syslog2
wget https://github.com/papertrail/remote_syslog2/releases/download/v0.20/remote_syslog_linux_amd64.tar.gz
tar xzf remote_syslog_linux_amd64.tar.gz
sudo mv remote_syslog/remote_syslog /usr/local/bin/

# Create config
sudo nano /etc/log_files.yml
```

**Paste:**

```yaml
files:
  - /home/ubuntu/.pm2/logs/kenix-api-out.log
  - /home/ubuntu/.pm2/logs/kenix-api-error.log
  - /var/log/nginx/kenix-api-access.log
  - /var/log/nginx/kenix-api-error.log
destination:
  host: logs7.papertrailapp.com
  port: XXXXX
  protocol: tls
```

**Start as service:**

```bash
sudo remote_syslog

# Or run as systemd service (create unit file)
```

5. **View Logs**
   - Go to https://papertrailapp.com/events
   - Search: `error`
   - Filter by source, time range
   - Save searches
   - Create alerts

**Alerts:**
- Settings → Alerts
- Condition: "error" appears > 10 times in 5 minutes
- Action: Email kenixcommodities@gmail.com

---

### Option 4: ELK Stack (Elasticsearch, Logstash, Kibana)

**For large-scale, self-hosted logging.**

**Pros:** Powerful search, visualization, unlimited retention
**Cons:** Complex setup, resource-intensive

**Cost:** Free (self-hosted), or Elastic Cloud $95/month+

---

## Performance Monitoring

### Application Performance

**Already covered in:**
- PM2 Plus (response times, throughput)
- New Relic (transaction tracing)
- Datadog (APM)

### Infrastructure Monitoring

**CPU, Memory, Disk, Network**

#### Option 1: PM2 Plus (Basic)

Already monitors:
- CPU %
- Memory usage
- Event loop latency

#### Option 2: AWS CloudWatch (If on AWS)

**Automatic metrics for EC2:**
- CPU utilization
- Network in/out
- Disk read/write
- Status checks

**Custom metrics:**

```bash
# Install CloudWatch agent (see Log Management section)
# Agent auto-collects system metrics
```

**View:**
- AWS Console → CloudWatch → Metrics → EC2

#### Option 3: Netdata (Self-Hosted)

**Why:** Real-time, beautiful dashboards, free.

**Setup:**

```bash
# Install Netdata
bash <(curl -Ss https://my-netdata.io/kickstart.sh)

# Access dashboard
# http://[Your-Server-IP]:19999

# Secure with Nginx reverse proxy (recommended)
sudo nano /etc/nginx/sites-available/netdata
```

**Add:**

```nginx
server {
    listen 80;
    server_name netdata.kenixcommodities.com;

    location / {
        proxy_pass http://127.0.0.1:19999;
        proxy_set_header Host $host;
    }
}
```

**Enable and restart:**

```bash
sudo ln -s /etc/nginx/sites-available/netdata /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

**Access:** http://netdata.kenixcommodities.com

**Features:**
- 1-second granularity metrics
- Zero configuration
- Low overhead
- Custom charts
- Alarms (built-in)

---

### Network Monitoring

**Track API latency from different locations.**

**Tool: Pingdom / StatusCake** (already configured in Uptime Monitoring)

**Shows:**
- Response time from multiple continents
- Network path analysis
- DNS resolution time
- SSL handshake time
- Time to first byte

---

## Alerting Strategy

### Alert Fatigue Prevention

**Best Practices:**
- ❌ Don't alert on everything
- ✅ Alert only on actionable issues
- ✅ Use different severity levels
- ✅ Escalate based on severity
- ✅ Group related alerts

### Severity Levels

**Critical (Immediate Action Required):**
- Production API down (> 5 minutes)
- Database unreachable
- Payment gateway failing
- Data corruption detected
- Security breach

**Action:** SMS + Email + Phone call (if available)

**High (Action Required Soon):**
- API error rate > 5%
- Response time > 5 seconds
- CPU > 90% for 10 minutes
- Memory > 95%
- Disk space < 5%

**Action:** Email + Slack notification

**Medium (Monitor Closely):**
- API error rate > 2%
- Response time > 2 seconds
- CPU > 80% for 30 minutes
- Slow database queries

**Action:** Email (daily digest)

**Low (Informational):**
- SSL certificate expiring in 30 days
- Dependency updates available
- Weekly performance report

**Action:** Email (weekly digest)

### Alert Channels

**Email:**
- kenixcommodities@gmail.com
- All severity levels

**SMS (Optional, requires paid plans):**
- +254XXXXXXXXX
- Critical alerts only

**Slack (Optional):**
- #alerts channel
- High and Critical alerts

**PagerDuty (Optional, for 24/7 on-call):**
- Escalation policies
- Critical alerts

### Alert Configuration Matrix

| Service | Alert Type | Threshold | Severity | Channel |
|---------|-----------|-----------|----------|---------|
| UptimeRobot | API Down | > 5 min | Critical | SMS + Email |
| PM2 Plus | CPU High | > 90% for 10 min | High | Email |
| PM2 Plus | Memory High | > 95% | High | Email |
| Sentry | Error Spike | > 50 errors/min | High | Email + Slack |
| MongoDB Atlas | Connections | > 80% of limit | High | Email |
| MongoDB Atlas | Disk Full | > 90% | Critical | SMS + Email |
| PM2 Plus | Process Restart | Any | Medium | Email |
| Certbot | SSL Expiry | < 30 days | Medium | Email |

---

## Metrics Dashboard

### Option 1: Grafana (Open Source)

**Why:** Beautiful dashboards, supports multiple data sources.

**Setup:**

```bash
# Install Grafana
sudo apt-get install -y software-properties-common
sudo add-apt-repository "deb https://packages.grafana.com/oss/deb stable main"
wget -q -O - https://packages.grafana.com/gpg.key | sudo apt-key add -
sudo apt-get update
sudo apt-get install grafana

# Start Grafana
sudo systemctl start grafana-server
sudo systemctl enable grafana-server

# Access: http://[Your-Server-IP]:3000
# Default login: admin / admin
```

**Configure:**
1. Add data sources (MongoDB, Prometheus, etc.)
2. Import dashboards (https://grafana.com/grafana/dashboards/)
3. Create custom dashboards

**Recommended Dashboards:**
- Node.js Application Metrics
- MongoDB Dashboard
- Nginx Dashboard
- System Metrics

---

### Option 2: Datadog / New Relic Dashboards

**Already included if using these services.**

---

## Incident Response

### Incident Response Playbook

**When alert triggers:**

**1. Acknowledge**
   - Acknowledge alert (prevents duplicate notifications)
   - Log incident start time

**2. Assess Severity**
   - Critical: Drop everything, investigate immediately
   - High: Investigate within 1 hour
   - Medium: Investigate within 4 hours
   - Low: Investigate next business day

**3. Investigate**
   - Check logs (Papertrail, PM2 logs)
   - Check error tracking (Sentry)
   - Check metrics (PM2 Plus, Datadog)
   - Check infrastructure (AWS Console, Netdata)
   - Check database (MongoDB Atlas)
   - Check external services (M-Pesa status, Africa's Talking)

**4. Diagnose**
   - Identify root cause
   - Document findings

**5. Resolve**
   - Apply fix
   - Verify resolution
   - Monitor for recurrence

**6. Post-Mortem**
   - Document incident
   - Root cause analysis
   - Preventive measures
   - Update runbooks

---

### On-Call Rotation (For Teams)

**Tools:**
- PagerDuty ($19/user/month)
- VictorOps ($29/user/month)
- Opsgenie ($9/user/month)

**Schedule:**
- Primary on-call: 1 week rotation
- Secondary on-call: Backup
- Escalation: After 15 minutes no response

---

## Monitoring Checklist

**Ensure all monitoring is configured:**

### Infrastructure
- [ ] CPU monitoring (PM2 Plus, CloudWatch, or Netdata)
- [ ] Memory monitoring
- [ ] Disk space monitoring
- [ ] Network monitoring
- [ ] Process monitoring (PM2)

### Application
- [ ] API uptime monitoring (UptimeRobot)
- [ ] Response time monitoring
- [ ] Error tracking (Sentry)
- [ ] Request rate monitoring
- [ ] WebSocket connection monitoring

### Database
- [ ] MongoDB Atlas monitoring enabled
- [ ] Slow query alerts configured
- [ ] Connection pool monitoring
- [ ] Disk usage alerts

### External Services
- [ ] M-Pesa API monitoring
- [ ] Africa's Talking SMS monitoring
- [ ] Google Maps API quota monitoring
- [ ] GCP storage monitoring

### Logs
- [ ] Application logs centralized (Papertrail or CloudWatch)
- [ ] Nginx access logs
- [ ] Nginx error logs
- [ ] Log rotation configured
- [ ] Log retention policy set

### Alerts
- [ ] Email alerts configured
- [ ] SMS alerts for critical issues (optional)
- [ ] Slack notifications (optional)
- [ ] Alert escalation policies
- [ ] Alert fatigue reviewed

---

## Monitoring Costs Summary

**Free Tier (Minimal Budget):**
- PM2 logs + log rotation: **Free**
- UptimeRobot (50 monitors, 5-min checks): **Free**
- MongoDB Atlas monitoring: **Free** (included)
- Sentry (5K errors/month): **Free**
- Papertrail (50 MB logs/month): **Free**
- **Total: $0/month**

**Recommended Tier (Small Business):**
- PM2 Plus (1 server): **Free**
- UptimeRobot (1-min checks): **$7/month**
- MongoDB Atlas monitoring: **Free**
- Sentry (50K errors/month): **$26/month**
- Papertrail (1 GB logs/month): **$7/month**
- **Total: $40/month**

**Enterprise Tier:**
- New Relic APM: **$99/month**
- Datadog (Infrastructure + APM): **$46/month**
- PagerDuty (on-call): **$19/user/month**
- **Total: $164/month**

---

## Next Steps

1. **Implement monitoring** following this guide
2. **Configure alerts** based on your SLA requirements
3. **Create dashboards** for key metrics
4. **Test incident response** with simulated failures
5. **Review and optimize** monitoring weekly

---

**Document Version:** 1.0.0
**Last Updated:** 2025-11-09
