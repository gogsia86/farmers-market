#!/bin/bash

# ============================================================================
# VERCEL DATABASE RE-SEEDING SCRIPT (Simple Version)
# ============================================================================
# This script re-seeds the Vercel production database with correct credentials
#
# WARNING: This will RESET and DELETE ALL existing data!
#
# Usage:
#   bash scripts/reseed-vercel-now.sh           # Interactive
#   bash scripts/reseed-vercel-now.sh --force   # Skip confirmation
# ============================================================================

set -e

# Parse arguments
FORCE=false
if [ "$1" == "--force" ] || [ "$1" == "-f" ]; then
    FORCE=true
fi

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo ""
echo -e "${CYAN}============================================================${NC}"
echo -e "${CYAN}     VERCEL DATABASE RE-SEEDING SCRIPT${NC}"
echo -e "${CYAN}============================================================${NC}"
echo ""

# Check if in correct directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}ERROR: package.json not found!${NC}"
    echo "Please run this script from the project root directory."
    exit 1
fi

echo -e "${GREEN}[1/7] Project directory verified${NC}"

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}ERROR: Vercel CLI not installed${NC}"
    echo "Install with: npm install -g vercel"
    exit 1
fi

echo -e "${GREEN}[2/7] Vercel CLI found${NC}"

# Pull environment variables
echo -e "${BLUE}[3/7] Pulling Vercel environment variables...${NC}"
vercel env pull .env.vercel.local --yes

if [ ! -f ".env.vercel.local" ]; then
    echo -e "${RED}ERROR: Failed to pull environment variables${NC}"
    exit 1
fi

echo -e "${GREEN}[3/7] Environment variables downloaded${NC}"

# Load DATABASE_URL
echo -e "${BLUE}[4/7] Loading database connection...${NC}"

# Source the file and extract DATABASE_URL
source .env.vercel.local 2>/dev/null || true

# Use Database_POSTGRES_URL if available
if [ -n "$Database_POSTGRES_URL" ]; then
    export DATABASE_URL="$Database_POSTGRES_URL"
fi

if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}ERROR: DATABASE_URL not found${NC}"
    exit 1
fi

echo -e "${GREEN}[4/7] Database URL loaded${NC}"

# Generate Prisma Client
echo -e "${BLUE}[5/7] Generating Prisma Client...${NC}"
npx prisma generate > /dev/null 2>&1
echo -e "${GREEN}[5/7] Prisma Client ready${NC}"

# Confirm before proceeding
if [ "$FORCE" = false ]; then
    echo ""
    echo -e "${RED}============================================================${NC}"
    echo -e "${RED}                    WARNING!${NC}"
    echo -e "${RED}============================================================${NC}"
    echo -e "${RED}This will DELETE ALL existing data in your database!${NC}"
    echo -e "${RED}  - All users (admin, farmers, consumers)${NC}"
    echo -e "${RED}  - All farms and products${NC}"
    echo -e "${RED}  - All orders and reviews${NC}"
    echo -e "${RED}  - All photos and certifications${NC}"
    echo -e "${RED}============================================================${NC}"
    echo ""
    read -p "Type 'YES' to continue: " -r
    echo ""

    if [[ ! $REPLY == "YES" ]]; then
        echo -e "${YELLOW}Operation cancelled${NC}"
        exit 0
    fi
else
    echo ""
    echo -e "${YELLOW}Force mode enabled - skipping confirmation${NC}"
fi

# Reset database
echo ""
echo -e "${BLUE}[6/7] Resetting database (this will take a moment)...${NC}"
echo ""

npx prisma migrate reset --force

if [ $? -ne 0 ]; then
    echo -e "${RED}ERROR: Database reset failed${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}[6/7] Database reset complete${NC}"
echo -e "${GREEN}[7/7] Database seeded automatically${NC}"

# Success message
echo ""
echo -e "${GREEN}============================================================${NC}"
echo -e "${GREEN}            SUCCESS! Database Re-Seeded${NC}"
echo -e "${GREEN}============================================================${NC}"
echo ""
echo -e "${CYAN}NEW LOGIN CREDENTIALS:${NC}"
echo ""
echo -e "${YELLOW}ADMIN:${NC}"
echo -e "  Email:    ${GREEN}admin@farmersmarket.app${NC}"
echo -e "  Password: ${GREEN}DivineAdmin123!${NC}"
echo ""
echo -e "${YELLOW}FARMER:${NC}"
echo -e "  Email:    ${GREEN}ana.romana@email.com${NC}"
echo -e "  Password: ${GREEN}FarmLife2024!${NC}"
echo ""
echo -e "${YELLOW}CONSUMER:${NC}"
echo -e "  Email:    ${GREEN}divna.kapica@email.com${NC}"
echo -e "  Password: ${GREEN}HealthyEating2024!${NC}"
echo ""
echo -e "${CYAN}See LOGIN_CREDENTIALS.md for all accounts${NC}"
echo ""
echo -e "${GREEN}============================================================${NC}"
echo ""
echo -e "${BLUE}NEXT STEPS:${NC}"
echo -e "  1. Test login at: ${CYAN}https://farmers-market-platform.vercel.app/login${NC}"
echo -e "  2. View data: ${CYAN}npx prisma studio${NC}"
echo ""
echo -e "${GREEN}Database re-seeding complete!${NC}"
echo ""

exit 0
