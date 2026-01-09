# 🚀 Setup Vercel Database - Step by Step

**Your project is already linked to Vercel!**
- Project: `farmers-market-platform`
- Project ID: `prj_lOITua9QUS4q0EoC4ZsaChCwaiDS`

---

## ⚡ FASTEST METHOD: Vercel Postgres (5 Minutes)

### Step 1: Create Database in Vercel Dashboard

1. **Go to Vercel Dashboard:**
   ```
   https://vercel.com/team_XuAjQnKnlEeUMIx1zh8WtO5X/farmers-market-platform
   ```

2. **Create Database:**
   - Click **"Storage"** tab
   - Click **"Create Database"**
   - Select **"Postgres"**
   - Choose region: **"Washington D.C., USA (iad1)"** (same as your app)
   - Click **"Create"**

3. **Done!**
   - Vercel automatically adds these environment variables:
     - `POSTGRES_URL`
     - `POSTGRES_PRISMA_URL`
     - `POSTGRES_URL_NON_POOLING`
     - `POSTGRES_USER`, `POSTGRES_HOST`, `POSTGRES_PASSWORD`, `POSTGRES_DATABASE`

### Step 2: Update Prisma Schema (Already Done)

Your `schema.prisma` should use (check if needed):
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("POSTGRES_PRISMA_URL")
  directUrl = env("POSTGRES_URL_NON_POOLING")
}
```

### Step 3: Connect Locally and Seed

```bash
# Pull environment variables from Vercel
vercel env pull .env.vercel.local

# Load the variables
source .env.vercel.local  # On Mac/Linux
# OR manually copy DATABASE_URL from .env.vercel.local to your terminal

# Run migrations
export DATABASE_URL="<paste POSTGRES_PRISMA_URL from .env.vercel.local>"
npx prisma migrate deploy

# Seed database
npm run db:seed
```

### Step 4: Deploy

```bash
git push origin master
```

### Step 5: Test

```bash
# Get your deployment URL
vercel --prod

# Test authentication
curl https://your-app.vercel.app/api/auth/session

# Test login
curl -X POST https://your-app.vercel.app/api/auth/callback/credentials \
  -H "Content-Type: application/json" \
  -d '{"email":"farmer1@example.com","password":"Farmer123!"}'
```

---

## 🔧 ALTERNATIVE: Manual Environment Variable Setup

If Vercel Postgres doesn't auto-configure, or you want to use a different database:

### Option A: Use Supabase (Free)

1. **Create Supabase Project:**
   - Go to https://supabase.com
   - Create new project
   - Wait for database to be ready (~2 minutes)

2. **Enable PostGIS:**
   - Go to SQL Editor
   - Run: `CREATE EXTENSION IF NOT EXISTS postgis;`

3. **Get Connection String:**
   - Go to Settings → Database
   - Copy "Connection string" under "Connection pooling"
   - Replace `[YOUR-PASSWORD]` with your actual password

4. **Add to Vercel:**
   ```bash
   # Add DATABASE_URL
   vercel env add DATABASE_URL preview production
   # Paste: postgresql://postgres.[REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres

   # Add DIRECT_URL
   vercel env add DIRECT_URL preview production
   # Paste same URL

   # Add NEXTAUTH_SECRET (generate new one)
   openssl rand -base64 32
   vercel env add NEXTAUTH_SECRET preview production
   # Paste generated secret

   # Add AUTH_TRUST_HOST
   vercel env add AUTH_TRUST_HOST preview production
   # Enter: true

   # Add SKIP_ENV_VALIDATION
   vercel env add SKIP_ENV_VALIDATION preview production
   # Enter: true
   ```

5. **Redeploy:**
   ```bash
   git push origin master
   ```

### Option B: Use Local Database (Testing Only)

**⚠️ WARNING: Not recommended for production!**

1. **Install and Start ngrok:**
   ```bash
   npm install -g ngrok
   ngrok tcp 5433
   ```

2. **Copy ngrok URL:**
   - Look for: `tcp://0.tcp.ngrok.io:12345`
   - Note the host and port

3. **Add to Vercel:**
   ```bash
   # Format: postgresql://postgres:test_password_123@HOST:PORT/farmersmarket_test
   vercel env add DATABASE_URL preview
   # Enter: postgresql://postgres:test_password_123@0.tcp.ngrok.io:12345/farmersmarket_test

   vercel env add NEXTAUTH_SECRET preview
   # Generate: openssl rand -base64 32

   vercel env add AUTH_TRUST_HOST preview
   # Enter: true
   ```

4. **Deploy:**
   ```bash
   git push origin master
   ```

---

## 📋 Required Environment Variables Checklist

After setup, verify these are set in Vercel:

### For Vercel Postgres:
- [ ] `POSTGRES_URL` (auto-added)
- [ ] `POSTGRES_PRISMA_URL` (auto-added)
- [ ] `POSTGRES_URL_NON_POOLING` (auto-added)
- [ ] `NEXTAUTH_SECRET` (add manually if not exists)
- [ ] `AUTH_TRUST_HOST=true` (add manually)

### For External Database:
- [ ] `DATABASE_URL`
- [ ] `DIRECT_URL`
- [ ] `NEXTAUTH_SECRET`
- [ ] `AUTH_TRUST_HOST=true`
- [ ] `SKIP_ENV_VALIDATION=true`

---

## 🔍 Check Current Environment Variables

```bash
# List all environment variables
vercel env ls

# Pull environment variables locally
vercel env pull .env.vercel.local

# View environment variables
cat .env.vercel.local
```

---

## ✅ Verify Setup

### 1. Check Vercel Dashboard
   ```
   https://vercel.com/team_XuAjQnKnlEeUMIx1zh8WtO5X/farmers-market-platform/settings/environment-variables
   ```

### 2. Test Database Connection
   ```bash
   # Pull env vars
   vercel env pull .env.vercel.local

   # Test connection
   source .env.vercel.local
   psql $DATABASE_URL -c "SELECT version();"
   ```

### 3. Test Deployment
   ```bash
   # Check logs
   vercel logs

   # Test API endpoint
   curl https://farmers-market-platform.vercel.app/api/auth/session
   ```

---

## 🐛 Troubleshooting

### "Environment variable not found"
```bash
# Make sure you're adding to correct environment
vercel env add VARIABLE_NAME preview production development
```

### "Can't connect to database"
```bash
# Check database URL format
echo $DATABASE_URL
# Should be: postgresql://user:pass@host:port/database

# Test connection
psql $DATABASE_URL
```

### "Prisma Client not generated"
```bash
# Force rebuild
vercel --force
```

### "Migration failed"
```bash
# Pull env vars
vercel env pull .env.vercel.local

# Run migrations manually
source .env.vercel.local
npx prisma migrate deploy
```

---

## 🎯 Quick Commands Reference

```bash
# Link project (already done)
vercel link

# List env vars
vercel env ls

# Add env var
vercel env add VARIABLE_NAME preview

# Pull env vars
vercel env pull .env.vercel.local

# Remove env var
vercel env rm VARIABLE_NAME preview

# Deploy
vercel --prod

# View logs
vercel logs

# Open in browser
vercel --open
```

---

## 🔐 Test Credentials

After seeding, use these credentials to test:

```
Admin:
  Email: gogsia@gmail.com
  Password: Admin123!

Farmer:
  Email: farmer1@example.com
  Password: Farmer123!

Consumer:
  Email: consumer@example.com
  Password: Consumer123!
```

Full list in `CREDENTIALS_QUICK_REF.txt`

---

## 🎉 You're Done!

Once environment variables are set:

1. ✅ Deploy: `git push origin master`
2. ✅ Seed database: `npm run db:seed` (with Vercel DB URL)
3. ✅ Test: `https://your-app.vercel.app/login`
4. ✅ Login with: `farmer1@example.com` / `Farmer123!`

---

**Need More Help?**
- Full Guide: `docs/VERCEL_DATABASE_SETUP.md`
- Quick Start: `VERCEL_QUICK_SETUP.md`
- Credentials: `CREDENTIALS_QUICK_REF.txt`

**Last Updated:** 2026-01-09
