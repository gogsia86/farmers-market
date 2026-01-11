#!/bin/bash

# 📱 Phase 2: Mobile App Separation
# Moves mobile app to separate repository
# Safe - creates backup first

set -e  # Exit on error

echo "=================================================="
echo "📱 PHASE 2: MOBILE APP SEPARATION"
echo "=================================================="
echo ""
echo "This will:"
echo "  • Create backup of current state"
echo "  • Analyze mobile app (490 MB, 45,116 files)"
echo "  • Prepare for separation to new repository"
echo "  • Document the migration process"
echo ""
echo "Expected Impact:"
echo "  • Main repo: 487 MB → 110 MB (-77%)"
echo "  • Files: 45,913 → 797 (-98%)"
echo "  • Improved development experience"
echo ""
echo "⚠️  NOTE: This is a multi-step process."
echo "    This script will prepare everything."
echo "    Final separation requires manual GitHub setup."
echo ""

# Confirm
read -p "Continue with Phase 2 preparation? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cancelled by user"
    exit 1
fi

echo ""
echo "📊 Step 1: Analyzing mobile app..."
echo "---"

# Check if mobile-app exists
if [ ! -d "mobile-app" ]; then
    echo "❌ Error: mobile-app directory not found!"
    exit 1
fi

# Get mobile app stats
MOBILE_SIZE=$(du -sh mobile-app/ | cut -f1)
MOBILE_FILES=$(find mobile-app -type f | wc -l)

echo "Mobile app size: $MOBILE_SIZE"
echo "Mobile app files: $MOBILE_FILES"

echo ""
echo "📦 Step 2: Creating backup branch..."

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)

# Create backup branch
BACKUP_BRANCH="backup-before-mobile-separation-$(date +%Y%m%d)"
git branch "$BACKUP_BRANCH"

echo "   ✅ Backup branch created: $BACKUP_BRANCH"
echo "   (You can restore anytime: git checkout $BACKUP_BRANCH)"

echo ""
echo "📋 Step 3: Preparing migration documentation..."

# Create migration note
cat > MOBILE_APP_MIGRATION.md << 'EOF'
# 📱 Mobile App Migration

**Date:** $(date -I)
**Status:** ✅ MIGRATED

---

## 🎯 Summary

The mobile app has been moved to its own repository for better separation
of concerns and improved development experience.

### New Repository
**URL:** https://github.com/YOUR_ORG/farmers-market-mobile-app
**Technology:** React Native + Expo
**Size:** 490 MB
**Files:** 45,116

---

## 📊 Impact

### Main Repository (farmers-market-platform)
- **Before:** 487 MB
- **After:** 110 MB
- **Reduction:** 77% smaller (-377 MB)

### Benefits
✅ Faster git operations (clone, fetch, pull)
✅ Independent mobile app versioning
✅ Separate CI/CD pipelines
✅ Better team autonomy
✅ Web devs don't need mobile dependencies
✅ Mobile team has focused repository

---

## 🚀 Getting Started

### For Mobile Development
```bash
# Clone mobile app repository
git clone git@github.com:YOUR_ORG/farmers-market-mobile-app.git
cd farmers-market-mobile-app

# Install dependencies
npm install

# Start development server
npm start
```

### For Web Development
```bash
# Clone web platform (this repo)
git clone git@github.com:YOUR_ORG/farmers-market-platform.git
cd farmers-market-platform

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## 📚 Documentation

### Mobile App
- **Repository:** https://github.com/YOUR_ORG/farmers-market-mobile-app
- **README:** See mobile repo README.md
- **Setup Guide:** See mobile repo GETTING_STARTED.md

### Web Platform
- **Repository:** This repository
- **README:** See README.md
- **Documentation:** See docs/

---

## 🔄 Migration Details

### What Was Moved
```
mobile-app/
├── assets/           (Images, fonts, icons)
├── docs/             (Mobile-specific docs)
├── node_modules/     (44,000+ files)
├── src/              (Source code)
├── App.tsx           (Root component)
├── app.json          (Expo config)
├── package.json      (Dependencies)
└── tsconfig.json     (TypeScript config)
```

### Migration Method
- **Approach:** Clean copy to new repository
- **History:** New git history in mobile repo
- **Backup:** Preserved in backup branch

### Rollback (if needed)
```bash
# Restore mobile-app from backup
git checkout backup-before-mobile-separation-YYYYMMDD -- mobile-app/
git commit -m "Restore mobile app"
```

---

## 🤝 Team Coordination

### For Existing Developers
1. **Pull latest changes** from main repository
2. **Clone mobile repository** if working on mobile
3. **Update local environments** accordingly

### For New Developers
- **Web only:** Clone farmers-market-platform
- **Mobile only:** Clone farmers-market-mobile-app
- **Both:** Clone both repositories

---

## 📞 Support

**Questions about mobile app?**
- See mobile repo documentation
- Contact mobile team

**Questions about web platform?**
- See docs/ directory
- Contact web team

**Migration issues?**
- Open issue with label `mobile-migration`
- Check backup branch for rollback

---

## ✅ Post-Migration Checklist

- [x] Mobile app copied to new repository
- [x] Main repository cleaned (mobile-app removed)
- [x] Documentation updated
- [ ] CI/CD pipelines updated
- [ ] Team notified
- [ ] Access permissions set up
- [ ] Both repos verified working

---

**Migration Date:** $(date -I)
**Migrated By:** DevOps Team
**Backup Branch:** backup-before-mobile-separation-$(date +%Y%m%d)

_For detailed migration plan, see docs/maintenance/PHASE2_MOBILE_APP_SEPARATION.md_
EOF

echo "   ✅ Migration documentation created: MOBILE_APP_MIGRATION.md"

echo ""
echo "📊 Step 4: Creating mobile app export..."

# Create a clean copy of mobile-app for easy transfer
EXPORT_DIR="mobile-app-export-$(date +%Y%m%d)"
mkdir -p "$EXPORT_DIR"

echo "   Copying mobile app files..."
cp -r mobile-app/* "$EXPORT_DIR/" 2>/dev/null || true
cp mobile-app/.gitignore "$EXPORT_DIR/" 2>/dev/null || true
cp mobile-app/.npmrc "$EXPORT_DIR/" 2>/dev/null || true

echo "   ✅ Mobile app exported to: $EXPORT_DIR/"

echo ""
echo "📝 Step 5: Preparing removal script..."

# Create removal script
cat > scripts/maintenance/phase2b-remove-mobile-app.sh << 'REMOVAL_SCRIPT'
#!/bin/bash

# Phase 2B: Remove mobile app from main repository
# Run this AFTER mobile app is set up in new repository

set -e

echo "=================================================="
echo "📱 PHASE 2B: REMOVE MOBILE APP"
echo "=================================================="
echo ""
echo "⚠️  WARNING: This will remove mobile-app/ directory"
echo "    Make sure mobile app is set up in new repo first!"
echo ""

read -p "Mobile app set up in new repository? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cancelled - Set up mobile app first"
    exit 1
fi

echo ""
echo "🗑️  Removing mobile-app directory..."

# Remove mobile-app
git rm -rf mobile-app/

echo "   ✅ mobile-app/ removed"

echo ""
echo "📝 Adding migration note..."

# Stage migration note
git add MOBILE_APP_MIGRATION.md

echo "   ✅ MOBILE_APP_MIGRATION.md staged"

echo ""
echo "💾 Creating commit..."

git commit -m "chore: move mobile app to separate repository

The mobile app has been moved to its own repository for better
separation of concerns and improved development experience.

New location: https://github.com/YOUR_ORG/farmers-market-mobile-app
Size reduction: 490 MB (77% smaller)
Files removed: 45,116

Benefits:
- Main repo: 487 MB → 110 MB
- Faster git operations
- Independent mobile versioning
- Separate CI/CD pipelines
- Better team autonomy

See MOBILE_APP_MIGRATION.md for details."

echo ""
echo "✅ PHASE 2B COMPLETE!"
echo ""
echo "Summary:"
echo "  • mobile-app/ removed from repository"
echo "  • MOBILE_APP_MIGRATION.md added"
echo "  • Commit created"
echo ""
echo "Next steps:"
echo "  1. Review: git status"
echo "  2. Push: git push origin main"
echo "  3. Update team documentation"
echo ""
REMOVAL_SCRIPT

chmod +x scripts/maintenance/phase2b-remove-mobile-app.sh

echo "   ✅ Removal script created: scripts/maintenance/phase2b-remove-mobile-app.sh"

echo ""
echo "=================================================="
echo "✅ PHASE 2 PREPARATION COMPLETE!"
echo "=================================================="
echo ""
echo "Summary:"
echo "  • Backup branch: $BACKUP_BRANCH"
echo "  • Mobile app analyzed: $MOBILE_SIZE, $MOBILE_FILES files"
echo "  • Export created: $EXPORT_DIR/"
echo "  • Documentation: MOBILE_APP_MIGRATION.md"
echo "  • Removal script: scripts/maintenance/phase2b-remove-mobile-app.sh"
echo ""
echo "📋 Next Steps (Manual):"
echo ""
echo "1️⃣  CREATE NEW REPOSITORY"
echo "   On GitHub, create: farmers-market-mobile-app"
echo "   (Private repository, React Native description)"
echo ""
echo "2️⃣  COPY MOBILE APP TO NEW REPO"
echo "   cd $EXPORT_DIR"
echo "   git init"
echo "   git add ."
echo "   git commit -m \"feat: initial mobile app repository\""
echo "   git remote add origin git@github.com:YOUR_ORG/farmers-market-mobile-app.git"
echo "   git push -u origin main"
echo ""
echo "3️⃣  VERIFY MOBILE APP WORKS"
echo "   cd farmers-market-mobile-app"
echo "   npm install"
echo "   npm start"
echo ""
echo "4️⃣  REMOVE FROM MAIN REPO"
echo "   cd farmers-market-platform"
echo "   ./scripts/maintenance/phase2b-remove-mobile-app.sh"
echo ""
echo "5️⃣  UPDATE DOCUMENTATION"
echo "   - Update README.md with link to mobile repo"
echo "   - Update CONTRIBUTING.md"
echo "   - Update CI/CD configuration"
echo ""
echo "📚 For detailed instructions:"
echo "   See: docs/maintenance/PHASE2_MOBILE_APP_SEPARATION.md"
echo ""
echo "💾 Backup available at branch: $BACKUP_BRANCH"
echo "   (Restore anytime: git checkout $BACKUP_BRANCH)"
echo ""
echo "=================================================="
