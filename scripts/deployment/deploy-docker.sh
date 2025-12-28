#!/bin/bash

# ╔════════════════════════════════════════════════════════════════════╗
# ║ 🌾 FARMERS MARKET PLATFORM - DOCKER DEPLOYMENT SCRIPT            ║
# ║ Deploy to Docker Desktop with production configuration            ║
# ╚════════════════════════════════════════════════════════════════════╝

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Docker is running
check_docker() {
    print_header "Checking Docker Status"

    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker Desktop."
        exit 1
    fi

    print_success "Docker is running"
}

# Check if .env file exists
check_env_file() {
    print_header "Checking Environment Configuration"

    if [ ! -f .env ]; then
        print_warning ".env file not found. Creating from .env.example..."

        if [ -f .env.example ]; then
            cp .env.example .env
            print_success "Created .env file from .env.example"
            print_warning "Please update .env with your production values!"
            echo ""
            read -p "Press Enter to continue or Ctrl+C to exit and update .env first..."
        else
            print_error ".env.example not found. Cannot create .env"
            exit 1
        fi
    else
        print_success ".env file exists"
    fi
}

# Stop existing containers
stop_existing() {
    print_header "Stopping Existing Containers"

    if docker-compose ps | grep -q "Up"; then
        print_info "Stopping existing containers..."
        docker-compose down
        print_success "Stopped existing containers"
    else
        print_info "No running containers to stop"
    fi
}

# Clean build artifacts
clean_build() {
    print_header "Cleaning Build Artifacts"

    print_info "Removing .next directory..."
    rm -rf .next

    print_info "Removing node_modules cache..."
    rm -rf node_modules/.cache

    print_success "Build artifacts cleaned"
}

# Build production image
build_image() {
    print_header "Building Production Docker Image"

    print_info "This may take several minutes..."
    echo ""

    docker-compose build --no-cache app

    if [ $? -eq 0 ]; then
        print_success "Docker image built successfully"
    else
        print_error "Failed to build Docker image"
        exit 1
    fi
}

# Start services
start_services() {
    print_header "Starting Services"

    print_info "Starting all services in production mode..."
    echo ""

    docker-compose up -d

    if [ $? -eq 0 ]; then
        print_success "Services started successfully"
    else
        print_error "Failed to start services"
        exit 1
    fi
}

# Wait for services to be healthy
wait_for_health() {
    print_header "Waiting for Services to be Healthy"

    print_info "Checking database health..."
    COUNTER=0
    MAX_WAIT=60

    while [ $COUNTER -lt $MAX_WAIT ]; do
        if docker-compose ps | grep postgres | grep -q "healthy"; then
            print_success "Database is healthy"
            break
        fi

        sleep 2
        COUNTER=$((COUNTER + 2))
        echo -n "."
    done

    if [ $COUNTER -eq $MAX_WAIT ]; then
        print_error "Database did not become healthy within ${MAX_WAIT} seconds"
        exit 1
    fi

    echo ""
    print_info "Checking Redis health..."
    COUNTER=0

    while [ $COUNTER -lt $MAX_WAIT ]; do
        if docker-compose ps | grep redis | grep -q "healthy"; then
            print_success "Redis is healthy"
            break
        fi

        sleep 2
        COUNTER=$((COUNTER + 2))
        echo -n "."
    done

    if [ $COUNTER -eq $MAX_WAIT ]; then
        print_error "Redis did not become healthy within ${MAX_WAIT} seconds"
        exit 1
    fi

    echo ""
    print_info "Checking application health..."
    COUNTER=0
    MAX_WAIT=120  # App takes longer to start

    while [ $COUNTER -lt $MAX_WAIT ]; do
        if docker-compose ps | grep app | grep -q "healthy"; then
            print_success "Application is healthy"
            break
        fi

        sleep 3
        COUNTER=$((COUNTER + 3))
        echo -n "."
    done

    if [ $COUNTER -eq $MAX_WAIT ]; then
        print_error "Application did not become healthy within ${MAX_WAIT} seconds"
        print_info "Check logs with: docker-compose logs app"
        exit 1
    fi

    echo ""
}

# Run database migrations
run_migrations() {
    print_header "Running Database Migrations"

    print_info "Running Prisma migrations..."

    docker-compose exec -T app npx prisma migrate deploy

    if [ $? -eq 0 ]; then
        print_success "Migrations completed successfully"
    else
        print_error "Migrations failed"
        exit 1
    fi
}

# Seed database (optional)
seed_database() {
    print_header "Database Seeding (Optional)"

    echo ""
    read -p "Do you want to seed the database with sample data? (y/N): " -n 1 -r
    echo ""

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Seeding database..."

        docker-compose exec -T app npm run db:seed

        if [ $? -eq 0 ]; then
            print_success "Database seeded successfully"
        else
            print_warning "Database seeding failed (non-critical)"
        fi
    else
        print_info "Skipping database seeding"
    fi
}

# Show container status
show_status() {
    print_header "Container Status"

    echo ""
    docker-compose ps
    echo ""
}

# Show deployment info
show_deployment_info() {
    print_header "🎉 Deployment Complete!"

    echo ""
    print_success "All services are running!"
    echo ""

    print_info "Access your application:"
    echo "  🌐 Main App:      http://localhost:${APP_PORT:-3000}"
    echo "  🌐 Nginx Proxy:   http://localhost:${HTTP_PORT:-80}"
    echo "  🔧 PgAdmin:       http://localhost:${PGADMIN_PORT:-5050} (run with --profile admin)"
    echo "  📊 Redis Cmd:     http://localhost:${REDIS_COMMANDER_PORT:-8081} (run with --profile admin)"
    echo ""

    print_info "Useful commands:"
    echo "  📋 View logs:         docker-compose logs -f"
    echo "  📋 View app logs:     docker-compose logs -f app"
    echo "  🛑 Stop services:     docker-compose down"
    echo "  🔄 Restart services:  docker-compose restart"
    echo "  🗄️  Access database:   docker-compose exec postgres psql -U farmers_user -d farmers_market"
    echo ""

    print_info "Test credentials:"
    echo "  👨‍🌾 Farmer:    farmer@example.com / password123"
    echo "  👤 Customer:  customer@example.com / password123"
    echo "  👑 Admin:     admin@example.com / password123"
    echo ""

    print_success "Happy farming! 🌾🚀"
}

# Main deployment flow
main() {
    echo ""
    print_header "🌾 FARMERS MARKET PLATFORM - DOCKER DEPLOYMENT"
    echo ""

    # Check prerequisites
    check_docker
    check_env_file

    # Ask for deployment type
    echo ""
    print_info "Select deployment type:"
    echo "  1) Full deployment (stop existing, rebuild, start)"
    echo "  2) Quick restart (restart existing containers)"
    echo "  3) Clean rebuild (remove everything and rebuild)"
    echo ""
    read -p "Enter your choice (1-3): " -n 1 -r DEPLOY_TYPE
    echo ""
    echo ""

    case $DEPLOY_TYPE in
        1)
            # Full deployment
            stop_existing
            clean_build
            build_image
            start_services
            wait_for_health
            run_migrations
            seed_database
            show_status
            show_deployment_info
            ;;
        2)
            # Quick restart
            print_header "Quick Restart"
            docker-compose restart
            print_success "Services restarted"
            show_status
            ;;
        3)
            # Clean rebuild
            print_header "Clean Rebuild"
            print_warning "This will remove all containers, volumes, and images!"
            read -p "Are you sure? (y/N): " -n 1 -r
            echo ""

            if [[ $REPLY =~ ^[Yy]$ ]]; then
                docker-compose down -v --rmi all
                clean_build
                build_image
                start_services
                wait_for_health
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
