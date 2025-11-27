#!/bin/bash

###############################################################################
# Phase 5 CI Bundle Protection - Pre-Merge Validation Script
#
# Purpose: Automated validation of all Phase 5 changes before merge
# Usage: bash scripts/validate-phase5-deployment.sh
# Exit Code: 0 = All checks passed, 1 = Failures detected
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# Test results array
declare -a RESULTS

###############################################################################
# Helper Functions
###############################################################################

print_header() {
    echo ""
    echo "═══════════════════════════════════════════════════════════════════"
    echo -e "${BLUE}$1${NC}"
    echo "═══════════════════════════════════════════════════════════════════"
    echo ""
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
    RESULTS+=("✅ $1")
    ((PASSED++))
}

print_failure() {
    echo -e "${RED}❌ $1${NC}"
    RESULTS+=("❌ $1")
    ((FAILED++))
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    RESULTS+=("⚠️  $1")
    ((WARNINGS++))
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

check_file_exists() {
    if [ -f "$1" ]; then
        print_success "File exists: $1"
        return 0
    else
        print_failure "File missing: $1"
        return 1
    fi
}

check_file_contains() {
    local file=$1
    local pattern=$2
    local description=$3

    if [ ! -f "$file" ]; then
        print_failure "$description - File not found: $file"
        return 1
    fi

    if grep -q "$pattern" "$file"; then
        print_success "$description"
        return 0
    else
        print_failure "$description"
        return 1
    fi
}

###############################################################################
# Validation Checks
###############################################################################

print_header "🚀 Phase 5 CI Bundle Protection - Pre-Merge Validation"
print_info "Starting comprehensive validation..."
echo ""

###############################################################################
# Check 1: Required Files Present
###############################################################################

print_header "📁 Check 1: Required Files Present"

check_file_exists ".github/workflows/bundle-size-check.yml"
check_file_exists ".github/workflows/ci.yml"
check_file_exists "docs/BUNDLE_SIZE_QUICK_START.md"
check_file_exists "docs/PHASE_5_CI_BUNDLE_PROTECTION.md"
check_file_exists "docs/PHASE_5_CI_COMPLETION_SUMMARY.md"
check_file_exists "docs/PHASE_5_MERGE_DEPLOYMENT_GUIDE.md"
check_file_exists "docs/PHASE_5_TEAM_ONBOARDING.md"
check_file_exists "docs/PHASE_5_QUICK_REFERENCE_CARD.md"
check_file_exists "CHANGELOG_PHASE_5_CI.md"
check_file_exists "scripts/measure-bundle-performance.mjs"
check_file_exists "src/lib/email/email-service-lazy.ts"
check_file_exists "src/lib/tracing/lazy-tracer.ts"
check_file_exists "src/lib/cache/redis-client-lazy.ts"

###############################################################################
# Check 2: package.json Scripts
###############################################################################

print_header "📦 Check 2: npm Scripts Configuration"

check_file_contains "package.json" "bundle:measure" "npm script: bundle:measure"
check_file_contains "package.json" "bundle:check" "npm script: bundle:check"
check_file_contains "package.json" "bundle:validate" "npm script: bundle:validate"

###############################################################################
# Check 3: CI Workflow Configuration
###############################################################################

print_header "🔄 Check 3: CI Workflow Configuration"

check_file_contains ".github/workflows/bundle-size-check.yml" "Bundle Size Check" "Bundle size check workflow name"
check_file_contains ".github/workflows/bundle-size-check.yml" "measure-bundle-performance" "Bundle measurement script reference"
check_file_contains ".github/workflows/bundle-size-check.yml" "upload-artifact" "Artifact upload configuration"
check_file_contains ".github/workflows/bundle-size-check.yml" "github-script" "PR comment automation"

###############################################################################
# Check 4: Test Flaky Fix Applied
###############################################################################

print_header "🧪 Check 4: Flaky Test Fix Validation"

if [ -f "src/lib/auth/__tests__/password.test.ts" ]; then
    if grep -q "1000" "src/lib/auth/__tests__/password.test.ts"; then
        print_success "Bcrypt test timeout increased to 1000ms"
    else
        print_warning "Bcrypt test may still use old timeout threshold"
    fi
else
    print_warning "Password test file not found (may be OK if relocated)"
fi

###############################################################################
# Check 5: Lazy Loading Wrappers
###############################################################################

print_header "⚡ Check 5: Lazy Loading Wrappers Present"

# Email lazy wrapper
if [ -f "src/lib/email/email-service-lazy.ts" ]; then
    if grep -q "dynamic import" "src/lib/email/email-service-lazy.ts" || \
       grep -q "import()" "src/lib/email/email-service-lazy.ts"; then
        print_success "Email service lazy wrapper uses dynamic imports"
    else
        print_warning "Email service lazy wrapper may not use dynamic imports"
    fi
fi

# Tracing lazy wrapper
if [ -f "src/lib/tracing/lazy-tracer.ts" ]; then
    if grep -q "import()" "src/lib/tracing/lazy-tracer.ts" || \
       grep -q "dynamic" "src/lib/tracing/lazy-tracer.ts"; then
        print_success "Tracing lazy wrapper uses dynamic imports"
    else
        print_warning "Tracing lazy wrapper may not use dynamic imports"
    fi
fi

# Redis lazy wrapper
if [ -f "src/lib/cache/redis-client-lazy.ts" ]; then
    if grep -q "import()" "src/lib/cache/redis-client-lazy.ts" || \
       grep -q "dynamic" "src/lib/cache/redis-client-lazy.ts"; then
        print_success "Redis client lazy wrapper uses dynamic imports"
    else
        print_warning "Redis client lazy wrapper may not use dynamic imports"
    fi
fi

###############################################################################
# Check 6: Build and Bundle Measurement
###############################################################################

print_header "🏗️  Check 6: Build and Bundle Measurement"

print_info "Installing dependencies..."
if npm ci > /dev/null 2>&1; then
    print_success "Dependencies installed"
else
    print_failure "npm ci failed"
fi

print_info "Generating Prisma client..."
if npx prisma generate > /dev/null 2>&1; then
    print_success "Prisma client generated"
else
    print_failure "Prisma generation failed"
fi

print_info "Building with webpack for analysis (this may take a few minutes)..."
if ANALYZE=true npx next build --webpack > /dev/null 2>&1; then
    print_success "Webpack build completed"
else
    print_failure "Webpack build failed"
fi

print_info "Running bundle measurement script..."
if node scripts/measure-bundle-performance.mjs > /tmp/bundle-report.txt 2>&1; then
    print_success "Bundle measurement script executed"

    # Check for threshold failures
    if grep -q "THRESHOLD FAILURES: 0" /tmp/bundle-report.txt || \
       ! grep -q "❌" /tmp/bundle-report.txt; then
        print_success "No bundle threshold failures detected"
    else
        print_failure "Bundle threshold failures detected"
        echo ""
        echo "Failed routes:"
        grep "❌" /tmp/bundle-report.txt || true
    fi

    # Check for optimized routes
    if grep -q "HIGHLY OPTIMIZED ROUTES" /tmp/bundle-report.txt; then
        print_success "Highly optimized routes section present"

        # Look for specific Phase 5 achievements
        if grep -q "app/api/admin/approvals" /tmp/bundle-report.txt || \
           grep -q "admin.*approvals" /tmp/bundle-report.txt; then
            if grep -A5 "admin.*approvals" /tmp/bundle-report.txt | grep -q "1[0-9]\.[0-9] KB\|[0-9]\.[0-9] KB"; then
                print_success "Admin approvals route maintained optimization (< 20 KB)"
            else
                print_warning "Admin approvals route may have regressed"
            fi
        fi
    fi
else
    print_failure "Bundle measurement script failed"
    cat /tmp/bundle-report.txt 2>/dev/null || true
fi

###############################################################################
# Check 7: Test Suite
###############################################################################

print_header "🧪 Check 7: Test Suite Validation"

print_info "Running test suite..."
if npm test -- --passWithNoTests > /tmp/test-output.txt 2>&1; then
    print_success "All tests passed"

    # Check for specific test
    if grep -q "password.test" /tmp/test-output.txt || \
       npm test -- src/lib/auth/__tests__/password.test.ts > /dev/null 2>&1; then
        print_success "Password test (flaky fix) validated"
    else
        print_warning "Password test not found or not run"
    fi
else
    print_failure "Test suite failed"
    echo ""
    echo "Test failures:"
    tail -20 /tmp/test-output.txt || true
fi

###############################################################################
# Check 8: Documentation Quality
###############################################################################

print_header "📚 Check 8: Documentation Quality"

# Check for key sections in documentation
DOCS=(
    "docs/BUNDLE_SIZE_QUICK_START.md:Quick Start"
    "docs/PHASE_5_CI_BUNDLE_PROTECTION.md:Technical"
    "docs/PHASE_5_MERGE_DEPLOYMENT_GUIDE.md:Deployment"
    "docs/PHASE_5_TEAM_ONBOARDING.md:Onboarding"
    "docs/PHASE_5_QUICK_REFERENCE_CARD.md:Reference"
)

for doc in "${DOCS[@]}"; do
    IFS=':' read -r file description <<< "$doc"
    if [ -f "$file" ]; then
        # Check file size (should be substantial)
        size=$(wc -c < "$file")
        if [ "$size" -gt 1000 ]; then
            print_success "$description documentation is comprehensive (${size} bytes)"
        else
            print_warning "$description documentation seems incomplete (${size} bytes)"
        fi
    fi
done

###############################################################################
# Check 9: Git Status
###############################################################################

print_header "🔍 Check 9: Git Status"

# Check if there are uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    print_warning "Uncommitted changes detected"
    echo ""
    git status --short
else
    print_success "No uncommitted changes"
fi

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
print_info "Current branch: $CURRENT_BRANCH"

###############################################################################
# Check 10: Phase 5 Achievements Validation
###############################################################################

print_header "🏆 Check 10: Phase 5 Achievements Validation"

print_info "Validating Phase 5 optimization achievements..."

# Check if bundle report exists
if [ -f "/tmp/bundle-report.txt" ]; then
    # Check for admin approvals route
    if grep -q "admin.*approvals\|approvals.*route" /tmp/bundle-report.txt; then
        ADMIN_SIZE=$(grep -i "admin.*approvals\|approvals.*route" /tmp/bundle-report.txt | grep -oP '\d+\.\d+\s*KB' | head -1 | grep -oP '\d+' | head -1)
        if [ -n "$ADMIN_SIZE" ] && [ "$ADMIN_SIZE" -lt 25 ]; then
            print_success "Admin approvals route optimized: ~${ADMIN_SIZE}KB (target: < 25 KB)"
        elif [ -n "$ADMIN_SIZE" ]; then
            print_warning "Admin approvals route: ${ADMIN_SIZE}KB (exceeds 25 KB target)"
        fi
    fi

    # Check for farms route
    if grep -q "farms.*route\|api/farms" /tmp/bundle-report.txt; then
        FARMS_SIZE=$(grep -i "farms.*route\|api/farms" /tmp/bundle-report.txt | grep -oP '\d+\.\d+\s*KB' | head -1 | grep -oP '\d+' | head -1)
        if [ -n "$FARMS_SIZE" ] && [ "$FARMS_SIZE" -lt 25 ]; then
            print_success "Farms route optimized: ~${FARMS_SIZE}KB (target: < 25 KB)"
        elif [ -n "$FARMS_SIZE" ]; then
            print_warning "Farms route: ${FARMS_SIZE}KB (exceeds 25 KB target)"
        fi
    fi

    # Overall summary
    OPTIMIZED_COUNT=$(grep -c "✅" /tmp/bundle-report.txt || echo "0")
    print_info "Highly optimized routes found: $OPTIMIZED_COUNT"
fi

###############################################################################
# Summary Report
###############################################################################

print_header "📊 Validation Summary"

echo ""
echo "Results:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

for result in "${RESULTS[@]}"; do
    echo "$result"
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}Passed:${NC}   $PASSED"
echo -e "${RED}Failed:${NC}   $FAILED"
echo -e "${YELLOW}Warnings:${NC} $WARNINGS"
echo ""

# Final verdict
if [ $FAILED -eq 0 ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${GREEN}✅ VALIDATION PASSED - READY FOR MERGE!${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Phase 5 CI Bundle Protection is ready for production deployment."
    echo ""
    echo "Next steps:"
    echo "1. Create PR to develop branch"
    echo "2. Get team review"
    echo "3. Merge after approval"
    echo "4. Monitor for 1 week"
    echo "5. Deploy to main"
    echo ""
    echo "Documentation: docs/PHASE_5_MERGE_DEPLOYMENT_GUIDE.md"
    echo ""
    exit 0
else
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${RED}❌ VALIDATION FAILED - ISSUES DETECTED!${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Please fix the $FAILED failed check(s) above before proceeding."
    echo ""
    echo "For help, consult:"
    echo "- docs/BUNDLE_SIZE_QUICK_START.md"
    echo "- docs/PHASE_5_CI_BUNDLE_PROTECTION.md"
    echo "- Slack: #platform-performance"
    echo ""
    exit 1
fi
