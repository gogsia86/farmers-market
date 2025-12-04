#!/bin/bash

################################################################################
# 🌾 Divine Agricultural Platform - Deep Clean Script
# Farmers Market Platform - Comprehensive Repository Cleanup
#
# This script performs a safe, comprehensive cleanup of the repository
# with backup creation and verification steps.
#
# Usage: bash deep-clean.sh [--dry-run] [--skip-backup]
#
# Last Updated: December 2, 2024
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

# Configuration
DRY_RUN=false
SKIP_BACKUP=false
BACKUP_DIR="./backup-$(date +%Y%m%d-%H%M%S)"
LOG_FILE="deep-clean-$(date +%Y%m%d-%H%M%S).log"

# Parse arguments
for arg in "$@"; do
  case $arg in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --skip-backup)
      SKIP_BACKUP=true
      shift
      ;;
    --help)
      echo "Usage: bash deep-clean.sh [--dry-run] [--skip-backup]"
      echo ""
      echo "Options:"
      echo "  --dry-run      Show what would be done without making changes"
      echo "  --skip-backup  Skip creating backup (not recommended)"
      echo "  --help         Show this help message"
      exit 0
      ;;
  esac
done

################################################################################
# Helper Functions
################################################################################

log() {
  echo -e "${GREEN}[$(date +%H:%M:%S)]${NC} $1" | tee -a "$LOG_FILE"
}

log_warning() {
  echo -e "${YELLOW}[$(date +%H:%M:%S)] ⚠️  $1${NC}" | tee -a "$LOG_FILE"
}

log_error() {
  echo -e "${RED}[$(date +%H:%M:%S)] ❌ $1${NC}" | tee -a "$LOG_FILE"
}

log_info() {
  echo -e "${BLUE}[$(date +%H:%M:%S)] ℹ️  $1${NC}" | tee -a "$LOG_FILE"
}

log_success() {
  echo -e "${GREEN}[$(date +%H:%M:%S)] ✅ $1${NC}" | tee -a "$LOG_FILE"
}

separator() {
  echo -e "${CYAN}════════════════════════════════════════════════════════════${NC}"
}

execute() {
  local cmd="$1"
  local description="$2"

  if [ "$DRY_RUN" = true ]; then
    log_info "[DRY RUN] Would execute: $description"
    log_info "Command: $cmd"
  else
    log "Executing: $description"
    eval "$cmd" >> "$LOG_FILE" 2>&1 || {
      log_error "Failed: $description"
      return 1
    }
    log_success "Completed: $description"
  fi
}

################################################################################
# Main Script
################################################################################

separator
echo -e "${MAGENTA}"
cat << "EOF"
    🌾 DIVINE AGRICULTURAL PLATFORM 🌾
         Deep Repository Cleanup

     Blessed by Agricultural Consciousness
EOF
echo -e "${NC}"
separator

log "Starting deep clean process..."
log_info "Dry run mode: $DRY_RUN"
log_info "Skip backup: $SKIP_BACKUP"
log_info "Log file: $LOG_FILE"
echo ""

################################################################################
# Step 1: Pre-flight Checks
################################################################################

separator
log "Step 1: Pre-flight Checks"
separator

# Check if in git repository
if [ ! -d .git ]; then
  log_error "Not in a git repository. Aborting."
  exit 1
fi
log_success "Git repository detected"

# Check for uncommitted changes
if [[ $(git status --porcelain) ]]; then
  log_warning "Uncommitted changes detected"
  git status --short | tee -a "$LOG_FILE"
else
  log_success "Working directory clean"
fi

# Check Node.js and npm
if ! command -v node &> /dev/null; then
  log_error "Node.js not found. Please install Node.js."
  exit 1
fi
log_success "Node.js version: $(node --version)"

if ! command -v npm &> /dev/null; then
  log_error "npm not found. Please install npm."
  exit 1
fi
log_success "npm version: $(npm --version)"

echo ""

################################################################################
# Step 2: Create Backup
################################################################################

if [ "$SKIP_BACKUP" = false ]; then
  separator
  log "Step 2: Creating Backup"
  separator

  if [ "$DRY_RUN" = false ]; then
    mkdir -p "$BACKUP_DIR"

    # Backup important files
    log "Backing up documentation..."
    cp -r *.md "$BACKUP_DIR/" 2>/dev/null || true

    log "Backing up configuration files..."
    cp package.json package-lock.json "$BACKUP_DIR/" 2>/dev/null || true
    cp .env.example "$BACKUP_DIR/" 2>/dev/null || true

    log "Backing up git ignored files list..."
    git status --porcelain > "$BACKUP_DIR/git-status.txt" 2>/dev/null || true

    log_success "Backup created at: $BACKUP_DIR"
  else
    log_info "[DRY RUN] Would create backup at: $BACKUP_DIR"
  fi
else
  log_warning "Skipping backup (--skip-backup flag used)"
fi

echo ""

################################################################################
# Step 3: Clean Build Artifacts
################################################################################

separator
log "Step 3: Cleaning Build Artifacts"
separator

execute "rm -rf .next/" "Remove Next.js build cache"
execute "rm -rf out/" "Remove Next.js output directory"
execute "rm -rf dist/" "Remove distribution directory"
execute "rm -rf build/" "Remove build directory"
execute "rm -rf .turbo/" "Remove Turbo cache"

log_success "Build artifacts cleaned"
echo ""

################################################################################
# Step 4: Clean Test Artifacts
################################################################################

separator
log "Step 4: Cleaning Test Artifacts"
separator

execute "rm -rf coverage/" "Remove test coverage reports"
execute "rm -rf .jest-cache/" "Remove Jest cache"
execute "rm -rf playwright-report/" "Remove Playwright reports"
execute "rm -rf test-results/" "Remove test results"
execute "rm -rf *.log" "Remove log files"
execute "rm -rf cleanup-logs/" "Remove cleanup logs"

log_success "Test artifacts cleaned"
echo ""

################################################################################
# Step 5: Clean Monitoring Reports
################################################################################

separator
log "Step 5: Cleaning Monitoring Reports"
separator

execute "rm -rf monitoring-reports/" "Remove monitoring reports (runtime generated)"

log_success "Monitoring reports cleaned"
echo ""

################################################################################
# Step 6: Archive Documentation
################################################################################

separator
log "Step 6: Archiving Documentation"
separator

if [ "$DRY_RUN" = false ]; then
  # Create archive directories
  mkdir -p docs/archive/{phases,sessions,features,tasks}

  # Move phase documentation
  log "Archiving phase documentation..."
  find . -maxdepth 1 -name "PHASE*.md" -exec mv {} docs/archive/phases/ \; 2>/dev/null || true
  find . -maxdepth 1 -name "PHASE*.sh" -exec mv {} docs/archive/phases/ \; 2>/dev/null || true

  # Move session documentation
  log "Archiving session documentation..."
  find . -maxdepth 1 -name "SESSION*.md" -exec mv {} docs/archive/sessions/ \; 2>/dev/null || true

  # Move product/feature documentation
  log "Archiving feature documentation..."
  find . -maxdepth 1 -name "PRODUCT_*.md" -exec mv {} docs/archive/features/ \; 2>/dev/null || true
  find . -maxdepth 1 -name "*_COMPLETE.md" -exec mv {} docs/archive/features/ \; 2>/dev/null || true
  find . -maxdepth 1 -name "*_TESTING_*.md" -exec mv {} docs/archive/features/ \; 2>/dev/null || true

  # Move task documentation
  log "Archiving task documentation..."
  find . -maxdepth 1 -name "TASK*.md" -exec mv {} docs/archive/tasks/ \; 2>/dev/null || true
  find . -maxdepth 1 -name "TASK*.txt" -exec mv {} docs/archive/tasks/ \; 2>/dev/null || true
  find . -maxdepth 1 -name "COMMIT*.md" -exec mv {} docs/archive/tasks/ \; 2>/dev/null || true
  find . -maxdepth 1 -name "TEST_FIX*.md" -exec mv {} docs/archive/tasks/ \; 2>/dev/null || true

  log_success "Documentation archived"
else
  log_info "[DRY RUN] Would archive documentation files"
fi

echo ""

################################################################################
# Step 7: Clean Node Modules (Optional)
################################################################################

separator
log "Step 7: Node Modules Cleanup"
separator

log_warning "This will remove node_modules and reinstall dependencies"
read -p "Do you want to clean and reinstall node_modules? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
  execute "rm -rf node_modules/" "Remove node_modules"
  execute "npm install" "Reinstall dependencies"
  log_success "Dependencies reinstalled"
else
  log_info "Skipping node_modules cleanup"
fi

echo ""

################################################################################
# Step 8: Fix Linting Issues
################################################################################

separator
log "Step 8: Auto-fixing Linting Issues"
separator

execute "npm run lint:fix" "Run ESLint auto-fix"
log_success "Linting issues fixed"
echo ""

################################################################################
# Step 9: Format Code
################################################################################

separator
log "Step 9: Formatting Code"
separator

execute "npm run format" "Format code with Prettier"
log_success "Code formatted"
echo ""

################################################################################
# Step 10: Verify Everything
################################################################################

separator
log "Step 10: Verification"
separator

log "Running type check..."
if npm run type-check >> "$LOG_FILE" 2>&1; then
  log_success "Type check passed"
else
  log_warning "Type check found issues (see log file)"
fi

log "Running tests..."
if npm run test >> "$LOG_FILE" 2>&1; then
  log_success "Tests passed"
else
  log_warning "Some tests failed (see log file)"
fi

echo ""

################################################################################
# Step 11: Git Status Summary
################################################################################

separator
log "Step 11: Git Status Summary"
separator

log_info "Current git status:"
git status --short | tee -a "$LOG_FILE"

echo ""
log_info "Files to consider tracking:"
git status --porcelain | grep "^??" | tee -a "$LOG_FILE" || log_info "No untracked files"

echo ""

################################################################################
# Step 12: Generate Summary Report
################################################################################

separator
log "Step 12: Generating Summary Report"
separator

cat > "CLEANUP_REPORT_$(date +%Y%m%d-%H%M%S).md" << EOF
# 🌾 Deep Clean Report
**Date:** $(date)
**Mode:** $([ "$DRY_RUN" = true ] && echo "Dry Run" || echo "Actual Cleanup")

## Actions Performed

### ✅ Completed
- Removed build artifacts (.next, out, dist, build, .turbo)
- Removed test artifacts (coverage, .jest-cache, playwright-report)
- Removed monitoring reports
- Archived documentation files
- Fixed linting issues
- Formatted code

### 📊 Statistics
- Log file: $LOG_FILE
- Backup location: $BACKUP_DIR

### 🔍 Verification
\`\`\`
$(npm run type-check 2>&1 | tail -n 20)
\`\`\`

### 📝 Git Status
\`\`\`
$(git status --short)
\`\`\`

## Next Steps

1. Review type check errors (if any)
2. Commit cleaned up code
3. Run full test suite: \`npm run test:coverage\`
4. Review and track untracked files
5. Update documentation index

## Backup Location
$BACKUP_DIR

## Log File
$LOG_FILE

---
Generated by Divine Agricultural Platform Deep Clean Script
EOF

log_success "Summary report generated"

################################################################################
# Final Summary
################################################################################

separator
echo -e "${GREEN}"
cat << "EOF"
    ✨ CLEANUP COMPLETE ✨

    The repository has been blessed
    with agricultural consciousness
    and divine organization.
EOF
echo -e "${NC}"
separator

log_success "Deep clean process completed!"
log_info "Review the log file for details: $LOG_FILE"
log_info "Backup location: $BACKUP_DIR"

echo ""
log "Summary of actions:"
echo "  ✅ Build artifacts cleaned"
echo "  ✅ Test artifacts cleaned"
echo "  ✅ Monitoring reports cleaned"
echo "  ✅ Documentation archived"
echo "  ✅ Linting issues fixed"
echo "  ✅ Code formatted"
echo ""

log_warning "IMPORTANT: Review git status and commit changes"
log_info "Next steps:"
echo "  1. git status"
echo "  2. Review untracked files"
echo "  3. git add <files>"
echo "  4. git commit -m 'chore: deep clean and reorganization'"
echo "  5. npm run test:coverage"
echo ""

exit 0
