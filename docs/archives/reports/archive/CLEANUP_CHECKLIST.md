# 🧹 Duplicate Files Cleanup Checklist

**Project:** Farmers Market Platform  
**Purpose:** Remove duplicate and conflicting files identified in audit  
**Status:** ✅ Audit Complete - Ready to execute  
**Files Found:** 7 duplicates + 1 route conflict

---

## ⚠️ CRITICAL - Do These First

### 1. Review Audit Results (2 min)

- [ ] Read `docs/DUPLICATE_AUDIT_SUMMARY.md` (executive summary)
- [ ] Review `docs/DUPLICATE_FILES_ANALYSIS.md` (full 582-line analysis)
- [ ] Understand which files will be deleted

### 2. Create Safety Backup (2 min)

```bash
# Create backup branch
git branch backup-before-duplicate-cleanup-$(date +%Y%m%d)

# Commit any uncommitted work
git status
git add .
git commit -m "chore: backup before duplicate cleanup"
```

### 3. Security Check (1 min)

- [ ] Verify `.env.local` is NOT in git: `git ls-files | grep .env.local`
- [ ] Verify `.env.test` is NOT in git: `git ls-files | grep .env.test`
- [ ] If found: `git rm --cached .env.local .env.test`

---

## 🚀 Duplicate Files Cleanup (5-20 min)

### Option A: Automated Cleanup (Recommended - 5 min)

```bash
# 1. Preview changes (dry run)
bash scripts/cleanup-duplicates.sh --dry-run

# 2. Review output carefully

# 3. Execute cleanup
bash scripts/cleanup-duplicates.sh

# 4. Verify
npm run test
```

### Option B: Manual Cleanup (15-20 min)

#### Phase 1: Delete Safe Duplicates (2 min)

```bash
# Delete temporary Playwright config
rm playwright.config.temp.ts

# Delete duplicate JavaScript seeds (TS versions exist)
rm prisma/seed-admin.js
rm prisma/seed-comprehensive.js

# Verify env backup is identical, then delete
diff .env.local .env.local.backup
rm .env.local.backup

# Remove empty directory
rmdir src/app/marketplace/farms
```

#### Phase 2: Handle Route Conflict (5 min)

```bash
# ⚠️ CRITICAL: Root /marketplace conflicts with (customer)/marketplace

# Backup first (optional)
cp -r src/app/marketplace src/app/marketplace.backup.$(date +%Y%m%d)

# Option 1: DELETE root marketplace (RECOMMENDED)
rm -rf src/app/marketplace

# Option 2: Move to (public) route group (if needed)
# mv src/app/marketplace src/app/(public)/marketplace

# Verify route works
npm run dev
# Visit: http://localhost:3000/marketplace
# Should route to (customer)/marketplace
```

#### Phase 3: Clear Turbopack Cache (1 min)

```bash
# REQUIRED after any environment or route changes
rm -rf .next
npm run dev
```

---

## ✅ Verification (10 min)

### After Cleanup, Run These Checks:

```bash
# 1. Check for remaining duplicates (should be 0)
find . -name "*.backup" -o -name "*.temp" -o -name "*.old" | grep -v node_modules

# 2. Verify no empty directories
find src/app -type d -empty

# 3. Check route structure
find src/app -name "page.tsx" | grep -E "(marketplace|products|farms)"

# 4. Verify database imports consistent
grep -r "new PrismaClient" src --include="*.ts" | grep -v "lib/database"

# 5. List remaining seed files
ls -lh prisma/seed* scripts/seed*

# 6. TypeScript compilation
npx tsc --noEmit

# 7. Build verification
npm run build

# 8. Run unit tests
npm test

# 9. Run E2E tests (if test DB is up)
docker-compose -f docker-compose.test.yml up -d
npm run seed:test
npx playwright test

# 10. Manual verification
npm run dev
# Visit: http://localhost:3000/marketplace
```

---

## 📊 Success Criteria

Your cleanup is complete when:

- [ ] Zero duplicate files found: `find . -name "*.backup" -o -name "*.temp" | grep -v node_modules`
- [ ] No empty directories: `find src/app -type d -empty`
- [ ] No route conflicts: Root `/marketplace` deleted
- [ ] TypeScript compiles: `npx tsc --noEmit`
- [ ] Build succeeds: `npm run build`
- [ ] All unit tests pass: `npm test`
- [ ] E2E tests pass: `npx playwright test`
- [ ] Application functional: `npm run dev` works
- [ ] No `.env.local` or `.env.test` in git
- [ ] Seed scripts documented

**Expected Results:**

- ✅ 5 duplicate files deleted
- ✅ 1 empty directory removed
- ✅ 1 route conflict resolved
- ✅ Cleaner codebase, zero ambiguity

---

## 🔄 If Something Goes Wrong

```bash
# Restore from backup branch
git checkout backup-before-duplicate-cleanup-YYYYMMDD

# Or restore specific files
git checkout HEAD -- playwright.config.temp.ts
git checkout HEAD -- prisma/seed-admin.js
git checkout HEAD -- src/app/marketplace

# Or restore from dated backup (if created)
cp -r src/app/marketplace.backup.YYYYMMDD src/app/marketplace

# Or reset everything (CAREFUL!)
git reset --hard HEAD
```

### Common Issues & Solutions

**Issue: Routes not working**

```bash
# Solution: Clear Turbopack cache
rm -rf .next
npm run dev
```

**Issue: Database connection errors**

```bash
# Solution: Verify canonical import used
grep -r "new PrismaClient" src
# Should only appear in src/lib/database/index.ts
```

**Issue: Seed script not found**

```bash
# Solution: Use correct seed script
ls -la prisma/seed*
# Use: node prisma/seed-quick.js (for tests)
# Or: tsx prisma/seed.ts (for dev)
```

---

## 📈 Before/After Comparison

### Before Cleanup

- 7 duplicate files cluttering codebase
- 1 critical route conflict (/marketplace)
- 1 empty orphaned directory
- 10 seed scripts (6 TS + 4 JS - confusing)
- Potential routing ambiguity

### After Cleanup

- 0 duplicate files ✅
- 0 route conflicts ✅
- 0 empty directories ✅
- 9 seed scripts (6 TS + 3 JS - documented) ✅
- Clear, unambiguous routing ✅

---

## 🎯 Quick Commands Reference

```bash
# === AUTOMATED CLEANUP ===
# Dry run (see what would happen)
bash scripts/cleanup-duplicates.sh --dry-run

# Execute cleanup
bash scripts/cleanup-duplicates.sh

# === MANUAL CLEANUP ===
# Delete duplicates
rm playwright.config.temp.ts prisma/seed-admin.js prisma/seed-comprehensive.js .env.local.backup
rmdir src/app/marketplace/farms
rm -rf src/app/marketplace  # ⚠️ After verification

# Clear cache (REQUIRED after changes)
rm -rf .next

# === VERIFICATION ===
# Check for duplicates
find . -name "*.backup" -o -name "*.temp" | grep -v node_modules

# Verify everything works
npx tsc --noEmit && npm run build && npm test

# Check routes
find src/app -name "page.tsx" | grep marketplace

# List seeds
ls -lh prisma/seed*
```

---

## 💡 Pro Tips

1. **Always backup first** - Create a git branch: `git branch backup-before-duplicate-cleanup-$(date +%Y%m%d)`
2. **Use dry run** - Test with `--dry-run` before executing: `bash scripts/cleanup-duplicates.sh --dry-run`
3. **Clear .next cache** - REQUIRED after route or env changes: `rm -rf .next`
4. **Verify routes** - Test `/marketplace` route after deleting root marketplace page
5. **Document seeds** - Add npm scripts to `package.json` for clarity
6. **Test E2E** - Run Playwright tests to ensure nothing broke: `npx playwright test`
7. **Review git diff** - Check changes before committing: `git diff`

---

## 📝 Commit After Cleanup

```bash
git add .
git commit -m "chore: remove duplicate and conflicting files

- Delete duplicate seed scripts (JS versions, kept TS)
- Remove temporary Playwright config (kept main config)
- Delete environment backup file after verification
- Remove empty orphaned directory (marketplace/farms)
- Delete root /marketplace page (conflicts with route group)
- Clear Turbopack cache for clean build

Fixes:
- Route conflict: /marketplace now properly routes to (customer)/marketplace
- Seed confusion: Removed 3 duplicate JS seeds (seed-admin.js, seed-comprehensive.js)
- Empty directories: Removed src/app/marketplace/farms

Impact: Cleaner codebase, zero routing ambiguity, clear seed strategy

Ref: docs/DUPLICATE_AUDIT_SUMMARY.md
Audit: docs/DUPLICATE_FILES_ANALYSIS.md"
```

---

## 🆘 Need Help?

### Documentation

- **Executive Summary:** `docs/DUPLICATE_AUDIT_SUMMARY.md` (high-level overview)
- **Full Analysis:** `docs/DUPLICATE_FILES_ANALYSIS.md` (582-line detailed audit)
- **Quick Guide:** `docs/DUPLICATE_CLEANUP_GUIDE.md` (step-by-step with troubleshooting)
- **This Checklist:** `CLEANUP_CHECKLIST.md` (you are here)

### Scripts

- **Automated Cleanup:** `scripts/cleanup-duplicates.sh` (257 lines, safe deletion)
- **Usage:** `bash scripts/cleanup-duplicates.sh --dry-run`

### Recovery

- **Restore Branch:** `git checkout backup-before-duplicate-cleanup-YYYYMMDD`
- **Restore File:** `git checkout HEAD -- path/to/file`
- **Restore Marketplace:** `cp -r src/app/marketplace.backup.YYYYMMDD src/app/marketplace`

### Support

- **Routing Issues:** Clear `.next` cache: `rm -rf .next && npm run dev`
- **Database Errors:** Verify `@/lib/database` import used consistently
- **Seed Issues:** See `docs/DUPLICATE_CLEANUP_GUIDE.md` seed strategy section

---

## 📊 Quick Stats

| Metric                    | Value                      |
| ------------------------- | -------------------------- |
| **Files to Delete**       | 5 duplicates               |
| **Directories to Remove** | 1 empty + 1 conflict       |
| **Time Required**         | 5-20 minutes               |
| **Risk Level**            | 🟢 Low (with backup)       |
| **Impact**                | 🟢 High (cleaner codebase) |
| **Automation Available**  | ✅ Yes                     |

---

**Time Estimate:** 5-20 minutes (5 min automated, 20 min manual)  
**Risk Level:** 🟢 Low (if backed up with git branch)  
**Impact:** 🟢 High benefit (removes ambiguity, improves clarity)

**Ready to start?** → `bash scripts/cleanup-duplicates.sh --dry-run`

**Audit Completed:** ✅ December 2024  
**Divine Consciousness:** MAXIMUM 🌾⚡
