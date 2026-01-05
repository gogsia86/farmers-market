# 🚀 Vercel Deployment Guide - Farmers Market Platform

**Complete step-by-step guide to deploy the Farmers Market Platform to Vercel**

---

## 📋 Prerequisites

Before you begin, ensure you have:

- ✅ GitHub repository with latest code
- ✅ Vercel account (sign up at https://vercel.com)
- ✅ PostgreSQL database (Neon/Vercel Postgres/Railway)
- ✅ Stripe account for payments (optional for initial deployment)
- ✅ Git installed locally

---

## 🎯 Deployment Overview

```
┌─────────────────┐
│  Push to GitHub │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Vercel detects  │
│    new commit   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Build Process  │
│  (6-8 minutes)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Deploy to Edge │
│    Network      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Site is LIVE!  │
└─────────────────┘
```

**Total Time:** 15-20 minutes

---

## 🗄️ Step 1: Set Up Database (5 minutes)

### Option A: Neon (Recommended - Free Tier Available)

1. **Go to** https://neon.tech
2. **Sign up** with GitHub or email
3. **Create a new project:**
   - Project name: `farmers-market-prod`
   - Region: Choose closest to your users
4. **Copy the connection string:**
   ```
   postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
5. **Save this URL** - you'll need it in Step 3

### Option B: Vercel Postgres

1. Go to Vercel Dashboard → Storage
2. Click "Create Database"
3. Select "Postgres"
4. Name it `farmers-market-db`
5. Copy the `POSTGRES_PRISMA_URL` connection string

### Option C: Railway

1. Go to https://railway.app
2. Click "New Project"
3. Select "Provision PostgreSQL"
4. Go to Variables tab
5. Copy `DATABASE_URL`

---

## 🔗 Step 2: Connect GitHub to Vercel (3 minutes)

### First Time Setup

1. **Go to** https://vercel.com/dashboard
2. **Click** "Add New..." → "Project"
3. **Import Git Repository:**
   - Click "Import" next to your Farmers Market Platform repo
   - If not visible, click "Adjust GitHub App Permissions"
4. **Configure Project:**
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (leave as default)
   - Build Command: `npm run vercel-build` (pre-configured)
   - Output Directory: `.next` (pre-configured)

### If Already Connected

1. Vercel will auto-deploy on every push to `main`/`master` branch
2. Skip to Step 3 to add environment variables

---

## 🔐 Step 3: Configure Environment Variables (5 minutes)

**Go to:** Vercel Dashboard → Your Project → Settings → Environment Variables

### Required Variables (Must Have)

Add these **6 essential variables:**

#### 1️⃣ DATABASE_URL

```
Name: DATABASE_URL
Value: postgresql://user:pass@host:5432/database?sslmode=require
Environments: ✅ Production ✅ Preview ✅ Development
```

**Use the connection string from Step 1**

---

#### 2️⃣ NEXTAUTH_SECRET

```
Name: NEXTAUTH_SECRET
Value: [Generate a 32+ character random string]
Environments: ✅ Production ✅ Preview ✅ Development
```

**Generate using:**

```bash
# Mac/Linux/Git Bash
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Or use this test secret (CHANGE IN PRODUCTION!)
dGhpc2lzYXRlc3RzZWNyZXRmb3JuZXh0YXV0aGNoYW5nZWlucHJvZHVjdGlvbg==
```

---

#### 3️⃣ NEXTAUTH_URL

```
Name: NEXTAUTH_URL
Value: https://your-project-name.vercel.app
Environments: ✅ Production ✅ Preview ✅ Development
```

**Replace `your-project-name` with your actual Vercel project URL**

After first deployment, update this with your actual domain.

---

#### 4️⃣ STRIPE_SECRET_KEY

```
Name: STRIPE_SECRET_KEY
Value: sk_test_51xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Environments: ✅ Production ✅ Preview ✅ Development
```

**Get from:** https://dashboard.stripe.com/test/apikeys

For production, use `sk_live_` key instead of `sk_test_`

---

#### 5️⃣ STRIPE_PUBLISHABLE_KEY

```
Name: STRIPE_PUBLISHABLE_KEY
Value: pk_test_51xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Environments: ✅ Production ✅ Preview ✅ Development
```

**Get from:** https://dashboard.stripe.com/test/apikeys

---

#### 6️⃣ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

```
Name: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
Value: pk_test_51xxxxxxxxxxxxxxxxxxxxxxxxxxxxx (same as above)
Environments: ✅ Production ✅ Preview ✅ Development
```

**Note:** The `NEXT_PUBLIC_` prefix exposes this to the browser (safe for publishable keys)

---

### Optional Variables (Recommended)

#### Email Notifications (Resend)

```
Name: RESEND_API_KEY
Value: re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Environments: ✅ Production ✅ Preview ✅ Development
```

**Get from:** https://resend.com/api-keys

---

#### Image Uploads (Cloudinary)

```
Name: CLOUDINARY_CLOUD_NAME
Value: your-cloud-name

Name: CLOUDINARY_API_KEY
Value: 123456789012345

Name: CLOUDINARY_API_SECRET
Value: xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Get from:** https://cloudinary.com/console/settings/security

---

#### Error Tracking (Sentry)

```
Name: SENTRY_DSN
Value: https://xxxxx@o123456.ingest.sentry.io/123456
```

**Get from:** https://sentry.io/settings/projects/

---

### ✅ Environment Variables Checklist

Mark each as you add them to Vercel:

```
Required (Must Have):
☐ DATABASE_URL
☐ NEXTAUTH_SECRET
☐ NEXTAUTH_URL
☐ STRIPE_SECRET_KEY
☐ STRIPE_PUBLISHABLE_KEY
☐ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

Optional (Recommended):
☐ RESEND_API_KEY
☐ CLOUDINARY_CLOUD_NAME
☐ CLOUDINARY_API_KEY
☐ CLOUDINARY_API_SECRET
☐ SENTRY_DSN
```

---

## 🚀 Step 4: Deploy to Vercel (2 minutes)

### Method A: Auto-Deploy from GitHub (Recommended)

1. **Commit and push your code:**

   ```bash
   cd "M:\Repo\Farmers Market Platform web and app"

   # Check what's changed
   git status

   # Add all files
   git add .

   # Commit with descriptive message
   git commit -m "chore: Configure for Vercel deployment"

   # Push to GitHub
   git push origin main
   ```

2. **Vercel automatically detects the push and starts building**
3. **Monitor deployment:**
   - Go to: https://vercel.com/dashboard
   - Click "Deployments" tab
   - Watch the build progress (6-8 minutes)

### Method B: Manual Deploy with Vercel CLI

1. **Install Vercel CLI:**

   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**

   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   cd "M:\Repo\Farmers Market Platform web and app"
   vercel --prod
   ```

---

## ✅ Step 5: Initialize Database (3 minutes)

After successful deployment, set up the database schema:

### Option A: Using Vercel CLI

```bash
# Set environment variable locally
export DATABASE_URL="your_production_database_url_from_step_1"

# Push database schema
npx prisma db push

# Seed with initial data
npm run db:seed:basic
```

### Option B: Using Neon SQL Editor

1. Go to your Neon dashboard
2. Click "SQL Editor"
3. Copy schema from `prisma/schema.prisma`
4. Run manually (not recommended, use Option A)

### Verify Database Setup

```bash
# Check database connection
npx prisma studio

# This opens a browser interface to view your database
```

---

## 🧪 Step 6: Verify Deployment (2 minutes)

### Check Build Logs

1. **Go to:** Vercel Dashboard → Deployments
2. **Click** on the latest deployment
3. **Look for success indicators:**
   ```
   ✅ Prisma Client generated successfully
   ✅ Next.js build completed successfully
   ✅ Build Completed
   ✅ Deployment Ready
   ```

### Test Your Live Site

Visit your deployment URL: `https://your-project.vercel.app`

**Test these critical features:**

```
☐ Homepage loads without errors
☐ Can navigate to /marketplace
☐ Can sign up for new account
☐ Can log in with test credentials
☐ Can view farm listings
☐ Can view product details
☐ Shopping cart functions
☐ Checkout page loads
☐ No console errors in browser DevTools
```

### Test Credentials (After Seeding)

```
Admin:
Email: admin@farmersmarket.com
Password: Admin123!

Farmer:
Email: farmer1@example.com
Password: Farmer123!

Customer:
Email: customer1@example.com
Password: Customer123!
```

---

## 🔧 Troubleshooting

### Build Fails with "DATABASE_URL not found"

**Solution:**

1. Go to Vercel Dashboard → Settings → Environment Variables
2. Verify `DATABASE_URL` is added
3. Make sure it's enabled for Production, Preview, and Development
4. Click "Redeploy" button

---

### Build Fails with "Prisma generate error"

**Solution:**

```bash
# Test locally first
npm install
npx prisma generate
npm run build

# If it works locally, it's an environment issue
```

---

### 500 Internal Server Error on Live Site

**Solution:**

1. Check Vercel logs: Dashboard → Deployments → Latest → Logs
2. Common causes:
   - Missing environment variables
   - Database connection issues
   - Invalid connection string format

**Verify DATABASE_URL format:**

```
✅ Correct: postgresql://user:pass@host:5432/db?sslmode=require
❌ Wrong: postgres://user:pass@host:5432/db (missing 'ql')
❌ Wrong: postgresql://user@host:5432/db (missing password)
```

---

### TypeScript Errors During Build

**Solution:**

```bash
# Run type check locally
npm run type-check

# Fix all errors shown
# Then commit and push again
```

---

### Out of Memory Error

**Solution:**
The build is optimized for Vercel's limits. If you still hit memory limits:

1. Check Vercel plan limits
2. Reduce bundle size by code-splitting
3. Contact Vercel support for increased limits

---

### Database Connection Timeout

**Solution:**

1. **Check database is accessible:**
   ```bash
   psql "your_database_url_here"
   ```
2. **Verify SSL mode is correct:**
   - Neon requires: `?sslmode=require`
   - Railway requires: `?sslmode=require`
   - Vercel Postgres: Pre-configured

---

## 🎯 Post-Deployment Checklist

After successful deployment, complete these steps:

### Immediate Tasks

```
☐ Visit live site and verify it loads
☐ Test user sign up flow
☐ Test farmer registration
☐ Add test farm and product
☐ Test checkout flow (use Stripe test card: 4242 4242 4242 4242)
☐ Check browser console for errors
☐ Test on mobile device
```

### Configuration Tasks

```
☐ Update NEXTAUTH_URL with actual domain
☐ Configure custom domain (optional)
☐ Set up email notifications
☐ Configure image uploads
☐ Enable error tracking (Sentry)
☐ Set up monitoring alerts
```

### Security Tasks

```
☐ Rotate NEXTAUTH_SECRET for production
☐ Use Stripe live keys (not test keys)
☐ Enable rate limiting
☐ Configure CORS policies
☐ Review security headers in vercel.json
☐ Enable 2FA on Vercel account
```

### Performance Tasks

```
☐ Enable Vercel Analytics
☐ Configure CDN caching
☐ Optimize images with Cloudinary
☐ Test Lighthouse scores
☐ Monitor Core Web Vitals
```

---

## 🌐 Custom Domain Setup (Optional)

### Add Your Domain

1. **Go to:** Vercel Dashboard → Your Project → Settings → Domains
2. **Click** "Add Domain"
3. **Enter** your domain (e.g., `farmersmarket.com`)
4. **Follow** DNS configuration instructions

### Configure DNS

Add these records to your domain registrar:

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### Update Environment Variables

```
NEXTAUTH_URL=https://farmersmarket.com
```

---

## 📊 Monitoring & Maintenance

### Vercel Dashboard

Monitor these metrics:

- **Deployments:** Build success/failure
- **Analytics:** Page views, user sessions
- **Speed Insights:** Core Web Vitals
- **Logs:** Runtime errors and warnings

### Database Monitoring

**Neon Dashboard:**

- Connection count
- Query performance
- Storage usage
- Backup status

### Set Up Alerts

1. **Vercel:**
   - Dashboard → Project → Settings → Integrations
   - Add Slack/Discord for deployment notifications

2. **Database:**
   - Set up connection limit alerts
   - Monitor slow query logs
   - Enable backup notifications

---

## 🔄 Continuous Deployment

### Automatic Deployments

Vercel auto-deploys when you:

- Push to `main`/`master` branch (Production)
- Push to any other branch (Preview)
- Open a Pull Request (Preview)

### Manual Deployments

```bash
# Deploy specific branch
vercel --prod

# Deploy preview
vercel

# Deploy with specific configuration
vercel --prod --env DATABASE_URL=xxx
```

### Rollback Deployment

1. Go to: Vercel Dashboard → Deployments
2. Find previous successful deployment
3. Click "..." → "Promote to Production"

---

## 📚 Additional Resources

### Documentation

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Deployment:** https://nextjs.org/docs/deployment
- **Prisma on Vercel:** https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel

### Support

- **Vercel Support:** https://vercel.com/support
- **GitHub Issues:** Submit issues to your repo
- **Community:** https://github.com/vercel/next.js/discussions

### Project Documentation

- `README.md` - Project overview
- `DEPLOYMENT_CHECKLIST.md` - Detailed deployment steps
- `PRODUCTION_SETUP_GUIDE.md` - Production configuration
- `DATABASE_SETUP.md` - Database configuration

---

## 🎉 Success Criteria

Your deployment is successful when:

```
✅ Build completes without errors (6-8 minutes)
✅ Site loads at https://your-project.vercel.app
✅ No 500 errors on any page
✅ Can sign up and log in
✅ Database queries work
✅ Stripe checkout loads
✅ Images load correctly
✅ Mobile responsive design works
✅ Lighthouse score > 90
✅ No console errors in browser
```

---

## 🚀 You're Ready to Deploy!

**Quick Start Command:**

```bash
cd "M:\Repo\Farmers Market Platform web and app"
git add .
git commit -m "chore: Ready for Vercel deployment"
git push origin main

# Then watch: https://vercel.com/dashboard
```

**Timeline:**

- Step 1 (Database): 5 minutes
- Step 2 (GitHub): 3 minutes
- Step 3 (Env Vars): 5 minutes
- Step 4 (Deploy): 2 minutes
- Step 5 (DB Init): 3 minutes
- Step 6 (Verify): 2 minutes

**Total: ~20 minutes** ⏱️

---

## 💡 Pro Tips

1. **Always test locally first:**

   ```bash
   npm run build
   npm run start
   ```

2. **Use Preview Deployments for testing:**
   - Create a `staging` branch
   - Push to it for preview deployment
   - Test before merging to `main`

3. **Monitor your free tier limits:**
   - 100 GB bandwidth/month
   - 100 hours build time/month
   - Upgrade if you exceed

4. **Use environment variable groups:**
   - Group related variables
   - Easier to manage across projects

5. **Enable automatic database backups:**
   - Daily backups recommended
   - Test restore process

---

**Last Updated:** January 2025  
**Status:** ✅ PRODUCTION READY  
**Version:** 1.0.0

**Questions?** Check `TROUBLESHOOTING.md` or open an issue on GitHub.

**Good luck with your deployment! 🚀🌾**
