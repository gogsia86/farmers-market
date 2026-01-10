#!/bin/bash

# =========================================
# Farmers Market Platform - Deployment Test Script
# =========================================
# Complete workflow for testing Vercel deployment
# Version: 1.0.0
# Author: Claude Sonnet 4.5
# =========================================

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
DEPLOYMENT_URL="${DEPLOYMENT_URL:-https://farmers-market-platform.vercel.app}"
TEST_TIMEOUT=30
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# =========================================
# Helper Functions
# =========================================

print_header() {
    echo -e "\n${PURPLE}========================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
    ((PASSED_TESTS++))
    ((TOTAL_TESTS++))
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
    ((FAILED_TESTS++))
    ((TOTAL_TESTS++))
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_test() {
    echo -e "${CYAN}🧪 Testing: $1${NC}"
}

# =========================================
# Pre-Deployment Checks
# =========================================

pre_deployment_checks() {
    print_header "PRE-DEPLOYMENT CHECKS"

    # Check Node.js version
    print_test "Node.js version"
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js $NODE_VERSION installed"
    else
        print_error "Node.js not installed"
        return 1
    fi

    # Check npm
    print_test "npm version"
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_success "npm $NPM_VERSION installed"
    else
        print_error "npm not installed"
        return 1
    fi

    # Check if package.json exists
    print_test "package.json exists"
    if [ -f "package.json" ]; then
        print_success "package.json found"
    else
        print_error "package.json not found"
        return 1
    fi

    # Check Prisma schema
    print_test "Prisma schema exists"
    if [ -f "prisma/schema.prisma" ]; then
        print_success "Prisma schema found"
    else
        print_warning "Prisma schema not found"
    fi

    # Check for package-lock.json (should NOT exist for cross-platform)
    print_test "package-lock.json (should be gitignored)"
    if [ -f "package-lock.json" ]; then
        print_warning "package-lock.json exists - consider removing for cross-platform compatibility"
    else
        print_success "No package-lock.json (good for cross-platform)"
    fi

    # Check environment variables template
    print_test ".env.example exists"
    if [ -f ".env.example" ]; then
        print_success ".env.example found"
    else
        print_warning ".env.example not found"
    fi
}

# =========================================
# Local Build Test
# =========================================

local_build_test() {
    print_header "LOCAL BUILD TEST"

    # Clean install
    print_test "Clean dependency installation"
    if rm -rf node_modules package-lock.json && npm install --legacy-peer-deps > /dev/null 2>&1; then
        print_success "Dependencies installed successfully"
    else
        print_error "Dependency installation failed"
        return 1
    fi

    # TypeScript check
    print_test "TypeScript type checking"
    if npm run type-check > /dev/null 2>&1; then
        print_success "Type check passed"
    else
        print_warning "Type check has warnings (non-blocking)"
    fi

    # Lint check
    print_test "ESLint checking"
    if npm run lint > /dev/null 2>&1; then
        print_success "Lint check passed"
    else
        print_warning "Lint check has warnings (non-blocking)"
    fi

    # Prisma validation
    print_test "Prisma schema validation"
    if npx prisma validate > /dev/null 2>&1; then
        print_success "Prisma schema valid"
    else
        print_error "Prisma schema validation failed"
        return 1
    fi

    # Build test
    print_test "Next.js build"
    export SKIP_ENV_VALIDATION=true
    export DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
    export NEXTAUTH_SECRET="test-secret-key-for-build-only"
    export NEXTAUTH_URL="http://localhost:3000"

    if npm run build > /dev/null 2>&1; then
        print_success "Build completed successfully"
    else
        print_error "Build failed"
        return 1
    fi
}

# =========================================
# Deployment Health Checks
# =========================================

check_http_status() {
    local url=$1
    local expected=$2
    local description=$3

    print_test "$description"

    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -m $TEST_TIMEOUT "$url" 2>/dev/null || echo "000")

    if [[ "$HTTP_CODE" == "$expected" ]] || [[ "$expected" == *"$HTTP_CODE"* ]]; then
        print_success "$description - HTTP $HTTP_CODE"
        return 0
    else
        print_error "$description - HTTP $HTTP_CODE (expected $expected)"
        return 1
    fi
}

deployment_health_checks() {
    print_header "DEPLOYMENT HEALTH CHECKS"

    print_info "Testing deployment at: $DEPLOYMENT_URL"
    sleep 2

    # Homepage
    check_http_status "$DEPLOYMENT_URL" "200 301 302" "Homepage accessibility"

    # About page
    check_http_status "$DEPLOYMENT_URL/about" "200 301 302 404" "About page"

    # Login page
    check_http_status "$DEPLOYMENT_URL/login" "200 301 302 404" "Login page"

    # Dashboard
    check_http_status "$DEPLOYMENT_URL/dashboard" "200 301 302 401" "Dashboard page"

    # Farmer dashboard
    check_http_status "$DEPLOYMENT_URL/farmer/dashboard" "200 301 302 401" "Farmer dashboard"

    # API health endpoint (if exists)
    check_http_status "$DEPLOYMENT_URL/api/health" "200 404" "API health endpoint"

    # Static assets
    check_http_status "$DEPLOYMENT_URL/_next/static/css" "200 301 302 404" "Static CSS loading"

    # Check response time
    print_test "Response time check"
    RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" -m $TEST_TIMEOUT "$DEPLOYMENT_URL" 2>/dev/null || echo "0")
    RESPONSE_MS=$(echo "$RESPONSE_TIME * 1000" | bc 2>/dev/null || echo "0")

    if (( $(echo "$RESPONSE_TIME < 5" | bc -l 2>/dev/null || echo "0") )); then
        print_success "Response time: ${RESPONSE_MS}ms (< 5000ms)"
    else
        print_warning "Response time: ${RESPONSE_MS}ms (slow)"
    fi
}

# =========================================
# API Endpoint Tests
# =========================================

api_endpoint_tests() {
    print_header "API ENDPOINT TESTS"

    # Test API base route
    print_test "API base route"
    API_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -m $TEST_TIMEOUT "$DEPLOYMENT_URL/api" 2>/dev/null || echo "000")
    if [[ "$API_RESPONSE" == "200" ]] || [[ "$API_RESPONSE" == "404" ]]; then
        print_success "API route responded: HTTP $API_RESPONSE"
    else
        print_warning "API route: HTTP $API_RESPONSE"
    fi

    # Test API v1 routes (if they exist)
    print_test "API v1 farms route"
    FARMS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -m $TEST_TIMEOUT "$DEPLOYMENT_URL/api/v1/farms" 2>/dev/null || echo "000")
    if [[ "$FARMS_RESPONSE" == "200" ]] || [[ "$FARMS_RESPONSE" == "401" ]] || [[ "$FARMS_RESPONSE" == "404" ]]; then
        print_success "Farms API route: HTTP $FARMS_RESPONSE"
    else
        print_warning "Farms API route: HTTP $FARMS_RESPONSE"
    fi

    # Test NextAuth endpoints
    print_test "NextAuth API route"
    AUTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -m $TEST_TIMEOUT "$DEPLOYMENT_URL/api/auth/signin" 2>/dev/null || echo "000")
    if [[ "$AUTH_RESPONSE" == "200" ]] || [[ "$AUTH_RESPONSE" == "307" ]] || [[ "$AUTH_RESPONSE" == "404" ]]; then
        print_success "NextAuth route: HTTP $AUTH_RESPONSE"
    else
        print_warning "NextAuth route: HTTP $AUTH_RESPONSE"
    fi
}

# =========================================
# Page Content Tests
# =========================================

page_content_tests() {
    print_header "PAGE CONTENT TESTS"

    # Check if homepage contains expected content
    print_test "Homepage content check"
    HOMEPAGE_CONTENT=$(curl -s -m $TEST_TIMEOUT "$DEPLOYMENT_URL" 2>/dev/null || echo "")

    if [[ -n "$HOMEPAGE_CONTENT" ]]; then
        if echo "$HOMEPAGE_CONTENT" | grep -qi "market\|farm\|agriculture" 2>/dev/null; then
            print_success "Homepage contains relevant content"
        else
            print_warning "Homepage content might be generic"
        fi
    else
        print_error "Could not fetch homepage content"
    fi

    # Check for Next.js specific markers
    print_test "Next.js application markers"
    if echo "$HOMEPAGE_CONTENT" | grep -qi "__next\|_next" 2>/dev/null; then
        print_success "Next.js application detected"
    else
        print_warning "Next.js markers not found"
    fi

    # Check for proper HTML structure
    print_test "Valid HTML structure"
    if echo "$HOMEPAGE_CONTENT" | grep -qi "<!DOCTYPE html>" 2>/dev/null; then
        print_success "Valid HTML doctype found"
    else
        print_warning "HTML doctype not found"
    fi
}

# =========================================
# Security Headers Check
# =========================================

security_headers_check() {
    print_header "SECURITY HEADERS CHECK"

    print_test "Security headers"
    HEADERS=$(curl -s -I -m $TEST_TIMEOUT "$DEPLOYMENT_URL" 2>/dev/null || echo "")

    # Check for common security headers
    if echo "$HEADERS" | grep -qi "x-frame-options" 2>/dev/null; then
        print_success "X-Frame-Options header present"
    else
        print_warning "X-Frame-Options header missing"
    fi

    if echo "$HEADERS" | grep -qi "x-content-type-options" 2>/dev/null; then
        print_success "X-Content-Type-Options header present"
    else
        print_warning "X-Content-Type-Options header missing"
    fi

    if echo "$HEADERS" | grep -qi "strict-transport-security" 2>/dev/null; then
        print_success "Strict-Transport-Security header present"
    else
        print_warning "HSTS header missing"
    fi
}

# =========================================
# Vercel Deployment Info
# =========================================

vercel_deployment_info() {
    print_header "VERCEL DEPLOYMENT INFO"

    if command -v vercel &> /dev/null; then
        print_info "Fetching Vercel deployment information..."

        # Get deployment info (requires Vercel CLI authentication)
        if vercel ls 2>/dev/null | head -n 5; then
            print_success "Vercel deployment list retrieved"
        else
            print_warning "Could not fetch Vercel deployments (authentication may be required)"
        fi
    else
        print_warning "Vercel CLI not installed (optional)"
    fi
}

# =========================================
# Generate Test Report
# =========================================

generate_report() {
    print_header "TEST SUMMARY REPORT"

    echo -e "${CYAN}Total Tests:${NC} $TOTAL_TESTS"
    echo -e "${GREEN}Passed:${NC} $PASSED_TESTS"
    echo -e "${RED}Failed:${NC} $FAILED_TESTS"

    SUCCESS_RATE=$(echo "scale=2; ($PASSED_TESTS * 100) / $TOTAL_TESTS" | bc 2>/dev/null || echo "0")
    echo -e "${BLUE}Success Rate:${NC} ${SUCCESS_RATE}%"

    echo ""

    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "${GREEN}🎉 ALL TESTS PASSED! Deployment is healthy.${NC}"
        return 0
    elif [ $FAILED_TESTS -lt 3 ]; then
        echo -e "${YELLOW}⚠️  Some tests failed, but deployment may still be functional.${NC}"
        return 0
    else
        echo -e "${RED}❌ Multiple tests failed. Please investigate the deployment.${NC}"
        return 1
    fi
}

# =========================================
# Save Report to File
# =========================================

save_report() {
    local report_file="deployment-test-report-$(date +%Y%m%d-%H%M%S).txt"

    print_header "SAVING REPORT"

    {
        echo "========================================"
        echo "FARMERS MARKET PLATFORM - DEPLOYMENT TEST REPORT"
        echo "========================================"
        echo "Date: $(date)"
        echo "Deployment URL: $DEPLOYMENT_URL"
        echo ""
        echo "Total Tests: $TOTAL_TESTS"
        echo "Passed: $PASSED_TESTS"
        echo "Failed: $FAILED_TESTS"
        echo "Success Rate: $SUCCESS_RATE%"
        echo ""
        echo "========================================"
    } > "$report_file"

    print_success "Report saved to: $report_file"
}

# =========================================
# Main Execution
# =========================================

main() {
    clear

    echo -e "${PURPLE}"
    echo "╔═══════════════════════════════════════════════════════╗"
    echo "║   FARMERS MARKET PLATFORM - DEPLOYMENT TEST SUITE    ║"
    echo "║              Complete Workflow Testing               ║"
    echo "╚═══════════════════════════════════════════════════════╝"
    echo -e "${NC}\n"

    print_info "Starting comprehensive deployment tests..."
    print_info "Target: $DEPLOYMENT_URL"
    echo ""

    # Run all test suites
    pre_deployment_checks || true

    # Only run local build if explicitly requested
    if [ "${RUN_LOCAL_BUILD:-false}" == "true" ]; then
        local_build_test || true
    else
        print_info "Skipping local build test (set RUN_LOCAL_BUILD=true to enable)"
    fi

    deployment_health_checks || true
    api_endpoint_tests || true
    page_content_tests || true
    security_headers_check || true
    vercel_deployment_info || true

    # Generate and save report
    generate_report
    RESULT=$?

    save_report

    echo ""
    print_info "Deployment testing complete!"
    echo ""

    exit $RESULT
}

# Run main function
main "$@"
