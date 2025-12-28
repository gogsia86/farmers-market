# 🚀 Vercel Import Guide - Step-by-Step

**Farmers Market Platform - GitHub to Vercel Deployment**

✅ **Status**: Code successfully pushed to GitHub  
📍 **Repository**: https://github.com/gogsia86/farmers-market.git  
⏱️ **Estimated Time**: 15-20 minutes

---

## 📋 Prerequisites Completed

- ✅ Code pushed to GitHub (`master` branch)
- ✅ `VERCEL_DEPLOYMENT_ANALYSIS.md` added
- ✅ `DEPLOY_NOW_QUICK_REFERENCE.md` added
- ✅ Build script configured (`scripts/vercel-build.sh`)
- ✅ `vercel.json` configured

---

## 🎯 Step 1: Access Vercel Dashboard

### Option A: Create New Account (If Needed)

1. **Go to Vercel**: https://vercel.com/signup
2. **Sign up with GitHub** (Recommended)
   - Click "Continue with GitHub"
   - Authorize Vercel to access your GitHub account
3. **Complete profile setup**

### Option B: Login to Existing Account

1. **Go to Vercel**: https://vercel.com/login
2. **Sign in with GitHub**

---

## 🎯 Step 2: Import Repository

### 2.1 Navigate to Import Page

1. **After login**, you'll see the Vercel Dashboard
2. **Click** "Add New..." button (top right)
3. **Select** "Project"
4. **Or go directly to**: https://vercel.com/new

### 2.2 Import from GitHub

```
┌─────────────────────────────────────────────────────┐
│  Import Git Repository                              │
├─────────────────────────────────────────────────────┤
│                                                     │
│  🔍 Search repositories...                         │
│                                                     │
│  📁 gogsia86/farmers-market                        │
│     [Import] button                                │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Steps**:
1. **Find** "gogsia86/farmers-market" in the list
2. **Click** "Import" button next to it
3. **Wait** for repository to load (~5 seconds)

---

## 🎯 Step 3: Configure Project

You'll see the "Configure Project" screen:

```
┌─────────────────────────────────────────────────────┐
│  Configure Project                                   │
├─────────────────────────────────────────────────────┤
│  Project Name: farmers-market                       │
│  Framework Preset: Next.js (auto-detected) ✅       │
│  Root Directory: ./                                 │
│  Build Command: npm run vercel-build ✅             │
│  Output Directory: .next ✅                         │
│  Install Command: npm install ✅                    │
└─────────────────────────────────────────────────────┘
```

### 3.1 Basic Settings (Auto-Detected)

**Verify these are correct**:
- ✅ Framework: **Next.js** (should be auto-detected)
- ✅ Root Directory: **`./`** (leave as default)
- ✅ Build Command: **`npm run vercel-build`** (from vercel.json)
- ✅ Output Directory: **`.next`** (Next.js default)
- ✅ Install Command: **`npm install`** (default)

**⚠️ If not auto-detected**: Click "Override" and enter manually

---

## 🎯 Step 4: Add Environment Variables (CRITICAL)

### 4.1 Expand Environment Variables Section

**Click** "Environment Variables" dropdown to expand

### 4.2 Add Required Variables

**CRITICAL - Add these 4 variables first**:

#### Variable 1: DATABASE_URL
```
Name: DATABASE_URL
Value: [See Database Setup section below]
Environment: Production, Preview, Development (select all 3)
```

#### Variable 2: NEXTAUTH_SECRET
```
Name: NEXTAUTH_SECRET
Value: [Generate with: openssl rand -base64 32]
Environment: Production, Preview, Development (select all 3)
```

Example value (generate your own!):
```
Xj8vK2mP9qR4sL7nT6wY3zB5cF1dH8eG0iJ2kM4oN6pQ
```

#### Variable 3: NEXTAUTH_URL
```
Name: NEXTAUTH_URL
Value: https://farmers-market.vercel.app (will update after deploy)
Environment: Production
```

For Preview:
```
Name: NEXTAUTH_URL
Value: https://farmers-market-git-main.vercel.app
Environment: Preview
```

#### Variable 4: NODE_ENV
```
Name: NODE_ENV
Value: production
Environment: Production, Preview, Development (select all 3)
```

### 4.3 Add Payment Variables (If Using Stripe)

#### Stripe Publishable Key (Public)
```
Name: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
Value: pk_test_... (or pk_live_... for production)
Environment: Production, Preview, Development
```

#### Stripe Secret Key (Private)
```
Name: STRIPE_SECRET_KEY
Value: sk_test_... (or sk_live_... for production)
Environment: Production, Preview, Development
```

#### Stripe Webhook Secret
```
Name: STRIPE_WEBHOOK_SECRET
Value: whsec_... (get from Stripe Dashboard → Webhooks)
Environment: Production, Preview, Development
```

### 4.4 Optional but Recommended Variables

#### Cloudinary (Image Upload)
```
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

#### Sentry (Error Tracking)
```
SENTRY_DSN=https://...@sentry.io/...
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
```

#### Email (Optional)
```
EMAIL_SERVER=smtp://user:pass@smtp.provider.com:587
EMAIL_FROM=noreply@yourdomain.com
```

---

## 🗄️ Database Setup (DATABASE_URL)

### Option 1: Vercel Postgres (Recommended) ⭐

**After project is created**:

1. **Go to** Vercel Dashboard → Your Project
2. **Click** "Storage" tab
3. **Click** "Create Database"
4. **Select** "Postgres"
5. **Name**: farmers-market-db
6. **Region**: Same as deployment (iad1 - Washington DC)
7. **Click** "Create"
8. **DATABASE_URL** is automatically added to environment variables ✅

**Skip to Step 5 if using Vercel Postgres**

---

### Option 2: Supabase (Free Tier Available)

1. **Go to**: https://supabase.com
2. **Sign up** / Login
3. **New Project**:
   - Name: farmers-market
   - Database Password: [Strong password]
   - Region: US East (closest to Vercel)
4. **Wait** for project to be ready (~2 minutes)
5. **Go to**: Settings → Database
6. **Find**: Connection Pooling section
7. **Copy**: Connection string (Pooler mode)
8. **Modify**: Add `?pgbouncer=true&connection_limit=1` to end

**Example**:
```
postgresql://postgres.abc123:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

9. **Use this** as DATABASE_URL value in Vercel

---

### Option 3: Neon (Serverless Postgres)

1. **Go to**: https://neon.tech
2. **Sign up** / Login
3. **New Project**:
   - Name: farmers-market
   - Region: US East
   - Postgres Version: 15 (latest)
4. **Copy** connection string
5. **Modify**: Add `?pgbouncer=true&connection_limit=1` to end

**Example**:
```
postgresql://user:pass@ep-cool-name-123456.us-east-2.aws.neon.tech/farmers_market?sslmode=require&pgbouncer=true&connection_limit=1
```

6. **Use this** as DATABASE_URL value in Vercel

---

### Option 4: Railway

1. **Go to**: https://railway.app
2. **Sign up** / Login with GitHub
3. **New Project** → **Provision PostgreSQL**
4. **Go to** Variables tab
5. **Copy** DATABASE_URL
6. **Modify**: Add `?pgbouncer=true&connection_limit=1` to end
7. **Use this** in Vercel

---

## 🎯 Step 5: Deploy!

### 5.1 Review Configuration

**Double-check**:
- ✅ Framework detected: Next.js
- ✅ Build command: `npm run vercel-build`
- ✅ Environment variables: At least 4 critical ones added
- ✅ Database provider chosen (or Vercel Postgres created)

### 5.2 Click Deploy Button

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│              [Deploy] Button                        │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 5.3 Watch Build Progress

You'll see:
```
⏳ Queuing Build...
📦 Installing dependencies... (2-3 minutes)
🔨 Building application... (2-3 minutes)
✅ Build completed successfully!
🚀 Deploying to production...
🎉 Deployment ready!
```

**Build Time**: Approximately 5-7 minutes

---

## ✅ Step 6: Verify Deployment

### 6.1 Get Deployment URL

After successful deployment, you'll see:
```
🎉 Congratulations!
Your project is live at:
https://farmers-market.vercel.app
```

### 6.2 Quick Health Check

**Open in browser**:
```
https://farmers-market.vercel.app/api/health
```

**Expected Response**:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:30:00Z",
  "services": {
    "database": "checking...",
    "version": "1.0.0"
  }
}
```

**Note**: Database status may show "down" until migrations are run (next step)

---

## 🗄️ Step 7: Run Database Migrations

### 7.1 Pull Environment Variables Locally

Open terminal in your project directory:

```bash
# Install Vercel CLI if not already installed
npm install -g vercel

# Login to Vercel
vercel login

# Link to your project
cd "Farmers Market Platform web and app"
vercel link

# Pull environment variables
vercel env pull .env.local
```

### 7.2 Run Prisma Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Verify migrations
npx prisma migrate status
```

**Expected Output**:
```
✅ Prisma schema loaded from prisma/schema.prisma
✅ Datasource "db": PostgreSQL database
✅ 5 migrations found in prisma/migrations
✅ All migrations have been applied
```

### 7.3 Seed Database (Optional)

```bash
# Seed basic data (recommended for testing)
npm run db:seed:basic

# Or comprehensive seed
npm run db:seed
```

---

## ✅ Step 8: Final Verification

### 8.1 Test the Deployed Site

**Visit**: https://farmers-market.vercel.app

**Test**:
1. ✅ **Homepage** loads correctly
2. ✅ **Navigation** works
3. ✅ **/api/health** returns 200 OK
4. ✅ **No console errors** (F12 → Console)

### 8.2 Test Authentication

1. **Go to** `/signup`
2. **Create** test account
3. **Login** with credentials
4. **Verify** session persists

### 8.3 Test Database Connection

1. **Go to** `/farms` (or any page that fetches data)
2. **Verify** data displays correctly
3. **Check** no database errors

### 8.4 Check Vercel Logs

1. **Vercel Dashboard** → Your Project
2. **Click** "Deployments" tab
3. **Click** on latest deployment
4. **Click** "Function Logs"
5. **Verify** no errors

---

## 🌐 Step 9: Update NEXTAUTH_URL (Important!)

### 9.1 Get Final Deployment URL

Your production URL is likely:
```
https://farmers-market.vercel.app
```

Or with custom domain (if configured):
```
https://yourdomain.com
```

### 9.2 Update Environment Variable

1. **Vercel Dashboard** → Your Project
2. **Settings** → **Environment Variables**
3. **Find** `NEXTAUTH_URL`
4. **Edit** production value to match your deployment URL
5. **Save**

### 9.3 Redeploy

**Option A**: Push any change to GitHub (triggers auto-deploy)

**Option B**: Manual redeploy
```bash
vercel --prod
```

**Option C**: Vercel Dashboard
1. **Deployments** tab
2. **Latest deployment** → **... menu**
3. **Redeploy**

---

## 🎯 Step 10: Enable Automatic Deployments

### Already Enabled! ✅

Vercel automatically configured:
- ✅ **Push to `master`** → Production deployment
- ✅ **Push to other branches** → Preview deployment
- ✅ **Pull Requests** → Preview deployment with comment

**Test it**:
```bash
# Make a small change
echo "# Test" >> README.md

# Commit and push
git add README.md
git commit -m "test: Verify auto-deployment"
git push origin master

# Watch deployment in Vercel Dashboard
```

---

## 🎉 Success Checklist

Your deployment is successful when:

- ✅ Site is live at https://farmers-market.vercel.app
- ✅ `/api/health` returns 200 OK
- ✅ Homepage loads in < 2 seconds
- ✅ Can sign up and login
- ✅ Database connection works
- ✅ No console errors
- ✅ Vercel Analytics tracking
- ✅ Auto-deployment on git push working

---

## 🔧 Optional: Custom Domain Setup

### Add Custom Domain

1. **Vercel Dashboard** → Your Project
2. **Settings** → **Domains**
3. **Add Domain** → Enter `yourdomain.com`
4. **Configure DNS**:

   **Option A**: Vercel Nameservers (Easiest)
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```

   **Option B**: A/CNAME Records
   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

5. **Wait** for SSL certificate (2-5 minutes)
6. **Update** `NEXTAUTH_URL` to new domain
7. **Redeploy**

---

## 🚨 Troubleshooting

### Issue: Build Fails

**Check**:
1. **Build logs** in Vercel Dashboard
2. **TypeScript errors**: Run `npm run type-check` locally
3. **Missing dependencies**: Check package.json
4. **Environment variables**: Verify all required vars set

**Fix**:
```bash
# Test build locally
npm run build

# If successful locally, check Vercel logs for specific error
```

---

### Issue: Database Connection Fails

**Symptoms**: 500 errors, health check fails

**Solutions**:
1. **Verify DATABASE_URL** includes `?pgbouncer=true&connection_limit=1`
2. **Check database is online** (login to database provider)
3. **Verify IP whitelist** (some providers require 0.0.0.0/0 for Vercel)
4. **Run migrations**: `npx prisma migrate deploy`

---

### Issue: Authentication Not Working

**Solutions**:
1. **Check NEXTAUTH_SECRET** is set (32+ characters)
2. **Verify NEXTAUTH_URL** matches deployment URL
3. **Clear browser cookies** and try again
4. **Check callback URLs** in OAuth providers (if using)

---

### Issue: Environment Variables Missing

**Solutions**:
1. **Vercel Dashboard** → Settings → Environment Variables
2. **Verify scope**: Production, Preview, Development all selected
3. **Redeploy** after adding variables
4. **Pull locally**: `vercel env pull .env.local`

---

## 📊 Monitoring Setup

### Vercel Analytics (Already Active)

**Access**: Vercel Dashboard → Your Project → Analytics

**Metrics**:
- Page views
- Top pages
- Traffic sources
- Performance metrics

### Set Up External Monitoring (Recommended)

**UptimeRobot** (Free):
1. **Go to**: https://uptimerobot.com
2. **Add Monitor**:
   - Type: HTTP(s)
   - URL: https://farmers-market.vercel.app/api/health
   - Interval: 5 minutes
3. **Set alerts** for downtime

---

## 📚 Next Steps

### Immediate (0-24 hours)

1. ✅ Test all critical user journeys
2. ✅ Monitor error rates in Vercel logs
3. ✅ Check performance in Vercel Analytics
4. ✅ Set up uptime monitoring
5. ✅ Configure custom domain (optional)

### Short-term (1-7 days)

1. ✅ Set up Sentry error tracking
2. ✅ Configure email provider
3. ✅ Test payment flow (if using Stripe)
4. ✅ Run Lighthouse audit
5. ✅ Optimize images and performance

### Long-term (1+ weeks)

1. ✅ Set up staging environment
2. ✅ Configure CI/CD pipeline
3. ✅ Implement monitoring dashboards
4. ✅ Set up backup strategy
5. ✅ Create runbook for operations

---

## 📞 Support Resources

### Documentation

- **This Guide**: VERCEL_IMPORT_GUIDE.md (you are here)
- **Full Analysis**: VERCEL_DEPLOYMENT_ANALYSIS.md
- **Quick Reference**: DEPLOY_NOW_QUICK_REFERENCE.md
- **Operations**: DEPLOYMENT_RUNBOOK.md

### External Help

- **Vercel Docs**: https://vercel.com/docs
- **Vercel Support**: https://vercel.com/help
- **Vercel Discord**: https://vercel.com/discord
- **Next.js Docs**: https://nextjs.org/docs

### Project Repository

- **GitHub**: https://github.com/gogsia86/farmers-market
- **Issues**: https://github.com/gogsia86/farmers-market/issues

---

## 🎉 Congratulations!

You've successfully deployed the Farmers Market Platform to Vercel! 🚀🌾

**Your site is live at**: https://farmers-market.vercel.app

**What you've achieved**:
- ✅ Production-grade Next.js application deployed
- ✅ Database configured and connected
- ✅ Authentication working
- ✅ Automatic deployments enabled
- ✅ Monitoring active
- ✅ Ready to scale!

---

**Deploy with confidence, scale with grace!** 🌾⚡

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Status**: ✅ READY TO USE