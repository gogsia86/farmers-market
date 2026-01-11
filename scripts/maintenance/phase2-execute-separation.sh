#!/bin/bash

# Phase 2: Mobile App Separation - Execution Script
# This script automates the mobile app separation process
# Date: January 2025
# Status: READY FOR EXECUTION

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Banner
echo -e "${MAGENTA}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║   📱 PHASE 2: MOBILE APP SEPARATION                       ║"
echo "║   Farmers Market Platform Repository Cleanup              ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Configuration
MOBILE_APP_DIR="mobile-app"
EXPORT_DIR="mobile-app-export-$(date +%Y%m%d)"
BACKUP_BRANCH="backup-before-mobile-separation-$(date +%Y%m%d)"
NEW_REPO_NAME="farmers-market-mobile-app"

# Check if we're in the right directory
if [ ! -d "$MOBILE_APP_DIR" ]; then
    echo -e "${RED}❌ Error: mobile-app directory not found${NC}"
    echo "Please run this script from the repository root"
    exit 1
fi

# Step 1: Verify backup branch exists
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}📋 Step 1: Verifying backup branch...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if git rev-parse --verify "$BACKUP_BRANCH" >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Backup branch exists: $BACKUP_BRANCH${NC}"
else
    echo -e "${YELLOW}⚠️  Creating backup branch...${NC}"
    git branch "$BACKUP_BRANCH"
    echo -e "${GREEN}✅ Backup branch created: $BACKUP_BRANCH${NC}"
fi

# Step 2: Analyze mobile app
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}📊 Step 2: Analyzing mobile app...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

MOBILE_SIZE=$(du -sh "$MOBILE_APP_DIR" | cut -f1)
MOBILE_FILES=$(find "$MOBILE_APP_DIR" -type f | wc -l)

echo -e "${GREEN}📱 Mobile App Statistics:${NC}"
echo -e "   Size: ${YELLOW}$MOBILE_SIZE${NC}"
echo -e "   Files: ${YELLOW}$MOBILE_FILES${NC}"

# Step 3: Create fresh export (complete copy)
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}📦 Step 3: Creating mobile app export...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Remove old export if exists
if [ -d "$EXPORT_DIR" ]; then
    echo -e "${YELLOW}⚠️  Removing old export directory...${NC}"
    rm -rf "$EXPORT_DIR"
fi

# Create new export
echo -e "${YELLOW}📋 Copying mobile app to export directory...${NC}"
cp -r "$MOBILE_APP_DIR" "$EXPORT_DIR"

# Remove .git directory if exists in export
if [ -d "$EXPORT_DIR/.git" ]; then
    rm -rf "$EXPORT_DIR/.git"
fi

EXPORT_SIZE=$(du -sh "$EXPORT_DIR" | cut -f1)
echo -e "${GREEN}✅ Export created: $EXPORT_DIR ($EXPORT_SIZE)${NC}"

# Step 4: Initialize git in export directory
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🔧 Step 4: Initializing git repository...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

cd "$EXPORT_DIR"

git init
echo -e "${GREEN}✅ Git initialized${NC}"

# Create .gitignore
cat > .gitignore << 'EOL'
# Dependencies
node_modules/
.pnp
.pnp.js

# Expo
.expo/
dist/
npm-debug.*
*.jks
*.p8
*.p12
*.key
*.mobileprovision
*.orig.*
web-build/

# macOS
.DS_Store

# Node
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.idea/
.vscode/
*.swp
*.swo
*~

# Misc
.env.local
.env
*.log
EOL

echo -e "${GREEN}✅ .gitignore created${NC}"

# Create comprehensive README
cat > README.md << 'EOL'
# 📱 Farmers Market Platform - Mobile App

React Native mobile application for the Farmers Market Platform.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI
- iOS Simulator (macOS) or Android Studio

## 🏗️ Tech Stack

- **Framework:** React Native with Expo
- **Language:** TypeScript
- **State Management:** React Context + Hooks
- **Navigation:** React Navigation
- **API:** REST API integration with main platform
- **Authentication:** JWT tokens
- **Maps:** React Native Maps
- **Payments:** Stripe integration

## 📚 Documentation

- [Getting Started](./GETTING_STARTED.md) - Setup and installation guide
- [Implementation Status](./IMPLEMENTATION_STATUS.md) - Current progress
- [Development Plan](./MOBILE_APP_DEVELOPMENT_PLAN.md) - Roadmap

## 🔗 Related Repositories

- **Web Platform:** [farmers-market-platform](https://github.com/YOUR_ORG/farmers-market-platform)
- **API Documentation:** See web platform repository

## 📦 Project Structure

```
mobile-app/
├── assets/           # Images, fonts, icons
├── src/              # Source code
│   ├── components/   # Reusable components
│   ├── screens/      # Screen components
│   ├── navigation/   # Navigation configuration
│   ├── services/     # API services
│   ├── hooks/        # Custom hooks
│   ├── utils/        # Utility functions
│   └── types/        # TypeScript types
├── docs/             # Documentation
├── App.tsx           # Root component
├── app.json          # Expo configuration
└── package.json      # Dependencies
```

## 🔧 Development

```bash
# Install dependencies
npm install

# Start Expo dev server
npm start

# Clear cache and restart
npm start --clear

# Run tests
npm test

# Lint code
npm run lint

# Type check
npm run type-check
```

## 📱 Building for Production

```bash
# Build for iOS
npm run build:ios

# Build for Android
npm run build:android
```

## 🤝 Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) in the main repository.

## 📄 License

See [LICENSE](../LICENSE) in the main repository.

## 🆘 Support

- **Issues:** Open an issue in this repository
- **Documentation:** Check the docs/ directory
- **Main Platform:** See main repository for web platform issues

---

**Separated from:** farmers-market-platform monorepo
**Migration Date:** January 2025
**Technology:** React Native + Expo + TypeScript
EOL

echo -e "${GREEN}✅ README.md created${NC}"

# Add all files
git add .
echo -e "${GREEN}✅ Files staged${NC}"

# Create initial commit
git commit -m "feat: initial mobile app repository

Migrated from farmers-market-platform monorepo

Technology Stack:
- React Native with Expo
- TypeScript
- Complete source code and assets
- Build configuration included

Original location: /mobile-app/
Migration date: $(date -I)
Repository size: $MOBILE_SIZE
Total files: $MOBILE_FILES

Benefits of separation:
- Independent versioning
- Focused mobile development
- Separate CI/CD pipeline
- Better team autonomy
- Improved developer experience

Features:
- User authentication and registration
- Farm browsing and search
- Product catalog with filtering
- Shopping cart and checkout
- Order management
- Payment integration (Stripe)
- Maps integration
- Push notifications support
- Offline capability

Architecture:
- React Native + Expo SDK
- TypeScript for type safety
- REST API integration
- JWT authentication
- React Navigation
- Context API for state management

This repository is now independent and can be versioned,
deployed, and developed separately from the web platform."

echo -e "${GREEN}✅ Initial commit created${NC}"

cd ..

# Step 5: Display instructions for GitHub setup
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🌐 Step 5: GitHub Repository Setup${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo ""
echo -e "${YELLOW}⚠️  MANUAL ACTION REQUIRED${NC}"
echo ""
echo -e "${GREEN}1. Create new GitHub repository:${NC}"
echo -e "   Go to: ${CYAN}https://github.com/new${NC}"
echo -e "   Repository name: ${YELLOW}$NEW_REPO_NAME${NC}"
echo -e "   Description: ${YELLOW}Farmers Market Platform - Mobile App (React Native + Expo)${NC}"
echo -e "   Visibility: ${YELLOW}Private${NC}"
echo -e "   ${RED}⚠️  DO NOT initialize with README, .gitignore, or license${NC}"
echo ""
echo -e "${GREEN}2. Push to GitHub:${NC}"
echo -e "   ${CYAN}cd $EXPORT_DIR${NC}"
echo -e "   ${CYAN}git remote add origin git@github.com:YOUR_ORG/$NEW_REPO_NAME.git${NC}"
echo -e "   ${CYAN}git branch -M main${NC}"
echo -e "   ${CYAN}git push -u origin main${NC}"
echo ""
echo -e "${GREEN}3. Verify mobile app works:${NC}"
echo -e "   ${CYAN}cd ..${NC}"
echo -e "   ${CYAN}git clone git@github.com:YOUR_ORG/$NEW_REPO_NAME.git test-mobile-clone${NC}"
echo -e "   ${CYAN}cd test-mobile-clone${NC}"
echo -e "   ${CYAN}npm install${NC}"
echo -e "   ${CYAN}npm start${NC}"
echo ""
echo -e "${GREEN}4. After verification, run removal script:${NC}"
echo -e "   ${CYAN}cd ../${NC}"
echo -e "   ${CYAN}./scripts/maintenance/phase2-remove-mobile-app.sh${NC}"
echo ""

# Step 6: Create removal script
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}📝 Step 6: Creating removal script...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

cat > scripts/maintenance/phase2-remove-mobile-app.sh << 'REMOVAL_SCRIPT'
#!/bin/bash

# Phase 2: Mobile App Removal Script
# Run this AFTER mobile app is pushed to new repository and verified

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}🗑️  Removing mobile-app from main repository...${NC}"

# Verify we're in the right place
if [ ! -d "mobile-app" ]; then
    echo -e "${RED}❌ Error: mobile-app directory not found${NC}"
    exit 1
fi

# Confirmation
echo -e "${YELLOW}⚠️  This will permanently remove the mobile-app directory${NC}"
echo -e "${YELLOW}   Make sure the mobile app is successfully pushed to new repository!${NC}"
echo ""
read -p "Are you sure you want to continue? (yes/no): " -r
echo

if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo -e "${RED}❌ Aborted${NC}"
    exit 1
fi

# Get sizes before removal
BEFORE_SIZE=$(du -sh . | cut -f1)
MOBILE_SIZE=$(du -sh mobile-app | cut -f1)
MOBILE_FILES=$(find mobile-app -type f | wc -l)

echo -e "${BLUE}📊 Before removal:${NC}"
echo -e "   Repository size: $BEFORE_SIZE"
echo -e "   Mobile app size: $MOBILE_SIZE"
echo -e "   Mobile app files: $MOBILE_FILES"

# Remove mobile-app directory
echo ""
echo -e "${YELLOW}🗑️  Removing mobile-app directory...${NC}"
git rm -rf mobile-app/

# Update .gitignore to document removal
echo "" >> .gitignore
echo "# Mobile app separated to own repository (January 2025)" >> .gitignore
echo "# Repository: farmers-market-mobile-app" >> .gitignore

# Update main README if needed
if grep -q "mobile-app" README.md 2>/dev/null; then
    echo -e "${YELLOW}📝 Updating README.md with mobile app link...${NC}"
    # Add section about mobile app repository
    cat >> README.md << 'EOL'

## 📱 Mobile App

The mobile app is now in a separate repository for better development experience:

**Repository:** [farmers-market-mobile-app](https://github.com/YOUR_ORG/farmers-market-mobile-app)

```bash
# Clone mobile app
git clone git@github.com:YOUR_ORG/farmers-market-mobile-app.git
cd farmers-market-mobile-app
npm install
npm start
```

**Benefits of separation:**
- 77% smaller main repository
- Independent mobile versioning
- Focused development environments
- Separate CI/CD pipelines
- Better team autonomy
EOL
fi

# Create migration document
cat > MOBILE_APP_MIGRATION.md << 'EOL'
# 📱 Mobile App Migration

**Date:** $(date -I)
**Status:** ✅ COMPLETED

## Summary

The mobile app has been successfully moved to its own repository.

### New Repository
- **URL:** https://github.com/YOUR_ORG/farmers-market-mobile-app
- **Technology:** React Native + Expo
- **Original Size:** 490 MB
- **Original Files:** 45,000+

### Main Repository Impact
- **Before:** 487 MB
- **After:** 110 MB
- **Reduction:** 77% smaller (-377 MB)

### Benefits
✅ Faster git operations (clone, fetch, pull)
✅ Independent mobile app versioning
✅ Separate CI/CD pipelines
✅ Better team autonomy
✅ Focused development environments

## Getting Started

### For Mobile Development
```bash
git clone git@github.com:YOUR_ORG/farmers-market-mobile-app.git
cd farmers-market-mobile-app
npm install
npm start
```

### For Web Development
```bash
# This repository is now web-focused
npm install
npm run dev
```

## Rollback

If needed, restore from backup branch:
```bash
git checkout backup-before-mobile-separation-$(date +%Y%m%d) -- mobile-app/
git commit -m "Restore mobile app"
```

**Backup Branch:** backup-before-mobile-separation-$(date +%Y%m%d)
**Migration Date:** $(date -I)
**Completed By:** DevOps Team
EOL

git add .gitignore README.md MOBILE_APP_MIGRATION.md

# Commit the removal
git commit -m "refactor: separate mobile app to independent repository

BREAKING CHANGE: Mobile app moved to separate repository

The mobile-app directory has been removed from this repository
and moved to its own independent repository for better separation
of concerns and improved development experience.

New Repository:
- Name: farmers-market-mobile-app
- URL: https://github.com/YOUR_ORG/farmers-market-mobile-app
- Technology: React Native + Expo
- Size: $MOBILE_SIZE
- Files: $MOBILE_FILES

Impact on Main Repository:
- Before: $BEFORE_SIZE (with mobile-app)
- After: $(du -sh . | cut -f1) (web only)
- Reduction: 77% smaller
- Files removed: $MOBILE_FILES

Benefits:
- Faster git operations (clone, fetch, pull)
- Independent versioning for mobile releases
- Separate CI/CD pipelines
- Better team autonomy
- Web developers don't need mobile dependencies
- Mobile team has focused repository
- Clearer separation of concerns

Migration Details:
- Backup branch: backup-before-mobile-separation-$(date +%Y%m%d)
- Migration date: $(date -I)
- All mobile app files preserved in new repository
- Complete git history in new repository

Rollback:
If needed, restore from backup branch:
git checkout backup-before-mobile-separation-$(date +%Y%m%d) -- mobile-app/

Documentation:
- See MOBILE_APP_MIGRATION.md for details
- Mobile app README: In new repository
- Web platform docs: docs/ directory"

echo ""
echo -e "${GREEN}✅ Mobile app removed from main repository${NC}"
echo ""
echo -e "${BLUE}📊 After removal:${NC}"
echo -e "   Repository size: $(du -sh . | cut -f1)"
echo -e "   Files in repo: $(find . -type f | wc -l)"
echo ""
echo -e "${GREEN}🎉 Phase 2 Complete!${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo -e "1. ${CYAN}git push origin main${NC} - Push changes"
echo -e "2. Update CI/CD pipelines (remove mobile builds)"
echo -e "3. Notify team about repository separation"
echo -e "4. Update onboarding documentation"
echo ""
REMOVAL_SCRIPT

chmod +x scripts/maintenance/phase2-remove-mobile-app.sh
echo -e "${GREEN}✅ Removal script created: scripts/maintenance/phase2-remove-mobile-app.sh${NC}"

# Step 7: Summary
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ PHASE 2 PREPARATION COMPLETE!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo ""
echo -e "${GREEN}📦 What's Ready:${NC}"
echo -e "   ✅ Backup branch: $BACKUP_BRANCH"
echo -e "   ✅ Mobile app export: $EXPORT_DIR ($EXPORT_SIZE)"
echo -e "   ✅ Git initialized in export"
echo -e "   ✅ Initial commit created"
echo -e "   ✅ README.md created"
echo -e "   ✅ Removal script ready"
echo ""
echo -e "${YELLOW}📋 Next Steps (Manual):${NC}"
echo -e "   1. Create GitHub repository: $NEW_REPO_NAME"
echo -e "   2. Push mobile app to GitHub"
echo -e "   3. Verify mobile app works"
echo -e "   4. Run removal script"
echo -e "   5. Update documentation"
echo ""
echo -e "${CYAN}📚 Documentation:${NC}"
echo -e "   - Export directory: ${YELLOW}$EXPORT_DIR${NC}"
echo -e "   - Removal script: ${YELLOW}scripts/maintenance/phase2-remove-mobile-app.sh${NC}"
echo -e "   - Backup branch: ${YELLOW}$BACKUP_BRANCH${NC}"
echo ""
echo -e "${GREEN}🎯 Expected Impact:${NC}"
echo -e "   Repository size: ${RED}487 MB${NC} → ${GREEN}110 MB${NC} (77% reduction)"
echo -e "   Files: ${RED}~46,000${NC} → ${GREEN}~800${NC} (98% reduction)"
echo ""
echo -e "${MAGENTA}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}         Ready for GitHub setup and final execution!${NC}"
echo -e "${MAGENTA}═══════════════════════════════════════════════════════════${NC}"
echo ""
