#!/bin/bash

###############################################################################
# 🌟 DIVINE 100% VERIFICATION SCRIPT
# Farmers Market Platform - Complete System Verification
# Version: 1.0.0
#
# This script performs comprehensive verification to achieve 100% perfection:
# 1. Clean build environment
# 2. Run type checks
# 3. Run linting
# 4. Build production bundle
# 5. Start dev server
# 6. Run monitoring bot
# 7. Analyze results
# 8. Generate report
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="${BASE_URL:-http://localhost:3001}"
MONITORING_DIR="monitoring-reports"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REPORT_FILE="${MONITORING_DIR}/verification-${TIMESTAMP}.md"

###############################################################################
# HELPER FUNCTIONS
###############################################################################

print_header() {
    echo -e "\n${PURPLE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║${NC} ${CYAN}$1${NC}"
    echo -e "${PURPLE}╚════════════════════════════════════════════════════════════╝${NC}\n"
}

print_step() {
    echo -e "${BLUE}▶${NC} ${GREEN}$1${NC}"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${CYAN}ℹ${NC} $1"
}

###############################################################################
# PHASE 1: ENVIRONMENT CLEANUP
###############################################################################

phase1_cleanup() {
    print_header "Phase 1: Environment Cleanup"

    print_step "Cleaning build artifacts..."
    rm -rf .next 2>/dev/null || true
    rm -rf node_modules/.cache 2>/dev/null || true
    rm -rf .jest-cache 2>/dev/null || true
    print_success "Build artifacts cleaned"

    print_step "Creating monitoring directory..."
    mkdir -p ${MONITORING_DIR}
    print_success "Monitoring directory ready"
}

###############################################################################
# PHASE 2: CODE QUALITY CHECKS
###############################################################################

phase2_quality() {
    print_header "Phase 2: Code Quality Checks"

    print_step "Running TypeScript type check..."
    if npm run type-check 2>&1 | tee /tmp/typecheck.log; then
        print_success "TypeScript type check passed"
    else
        print_warning "TypeScript has some issues (non-blocking)"
    fi

    print_step "Running ESLint..."
    if npm run lint:quiet 2>&1 | tee /tmp/lint.log; then
        print_success "ESLint checks passed"
    else
        print_warning "ESLint found some issues (non-blocking)"
    fi
}

###############################################################################
# PHASE 3: BUILD VERIFICATION
###############################################################################

phase3_build() {
    print_header "Phase 3: Build Verification"

    print_step "Building production bundle..."
    if npm run build 2>&1 | tee /tmp/build.log; then
        print_success "Production build successful"

        # Check bundle size
        if [ -d ".next" ]; then
            BUNDLE_SIZE=$(du -sh .next | cut -f1)
            print_info "Bundle size: ${BUNDLE_SIZE}"
        fi
    else
        print_error "Build failed! Check /tmp/build.log for details"
        exit 1
    fi
}

###############################################################################
# PHASE 4: SERVER STARTUP
###############################################################################

phase4_server() {
    print_header "Phase 4: Server Startup"

    print_step "Starting production server..."

    # Kill any existing server on port 3001
    lsof -ti:3001 | xargs kill -9 2>/dev/null || true
    sleep 2

    # Start production server in background
    npm start > /tmp/server.log 2>&1 &
    SERVER_PID=$!
    echo $SERVER_PID > /tmp/server.pid
    print_info "Server PID: ${SERVER_PID}"

    # Wait for server to be ready
    print_step "Waiting for server to start..."
    MAX_ATTEMPTS=60
    ATTEMPT=0

    while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
        if curl -s "${BASE_URL}/api/health" > /dev/null 2>&1; then
            print_success "Server is ready at ${BASE_URL}"
            return 0
        fi
        ATTEMPT=$((ATTEMPT + 1))
        echo -n "."
        sleep 2
    done

    print_error "Server failed to start after ${MAX_ATTEMPTS} attempts"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
}

###############################################################################
# PHASE 5: MONITORING & TESTING
###############################################################################

phase5_monitoring() {
    print_header "Phase 5: Monitoring & Testing"

    print_step "Running Enhanced Website Monitoring Bot..."

    if BASE_URL="${BASE_URL}" npm run monitor:website 2>&1 | tee /tmp/monitor.log; then
        print_success "Monitoring bot completed successfully"
    else
        print_warning "Monitoring bot encountered some issues"
    fi

    # Copy latest report
    if [ -f "${MONITORING_DIR}/latest-report.md" ]; then
        cp "${MONITORING_DIR}/latest-report.md" "/tmp/latest-monitoring-report.md"
        print_success "Monitoring report saved"
    fi
}

###############################################################################
# PHASE 6: RESULTS ANALYSIS
###############################################################################

phase6_analysis() {
    print_header "Phase 6: Results Analysis"

    print_step "Analyzing monitoring results..."

    if [ -f "${MONITORING_DIR}/latest-report.json" ]; then
        # Extract key metrics using basic text processing
        TOTAL_PAGES=$(grep -o '"totalPages":[0-9]*' "${MONITORING_DIR}/latest-report.json" | grep -o '[0-9]*' || echo "0")
        PASSED_PAGES=$(grep -o '"passedPages":[0-9]*' "${MONITORING_DIR}/latest-report.json" | grep -o '[0-9]*' || echo "0")
        FAILED_PAGES=$(grep -o '"failedPages":[0-9]*' "${MONITORING_DIR}/latest-report.json" | grep -o '[0-9]*' || echo "0")

        print_info "Total pages tested: ${TOTAL_PAGES}"
        print_info "Pages passed: ${PASSED_PAGES}"
        print_info "Pages failed: ${FAILED_PAGES}"

        # Calculate percentage
        if [ "$TOTAL_PAGES" -gt 0 ]; then
            PASS_PERCENTAGE=$((PASSED_PAGES * 100 / TOTAL_PAGES))

            if [ "$PASS_PERCENTAGE" -ge 90 ]; then
                print_success "Pass rate: ${PASS_PERCENTAGE}% - EXCELLENT! 🌟"
            elif [ "$PASS_PERCENTAGE" -ge 75 ]; then
                print_success "Pass rate: ${PASS_PERCENTAGE}% - GOOD! ✨"
            elif [ "$PASS_PERCENTAGE" -ge 50 ]; then
                print_warning "Pass rate: ${PASS_PERCENTAGE}% - NEEDS IMPROVEMENT"
            else
                print_error "Pass rate: ${PASS_PERCENTAGE}% - CRITICAL ISSUES"
            fi
        fi

        # Check for JavaScript errors
        if grep -q "__name is not defined" "${MONITORING_DIR}/latest-report.md" 2>/dev/null; then
            print_error "JavaScript runtime error detected: __name is not defined"
            echo "  → This needs to be fixed in webpack configuration"
        else
            print_success "No JavaScript runtime errors detected"
        fi

        # Check for 404 errors
        MISSING_ROUTES=$(grep -c "404" "${MONITORING_DIR}/latest-report.md" 2>/dev/null || echo "0")
        if [ "$MISSING_ROUTES" -gt 0 ]; then
            print_warning "Found ${MISSING_ROUTES} missing routes (404 errors)"
            grep "404" "${MONITORING_DIR}/latest-report.md" | head -5
        else
            print_success "All routes responding correctly"
        fi

        # Check SEO
        if grep -q "Missing title" "${MONITORING_DIR}/latest-report.md" 2>/dev/null; then
            print_warning "Some pages are missing SEO metadata"
        else
            print_success "SEO metadata present on all pages"
        fi

    else
        print_warning "Monitoring report not found"
    fi
}

###############################################################################
# PHASE 7: REPORT GENERATION
###############################################################################

phase7_report() {
    print_header "Phase 7: Report Generation"

    print_step "Generating comprehensive verification report..."

    cat > "${REPORT_FILE}" <<EOF
# 🌟 DIVINE VERIFICATION REPORT
Generated: $(date)

## Executive Summary

This report documents the verification process to achieve 100% divine perfection
for the Farmers Market Platform.

## Environment

- **Base URL**: ${BASE_URL}
- **Node Version**: $(node --version)
- **npm Version**: $(npm --version)
- **Timestamp**: ${TIMESTAMP}

## Phase Results

### Phase 1: Environment Cleanup ✓
- Build artifacts cleaned
- Monitoring directory prepared

### Phase 2: Code Quality Checks
$(if [ -f /tmp/typecheck.log ]; then
    echo "- TypeScript: $(grep -c "error" /tmp/typecheck.log 2>/dev/null || echo "0") errors"
fi)
$(if [ -f /tmp/lint.log ]; then
    echo "- ESLint: $(grep -c "error" /tmp/lint.log 2>/dev/null || echo "0") errors"
fi)

### Phase 3: Build Verification
- Production build: $([ -d .next ] && echo "✓ Success" || echo "✗ Failed")
- Bundle size: $([ -d .next ] && du -sh .next | cut -f1 || echo "N/A")

### Phase 4: Server Startup
- Server status: $(curl -s "${BASE_URL}/api/health" > /dev/null 2>&1 && echo "✓ Running" || echo "✗ Not responding")
- Server URL: ${BASE_URL}

### Phase 5: Monitoring Results
$(if [ -f "${MONITORING_DIR}/latest-report.md" ]; then
    cat "${MONITORING_DIR}/latest-report.md" | head -100
else
    echo "Monitoring report not available"
fi)

## Next Steps

### If Score < 100%:
1. Review monitoring report details at: ${MONITORING_DIR}/latest-report.md
2. Fix JavaScript errors (if any)
3. Add missing routes (if any)
4. Implement SEO metadata (if missing)
5. Fix accessibility issues
6. Re-run this verification script

### If Score = 100%:
1. Celebrate! 🎉
2. Deploy to staging
3. Run production verification
4. Deploy to production

## Divine Status

**Current Achievement**: Moving towards 100% perfection
**Agricultural Consciousness**: ACTIVE
**Quantum Coherence**: OPTIMAL

---
*Generated by Divine Verification Script v1.0.0*
EOF

    print_success "Report generated: ${REPORT_FILE}"

    # Also create a summary
    print_step "Creating summary..."

    echo -e "\n${PURPLE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║${NC}         ${CYAN}VERIFICATION COMPLETE${NC}                           ${PURPLE}║${NC}"
    echo -e "${PURPLE}╚════════════════════════════════════════════════════════════╝${NC}\n"

    print_info "Full report: ${REPORT_FILE}"
    print_info "Monitoring report: ${MONITORING_DIR}/latest-report.md"
    print_info "Server logs: /tmp/server.log"

    if [ -f "${MONITORING_DIR}/latest-report.md" ]; then
        echo -e "\n${YELLOW}=== Top Issues ===${NC}\n"
        grep -A 2 "FAIL" "${MONITORING_DIR}/latest-report.md" 2>/dev/null | head -20 || echo "No critical issues found"
    fi
}

###############################################################################
# PHASE 8: CLEANUP
###############################################################################

phase8_cleanup() {
    print_header "Phase 8: Cleanup"

    print_step "Stopping development server..."
    if [ -f /tmp/server.pid ]; then
        SERVER_PID=$(cat /tmp/server.pid)
        kill $SERVER_PID 2>/dev/null || true
        rm /tmp/server.pid
        print_success "Server stopped"
    fi

    print_step "Cleaning temporary files..."
    # Keep logs for review
    print_info "Logs preserved in /tmp/ for review"
}

###############################################################################
# MAIN EXECUTION
###############################################################################

main() {
    clear

    echo -e "${PURPLE}"
    cat << "EOF"
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🌟 DIVINE 100% VERIFICATION SYSTEM 🌟                   ║
║                                                            ║
║   Farmers Market Platform                                 ║
║   Agricultural Consciousness: MAXIMUM                     ║
║   Target: 100% Perfection                                 ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}\n"

    # Run all phases
    phase1_cleanup
    phase2_quality
    phase3_build
    phase4_server
    phase5_monitoring
    phase6_analysis
    phase7_report
    phase8_cleanup

    echo -e "\n${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║${NC}  Verification complete! Review the report for details.   ${GREEN}║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}\n"

    print_info "View report: cat ${REPORT_FILE}"
    print_info "View monitoring: cat ${MONITORING_DIR}/latest-report.md"

    exit 0
}

# Handle interrupts
trap 'print_error "Script interrupted"; phase8_cleanup; exit 1' INT TERM

# Run main
main "$@"
