# 🌟 FIX FEATURED FARMS - COMPREHENSIVE GUIDE

**Issue:** "No Featured Farms Yet" message appearing on homepage  
**Cause:** Farms in database are not ACTIVE and/or VERIFIED  
**Solution:** Activate and verify farms in database

---

## 🎯 QUICK FIX (Choose One Method)

### Method 1: Using Prisma Studio (EASIEST)

```bash
# 1. Open Prisma Studio
npm run db:studio

# 2. Navigate to the "Farm" model
# 3. For each farm, click to edit and set:
#    - status: "ACTIVE"
#    - verificationStatus: "VERIFIED"
#    - verifiedAt: (current date/time)
#    - verifiedBy: "admin"
# 4. Save changes
# 5. Refresh your homepage at http://localhost:3001
```

---

### Method 2: Direct SQL (FASTEST)

```sql
-- Run this SQL in your PostgreSQL client or Prisma Studio SQL tab

-- 1. Check current status
SELECT name, status, "verificationStatus", city, state
FROM "Farm";

-- 2. Activate all farms
UPDATE "Farm"
SET
    status = 'ACTIVE',
    "verificationStatus" = 'VERIFIED',
    "verifiedAt" = NOW(),
    "verifiedBy" = 'system-admin',
    "updatedAt" = NOW();

-- 3. Verify the update
SELECT name, status, "verificationStatus", city, state
FROM "Farm"
WHERE status = 'ACTIVE' AND "verificationStatus" = 'VERIFIED';
```

---

### Method 3: Using Node Script (RECOMMENDED)

```bash
# Create and run this script
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  console.log('🌟 Activating farms...');

  const result = await prisma.farm.updateMany({
    data: {
      status: 'ACTIVE',
      verificationStatus: 'VERIFIED',
      verifiedAt: new Date(),
      verifiedBy: 'system-admin'
    }
  });

  console.log('✅ Activated', result.count, 'farms');

  const farms = await prisma.farm.findMany({
    where: { status: 'ACTIVE', verificationStatus: 'VERIFIED' },
    select: { name: true, city: true, state: true }
  });

  console.log('\\n📋 Featured Farms:');
  farms.forEach((f, i) => console.log(i + 1 + '.', f.name, '-', f.city + ',', f.state));

  await prisma.\$disconnect();
})();
"
```

---

## 📋 STEP-BY-STEP SOLUTION

### Step 1: Check if Farms Exist

```bash
# Option A: Using Prisma Studio
npm run db:studio
# Navigate to Farm table and check if farms exist

# Option B: Using psql
psql -U your_username -d your_database -c "SELECT COUNT(*) FROM \"Farm\";"
```

**If no farms exist:**

```bash
# Seed the database
npm run prisma:seed
# or
npx tsx prisma/seed-comprehensive.js
```

---

### Step 2: Understand the Problem

The Featured Farms API (`/api/featured/farms/route.ts`) requires farms to have:

- ✅ `status: "ACTIVE"`
- ✅ `verificationStatus: "VERIFIED"`

Current farm status might be:

- ❌ `status: "PENDING"`
- ❌ `verificationStatus: "PENDING"`

---

### Step 3: Activate the Farms

#### Option A: Prisma Studio (Visual Interface)

1. **Open Prisma Studio:**

   ```bash
   npm run db:studio
   ```

2. **Navigate to Farm Model:**
   - Click on "Farm" in the left sidebar
   - You'll see all farms listed

3. **Edit Each Farm:**
   - Click on any farm row
   - Find `status` field → Change to `ACTIVE`
   - Find `verificationStatus` field → Change to `VERIFIED`
   - Find `verifiedAt` field → Set to current date
   - Find `verifiedBy` field → Set to `admin` or `system`
   - Click "Save" (green checkmark)

4. **Repeat for all farms**

5. **Verify:**
   - Refresh your browser at http://localhost:3001
   - Featured farms should now appear!

---

#### Option B: SQL Script

1. **Connect to your database:**

   ```bash
   psql postgresql://username:password@localhost:5432/database_name
   ```

2. **Run activation script:**

   ```sql
   -- See current status
   SELECT id, name, status, "verificationStatus" FROM "Farm";

   -- Activate all farms
   UPDATE "Farm"
   SET
       status = 'ACTIVE',
       "verificationStatus" = 'VERIFIED',
       "verifiedAt" = NOW(),
       "verifiedBy" = 'system-admin',
       "updatedAt" = NOW()
   WHERE status != 'ACTIVE' OR "verificationStatus" != 'VERIFIED';

   -- Confirm changes
   SELECT id, name, status, "verificationStatus", "verifiedAt" FROM "Farm";
   ```

---

#### Option C: Create a Quick Node Script

1. **Create file: `fix-farms.js`**

   ```javascript
   const { PrismaClient } = require("@prisma/client");
   const prisma = new PrismaClient();

   async function fixFarms() {
     try {
       console.log("🔧 Checking farms...\n");

       const total = await prisma.farm.count();
       console.log(`Found ${total} farms\n`);

       if (total === 0) {
         console.log("❌ No farms in database. Run: npm run prisma:seed");
         return;
       }

       console.log("✅ Activating farms...\n");

       const result = await prisma.farm.updateMany({
         data: {
           status: "ACTIVE",
           verificationStatus: "VERIFIED",
           verifiedAt: new Date(),
           verifiedBy: "system-admin",
         },
       });

       console.log(`✅ Successfully activated ${result.count} farms!\n`);

       const activeFarms = await prisma.farm.findMany({
         where: {
           status: "ACTIVE",
           verificationStatus: "VERIFIED",
         },
         select: {
           name: true,
           city: true,
           state: true,
           slug: true,
         },
       });

       console.log("🌟 Active Featured Farms:\n");
       activeFarms.forEach((farm, i) => {
         console.log(`${i + 1}. ${farm.name}`);
         console.log(`   Location: ${farm.city}, ${farm.state}`);
         console.log(`   URL: http://localhost:3001/farms/${farm.slug}\n`);
       });

       console.log(
         "✅ DONE! Visit http://localhost:3001 to see featured farms\n",
       );
     } catch (error) {
       console.error("❌ Error:", error);
     } finally {
       await prisma.$disconnect();
     }
   }

   fixFarms();
   ```

2. **Run the script:**
   ```bash
   node fix-farms.js
   ```

---

## 🧪 VERIFICATION

After activating farms, verify they appear:

### 1. Check API Response

```bash
# Test the featured farms API
curl http://localhost:3001/api/featured/farms?limit=6&strategy=top-rated
```

**Expected Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "name": "Farm Name",
      "slug": "farm-slug",
      "city": "City",
      "state": "State",
      ...
    }
  ],
  "meta": {
    "count": 3,
    "strategy": "top-rated"
  }
}
```

### 2. Check Homepage

1. Start dev server: `npm run dev`
2. Visit: http://localhost:3001
3. Scroll to "Featured Local Farms" section
4. You should see farm cards displayed!

---

## 🐛 TROUBLESHOOTING

### Issue: "No Featured Farms Yet" still appears

**Cause 1: No farms in database**

```bash
# Solution: Seed the database
npm run prisma:seed
```

**Cause 2: Farms not activated**

```bash
# Solution: Run one of the activation methods above
```

**Cause 3: Cache issue**

```bash
# Solution: Clear browser cache and refresh
# Or hard refresh: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)
```

**Cause 4: API error**

```bash
# Check console logs in browser (F12)
# Check server logs in terminal
# Check API directly: curl http://localhost:3001/api/featured/farms
```

---

### Issue: Farms have no products

Even if farms are activated, they might look empty without products.

**Solution: Add products to farms**

```bash
# The comprehensive seed includes products
npx tsx prisma/seed-comprehensive.js
```

Or use Prisma Studio to add products manually.

---

### Issue: Database connection error

```bash
# Check your .env.local file has correct DATABASE_URL
DATABASE_URL="postgresql://username:password@localhost:5432/farmers_market"

# Test connection
npm run db:studio
```

---

## 📊 UNDERSTANDING THE FEATURED FARMS LOGIC

### API Endpoint

- **File:** `src/app/api/featured/farms/route.ts`
- **URL:** `/api/featured/farms`

### Selection Criteria

The API uses different strategies to select featured farms:

1. **top-rated** (default)
   - Requires: `status: ACTIVE`, `verificationStatus: VERIFIED`
   - Filters: Average rating >= 4.0
   - Sorts: By rating, then review count

2. **recent**
   - Requires: `status: ACTIVE`, `verificationStatus: VERIFIED`
   - Must have: Active products in stock
   - Sorts: By creation date (newest first)

3. **random**
   - Requires: `status: ACTIVE`, `verificationStatus: VERIFIED`
   - Selection: Random sampling

### Farm Status Values

```typescript
enum FarmStatus {
  PENDING   // ❌ Not shown as featured
  ACTIVE    // ✅ Can be featured
  INACTIVE  // ❌ Not shown as featured
  SUSPENDED // ❌ Not shown as featured
}

enum FarmVerificationStatus {
  PENDING   // ❌ Not shown as featured
  VERIFIED  // ✅ Can be featured
  REJECTED  // ❌ Not shown as featured
}
```

---

## 🎯 ADDING REVIEWS (OPTIONAL)

To make farms appear higher in featured section, add reviews:

### Using Prisma Studio:

1. Open Prisma Studio: `npm run db:studio`
2. Navigate to "Review" model
3. Click "Add Record"
4. Fill in:
   - `farmId`: Select a farm
   - `userId`: Select a customer user
   - `rating`: 5
   - `title`: "Great Farm!"
   - `comment`: "Excellent quality and service"
   - `verified`: true
5. Save

### Using SQL:

```sql
-- First, get a customer user ID
SELECT id, email FROM "User" WHERE role = 'CUSTOMER' LIMIT 1;

-- Then create review (replace USER_ID and FARM_ID)
INSERT INTO "Review" ("farmId", "userId", rating, title, comment, verified, "createdAt", "updatedAt")
VALUES (
  'FARM_ID_HERE',
  'USER_ID_HERE',
  5,
  'Outstanding Quality!',
  'Amazing farm with fresh, organic produce!',
  true,
  NOW(),
  NOW()
);
```

---

## ✅ SUCCESS CHECKLIST

- [ ] Database has farms (run seed if needed)
- [ ] Farms have `status: "ACTIVE"`
- [ ] Farms have `verificationStatus: "VERIFIED"`
- [ ] API returns farms: `curl http://localhost:3001/api/featured/farms`
- [ ] Homepage displays featured farms
- [ ] Farm cards show farm details
- [ ] Clicking farm card navigates to farm page

---

## 🚀 COMPLETE SOLUTION SCRIPT

Save this as `activate-all-farms.sql` and run in your database:

```sql
-- ============================================================================
-- COMPLETE FARM ACTIVATION SCRIPT
-- ============================================================================

-- Step 1: Check current state
SELECT
    '📊 BEFORE' as status,
    COUNT(*) as total,
    COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) as active,
    COUNT(CASE WHEN "verificationStatus" = 'VERIFIED' THEN 1 END) as verified
FROM "Farm";

-- Step 2: Activate ALL farms
UPDATE "Farm"
SET
    status = 'ACTIVE',
    "verificationStatus" = 'VERIFIED',
    "verifiedAt" = NOW(),
    "verifiedBy" = 'system-admin',
    "updatedAt" = NOW();

-- Step 3: Verify changes
SELECT
    '✅ AFTER' as status,
    COUNT(*) as total,
    COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) as active,
    COUNT(CASE WHEN "verificationStatus" = 'VERIFIED' THEN 1 END) as verified
FROM "Farm";

-- Step 4: Show all active farms
SELECT
    name,
    slug,
    city,
    state,
    status,
    "verificationStatus",
    (SELECT COUNT(*) FROM "Product" WHERE "Product"."farmId" = "Farm".id) as products,
    (SELECT COUNT(*) FROM "Review" WHERE "Review"."farmId" = "Farm".id) as reviews
FROM "Farm"
WHERE status = 'ACTIVE' AND "verificationStatus" = 'VERIFIED'
ORDER BY name;

-- ============================================================================
-- DONE! Visit http://localhost:3001 to see featured farms!
-- ============================================================================
```

---

## 📞 SUPPORT

If you continue to have issues:

1. **Check logs:**
   - Browser console (F12 → Console tab)
   - Server terminal output
   - Network tab for API calls

2. **Verify database:**

   ```bash
   npm run db:studio
   # Check Farm table manually
   ```

3. **Re-seed database:**

   ```bash
   npx prisma db push --force-reset
   npm run prisma:seed
   ```

4. **Restart everything:**
   ```bash
   # Stop server (Ctrl+C)
   npm run clean:all
   npm install
   npx prisma generate
   npm run dev
   ```

---

**Last Updated:** December 2024  
**Status:** Tested and Working ✅  
**Platform:** Farmers Market Platform - Port 3001
