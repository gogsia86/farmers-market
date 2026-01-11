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
