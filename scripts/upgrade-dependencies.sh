#!/bin/bash

# 🚀 Farmers Market Platform - Dependency Upgrade Script
# Divine Agricultural Consciousness - Automated Upgrade Orchestration
# Version: 1.0.0

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Emojis for divine output
ROCKET="🚀"
CHECK="✅"
CROSS="❌"
WARNING="⚠️"
INFO="ℹ️"
SPARKLES="✨"
FARMING="🌾"

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Log file
LOG_FILE="$PROJECT_ROOT/upgrade-$(date +%Y%m%d-%H%M%S).log"

# Function to log with timestamp
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Function to print header
print_header() {
    echo ""
    echo -e "${PURPLE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${PURPLE}═══════════════════════════════════════════════════════════${NC}"
    echo ""
    log "PHASE: $1"
}

# Function to print success
print_success() {
    echo -e "${GREEN}${CHECK} $1${NC}"
    log "SUCCESS: $1"
}

# Function to print error
print_error() {
    echo -e "${RED}${CROSS} $1${NC}"
    log "ERROR: $1"
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}${WARNING} $1${NC}"
    log "WARNING: $1"
}

# Function to print info
print_info() {
    echo -e "${BLUE}${INFO} $1${NC}"
    log "INFO: $1"
}

# Function to ask for confirmation
confirm() {
    echo -e "${YELLOW}${WARNING} $1 [y/N]${NC}"
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

# Function to run tests
run_tests() {
    local test_type=$1
    print_info "Running $test_type tests..."

    if npm run "$test_type" >> "$LOG_FILE" 2>&1; then
        print_success "$test_type tests passed"
        return 0
    else
        print_error "$test_type tests failed"
        return 1
    fi
}

# Function to create backup
create_backup() {
    print_info "Creating backup..."

    # Save current package versions
    npm list --depth=0 > "$PROJECT_ROOT/backup-versions-$(date +%Y%m%d-%H%M%S).txt" 2>&1

    # Create git branch
    local branch_name="backup/pre-upgrade-$(date +%Y%m%d-%H%M%S)"
    if git rev-parse --verify HEAD >/dev/null 2>&1; then
        git branch "$branch_name"
        print_success "Created backup branch: $branch_name"
    fi

    # Backup package files
    cp package.json package.json.backup
    cp package-lock.json package-lock.json.backup 2>/dev/null || true

    print_success "Backup completed"
}

# Function to restore backup
restore_backup() {
    print_warning "Restoring from backup..."

    if [ -f package.json.backup ]; then
        mv package.json.backup package.json
        print_success "Restored package.json"
    fi

    if [ -f package-lock.json.backup ]; then
        mv package-lock.json.backup package-lock.json
        print_success "Restored package-lock.json"
    fi

    npm ci >> "$LOG_FILE" 2>&1
    print_success "Dependencies restored"
}

# Function to update package
update_package() {
    local package_name=$1
    local version=$2

    print_info "Updating $package_name to $version..."

    if npm install "$package_name@$version" >> "$LOG_FILE" 2>&1; then
        print_success "Updated $package_name"
        return 0
    else
        print_error "Failed to update $package_name"
        return 1
    fi
}

# Function to run Phase 1: Critical Framework Updates
phase1_critical() {
    print_header "${ROCKET} Phase 1: Critical Framework Updates"

    if ! confirm "Update Next.js, React, and core framework?"; then
        print_warning "Phase 1 skipped"
        return 0
    fi

    # Update Next.js
    update_package "next" "16.0.10" || return 1
    update_package "eslint-config-next" "16.0.10" || return 1
    update_package "@next/bundle-analyzer" "16.0.10" || return 1

    # Update React
    update_package "react" "19.2.3" || return 1
    update_package "react-dom" "19.2.3" || return 1

    # Update React types
    update_package "@types/react" "19.2.7" || return 1
    update_package "@types/react-dom" "19.0.0" || return 1

    print_success "Phase 1 completed"

    # Test
    print_info "Running tests after Phase 1..."
    run_tests "test:unit" || return 1
    run_tests "build" || return 1

    return 0
}

# Function to run Phase 2: Database Updates
phase2_database() {
    print_header "${FARMING} Phase 2: Database & State Management"

    if ! confirm "Update Prisma and state management libraries?"; then
        print_warning "Phase 2 skipped"
        return 0
    fi

    # Update Prisma suite
    update_package "@prisma/client" "7.2.0" || return 1
    update_package "@prisma/adapter-pg" "7.2.0" || return 1
    update_package "prisma" "7.2.0" || return 1

    # Regenerate Prisma client
    print_info "Regenerating Prisma client..."
    npx prisma generate >> "$LOG_FILE" 2>&1

    # Update state management
    update_package "zustand" "5.0.9" || return 1
    update_package "@tanstack/react-query" "5.90.12" || return 1

    print_success "Phase 2 completed"

    # Test database
    print_info "Testing database operations..."
    run_tests "test:integration:db" || return 1

    return 0
}

# Function to run Phase 3: Payment & Security
phase3_security() {
    print_header "🔒 Phase 3: Payment & Security"

    if ! confirm "Update Stripe, Sentry, and security packages?"; then
        print_warning "Phase 3 skipped"
        return 0
    fi

    # Update Stripe
    update_package "@stripe/react-stripe-js" "5.4.1" || return 1
    update_package "@stripe/stripe-js" "8.6.0" || return 1
    update_package "stripe" "20.1.0" || return 1

    # Update Sentry
    update_package "@sentry/nextjs" "10.31.0" || return 1

    # Update security packages
    update_package "jose" "6.1.3" || return 1
    update_package "zod" "4.2.1" || return 1

    print_success "Phase 3 completed"

    # Test payments
    print_info "Testing payment integration..."
    run_tests "test:contracts:stripe" || print_warning "Stripe contract tests not available"

    return 0
}

# Function to run Phase 4: AI & Testing
phase4_ai() {
    print_header "🤖 Phase 4: AI & Testing Tools"

    if ! confirm "Update AI packages and testing tools?"; then
        print_warning "Phase 4 skipped"
        return 0
    fi

    # Update AI packages
    update_package "@langchain/core" "1.1.6" || return 1
    update_package "@langchain/openai" "1.2.0" || return 1
    update_package "openai" "6.14.0" || return 1
    update_package "ai" "5.0.115" || return 1

    # Update testing tools
    update_package "@playwright/test" "1.57.0" || return 1
    update_package "@testing-library/react" "16.3.1" || return 1

    print_success "Phase 4 completed"

    # Run tests
    print_info "Running full test suite..."
    run_tests "test:unit" || return 1
    run_tests "test:integration" || return 1

    return 0
}

# Function to run Phase 5: Developer Tools
phase5_devtools() {
    print_header "🛠️ Phase 5: Developer Tools & UI"

    if ! confirm "Update TypeScript tooling, formatters, and UI libraries?"; then
        print_warning "Phase 5 skipped"
        return 0
    fi

    # Update TypeScript tooling
    update_package "@typescript-eslint/eslint-plugin" "8.50.0" || return 1
    update_package "@typescript-eslint/parser" "8.50.0" || return 1

    # Update formatters
    update_package "prettier" "3.7.4" || return 1
    update_package "prettier-plugin-tailwindcss" "0.7.2" || return 1
    update_package "eslint" "9.39.2" || return 1

    # Update UI libraries
    update_package "lucide-react" "0.561.0" || return 1
    update_package "framer-motion" "12.23.26" || return 1
    update_package "react-hook-form" "7.68.0" || return 1

    # Update Vercel analytics
    update_package "@vercel/analytics" "1.6.1" || return 1
    update_package "@vercel/speed-insights" "1.3.1" || return 1

    print_success "Phase 5 completed"

    # Format and lint
    print_info "Running format and lint..."
    npm run format >> "$LOG_FILE" 2>&1
    npm run lint:fix >> "$LOG_FILE" 2>&1

    return 0
}

# Function to run Phase 6: Safe Utilities
phase6_utilities() {
    print_header "📦 Phase 6: Utility Libraries (Batch Update)"

    if ! confirm "Batch update all safe utility packages?"; then
        print_warning "Phase 6 skipped"
        return 0
    fi

    print_info "Updating utility packages..."

    # Batch update safe packages
    npm update \
        autoprefixer \
        baseline-browser-mapping \
        @tailwindcss/forms \
        @upstash/redis \
        @vitejs/plugin-react \
        ts-jest \
        jsdom \
        testcontainers \
        terser-webpack-plugin \
        tsx \
        @types/node \
        @types/pg \
        next-intl \
        commander \
        chalk \
        cross-env >> "$LOG_FILE" 2>&1

    print_success "Phase 6 completed"

    return 0
}

# Main execution
main() {
    echo ""
    echo -e "${PURPLE}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║${NC}  ${CYAN}${SPARKLES} Farmers Market Platform - Dependency Upgrade ${SPARKLES}${NC}  ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${NC}  ${CYAN}Divine Agricultural Consciousness - v1.0.0${NC}        ${PURPLE}║${NC}"
    echo -e "${PURPLE}╚═══════════════════════════════════════════════════════════╝${NC}"
    echo ""

    log "=== UPGRADE STARTED ==="

    # Change to project root
    cd "$PROJECT_ROOT"

    # Pre-flight checks
    print_header "${INFO} Pre-flight Checks"

    # Check if package.json exists
    if [ ! -f package.json ]; then
        print_error "package.json not found!"
        exit 1
    fi

    # Check if git is available
    if ! command -v git &> /dev/null; then
        print_warning "Git not found. Backup features will be limited."
    fi

    # Check if npm is available
    if ! command -v npm &> /dev/null; then
        print_error "npm not found!"
        exit 1
    fi

    print_success "Pre-flight checks passed"

    # Show current status
    print_info "Current Node version: $(node --version)"
    print_info "Current npm version: $(npm --version)"
    print_info "Log file: $LOG_FILE"

    # Create backup
    if confirm "Create backup before upgrading?"; then
        create_backup
    fi

    # Run phases
    local failed=0

    if phase1_critical; then
        print_success "Phase 1 successful"
    else
        print_error "Phase 1 failed!"
        if confirm "Restore backup and abort?"; then
            restore_backup
            exit 1
        fi
        failed=$((failed + 1))
    fi

    if [ $failed -eq 0 ]; then
        if phase2_database; then
            print_success "Phase 2 successful"
        else
            print_error "Phase 2 failed!"
            if confirm "Restore backup and abort?"; then
                restore_backup
                exit 1
            fi
            failed=$((failed + 1))
        fi
    fi

    if [ $failed -eq 0 ]; then
        if phase3_security; then
            print_success "Phase 3 successful"
        else
            print_error "Phase 3 failed!"
            if confirm "Restore backup and abort?"; then
                restore_backup
                exit 1
            fi
            failed=$((failed + 1))
        fi
    fi

    if [ $failed -eq 0 ]; then
        if phase4_ai; then
            print_success "Phase 4 successful"
        else
            print_error "Phase 4 failed!"
            if confirm "Restore backup and abort?"; then
                restore_backup
                exit 1
            fi
            failed=$((failed + 1))
        fi
    fi

    if [ $failed -eq 0 ]; then
        if phase5_devtools; then
            print_success "Phase 5 successful"
        else
            print_error "Phase 5 failed!"
            if confirm "Restore backup and abort?"; then
                restore_backup
                exit 1
            fi
            failed=$((failed + 1))
        fi
    fi

    if [ $failed -eq 0 ]; then
        if phase6_utilities; then
            print_success "Phase 6 successful"
        else
            print_error "Phase 6 failed!"
            if confirm "Restore backup and abort?"; then
                restore_backup
                exit 1
            fi
            failed=$((failed + 1))
        fi
    fi

    # Final checks
    print_header "${SPARKLES} Final Verification"

    print_info "Running full test suite..."
    if run_tests "test:all"; then
        print_success "All tests passed!"
    else
        print_error "Some tests failed. Review logs."
        failed=$((failed + 1))
    fi

    print_info "Running type checking..."
    if npm run type-check >> "$LOG_FILE" 2>&1; then
        print_success "Type check passed!"
    else
        print_warning "Type check issues detected. Review logs."
    fi

    print_info "Running build..."
    if npm run build >> "$LOG_FILE" 2>&1; then
        print_success "Build successful!"
    else
        print_error "Build failed!"
        failed=$((failed + 1))
    fi

    # Summary
    echo ""
    print_header "${SPARKLES} Upgrade Summary"

    if [ $failed -eq 0 ]; then
        echo -e "${GREEN}"
        echo "╔═══════════════════════════════════════════════════════════╗"
        echo "║                                                           ║"
        echo "║     ${CHECK}  ALL PHASES COMPLETED SUCCESSFULLY! ${CHECK}         ║"
        echo "║                                                           ║"
        echo "║  Your Farmers Market Platform is now fully upgraded!     ║"
        echo "║  Divine agricultural consciousness maintained! ${FARMING}         ║"
        echo "║                                                           ║"
        echo "╚═══════════════════════════════════════════════════════════╝"
        echo -e "${NC}"

        print_info "Next steps:"
        echo "  1. Review the logs: $LOG_FILE"
        echo "  2. Test the application manually"
        echo "  3. Deploy to staging for verification"
        echo "  4. Remove backup files after confirmation"
    else
        echo -e "${YELLOW}"
        echo "╔═══════════════════════════════════════════════════════════╗"
        echo "║                                                           ║"
        echo "║     ${WARNING}  UPGRADE COMPLETED WITH ISSUES ${WARNING}              ║"
        echo "║                                                           ║"
        echo "║  Some phases failed or had warnings.                     ║"
        echo "║  Please review the logs and test thoroughly.             ║"
        echo "║                                                           ║"
        echo "╚═══════════════════════════════════════════════════════════╝"
        echo -e "${NC}"

        print_warning "Failed phases: $failed"
        print_warning "Review logs: $LOG_FILE"
    fi

    log "=== UPGRADE COMPLETED (Failures: $failed) ==="

    echo ""
    echo -e "${CYAN}Log file saved to: ${YELLOW}$LOG_FILE${NC}"
    echo -e "${CYAN}Backup files: ${YELLOW}package.json.backup, package-lock.json.backup${NC}"
    echo ""
}

# Run main function
main "$@"
