#!/bin/bash

# 🌾 Farmers Market Platform - Production Verification Script
# Verifies that the production deployment is healthy and all critical endpoints are responding

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PRODUCTION_URL="https://farmers-market-platform.vercel.app"
DEPLOYMENT_ID="${1:-57q73Xv7B}"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║ 🌾 Farmers Market Platform - Production Verification      ║${NC}"
echo -e "${BLUE}╠════════════════════════════════════════════════════════════╣${NC}"
echo -e "${BLUE}║ Deployment: ${DEPLOYMENT_ID}                              ${NC}"
echo -e "${BLUE}║ URL: ${PRODUCTION_URL}${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Track failures
FAILED_CHECKS=0
TOTAL_CHECKS=0

# Function to check endpoint
check_endpoint() {
    local name=$1
    local url=$2
    local expected_status=$3
    local check_body=$4

    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

    echo -e "${YELLOW}⏳ Checking: ${name}${NC}"
    echo -e "   URL: ${url}"

    # Make request and capture response
    response=$(curl -s -w "\n%{http_code}" "$url" 2>&1)
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)

    # Check HTTP status
    if [ "$http_code" = "$expected_status" ]; then
        echo -e "   ${GREEN}✓${NC} HTTP Status: ${http_code}"

        # Check body content if specified
        if [ -n "$check_body" ]; then
            if echo "$body" | grep -q "$check_body"; then
                echo -e "   ${GREEN}✓${NC} Response contains: \"${check_body}\""
                echo -e "${GREEN}✓ PASSED${NC}\n"
            else
                echo -e "   ${RED}✗${NC} Response missing: \"${check_body}\""
                echo -e "   Response: ${body:0:200}"
                echo -e "${RED}✗ FAILED${NC}\n"
                FAILED_CHECKS=$((FAILED_CHECKS + 1))
            fi
        else
            echo -e "${GREEN}✓ PASSED${NC}\n"
        fi
    else
        echo -e "   ${RED}✗${NC} HTTP Status: ${http_code} (expected ${expected_status})"
        echo -e "   Response: ${body:0:200}"
        echo -e "${RED}✗ FAILED${NC}\n"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    fi
}

# Function to check with HEAD request
check_head() {
    local name=$1
    local url=$2

    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

    echo -e "${YELLOW}⏳ Checking: ${name} (HEAD)${NC}"
    echo -e "   URL: ${url}"

    http_code=$(curl -s -o /dev/null -w "%{http_code}" -I "$url")

    if [ "$http_code" = "200" ] || [ "$http_code" = "307" ] || [ "$http_code" = "308" ]; then
        echo -e "   ${GREEN}✓${NC} HTTP Status: ${http_code}"
        echo -e "${GREEN}✓ PASSED${NC}\n"
    else
        echo -e "   ${RED}✗${NC} HTTP Status: ${http_code}"
        echo -e "${RED}✗ FAILED${NC}\n"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    fi
}

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}CRITICAL ENDPOINTS${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}\n"

# 1. Health Check
check_endpoint "Health Check" "${PRODUCTION_URL}/api/health" "200" "healthy"

# 2. Homepage
check_head "Homepage" "${PRODUCTION_URL}/"

# 3. Auth Session
check_endpoint "Auth Session" "${PRODUCTION_URL}/api/auth/session" "200" ""

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}API ENDPOINTS${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}\n"

# 4. Farms API
check_endpoint "Farms API" "${PRODUCTION_URL}/api/farms" "200" ""

# 5. Products API
check_endpoint "Products API" "${PRODUCTION_URL}/api/products" "200" ""

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}AUTHENTICATION ENDPOINTS${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}\n"

# 6. NextAuth Providers
check_endpoint "Auth Providers" "${PRODUCTION_URL}/api/auth/providers" "200" ""

# 7. Auth CSRF
check_endpoint "Auth CSRF" "${PRODUCTION_URL}/api/auth/csrf" "200" "csrfToken"

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}STATIC ASSETS${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}\n"

# 8. Favicon
check_head "Favicon" "${PRODUCTION_URL}/favicon.ico"

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}SUMMARY${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}\n"

PASSED_CHECKS=$((TOTAL_CHECKS - FAILED_CHECKS))

echo -e "Total Checks: ${TOTAL_CHECKS}"
echo -e "${GREEN}Passed: ${PASSED_CHECKS}${NC}"
echo -e "${RED}Failed: ${FAILED_CHECKS}${NC}\n"

if [ $FAILED_CHECKS -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║ ✓ ALL CHECKS PASSED - PRODUCTION IS HEALTHY! 🎉           ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    exit 0
else
    echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║ ✗ SOME CHECKS FAILED - INVESTIGATION REQUIRED             ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "1. Check Vercel runtime logs:"
    echo "   npx vercel logs ${PRODUCTION_URL}"
    echo ""
    echo "2. Verify environment variables:"
    echo "   ./scripts/check-vercel-env.sh production"
    echo ""
    echo "3. Check deployment details:"
    echo "   npx vercel inspect ${PRODUCTION_URL}"
    echo ""
    exit 1
fi
