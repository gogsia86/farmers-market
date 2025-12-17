#!/bin/bash

# ============================================
# 🚀 FARMERS MARKET PLATFORM - PRODUCTION SETUP SCRIPT
# ============================================
# Version: 3.0
# Last Updated: 2025-01-XX
# Description: Automated production environment setup and deployment
# Platform: Linux/Mac
# ============================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
ENV_FILE=".env.production"
LOG_FILE="setup-production.log"
BACKUP_DIR="backups"

# Functions
print_header() {
    echo -e "\n${MAGENTA}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${MAGENTA}║                                                            ║${NC}"
    echo -e "${MAGENTA}║  🌾 FARMERS MARKET PLATFORM - PRODUCTION SETUP 🚀         ║${NC}"
    echo -e "${MAGENTA}║                                                            ║${NC}"
    echo -e "${MAGENTA}╚════════════════════════════════════════════════════════════╝${NC}\n"
}

print_step() {
    echo -e "${CYAN}▶ $1${NC}"
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

# Check prerequisites
check_prerequisites() {
    print_step "Checking prerequisites..."

    local missing=0

    # Check Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v | cut -d'v' -f2)
        print_success "Node.js $NODE_VERSION installed"
    else
        print_error "Node.js is not installed"
        missing=1
    fi

    # Check npm
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm -v)
        print_success "npm $NPM_VERSION installed"
    else
        print_error "npm is not installed"
        missing=1
    fi

    # Check if in correct directory
    if [ ! -f "package.json" ]; then
        print_error "package.json not found. Please run this script from the project root."
        exit 1
    fi

    if [ $missing -eq 1 ]; then
        print_error "Missing required dependencies. Please install them first."
        exit 1
    fi

    print_success "All prerequisites met"
}

# Setup environment variables
setup_environment() {
    print_step "Setting up environment variables..."

    if [ -f "$ENV_FILE" ]; then
        print_warning "Production environment file already exists: $ENV_FILE"
        read -p "Do you want to overwrite it? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Keeping existing environment file"
            return 0
        fi

        # Backup existing file
        mkdir -p "$BACKUP_DIR"
        BACKUP_FILE="$BACKUP_DIR/.env.production.backup.$(date +%Y%m%d_%H%M%S)"
        cp "$ENV_FILE" "$BACKUP_FILE"
        print_info "Backed up existing file to $BACKUP_FILE"
    fi

    if [ ! -f ".env.example" ]; then
        print_error ".env.example not found"
        exit 1
    fi

    # Copy example file
    cp .env.example "$ENV_FILE"
    print_success "Created $ENV_FILE from template"

    # Prompt for required variables
    echo ""
    print_info "Please configure the following required variables:"
    echo ""

    # Node Environment
    echo "NODE_ENV=production" >> "$ENV_FILE"

    # App URL
    read -p "Enter your production URL (e.g., https://yourdomain.com): " APP_URL
    if [ -n "$APP_URL" ]; then
        sed -i.bak "s|NEXT_PUBLIC_APP_URL=.*|NEXT_PUBLIC_APP_URL=$APP_URL|g" "$ENV_FILE"
        sed -i.bak "s|NEXTAUTH_URL=.*|NEXTAUTH_URL=$APP_URL|g" "$ENV_FILE"
        rm -f "${ENV_FILE}.bak"
    fi

    # Database URL
    echo ""
    print_info "Database Configuration:"
    echo "1) PostgreSQL (Recommended for production)"
    echo "2) SQLite (For testing only)"
    read -p "Select database type (1 or 2): " DB_CHOICE

    if [ "$DB_CHOICE" = "1" ]; then
        read -p "Enter PostgreSQL connection string: " DB_URL
        if [ -n "$DB_URL" ]; then
            sed -i.bak "s|DATABASE_URL=.*|DATABASE_URL=$DB_URL|g" "$ENV_FILE"
            sed -i.bak "s|DIRECT_URL=.*|DIRECT_URL=$DB_URL|g" "$ENV_FILE"
            rm -f "${ENV_FILE}.bak"
        fi
    else
        print_warning "Using SQLite for production is not recommended"
        sed -i.bak "s|DATABASE_URL=.*|DATABASE_URL=file:./production.db|g" "$ENV_FILE"
        sed -i.bak "s|DIRECT_URL=.*|DIRECT_URL=file:./production.db|g" "$ENV_FILE"
        rm -f "${ENV_FILE}.bak"
    fi

    # NextAuth Secret
    echo ""
    print_step "Generating secure NextAuth secret..."
    NEXTAUTH_SECRET=$(openssl rand -base64 32)
    sed -i.bak "s|NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET=$NEXTAUTH_SECRET|g" "$ENV_FILE"
    rm -f "${ENV_FILE}.bak"
    print_success "Generated secure NextAuth secret"

    echo ""
    print_success "Environment variables configured"
    print_warning "Please edit $ENV_FILE to add optional services (Stripe, Resend, etc.)"
}

# Install dependencies
install_dependencies() {
    print_step "Installing dependencies..."

    if [ -d "node_modules" ]; then
        print_warning "node_modules already exists"
        read -p "Do you want to reinstall? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            rm -rf node_modules
            print_info "Removed existing node_modules"
        else
            print_info "Skipping dependency installation"
            return 0
        fi
    fi

    npm ci --production=false
    print_success "Dependencies installed"
}

# Setup database
setup_database() {
    print_step "Setting up database..."

    # Generate Prisma Client
    print_info "Generating Prisma Client..."
    npx prisma generate
    print_success "Prisma Client generated"

    # Run migrations
    print_info "Running database migrations..."
    if npx prisma migrate deploy; then
        print_success "Database migrations completed"
    else
        print_warning "Migration failed. You may need to configure the database manually."
    fi

    # Ask about seeding
    echo ""
    read -p "Do you want to seed the database with initial data? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npm run db:seed:basic
        print_success "Database seeded with initial data"
    fi
}

# Build production code
build_application() {
    print_step "Building production application..."

    # Clean previous builds
    print_info "Cleaning previous builds..."
    rm -rf .next
    rm -rf node_modules/.cache

    # Run build
    print_info "Running production build..."
    if npm run build; then
        print_success "Production build completed successfully"
    else
        print_error "Build failed. Please check the logs."
        exit 1
    fi

    # Verify build
    if [ -d ".next" ]; then
        print_success "Build verified: .next directory exists"
    else
        print_error "Build verification failed: .next directory not found"
        exit 1
    fi
}

# Run health checks
run_health_checks() {
    print_step "Running health checks..."

    # Start server in background
    print_info "Starting server for health checks..."
    NODE_ENV=production npm run start > /dev/null 2>&1 &
    SERVER_PID=$!

    # Wait for server to start
    sleep 10

    # Check if server is running
    if kill -0 $SERVER_PID 2>/dev/null; then
        print_success "Server started (PID: $SERVER_PID)"

        # Test health endpoint
        if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
            print_success "Health check passed"
        else
            print_warning "Health check endpoint not responding"
        fi

        # Stop server
        kill $SERVER_PID
        sleep 2
        print_info "Test server stopped"
    else
        print_error "Server failed to start"
    fi
}

# Display next steps
display_next_steps() {
    echo ""
    echo -e "${MAGENTA}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${MAGENTA}║                                                            ║${NC}"
    echo -e "${MAGENTA}║  ✅ PRODUCTION SETUP COMPLETE!                            ║${NC}"
    echo -e "${MAGENTA}║                                                            ║${NC}"
    echo -e "${MAGENTA}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    print_info "Next Steps:"
    echo ""
    echo "1. Review and configure additional environment variables:"
    echo "   ${YELLOW}nano $ENV_FILE${NC}"
    echo ""
    echo "2. Start the production server:"
    echo "   ${GREEN}npm run start${NC}"
    echo ""
    echo "3. Or start with PM2 for process management:"
    echo "   ${GREEN}pm2 start npm --name 'farmers-market' -- run start${NC}"
    echo ""
    echo "4. Access your application:"
    echo "   ${CYAN}http://localhost:3001${NC}"
    echo ""
    echo "5. Monitor application health:"
    echo "   ${CYAN}curl http://localhost:3001/api/health${NC}"
    echo ""
    print_info "Documentation:"
    echo "   - Production Setup Guide: PRODUCTION_SETUP_GUIDE.md"
    echo "   - Deployment Checklist: DEPLOYMENT_CHECKLIST.md"
    echo "   - Troubleshooting: See PRODUCTION_SETUP_GUIDE.md"
    echo ""
    print_success "🌾 Ready to deploy! Happy farming! ✨"
    echo ""
}

# Main execution
main() {
    print_header

    # Log everything
    exec > >(tee -a "$LOG_FILE")
    exec 2>&1

    echo "Setup started at: $(date)"
    echo ""

    check_prerequisites

    echo ""
    read -p "Continue with production setup? (Y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Nn]$ ]]; then
        print_info "Setup cancelled"
        exit 0
    fi

    setup_environment
    echo ""

    read -p "Install dependencies? (Y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        install_dependencies
        echo ""
    fi

    read -p "Setup database? (Y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        setup_database
        echo ""
    fi

    read -p "Build production code? (Y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        build_application
        echo ""
    fi

    read -p "Run health checks? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        run_health_checks
        echo ""
    fi

    echo ""
    echo "Setup completed at: $(date)"
    echo ""

    display_next_steps
}

# Run main function
main "$@"
