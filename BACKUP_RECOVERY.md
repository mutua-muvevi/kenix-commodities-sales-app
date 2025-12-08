# Kenix Commodities - Backup & Disaster Recovery

**Version:** 1.0.0
**Last Updated:** 2025-11-09
**Recovery Time Objective (RTO):** 4 hours
**Recovery Point Objective (RPO):** 1 hour

---

## Table of Contents

1. [Overview](#overview)
2. [Backup Strategy](#backup-strategy)
3. [MongoDB Backups](#mongodb-backups)
4. [Application Code Backups](#application-code-backups)
5. [Configuration Backups](#configuration-backups)
6. [Media Files Backups](#media-files-backups)
7. [Backup Verification](#backup-verification)
8. [Disaster Recovery Procedures](#disaster-recovery-procedures)
9. [Recovery Testing](#recovery-testing)
10. [Backup Retention Policy](#backup-retention-policy)

---

## Overview

A comprehensive backup and disaster recovery plan ensures business continuity and data protection for Kenix Commodities.

**What We Protect:**
- Database (MongoDB) - Critical
- Application code - Critical
- Environment configuration - Critical
- Media files (product images, delivery photos) - Important
- Server configuration - Important
- Logs - Nice to have

**Backup Objectives:**
- **RTO (Recovery Time Objective):** 4 hours max
  - Time to restore service after disaster
- **RPO (Recovery Point Objective):** 1 hour max
  - Maximum data loss acceptable

**Disaster Scenarios:**
- Database corruption
- Server failure/crash
- Accidental data deletion
- Ransomware attack
- Natural disaster (data center failure)
- Human error (bad deployment)
- Third-party service outage

---

## Backup Strategy

### Backup Layers (3-2-1 Rule)

**3 copies of data:**
- 1 production database (MongoDB Atlas)
- 1 automated backup (Atlas continuous backup)
- 1 manual export (weekly full dump)

**2 different media types:**
- Cloud storage (Atlas backups)
- Local/different cloud (manual dumps to AWS S3)

**1 offsite copy:**
- Atlas backups in different region
- Or S3 cross-region replication

### Backup Schedule

| Data Type | Frequency | Retention | Method |
|-----------|-----------|-----------|--------|
| Database | Continuous | 7 days | MongoDB Atlas automatic |
| Database | Daily | 30 days | Automated mongodump to S3 |
| Database | Weekly | 90 days | Manual full export |
| Code | On commit | Forever | Git repository |
| Config files | Daily | 30 days | Automated script to S3 |
| Media files | Daily | 90 days | GCP bucket versioning |
| Server config | Weekly | 30 days | Manual snapshot |
| Logs | Daily | 30 days | Log rotation + archive |

---

## MongoDB Backups

### Option 1: MongoDB Atlas Automatic Backups (Recommended)

**Already enabled if using Atlas M10+ cluster.**

#### Features

**Continuous Backups:**
- Point-in-time recovery to any moment in last 7 days
- Incremental backups every 6-12 hours
- Oplog snapshots for precise recovery
- Zero performance impact

**How to Access:**

1. **Login to MongoDB Atlas**
   - Go to https://cloud.mongodb.com/
   - Select your cluster

2. **Navigate to Backups**
   - Click "Backup" tab
   - View available snapshots

3. **View Snapshots**
   - Scheduled snapshots (daily)
   - Continuous snapshots (every 6-12 hours)
   - Point-in-time options

#### Restore from Atlas Backup

**Scenario: Need to restore database to 2 hours ago**

1. **Go to Backup Tab**
   - Select your cluster
   - Click "Backup" → "Snapshots"

2. **Choose Restore Point**
   - Option A: Select a snapshot (e.g., "Daily Snapshot - 2025-11-09 02:00 UTC")
   - Option B: Point-in-time (e.g., "2025-11-09 14:30 UTC")

3. **Restore Options**

   **Option A: Download Snapshot**
   - Click "..." → "Download"
   - Downloads .tar.gz file
   - Extract and restore locally:
     ```bash
     tar -xzf snapshot.tar.gz
     mongorestore --uri="mongodb://localhost:27017/kenix_restored" dump/
     ```

   **Option B: Restore to New Cluster (Recommended)**
   - Click "..." → "Restore"
   - Select "Automated restore"
   - Choose target cluster (create new cluster to avoid overwriting production)
   - Wait 10-30 minutes for restore
   - Verify data
   - Switch application to new cluster (update MONGO_URI)
   - Delete old cluster after confirmation

   **Option C: Query Existing Snapshot**
   - Click "..." → "Query"
   - Opens MongoDB Compass connected to snapshot
   - Query data without restoring
   - Useful for recovering specific documents

4. **Verification**
   - Connect to restored database
   - Verify critical collections:
     ```bash
     mongo "restored_uri"
     db.users.countDocuments()
     db.products.countDocuments()
     db.orders.countDocuments()
     ```
   - Check recent data exists
   - Verify data integrity

5. **Switch Production (if full restore)**
   - Update `config.env`:
     ```env
     MONGO_URI=mongodb+srv://new-cluster-uri
     ```
   - Restart application:
     ```bash
     pm2 restart kenix-api
     ```
   - Monitor for errors

**Time to Restore:** 30 minutes - 2 hours (depending on database size)

---

### Option 2: Automated Daily Backups to AWS S3

**For additional backup layer and compliance.**

#### Setup Automated Backup Script

**Create backup script:**

```bash
sudo nano /opt/kenix/backup-mongodb.sh
```

**Script content:**

```bash
#!/bin/bash

# Kenix Commodities - MongoDB Backup Script
# Runs daily via cron

set -e  # Exit on error

# Configuration
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/mongodb"
MONGO_URI="mongodb+srv://username:password@cluster.mongodb.net/kenix_production"
S3_BUCKET="s3://kenix-backups"
RETENTION_DAYS=30

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Perform backup
echo "[$(date)] Starting MongoDB backup..."
mongodump --uri="$MONGO_URI" --out="$BACKUP_DIR/kenix_$DATE" --gzip

# Verify backup
if [ $? -eq 0 ]; then
    echo "[$(date)] Backup successful: kenix_$DATE"
else
    echo "[$(date)] Backup FAILED!"
    exit 1
fi

# Compress backup
echo "[$(date)] Compressing backup..."
cd "$BACKUP_DIR"
tar -czf "kenix_$DATE.tar.gz" "kenix_$DATE"
rm -rf "kenix_$DATE"

# Upload to S3
echo "[$(date)] Uploading to S3..."
aws s3 cp "kenix_$DATE.tar.gz" "$S3_BUCKET/mongodb/" --storage-class STANDARD_IA

# Verify upload
if [ $? -eq 0 ]; then
    echo "[$(date)] Upload successful"
    rm -f "kenix_$DATE.tar.gz"  # Remove local copy after successful upload
else
    echo "[$(date)] Upload FAILED! Keeping local copy."
    exit 1
fi

# Clean old local backups (keep 7 days locally)
echo "[$(date)] Cleaning old local backups..."
find "$BACKUP_DIR" -type f -name "*.tar.gz" -mtime +7 -delete

# Clean old S3 backups (keep based on retention policy)
echo "[$(date)] Cleaning old S3 backups..."
aws s3 ls "$S3_BUCKET/mongodb/" | while read -r line; do
    createDate=$(echo $line | awk '{print $1" "$2}')
    createDate=$(date -d "$createDate" +%s)
    olderThan=$(date --date="$RETENTION_DAYS days ago" +%s)
    if [[ $createDate -lt $olderThan ]]; then
        fileName=$(echo $line | awk '{print $4}')
        if [[ $fileName != "" ]]; then
            aws s3 rm "$S3_BUCKET/mongodb/$fileName"
            echo "Deleted: $fileName"
        fi
    fi
done

echo "[$(date)] Backup process completed successfully!"
```

**Make executable:**

```bash
sudo chmod +x /opt/kenix/backup-mongodb.sh
```

#### Install MongoDB Database Tools

```bash
# Install mongodump/mongorestore
wget https://fastdl.mongodb.org/tools/db/mongodb-database-tools-ubuntu2204-x86_64-100.9.0.deb
sudo dpkg -i mongodb-database-tools-ubuntu2204-x86_64-100.9.0.deb
```

#### Install AWS CLI

```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure AWS credentials
aws configure
# AWS Access Key ID: your_key
# AWS Secret Access Key: your_secret
# Default region: us-east-1
# Default output format: json
```

#### Create S3 Bucket

```bash
# Create bucket for backups
aws s3 mb s3://kenix-backups --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket kenix-backups \
  --versioning-configuration Status=Enabled

# Enable server-side encryption
aws s3api put-bucket-encryption \
  --bucket kenix-backups \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'
```

#### Schedule Daily Backups

```bash
# Edit crontab
crontab -e

# Add this line (runs daily at 2 AM)
0 2 * * * /opt/kenix/backup-mongodb.sh >> /var/log/kenix-backup.log 2>&1

# Or run every 6 hours
0 */6 * * * /opt/kenix/backup-mongodb.sh >> /var/log/kenix-backup.log 2>&1
```

#### Test Backup Script

```bash
# Run manually to test
sudo /opt/kenix/backup-mongodb.sh

# Check logs
cat /var/log/kenix-backup.log

# Verify S3 upload
aws s3 ls s3://kenix-backups/mongodb/
```

---

### Option 3: Manual Weekly Backups

**For additional safety net.**

```bash
# Create manual backup
mongodump --uri="your_mongo_uri" --out=/backups/manual_$(date +%Y%m%d) --gzip

# Compress
cd /backups
tar -czf manual_backup_$(date +%Y%m%d).tar.gz manual_$(date +%Y%m%d)

# Upload to Google Drive or Dropbox (manual)
# Or store on external hard drive
```

---

## Application Code Backups

### Git Repository (Primary Backup)

**Already backed up** if using GitHub/GitLab/Bitbucket.

**Best Practices:**

```bash
# Commit frequently
git add .
git commit -m "Descriptive commit message"
git push origin main

# Tag releases
git tag -a v1.0.0 -m "Production release 1.0.0"
git push origin v1.0.0

# Use branches for features
git checkout -b feature/new-feature
# ... make changes ...
git push origin feature/new-feature
```

**Recovery:**
```bash
# Clone repository to new server
git clone https://github.com/yourusername/kenix-commodities.git

# Checkout specific version if needed
git checkout v1.0.0
```

---

### Server Code Backup (Additional Layer)

**Daily backup of deployed code:**

```bash
# Create backup script
sudo nano /opt/kenix/backup-code.sh
```

**Script:**

```bash
#!/bin/bash

DATE=$(date +%Y%m%d)
BACKUP_DIR="/var/backups/code"
APP_DIR="/var/www/kenix-commodities"
S3_BUCKET="s3://kenix-backups/code"

mkdir -p "$BACKUP_DIR"

# Backup code (exclude node_modules)
tar -czf "$BACKUP_DIR/kenix-code-$DATE.tar.gz" \
  --exclude='node_modules' \
  --exclude='.git' \
  -C /var/www kenix-commodities

# Upload to S3
aws s3 cp "$BACKUP_DIR/kenix-code-$DATE.tar.gz" "$S3_BUCKET/"

# Clean old backups (keep 7 days)
find "$BACKUP_DIR" -type f -name "*.tar.gz" -mtime +7 -delete

echo "Code backup completed: kenix-code-$DATE.tar.gz"
```

**Schedule:**

```bash
crontab -e
# Daily at 3 AM
0 3 * * * /opt/kenix/backup-code.sh >> /var/log/kenix-backup.log 2>&1
```

---

## Configuration Backups

### Environment Files Backup

**Critical files to backup:**
- `server/config.env`
- `web/.env.production`
- GCP service account key file
- SSL certificates
- Nginx configuration

**Backup script:**

```bash
#!/bin/bash

DATE=$(date +%Y%m%d)
BACKUP_DIR="/var/backups/config"
S3_BUCKET="s3://kenix-backups/config"

mkdir -p "$BACKUP_DIR/kenix-config-$DATE"

# Backup environment files
cp /var/www/kenix-commodities/server/config.env "$BACKUP_DIR/kenix-config-$DATE/"
cp /var/www/kenix-commodities/server/config/*.json "$BACKUP_DIR/kenix-config-$DATE/" 2>/dev/null || true

# Backup Nginx config
cp /etc/nginx/sites-available/kenix-api "$BACKUP_DIR/kenix-config-$DATE/nginx-kenix-api"

# Backup SSL certificates
cp -r /etc/letsencrypt "$BACKUP_DIR/kenix-config-$DATE/letsencrypt" 2>/dev/null || true

# Backup PM2 config
pm2 save
cp ~/.pm2/dump.pm2 "$BACKUP_DIR/kenix-config-$DATE/"

# Encrypt backup (contains secrets!)
tar -czf - "$BACKUP_DIR/kenix-config-$DATE" | \
  openssl enc -aes-256-cbc -salt -pbkdf2 -out "$BACKUP_DIR/kenix-config-$DATE.tar.gz.enc" -k "YOUR_ENCRYPTION_PASSWORD"

# Remove unencrypted files
rm -rf "$BACKUP_DIR/kenix-config-$DATE"

# Upload to S3
aws s3 cp "$BACKUP_DIR/kenix-config-$DATE.tar.gz.enc" "$S3_BUCKET/"

# Clean old backups
find "$BACKUP_DIR" -type f -name "*.enc" -mtime +30 -delete

echo "Config backup completed (encrypted)"
```

**Important:** Store encryption password in secure password manager!

**Recovery:**

```bash
# Download from S3
aws s3 cp s3://kenix-backups/config/kenix-config-20251109.tar.gz.enc .

# Decrypt
openssl enc -aes-256-cbc -d -pbkdf2 -in kenix-config-20251109.tar.gz.enc -out kenix-config-20251109.tar.gz -k "YOUR_ENCRYPTION_PASSWORD"

# Extract
tar -xzf kenix-config-20251109.tar.gz

# Restore files
cp kenix-config-20251109/config.env /var/www/kenix-commodities/server/
cp kenix-config-20251109/nginx-kenix-api /etc/nginx/sites-available/kenix-api
# etc.
```

---

## Media Files Backups

### Google Cloud Storage Versioning

**Enable object versioning on GCP bucket:**

1. **Enable Versioning**
   ```bash
   gsutil versioning set on gs://kenix-products-production
   ```

2. **Verify**
   ```bash
   gsutil versioning get gs://kenix-products-production
   ```

**Features:**
- Every object update creates new version
- Old versions retained based on lifecycle policy
- Can restore deleted files

**Restore deleted file:**

```bash
# List versions of a file
gsutil ls -a gs://kenix-products-production/products/image.jpg

# Output shows:
# gs://kenix-products-production/products/image.jpg#1699123456789000 (live)
# gs://kenix-products-production/products/image.jpg#1698123456789000 (archived)

# Restore old version (copy to live)
gsutil cp gs://kenix-products-production/products/image.jpg#1698123456789000 \
  gs://kenix-products-production/products/image.jpg
```

---

### GCP Bucket Cross-Region Replication

**For disaster recovery, replicate bucket to different region:**

```bash
# Create second bucket in different region
gsutil mb -l us-central1 gs://kenix-products-backup

# Set up bucket-to-bucket transfer (requires GCP Transfer Service)
# Or use gsutil rsync daily:
gsutil -m rsync -r -d gs://kenix-products-production gs://kenix-products-backup
```

**Schedule daily sync:**

```bash
# Crontab
0 4 * * * gsutil -m rsync -r -d gs://kenix-products-production gs://kenix-products-backup >> /var/log/gcp-sync.log 2>&1
```

---

## Backup Verification

**Backups are useless if they can't be restored!**

### Monthly Backup Test Procedure

**Schedule:** 1st day of each month

**Test Checklist:**

1. **Database Restore Test**
   ```bash
   # Download latest backup from S3
   aws s3 cp s3://kenix-backups/mongodb/kenix_latest.tar.gz .

   # Extract
   tar -xzf kenix_latest.tar.gz

   # Restore to test database
   mongorestore --uri="mongodb://localhost:27017/kenix_test" kenix_latest/

   # Verify data
   mongo mongodb://localhost:27017/kenix_test
   db.users.countDocuments()  # Should match production count (approximately)
   db.orders.countDocuments()

   # Clean up test database
   mongo mongodb://localhost:27017/kenix_test --eval "db.dropDatabase()"
   ```

2. **Configuration Restore Test**
   ```bash
   # Download and decrypt config backup
   aws s3 cp s3://kenix-backups/config/kenix-config-latest.tar.gz.enc .
   openssl enc -aes-256-cbc -d -pbkdf2 -in kenix-config-latest.tar.gz.enc -out kenix-config-latest.tar.gz -k "PASSWORD"
   tar -xzf kenix-config-latest.tar.gz

   # Verify files present
   ls -la kenix-config-latest/
   # Should show: config.env, nginx config, etc.
   ```

3. **Media Files Test**
   ```bash
   # Verify GCP bucket accessible
   gsutil ls gs://kenix-products-production | head -10

   # Download random sample file
   gsutil cp gs://kenix-products-production/products/sample.jpg .
   file sample.jpg  # Verify it's valid image
   ```

4. **Code Restore Test**
   ```bash
   # Clone repository to test directory
   git clone https://github.com/yourusername/kenix-commodities.git kenix-test
   cd kenix-test

   # Verify latest commit matches production
   git log -1

   # Install dependencies
   cd server
   npm install

   # Verify no errors
   ```

**Document results** in backup test log:

```
Backup Test - 2025-11-01
- Database restore: PASS (restored 15,234 documents in 2 min 30 sec)
- Config restore: PASS (all files decrypted successfully)
- Media files: PASS (bucket accessible, sample file valid)
- Code restore: PASS (repository cloned, dependencies installed)
Notes: None
Tested by: Admin Name
```

---

## Disaster Recovery Procedures

### Scenario 1: Database Corruption

**Symptoms:**
- Application errors: "Database connection failed"
- MongoDB Atlas alerts: "Cluster unhealthy"
- Data inconsistencies

**Recovery Steps:**

1. **Assess Damage**
   - Connect to MongoDB Atlas
   - Check cluster health
   - Identify corrupted collections

2. **Stop Application (Prevent Further Damage)**
   ```bash
   pm2 stop kenix-api
   ```

3. **Restore from Atlas Backup**
   - Follow "MongoDB Backups → Option 1" above
   - Restore to point-in-time before corruption
   - Use new cluster for restore

4. **Verify Restored Data**
   - Count documents in all collections
   - Check recent orders still exist
   - Verify user accounts intact

5. **Update Application Configuration**
   ```bash
   nano /var/www/kenix-commodities/server/config.env
   # Update MONGO_URI to new cluster
   ```

6. **Restart Application**
   ```bash
   pm2 restart kenix-api
   pm2 logs kenix-api  # Monitor for errors
   ```

7. **Notify Stakeholders**
   - Inform team of incident
   - Estimate data loss (RPO)
   - Communicate to users if necessary

**Estimated Recovery Time:** 1-2 hours

**Potential Data Loss:** Up to 1 hour (RPO)

---

### Scenario 2: Server Failure / Crash

**Symptoms:**
- Server unreachable via SSH
- API down (UptimeRobot alerts)
- Cannot access AWS console for instance

**Recovery Steps:**

1. **Assess Situation**
   - Check AWS Console → EC2 → Instance status
   - Check system logs (if accessible)
   - Determine if hardware or software failure

2. **Attempt Server Restart**
   ```bash
   # Via AWS Console
   # EC2 → Instances → Select instance → Instance State → Reboot
   ```

3. **If Reboot Fails: Launch New Server**

   **Quick Recovery (assuming database intact):**

   a. **Launch new EC2 instance**
      - Same instance type (t3.medium)
      - Same security groups
      - Use latest Ubuntu 22.04 LTS AMI

   b. **Attach Elastic IP**
      - Disassociate from old instance
      - Associate to new instance
      - DNS automatically resolves to new server

   c. **Install dependencies** (see DEPLOYMENT_GUIDE.md)
      ```bash
      # Node.js, PM2, Nginx, Certbot
      ```

   d. **Restore application code**
      ```bash
      git clone https://github.com/yourusername/kenix-commodities.git /var/www/kenix-commodities
      cd /var/www/kenix-commodities/server
      npm install --production
      ```

   e. **Restore configuration**
      ```bash
      # Download from S3
      aws s3 cp s3://kenix-backups/config/kenix-config-latest.tar.gz.enc .

      # Decrypt and extract
      openssl enc -aes-256-cbc -d -pbkdf2 -in kenix-config-latest.tar.gz.enc -out kenix-config-latest.tar.gz -k "PASSWORD"
      tar -xzf kenix-config-latest.tar.gz

      # Copy files
      cp kenix-config-latest/config.env /var/www/kenix-commodities/server/
      cp kenix-config-latest/*.json /var/www/kenix-commodities/server/config/
      cp kenix-config-latest/nginx-kenix-api /etc/nginx/sites-available/kenix-api
      ```

   f. **Configure Nginx**
      ```bash
      ln -s /etc/nginx/sites-available/kenix-api /etc/nginx/sites-enabled/
      nginx -t
      systemctl restart nginx
      ```

   g. **Obtain SSL certificate**
      ```bash
      certbot --nginx -d api.kenixcommodities.com
      ```

   h. **Start application**
      ```bash
      cd /var/www/kenix-commodities/server
      pm2 start index.js --name kenix-api
      pm2 save
      pm2 startup
      ```

   i. **Verify service**
      ```bash
      curl https://api.kenixcommodities.com/health
      # Should return: healthy
      ```

4. **Post-Recovery**
   - Monitor logs for errors
   - Verify all endpoints working
   - Check database connections
   - Test critical workflows
   - Investigate root cause of failure

**Estimated Recovery Time:** 2-4 hours

**Potential Data Loss:** None (database in Atlas, not affected)

---

### Scenario 3: Accidental Data Deletion

**Example:** Admin accidentally deletes 100 products

**Recovery Steps:**

1. **Immediate Action: Stop Further Operations**
   - Don't panic
   - Note exact time of deletion
   - Stop any automated processes

2. **Determine Scope**
   - How many records deleted?
   - Which collections affected?
   - Exact time of deletion?

3. **Point-in-Time Restore (Specific Collection)**

   **Option A: Restore entire database to before deletion**
   - Follow standard restore procedure
   - Restore to 5 minutes before deletion
   - **Drawback:** Lose all data created after deletion

   **Option B: Export deleted data from backup, import to production**

   ```bash
   # Restore backup to temporary cluster
   # (via Atlas: Restore to new cluster)

   # Export specific collection from backup
   mongoexport --uri="mongodb+srv://backup-cluster-uri/kenix_production" \
     --collection=products \
     --out=products_backup.json

   # Import missing products to production
   # (First, identify which products are missing)

   # Compare IDs, extract only missing products
   # Then import
   mongoimport --uri="mongodb+srv://production-cluster-uri/kenix_production" \
     --collection=products \
     --file=products_missing.json
   ```

   **Option C: Query backup snapshot directly (Atlas)**
   - Atlas → Backups → Query snapshot
   - Find deleted products
   - Export as JSON
   - Re-insert to production manually or via script

4. **Verify Restoration**
   - Count products in production
   - Verify specific products restored
   - Check no duplicates created

5. **Implement Safeguards**
   - Add soft delete (deletedAt field instead of actual deletion)
   - Require confirmation for bulk deletes
   - Implement admin audit logs

**Estimated Recovery Time:** 30 minutes - 2 hours

**Potential Data Loss:** Depends on backup frequency (up to 1 hour with continuous backup)

---

### Scenario 4: Ransomware Attack

**Symptoms:**
- Files encrypted
- Ransom note demanding payment
- Cannot access server/database

**Recovery Steps:**

1. **Immediately Isolate**
   - Disconnect server from network (AWS: stop instance)
   - Change all passwords (database, AWS, email, etc.)
   - Revoke all API keys

2. **Assess Impact**
   - What systems affected?
   - Is database encrypted? (unlikely if using Atlas)
   - Are backups affected?

3. **DO NOT PAY RANSOM**
   - No guarantee of recovery
   - Funds criminal activity

4. **Restore from Clean Backup**
   - Launch new server (fresh Ubuntu instance)
   - Restore database from Atlas backup (before attack)
   - Restore application code from Git (clean)
   - Restore configuration from S3 backup
   - Do NOT restore from compromised server

5. **Investigate Breach**
   - How did attackers gain access?
   - Check SSH logs: `/var/log/auth.log`
   - Check for backdoors
   - Update all dependencies
   - Patch vulnerabilities

6. **Harden Security**
   - Change all passwords/keys
   - Enable 2FA on all accounts
   - Implement fail2ban
   - Restrict SSH to specific IPs
   - Update firewall rules
   - Review IAM permissions

7. **Legal/Reporting**
   - Report to authorities
   - Notify affected users (if PII compromised)
   - Document incident for insurance

**Estimated Recovery Time:** 4-8 hours

**Potential Data Loss:** Up to 24 hours (use oldest clean backup)

---

## Recovery Testing

### Quarterly Disaster Recovery Drill

**Schedule:** Every 3 months

**Objectives:**
- Verify backup/restore procedures work
- Train team on recovery processes
- Identify gaps in documentation
- Improve RTO/RPO

**Drill Scenario: Complete System Failure**

**Day 1: Preparation**
1. Schedule drill date (announce to team)
2. Prepare checklist
3. Designate roles:
   - Incident Commander
   - Database Recovery Lead
   - Application Recovery Lead
   - Communication Lead

**Day 2: Execution**

**09:00 - Simulate Disaster**
- Stop production application (PM2)
- Shut down server (AWS)
- Start timer

**09:05 - Initial Response**
- Incident Commander assesses situation
- Team assembles (via Slack/Teams)
- Communication Lead notifies stakeholders

**09:15 - Recovery Begins**

- **Database Team:** Restore MongoDB from Atlas backup
  - Restore to point-in-time (1 hour ago)
  - Verify data integrity
  - Time: Target 30 minutes

- **Application Team:** Launch new server
  - Provision EC2 instance
  - Install dependencies
  - Deploy application code from Git
  - Time: Target 60 minutes

- **Configuration Team:** Restore configs
  - Download from S3
  - Decrypt
  - Apply to new server
  - Time: Target 20 minutes

**10:30 - Service Restoration**
- Update DNS (if needed)
- Restart application
- Verify health checks
- Test critical workflows

**11:00 - Verification**
- Run smoke tests
- Verify data accuracy
- Check monitoring/alerts
- Confirm all services operational

**11:30 - Drill Complete**
- Stop timer
- Document total recovery time
- Gather team feedback

**Day 3: Post-Drill Analysis**

1. **Review Metrics**
   - Total recovery time: X hours (target: 4 hours)
   - RTO met? Yes/No
   - RPO met? Yes/No
   - Issues encountered?

2. **Identify Improvements**
   - What went well?
   - What went poorly?
   - Missing documentation?
   - Gaps in automation?

3. **Update Procedures**
   - Revise this document
   - Create runbooks for common tasks
   - Automate manual steps

4. **Action Items**
   - Assign owners
   - Set deadlines
   - Track completion

**Sample Drill Report:**

```
Disaster Recovery Drill - 2025-11-15

Scenario: Complete server failure + database restore

Results:
- Total Recovery Time: 3 hours 45 minutes (Target: 4 hours) ✅
- Database restored: 45 minutes
- New server launched: 90 minutes
- Application deployed: 60 minutes
- DNS propagation: 30 minutes

Issues:
1. SSL certificate renewal took 20 minutes (should be faster)
2. PM2 startup config missing (required manual setup)
3. GCP service account key not in backup (had to regenerate)

Action Items:
1. Automate SSL cert with Certbot scripts
2. Backup PM2 dump.pm2 file
3. Include GCP key in encrypted config backup
4. Create one-click server provisioning script

Team Feedback:
- Documentation was helpful
- Need clearer role assignments
- Communication worked well via Slack

Next Drill: 2026-02-15
```

---

## Backup Retention Policy

### Database Backups

**Atlas Continuous Backup:**
- Retention: 7 days (standard)
- Can be extended to 30+ days (paid upgrade)

**S3 Daily Backups:**
- Retention: 30 days
- After 30 days: Move to Glacier (archive storage, cheaper)
- After 90 days: Delete

**Lifecycle policy:**

```bash
# Create lifecycle policy for S3
aws s3api put-bucket-lifecycle-configuration \
  --bucket kenix-backups \
  --lifecycle-configuration file://lifecycle.json
```

**lifecycle.json:**

```json
{
  "Rules": [
    {
      "Id": "Archive old backups",
      "Status": "Enabled",
      "Filter": {
        "Prefix": "mongodb/"
      },
      "Transitions": [
        {
          "Days": 30,
          "StorageClass": "GLACIER"
        }
      ],
      "Expiration": {
        "Days": 90
      }
    }
  ]
}
```

**Cost Optimization:**
- Standard storage (0-30 days): $0.023/GB/month
- Glacier (30-90 days): $0.004/GB/month
- After 90 days: Deleted

**Example Cost (100 GB database):**
- Month 1: 100 GB × $0.023 = $2.30
- Month 2: 100 GB × $0.004 = $0.40
- Month 3: Deleted

**Total: ~$2.70/month for 90-day retention**

---

### Configuration Backups

- Retention: 30 days
- Encrypted storage (S3 Standard)
- Keep last 4 weekly backups permanently (archive)

---

### Code Backups

- Git repository: Forever (version control)
- Server code snapshots: 7 days (cleanup old)

---

### Media Files (GCP)

- Live files: Forever (user-uploaded content)
- Deleted files: Retain versions for 30 days, then purge
- Lifecycle policy:

```bash
# Create lifecycle.json
cat > lifecycle.json << EOF
{
  "lifecycle": {
    "rule": [
      {
        "action": {"type": "Delete"},
        "condition": {
          "age": 30,
          "isLive": false
        }
      }
    ]
  }
}
EOF

# Apply to bucket
gsutil lifecycle set lifecycle.json gs://kenix-products-production
```

---

## Backup Costs Summary

**Monthly Costs (Estimated):**

| Service | Storage | Cost |
|---------|---------|------|
| MongoDB Atlas backups | Included | $0 |
| S3 database backups (30 days) | ~100 GB | $2.30 |
| S3 Glacier (60 days archive) | ~200 GB | $0.80 |
| S3 config backups | ~1 GB | $0.02 |
| S3 code backups | ~2 GB | $0.05 |
| GCP versioned media | ~50 GB | $1.00 |
| **Total** | | **~$4.17/month** |

**Very affordable for the peace of mind!**

---

## Backup Monitoring & Alerts

### Set Up Backup Success Alerts

**Monitor backup script execution:**

```bash
# Modify backup script to send status

# At end of successful backup:
curl -X POST https://api.kenixcommodities.com/api/internal/backup-success \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"mongodb\",\"timestamp\":\"$(date -Iseconds)\"}"

# On failure:
curl -X POST https://api.kenixcommodities.com/api/internal/backup-failure \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"mongodb\",\"error\":\"$ERROR_MSG\"}"
```

**Create alert if backup not received in 25 hours:**

- Use cron monitoring: https://cronitor.io/ or https://healthchecks.io/
- Free tier: 20 monitors
- Alerts via email/SMS

**Example with Healthchecks.io:**

```bash
# At end of backup script:
curl -m 10 --retry 5 https://hc-ping.com/your-unique-uuid
```

---

## Checklist: Backup Readiness

**Verify all backups configured:**

### MongoDB
- [ ] Atlas continuous backups enabled (M10+ cluster)
- [ ] Daily mongodump to S3 automated
- [ ] S3 lifecycle policy applied (30-day retention)
- [ ] Backup script tested and working
- [ ] Cron job scheduled and running

### Application
- [ ] Code in Git repository
- [ ] Daily server code backup to S3
- [ ] All commits tagged with versions

### Configuration
- [ ] Daily encrypted config backup to S3
- [ ] Encryption password stored in password manager
- [ ] Nginx config backed up
- [ ] SSL certificates backed up

### Media
- [ ] GCP bucket versioning enabled
- [ ] Cross-region replication configured (optional)
- [ ] Lifecycle policy for old versions

### Verification
- [ ] Monthly backup restore tests scheduled
- [ ] Quarterly disaster recovery drills scheduled
- [ ] Backup monitoring/alerts configured
- [ ] Disaster recovery procedures documented
- [ ] Team trained on recovery processes

---

**Your data is now protected!**

**Next Steps:**
1. Review PERFORMANCE_GUIDE.md for optimization
2. Review SECURITY_CHECKLIST.md for final security audit
3. Schedule first backup test and DR drill

---

**Document Version:** 1.0.0
**Last Updated:** 2025-11-09
**Next Review:** 2025-12-09
