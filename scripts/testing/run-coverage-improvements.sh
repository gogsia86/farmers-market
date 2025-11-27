#!/bin/bash

###############################################################################
# COVERAGE IMPROVEMENT RUNNER
# Executes tests for newly created test files and measures coverage gains
#
# Part of: Recommendation 4 - Increase Overall Coverage to 80%+
# References: 13_TESTING_PERFORMANCE_MASTERY.instructions.md
###############################################################################

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🧪 COVERAGE IMPROVEMENT RUNNER - RECOMMENDATION 4        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to display section headers
section() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# Function to run tests for specific directory
run_tests_for() {
    local test_path=$1
    local description=$2

    echo -e "${YELLOW}📝 Running: ${description}${NC}"
    echo -e "${YELLOW}Path: ${test_path}${NC}"
    echo ""

    if npm run test -- --testPathPattern="$test_path" --coverage=false --passWithNoTests; then
        echo -e "${GREEN}✅ PASSED: ${description}${NC}"
        return 0
    else
        echo -e "${RED}❌ FAILED: ${description}${NC}"
        return 1
    fi
}

# Track results
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

###############################################################################
# PHASE 1: VALIDATION TESTS
###############################################################################

section "PHASE 1: Validation Schema Tests (0% → Target: 100%)"

echo -e "${YELLOW}Testing agricultural validation schemas...${NC}"
if run_tests_for "src/lib/validation/__tests__" "Agricultural Validation Tests"; then
    ((PASSED_TESTS++))
else
    ((FAILED_TESTS++))
fi
((TOTAL_TESTS++))

echo ""
echo -e "${YELLOW}Testing cart validation schemas...${NC}"
if run_tests_for "src/lib/validations/__tests__/cart.test.ts" "Cart Validation Tests"; then
    ((PASSED_TESTS++))
else
    ((FAILED_TESTS++))
fi
((TOTAL_TESTS++))

echo ""
echo -e "${YELLOW}Testing order validation schemas...${NC}"
if run_tests_for "src/lib/validations/__tests__/order.test.ts" "Order Validation Tests"; then
    ((PASSED_TESTS++))
else
    ((FAILED_TESTS++))
fi
((TOTAL_TESTS++))

echo ""
echo -e "${YELLOW}Testing product validation schemas...${NC}"
if run_tests_for "src/lib/validations/__tests__/product.test.ts" "Product Validation Tests"; then
    ((PASSED_TESTS++))
else
    ((FAILED_TESTS++))
fi
((TOTAL_TESTS++))

echo ""
echo -e "${YELLOW}Testing crop validation schemas...${NC}"
if run_tests_for "src/lib/validations/__tests__/crop.test.ts" "Crop Validation Tests"; then
    ((PASSED_TESTS++))
else
    ((FAILED_TESTS++))
fi
((TOTAL_TESTS++))

###############################################################################
# PHASE 2: SERVICE LAYER TESTS
###############################################################################

section "PHASE 2: Service Layer Tests (Low Coverage → Target: 80%+)"

echo -e "${YELLOW}Testing biodynamic calendar service...${NC}"
if run_tests_for "src/lib/services/__tests__/biodynamic-calendar.service.test.ts" "Biodynamic Calendar Service Tests"; then
    ((PASSED_TESTS++))
else
    ((FAILED_TESTS++))
fi
((TOTAL_TESTS++))

echo ""
echo -e "${YELLOW}Testing soil analysis service...${NC}"
if run_tests_for "src/lib/services/__tests__/soil-analysis.service.test.ts" "Soil Analysis Service Tests"; then
    ((PASSED_TESTS++))
else
    ((FAILED_TESTS++))
fi
((TOTAL_TESTS++))

echo ""
echo -e "${YELLOW}Testing security services...${NC}"
if run_tests_for "src/lib/services/security/__tests__" "Security Service Tests"; then
    ((PASSED_TESTS++))
else
    ((FAILED_TESTS++))
fi
((TOTAL_TESTS++))

###############################################################################
# PHASE 3: REPOSITORY TESTS
###############################################################################

section "PHASE 3: Repository Tests (0% → Target: 100%)"

echo -e "${YELLOW}Testing farm repository...${NC}"
if run_tests_for "src/repositories/__tests__/FarmRepository.test.ts" "Farm Repository Tests"; then
    ((PASSED_TESTS++))
else
    ((FAILED_TESTS++))
fi
((TOTAL_TESTS++))

###############################################################################
# PHASE 4: STORE TESTS
###############################################################################

section "PHASE 4: State Management Tests (0% → Target: 100%)"

echo -e "${YELLOW}Testing cart store...${NC}"
if run_tests_for "src/stores/__tests__/cartStore.test.ts" "Cart Store Tests"; then
    ((PASSED_TESTS++))
else
    ((FAILED_TESTS++))
fi
((TOTAL_TESTS++))

###############################################################################
# PHASE 5: TRACING TESTS
###############################################################################

section "PHASE 5: Tracing & Instrumentation Tests (Low → Target: 80%+)"

echo -e "${YELLOW}Testing agricultural tracer...${NC}"
if run_tests_for "src/lib/tracing/__tests__/agricultural-tracer.test.ts" "Agricultural Tracer Tests"; then
    ((PASSED_TESTS++))
else
    ((FAILED_TESTS++))
fi
((TOTAL_TESTS++))

echo ""
echo -e "${YELLOW}Testing lazy tracer...${NC}"
if run_tests_for "src/lib/tracing/__tests__/lazy-tracer.test.ts" "Lazy Tracer Tests"; then
    ((PASSED_TESTS++))
else
    ((FAILED_TESTS++))
fi
((TOTAL_TESTS++))

###############################################################################
# PHASE 6: FULL COVERAGE REPORT
###############################################################################

section "PHASE 6: Full Coverage Report Generation"

echo -e "${YELLOW}Generating comprehensive coverage report...${NC}"
echo ""

npm run test:coverage

###############################################################################
# RESULTS SUMMARY
###############################################################################

section "TEST EXECUTION SUMMARY"

echo -e "${BLUE}Total Test Suites Run: ${TOTAL_TESTS}${NC}"
echo -e "${GREEN}Passed: ${PASSED_TESTS}${NC}"
echo -e "${RED}Failed: ${FAILED_TESTS}${NC}"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✅ ALL TESTS PASSED - COVERAGE IMPROVEMENTS COMPLETE!    ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${GREEN}🎯 Next Steps:${NC}"
    echo -e "${GREEN}  1. Review coverage report in ./coverage/lcov-report/index.html${NC}"
    echo -e "${GREEN}  2. Verify coverage increased from 9.44% baseline${NC}"
    echo -e "${GREEN}  3. Update RECOMMENDATIONS_COMPLETE.md with new coverage stats${NC}"
    echo -e "${GREEN}  4. Proceed to Recommendation 5 (Dashboard Routes)${NC}"
    echo ""
    exit 0
else
    echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  ⚠️  SOME TESTS FAILED - REVIEW REQUIRED                  ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${RED}🔧 Action Required:${NC}"
    echo -e "${RED}  1. Review failed test output above${NC}"
    echo -e "${RED}  2. Fix failing tests${NC}"
    echo -e "${RED}  3. Re-run this script${NC}"
    echo ""
    exit 1
fi
