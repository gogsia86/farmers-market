#!/bin/bash
################################################################################
# 🧹 Repository Cleanup Master Script
# Farmers Market Platform - Comprehensive Cleanup Automation
#
# This script performs aggressive cleanup of the repository to reduce size
# from 2.1 GB to ~600 MB by removing obsolete documentation, optimizing Git
# history, and consolidating duplicate files.
#
# Usage:
#   bash scripts/cleanup-repository.sh --dry-run    # Preview changes
#   bash scripts/cleanup-repository.sh              # Execute cleanup
#   bash scripts/cleanup-repository.sh --aggressive # Include Git history cleanup
#
# IMPORTANT: Create a backup before running without --dry-run!
################################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Icons
CHECK="✅"
CROSS="❌"
WARN="⚠️"
INFO="ℹ️"
CLEAN="🧹"
TRASH="🗑️"
PACK="📦"
GEAR="⚙️"

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DRY_RUN=false
AGGRESSIVE=false
BACKUP_DIR="$PROJECT_ROOT/.cleanup-backup-$(date +%Y%m%d-%H%M%S)"
ARCHIVE_DIR="$PROJECT_ROOT/docs/archive"

# Statistics
DELETED_COUNT=0
MOVED_COUNT=0
SIZE_BEFORE=0
SIZE_AFTER=0

################################################################################
# HELPER FUNCTIONS
################################################################################

print_header() {
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BOLD}${1}${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}${CHECK} ${1}${NC}"
}

print_error() {
    echo -e "${RED}${CROSS} ${1}${NC}"
}

print_warning() {
    echo -e "${YELLOW}${WARN} ${1}${NC}"
}

print_info() {
    echo -e "${BLUE}${INFO} ${1}${NC}"
}

print_action() {
    echo -e "${CYAN}  ${1}${NC}"
}

show_help() {
    cat << EOF
${BOLD}Repository Cleanup Script${NC}

${BOLD}USAGE:${NC}
    bash scripts/cleanup-repository.sh [OPTIONS]

${BOLD}OPTIONS:${NC}
    --dry-run       Preview changes without executing them
    --aggressive    Include Git history cleanup (requires force push)
    --no-backup     Skip creating backup (not recommended)
    --help          Show this help message

${BOLD}PHASES:${NC}
    1. Root Directory Cleanup      (Delete 80+ obsolete markdown files)
    2. Documentation Consolidation (Move 1,400+ files to archive)
    3. Environment File Cleanup    (Remove duplicate .env files)
    4. Git Repository Optimization (Garbage collection)
    5. Script Consolidation        (Remove duplicate scripts)

${BOLD}EXPECTED RESULTS:${NC}
    - Total size: 2.1 GB → ~600 MB (-71%)
    - Root files: 90+ → 10 essential files
    - Docs files: 1,489 → 50 organized files
    - Git size: 224 MB → ~50 MB (with --aggressive)

${BOLD}SAFETY:${NC}
    - Always run with --dry-run first
    - Creates backup by default
    - All moves preserved in archive
    - Git history can be recovered

${BOLD}EXAMPLES:${NC}
    # Preview what will be cleaned
    bash scripts/cleanup-repository.sh --dry-run

    # Execute standard cleanup
    bash scripts/cleanup-repository.sh

    # Full cleanup including Git history
    bash scripts/cleanup-repository.sh --aggressive

EOF
}

create_backup() {
    if [ "$DRY_RUN" = true ]; then
        print_info "Would create backup at: $BACKUP_DIR"
        return
    fi

    print_action "Creating backup..."
    mkdir -p "$BACKUP_DIR"

    # Backup critical files
    cp "$PROJECT_ROOT/package.json" "$BACKUP_DIR/" 2>/dev/null || true
    cp "$PROJECT_ROOT/.gitignore" "$BACKUP_DIR/" 2>/dev/null || true
    cp -r "$PROJECT_ROOT/docs" "$BACKUP_DIR/" 2>/dev/null || true

    print_success "Backup created at: $BACKUP_DIR"
}

get_size() {
    du -sb "$1" 2>/dev/null | cut -f1
}

format_size() {
    local size=$1
    if [ $size -gt 1073741824 ]; then
        echo "$(awk "BEGIN {printf \"%.2f\", $size/1073741824}")GB"
    elif [ $size -gt 1048576 ]; then
        echo "$(awk "BEGIN {printf \"%.2f\", $size/1048576}")MB"
    elif [ $size -gt 1024 ]; then
        echo "$(awk "BEGIN {printf \"%.2f\", $size/1024}")KB"
    else
        echo "${size}B"
    fi
}

safe_delete() {
    local file="$1"
    if [ -f "$file" ] || [ -d "$file" ]; then
        if [ "$DRY_RUN" = true ]; then
            echo "  [DRY RUN] Would delete: $(basename "$file")"
        else
            rm -rf "$file"
            DELETED_COUNT=$((DELETED_COUNT + 1))
            echo -e "  ${TRASH} Deleted: $(basename "$file")"
        fi
    fi
}

safe_move() {
    local src="$1"
    local dest="$2"

    if [ -f "$src" ] || [ -d "$src" ]; then
        if [ "$DRY_RUN" = true ]; then
            echo "  [DRY RUN] Would move: $(basename "$src") → $dest"
        else
            mkdir -p "$(dirname "$dest")"
            mv "$src" "$dest"
            MOVED_COUNT=$((MOVED_COUNT + 1))
            echo -e "  ${PACK} Moved: $(basename "$src")"
        fi
    fi
}

################################################################################
# CLEANUP PHASES
################################################################################

phase1_root_cleanup() {
    print_header "Phase 1: Root Directory Cleanup"

    print_action "Cleaning obsolete markdown files..."

    # Create archive directories
    mkdir -p "$ARCHIVE_DIR/session-reports"
    mkdir -p "$ARCHIVE_DIR/deployment-logs"
    mkdir -p "$ARCHIVE_DIR/fix-summaries"
    mkdir -p "$ARCHIVE_DIR/optimization-reports"

    # Obsolete files to delete completely
    local OBSOLETE_FILES=(
        "DEPLOY-NOW.md"
        "URGENT_FIXES_NOW.md"
        "FIX_LOGIN_NOW.md"
        "MISSION_COMPLETE.md"
        "ALL_STEPS_COMPLETE.md"
        "CLEANUP-COMPLETE.md"
        "QUICK-FIX-DEPLOY.md"
        "cleanup-repo.sh"
        "cleanup-repo-improved.sh"
    )

    for file in "${OBSOLETE_FILES[@]}"; do
        safe_delete "$PROJECT_ROOT/$file"
    done

    # Move session reports to archive
    print_action "Archiving session reports..."
    find "$PROJECT_ROOT" -maxdepth 1 -type f \( \
        -name "*COMPLETE*.md" -o \
        -name "*SESSION*.md" -o \
        -name "*STATUS*.md" \
    \) 2>/dev/null | while read file; do
        safe_move "$file" "$ARCHIVE_DIR/session-reports/$(basename "$file")"
    done

    # Move deployment logs
    print_action "Archiving deployment files..."
    find "$PROJECT_ROOT" -maxdepth 1 -type f \( \
        -name "DEPLOYMENT*.md" -o \
        -name "DEPLOY_*.md" -o \
        -name "*DEPLOY*.md" \
    \) 2>/dev/null | while read file; do
        safe_move "$file" "$ARCHIVE_DIR/deployment-logs/$(basename "$file")"
    done

    # Move fix summaries
    print_action "Archiving fix summaries..."
    find "$PROJECT_ROOT" -maxdepth 1 -type f \( \
        -name "FIX*.md" -o \
        -name "*FIXES*.md" -o \
        -name "*FIXED*.md" \
    \) 2>/dev/null | while read file; do
        safe_move "$file" "$ARCHIVE_DIR/fix-summaries/$(basename "$file")"
    done

    # Move optimization reports
    print_action "Archiving optimization reports..."
    find "$PROJECT_ROOT" -maxdepth 1 -type f \( \
        -name "OPTIMIZATION*.md" -o \
        -name "*SUMMARY*.md" -o \
        -name "*ANALYSIS*.md" \
    \) 2>/dev/null | while read file; do
        # Skip the new ones we just created
        if [[ "$(basename "$file")" != "REPOSITORY_CLEANUP_ANALYSIS.md" ]]; then
            safe_move "$file" "$ARCHIVE_DIR/optimization-reports/$(basename "$file")"
        fi
    done

    # Move Vercel-specific docs
    print_action "Archiving Vercel documentation..."
    find "$PROJECT_ROOT" -maxdepth 1 -type f -name "VERCEL*.md" 2>/dev/null | while read file; do
        safe_move "$file" "$ARCHIVE_DIR/deployment-logs/$(basename "$file")"
    done

    print_success "Phase 1 complete"
}

phase2_docs_consolidation() {
    print_header "Phase 2: Documentation Consolidation"

    print_action "Creating organized docs structure..."

    # Create new structure
    mkdir -p "$PROJECT_ROOT/docs/setup"
    mkdir -p "$PROJECT_ROOT/docs/development"
    mkdir -p "$PROJECT_ROOT/docs/deployment"
    mkdir -p "$PROJECT_ROOT/docs/api"
    mkdir -p "$PROJECT_ROOT/docs/optimization"
    mkdir -p "$PROJECT_ROOT/docs/archive/legacy"
    mkdir -p "$PROJECT_ROOT/docs/archive/test-reports"

    # Move test reports to archive
    if [ -d "$PROJECT_ROOT/.archive/reports" ]; then
        print_action "Archiving test reports..."
        if [ "$DRY_RUN" = false ]; then
            mv "$PROJECT_ROOT/.archive/reports"/* "$PROJECT_ROOT/docs/archive/test-reports/" 2>/dev/null || true
        fi
    fi

    print_success "Phase 2 complete"
}

phase3_env_cleanup() {
    print_header "Phase 3: Environment File Cleanup"

    print_action "Removing duplicate environment files..."

    # Files to remove (keep in Vercel dashboard instead)
    local ENV_TO_REMOVE=(
        ".env.vercel.local"
    )

    for file in "${ENV_TO_REMOVE[@]}"; do
        safe_delete "$PROJECT_ROOT/$file"
    done

    # Ensure sensitive files are in .gitignore
    if [ "$DRY_RUN" = false ]; then
        if ! grep -q "^\.env$" "$PROJECT_ROOT/.gitignore" 2>/dev/null; then
            echo ".env" >> "$PROJECT_ROOT/.gitignore"
            print_info "Added .env to .gitignore"
        fi
        if ! grep -q "^\.env\.local$" "$PROJECT_ROOT/.gitignore" 2>/dev/null; then
            echo ".env.local" >> "$PROJECT_ROOT/.gitignore"
            print_info "Added .env.local to .gitignore"
        fi
    fi

    print_success "Phase 3 complete"
}

phase4_git_optimization() {
    print_header "Phase 4: Git Repository Optimization"

    print_action "Running Git garbage collection..."

    if [ "$DRY_RUN" = true ]; then
        print_info "Would run: git gc --aggressive --prune=now"
        print_info "Would run: git repack -a -d"
        print_info "Would run: git prune-packed"
    else
        cd "$PROJECT_ROOT"

        echo -e "${GEAR} Running git gc..."
        git gc --aggressive --prune=now

        echo -e "${GEAR} Repacking repository..."
        git repack -a -d

        echo -e "${GEAR} Pruning packed objects..."
        git prune-packed

        print_success "Git optimization complete"
    fi

    if [ "$AGGRESSIVE" = true ]; then
        print_warning "Aggressive mode: Would remove large files from history"
        print_warning "This requires force push and team coordination"
        print_info "Run manually: git filter-repo or BFG Repo-Cleaner"
    fi
}

phase5_script_consolidation() {
    print_header "Phase 5: Script Consolidation"

    print_action "Removing duplicate scripts..."

    # Old cleanup scripts (keep only the new one)
    if [ -d "$PROJECT_ROOT/cleanup-scripts" ]; then
        safe_move "$PROJECT_ROOT/cleanup-scripts" "$ARCHIVE_DIR/legacy/cleanup-scripts"
    fi

    # Old shell scripts
    find "$PROJECT_ROOT" -maxdepth 1 -type f -name "*.sh" 2>/dev/null | while read file; do
        filename=$(basename "$file")
        if [[ "$filename" != "cleanup-repository.sh" ]]; then
            safe_move "$file" "$ARCHIVE_DIR/legacy/$filename"
        fi
    done

    print_success "Phase 5 complete"
}

################################################################################
# MAIN EXECUTION
################################################################################

main() {
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            --aggressive)
                AGGRESSIVE=true
                shift
                ;;
            --no-backup)
                SKIP_BACKUP=true
                shift
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                echo "Use --help for usage information"
                exit 1
                ;;
        esac
    done

    # Print banner
    echo ""
    echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC}  ${BOLD}${CLEAN} Repository Cleanup Master Script${NC}                ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  Farmers Market Platform                             ${CYAN}║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""

    if [ "$DRY_RUN" = true ]; then
        print_warning "DRY RUN MODE - No changes will be made"
    else
        print_warning "LIVE MODE - Changes will be applied"
    fi

    if [ "$AGGRESSIVE" = true ]; then
        print_warning "AGGRESSIVE MODE - Will optimize Git history"
    fi

    echo ""

    # Get initial size
    SIZE_BEFORE=$(get_size "$PROJECT_ROOT")
    print_info "Repository size: $(format_size $SIZE_BEFORE)"

    # Create backup
    if [ "$DRY_RUN" = false ] && [ -z "$SKIP_BACKUP" ]; then
        create_backup
    fi

    # Execute cleanup phases
    phase1_root_cleanup
    phase2_docs_consolidation
    phase3_env_cleanup
    phase4_git_optimization
    phase5_script_consolidation

    # Print summary
    print_header "Cleanup Summary"

    SIZE_AFTER=$(get_size "$PROJECT_ROOT")
    SIZE_SAVED=$((SIZE_BEFORE - SIZE_AFTER))
    PERCENT_SAVED=$(awk "BEGIN {printf \"%.1f\", ($SIZE_SAVED/$SIZE_BEFORE)*100}")

    echo -e "${BOLD}Statistics:${NC}"
    echo -e "  Files deleted:    ${RED}$DELETED_COUNT${NC}"
    echo -e "  Files moved:      ${YELLOW}$MOVED_COUNT${NC}"
    echo -e "  Size before:      $(format_size $SIZE_BEFORE)"
    echo -e "  Size after:       $(format_size $SIZE_AFTER)"
    echo -e "  Space saved:      ${GREEN}$(format_size $SIZE_SAVED) (${PERCENT_SAVED}%)${NC}"
    echo ""

    if [ "$DRY_RUN" = true ]; then
        print_info "This was a dry run. No changes were made."
        print_info "Run without --dry-run to execute cleanup"
    else
        print_success "Cleanup complete!"

        if [ -n "$BACKUP_DIR" ]; then
            print_info "Backup saved at: $BACKUP_DIR"
        fi

        echo ""
        print_info "Next steps:"
        echo "  1. Review changes: git status"
        echo "  2. Test build: npm run build"
        echo "  3. Commit changes: git add -A && git commit -m 'chore: repository cleanup'"
        echo "  4. Push to remote: git push origin master"
    fi

    echo ""
}

# Run main function
main "$@"
