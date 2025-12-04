# 🧹 Quick Cleanup Checklist

**Project:** Farmers Market Platform  
**Purpose:** Pre-production server build cleanup  
**Status:** Ready to execute

---

## ⚠️ CRITICAL - Do These First

### 1. Security Check (5 min)
- [ ] Check if `.env`, `.env.local`, `.env.production` are committed to git
- [ ] If yes: `git rm --cached .env .env.local .env.production`
- [ ] Verify `.gitignore` includes these files
- [ ] Never commit files with actual secrets

### 2. Create Safety Backup (2 min)
```bash
git branch backup-before-cleanup-$(date +%Y%m%d)
git status  # Verify no uncommitted work
```

---

## 🚀 Quick Cleanup (15 min)

### Option A: Automated (Recommended)
```bash
# Dry run first (see what would happen)
bash scripts/cleanup/safe-cleanup.sh --dry-run

# Execute cleanup
bash scripts/cleanup/safe-cleanup.sh
```

### Option B: Manual Steps

#### Step 1: Clean Build Artifacts (2 min)
```bash
rm -rf .next dist coverage .jest-cache
npm run clean:cache
```

#### Step 2: Remove Log Files (1 min)
```bash
rm *.log 2>/dev/null || true
```

#### Step 3: Organize Documentation (5 min)
```bash
# Create structure
mkdir -p docs/archive docs/guides docs/analysis docs/refactoring

# Keep only these in root:
# - README.md
# - LICENSE
# - PROJECT_CLEANUP_ANALYSIS.md
# - CLEANUP_CHECKLIST.md (this file)

# Move everything else
mv *COMPLETION*.md *CERTIFICATE*.md *SUMMARY*.md docs/archive/
mv QUICK_START*.md START_*.md STAGING_*.md docs/guides/
mv *ANALYSIS*.md *WEBPAGE*.md docs/analysis/
mv REFACTORING*.md RECOMMENDED_UPDATES.md docs/refactoring/
```

#### Step 4: Remove Orphaned Files (2 min)
```bash
# Remove Visual Studio file
rm "Farmers Market Platform web and app.slnx" 2>/dev/null || true

# Move admin utility
mkdir -p scripts/admin
mv create-admin.ts scripts/admin/ 2>/dev/null || true
```

---

## ✅ Verification (5 min)

### After Cleanup, Check:
```bash
# 1. Count markdown files in root (should be ≤5)
ls -1 *.md | wc -l

# 2. Verify no secret files
ls -la .env* 2>/dev/null

# 3. Check git status
git status

# 4. Verify build works
npm run type-check
npm run build

# 5. Run tests
npm test
```

---

## 📊 Success Criteria

Your cleanup is complete when:

- [x] Root directory has ≤5 markdown files
- [x] No `.env` files with secrets in git
- [x] Build artifacts removed
- [x] Documentation in `/docs/`
- [x] Build completes successfully
- [x] All tests pass
- [x] No TypeScript errors

---

## 🔄 If Something Goes Wrong

```bash
# Restore from backup
git checkout backup-before-cleanup-YYYYMMDD

# Or reset specific files
git checkout HEAD -- path/to/file

# Or reset everything (CAREFUL!)
git reset --hard HEAD
```

---

## 📈 Expected Results

### Before Cleanup
- 38 markdown files in root
- 243MB build artifacts
- Potential security issues
- Disorganized documentation

### After Cleanup
- 2-4 markdown files in root
- Clean build environment
- Organized documentation
- Production-ready

---

## 🎯 Quick Commands Reference

```bash
# Full cleanup (dry run)
bash scripts/cleanup/safe-cleanup.sh --dry-run

# Full cleanup (execute)
bash scripts/cleanup/safe-cleanup.sh

# Clean build only
npm run clean:cache
rm -rf .next dist coverage .jest-cache

# Verify everything
npm run build && npm test && npm run type-check

# Check remaining mess
ls -1 *.md | wc -l  # Should be ≤5
du -sh .next dist coverage .jest-cache 2>/dev/null  # Should show "not found"
```

---

## 💡 Pro Tips

1. **Always backup first** - Create a git branch before cleanup
2. **Test incrementally** - Run `npm run build` after each phase
3. **Use dry run** - Test the script with `--dry-run` first
4. **Review changes** - Use `git diff` before committing
5. **Keep README.md** - Never delete the main README

---

## 📝 Commit After Cleanup

```bash
git add .
git commit -m "chore: cleanup project structure for production

- Remove build artifacts and log files
- Organize documentation into /docs structure
- Remove orphaned and duplicate files
- Improve root directory organization
- Prepare for clean production build

Reduces root clutter from 38 to 4 markdown files
Removes 243MB of stale build artifacts"
```

---

## 🆘 Need Help?

- **Full Analysis:** See `PROJECT_CLEANUP_ANALYSIS.md`
- **Automated Script:** `scripts/cleanup/safe-cleanup.sh`
- **Restore Backup:** `git checkout backup-before-cleanup-YYYYMMDD`

---

**Time Estimate:** 15-30 minutes  
**Risk Level:** 🟢 Low (if backed up)  
**Impact:** 🟢 High benefit  

**Ready to start?** → `bash scripts/cleanup/safe-cleanup.sh --dry-run`
