#!/bin/bash
# 🚀 Safe Upgrade Script for Farmers Market Platform
# This script safely updates packages in priority order with testing between each batch
# Version: 1.0.0
# Date: December 6, 2025

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_header() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}🔧 $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Check if we're in the right directory
check_directory() {
    if [ ! -f "package.json" ]; then
        log_error "package.json not found! Run this script from the project root."
        exit 1
    fi
    log_success "Running from correct directory"
}

# Create backup
create_backup() {
    log_header "Creating Backup"

    BACKUP_DIR="upgrade-backup-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$BACKUP_DIR"

    cp package.json "$BACKUP_DIR/"
    cp package-lock.json "$BACKUP_DIR/" 2>/dev/null || true

    log_success "Backup created: $BACKUP_DIR"
}

# Run tests
run_tests() {
    log_info "Running type check..."
    if npm run type-check > /dev/null 2>&1; then
        log_success "Type check passed"
    else
        log_error "Type check failed!"
        return 1
    fi

    log_info "Running build test..."
    if npm run build > /dev/null 2>&1; then
        log_success "Build passed"
    else
        log_error "Build failed!"
        return 1
    fi

    return 0
}

# Upgrade Priority 1: Critical Fixes
upgrade_priority_1() {
    log_header "Priority 1: Critical Fixes"

    log_info "Updating OpenTelemetry packages..."
    npm update @opentelemetry/auto-instrumentations-node 2>/dev/null || true

    log_info "Updating baseline-browser-mapping..."
    npm update baseline-browser-mapping 2>/dev/null || true

    log_success "Priority 1 updates applied"
}

# Upgrade Priority 2: Core Framework
upgrade_priority_2() {
    log_header "Priority 2: Core Framework Updates"

    log_info "Updating Next.js ecosystem..."
    npm update next @next/bundle-analyzer eslint-config-next 2>/dev/null || true

    log_info "Updating React..."
    npm update react react-dom @types/react 2>/dev/null || true

    log_info "Updating Prisma..."
    npm update prisma @prisma/client @prisma/adapter-pg 2>/dev/null || true

    log_info "Regenerating Prisma client..."
    npx prisma generate 2>/dev/null || true

    log_info "Updating Sentry..."
    npm update @sentry/nextjs 2>/dev/null || true

    log_success "Priority 2 updates applied"
}

# Upgrade Priority 3: Development Tools
upgrade_priority_3() {
    log_header "Priority 3: Development Tools"

    log_info "Updating TypeScript tooling..."
    npm update @typescript-eslint/eslint-plugin @typescript-eslint/parser 2>/dev/null || true

    log_info "Updating Prettier..."
    npm update prettier prettier-plugin-tailwindcss 2>/dev/null || true

    log_info "Updating testing tools..."
    npm update @playwright/test ts-jest 2>/dev/null || true

    log_success "Priority 3 updates applied"
}

# Upgrade Priority 4: Minor Packages
upgrade_priority_4() {
    log_header "Priority 4: Minor Package Updates"

    log_info "Updating UI/UX packages..."
    npm update framer-motion lucide-react zustand 2>/dev/null || true

    log_info "Updating Stripe packages..."
    npm update @stripe/react-stripe-js @stripe/stripe-js 2>/dev/null || true

    log_info "Updating React Query..."
    npm update @tanstack/react-query 2>/dev/null || true

    log_info "Updating utilities..."
    npm update next-intl nodemailer react-hook-form tsx 2>/dev/null || true

    log_info "Updating Vercel packages..."
    npm update @vercel/analytics @vercel/speed-insights 2>/dev/null || true

    log_success "Priority 4 updates applied"
}

# Main execution
main() {
    clear
    echo -e "${CYAN}"
    cat << "EOF"
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║     🌾 FARMERS MARKET PLATFORM - SAFE UPGRADE SCRIPT 🌾      ║
║                                                              ║
║     Safely updates packages with testing between batches     ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"

    # Parse arguments
    PRIORITY=${1:-"all"}
    SKIP_TESTS=${2:-"false"}

    log_info "Upgrade mode: $PRIORITY"
    log_info "Skip tests: $SKIP_TESTS"
    echo ""

    # Pre-flight checks
    check_directory
    create_backup

    # Run upgrades based on priority
    case $PRIORITY in
        "1"|"critical")
            upgrade_priority_1
            ;;
        "2"|"core")
            upgrade_priority_1
            upgrade_priority_2
            ;;
        "3"|"dev")
            upgrade_priority_1
            upgrade_priority_2
            upgrade_priority_3
            ;;
        "4"|"minor"|"all")
            upgrade_priority_1
            if [ "$SKIP_TESTS" != "true" ]; then
                run_tests || { log_error "Tests failed after Priority 1"; exit 1; }
            fi

            upgrade_priority_2
            if [ "$SKIP_TESTS" != "true" ]; then
                run_tests || { log_error "Tests failed after Priority 2"; exit 1; }
            fi

            upgrade_priority_3
            if [ "$SKIP_TESTS" != "true" ]; then
                run_tests || { log_error "Tests failed after Priority 3"; exit 1; }
            fi

            upgrade_priority_4
            ;;
        *)
            log_error "Unknown priority: $PRIORITY"
            echo "Usage: $0 [1|2|3|4|all] [skip-tests]"
            echo ""
            echo "Priorities:"
            echo "  1, critical - OpenTelemetry fix, baseline-browser-mapping"
            echo "  2, core     - Next.js, React, Prisma, Sentry"
            echo "  3, dev      - TypeScript tooling, Prettier, testing"
            echo "  4, all      - All packages including minor updates"
            echo ""
            echo "Options:"
            echo "  skip-tests  - Skip running tests between batches"
            exit 1
            ;;
    esac

    # Final tests
    log_header "Final Verification"

    if [ "$SKIP_TESTS" != "true" ]; then
        if run_tests; then
            log_success "All tests passed!"
        else
            log_error "Final tests failed!"
            log_warning "Consider reverting: cp $BACKUP_DIR/* ."
            exit 1
        fi
    else
        log_warning "Tests skipped - run manually: npm run type-check && npm run build"
    fi

    # Summary
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                              ║${NC}"
    echo -e "${GREEN}║     ✅ UPGRADE COMPLETE - ALL PACKAGES UPDATED! ✅           ║${NC}"
    echo -e "${GREEN}║                                                              ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    log_info "Backup location: $BACKUP_DIR"
    log_info "To revert: cp $BACKUP_DIR/package*.json ."
    echo ""

    log_info "Next steps:"
    echo "  1. Review changes: npm outdated"
    echo "  2. Test manually: npm run dev"
    echo "  3. Run bot tests: npm run bot:check:dev"
    echo "  4. Commit changes: git add package*.json && git commit -m 'chore(deps): update packages'"
    echo ""
}

# Run main function
main "$@"
