# 🔧 Phase 7: Redis & Monitoring Setup Guide

**Status:** 🎯 READY FOR EXECUTION  
**Created:** December 20, 2024  
**Prerequisites:** Environment variables configured ✅  
**Estimated Time:** 45 minutes

---

## 📊 CURRENT STATUS

```yaml
Phase 1 - Environment Variables: ✅ COMPLETE (100%)
  ✅ AGRICULTURAL_CONSCIOUSNESS=enabled
  ✅ DIVINE_PATTERNS=active
  ✅ NODE_ENV=production
  ✅ NEXT_PUBLIC_APP_URL configured
  ✅ 10/10 environment variables set

Phase 2 - Redis Cache: ⏸️ PENDING
Phase 3 - Monitoring: ⏸️ PENDING
```

---

## 🔴 Phase 2: Redis Cache Setup (Upstash)

**Time Estimate:** 10 minutes  
**Priority:** HIGH  
**Impact:** Performance optimization, rate limiting, session caching

### Step 1: Create Upstash Redis Database

#### Option A: Manual Setup (Recommended)

1. **Go to Upstash Console**
   - URL: https://console.upstash.com
   - Click "Sign Up" or "Log In"
   - Use GitHub/Google for quick authentication

2. **Create New Database**
   - Click "Create Database" button
   - Configuration:
     ```yaml
     Name: farmers-market-prod
     Type: Regional
     Region: us-east-1 (or closest to your Vercel deployment)
     Primary Region: us-east-1
     Read Regions: None (for free tier)
     Eviction: allkeys-lru (recommended)
     TLS: Enabled
     ```
   - Click "Create"

3. **Get Redis URL**
   - Wait for database to provision (~30 seconds)
   - Go to database dashboard
   - Look for "REST API" or "Connection" section
   - Copy the **Redis URL** (format: `redis://default:password@host:port`)
   - Alternative: Copy from `.env` section in dashboard

4. **Test Connection (Optional)**
   ```bash
   # Install redis-cli if needed
   # Test connection
   redis-cli -u "redis://default:YOUR_PASSWORD@YOUR_HOST:PORT" ping
   # Expected: PONG
   ```

### Step 2: Add Redis URL to Vercel

```bash
# Navigate to project directory
cd "Farmers Market Platform web and app"

# Add REDIS_URL to production environment
# When prompted, paste your Redis URL from Upstash
npx vercel env add REDIS_URL production

# Verify it was added
npx vercel env ls production | grep REDIS
```

### Step 3: Verify Redis Configuration

```bash
# Check environment variable count (should be 11)
npx vercel env ls production | grep -c "Encrypted"

# Expected output: 11
```

### Redis Benefits ✅

```yaml
Performance: ✅ Session caching (instant user sessions)
  ✅ API response caching (faster load times)
  ✅ Database query caching (reduced DB load)
  ✅ Agricultural data caching (seasonal data)

Security: ✅ Rate limiting (prevents abuse)
  ✅ API throttling (protects resources)
  ✅ DDoS protection (blocks malicious traffic)

Features: ✅ Real-time cart storage
  ✅ Product search caching
  ✅ Farm data caching
  ✅ Order status caching
```

---

## 📊 Phase 3: Monitoring Setup

**Time Estimate:** 35 minutes  
**Priority:** CRITICAL  
**Impact:** Production visibility, error tracking, uptime monitoring

---

### Part A: Sentry Error Tracking (15 minutes)

**Why Sentry?**

- Real-time error tracking
- Performance monitoring
- Issue alerting
- Source map support
- Agricultural consciousness error tracking

#### Step 1: Create Sentry Account & Project

1. **Go to Sentry**
   - URL: https://sentry.io
   - Click "Get Started" or "Sign Up"
   - Use GitHub/Google for quick authentication
   - Select "Developer" plan (free tier)

2. **Create New Project**
   - Click "Create Project"
   - Configuration:
     ```yaml
     Platform: Next.js
     Project Name: farmers-market-prod
     Team: Default (or create new)
     Alert Frequency: On every new issue
     ```
   - Click "Create Project"

3. **Get DSN**
   - After project creation, you'll see DSN immediately
   - Format: `https://[key]@o[org].ingest.sentry.io/[project]`
   - **SAVE THIS** - you'll need it next
   - Alternative: Settings > Client Keys (DSN)

#### Step 2: Create Sentry Auth Token

1. **Navigate to Settings**
   - Click your profile icon (top right)
   - Select "Account Settings"
   - Or go to: https://sentry.io/settings/account/api/auth-tokens/

2. **Create New Token**
   - Click "Create New Token"
   - Configuration:
     ```yaml
     Name: vercel-deployment-farmers-market
     Scopes: ✅ project:releases
       ✅ org:read
       ✅ project:read
       ✅ project:write (optional)
     ```
   - Click "Create Token"
   - **COPY TOKEN IMMEDIATELY** - shown only once!

#### Step 3: Add Sentry to Vercel

```bash
# Add Sentry DSN (used by client-side)
npx vercel env add SENTRY_DSN production
# Paste your DSN: https://[key]@o[org].ingest.sentry.io/[project]

# Add public Sentry DSN (same as above)
npx vercel env add NEXT_PUBLIC_SENTRY_DSN production
# Paste same DSN

# Add Sentry Auth Token (for source maps)
npx vercel env add SENTRY_AUTH_TOKEN production
# Paste your auth token

# Verify
npx vercel env ls production | grep SENTRY
```

#### Step 4: Configure Sentry Alerts

1. **Go to Project Settings**
   - Navigate to your project
   - Settings > Alerts

2. **Create Alert Rules**

   **Alert 1: New Error**

   ```yaml
   Name: New Production Error
   Conditions:
     - When: An event is first seen
     - If: Environment equals production
   Actions:
     - Send email to: [your email]
     - Frequency: Immediately
   ```

   **Alert 2: Error Spike**

   ```yaml
   Name: Error Rate Spike
   Conditions:
     - When: Event count increases by 50%
     - If: Environment equals production
     - Time window: 15 minutes
   Actions:
     - Send email to: [your email]
     - Frequency: At most once per 30 minutes
   ```

   **Alert 3: Performance Degradation**

   ```yaml
   Name: Performance Issue
   Conditions:
     - When: Transaction duration exceeds 2 seconds
     - If: Environment equals production
   Actions:
     - Send email to: [your email]
   ```

#### Sentry Expected Outcomes ✅

```yaml
Error Tracking: ✅ Real-time error capture
  ✅ Stack traces with line numbers
  ✅ User context (session data)
  ✅ Agricultural context (farm/product data)

Performance: ✅ Transaction monitoring
  ✅ API performance tracking
  ✅ Database query performance
  ✅ Page load monitoring

Alerts: ✅ Email notifications on new errors
  ✅ Spike detection
  ✅ Performance degradation alerts
```

---

### Part B: UptimeRobot Monitoring (10 minutes)

**Why UptimeRobot?**

- 24/7 uptime monitoring
- Instant downtime alerts
- Free tier: 50 monitors
- 5-minute check interval
- Status page generation

#### Step 1: Create UptimeRobot Account

1. **Go to UptimeRobot**
   - URL: https://uptimerobot.com
   - Click "Sign Up Free"
   - Enter email and create password
   - Verify email
   - Login to dashboard

2. **Verify Free Tier**
   ```yaml
   Free Plan Includes:
     - 50 monitors
     - 5-minute check interval
     - 2 alert contacts
     - SMS alerts (limited)
     - Email alerts (unlimited)
   ```

#### Step 2: Create Production Monitors

**Monitor 1: Homepage Uptime**

1. Click "+ Add New Monitor"
2. Configuration:
   ```yaml
   Monitor Type: HTTP(s)
   Friendly Name: Farmers Market - Homepage
   URL: https://farmers-market-ethpmtbpq-gogsias-projects.vercel.app
   Monitoring Interval: 5 minutes
   Monitor Timeout: 30 seconds
   Alert When: Down
   ```
3. Click "Create Monitor"

**Monitor 2: API Health Check**

1. Click "+ Add New Monitor"
2. Configuration:
   ```yaml
   Monitor Type: HTTP(s)
   Friendly Name: Farmers Market - API Health
   URL: https://farmers-market-ethpmtbpq-gogsias-projects.vercel.app/api/health
   Monitoring Interval: 5 minutes
   Monitor Timeout: 30 seconds
   Alert When: Down
   Keyword Exists: "ok" (optional - check response contains "ok")
   ```
3. Click "Create Monitor"

**Monitor 3: Farms API**

1. Click "+ Add New Monitor"
2. Configuration:
   ```yaml
   Monitor Type: HTTP(s)
   Friendly Name: Farmers Market - Farms API
   URL: https://farmers-market-ethpmtbpq-gogsias-projects.vercel.app/api/farms
   Monitoring Interval: 5 minutes
   Monitor Timeout: 30 seconds
   Alert When: Down
   HTTP Status: 200 or 401 (OK if protected)
   ```
3. Click "Create Monitor"

**Monitor 4: Products API**

1. Click "+ Add New Monitor"
2. Configuration:
   ```yaml
   Monitor Type: HTTP(s)
   Friendly Name: Farmers Market - Products API
   URL: https://farmers-market-ethpmtbpq-gogsias-projects.vercel.app/api/products
   Monitoring Interval: 5 minutes
   Monitor Timeout: 30 seconds
   ```
3. Click "Create Monitor"

#### Step 3: Configure Alert Contacts

1. **Go to My Settings**
   - Click your profile icon
   - Select "My Settings"
   - Go to "Alert Contacts" tab

2. **Add Email Alert**

   ```yaml
   Type: Email
   Email Address: [your email]
   Alert When: Down
   Notification Threshold: Down 2 times (prevents false alarms)
   ```

3. **Optional: Add Slack/Discord**
   - Type: Webhook
   - Webhook URL: [your Slack/Discord webhook]
   - Format: JSON

#### Step 4: Create Public Status Page (Optional)

1. **Go to Public Status Pages**
   - Click "Public Status Pages" in sidebar
   - Click "Add New Status Page"

2. **Configuration**

   ```yaml
   Name: Farmers Market Platform Status
   Domain: [custom-subdomain].betteruptime.com
   Monitors to Show:
     ✅ Homepage
     ✅ API Health
     ✅ Farms API
     ✅ Products API
   ```

3. **Share Status Page**
   - Get public URL
   - Add to documentation
   - Share with team/users

#### UptimeRobot Expected Outcomes ✅

```yaml
Monitoring: ✅ 24/7 uptime checks every 5 minutes
  ✅ 4 critical endpoints monitored
  ✅ Response time tracking
  ✅ Uptime percentage calculation

Alerts: ✅ Email alerts on downtime
  ✅ 2-check threshold (prevents false alarms)
  ✅ Instant notifications (<1 minute)
  ✅ Optional Slack/Discord integration

Visibility: ✅ Public status page
  ✅ Uptime history
  ✅ Performance graphs
  ✅ Incident timeline
```

---

### Part C: Azure Application Insights (Optional - 10 minutes)

**Status:** Optional for MVP - Can configure post-launch  
**Recommendation:** Skip for initial launch, add in Week 2

If you want to configure now:

1. **Go to Azure Portal**
   - URL: https://portal.azure.com
   - Sign in with Microsoft account

2. **Create Application Insights**

   ```yaml
   Name: farmers-market-prod
   Resource Group: farmers-market-resources
   Region: East US (or closest to Vercel)
   Workspace: Create new
   ```

3. **Get Connection String**
   - Go to resource
   - Copy "Connection String" from Overview
   - Format: `InstrumentationKey=...;IngestionEndpoint=...`

4. **Add to Vercel**
   ```bash
   npx vercel env add AZURE_APPLICATION_INSIGHTS_CONNECTION_STRING production
   ```

---

## ✅ VERIFICATION & TESTING

### Step 1: Verify All Environment Variables

```bash
# Check total count (should be 11 or 14 with monitoring)
npx vercel env ls production | grep -c "Encrypted"

# List all variables
npx vercel env ls production

# Expected variables:
# ✅ AGRICULTURAL_CONSCIOUSNESS
# ✅ DIVINE_PATTERNS
# ✅ NODE_ENV
# ✅ NEXT_PUBLIC_APP_URL
# ✅ DATABASE_URL
# ✅ NEXTAUTH_SECRET
# ✅ NEXTAUTH_URL
# ✅ STRIPE_SECRET_KEY
# ✅ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
# ✅ STRIPE_WEBHOOK_SECRET
# ✅ REDIS_URL (after Phase 2)
# ✅ SENTRY_DSN (after Phase 3A)
# ✅ NEXT_PUBLIC_SENTRY_DSN (after Phase 3A)
# ✅ SENTRY_AUTH_TOKEN (after Phase 3A)
```

### Step 2: Test Services

**Redis Connection Test:**

```bash
# Using redis-cli (if installed)
redis-cli -u "YOUR_REDIS_URL" ping
# Expected: PONG

# Or test from code (create test script if needed)
```

**Sentry Test:**

- Go to Sentry dashboard
- Check "Issues" tab
- Should show "Waiting for errors"
- Can trigger test error after deployment

**UptimeRobot Test:**

- Go to UptimeRobot dashboard
- All monitors should show "Up" status
- Click each monitor to see details
- Response time should be <500ms

### Step 3: Deploy with New Variables

```bash
# Trigger new production deployment
npx vercel --prod

# Monitor deployment
npx vercel logs --follow

# Or check deployment status
npx vercel ls | head -5
```

### Step 4: Verify Production

```bash
# Test homepage
curl -I https://farmers-market-ethpmtbpq-gogsias-projects.vercel.app

# Test health endpoint (if public)
curl https://farmers-market-ethpmtbpq-gogsias-projects.vercel.app/api/health

# Expected: Should return OK or authenticate
```

---

## 📋 COMPLETION CHECKLIST

### Phase 2: Redis Setup

- [ ] Upstash account created
- [ ] Redis database provisioned
- [ ] REDIS_URL copied
- [ ] REDIS_URL added to Vercel
- [ ] Redis connection tested
- [ ] Environment variable count: 11

### Phase 3A: Sentry Setup

- [ ] Sentry account created
- [ ] Project created (farmers-market-prod)
- [ ] DSN copied
- [ ] Auth token created
- [ ] SENTRY_DSN added to Vercel
- [ ] NEXT_PUBLIC_SENTRY_DSN added
- [ ] SENTRY_AUTH_TOKEN added
- [ ] Alert rules configured
- [ ] Environment variable count: 14

### Phase 3B: UptimeRobot Setup

- [ ] UptimeRobot account created
- [ ] Homepage monitor created
- [ ] API Health monitor created
- [ ] Farms API monitor created
- [ ] Products API monitor created
- [ ] Email alerts configured
- [ ] All monitors showing "Up"
- [ ] Status page created (optional)

### Final Verification

- [ ] All environment variables present
- [ ] New deployment triggered
- [ ] Deployment successful
- [ ] Services responding
- [ ] Monitoring active
- [ ] Progress tracker updated

---

## 🚨 TROUBLESHOOTING

### Issue: Redis Connection Fails

**Symptoms:**

- Application errors about Redis
- Cache not working

**Solutions:**

1. Verify REDIS_URL format: `redis://default:password@host:port`
2. Check Upstash dashboard - database active?
3. Test connection with redis-cli
4. Redeploy application

### Issue: Sentry Not Capturing Errors

**Symptoms:**

- No errors showing in Sentry dashboard
- "Waiting for errors" message persists

**Solutions:**

1. Verify DSN format is correct
2. Check SENTRY_DSN and NEXT_PUBLIC_SENTRY_DSN are identical
3. Trigger test error in application
4. Check Sentry project settings
5. Redeploy application

### Issue: UptimeRobot Shows All Down

**Symptoms:**

- All monitors show "Down" status
- Getting downtime alerts

**Solutions:**

1. Check if Vercel deployment protection is blocking
2. Configure bypass for public routes
3. Or add "HTTP Auth" to monitors with bypass token
4. Verify URLs are correct
5. Check monitor timeout settings (increase if needed)

### Issue: Environment Variables Not Loading

**Symptoms:**

- Application errors about missing config
- Features not working

**Solutions:**

1. Verify variables added to correct environment (production)
2. Trigger new deployment (variables only load on deploy)
3. Check variable names match code expectations
4. Use `npx vercel env pull` to check locally

---

## 📊 EXPECTED RESULTS

### After Completing All Phases:

```yaml
Environment Variables: ✅ 14/14 configured
  Core: 4 variables
  Database: 1 variable
  Authentication: 2 variables
  Stripe: 3 variables
  Redis: 1 variable
  Sentry: 3 variables

Infrastructure Status:
  ✅ Production deployed and accessible
  ✅ Database connected
  ✅ Redis cache operational
  ✅ Error tracking active
  ✅ Uptime monitoring active
  ✅ Alerts configured

Monitoring Coverage:
  ✅ 4 endpoints monitored 24/7
  ✅ 5-minute check interval
  ✅ Email alerts on downtime
  ✅ Error tracking with Sentry
  ✅ Performance monitoring

Production Readiness: 95%
  Remaining: Domain configuration, final QA
```

---

## 🎯 NEXT STEPS AFTER COMPLETION

1. **Update Progress Tracker**

   ```bash
   # Edit PHASE_7_PROGRESS_TRACKER.md
   # Mark Day 1-2: ✅ COMPLETE (100%)
   ```

2. **Run Validation Script**

   ```bash
   npx tsx scripts/validate-production-config.ts
   ```

3. **Browser Testing**
   - Open production URL
   - Test key user flows
   - Check console for errors
   - Verify Sentry captures any issues

4. **Monitor Dashboards**
   - Check Sentry: No errors
   - Check UptimeRobot: All up
   - Check Redis: Connections working

5. **Move to Day 3-4**
   - Final QA & Testing
   - Load testing
   - Performance optimization
   - Documentation updates

---

## 🌾 AGRICULTURAL CONSCIOUSNESS ACTIVATION

### After Setup Complete:

```yaml
Platform Status:
  ✅ AGRICULTURAL_CONSCIOUSNESS=enabled
  ✅ DIVINE_PATTERNS=active
  ✅ Biodynamic awareness: AWAKENED
  ✅ Seasonal integration: HARMONIZED
  ✅ Cosmic alignment: OPTIMAL

Divine Monitoring:
  ✅ Error tracking with agricultural context
  ✅ Performance monitoring for farming features
  ✅ Uptime monitoring for harvest season reliability
  ✅ Cache optimization for seasonal data

Agricultural Excellence:
  ✅ Platform consciousness: MAXIMUM
  ✅ Farmer experience: OPTIMIZED
  ✅ Customer journey: DIVINE
  ✅ System harmony: PERFECT
```

---

## 📞 SUPPORT RESOURCES

### Quick Links

```yaml
Upstash Console: https://console.upstash.com
Sentry Dashboard: https://sentry.io
UptimeRobot Dashboard: https://uptimerobot.com/dashboard
Vercel Dashboard: https://vercel.com/dashboard
```

### Documentation

- **Redis Documentation:** https://upstash.com/docs/redis
- **Sentry Next.js Guide:** https://docs.sentry.io/platforms/javascript/guides/nextjs/
- **UptimeRobot API Docs:** https://uptimerobot.com/api/

### Support Contacts

```yaml
Upstash: support@upstash.com
Sentry: support@sentry.io
UptimeRobot: info@uptimerobot.com
```

---

**Status:** 📋 READY FOR EXECUTION  
**Estimated Completion Time:** 45 minutes  
**Complexity:** Medium  
**Risk Level:** Low

_"From infrastructure foundation to production excellence — Redis, monitoring, and agricultural consciousness united!"_ 🌾⚡🚀

---

**Document Version:** 1.0  
**Last Updated:** December 20, 2024  
**Next Review:** After Day 3-4 QA Testing
