#!/bin/bash

# 🔍 COMPREHENSIVE DEPLOYMENT DIAGNOSTIC SCRIPT
# Diagnoses Vercel deployment issues and provides actionable fixes
# Usage: ./scripts/diagnose-deployment.sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'
BOLD='\033[1m'

# Emoji support
CHECK="✅"
CROSS="❌"
WARN="⚠️"
INFO="ℹ️"
ROCKET="🚀"
WRENCH="🔧"
SEARCH="🔍"
PACKAGE="📦"
DATABASE="🗄️"
LOCK="🔐"
HEALTH="🏥"

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "${SEARCH} FARMERS MARKET PLATFORM - DEPLOYMENT DIAGNOSTICS"
echo "═══════════════════════════════════════════════════════════════════"
echo ""
echo "Date: $(date)"
echo "Running comprehensive deployment checks..."
echo ""

ISSUES_FOUND=0
WARNINGS_FOUND=0

# ============================================================================
# 1. CHECK LOCAL ENVIRONMENT
# ============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Step 1: Checking Local Environment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Node.js version
echo -n "Checking Node.js version... "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}${CHECK} ${NODE_VERSION}${NC}"

    # Check if it's Node 20.x
    if [[ $NODE_VERSION == v20.* ]]; then
        echo -e "  ${GREEN}${CHECK} Using Node.js 20.x (correct)${NC}"
    else
        echo -e "  ${YELLOW}${WARN} Recommended: Node.js 20.x${NC}"
        WARNINGS_FOUND=$((WARNINGS_FOUND + 1))
    fi
else
    echo -e "${RED}${CROSS} Node.js not found${NC}"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

echo ""

# npm version
echo -n "Checking npm version... "
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}${CHECK} ${NPM_VERSION}${NC}"
else
    echo -e "${RED}${CROSS} npm not found${NC}"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

echo ""

# Git status
echo -n "Checking git status... "
if git status &> /dev/null; then
    BRANCH=$(git branch --show-current)
    echo -e "${GREEN}${CHECK} Branch: ${BRANCH}${NC}"

    # Check for uncommitted changes
    if [[ -n $(git status -s) ]]; then
        echo -e "  ${YELLOW}${WARN} Uncommitted changes detected:${NC}"
        git status -s | head -5
        WARNINGS_FOUND=$((WARNINGS_FOUND + 1))
    else
        echo -e "  ${GREEN}${CHECK} No uncommitted changes${NC}"
    fi
else
    echo -e "${RED}${CROSS} Not a git repository${NC}"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

echo ""

# ============================================================================
# 2. CHECK PACKAGE CONFIGURATION
# ============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Step 2: Checking Package Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check package.json exists
if [ -f "package.json" ]; then
    echo -e "${GREEN}${CHECK} package.json found${NC}"

    # Check node version in package.json
    NODE_ENGINE=$(node -pe "require('./package.json').engines.node" 2>/dev/null || echo "not specified")
    echo "  Node engine: ${NODE_ENGINE}"

    if [[ $NODE_ENGINE == "20.x" ]]; then
        echo -e "  ${GREEN}${CHECK} Node version correctly specified as 20.x${NC}"
    elif [[ $NODE_ENGINE == *">="* ]]; then
        echo -e "  ${YELLOW}${WARN} Using >= operator will auto-upgrade on major versions${NC}"
        echo -e "  ${CYAN}Fix: Change to \"node\": \"20.x\"${NC}"
        WARNINGS_FOUND=$((WARNINGS_FOUND + 1))
    fi

    # Check for critical dependencies
    echo ""
    echo "Checking critical dependencies:"

    DEPS=(
        "next"
        "prisma"
        "@prisma/client"
        "next-auth"
        "nodemailer"
    )

    for dep in "${DEPS[@]}"; do
        VERSION=$(node -pe "require('./package.json').dependencies['$dep'] || require('./package.json').devDependencies['$dep']" 2>/dev/null || echo "missing")
        if [[ $VERSION != "missing" ]]; then
            echo -e "  ${GREEN}${CHECK}${NC} $dep: ${VERSION}"
        else
            echo -e "  ${RED}${CROSS}${NC} $dep: not found"
            ISSUES_FOUND=$((ISSUES_FOUND + 1))
        fi
    done

    # Check nodemailer version
    NODEMAILER_VERSION=$(node -pe "require('./package.json').dependencies['nodemailer']" 2>/dev/null || echo "missing")
    if [[ $NODEMAILER_VERSION == *"^6."* ]]; then
        echo -e "  ${GREEN}${CHECK} nodemailer v6.x (compatible with @auth/core)${NC}"
    elif [[ $NODEMAILER_VERSION == *"^7."* ]]; then
        echo -e "  ${YELLOW}${WARN} nodemailer v7.x may have peer dependency conflicts${NC}"
        echo -e "  ${CYAN}Fix: npm install nodemailer@^6.9.16${NC}"
        WARNINGS_FOUND=$((WARNINGS_FOUND + 1))
    fi

else
    echo -e "${RED}${CROSS} package.json not found${NC}"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

echo ""

# ============================================================================
# 3. CHECK VERCEL CONFIGURATION
# ============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Step 3: Checking Vercel Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -f "vercel.json" ]; then
    echo -e "${GREEN}${CHECK} vercel.json found${NC}"

    # Check for memory settings (should be removed)
    if grep -q '"memory"' vercel.json; then
        echo -e "  ${YELLOW}${WARN} Memory settings found (ignored on Active CPU billing)${NC}"
        echo -e "  ${CYAN}Fix: Remove 'memory' settings from vercel.json${NC}"
        WARNINGS_FOUND=$((WARNINGS_FOUND + 1))
    else
        echo -e "  ${GREEN}${CHECK} No deprecated memory settings${NC}"
    fi

    # Check build command
    BUILD_CMD=$(node -pe "require('./vercel.json').buildCommand" 2>/dev/null || echo "not specified")
    echo "  Build command: ${BUILD_CMD}"

    # Check output directory
    OUTPUT_DIR=$(node -pe "require('./vercel.json').outputDirectory" 2>/dev/null || echo "not specified")
    echo "  Output directory: ${OUTPUT_DIR}"

else
    echo -e "${YELLOW}${WARN} vercel.json not found (using defaults)${NC}"
fi

echo ""

# ============================================================================
# 4. CHECK CRITICAL FILES
# ============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Step 4: Checking Critical Files"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

CRITICAL_FILES=(
    "next.config.mjs:Next.js configuration"
    "prisma/schema.prisma:Prisma database schema"
    "src/lib/database/index.ts:Database singleton"
    "src/lib/auth/config.ts:Authentication configuration"
    "middleware.ts:Next.js middleware"
    "instrumentation.ts:OpenTelemetry instrumentation"
)

for item in "${CRITICAL_FILES[@]}"; do
    FILE="${item%%:*}"
    DESC="${item##*:}"

    if [ -f "$FILE" ]; then
        echo -e "${GREEN}${CHECK}${NC} $FILE"
    else
        echo -e "${RED}${CROSS}${NC} $FILE (${DESC})"
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
    fi
done

echo ""

# Check for canonical database import
if [ -f "src/lib/database/index.ts" ]; then
    if grep -q "new PrismaClient" src/lib/database/index.ts; then
        echo -e "${GREEN}${CHECK} Database singleton pattern used${NC}"
    else
        echo -e "${YELLOW}${WARN} Database singleton may not be properly implemented${NC}"
        WARNINGS_FOUND=$((WARNINGS_FOUND + 1))
    fi
fi

echo ""

# ============================================================================
# 5. CHECK ENVIRONMENT CONFIGURATION
# ============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Step 5: Checking Local Environment Variables"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

REQUIRED_ENV_VARS=(
    "DATABASE_URL"
    "NEXTAUTH_SECRET"
    "NEXTAUTH_URL"
)

echo "Checking .env.local file:"
if [ -f ".env.local" ]; then
    echo -e "${GREEN}${CHECK} .env.local exists${NC}"
    echo ""

    for var in "${REQUIRED_ENV_VARS[@]}"; do
        if grep -q "^${var}=" .env.local 2>/dev/null; then
            echo -e "  ${GREEN}${CHECK}${NC} $var"
        else
            echo -e "  ${YELLOW}${WARN}${NC} $var (not set locally)"
        fi
    done
else
    echo -e "${YELLOW}${WARN} .env.local not found${NC}"
    echo "  This is OK if using Vercel environment variables"
fi

echo ""

# ============================================================================
# 6. CHECK PRISMA
# ============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Step 6: Checking Prisma Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -f "prisma/schema.prisma" ]; then
    echo -e "${GREEN}${CHECK} Prisma schema found${NC}"

    # Check if Prisma client is generated
    if [ -d "node_modules/@prisma/client" ]; then
        echo -e "${GREEN}${CHECK} Prisma Client generated${NC}"
    else
        echo -e "${YELLOW}${WARN} Prisma Client not generated${NC}"
        echo -e "  ${CYAN}Run: npx prisma generate${NC}"
        WARNINGS_FOUND=$((WARNINGS_FOUND + 1))
    fi
else
    echo -e "${RED}${CROSS} Prisma schema not found${NC}"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

echo ""

# ============================================================================
# 7. TEST BUILD LOCALLY
# ============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Step 7: Testing Local Build"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Checking if dependencies are installed..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}${CHECK} node_modules exists${NC}"
else
    echo -e "${YELLOW}${WARN} node_modules not found${NC}"
    echo -e "  ${CYAN}Run: npm install${NC}"
    WARNINGS_FOUND=$((WARNINGS_FOUND + 1))
fi

echo ""

# ============================================================================
# 8. CHECK VERCEL CLI & ENVIRONMENT
# ============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Step 8: Checking Vercel CLI"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if command -v vercel &> /dev/null; then
    echo -e "${GREEN}${CHECK} Vercel CLI installed${NC}"

    # Check if logged in
    if vercel whoami &> /dev/null; then
        VERCEL_USER=$(vercel whoami 2>/dev/null)
        echo -e "${GREEN}${CHECK} Logged in as: ${VERCEL_USER}${NC}"

        echo ""
        echo "To check production environment variables, run:"
        echo -e "  ${CYAN}./scripts/check-vercel-env.sh production${NC}"
        echo ""
        echo "Or manually:"
        echo -e "  ${CYAN}npx vercel env ls production${NC}"

    else
        echo -e "${YELLOW}${WARN} Not logged in to Vercel${NC}"
        echo -e "  ${CYAN}Run: npx vercel login${NC}"
    fi
else
    echo -e "${YELLOW}${WARN} Vercel CLI not installed${NC}"
    echo -e "  ${CYAN}Install: npm i -g vercel${NC}"
    echo -e "  ${CYAN}Or use: npx vercel${NC}"
fi

echo ""

# ============================================================================
# 9. HEALTH CHECK ENDPOINT
# ============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Step 9: Checking Health Endpoint"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -f "src/app/api/health/route.ts" ]; then
    echo -e "${GREEN}${CHECK} Health check endpoint exists${NC}"
    echo ""
    echo "After deployment, test with:"
    echo -e "  ${CYAN}curl https://your-domain.vercel.app/api/health | jq${NC}"
else
    echo -e "${YELLOW}${WARN} Health check endpoint not found${NC}"
    echo "  Recommended: Create src/app/api/health/route.ts"
fi

echo ""

# ============================================================================
# SUMMARY
# ============================================================================
echo "═══════════════════════════════════════════════════════════════════"
echo "📊 DIAGNOSTIC SUMMARY"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

echo -e "${BOLD}Issues Found:${NC}    ${RED}${ISSUES_FOUND}${NC}"
echo -e "${BOLD}Warnings:${NC}        ${YELLOW}${WARNINGS_FOUND}${NC}"
echo ""

if [ $ISSUES_FOUND -eq 0 ] && [ $WARNINGS_FOUND -eq 0 ]; then
    echo -e "${GREEN}${BOLD}${CHECK} ALL CHECKS PASSED${NC}"
    echo ""
    echo "Your local environment is properly configured!"
    echo ""
    echo "Next steps:"
    echo "1. Check Vercel environment variables:"
    echo -e "   ${CYAN}./scripts/check-vercel-env.sh production${NC}"
    echo ""
    echo "2. Deploy to Vercel:"
    echo -e "   ${CYAN}git push origin master${NC}"
    echo ""
    echo "3. Monitor deployment:"
    echo -e "   ${CYAN}npx vercel logs --follow${NC}"

elif [ $ISSUES_FOUND -eq 0 ]; then
    echo -e "${YELLOW}${BOLD}${WARN} WARNINGS DETECTED${NC}"
    echo ""
    echo "Your configuration has some warnings but should work."
    echo "Consider fixing the warnings for optimal performance."

else
    echo -e "${RED}${BOLD}${CROSS} CRITICAL ISSUES FOUND${NC}"
    echo ""
    echo "Please fix the critical issues before deploying."
    echo ""
    echo "Quick fixes:"
    echo ""

    if [ ! -d "node_modules" ]; then
        echo "1. Install dependencies:"
        echo -e "   ${CYAN}npm install${NC}"
        echo ""
    fi

    if [ ! -f "src/lib/database/index.ts" ]; then
        echo "2. Database configuration is missing"
        echo "   Check: src/lib/database/index.ts"
        echo ""
    fi

    echo "3. After fixes, run this diagnostic again:"
    echo -e "   ${CYAN}./scripts/diagnose-deployment.sh${NC}"
fi

echo ""

# ============================================================================
# COMMON FIXES
# ============================================================================
echo "═══════════════════════════════════════════════════════════════════"
echo "🔧 COMMON FIXES FOR RUNTIME ERRORS"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

echo "If deployment builds successfully but crashes at runtime:"
echo ""

echo "${BOLD}1. Missing Environment Variables (90% of cases)${NC}"
echo "   Check required variables in Vercel:"
echo -e "   ${CYAN}npx vercel env ls production${NC}"
echo ""
echo "   Required:"
echo "   - DATABASE_URL"
echo "   - NEXTAUTH_SECRET"
echo "   - NEXTAUTH_URL"
echo ""

echo "${BOLD}2. Database Connection Issues${NC}"
echo "   Ensure DATABASE_URL includes:"
echo "   - Correct host and credentials"
echo "   - ?sslmode=require (for production)"
echo "   - Connection pooling (if using serverless)"
echo ""

echo "${BOLD}3. Tracing/Instrumentation Crash${NC}"
echo "   Disable OpenTelemetry if not configured:"
echo -e "   ${CYAN}npx vercel env add ENABLE_TRACING production${NC}"
echo "   Enter: false"
echo ""

echo "${BOLD}4. Get Runtime Logs${NC}"
echo "   View actual error from Vercel:"
echo -e "   ${CYAN}npx vercel logs --follow${NC}"
echo ""

echo "═══════════════════════════════════════════════════════════════════"
echo ""

exit $ISSUES_FOUND
