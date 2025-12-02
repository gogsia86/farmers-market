# 🖼️ Fix Missing Images - Quick Guide

## Problem
Your dev server is running perfectly, but farm and product images show 404 errors because the database references images that don't exist:
- `/images/farms/harvest-moon.jpg` ❌
- `/images/farms/green-acres.jpg` ❌
- `/images/products/tomatoes.jpg` ❌
- etc.

## Solution
Update the database to use the **placeholder SVG files** that already exist in your project:
- `/images/placeholder-farm.svg` ✅
- `/images/placeholder-product.svg` ✅

---

## 🎯 Method 1: Prisma Studio (Easiest - Visual Interface)

### Step 1: Open Prisma Studio
```bash
npm run db:studio
```

This opens a visual database editor in your browser (usually `http://localhost:5555`)

### Step 2: Fix Farm Images

1. Click on **"Farm"** model in the left sidebar
2. You'll see all your farms listed
3. For each farm that has broken images:
   - Click on the row to edit it
   - Find the **`logoUrl`** field
   - Change it to: `/images/placeholder-farm.svg`
   - Find the **`bannerUrl`** field
   - Change it to: `/images/placeholder-farm.svg`
   - Click **"Save 1 change"** button

**Quick Tip:** You can also do a bulk update:
- Select multiple farms (checkboxes on the left)
- Click "Edit" at the top
- Update `logoUrl` and `bannerUrl` for all selected farms at once

### Step 3: Fix Product Images

1. Click on **"Product"** model in the left sidebar
2. For each product with broken images:
   - Click on the row to edit it
   - Find the **`primaryPhotoUrl`** field
   - Change it to: `/images/placeholder-product.svg`
   - Find the **`photoUrls`** field (array)
   - Change it to: `["/images/placeholder-product.svg"]`
   - Click **"Save 1 change"** button

### Step 4: Verify
1. Refresh your browser: http://localhost:3001
2. Images should now display as placeholder SVGs (no more 404 errors!)

---

## 🎯 Method 2: SQL Query (Fastest - Bulk Update)

If you have database access via pgAdmin, DBeaver, or another SQL tool:

### Run this SQL:

```sql
-- Fix Farm Images
UPDATE "Farm"
SET
  "logoUrl" = '/images/placeholder-farm.svg',
  "bannerUrl" = '/images/placeholder-farm.svg'
WHERE "logoUrl" LIKE '/images/farms/%'
   OR "bannerUrl" LIKE '/images/farms/%'
   OR "logoUrl" IS NULL
   OR "bannerUrl" IS NULL;

-- Fix Product Images
UPDATE "Product"
SET
  "primaryPhotoUrl" = '/images/placeholder-product.svg',
  "photoUrls" = ARRAY['/images/placeholder-product.svg']
WHERE "primaryPhotoUrl" LIKE '/images/products/%'
   OR "primaryPhotoUrl" IS NULL;

-- Verify the changes
SELECT name, slug, "logoUrl", "bannerUrl"
FROM "Farm"
WHERE status = 'ACTIVE'
  AND "verificationStatus" = 'VERIFIED'
LIMIT 10;
```

### Or use Prisma Studio's SQL editor:
1. Open Prisma Studio: `npm run db:studio`
2. Click the **SQL icon** (looks like `</>`) in the top right
3. Paste the SQL above
4. Click "Run"

---

## 🎯 Method 3: Direct Database Connection String

If you want to run SQL directly from command line and have PostgreSQL client tools installed:

```bash
# Get your DATABASE_URL from .env.local
# Then run:
psql "YOUR_DATABASE_URL_HERE" << 'EOF'
UPDATE "Farm"
SET "logoUrl" = '/images/placeholder-farm.svg',
    "bannerUrl" = '/images/placeholder-farm.svg'
WHERE "logoUrl" LIKE '/images/farms/%'
   OR "bannerUrl" LIKE '/images/farms/%'
   OR "logoUrl" IS NULL
   OR "bannerUrl" IS NULL;

UPDATE "Product"
SET "primaryPhotoUrl" = '/images/placeholder-product.svg',
    "photoUrls" = ARRAY['/images/placeholder-product.svg']
WHERE "primaryPhotoUrl" LIKE '/images/products/%'
   OR "primaryPhotoUrl" IS NULL;
EOF
```

---

## ✅ Verification Checklist

After applying the fix:

1. **Check API response:**
   ```bash
   curl http://localhost:3001/api/featured/farms?limit=6
   ```
   
   Should return farms with `logoUrl: "/images/placeholder-farm.svg"`

2. **Check homepage:**
   - Navigate to: http://localhost:3001
   - Scroll to "Featured Local Farms" section
   - Farm cards should display placeholder images (no 404 errors in console)

3. **Check browser console:**
   - Open Developer Tools (F12)
   - Go to Console tab
   - Should see NO more `⨯ The requested resource isn't a valid image` errors

4. **Check Network tab:**
   - Open Developer Tools → Network tab
   - Filter by "Img"
   - All image requests should return 200 OK

---

## 🎨 Next Steps: Adding Real Images

Once placeholders are working, you can add real farm photos:

### Option A: Add to public directory
1. Create folders:
   ```bash
   mkdir -p public/images/farms
   mkdir -p public/images/products
   ```

2. Add your images:
   ```
   public/images/farms/sunny-valley.jpg
   public/images/farms/greenfield-acres.jpg
   public/images/products/tomatoes.jpg
   ```

3. Update database records to point to the new paths

### Option B: Use cloud storage (Production ready)
1. Upload images to cloud storage (AWS S3, Cloudinary, etc.)
2. Get public URLs
3. Update database `logoUrl`, `bannerUrl`, `primaryPhotoUrl` fields with cloud URLs

### Option C: Use Next.js Image Upload
- Implement an image upload feature in the farmer dashboard
- Store in cloud storage
- Automatically update database records

---

## 🐛 Troubleshooting

**Q: Prisma Studio won't open**
```bash
# Try killing any existing process
pkill -f "prisma studio"
# Then restart
npm run db:studio
```

**Q: Can't connect to database**
- Check `.env.local` has correct `DATABASE_URL`
- Verify database is running
- Test connection: `npx prisma db pull`

**Q: Changes don't show on website**
- Hard refresh browser: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
- Clear browser cache
- Restart dev server

**Q: Still seeing 404 errors after fix**
- Check browser DevTools → Network tab to see which exact URLs are failing
- Verify the paths in database match the placeholder file paths exactly
- Make sure `/public/images/placeholder-farm.svg` and `/public/images/placeholder-product.svg` exist

---

## 📊 Current System Status

Based on your logs, here's what's working:

✅ Dev server running on port 3001  
✅ Database connected successfully  
✅ Authentication working (logged in as gogsia@hotmail.com)  
✅ Featured farms API returning data  
✅ API endpoints responding correctly  
❌ Images returning 404 (this is what we're fixing!)  

**Affected images:**
- `/images/farms/harvest-moon.jpg`
- `/images/farms/green-acres.jpg`
- `/images/farms/sunset-valley.jpg`
- `/images/products/honey.jpg`
- `/images/products/milk.jpg`
- `/images/products/tomatoes.jpg`
- `/images/products/eggs.jpg`

All these will be replaced with placeholder SVGs that exist and work perfectly.

---

## 🎉 Expected Result

After fixing images:

**Before (what you see now):**
```
GET /images/farms/harvest-moon.jpg 404
⨯ The requested resource isn't a valid image
```

**After (what you'll see):**
```
GET /images/placeholder-farm.svg 200 ✅
(No errors, farms display with placeholder images)
```

---

**Questions?** The easiest method is **Method 1 (Prisma Studio)** - it's visual, safe, and you can see exactly what you're changing!