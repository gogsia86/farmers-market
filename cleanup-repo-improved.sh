#!/bin/bash

################################################################################
# 🧹 Comprehensive Repository Cleanup Script
# Farmers Market Platform - Updated January 2025
#
# This script removes temporary files, organizes documentation, and cleans
# build artifacts while preserving essential project files.
#
# Usage:
#   ./cleanup-repo-improved.sh           # Interactive mode
#   ./cleanup-repo-improved.sh --auto    # Automatic mode
#   ./cleanup-repo-improved.sh --dry-run # See what would be done
################################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Counters
DELETED_COUNT=0
MOVED_COUNT=0
ARCHIVED_COUNT=0

# Flags
DRY_RUN=false
AUTO_MODE=false

# Parse arguments
for arg in "$@"; do
    case $arg in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --auto)
            AUTO_MODE=true
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --dry-run    Show what would be done without making changes"
            echo "  --auto       Run without prompts"
            echo "  --help       Show this help message"
            exit 0
            ;;
    esac
done

################################################################################
# Helper Functions
################################################################################

print_header() {
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo ""
}

print_section() {
    echo ""
    echo -e "${BLUE}▶ $1${NC}"
    echo ""
}

safe_delete() {
    local file="$1"
    if [ -f "$file" ]; then
        if [ "$DRY_RUN" = true ]; then
            echo -e "${YELLOW}[DRY RUN]${NC} Would delete: $file"
        else
            rm "$file" 2>/dev/null && {
                echo -e "${GREEN}✓${NC} Deleted: $file"
                ((DELETED_COUNT++))
            } || echo -e "${RED}✗${NC} Failed to delete: $file"
        fi
    fi
}

safe_delete_dir() {
    local dir="$1"
    if [ -d "$dir" ]; then
        if [ "$DRY_RUN" = true ]; then
            echo -e "${YELLOW}[DRY RUN]${NC} Would delete directory: $dir"
        else
            rm -rf "$dir" 2>/dev/null && {
                echo -e "${GREEN}✓${NC} Deleted directory: $dir"
                ((DELETED_COUNT++))
            } || echo -e "${RED}✗${NC} Failed to delete directory: $dir"
        fi
    fi
}

safe_move() {
    local src="$1"
    local dest="$2"
    if [ -f "$src" ]; then
        if [ "$DRY_RUN" = true ]; then
            echo -e "${YELLOW}[DRY RUN]${NC} Would move: $src -> $dest"
        else
            mkdir -p "$(dirname "$dest")"
            mv "$src" "$dest" 2>/dev/null && {
                echo -e "${GREEN}✓${NC} Moved: $(basename "$src") -> $dest"
                ((MOVED_COUNT++))
            } || echo -e "${RED}✗${NC} Failed to move: $src"
        fi
    fi
}

safe_archive() {
    local src="$1"
    local dest=".archive/$2"
    if [ -e "$src" ]; then
        if [ "$DRY_RUN" = true ]; then
            echo -e "${YELLOW}[DRY RUN]${NC} Would archive: $src -> $dest"
        else
            mkdir -p "$(dirname "$dest")"
            mv "$src" "$dest" 2>/dev/null && {
                echo -e "${MAGENTA}✓${NC} Archived: $src -> $dest"
                ((ARCHIVED_COUNT++))
            } || echo -e "${RED}✗${NC} Failed to archive: $src"
        fi
    fi
}

confirm() {
    if [ "$AUTO_MODE" = true ]; then
        return 0
    fi

    local prompt="$1"
    local response

    while true; do
        read -p "$prompt [y/N]: " response
        case $response in
            [Yy]* ) return 0;;
            [Nn]* ) return 1;;
            "" ) return 1;;
            * ) echo "Please answer yes or no.";;
        esac
    done
}

################################################################################
# Main Cleanup Process
################################################################################

print_header "🧹 Farmers Market Platform - Repository Cleanup"

if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}Running in DRY RUN mode - no changes will be made${NC}"
fi

if [ "$AUTO_MODE" = true ]; then
    echo -e "${YELLOW}Running in AUTOMATIC mode - no prompts${NC}"
fi

echo ""
echo "This script will:"
echo "  1. Remove all log files"
echo "  2. Organize documentation files"
echo "  3. Archive large validation assets"
echo "  4. Clean generated test results"
echo "  5. Remove temporary files"
echo ""

if ! confirm "Continue with cleanup?"; then
    echo "Cleanup cancelled."
    exit 0
fi

################################################################################
# Step 1: Delete Log Files
################################################################################

print_section "📝 Step 1: Removing log files"

safe_delete "bot-output.log"
safe_delete "bot-run-output.log"
safe_delete "dev-server.log"
safe_delete "install.log"
safe_delete "install2.log"
safe_delete "install_clean.log"
safe_delete "mvp-bot-current-run.log"
safe_delete "mvp-bot-full-run.log"
safe_delete "mvp-bot-output-20260108_080511.log"
safe_delete "mvp-bot-output.log"
safe_delete "mvp-bot-run-after-fixes.log"
safe_delete "mvp-bot-run.log"
safe_delete "cart-test-output.txt"

################################################################################
# Step 2: Create Directory Structure
################################################################################

print_section "📁 Step 2: Creating organized directory structure"

if [ "$DRY_RUN" = false ]; then
    mkdir -p docs/{fixes,analysis,guides,optimization,action-items,implementation}
    mkdir -p .archive/{validation-screenshots,validation-reports,reports,old-docs}
    echo -e "${GREEN}✓${NC} Created directory structure"
else
    echo -e "${YELLOW}[DRY RUN]${NC} Would create docs and archive directories"
fi

################################################################################
# Step 3: Organize Documentation Files
################################################################################

print_section "📚 Step 3: Organizing documentation files"

# Project Management -> docs/project/ or docs/implementation/
safe_move "EXECUTIVE_SUMMARY.md" "docs/project/EXECUTIVE_SUMMARY.md"
safe_move "IMPLEMENTATION_SUMMARY.md" "docs/implementation/IMPLEMENTATION_SUMMARY.md"
safe_move "PHASE_2_EXECUTIVE_SUMMARY.md" "docs/project/PHASE_2_EXECUTIVE_SUMMARY.md"
safe_move "PHASE_2_IMPLEMENTATION.md" "docs/implementation/PHASE_2_IMPLEMENTATION.md"
safe_move "UNIFIED_BOT_FRAMEWORK.md" "docs/project/UNIFIED_BOT_FRAMEWORK.md"

# Fix Summaries -> docs/fixes/
safe_move "BUILD_FIXES_COMPLETE_2025-01-23.md" "docs/fixes/BUILD_FIXES_COMPLETE_2025-01-23.md"
safe_move "CART_FIXES_APPLIED.md" "docs/fixes/CART_FIXES_APPLIED.md"
safe_move "CART_FIX_SUMMARY.txt" "docs/fixes/CART_FIX_SUMMARY.txt"
safe_move "DEPLOYMENT_FIX_2025-01-23.md" "docs/fixes/DEPLOYMENT_FIX_2025-01-23.md"
safe_move "FIXES_APPLIED_2025-01-08.md" "docs/fixes/FIXES_APPLIED_2025-01-08.md"
safe_move "FIXES_APPLIED_2025-01.md" "docs/fixes/FIXES_APPLIED_2025-01.md"
safe_move "FIX_SUMMARY_2025-01-23.md" "docs/fixes/FIX_SUMMARY_2025-01-23.md"
safe_move "MOBILE_APP_FIXES_2025-01-23.md" "docs/fixes/MOBILE_APP_FIXES_2025-01-23.md"
safe_move "VERCEL_FIXES_SUMMARY.md" "docs/fixes/VERCEL_FIXES_SUMMARY.md"

# Analysis Reports -> docs/analysis/
safe_move "BOT_CONSOLIDATION_ANALYSIS.md" "docs/analysis/BOT_CONSOLIDATION_ANALYSIS.md"
safe_move "CART_MODULE_ANALYSIS.md" "docs/analysis/CART_MODULE_ANALYSIS.md"
safe_move "COMPREHENSIVE_CODE_REVIEW_AND_WARNINGS.md" "docs/analysis/COMPREHENSIVE_CODE_REVIEW_AND_WARNINGS.md"
safe_move "MVP_BOT_ISSUES_ANALYSIS.md" "docs/analysis/MVP_BOT_ISSUES_ANALYSIS.md"
safe_move "REMAINING_ISSUES_INVESTIGATION.md" "docs/analysis/REMAINING_ISSUES_INVESTIGATION.md"
safe_move "WEBSITE_PAGES_PHOTO_ANALYSIS.md" "docs/analysis/WEBSITE_PAGES_PHOTO_ANALYSIS.md"

# Quick Guides -> docs/guides/
safe_move "CART_QUICK_FIX_GUIDE.md" "docs/guides/CART_QUICK_FIX_GUIDE.md"
safe_move "OPTIMIZATION_QUICK_START.md" "docs/guides/OPTIMIZATION_QUICK_START.md"
safe_move "QUICK_FIX_GUIDE.md" "docs/guides/QUICK_FIX_GUIDE.md"
safe_move "QUICK_REFERENCE_PHOTOS.md" "docs/guides/QUICK_REFERENCE_PHOTOS.md"
safe_move "QUICK_TEST_GUIDE.md" "docs/guides/QUICK_TEST_GUIDE.md"
safe_move "QUICKSTART_UBF.md" "docs/guides/QUICKSTART_UBF.md"

# Optimization -> docs/optimization/
safe_move "FARM_DETAIL_OPTIMIZATION.md" "docs/optimization/FARM_DETAIL_OPTIMIZATION.md"
safe_move "MULTI_PAGE_OPTIMIZATION_COMPLETE.md" "docs/optimization/MULTI_PAGE_OPTIMIZATION_COMPLETE.md"
safe_move "OPTIMIZATION_SUMMARY.md" "docs/optimization/OPTIMIZATION_SUMMARY.md"
safe_move "TEST_PLAN_FARM_OPTIMIZATION.md" "docs/optimization/TEST_PLAN_FARM_OPTIMIZATION.md"

# Testing -> docs/testing/
safe_move "TESTING_GUIDE_ORDERS.md" "docs/testing/TESTING_GUIDE_ORDERS.md"
safe_move "TEST_RUN_SUMMARY_2026-01-08.md" "docs/testing/TEST_RUN_SUMMARY_2026-01-08.md"

# Deployment -> docs/deployment/
safe_move "VERCEL_ACTION_ITEMS.md" "docs/deployment/VERCEL_ACTION_ITEMS.md"
safe_move "VERCEL_ENV_SETUP_GUIDE.md" "docs/deployment/VERCEL_ENV_SETUP_GUIDE.md"
safe_move "VERCEL_QUICK_REFERENCE.md" "docs/deployment/VERCEL_QUICK_REFERENCE.md"

# Action Items -> docs/action-items/
safe_move "ACTION_ITEMS_SUMMARY.md" "docs/action-items/ACTION_ITEMS_SUMMARY.md"
safe_move "URGENT_ACTION_ITEMS.md" "docs/action-items/URGENT_ACTION_ITEMS.md"

# Completed/Outdated -> .archive/old-docs/
safe_archive "IMPLEMENTATION_COMPLETE_2025-01-08.md" "old-docs/IMPLEMENTATION_COMPLETE_2025-01-08.md"
safe_archive "IMPLEMENTATION_COMPLETE_2026-01-PHOTOS.md" "old-docs/IMPLEMENTATION_COMPLETE_2026-01-PHOTOS.md"
safe_archive "CHANGELOG_UBF.md" "old-docs/CHANGELOG_UBF.md"

################################################################################
# Step 4: Archive Large Assets
################################################################################

print_section "📦 Step 4: Archiving large validation assets"

if confirm "Archive mvp-validation-screenshots (75MB)?"; then
    safe_archive "mvp-validation-screenshots" "validation-screenshots"
fi

if confirm "Archive mvp-validation-reports (208KB)?"; then
    safe_archive "mvp-validation-reports" "validation-reports"
fi

if confirm "Archive reports directory (235KB)?"; then
    safe_archive "reports" "reports"
fi

################################################################################
# Step 5: Clean Generated Test Results
################################################################################

print_section "🧪 Step 5: Cleaning generated test results"

safe_delete_dir "test-results"
safe_delete_dir "playwright-report"
safe_delete_dir ".playwright"

################################################################################
# Step 6: Clean Build Artifacts
################################################################################

print_section "🏗️ Step 6: Cleaning build artifacts"

if confirm "Delete .next build directory?"; then
    safe_delete_dir ".next"
fi

safe_delete_dir ".jest-cache"
safe_delete_dir "coverage"
safe_delete_dir ".turbo"

################################################################################
# Step 7: Clean Temporary Files
################################################################################

print_section "🗑️ Step 7: Cleaning temporary files"

# Find and delete .tmp files
if [ -d "." ]; then
    TEMP_FILES=$(find . -maxdepth 1 -type f -name "*.tmp" 2>/dev/null)
    if [ -n "$TEMP_FILES" ]; then
        for file in $TEMP_FILES; do
            safe_delete "$file"
        done
    fi
fi

# Find and delete .bak files
if [ -d "." ]; then
    BAK_FILES=$(find . -maxdepth 1 -type f -name "*.bak" 2>/dev/null)
    if [ -n "$BAK_FILES" ]; then
        for file in $BAK_FILES; do
            safe_delete "$file"
        done
    fi
fi

# Find and delete ~ backup files
if [ -d "." ]; then
    TILDE_FILES=$(find . -maxdepth 1 -type f -name "*~" 2>/dev/null)
    if [ -n "$TILDE_FILES" ]; then
        for file in $TILDE_FILES; do
            safe_delete "$file"
        done
    fi
fi

################################################################################
# Step 8: Clean Editor Configurations (Optional)
################################################################################

print_section "💻 Step 8: Cleaning editor configurations"

if confirm "Remove non-VSCode editor configs (.copilot, .cursor, .zed)?"; then
    safe_delete_dir ".copilot"
    safe_delete_dir ".cursor"
    safe_delete_dir ".zed"
fi

################################################################################
# Step 9: Update .gitignore
################################################################################

print_section "📝 Step 9: Ensuring .gitignore is up to date"

if [ "$DRY_RUN" = false ]; then
    # Check if .archive is in .gitignore
    if ! grep -q "^\.archive/" .gitignore 2>/dev/null; then
        echo ".archive/" >> .gitignore
        echo -e "${GREEN}✓${NC} Added .archive/ to .gitignore"
    fi

    # Ensure test-results is in .gitignore
    if ! grep -q "^test-results/" .gitignore 2>/dev/null; then
        echo "test-results/" >> .gitignore
        echo -e "${GREEN}✓${NC} Added test-results/ to .gitignore"
    fi
else
    echo -e "${YELLOW}[DRY RUN]${NC} Would update .gitignore"
fi

################################################################################
# Summary
################################################################################

print_header "✨ Cleanup Complete!"

echo ""
echo -e "${GREEN}📊 Summary:${NC}"
echo -e "   ${YELLOW}$DELETED_COUNT${NC} files/directories deleted"
echo -e "   ${MAGENTA}$ARCHIVED_COUNT${NC} items archived"
echo -e "   ${GREEN}$MOVED_COUNT${NC} files organized"
echo ""

if [ "$DRY_RUN" = false ]; then
    echo -e "${CYAN}💡 Next Steps:${NC}"
    echo "   1. Review changes with: ${YELLOW}git status${NC}"
    echo "   2. Verify build works: ${YELLOW}npm run build${NC}"
    echo "   3. Run tests: ${YELLOW}npm test${NC}"
    echo "   4. Commit changes: ${YELLOW}git add . && git commit -m 'chore: cleanup repository'${NC}"
    echo ""
    echo -e "${GREEN}Repository is now clean and organized! 🎉${NC}"
else
    echo -e "${YELLOW}This was a dry run. Run without --dry-run to apply changes.${NC}"
fi

echo ""
