#!/bin/sh
# ╔════════════════════════════════════════════════════════════════════╗
# ║ 🌾 FARMERS MARKET PLATFORM - DOCKER ENTRYPOINT                    ║
# ║ Divine Agricultural E-Commerce System                              ║
# ║ Container initialization and startup orchestration                 ║
# ╚════════════════════════════════════════════════════════════════════╝

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo "${CYAN}[INFO]${NC} $1"
}

log_success() {
    echo "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo "${BLUE}▶${NC} $1"
}

# Header
echo ""
echo "${CYAN}╔════════════════════════════════════════════════════════════════════╗${NC}"
echo "${CYAN}║ 🌾 FARMERS MARKET PLATFORM - STARTING                             ║${NC}"
echo "${CYAN}║ Divine Agricultural E-Commerce System                              ║${NC}"
echo "${CYAN}╚════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Display environment information
log_info "Environment: ${NODE_ENV:-production}"
log_info "Node Version: $(node --version)"
log_info "NPM Version: $(npm --version)"
log_info "Port: ${PORT:-3000}"
echo ""

# ============================================================================
# STEP 1: WAIT FOR DATABASE
# ============================================================================
log_step "Step 1/6: Waiting for database connection..."

if [ -n "$DATABASE_URL" ]; then
    # Parse database host and port from DATABASE_URL
    DB_HOST=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:]*\):.*/\1/p')
    DB_PORT=$(echo "$DATABASE_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')

    if [ -z "$DB_PORT" ]; then
        DB_PORT=5432
    fi

    log_info "Database host: ${DB_HOST}"
    log_info "Database port: ${DB_PORT}"

    # Wait for database to be ready
    RETRIES=30
    RETRY_COUNT=0

    while [ $RETRY_COUNT -lt $RETRIES ]; do
        if nc -z "$DB_HOST" "$DB_PORT" 2>/dev/null; then
            log_success "Database is ready!"
            break
        fi

        RETRY_COUNT=$((RETRY_COUNT + 1))
        if [ $RETRY_COUNT -eq $RETRIES ]; then
            log_error "Database connection timeout after $RETRIES attempts"
            exit 1
        fi

        log_warning "Waiting for database... (attempt $RETRY_COUNT/$RETRIES)"
        sleep 2
    done
    echo ""
else
    log_warning "DATABASE_URL not set, skipping database wait"
    echo ""
fi

# ============================================================================
# STEP 2: GENERATE PRISMA CLIENT
# ============================================================================
log_step "Step 2/6: Generating Prisma client..."

if [ -d "prisma" ] && [ -f "prisma/schema.prisma" ]; then
    if npx prisma generate; then
        log_success "Prisma client generated successfully"
    else
        log_error "Failed to generate Prisma client"
        exit 1
    fi
else
    log_warning "Prisma schema not found, skipping generation"
fi
echo ""

# ============================================================================
# STEP 3: RUN DATABASE MIGRATIONS (PRODUCTION ONLY)
# ============================================================================
log_step "Step 3/6: Database migrations..."

if [ "$NODE_ENV" = "production" ]; then
    if [ -n "$DATABASE_URL" ]; then
        log_info "Running database migrations..."

        if npx prisma migrate deploy; then
            log_success "Database migrations completed"
        else
            log_error "Database migrations failed"
            exit 1
        fi
    else
        log_warning "DATABASE_URL not set, skipping migrations"
    fi
elif [ "$NODE_ENV" = "development" ]; then
    log_info "Development mode: Skipping automatic migrations"
    log_info "Run 'npx prisma migrate dev' manually if needed"
else
    log_info "Non-production environment: Skipping migrations"
fi
echo ""

# ============================================================================
# STEP 4: SEED DATABASE (OPTIONAL)
# ============================================================================
log_step "Step 4/6: Database seeding..."

if [ "$ENABLE_DB_SEED" = "true" ] || [ "$AUTO_SEED" = "true" ]; then
    if [ -f "prisma/seed.ts" ]; then
        log_info "Seeding database..."

        if npx tsx prisma/seed.ts; then
            log_success "Database seeded successfully"
        else
            log_warning "Database seeding failed (this may be expected if data already exists)"
        fi
    elif [ -f "prisma/seed-basic.ts" ]; then
        log_info "Running basic seed..."

        if npx tsx prisma/seed-basic.ts; then
            log_success "Basic seed completed"
        else
            log_warning "Basic seed failed"
        fi
    else
        log_warning "No seed file found"
    fi
else
    log_info "Database seeding disabled"
fi
echo ""

# ============================================================================
# STEP 5: VERIFY DEPENDENCIES
# ============================================================================
log_step "Step 5/6: Verifying application dependencies..."

if [ ! -d "node_modules" ]; then
    log_warning "node_modules not found, installing dependencies..."

    if [ "$NODE_ENV" = "production" ]; then
        npm ci --only=production --legacy-peer-deps
    else
        npm ci --legacy-peer-deps
    fi

    log_success "Dependencies installed"
else
    log_success "Dependencies verified"
fi
echo ""

# ============================================================================
# STEP 6: PRE-START HEALTH CHECKS
# ============================================================================
log_step "Step 6/6: Pre-start health checks..."

# Check if .next directory exists (for production)
if [ "$NODE_ENV" = "production" ]; then
    if [ ! -d ".next" ]; then
        log_error ".next build directory not found!"
        log_error "Make sure the application was built before creating the container"
        exit 1
    fi
    log_success "Build directory found"
fi

# Check if required environment variables are set
REQUIRED_VARS="DATABASE_URL NEXTAUTH_SECRET NEXTAUTH_URL"
MISSING_VARS=""

for VAR in $REQUIRED_VARS; do
    eval VALUE=\$$VAR
    if [ -z "$VALUE" ]; then
        MISSING_VARS="$MISSING_VARS $VAR"
    fi
done

if [ -n "$MISSING_VARS" ]; then
    log_error "Missing required environment variables:$MISSING_VARS"
    exit 1
fi

log_success "Environment variables validated"
echo ""

# ============================================================================
# STARTUP
# ============================================================================
echo "${GREEN}╔════════════════════════════════════════════════════════════════════╗${NC}"
echo "${GREEN}║ ✅ INITIALIZATION COMPLETE                                         ║${NC}"
echo "${GREEN}║ Starting Farmers Market Platform...                                ║${NC}"
echo "${GREEN}╚════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

log_info "Application URL: ${NEXT_PUBLIC_APP_URL:-http://localhost:${PORT:-3000}}"
log_info "Environment: ${NODE_ENV:-production}"
log_info "Process: $@"
echo ""

# Execute the main command
exec "$@"
