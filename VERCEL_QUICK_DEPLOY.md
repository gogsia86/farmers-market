# 🚀 Vercel Quick Deploy Guide

**Get your Farmers Market Platform live in 15 minutes!**

---

## ⚡ Quick Setup (3 Steps)

### Step 1: Deploy to Vercel (2 minutes)

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

**OR** Use the Dashboard:

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import Git Repository: `gogsia86/farmers-market`
3. Click **Deploy** (will fail without env vars - that's OK!)

---

### Step 2: Add Required Environment Variables (10 minutes)

Go to your Vercel project → **Settings** → **Environment Variables**

#### 🔴 CRITICAL (Must Set First)

```bash
# 1. DATABASE (Get from Vercel Postgres or Supabase)
DATABASE_URL=postgresql://user:pass@host:5432/farmersmarket?schema=public

# 2. AUTHENTICATION (Generate with: openssl rand -base64 32)
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=<generate-32-char-secret>
JWT_SECRET=<generate-32-char-secret>

# 3. STRIPE (Get from: https://dashboard.stripe.com/apikeys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# 4. EMAIL (Get from: https://app.sendgrid.com/settings/api_keys)
SENDGRID_API_KEY=SG.xxx

# 5. MAPS (Get from: https://console.cloud.google.com/google/maps-apis)
GOOGLE_MAPS_API_KEY=AIzaSyxxx

# 6. ADMIN ACCESS (Generate with: openssl rand -hex 32)
ADMIN_API_KEY=<generate-secure-key>
ADMIN_SECRET_KEY=<generate-secure-key>
```

#### 🟡 RECOMMENDED (Add for Production)

```bash
# REDIS CACHE (Get from: https://console.upstash.com/)
REDIS_ENABLED=true
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx

# ERROR TRACKING (Get from: https://sentry.io)
SENTRY_DSN=https://xxx@sentry.io/xxx

# CLOUD STORAGE (Get from: https://cloudinary.com/console)
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
```

---

### Step 3: Redeploy (3 minutes)

```bash
# After adding environment variables
vercel --prod --force

# OR in Dashboard
# Go to Deployments → Latest → ⋮ Menu → Redeploy
```

**Verify deployment:**

```bash
curl https://your-domain.vercel.app/api/health
# Should return: {"status":"healthy"}
```

---

## 🎯 Service Setup Quick Links

### Database (Choose One)

**Vercel Postgres** (Easiest)

```bash
vercel storage create postgres
# Copy DATABASE_URL from dashboard
```

**Supabase** (Free Tier)

1. [Sign up](https://supabase.com)
2. New Project → Database Settings
3. Copy Connection String (URI format)

**Railway** (Simple)

1. [Railway.app](https://railway.app)
2. New Project → Add PostgreSQL
3. Copy DATABASE_URL

---

### Redis Cache (Recommended)

**Upstash** (Serverless - Best for Vercel)

1. [console.upstash.com](https://console.upstash.com/)
2. Create Database → Regional
3. Copy REST URL and Token

---

### Stripe Setup (3 minutes)

1. **Get API Keys**
   - [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys)
   - Copy Publishable key (starts with `pk_`)
   - Copy Secret key (starts with `sk_`)

2. **Setup Webhook**
   - [dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)
   - Add endpoint: `https://your-domain.vercel.app/api/webhooks/stripe`
   - Select events: `payment_intent.succeeded`, `checkout.session.completed`
   - Copy webhook secret (starts with `whsec_`)

---

### Email Service (Choose One)

**SendGrid** (Recommended)

1. [app.sendgrid.com/settings/api_keys](https://app.sendgrid.com/settings/api_keys)
2. Create API Key → Full Access
3. Copy key (starts with `SG.`)

**Gmail SMTP** (Free)

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=<app-password>  # Generate at myaccount.google.com/apppasswords
```

---

### Google Maps Setup

1. [console.cloud.google.com/google/maps-apis](https://console.cloud.google.com/google/maps-apis)
2. Enable APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
3. Credentials → Create API Key
4. Restrict key to your domain

---

## 🔐 Generate Secrets Quickly

```bash
# NEXTAUTH_SECRET (32 characters minimum)
openssl rand -base64 32

# JWT_SECRET (32 characters minimum)
openssl rand -base64 32

# ADMIN_API_KEY (64 character hex)
openssl rand -hex 32

# ADMIN_SECRET_KEY (64 character hex)
openssl rand -hex 32
```

**Windows (PowerShell):**

```powershell
# Generate random base64 string
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Generate random hex string
-join ((48..57) + (65..70) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

---

## 🐛 Common Issues & Fixes

### ❌ "Database connection failed"

**Fix:**

```bash
# Verify connection string format
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public

# URL encode special characters in password
# Example: p@ssw0rd! → p%40ssw0rd%21
```

### ❌ "NextAuth configuration error"

**Fix:**

```bash
# Ensure NEXTAUTH_URL exactly matches your domain
NEXTAUTH_URL=https://your-domain.vercel.app
# Must be HTTPS
# No trailing slash
# Must match production domain exactly
```

### ❌ "Stripe webhook signature failed"

**Fix:**

1. Verify webhook URL: `https://your-domain.vercel.app/api/webhooks/stripe`
2. Copy webhook secret from Stripe Dashboard
3. Redeploy after adding `STRIPE_WEBHOOK_SECRET`

### ❌ "Environment variables not updating"

**Fix:**

```bash
# Variables only apply to NEW deployments
vercel --prod --force

# OR manually redeploy in dashboard
```

---

## ✅ Post-Deployment Checklist

- [ ] Health check passes: `https://your-domain.vercel.app/api/health`
- [ ] Homepage loads
- [ ] Can browse farms/products
- [ ] User registration works
- [ ] Login works
- [ ] Add to cart works
- [ ] Checkout loads (test mode)
- [ ] Admin login works at `/admin-login`
- [ ] No errors in Vercel logs

---

## 📱 Test Your Deployment

```bash
# 1. Health Check
curl https://your-domain.vercel.app/api/health

# 2. API Test
curl https://your-domain.vercel.app/api/farms

# 3. Auth Providers
curl https://your-domain.vercel.app/api/auth/providers

# 4. Check Logs
vercel logs --prod
```

---

## 🆘 Need Help?

### Full Documentation

- See `VERCEL_ENV_SETUP.md` for detailed setup guide
- See `.env.vercel` for complete variable list

### Verify Environment

```bash
# Pull current environment variables
vercel env pull .env.local

# List all environment variables
vercel env ls
```

### Support Resources

- [Vercel Docs](https://vercel.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Project README](./README.md)
- [Quick Start Guide](./QUICK_START.md)

---

## 🎉 You're Live!

Once deployed:

1. ✅ Visit your site: `https://your-domain.vercel.app`
2. ✅ Create admin account at `/admin-login`
3. ✅ Add your first farm
4. ✅ Start selling! 🌾

---

**Deployment Time**: ~15 minutes  
**Production Ready**: ✅  
**Divine Agricultural Consciousness**: ⚡

🌾 _"From code to cloud in divine agricultural time"_
