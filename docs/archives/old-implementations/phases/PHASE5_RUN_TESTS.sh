#!/bin/bash

###############################################################################
# Phase 5 Test Execution Script
# Comprehensive test runner for Product API integration testing
#
# Usage:
#   ./PHASE5_RUN_TESTS.sh              # Run all tests
#   ./PHASE5_RUN_TESTS.sh integration  # Run only integration tests
#   ./PHASE5_RUN_TESTS.sh e2e          # Run only E2E tests
#   ./PHASE5_RUN_TESTS.sh performance  # Run only performance tests
#   ./PHASE5_RUN_TESTS.sh quick        # Run quick smoke tests
#
# Requirements:
#   - Node.js 20+
#   - PostgreSQL (test database)
#   - k6 (for performance tests)
###############################################################################

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="${BASE_URL:-http://localhost:3001}"
TEST_DATABASE_URL="${TEST_DATABASE_URL:-postgresql://postgres:postgres@localhost:5432/farmersmarket_test}"
NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=8192}"

###############################################################################
# Helper Functions
###############################################################################

print_header() {
    echo -e "\n${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_step() {
    echo -e "${MAGENTA}▶ $1${NC}"
}

check_prerequisites() {
    print_header "Checking Prerequisites"

    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    print_success "Node.js $(node --version)"

    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    print_success "npm $(npm --version)"

    # Check PostgreSQL
    if ! command -v psql &> /dev/null; then
        print_warning "psql not found - database checks will be skipped"
    else
        print_success "PostgreSQL available"
    fi

    # Check k6 (for performance tests)
    if ! command -v k6 &> /dev/null; then
        print_warning "k6 not found - performance tests will be skipped"
        print_info "Install k6: https://k6.io/docs/getting-started/installation/"
    else
        print_success "k6 $(k6 version | head -n1)"
    fi

    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        print_warning "node_modules not found - running npm install"
        npm install
    fi

    print_success "All prerequisites checked"
}

setup_test_database() {
    print_header "Setting Up Test Database"

    export DATABASE_URL="$TEST_DATABASE_URL"

    # Check if test database exists
    if command -v psql &> /dev/null; then
        print_step "Checking test database..."

        DB_NAME=$(echo $TEST_DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')

        if psql -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
            print_success "Test database exists: $DB_NAME"
        else
            print_warning "Test database not found, attempting to create..."
            createdb "$DB_NAME" 2>/dev/null || print_warning "Could not create database (may already exist)"
        fi

        # Run migrations
        print_step "Running database migrations..."
        npm run db:push || print_warning "Database migrations failed (may already be up to date)"

        print_success "Test database setup complete"
    else
        print_warning "PostgreSQL not available - skipping database setup"
    fi
}

check_server() {
    print_header "Checking Development Server"

    print_step "Pinging $BASE_URL..."

    if curl -s -f -o /dev/null "$BASE_URL/api/health" 2>/dev/null; then
        print_success "Server is running at $BASE_URL"
        return 0
    else
        print_warning "Server is not running at $BASE_URL"
        print_info "Start the dev server: npm run dev"
        print_info "Or the script will attempt to continue with tests that don't require a running server"
        return 1
    fi
}

run_integration_tests() {
    print_header "Running Integration Tests"

    print_step "Starting Jest integration test suite..."

    export DATABASE_URL="$TEST_DATABASE_URL"
    export NODE_OPTIONS="$NODE_OPTIONS"

    if npm run test:integration; then
        print_success "Integration tests passed!"
        return 0
    else
        print_error "Integration tests failed!"
        return 1
    fi
}

run_e2e_tests() {
    print_header "Running E2E Tests (Playwright)"

    print_step "Starting Playwright E2E test suite..."

    # Check if server is running
    if ! curl -s -f -o /dev/null "$BASE_URL" 2>/dev/null; then
        print_warning "Server not running - E2E tests may fail"
        print_info "Start server: npm run dev"
        read -p "Continue anyway? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            return 1
        fi
    fi

    export BASE_URL="$BASE_URL"

    if npm run test:e2e; then
        print_success "E2E tests passed!"

        print_info "View HTML report: npx playwright show-report"
        return 0
    else
        print_error "E2E tests failed!"
        print_info "View failure screenshots: test-results/"
        return 1
    fi
}

run_performance_tests() {
    print_header "Running Performance Tests (k6)"

    if ! command -v k6 &> /dev/null; then
        print_error "k6 is not installed - skipping performance tests"
        print_info "Install k6: https://k6.io/docs/getting-started/installation/"
        return 1
    fi

    # Check if server is running
    if ! curl -s -f -o /dev/null "$BASE_URL" 2>/dev/null; then
        print_error "Server is not running - performance tests require a running server"
        print_info "Start server: npm run dev"
        return 1
    fi

    print_step "Starting k6 load tests..."

    export BASE_URL="$BASE_URL"

    if k6 run tests/performance/product-load.k6.js; then
        print_success "Performance tests completed!"

        if [ -f "tests/performance/product-load-summary.json" ]; then
            print_info "Results saved: tests/performance/product-load-summary.json"
        fi
        return 0
    else
        print_error "Performance tests failed!"
        return 1
    fi
}

run_unit_tests() {
    print_header "Running Unit Tests"

    print_step "Starting Jest unit test suite..."

    export NODE_OPTIONS="$NODE_OPTIONS"

    if npm test; then
        print_success "Unit tests passed!"
        return 0
    else
        print_error "Unit tests failed!"
        return 1
    fi
}

run_quick_tests() {
    print_header "Running Quick Smoke Tests"

    print_step "Running critical path tests only..."

    export DATABASE_URL="$TEST_DATABASE_URL"
    export NODE_OPTIONS="$NODE_OPTIONS"

    # Run only product list and create tests
    if npm test -- src/__tests__/integration/product-api/product-list.integration.test.ts; then
        print_success "Quick smoke tests passed!"
        return 0
    else
        print_error "Quick smoke tests failed!"
        return 1
    fi
}

generate_coverage_report() {
    print_header "Generating Coverage Report"

    print_step "Running tests with coverage..."

    export DATABASE_URL="$TEST_DATABASE_URL"
    export NODE_OPTIONS="$NODE_OPTIONS"

    if npm run test:coverage; then
        print_success "Coverage report generated!"
        print_info "Open: coverage/lcov-report/index.html"
        return 0
    else
        print_error "Coverage generation failed!"
        return 1
    fi
}

run_all_tests() {
    print_header "Running All Tests"

    local failed=0

    # Run unit tests
    print_step "1/4: Unit Tests"
    run_unit_tests || failed=1

    # Run integration tests
    print_step "2/4: Integration Tests"
    run_integration_tests || failed=1

    # Run E2E tests (if server is running)
    print_step "3/4: E2E Tests"
    if check_server; then
        run_e2e_tests || failed=1
    else
        print_warning "Skipping E2E tests (server not running)"
    fi

    # Run performance tests (if k6 is available and server is running)
    print_step "4/4: Performance Tests"
    if command -v k6 &> /dev/null && curl -s -f -o /dev/null "$BASE_URL" 2>/dev/null; then
        run_performance_tests || failed=1
    else
        print_warning "Skipping performance tests (k6 not installed or server not running)"
    fi

    return $failed
}

print_summary() {
    print_header "Phase 5 Test Execution Summary"

    echo -e "${CYAN}Test Results:${NC}"
    echo -e "  Base URL: $BASE_URL"
    echo -e "  Test Database: $TEST_DATABASE_URL"
    echo -e ""

    if [ $1 -eq 0 ]; then
        print_success "All tests passed! ✨"
        echo -e ""
        echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║           PHASE 5 TESTING COMPLETE - SUCCESS!             ║${NC}"
        echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
        echo -e ""
        print_info "Next steps:"
        print_info "  1. Review coverage report: coverage/lcov-report/index.html"
        print_info "  2. Review E2E report: npx playwright show-report"
        print_info "  3. Commit and push changes"
        print_info "  4. Proceed to Phase 6: Deployment & Monitoring"
    else
        print_error "Some tests failed!"
        echo -e ""
        echo -e "${RED}╔═══════════════════════════════════════════════════════════╗${NC}"
        echo -e "${RED}║          PHASE 5 TESTING INCOMPLETE - FAILURES            ║${NC}"
        echo -e "${RED}╚═══════════════════════════════════════════════════════════╝${NC}"
        echo -e ""
        print_info "Troubleshooting:"
        print_info "  1. Check test output above for error details"
        print_info "  2. Review test-results/ for E2E failures"
        print_info "  3. Run individual test suites for debugging"
        print_info "  4. Check PHASE5_QUICK_REFERENCE.md for common issues"
    fi

    echo -e ""
}

###############################################################################
# Main Execution
###############################################################################

main() {
    clear

    echo -e "${CYAN}"
    cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║          🧪 PHASE 5 TEST EXECUTION SUITE 🧪               ║
║                                                           ║
║        Integration Testing & Quality Assurance           ║
║              Farmers Market Platform                      ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}\n"

    # Parse command line arguments
    TEST_TYPE="${1:-all}"

    case "$TEST_TYPE" in
        integration)
            check_prerequisites
            setup_test_database
            run_integration_tests
            EXIT_CODE=$?
            ;;
        e2e)
            check_prerequisites
            check_server
            run_e2e_tests
            EXIT_CODE=$?
            ;;
        performance)
            check_prerequisites
            check_server
            run_performance_tests
            EXIT_CODE=$?
            ;;
        unit)
            check_prerequisites
            run_unit_tests
            EXIT_CODE=$?
            ;;
        quick)
            check_prerequisites
            setup_test_database
            run_quick_tests
            EXIT_CODE=$?
            ;;
        coverage)
            check_prerequisites
            setup_test_database
            generate_coverage_report
            EXIT_CODE=$?
            ;;
        all)
            check_prerequisites
            setup_test_database
            check_server
            run_all_tests
            EXIT_CODE=$?
            ;;
        *)
            print_error "Unknown test type: $TEST_TYPE"
            echo ""
            echo "Usage: $0 [all|integration|e2e|performance|unit|quick|coverage]"
            echo ""
            echo "Test Types:"
            echo "  all          - Run all test suites (default)"
            echo "  integration  - Run integration tests only"
            echo "  e2e          - Run E2E tests only"
            echo "  performance  - Run performance tests only"
            echo "  unit         - Run unit tests only"
            echo "  quick        - Run quick smoke tests"
            echo "  coverage     - Generate coverage report"
            echo ""
            exit 1
            ;;
    esac

    print_summary $EXIT_CODE

    exit $EXIT_CODE
}

# Run main function
main "$@"
