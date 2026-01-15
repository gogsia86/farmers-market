#!/bin/bash

# Deployment Verification Script
# Verifies that the production deployment is healthy after fixes

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PRODUCTION_URL="${PRODUCTION_URL:-https://your-domain.com}"
MAX_RETRIES=3
RETRY_DELAY=5

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Farmers Market - Deployment Verification Script    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to make HTTP request with retries
make_request() {
    local url=$1
    local retries=0

    while [ $retries -lt $MAX_RETRIES ]; do
        response=$(curl -s -w "\n%{http_code}" "$url" 2>/dev/null || echo "000")
        http_code=$(echo "$response" | tail -n1)
        body=$(echo "$response" | head -n-1)

        if [ "$http_code" = "200" ]; then
            echo "$body"
            return 0
        fi

        retries=$((retries + 1))
        if [ $retries -lt $MAX_RETRIES ]; then
            echo -e "${YELLOW}Retry $retries/$MAX_RETRIES after ${RETRY_DELAY}s...${NC}" >&2
            sleep $RETRY_DELAY
        fi
    done

    echo "ERROR: HTTP $http_code"
    return 1
}

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run test
run_test() {
    local test_name=$1
    local url=$2
    local expected_pattern=$3

    echo -e "${BLUE}Testing:${NC} $test_name"
    echo -e "${BLUE}URL:${NC} $url"

    response=$(make_request "$url")

    if [ $? -eq 0 ]; then
        if echo "$response" | grep -q "$expected_pattern"; then
            echo -e "${GREEN}✓ PASSED${NC} - $test_name"
            TESTS_PASSED=$((TESTS_PASSED + 1))
            return 0
        else
            echo -e "${RED}✗ FAILED${NC} - $test_name: Pattern not found"
            echo -e "${YELLOW}Response:${NC} $response"
            TESTS_FAILED=$((TESTS_FAILED + 1))
            return 1
        fi
    else
        echo -e "${RED}✗ FAILED${NC} - $test_name: Request failed"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi

    echo ""
}

# Check if production URL is set
if [ "$PRODUCTION_URL" = "https://your-domain.com" ]; then
    echo -e "${YELLOW}⚠ Warning: Using default production URL${NC}"
    echo -e "${YELLOW}Set PRODUCTION_URL environment variable for your actual domain${NC}"
    echo ""
    read -p "Enter your production URL (or press Enter to skip): " user_url
    if [ -n "$user_url" ]; then
        PRODUCTION_URL=$user_url
    else
        echo -e "${RED}Skipping verification - no production URL provided${NC}"
        exit 0
    fi
fi

echo -e "${BLUE}Production URL:${NC} $PRODUCTION_URL"
echo ""
echo -e "${BLUE}Starting verification tests...${NC}"
echo ""

# Test 1: Basic Health Check
run_test "Health Endpoint" \
    "$PRODUCTION_URL/api/health" \
    "ok"

# Test 2: Database Health
run_test "Database Connectivity" \
    "$PRODUCTION_URL/api/health/database" \
    "healthy"

# Test 3: API Ready Check
run_test "API Ready Status" \
    "$PRODUCTION_URL/api/ready" \
    "ready"

# Test 4: Homepage Loads
echo -e "${BLUE}Testing:${NC} Homepage"
echo -e "${BLUE}URL:${NC} $PRODUCTION_URL/"

homepage_response=$(curl -s -o /dev/null -w "%{http_code}" "$PRODUCTION_URL/" 2>/dev/null || echo "000")

if [ "$homepage_response" = "200" ]; then
    echo -e "${GREEN}✓ PASSED${NC} - Homepage loads successfully"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}✗ FAILED${NC} - Homepage returned HTTP $homepage_response"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

# Test 5: Static Assets
echo -e "${BLUE}Testing:${NC} Static Assets"
favicon_response=$(curl -s -o /dev/null -w "%{http_code}" "$PRODUCTION_URL/favicon.ico" 2>/dev/null || echo "000")

if [ "$favicon_response" = "200" ]; then
    echo -e "${GREEN}✓ PASSED${NC} - Static assets accessible"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${YELLOW}⚠ WARNING${NC} - Static assets may not be accessible (HTTP $favicon_response)"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

# Test 6: API Documentation
echo -e "${BLUE}Testing:${NC} API Documentation"
api_docs_response=$(curl -s -o /dev/null -w "%{http_code}" "$PRODUCTION_URL/api-docs" 2>/dev/null || echo "000")

if [ "$api_docs_response" = "200" ]; then
    echo -e "${GREEN}✓ PASSED${NC} - API documentation accessible"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${YELLOW}⚠ WARNING${NC} - API documentation not accessible (HTTP $api_docs_response)"
fi
echo ""

# Test 7: Check Response Headers for Security
echo -e "${BLUE}Testing:${NC} Security Headers"
headers=$(curl -s -I "$PRODUCTION_URL/" 2>/dev/null)

security_headers=(
    "X-Frame-Options"
    "X-Content-Type-Options"
    "X-XSS-Protection"
)

headers_passed=0
headers_total=${#security_headers[@]}

for header in "${security_headers[@]}"; do
    if echo "$headers" | grep -qi "$header"; then
        echo -e "${GREEN}✓${NC} $header present"
        headers_passed=$((headers_passed + 1))
    else
        echo -e "${YELLOW}⚠${NC} $header missing"
    fi
done

if [ $headers_passed -eq $headers_total ]; then
    echo -e "${GREEN}✓ PASSED${NC} - All security headers present"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${YELLOW}⚠ WARNING${NC} - Some security headers missing ($headers_passed/$headers_total)"
fi
echo ""

# Summary
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                  Verification Summary                 ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Tests Passed:${NC} $TESTS_PASSED"
echo -e "${RED}Tests Failed:${NC} $TESTS_FAILED"
echo ""

TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED))
SUCCESS_RATE=$((TESTS_PASSED * 100 / TOTAL_TESTS))

echo -e "${BLUE}Success Rate:${NC} $SUCCESS_RATE%"
echo ""

# Final verdict
if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║   ✓ ALL TESTS PASSED - DEPLOYMENT VERIFIED!          ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
    exit 0
elif [ $SUCCESS_RATE -ge 80 ]; then
    echo -e "${YELLOW}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║   ⚠ PARTIAL SUCCESS - SOME TESTS FAILED              ║${NC}"
    echo -e "${YELLOW}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}Most critical services are operational.${NC}"
    echo -e "${YELLOW}Review failed tests and address if necessary.${NC}"
    exit 1
else
    echo -e "${RED}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║   ✗ DEPLOYMENT VERIFICATION FAILED                    ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${RED}Critical issues detected. Please review deployment logs.${NC}"
    exit 2
fi
