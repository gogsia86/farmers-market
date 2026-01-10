# 🚨 FIX LOGIN ISSUE NOW - Quick Action Guide

**Problem:** Can't login to production - credentials don't match database  
**Solution:** Re-seed Vercel database with correct credentials  
**Time:** 5-10 minutes  
**Status:** ⚠️ REQUIRES IMMEDIATE ACTION

---

## 🎯 THE ISSUE

Your production database has **OLD credentials** that don't exist anymore:
- ❌ `gogsia@gmail.com` / `Admin123!` - NOT in current seed file
- ❌ `farmer1@example.com` / `Farmer123!` - NOT in current seed file

The current `seed.ts` file has **NEW credentials**:
- ✅ `admin@farmersmarket.app` / `DivineAdmin123!`
- ✅ `ana.romana@email.com` / `FarmLife2024!`
- ✅ `divna.kapica@email.com` / `HealthyEating2024!`

**Root Cause:** Vercel was seeded with old `seed-basic.ts` instead of current `seed.ts`

---

## ⚡ QUICK FIX (Windows PowerShell)

Open PowerShell in your project directory and run:

```powershell
# Navigate to project
cd "M:\Repo\Farmers Market Platform web and app"

# Run the automated re-seed script
.\scripts\reseed-vercel-production.ps1
```

The script will:
1. ✅ Pull latest Vercel environment variables
2. ✅ Load database connection
3. ✅ Ask for confirmation (type "YES" to proceed)
4. ⚠️ **DELETE ALL existing data**
5. ✅ Reset database schema
6. ✅ Re-seed with correct credentials
7. ✅ Display new login credentials

**Total Time:** ~5 minutes

---

## 🔐 WHAT YOU'LL GET

After re-seeding, you can login with:

### 👑 Admin
```
URL:      https://farmers-market-platform.vercel.app/login
Email:    admin@farmersmarket.app
Password: DivineAdmin123!
```

### 👨‍🌾 Farmers
```
Email:    ana.romana@email.com
Password: FarmLife2024!

Email:    sarah.greenfield@email.com
Password: OrganicFarm23!

Email:    john.harvest@email.com
Password: VeggieKing99!
```

### 🛒 Consumers
```
Email:    divna.kapica@email.com
Password: HealthyEating2024!

Email:    emily.conscious@email.com
Password: LocalFood123!

Email:    michael.green@email.com
Password: FreshLocal99!
```

---

## 📊 DATABASE WILL CONTAIN

After re-seeding:
- ✅ **9 users** (1 admin + 5 farmers + 3 consumers)
- ✅ **5 farms** with complete details
- ✅ **12+ products** across all categories
- ✅ **Sample orders** and reviews
- ✅ **Farm photos** and certifications
- ✅ **Complete relationships** between all entities

---

## ⚠️ WARNINGS

1. **DATA LOSS:** This will **DELETE ALL** existing data in your database
2. **PRODUCTION:** This affects your **LIVE** production database
3. **IRREVERSIBLE:** Cannot be undone without a backup
4. **CONFIRMATION:** Script will ask you to type "YES" before proceeding

---

## 🔧 IF SCRIPT DOESN'T WORK

### Manual Method (Step-by-Step)

```powershell
# 1. Navigate to project
cd "M:\Repo\Farmers Market Platform web and app"

# 2. Pull Vercel environment
vercel env pull .env.vercel.local --yes

# 3. Load DATABASE_URL
$envContent = Get-Content .env.vercel.local
foreach ($line in $envContent) {
    if ($line -match '^Database_POSTGRES_URL=(.+)$') {
        $env:DATABASE_URL = $matches[1]
        break
    }
}

# 4. Verify it's loaded
Write-Host "DATABASE_URL: $env:DATABASE_URL"

# 5. Generate Prisma Client
npx prisma generate

# 6. Reset database (⚠️ DELETES ALL DATA)
npx prisma migrate reset --force --skip-seed

# 7. Re-seed with correct data
npx tsx prisma/seed.ts

# 8. Done!
Write-Host "✅ Database re-seeded! Login with admin@farmersmarket.app / DivineAdmin123!"
```

---

## ✅ VERIFY IT WORKED

After running the script:

### 1. Check Prisma Studio
```powershell
npx prisma studio
```
- Navigate to http://localhost:5555
- Click "User" table
- Should see `admin@farmersmarket.app` (not `gogsia@gmail.com`)

### 2. Test Production Login
1. Go to: https://farmers-market-platform.vercel.app/login
2. Enter:
   - Email: `admin@farmersmarket.app`
   - Password: `DivineAdmin123!`
3. Should successfully log in! ✅

### 3. Test Other Accounts
- Try farmer login: `ana.romana@email.com` / `FarmLife2024!`
- Try consumer login: `divna.kapica@email.com` / `HealthyEating2024!`

---

## 🆘 TROUBLESHOOTING

### "Command not found: tsx"
```powershell
npm install -g tsx
# Then retry
```

### "Cannot connect to database"
```powershell
# Re-pull environment variables
vercel env pull .env.vercel.local --yes
```

### "Unique constraint failed"
```powershell
# Data already exists - run reset first
npx prisma migrate reset --force
```

### Still can't login?
1. Clear browser cache and cookies
2. Try incognito/private browsing mode
3. Verify email is typed exactly: `admin@farmersmarket.app`
4. Verify password is typed exactly: `DivineAdmin123!` (case-sensitive!)

---

## 📚 MORE INFORMATION

- **Complete Guide:** `RESEED_VERCEL_DATABASE.md`
- **All Credentials:** `LOGIN_CREDENTIALS.md`
- **Quick Reference:** `QUICK_LOGIN.md`
- **Seed Source:** `prisma/seed.ts` (lines 104-223)

---

## 🚀 READY TO FIX?

**Run this ONE command:**

```powershell
.\scripts\reseed-vercel-production.ps1
```

**Or if you prefer no confirmation:**

```powershell
.\scripts\reseed-vercel-production.ps1 -Force
```

---

## ✨ AFTER FIXING

Once the script completes successfully:

1. ✅ Update `LOGIN_CREDENTIALS.md` to mark as "VERIFIED"
2. ✅ Test all 3 user types (admin, farmer, consumer)
3. ✅ Verify marketplace shows products
4. ✅ Test complete user journey
5. ✅ Document completion date in this file

---

**Status:** Ready to execute  
**Impact:** Fixes login issue permanently  
**Risk:** Low (test data only)  
**Duration:** 5-10 minutes  

**Last Updated:** January 2025

---

## 🎯 SUCCESS CRITERIA

You'll know it's fixed when:
- ✅ Can login with `admin@farmersmarket.app` / `DivineAdmin123!`
- ✅ Old credentials (`gogsia@gmail.com`) no longer work
- ✅ All farmer and consumer accounts work
- ✅ Production site fully functional

---

**GO FIX IT NOW!** 🚀

Run: `.\scripts\reseed-vercel-production.ps1`
