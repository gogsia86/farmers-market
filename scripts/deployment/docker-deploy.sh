#!/bin/bash

# ============================================================================
# FARMERS MARKET PLATFORM - PRODUCTION DEPLOYMENT SCRIPT
# Divine Agricultural Docker Deployment with Health Checks
# Version: 3.0
# ============================================================================

set -e  # Exit on error
set -u  # Exit on undefined variable

# ============================================================================
# CONFIGURATION
# ============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
COMPOSE_FILE="${PROJECT_ROOT}/docker-compose.yml"
ENV_FILE="${PROJECT_ROOT}/.env.production"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Divine symbols
SYMBOL_SUCCESS="✅"
SYMBOL_ERROR="❌"
SYMBOL_WARNING="⚠️"
SYMBOL_INFO="ℹ️"
SYMBOL_ROCKET="🚀"
SYMBOL_DATABASE="💾"
SYMBOL_WHEAT="🌾"
SYMBOL_LIGHTNING="⚡"

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

log_info() {
    echo -e "${BLUE}${SYMBOL_INFO} [INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}${SYMBOL_SUCCESS} [SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}${SYMBOL_WARNING} [WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}${SYMBOL_ERROR} [ERROR]${NC} $1"
}

log_divine() {
    echo -e "${PURPLE}${SYMBOL_WHEAT} [DIVINE]${NC} $1"
}

print_banner() {
    echo ""
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║  ${SYMBOL_WHEAT} FARMERS MARKET PLATFORM - DOCKER DEPLOYMENT ${SYMBOL_WHEAT}  ║${NC}"
    echo -e "${CYAN}║           Divine Agricultural Consciousness                ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_section() {
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

check_prerequisites() {
    print_section "Checking Prerequisites"

    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    log_success "Docker is installed: $(docker --version)"

    # Check if Docker Compose is available
    if ! docker compose version &> /dev/null; then
        log_error "Docker Compose is not available. Please install Docker Compose V2."
        exit 1
    fi
    log_success "Docker Compose is installed: $(docker compose version)"

    # Check if Docker daemon is running
    if ! docker info &> /dev/null; then
        log_error "Docker daemon is not running. Please start Docker."
        exit 1
    fi
    log_success "Docker daemon is running"

    # Check if environment file exists
    if [ ! -f "$ENV_FILE" ]; then
        log_warning "Environment file not found: $ENV_FILE"
        log_info "Creating from .env.example..."
        if [ -f "${PROJECT_ROOT}/.env.example" ]; then
            cp "${PROJECT_ROOT}/.env.example" "$ENV_FILE"
            log_warning "Please configure $ENV_FILE before deploying!"
            exit 1
        else
            log_error "No .env.example found. Cannot proceed."
            exit 1
        fi
    fi
    log_success "Environment file exists: $ENV_FILE"
}

validate_environment() {
    print_section "Validating Environment Variables"

    # Source environment file
    set -a
    source "$ENV_FILE"
    set +a

    # Critical variables to check
    REQUIRED_VARS=(
        "POSTGRES_PASSWORD"
        "NEXTAUTH_SECRET"
        "REDIS_PASSWORD"
    )

    local all_valid=true

    for var in "${REQUIRED_VARS[@]}"; do
        if [ -z "${!var:-}" ]; then
            log_error "Required variable $var is not set"
            all_valid=false
        elif [ "${!var}" == "change-this" ] || [ "${!var}" == "CHANGE_ME" ]; then
            log_error "Variable $var has default value. Please set a secure value."
            all_valid=false
        else
            log_success "$var is configured"
        fi
    done

    # Check NEXTAUTH_SECRET length
    if [ -n "${NEXTAUTH_SECRET:-}" ] && [ ${#NEXTAUTH_SECRET} -lt 32 ]; then
        log_error "NEXTAUTH_SECRET must be at least 32 characters long"
        all_valid=false
    fi

    if [ "$all_valid" = false ]; then
        log_error "Environment validation failed. Please fix the issues above."
        exit 1
    fi

    log_divine "Environment validation passed with agricultural consciousness"
}

pull_images() {
    print_section "Pulling Latest Images"

    log_info "Pulling base images..."
    docker compose -f "$COMPOSE_FILE" pull || {
        log_warning "Failed to pull some images. Will build locally."
    }

    log_success "Images pulled successfully"
}

build_application() {
    print_section "Building Application"

    log_info "Building Docker images..."
    docker compose -f "$COMPOSE_FILE" build --no-cache || {
        log_error "Build failed"
        exit 1
    }

    log_success "Application built successfully"
}

stop_existing_services() {
    print_section "Stopping Existing Services"

    if docker compose -f "$COMPOSE_FILE" ps -q | grep -q .; then
        log_info "Stopping running services..."
        docker compose -f "$COMPOSE_FILE" down || {
            log_warning "Some services could not be stopped gracefully"
        }
        log_success "Services stopped"
    else
        log_info "No running services to stop"
    fi
}

start_services() {
    print_section "Starting Services"

    log_info "Starting all services..."
    docker compose -f "$COMPOSE_FILE" up -d || {
        log_error "Failed to start services"
        exit 1
    }

    log_success "Services started"
}

wait_for_services() {
    print_section "Waiting for Services to be Healthy"

    local max_wait=120
    local elapsed=0
    local interval=5

    log_info "Waiting for database to be healthy..."
    while [ $elapsed -lt $max_wait ]; do
        if docker compose -f "$COMPOSE_FILE" ps db | grep -q "healthy"; then
            log_success "Database is healthy"
            break
        fi
        sleep $interval
        elapsed=$((elapsed + interval))
        echo -n "."
    done
    echo ""

    if [ $elapsed -ge $max_wait ]; then
        log_error "Database failed to become healthy within ${max_wait}s"
        docker compose -f "$COMPOSE_FILE" logs db
        exit 1
    fi

    log_info "Waiting for Redis to be healthy..."
    elapsed=0
    while [ $elapsed -lt $max_wait ]; do
        if docker compose -f "$COMPOSE_FILE" ps redis | grep -q "healthy"; then
            log_success "Redis is healthy"
            break
        fi
        sleep $interval
        elapsed=$((elapsed + interval))
        echo -n "."
    done
    echo ""

    if [ $elapsed -ge $max_wait ]; then
        log_error "Redis failed to become healthy within ${max_wait}s"
        docker compose -f "$COMPOSE_FILE" logs redis
        exit 1
    fi

    log_info "Waiting for application to be healthy..."
    elapsed=0
    while [ $elapsed -lt $max_wait ]; do
        if docker compose -f "$COMPOSE_FILE" ps app | grep -q "healthy"; then
            log_success "Application is healthy"
            break
        fi
        sleep $interval
        elapsed=$((elapsed + interval))
        echo -n "."
    done
    echo ""

    if [ $elapsed -ge $max_wait ]; then
        log_error "Application failed to become healthy within ${max_wait}s"
        docker compose -f "$COMPOSE_FILE" logs app
        exit 1
    fi

    log_divine "All services achieved quantum coherence"
}

run_migrations() {
    print_section "Running Database Migrations"

    log_info "Applying Prisma migrations..."
    docker compose -f "$COMPOSE_FILE" exec -T app npx prisma migrate deploy || {
        log_error "Migration failed"
        exit 1
    }

    log_success "Migrations completed successfully"
}

seed_database() {
    print_section "Seeding Database (Optional)"

    read -p "Do you want to seed the database? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "Seeding database..."
        docker compose -f "$COMPOSE_FILE" exec -T app npx prisma db seed || {
            log_warning "Seeding failed or skipped"
        }
        log_success "Database seeded"
    else
        log_info "Skipping database seeding"
    fi
}

verify_deployment() {
    print_section "Verifying Deployment"

    # Get app URL
    APP_URL="${NEXT_PUBLIC_APP_URL:-http://localhost:3000}"
    HEALTH_ENDPOINT="${APP_URL}/api/health"

    log_info "Testing health endpoint: $HEALTH_ENDPOINT"

    local max_attempts=10
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$HEALTH_ENDPOINT" > /dev/null 2>&1; then
            log_success "Health check passed"

            # Show health response
            HEALTH_RESPONSE=$(curl -s "$HEALTH_ENDPOINT")
            echo -e "${GREEN}Response: $HEALTH_RESPONSE${NC}"
            break
        else
            log_warning "Health check failed (attempt $attempt/$max_attempts)"
            sleep 3
            attempt=$((attempt + 1))
        fi
    done

    if [ $attempt -gt $max_attempts ]; then
        log_error "Health check failed after $max_attempts attempts"
        log_info "Check application logs with: docker compose logs -f app"
        exit 1
    fi
}

show_status() {
    print_section "Deployment Status"

    echo ""
    docker compose -f "$COMPOSE_FILE" ps
    echo ""

    log_divine "Divine deployment manifest with agricultural consciousness"
    echo ""
    echo -e "${CYAN}Service URLs:${NC}"
    echo -e "  ${GREEN}${SYMBOL_ROCKET} Application:${NC} ${NEXT_PUBLIC_APP_URL:-http://localhost:3000}"
    echo -e "  ${GREEN}${SYMBOL_DATABASE} Database:${NC} localhost:${POSTGRES_PORT:-5432}"
    echo -e "  ${GREEN}${SYMBOL_LIGHTNING} Redis:${NC} localhost:${REDIS_PORT:-6379}"
    echo ""

    echo -e "${CYAN}Useful Commands:${NC}"
    echo -e "  ${YELLOW}View logs:${NC} docker compose logs -f"
    echo -e "  ${YELLOW}View app logs:${NC} docker compose logs -f app"
    echo -e "  ${YELLOW}Stop services:${NC} docker compose down"
    echo -e "  ${YELLOW}Restart app:${NC} docker compose restart app"
    echo -e "  ${YELLOW}Shell access:${NC} docker compose exec app sh"
    echo ""
}

cleanup_on_error() {
    log_error "Deployment failed! Rolling back..."
    docker compose -f "$COMPOSE_FILE" down || true
    exit 1
}

# ============================================================================
# MAIN DEPLOYMENT FLOW
# ============================================================================

main() {
    # Set trap for errors
    trap cleanup_on_error ERR

    print_banner

    # Parse arguments
    SKIP_BUILD=false
    SKIP_MIGRATIONS=false

    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-build)
                SKIP_BUILD=true
                shift
                ;;
            --skip-migrations)
                SKIP_MIGRATIONS=true
                shift
                ;;
            --help|-h)
                echo "Usage: $0 [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  --skip-build        Skip building Docker images"
                echo "  --skip-migrations   Skip running database migrations"
                echo "  --help, -h          Show this help message"
                echo ""
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                echo "Use --help for usage information"
                exit 1
                ;;
        esac
    done

    # Step 1: Check prerequisites
    check_prerequisites

    # Step 2: Validate environment
    validate_environment

    # Step 3: Pull images
    pull_images

    # Step 4: Build application (if not skipped)
    if [ "$SKIP_BUILD" = false ]; then
        build_application
    else
        log_warning "Skipping build (using existing images)"
    fi

    # Step 5: Stop existing services
    stop_existing_services

    # Step 6: Start services
    start_services

    # Step 7: Wait for services to be healthy
    wait_for_services

    # Step 8: Run migrations (if not skipped)
    if [ "$SKIP_MIGRATIONS" = false ]; then
        run_migrations
    else
        log_warning "Skipping migrations"
    fi

    # Step 9: Seed database (optional)
    seed_database

    # Step 10: Verify deployment
    verify_deployment

    # Step 11: Show status
    show_status

    # Success
    echo ""
    log_divine "${SYMBOL_WHEAT}${SYMBOL_LIGHTNING} DEPLOYMENT COMPLETE WITH DIVINE AGRICULTURAL CONSCIOUSNESS ${SYMBOL_LIGHTNING}${SYMBOL_WHEAT}"
    echo ""
}

# Run main function
main "$@"
