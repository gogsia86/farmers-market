#!/bin/bash

################################################################################
# Repository Cleanup Script
# Removes temporary files, build artifacts, and outdated scripts
################################################################################

echo "🧹 Starting repository cleanup..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counter for deleted files
DELETED_COUNT=0

# Function to safely delete files
safe_delete() {
    local file="$1"
    if [ -f "$file" ]; then
        rm "$file" 2>/dev/null && {
            echo -e "${GREEN}✓${NC} Deleted: $file"
            ((DELETED_COUNT++))
        } || echo -e "${RED}✗${NC} Failed to delete: $file"
    fi
}

# Function to safely delete directories
safe_delete_dir() {
    local dir="$1"
    if [ -d "$dir" ]; then
        rm -rf "$dir" 2>/dev/null && {
            echo -e "${GREEN}✓${NC} Deleted directory: $dir"
            ((DELETED_COUNT++))
        } || echo -e "${RED}✗${NC} Failed to delete directory: $dir"
    fi
}

echo "📝 Cleaning temporary build files..."
safe_delete "build-analysis.log"
safe_delete "build-final.log"
safe_delete "build-output.log"
safe_delete "build-output.txt"
safe_delete "final-build.log"
safe_delete "dev.log"
safe_delete "test-results.txt"

echo ""
echo "🔧 Cleaning temporary fix scripts..."
safe_delete "add-missing-logger-imports.js"
safe_delete "comprehensive-logger-fix.js"
safe_delete "final-logger-fix.js"
safe_delete "find-missing-logger-imports.js"
safe_delete "fix-all-logger-calls.js"
safe_delete "fix-all-logger-issues.sh"
safe_delete "fix-all-remaining-logger-calls.js"
safe_delete "fix-app-insights-logger.js"
safe_delete "fix-duplicate-imports.js"
safe_delete "fix-logger-errors.js"
safe_delete "fix-logger-errors2.js"
safe_delete "fix-missing-commas.js"
safe_delete "remove-duplicate-logger-imports.js"
safe_delete "fix-malformed-logger-contexts.js"

echo ""
echo "📄 Cleaning old scripts..."
safe_delete "baseline-database.ps1"
safe_delete "cleanup-docs.sh"
safe_delete "cleanup-repository.sh"
safe_delete "cleanup-root.sh"
safe_delete "deploy_nis.sh"
safe_delete "start-dev.ps1"

echo ""
echo "🗑️ Cleaning build artifacts and caches..."
safe_delete_dir ".next"
safe_delete_dir ".jest-cache"
safe_delete_dir "coverage"
safe_delete_dir "node_modules/.cache"

echo ""
echo "📋 Cleaning old markdown documentation (keeping organized docs/ folder)..."
# These files should be in docs/ folder or deleted
safe_delete "ACTION_PLAN.md"
safe_delete "CART_ERROR_FIX.md"
safe_delete "COMPLETION_SUMMARY.md"
safe_delete "EXECUTIVE_SUMMARY.pdf"
safe_delete "FARMERS_MARKET_PLATFORM_OVERVIEW.pdf"
safe_delete "FINAL_PROJECT_STATUS.md"
safe_delete "FOLLOW_UP_ACTIONS_COMPLETED.md"
safe_delete "IMMEDIATE_ACTIONS_COMPLETED.md"
safe_delete "IMPROVEMENTS_INDEX.md"
safe_delete "INVESTOR_MATERIALS_README.md"
safe_delete "INVESTOR_PRESENTATION.pdf"
safe_delete "PRISMA_QUERY_FIX_QUICK_REFERENCE.md"
safe_delete "PROJECT_COMPLETION_ANALYSIS.md"

echo ""
echo "🔍 Checking for other temporary files..."
# Find and list but don't delete package-lock or other important files
TEMP_COUNT=$(find . -maxdepth 1 -type f -name "*.tmp" 2>/dev/null | wc -l)
if [ "$TEMP_COUNT" -gt 0 ]; then
    find . -maxdepth 1 -type f -name "*.tmp" -delete 2>/dev/null
    echo -e "${GREEN}✓${NC} Deleted $TEMP_COUNT .tmp files"
fi

BAK_COUNT=$(find . -maxdepth 1 -type f -name "*.bak" 2>/dev/null | wc -l)
if [ "$BAK_COUNT" -gt 0 ]; then
    find . -maxdepth 1 -type f -name "*.bak" -delete 2>/dev/null
    echo -e "${GREEN}✓${NC} Deleted $BAK_COUNT .bak files"
fi

TILDE_COUNT=$(find . -maxdepth 1 -type f -name "*~" 2>/dev/null | wc -l)
if [ "$TILDE_COUNT" -gt 0 ]; then
    find . -maxdepth 1 -type f -name "*~" -delete 2>/dev/null
    echo -e "${GREEN}✓${NC} Deleted $TILDE_COUNT ~ backup files"
fi

echo ""
echo "📦 Cleaning npm cache..."
if command -v npm &> /dev/null; then
    npm cache verify --silent 2>/dev/null && echo -e "${GREEN}✓${NC} npm cache verified" || echo -e "${YELLOW}⚠${NC} npm cache verification skipped"
fi

echo ""
echo "🧪 Cleaning test artifacts..."
safe_delete_dir "playwright-report"
safe_delete_dir ".playwright"

echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}✨ Cleanup complete!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo -e "📊 Summary:"
echo -e "   ${YELLOW}$DELETED_COUNT${NC} files/directories removed"
echo ""
echo -e "💡 Next steps:"
echo -e "   1. Run ${YELLOW}git status${NC} to see remaining changes"
echo -e "   2. Run ${YELLOW}npm install${NC} to ensure dependencies are up to date"
echo -e "   3. Run ${YELLOW}npm run build${NC} to verify clean build"
echo -e "   4. Run ${YELLOW}npm test${NC} to verify tests still pass"
echo ""
echo -e "${GREEN}Repository is now clean! 🎉${NC}"
