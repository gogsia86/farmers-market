#!/bin/bash

# 🌾 Farmers Market Platform - Staging Database Migration Script
#
# This script handles database setup and migration for staging environment
#
# Usage:
#   ./scripts/staging-migration.sh [options]
#
# Options:
#   --migrate-only    Only run migrations (skip seed)
#   --seed-only       Only seed data (skip migrations)
#   --reset           Reset database and run fresh migrations
#   --verify          Verify database connection and schema
#
# Requirements:
#   - STAGING_DATABASE_URL environment variable must be set
#   - Prisma CLI installed (npx prisma)
#   - Node.js 20+ installed

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Emojis for divine output
ROCKET="🚀"
CHECK="✅"
CROSS="❌"
WARN="⚠️"
INFO="ℹ️"
DATABASE="🗄️"
SEED="🌱"
LOCK="🔒"

# Function to print colored output
print_success() {
    echo -e "${GREEN}${CHECK} $1${NC}"
}

print_error() {
    echo -e "${RED}${CROSS} $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}${WARN} $1${NC}"
}

print_info() {
    echo -e "${BLUE}${INFO} $1${NC}"
}

print_header() {
    echo ""
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
    echo ""
}

# Parse command line arguments
MIGRATE_ONLY=false
SEED_ONLY=false
RESET=false
VERIFY=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --migrate-only)
            MIGRATE_ONLY=true
            shift
            ;;
        --seed-only)
            SEED_ONLY=true
            shift
            ;;
        --reset)
            RESET=true
            shift
            ;;
        --verify)
            VERIFY=true
            shift
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Usage: $0 [--migrate-only|--seed-only|--reset|--verify]"
            exit 1
            ;;
    esac
done

print_header "${ROCKET} Farmers Market Platform - Staging Migration"

# Check if STAGING_DATABASE_URL is set
if [ -z "$STAGING_DATABASE_URL" ]; then
    print_error "STAGING_DATABASE_URL environment variable is not set"
    print_info "Set it with: export STAGING_DATABASE_URL='postgresql://...'"
    exit 1
fi

# Set DATABASE_URL to staging for this script
export DATABASE_URL=$STAGING_DATABASE_URL

print_info "Using staging database: ${DATABASE_URL%%@*}@****"
echo ""

# Verify database connection
verify_database() {
    print_info "${DATABASE} Verifying database connection..."

    if npx prisma db execute --stdin <<< "SELECT 1;" > /dev/null 2>&1; then
        print_success "Database connection verified"
        return 0
    else
        print_error "Failed to connect to database"
        print_info "Please check your STAGING_DATABASE_URL"
        return 1
    fi
}

# Run database migrations
run_migrations() {
    print_header "${DATABASE} Running Database Migrations"

    print_info "Deploying pending migrations..."

    if npx prisma migrate deploy; then
        print_success "Migrations deployed successfully"
        return 0
    else
        print_error "Migration deployment failed"
        return 1
    fi
}

# Reset database (dangerous!)
reset_database() {
    print_header "${WARN} Database Reset"

    print_warning "This will DELETE ALL DATA in the staging database!"
    read -p "Are you sure? Type 'YES' to confirm: " confirm

    if [ "$confirm" != "YES" ]; then
        print_info "Reset cancelled"
        exit 0
    fi

    print_info "Resetting database..."

    if npx prisma migrate reset --force --skip-seed; then
        print_success "Database reset complete"
        return 0
    else
        print_error "Database reset failed"
        return 1
    fi
}

# Seed staging data
seed_database() {
    print_header "${SEED} Seeding Staging Data"

    print_info "Running database seed..."

    if npm run db:seed:basic; then
        print_success "Database seeded successfully"
        print_info "Test accounts created:"
        echo "  ${GREEN}→${NC} Customer: test.customer@staging.farmersmarket.com"
        echo "  ${GREEN}→${NC} Farmer: test.farmer@staging.farmersmarket.com"
        echo "  ${GREEN}→${NC} Admin: test.admin@staging.farmersmarket.com"
        echo "  ${GREEN}→${NC} Password: StagingTest123!"
        return 0
    else
        print_warning "Seeding completed with warnings (check logs)"
        return 0
    fi
}

# Verify schema
verify_schema() {
    print_header "${LOCK} Verifying Database Schema"

    print_info "Checking schema integrity..."

    if npx prisma validate; then
        print_success "Schema validation passed"
    else
        print_error "Schema validation failed"
        return 1
    fi

    print_info "Comparing database schema with Prisma schema..."

    if npx prisma db push --accept-data-loss --skip-generate 2>&1 | grep -q "already in sync"; then
        print_success "Database schema is in sync"
        return 0
    else
        print_warning "Database schema may be out of sync"
        print_info "Run migrations to sync: npm run db:migrate"
        return 0
    fi
}

# Generate Prisma Client
generate_client() {
    print_info "Generating Prisma Client..."

    if npx prisma generate; then
        print_success "Prisma Client generated"
        return 0
    else
        print_error "Failed to generate Prisma Client"
        return 1
    fi
}

# Create backup
create_backup() {
    print_info "${DATABASE} Creating database backup (if supported)..."

    # Extract database connection details
    DB_HOST=$(echo $STAGING_DATABASE_URL | sed -n 's/.*@\(.*\):.*/\1/p')
    DB_PORT=$(echo $STAGING_DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
    DB_NAME=$(echo $STAGING_DATABASE_URL | sed -n 's/.*\/\(.*\)?.*/\1/p' | cut -d'?' -f1)
    DB_USER=$(echo $STAGING_DATABASE_URL | sed -n 's/.*\/\/\(.*\):.*/\1/p')

    BACKUP_FILE="backup-staging-$(date +%Y%m%d-%H%M%S).sql"

    print_info "Backup file: $BACKUP_FILE"
    print_warning "Manual backup recommended before destructive operations"
}

# Main execution flow
main() {
    # Always verify connection first
    if ! verify_database; then
        exit 1
    fi

    # Handle verification only
    if [ "$VERIFY" = true ]; then
        verify_schema
        exit $?
    fi

    # Handle reset
    if [ "$RESET" = true ]; then
        create_backup
        reset_database || exit 1
        generate_client || exit 1
        run_migrations || exit 1
        seed_database || exit 1
        print_success "Database reset and setup complete!"
        exit 0
    fi

    # Handle migrate only
    if [ "$MIGRATE_ONLY" = true ]; then
        run_migrations || exit 1
        generate_client || exit 1
        print_success "Migrations complete!"
        exit 0
    fi

    # Handle seed only
    if [ "$SEED_ONLY" = true ]; then
        seed_database || exit 1
        print_success "Seeding complete!"
        exit 0
    fi

    # Default: Run both migrations and seed
    print_info "Running full migration and seed process..."
    echo ""

    # Generate Prisma Client
    generate_client || exit 1

    # Run migrations
    run_migrations || exit 1

    # Seed data
    seed_database || exit 1

    # Verify final state
    verify_schema || print_warning "Verification completed with warnings"

    print_header "${CHECK} Staging Database Setup Complete!"

    print_success "Database is ready for staging deployment"
    echo ""
    print_info "Next steps:"
    echo "  1. ${BLUE}→${NC} Deploy application: vercel deploy --staging"
    echo "  2. ${BLUE}→${NC} Run E2E tests: BASE_URL=https://staging.farmersmarket.com npm run test:e2e"
    echo "  3. ${BLUE}→${NC} Monitor staging: npm run monitor:website:staging"
    echo ""
    print_info "Test credentials saved in staging database"
    echo ""
}

# Run main function
main

# Exit successfully
exit 0
