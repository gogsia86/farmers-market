#!/bin/bash

# 🔍 LOGGER TEST ANALYSIS SCRIPT
# Analyzes and compares the two logger test files to identify duplicates
# Version: 1.0.0
# Author: Divine Agricultural Test Auditor

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║     🔍 LOGGER TEST ANALYSIS & COMPARISON                  ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# File paths
LOGGER_UTILS="src/lib/utils/__tests__/logger.test.ts"
LOGGER_LIB="src/lib/logger/__tests__/logger.test.ts"

# Check if files exist
if [ ! -f "$LOGGER_UTILS" ]; then
    echo -e "${RED}❌ File not found: $LOGGER_UTILS${NC}"
    exit 1
fi

if [ ! -f "$LOGGER_LIB" ]; then
    echo -e "${RED}❌ File not found: $LOGGER_LIB${NC}"
    exit 1
fi

echo -e "${CYAN}📊 ANALYZING LOGGER TEST FILES${NC}"
echo ""

# Function to count lines
count_lines() {
    wc -l < "$1" | tr -d ' '
}

# Function to count test cases
count_tests() {
    grep -c "it(" "$1" || echo "0"
}

# Function to count describe blocks
count_describes() {
    grep -c "describe(" "$1" || echo "0"
}

# Get metrics
UTILS_LINES=$(count_lines "$LOGGER_UTILS")
LIB_LINES=$(count_lines "$LOGGER_LIB")
UTILS_TESTS=$(count_tests "$LOGGER_UTILS")
LIB_TESTS=$(count_tests "$LOGGER_LIB")
UTILS_DESCRIBES=$(count_describes "$LOGGER_UTILS")
LIB_DESCRIBES=$(count_describes "$LOGGER_LIB")

# Display comparison
echo -e "${YELLOW}┌─────────────────────────────────────────────────────────┐${NC}"
echo -e "${YELLOW}│                    FILE COMPARISON                      │${NC}"
echo -e "${YELLOW}└─────────────────────────────────────────────────────────┘${NC}"
echo ""

echo -e "${PURPLE}FILE 1: utils/logger.test.ts${NC}"
echo -e "  📄 Lines:          ${GREEN}$UTILS_LINES${NC}"
echo -e "  🧪 Test cases:     ${GREEN}$UTILS_TESTS${NC}"
echo -e "  📦 Describe blocks: ${GREEN}$UTILS_DESCRIBES${NC}"
echo ""

echo -e "${PURPLE}FILE 2: logger/logger.test.ts${NC}"
echo -e "  📄 Lines:          ${GREEN}$LIB_LINES${NC}"
echo -e "  🧪 Test cases:     ${GREEN}$LIB_TESTS${NC}"
echo -e "  📦 Describe blocks: ${GREEN}$LIB_DESCRIBES${NC}"
echo ""

# Analyze test focus areas
echo -e "${CYAN}🔬 TEST FOCUS ANALYSIS${NC}"
echo ""

echo -e "${YELLOW}utils/logger.test.ts covers:${NC}"
grep "describe(" "$LOGGER_UTILS" | sed 's/.*describe(/  • /' | sed 's/, () => {//'
echo ""

echo -e "${YELLOW}logger/logger.test.ts covers:${NC}"
grep "describe(" "$LOGGER_LIB" | sed 's/.*describe(/  • /' | sed 's/, () => {//'
echo ""

# Check for OpenTelemetry integration
echo -e "${CYAN}🔍 FEATURE DETECTION${NC}"
echo ""

if grep -q "opentelemetry" "$LOGGER_UTILS"; then
    echo -e "  ✅ utils/logger.test.ts: ${GREEN}Has OpenTelemetry tests${NC}"
else
    echo -e "  ❌ utils/logger.test.ts: ${RED}No OpenTelemetry tests${NC}"
fi

if grep -q "opentelemetry" "$LOGGER_LIB"; then
    echo -e "  ✅ logger/logger.test.ts: ${GREEN}Has OpenTelemetry tests${NC}"
else
    echo -e "  ❌ logger/logger.test.ts: ${RED}No OpenTelemetry tests${NC}"
fi
echo ""

# Check for agricultural patterns
if grep -q -i "agricultural\|biodynamic\|farm" "$LOGGER_UTILS"; then
    echo -e "  ✅ utils/logger.test.ts: ${GREEN}Has Agricultural tests${NC}"
else
    echo -e "  ❌ utils/logger.test.ts: ${RED}No Agricultural tests${NC}"
fi

if grep -q -i "agricultural\|biodynamic\|farm" "$LOGGER_LIB"; then
    echo -e "  ✅ logger/logger.test.ts: ${GREEN}Has Agricultural tests${NC}"
else
    echo -e "  ❌ logger/logger.test.ts: ${RED}No Agricultural tests${NC}"
fi
echo ""

# Check for structured logging
if grep -q "structured" "$LOGGER_UTILS"; then
    echo -e "  ✅ utils/logger.test.ts: ${GREEN}Has Structured logging tests${NC}"
else
    echo -e "  ❌ utils/logger.test.ts: ${RED}No Structured logging tests${NC}"
fi

if grep -q "structured" "$LOGGER_LIB"; then
    echo -e "  ✅ logger/logger.test.ts: ${GREEN}Has Structured logging tests${NC}"
else
    echo -e "  ❌ logger/logger.test.ts: ${RED}No Structured logging tests${NC}"
fi
echo ""

# Recommendation
echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    RECOMMENDATIONS                         ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

if [ "$UTILS_LINES" -gt "$LIB_LINES" ]; then
    echo -e "${YELLOW}📊 utils/logger.test.ts is LARGER ($UTILS_LINES vs $LIB_LINES lines)${NC}"
    echo ""
    echo -e "${GREEN}RECOMMENDATION 1: Keep utils/logger.test.ts as primary${NC}"
    echo "  Reasons:"
    echo "  • More comprehensive ($UTILS_TESTS tests vs $LIB_TESTS tests)"
    echo "  • Likely covers more edge cases"
    echo "  • More describe blocks ($UTILS_DESCRIBES vs $LIB_DESCRIBES)"
    echo ""
    echo -e "${YELLOW}ACTION PLAN:${NC}"
    echo "  1. Review logger/logger.test.ts for unique OpenTelemetry tests"
    echo "  2. Migrate OTel tests to utils/logger.test.ts if missing"
    echo "  3. Migrate Agricultural patterns if missing"
    echo "  4. Remove logger/logger.test.ts once consolidated"
    echo ""
else
    echo -e "${YELLOW}📊 logger/logger.test.ts is LARGER ($LIB_LINES vs $UTILS_LINES lines)${NC}"
    echo ""
    echo -e "${GREEN}RECOMMENDATION 1: Keep logger/logger.test.ts as primary${NC}"
    echo "  Reasons:"
    echo "  • More comprehensive ($LIB_TESTS tests vs $UTILS_TESTS tests)"
    echo "  • Likely newer/more updated"
    echo "  • Better location (lib/logger vs lib/utils)"
    echo ""
    echo -e "${YELLOW}ACTION PLAN:${NC}"
    echo "  1. Review utils/logger.test.ts for unique utility tests"
    echo "  2. Migrate utility-specific tests to logger/logger.test.ts"
    echo "  3. Ensure all factory methods are tested"
    echo "  4. Remove utils/logger.test.ts once consolidated"
    echo ""
fi

echo -e "${GREEN}RECOMMENDATION 2: Verify test coverage after consolidation${NC}"
echo "  Run: npm run test:coverage -- --testPathPattern=logger"
echo ""

echo -e "${GREEN}RECOMMENDATION 3: Update imports if needed${NC}"
echo "  Check that logger import paths match test location"
echo ""

# Manual review checklist
echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                 MANUAL REVIEW CHECKLIST                    ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

echo "Review these areas in BOTH files:"
echo ""
echo "  [ ] Constructor tests"
echo "  [ ] Log level tests (debug, info, warn, error, fatal)"
echo "  [ ] Metadata handling"
echo "  [ ] Error logging with Error objects"
echo "  [ ] Structured logging (JSON output)"
echo "  [ ] Context management"
echo "  [ ] Child logger creation"
echo "  [ ] Request-scoped loggers"
echo "  [ ] OpenTelemetry span integration"
echo "  [ ] Agricultural consciousness logging"
echo "  [ ] Performance/timing utilities"
echo "  [ ] Edge cases (circular refs, null, empty)"
echo "  [ ] Timestamp configuration"
echo "  [ ] Development vs Production mode"
echo ""

# Detailed comparison command
echo -e "${YELLOW}📋 DETAILED COMPARISON COMMANDS${NC}"
echo ""
echo "1. View side-by-side diff:"
echo -e "   ${CYAN}diff -y $LOGGER_UTILS $LOGGER_LIB | less${NC}"
echo ""
echo "2. Extract test names from utils:"
echo -e "   ${CYAN}grep -E \"it\\(|describe\\(\" $LOGGER_UTILS${NC}"
echo ""
echo "3. Extract test names from lib:"
echo -e "   ${CYAN}grep -E \"it\\(|describe\\(\" $LOGGER_LIB${NC}"
echo ""
echo "4. Find unique tests in utils:"
echo -e "   ${CYAN}grep \"it(\" $LOGGER_UTILS | sort > /tmp/utils_tests.txt${NC}"
echo -e "   ${CYAN}grep \"it(\" $LOGGER_LIB | sort > /tmp/lib_tests.txt${NC}"
echo -e "   ${CYAN}comm -23 /tmp/utils_tests.txt /tmp/lib_tests.txt${NC}"
echo ""

# Summary
echo -e "${GREEN}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║              ✨ ANALYSIS COMPLETE ✨                       ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

echo -e "${BLUE}Next Steps:${NC}"
echo "1. Review the analysis above"
echo "2. Manually inspect both files for unique tests"
echo "3. Create consolidated logger test file"
echo "4. Run tests to ensure no loss of coverage"
echo "5. Remove duplicate file"
echo ""

echo -e "${CYAN}🌾 Divine logging consciousness achieved! ⚡${NC}"
echo ""

exit 0
