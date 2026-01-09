#!/bin/bash

# ============================================================================
# 🔍 VERCEL DATABASE CONNECTION TEST
# ============================================================================
# Tests connection to Vercel database and checks schema status
#
# Usage:
#   chmod +x scripts/test-vercel-db.sh
#   ./scripts/test-vercel-db.sh
#
# ============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         🔍 Vercel Database Connection Test                   ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check if .env.vercel.local exists
if [ ! -f ".env.vercel.local" ]; then
    echo -e "${RED}❌ .env.vercel.local not found${NC}"
    echo ""
    echo "Pull environment variables first:"
    echo -e "${CYAN}  vercel env pull .env.vercel.local${NC}"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Found .env.vercel.local${NC}"
echo ""

# Load environment variables
source .env.vercel.local

# Check which database URL to use
if [ -n "$Database_POSTGRES_URL" ]; then
    DB_URL="$Database_POSTGRES_URL"
    DB_TYPE="Prisma Accelerate (Direct)"
elif [ -n "$DATABASE_URL" ]; then
    DB_URL="$DATABASE_URL"
    DB_TYPE="Standard PostgreSQL"
else
    echo -e "${RED}❌ No database URL found${NC}"
    exit 1
fi

echo -e "${CYAN}📊 Database Info:${NC}"
echo "  Type: $DB_TYPE"
echo "  Host: $(echo $DB_URL | sed -E 's/.*@([^:]+).*/\1/')"
echo ""

# Test 1: Basic Connection
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🔌 Test 1: Database Connection${NC}"
echo ""

export DATABASE_URL="$DB_URL"

if npx prisma db execute --stdin <<< "SELECT version();" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Connection successful${NC}"
    VERSION=$(npx prisma db execute --stdin <<< "SELECT version();" 2>&1 | grep PostgreSQL || echo "Unknown")
    echo "  PostgreSQL version detected"
else
    echo -e "${RED}❌ Connection failed${NC}"
    echo ""
    echo "Please check:"
    echo "  - Database URL is correct"
    echo "  - Database is running"
    echo "  - Network allows connection"
    exit 1
fi

echo ""

# Test 2: Check Schema
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}📋 Test 2: Database Schema${NC}"
echo ""

# Check if _prisma_migrations table exists
if npx prisma db execute --stdin <<< "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '_prisma_migrations');" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Prisma migration table exists${NC}"

    # Count migrations
    MIGRATION_COUNT=$(npx prisma db execute --stdin <<< 'SELECT COUNT(*) FROM "_prisma_migrations";' 2>&1 | grep -oP '\d+' | tail -1 || echo "0")
    echo "  Migrations applied: $MIGRATION_COUNT"
else
    echo -e "${YELLOW}⚠️  No migration table found${NC}"
    echo "  Database needs to be initialized"
fi

echo ""

# Test 3: Check Tables
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🗂️  Test 3: Application Tables${NC}"
echo ""

TABLES=("User" "Farm" "Product" "Order" "Review")
ALL_EXIST=true

for TABLE in "${TABLES[@]}"; do
    if npx prisma db execute --stdin <<< "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '$TABLE');" 2>&1 | grep -q "true\|t\|1"; then
        echo -e "  ${GREEN}✅${NC} $TABLE table exists"

        # Count records
        COUNT=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM \"$TABLE\";" 2>&1 | grep -oP '\d+' | tail -1 || echo "0")
        echo "     Records: $COUNT"
    else
        echo -e "  ${RED}❌${NC} $TABLE table missing"
        ALL_EXIST=false
    fi
done

echo ""

# Test 4: Check Data
if [ "$ALL_EXIST" = true ]; then
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}👥 Test 4: Sample Data${NC}"
    echo ""

    USER_COUNT=$(npx prisma db execute --stdin <<< 'SELECT COUNT(*) FROM "User";' 2>&1 | grep -oP '\d+' | tail -1 || echo "0")

    if [ "$USER_COUNT" -gt 0 ]; then
        echo -e "${GREEN}✅ Database contains data${NC}"
        echo "  Users: $USER_COUNT"

        # Check for test user
        if npx prisma db execute --stdin <<< "SELECT email FROM \"User\" WHERE email = 'farmer1@example.com';" 2>&1 | grep -q "farmer1"; then
            echo -e "  ${GREEN}✅${NC} Test user (farmer1@example.com) exists"
        else
            echo -e "  ${YELLOW}⚠️${NC}  Test user (farmer1@example.com) not found"
        fi
    else
        echo -e "${YELLOW}⚠️  Database is empty${NC}"
        echo "  Run: npm run db:seed"
    fi
    echo ""
fi

# Summary
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}📊 Summary${NC}"
echo ""

if [ "$ALL_EXIST" = true ] && [ "$USER_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ DATABASE READY${NC}"
    echo ""
    echo "Your Vercel database is fully configured and contains data."
    echo "You can now deploy and test your application."
    echo ""
    echo -e "${CYAN}Next steps:${NC}"
    echo "  1. Deploy: git push origin master"
    echo "  2. Test: https://your-app.vercel.app/login"
    echo "  3. Login: farmer1@example.com / Farmer123!"
elif [ "$ALL_EXIST" = true ]; then
    echo -e "${YELLOW}⚠️  DATABASE NEEDS SEEDING${NC}"
    echo ""
    echo "Schema is applied but database is empty."
    echo ""
    echo -e "${CYAN}To seed the database:${NC}"
    echo "  export DATABASE_URL=\"$DB_URL\""
    echo "  npm run db:seed"
elif [ "$ALL_EXIST" = false ]; then
    echo -e "${YELLOW}⚠️  DATABASE NEEDS MIGRATION${NC}"
    echo ""
    echo "Database is connected but schema is not applied."
    echo ""
    echo -e "${CYAN}To apply migrations:${NC}"
    echo "  export DATABASE_URL=\"$DB_URL\""
    echo "  npx prisma migrate deploy"
    echo ""
    echo -e "${CYAN}Then seed:${NC}"
    echo "  npm run db:seed"
fi

echo ""
echo -e "${CYAN}🔗 Connection String:${NC}"
echo "  $(echo $DB_URL | sed 's/:[^:]*@/:***@/')"
echo ""
