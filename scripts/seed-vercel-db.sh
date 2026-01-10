#!/bin/bash

# ============================================================================
# VERCEL DATABASE SEEDING SCRIPT
# ============================================================================
# This script seeds the Vercel production database with initial data
#
# Usage:
#   bash scripts/seed-vercel-db.sh              # Interactive (asks for confirmation)
#   bash scripts/seed-vercel-db.sh --force      # Skip confirmation
#   bash scripts/seed-vercel-db.sh --basic      # Use basic seed only
#   bash scripts/seed-vercel-db.sh --full       # Use comprehensive seed
# ============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
FORCE=false
SEED_TYPE="basic"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --force|-f)
            FORCE=true
            shift
            ;;
        --basic|-b)
            SEED_TYPE="basic"
            shift
            ;;
        --full|-F)
            SEED_TYPE="full"
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --force, -f     Skip confirmation prompt"
            echo "  --basic, -b     Use basic seed data (default)"
            echo "  --full, -F      Use comprehensive seed data"
            echo "  --help, -h      Show this help message"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

# ============================================================================
# HEADER
# ============================================================================

echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                                                            ║${NC}"
echo -e "${CYAN}║          ${GREEN}🌾 VERCEL DATABASE SEEDING SCRIPT 🌾${CYAN}           ║${NC}"
echo -e "${CYAN}║                                                            ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# ============================================================================
# PRE-FLIGHT CHECKS
# ============================================================================

echo -e "${BLUE}📋 Pre-flight checks...${NC}"
echo ""

# Check if we're in the right directory
if [ ! -f "$PROJECT_ROOT/package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Are you in the project root?${NC}"
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Error: Vercel CLI is not installed${NC}"
    echo -e "${YELLOW}Install it with: npm install -g vercel${NC}"
    exit 1
fi

# Check if .env.vercel.local exists, if not pull it
if [ ! -f "$PROJECT_ROOT/.env.vercel.local" ]; then
    echo -e "${YELLOW}⚠️  .env.vercel.local not found. Pulling from Vercel...${NC}"
    cd "$PROJECT_ROOT"
    vercel env pull .env.vercel.local --yes
    echo -e "${GREEN}✅ Environment variables downloaded${NC}"
    echo ""
fi

# Load environment variables
if [ -f "$PROJECT_ROOT/.env.vercel.local" ]; then
    echo -e "${GREEN}✅ Loading Vercel environment variables...${NC}"
    export $(grep -v '^#' "$PROJECT_ROOT/.env.vercel.local" | grep -E '(DATABASE_URL|POSTGRES_URL|DIRECT_URL)' | xargs)
else
    echo -e "${RED}❌ Error: Could not load environment variables${NC}"
    exit 1
fi

# Verify DATABASE_URL is set
if [ -z "$DATABASE_URL" ] && [ -z "$Database_POSTGRES_URL" ]; then
    echo -e "${RED}❌ Error: No database URL found in environment${NC}"
    echo -e "${YELLOW}Expected: DATABASE_URL or Database_POSTGRES_URL${NC}"
    exit 1
fi

# Use the appropriate database URL
if [ -n "$Database_POSTGRES_URL" ]; then
    export DATABASE_URL="$Database_POSTGRES_URL"
fi

echo -e "${GREEN}✅ Database URL configured${NC}"
echo -e "${GREEN}✅ All pre-flight checks passed${NC}"
echo ""

# ============================================================================
# DATABASE CONNECTION TEST
# ============================================================================

echo -e "${BLUE}🔌 Testing database connection...${NC}"
echo ""

# Generate Prisma client if needed
if [ ! -d "$PROJECT_ROOT/node_modules/.prisma" ]; then
    echo -e "${YELLOW}⚠️  Prisma client not generated. Generating...${NC}"
    cd "$PROJECT_ROOT"
    npx prisma generate
    echo ""
fi

# Test connection with a simple query
cd "$PROJECT_ROOT"
if npx prisma db execute --stdin <<< 'SELECT 1 as test;' > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Database connection successful${NC}"
else
    echo -e "${RED}❌ Error: Could not connect to database${NC}"
    echo -e "${YELLOW}Check your DATABASE_URL in .env.vercel.local${NC}"
    exit 1
fi
echo ""

# ============================================================================
# CHECK EXISTING DATA
# ============================================================================

echo -e "${BLUE}🔍 Checking for existing data...${NC}"
echo ""

# Count existing users
USER_COUNT=$(npx prisma db execute --stdin <<< 'SELECT COUNT(*) as count FROM "User";' 2>/dev/null | grep -oP '\d+' | tail -1 || echo "0")

# Ensure USER_COUNT is a number
USER_COUNT=${USER_COUNT:-0}

if [ "$USER_COUNT" -gt 0 ] 2>/dev/null; then
    echo -e "${YELLOW}⚠️  WARNING: Database already contains data!${NC}"
    echo -e "${YELLOW}   Found $USER_COUNT users in the database${NC}"
    echo ""

    if [ "$FORCE" = false ]; then
        echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${RED}║                    ⚠️  WARNING ⚠️                         ║${NC}"
        echo -e "${RED}║                                                            ║${NC}"
        echo -e "${RED}║  This will ADD seed data to your existing database.       ║${NC}"
        echo -e "${RED}║  It may create duplicate records if seed data exists.     ║${NC}"
        echo -e "${RED}║                                                            ║${NC}"
        echo -e "${RED}║  To completely reset the database, run:                   ║${NC}"
        echo -e "${RED}║  npx prisma migrate reset --force                         ║${NC}"
        echo -e "${RED}║                                                            ║${NC}"
        echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
        echo ""
        read -p "$(echo -e ${YELLOW}Do you want to continue? [y/N]: ${NC})" -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${YELLOW}⚠️  Seeding cancelled${NC}"
            exit 0
        fi
    fi
else
    echo -e "${GREEN}✅ Database is empty - safe to seed${NC}"
fi
echo ""

# ============================================================================
# SEEDING
# ============================================================================

echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║              🌱 STARTING DATABASE SEEDING 🌱               ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

cd "$PROJECT_ROOT"

if [ "$SEED_TYPE" = "basic" ]; then
    echo -e "${BLUE}📦 Seeding with BASIC data...${NC}"
    echo ""
    echo -e "${YELLOW}This will create:${NC}"
    echo -e "  • 1 Admin user (gogsia@gmail.com)"
    echo -e "  • 2 Farmer users"
    echo -e "  • 1 Consumer user"
    echo -e "  • 2 Farms with products"
    echo ""

    # Export DATABASE_URL and run basic seed
    export DATABASE_URL="${Database_POSTGRES_URL:-$DATABASE_URL}"
    npx tsx prisma/seed-basic.ts

elif [ "$SEED_TYPE" = "full" ]; then
    echo -e "${BLUE}📦 Seeding with COMPREHENSIVE data...${NC}"
    echo ""
    echo -e "${YELLOW}This will create:${NC}"
    echo -e "  • 1 Admin user"
    echo -e "  • 5 Farmer users"
    echo -e "  • 3 Consumer users"
    echo -e "  • 5 Farms with photos & certifications"
    echo -e "  • 12+ Products across categories"
    echo -e "  • Sample orders and reviews"
    echo ""

    # Export DATABASE_URL and run comprehensive seed
    export DATABASE_URL="${Database_POSTGRES_URL:-$DATABASE_URL}"
    npx tsx prisma/seed.ts
fi

SEED_EXIT_CODE=$?

echo ""

# ============================================================================
# RESULTS
# ============================================================================

if [ $SEED_EXIT_CODE -eq 0 ]; then
    echo ""
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                                                            ║${NC}"
    echo -e "${CYAN}║              ${GREEN}✅ SEEDING COMPLETED SUCCESSFULLY! ✅${CYAN}          ║${NC}"
    echo -e "${CYAN}║                                                            ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    echo -e "${GREEN}🎉 Database has been seeded successfully!${NC}"
    echo ""

    if [ "$SEED_TYPE" = "basic" ]; then
        echo -e "${BLUE}📝 Test Credentials:${NC}"
        echo ""
        echo -e "${CYAN}Admin:${NC}"
        echo -e "  Email:    gogsia@gmail.com"
        echo -e "  Password: Admin123!"
        echo ""
        echo -e "${CYAN}Farmer:${NC}"
        echo -e "  Email:    farmer1@example.com"
        echo -e "  Password: Farmer123!"
        echo ""
        echo -e "${CYAN}Consumer:${NC}"
        echo -e "  Email:    consumer@example.com"
        echo -e "  Password: Consumer123!"
        echo ""
    else
        echo -e "${CYAN}📝 See CREDENTIALS_QUICK_REF.txt for all test credentials${NC}"
        echo ""
    fi

    echo -e "${BLUE}🔗 Next Steps:${NC}"
    echo ""
    echo -e "  1. View your data:"
    echo -e "     ${CYAN}npx prisma studio${NC}"
    echo ""
    echo -e "  2. Test your deployment:"
    echo -e "     ${CYAN}https://farmers-market-platform.vercel.app/login${NC}"
    echo ""
    echo -e "  3. Deploy to production:"
    echo -e "     ${CYAN}git push origin master${NC}"
    echo ""

else
    echo ""
    echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║                    ❌ SEEDING FAILED ❌                    ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    echo -e "${RED}❌ Database seeding failed with exit code: $SEED_EXIT_CODE${NC}"
    echo ""
    echo -e "${YELLOW}Troubleshooting:${NC}"
    echo ""
    echo -e "  1. Check database connection:"
    echo -e "     ${CYAN}npx prisma migrate status${NC}"
    echo ""
    echo -e "  2. Verify environment variables:"
    echo -e "     ${CYAN}cat .env.vercel.local | grep DATABASE${NC}"
    echo ""
    echo -e "  3. Check seed script:"
    echo -e "     ${CYAN}tsx prisma/seed-basic.ts${NC}"
    echo ""

    exit $SEED_EXIT_CODE
fi

echo ""
