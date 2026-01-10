#!/bin/bash
###############################################################################
# Seed Vercel Production Database
# This script seeds the production database on Vercel with sample data
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Header
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  🌾 Seed Vercel Production Database"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Check if .env.vercel.local exists
if [ ! -f .env.vercel.local ]; then
    print_error ".env.vercel.local not found!"
    print_info "Run: vercel env pull .env.vercel.local"
    exit 1
fi

# Extract Database URL
print_info "Extracting Vercel database URL..."
DATABASE_URL=$(grep "^Database_DATABASE_URL=" .env.vercel.local | cut -d '=' -f2- | tr -d '"')

if [ -z "$DATABASE_URL" ]; then
    print_error "Database_DATABASE_URL not found in .env.vercel.local"
    print_info "Make sure you've pulled the latest environment variables"
    print_info "Run: vercel env pull .env.vercel.local"
    exit 1
fi

print_success "Database URL found"

# Confirm with user
echo ""
print_warning "⚠️  WARNING: This will seed the PRODUCTION database on Vercel!"
print_warning "This operation will:"
echo "  • Add sample users (admin, farmers, customers)"
echo "  • Add 6 sample farms"
echo "  • Add 30 sample products"
echo "  • Add 9 sample reviews"
echo ""
read -p "Are you sure you want to continue? (yes/no): " -r
echo ""

if [[ ! $REPLY =~ ^[Yy]es$ ]]; then
    print_info "Operation cancelled"
    exit 0
fi

# Step 1: Generate Prisma Client
print_info "Step 1/4: Generating Prisma client..."
npx prisma generate
print_success "Prisma client generated"

# Step 2: Push schema to production database
print_info "Step 2/4: Pushing schema to Vercel production database..."
DATABASE_URL="$DATABASE_URL" npx prisma db push
print_success "Schema pushed to production"

# Step 3: Seed the database
print_info "Step 3/4: Seeding production database..."
DATABASE_URL="$DATABASE_URL" npx prisma db seed
print_success "Database seeded successfully"

# Step 4: Verify the seeded data
print_info "Step 4/4: Verifying seeded data..."
echo ""
DATABASE_URL="$DATABASE_URL" npx tsx scripts/verify-db.ts
echo ""

# Success message
echo "═══════════════════════════════════════════════════════════════"
print_success "Vercel production database seeded successfully!"
echo "═══════════════════════════════════════════════════════════════"
echo ""
print_info "🔑 Login Credentials:"
echo "  Admin:    gogsia@gmail.com / Admin123!"
echo "  Farmer:   farmer1@example.com / Farmer123!"
echo "  Customer: consumer@example.com / Consumer123!"
echo ""
print_info "🌐 Production URL:"
echo "  https://farmers-market-platform.vercel.app"
echo ""
print_warning "⚠️  Important: Change default passwords in production!"
echo ""
print_info "💡 Next Steps:"
echo "  1. Visit: https://farmers-market-platform.vercel.app/login"
echo "  2. Login with admin credentials"
echo "  3. Browse farms at: /farms"
echo "  4. Clear Vercel cache if data doesn't appear immediately"
echo ""
print_success "Done! 🎉"
echo ""
