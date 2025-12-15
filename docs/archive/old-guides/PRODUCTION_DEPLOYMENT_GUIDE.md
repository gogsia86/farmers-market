# 🚀 PRODUCTION DEPLOYMENT GUIDE

**Farmers Market Platform - Version 1.0.0**

## 📋 PRE-DEPLOYMENT CHECKLIST

### ✅ **Critical Requirements**

- [ ] All environment variables configured (see `.env.example`)
- [ ] Database migrated to latest schema
- [ ] SSL certificates installed (HTTPS required)
- [ ] Domain configured and DNS propagated
- [ ] Stripe webhooks configured
- [ ] SMTP server tested
- [ ] Sentry project created
- [ ] Backup strategy implemented

---

## 🔧 STEP 1: ENVIRONMENT CONFIGURATION

### **Required Variables**

```bash
# Copy .env.example to .env.production
cp .env.example .env.production
```

Edit `.env.production` with production values:

```bash
# Database (use production connection string)
DATABASE_URL="postgresql://user:password@prod-db.example.com:5432/farmers_market?schema=public&sslmode=require"

# Authentication (generate new secrets!)
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="https://farmersmarket.app"

# Stripe (use live keys)
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASSWORD="your-sendgrid-api-key"
SMTP_FROM="noreply@farmersmarket.app"

# Sentry
SENTRY_DSN="https://...@sentry.io/..."
SENTRY_AUTH_TOKEN="your-production-token"

# Node
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://farmersmarket.app"
```

---

## 🗄️ STEP 2: DATABASE SETUP

### **A. Production Database Creation**

```sql
-- Create production database
CREATE DATABASE farmers_market;

-- Create user with limited privileges
CREATE USER farmers_market_app WITH PASSWORD 'secure-password';
GRANT CONNECT ON DATABASE farmers_market TO farmers_market_app;

-- Switch to database
\c farmers_market

-- Grant schema permissions
GRANT USAGE, CREATE ON SCHEMA public TO farmers_market_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO farmers_market_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO farmers_market_app;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### **B. Run Migrations**

```bash
# Set production DATABASE_URL
export DATABASE_URL="postgresql://..."

# Run migrations
npx prisma migrate deploy

# Verify migration status
npx prisma migrate status

# Generate Prisma client
npx prisma generate
```

### **C. Seed Initial Data (Optional)**

```bash
# Seed admin user and basic data
npx prisma db seed
```

---

## 🏗️ STEP 3: BUILD FOR PRODUCTION

### **A. Install Dependencies**

```bash
# Clean install
npm ci

# Verify no vulnerabilities
npm audit

# Fix if needed
npm audit fix
```

### **B. Build Application**

```bash
# Build with production optimizations
npm run build

# Verify build output
ls -lh .next/

# Check bundle size
npm run build:analyze
```

### **C. Test Production Build Locally**

```bash
# Start production server
npm start

# Verify in browser
open http://localhost:3000

# Check logs for errors
tail -f logs/app.log
```

---

## 💳 STEP 4: STRIPE CONFIGURATION

### **A. Create Stripe Webhook Endpoint**

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Set URL: `https://farmersmarket.app/api/webhooks/stripe`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

5. Copy webhook signing secret to `.env.production`:
   ```bash
   STRIPE_WEBHOOK_SECRET="whsec_..."
   ```

### **B. Test Webhook**

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Test in another terminal
stripe trigger payment_intent.succeeded
```

---

## 📧 STEP 5: EMAIL CONFIGURATION

### **A. Configure SMTP (SendGrid Example)**

1. Sign up at [SendGrid](https://sendgrid.com)
2. Create API key with "Mail Send" permissions
3. Add to `.env.production`:
   ```bash
   SMTP_HOST="smtp.sendgrid.net"
   SMTP_PORT="587"
   SMTP_USER="apikey"
   SMTP_PASSWORD="SG.your-api-key"
   SMTP_FROM="noreply@farmersmarket.app"
   ```

### **B. Test Email Sending**

```bash
# Run email test script
npm run test:email
```

---

## 🔍 STEP 6: MONITORING & ERROR TRACKING

### **A. Sentry Setup**

1. Create project at [Sentry.io](https://sentry.io)
2. Install Sentry CLI:

   ```bash
   npm install -g @sentry/cli
   ```

3. Configure Sentry:

   ```bash
   sentry-cli login
   sentry-cli projects list
   ```

4. Add to `.env.production`:
   ```bash
   SENTRY_DSN="https://...@sentry.io/..."
   SENTRY_AUTH_TOKEN="your-auth-token"
   SENTRY_ORG="your-org"
   SENTRY_PROJECT="farmers-market"
   ```

### **B. Configure Alerts**

1. Go to Sentry project settings
2. Set up alerts for:
   - Error rate > 1% (immediate)
   - New error types (daily digest)
   - Performance degradation (P95 > 2s)

---

## 🚀 STEP 7: DEPLOYMENT OPTIONS

### **Option A: Vercel (Recommended for Next.js)**

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Link project
vercel link

# Set environment variables
vercel env add NEXTAUTH_SECRET production
vercel env add DATABASE_URL production
# ... add all required env vars

# Deploy
vercel --prod

# Verify deployment
vercel inspect https://farmersmarket.app
```

### **Option B: Docker + VPS**

```bash
# Build Docker image
docker build -t farmers-market:latest .

# Tag for registry
docker tag farmers-market:latest registry.example.com/farmers-market:latest

# Push to registry
docker push registry.example.com/farmers-market:latest

# On production server
docker pull registry.example.com/farmers-market:latest
docker run -d \
  --name farmers-market \
  --env-file .env.production \
  -p 3000:3000 \
  --restart unless-stopped \
  registry.example.com/farmers-market:latest
```

### **Option C: AWS Elastic Beanstalk**

```bash
# Install EB CLI
pip install awsebcli

# Initialize
eb init farmers-market --platform node.js

# Create environment
eb create production

# Deploy
eb deploy

# View logs
eb logs --all
```

---

## 🔒 STEP 8: SECURITY HARDENING

### **A. SSL/TLS Configuration**

```bash
# Install certbot (Let's Encrypt)
sudo apt-get install certbot

# Get certificate
sudo certbot certonly --standalone -d farmersmarket.app -d www.farmersmarket.app

# Configure auto-renewal
sudo certbot renew --dry-run
```

### **B. Security Headers (Vercel)**

Create `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
        }
      ]
    }
  ]
}
```

### **C. Rate Limiting**

Already implemented in `src/lib/services/security/security.service.ts`

Verify it's active by checking logs:

```bash
grep "Rate limit" logs/app.log
```

---

## 📊 STEP 9: PERFORMANCE OPTIMIZATION

### **A. CDN Configuration**

1. **Vercel**: Automatic global CDN
2. **Cloudflare**:
   - Add site to Cloudflare
   - Update DNS to Cloudflare nameservers
   - Enable "Always Use HTTPS"
   - Enable "Auto Minify" for HTML, CSS, JS

### **B. Database Optimization**

```sql
-- Create indexes for common queries
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_farm ON orders(farm_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_products_farm ON products(farm_id);
CREATE INDEX idx_products_category ON products(category);

-- Enable connection pooling
ALTER SYSTEM SET max_connections = 100;
ALTER SYSTEM SET shared_buffers = '256MB';
```

### **C. Redis Caching (Optional)**

```bash
# Deploy Redis
# Vercel: Use Upstash Redis
# AWS: Use ElastiCache
# Self-hosted: Use Docker

# Add to .env.production
REDIS_URL="redis://username:password@redis-server:6379"
```

---

## ✅ STEP 10: POST-DEPLOYMENT VERIFICATION

### **A. Health Checks**

Create monitoring script `scripts/health-check.sh`:

```bash
#!/bin/bash

URL="https://farmersmarket.app"

# Check homepage
if curl -f -s "$URL" > /dev/null; then
  echo "✅ Homepage: OK"
else
  echo "❌ Homepage: FAILED"
  exit 1
fi

# Check API
if curl -f -s "$URL/api/health" > /dev/null; then
  echo "✅ API: OK"
else
  echo "❌ API: FAILED"
  exit 1
fi

# Check database
if curl -f -s "$URL/api/health/db" > /dev/null; then
  echo "✅ Database: OK"
else
  echo "❌ Database: FAILED"
  exit 1
fi

echo "✅ All systems operational"
```

### **B. Run E2E Tests Against Production**

```bash
# Set production URL
export NEXT_PUBLIC_APP_URL="https://farmersmarket.app"

# Run E2E tests
npx playwright test --project=chromium

# View report
npx playwright show-report
```

### **C. Monitor Initial Traffic**

```bash
# Watch logs
vercel logs --follow

# Check Sentry dashboard
open https://sentry.io/organizations/your-org/projects/farmers-market/

# Monitor performance
open https://vercel.com/your-org/farmers-market/analytics
```

---

## 📱 STEP 11: USER ACCEPTANCE TESTING

### **A. Beta Testing Checklist**

- [ ] Admin can login
- [ ] Farm registration works
- [ ] Product creation works
- [ ] Order placement works
- [ ] Payment processing works
- [ ] Email notifications sent
- [ ] Mobile responsive
- [ ] Performance acceptable (LCP < 2.5s)

### **B. Create Beta User Accounts**

```sql
-- Create test accounts
INSERT INTO users (email, password, role, status)
VALUES
  ('beta1@example.com', '$2a$10$...', 'CONSUMER', 'ACTIVE'),
  ('beta2@example.com', '$2a$10$...', 'FARMER', 'ACTIVE'),
  ('beta3@example.com', '$2a$10$...', 'ADMIN', 'ACTIVE');
```

---

## 🆘 TROUBLESHOOTING

### **Common Issues**

**Issue**: Database connection fails

```bash
# Check connection string
psql "$DATABASE_URL"

# Verify SSL mode
# Add to connection string: ?sslmode=require
```

**Issue**: Stripe webhooks not working

```bash
# Check webhook endpoint
curl -X POST https://farmersmarket.app/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{"type":"ping"}'

# Verify signature validation
stripe webhook validate --webhook-secret whsec_... --payload '{"type":"ping"}'
```

**Issue**: Email not sending

```bash
# Test SMTP connection
telnet smtp.sendgrid.net 587

# Check credentials
curl --url 'smtp://smtp.sendgrid.net:587' \
  --mail-from 'noreply@farmersmarket.app' \
  --mail-rcpt 'test@example.com' \
  --user 'apikey:SG.your-api-key'
```

---

## 📚 ADDITIONAL RESOURCES

- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma Production Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)
- [Stripe Production Checklist](https://stripe.com/docs/development/checklist)
- [Sentry Performance Monitoring](https://docs.sentry.io/product/performance/)

---

## 🎉 LAUNCH DAY CHECKLIST

- [ ] All environment variables set
- [ ] Database backed up
- [ ] SSL certificate valid
- [ ] Monitoring active (Sentry, logs)
- [ ] Email notifications working
- [ ] Payment processing tested
- [ ] Rate limiting active
- [ ] CDN configured
- [ ] Health checks passing
- [ ] E2E tests passing
- [ ] Performance verified
- [ ] Support team briefed
- [ ] Rollback plan documented

**🚀 READY TO LAUNCH!**
