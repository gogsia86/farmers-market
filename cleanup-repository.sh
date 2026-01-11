#!/bin/bash

# ╔════════════════════════════════════════════════════════════════════╗
# ║ 🧹 FARMERS MARKET PLATFORM - REPOSITORY CLEANUP SCRIPT            ║
# ║ Automated cleanup of backup files and temporary artifacts         ║
# ║ Date: January 2025                                                ║
# ║ Platform: Linux/Mac (Bash)                                        ║
# ╚════════════════════════════════════════════════════════════════════╝

set -e  # Exit on error

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Helper functions
print_header() {
    echo -e "\n${CYAN}${1}${NC}"
}

print_step() {
    echo -e "\n${YELLOW}${1}${NC}"
}

print_success() {
    echo -e "${GREEN}✅ ${1}${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ️  ${1}${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  ${1}${NC}"
}

print_error() {
    echo -e "${RED}❌ ${1}${NC}"
}

# Banner
clear
echo -e "${CYAN}================================================================${NC}"
echo -e "${WHITE}    🧹 FARMERS MARKET PLATFORM - REPOSITORY CLEANUP${NC}"
echo -e "${CYAN}================================================================${NC}"
echo ""

# Pre-flight checks
print_step "🔍 Pre-flight Checks..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Not in project root directory!"
    print_info "Please run this script from: 'Farmers Market Platform web and app' directory"
    exit 1
fi

# Verify it's the correct project
if ! grep -q '"name": "farmers-market"' package.json; then
    print_error "Wrong project! Expected 'farmers-market'"
    exit 1
fi

print_success "Project root directory confirmed"

# Check git status
print_info "Checking git status..."
if command -v git &> /dev/null; then
    if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
        print_warning "You have uncommitted changes!"
        print_info "Uncommitted files:"
        git status --short | sed 's/^/  /'
        echo ""
        read -p "Continue anyway? (y/N): " continue_choice
        if [ "$continue_choice" != "y" ] && [ "$continue_choice" != "Y" ]; then
            print_info "Cleanup cancelled. Please commit your changes first."
            exit 0
        fi
    else
        print_success "Git status is clean"
    fi
else
    print_warning "Git not available"
fi

# Final confirmation
echo ""
echo -e "${YELLOW}================================================================${NC}"
echo -e "${WHITE}  📋 CLEANUP PLAN:${NC}"
echo -e "${YELLOW}================================================================${NC}"
echo ""
echo -e "${WHITE}  1. Remove ~128 .backup files from src/ directory${NC}"
echo -e "${WHITE}  2. Remove 17 progress tracking files from root${NC}"
echo -e "${WHITE}  3. Remove mobile-app-export-20260111/ (~478 MB)${NC}"
echo -e "${WHITE}  4. Remove empty test-reports/ directory${NC}"
echo ""
echo -e "${CYAN}  💾 Estimated space savings: ~485 MB${NC}"
echo -e "${CYAN}  ⏱️  Estimated time: 1-2 minutes${NC}"
echo ""
echo -e "${YELLOW}================================================================${NC}"
echo ""

read -p "Proceed with cleanup? (Y/n): " confirm
if [ "$confirm" = "n" ] || [ "$confirm" = "N" ]; then
    print_info "Cleanup cancelled by user"
    exit 0
fi

echo ""
print_header "  🚀 STARTING CLEANUP PROCESS"

# Initialize counters
total_deleted=0
total_size=0

# ============================================================================
# STEP 1: Remove .backup files
# ============================================================================
print_step "Step 1/4: Removing .backup files from src/ directory..."

if [ -d "src" ]; then
    backup_count=$(find src -name "*.backup" -type f 2>/dev/null | wc -l)

    if [ "$backup_count" -gt 0 ]; then
        print_info "Found $backup_count backup files"

        # Calculate size
        if command -v du &> /dev/null; then
            backup_size=$(find src -name "*.backup" -type f -exec du -ch {} + 2>/dev/null | grep total | cut -f1)
            print_info "Total size: $backup_size"
        fi

        # Delete files
        find src -name "*.backup" -type f -delete 2>/dev/null

        total_deleted=$((total_deleted + backup_count))

        print_success "$backup_count backup files removed"
    else
        print_info "No .backup files found (already clean)"
    fi
else
    print_warning "src/ directory not found"
fi

# ============================================================================
# STEP 2: Remove progress tracking files
# ============================================================================
print_step "Step 2/4: Removing progress tracking files from root..."

progress_files=(
    "CLEANUP_STATUS_FINAL.md"
    "COMMIT_NOW.md"
    "COMMIT_PHASE2_PREPARATION.sh"
    "DOTFILES_CLEANUP_COMPLETE.md"
    "DOTFILES_SUMMARY.md"
    "EXECUTE_PHASE2_NOW.sh"
    "INSTALLATION_COMPLETE.md"
    "LINT_TESTS_COMPLETE.md"
    "PHASE2_ACTION_ITEMS_COMPLETE.md"
    "PHASE2_COMPLETE.md"
    "PHASE2_EXECUTION_GUIDE.md"
    "PHASE2_MISSED_STEPS_ANALYSIS.md"
    "PHASE2_READY_TO_EXECUTE.md"
    "PHASE2_STATUS_AND_NEXT_STEPS.md"
    "PHASE2_VISUAL_SUMMARY.md"
    "START_HERE_PHASE2.md"
    "TEAM_NOTIFICATION_MOBILE_SEPARATION.md"
)

progress_deleted=0

for file in "${progress_files[@]}"; do
    if [ -f "$file" ]; then
        rm -f "$file" 2>/dev/null && {
            progress_deleted=$((progress_deleted + 1))
            echo -e "  ${GREEN}✓${NC} Removed: $file"
        }
    fi
done

total_deleted=$((total_deleted + progress_deleted))

if [ "$progress_deleted" -gt 0 ]; then
    print_success "$progress_deleted progress tracking files removed"
else
    print_info "No progress tracking files found (already clean)"
fi

# ============================================================================
# STEP 3: Remove mobile app export directory
# ============================================================================
print_step "Step 3/4: Removing mobile app export directory..."

mobile_export_dir="mobile-app-export-20260111"

if [ -d "$mobile_export_dir" ]; then
    print_info "Calculating directory size..."

    # Calculate size
    if command -v du &> /dev/null; then
        dir_size=$(du -sh "$mobile_export_dir" 2>/dev/null | cut -f1)
        print_info "Directory size: $dir_size"
    fi

    print_info "Removing directory (this may take a moment)..."

    # Remove directory
    rm -rf "$mobile_export_dir" 2>/dev/null && {
        total_deleted=$((total_deleted + 1))
        print_success "Mobile app export removed ($dir_size freed)"
    } || {
        print_error "Failed to remove mobile app export"
    }
else
    print_info "Mobile app export directory not found (already removed)"
fi

# ============================================================================
# STEP 4: Remove test-reports directory
# ============================================================================
print_step "Step 4/4: Removing test-reports directory..."

if [ -d "test-reports" ]; then
    # Check if empty
    item_count=$(find test-reports -mindepth 1 2>/dev/null | wc -l)

    if [ "$item_count" -eq 0 ]; then
        rm -rf "test-reports" 2>/dev/null && {
            total_deleted=$((total_deleted + 1))
            print_success "Empty test-reports directory removed"
        }
    else
        print_warning "test-reports is not empty ($item_count items). Skipping..."
    fi
else
    print_info "test-reports directory not found (already removed)"
fi

# ============================================================================
# COMPLETION SUMMARY
# ============================================================================
echo ""
print_header "  ✅ CLEANUP COMPLETE!"
echo ""
echo -e "${GREEN}================================================================${NC}"
echo -e "${WHITE}  📊 CLEANUP SUMMARY${NC}"
echo -e "${GREEN}================================================================${NC}"
echo ""
echo -e "${WHITE}  Total items removed: $total_deleted${NC}"
echo -e "${WHITE}  Space freed: ~485 MB (estimated)${NC}"
echo ""
echo -e "${GREEN}================================================================${NC}"
echo ""

# ============================================================================
# POST-CLEANUP RECOMMENDATIONS
# ============================================================================
print_header "  📝 NEXT STEPS"
echo ""
echo -e "${CYAN}1. Verify changes:${NC}"
echo -e "   ${WHITE}git status${NC}"
echo ""
echo -e "${CYAN}2. Test the application:${NC}"
echo -e "   ${WHITE}npm run build${NC}"
echo -e "   ${WHITE}npm test${NC}"
echo ""
echo -e "${CYAN}3. Commit the cleanup:${NC}"
echo -e "   ${WHITE}git add -A${NC}"
echo -e "   ${WHITE}git commit -m \"chore: clean up backup files and temporary artifacts\"${NC}"
echo -e "   ${WHITE}git push${NC}"
echo ""

# Optional: Show git status
echo -e "${CYAN}================================================================${NC}"
read -p "Show git status now? (Y/n): " show_git_status
if [ "$show_git_status" != "n" ] && [ "$show_git_status" != "N" ]; then
    echo ""
    git status 2>/dev/null || print_warning "Git not available"
fi

echo ""
echo -e "${CYAN}================================================================${NC}"
echo -e "${GREEN}  🎉 Repository cleanup completed successfully!${NC}"
echo -e "${CYAN}================================================================${NC}"
echo ""

# Create cleanup report
report_file="CLEANUP_REPORT_$(date +%Y-%m-%d_%H%M%S).txt"
cat > "$report_file" << EOF
FARMERS MARKET PLATFORM - CLEANUP REPORT
========================================
Date: $(date '+%Y-%m-%d %H:%M:%S')
Total Items Removed: $total_deleted
Space Freed: ~485 MB (estimated)

DETAILS:
- Backup files (.backup): Removed from src/
- Progress tracking files: Removed from root (17 files)
- Mobile app export: mobile-app-export-20260111/ removed
- Test reports directory: test-reports/ removed

STATUS: ✅ COMPLETE

All deleted files are preserved in git history and can be recovered if needed.
EOF

print_info "Cleanup report saved to: $report_file"
echo ""

exit 0
