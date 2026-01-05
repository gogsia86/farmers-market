#!/bin/bash

# 🧹 Repository Cleanup Script
# Farmers Market Platform - Automated cleanup and organization
# Version: 1.0.0
# Last Updated: January 2025

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
MOVED_COUNT=0
DELETED_COUNT=0
CREATED_COUNT=0

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  🌾 Farmers Market Platform - Repository Cleanup          ║"
echo "║  Divine Agricultural Code Organization                     ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Confirmation prompt
echo -e "${YELLOW}⚠️  This script will reorganize documentation files.${NC}"
echo -e "${YELLOW}   A backup will be created before any changes.${NC}"
echo ""
read -p "Continue? (y/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ Cleanup cancelled.${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}📦 Creating backup...${NC}"

# Create backup directory with timestamp
BACKUP_DIR=".backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup all markdown files
cp *.md "$BACKUP_DIR/" 2>/dev/null || true
echo -e "${GREEN}✅ Backup created: $BACKUP_DIR${NC}"

echo ""
echo -e "${BLUE}📁 Creating new directory structure...${NC}"

# Create new documentation structure
mkdir -p docs/guides
mkdir -p docs/api
mkdir -p docs/deployment
mkdir -p .archive/sessions
mkdir -p .archive/milestones
mkdir -p .archive/old-implementations
mkdir -p .archive/obsolete

CREATED_COUNT=$((CREATED_COUNT + 7))
echo -e "${GREEN}✅ Created documentation directories${NC}"

echo ""
echo -e "${BLUE}🚚 Moving session summaries...${NC}"

# Move session summaries
SESSION_FILES=(
    "BUILD_SUCCESS.md"
    "BUILD_SUCCESS_SESSION_SUMMARY.md"
    "CONTINUATION_SUCCESS.md"
    "CONTINUOUS_DEVELOPMENT_PROGRESS.md"
    "CONTINUOUS_MODE_SESSION_02.md"
    "CONTINUOUS_MODE_SESSION_03_COMPLETION_PUSH.md"
    "CONTINUOUS_SESSION_ADMIN_COMPLETE.md"
    "CONTINUOUS_SESSION_SUMMARY.md"
    "SESSION_COMPLETE.md"
    "SESSION_SUMMARY_CHECKOUT_UI.md"
    "SESSION_SUMMARY_PHASE_3.md"
    "SESSION_SUMMARY_PHASE_4_CART_CHECKOUT.md"
    "WEEK_1_CONTINUOUS_MODE_SESSION.md"
    "WEEK_2_DAY_2_SESSION_SUMMARY.md"
    "WEEK_2_DAY_3_SESSION_SUMMARY.md"
    "WEEK_2_SESSION_SUMMARY.md"
)

for file in "${SESSION_FILES[@]}"; do
    if [ -f "$file" ]; then
        mv "$file" ".archive/sessions/"
        MOVED_COUNT=$((MOVED_COUNT + 1))
        echo -e "  ${GREEN}→${NC} $file"
    fi
done

echo ""
echo -e "${BLUE}🏆 Moving completion certificates...${NC}"

# Move completion certificates
COMPLETION_FILES=(
    "CLEAN_SLATE_SUCCESS.md"
    "FEATURE_BUILD_COMPLETE.md"
    "PHASE_3_PRODUCT_MANAGEMENT_COMPLETE.md"
    "PHASE_4_SHOPPING_CART_CHECKOUT_COMPLETE.md"
    "WEEK_1_COMPLETION_CERTIFICATE.md"
    "WEEK_2_DAY_1_COMPLETION_CERTIFICATE.md"
    "WEEK_2_DAY_2_COMPLETION_CERTIFICATE.md"
    "WEEK_2_DAY_3_COMPLETION_CERTIFICATE.md"
    "WEEK_2_DAY_7_COMPLETION_CERTIFICATE.md"
    "READ_ME_FIRST_DAY_3_COMPLETE.md"
    "READ_ME_FIRST_DAY_4_COMPLETE.md"
    "START_HERE_DAY_14_COMPLETE.md"
)

for file in "${COMPLETION_FILES[@]}"; do
    if [ -f "$file" ]; then
        mv "$file" ".archive/milestones/"
        MOVED_COUNT=$((MOVED_COUNT + 1))
        echo -e "  ${GREEN}→${NC} $file"
    fi
done

echo ""
echo -e "${BLUE}📊 Moving status/progress files...${NC}"

# Move status files
STATUS_FILES=(
    "PROJECT_STATUS_90_PERCENT.md"
    "WEEK_1_IMPLEMENTATION_STATUS.md"
    "WEEK_2_DAY_1_IMPLEMENTATION_STATUS.md"
    "WEEK_2_DAY_2_IMPLEMENTATION_STATUS.md"
    "WEEK_2_DAY_3_IMPLEMENTATION_STATUS.md"
    "WEEK_2_DAY_5_COMPLETION_ANALYSIS.md"
    "WEEK_2_PROGRESS_TRACKER.md"
    "START_HERE_DAY_13_STATUS.md"
    "START_HERE_WEEK_1_COMPLETE.md"
    "START_HERE_WEEK_2_DAY_13.md"
    "START_HERE_WEEK_2_DAY_2.md"
    "START_HERE_WEEK_2_DAY_3.md"
    "START_HERE_WEEK_2_DAY_4.md"
    "START_HERE_WEEK_2_DAY_5.md"
    "READ_ME_FIRST_WEEK_2.md"
)

for file in "${STATUS_FILES[@]}"; do
    if [ -f "$file" ]; then
        mv "$file" ".archive/milestones/"
        MOVED_COUNT=$((MOVED_COUNT + 1))
        echo -e "  ${GREEN}→${NC} $file"
    fi
done

echo ""
echo -e "${BLUE}📚 Moving quick start guides...${NC}"

# Move quick start guides to docs
GUIDE_FILES=(
    "CART_CHECKOUT_QUICK_START.md"
    "CHECKOUT_QUICK_START.md"
    "CHECKOUT_UI_IMPLEMENTATION.md"
)

for file in "${GUIDE_FILES[@]}"; do
    if [ -f "$file" ]; then
        mv "$file" "docs/guides/"
        MOVED_COUNT=$((MOVED_COUNT + 1))
        echo -e "  ${GREEN}→${NC} $file"
    fi
done

# Move deployment guide
if [ -f "DEPLOYMENT_QUICK_START.md" ]; then
    mv "DEPLOYMENT_QUICK_START.md" "docs/deployment/"
    MOVED_COUNT=$((MOVED_COUNT + 1))
    echo -e "  ${GREEN}→${NC} DEPLOYMENT_QUICK_START.md"
fi

echo ""
echo -e "${BLUE}🗑️  Moving obsolete files...${NC}"

# Move obsolete files
OBSOLETE_FILES=(
    "CLEAN_SLATE_READY.md"
    "EXECUTE_NOW.md"
    "FRESH_START_STRATEGY.md"
    "REBUILD_GUIDE.md"
    "SCHEMA_FIXES_DONE.md"
    "SCHEMA_FIX_COMPLETE.md"
    "TYPE_FIXES_NEEDED.md"
    "WEB_FIXES_SUMMARY.md"
    "WEBSITE_ANALYSIS_AND_REBUILD_RECOMMENDATION.md"
)

for file in "${OBSOLETE_FILES[@]}"; do
    if [ -f "$file" ]; then
        mv "$file" ".archive/obsolete/"
        MOVED_COUNT=$((MOVED_COUNT + 1))
        echo -e "  ${GREEN}→${NC} $file"
    fi
done

echo ""
echo -e "${BLUE}📖 Consolidating reference docs...${NC}"

# Move reference docs to docs/
REFERENCE_FILES=(
    "COMPLETE_WEBSITE_STRUCTURE.md"
    "IMPLEMENTATION_ROADMAP.md"
    "PROJECT_ROADMAP.md"
    "QUICK_REFERENCE.md"
    "WEEK_2_QUICK_START.md"
)

for file in "${REFERENCE_FILES[@]}"; do
    if [ -f "$file" ]; then
        mv "$file" "docs/"
        MOVED_COUNT=$((MOVED_COUNT + 1))
        echo -e "  ${GREEN}→${NC} $file"
    fi
done

# Move WHATS_NEXT.md to archive
if [ -f "WHATS_NEXT.md" ]; then
    mv "WHATS_NEXT.md" ".archive/"
    MOVED_COUNT=$((MOVED_COUNT + 1))
    echo -e "  ${GREEN}→${NC} WHATS_NEXT.md"
fi

echo ""
echo -e "${BLUE}🔄 Merging archive directories...${NC}"

# Merge .archive-old-implementation if it exists
if [ -d ".archive-old-implementation" ]; then
    if [ "$(ls -A .archive-old-implementation 2>/dev/null)" ]; then
        mv .archive-old-implementation/* .archive/old-implementations/ 2>/dev/null || true
        rmdir .archive-old-implementation
        echo -e "${GREEN}✅ Merged .archive-old-implementation${NC}"
    else
        rmdir .archive-old-implementation
        echo -e "${GREEN}✅ Removed empty .archive-old-implementation${NC}"
    fi
fi

echo ""
echo -e "${BLUE}🧹 Cleaning temporary files...${NC}"

# Remove log files
if [ -f "dev.log" ]; then
    rm "dev.log"
    DELETED_COUNT=$((DELETED_COUNT + 1))
    echo -e "  ${GREEN}✓${NC} Removed dev.log"
fi

# Clean .next logs
if [ -d ".next/dev/logs" ]; then
    rm -f .next/dev/logs/*.log 2>/dev/null || true
    echo -e "  ${GREEN}✓${NC} Cleaned .next logs"
fi

echo ""
echo -e "${BLUE}📝 Creating archive index...${NC}"

# Create archive README
cat > .archive/README.md << 'EOF'
# 📦 Archive Directory

This directory contains historical files from the Farmers Market Platform development process.

## Directory Structure

### 📁 sessions/
Session summaries and development logs from continuous development sessions.

### 🏆 milestones/
Completion certificates, status reports, and milestone documentation from various development phases.

### 💾 old-implementations/
Previous code implementations and deprecated features.

### 🗑️ obsolete/
Obsolete documentation and files no longer relevant to current development.

## Purpose

These files are preserved for:
- Historical reference
- Tracking development progression
- Understanding architectural decisions
- Compliance and auditing

## Note

Files in this directory are not maintained and may reference outdated code or practices.
For current documentation, see the main `docs/` directory.

---

**Last Updated**: $(date +"%B %d, %Y")
**Total Files Archived**: $(find . -type f -name "*.md" | wc -l)
EOF

CREATED_COUNT=$((CREATED_COUNT + 1))
echo -e "${GREEN}✅ Created .archive/README.md${NC}"

echo ""
echo -e "${BLUE}📝 Creating docs index...${NC}"

# Create docs README
cat > docs/README.md << 'EOF'
# 📚 Farmers Market Platform Documentation

Divine Agricultural E-Commerce Platform - Complete Documentation

## 📖 Documentation Structure

### Quick Start
- [Quick Start Guide](QUICK_START.md) - Get started quickly
- [Deployment Guide](deployment/DEPLOYMENT_QUICK_START.md) - Deploy to production

### Guides
- [Cart & Checkout](guides/CART_CHECKOUT_QUICK_START.md) - Shopping cart and checkout flow
- [Checkout UI](guides/CHECKOUT_UI_IMPLEMENTATION.md) - Checkout interface implementation
- More guides in `guides/` directory

### Architecture & Reference
- [Complete Website Structure](COMPLETE_WEBSITE_STRUCTURE.md) - Full architecture reference
- [Implementation Roadmap](IMPLEMENTATION_ROADMAP.md) - Development roadmap
- [Project Roadmap](PROJECT_ROADMAP.md) - Project planning
- [Quick Reference](QUICK_REFERENCE.md) - Quick reference guide

### API Documentation
API documentation will be available in the `api/` directory.

## 🔗 External Documentation

- [Divine Instructions](.github/instructions/) - AI coding guidelines
- [Contributing Guide](../CONTRIBUTING.md) - How to contribute
- [Changelog](../CHANGELOG.md) - Version history

## 🌾 Agricultural Consciousness

All documentation follows the divine agricultural patterns and biodynamic consciousness principles.

---

**Last Updated**: $(date +"%B %d, %Y")
EOF

CREATED_COUNT=$((CREATED_COUNT + 1))
echo -e "${GREEN}✅ Created docs/README.md${NC}"

echo ""
echo -e "${BLUE}📝 Creating consolidated PROJECT_STATUS.md...${NC}"

# Create consolidated project status
cat > PROJECT_STATUS.md << 'EOF'
# 📊 Farmers Market Platform - Project Status

**Version**: 1.0.0
**Last Updated**: $(date +"%B %d, %Y")
**Status**: ACTIVE DEVELOPMENT

---

## 🎯 Current Status

### Completion: ~90%

**Phase 4 Completed**: Shopping Cart & Checkout System

### Active Features
- ✅ User Authentication (NextAuth v5)
- ✅ Farm Management
- ✅ Product Catalog
- ✅ Shopping Cart
- ✅ Checkout Flow
- ✅ Order Management
- ✅ Payment Integration (Stripe)
- ✅ Admin Dashboard
- 🚧 Mobile App (React Native)

---

## 🏗️ Architecture

### Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Database**: PostgreSQL + Prisma 7
- **Authentication**: NextAuth v5
- **Payments**: Stripe
- **Styling**: Tailwind CSS
- **Testing**: Jest + Vitest + Playwright

### Performance
- **Hardware**: Optimized for HP OMEN (RTX 2070, 64GB RAM, 12 threads)
- **Build Time**: ~10 minutes
- **Database**: Connection pooling enabled
- **Caching**: Multi-layer (Memory, Redis, Database)

---

## 📈 Recent Updates

See [CHANGELOG.md](CHANGELOG.md) for detailed version history.

---

## 🔜 Next Milestones

1. **Mobile App Completion** - React Native app finalization
2. **Performance Optimization** - Sub-second page loads
3. **Advanced Analytics** - Farm and product analytics
4. **Multi-language Support** - i18n implementation
5. **Advanced Search** - Full-text search with filters

---

## 🐛 Known Issues

See current TypeScript compilation errors:
- [TYPESCRIPT_FIXES_GUIDE.md](TYPESCRIPT_FIXES_GUIDE.md)

See repository cleanup plan:
- [CODE_ANALYSIS_CLEANUP_PLAN.md](CODE_ANALYSIS_CLEANUP_PLAN.md)

---

## 📚 Documentation

- **Main Docs**: [docs/](docs/)
- **API Reference**: [docs/api/](docs/api/)
- **Guides**: [docs/guides/](docs/guides/)
- **Architecture**: [docs/COMPLETE_WEBSITE_STRUCTURE.md](docs/COMPLETE_WEBSITE_STRUCTURE.md)

---

## 👥 Team

- Divine Agricultural Development Team
- AI-Assisted Development (Claude Sonnet 4.5, GitHub Copilot)

---

## 📞 Support

For issues and questions:
- See [CONTRIBUTING.md](CONTRIBUTING.md)
- Check [docs/](docs/) directory
- Review [.github/instructions/](.github/instructions/)

---

_"Code with agricultural consciousness, architect with divine precision."_ 🌾⚡
EOF

CREATED_COUNT=$((CREATED_COUNT + 1))
echo -e "${GREEN}✅ Created PROJECT_STATUS.md${NC}"

echo ""
echo -e "${BLUE}🔍 Verifying cleanup...${NC}"

# Count remaining markdown files in root
ROOT_MD_COUNT=$(find . -maxdepth 1 -name "*.md" -type f | wc -l)

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  ✨ Cleanup Complete!                                     ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}📊 Summary:${NC}"
echo -e "  ${BLUE}→${NC} Files moved: $MOVED_COUNT"
echo -e "  ${BLUE}→${NC} Files deleted: $DELETED_COUNT"
echo -e "  ${BLUE}→${NC} Directories created: $CREATED_COUNT"
echo -e "  ${BLUE}→${NC} Root markdown files remaining: $ROOT_MD_COUNT"
echo ""
echo -e "${GREEN}📦 Backup Location:${NC} $BACKUP_DIR"
echo ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo "  1. Review the changes:"
echo "     - Check docs/ directory"
echo "     - Check .archive/ directory"
echo "     - Review PROJECT_STATUS.md"
echo ""
echo "  2. Commit the changes:"
echo "     git add ."
echo "     git commit -m \"docs: reorganize documentation structure\""
echo ""
echo "  3. If anything went wrong, restore from backup:"
echo "     cp $BACKUP_DIR/*.md ."
echo ""
echo -e "${GREEN}✅ Repository is now clean and organized!${NC}"
echo ""
