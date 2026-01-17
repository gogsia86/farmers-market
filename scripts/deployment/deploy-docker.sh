#!/bin/bash
# ========================================
# FARMERS MARKET PLATFORM - DOCKER DEPLOYMENT
# Production Deployment Script
# ========================================

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.production"
BACKUP_DIR="./backups"
LOG_FILE="./logs/deployment-$(date +%Y%m%d_%H%M%S).log"

# Create logs directory if it doesn't exist
mkdir -p ./logs

# Logging function
log() {
    echo -e "${2}${1}${NC}" | tee -a "$LOG_FILE"
}

# Error handler
error_exit() {
    log "❌ ERROR: $1" "$RED"
    log "Deployment failed at $(date)" "$RED"
    exit 1
}

# Success handler
success() {
    log "✅ $1" "$GREEN"
}

# Info handler
info() {
    log "ℹ️  $1" "$BLUE"
}

# Warning handler
warn() {
    log "⚠️  $1" "$YELLOW"
}

# Print banner
print_banner() {
    log "════════════════════════════════════════════════════════════" "$MAGENTA"
    log "  🌾 FARMERS MARKET PLATFORM - PRODUCTION DEPLOYMENT" "$MAGENTA"
    log "  Docker-based deployment script" "$MAGENTA"
    log "  Started at: $(date)" "$MAGENTA"
    log "════════════════════════════════════════════════════════════" "$MAGENTA"
}

# Check prerequisites
check_prerequisites() {
    log "\n📋 Checking prerequisites..." "$CYAN"

    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        error_exit "Docker is not installed. Please install Docker first."
    fi
    success "Docker is installed ($(docker --version))"

    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        error_exit "Docker Compose is not installed. Please install Docker Compose first."
    fi
    success "Docker Compose is installed ($(docker-compose --version))"

    # Check if environment file exists
    if [ ! -f "$ENV_FILE" ]; then
        error_exit "Environment file $ENV_FILE not found. Please create it first."
    fi
    success "Environment file found: $ENV_FILE"

    # Check if compose file exists
    if [ ! -f "$COMPOSE_FILE" ]; then
        error_exit "Docker Compose file $COMPOSE_FILE not found."
    fi
    success "Docker Compose file found: $COMPOSE_FILE"

    # Check if user has Docker permissions
    if ! docker ps &> /dev/null; then
        error_exit "Cannot run Docker commands. Please check Docker permissions."
    fi
    success "Docker permissions OK"
}

# Load environment variables
load_environment() {
    log "\n🔐 Loading environment variables..." "$CYAN"

    if [ -f "$ENV_FILE" ]; then
        export $(cat "$ENV_FILE" | grep -v '^#' | xargs)
        success "Environment variables loaded from $ENV_FILE"
    else
        error_exit "Environment file not found: $ENV_FILE"
    fi
}

# Backup current deployment
backup_current_deployment() {
    log "\n💾 Creating backup..." "$CYAN"

    mkdir -p "$BACKUP_DIR"

    # Check if containers are running
    if docker-compose -f "$COMPOSE_FILE" ps | grep -q "Up"; then
        info "Current deployment is running, creating backup..."

        # Backup database
        BACKUP_FILE="$BACKUP_DIR/db_backup_$(date +%Y%m%d_%H%M%S).sql.gz"
        docker-compose -f "$COMPOSE_FILE" exec -T postgres pg_dump -U farmersmarket farmersmarket | gzip > "$BACKUP_FILE" || warn "Database backup failed (container might not be running)"

        if [ -f "$BACKUP_FILE" ]; then
            success "Database backup created: $BACKUP_FILE"
        fi

        # Save current container images info
        docker-compose -f "$COMPOSE_FILE" images > "$BACKUP_DIR/images_$(date +%Y%m%d_%H%M%S).txt"
        success "Container images info saved"
    else
        info "No running containers to backup"
    fi
}

# Pull latest code (if in git repo)
pull_latest_code() {
    log "\n📥 Checking for code updates..." "$CYAN"

    if [ -d .git ]; then
        CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
        info "Current branch: $CURRENT_BRANCH"

        # Stash any local changes
        if ! git diff-index --quiet HEAD --; then
            warn "Local changes detected, stashing..."
            git stash save "Auto-stash before deployment $(date)"
        fi

        # Pull latest changes
        git pull origin "$CURRENT_BRANCH" || warn "Git pull failed, continuing with current code..."

        COMMIT_HASH=$(git rev-parse --short HEAD)
        success "Current commit: $COMMIT_HASH"
    else
        info "Not a git repository, skipping code update"
    fi
}

# Build Docker images
build_images() {
    log "\n🏗️  Building Docker images..." "$CYAN"

    # Build with no cache for production
    docker-compose -f "$COMPOSE_FILE" build --no-cache --pull || error_exit "Docker build failed"

    success "Docker images built successfully"

    # Show image sizes
    log "\n📊 Image sizes:" "$BLUE"
    docker-compose -f "$COMPOSE_FILE" images
}

# Stop current containers
stop_containers() {
    log "\n⏹️  Stopping current containers..." "$CYAN"

    if docker-compose -f "$COMPOSE_FILE" ps | grep -q "Up"; then
        docker-compose -f "$COMPOSE_FILE" stop || warn "Failed to stop some containers"
        success "Containers stopped"
    else
        info "No running containers to stop"
    fi
}

# Run database migrations
run_migrations() {
    log "\n🗄️  Running database migrations..." "$CYAN"

    # Start database container if not running
    docker-compose -f "$COMPOSE_FILE" up -d postgres redis

    # Wait for database to be ready
    info "Waiting for database to be ready..."
    sleep 5

    # Check database health
    for i in {1..30}; do
        if docker-compose -f "$COMPOSE_FILE" exec -T postgres pg_isready -U farmersmarket &> /dev/null; then
            success "Database is ready"
            break
        fi
        if [ $i -eq 30 ]; then
            error_exit "Database did not become ready in time"
        fi
        echo -n "."
        sleep 1
    done

    # Run Prisma migrations
    docker-compose -f "$COMPOSE_FILE" run --rm app npx prisma migrate deploy || error_exit "Database migration failed"

    success "Database migrations completed successfully"

    # Generate Prisma Client
    docker-compose -f "$COMPOSE_FILE" run --rm app npx prisma generate || warn "Prisma generate failed"
}

# Start all services
start_services() {
    log "\n🚀 Starting all services..." "$CYAN"

    docker-compose -f "$COMPOSE_FILE" up -d || error_exit "Failed to start services"

    success "All services started"

    # Show running containers
    log "\n📦 Running containers:" "$BLUE"
    docker-compose -f "$COMPOSE_FILE" ps
}

# Health check
health_check() {
    log "\n🏥 Running health checks..." "$CYAN"

    # Wait for application to start
    info "Waiting for application to be ready..."
    sleep 10

    # Check application health
    MAX_RETRIES=30
    RETRY_COUNT=0

    while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
        if curl -f http://localhost:3000/api/health &> /dev/null; then
            success "Application health check passed!"
            break
        fi

        RETRY_COUNT=$((RETRY_COUNT + 1))
        if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
            error_exit "Application health check failed after $MAX_RETRIES attempts"
        fi

        echo -n "."
        sleep 2
    done

    # Check all services
    log "\n📊 Service Status:" "$BLUE"
    docker-compose -f "$COMPOSE_FILE" ps

    # Check database connection
    if docker-compose -f "$COMPOSE_FILE" exec -T postgres pg_isready -U farmersmarket &> /dev/null; then
        success "Database is healthy"
    else
        warn "Database health check failed"
    fi

    # Check Redis
    if docker-compose -f "$COMPOSE_FILE" exec -T redis redis-cli ping &> /dev/null; then
        success "Redis is healthy"
    else
        warn "Redis health check failed"
    fi

    # Check application logs for errors
    log "\n📜 Recent application logs:" "$BLUE"
    docker-compose -f "$COMPOSE_FILE" logs --tail=20 app
}

# Show deployment info
show_deployment_info() {
    log "\n════════════════════════════════════════════════════════════" "$GREEN"
    log "  ✅ DEPLOYMENT COMPLETE!" "$GREEN"
    log "════════════════════════════════════════════════════════════" "$GREEN"

    log "\n🌐 Application URLs:" "$CYAN"
    log "   - HTTP: http://localhost" "$NC"
    log "   - HTTPS: https://localhost (if SSL configured)" "$NC"
    log "   - API: http://localhost/api" "$NC"
    log "   - Health: http://localhost:3000/api/health" "$NC"

    log "\n📊 Useful Commands:" "$CYAN"
    log "   - View logs: docker-compose -f $COMPOSE_FILE logs -f" "$NC"
    log "   - Stop services: docker-compose -f $COMPOSE_FILE stop" "$NC"
    log "   - Restart services: docker-compose -f $COMPOSE_FILE restart" "$NC"
    log "   - View status: docker-compose -f $COMPOSE_FILE ps" "$NC"
    log "   - Shell into app: docker-compose -f $COMPOSE_FILE exec app sh" "$NC"

    log "\n🗄️  Database Commands:" "$CYAN"
    log "   - Prisma Studio: docker-compose -f $COMPOSE_FILE exec app npx prisma studio" "$NC"
    log "   - Database shell: docker-compose -f $COMPOSE_FILE exec postgres psql -U farmersmarket" "$NC"
    log "   - Create backup: ./scripts/backup-database.sh" "$NC"

    log "\n📝 Logs saved to: $LOG_FILE" "$BLUE"
    log "💾 Backups location: $BACKUP_DIR" "$BLUE"

    log "\n════════════════════════════════════════════════════════════" "$GREEN"
}

# Rollback function (in case of failure)
rollback() {
    log "\n🔄 Rolling back deployment..." "$YELLOW"

    # Stop new containers
    docker-compose -f "$COMPOSE_FILE" down

    # Restore from backup (if available)
    LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/db_backup_*.sql.gz 2>/dev/null | head -1)
    if [ -n "$LATEST_BACKUP" ]; then
        warn "Latest backup found: $LATEST_BACKUP"
        warn "To restore: zcat $LATEST_BACKUP | docker-compose -f $COMPOSE_FILE exec -T postgres psql -U farmersmarket farmersmarket"
    fi

    error_exit "Deployment rolled back due to errors"
}

# Trap errors and rollback
trap 'rollback' ERR

# Main deployment flow
main() {
    print_banner
    check_prerequisites
    load_environment
    backup_current_deployment
    pull_latest_code
    build_images
    stop_containers
    run_migrations
    start_services
    health_check
    show_deployment_info

    log "\n🎉 Deployment completed successfully at $(date)" "$GREEN"
}

# Run main function
main

exit 0
