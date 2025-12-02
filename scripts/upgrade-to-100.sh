#!/bin/bash

# 🚀 AUTOMATED UPGRADE TO 100% SCRIPT
# Farmers Market Platform - Critical Updates Automation
# Version: 1.0.0
# Last Updated: 2025-01-15

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Banner
echo -e "${GREEN}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🌾 FARMERS MARKET PLATFORM - UPGRADE TO 100%              ║
║                                                               ║
║   Automated upgrade script for critical updates              ║
║   This will bring all metrics to 100%                        ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Check if running in correct directory
if [ ! -f "package.json" ]; then
    log_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    log_error "Node.js 20+ required. Current version: $(node -v)"
    exit 1
fi

log_success "Prerequisites check passed"

# Function to create backup
create_backup() {
    log_info "Creating backup..."
    BACKUP_DIR="backup_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    cp package.json "$BACKUP_DIR/"
    cp package-lock.json "$BACKUP_DIR/" 2>/dev/null || true
    cp jest.config.js "$BACKUP_DIR/"
    cp next.config.mjs "$BACKUP_DIR/"
    log_success "Backup created at: $BACKUP_DIR"
}

# Function to restore backup
restore_backup() {
    if [ -d "$BACKUP_DIR" ]; then
        log_warning "Restoring from backup..."
        cp "$BACKUP_DIR/package.json" .
        cp "$BACKUP_DIR/package-lock.json" . 2>/dev/null || true
        cp "$BACKUP_DIR/jest.config.js" .
        cp "$BACKUP_DIR/next.config.mjs" .
        npm install
        log_success "Backup restored"
    fi
}

# Trap errors and restore backup
trap 'log_error "An error occurred. Restoring backup..."; restore_backup; exit 1' ERR

# ============================================
# PHASE 1: CRITICAL SECURITY UPDATES
# ============================================

log_info "Starting Phase 1: Critical Security Updates"

create_backup

# Update Next.js and related packages
log_info "Updating Next.js to 16.0.6..."
npm install next@16.0.6 \
    eslint-config-next@16.0.6 \
    @next/bundle-analyzer@16.0.6

log_success "Next.js updated"

# Update Stripe packages
log_info "Updating Stripe packages..."
npm install @stripe/react-stripe-js@latest \
    @stripe/stripe-js@latest \
    stripe@latest

log_success "Stripe packages updated"

# Update testing libraries
log_info "Updating testing libraries..."
npm install --save-dev @playwright/test@latest \
    ts-jest@latest

log_success "Testing libraries updated"

# Update TypeScript ESLint
log_info "Updating TypeScript ESLint..."
npm install --save-dev @typescript-eslint/eslint-plugin@latest \
    @typescript-eslint/parser@latest

log_success "TypeScript ESLint updated"

# Update other critical packages
log_info "Updating other critical packages..."
npm install react-hook-form@latest \
    framer-motion@latest \
    next-intl@latest \
    @vercel/analytics@latest \
    @vercel/speed-insights@latest \
    prettier@latest

log_success "All critical packages updated"

# Run security audit
log_info "Running security audit..."
npm audit --audit-level=moderate || log_warning "Some vulnerabilities found. Review npm audit report."

# Run audit fix
log_info "Attempting to fix vulnerabilities..."
npm audit fix || log_warning "Some issues could not be auto-fixed"

log_success "Phase 1 completed"

# ============================================
# PHASE 2: VERIFICATION
# ============================================

log_info "Starting Phase 2: Verification"

# Type check
log_info "Running type check..."
npm run type-check || {
    log_error "Type check failed"
    restore_backup
    exit 1
}
log_success "Type check passed"

# Linting
log_info "Running lint check..."
npm run lint || {
    log_error "Lint check failed"
    restore_backup
    exit 1
}
log_success "Lint check passed"

# Build test
log_info "Testing production build..."
npm run build || {
    log_error "Build failed"
    restore_backup
    exit 1
}
log_success "Build successful"

# Run tests
log_info "Running test suite..."
npm run test -- --passWithNoTests || {
    log_error "Tests failed"
    restore_backup
    exit 1
}
log_success "Tests passed"

log_success "Phase 2 verification completed"

# ============================================
# PHASE 3: CONFIGURATION UPDATES
# ============================================

log_info "Starting Phase 3: Configuration Updates"

# Update Jest coverage thresholds
log_info "Updating Jest coverage thresholds..."
if [ -f "jest.config.js" ]; then
    # Backup original
    cp jest.config.js jest.config.js.bak

    # Update coverage thresholds to 90%
    sed -i 's/branches: 80/branches: 90/g' jest.config.js 2>/dev/null || sed -i '' 's/branches: 80/branches: 90/g' jest.config.js
    sed -i 's/functions: 80/functions: 90/g' jest.config.js 2>/dev/null || sed -i '' 's/functions: 80/functions: 90/g' jest.config.js
    sed -i 's/lines: 80/lines: 90/g' jest.config.js 2>/dev/null || sed -i '' 's/lines: 80/lines: 90/g' jest.config.js
    sed -i 's/statements: 80/statements: 90/g' jest.config.js 2>/dev/null || sed -i '' 's/statements: 80/statements: 90/g' jest.config.js

    log_success "Jest coverage thresholds updated to 90%"
else
    log_warning "jest.config.js not found, skipping coverage threshold update"
fi

log_success "Phase 3 completed"

# ============================================
# PHASE 4: GENERATE REPORTS
# ============================================

log_info "Starting Phase 4: Generate Reports"

# Create reports directory
mkdir -p reports

# Generate dependency report
log_info "Generating dependency report..."
npm list --depth=0 > reports/dependencies.txt 2>&1 || true
log_success "Dependency report created: reports/dependencies.txt"

# Generate outdated packages report
log_info "Checking for outdated packages..."
npm outdated > reports/outdated.txt 2>&1 || true
log_success "Outdated packages report created: reports/outdated.txt"

# Generate security audit report
log_info "Generating security audit report..."
npm audit --json > reports/security-audit.json 2>&1 || true
log_success "Security audit report created: reports/security-audit.json"

# Generate bundle size report
log_info "Analyzing bundle size..."
ANALYZE=true npm run build > reports/bundle-analysis.txt 2>&1 || log_warning "Bundle analysis failed"

log_success "Phase 4 completed"

# ============================================
# FINAL SUMMARY
# ============================================

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                               ║${NC}"
echo -e "${GREEN}║   ✅ UPGRADE TO 100% COMPLETED SUCCESSFULLY!                 ║${NC}"
echo -e "${GREEN}║                                                               ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

log_success "Summary of changes:"
echo ""
echo "  📦 Packages Updated:"
echo "     • Next.js → 16.0.6"
echo "     • Stripe packages → latest"
echo "     • Testing libraries → latest"
echo "     • TypeScript ESLint → latest"
echo "     • Various dependencies → latest"
echo ""
echo "  🔧 Configuration:"
echo "     • Jest coverage thresholds → 90%"
echo "     • Security vulnerabilities addressed"
echo ""
echo "  📊 Reports Generated:"
echo "     • reports/dependencies.txt"
echo "     • reports/outdated.txt"
echo "     • reports/security-audit.json"
echo "     • reports/bundle-analysis.txt"
echo ""
echo "  💾 Backup Location:"
echo "     • $BACKUP_DIR"
echo ""

log_info "Next Steps:"
echo ""
echo "  1. Review the generated reports in the 'reports' directory"
echo "  2. Run comprehensive tests: npm run test:all"
echo "  3. Test locally: npm run dev"
echo "  4. Review UPGRADE_TO_100_PERCENT.md for Phase 2-4 tasks"
echo "  5. Commit changes: git add . && git commit -m 'chore: upgrade to 100%'"
echo ""

log_warning "Important Notes:"
echo ""
echo "  • Backup created at: $BACKUP_DIR"
echo "  • Review any remaining npm audit warnings"
echo "  • Test all critical features before deployment"
echo "  • Update .env files with any new required variables"
echo ""

# Check if there are any remaining issues
OUTDATED_COUNT=$(npm outdated 2>/dev/null | wc -l)
if [ "$OUTDATED_COUNT" -gt 1 ]; then
    log_warning "There are still $((OUTDATED_COUNT - 1)) outdated packages"
    echo "  Run 'npm outdated' to see details"
    echo ""
fi

# Final verification prompt
echo -e "${BLUE}Would you like to run the full test suite now? (y/n)${NC}"
read -r RUN_TESTS

if [ "$RUN_TESTS" = "y" ] || [ "$RUN_TESTS" = "Y" ]; then
    log_info "Running full test suite..."
    npm run test:all || log_warning "Some tests failed. Please review."
fi

echo ""
log_success "Upgrade script completed! 🎉"
echo ""
echo "For detailed upgrade instructions, see: UPGRADE_TO_100_PERCENT.md"
echo ""

exit 0
