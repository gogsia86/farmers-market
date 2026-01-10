# 🔄 RE-SEED VERCEL DATABASE - Fix Login Credentials

**Issue:** Production database has old credentials that don't match current seed file  
**Status:** ⚠️ REQUIRES ACTION  
**Estimated Time:** 5-10 minutes

---

## 🔍 THE PROBLEM

Your Vercel production database currently has **OUTDATED** credentials:

❌ **Currently in Database:**
- Admin: `gogsia@gmail.com` / `Admin123!`
- Farmers: `farmer1@example.com` / `Farmer123!`
- Consumers: `consumer@example.com` / `Customer123!`

✅ **What SHOULD Be in Database (from seed.ts):**
- Admin: `admin@farmersmarket.app` / `DivineAdmin123!`
- Farmers: `ana.romana@email.com` / `FarmLife2024!`
- Consumers: `divna.kapica@email.com` / `HealthyEating2024!`

**Root Cause:** Database was seeded with `seed-basic.ts` (old) instead of `seed.ts` (current)

---

## ✅ SOLUTION: Re-Seed with Correct Data

You have **3 options** to fix this:

### 🎯 Option 1: Quick Re-Seed (RECOMMENDED)

This will **reset and re-seed** the entire database with correct credentials.

```bash
# Step 1: Navigate to project directory
cd "M:/Repo/Farmers Market Platform web and app"

# Step 2: Pull latest Vercel environment variables
vercel env pull .env.vercel.local --yes

# Step 3: Load environment variables (Windows PowerShell)
$env:DATABASE_URL = (Get-Content .env.vercel.local | Select-String "Database_POSTGRES_URL" | ForEach-Object { $_ -replace '.*=', '' })

# Step 3 (Alternative): For Git Bash/WSL
export $(grep Database_POSTGRES_URL .env.vercel.local | xargs)
export DATABASE_URL="$Database_POSTGRES_URL"

# Step 4: Reset database (⚠️ DELETES ALL DATA)
npx prisma migrate reset --force

# Step 5: Re-seed with correct data
npx tsx prisma/seed.ts

# Step 6: Verify the new credentials
echo "✅ Database re-seeded! Test login with:"
echo "Email: admin@farmersmarket.app"
echo "Password: DivineAdmin123!"
```

**⚠️ WARNING:** This will **DELETE ALL existing data** (users, farms, products, orders, etc.)

---

### 🎯 Option 2: Manual User Update (Keep Existing Data)

If you want to **keep existing data** but fix the admin credentials:

```bash
# Step 1: Navigate to project directory
cd "M:/Repo/Farmers Market Platform web and app"

# Step 2: Pull Vercel environment variables
vercel env pull .env.vercel.local --yes

# Step 3: Open Prisma Studio
npx prisma studio

# Step 4: Manually update users in browser
# 1. Go to http://localhost:5555
# 2. Click on "User" table
# 3. Find admin user (gogsia@gmail.com)
# 4. Change email to: admin@farmersmarket.app
# 5. Change password hash (see below for new hash)
# 6. Save changes
```

**New Password Hash for `DivineAdmin123!`:**
```
You'll need to hash it first. Run this:

node -e "const bcrypt = require('bcrypt'); bcrypt.hash('DivineAdmin123!', 10).then(console.log);"
```

**Pros:** Keeps all existing data  
**Cons:** Manual, time-consuming, only fixes admin user

---

### 🎯 Option 3: Update seed-basic.ts to Match seed.ts

Update the old seed script to use new credentials (for future deployments):

```bash
# Step 1: Open seed-basic.ts
code prisma/seed-basic.ts

# Step 2: Replace the admin user section with:
```

```typescript
const adminUser = await prisma.user.upsert({
  where: { email: "admin@farmersmarket.app" },
  update: {},
  create: {
    email: "admin@farmersmarket.app",
    password: await hashPassword("DivineAdmin123!"),
    firstName: "Mile",
    lastName: "Mochwara",
    phone: "+15551234567",
    role: "ADMIN",
    emailVerified: true,
    emailVerifiedAt: new Date(),
    phoneVerified: true,
    phoneVerifiedAt: new Date(),
  },
});
```

```bash
# Step 3: Save and re-run seed
npm run db:seed:vercel:force
```

**Pros:** Consistent with main seed.ts  
**Cons:** Still requires database reset if old data exists

---

## 🚀 RECOMMENDED STEPS (Full Re-Seed)

Follow these steps for a clean, complete re-seed:

### Step 1: Backup Current Data (Optional)

If you have important data you want to keep:

```bash
# Export current data
npx prisma db pull
npx prisma db execute --stdin < backup.sql
```

### Step 2: Pull Vercel Environment

```bash
cd "M:/Repo/Farmers Market Platform web and app"
vercel env pull .env.vercel.local --yes
```

### Step 3: Load Environment Variables

**For PowerShell (Windows):**
```powershell
# Load DATABASE_URL from .env.vercel.local
$envContent = Get-Content .env.vercel.local
foreach ($line in $envContent) {
    if ($line -match '^Database_POSTGRES_URL=(.+)$') {
        $env:DATABASE_URL = $matches[1]
        Write-Host "✅ DATABASE_URL loaded" -ForegroundColor Green
        break
    }
}

# Verify it's set
Write-Host "DATABASE_URL: $env:DATABASE_URL"
```

**For Git Bash/WSL (Linux/Mac):**
```bash
source .env.vercel.local
export DATABASE_URL="$Database_POSTGRES_URL"
echo "✅ DATABASE_URL loaded"
echo "DATABASE_URL: $DATABASE_URL"
```

### Step 4: Reset & Re-Seed Database

```bash
# Generate Prisma Client
npx prisma generate

# Reset database (⚠️ DELETES ALL DATA)
npx prisma migrate reset --force

# This will automatically run seed.ts after reset
# Or manually run:
npx tsx prisma/seed.ts
```

### Step 5: Verify New Credentials

```bash
# Open Prisma Studio
npx prisma studio

# Navigate to http://localhost:5555
# Check User table - you should see:
# - admin@farmersmarket.app (Admin)
# - ana.romana@email.com (Farmer)
# - divna.kapica@email.com (Consumer)
```

### Step 6: Test Production Login

1. Go to: **https://farmers-market-platform.vercel.app/login**
2. Enter credentials:
   - Email: `admin@farmersmarket.app`
   - Password: `DivineAdmin123!`
3. Should successfully log in! ✅

---

## 📝 VERIFY AFTER RE-SEEDING

Run these checks to ensure everything works:

### 1. Check Database Content

```bash
npx prisma studio
```

**Expected Users:**
- ✅ 1 Admin: admin@farmersmarket.app
- ✅ 5 Farmers: ana.romana@email.com, sarah.greenfield@email.com, etc.
- ✅ 3 Consumers: divna.kapica@email.com, emily.conscious@email.com, etc.

### 2. Test All Login Credentials

**Admin:**
```
URL: https://farmers-market-platform.vercel.app/login
Email: admin@farmersmarket.app
Password: DivineAdmin123!
Expected: Successful login ✅
```

**Farmer:**
```
Email: ana.romana@email.com
Password: FarmLife2024!
Expected: Successful login ✅
```

**Consumer:**
```
Email: divna.kapica@email.com
Password: HealthyEating2024!
Expected: Successful login ✅
```

### 3. Verify Data Integrity

```bash
# Count records
npx prisma db execute --stdin <<< '
SELECT 
  (SELECT COUNT(*) FROM "User") as users,
  (SELECT COUNT(*) FROM "Farm") as farms,
  (SELECT COUNT(*) FROM "Product") as products;
'
```

**Expected:**
- Users: 9 (1 admin + 5 farmers + 3 consumers)
- Farms: 5
- Products: 12+

---

## 🔧 TROUBLESHOOTING

### Issue: "Error: Could not connect to database"

**Solution:**
```bash
# Verify DATABASE_URL is set
echo $env:DATABASE_URL  # PowerShell
echo $DATABASE_URL      # Bash

# Re-pull environment variables
vercel env pull .env.vercel.local --yes
```

### Issue: "Command 'tsx' not found"

**Solution:**
```bash
# Install tsx globally
npm install -g tsx

# Or use npx
npx tsx prisma/seed.ts
```

### Issue: "Unique constraint failed"

**Solution:** Data already exists. Run reset first:
```bash
npx prisma migrate reset --force
```

### Issue: "Cannot find module 'bcrypt'"

**Solution:**
```bash
# Install dependencies
npm install

# Verify bcrypt is installed
npm list bcrypt
```

### Issue: Still can't login after re-seeding

**Solution:**
```bash
# 1. Clear browser cache and cookies
# 2. Try incognito/private mode
# 3. Verify password is typed exactly (case-sensitive)
# 4. Check database to confirm email exists:

npx prisma studio
# Look for "admin@farmersmarket.app" in User table
```

---

## 📊 WHAT GETS CREATED

After successful re-seeding, your database will have:

### Users (9 total)
- **1 Admin:** Mile Mochwara (admin@farmersmarket.app)
- **5 Farmers:**
  - Ana Romana (ana.romana@email.com)
  - Sarah Greenfield (sarah.greenfield@email.com)
  - John Harvest (john.harvest@email.com)
  - Maria Flores (maria.flores@email.com)
  - David Organicson (david.organic@email.com)
- **3 Consumers:**
  - Divna Kapica (divna.kapica@email.com)
  - Emily Conscious (emily.conscious@email.com)
  - Michael Green (michael.green@email.com)

### Farms (5 total)
- Sunshine Valley Farm (Ana Romana) - California
- Green Acres Organic (Sarah Greenfield) - Washington
- Harvest Moon Ranch (John Harvest) - Oregon
- Prairie View Homestead (Maria Flores) - Texas
- Riverside Gardens (David Organicson) - New York

### Products (12+ total)
- Fresh vegetables, fruits, eggs, dairy
- Seasonal items with availability dates
- All marked as ACTIVE and published

### Other Data
- Farm photos and certifications
- Sample orders and reviews
- Complete address information
- All relationships properly linked

---

## 📚 RELATED DOCUMENTATION

- **Current Credentials:** [LOGIN_CREDENTIALS.md](./LOGIN_CREDENTIALS.md)
- **Quick Reference:** [QUICK_LOGIN.md](./QUICK_LOGIN.md)
- **Seed Source:** [prisma/seed.ts](./prisma/seed.ts)
- **Original Issue:** Vercel database was seeded with old `seed-basic.ts`

---

## ✅ SUCCESS CRITERIA

You'll know the re-seeding was successful when:

- ✅ Can login with `admin@farmersmarket.app` / `DivineAdmin123!`
- ✅ Can login with farmer accounts (ana.romana@email.com, etc.)
- ✅ Can login with consumer accounts (divna.kapica@email.com, etc.)
- ✅ Prisma Studio shows correct email addresses
- ✅ All farms and products are visible
- ✅ Production site works end-to-end

---

## 🎯 FINAL COMMAND SUMMARY

**Quick Copy-Paste (PowerShell):**
```powershell
cd "M:/Repo/Farmers Market Platform web and app"
vercel env pull .env.vercel.local --yes
$envContent = Get-Content .env.vercel.local
foreach ($line in $envContent) { if ($line -match '^Database_POSTGRES_URL=(.+)$') { $env:DATABASE_URL = $matches[1]; break } }
npx prisma migrate reset --force
npx tsx prisma/seed.ts
Write-Host "✅ Re-seeding complete! Test login with admin@farmersmarket.app / DivineAdmin123!" -ForegroundColor Green
```

**Quick Copy-Paste (Bash):**
```bash
cd "M:/Repo/Farmers Market Platform web and app"
vercel env pull .env.vercel.local --yes
source .env.vercel.local
export DATABASE_URL="$Database_POSTGRES_URL"
npx prisma migrate reset --force
npx tsx prisma/seed.ts
echo "✅ Re-seeding complete! Test login with admin@farmersmarket.app / DivineAdmin123!"
```

---

## 🚨 IMPORTANT WARNINGS

1. **⚠️ DATA LOSS:** `prisma migrate reset --force` will **DELETE ALL DATA**
2. **⚠️ PRODUCTION:** This affects your **LIVE PRODUCTION DATABASE**
3. **⚠️ BACKUP:** Consider backing up important data first
4. **⚠️ TIMING:** Run during low-traffic hours if users are already active
5. **⚠️ TESTING:** Test thoroughly after re-seeding before announcing

---

**Status:** Ready to execute  
**Impact:** High (resets entire database)  
**Duration:** 5-10 minutes  
**Reversibility:** No (requires backup to undo)

**Last Updated:** January 2025

---

**After re-seeding, update this document to reflect completion date and any issues encountered.**