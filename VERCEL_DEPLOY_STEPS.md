# 🚀 Vercel Deployment - Step by Step Fix

## Problem
Git author email doesn't have permission to deploy to team "gogsia" on Vercel.

## ✅ Solution: Use GitHub Integration (Recommended)

### Step 1: Go to Vercel Dashboard
Open in browser: https://vercel.com/new

### Step 2: Import Your Repository
1. Click "Add New..." → "Project"
2. Select "Import Git Repository"
3. Find and select: `gogsia86/farmers-market`
4. Click "Import"

### Step 3: Configure Project Settings
**Leave these as auto-detected (from vercel.json):**
- Framework Preset: Next.js ✅
- Root Directory: ./ ✅
- Build Command: `npm run vercel-build` ✅
- Output Directory: `.next` ✅
- Install Command: `npm install` ✅

### Step 4: Add Environment Variables
Click "Environment Variables" and add these **REQUIRED** variables:

```bash
# Database (REQUIRED - set this up first!)
DATABASE_URL=postgresql://user:password@host:5432/database

# Authentication (REQUIRED)
NEXTAUTH_URL=https://farmers-market-platform.vercel.app
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32

# Stripe (REQUIRED for payments)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App URL
NEXT_PUBLIC_APP_URL=https://farmers-market-platform.vercel.app
```

**Scope for all variables**: Production, Preview, Development

### Step 5: Set Up Database First!

**Option A: Neon (Recommended - Free)**
1. Go to https://neon.tech
2. Sign up / Login
3. Click "Create Project"
4. Name: "farmers-market"
5. Copy the connection string
6. Paste as `DATABASE_URL` in Vercel

**Option B: Vercel Postgres**
1. In Vercel Dashboard, go to "Storage" tab
2. Click "Create Database" → "Postgres"
3. Name it "farmers-market-db"
4. DATABASE_URL will be auto-added to your project

### Step 6: Generate NEXTAUTH_SECRET

Run this in PowerShell:
```powershell
# Generate random 32-character secret
-join ((33..126) | Get-Random -Count 32 | ForEach-Object {[char]$_})

# Or use this online: https://generate-secret.vercel.app/32
```

### Step 7: Deploy!
Click "Deploy" button

Vercel will:
- ✅ Install dependencies
- ✅ Run `npm run vercel-build`
- ✅ Generate Prisma Client
- ✅ Build Next.js
- ✅ Deploy to global CDN

**Build time**: 2-3 minutes ⏱️

### Step 8: Run Database Migrations
After deployment succeeds:

```powershell
# In your local project
cd "M:\Repo\Farmers Market Platform web and app"

# Pull environment variables from Vercel
vercel env pull .env.local

# Run migrations
npx prisma migrate deploy

# Optional: Seed database with test data
npm run seed
```

### Step 9: Verify Deployment
Visit your deployment URL (shown after deployment completes):
- ✅ Homepage loads
- ✅ Can register/login
- ✅ Database connections work
- ✅ No errors in browser console

---

## 🔧 Alternative: Fix CLI Permission Issue

If you really want to use CLI deployment:

### Option 1: Add Email to Team
1. Go to Vercel Dashboard
2. Team "gogsia" → Settings → Members
3. Add your email: `148980225+gogsia@users.noreply.github.com`
4. Accept invitation
5. Try `vercel --prod` again

### Option 2: Deploy to Personal Account
1. Remove the team link:
   ```powershell
   Remove-Item -Recurse -Force .vercel
   ```
2. Deploy without team:
   ```powershell
   vercel --yes
   ```
3. When prompted, select "Create new project"
4. Select your personal account (not team)

---

## 📊 What You'll Get

After successful deployment:
- 🌐 Live URL: `https://farmers-market-platform.vercel.app`
- 📊 Automatic deployments on every git push
- 🚀 Global CDN with edge functions
- 📈 Analytics dashboard
- 🔄 Preview deployments for PRs

---

## ⚠️ Important Notes

1. **Database Required**: The app won't work without DATABASE_URL
2. **Environment Variables**: Must be set before first deployment
3. **Migrations**: Run after first deployment to set up database schema
4. **Stripe Test Mode**: Use test keys initially, switch to live later

---

## 🎉 Next Steps After Deployment

1. ✅ Test the live site thoroughly
2. ✅ Update Stripe webhook URL to your Vercel domain
3. ✅ Configure custom domain (optional)
4. ✅ Enable Vercel Analytics
5. ✅ Set up monitoring/alerts

---

**Need help?** Check the full guide in `VERCEL_DEPLOY_GUIDE.md`
