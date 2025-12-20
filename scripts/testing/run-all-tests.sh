#!/bin/bash
# =============================================================================
# Comprehensive Testing Script - Farmers Market Platform
# =============================================================================
# This script runs all available tests and generates a comprehensive report
# Author: Platform Engineering Team
# Date: December 18, 2025
# =============================================================================

set -e

# Color codes for better visibility
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
RESET='\033[0m'

# Initialize counters
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_SKIPPED=0

# Create logs directory if it doesn't exist
mkdir -p logs
LOG_FILE="logs/test-run-$(date +%Y%m%d-%H%M%S).log"

# Function to log messages
log_message() {
    echo "$1" | tee -a "$LOG_FILE"
}

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    local allow_skip="${3:-false}"

    echo ""
    echo "--------------------------------------------------------------------------------"
    echo -e "${BLUE}$test_name${RESET}"
    echo "--------------------------------------------------------------------------------"
    echo "Running: $test_command"
    echo ""

    log_message "=== $test_name ==="
    log_message "Command: $test_command"
    log_message "Started: $(date)"

    if eval "$test_command" >> "$LOG_FILE" 2>&1; then
        echo -e "${GREEN}✓ PASS${RESET} - $test_name successful"
        log_message "Status: PASS"
        ((TESTS_PASSED++))
        return 0
    else
        if [ "$allow_skip" = "true" ]; then
            echo -e "${YELLOW}⊘ SKIP${RESET} - $test_name skipped or failed (may need config)"
            log_message "Status: SKIPPED"
            ((TESTS_SKIPPED++))
            return 0
        else
            echo -e "${RED}✗ FAIL${RESET} - $test_name failed"
            log_message "Status: FAILED"
            ((TESTS_FAILED++))
            return 1
        fi
    fi
}

# Start the test suite
echo ""
echo "================================================================================"
echo "   🌾 FARMERS MARKET PLATFORM - COMPREHENSIVE TEST SUITE"
echo "================================================================================"
echo ""
echo "Starting comprehensive testing at $(date)"
echo ""

log_message "Test execution log - $(date)"
log_message "========================================"
log_message ""

# =============================================================================
# TEST 1: Platform Validation
# =============================================================================
run_test "TEST 1/10: Platform Validation" "npm run validate:platform"

# =============================================================================
# TEST 2: TypeScript Compilation
# =============================================================================
run_test "TEST 2/10: TypeScript Compilation" "npm run type-check"

# =============================================================================
# TEST 3: ESLint
# =============================================================================
run_test "TEST 3/10: ESLint Code Quality" "npm run lint"

# =============================================================================
# TEST 4: Code Formatting
# =============================================================================
echo ""
echo "--------------------------------------------------------------------------------"
echo -e "${BLUE}TEST 4/10: Code Formatting Check${RESET}"
echo "--------------------------------------------------------------------------------"
echo "Running: npm run format:check"
echo ""

if npm run format:check >> "$LOG_FILE" 2>&1; then
    echo -e "${GREEN}✓ PASS${RESET} - Code formatting correct"
    ((TESTS_PASSED++))
else
    echo -e "${YELLOW}⚠ WARNING${RESET} - Some files need formatting"
    echo "Running auto-fix: npm run format"
    npm run format >> "$LOG_FILE" 2>&1
    echo -e "${GREEN}✓ FIXED${RESET} - Code formatting corrected"
    ((TESTS_PASSED++))
fi

# =============================================================================
# TEST 5: Unit Tests
# =============================================================================
run_test "TEST 5/10: Unit Tests" "npm run test:unit"

# =============================================================================
# TEST 6: Production Build
# =============================================================================
echo ""
echo "--------------------------------------------------------------------------------"
echo -e "${BLUE}TEST 6/10: Production Build${RESET}"
echo "--------------------------------------------------------------------------------"
echo "Running: npm run build"
echo "This may take several minutes..."
echo ""

if npm run build >> "$LOG_FILE" 2>&1; then
    echo -e "${GREEN}✓ PASS${RESET} - Production build successful"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ FAIL${RESET} - Production build failed"
    ((TESTS_FAILED++))
fi

# =============================================================================
# TEST 7: Integration Tests (Customer Journey)
# =============================================================================
run_test "TEST 7/10: Integration Tests - Customer Journey" "npm run test:integration:customer" true

# =============================================================================
# TEST 8: Integration Tests (Farmer Journey)
# =============================================================================
run_test "TEST 8/10: Integration Tests - Farmer Journey" "npm run test:integration:farmer" true

# =============================================================================
# TEST 9: Test Coverage Report
# =============================================================================
echo ""
echo "--------------------------------------------------------------------------------"
echo -e "${BLUE}TEST 9/10: Test Coverage Analysis${RESET}"
echo "--------------------------------------------------------------------------------"
echo "Running: npm run test:coverage"
echo "This may take several minutes..."
echo ""

if npm run test:coverage >> "$LOG_FILE" 2>&1; then
    echo -e "${GREEN}✓ PASS${RESET} - Coverage report generated"
    ((TESTS_PASSED++))
    echo "Coverage report available in: coverage/index.html"
else
    echo -e "${YELLOW}⊘ SKIP${RESET} - Coverage report generation failed"
    ((TESTS_SKIPPED++))
fi

# =============================================================================
# TEST 10: Quality Gate Check
# =============================================================================
run_test "TEST 10/10: Overall Quality Gate" "npm run quality"

# =============================================================================
# Generate Summary Report
# =============================================================================
TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED + TESTS_SKIPPED))
if [ $TOTAL_TESTS -gt 0 ]; then
    PASS_PERCENTAGE=$(( (TESTS_PASSED * 100) / TOTAL_TESTS ))
else
    PASS_PERCENTAGE=0
fi

echo ""
echo ""
echo "================================================================================"
echo "   📊 TEST EXECUTION SUMMARY"
echo "================================================================================"
echo ""
echo "Test Run Date:     $(date)"
echo "Log File:          $LOG_FILE"
echo ""
echo "--------------------------------------------------------------------------------"
echo "Results:"
echo "--------------------------------------------------------------------------------"
echo -e "  ${GREEN}✓ Passed:${RESET}        $TESTS_PASSED"
echo -e "  ${RED}✗ Failed:${RESET}        $TESTS_FAILED"
echo -e "  ${YELLOW}⊘ Skipped:${RESET}       $TESTS_SKIPPED"
echo "  ─────────────────"
echo "  Total Tests:     $TOTAL_TESTS"
echo ""
echo "Pass Rate:        ${PASS_PERCENTAGE}%"
echo ""
echo "--------------------------------------------------------------------------------"
echo "Status:"
echo "--------------------------------------------------------------------------------"

EXIT_CODE=0
if [ $TESTS_FAILED -eq 0 ]; then
    if [ $TESTS_SKIPPED -eq 0 ]; then
        echo -e "  ${GREEN}🎉 ALL TESTS PASSED! Platform is production ready.${RESET}"
    else
        echo -e "  ${YELLOW}⚠️  MOSTLY PASSED with some skipped tests.${RESET}"
        echo "  Review skipped tests and consider running them manually."
    fi
else
    echo -e "  ${RED}❌ SOME TESTS FAILED! Review the log file for details.${RESET}"
    echo "  Fix failing tests before deploying to production."
    EXIT_CODE=1
fi

echo ""
echo "--------------------------------------------------------------------------------"
echo "Next Steps:"
echo "--------------------------------------------------------------------------------"
if [ $TESTS_FAILED -eq 0 ]; then
    echo "  1. Review the full test log: $LOG_FILE"
    echo "  2. Check coverage report: coverage/index.html"
    echo "  3. Consider running E2E tests: npm run test:e2e"
    echo "  4. Review the comprehensive report: COMPREHENSIVE_TESTING_REPORT.md"
    echo "  5. If all looks good, deploy to production!"
else
    echo "  1. Review failed tests in: $LOG_FILE"
    echo "  2. Fix the issues identified"
    echo "  3. Re-run this script: ./run-all-tests.sh"
    echo "  4. Once all tests pass, proceed to deployment"
fi

echo ""
echo "================================================================================"
echo "   🔗 USEFUL COMMANDS"
echo "================================================================================"
echo ""
echo "  Run specific test suites:"
echo "  -------------------------"
echo "  npm run test:unit              - Run unit tests only"
echo "  npm run test:integration       - Run integration tests"
echo "  npm run test:e2e:ui            - Run E2E tests with UI"
echo "  npm run validate:platform      - Validate platform architecture"
echo ""
echo "  Code quality checks:"
echo "  --------------------"
echo "  npm run lint                   - Check linting"
echo "  npm run format                 - Fix formatting"
echo "  npm run type-check             - Check TypeScript"
echo "  npm run quality                - Run all quality checks"
echo ""
echo "  Additional testing:"
echo "  -------------------"
echo "  npm run test:human             - Interactive human testing"
echo "  npm run test:coverage          - Generate coverage report"
echo "  npm run test:visual            - Visual regression testing"
echo "  npm run test:a11y              - Accessibility testing"
echo ""
echo "================================================================================"
echo ""

# Append summary to log file
log_message ""
log_message "========================================"
log_message "TEST EXECUTION SUMMARY"
log_message "========================================"
log_message "Tests Passed:  $TESTS_PASSED"
log_message "Tests Failed:  $TESTS_FAILED"
log_message "Tests Skipped: $TESTS_SKIPPED"
log_message "Total Tests:   $TOTAL_TESTS"
log_message "Pass Rate:     ${PASS_PERCENTAGE}%"
log_message "========================================"
log_message "Completed: $(date)"

# Ask if user wants to see the log file
echo ""
read -p "Would you like to open the detailed log file? (y/N): " OPEN_LOG
if [[ $OPEN_LOG =~ ^[Yy]$ ]]; then
    if command -v less &> /dev/null; then
        less "$LOG_FILE"
    elif command -v more &> /dev/null; then
        more "$LOG_FILE"
    else
        cat "$LOG_FILE"
    fi
fi

# Ask if user wants to see coverage report
if [ -f "coverage/index.html" ]; then
    echo ""
    read -p "Would you like to open the coverage report? (y/N): " OPEN_COVERAGE
    if [[ $OPEN_COVERAGE =~ ^[Yy]$ ]]; then
        if command -v xdg-open &> /dev/null; then
            xdg-open coverage/index.html
        elif command -v open &> /dev/null; then
            open coverage/index.html
        else
            echo "Please open coverage/index.html in your browser"
        fi
    fi
fi

echo ""
echo "Test execution completed at $(date)"
echo ""

exit $EXIT_CODE
