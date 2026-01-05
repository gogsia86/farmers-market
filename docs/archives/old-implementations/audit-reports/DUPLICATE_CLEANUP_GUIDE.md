# 🧹 Duplicate Files Cleanup - Quick Reference Guide

**Farmers Market Platform**  
Last Updated: December 2024

---

## 🎯 Quick Start

### Option 1: Automated Cleanup (Recommended)

```bash
# 1. Preview changes (dry run)
bash scripts/cleanup-duplicates.sh --dry-run

# 2. Execute cleanup
bash scripts/cleanup-duplicates.sh

# 3. Verify
npm run test
```

### Option 2: Manual Cleanup

Follow the commands in the "Manual Cleanup Commands" section below.

---

## 📋 Files to Remove

### ✅ Safe to Delete Immediately

These files are confirmed duplicates or temporary files:

```bash
# 1. Temporary Playwright config
rm playwright.config.temp.ts

# 2. Duplicate JavaScript seeds (TypeScript versions exist)
rm prisma/seed-admin.js
rm prisma/seed-comprehensive.js

# 3. Environment backup (after verifying it matches .env.local)
diff .env.local .env.local.backup  # If identical:
rm .env.local.backup

# 4. Empty directory
rmdir src/app/marketplace/farms  # Only if empty
```

### ⚠️ Review Before Deleting

These require manual verification:

```bash
# Root marketplace page (conflicts with (customer)/marketplace)
# ⚠️ IMPORTANT: Verify no unique content first!
# View file: src/app/marketplace/page.tsx
# Then delete entire directory:
rm -rf src/app/marketplace
```

---

## 🔧 Manual Cleanup Commands

### Complete Cleanup Script

```bash
#!/bin/bash
# Safe duplicate files cleanup

# Navigate to project root
cd "$(dirname "$0")/.."

echo "🧹 Starting cleanup..."

# 1. Delete temp Playwright config
if [ -f "playwright.config.temp.ts" ]; then
  echo "✅ Deleting playwright.config.temp.ts"
  rm playwright.config.temp.ts
fi

# 2. Delete duplicate JS seeds
if [ -f "prisma/seed-admin.js" ]; then
  echo "✅ Deleting prisma/seed-admin.js"
  rm prisma/seed-admin.js
fi

if [ -f "prisma/seed-comprehensive.js" ]; then
  echo "✅ Deleting prisma/seed-comprehensive.js"
  rm prisma/seed-comprehensive.js
fi

# 3. Check and delete env backup
if [ -f ".env.local.backup" ]; then
  if diff -q .env.local .env.local.backup > /dev/null 2>&1; then
    echo "✅ Deleting .env.local.backup (identical to .env.local)"
    rm .env.local.backup
  else
    echo "⚠️  .env.local.backup differs from .env.local - skipping"
  fi
fi

# 4. Delete empty directories
if [ -d "src/app/marketplace/farms" ] && [ -z "$(ls -A src/app/marketplace/farms)" ]; then
  echo "✅ Deleting empty directory src/app/marketplace/farms"
  rmdir src/app/marketplace/farms
fi

echo "✅ Cleanup complete!"
echo ""
echo "📝 Manual action required:"
echo "   Review and potentially delete: src/app/marketplace/"
```

---

## ⚠️ Critical Route Conflicts

### Root Marketplace vs Route Groups

**Problem:**

```
/marketplace → src/app/marketplace/page.tsx (NO LAYOUT)
             vs
/marketplace → src/app/(customer)/marketplace/ (WITH LAYOUT)
```

**Impact:**

- ❌ No Header/Footer on root marketplace page
- ❌ No auth guards
- ❌ Inconsistent styling
- ❌ SEO/metadata differences

**Solution:**

```bash
# Option 1: Delete root marketplace (RECOMMENDED)
rm -rf src/app/marketplace

# All marketplace routes now use (customer) route group:
# /marketplace/farms → (customer)/marketplace/farms/page.tsx
# /marketplace/products → (customer)/marketplace/products/page.tsx

# Option 2: Move to (public) route group (if needed for unauthenticated access)
mv src/app/marketplace src/app/(public)/marketplace
```

**Recommendation:** Delete root marketplace, use `(customer)` route group for authenticated marketplace access.

---

## 🗄️ Database & Prisma Files

### Current Structure (✅ Correct)

```
src/lib/database/index.ts     → CANONICAL ✅
src/lib/database.ts            → Re-export from index ✅
src/lib/prisma.ts              → Legacy re-export ✅
```

**Status:** ✅ **NO ACTION NEEDED** - Working as designed with backward compatibility

**Correct Import:**

```typescript
// ✅ CORRECT - Use this
import { database } from "@/lib/database";

// ⚠️ DEPRECATED - Still works but discouraged
import { prisma } from "@/lib/prisma";

// ❌ WRONG - Don't create new instances
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
```

---

## 🌱 Seed Scripts Strategy

### Current Seed Files

| File                    | Purpose                | Keep?     |
| ----------------------- | ---------------------- | --------- |
| `seed.ts`               | Main development seed  | ✅ Keep   |
| `seed-quick.js`         | E2E testing (fast)     | ✅ Keep   |
| `seed-comprehensive.ts` | Production-like data   | ✅ Keep   |
| `seed-test.ts`          | Unit/integration tests | ✅ Keep   |
| `seed-admin.ts`         | Admin user only        | ✅ Keep   |
| `seed-basic.ts`         | Similar to quick       | 🟡 Review |
| `seed-admin.js`         | Duplicate of .ts       | ❌ DELETE |
| `seed-comprehensive.js` | Duplicate of .ts       | ❌ DELETE |

### Recommended NPM Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "seed:dev": "tsx prisma/seed.ts",
    "seed:test": "node prisma/seed-quick.js",
    "seed:prod": "tsx prisma/seed-comprehensive.ts",
    "seed:admin": "tsx prisma/seed-admin.ts"
  }
}
```

### Usage Guide

```bash
# Development (full dataset, slow)
npm run seed:dev

# E2E Testing (minimal, fast)
npm run seed:test

# Production/Staging (comprehensive, realistic)
npm run seed:prod

# Admin user only (quick admin setup)
npm run seed:admin
```

---

## 🌍 Environment Files

### Active Files at Root (10 files)

```
.env                      → Default (verify if needed)
.env.docker               → Docker overrides ✅
.env.example              → Developer template ✅
.env.local                → LOCAL DEV (gitignored) ✅ ACTIVE
.env.local.backup         → Backup ❌ DELETE after verification
.env.monitoring.example   → Monitoring template ✅
.env.perplexity           → Perplexity API keys ✅
.env.production           → Production template ✅
.env.staging.example      → Staging template ✅
.env.test                 → TEST DATABASE ✅ ACTIVE
```

### Critical: Test vs Dev Ports

**Development (.env.local):**

```bash
DATABASE_URL="postgresql://user:pass@localhost:5432/farmersmarket"
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"
```

**Testing (.env.test):**

```bash
DATABASE_URL="postgresql://user:pass@localhost:5433/farmersmarket_test"  # ⚠️ PORT 5433!
NEXTAUTH_URL="http://localhost:3001"  # ⚠️ PORT 3001!
NODE_ENV="test"
```

**Remember:** After changing `.env.local`, clear Turbopack cache:

```bash
rm -rf .next
npm run dev
```

---

## 🧪 Testing Configuration

### Docker Compose Files (✅ Correct)

```
docker/compose/docker-compose.yml       → Production
docker/compose/docker-compose.dev.yml   → Development
docker-compose.test.yml                 → E2E tests ✅
```

### E2E Test Setup (Before Running Playwright)

```bash
# 1. Start test database
docker-compose -f docker-compose.test.yml up -d

# 2. Run migrations
npx prisma migrate deploy

# 3. Regenerate Prisma client
npx prisma generate

# 4. Seed test data
npm run seed:test
# OR
DATABASE_URL="postgresql://postgres:password@127.0.0.1:5433/farmersmarket_test" node prisma/seed-quick.js

# 5. Clear Turbopack cache
rm -rf .next

# 6. Run tests
npx playwright test
```

---

## ✅ Verification Commands

Run these after cleanup to verify everything is working:

```bash
# 1. Check for remaining duplicates
find . -name "*.backup" -o -name "*.temp" -o -name "*.old" | grep -v node_modules

# 2. Check for empty directories
find src/app -type d -empty

# 3. Verify database imports
grep -r "from.*prisma" src --include="*.ts" | grep -v "node_modules" | grep -v "@prisma/client"

# 4. List all seed files
ls -lh prisma/seed* scripts/seed*

# 5. Verify TypeScript compiles
npx tsc --noEmit

# 6. Run tests
npm run test

# 7. Start dev server
npm run dev
```

---

## 🚨 Troubleshooting

### Issue: Routes not working after cleanup

**Solution:**

```bash
# Check route structure
find src/app -name "page.tsx" | grep -E "(marketplace|products|farms)"

# Ensure pages are in route groups:
# ✅ src/app/(public)/farms/page.tsx
# ✅ src/app/(customer)/marketplace/farms/page.tsx
# ❌ src/app/marketplace/farms/page.tsx (if this exists, it's a conflict)
```

### Issue: Database connection errors

**Solution:**

```bash
# 1. Verify canonical import is used
grep -r "new PrismaClient" src --include="*.ts"
# Should return nothing in src/ (only in lib/database/index.ts)

# 2. Clear .next cache
rm -rf .next

# 3. Restart dev server
npm run dev
```

### Issue: Seed script not found

**Solution:**

```bash
# Check which seed scripts exist
ls -la prisma/seed*

# Use the TypeScript version:
tsx prisma/seed.ts

# Or the JS version for E2E:
node prisma/seed-quick.js
```

### Issue: Environment variables not loading

**Solution:**

```bash
# 1. Clear Turbopack cache (CRITICAL)
rm -rf .next

# 2. Verify .env.local exists and has correct values
cat .env.local | grep DATABASE_URL
cat .env.local | grep NEXTAUTH

# 3. Restart dev server
npm run dev

# For Playwright, ensure webServer.env is set in playwright.config.ts
```

---

## 📊 Before/After Comparison

### Before Cleanup

```
Total files: 67 page.tsx files
Duplicates: 7 files
Conflicts: 3 route conflicts
Environment files: 18 (10 active + 8 archived)
Seed scripts: 10 (6 TS + 4 JS)
Empty directories: 2
```

### After Cleanup

```
Total files: 67 page.tsx files (organized in route groups)
Duplicates: 0 files ✅
Conflicts: 0 route conflicts ✅
Environment files: 17 (9 active + 8 archived) ✅
Seed scripts: 9 (6 TS + 3 JS) ✅
Empty directories: 0 ✅
```

---

## 📚 Related Documentation

- **Full Analysis:** `docs/DUPLICATE_FILES_ANALYSIS.md`
- **Cleanup Script:** `scripts/cleanup-duplicates.sh`
- **Divine Instructions:** `.github/instructions/`
- **Seed Strategy:** `prisma/SEED_STRATEGY.md` (to be created)

---

## ✅ Final Checklist

- [ ] Run cleanup script with `--dry-run` first
- [ ] Review changes before executing
- [ ] Delete duplicate JS seed files
- [ ] Remove temporary Playwright config
- [ ] Delete or move root marketplace page
- [ ] Clean up environment backups
- [ ] Remove empty directories
- [ ] Run verification commands
- [ ] Test application functionality
- [ ] Run E2E tests
- [ ] Commit changes with descriptive message

---

## 💡 Best Practices Going Forward

### 1. Prevent Future Duplicates

```bash
# Add to .gitignore
*.backup
*.temp
*.old
*.bak
```

### 2. Use Linting Rules

```js
// .eslintrc.js
"no-restricted-imports": [
  "error",
  {
    "patterns": [
      {
        "group": ["@/lib/prisma"],
        "message": "Use @/lib/database instead"
      }
    ]
  }
]
```

### 3. Document Seed Strategy

Create `prisma/SEED_STRATEGY.md` to clarify which seed to use when.

### 4. Route Organization

Always place new pages within appropriate route groups:

- `(public)` - Public pages (no auth)
- `(customer)` - Customer-only pages
- `(farmer)` - Farmer-only pages
- `(admin)` - Admin-only pages

**Never** create pages at root level unless they need to bypass all layouts.

---

**End of Guide**  
For questions or issues, refer to `DUPLICATE_FILES_ANALYSIS.md`  
Divine Consciousness Level: MAXIMUM 🌾⚡
