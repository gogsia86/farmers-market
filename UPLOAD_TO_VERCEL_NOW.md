# 🚀 Upload Environment Variables to Vercel - MANUAL STEPS

**Quick Guide - No Scripts Required**

---

## Step 1: Generate Your Secrets (5 minutes)

### On Windows (PowerShell):

```powershell
# Open PowerShell and run:

# NEXTAUTH_SECRET
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# JWT_SECRET
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# ADMIN_API_KEY
-join ((48..57) + (65..70) | Get-Random -Count 64 | ForEach-Object {[char]$_})

# ADMIN_SECRET_KEY
-join ((48..57) + (65..70) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

### On Mac/Linux:

```bash
# NEXTAUTH_SECRET
openssl rand -base64 32

# JWT_SECRET
openssl rand -base64 32

# ADMIN_API_KEY
openssl rand -hex 32

# ADMIN_SECRET_KEY
openssl rand -hex 32
```

**Copy these generated values somewhere safe!**

---

## Step 2: Get Your Service API Keys (15 minutes)

### Required Services:

1. **Database** (Choose one):
   - **Vercel Postgres**: https://vercel.com/dashboard → Storage → Create Database
   - **Supabase**: https://supabase.com → New Project → Database Settings → Connection String
2. **Stripe** (Required for payments):
   - API Keys: https://dashboard.stripe.com/apikeys
   - Webhook: https://dashboard.stripe.com/webhooks → Add endpoint → `https://YOUR-DOMAIN.vercel.app/api/webhooks/stripe`

3. **SendGrid** (Required for email):
   - API Key: https://app.sendgrid.com/settings/api_keys → Create API Key

4. **Google Maps** (Required for location):
   - https://console.cloud.google.com/google/maps-apis → Enable APIs → Create Credentials

### Optional but Recommended:

5. **Upstash Redis** (For caching):
   - https://console.upstash.com → Create Database → Copy REST URL & Token

6. **Sentry** (For error tracking):
   - https://sentry.io → Create Project → Copy DSN

---

## Step 3: Add to Vercel Dashboard (10 minutes)

### Method A: Vercel Dashboard (Easiest)

1. Go to https://vercel.com/dashboard
2. Select your project (`farmers-market`)
3. Click **Settings** (top menu)
4. Click **Environment Variables** (left sidebar)
5. For each variable below, click **Add New**:

### 🔴 REQUIRED VARIABLES (Add these first):

```
Name: DATABASE_URL
Value: postgresql://user:pass@host:5432/farmersmarket?schema=public
Environment: ✅ Production  ✅ Preview

Name: NEXTAUTH_URL
Value: https://your-project.vercel.app
Environment: ✅ Production  ✅ Preview

Name: NEXTAUTH_SECRET
Value: [paste generated secret from Step 1]
Environment: ✅ Production  ✅ Preview

Name: JWT_SECRET
Value: [paste generated secret from Step 1]
Environment: ✅ Production  ✅ Preview

Name: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
Value: pk_live_xxxxxxxxx
Environment: ✅ Production  ✅ Preview

Name: STRIPE_SECRET_KEY
Value: sk_live_xxxxxxxxx
Environment: ✅ Production

Name: STRIPE_WEBHOOK_SECRET
Value: whsec_xxxxxxxxx
Environment: ✅ Production

Name: SENDGRID_API_KEY
Value: SG.xxxxxxxxx
Environment: ✅ Production

Name: GOOGLE_MAPS_API_KEY
Value: AIzaSyxxxxxxxxx
Environment: ✅ Production  ✅ Preview

Name: ADMIN_API_KEY
Value: [paste generated key from Step 1]
Environment: ✅ Production

Name: ADMIN_SECRET_KEY
Value: [paste generated key from Step 1]
Environment: ✅ Production
```

### 🟡 RECOMMENDED VARIABLES (Add for better performance):

```
Name: REDIS_ENABLED
Value: true
Environment: ✅ Production

Name: UPSTASH_REDIS_REST_URL
Value: https://xxx.upstash.io
Environment: ✅ Production

Name: UPSTASH_REDIS_REST_TOKEN
Value: [your upstash token]
Environment: ✅ Production

Name: SENTRY_DSN
Value: https://xxx@sentry.io/xxx
Environment: ✅ Production

Name: CLOUDINARY_CLOUD_NAME
Value: [your cloud name]
Environment: ✅ Production

Name: CLOUDINARY_API_KEY
Value: [your api key]
Environment: ✅ Production

Name: CLOUDINARY_API_SECRET
Value: [your api secret]
Environment: ✅ Production
```

---

## Step 4: Deploy to Production (2 minutes)

### After adding all variables:

1. Go to your Vercel Dashboard
2. Click **Deployments** tab
3. Find the latest deployment
4. Click the **⋮** menu (three dots)
5. Click **Redeploy**
6. Check "Use existing Build Cache" = OFF
7. Click **Redeploy**

**OR use CLI:**

```bash
npm i -g vercel
vercel login
vercel --prod --force
```

---

## Step 5: Verify Everything Works (3 minutes)

### Test these URLs (replace with your domain):

```bash
# 1. Health Check
https://your-project.vercel.app/api/health
# Should return: {"status":"healthy"}

# 2. Homepage
https://your-project.vercel.app
# Should load without errors

# 3. API Test
https://your-project.vercel.app/api/farms
# Should return JSON data

# 4. Authentication
https://your-project.vercel.app/api/auth/providers
# Should return auth providers
```

---

## Troubleshooting

### ❌ "Database connection failed"

- Check DATABASE_URL format: `postgresql://USER:PASS@HOST:PORT/DB?schema=public`
- Ensure password is URL-encoded (special characters like `@` → `%40`)
- Verify database allows connections from Vercel

### ❌ "NextAuth configuration error"

- Verify NEXTAUTH_URL exactly matches your Vercel domain
- Must use `https://` (not `http://`)
- No trailing slash
- Must be your actual production URL

### ❌ "Stripe webhook failed"

- Verify webhook URL in Stripe Dashboard
- Check STRIPE_WEBHOOK_SECRET matches Stripe Dashboard
- Webhook must be `https://your-domain.vercel.app/api/webhooks/stripe`

### ❌ "Environment variables not loading"

- Redeploy after adding variables (they don't apply to old deployments)
- Check you selected "Production" environment when adding
- Clear build cache and redeploy

---

## Quick Checklist

Before going live, verify:

- [ ] All 11 required variables added
- [ ] Secrets generated (not using placeholder values)
- [ ] Database connection works
- [ ] Stripe webhook configured
- [ ] Email service tested
- [ ] Google Maps API enabled
- [ ] Redeployed after adding variables
- [ ] Health endpoint returns healthy status
- [ ] Homepage loads without errors
- [ ] Can browse farms/products
- [ ] User registration works
- [ ] Login works

---

## Need More Help?

- **Full Guide**: See `VERCEL_ENV_SETUP.md` for comprehensive instructions
- **Quick Deploy**: See `VERCEL_QUICK_DEPLOY.md` for streamlined deployment
- **Automation**: See `scripts/upload-env-to-vercel.ps1` or `.sh` for automated upload

---

**Estimated Total Time**: 35 minutes

🌾⚡ _"From environment variables to production in divine agricultural time"_
