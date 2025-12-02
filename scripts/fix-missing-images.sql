-- Fix Missing Images - Update to use placeholder SVGs
-- This script updates all farms and products to use the existing placeholder images
-- Run this with: psql $DATABASE_URL -f scripts/fix-missing-images.sql
-- Or execute in Prisma Studio SQL editor

-- Update Farm Images to use placeholder
UPDATE "Farm"
SET
  "logoUrl" = '/images/placeholder-farm.svg',
  "bannerUrl" = '/images/placeholder-farm.svg'
WHERE "logoUrl" LIKE '/images/farms/%'
   OR "bannerUrl" LIKE '/images/farms/%'
   OR "logoUrl" IS NULL
   OR "bannerUrl" IS NULL;

-- Update Product Images to use placeholder
UPDATE "Product"
SET
  "primaryPhotoUrl" = '/images/placeholder-product.svg',
  "photoUrls" = ARRAY['/images/placeholder-product.svg']
WHERE "primaryPhotoUrl" LIKE '/images/products/%'
   OR "primaryPhotoUrl" IS NULL;

-- Show results
SELECT
  'Farms Updated' as entity,
  COUNT(*) as count
FROM "Farm"
WHERE "logoUrl" = '/images/placeholder-farm.svg';

SELECT
  'Products Updated' as entity,
  COUNT(*) as count
FROM "Product"
WHERE "primaryPhotoUrl" = '/images/placeholder-product.svg';

-- Verify featured farms will work
SELECT
  id,
  name,
  slug,
  status,
  "verificationStatus",
  "logoUrl",
  "bannerUrl"
FROM "Farm"
WHERE status = 'ACTIVE'
  AND "verificationStatus" = 'VERIFIED'
ORDER BY "createdAt" DESC
LIMIT 10;
