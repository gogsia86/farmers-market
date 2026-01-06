#!/bin/bash

# 🔍 Vercel Environment Variables Checker
# Checks and validates Vercel environment variables for deployment
# Usage: ./scripts/check-vercel-env.sh [environment]
# Example: ./scripts/check-vercel-env.sh production

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Environment (default to production)
ENV="${1:-production}"

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "🔍 VERCEL ENVIRONMENT VARIABLES CHECKER"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Environment: ${BOLD}${ENV}${NC}"
echo "Date: $(date)"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI not found${NC}"
    echo ""
    echo "Install with: npm i -g vercel"
    echo "Or use: npx vercel"
    exit 1
fi

echo -e "${GREEN}✅ Vercel CLI found${NC}"
echo ""

# Login check
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Step 1: Checking Vercel Authentication"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if ! vercel whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Vercel${NC}"
    echo ""
    echo "Please login first:"
    echo "  npx vercel login"
    exit 1
fi

VERCEL_USER=$(vercel whoami 2>/dev/null)
echo -e "${GREEN}✅ Logged in as: ${BOLD}${VERCEL_USER}${NC}"
echo ""

# Fetch environment variables
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Step 2: Fetching Environment Variables"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Get list of environment variables
ENV_OUTPUT=$(vercel env ls "$ENV" 2>&1)

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to fetch environment variables${NC}"
    echo ""
    echo "Error:"
    echo "$ENV_OUTPUT"
    exit 1
fi

echo -e "${GREEN}✅ Successfully fetched environment variables${NC}"
echo ""

# Define required variables
declare -a REQUIRED_VARS=(
    "DATABASE_URL"
    "NEXTAUTH_SECRET"
    "NEXTAUTH_URL"
)

# Define recommended variables
declare -a RECOMMENDED_VARS=(
    "ENABLE_TRACING"
    "NODE_ENV"
    "NEXT_PUBLIC_APP_URL"
)

# Define optional variables
declare -a OPTIONAL_VARS=(
    "SENTRY_DSN"
    "SENTRY_AUTH_TOKEN"
    "NEXT_PUBLIC_SENTRY_DSN"
    "STRIPE_SECRET_KEY"
    "STRIPE_PUBLISHABLE_KEY"
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
    "GOOGLE_MAPS_API_KEY"
    "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"
    "RESEND_API_KEY"
    "REDIS_URL"
    "OTEL_EXPORTER_OTLP_ENDPOINT"
    "OTEL_SERVICE_NAME"
    "AZURE_APPINSIGHTS_CONNECTION_STRING"
)

# Check variables function
check_variable() {
    local var_name="$1"
    if echo "$ENV_OUTPUT" | grep -q "^$var_name"; then
        return 0
    else
        return 1
    fi
}

# Track results
MISSING_REQUIRED=()
MISSING_RECOMMENDED=()
PRESENT_OPTIONAL=()

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Step 3: Checking Required Variables"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

for var in "${REQUIRED_VARS[@]}"; do
    if check_variable "$var"; then
        echo -e "  ${GREEN}✅${NC} $var"
    else
        echo -e "  ${RED}❌${NC} $var ${RED}(MISSING)${NC}"
        MISSING_REQUIRED+=("$var")
    fi
done

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Step 4: Checking Recommended Variables"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

for var in "${RECOMMENDED_VARS[@]}"; do
    if check_variable "$var"; then
        echo -e "  ${GREEN}✅${NC} $var"
    else
        echo -e "  ${YELLOW}⚠️${NC}  $var ${YELLOW}(not set)${NC}"
        MISSING_RECOMMENDED+=("$var")
    fi
done

echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Step 5: Checking Optional Variables"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

for var in "${OPTIONAL_VARS[@]}"; do
    if check_variable "$var"; then
        echo -e "  ${GREEN}✅${NC} $var"
        PRESENT_OPTIONAL+=("$var")
    else
        echo -e "  ${CYAN}ℹ️${NC}  $var ${CYAN}(not set - optional)${NC}"
    fi
done

echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

REQUIRED_COUNT=${#REQUIRED_VARS[@]}
MISSING_REQ_COUNT=${#MISSING_REQUIRED[@]}
PRESENT_REQ_COUNT=$((REQUIRED_COUNT - MISSING_REQ_COUNT))

RECOMMENDED_COUNT=${#RECOMMENDED_VARS[@]}
MISSING_REC_COUNT=${#MISSING_RECOMMENDED[@]}
PRESENT_REC_COUNT=$((RECOMMENDED_COUNT - MISSING_REC_COUNT))

OPTIONAL_COUNT=${#OPTIONAL_VARS[@]}
PRESENT_OPT_COUNT=${#PRESENT_OPTIONAL[@]}

echo -e "${BOLD}Required Variables:${NC}     ${GREEN}${PRESENT_REQ_COUNT}${NC}/${REQUIRED_COUNT} set"
echo -e "${BOLD}Recommended Variables:${NC}  ${GREEN}${PRESENT_REC_COUNT}${NC}/${RECOMMENDED_COUNT} set"
echo -e "${BOLD}Optional Variables:${NC}     ${GREEN}${PRESENT_OPT_COUNT}${NC}/${OPTIONAL_COUNT} set"
echo ""

# Detailed results
if [ ${#MISSING_REQUIRED[@]} -gt 0 ]; then
    echo -e "${RED}${BOLD}⚠️  CRITICAL: Missing Required Variables${NC}"
    echo ""
    for var in "${MISSING_REQUIRED[@]}"; do
        echo -e "  ${RED}❌${NC} $var"

        # Provide specific instructions
        case "$var" in
            DATABASE_URL)
                echo -e "     ${CYAN}Command:${NC} npx vercel env add DATABASE_URL $ENV"
                echo -e "     ${CYAN}Format:${NC}  postgresql://user:pass@host:5432/db?sslmode=require"
                ;;
            NEXTAUTH_SECRET)
                echo -e "     ${CYAN}Command:${NC} npx vercel env add NEXTAUTH_SECRET $ENV"
                echo -e "     ${CYAN}Generate:${NC} openssl rand -base64 32"
                ;;
            NEXTAUTH_URL)
                echo -e "     ${CYAN}Command:${NC} npx vercel env add NEXTAUTH_URL $ENV"
                echo -e "     ${CYAN}Value:${NC}   https://your-domain.vercel.app"
                ;;
        esac
        echo ""
    done
fi

if [ ${#MISSING_RECOMMENDED[@]} -gt 0 ]; then
    echo -e "${YELLOW}${BOLD}⚠️  Missing Recommended Variables${NC}"
    echo ""
    for var in "${MISSING_RECOMMENDED[@]}"; do
        echo -e "  ${YELLOW}⚠️${NC}  $var"

        case "$var" in
            ENABLE_TRACING)
                echo -e "     ${CYAN}Command:${NC} npx vercel env add ENABLE_TRACING $ENV"
                echo -e "     ${CYAN}Value:${NC}   false ${CYAN}(recommended for production)${NC}"
                ;;
            NODE_ENV)
                echo -e "     ${CYAN}Command:${NC} npx vercel env add NODE_ENV $ENV"
                echo -e "     ${CYAN}Value:${NC}   production"
                ;;
            NEXT_PUBLIC_APP_URL)
                echo -e "     ${CYAN}Command:${NC} npx vercel env add NEXT_PUBLIC_APP_URL $ENV"
                echo -e "     ${CYAN}Value:${NC}   https://your-domain.vercel.app"
                ;;
        esac
        echo ""
    done
fi

# Overall status
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 DEPLOYMENT STATUS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ ${#MISSING_REQUIRED[@]} -eq 0 ]; then
    echo -e "${GREEN}${BOLD}✅ ALL REQUIRED VARIABLES ARE SET${NC}"
    echo ""
    echo "Your application should be able to start successfully."
    echo ""

    if [ ${#MISSING_RECOMMENDED[@]} -gt 0 ]; then
        echo -e "${YELLOW}Note: Some recommended variables are missing.${NC}"
        echo "      The app will work but may show warnings."
    fi
else
    echo -e "${RED}${BOLD}❌ DEPLOYMENT WILL FAIL${NC}"
    echo ""
    echo "Missing required variables: ${#MISSING_REQUIRED[@]}"
    echo ""
    echo "Fix with these commands:"
    echo ""
    for var in "${MISSING_REQUIRED[@]}"; do
        echo "  npx vercel env add $var $ENV"
    done
    echo ""
    exit 1
fi

echo ""

# Next steps
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 NEXT STEPS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. If you made any changes, redeploy:"
echo "   ${CYAN}git push origin master${NC}"
echo ""
echo "2. Check deployment logs:"
echo "   ${CYAN}npx vercel logs --follow${NC}"
echo ""
echo "3. Test health endpoint after deployment:"
echo "   ${CYAN}curl https://your-domain.vercel.app/api/health${NC}"
echo ""
echo "4. View all environment variables:"
echo "   ${CYAN}npx vercel env ls $ENV${NC}"
echo ""

echo "════════════════════════════════════════════════════════════════"
echo ""
