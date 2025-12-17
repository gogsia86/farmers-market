#!/bin/bash

# ============================================
# 🚀 FARMERS MARKET PLATFORM - PRODUCTION START SCRIPT
# ============================================
# Version: 3.0
# Last Updated: 2025-01-XX
# Description: Start production application with proper configuration
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
LOG_DIR="logs"
PID_FILE="$LOG_DIR/app.pid"

# Functions
print_header() {
    echo -e "\n${MAGENTA}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${MAGENTA}║                                                            ║${NC}"
    echo -e "${MAGENTA}║  🌾 FARMERS MARKET PLATFORM - PRODUCTION SERVER 🚀        ║${NC}"
    echo -e "${MAGENTA}║                                                            ║${NC}"
    echo -e "${MAGENTA}╚════════════════════════════════════════════════════════════╝${NC}\n"
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

# Check if production build exists
check_build() {
    if [ ! -d ".next" ]; then
        print_error "Production build not found!"
        print_info "Please run: npm run build"
        exit 1
    fi
    print_success "Production build verified"
}

# Check environment file
check_environment() {
    if [ ! -f "$ENV_FILE" ]; then
        print_warning "Production environment file not found: $ENV_FILE"
        print_info "Looking for alternative environment files..."

        if [ -f ".env.local" ]; then
            ENV_FILE=".env.local"
            print_info "Using .env.local"
        elif [ -f ".env" ]; then
            ENV_FILE=".env"
            print_info "Using .env"
        else
            print_error "No environment file found!"
            print_info "Please run: ./setup-production.sh"
            exit 1
        fi
    fi
    print_success "Environment file found: $ENV_FILE"
}

# Load environment variables
load_environment() {
    print_info "Loading environment variables..."
    export $(grep -v '^#' "$ENV_FILE" | xargs)
    export NODE_ENV=production
    print_success "Environment variables loaded"
}

# Check database connection
check_database() {
    print_info "Checking database connection..."
    if npx prisma db pull --force > /dev/null 2>&1; then
        print_success "Database connection successful"
    else
        print_warning "Database connection check failed"
        print_info "The application will attempt to connect anyway"
    fi
}

# Create log directory
setup_logs() {
    if [ ! -d "$LOG_DIR" ]; then
        mkdir -p "$LOG_DIR"
    fi
    print_success "Log directory ready: $LOG_DIR"
}

# Check if server is already running
check_running() {
    if [ -f "$PID_FILE" ]; then
        OLD_PID=$(cat "$PID_FILE")
        if ps -p "$OLD_PID" > /dev/null 2>&1; then
            print_warning "Server is already running (PID: $OLD_PID)"
            echo ""
            read -p "Do you want to restart it? (y/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                print_info "Stopping existing server..."
                kill "$OLD_PID"
                sleep 2
                rm -f "$PID_FILE"
                print_success "Existing server stopped"
            else
                print_info "Keeping existing server running"
                exit 0
            fi
        else
            # PID file exists but process is not running
            rm -f "$PID_FILE"
        fi
    fi
}

# Detect hardware profile
detect_hardware() {
    # Get total system memory in GB
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        TOTAL_MEM_GB=$(sysctl hw.memsize | awk '{print int($2/1024/1024/1024)}')
    else
        # Linux
        TOTAL_MEM_GB=$(free -g | awk '/^Mem:/{print $2}')
    fi

    # Get CPU cores
    if [[ "$OSTYPE" == "darwin"* ]]; then
        CPU_CORES=$(sysctl -n hw.ncpu)
    else
        CPU_CORES=$(nproc)
    fi

    # Determine optimal settings
    if [ "$TOTAL_MEM_GB" -ge 32 ] && [ "$CPU_CORES" -ge 8 ]; then
        # High-end system (HP OMEN profile)
        NODE_OPTIONS="--max-old-space-size=16384"
        PROFILE="OMEN"
    elif [ "$TOTAL_MEM_GB" -ge 8 ]; then
        # Standard system
        NODE_OPTIONS="--max-old-space-size=4096"
        PROFILE="STANDARD"
    else
        # Low-end system
        NODE_OPTIONS="--max-old-space-size=2048"
        PROFILE="MINIMAL"
    fi

    print_info "Detected hardware profile: $PROFILE"
    print_info "System resources: ${TOTAL_MEM_GB}GB RAM, ${CPU_CORES} CPU cores"
    print_info "Node.js options: $NODE_OPTIONS"
}

# Start server
start_server() {
    print_info "Starting production server..."
    echo ""

    # Detect optimal settings
    detect_hardware

    # Export Node options
    export NODE_OPTIONS="$NODE_OPTIONS"

    # Start server based on mode
    if [ "$1" = "foreground" ]; then
        # Foreground mode - useful for debugging
        print_info "Running in FOREGROUND mode (Ctrl+C to stop)"
        echo ""
        npm run start
    elif [ "$1" = "daemon" ]; then
        # Daemon mode with PM2
        if ! command -v pm2 &> /dev/null; then
            print_error "PM2 is not installed!"
            print_info "Install with: npm install -g pm2"
            print_info "Or run in foreground mode: ./start-production.sh foreground"
            exit 1
        fi

        print_info "Starting with PM2 process manager..."
        pm2 start npm --name "farmers-market" -- run start
        pm2 save

        print_success "Server started with PM2!"
        echo ""
        print_info "Useful PM2 commands:"
        echo "  - View logs:    pm2 logs farmers-market"
        echo "  - Monitor:      pm2 monit"
        echo "  - Restart:      pm2 restart farmers-market"
        echo "  - Stop:         pm2 stop farmers-market"
        echo "  - Dashboard:    pm2 plus"
    else
        # Background mode (default)
        print_info "Running in BACKGROUND mode"
        nohup npm run start > "$LOG_DIR/app.log" 2>&1 &
        SERVER_PID=$!
        echo $SERVER_PID > "$PID_FILE"

        # Wait a moment and check if server started
        sleep 3
        if ps -p "$SERVER_PID" > /dev/null 2>&1; then
            print_success "Server started successfully! (PID: $SERVER_PID)"
        else
            print_error "Server failed to start"
            print_info "Check logs: tail -f $LOG_DIR/app.log"
            rm -f "$PID_FILE"
            exit 1
        fi
    fi
}

# Display server info
display_info() {
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}🚀 Server is running!${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "📍 ${CYAN}Application URL:${NC}     http://localhost:3001"
    echo -e "🏥 ${CYAN}Health Check:${NC}        http://localhost:3001/api/health"
    echo -e "📊 ${CYAN}Admin Dashboard:${NC}     http://localhost:3001/admin"
    echo ""
    if [ "$1" != "daemon" ]; then
        echo -e "📋 ${CYAN}View Logs:${NC}           tail -f $LOG_DIR/app.log"
        echo -e "🛑 ${CYAN}Stop Server:${NC}         ./stop-production.sh"
    fi
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
    echo ""

    # Test health check
    print_info "Testing health check endpoint..."
    sleep 2

    if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
        print_success "Health check passed! ✨"
    else
        print_warning "Health check not responding yet (server may still be starting)"
        print_info "Try again in a few seconds: curl http://localhost:3001/api/health"
    fi

    echo ""
    print_success "🌾 Happy farming! ✨"
    echo ""
}

# Show usage
show_usage() {
    echo "Usage: ./start-production.sh [mode]"
    echo ""
    echo "Modes:"
    echo "  (none)      - Start in background (default)"
    echo "  foreground  - Start in foreground (see logs directly)"
    echo "  daemon      - Start with PM2 process manager"
    echo ""
    echo "Examples:"
    echo "  ./start-production.sh"
    echo "  ./start-production.sh foreground"
    echo "  ./start-production.sh daemon"
    echo ""
}

# Main execution
main() {
    print_header

    # Check for help flag
    if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
        show_usage
        exit 0
    fi

    # Pre-flight checks
    check_build
    check_environment
    setup_logs
    check_running
    load_environment
    check_database

    echo ""

    # Start server
    start_server "$1"

    # Display info (not in foreground mode as it's blocking)
    if [ "$1" != "foreground" ]; then
        display_info "$1"
    fi
}

# Run main function
main "$@"
