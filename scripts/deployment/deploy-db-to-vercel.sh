#!/bin/bash

# ============================================================================
# Deploy Database Schema to Vercel Postgres
# ============================================================================
# This script deploys the Prisma schema to Vercel Postgres
# Usage: ./scripts/deploy-db-to-vercel.sh [environment]
# Environment: preview | production (default: preview)
# ============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Environment (default to preview)
ENVIRONMENT=${1:-preview}

echo -e "${BLUE}🚀 Deploying Database Schema to Vercel Postgres${NC}"
echo -e "${BLUE}Environment: ${ENVIRONMENT}${NC}"
echo ""

# Function to print step
print_step() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print error
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_error "Vercel CLI is not installed"
    echo "Install it with: npm install -g vercel"
    exit 1
fi

# Check if logged in to Vercel
if ! vercel whoami &> /dev/null; then
    print_error "Not logged in to Vercel"
    echo "Run: vercel login"
    exit 1
fi

print_step "Vercel CLI detected and authenticated"

# Pull environment variables from Vercel
echo ""
echo -e "${BLUE}📥 Pulling environment variables from Vercel...${NC}"

if [ "$ENVIRONMENT" = "production" ]; then
    vercel env pull .env.vercel.production --environment=production
    ENV_FILE=".env.vercel.production"
else
    vercel env pull .env.vercel.preview --environment=preview
    ENV_FILE=".env.vercel.preview"
fi

if [ ! -f "$ENV_FILE" ]; then
    print_error "Failed to pull environment variables"
    exit 1
fi

print_step "Environment variables pulled successfully"

# Load DATABASE_URL from the pulled env file
# Use Database_DATABASE_URL (direct connection) for schema migrations
# Prisma Accelerate cannot be used for schema changes
export $(grep -v '^#' "$ENV_FILE" | grep -E '(Database_DATABASE_URL|DATABASE_URL|DIRECT_URL)' | xargs)

# For schema migrations, always use direct connection
if [ -n "$Database_DATABASE_URL" ]; then
    export DATABASE_URL="$Database_DATABASE_URL"
    print_step "Using direct Postgres connection for schema migration"
elif [ -n "$DIRECT_URL" ]; then
    export DATABASE_URL="$DIRECT_URL"
    print_step "Using DIRECT_URL for schema migration"
fi

if [ -z "$DATABASE_URL" ]; then
    print_error "DATABASE_URL not found in environment variables"
    print_warning "Make sure you have DATABASE_URL configured in Vercel"
    exit 1
fi

print_step "DATABASE_URL loaded from Vercel"

# Generate Prisma Client
echo ""
echo -e "${BLUE}🔧 Generating Prisma Client...${NC}"
npx prisma generate

print_step "Prisma Client generated"

# Deploy database schema
echo ""
echo -e "${BLUE}🗄️  Deploying database schema...${NC}"

if [ "$ENVIRONMENT" = "production" ]; then
    print_warning "Deploying to PRODUCTION database"
    read -p "Are you sure? (yes/no): " -r
    echo
    if [[ ! $REPLY =~ ^[Yy]es$ ]]; then
        print_error "Deployment cancelled"
        exit 1
    fi

    # For production, use migrate deploy (safe, requires existing migrations)
    npx prisma migrate deploy
else
    # For preview, use db push with force-reset for initial deployment
    echo -e "${YELLOW}Note: Using force-reset for preview environment${NC}"
    npx prisma db push --accept-data-loss --force-reset
fi

print_step "Database schema deployed successfully"

# Seed the database if requested
echo ""
read -p "Do you want to seed the database with crop data? (yes/no): " -r
echo
if [[ $REPLY =~ ^[Yy]es$ ]]; then
    echo -e "${BLUE}🌱 Seeding database...${NC}"

    # Run seed script with Vercel DATABASE_URL
    npx tsx prisma/seeds/seed-crops.ts

    print_step "Database seeded successfully"
fi

# Cleanup
echo ""
echo -e "${BLUE}🧹 Cleaning up...${NC}"
rm -f "$ENV_FILE"
print_step "Temporary files cleaned"

# Summary
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Database deployment completed successfully!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}Environment:${NC} ${ENVIRONMENT}"
echo -e "${BLUE}Database:${NC} Vercel Postgres"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Verify the deployment in Vercel Dashboard"
echo "2. Run smoke tests against the deployed database"
echo "3. Monitor for any errors in Vercel logs"
echo ""
echo -e "${BLUE}Useful commands:${NC}"
echo "  vercel logs --follow                 # View real-time logs"
echo "  npx prisma studio --browser none     # Open Prisma Studio"
echo ""
