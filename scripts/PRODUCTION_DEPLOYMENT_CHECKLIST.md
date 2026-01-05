# 🚀 Production Deployment Checklist

## Phase 7 - MVP Launch | Day 1-2 Execution Guide

**Last Updated:** December 2024  
**Status:** Ready for Execution  
**Estimated Time:** 8-12 hours (2 days)

---

## 📋 Overview

This checklist guides you through the complete production deployment process for the Farmers Market Platform MVP. Follow each step in order, marking items complete as you go.

**Prerequisites:**

- ✅ Phase 6 (Documentation) 100% complete
- ✅ All tests passing (850+ tests, 82% coverage)
- ✅ Code merged to main branch
- ✅ Team members assigned and available

---

## 🎯 Day 1: Infrastructure & Configuration

### Morning Session (4-5 hours)

#### Step 1: Vercel Production Project Setup

- [ ] **1.1 Install Vercel CLI** (if not already installed)

  ```bash
  npm install -g vercel
  vercel login
  ```

- [ ] **1.2 Create Production Project**

  ```bash
  cd "Farmers Market Platform web and app"
  vercel --prod
  ```

  - Choose "Create new project"
  - Name: `farmersmarket-platform`
  - Framework: Next.js (should auto-detect)
  - Build command: `npm run vercel-build`
  - Output directory: `.next`

- [ ] **1.3 Link Project to Repository**
  - Connect to GitHub repository
  - Enable automatic deployments from `main` branch
  - Configure branch protection rules

#### Step 2: Environment Variables Configuration

- [ ] **2.1 Generate Secrets**

  ```bash
  # Generate NEXTAUTH_SECRET (32+ characters)
  openssl rand -base64 32
  # Save this value - you'll need it
  ```

- [ ] **2.2 Add Core Application Variables**

  ```bash
  vercel env add NEXT_PUBLIC_APP_URL production
  # Value: https://farmersmarket.com

  vercel env add NODE_ENV production
  # Value: production

  vercel env add NEXTAUTH_URL production
  # Value: https://farmersmarket.com

  vercel env add NEXTAUTH_SECRET production
  # Value: [paste the generated secret from 2.1]
  ```

- [ ] **2.3 Add Database Variables**

  ```bash
  vercel env add DATABASE_URL production
  # Value: postgresql://[username]:[password]@[host]:[port]/[database]
  # Example: postgresql://prod_user:****@db.region.provider.com:5432/farmersmarket_prod
  ```

  **Note:** Ensure you use production database credentials, NOT development!

- [ ] **2.4 Add Stripe Payment Variables**

  ```bash
  vercel env add STRIPE_SECRET_KEY production
  # Value: sk_live_**** (get from Stripe Dashboard)

  vercel env add STRIPE_PUBLISHABLE_KEY production
  # Value: pk_live_**** (get from Stripe Dashboard)

  vercel env add STRIPE_WEBHOOK_SECRET production
  # Value: whsec_**** (will be generated in Step 4)
  ```

  **⚠️ CRITICAL:** Use `sk_live_` keys, NOT `sk_test_` keys!

- [ ] **2.5 Add Redis Cache Variables**

  ```bash
  vercel env add REDIS_URL production
  # Value: redis://default:****@redis.upstash.io:6379
  # Get from Upstash Redis dashboard
  ```

- [ ] **2.6 Add Monitoring Variables**

  ```bash
  vercel env add SENTRY_DSN production
  # Value: https://****@sentry.io/****
  # Get from Sentry project settings

  vercel env add SENTRY_AUTH_TOKEN production
  # Value: [your Sentry auth token]

  vercel env add AZURE_APPLICATION_INSIGHTS_CONNECTION_STRING production
  # Value: InstrumentationKey=****;IngestionEndpoint=https://****
  # Get from Azure Application Insights resource
  ```

- [ ] **2.7 Add Email Service Variables**

  ```bash
  vercel env add SMTP_HOST production
  # Value: smtp.sendgrid.net (or your SMTP provider)

  vercel env add SMTP_PORT production
  # Value: 587 (or 465 for SSL)

  vercel env add SMTP_USER production
  # Value: apikey (for SendGrid) or your SMTP username

  vercel env add SMTP_PASS production
  # Value: [your SMTP password or API key]

  vercel env add SMTP_FROM production
  # Value: noreply@farmersmarket.com
  ```

- [ ] **2.8 Add Agricultural Consciousness Variables**

  ```bash
  vercel env add AGRICULTURAL_CONSCIOUSNESS production
  # Value: enabled

  vercel env add DIVINE_PATTERNS production
  # Value: active
  ```

- [ ] **2.9 Verify All Variables Set**

  ```bash
  vercel env ls
  ```

  - Confirm all production variables are listed
  - No test/development values present

#### Step 3: Database Setup

- [ ] **3.1 Provision Production Database**
  - Provider: Choose one (AWS RDS, Google Cloud SQL, Railway, Supabase, etc.)
  - Instance type: Minimum 2GB RAM, 20GB storage
  - PostgreSQL version: 15 or 16
  - Enable automated backups
  - Enable point-in-time recovery
  - Set backup retention: 30 days

- [ ] **3.2 Configure Database Security**
  - Enable SSL/TLS connections
  - Whitelist Vercel IP ranges
  - Create production database user with limited permissions
  - Set strong password (32+ characters)

- [ ] **3.3 Test Database Connection**

  ```bash
  # Test connection locally first
  export DATABASE_URL="postgresql://[prod-credentials]"
  npx prisma db execute --stdin <<EOF
  SELECT version();
  EOF
  ```

- [ ] **3.4 Run Database Migrations**

  ```bash
  # Deploy migrations to production
  npx prisma migrate deploy

  # Verify schema
  npx prisma db pull
  ```

- [ ] **3.5 Seed Initial Data (Optional)**

  ```bash
  # Only if you need initial data (e.g., admin user)
  npm run db:seed:basic
  ```

  **⚠️ WARNING:** Do NOT run full seed in production!

- [ ] **3.6 Verify Database Setup**
  ```bash
  # Check tables exist
  npx prisma studio
  # Open in browser and verify schema looks correct
  ```

#### Step 4: Stripe Webhook Configuration

- [ ] **4.1 Create Webhook Endpoint in Stripe**
  - Go to: https://dashboard.stripe.com/webhooks
  - Click "Add endpoint"
  - Endpoint URL: `https://farmersmarket.com/api/webhooks/stripe`
  - Select events to listen to:
    - `checkout.session.completed`
    - `payment_intent.succeeded`
    - `payment_intent.payment_failed`
    - `charge.succeeded`
    - `charge.failed`

- [ ] **4.2 Get Webhook Secret**
  - Copy the webhook signing secret (starts with `whsec_`)
  - Add to Vercel environment:
    ```bash
    vercel env add STRIPE_WEBHOOK_SECRET production
    # Value: whsec_****
    ```

- [ ] **4.3 Test Webhook (After Deployment)**
  - Use Stripe CLI:
    ```bash
    stripe listen --forward-to https://farmersmarket.com/api/webhooks/stripe
    stripe trigger checkout.session.completed
    ```

---

### Afternoon Session (3-4 hours)

#### Step 5: Domain Configuration

- [ ] **5.1 Add Custom Domain in Vercel**

  ```bash
  vercel domains add farmersmarket.com
  vercel domains add www.farmersmarket.com
  ```

- [ ] **5.2 Configure DNS Records**
  - Go to your domain registrar (Namecheap, GoDaddy, etc.)
  - Add A record for `farmersmarket.com`:
    - Type: A
    - Name: @
    - Value: 76.76.21.21 (Vercel IP)
  - Add CNAME record for `www.farmersmarket.com`:
    - Type: CNAME
    - Name: www
    - Value: cname.vercel-dns.com

- [ ] **5.3 Verify DNS Propagation**

  ```bash
  # Wait 5-30 minutes, then check:
  dig farmersmarket.com
  dig www.farmersmarket.com

  # Or use online tool:
  # https://dnschecker.org
  ```

- [ ] **5.4 Verify SSL Certificate**

  ```bash
  # Check SSL certificate
  openssl s_client -connect farmersmarket.com:443 -servername farmersmarket.com

  # Check expiration
  echo | openssl s_client -servername farmersmarket.com -connect farmersmarket.com:443 2>/dev/null | openssl x509 -noout -dates
  ```

  - Should show valid certificate
  - Expiration should be 90+ days away

#### Step 6: Redis Cache Setup

- [ ] **6.1 Create Upstash Redis Instance**
  - Go to: https://console.upstash.com
  - Create new database
  - Name: `farmersmarket-production`
  - Region: Choose closest to your primary users
  - Type: Regional (for better performance)

- [ ] **6.2 Get Connection Details**
  - Copy Redis URL (starts with `redis://` or `rediss://`)
  - Already added to Vercel in Step 2.5

- [ ] **6.3 Test Redis Connection**

  ```bash
  # Install Redis CLI if needed
  # Mac: brew install redis
  # Ubuntu: sudo apt install redis-tools

  redis-cli -u "redis://your-url" ping
  # Should return: PONG
  ```

- [ ] **6.4 Configure Redis Rate Limiting**
  - Set rate limits in Upstash dashboard:
    - API requests: 1000/minute per IP
    - Auth attempts: 5/minute per IP
    - Enable automatic key expiration

#### Step 7: Monitoring Setup

- [ ] **7.1 Configure Sentry**
  - Go to: https://sentry.io
  - Create new project
  - Platform: Next.js
  - Name: `farmersmarket-production`
  - Copy DSN (already added in Step 2.6)
  - Enable performance monitoring
  - Set alert rules:
    - Error rate >0.5%
    - Response time >200ms (P95)
    - Crash-free sessions <99%

- [ ] **7.2 Configure Azure Application Insights**
  - Go to: https://portal.azure.com
  - Create Application Insights resource
  - Name: `farmersmarket-production`
  - Region: Same as primary users
  - Copy connection string (already added in Step 2.6)
  - Enable:
    - Application Map
    - Smart Detection
    - Availability tests
    - Custom metrics

- [ ] **7.3 Configure Uptime Monitoring**
  - Go to: https://uptimerobot.com
  - Create monitors:
    - **Monitor 1:** Homepage
      - Type: HTTP(s)
      - URL: https://farmersmarket.com
      - Interval: 5 minutes
      - Alert contacts: team emails
    - **Monitor 2:** Health API
      - Type: HTTP(s)
      - URL: https://farmersmarket.com/api/health
      - Interval: 5 minutes
    - **Monitor 3:** Farms API
      - Type: HTTP(s)
      - URL: https://farmersmarket.com/api/farms
      - Interval: 10 minutes
    - **Monitor 4:** Products API
      - Type: HTTP(s)
      - URL: https://farmersmarket.com/api/products
      - Interval: 10 minutes

- [ ] **7.4 Configure Alert Channels**
  - Email alerts to: team@farmersmarket.com
  - Slack webhook (optional)
  - SMS for critical alerts (P0)

#### Step 8: Initial Deployment

- [ ] **8.1 Deploy to Production**

  ```bash
  vercel --prod
  ```

  - Wait for deployment to complete (5-10 minutes)
  - Note the deployment URL

- [ ] **8.2 Verify Deployment**
  - Open: https://farmersmarket.com
  - Should see the homepage (may take 5-10 minutes for DNS)
  - Check browser console for errors
  - Check network tab for failed requests

- [ ] **8.3 Test Health Endpoint**

  ```bash
  curl https://farmersmarket.com/api/health
  # Should return: {"status": "ok", ...}
  ```

- [ ] **8.4 Check Vercel Logs**

  ```bash
  vercel logs --prod --follow
  ```

  - Monitor for errors
  - Verify no crashes

---

## 🎯 Day 2: Validation & Testing

### Morning Session (3-4 hours)

#### Step 9: Configuration Validation

- [ ] **9.1 Run Validation Script**

  ```bash
  # Set production DATABASE_URL temporarily for validation
  export DATABASE_URL="[production-db-url]"

  npm run tsx scripts/validate-production-config.ts
  ```

  - All checks should pass
  - Fix any failures before proceeding

- [ ] **9.2 Manual Configuration Review**
  - [ ] Verify all environment variables in Vercel dashboard
  - [ ] Confirm using `sk_live_` Stripe keys
  - [ ] Confirm production database URL
  - [ ] Confirm production domain in NEXTAUTH_URL
  - [ ] Confirm Sentry is production project

- [ ] **9.3 Test Database Queries**

  ```bash
  # Test read performance
  curl https://farmersmarket.com/api/farms

  # Should return farms list (may be empty initially)
  # Response time should be <200ms
  ```

#### Step 10: Functional Testing

- [ ] **10.1 Test User Registration**
  - Go to: https://farmersmarket.com/signup
  - Register new account
  - Verify email sent
  - Verify email verification works
  - Verify can log in

- [ ] **10.2 Test Farmer Registration**
  - Log in as user
  - Navigate to "Register as Farmer"
  - Complete farm registration
  - Upload farm image
  - Submit for approval
  - Verify pending status

- [ ] **10.3 Test Product Creation** (requires admin approval first)
  - Log in as farmer
  - Navigate to "Add Product"
  - Complete product form
  - Upload product images
  - Set pricing
  - Publish product

- [ ] **10.4 Test Customer Journey**
  - Log out
  - Register new customer account
  - Browse farms
  - Browse products
  - Add items to cart
  - Proceed to checkout
  - **Stop before payment** (we'll test in Step 11)

- [ ] **10.5 Test Admin Functions**
  - Create admin user (via database)
  - Log in as admin
  - Approve pending farm
  - View platform metrics
  - Test user management

#### Step 11: Payment Testing

- [ ] **11.1 Use Stripe Test Card**
  - Card number: `4242 4242 4242 4242`
  - Expiry: Any future date
  - CVC: Any 3 digits
  - ZIP: Any 5 digits

- [ ] **11.2 Complete Test Transaction**
  - Add products to cart
  - Proceed to checkout
  - Enter test card details
  - Complete payment
  - Verify order confirmation page
  - Verify order confirmation email sent

- [ ] **11.3 Verify in Stripe Dashboard**
  - Go to: https://dashboard.stripe.com/test/payments
  - Verify test payment appears
  - Check webhook delivery
  - Verify all events captured

- [ ] **11.4 Test Payment Failure**
  - Use declined card: `4000 0000 0000 0002`
  - Verify error message shown
  - Verify no order created
  - Verify user can retry

### Afternoon Session (3-4 hours)

#### Step 12: Performance Testing

- [ ] **12.1 Run Lighthouse Audit**
  - Open: https://farmersmarket.com
  - Chrome DevTools → Lighthouse
  - Run audit (Production mode)
  - Target scores:
    - Performance: >90 ✅
    - Accessibility: >95 ✅
    - Best Practices: >95 ✅
    - SEO: >95 ✅

- [ ] **12.2 Test Page Load Times**
  - Homepage: <2 seconds ✅
  - Farms page: <2 seconds ✅
  - Products page: <2 seconds ✅
  - Checkout: <2 seconds ✅

- [ ] **12.3 Test API Performance**

  ```bash
  # Test multiple endpoints
  time curl https://farmersmarket.com/api/farms
  time curl https://farmersmarket.com/api/products
  time curl https://farmersmarket.com/api/health
  ```

  - All should respond in <200ms

- [ ] **12.4 Test Core Web Vitals**
  - LCP (Largest Contentful Paint): <2.5s ✅
  - FID (First Input Delay): <100ms ✅
  - CLS (Cumulative Layout Shift): <0.1 ✅

#### Step 13: Security Validation

- [ ] **13.1 Verify Security Headers**

  ```bash
  curl -I https://farmersmarket.com
  ```

  - Should include:
    - `X-Content-Type-Options: nosniff`
    - `X-Frame-Options: DENY`
    - `X-XSS-Protection: 1; mode=block`
    - `Referrer-Policy: strict-origin-when-cross-origin`
    - `Permissions-Policy: camera=(), microphone=(), geolocation=(self)`

- [ ] **13.2 Verify SSL/HTTPS**
  - All pages load over HTTPS
  - No mixed content warnings
  - SSL certificate valid
  - A+ rating on: https://www.ssllabs.com/ssltest/

- [ ] **13.3 Test Authentication**
  - Cannot access protected routes without login
  - Session expires after inactivity
  - Logout works correctly
  - Password reset works

- [ ] **13.4 Test API Rate Limiting**

  ```bash
  # Make 100 rapid requests
  for i in {1..100}; do
    curl https://farmersmarket.com/api/farms &
  done
  wait
  ```

  - Should get rate limit response (429) after ~50 requests

#### Step 14: Monitoring Verification

- [ ] **14.1 Verify Sentry Integration**
  - Trigger test error:
    - Visit: https://farmersmarket.com/api/test-error
  - Check Sentry dashboard
  - Verify error captured with:
    - Stack trace
    - User context
    - Request details

- [ ] **14.2 Verify Application Insights**
  - Go to Azure portal
  - Check Application Insights
  - Verify data flowing:
    - Request count
    - Response times
    - Dependencies
    - Exceptions

- [ ] **14.3 Verify Uptime Monitoring**
  - Check UptimeRobot dashboard
  - All monitors should be "Up"
  - 100% uptime so far

- [ ] **14.4 Test Alert System**
  - Manually trigger alert (stop service briefly)
  - Verify alert email received
  - Verify Slack notification (if configured)

#### Step 15: Backup & Recovery Testing

- [ ] **15.1 Verify Database Backups**
  - Check backup schedule configured
  - Verify at least one backup exists
  - Test backup restoration (on test database)

- [ ] **15.2 Document Rollback Procedure**

  ```bash
  # How to rollback deployment:
  vercel rollback [deployment-url]

  # How to rollback database:
  # (Documented in LAUNCH_DAY_RUNBOOK.md)
  ```

- [ ] **15.3 Test Deployment Rollback**
  - Note current deployment URL
  - Deploy a new version
  - Rollback to previous version
  - Verify site still works

---

## ✅ Final Checklist (End of Day 2)

### Infrastructure ✅

- [ ] Production Vercel project configured
- [ ] All environment variables set correctly
- [ ] Production database provisioned and migrated
- [ ] Redis cache operational
- [ ] Domain configured with SSL
- [ ] Monitoring tools active
- [ ] Backup systems configured

### Testing ✅

- [ ] All user journeys tested successfully
- [ ] Payment processing working
- [ ] Performance targets met
- [ ] Security headers configured
- [ ] Monitoring verified
- [ ] No critical bugs found

### Documentation ✅

- [ ] All credentials documented securely
- [ ] Runbook reviewed and understood
- [ ] Team trained on emergency procedures
- [ ] Support documentation ready

### Monitoring ✅

- [ ] Sentry capturing errors
- [ ] Application Insights showing data
- [ ] Uptime monitors active
- [ ] Alert channels tested

### Ready for Day 3-4 ✅

- [ ] Infrastructure 100% operational
- [ ] All systems green
- [ ] Team confident to proceed
- [ ] No blockers identified

---

## 🚨 Troubleshooting

### Issue: Deployment Fails

**Symptoms:** Vercel deployment shows error

**Solutions:**

1. Check build logs: `vercel logs`
2. Verify all environment variables set
3. Check Node.js version compatibility
4. Try local build: `npm run build`
5. Check for TypeScript errors: `npm run type-check`

### Issue: Database Connection Fails

**Symptoms:** "Cannot connect to database" errors

**Solutions:**

1. Verify DATABASE_URL is correct
2. Check database is running
3. Verify IP whitelisting includes Vercel IPs
4. Test connection locally
5. Check SSL/TLS settings

### Issue: Domain Not Working

**Symptoms:** Site not accessible via custom domain

**Solutions:**

1. Verify DNS records are correct
2. Wait for DNS propagation (up to 48 hours, usually 5-30 min)
3. Check domain ownership verified in Vercel
4. Try accessing via Vercel URL first
5. Clear browser cache

### Issue: Stripe Webhooks Not Working

**Symptoms:** Payments succeed but order not created

**Solutions:**

1. Verify webhook endpoint URL is correct
2. Check webhook secret matches
3. Check Vercel logs for webhook errors
4. Test webhook with Stripe CLI
5. Verify endpoint is publicly accessible

---

## 📞 Support Contacts

```yaml
Emergency Contacts:
  Technical Lead: [Phone]
  DevOps: [Phone]

Third-Party Support:
  Vercel: support@vercel.com
  Stripe: support@stripe.com
  Sentry: support@sentry.io
  Azure: https://portal.azure.com
  Upstash: support@upstash.com
```

---

## 📊 Success Criteria

By the end of Day 2, you should have:

✅ **Production infrastructure fully operational**
✅ **All services configured and tested**
✅ **Monitoring active and alerting**
✅ **No critical issues identified**
✅ **Team ready to proceed to QA phase**
✅ **Documentation complete**

---

**Status:** 🟢 READY TO EXECUTE  
**Next Phase:** Day 3-4 (Comprehensive QA & Testing)

---

_"From divine infrastructure to legendary launch — let's make it happen!"_ 🌾🚀
