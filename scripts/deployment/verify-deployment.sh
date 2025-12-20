#!/bin/bash

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  🌾 FARMERS MARKET PLATFORM - DEPLOYMENT VERIFICATION  🌾  ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Initialize counters
PASSED=0
FAILED=0

# Function to check status
check() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC} - $2"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC} - $2"
        ((FAILED++))
    fi
}

echo "Running deployment verification checks..."
echo ""

# 1. TypeScript Check
echo "🔍 Checking TypeScript..."
npm run type-check > /dev/null 2>&1
check $? "TypeScript compilation"

# 2. Lint Check
echo "🔍 Checking ESLint..."
npm run lint > /dev/null 2>&1
check $? "ESLint validation"

# 3. Build Check
echo "🔍 Building production bundle..."
npm run build > /dev/null 2>&1
check $? "Production build"

# 4. Test Check
echo "🔍 Running tests..."
npm test -- --passWithNoTests --silent > /dev/null 2>&1
check $? "Test suite"

# 5. Package.json Check
echo "🔍 Checking package.json..."
[ -f package.json ] && grep -q "\"name\": \"farmers-market\"" package.json
check $? "Package configuration"

# 6. Prisma Schema Check
echo "🔍 Checking Prisma schema..."
[ -f prisma/schema.prisma ]
check $? "Database schema"

# 7. Environment Template Check
echo "🔍 Checking environment template..."
[ -f .env.example ]
check $? "Environment template"

# 8. Documentation Check
echo "🔍 Checking documentation..."
[ -f docs/DEPLOYMENT_READINESS_REPORT.md ]
check $? "Deployment documentation"

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    VERIFICATION RESULTS                     ║"
echo "╠════════════════════════════════════════════════════════════╣"
echo -e "║  ${GREEN}Passed: $PASSED${NC}                                               "
echo -e "║  ${RED}Failed: $FAILED${NC}                                               "
echo "╠════════════════════════════════════════════════════════════╣"

if [ $FAILED -eq 0 ]; then
    echo -e "║  ${GREEN}Status: ✅ PRODUCTION READY${NC}                            "
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    echo "🚀 All checks passed! Platform is ready for deployment."
    echo "📋 See DEPLOYMENT_SUMMARY.md for deployment instructions."
    exit 0
else
    echo -e "║  ${RED}Status: ❌ NOT READY${NC}                                  "
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    echo "⚠️  Some checks failed. Please review and fix issues."
    exit 1
fi
