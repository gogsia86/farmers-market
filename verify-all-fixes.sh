#!/bin/bash
# Comprehensive Verification Script for Farmers Market Platform
# This script verifies all fixes, runs tests, and checks performance
# Version: 1.0.0
# Date: 2025-12-06

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Counters
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNINGS=0

# Logging functions
log_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    WARNINGS=$((WARNINGS + 1))
}

log_header() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}🔍 $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Start verification
clear
echo -e "${CYAN}"
cat << "EOF"
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║     🌾 FARMERS MARKET PLATFORM - FIX VERIFICATION 🌾         ║
║                                                              ║
║     Comprehensive System Health & Performance Check          ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"
echo ""

# ============================================================================
# SECTION 1: ENVIRONMENT CHECKS
# ============================================================================
log_header "1. ENVIRONMENT CONFIGURATION"

TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
if [ -f ".env.local" ]; then
    log_success ".env.local file exists"

    # Check Redis configuration
    if grep -q "REDIS_ENABLED=false" .env.local; then
        log_success "Redis correctly disabled for local development"
    else
        log_warning "Redis may not be disabled in .env.local"
    fi

    # Check database URL
    if grep -q "DATABASE_URL" .env.local; then
        log_success "Database URL configured"
    else
        log_error "DATABASE_URL not found in .env.local"
    fi
else
    log_error ".env.local file not found"
fi

# Check node_modules
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
if [ -d "node_modules" ]; then
    log_success "node_modules directory exists"
else
    log_warning "node_modules not found - run 'npm install'"
fi

# Check Prisma client
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
if [ -d "node_modules/.prisma/client" ]; then
    log_success "Prisma client generated"
else
    log_warning "Prisma client not generated - run 'npx prisma generate'"
fi

# ============================================================================
# SECTION 2: DEV SERVER STATUS
# ============================================================================
log_header "2. DEV SERVER STATUS"

TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
if netstat -ano | grep -q ":3001.*LISTENING"; then
    PID=$(netstat -ano | grep ":3001.*LISTENING" | awk '{print $5}' | head -1)
    log_success "Dev server is running on port 3001 (PID: $PID)"
    SERVER_RUNNING=true
else
    log_error "Dev server is NOT running on port 3001"
    log_info "Start the server with: npm run dev"
    SERVER_RUNNING=false
fi

# ============================================================================
# SECTION 3: API ENDPOINT TESTS
# ============================================================================
if [ "$SERVER_RUNNING" = true ]; then
    log_header "3. API ENDPOINT TESTS"

    # Health endpoint
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    log_info "Testing /api/health..."
    if curl -sf http://localhost:3001/api/health > /dev/null 2>&1; then
        HEALTH_RESPONSE=$(curl -s http://localhost:3001/api/health)
        STATUS=$(echo $HEALTH_RESPONSE | grep -o '"status":"[^"]*"' | cut -d'"' -f4)

        if [ "$STATUS" = "healthy" ]; then
            log_success "Health endpoint: healthy"
        elif [ "$STATUS" = "degraded" ]; then
            log_warning "Health endpoint: degraded"
        else
            log_error "Health endpoint: unhealthy"
        fi
    else
        log_error "Health endpoint not responding"
    fi

    # Farms API endpoint
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    log_info "Testing /api/farms..."
    if curl -sf http://localhost:3001/api/farms > /dev/null 2>&1; then
        FARMS_RESPONSE=$(curl -s http://localhost:3001/api/farms)

        if echo $FARMS_RESPONSE | grep -q '"success":true'; then
            log_success "Farms API endpoint responding correctly"
        else
            log_error "Farms API returned error response"
            echo "Response: $FARMS_RESPONSE" | head -c 200
        fi
    else
        log_error "Farms API endpoint not responding"
    fi

    # Products API endpoint
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    log_info "Testing /api/products..."
    if curl -sf http://localhost:3001/api/products > /dev/null 2>&1; then
        PRODUCTS_RESPONSE=$(curl -s http://localhost:3001/api/products)

        if echo $PRODUCTS_RESPONSE | grep -q '"success":true'; then
            log_success "Products API endpoint responding correctly"
        else
            log_error "Products API returned error response"
        fi
    else
        log_error "Products API endpoint not responding"
    fi

    # Auth endpoints
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    log_info "Testing /api/auth/session..."
    if curl -sf http://localhost:3001/api/auth/session > /dev/null 2>&1; then
        log_success "Auth session endpoint responding"
    else
        log_warning "Auth session endpoint issue (may require NextAuth setup)"
    fi
fi

# ============================================================================
# SECTION 4: LOG FILE ANALYSIS
# ============================================================================
log_header "4. LOG FILE ANALYSIS"

TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
if [ -f "dev-server.log" ]; then
    log_success "Dev server log file exists"

    # Check for Redis errors
    REDIS_ERRORS=$(grep -c "ENOTFOUND redis" dev-server.log 2>/dev/null || echo "0")
    if [ "$REDIS_ERRORS" -eq 0 ]; then
        log_success "No Redis connection errors in logs"
    else
        log_error "Found $REDIS_ERRORS Redis connection errors"
    fi

    # Check for Prisma errors
    PRISMA_ERRORS=$(grep -c "Unknown argument" dev-server.log 2>/dev/null || echo "0")
    if [ "$PRISMA_ERRORS" -eq 0 ]; then
        log_success "No Prisma validation errors in logs"
    else
        log_error "Found $PRISMA_ERRORS Prisma validation errors"
    fi

    # Check for React errors
    REACT_ERRORS=$(grep -c "Cannot read properties of undefined" dev-server.log 2>/dev/null || echo "0")
    if [ "$REACT_ERRORS" -eq 0 ]; then
        log_success "No React undefined property errors in logs"
    else
        log_error "Found $REACT_ERRORS React undefined property errors"
    fi

    # Check for 500 errors
    ERROR_500=$(grep -c " 500 in" dev-server.log 2>/dev/null || echo "0")
    if [ "$ERROR_500" -eq 0 ]; then
        log_success "No 500 Internal Server Errors in logs"
    else
        log_warning "Found $ERROR_500 occurrences of 500 errors"
    fi
else
    log_warning "No dev-server.log file found"
fi

# ============================================================================
# SECTION 5: CODE STRUCTURE VERIFICATION
# ============================================================================
log_header "5. CODE STRUCTURE VERIFICATION"

# Check critical files exist
CRITICAL_FILES=(
    "src/lib/database/index.ts"
    "src/lib/repositories/base.repository.ts"
    "src/lib/repositories/farm.repository.ts"
    "src/lib/cache/index.ts"
    "src/components/layout/CustomerHeader.tsx"
    "src/app/(customer)/marketplace/products/page.tsx"
)

for file in "${CRITICAL_FILES[@]}"; do
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    if [ -f "$file" ]; then
        log_success "Found: $file"
    else
        log_error "Missing: $file"
    fi
done

# Check for canonical database import pattern
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
if grep -r "from \"@/lib/database\"" src/ > /dev/null 2>&1; then
    log_success "Canonical database import pattern in use"
else
    log_warning "May not be using canonical database import"
fi

# ============================================================================
# SECTION 6: DATABASE CONNECTIVITY
# ============================================================================
log_header "6. DATABASE CONNECTIVITY"

TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
log_info "Testing database connection..."
if npx prisma db execute --stdin <<< "SELECT 1;" > /dev/null 2>&1; then
    log_success "Database connection successful"
else
    log_error "Database connection failed"
fi

# ============================================================================
# SECTION 7: DOCUMENTATION CHECKS
# ============================================================================
log_header "7. DOCUMENTATION CHECKS"

DOC_FILES=(
    "REDIS_SETUP.md"
    "FIXES_APPLIED_2025-12-06.md"
)

for doc in "${DOC_FILES[@]}"; do
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    if [ -f "$doc" ]; then
        log_success "Documentation exists: $doc"
    else
        log_warning "Documentation missing: $doc"
    fi
done

# ============================================================================
# SECTION 8: PERFORMANCE METRICS
# ============================================================================
if [ "$SERVER_RUNNING" = true ]; then
    log_header "8. PERFORMANCE METRICS"

    log_info "Collecting performance data..."
    HEALTH_DATA=$(curl -s http://localhost:3001/api/health 2>/dev/null)

    if [ ! -z "$HEALTH_DATA" ]; then
        MEMORY_PERCENT=$(echo $HEALTH_DATA | grep -o '"percentage":[0-9]*' | head -1 | cut -d':' -f2)
        RESPONSE_TIME=$(echo $HEALTH_DATA | grep -o '"responseTime":[0-9]*' | tail -1 | cut -d':' -f2)
        UPTIME=$(echo $HEALTH_DATA | grep -o '"uptime":[0-9.]*' | cut -d':' -f2)

        if [ ! -z "$MEMORY_PERCENT" ]; then
            if [ "$MEMORY_PERCENT" -lt 85 ]; then
                log_success "Memory usage: ${MEMORY_PERCENT}% (healthy)"
            elif [ "$MEMORY_PERCENT" -lt 95 ]; then
                log_warning "Memory usage: ${MEMORY_PERCENT}% (elevated)"
            else
                log_error "Memory usage: ${MEMORY_PERCENT}% (critical)"
            fi
        fi

        if [ ! -z "$RESPONSE_TIME" ]; then
            if [ "$RESPONSE_TIME" -lt 100 ]; then
                log_success "API response time: ${RESPONSE_TIME}ms (excellent)"
            elif [ "$RESPONSE_TIME" -lt 500 ]; then
                log_success "API response time: ${RESPONSE_TIME}ms (good)"
            else
                log_warning "API response time: ${RESPONSE_TIME}ms (slow)"
            fi
        fi

        if [ ! -z "$UPTIME" ]; then
            log_info "Server uptime: ${UPTIME}s"
        fi
    fi
fi

# ============================================================================
# SECTION 9: RUN AUTOMATED TESTS (if server is running)
# ============================================================================
if [ "$SERVER_RUNNING" = true ]; then
    log_header "9. AUTOMATED BOT TESTS"

    log_info "Running website checker bot..."
    if npm run bot:check:dev > bot-results.log 2>&1; then
        BOT_SUCCESS=$(grep -c "✅ Passed:" bot-results.log || echo "0")
        BOT_FAILED=$(grep -c "❌ Failed:" bot-results.log || echo "0")

        if [ "$BOT_FAILED" -eq 0 ]; then
            log_success "Website checker bot: All checks passed"
        else
            log_error "Website checker bot: $BOT_FAILED checks failed"
            log_info "See bot-results.log for details"
        fi
    else
        log_warning "Website checker bot encountered issues - see bot-results.log"
    fi

    # Workflow monitor
    log_info "Running workflow monitor..."
    if npm run monitor:health > monitor-results.log 2>&1; then
        log_success "Workflow monitor: Health checks passed"
    else
        log_warning "Workflow monitor: Some checks may have issues"
    fi
fi

# ============================================================================
# FINAL SUMMARY
# ============================================================================
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}📊 VERIFICATION SUMMARY${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

SUCCESS_RATE=0
if [ $TOTAL_CHECKS -gt 0 ]; then
    SUCCESS_RATE=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))
fi

echo -e "   Total Checks:    ${CYAN}$TOTAL_CHECKS${NC}"
echo -e "   ✅ Passed:       ${GREEN}$PASSED_CHECKS${NC}"
echo -e "   ❌ Failed:       ${RED}$FAILED_CHECKS${NC}"
echo -e "   ⚠️  Warnings:     ${YELLOW}$WARNINGS${NC}"
echo -e "   📈 Success Rate: ${CYAN}${SUCCESS_RATE}%${NC}"
echo ""

if [ $FAILED_CHECKS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                              ║${NC}"
    echo -e "${GREEN}║     ✨ ALL CHECKS PASSED - SYSTEM IS HEALTHY! ✨             ║${NC}"
    echo -e "${GREEN}║                                                              ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
    EXIT_CODE=0
elif [ $FAILED_CHECKS -eq 0 ]; then
    echo -e "${YELLOW}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║                                                              ║${NC}"
    echo -e "${YELLOW}║     ⚠️  CHECKS PASSED WITH WARNINGS ⚠️                       ║${NC}"
    echo -e "${YELLOW}║                                                              ║${NC}"
    echo -e "${YELLOW}╚══════════════════════════════════════════════════════════════╝${NC}"
    EXIT_CODE=0
else
    echo -e "${RED}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║                                                              ║${NC}"
    echo -e "${RED}║     ❌ SOME CHECKS FAILED - REVIEW REQUIRED ❌               ║${NC}"
    echo -e "${RED}║                                                              ║${NC}"
    echo -e "${RED}╚══════════════════════════════════════════════════════════════╝${NC}"
    EXIT_CODE=1
fi

echo ""
echo -e "${CYAN}📝 Next Steps:${NC}"
if [ "$SERVER_RUNNING" = false ]; then
    echo -e "   1. Start dev server: ${YELLOW}npm run dev${NC}"
    echo -e "   2. Re-run this script: ${YELLOW}bash verify-all-fixes.sh${NC}"
elif [ $FAILED_CHECKS -gt 0 ]; then
    echo -e "   1. Review error messages above"
    echo -e "   2. Check log files: dev-server.log, bot-results.log"
    echo -e "   3. Fix issues and re-run verification"
else
    echo -e "   1. Continue development with confidence! 🚀"
    echo -e "   2. Run automated tests: ${YELLOW}npm run bot:check:dev${NC}"
    echo -e "   3. Monitor health: ${YELLOW}npm run monitor:all${NC}"
fi

echo ""
echo -e "${CYAN}📚 Documentation:${NC}"
echo -e "   • Redis Setup: ${YELLOW}REDIS_SETUP.md${NC}"
echo -e "   • Applied Fixes: ${YELLOW}FIXES_APPLIED_2025-12-06.md${NC}"
echo -e "   • Divine Instructions: ${YELLOW}.github/instructions/${NC}"
echo ""

exit $EXIT_CODE
