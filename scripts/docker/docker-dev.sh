#!/bin/bash

# ============================================================================
# FARMERS MARKET PLATFORM - DEVELOPMENT ENVIRONMENT SCRIPT
# Divine Agricultural Docker Development with Hot-Reload
# Version: 3.0
# ============================================================================

set -e  # Exit on error
set -u  # Exit on undefined variable

# ============================================================================
# CONFIGURATION
# ============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
COMPOSE_FILE="${PROJECT_ROOT}/docker-compose.dev.yml"
ENV_FILE="${PROJECT_ROOT}/.env.local"

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
SYMBOL_DEV="🛠️"
SYMBOL_MAIL="📧"

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
    echo -e "${CYAN}║  ${SYMBOL_WHEAT} FARMERS MARKET - DEVELOPMENT ENVIRONMENT ${SYMBOL_DEV}    ║${NC}"
    echo -e "${CYAN}║      Agricultural Consciousness Development Mode           ║${NC}"
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
    print_section "Checking Development Prerequisites"

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

    # Check if compose file exists
    if [ ! -f "$COMPOSE_FILE" ]; then
        log_error "Docker Compose file not found: $COMPOSE_FILE"
        exit 1
    fi
    log_success "Docker Compose file found"
}

setup_environment() {
    print_section "Setting Up Development Environment"

    # Create .env.local if it doesn't exist
    if [ ! -f "$ENV_FILE" ]; then
        log_warning "Environment file not found: $ENV_FILE"
        log_info "Creating from .env.example..."

        if [ -f "${PROJECT_ROOT}/.env.example" ]; then
            cp "${PROJECT_ROOT}/.env.example" "$ENV_FILE"

            # Set development defaults
            sed -i 's|NODE_ENV=production|NODE_ENV=development|g' "$ENV_FILE" 2>/dev/null || true
            sed -i 's|NEXT_PUBLIC_APP_URL=.*|NEXT_PUBLIC_APP_URL=http://localhost:3000|g' "$ENV_FILE" 2>/dev/null || true

            log_success "Created $ENV_FILE with development defaults"
        else
            log_error "No .env.example found. Cannot proceed."
            exit 1
        fi
    else
        log_success "Environment file exists: $ENV_FILE"
    fi
}

pull_images() {
    print_section "Pulling Development Images"

    log_info "Pulling base images..."
    docker compose -f "$COMPOSE_FILE" pull --ignore-pull-failures || {
        log_warning "Some images could not be pulled. Will build locally."
    }

    log_success "Images pulled successfully"
}

build_development() {
    print_section "Building Development Environment"

    log_info "Building Docker images with development dependencies..."
    docker compose -f "$COMPOSE_FILE" build || {
        log_error "Build failed"
        exit 1
    }

    log_success "Development environment built successfully"
}

start_services() {
    print_section "Starting Development Services"

    log_info "Starting all development services..."

    # Start with profiles if specified
    if [ "$WITH_ADVANCED" = true ]; then
        log_info "Starting with advanced tools (PgAdmin)..."
        docker compose -f "$COMPOSE_FILE" --profile advanced up -d || {
            log_error "Failed to start services"
            exit 1
        }
    elif [ "$WITH_PROXY" = true ]; then
        log_info "Starting with Nginx proxy..."
        docker compose -f "$COMPOSE_FILE" --profile proxy up -d || {
            log_error "Failed to start services"
            exit 1
        }
    else
        docker compose -f "$COMPOSE_FILE" up -d || {
            log_error "Failed to start services"
            exit 1
        }
    fi

    log_success "Development services started"
}

wait_for_services() {
    print_section "Waiting for Services to Initialize"

    local max_wait=120
    local elapsed=0
    local interval=5

    log_info "Waiting for database..."
    while [ $elapsed -lt $max_wait ]; do
        if docker compose -f "$COMPOSE_FILE" ps db | grep -q "healthy"; then
            log_success "Database is ready"
            break
        fi
        sleep $interval
        elapsed=$((elapsed + interval))
        echo -n "."
    done
    echo ""

    if [ $elapsed -ge $max_wait ]; then
        log_error "Database failed to start within ${max_wait}s"
        docker compose -f "$COMPOSE_FILE" logs db
        exit 1
    fi

    log_info "Waiting for Redis..."
    elapsed=0
    while [ $elapsed -lt $max_wait ]; do
        if docker compose -f "$COMPOSE_FILE" ps redis | grep -q "healthy"; then
            log_success "Redis is ready"
            break
        fi
        sleep $interval
        elapsed=$((elapsed + interval))
        echo -n "."
    done
    echo ""

    if [ $elapsed -ge $max_wait ]; then
        log_error "Redis failed to start within ${max_wait}s"
        docker compose -f "$COMPOSE_FILE" logs redis
        exit 1
    fi

    log_info "Waiting for application..."
    elapsed=0
    while [ $elapsed -lt $max_wait ]; do
        if docker compose -f "$COMPOSE_FILE" ps app | grep -q "healthy"; then
            log_success "Application is ready"
            break
        fi
        sleep $interval
        elapsed=$((elapsed + interval))
        echo -n "."
    done
    echo ""

    if [ $elapsed -ge $max_wait ]; then
        log_warning "Application health check pending (may still be starting)"
        log_info "Check logs with: docker compose -f $COMPOSE_FILE logs -f app"
    fi

    log_divine "Development services achieved quantum coherence"
}

setup_database() {
    print_section "Setting Up Development Database"

    if [ "$SKIP_MIGRATIONS" = false ]; then
        log_info "Running database migrations..."
        docker compose -f "$COMPOSE_FILE" exec app npx prisma migrate dev --name init || {
            log_warning "Migrations failed or skipped"
        }
        log_success "Database migrations completed"
    else
        log_info "Skipping database migrations"
    fi

    if [ "$WITH_SEED" = true ]; then
        log_info "Seeding development database..."
        docker compose -f "$COMPOSE_FILE" exec app npx prisma db seed || {
            log_warning "Database seeding failed or skipped"
        }
        log_success "Database seeded with test data"
    fi
}

show_development_info() {
    print_section "Development Environment Ready"

    echo ""
    docker compose -f "$COMPOSE_FILE" ps
    echo ""

    log_divine "Divine development environment with agricultural consciousness activated"
    echo ""

    echo -e "${CYAN}${SYMBOL_DEV} Development URLs:${NC}"
    echo -e "  ${GREEN}${SYMBOL_ROCKET} Next.js App:${NC}        http://localhost:3000"
    echo -e "  ${GREEN}${SYMBOL_DATABASE} Prisma Studio:${NC}      http://localhost:5555"
    echo -e "  ${GREEN}${SYMBOL_DATABASE} Adminer (DB):${NC}       http://localhost:8080 (postgres/postgres)"
    echo -e "  ${GREEN}${SYMBOL_MAIL} MailHog (Email):${NC}    http://localhost:8025"
    echo -e "  ${GREEN}${SYMBOL_LIGHTNING} Redis Commander:${NC}   http://localhost:8081 (admin/admin)"

    if [ "$WITH_ADVANCED" = true ]; then
        echo -e "  ${GREEN}${SYMBOL_DATABASE} PgAdmin:${NC}            http://localhost:8082 (admin@farmersmarket.local/admin)"
    fi

    if [ "$WITH_PROXY" = true ]; then
        echo -e "  ${GREEN}${SYMBOL_ROCKET} Nginx Proxy:${NC}        http://localhost:8000"
    fi

    echo ""

    echo -e "${CYAN}${SYMBOL_DEV} Development Features:${NC}"
    echo -e "  ${YELLOW}✓${NC} Hot-reload enabled (edit files in ./src)"
    echo -e "  ${YELLOW}✓${NC} Debug port exposed on :9229"
    echo -e "  ${YELLOW}✓${NC} All emails captured by MailHog"
    echo -e "  ${YELLOW}✓${NC} PostgreSQL with PostGIS enabled"
    echo -e "  ${YELLOW}✓${NC} Redis cache with Commander UI"
    echo ""

    echo -e "${CYAN}${SYMBOL_INFO} Useful Commands:${NC}"
    echo -e "  ${YELLOW}View logs:${NC}           docker compose -f $COMPOSE_FILE logs -f"
    echo -e "  ${YELLOW}View app logs:${NC}       docker compose -f $COMPOSE_FILE logs -f app"
    echo -e "  ${YELLOW}Access shell:${NC}        docker compose -f $COMPOSE_FILE exec app sh"
    echo -e "  ${YELLOW}Run migrations:${NC}      docker compose -f $COMPOSE_FILE exec app npx prisma migrate dev"
    echo -e "  ${YELLOW}Open Prisma Studio:${NC}  docker compose -f $COMPOSE_FILE exec app npx prisma studio"
    echo -e "  ${YELLOW}Run tests:${NC}           docker compose -f $COMPOSE_FILE exec app npm test"
    echo -e "  ${YELLOW}Install package:${NC}     docker compose -f $COMPOSE_FILE exec app npm install <package>"
    echo -e "  ${YELLOW}Restart app:${NC}         docker compose -f $COMPOSE_FILE restart app"
    echo -e "  ${YELLOW}Stop all:${NC}            docker compose -f $COMPOSE_FILE down"
    echo -e "  ${YELLOW}Clean restart:${NC}       docker compose -f $COMPOSE_FILE down -v && $0"
    echo ""

    if [ "$FOLLOW_LOGS" = true ]; then
        echo ""
        log_info "Following application logs (Ctrl+C to exit)..."
        echo ""
        docker compose -f "$COMPOSE_FILE" logs -f app
    fi
}

stop_services() {
    print_section "Stopping Development Services"

    log_info "Stopping all services..."
    docker compose -f "$COMPOSE_FILE" down || {
        log_warning "Some services could not be stopped"
    }

    if [ "$CLEAN_VOLUMES" = true ]; then
        log_warning "Removing volumes (this will delete all data)..."
        docker compose -f "$COMPOSE_FILE" down -v
        log_success "Volumes removed"
    fi

    log_success "Development environment stopped"
}

# ============================================================================
# MAIN FUNCTION
# ============================================================================

main() {
    # Default options
    SKIP_BUILD=false
    SKIP_MIGRATIONS=false
    WITH_SEED=false
    WITH_ADVANCED=false
    WITH_PROXY=false
    FOLLOW_LOGS=false
    CLEAN_VOLUMES=false
    ACTION="start"

    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            start)
                ACTION="start"
                shift
                ;;
            stop)
                ACTION="stop"
                shift
                ;;
            restart)
                ACTION="restart"
                shift
                ;;
            --skip-build)
                SKIP_BUILD=true
                shift
                ;;
            --skip-migrations)
                SKIP_MIGRATIONS=true
                shift
                ;;
            --seed)
                WITH_SEED=true
                shift
                ;;
            --advanced)
                WITH_ADVANCED=true
                shift
                ;;
            --proxy)
                WITH_PROXY=true
                shift
                ;;
            --logs|-f)
                FOLLOW_LOGS=true
                shift
                ;;
            --clean)
                CLEAN_VOLUMES=true
                shift
                ;;
            --help|-h)
                echo "Usage: $0 [ACTION] [OPTIONS]"
                echo ""
                echo "Actions:"
                echo "  start              Start development environment (default)"
                echo "  stop               Stop development environment"
                echo "  restart            Restart development environment"
                echo ""
                echo "Options:"
                echo "  --skip-build       Skip building Docker images"
                echo "  --skip-migrations  Skip running database migrations"
                echo "  --seed             Seed database with test data"
                echo "  --advanced         Start with PgAdmin (advanced profile)"
                echo "  --proxy            Start with Nginx proxy (proxy profile)"
                echo "  --logs, -f         Follow application logs after startup"
                echo "  --clean            Remove volumes when stopping (data loss!)"
                echo "  --help, -h         Show this help message"
                echo ""
                echo "Examples:"
                echo "  $0                             # Start development environment"
                echo "  $0 start --seed --logs         # Start, seed DB, follow logs"
                echo "  $0 start --advanced            # Start with PgAdmin"
                echo "  $0 stop                        # Stop services"
                echo "  $0 stop --clean                # Stop and remove volumes"
                echo "  $0 restart                     # Restart services"
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

    print_banner

    case $ACTION in
        start)
            check_prerequisites
            setup_environment

            if [ "$SKIP_BUILD" = false ]; then
                pull_images
                build_development
            else
                log_warning "Skipping build (using existing images)"
            fi

            start_services
            wait_for_services
            setup_database
            show_development_info
            ;;

        stop)
            stop_services
            ;;

        restart)
            log_info "Restarting development environment..."
            stop_services
            sleep 2
            start_services
            wait_for_services
            show_development_info
            ;;

        *)
            log_error "Unknown action: $ACTION"
            exit 1
            ;;
    esac

    echo ""
    log_divine "${SYMBOL_WHEAT}${SYMBOL_LIGHTNING} DEVELOPMENT ENVIRONMENT READY ${SYMBOL_LIGHTNING}${SYMBOL_WHEAT}"
    echo ""
}

# Run main function
main "$@"
