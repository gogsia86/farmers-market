#!/bin/bash
# ⚡ TEST DATABASE SETUP SCRIPT
# Divine Agricultural Platform - Quick Test Database Setup
#
# Usage:
#   bash scripts/setup-test-db.sh
#   or
#   npm run db:test:setup

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Default configuration
DEFAULT_HOST="localhost"
DEFAULT_PORT="5432"
DEFAULT_DB="farmersmarket_test"
DEFAULT_USER="postgres"
DEFAULT_PASSWORD="postgres"

# Get configuration from environment or use defaults
DB_HOST="${TEST_DB_HOST:-${DEFAULT_HOST}}"
DB_PORT="${TEST_DB_PORT:-${DEFAULT_PORT}}"
DB_NAME="${TEST_DB_NAME:-${DEFAULT_DB}}"
DB_USER="${TEST_DB_USER:-${DEFAULT_USER}}"
DB_PASSWORD="${TEST_DB_PASSWORD:-${DEFAULT_PASSWORD}}"
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

# Functions
log_section() {
    echo -e "\n${CYAN}============================================================${NC}"
    echo -e "${BOLD}  $1${NC}"
    echo -e "${CYAN}============================================================${NC}\n"
}

log_info() {
    echo -e "${BLUE}$1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

check_command() {
    if ! command -v $1 &> /dev/null; then
        return 1
    fi
    return 0
}

# Main script
main() {
    log_section "🌾 Divine Agricultural Platform - Test Database Setup"

    # Step 1: Check PostgreSQL installation
    log_info "Step 1: Checking PostgreSQL installation..."
    if ! check_command psql; then
        log_error "PostgreSQL is not installed or not in PATH"
        echo ""
        log_warning "Please install PostgreSQL:"
        echo "  - macOS:   brew install postgresql"
        echo "  - Ubuntu:  sudo apt-get install postgresql"
        echo "  - Windows: Download from https://www.postgresql.org/download/"
        exit 1
    fi
    log_success "PostgreSQL is installed"
    echo ""

    # Step 2: Display configuration
    log_info "Step 2: Test Database Configuration"
    echo "   Host:     ${DB_HOST}"
    echo "   Port:     ${DB_PORT}"
    echo "   Database: ${DB_NAME}"
    echo "   User:     ${DB_USER}"
    echo ""

    # Step 3: Check if PostgreSQL is running
    log_info "Step 3: Checking if PostgreSQL is running..."
    if ! pg_isready -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" &> /dev/null; then
        log_error "PostgreSQL is not running on ${DB_HOST}:${DB_PORT}"
        echo ""
        log_warning "Please start PostgreSQL:"
        echo "  - macOS:   brew services start postgresql"
        echo "  - Ubuntu:  sudo systemctl start postgresql"
        echo "  - Windows: net start postgresql-x64-14"
        exit 1
    fi
    log_success "PostgreSQL is running"
    echo ""

    # Step 4: Check if database exists
    log_info "Step 4: Checking if database exists..."
    if PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -lqt | cut -d \| -f 1 | grep -qw "${DB_NAME}"; then
        log_warning "Database '${DB_NAME}' already exists"
        read -p "Do you want to drop and recreate it? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            log_info "Dropping database '${DB_NAME}'..."
            PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d postgres -c "DROP DATABASE IF EXISTS ${DB_NAME};" &> /dev/null
            log_success "Database dropped"
        else
            log_info "Using existing database"
        fi
    fi
    echo ""

    # Step 5: Create database
    log_info "Step 5: Creating database '${DB_NAME}'..."
    if ! PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -lqt | cut -d \| -f 1 | grep -qw "${DB_NAME}"; then
        PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d postgres -c "CREATE DATABASE ${DB_NAME};" &> /dev/null
        log_success "Database created successfully"
    else
        log_success "Database already exists"
    fi
    echo ""

    # Step 6: Push Prisma schema
    log_info "Step 6: Pushing Prisma schema to database..."
    export DATABASE_URL="${DATABASE_URL}"
    if npx prisma db push --skip-generate &> /dev/null; then
        log_success "Prisma schema pushed successfully"
    else
        log_error "Failed to push Prisma schema"
        exit 1
    fi
    echo ""

    # Step 7: Generate Prisma Client
    log_info "Step 7: Generating Prisma Client..."
    if npx prisma generate &> /dev/null; then
        log_success "Prisma Client generated successfully"
    else
        log_error "Failed to generate Prisma Client"
        exit 1
    fi
    echo ""

    # Step 8: Seed test data (optional)
    log_info "Step 8: Seeding test data (optional)..."
    if [ -f "prisma/seed-basic.ts" ]; then
        if DATABASE_URL="${DATABASE_URL}" npm run db:seed:basic &> /dev/null; then
            log_success "Test data seeded successfully"
        else
            log_warning "Seeding failed (optional step)"
        fi
    else
        log_warning "No seed script found (skipping)"
    fi
    echo ""

    # Step 9: Create .env.test file
    log_info "Step 9: Creating .env.test configuration..."
    cat > .env.test << EOF
# Test Database Configuration
# Generated by setup-test-db.sh
# $(date)

DATABASE_URL="${DATABASE_URL}"

# Test environment settings
NODE_ENV="test"
SKIP_INTEGRATION_TESTS="false"

# Auth settings (test)
NEXTAUTH_SECRET="divine-test-secret-for-quantum-authentication-$(date +%s)"
NEXTAUTH_URL="http://localhost:3000"

# Payment provider test keys
PAYPAL_CLIENT_ID="test-paypal-client-id"
PAYPAL_CLIENT_SECRET="test-paypal-client-secret"
STRIPE_SECRET_KEY="test-stripe-secret-key"
STRIPE_PUBLISHABLE_KEY="test-stripe-publishable-key"
EOF
    log_success "Created .env.test file"
    echo ""

    # Success message
    log_section "🎉 Test Database Setup Complete!"
    echo -e "${GREEN}Your test database is ready for integration tests.${NC}"
    echo ""
    echo -e "${BOLD}Test Database URL:${NC}"
    echo -e "  ${CYAN}${DATABASE_URL}${NC}"
    echo ""
    echo -e "${BOLD}To run integration tests:${NC}"
    echo -e "  ${CYAN}npm run test:integration${NC}"
    echo ""
    echo -e "${BOLD}To run all tests:${NC}"
    echo -e "  ${CYAN}npm test${NC}"
    echo ""
    echo -e "${BOLD}To use .env.test for tests:${NC}"
    echo -e "  ${CYAN}export DATABASE_URL=\"${DATABASE_URL}\"${NC}"
    echo -e "  ${CYAN}npm run test:integration${NC}"
    echo ""
    echo -e "${BOLD}Or set environment variable permanently:${NC}"
    echo -e "  ${CYAN}echo 'export DATABASE_URL=\"${DATABASE_URL}\"' >> ~/.bashrc${NC}"
    echo ""
}

# Run main function
main
