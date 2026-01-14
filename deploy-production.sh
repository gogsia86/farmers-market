#!/bin/bash

# 🚀 Farmers Market Platform - Production Deployment Script
# This script helps deploy to Vercel with all required environment variables

set -e

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  🌾 FARMERS MARKET PLATFORM - PRODUCTION DEPLOYMENT          ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI not found!${NC}"
    echo "Install it with: npm install -g vercel"
    exit 1
fi

echo -e "${GREEN}✅ Vercel CLI found${NC}"
echo ""

# Check if logged in
if ! vercel whoami &> /dev/null; then
    echo -e "${RED}❌ Not logged in to Vercel${NC}"
    echo "Run: vercel login"
    exit 1
fi

VERCEL_USER=$(vercel whoami)
echo -e "${GREEN}✅ Logged in as: ${VERCEL_USER}${NC}"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${RED}❌ .env.local file not found!${NC}"
    echo "This file contains your API keys and secrets."
    exit 1
fi

echo -e "${GREEN}✅ .env.local file found${NC}"
echo ""

# Function to check if env var exists in .env.local
check_env_var() {
    local var_name=$1
    if grep -q "^${var_name}=" .env.local; then
        echo -e "${GREEN}✓${NC} ${var_name}"
        return 0
    else
        echo -e "${RED}✗${NC} ${var_name} ${RED}(MISSING)${NC}"
        return 1
    fi
}

# Check required environment variables
echo "📋 Checking required environment variables in .env.local..."
echo ""

REQUIRED_VARS=(
    "DATABASE_URL"
    "OPENAI_API_KEY"
    "UPSTASH_REDIS_REST_URL"
    "UPSTASH_REDIS_REST_TOKEN"
    "NEXTAUTH_SECRET"
)

OPTIONAL_VARS=(
    "REDIS_URL"
    "NEXTAUTH_URL"
    "NEXT_PUBLIC_APP_URL"
    "STRIPE_SECRET_KEY"
    "SENTRY_DSN"
)

ALL_PRESENT=true

echo "Required Variables:"
for var in "${REQUIRED_VARS[@]}"; do
    if ! check_env_var "$var"; then
        ALL_PRESENT=false
    fi
done

echo ""
echo "Optional Variables:"
for var in "${OPTIONAL_VARS[@]}"; do
    check_env_var "$var" || true
done

echo ""

if [ "$ALL_PRESENT" = false ]; then
    echo -e "${RED}❌ Some required environment variables are missing!${NC}"
    echo "Please add them to .env.local and try again."
    exit 1
fi

echo -e "${GREEN}✅ All required environment variables present${NC}"
echo ""

# Pre-deployment checks
echo "🔍 Running pre-deployment checks..."
echo ""

echo "1️⃣  Running TypeScript check..."
if npm run type-check > /dev/null 2>&1; then
    echo -e "${GREEN}✅ TypeScript check passed${NC}"
else
    echo -e "${RED}❌ TypeScript check failed${NC}"
    echo "Run 'npm run type-check' to see errors"
    exit 1
fi

echo "2️⃣  Running ESLint..."
if npm run lint > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Lint check passed${NC}"
else
    echo -e "${YELLOW}⚠️  Lint check has warnings (continuing anyway)${NC}"
fi

echo "3️⃣  Testing build..."
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    echo "Run 'npm run build' to see errors"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ All pre-deployment checks passed!${NC}"
echo ""

# Ask user what they want to do
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  What would you like to do?                                  ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "1) Copy environment variables to Vercel (required first time)"
echo "2) Deploy to production"
echo "3) Both (copy env vars + deploy)"
echo "4) Exit"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo "📤 Copying environment variables to Vercel..."
        echo ""

        # Get project name
        read -p "Enter your Vercel project name (or press Enter to skip): " PROJECT_NAME

        if [ -z "$PROJECT_NAME" ]; then
            echo -e "${YELLOW}⚠️  No project name provided. Using current directory.${NC}"
        else
            PROJECT_FLAG="--scope=$VERCEL_USER --project=$PROJECT_NAME"
        fi

        echo ""
        echo "Copying variables to Production environment..."
        echo ""

        # Read .env.local and add each variable
        while IFS='=' read -r key value; do
            # Skip comments and empty lines
            [[ $key =~ ^#.*$ ]] && continue
            [[ -z $key ]] && continue

            # Remove quotes if present
            value=$(echo $value | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")

            echo "Setting: $key"

            # Special handling for production URLs
            if [[ $key == "NEXTAUTH_URL" ]] || [[ $key == "NEXT_PUBLIC_APP_URL" ]]; then
                echo -e "${YELLOW}⚠️  Please update $key to your production domain after deployment${NC}"
            fi

            # Add to Vercel (this will prompt if variable already exists)
            echo "$value" | vercel env add "$key" production $PROJECT_FLAG 2>&1 | grep -v "Error: The specified value already exists" || true

        done < .env.local

        echo ""
        echo -e "${GREEN}✅ Environment variables copied to Vercel!${NC}"
        echo ""
        echo "📝 IMPORTANT: Update these URLs in Vercel dashboard after deployment:"
        echo "   - NEXTAUTH_URL (set to your production domain)"
        echo "   - NEXT_PUBLIC_APP_URL (set to your production domain)"
        echo ""
        echo "Visit: https://vercel.com/dashboard → Your Project → Settings → Environment Variables"
        ;;

    2)
        echo ""
        echo "🚀 Deploying to production..."
        echo ""
        vercel --prod
        ;;

    3)
        echo ""
        echo "📤 Step 1: Copying environment variables to Vercel..."
        echo ""

        # Get project name
        read -p "Enter your Vercel project name (or press Enter to skip): " PROJECT_NAME

        if [ -z "$PROJECT_NAME" ]; then
            echo -e "${YELLOW}⚠️  No project name provided. Using current directory.${NC}"
        else
            PROJECT_FLAG="--scope=$VERCEL_USER --project=$PROJECT_NAME"
        fi

        echo ""
        echo "Copying variables to Production environment..."
        echo ""

        # Read .env.local and add each variable
        while IFS='=' read -r key value; do
            # Skip comments and empty lines
            [[ $key =~ ^#.*$ ]] && continue
            [[ -z $key ]] && continue

            # Remove quotes if present
            value=$(echo $value | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")

            echo "Setting: $key"
            echo "$value" | vercel env add "$key" production $PROJECT_FLAG 2>&1 | grep -v "Error: The specified value already exists" || true

        done < .env.local

        echo ""
        echo -e "${GREEN}✅ Environment variables copied!${NC}"
        echo ""

        echo "🚀 Step 2: Deploying to production..."
        echo ""
        vercel --prod
        ;;

    4)
        echo "👋 Deployment cancelled"
        exit 0
        ;;

    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  🎉 DEPLOYMENT COMPLETE!                                     ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1️⃣  Update production URLs in Vercel dashboard:"
echo "   → NEXTAUTH_URL"
echo "   → NEXT_PUBLIC_APP_URL"
echo ""
echo "2️⃣  Test your deployment:"
echo "   → Visit your production URL"
echo "   → Test AI features: /ai-assistant (customer) & /farmer/ai-advisor"
echo "   → Check admin dashboard: /admin/ai-monitoring"
echo ""
echo "3️⃣  Monitor your deployment:"
echo "   → Vercel Logs: https://vercel.com/dashboard/logs"
echo "   → AI Monitoring: https://your-domain.vercel.app/admin/ai-monitoring"
echo ""
echo "🎊 Your Farmers Market Platform is now live! 🌾"
echo ""
