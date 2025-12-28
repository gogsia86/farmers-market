#!/bin/bash

# ╔════════════════════════════════════════════════════════════════════╗
# ║ 🌾 FARMERS MARKET PLATFORM - LOCAL DOCKER DEPLOYMENT             ║
# ║ Divine Agricultural E-Commerce System                              ║
# ║ Complete local Docker setup with database initialization          ║
# ╚════════════════════════════════════════════════════════════════════╝

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║ $1${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════════════╝${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

print_step() {
    echo -e "${MAGENTA}➤ $1${NC}"
}

# Check if Docker is running
check_docker() {
    print_header "Checking Docker Status"

    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker Desktop."
        exit 1
    fi

    print_success "Docker is running"
    echo ""
}

# Update .env file with correct Docker credentials
update_env_file() {
    print_header "Configuring Environment Variables"

    if [ ! -f .env ]; then
        print_error ".env file not found!"
        exit 1
    fi

    print_info "Updating DATABASE_URL for Docker..."

    # Backup .env file
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
    print_success "Created backup of .env file"

    # Update DATABASE_URL to use postgres user (from POSTGRES_USER in .env)
    POSTGRES_USER=$(grep "^POSTGRES_USER=" .env | cut -d'=' -f2 | tr -d '"' | tr -d "'")
    POSTGRES_PASSWORD=$(grep "^POSTGRES_PASSWORD=" .env | cut -d'=' -f2 | tr -d '"' | tr -d "'")
    POSTGRES_DB=$(grep "^POSTGRES_DB=" .env | cut -d'=' -f2 | tr -d '"' | tr -d "'")

    # Default values if not found
    POSTGRES_USER=${POSTGRES_USER:-postgres}
    POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-postgres}
    POSTGRES_DB=${POSTGRES_DB:-farmersmarket}

    NEW_DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5432/${POSTGRES_DB}?schema=public"

    # Update DATABASE_URL in .env
    if grep -q "^DATABASE_URL=" .env; then
        # Use @ as delimiter since URL contains /
        sed -i.tmp "s@^DATABASE_URL=.*@DATABASE_URL=\"${NEW_DATABASE_URL}\"@" .env
        rm -f .env.tmp
        print_success "Updated DATABASE_URL in .env"
    else
        echo "DATABASE_URL=\"${NEW_DATABASE_URL}\"" >> .env
        print_success "Added DATABASE_URL to .env"
    fi

    # Update REDIS_URL
    REDIS_PASSWORD=$(grep "^REDIS_PASSWORD=" .env | cut -d'=' -f2 | tr -d '"' | tr -d "'")
    REDIS_PASSWORD=${REDIS_PASSWORD:-FarmersMarket2024!}

    NEW_REDIS_URL="redis://:${REDIS_PASSWORD}@localhost:6379/0"

    if grep -q "^REDIS_URL=" .env; then
        sed -i.tmp "s@^REDIS_URL=.*@REDIS_URL=\"${NEW_REDIS_URL}\"@" .env
        rm -f .env.tmp
        print_success "Updated REDIS_URL in .env"
    else
        echo "REDIS_URL=\"${NEW_REDIS_URL}\"" >> .env
        print_success "Added REDIS_URL to .env"
    fi

    echo ""
    print_info "Database Configuration:"
    echo "  User:     ${POSTGRES_USER}"
    echo "  Password: ${POSTGRES_PASSWORD}"
    echo "  Database: ${POSTGRES_DB}"
    echo "  URL:      ${NEW_DATABASE_URL}"
    echo ""
}

# Stop existing containers
stop_existing() {
    print_header "Stopping Existing Containers"

    # Try all docker-compose files
    for compose_file in docker-compose.local.yml docker-compose.simple.yml docker-compose.dev.yml docker-compose.yml; do
        if [ -f "$compose_file" ]; then
            if docker-compose -f "$compose_file" ps | grep -q "Up"; then
                print_info "Stopping containers from $compose_file..."
                docker-compose -f "$compose_file" down 2>/dev/null || true
            fi
        fi
    done

    print_success "All existing containers stopped"
    echo ""
}

# Start Docker services
start_services() {
    print_header "Starting Docker Services"

    print_step "Starting PostgreSQL and Redis..."
    echo ""

    docker-compose -f docker-compose.local.yml up -d

    if [ $? -eq 0 ]; then
        print_success "Services started successfully"
    else
        print_error "Failed to start services"
        exit 1
    fi
    echo ""
}

# Wait for services to be healthy
wait_for_health() {
    print_header "Waiting for Services to be Healthy"

    print_info "Waiting for PostgreSQL..."
    COUNTER=0
    MAX_WAIT=30

    while [ $COUNTER -lt $MAX_WAIT ]; do
        if docker-compose -f docker-compose.local.yml ps | grep postgres | grep -q "healthy"; then
            print_success "PostgreSQL is healthy"
            break
        fi

        sleep 1
        COUNTER=$((COUNTER + 1))
        echo -n "."
    done

    if [ $COUNTER -eq $MAX_WAIT ]; then
        print_error "PostgreSQL did not become healthy within ${MAX_WAIT} seconds"
        print_info "Checking logs..."
        docker-compose -f docker-compose.local.yml logs postgres
        exit 1
    fi

    echo ""
    print_info "Waiting for Redis..."
    COUNTER=0

    while [ $COUNTER -lt $MAX_WAIT ]; do
        if docker-compose -f docker-compose.local.yml ps | grep redis | grep -q "healthy"; then
            print_success "Redis is healthy"
            break
        fi

        sleep 1
        COUNTER=$((COUNTER + 1))
        echo -n "."
    done

    if [ $COUNTER -eq $MAX_WAIT ]; then
        print_error "Redis did not become healthy within ${MAX_WAIT} seconds"
        exit 1
    fi

    echo ""
}

# Test database connection
test_database_connection() {
    print_header "Testing Database Connection"

    POSTGRES_USER=$(grep "^POSTGRES_USER=" .env | cut -d'=' -f2 | tr -d '"' | tr -d "'")
    POSTGRES_DB=$(grep "^POSTGRES_DB=" .env | cut -d'=' -f2 | tr -d '"' | tr -d "'")
    POSTGRES_USER=${POSTGRES_USER:-postgres}
    POSTGRES_DB=${POSTGRES_DB:-farmersmarket}

    print_info "Testing connection as user: ${POSTGRES_USER}"

    docker exec farmers-market-db psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" -c "SELECT version();" > /dev/null 2>&1

    if [ $? -eq 0 ]; then
        print_success "Database connection successful"
    else
        print_error "Database connection failed"
        print_info "Checking database logs..."
        docker logs farmers-market-db --tail 20
        exit 1
    fi

    echo ""
}

# Run database migrations
run_migrations() {
    print_header "Running Database Migrations"

    print_info "Generating Prisma client..."
    npx prisma generate

    print_info "Running migrations..."
    npx prisma migrate deploy

    if [ $? -eq 0 ]; then
        print_success "Migrations completed successfully"
    else
        print_warning "Migrations failed - this may be normal for first run"
        print_info "You can run migrations manually with: npx prisma migrate deploy"
    fi

    echo ""
}

# Seed database (optional)
seed_database() {
    print_header "Database Seeding"

    read -p "$(echo -e ${CYAN}Do you want to seed the database with sample data? [y/N]: ${NC})" -n 1 -r
    echo ""

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Seeding database..."

        npm run db:seed 2>/dev/null || npm run seed 2>/dev/null || echo "No seed script found"

        if [ $? -eq 0 ]; then
            print_success "Database seeded successfully"
        else
            print_warning "Database seeding failed or not available"
        fi
    else
        print_info "Skipping database seeding"
    fi

    echo ""
}

# Show container status
show_status() {
    print_header "Container Status"

    echo ""
    docker-compose -f docker-compose.local.yml ps
    echo ""
}

# Show deployment info
show_deployment_info() {
    print_header "🎉 Deployment Complete!"

    POSTGRES_USER=$(grep "^POSTGRES_USER=" .env | cut -d'=' -f2 | tr -d '"' | tr -d "'")
    POSTGRES_DB=$(grep "^POSTGRES_DB=" .env | cut -d'=' -f2 | tr -d '"' | tr -d "'")
    POSTGRES_USER=${POSTGRES_USER:-postgres}
    POSTGRES_DB=${POSTGRES_DB:-farmersmarket}

    echo ""
    print_success "Docker infrastructure is running!"
    echo ""

    print_info "Running Services:"
    echo "  ✅ PostgreSQL - Port 5432"
    echo "  ✅ Redis      - Port 6379"
    echo ""

    print_info "Next Steps:"
    echo ""
    echo "  1️⃣  Start the development server:"
    echo "     ${CYAN}npm run dev${NC}"
    echo ""
    echo "  2️⃣  Or start on port 3001 (default dev port):"
    echo "     ${CYAN}npm run dev:turbo${NC}"
    echo ""
    echo "  3️⃣  Access the application:"
    echo "     ${GREEN}http://localhost:3001${NC}"
    echo ""

    print_info "Database Management:"
    echo "  🗄️  Connect to database:"
    echo "     ${CYAN}docker exec -it farmers-market-db psql -U ${POSTGRES_USER} -d ${POSTGRES_DB}${NC}"
    echo ""
    echo "  📊 Open Prisma Studio:"
    echo "     ${CYAN}npx prisma studio${NC}"
    echo ""
    echo "  🔄 Run migrations:"
    echo "     ${CYAN}npx prisma migrate deploy${NC}"
    echo ""

    print_info "Admin Interfaces (optional):"
    echo "  To start PgAdmin and Redis Commander:"
    echo "     ${CYAN}docker-compose -f docker-compose.local.yml --profile admin up -d${NC}"
    echo ""
    echo "  Then access:"
    echo "     🔧 PgAdmin:         http://localhost:5050"
    echo "     📊 Redis Commander: http://localhost:8081"
    echo ""

    print_info "Useful Commands:"
    echo "  📋 View logs:         ${CYAN}docker-compose -f docker-compose.local.yml logs -f${NC}"
    echo "  🛑 Stop services:     ${CYAN}docker-compose -f docker-compose.local.yml down${NC}"
    echo "  🔄 Restart services:  ${CYAN}docker-compose -f docker-compose.local.yml restart${NC}"
    echo "  🗑️  Clean everything:  ${CYAN}docker-compose -f docker-compose.local.yml down -v${NC}"
    echo ""

    print_success "Happy farming! 🌾🚀"
    echo ""
}

# Main deployment flow
main() {
    clear
    echo ""
    print_header "🌾 FARMERS MARKET PLATFORM - LOCAL DOCKER DEPLOYMENT"
    echo ""

    # Check prerequisites
    check_docker

    # Ask for deployment type
    echo ""
    print_info "Select deployment option:"
    echo "  ${GREEN}1)${NC} Fresh deployment (recommended)"
    echo "  ${YELLOW}2)${NC} Restart existing containers"
    echo "  ${RED}3)${NC} Clean rebuild (removes all data)"
    echo ""
    read -p "$(echo -e ${CYAN}Enter your choice [1-3]: ${NC})" -n 1 -r DEPLOY_TYPE
    echo ""
    echo ""

    case $DEPLOY_TYPE in
        1)
            # Fresh deployment
            stop_existing
            update_env_file
            start_services
            wait_for_health
            test_database_connection
            run_migrations
            seed_database
            show_status
            show_deployment_info
            ;;
        2)
            # Quick restart
            print_header "Restarting Services"
            docker-compose -f docker-compose.local.yml restart
            print_success "Services restarted"
            show_status
            ;;
        3)
            # Clean rebuild
            print_header "Clean Rebuild"
            print_warning "This will remove all containers, volumes, and data!"
            read -p "$(echo -e ${RED}Are you sure? [y/N]: ${NC})" -n 1 -r
            echo ""

            if [[ $REPLY =~ ^[Yy]$ ]]; then
                docker-compose -f docker-compose.local.yml down -v
                print_success "Cleaned up existing containers and volumes"
                update_env_file
                start_services
                wait_for_health
                test_database_connection
                run_migrations
                seed_database
                show_status
                show_deployment_info
            else
                print_info "Clean rebuild cancelled"
                exit 0
            fi
            ;;
        *)
            print_error "Invalid choice. Please run the script again."
            exit 1
            ;;
    esac
}

# Run main function
main

exit 0
