#!/bin/bash
# 🧪 Fast Test Runner - Farmers Market Platform
# Runs only fast, reliable test suites (excludes slow/problematic tests)
#
# Usage:
#   bash scripts/run-fast-tests.sh
#   npm run test:fast

set -e

echo "🚀 Running Fast Test Suite..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test categories to run (fast tests only)
FAST_TEST_PATTERNS=(
  "validation"
  "slug.test"
  "format"
  "sanitize"
  "repository"
  "cache/__tests__/index"
)

# Tests to EXCLUDE (slow or problematic)
EXCLUDE_PATTERNS=(
  "logger.test.ts"           # HANGS - OpenTelemetry mocking issue
  "password.test.ts"         # SLOW - 19s due to bcrypt
  "integration.test.tsx"     # May be slow
  "e2e"                      # E2E tests are slow
  "playwright"               # Playwright tests are slow
)

# Build the test pattern
TEST_PATTERN=$(IFS="|"; echo "${FAST_TEST_PATTERNS[*]}")

echo "📋 Test Configuration:"
echo "   • Pattern: (${TEST_PATTERN})"
echo "   • Max Workers: 2 (optimized for speed)"
echo "   • Excluded: logger, password, e2e tests"
echo ""

# Run the tests
echo "🧪 Executing tests..."
echo ""

npm test -- \
  --testPathPatterns="(${TEST_PATTERN})" \
  --testPathIgnorePatterns="(logger.test.ts|password.test|integration.test.tsx|e2e|playwright)" \
  --maxWorkers=2 \
  --passWithNoTests \
  --bail=false \
  --no-coverage

EXIT_CODE=$?

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $EXIT_CODE -eq 0 ]; then
  echo -e "${GREEN}✅ All fast tests passed!${NC}"
  echo ""
  echo "⏱️  Typical execution time: 3-5 seconds"
  echo "📊 Tests covered: ~600+ tests"
  echo ""
  echo "💡 To run full test suite (including slow tests):"
  echo "   npm test -- --testPathPatterns=\"(validation|repository|cache|auth)\""
else
  echo -e "${RED}❌ Some tests failed${NC}"
  echo ""
  echo "🔍 Review the output above for details"
fi

echo ""
exit $EXIT_CODE
