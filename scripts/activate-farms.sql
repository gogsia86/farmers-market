-- ============================================================================
-- 🌟 ACTIVATE FEATURED FARMS - SQL SCRIPT
-- ============================================================================
-- This script activates all farms to be featured on the homepage
--
-- Usage:
-- psql -U username -d database_name -f scripts/activate-farms.sql
-- or from Prisma Studio SQL editor
-- ============================================================================

-- Step 1: Check current farm status
SELECT
    '📊 Current Farm Status' as info,
    COUNT(*) as total_farms,
    COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) as active_farms,
    COUNT(CASE WHEN "verificationStatus" = 'VERIFIED' THEN 1 END) as verified_farms,
    COUNT(CASE WHEN status = 'PENDING' OR "verificationStatus" = 'PENDING' THEN 1 END) as pending_farms
FROM "Farm";

-- Step 2: Show farms that need activation
SELECT
    '🔧 Farms to Activate' as info,
    name,
    status,
    "verificationStatus",
    city,
    state
FROM "Farm"
WHERE status != 'ACTIVE' OR "verificationStatus" != 'VERIFIED';

-- Step 3: Activate all farms
UPDATE "Farm"
SET
    status = 'ACTIVE',
    "verificationStatus" = 'VERIFIED',
    "verifiedAt" = NOW(),
    "verifiedBy" = 'system-admin',
    "updatedAt" = NOW()
WHERE status != 'ACTIVE' OR "verificationStatus" != 'VERIFIED';

-- Step 4: Verify the update
SELECT
    '✅ Updated Farm Status' as info,
    COUNT(*) as total_farms,
    COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) as active_farms,
    COUNT(CASE WHEN "verificationStatus" = 'VERIFIED' THEN 1 END) as verified_farms
FROM "Farm";

-- Step 5: Show all farms with their details
SELECT
    '📋 All Farms Summary' as info,
    name,
    slug,
    status,
    "verificationStatus",
    city,
    state,
    (SELECT COUNT(*) FROM "Product" WHERE "Product"."farmId" = "Farm".id) as product_count,
    (SELECT COUNT(*) FROM "Review" WHERE "Review"."farmId" = "Farm".id) as review_count
FROM "Farm"
ORDER BY name;

-- Step 6: Create sample reviews for farms without reviews (optional)
-- Note: This requires a customer user to exist
-- If no customer exists, you'll need to create one first

-- First, get or show customer users
SELECT
    '👥 Available Customer Users' as info,
    id,
    email,
    "firstName",
    "lastName",
    role
FROM "User"
WHERE role = 'CUSTOMER'
LIMIT 5;

-- Uncomment the following section to add sample reviews
-- Replace 'USER_ID_HERE' with an actual customer user ID from above

/*
-- Add sample reviews for farms without reviews
INSERT INTO "Review" ("farmId", "userId", rating, title, comment, verified, helpful, "notHelpful", "createdAt", "updatedAt")
SELECT
    f.id,
    'USER_ID_HERE', -- Replace with actual customer user ID
    5, -- Rating
    'Outstanding Quality!',
    'Amazing farm! Fresh, organic produce and excellent customer service. Highly recommend!',
    true,
    8,
    0,
    NOW(),
    NOW()
FROM "Farm" f
LEFT JOIN "Review" r ON r."farmId" = f.id
WHERE r.id IS NULL
LIMIT 3;
*/

-- Step 7: Show final summary for featured farms API
SELECT
    '🌟 Featured Farms (Ready for Homepage)' as info,
    f.name,
    f.slug,
    f.city,
    f.state,
    f.status,
    f."verificationStatus",
    COUNT(p.id) as products,
    COUNT(r.id) as reviews,
    ROUND(AVG(r.rating)::numeric, 1) as avg_rating
FROM "Farm" f
LEFT JOIN "Product" p ON p."farmId" = f.id
LEFT JOIN "Review" r ON r."farmId" = f.id
WHERE f.status = 'ACTIVE' AND f."verificationStatus" = 'VERIFIED'
GROUP BY f.id, f.name, f.slug, f.city, f.state, f.status, f."verificationStatus"
ORDER BY avg_rating DESC NULLS LAST, reviews DESC
LIMIT 10;

-- ============================================================================
-- 🎉 Script Complete!
-- ============================================================================
-- All farms should now be ACTIVE and VERIFIED
-- Visit http://localhost:3001 to see featured farms on the homepage
-- ============================================================================
