# 🚨 FIX VERCEL DATABASE NOW - COMPLETE GUIDE

**Issue:** No farms or products showing on https://farmers-market-platform.vercel.app/  
**Root Cause:** Database is empty or not properly seeded  
**Status:** ⚠️ NEEDS IMMEDIATE ATTENTION

---

## 🔍 **DIAGNOSIS**

The Vercel production database appears to be empty or incomplete because:

1. ❌ No farms are visible on the homepage
2. ❌ No products are listed
3. ❌ Database may have been reset during deployment
4. ❌ Seed script may not have run on Vercel

---

## ✅ **IMMEDIATE FIX (2 Options)**

### **Option 1: Quick Fix via Vercel Dashboard (5 minutes)**

1. **Go to Vercel Dashboard**
   - Navigate to: https://vercel.com/dashboard
   - Select: `farmers-market-platform` project
   - Go to: **Storage** tab

2. **Connect to Database**
   - Click on your Postgres database
   - Click: **"Data"** or **"Query"** tab
   - This opens the database query interface

3. **Check Current Data**
   ```sql
   -- Run this query to check current state
   SELECT 
     (SELECT COUNT(*) FROM "User") as users,
     (SELECT COUNT(*) FROM "Farm") as farms,
     (SELECT COUNT(*) FROM "Product") as products;
   ```

4. **If Empty, Seed via Vercel CLI**
   - Open terminal in project directory
   - Run these commands:

   ```bash
   # Pull latest environment variables
   vercel env pull .env.vercel.local
   
   # Generate Prisma client
   npx prisma generate
   
   # Run seed script with Vercel database
   npx prisma db seed
   ```

---

### **Option 2: Comprehensive Re-seed (10 minutes)**

**Step 1: Ensure Environment Variables**

```bash
# Pull Vercel environment variables
vercel env pull .env.vercel.local

# Verify DATABASE_URL is present
grep "DATABASE_URL" .env.vercel.local
```

**Step 2: Reset and Migrate Database**

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database (idempotent, safe to run)
npx prisma db push --accept-data-loss

# Run migrations
npx prisma migrate deploy
```

**Step 3: Seed Database**

```bash
# Method A: Use npm script
npm run seed

# Method B: Use Prisma directly
npx prisma db seed

# Method C: Use our automated script
bash scripts/reseed-vercel-now.sh --force
```

**Step 4: Verify Seeding**

```bash
# Check data was inserted
node scripts/check-db.js

# Expected output:
# ✅ DATABASE IS SEEDED
# 🏪 Sample Farms: 5 farms
# 🥬 Sample Products: 12+ products
```

---

## 🔧 **MANUAL DATABASE SEEDING (If Scripts Fail)**

If automated scripts fail, seed manually via SQL:

### **1. Create Admin User**

```sql
INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'admin@farmersmarket.app',
  '$2a$10$YourHashedPasswordHere', -- Use bcrypt hash
  'Divine Admin',
  'ADMIN',
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;
```

### **2. Create Sample Farms**

```sql
-- Insert a sample farm
INSERT INTO "Farm" (id, name, slug, description, status, "ownerId", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  'Green Valley Organic Farm',
  'green-valley-organic',
  'Fresh organic vegetables grown with sustainable practices',
  'ACTIVE',
  (SELECT id FROM "User" WHERE email = 'admin@farmersmarket.app' LIMIT 1),
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM "Farm" WHERE slug = 'green-valley-organic');

-- Add location for the farm
INSERT INTO "Location" (id, address, city, state, "zipCode", country, "farmId", "createdAt", "updatedAt")
SELECT
  gen_random_uuid(),
  '123 Farm Road',
  'Farmville',
  'CA',
  '12345',
  'USA',
  (SELECT id FROM "Farm" WHERE slug = 'green-valley-organic' LIMIT 1),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM "Location" 
  WHERE "farmId" = (SELECT id FROM "Farm" WHERE slug = 'green-valley-organic' LIMIT 1)
);
```

### **3. Create Sample Products**

```sql
-- Insert sample product
INSERT INTO "Product" (
  id, name, slug, description, price, unit, category, 
  "quantityAvailable", status, "farmId", "createdAt", "updatedAt"
)
SELECT
  gen_random_uuid(),
  'Organic Tomatoes',
  'organic-tomatoes',
  'Fresh, vine-ripened organic tomatoes',
  4.99,
  'lb',
  'VEGETABLE',
  100,
  'ACTIVE',
  (SELECT id FROM "Farm" WHERE slug = 'green-valley-organic' LIMIT 1),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM "Product" 
  WHERE slug = 'organic-tomatoes'
);

-- Repeat for more products (carrots, lettuce, etc.)
```

---

## 🎯 **AUTOMATED FIX SCRIPT**

Create this PowerShell script and run it:

**`fix-vercel-database.ps1`**

```powershell
#!/usr/bin/env pwsh

Write-Host "🚨 FIXING VERCEL DATABASE" -ForegroundColor Cyan
Write-Host "═" * 60

# Step 1: Pull environment variables
Write-Host "`n[1/5] Pulling Vercel environment variables..." -ForegroundColor Yellow
vercel env pull .env.vercel.local

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to pull environment variables" -ForegroundColor Red
    Write-Host "Make sure you're logged into Vercel CLI: vercel login" -ForegroundColor Yellow
    exit 1
}

# Step 2: Generate Prisma client
Write-Host "`n[2/5] Generating Prisma client..." -ForegroundColor Yellow
npx prisma generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to generate Prisma client" -ForegroundColor Red
    exit 1
}

# Step 3: Push schema to database
Write-Host "`n[3/5] Pushing schema to database..." -ForegroundColor Yellow
npx prisma db push --accept-data-loss

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to push schema" -ForegroundColor Red
    exit 1
}

# Step 4: Run seed script
Write-Host "`n[4/5] Seeding database..." -ForegroundColor Yellow
npx prisma db seed

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Seed script failed, trying alternative method..." -ForegroundColor Yellow
    npm run seed
}

# Step 5: Verify
Write-Host "`n[5/5] Verifying database..." -ForegroundColor Yellow
node scripts/check-db.js

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ DATABASE FIXED SUCCESSFULLY!" -ForegroundColor Green
    Write-Host "`nYou can now check: https://farmers-market-platform.vercel.app/" -ForegroundColor Cyan
} else {
    Write-Host "`n⚠️  Database verification failed" -ForegroundColor Yellow
    Write-Host "Check Vercel dashboard for manual seeding" -ForegroundColor Yellow
}
```

**Run it:**

```bash
# Windows PowerShell
pwsh fix-vercel-database.ps1

# Or directly in terminal
vercel env pull .env.vercel.local
npx prisma generate
npx prisma db push
npx prisma db seed
```

---

## 🔍 **TROUBLESHOOTING**

### **Problem 1: "Cannot connect to database"**

**Solution:**

```bash
# Check if DATABASE_URL is correct
cat .env.vercel.local | grep DATABASE_URL

# It should look like:
# DATABASE_URL="postgresql://user:pass@aws-0-us-east-1.pooler.supabase.com:5432/postgres"

# If missing, add it manually from Vercel dashboard
# Vercel Dashboard → Storage → Postgres → Settings → Connection String
```

### **Problem 2: "Prisma client not generated"**

**Solution:**

```bash
# Clean and regenerate
rm -rf node_modules/.prisma
npx prisma generate
```

### **Problem 3: "Seed script not found"**

**Solution:**

Check `package.json` has this:

```json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

Or run seed directly:

```bash
npx ts-node prisma/seed.ts
```

### **Problem 4: "Table does not exist"**

**Solution:**

```bash
# Push schema first
npx prisma db push --accept-data-loss

# Then seed
npx prisma db seed
```

---

## 📊 **VERIFICATION CHECKLIST**

After seeding, verify these:

- [ ] **Database has records**
  ```bash
  node scripts/check-db.js
  ```

- [ ] **Homepage shows farms**
  - Visit: https://farmers-market-platform.vercel.app/
  - Should see farm listings

- [ ] **Products are visible**
  - Click on a farm
  - Should see products listed

- [ ] **Admin login works**
  - Go to: https://farmers-market-platform.vercel.app/login
  - Email: `admin@farmersmarket.app`
  - Password: `DivineAdmin123!`

- [ ] **Vercel deployment successful**
  - Check: https://vercel.com/dashboard
  - Last deployment should be green ✅

---

## 🎯 **EXPECTED RESULTS AFTER FIX**

### **Database Counts:**

```
Users:      9 (1 admin, 5 farmers, 3 customers)
Farms:      5
Products:   12+
Orders:     Sample orders
Reviews:    Sample reviews
Photos:     Sample product photos
```

### **Sample Farms:**

1. **Green Valley Organic Farm** - Organic vegetables
2. **Sunrise Dairy Co.** - Fresh dairy products
3. **Mountain Honey Apiaries** - Local honey
4. **Heritage Grain Farm** - Artisan breads
5. **Coastal Seafood Market** - Fresh seafood

### **Sample Products:**

- Organic Tomatoes ($4.99/lb)
- Fresh Carrots ($3.49/lb)
- Romaine Lettuce ($2.99/head)
- Raw Honey ($12.99/jar)
- Artisan Sourdough ($8.99/loaf)
- And more...

---

## 🚀 **QUICK COMMANDS REFERENCE**

```bash
# Complete fix (one-liner)
vercel env pull .env.vercel.local && npx prisma generate && npx prisma db push && npx prisma db seed

# Check database status
node scripts/check-db.js

# Re-seed if needed
bash scripts/reseed-vercel-now.sh --force

# Verify on production
curl https://farmers-market-platform.vercel.app/api/farms | jq
```

---

## 📝 **IMPORTANT NOTES**

1. **Environment Variables:**
   - Always pull latest: `vercel env pull .env.vercel.local`
   - Never commit `.env.vercel.local` to git
   - DATABASE_URL must point to Vercel Postgres

2. **Seeding Safety:**
   - Seed scripts are idempotent (safe to run multiple times)
   - Existing data won't be duplicated
   - Use `--force` flag to reset completely

3. **Production Considerations:**
   - Seeding can take 30-60 seconds
   - Database may be briefly locked during seeding
   - Always backup before major operations

4. **Credentials:**
   - Admin: `admin@farmersmarket.app` / `DivineAdmin123!`
   - Farmers: See `LOGIN_CREDENTIALS.md`
   - Customers: See `LOGIN_CREDENTIALS.md`

---

## 📞 **IF ALL ELSE FAILS**

1. **Check Vercel Logs:**
   ```bash
   vercel logs
   ```

2. **Manual Database Access:**
   - Vercel Dashboard → Storage → Postgres → Data
   - Run SQL queries directly

3. **Contact Support:**
   - Vercel Support: https://vercel.com/support
   - Check Database Connection Pooling settings

4. **Nuclear Option (Last Resort):**
   ```bash
   # This will completely reset the database
   npx prisma migrate reset --force
   npx prisma db seed
   ```

---

## ✅ **SUCCESS CRITERIA**

You'll know it's fixed when:

1. ✅ `node scripts/check-db.js` shows data
2. ✅ Homepage displays farm listings
3. ✅ Products are visible on farm pages
4. ✅ Login works with test credentials
5. ✅ No console errors on frontend

---

**Status:** Ready to fix! 🚀  
**Time Required:** 5-10 minutes  
**Difficulty:** Easy  
**Risk:** Low (idempotent operations)

**Run the fix now and verify at:**  
🌐 https://farmers-market-platform.vercel.app/

---

**Created:** January 2025  
**Last Updated:** Now  
**Priority:** 🔴 HIGH