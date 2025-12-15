# 🚀 Vercel Environment Variables - Quick Reference

## Your Generated Credentials

**NEXTAUTH_SECRET** (Keep this secure!):

```
sB9ytPGnLUWfujhOgoo/WRlrUtvHQUy1SyBdKRo/tDM=
```

---

## Step-by-Step Setup

### 1. Open Vercel Dashboard

🔗 https://vercel.com/medicis-projects/farmers_market/settings/environment-variables

### 2. Add Each Variable

Click **"Add New"** for each variable below:

#### ✅ **DATABASE_URL** (Required)

```
Name: DATABASE_URL
Value: [Your PostgreSQL connection string]
Environments: ✓ Production ✓ Preview ✓ Development
```

**Where to get this:**

- **Option A**: Create Vercel Postgres database in your project's Storage tab
- **Option B**: Use external provider (Supabase, Neon, Railway, etc.)

Example:

```
postgresql://username:password@hostname:5432/database_name
```

---

#### ✅ **NEXTAUTH_URL** (Required)

```
Name: NEXTAUTH_URL
Value: https://farmersmarket-[your-hash].vercel.app
Environments: ✓ Production ✓ Preview
```

**Important:** Use your actual Vercel deployment URL. You can find it after first deployment.

---

#### ✅ **NEXTAUTH_SECRET** (Required)

```
Name: NEXTAUTH_SECRET
Value: sB9ytPGnLUWfujhOgoo/WRlrUtvHQUy1SyBdKRo/tDM=
Environments: ✓ Production ✓ Preview ✓ Development
```

---

#### ✅ **NEXT_PUBLIC_APP_URL** (Required)

```
Name: NEXT_PUBLIC_APP_URL
Value: https://farmersmarket-[your-hash].vercel.app
Environments: ✓ Production ✓ Preview
```

**Note:** Same as NEXTAUTH_URL

---

#### ✅ **NEXT_PUBLIC_API_URL** (Required)

```
Name: NEXT_PUBLIC_API_URL
Value: https://farmersmarket-[your-hash].vercel.app/api
Environments: ✓ Production ✓ Preview
```

---

#### ✅ **SKIP_ENV_VALIDATION** (Required)

```
Name: SKIP_ENV_VALIDATION
Value: 1
Environments: ✓ Production ✓ Preview ✓ Development
```

---

#### ✅ **NODE_ENV** (Required)

```
Name: NODE_ENV
Value: production
Environments: ✓ Production
```

---

### 3. Optional Variables

#### 📧 Email Configuration (Recommended)

```
SMTP_HOST = smtp.gmail.com
SMTP_PORT = 587
SMTP_SECURE = false
SMTP_USER = your-email@gmail.com
SMTP_PASSWORD = [your Gmail app password]
SMTP_FROM = noreply@farmersmarket.app
```

**How to get Gmail app password:**

1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Go to App Passwords
4. Generate password for "Mail"

---

#### 💳 Stripe Payment (If using payments)

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_test_[your_key]
STRIPE_SECRET_KEY = sk_test_[your_key]
STRIPE_WEBHOOK_SECRET = whsec_[your_secret]
```

**Where to get:**

- Keys: https://dashboard.stripe.com/test/apikeys
- Webhook: https://dashboard.stripe.com/test/webhooks
  - Add endpoint: `https://your-app.vercel.app/api/payments/webhook/stripe`
  - Events: `payment_intent.succeeded`, `payment_intent.failed`

---

## After Adding Variables

### Step 1: Redeploy

```bash
vercel --prod
```

### Step 2: Run Migrations (if database is ready)

```bash
# From Vercel project settings, open terminal or:
npx prisma migrate deploy
```

### Step 3: Verify Deployment

Check these URLs:

- ✅ Health: `https://your-app.vercel.app/api/health`
- ✅ Login: `https://your-app.vercel.app/login`
- ✅ Admin: `https://your-app.vercel.app/admin-login`

---

## Common Issues & Solutions

### ❌ "DATABASE_URL is not defined"

**Solution:** Make sure DATABASE_URL is added to all environments (Production, Preview, Development)

### ❌ "Invalid NextAuth URL"

**Solution:** NEXTAUTH_URL must match your actual deployment URL exactly (with https://)

### ❌ Build fails on Prisma

**Solution:** Add this to your build command in Vercel:

```
Settings → General → Build Command:
prisma generate && next build
```

### ❌ Can't connect to database

**Solution:**

1. Check if database accepts connections from Vercel IPs
2. Enable SSL: Add `?sslmode=require` to DATABASE_URL
3. Use connection pooling

---

## Quick Commands

### View all variables:

```bash
vercel env ls
```

### Add a variable:

```bash
vercel env add VARIABLE_NAME production
```

### Pull variables to local:

```bash
vercel env pull .env.local
```

### Redeploy:

```bash
vercel --prod
```

---

## Database Setup Options

### Option 1: Vercel Postgres (Easiest)

1. In Vercel Dashboard → Storage → Create Database
2. Select Postgres
3. Copy connection string
4. Add as DATABASE_URL

### Option 2: Supabase (Free tier)

1. Create project at https://supabase.com
2. Get connection string from Settings → Database
3. Use "Session pooler" connection string
4. Add as DATABASE_URL

### Option 3: Neon (Free tier)

1. Create database at https://neon.tech
2. Get connection string from dashboard
3. Add as DATABASE_URL

---

## 🎯 Minimum Setup to Get Started

**Just these 7 variables will get your app running:**

1. `DATABASE_URL`
2. `NEXTAUTH_URL`
3. `NEXTAUTH_SECRET` → `sB9ytPGnLUWfujhOgoo/WRlrUtvHQUy1SyBdKRo/tDM=`
4. `NEXT_PUBLIC_APP_URL`
5. `NEXT_PUBLIC_API_URL`
6. `SKIP_ENV_VALIDATION` → `1`
7. `NODE_ENV` → `production`

Then redeploy with: `vercel --prod`

---

## Need Help?

- 📖 Full Guide: `VERCEL_ENVIRONMENT_SETUP.md`
- 🌐 Vercel Docs: https://vercel.com/docs
- 💬 Support: https://vercel.com/support

---

**✨ Your NEXTAUTH_SECRET is saved in `nextauth-secret.txt` - Keep it secure!**
