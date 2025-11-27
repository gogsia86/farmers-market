#!/bin/bash

###############################################################################
# 🌟 Divine Monitoring Setup Script
# Farmers Market Platform - Automated Monitoring Installation
# Version: 1.0.0
#
# This script sets up the monitoring daemon with database migrations,
# environment configuration, and service installation.
###############################################################################

set -e  # Exit on error
set -u  # Exit on undefined variable

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

###############################################################################
# HELPER FUNCTIONS
###############################################################################

print_header() {
    echo -e "${PURPLE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║  🌾 DIVINE WORKFLOW MONITORING SETUP                     ║${NC}"
    echo -e "${PURPLE}║  Farmers Market Platform                                  ║${NC}"
    echo -e "${PURPLE}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_step() {
    echo -e "${BLUE}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

check_command() {
    if command -v "$1" &> /dev/null; then
        print_success "$1 is installed"
        return 0
    else
        print_error "$1 is not installed"
        return 1
    fi
}

###############################################################################
# PREREQUISITE CHECKS
###############################################################################

check_prerequisites() {
    print_step "Checking prerequisites..."

    local all_ok=true

    # Check Node.js
    if ! check_command "node"; then
        print_error "Node.js is required. Please install Node.js 18+ first."
        all_ok=false
    else
        NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VERSION" -lt 18 ]; then
            print_error "Node.js 18+ is required (found v$NODE_VERSION)"
            all_ok=false
        fi
    fi

    # Check npm
    if ! check_command "npm"; then
        print_error "npm is required"
        all_ok=false
    fi

    # Check PostgreSQL client
    if ! check_command "psql"; then
        print_warning "PostgreSQL client not found (optional)"
    fi

    # Check if .env file exists
    if [ ! -f "$PROJECT_ROOT/.env" ]; then
        print_warning ".env file not found. Will create from template."
    else
        print_success ".env file exists"
    fi

    if [ "$all_ok" = false ]; then
        print_error "Prerequisites check failed. Please install missing dependencies."
        exit 1
    fi

    print_success "All prerequisites met"
    echo ""
}

###############################################################################
# ENVIRONMENT SETUP
###############################################################################

setup_environment() {
    print_step "Setting up environment variables..."

    cd "$PROJECT_ROOT"

    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            print_success "Created .env from .env.example"
        else
            print_warning "No .env.example found. Creating minimal .env..."
            cat > .env << 'EOF'
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/farmers_market?schema=public"

# Application
BASE_URL="http://localhost:3000"
NODE_ENV="development"

# Slack Notifications (optional)
SLACK_WEBHOOK_URL=""
SLACK_CHANNEL="#monitoring"

# Discord Notifications (optional)
DISCORD_WEBHOOK_URL=""

# Monitoring Configuration
MONITORING_ENABLED=true
MONITORING_INTERVAL_MINUTES=15
EOF
            print_success "Created minimal .env file"
        fi
    fi

    # Check if webhook URLs are configured
    if grep -q "SLACK_WEBHOOK_URL=\"\"" .env; then
        print_warning "SLACK_WEBHOOK_URL not configured. Slack notifications will be disabled."
        echo "         To enable Slack notifications, add your webhook URL to .env"
    fi

    if grep -q "DISCORD_WEBHOOK_URL=\"\"" .env; then
        print_warning "DISCORD_WEBHOOK_URL not configured. Discord notifications will be disabled."
    fi

    echo ""
}

###############################################################################
# DEPENDENCY INSTALLATION
###############################################################################

install_dependencies() {
    print_step "Installing dependencies..."

    cd "$PROJECT_ROOT"

    if [ ! -d "node_modules" ]; then
        print_step "Running npm install (this may take a few minutes)..."
        npm install
        print_success "Dependencies installed"
    else
        print_success "Dependencies already installed"
    fi

    echo ""
}

###############################################################################
# DATABASE MIGRATION
###############################################################################

run_database_migration() {
    print_step "Running database migrations..."

    cd "$PROJECT_ROOT"

    # Check if Prisma is available
    if [ ! -f "node_modules/.bin/prisma" ]; then
        print_error "Prisma not found. Please run npm install first."
        return 1
    fi

    # Generate Prisma client
    print_step "Generating Prisma client..."
    npx prisma generate
    print_success "Prisma client generated"

    # Run migrations
    print_step "Applying database migrations..."
    if npx prisma migrate deploy; then
        print_success "Database migrations completed"
    else
        print_error "Database migration failed"
        print_warning "Please check your DATABASE_URL in .env and ensure PostgreSQL is running"
        return 1
    fi

    echo ""
}

###############################################################################
# DIRECTORY SETUP
###############################################################################

setup_directories() {
    print_step "Creating required directories..."

    cd "$PROJECT_ROOT"

    # Create log directories
    mkdir -p logs/pm2
    mkdir -p logs/monitoring

    # Create monitoring reports directory
    mkdir -p monitoring-reports

    # Set permissions
    chmod 755 logs
    chmod 755 monitoring-reports

    print_success "Directories created"
    echo ""
}

###############################################################################
# PM2 SETUP
###############################################################################

setup_pm2() {
    print_step "Setting up PM2 process manager..."

    if ! command -v pm2 &> /dev/null; then
        print_warning "PM2 not installed globally"
        read -p "Install PM2 globally? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            npm install -g pm2
            print_success "PM2 installed globally"
        else
            print_warning "Skipping PM2 installation. You can install it later with: npm install -g pm2"
            return 0
        fi
    else
        print_success "PM2 is already installed"
    fi

    # Check if ecosystem.config.js exists
    if [ ! -f "$PROJECT_ROOT/ecosystem.config.js" ]; then
        print_error "ecosystem.config.js not found"
        return 1
    fi

    print_success "PM2 setup complete"
    echo ""
}

###############################################################################
# SYSTEMD SETUP (Linux only)
###############################################################################

setup_systemd() {
    print_step "Setting up systemd service (Linux only)..."

    # Check if running on Linux with systemd
    if [ ! -d "/etc/systemd/system" ]; then
        print_warning "Systemd not detected. Skipping systemd setup."
        return 0
    fi

    if [ "$EUID" -ne 0 ]; then
        print_warning "Root privileges required for systemd setup"
        print_warning "To install systemd service manually, run:"
        echo "         sudo cp deployment/systemd/workflow-monitor.service /etc/systemd/system/"
        echo "         sudo systemctl daemon-reload"
        echo "         sudo systemctl enable workflow-monitor"
        echo "         sudo systemctl start workflow-monitor"
        return 0
    fi

    # Copy service file
    if [ -f "$PROJECT_ROOT/deployment/systemd/workflow-monitor.service" ]; then
        cp "$PROJECT_ROOT/deployment/systemd/workflow-monitor.service" /etc/systemd/system/
        systemctl daemon-reload
        print_success "Systemd service installed"

        # Enable service
        systemctl enable workflow-monitor
        print_success "Systemd service enabled (will start on boot)"
    else
        print_error "Systemd service file not found"
    fi

    echo ""
}

###############################################################################
# TEST NOTIFICATIONS
###############################################################################

test_notifications() {
    print_step "Testing notification channels..."

    cd "$PROJECT_ROOT"

    # Check if test script exists
    if [ -f "scripts/test-notifications.ts" ]; then
        print_step "Running notification test..."
        npx tsx scripts/test-notifications.ts
    else
        print_warning "Notification test script not found. Skipping tests."
    fi

    echo ""
}

###############################################################################
# MAIN INSTALLATION
###############################################################################

main() {
    print_header

    print_step "Starting monitoring setup..."
    echo ""

    # Run all setup steps
    check_prerequisites
    setup_environment
    install_dependencies
    run_database_migration
    setup_directories
    setup_pm2
    setup_systemd

    # Final success message
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✅ MONITORING SETUP COMPLETED SUCCESSFULLY               ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    # Usage instructions
    echo -e "${BLUE}📚 Quick Start Guide:${NC}"
    echo ""
    echo -e "${YELLOW}Using PM2 (Recommended):${NC}"
    echo "  Start daemon:    pm2 start ecosystem.config.js --only workflow-monitor-daemon"
    echo "  View logs:       pm2 logs workflow-monitor-daemon"
    echo "  Stop daemon:     pm2 stop workflow-monitor-daemon"
    echo "  Restart daemon:  pm2 restart workflow-monitor-daemon"
    echo "  Monitor:         pm2 monit"
    echo ""

    if [ -d "/etc/systemd/system" ]; then
        echo -e "${YELLOW}Using Systemd:${NC}"
        echo "  Start daemon:    sudo systemctl start workflow-monitor"
        echo "  Stop daemon:     sudo systemctl stop workflow-monitor"
        echo "  View status:     sudo systemctl status workflow-monitor"
        echo "  View logs:       sudo journalctl -u workflow-monitor -f"
        echo ""
    fi

    echo -e "${YELLOW}Manual Start (Development):${NC}"
    echo "  npm run monitor:daemon"
    echo ""

    echo -e "${BLUE}📊 Monitoring Tools:${NC}"
    echo "  Test monitoring:     npm run monitor:health"
    echo "  Run all workflows:   npm run monitor"
    echo "  View reports:        ls -la monitoring-reports/"
    echo ""

    echo -e "${BLUE}🔔 Notifications:${NC}"
    if grep -q "SLACK_WEBHOOK_URL=\"\"" .env 2>/dev/null; then
        echo -e "  ${YELLOW}⚠${NC}  Slack notifications: ${RED}NOT CONFIGURED${NC}"
        echo "      Add SLACK_WEBHOOK_URL to .env to enable"
    else
        echo -e "  ${GREEN}✓${NC}  Slack notifications: ${GREEN}CONFIGURED${NC}"
    fi

    if grep -q "DISCORD_WEBHOOK_URL=\"\"" .env 2>/dev/null; then
        echo -e "  ${YELLOW}⚠${NC}  Discord notifications: ${RED}NOT CONFIGURED${NC}"
        echo "      Add DISCORD_WEBHOOK_URL to .env to enable"
    else
        echo -e "  ${GREEN}✓${NC}  Discord notifications: ${GREEN}CONFIGURED${NC}"
    fi
    echo ""

    echo -e "${BLUE}📖 Documentation:${NC}"
    echo "  See README.md for detailed configuration and usage"
    echo ""
}

# Run main installation
main "$@"
