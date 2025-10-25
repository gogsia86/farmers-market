# 🔐 ENVIRONMENT VARIABLES QUICK REFERENCE

**Status:** Production Deployment - Environment Configuration
**Date:** October 16, 2025

---

## 📋 COMPLETE ENVIRONMENT VARIABLES LIST

Copy these to Vercel Dashboard → Settings → Environment Variables

### ✅ **CRITICAL (REQUIRED FOR DEPLOYMENT)**

```bash
# ================================
# DATABASE (REQUIRED)
# ================================
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
DIRECT_URL="postgresql://user:password@host:5432/database?schema=public"

# ================================
# AUTHENTICATION (REQUIRED)
# ================================
NEXTAUTH_URL="<https://yourdomain.com">
NEXTAUTH_SECRET="GENERATE_WITH_OPENSSL_RAND_BASE64_32"

# ================================
# STRIPE PAYMENT (REQUIRED)
# ================================
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# ================================
# EMAIL SERVICE (REQUIRED)
# ================================
RESEND_API_KEY="re_..."
CONTACT_EMAIL="noreply@yourdomain.com"
```

### 🎯 **RECOMMENDED (ENHANCE FUNCTIONALITY)**

```bash
# ================================
# ERROR MONITORING
# ================================
NEXT_PUBLIC_SENTRY_DSN="<https://...@sentry.io/...">

# ================================
# CACHING (OPTIONAL)
# ================================
REDIS_URL="redis://default:password@host:6379"

# ================================
# VISUAL TESTING
# ================================
CHROMATIC_PROJECT_TOKEN="chpt_a8e50842e415daa"

# ================================
# ANALYTICS (AUTO-ENABLED ON VERCEL)
# ================================
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"
```

### 🔧 **OPTIONAL (ADVANCED FEATURES)**

```bash
# ================================
# OAUTH PROVIDERS
# ================================
GOOGLE_CLIENT_ID="...apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="..."
GITHUB_ID="..."
GITHUB_SECRET="..."

# ================================
# CLOUD STORAGE
# ================================
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."

# ================================
# EXTERNAL APIs
# ================================
WEATHER_API_KEY="..."
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="..."
```

---

## 🚀 QUICK SETUP INSTRUCTIONS

### **1. Generate NEXTAUTH_SECRET (Windows PowerShell)**

```powershell
# Method 1: PowerShell
$bytes = [byte[]]::new(32); (New-Object Security.Cryptography.RNGCryptoServiceProvider).GetBytes($bytes); [Convert]::ToBase64String($bytes)

# Method 2: Node.js (if OpenSSL not available)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Example output:
# "Xf8k2Jd9Pq3Mn7Lp4Rt6Wv5Zx1Yc0Qa2Sb8Gh=="
```

### **2. Setup Supabase Database**

1. Go to: <<https://supabase.com/dashboar>d>
2. Create Project: "farmers-market-production"
3. Region: Choose closest to your users (e.g., East US)
4. Database Password: Generate strong password (save in password manager)
5. Wait 2-3 minutes for provisioning
6. Go to: Settings → Database → Connection string → URI
7. Copy connection string:

```bash
postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

8. Add to Vercel as `DATABASE_URL` and `DIRECT_URL`

### **3. Setup Stripe**

1. Go to: <<https://dashboard.stripe.com/apikey>s>
2. Switch to "Live mode" (toggle in top-right corner)
3. Copy "Publishable key" → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
4. Click "Reveal" on "Secret key" → `STRIPE_SECRET_KEY`
5. Go to: Developers → Webhooks → Add endpoint
   - URL: `<https://yourdomain.com/api/webhooks/stripe`>
   - Events: Select all `payment_intent.*` and `checkout.session.*`
6. Copy "Signing secret" → `STRIPE_WEBHOOK_SECRET`

### **4. Setup Resend Email**

1. Go to: <<https://resend.com/api-key>s>
2. Click "Create API Key"
3. Name: "farmers-market-production"
4. Permission: "Sending access"
5. Copy key → `RESEND_API_KEY`
6. Go to: Domains → Add Domain
7. Add your domain and verify DNS records
8. Set verified email → `CONTACT_EMAIL`

### **5. Add to Vercel**
### Via Dashboard
1. Go to: <<https://vercel.com/dashboar>d>
2. Select project → Settings → Environment Variables
3. For each variable:
   - Click "Add"
   - Name: `DATABASE_URL`
   - Value: `postgresql://...`
   - Environment: Select "Production" (and "Preview" if needed)
   - Click "Save"
### Via CLI
```powershell
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Link project
cd farmers-market
vercel link

# Add variables one by one
vercel env add DATABASE_URL production
# Paste value when prompted

# Or import from file (BE CAREFUL - review file first)
# Create .env.vercel file with production values
# vercel env pull .env.vercel.local
```

---

## 📝 ENVIRONMENT VARIABLE CHECKLIST

### **Before Deployment**

- [ ] `DATABASE_URL` - Supabase connection string added
- [ ] `DIRECT_URL` - Same as DATABASE_URL for Prisma migrations
- [ ] `NEXTAUTH_URL` - Production domain (e.g., `<https://farmers-market.com>`)
- [ ] `NEXTAUTH_SECRET` - Generated 32+ character secret
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe live publishable key
- [ ] `STRIPE_SECRET_KEY` - Stripe live secret key
- [ ] `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
- [ ] `RESEND_API_KEY` - Resend API key
- [ ] `CONTACT_EMAIL` - Verified sender email

### **After Deployment**

- [ ] `CHROMATIC_PROJECT_TOKEN` - Already have: `chpt_a8e50842e415daa`
- [ ] `NEXT_PUBLIC_SENTRY_DSN` - Optional error monitoring
- [ ] `REDIS_URL` - Optional caching
- [ ] OAuth provider credentials - Optional social login

---

## ⚠️ SECURITY WARNINGS

### **CRITICAL: Never Commit Secrets**

```bash
# Verify .gitignore includes:
.env
.env.local
.env.production
.env.vercel
.env.*.local

# Check no secrets committed:
git log -S "sk_live" --all  # Search for Stripe secret keys
git log -S "postgres://" --all  # Search for database URLs
```

### **Production vs Development**

| Variable          | Development (`.env.local`)   | Production (Vercel)             |
| ----------------- | ---------------------------- | ------------------------------- |
| `DATABASE_URL`    | `file:./dev.db` (SQLite)     | `postgresql://...` (PostgreSQL) |
| `NEXTAUTH_URL`    | `http://localhost:3001`      | `<https://yourdomain.com`>        |
| `NEXTAUTH_SECRET` | `development-secret`         | Generated secure secret         |
| `STRIPE_*`        | `pk_test_...`, `sk_test_...` | `pk_live_...`, `sk_live_...`    |

### **Best Practices**

1. ✅ Use different secrets for staging and production
2. ✅ Rotate secrets every 90 days
3. ✅ Enable 2FA on all service accounts (Stripe, Supabase, Vercel)
4. ✅ Use password manager for storing secrets
5. ✅ Limit API key permissions to minimum required
6. ✅ Monitor for leaked secrets with GitGuardian
7. ✅ Set up alerts for suspicious API usage

---

## 🧪 TESTING ENVIRONMENT VARIABLES

### **Test Locally with Production Values**

```powershell
# Create .env.production.local (gitignored)
# Copy production values from Vercel

# Test production build
npm run build

# Test production server
npm run start

# Verify all features work
```

### **Test in Vercel Preview**

1. Push to feature branch
2. Vercel auto-deploys to preview URL
3. Preview uses "Preview" environment variables
4. Test before merging to `main`

### **Verify Variables Loaded**

Create test API route: `pages/api/test-env.ts`

```typescript
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // NEVER expose actual secrets - only check existence
  const vars = {
    DATABASE_URL: !!process.env.DATABASE_URL,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
    STRIPE_SECRET: !!process.env.STRIPE_SECRET_KEY,
    RESEND_API: !!process.env.RESEND_API_KEY,
  };

  res.status(200).json({
    loaded: vars,
    allPresent: Object.values(vars).every((v) => v === true),
  });
}
```

Visit: `<https://yourdomain.com/api/test-env`>

Expected response:

```json
{
  "loaded": {
    "DATABASE_URL": true,
    "NEXTAUTH_SECRET": true,
    "NEXTAUTH_URL": true,
    "STRIPE_SECRET": true,
    "RESEND_API": true
  },
  "allPresent": true
}
```

**DELETE THIS ENDPOINT AFTER TESTING!**

---

## 🔗 SERVICE DASHBOARDS

Quick links to manage your services:

| Service       | Dashboard URL                    | Purpose                            |
| ------------- | -------------------------------- | ---------------------------------- |
| **Vercel**    | <<https://vercel.com/dashboar>d>   | Deployment & environment variables |
| **Supabase**  | <<https://supabase.com/dashboar>d> | Database management                |
| **Stripe**    | <<https://dashboard.stripe.co>m>   | Payment processing                 |
| **Resend**    | <<https://resend.com/dashboar>d>   | Email delivery                     |
| **Chromatic** | <<https://www.chromatic.co>m>      | Visual testing                     |
| **Sentry**    | <<https://sentry.i>o>              | Error monitoring (optional)        |

---

## 📞 SUPPORT CONTACTS

If you encounter issues:

- **Vercel**: <<https://vercel.com/suppor>t> or community forum
- **Supabase**: <<https://supabase.com/suppor>t> or Discord
- **Stripe**: <<https://support.stripe.co>m> or docs
- **Resend**: <<https://resend.com/suppor>t> or docs

---

**Next Step:** Add all required variables to Vercel, then proceed to deployment! 🚀

_Generated with agricultural consciousness on October 16, 2025_
