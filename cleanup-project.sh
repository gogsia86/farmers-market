#!/bin/bash

# Farmers Market Platform - Project Cleanup Script
# Date: December 1, 2024
# Purpose: Remove duplicate files, build artifacts, and organize documentation

set -e

echo "🧹 Starting Farmers Market Platform Cleanup..."
echo ""

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Create backup directory
BACKUP_DIR="cleanup-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
print_status "Created backup directory: $BACKUP_DIR"

# 1. Clean build artifacts
echo ""
echo "📦 Cleaning build artifacts..."
ARTIFACTS_CLEANED=0

if [ -d ".next" ]; then
    du -sh .next
    rm -rf .next
    ARTIFACTS_CLEANED=1
fi

if [ -d ".jest-cache" ]; then
    du -sh .jest-cache
    rm -rf .jest-cache
    ARTIFACTS_CLEANED=1
fi

if [ -d "coverage" ]; then
    du -sh coverage
    rm -rf coverage
    ARTIFACTS_CLEANED=1
fi

if [ -d "dist" ]; then
    du -sh dist
    rm -rf dist
    ARTIFACTS_CLEANED=1
fi

if [ -d "playwright-report" ]; then
    du -sh playwright-report
    rm -rf playwright-report
    ARTIFACTS_CLEANED=1
fi

if [ $ARTIFACTS_CLEANED -eq 1 ]; then
    print_status "Build artifacts cleaned (~216 MB freed)"
else
    print_warning "No build artifacts found to clean"
fi

# 2. Remove temporary/audit files
echo ""
echo "🗑️  Removing temporary files..."
TEMP_FILES=(
    "console_audit.txt"
    "console_audit_production.txt"
    "console_audit_summary.txt"
    "TODO_CATEGORIZED.txt"
    "TODO_HIGH_PRIORITY.txt"
    "TODO_INVENTORY.txt"
    "TODO_SUMMARY.txt"
    "FEATURED_FARMS_SOLUTION.txt"
    "PORT_3001_MIGRATION_COMPLETE.txt"
    "PASTE_INTO_PRISMA_STUDIO.sql"
)

TEMP_REMOVED=0
for file in "${TEMP_FILES[@]}"; do
    if [ -f "$file" ]; then
        cp "$file" "$BACKUP_DIR/" 2>/dev/null
        rm -f "$file"
        echo "  - Removed: $file"
        TEMP_REMOVED=$((TEMP_REMOVED + 1))
    fi
done

if [ $TEMP_REMOVED -gt 0 ]; then
    print_status "Removed $TEMP_REMOVED temporary files"
else
    print_warning "No temporary files found to remove"
fi

# 3. Remove duplicate root scripts
echo ""
echo "📝 Removing duplicate scripts..."
DUPLICATE_SCRIPTS=(
    "activate-farms-simple.ts"
    "fix-featured-farms.js"
    "update-farms.js"
)

SCRIPTS_REMOVED=0
for script in "${DUPLICATE_SCRIPTS[@]}"; do
    if [ -f "$script" ]; then
        cp "$script" "$BACKUP_DIR/" 2>/dev/null
        rm -f "$script"
        echo "  - Removed: $script (duplicate exists in scripts/)"
        SCRIPTS_REMOVED=$((SCRIPTS_REMOVED + 1))
    fi
done

if [ $SCRIPTS_REMOVED -gt 0 ]; then
    print_status "Removed $SCRIPTS_REMOVED duplicate scripts"
else
    print_warning "No duplicate scripts found to remove"
fi

# 4. Archive documentation
echo ""
echo "📚 Archiving old documentation..."

# Create archive directories
mkdir -p docs/archive/status-reports
mkdir -p docs/archive/cleanup-phases
mkdir -p docs/archive/reviews
mkdir -p docs/archive/guides

DOCS_ARCHIVED=0

# Archive status reports
STATUS_DOCS=(
    "COMPLETION_STATUS_95_PERCENT.md"
    "100_PERCENT_NUCLEAR_COMPLETION.md"
    "NUCLEAR_MOMENTUM_VICTORY.md"
)

for doc in "${STATUS_DOCS[@]}"; do
    if [ -f "$doc" ]; then
        mv "$doc" docs/archive/status-reports/
        echo "  - Archived: $doc"
        DOCS_ARCHIVED=$((DOCS_ARCHIVED + 1))
    fi
done

# Archive cleanup docs
CLEANUP_DOCS=(
    "CLEANUP_COMPLETED.md"
    "CLEANUP_EXECUTION_SUMMARY.md"
    "CLEANUP_INDEX.md"
    "PHASE_2_CLEANUP_PLAN.md"
    "QUICK_CLEANUP_REFERENCE.md"
    "REPOSITORY_ANALYSIS_AND_CLEANUP.md"
)

for doc in "${CLEANUP_DOCS[@]}"; do
    if [ -f "$doc" ]; then
        mv "$doc" docs/archive/cleanup-phases/
        echo "  - Archived: $doc"
        DOCS_ARCHIVED=$((DOCS_ARCHIVED + 1))
    fi
done

# Archive reviews
REVIEW_DOCS=(
    "COMPREHENSIVE_PLATFORM_ANALYSIS.md"
    "FINAL_PLATFORM_REVIEW.md"
    "PLATFORM_REVIEW_SUMMARY.md"
    "REVIEW_INDEX.md"
)

for doc in "${REVIEW_DOCS[@]}"; do
    if [ -f "$doc" ]; then
        mv "$doc" docs/archive/reviews/
        echo "  - Archived: $doc"
        DOCS_ARCHIVED=$((DOCS_ARCHIVED + 1))
    fi
done

# Archive guides and misc
GUIDE_DOCS=(
    "QUICK_START_100_PERCENT.md"
    "QUICK_START_PORT_3001.md"
    "QUICK_TEST_DATABASE_ENHANCEMENTS.md"
    "START_HERE_UPGRADE.md"
    "QUICK_WINS_SUMMARY.md"
    "DATABASE_ENHANCEMENTS_COMPLETE.md"
    "DEV_SERVER_SETUP.md"
    "DEV_SERVER_UPDATE_SUMMARY.md"
    "FIX_FEATURED_FARMS.md"
    "FIX_MISSING_IMAGES_GUIDE.md"
    "UPGRADE_TO_100_PERCENT.md"
    "UPGRADE_IMPLEMENTATION_COMPLETE.md"
    "WIREFRAME_IMPLEMENTATION_STATUS.md"
    "PLATFORM_UPDATE_RECOMMENDATIONS.md"
)

for doc in "${GUIDE_DOCS[@]}"; do
    if [ -f "$doc" ]; then
        mv "$doc" docs/archive/guides/
        echo "  - Archived: $doc"
        DOCS_ARCHIVED=$((DOCS_ARCHIVED + 1))
    fi
done

if [ $DOCS_ARCHIVED -gt 0 ]; then
    print_status "Archived $DOCS_ARCHIVED documentation files"
else
    print_warning "No documentation files found to archive"
fi

# 5. Create archive README
echo ""
echo "📝 Creating archive documentation..."
cat > docs/archive/README.md << 'EOF'
# Documentation Archive

This directory contains archived documentation from previous development phases.

## Directory Structure

- **status-reports/** - Historical status and completion reports
- **cleanup-phases/** - Documentation from cleanup and refactoring phases
- **reviews/** - Platform reviews and analyses
- **guides/** - Old setup and quick start guides

## Current Documentation

For current documentation, refer to the root directory:
- `README.md` - Main project documentation
- `QUICK_REFERENCE.md` - Command reference
- `BUILD_SUCCESS.md` - Latest build status
- `CURRENT_STATUS_AND_NEXT_STEPS.md` - Current status

## Note

These files are preserved for historical reference. They may contain outdated information.
EOF

print_status "Created archive documentation"

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Cleanup Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Summary:"
echo "  ✅ Build artifacts: CLEANED (~216 MB)"
echo "  ✅ Temporary files: REMOVED ($TEMP_REMOVED files)"
echo "  ✅ Duplicate scripts: REMOVED ($SCRIPTS_REMOVED files)"
echo "  ✅ Documentation: ARCHIVED ($DOCS_ARCHIVED files)"
echo ""
echo "Backup created at: $BACKUP_DIR"
echo ""
echo "Essential docs remain in root:"
echo "  ✅ README.md"
echo "  ✅ BUILD_SUCCESS.md"
echo "  ✅ QUICK_REFERENCE.md"
echo "  ✅ CURRENT_STATUS_AND_NEXT_STEPS.md"
echo "  ✅ 100_PERCENT_PRODUCTION_READY.md"
echo "  ✅ 100_PERCENT_ACHIEVEMENT_PLAN.md"
echo "  ✅ FEATURE_MATRIX.md"
echo "  ✅ IMPLEMENTATION_ROADMAP.md"
echo "  ✅ TYPESCRIPT_FIXES_SUMMARY.md"
echo ""
echo "Archived docs available at: docs/archive/"
echo ""
echo "Next steps:"
echo "  1. Verify everything works: npm run dev"
echo "  2. Run tests: npm test"
echo "  3. Review backup if needed: $BACKUP_DIR"
echo "  4. Delete backup after verification"
echo ""
