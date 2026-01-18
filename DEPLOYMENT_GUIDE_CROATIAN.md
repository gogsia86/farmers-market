# 🇭🇷 Croatian Farmers Market Platform - Deployment Guide

## 📋 Table of Contents

1. [Current Status](#current-status)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Database Setup](#database-setup)
4. [Vercel Deployment](#vercel-deployment)
5. [Production Seeding](#production-seeding)
6. [Post-Deployment Verification](#post-deployment-verification)
7. [Troubleshooting](#troubleshooting)
8. [Rollback Plan](#rollback-plan)

---

## 🎯 Current Status

### ✅ What's Ready

- **78 Croatian Farms** seeded locally (Šibenik region)
- **70 Products** with authentic Croatian produce
- **92 Users** including farmers and admin
- **6 Organic Certified Farms**
- **Croatian Admin Account**: `admin@hrvatski-tržnice.hr` / `Admin123!`
- **Build Configuration**: Vercel-ready with `vercel.json`
- **GitHub Repository**: Connected to `gogsia86/farmers-market`

### ⚠️ What's Needed

- [ ] Vercel project linked
- [ ] Production database provisioned
- [ ] Environment variables configured
- [ ] Production database seeded
- [ ] Domain configured (optional)
- [ ] SSL/HTTPS verified

---

## 🚀 Pre-Deployment Checklist

### 1. Local Environment Verification

```bash
# Verify build works locally
cd "Farmers Market Platform web and app"
npm run build

# Check database connection
npm run db:test

# Verify Croatian data exists
npx tsx scripts/check-db-state.ts

# Expected output:
# ✅ Found 78 Croatian farms
# ✅ Croatian admin exists
```

### 2. Code Quality Checks

```bash
# Run all quality checks
npm run quality

# This includes:
# - TypeScript type checking
# - ESLint linting
# - Prettier formatting

# Run tests (optional but recommended)
npm run test:unit
```

### 3. Security Review

```bash
# Ensure no secrets in code
git grep -i "password" --or "api_key" --or "secret"

# Should only find example files and test data
```

---

## 🗄️ Database Setup

### Option A: Vercel Postgres (Recommended - Easiest)

**Pros**: Auto-configured, zero setup, included with Vercel Pro
**Cons**: Costs apply after free tier

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Storage" → "Create Database"
3. Select "Postgres"
4. Choose region: **Europe** (closest to Croatia)
5. Database name: `croatian-farmers-market`
6. Click "Create"

✅ **Done!** `DATABASE_URL` is automatically set in your project.

### Option B: Supabase (Free Tier Available)

**Pros**: Free tier generous (500MB), full Postgres features
**Cons**: Manual configuration needed

1. Go to [Supabase](https://supabase.com)
2. Create new project:
   - Name: `croatian-farmers-market`
   - Region: **Europe (Central EU)**
   - Database Password: (generate secure password)
3. Wait for provisioning (~2 minutes)
4. Get connection string:
   - Settings → Database → Connection String → URI
   - Format: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`
5. Save this for environment variables

### Option C: Railway/Render/Neon

**Railway**: https://railway.app (free $5 credit/month)
**Render**: https://render.com (free tier available)
**Neon**: https://neon.tech (generous free tier)

Choose based on your preference. All support Postgres 14+.

---

## 🚀 Vercel Deployment

### Step 1: Install Vercel CLI

```bash
# Install globally
npm install -g vercel

# Login to Vercel
vercel login

# Follow browser authentication
```

### Step 2: Link Project

```bash
cd "Farmers Market Platform web and app"

# Link to Vercel (creates new project or links existing)
vercel link

# Answer prompts:
# Set up and deploy? Yes
# Which scope? [Your account/team]
# Link to existing project? No (first time) / Yes (if already created)
# Project name: croatian-farmers-market
# Directory: ./ (current directory)
```

### Step 3: Configure Environment Variables

**Option A: Via Vercel Dashboard (Recommended)**

1. Go to https://vercel.com/dashboard
2. Select your project → Settings → Environment Variables
3. Add these variables for **Production**, **Preview**, and **Development**:

```env
# ========================================
# 🔐 REQUIRED - Database
# ========================================
DATABASE_URL=postgresql://user:password@host:5432/dbname
# ☝️ Get this from your database provider (Vercel Postgres, Supabase, etc.)

# ========================================
# 🔐 REQUIRED - Authentication
# ========================================
NEXTAUTH_SECRET=
# Generate with: openssl rand -base64 32
# Example: vZx4mK9pL3nR2qW8eT5yU7iO1aS4dF6g

NEXTAUTH_URL=https://your-project.vercel.app
# ☝️ Replace with your actual Vercel URL after deployment
# Or use custom domain: https://farmers-market.hr

# ========================================
# 🌐 OPTIONAL - Application
# ========================================
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
NEXT_PUBLIC_APP_NAME="Hrvatski Tržnice"
NEXT_PUBLIC_DEFAULT_LOCALE=hr

# ========================================
# 📧 OPTIONAL - Email (for notifications)
# ========================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@yourdomain.com

# ========================================
# 💳 OPTIONAL - Stripe (for payments)
# ========================================
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# ========================================
# 📊 OPTIONAL - Analytics
# ========================================
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# ========================================
# 🖼️ OPTIONAL - Image Storage
# ========================================
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**Option B: Via CLI**

```bash
# Set individual environment variables
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production

# Pull environment variables locally (after setting in dashboard)
vercel env pull
```

### Step 4: Generate NEXTAUTH_SECRET

```bash
# On macOS/Linux
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Or use online generator:
# https://generate-secret.vercel.app/32
```

### Step 5: Deploy to Preview (Staging)

```bash
# Deploy to preview environment (test first!)
vercel

# This will:
# 1. Build your application
# 2. Deploy to preview URL (e.g., your-project-abc123.vercel.app)
# 3. Show you the URL when complete

# Test the preview URL thoroughly!
```

### Step 6: Deploy to Production

```bash
# Deploy to production (live URL)
vercel --prod

# Or push to main branch (if GitHub integration enabled)
git add .
git commit -m "🚀 Deploy Croatian Farmers Market Platform"
git push origin main

# Vercel will auto-deploy main branch → Production
```

---

## 🌱 Production Seeding

After successful deployment, seed your production database with Croatian data.

### Method 1: Automated Production Seed (Recommended)

```bash
# Pull production environment variables
vercel env pull .env.production

# Seed production database
DATABASE_URL="$(grep DATABASE_URL .env.production | cut -d '=' -f2-)" \
  npm run seed:croatian:safe

# Expected output:
# ✅ Connected to production database
# 🌱 Creating admin user...
# 🏞️ Creating 78 Croatian farms...
# 🥬 Creating 70 products...
# ✅ Seeding completed successfully!
```

### Method 2: Via Vercel CLI (Interactive)

```bash
# Connect to production database and seed
vercel env pull
npx tsx scripts/seed-vercel-production.ts

# Follow prompts:
# ⚠️ This will seed PRODUCTION database
# ✅ Continue? (y/N): y
```

### Method 3: Manual Seed (If Methods 1-2 Fail)

```bash
# 1. Get production DATABASE_URL from Vercel dashboard
# 2. Set it temporarily in your terminal

# macOS/Linux:
export DATABASE_URL="postgresql://..."

# Windows (PowerShell):
$env:DATABASE_URL="postgresql://..."

# 3. Run seed
npm run seed:croatian:safe

# 4. Verify
npx tsx scripts/check-db-state.ts
```

---

## ✅ Post-Deployment Verification

### 1. Check Deployment Status

```bash
# View deployment details
vercel inspect

# View recent deployments
vercel ls

# Check logs
vercel logs
```

### 2. Verify Database Seeding

Visit your production URL and check:

```bash
# Get your production URL
vercel inspect --scope production

# Then visit:
# https://your-project.vercel.app
```

**Manual Verification Checklist:**

- [ ] Homepage loads successfully
- [ ] Navigate to `/farms` - should show 78 Croatian farms
- [ ] Click on a farm - should show farm details and products
- [ ] Navigate to `/products` - should show Croatian products
- [ ] Login with admin credentials:
  - Email: `admin@hrvatski-tržnice.hr`
  - Password: `Admin123!`
- [ ] Admin dashboard loads with farm statistics
- [ ] No console errors in browser DevTools

### 3. Automated Health Check

```bash
# Run production health check
npm run verify:production

# This checks:
# - Database connectivity
# - API endpoints
# - Authentication
# - Data integrity
```

### 4. Database State Check

```bash
# Check production database directly
DATABASE_URL="$(vercel env pull --yes && grep DATABASE_URL .env.local | cut -d '=' -f2-)" \
  npx tsx scripts/check-db-state.ts

# Expected output:
# ✅ Users: 92
# ✅ Farms: 78
# ✅ Products: 70
# ✅ Croatian admin exists
# ✅ Found 78 Croatian farms
```

---

## 🔧 Troubleshooting

### Issue 1: Build Fails on Vercel

**Error**: `Type error: ...` or `Cannot find module`

**Solution**:
```bash
# Verify build works locally first
npm run build

# If local build succeeds, check Vercel logs:
vercel logs

# Common fixes:
# 1. Clear Vercel cache and redeploy
vercel --prod --force

# 2. Ensure Node version matches
# Check package.json engines field
# Vercel uses Node 20 by default
```

### Issue 2: Database Connection Fails

**Error**: `Can't reach database server at ...`

**Solutions**:

1. **Check DATABASE_URL is set in Vercel**
   ```bash
   vercel env ls
   # Should show DATABASE_URL in production
   ```

2. **Verify connection string format**
   ```
   ✅ Correct: postgresql://user:pass@host:5432/db?sslmode=require
   ❌ Wrong: postgres://... (use postgresql://)
   ❌ Wrong: Missing ?sslmode=require for cloud databases
   ```

3. **Test connection locally**
   ```bash
   DATABASE_URL="your-production-url" npm run db:test
   ```

4. **Check database is running**
   - Vercel Postgres: Check dashboard
   - Supabase: Check project status
   - Other: Verify service is online

### Issue 3: Seeding Fails - Duplicate Keys

**Error**: `Unique constraint failed on the fields: (email)`

**Solution**:
```bash
# Use the safe seed script (handles duplicates)
npm run seed:croatian:safe

# Or reset and seed fresh (⚠️ DELETES ALL DATA)
DATABASE_URL="..." npx prisma db push --force-reset
DATABASE_URL="..." npm run seed:croatian:safe
```

### Issue 4: Pages Load but No Data Shows

**Problem**: Website works but farms/products empty

**Diagnosis**:
```bash
# Check if data exists in production DB
DATABASE_URL="..." npx tsx scripts/check-db-state.ts

# If shows 0 farms, database wasn't seeded
# Run seeding (see Production Seeding section)
```

### Issue 5: Authentication Not Working

**Error**: `[next-auth][error] SignInError`

**Solutions**:

1. **Verify NEXTAUTH_SECRET is set**
   ```bash
   vercel env ls | grep NEXTAUTH_SECRET
   ```

2. **Verify NEXTAUTH_URL matches deployment URL**
   ```bash
   # Should be your actual Vercel URL
   NEXTAUTH_URL=https://your-actual-project.vercel.app
   ```

3. **Check trusted domains (if using custom domain)**
   - Add custom domain to NEXTAUTH_URL
   - Update in Vercel environment variables

### Issue 6: Images Not Loading

**Problem**: Farm/product images show broken

**Solutions**:

1. **Check if using external image hosts**
   - Update `next.config.js` to allow image domains

2. **Use Cloudinary or Vercel Blob Storage**
   ```bash
   # Configure image hosting in environment variables
   CLOUDINARY_CLOUD_NAME=your-cloud
   CLOUDINARY_API_KEY=your-key
   ```

3. **For now, images use placeholder URLs**
   - Seed script uses picsum.photos placeholders
   - Replace with actual Croatian farm images later

---

## 🔄 Rollback Plan

### If Something Goes Wrong

**Option 1: Revert to Previous Deployment**
```bash
# List recent deployments
vercel ls

# Rollback to previous working deployment
vercel rollback [deployment-url]

# Example:
vercel rollback your-project-abc123.vercel.app
```

**Option 2: Revert via Git**
```bash
# Find last working commit
git log --oneline -10

# Revert to specific commit
git revert [commit-hash]
git push origin main

# Vercel auto-deploys and restores working version
```

**Option 3: Emergency Database Restore**

If database gets corrupted:

```bash
# 1. Reset database schema
DATABASE_URL="..." npx prisma db push --force-reset

# 2. Re-seed with Croatian data
DATABASE_URL="..." npm run seed:croatian:safe

# 3. Verify restoration
DATABASE_URL="..." npx tsx scripts/check-db-state.ts
```

---

## 🎉 Success Checklist

Once deployed, verify everything works:

- [ ] **Website loads**: https://your-project.vercel.app
- [ ] **78 Croatian farms visible** on `/farms` page
- [ ] **Farm details load** when clicking a farm
- [ ] **Products show** on farm pages and `/products`
- [ ] **Admin login works** with Croatian credentials
- [ ] **Dashboard shows stats** (78 farms, 70 products)
- [ ] **No console errors** in browser DevTools
- [ ] **Mobile responsive** - test on phone
- [ ] **SSL/HTTPS active** - shows padlock in browser
- [ ] **Performance good** - loads in < 3 seconds

---

## 📞 Support & Resources

### Useful Commands

```bash
# Check deployment status
vercel inspect

# View live logs
vercel logs --follow

# Open Vercel dashboard
vercel open

# Open production site
vercel open --url

# List all deployments
vercel ls

# Remove deployment
vercel rm [deployment-url]

# Update environment variable
vercel env add VARIABLE_NAME production
```

### Documentation Links

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **NextAuth Docs**: https://next-auth.js.org

### Common URLs

```bash
# After deployment, you'll have:
Production:  https://croatian-farmers-market.vercel.app
Preview:     https://croatian-farmers-market-git-[branch].vercel.app
Dashboard:   https://vercel.com/[your-account]/croatian-farmers-market
Database:    [Depends on provider - Vercel/Supabase/etc]
```

---

## 🚀 Quick Start Commands

### First-Time Deployment

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Link project
cd "Farmers Market Platform web and app"
vercel link

# 4. Set environment variables in Vercel dashboard
# (See "Configure Environment Variables" section)

# 5. Deploy to preview
vercel

# 6. Test preview URL, then deploy to production
vercel --prod

# 7. Seed production database
vercel env pull
npm run seed:croatian:safe

# 8. Verify
npm run verify:production
```

### Subsequent Deployments

```bash
# Option A: Auto-deploy via Git
git add .
git commit -m "Update feature"
git push origin main
# Vercel auto-deploys main branch

# Option B: Manual deploy
vercel --prod

# Option C: Deploy specific branch
git checkout feature-branch
vercel
# Creates preview deployment
```

---

## 🎯 Production Optimization (Post-Launch)

### Performance Tuning

1. **Enable Edge Functions** (for faster global access)
   ```javascript
   // In API routes
   export const runtime = 'edge';
   ```

2. **Add Redis Caching** (for Croatian market data)
   ```bash
   # Add Vercel KV (Redis)
   # Caches farm listings, products, etc.
   ```

3. **Optimize Images**
   ```bash
   # Use Vercel Image Optimization
   # Already configured via Next.js Image component
   ```

4. **Monitor Performance**
   ```bash
   # Add Vercel Analytics
   npm install @vercel/analytics
   ```

### SEO for Croatian Market

1. **Add Croatian Sitemap**
   - Auto-generated at `/sitemap.xml`
   - Submit to Google Search Console

2. **Add Structured Data**
   - LocalBusiness schema for farms
   - Product schema for items

3. **Configure Croatian Language**
   ```env
   NEXT_PUBLIC_DEFAULT_LOCALE=hr
   NEXT_PUBLIC_APP_NAME="Hrvatski Tržnice"
   ```

---

## ✅ Deployment Complete!

Your Croatian Farmers Market Platform is now live! 🎉

**Next Steps:**

1. Share the URL with stakeholders
2. Monitor initial traffic and errors
3. Collect user feedback
4. Plan feature iterations
5. Set up monitoring/analytics

**Test Accounts for Demo:**

```
Admin:
Email: admin@hrvatski-tržnice.hr
Password: Admin123!

Sample Farmer:
Email: (check seed output or database)
Password: Farmer123!
```

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Maintainer**: Croatian Market Development Team