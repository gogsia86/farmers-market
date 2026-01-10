# 🚀 Quick Reference - Cleanup Scripts Cheat Sheet

**Farmers Market Platform - Safe Cleanup Toolkit v1.0**

---

## ⚡ Quick Commands

### Standard Workflow (Recommended)
```bash
# 1. Make executable (first time only)
chmod +x cleanup-scripts/*.sh

# 2. Analyze
./cleanup-scripts/01-analyze.sh

# 3. Clean
./cleanup-scripts/02-safe-cleanup.sh

# 4. Verify
./cleanup-scripts/03-verify.sh

# 5. If issues, rollback
./cleanup-scripts/04-rollback.sh
```

### One-Liner (Experienced Users)
```bash
./cleanup-scripts/01-analyze.sh && ./cleanup-scripts/02-safe-cleanup.sh && ./cleanup-scripts/03-verify.sh
```

---

## 📋 Script Overview

| Script | Purpose | Duration | Safety | Modifies Files |
|--------|---------|----------|--------|----------------|
| `01-analyze.sh` | Identify cleanup opportunities | 30-60s | ✅ 100% Safe | ❌ No |
| `02-safe-cleanup.sh` | Remove non-essential files | 1-2min | ✅ High (creates backup) | ✅ Yes |
| `03-verify.sh` | Verify everything works | 3-5min | ✅ 100% Safe | ❌ No |
| `04-rollback.sh` | Emergency restore | 30s | ✅ Very High | ✅ Yes (restores) |

---

## 🗑️ What Gets Removed

| Category | Pattern | Example | Size Saved |
|----------|---------|---------|------------|
| **Tests** | `*.test.*`, `*.spec.*` | `Component.test.tsx` | 30-50MB |
| **Backups** | `*.bak`, `*-old.*` | `file-old.ts` | 10-20MB |
| **Logs** | `*.log` | `npm-debug.log` | 5-10MB |
| **Source Maps** | `*.map` | `index.js.map` | 20-30MB |
| **Build Files** | `.next/`, `dist/` | Build outputs | 40-60MB |
| **IDE Files** | `.DS_Store`, `.idea/` | IDE configs | 1-5MB |
| **Empty Dirs** | Any empty folder | - | Minimal |
| **Temp Files** | `*.tmp`, `*.swp` | Editor temps | 1-5MB |

**Total Savings:** 100-150MB

---

## ✅ What's Preserved

### Critical Files (Never Touched)
```
✅ package.json           ✅ app/
✅ next.config.js         ✅ components/
✅ tsconfig.json          ✅ lib/
✅ tailwind.config.js     ✅ prisma/
✅ prisma/schema.prisma   ✅ public/
✅ .env.example           ✅ .github/workflows/
✅ README.md              ✅ node_modules/
```

---

## 🛡️ Safety Features

### Automatic Backups
Every cleanup creates:
```
backup-pre-cleanup-YYYYMMDD_HHMMSS
```

### Restore Command
```bash
git checkout backup-pre-cleanup-20250127_143022
```

### Logs Location
```
cleanup-scripts/logs/
├── analysis_TIMESTAMP.txt
├── cleanup_TIMESTAMP.log
├── verification_TIMESTAMP.log
├── build_TIMESTAMP.log
└── typecheck_TIMESTAMP.log
```

---

## 🔧 Common Tasks

### View Analysis Report
```bash
./cleanup-scripts/01-analyze.sh
cat cleanup-scripts/reports/analysis_*.txt
```

### List Backup Branches
```bash
git branch | grep backup
```

### Restore from Backup
```bash
./cleanup-scripts/04-rollback.sh
# Select option 1
```

### Check What Was Removed
```bash
cat cleanup-scripts/logs/cleanup_*.log | grep "Removed"
```

### Verify Build Still Works
```bash
./cleanup-scripts/03-verify.sh
npm run build
npm start
```

---

## ⚠️ Troubleshooting Quick Fixes

### Permission Denied
```bash
chmod +x cleanup-scripts/*.sh
```

### Build Fails After Cleanup
```bash
# Immediate rollback
./cleanup-scripts/04-rollback.sh

# Or restore specific file
git checkout backup-pre-cleanup-* -- path/to/file.tsx
```

### Verification Fails
```bash
# Check logs
cat cleanup-scripts/logs/verification_*.log
cat cleanup-scripts/logs/build_*.log

# Rollback
./cleanup-scripts/04-rollback.sh
```

### Out of Disk Space
```bash
# Emergency clean
rm -rf node_modules .next
npm install
./cleanup-scripts/02-safe-cleanup.sh
```

---

## 📊 Verification Checklist

After cleanup, verify these pass:
- [ ] `npm run build` succeeds
- [ ] All critical files exist
- [ ] Prisma schema validates
- [ ] TypeScript compiles (or acceptable errors)
- [ ] Local server starts
- [ ] Health endpoint works: `http://localhost:3000/api/health`
- [ ] Preview deployment succeeds
- [ ] Production deployment succeeds

---

## 🚨 Emergency Procedures

### If Something Breaks

**Step 1: Stop and Rollback**
```bash
./cleanup-scripts/04-rollback.sh
```

**Step 2: Restore from Backup**
- Select option 1 (restore from backup branch)
- Or manually: `git checkout backup-pre-cleanup-YYYYMMDD`

**Step 3: Investigate**
```bash
# Compare what changed
git diff HEAD backup-pre-cleanup-*

# Check logs
ls -ltr cleanup-scripts/logs/
cat cleanup-scripts/logs/cleanup_*.log
```

**Step 4: Test**
```bash
npm install
npm run build
npm start
```

---

## 💡 Best Practices

### Before Cleanup
1. ✅ Commit all changes
2. ✅ Run `npm run build` to ensure it works
3. ✅ Run analysis first
4. ✅ Check disk space: `df -h`

### During Cleanup
1. ✅ Read prompts carefully
2. ✅ Note the backup branch name
3. ✅ Watch for errors

### After Cleanup
1. ✅ Run verification script
2. ✅ Test locally
3. ✅ Deploy to preview
4. ✅ Test preview environment
5. ✅ Deploy to production
6. ✅ Monitor for errors

---

## 📈 Expected Results

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Repo Size** | ~300MB | ~150-200MB | 33-50% ↓ |
| **Files** | ~5000 | ~4000 | 20% ↓ |
| **Build Time** | ~90s | ~70-80s | 10-20s ↓ |
| **Vercel Cache** | ~320MB | ~170-200MB | 40% ↓ |

---

## 🎯 Confirmation Prompts

### 02-safe-cleanup.sh
```
Type 'YES' to proceed
```

### 04-rollback.sh (option 2)
```
Type 'DISCARD' to continue
```

---

## 📍 File Locations

```
cleanup-scripts/
├── 01-analyze.sh           # Analysis script
├── 02-safe-cleanup.sh      # Cleanup script
├── 03-verify.sh            # Verification script
├── 04-rollback.sh          # Rollback script
├── README.md               # Full documentation
├── QUICK_REFERENCE.md      # This file
├── reports/                # Analysis reports
│   └── analysis_*.txt
└── logs/                   # Operation logs
    ├── cleanup_*.log
    ├── verification_*.log
    ├── build_*.log
    └── typecheck_*.log
```

---

## 🔗 Useful Git Commands

### List All Backup Branches
```bash
git branch | grep backup | sort
```

### Delete Old Backups (after 1 week)
```bash
git branch -D backup-pre-cleanup-YYYYMMDD
```

### See What Would Be Removed
```bash
git status --short
```

### Restore Specific File
```bash
git checkout backup-pre-cleanup-* -- path/to/file
```

### Compare Current vs Backup
```bash
git diff backup-pre-cleanup-YYYYMMDD
```

---

## 📞 Quick Help

### Scripts Won't Run
```bash
# Fix: Make executable
chmod +x cleanup-scripts/*.sh
```

### Wrong Directory
```bash
# Fix: Go to project root
cd "Farmers Market Platform web and app"
pwd  # Verify you're in right place
```

### Need to Cancel
```bash
# Press Ctrl+C during script execution
# Then optionally run rollback
```

### Forgot Backup Branch Name
```bash
# List all backup branches
git branch | grep backup-pre-cleanup
```

---

## ⏱️ Time Estimates

- **Analysis:** 30-60 seconds
- **Cleanup:** 1-2 minutes
- **Verification:** 3-5 minutes (includes full build)
- **Rollback:** 30 seconds
- **Total workflow:** ~5-8 minutes

---

## 🎓 Learning Path

### First Time Users
1. Read `README.md` (full documentation)
2. Run `01-analyze.sh` (see what happens)
3. Review analysis report
4. Run cleanup on test branch first
5. Then run on main branch

### Experienced Users
1. Use one-liner workflow
2. Review logs only if issues occur
3. Run monthly for maintenance

---

## 📝 Quick Notes

- ✅ **Safe to run multiple times** - idempotent operations
- ✅ **No internet required** - all operations are local
- ✅ **Works offline** - doesn't need external services
- ✅ **Preserves git history** - only removes files, not commits
- ✅ **Vercel compatible** - respects .vercelignore patterns
- ⚠️ **Requires Git** - rollback features need git
- ⚠️ **Bash only** - won't work in CMD/PowerShell (use WSL/Git Bash)

---

## 🔑 Key Takeaways

1. **Always analyze first** - know what will be removed
2. **Verify after cleanup** - ensure nothing broke
3. **Keep backups for 1 week** - safety net
4. **Test locally before deploying** - catch issues early
5. **Monitor production** - check health endpoint

---

## 📚 Full Documentation

For detailed information, see:
```bash
cat cleanup-scripts/README.md
```

Or open in your editor:
```bash
code cleanup-scripts/README.md
```

---

**Last Updated:** January 2025  
**Version:** 1.0  
**Status:** Production Ready

---

🧹 **Remember:** When in doubt, rollback! 🚀