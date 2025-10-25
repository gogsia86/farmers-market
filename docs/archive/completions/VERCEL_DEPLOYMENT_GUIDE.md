# 🚀 VERCEL DEPLOYMENT - STEP-BY-STEP GUIDE

**Project:** Farmers Market Production Deployment
**Platform:** Vercel
**Date:** October 16, 2025
**Estimated Time:** 30 minutes

---

## 📋 PRE-DEPLOYMENT CHECKLIST

Before deploying, ensure you have:

- ✅ GitHub repository with all code pushed
- ✅ Production database provisioned (Supabase/Neon/Railway)
- ✅ All environment variables documented
- ✅ Stripe account in live mode with API keys
- ✅ Resend account with verified domain
- ✅ Local production build successful (`npm run build`)

---

## 🎯 DEPLOYMENT STEPS

### **STEP 1: Create Vercel Account (If New)**

1. Go to: <<https://vercel.com/signu>p>
2. Sign up with GitHub account (recommended)
3. Authorize Vercel to access your repositories
4. Complete profile setup

**Time:** 2 minutes

---

### **STEP 2: Import GitHub Repository**

1. Go to: <<https://vercel.com/ne>w>
2. Click "Import Git Repository"
3. Select "Import from GitHub"
4. Find repository: **`Farmers-Market`**
5. Click "Import"

**Time:** 1 minute

![Vercel Import Screen]

---

### **STEP 3: Configure Project Settings**

On the "Configure Project" screen:

#### **Project Settings:**

| Setting              | Value                            | Notes                  |
| -------------------- | -------------------------------- | ---------------------- |
| **Project Name**     | `farmers-market-production`      | Or your preferred name |
| **Framework Preset** | Next.js                          | Auto-detected          |
| **Root Directory**   | `farmers-market`                 | **CRITICAL**           |
| **Build Command**    | `npm run build`                  | Or custom (see below)  |
| **Output Directory** | `.next`                          | Default                |
| **Install Command**  | `npm install --legacy-peer-deps` | **IMPORTANT**          |
| **Node.js Version**  | 20.x                             | Latest LTS             |

#### **Custom Build Command (With Database Migration):**

```bash
npm run db:generate && npx prisma migrate deploy && npm run build
```

This ensures:

1. Prisma Client generated
2. Database migrations applied
3. Next.js production build created

**Time:** 3 minutes

---

### **STEP 4: Add Environment Variables**

Click "Environment Variables" section and add each variable:

#### **Required Variables (Add All):**

```bash
# Database
DATABASE_URL=postgresql://postgres.xxxxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
DIRECT_URL=postgresql://postgres.xxxxx:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres

# Authentication
NEXTAUTH_URL=<https://farmers-market-production.vercel.app>
NEXTAUTH_SECRET=YOUR_GENERATED_SECRET_HERE

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_KEY
STRIPE_SECRET_KEY=sk_live_YOUR_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET

# Email
RESEND_API_KEY=re_YOUR_KEY
CONTACT_EMAIL=noreply@yourdomain.com

# Chromatic (Optional)
CHROMATIC_PROJECT_TOKEN=chpt_a8e50842e415daa
```
### For Each Variable
1. Click "Add" button
2. **Name:** `DATABASE_URL`
3. **Value:** Paste connection string
4. **Environments:** Select **"Production"** (and "Preview" if needed)
5. Click "Add"
6. Repeat for all variables

**Time:** 10 minutes

**💡 Tip:** Copy from `ENVIRONMENT_VARIABLES_QUICK_REFERENCE.md`

---

### **STEP 5: Deploy**

1. Click **"Deploy"** button
2. Wait for build process (2-5 minutes)
3. Monitor build logs in real-time
### Build Process
```
Building...
├── Installing dependencies...
│   ✓ npm install --legacy-peer-deps
├── Generating Prisma Client...
│   ✓ npm run db:generate
├── Running migrations...
│   ✓ npx prisma migrate deploy
├── Building Next.js...
│   ✓ npm run build
└── Optimizing...
    ✓ Bundle size: 2.3 MB
    ✓ Pages: 42
    ✓ API Routes: 28
```
### Expected Results
- ✅ Build Status: **Success**
- ✅ Build Time: 2-5 minutes
- ✅ Deployment URL: `<https://farmers-market-production.vercel.app`>

**Time:** 5 minutes

---

### **STEP 6: Verify Deployment**

1. Click **"Visit"** button or copy deployment URL
2. Test critical paths:
### Quick Smoke Test
```powershell
# Health check
curl <https://farmers-market-production.vercel.app/api/health>

# Expected: {"status":"ok","timestamp":"..."}
```
### Manual Tests
- [ ] Homepage loads
- [ ] Sign up new user
- [ ] Sign in with test user
- [ ] Browse products page
- [ ] View product details
- [ ] Add item to cart
- [ ] Farm dashboard loads
- [ ] Mobile navigation works

**Time:** 5 minutes

---

### **STEP 7: Configure Stripe Webhook**

Now that you have a production URL, configure Stripe webhook:

1. Go to: <<https://dashboard.stripe.com/webhook>s>
2. Click **"Add endpoint"**
3. **Endpoint URL:** `<https://YOUR_VERCEL_URL.vercel.app/api/webhooks/stripe`>
4. **Events to send:**
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click **"Add endpoint"**
6. Copy **"Signing secret"** (starts with `whsec_`)
7. Update `STRIPE_WEBHOOK_SECRET` in Vercel Environment Variables
### Update Environment Variable
1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Find `STRIPE_WEBHOOK_SECRET`
3. Click "Edit" → Update value
4. Click "Save"
5. **Redeploy** (required for changes to take effect):
   - Go to Deployments tab
   - Click "..." on latest deployment
   - Click "Redeploy"

**Time:** 5 minutes

---

### **STEP 8: Test Payment Flow (Critical)**
### Use Stripe Test Cards
1. Browse to product page
2. Add to cart
3. Go to checkout
4. Use test card: `4242 4242 4242 4242`
5. Expiry: Any future date (e.g., `12/25`)
6. CVC: Any 3 digits (e.g., `123`)
7. ZIP: Any ZIP code (e.g., `12345`)
8. Complete payment
### Expected Flow
```
1. Checkout page loads
2. Stripe Elements renders
3. Enter card details
4. Click "Pay Now"
5. Payment processes (2-3 seconds)
6. Redirect to success page
7. Order confirmation email sent
8. Order appears in database
```
### Verify in Stripe Dashboard
- Payment Intent created
- Payment succeeded
- Webhook delivered successfully

**Time:** 3 minutes

---

## 🌍 OPTIONAL: CUSTOM DOMAIN SETUP

### **Step 1: Add Domain in Vercel**

1. Go to Project Settings → Domains
2. Click **"Add"**
3. Enter domain: `farmers-market.com`
4. Click **"Add"**

### **Step 2: Configure DNS**

### Option A: Vercel Nameservers (Recommended)

1. Vercel provides nameservers:
   - `ns1.vercel-dns.com`
   - `ns2.vercel-dns.com`
2. Update at your domain registrar (Namecheap, GoDaddy, etc.)
3. Wait 24-48 hours for DNS propagation

**Option B: A/CNAME Records**

Add these DNS records at your registrar:

| Type  | Name | Value                  |
| ----- | ---- | ---------------------- |
| A     | @    | `76.76.21.21`          |
| CNAME | www  | `cname.vercel-dns.com` |

Wait 10-60 minutes for DNS propagation.

### **Step 3: Verify Domain**

1. Vercel automatically checks DNS records
2. Once verified, SSL certificate issued (Let's Encrypt)
3. HTTPS enforced automatically

### **Step 4: Update Environment Variables**

1. Update `NEXTAUTH_URL` to your custom domain:

   ```
   NEXTAUTH_URL=<https://farmers-market.com>
   ```

2. Redeploy for changes to take effect

**Time:** 15 minutes + DNS propagation (24-48 hours)

---

## 📊 POST-DEPLOYMENT VERIFICATION

### **1. Performance Check (Lighthouse)**

```powershell
# Install Lighthouse CI
npm install -g @lhci/cli

# Run audit
lhci autorun --url=<https://your-vercel-url.vercel.app>
```
### Target Scores
- Performance: 90+
- Accessibility: 95+
- Best Practices: 100
- SEO: 100
- PWA: 100

### **2. Security Check**
### Verify Security Headers
```powershell
curl -I <https://your-vercel-url.vercel.app>
```
### Expected Headers
```
HTTP/2 200
x-content-type-options: nosniff
x-frame-options: DENY
x-xss-protection: 1; mode=block
referrer-policy: strict-origin-when-cross-origin
strict-transport-security: max-age=31536000; includeSubDomains
```

### **3. Database Check**

```powershell
# Open Prisma Studio
npm run db:studio

# Verify:
# - All tables exist
# - Can query data
# - Foreign keys working
```

### **4. API Routes Check**

Test all critical API endpoints:

```powershell
# Health check
curl <https://your-url.vercel.app/api/health>

# Products (public)
curl <https://your-url.vercel.app/api/products>

# Authentication (should require login)
curl <https://your-url.vercel.app/api/vendor/orders>
# Expected: 401 Unauthorized
```

### **5. Error Monitoring (If Sentry Enabled)**

1. Trigger test error: Visit `/api/test-error`
2. Check Sentry dashboard for error report
3. Verify source maps uploaded

---

## 📈 ENABLE MONITORING

### **Vercel Analytics (Built-in)**

1. Go to Project Settings → Analytics
2. Click **"Enable Analytics"**
3. Free tier: 100k events/month
### Metrics Tracked
- Page views
- Unique visitors
- Core Web Vitals (LCP, FID, CLS)
- Top pages
- Traffic sources

### **Vercel Speed Insights**

1. Go to Project Settings → Speed Insights
2. Click **"Enable Speed Insights"**
### Metrics Tracked
- Real User Monitoring (RUM)
- Core Web Vitals from real users
- Performance over time
- Geographic performance

### **Vercel Web Analytics Code**

Add to `app/layout.tsx` (if not already present):

```typescript
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

**Redeploy after adding analytics code.**

---

## 🔧 COMMON DEPLOYMENT ISSUES

### **Issue 1: Build Fails - Module Not Found**

**Error:** `Cannot find module 'ajv'`
### Fix
```json
// package.json
{
  "dependencies": {
    "ajv": "^8.17.1"
  }
}
```

Commit and push to trigger rebuild.

### **Issue 2: Database Connection Fails**

**Error:** `P1001: Can't reach database server`
### Fix
- Verify `DATABASE_URL` is correct in Vercel
- Check database is public (not localhost)
- Verify database is not paused (Supabase free tier)

### **Issue 3: NextAuth Session Not Working**

**Error:** User logs in but immediately logged out
### Fix
- Verify `NEXTAUTH_SECRET` is set (min 32 chars)
- Verify `NEXTAUTH_URL` matches deployment URL
- Check `sessions` table exists in database

### **Issue 4: Stripe Webhook 401 Error**

**Error:** `No signatures found matching expected signature`
### Fix
- Verify `STRIPE_WEBHOOK_SECRET` matches Stripe Dashboard
- Redeploy after updating environment variable
- Test webhook with Stripe CLI:

```powershell
stripe listen --forward-to <https://your-url.vercel.app/api/webhooks/stripe>
```

### **Issue 5: Build Timeout (>45 minutes)**

**Error:** `Build exceeded maximum time limit`
### Fix
1. Optimize dependencies:

```powershell
npm prune --production
```

2. Increase timeout in `vercel.json`:

```json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next",
      "config": {
        "maxDuration": 60
      }
    }
  ]
}
```

---

## ✅ DEPLOYMENT SUCCESS CHECKLIST

### **Deployment Complete When:**

- [ ] Build successful (green checkmark)
- [ ] Deployment URL accessible
- [ ] Homepage loads within 2 seconds
- [ ] Authentication works (sign up/sign in/sign out)
- [ ] Database connection working
- [ ] API routes respond correctly
- [ ] Products page loads with data
- [ ] Cart functionality works
- [ ] Checkout flow completes
- [ ] Stripe payment processes successfully
- [ ] Order confirmation email sent
- [ ] Farm dashboard loads
- [ ] Mobile navigation works
- [ ] PWA install prompt appears (mobile)
- [ ] Security headers present
- [ ] Performance scores meet targets (90+)
- [ ] Analytics tracking confirmed
- [ ] Error monitoring configured (if Sentry)
- [ ] Team notified of production URL

---

## 🎯 NEXT STEPS AFTER DEPLOYMENT

### **Immediate (Within 24 Hours):**

1. **Monitor Deployment:**
   - Check Vercel Dashboard for errors
   - Monitor Analytics for traffic
   - Review Function Logs for API errors

2. **Test All Features:**
   - Create test orders
   - Verify email delivery
   - Test mobile experience
   - Check PWA installation

3. **Share with Team:**
   - Send production URL to team
   - Share admin credentials (securely)
   - Provide testing instructions

### **Short-Term (Within 1 Week):**

1. **Custom Domain:**
   - Purchase domain if needed
   - Configure DNS records
   - Update environment variables

2. **Performance Optimization:**
   - Review Lighthouse scores
   - Optimize slow pages
   - Implement caching strategies

3. **Security Audit:**
   - Run security scan
   - Review access controls
   - Enable 2FA on all services

### **Long-Term (Ongoing):**

1. **Monitoring:**
   - Set up uptime monitoring (UptimeRobot)
   - Configure alerts for errors
   - Review analytics weekly

2. **Backups:**
   - Verify automated database backups
   - Test backup restoration
   - Document recovery procedures

3. **Updates:**
   - Keep dependencies updated
   - Security patches
   - Feature enhancements

---

## 📞 SUPPORT RESOURCES

- **Vercel Docs:** <<https://vercel.com/doc>s>
- **Vercel Support:** <<https://vercel.com/suppor>t>
- **Community Forum:** <<https://github.com/vercel/vercel/discussion>s>
- **Status Page:** <<https://www.vercel-status.co>m>

---

## 🎉 CONGRATULATIONS

Your Farmers Market platform is now **LIVE IN PRODUCTION**! 🚀

**Production URL:** `<https://farmers-market-production.vercel.app`>

Share with your team and start serving farmers and consumers with divine agricultural consciousness! 🌱

---

_Generated with agricultural consciousness on October 16, 2025_
