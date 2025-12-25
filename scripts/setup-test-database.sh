#!/bin/bash
# ============================================================================
# TEST DATABASE SETUP SCRIPT
# Quick setup for running Jest and E2E tests
# ============================================================================

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Helper functions
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_info() { echo -e "${CYAN}ℹ️  $1${NC}"; }
print_step() { echo -e "${WHITE}→ $1${NC}"; }
print_header() { echo -e "${CYAN}$1${NC}"; }

# ============================================================================
# MAIN
# ============================================================================

echo ""
print_header "═══════════════════════════════════════════════════════════"
print_header "  🧪 TEST DATABASE SETUP"
print_header "═══════════════════════════════════════════════════════════"
echo ""

# Step 1: Check Docker
print_step "Checking Docker..."
if ! docker ps &> /dev/null; then
    print_error "Docker is not running or not accessible"
    print_info "Please start Docker Desktop and make sure it's not paused"
    echo ""
    echo -e "${YELLOW}Quick fix:${NC}"
    echo "  1. Start Docker Desktop"
    echo "  2. Wait for it to be ready"
    echo "  3. Run this script again"
    exit 1
fi
print_success "Docker is running"

# Step 2: Check for existing container
print_step "Checking for existing test database..."
if docker ps -a --format '{{.Names}}' | grep -q "^farmers-market-test-db$"; then
    print_info "Found existing test database container"
    print_step "Starting existing container..."
    docker start farmers-market-test-db > /dev/null 2>&1 || true
    sleep 3
    print_success "Test database container started"
else
    print_step "Creating new test database container..."

    # Create and start PostgreSQL container
    docker run -d \
        --name farmers-market-test-db \
        -e POSTGRES_USER=test \
        -e POSTGRES_PASSWORD=test \
        -e POSTGRES_DB=farmers_market_test \
        -p 5432:5432 \
        postgres:16-alpine > /dev/null

    if [ $? -ne 0 ]; then
        print_error "Failed to create test database container"
        exit 1
    fi

    print_success "Test database container created"
    print_step "Waiting for database to initialize..."
    sleep 5
fi

# Step 3: Wait for database to be ready
print_step "Verifying database connection..."
max_attempts=15
attempt=0
connected=false

while [ $attempt -lt $max_attempts ]; do
    attempt=$((attempt + 1))
    if docker exec farmers-market-test-db pg_isready -U test -d farmers_market_test &> /dev/null; then
        connected=true
        break
    fi
    echo -n "."
    sleep 2
done
echo ""

if [ "$connected" = false ]; then
    print_error "Database failed to become ready"
    print_info "Check logs with: docker logs farmers-market-test-db"
    exit 1
fi

print_success "Database is ready"

# Step 4: Run Prisma migrations
print_step "Running Prisma migrations..."
export DATABASE_URL="postgresql://test:test@localhost:5432/farmers_market_test"

if ! npx prisma migrate deploy &> /dev/null; then
    print_info "Running migrate dev instead..."
    npx prisma migrate dev --name test_init --skip-seed &> /dev/null || true
fi

print_success "Database migrations completed"

# Step 5: Summary
echo ""
print_header "═══════════════════════════════════════════════════════════"
print_header "  ✨ TEST DATABASE READY!"
print_header "═══════════════════════════════════════════════════════════"
echo ""
print_info "Database Connection:"
echo "  URL:      postgresql://test:test@localhost:5432/farmers_market_test"
echo "  Host:     localhost:5432"
echo "  Database: farmers_market_test"
echo "  User:     test"
echo "  Password: test"
echo ""
print_info "Next Steps:"
echo "  Run tests:        npm test"
echo "  Run all tests:    npm run test:all"
echo "  Stop database:    docker stop farmers-market-test-db"
echo "  View logs:        docker logs farmers-market-test-db"
echo "  Remove database:  docker rm -f farmers-market-test-db"
echo ""
