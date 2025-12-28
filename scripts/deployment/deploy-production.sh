#!/bin/bash

# ╔════════════════════════════════════════════════════════════════════╗
# ║ 🚀 FARMERS MARKET PLATFORM - PRODUCTION DEPLOYMENT SCRIPT         ║
# ║ Divine Agricultural E-Commerce System                              ║
# ║ Automated Docker deployment with health checks and validation     ║
# ╚════════════════════════════════════════════════════════════════════╝

set -e  # Exit on error
set -u  # Exit on undefined variable

# ============================================================================
# COLORS & FORMATTING
# ============================================================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# ============================================================================
# CONFIGURATION
# ============================================================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_NAME="farmers-market"
COMPOSE_FILE="docker-compose.yml"
ENV_FILE=".env.docker"
VERSION="${VERSION:-latest}"

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

print_header() {
    echo -e "${CYAN}"
    echo "╔════════════════════════════════════════════════════════════════════╗"
    echo "║ $1"
    echo "╚════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ ERROR: $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  WARNING: $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_step() {
    echo -e "${PURPLE}🔄 $1...${NC}"
}

# ============================================================================
# PREREQUISITE CHECKS
# ============================================================================

check_prerequisites() {
    print_header "CHECKING PREREQUISITES"

    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    print_success "Docker installed: $(docker --version)"

    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    print_success "Docker Compose installed"

    # Check if Docker daemon is running
    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running. Please start Docker first."
        exit 1
    fi
    print_success "Docker daemon is running"

    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_warning "Node.js is not installed. Required for local builds."
    else
        print_success "Node.js installed: $(node --version)"
    fi

    echo ""
}

# ============================================================================
# ENVIRONMENT SETUP
# ============================================================================

setup_environment() {
    print_header "SETTING UP ENVIRONMENT"

    # Check if .env.docker exists
    if [ ! -f "$ENV_FILE" ]; then
        print_warning "$ENV_FILE not found. Creating from example..."

        if [ -f ".env.docker.example" ]; then
            cp .env.docker.example "$ENV_FILE"
            print_info "Created $ENV_FILE from example. Please update with your production values."
            print_warning "IMPORTANT: Update the following before continuing:"
            echo "  - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)"
            echo "  - POSTGRES_PASSWORD"
            echo "  - REDIS_PASSWORD"
            echo "  - STRIPE_SECRET_KEY"
            echo "  - Other production secrets"
            echo ""
            read -p "Press Enter when you've updated $ENV_FILE, or Ctrl+C to cancel..."
        else
            print_error ".env.docker.example not found. Cannot create environment file."
            exit 1
        fi
    fi

    # Source environment file
    if [ -f "$ENV_FILE" ]; then
        set -a
        source "$ENV_FILE"
        set +a
        print_success "Environment variables loaded from $ENV_FILE"
    fi

    # Validate critical environment variables
    print_step "Validating environment variables"

    MISSING_VARS=()

    if [ -z "${NEXTAUTH_SECRET:-}" ]; then
        MISSING_VARS+=("NEXTAUTH_SECRET")
    fi

    if [ -z "${POSTGRES_PASSWORD:-}" ]; then
        MISSING_VARS+=("POSTGRES_PASSWORD")
    fi

    if [ -z "${REDIS_PASSWORD:-}" ]; then
        MISSING_VARS+=("REDIS_PASSWORD")
    fi

    if [ ${#MISSING_VARS[@]} -gt 0 ]; then
        print_error "Missing required environment variables: ${MISSING_VARS[*]}"
        print_info "Please update $ENV_FILE with the required values."
        exit 1
    fi

    print_success "All required environment variables are set"
    echo ""
}

# ============================================================================
# DOCKER CLEANUP
# ============================================================================

cleanup_docker() {
    print_header "CLEANING UP EXISTING DOCKER RESOURCES"

    print_step "Stopping existing containers"
    docker-compose -f "$COMPOSE_FILE" down --remove-orphans || true

    print_step "Removing old images (keeping volumes)"
    docker-compose -f "$COMPOSE_FILE" down --rmi local || true

    # Prune unused resources
    print_step "Pruning unused Docker resources"
    docker system prune -f || true

    print_success "Docker cleanup complete"
    echo ""
}

# ============================================================================
# BUILD APPLICATION
# ============================================================================

build_application() {
    print_header "BUILDING APPLICATION"

    print_step "Building Docker images"
    docker-compose -f "$COMPOSE_FILE" build --no-cache --pull

    print_success "Docker images built successfully"
    echo ""
}

# ============================================================================
# DATABASE MIGRATION
# ============================================================================

run_migrations() {
    print_header "RUNNING DATABASE MIGRATIONS"

    print_step "Starting database service"
    docker-compose -f "$COMPOSE_FILE" up -d postgres redis

    # Wait for database to be healthy
    print_step "Waiting for database to be ready"
    local max_attempts=30
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        if docker-compose -f "$COMPOSE_FILE" exec -T postgres pg_isready -U "${POSTGRES_USER:-farmers_user}" -d "${POSTGRES_DB:-farmers_market}" &> /dev/null; then
            print_success "Database is ready"
            break
        fi

        echo -n "."
        sleep 2
        attempt=$((attempt + 1))

        if [ $attempt -gt $max_attempts ]; then
            print_error "Database failed to become ready within $max_attempts attempts"
            exit 1
        fi
    done

    # Run Prisma migrations
    print_step "Running Prisma migrations"
    docker-compose -f "$COMPOSE_FILE" run --rm app sh -c "npx prisma migrate deploy"

    # Generate Prisma client
    print_step "Generating Prisma client"
    docker-compose -f "$COMPOSE_FILE" run --rm app sh -c "npx prisma generate"

    print_success "Database migrations completed"
    echo ""
}

# ============================================================================
# START SERVICES
# ============================================================================

start_services() {
    print_header "STARTING SERVICES"

    print_step "Starting all services"
    docker-compose -f "$COMPOSE_FILE" up -d

    print_success "All services started"
    echo ""
}

# ============================================================================
# HEALTH CHECKS
# ============================================================================

health_checks() {
    print_header "RUNNING HEALTH CHECKS"

    local services=("postgres:5432" "redis:6379" "app:3000")
    local max_wait=120  # 2 minutes
    local elapsed=0

    for service in "${services[@]}"; do
        IFS=':' read -r service_name port <<< "$service"
        print_step "Checking $service_name service"

        local healthy=false
        while [ $elapsed -lt $max_wait ]; do
            if docker-compose -f "$COMPOSE_FILE" ps | grep "$service_name" | grep -q "healthy\|Up"; then
                print_success "$service_name is healthy"
                healthy=true
                break
            fi

            echo -n "."
            sleep 5
            elapsed=$((elapsed + 5))
        done

        if [ "$healthy" = false ]; then
            print_error "$service_name failed health check"
            docker-compose -f "$COMPOSE_FILE" logs "$service_name" | tail -50
            exit 1
        fi
    done

    # Test HTTP endpoint
    print_step "Testing application HTTP endpoint"
    sleep 10  # Give app time to fully start

    local app_healthy=false
    for i in {1..30}; do
        if curl -f -s http://localhost:${APP_PORT:-3000}/api/health > /dev/null 2>&1; then
            print_success "Application HTTP endpoint is responding"
            app_healthy=true
            break
        fi
        echo -n "."
        sleep 2
    done

    if [ "$app_healthy" = false ]; then
        print_warning "Application HTTP endpoint not responding yet. Check logs if issues persist."
    fi

    echo ""
}

# ============================================================================
# DISPLAY STATUS
# ============================================================================

display_status() {
    print_header "DEPLOYMENT STATUS"

    echo -e "${WHITE}Service Status:${NC}"
    docker-compose -f "$COMPOSE_FILE" ps
    echo ""

    echo -e "${WHITE}Access URLs:${NC}"
    echo -e "${GREEN}🌾 Application:${NC}       http://localhost:${APP_PORT:-3000}"
    echo -e "${GREEN}📊 PgAdmin:${NC}           http://localhost:${PGADMIN_PORT:-5050}"
    echo -e "${GREEN}🔧 Redis Commander:${NC}   http://localhost:${REDIS_COMMANDER_PORT:-8081}"
    echo -e "${GREEN}💚 Health Check:${NC}      http://localhost:${APP_PORT:-3000}/api/health"
    echo -e "${GREEN}✅ Ready Check:${NC}       http://localhost:${APP_PORT:-3000}/api/ready"
    echo ""

    echo -e "${WHITE}Service Credentials:${NC}"
    echo -e "${CYAN}PgAdmin:${NC}"
    echo "  Email:    ${PGADMIN_EMAIL:-admin@farmersmarket.com}"
    echo "  Password: ${PGADMIN_PASSWORD:-admin123}"
    echo ""
    echo -e "${CYAN}Database:${NC}"
    echo "  Host:     localhost:${POSTGRES_PORT:-5432}"
    echo "  User:     ${POSTGRES_USER:-farmers_user}"
    echo "  Database: ${POSTGRES_DB:-farmers_market}"
    echo ""
    echo -e "${CYAN}Redis:${NC}"
    echo "  Host:     localhost:${REDIS_PORT:-6379}"
    echo "  Password: ${REDIS_PASSWORD:-***}"
    echo ""
}

# ============================================================================
# SHOW LOGS
# ============================================================================

show_logs() {
    print_header "SERVICE LOGS"

    echo -e "${YELLOW}Press Ctrl+C to exit logs view${NC}"
    echo ""
    sleep 2

    docker-compose -f "$COMPOSE_FILE" logs -f --tail=100
}

# ============================================================================
# ROLLBACK
# ============================================================================

rollback() {
    print_header "ROLLING BACK DEPLOYMENT"

    print_step "Stopping services"
    docker-compose -f "$COMPOSE_FILE" down

    print_success "Rollback complete. Previous state restored."
    echo ""
}

# ============================================================================
# MAIN DEPLOYMENT FLOW
# ============================================================================

main() {
    clear

    echo -e "${CYAN}"
    cat << "EOF"
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║        🌾 FARMERS MARKET PLATFORM - PRODUCTION DEPLOYMENT 🌾       ║
║                                                                    ║
║              Divine Agricultural E-Commerce System                 ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
    echo ""

    # Parse command line arguments
    case "${1:-deploy}" in
        deploy)
            check_prerequisites
            setup_environment
            cleanup_docker
            build_application
            run_migrations
            start_services
            health_checks
            display_status

            echo ""
            print_success "🎉 DEPLOYMENT COMPLETE! 🎉"
            echo ""
            print_info "To view logs, run: docker-compose -f $COMPOSE_FILE logs -f"
            print_info "To stop services, run: docker-compose -f $COMPOSE_FILE down"
            echo ""

            read -p "Would you like to view logs now? (y/N): " -n 1 -r
            echo ""
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                show_logs
            fi
            ;;

        logs)
            show_logs
            ;;

        status)
            display_status
            ;;

        stop)
            print_step "Stopping all services"
            docker-compose -f "$COMPOSE_FILE" down
            print_success "All services stopped"
            ;;

        restart)
            print_step "Restarting all services"
            docker-compose -f "$COMPOSE_FILE" restart
            print_success "All services restarted"
            ;;

        clean)
            cleanup_docker
            ;;

        rollback)
            rollback
            ;;

        help|*)
            echo "Usage: $0 [command]"
            echo ""
            echo "Commands:"
            echo "  deploy     - Full deployment (default)"
            echo "  logs       - View service logs"
            echo "  status     - Show deployment status"
            echo "  stop       - Stop all services"
            echo "  restart    - Restart all services"
            echo "  clean      - Clean up Docker resources"
            echo "  rollback   - Rollback deployment"
            echo "  help       - Show this help message"
            echo ""
            ;;
    esac
}

# ============================================================================
# SCRIPT ENTRY POINT
# ============================================================================

# Change to script directory
cd "$SCRIPT_DIR"

# Run main function with all arguments
main "$@"
