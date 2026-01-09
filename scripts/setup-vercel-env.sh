#!/bin/bash

# ============================================================================
# 🚀 VERCEL ENVIRONMENT SETUP SCRIPT
# ============================================================================
# Farmers Market Platform - Automated Vercel Configuration
#
# This script helps you configure environment variables for Vercel deployment
# to connect to your test database for running tests against deployed site.
#
# Usage:
#   chmod +x scripts/setup-vercel-env.sh
#   ./scripts/setup-vercel-env.sh
#
# ============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Header
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         🚀 Vercel Environment Configuration Tool              ║"
echo "║         Farmers Market Platform Database Setup                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI not found${NC}"
    echo ""
    echo "Please install Vercel CLI first:"
    echo -e "${CYAN}  npm install -g vercel${NC}"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Vercel CLI found${NC}"
echo ""

# Ask user which setup they want
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}📋 Choose your database setup:${NC}"
echo ""
echo "  1) Use local test database (via ngrok/tunnel)"
echo "  2) Use cloud database (Vercel Postgres, Supabase, Neon)"
echo "  3) Manual setup (I'll configure myself)"
echo ""
read -p "Enter choice [1-3]: " choice

case $choice in
    1)
        echo ""
        echo -e "${YELLOW}🔧 LOCAL DATABASE SETUP${NC}"
        echo ""
        echo "You need to expose your local database to the internet."
        echo ""
        echo -e "${CYAN}Recommended tools:${NC}"
        echo "  - ngrok: https://ngrok.com (easiest)"
        echo "  - Cloudflare Tunnel: https://developers.cloudflare.com/cloudflare-one/"
        echo ""

        # Check if ngrok is available
        if command -v ngrok &> /dev/null; then
            echo -e "${GREEN}✅ ngrok found${NC}"
            echo ""
            read -p "Start ngrok tunnel? [y/n]: " start_ngrok

            if [ "$start_ngrok" = "y" ]; then
                echo ""
                echo -e "${CYAN}Starting ngrok tunnel on port 5433...${NC}"
                echo ""
                echo "Run this in a separate terminal:"
                echo -e "${YELLOW}  ngrok tcp 5433${NC}"
                echo ""
                read -p "Press Enter after starting ngrok..."
            fi
        else
            echo -e "${YELLOW}⚠️  ngrok not found${NC}"
            echo ""
            echo "Install ngrok:"
            echo -e "${CYAN}  npm install -g ngrok${NC}"
            echo ""
            echo "Then expose your database:"
            echo -e "${CYAN}  ngrok tcp 5433${NC}"
            echo ""
            read -p "Press Enter after starting ngrok..."
        fi

        echo ""
        echo -e "${CYAN}Enter your ngrok/tunnel details:${NC}"
        echo ""
        read -p "Tunnel host (e.g., 0.tcp.ngrok.io): " tunnel_host
        read -p "Tunnel port (e.g., 12345): " tunnel_port

        DATABASE_URL="postgresql://postgres:test_password_123@${tunnel_host}:${tunnel_port}/farmersmarket_test"
        DIRECT_URL="postgresql://postgres:test_password_123@${tunnel_host}:${tunnel_port}/farmersmarket_test"

        echo ""
        echo -e "${GREEN}✅ Database URL configured:${NC}"
        echo -e "${YELLOW}  ${DATABASE_URL}${NC}"
        ;;

    2)
        echo ""
        echo -e "${YELLOW}☁️  CLOUD DATABASE SETUP${NC}"
        echo ""
        echo "Which cloud provider are you using?"
        echo ""
        echo "  1) Vercel Postgres"
        echo "  2) Supabase"
        echo "  3) Neon"
        echo "  4) Other"
        echo ""
        read -p "Enter choice [1-4]: " cloud_choice

        echo ""
        case $cloud_choice in
            1)
                echo -e "${CYAN}Vercel Postgres${NC}"
                echo ""
                echo "Go to Vercel Dashboard → Storage → Create Database → Postgres"
                echo "Environment variables will be auto-configured."
                echo ""
                echo -e "${YELLOW}⚠️  No need to run this script for Vercel Postgres${NC}"
                exit 0
                ;;
            2)
                echo -e "${CYAN}Supabase${NC}"
                echo ""
                echo "Get your connection string from:"
                echo "  Supabase Dashboard → Settings → Database → Connection String"
                ;;
            3)
                echo -e "${CYAN}Neon${NC}"
                echo ""
                echo "Get your connection string from:"
                echo "  Neon Dashboard → Connection Details"
                ;;
            4)
                echo -e "${CYAN}Other PostgreSQL Provider${NC}"
                ;;
        esac

        echo ""
        read -p "Enter DATABASE_URL: " DATABASE_URL
        read -p "Enter DIRECT_URL (or press Enter to use same as DATABASE_URL): " DIRECT_URL

        if [ -z "$DIRECT_URL" ]; then
            DIRECT_URL="$DATABASE_URL"
        fi
        ;;

    3)
        echo ""
        echo -e "${CYAN}📖 Manual Setup Instructions${NC}"
        echo ""
        echo "Configure environment variables in Vercel Dashboard:"
        echo "  https://vercel.com/your-team/project/settings/environment-variables"
        echo ""
        echo "Required variables:"
        echo "  - DATABASE_URL"
        echo "  - NEXTAUTH_SECRET"
        echo "  - NEXTAUTH_URL"
        echo "  - AUTH_TRUST_HOST=true"
        echo "  - SKIP_ENV_VALIDATION=true"
        echo ""
        echo "See docs/VERCEL_DATABASE_SETUP.md for details"
        exit 0
        ;;

    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

# Link Vercel project if not already linked
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🔗 Linking Vercel project...${NC}"
echo ""

if [ ! -f ".vercel/project.json" ]; then
    vercel link
else
    echo -e "${GREEN}✅ Project already linked${NC}"
fi

# Generate NEXTAUTH_SECRET if not provided
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🔐 Authentication Configuration${NC}"
echo ""

read -p "Do you have a NEXTAUTH_SECRET? [y/n]: " has_secret

if [ "$has_secret" != "y" ]; then
    echo ""
    echo "Generating random NEXTAUTH_SECRET..."
    NEXTAUTH_SECRET=$(openssl rand -base64 32)
    echo -e "${GREEN}✅ Generated:${NC} ${YELLOW}${NEXTAUTH_SECRET}${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  Save this secret! You'll need it for all environments.${NC}"
else
    read -sp "Enter your NEXTAUTH_SECRET: " NEXTAUTH_SECRET
    echo ""
fi

# Ask which environment to configure
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🌍 Select target environment:${NC}"
echo ""
echo "  1) Preview (recommended for testing)"
echo "  2) Production"
echo "  3) Development"
echo "  4) All environments"
echo ""
read -p "Enter choice [1-4]: " env_choice

case $env_choice in
    1) ENVIRONMENTS=("preview");;
    2) ENVIRONMENTS=("production");;
    3) ENVIRONMENTS=("development");;
    4) ENVIRONMENTS=("preview" "production" "development");;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

# Configure environment variables
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}⚙️  Configuring environment variables...${NC}"
echo ""

for ENV in "${ENVIRONMENTS[@]}"; do
    echo -e "${YELLOW}Setting up ${ENV} environment...${NC}"

    # DATABASE_URL
    echo ""
    echo "Adding DATABASE_URL..."
    echo "$DATABASE_URL" | vercel env add DATABASE_URL "$ENV" 2>/dev/null || echo "  (already exists or failed)"

    # DIRECT_URL
    echo "Adding DIRECT_URL..."
    echo "$DIRECT_URL" | vercel env add DIRECT_URL "$ENV" 2>/dev/null || echo "  (already exists or failed)"

    # NEXTAUTH_SECRET
    echo "Adding NEXTAUTH_SECRET..."
    echo "$NEXTAUTH_SECRET" | vercel env add NEXTAUTH_SECRET "$ENV" 2>/dev/null || echo "  (already exists or failed)"

    # AUTH_TRUST_HOST
    echo "Adding AUTH_TRUST_HOST..."
    echo "true" | vercel env add AUTH_TRUST_HOST "$ENV" 2>/dev/null || echo "  (already exists or failed)"

    # SKIP_ENV_VALIDATION
    echo "Adding SKIP_ENV_VALIDATION..."
    echo "true" | vercel env add SKIP_ENV_VALIDATION "$ENV" 2>/dev/null || echo "  (already exists or failed)"

    # NODE_ENV
    if [ "$ENV" = "production" ]; then
        echo "Adding NODE_ENV..."
        echo "production" | vercel env add NODE_ENV "$ENV" 2>/dev/null || echo "  (already exists or failed)"
    fi

    echo -e "${GREEN}✅ ${ENV} environment configured${NC}"
    echo ""
done

# Summary
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ CONFIGURATION COMPLETE!${NC}"
echo ""
echo -e "${CYAN}📋 Environment variables set:${NC}"
echo "  ✅ DATABASE_URL"
echo "  ✅ DIRECT_URL"
echo "  ✅ NEXTAUTH_SECRET"
echo "  ✅ AUTH_TRUST_HOST"
echo "  ✅ SKIP_ENV_VALIDATION"
echo ""

echo -e "${CYAN}🚀 Next steps:${NC}"
echo ""
echo "1. Verify environment variables:"
echo -e "   ${YELLOW}vercel env ls${NC}"
echo ""
echo "2. Run migrations on target database:"
echo -e "   ${YELLOW}npx prisma migrate deploy${NC}"
echo ""
echo "3. Seed database with test data:"
echo -e "   ${YELLOW}npm run db:seed${NC}"
echo ""
echo "4. Deploy to Vercel:"
echo -e "   ${YELLOW}git push origin master${NC}"
echo ""
echo "5. Test deployment:"
echo -e "   ${YELLOW}curl https://your-app.vercel.app/api/auth/session${NC}"
echo ""

echo -e "${CYAN}📖 Documentation:${NC}"
echo "   See docs/VERCEL_DATABASE_SETUP.md for detailed guide"
echo ""

echo -e "${CYAN}🔐 Test Credentials:${NC}"
echo "   See CREDENTIALS_QUICK_REF.txt for login details"
echo ""

echo -e "${GREEN}🎉 Setup complete! Ready to deploy.${NC}"
echo ""
