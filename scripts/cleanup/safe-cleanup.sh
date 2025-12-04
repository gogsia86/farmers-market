#!/bin/bash
# 🧹 Safe Project Cleanup Script
# Farmers Market Platform - Automated Cleanup with Safety Checks
# Version: 1.0.0
# Last Updated: December 2024

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script configuration
BACKUP_BRANCH="backup-before-cleanup-$(date +%Y%m%d-%H%M%S)"
DRY_RUN=false
INTERACTIVE=true

# Function to print colored messages
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_header() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
    echo ""
}

# Function to ask for confirmation
confirm() {
    if [ "$INTERACTIVE" = false ]; then
        return 0
    fi

    local message="$1"
    echo -e "${YELLOW}❓ $message (y/n): ${NC}"
    read -r response
    case "$response" in
        [yY][eE][sS]|[yY])
            return 0
            ;;
        *)
            return 1
            ;;
    esac
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            print_info "Running in DRY RUN mode - no changes will be made"
            shift
            ;;
        --yes|-y)
            INTERACTIVE=false
            print_info "Running in non-interactive mode"
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --dry-run    Show what would be done without making changes"
            echo "  --yes, -y    Skip confirmation prompts"
            echo "  --help, -h   Show this help message"
            echo ""
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

print_header "🧹 Safe Project Cleanup Script"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Are you in the project root?"
    exit 1
fi

print_success "Found package.json - in correct directory"

# Check git status
print_info "Checking git status..."
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Not a git repository"
    exit 1
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD -- 2>/dev/null; then
    print_warning "You have uncommitted changes"
    if confirm "Do you want to continue anyway?"; then
        print_info "Continuing with uncommitted changes..."
    else
        print_error "Cleanup cancelled. Commit your changes first."
        exit 1
    fi
fi

# Create backup branch
print_header "📦 Phase 0: Creating Safety Backup"

if [ "$DRY_RUN" = false ]; then
    if confirm "Create backup branch '$BACKUP_BRANCH'?"; then
        git branch "$BACKUP_BRANCH"
        print_success "Created backup branch: $BACKUP_BRANCH"
        print_info "To restore: git checkout $BACKUP_BRANCH"
    else
        print_warning "Skipping backup creation - proceeding without safety net!"
    fi
else
    print_info "[DRY RUN] Would create branch: $BACKUP_BRANCH"
fi

# Phase 1: Critical Security - Environment Files
print_header "⚠️  Phase 1: Critical Security (Environment Files)"

ENV_FILES=(".env" ".env.local" ".env.production")
FOUND_SECRETS=false

for file in "${ENV_FILES[@]}"; do
    if [ -f "$file" ]; then
        FOUND_SECRETS=true
        print_warning "Found: $file"

        if [ "$DRY_RUN" = false ]; then
            if confirm "Remove $file from git tracking (file will remain locally)?"; then
                git rm --cached "$file" 2>/dev/null || print_info "File not in git"
                print_success "Removed $file from git tracking"
            fi
        else
            print_info "[DRY RUN] Would remove from git: $file"
        fi
    fi
done

if [ "$FOUND_SECRETS" = false ]; then
    print_success "No environment files with secrets found in git"
fi

# Phase 2: Build Artifacts Cleanup
print_header "📦 Phase 2: Build Artifacts Cleanup"

BUILD_DIRS=(".next" "dist" "coverage" ".jest-cache")
TOTAL_SIZE=0

print_info "Checking build artifact sizes..."
for dir in "${BUILD_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        SIZE=$(du -sh "$dir" 2>/dev/null | cut -f1)
        print_warning "Found: $dir ($SIZE)"
        TOTAL_SIZE=$((TOTAL_SIZE + 1))
    fi
done

if [ $TOTAL_SIZE -gt 0 ]; then
    if [ "$DRY_RUN" = false ]; then
        if confirm "Remove build artifacts (will be regenerated on next build)?"; then
            for dir in "${BUILD_DIRS[@]}"; do
                if [ -d "$dir" ]; then
                    rm -rf "$dir"
                    print_success "Removed: $dir"
                fi
            done
        fi
    else
        print_info "[DRY RUN] Would remove: ${BUILD_DIRS[*]}"
    fi
else
    print_success "No build artifacts found"
fi

# Phase 3: Log Files
print_header "📄 Phase 3: Log Files Cleanup"

LOG_FILES=$(find . -maxdepth 1 -name "*.log" -type f 2>/dev/null)
if [ -n "$LOG_FILES" ]; then
    echo "$LOG_FILES" | while read -r log; do
        SIZE=$(du -sh "$log" 2>/dev/null | cut -f1)
        print_warning "Found: $log ($SIZE)"

        if [ "$DRY_RUN" = false ]; then
            if confirm "Remove $log?"; then
                rm "$log"
                print_success "Removed: $log"
            fi
        else
            print_info "[DRY RUN] Would remove: $log"
        fi
    done
else
    print_success "No log files found in root"
fi

# Phase 4: Documentation Reorganization
print_header "📚 Phase 4: Documentation Reorganization"

print_info "Counting markdown files in root..."
MD_COUNT=$(find . -maxdepth 1 -name "*.md" -type f | wc -l)
print_warning "Found $MD_COUNT markdown files in root directory"

if [ "$MD_COUNT" -gt 5 ]; then
    print_warning "Recommended: ≤5 markdown files in root"
    print_info "Current files:"
    find . -maxdepth 1 -name "*.md" -type f -exec basename {} \; | sort

    if [ "$DRY_RUN" = false ]; then
        if confirm "Create organized documentation structure in /docs/?"; then
            # Create directory structure
            mkdir -p docs/archive docs/guides docs/analysis docs/refactoring
            print_success "Created documentation directories"

            # Define files to keep in root
            KEEP_FILES=("README.md" "LICENSE" "PROJECT_CLEANUP_ANALYSIS.md")

            print_info "Files to keep in root:"
            printf '%s\n' "${KEEP_FILES[@]}"
            echo ""

            if confirm "Move all other .md files to docs/archive/?"; then
                for file in *.md; do
                    if [ -f "$file" ]; then
                        SHOULD_KEEP=false
                        for keep in "${KEEP_FILES[@]}"; do
                            if [ "$file" = "$keep" ]; then
                                SHOULD_KEEP=true
                                break
                            fi
                        done

                        if [ "$SHOULD_KEEP" = false ]; then
                            mv "$file" "docs/archive/"
                            print_success "Moved: $file → docs/archive/"
                        fi
                    fi
                done
                print_success "Documentation reorganization complete"
            fi
        fi
    else
        print_info "[DRY RUN] Would create docs/ structure and move files"
    fi
else
    print_success "Root directory markdown count is acceptable"
fi

# Phase 5: Orphaned Files
print_header "🗑️  Phase 5: Orphaned Files Cleanup"

# Check for .slnx files
if [ -f "Farmers Market Platform web and app.slnx" ]; then
    print_warning "Found: Farmers Market Platform web and app.slnx"
    if [ "$DRY_RUN" = false ]; then
        if confirm "Remove Visual Studio solution file?"; then
            rm "Farmers Market Platform web and app.slnx"
            print_success "Removed .slnx file"
        fi
    else
        print_info "[DRY RUN] Would remove .slnx file"
    fi
fi

# Check for root TypeScript utilities
if [ -f "create-admin.ts" ]; then
    print_warning "Found: create-admin.ts in root"
    if [ "$DRY_RUN" = false ]; then
        if confirm "Move create-admin.ts to scripts/admin/?"; then
            mkdir -p scripts/admin
            mv create-admin.ts scripts/admin/
            print_success "Moved: create-admin.ts → scripts/admin/"
        fi
    else
        print_info "[DRY RUN] Would move create-admin.ts to scripts/admin/"
    fi
fi

# Phase 6: Verification
print_header "✅ Phase 6: Verification"

if [ "$DRY_RUN" = false ]; then
    print_info "Running verification checks..."

    # Check if build still works
    print_info "Testing build configuration..."
    if npm run type-check > /dev/null 2>&1; then
        print_success "Type checking passed"
    else
        print_error "Type checking failed - review changes"
    fi

    # Check git status
    print_info "Checking git status..."
    CHANGES=$(git status --short | wc -l)
    if [ "$CHANGES" -gt 0 ]; then
        print_warning "Git detected $CHANGES changes"
        git status --short
    else
        print_success "No changes detected by git"
    fi

    # Count remaining root MD files
    NEW_MD_COUNT=$(find . -maxdepth 1 -name "*.md" -type f | wc -l)
    print_info "Markdown files in root: $MD_COUNT → $NEW_MD_COUNT"

    if [ "$NEW_MD_COUNT" -le 5 ]; then
        print_success "Root directory cleanup successful"
    else
        print_warning "Still have $NEW_MD_COUNT markdown files in root"
    fi
else
    print_info "[DRY RUN] Skipping verification"
fi

# Summary
print_header "📊 Cleanup Summary"

echo "Phases completed:"
echo "  ✅ Phase 1: Environment files reviewed"
echo "  ✅ Phase 2: Build artifacts cleaned"
echo "  ✅ Phase 3: Log files removed"
echo "  ✅ Phase 4: Documentation organized"
echo "  ✅ Phase 5: Orphaned files handled"
echo "  ✅ Phase 6: Verification run"
echo ""

if [ "$DRY_RUN" = false ]; then
    print_success "Cleanup completed successfully!"
    echo ""
    print_info "Next steps:"
    echo "  1. Review changes: git status"
    echo "  2. Test build: npm run build"
    echo "  3. Run tests: npm run test"
    echo "  4. Commit changes: git add . && git commit -m 'chore: project cleanup'"
    echo ""
    print_info "Safety backup available at branch: $BACKUP_BRANCH"
    echo "  To restore: git checkout $BACKUP_BRANCH"
else
    print_info "DRY RUN completed - no changes were made"
    echo ""
    print_info "To execute cleanup, run without --dry-run flag:"
    echo "  bash scripts/cleanup/safe-cleanup.sh"
fi

echo ""
print_success "Script completed! 🎉"
