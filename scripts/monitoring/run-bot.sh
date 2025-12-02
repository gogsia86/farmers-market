#!/bin/bash

###############################################################################
# 🤖 Enhanced Website Monitoring Bot - Quick Run Script
# Farmers Market Platform - Divine Agricultural Monitoring
# Version: 2.0.0
###############################################################################

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
REPORT_DIR="$PROJECT_ROOT/monitoring-reports"

###############################################################################
# Helper Functions
###############################################################################

print_header() {
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║     🌟 Enhanced Website Monitoring Bot Runner             ║${NC}"
    echo -e "${BLUE}╠════════════════════════════════════════════════════════════╣${NC}"
    echo -e "${BLUE}║  Farmers Market Platform - Divine Agricultural Monitoring  ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

check_dependencies() {
    print_info "Checking dependencies..."

    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    print_success "Node.js: $(node --version)"

    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    print_success "npm: $(npm --version)"

    # Check if node_modules exists
    if [ ! -d "$PROJECT_ROOT/node_modules" ]; then
        print_warning "node_modules not found. Running npm install..."
        cd "$PROJECT_ROOT"
        npm install
    else
        print_success "node_modules: Found"
    fi

    echo ""
}

check_playwright() {
    print_info "Checking Playwright browsers..."

    # Check if Playwright is installed
    if ! npm list playwright &> /dev/null; then
        print_warning "Playwright not found in dependencies"
        print_info "Installing Playwright..."
        cd "$PROJECT_ROOT"
        npm install -D playwright
    fi

    # Install Chromium browser if needed
    print_info "Installing Chromium browser..."
    cd "$PROJECT_ROOT"
    npx playwright install chromium --with-deps

    print_success "Playwright browsers ready"
    echo ""
}

check_server() {
    local url=$1
    print_info "Checking if server is accessible at $url..."

    if curl -s -f -o /dev/null "$url"; then
        print_success "Server is accessible"
        return 0
    else
        print_warning "Server is not accessible at $url"
        return 1
    fi
}

create_report_dir() {
    if [ ! -d "$REPORT_DIR" ]; then
        print_info "Creating report directory..."
        mkdir -p "$REPORT_DIR"
        print_success "Report directory created: $REPORT_DIR"
    else
        print_success "Report directory exists: $REPORT_DIR"
    fi
    echo ""
}

run_monitoring() {
    local target_url=${1:-"http://localhost:3001"}
    local headless=${2:-"true"}

    print_info "Starting monitoring bot..."
    print_info "Target URL: $target_url"
    print_info "Headless mode: $headless"
    echo ""

    cd "$PROJECT_ROOT"

    # Export environment variables
    export BASE_URL="$target_url"
    export HEADLESS="$headless"

    # Run the monitoring bot
    npx tsx scripts/monitoring/enhanced-website-monitor.ts

    local exit_code=$?

    echo ""
    if [ $exit_code -eq 0 ]; then
        print_success "Monitoring completed successfully!"
    else
        print_error "Monitoring failed with exit code $exit_code"
    fi

    return $exit_code
}

show_reports() {
    print_info "Generated reports:"
    echo ""

    if [ -f "$REPORT_DIR/monitoring-report-latest.json" ]; then
        print_success "JSON Report: $REPORT_DIR/monitoring-report-latest.json"
    fi

    if [ -f "$REPORT_DIR/monitoring-report-latest.md" ]; then
        print_success "Markdown Report: $REPORT_DIR/monitoring-report-latest.md"
    fi

    echo ""
    print_info "To view the latest report:"
    echo -e "  ${BLUE}cat $REPORT_DIR/monitoring-report-latest.md${NC}"
    echo ""
}

start_dev_server() {
    print_info "Starting development server..."
    cd "$PROJECT_ROOT"
    npm run dev &
    DEV_SERVER_PID=$!

    print_success "Dev server started (PID: $DEV_SERVER_PID)"
    print_info "Waiting 10 seconds for server to be ready..."
    sleep 10
}

stop_dev_server() {
    if [ ! -z "$DEV_SERVER_PID" ]; then
        print_info "Stopping development server (PID: $DEV_SERVER_PID)..."
        kill $DEV_SERVER_PID 2>/dev/null || true
        print_success "Dev server stopped"
    fi
}

show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --url URL          Target URL to monitor (default: http://localhost:3001)"
    echo "  --headless BOOL    Run in headless mode (default: true)"
    echo "  --auto-start       Automatically start dev server if not running"
    echo "  --help             Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                                    # Monitor local dev server"
    echo "  $0 --url https://staging.example.com # Monitor staging"
    echo "  $0 --headless false                   # Run with visible browser"
    echo "  $0 --auto-start                       # Start dev server if needed"
    echo ""
}

###############################################################################
# Main Script
###############################################################################

main() {
    local target_url="http://localhost:3001"
    local headless="true"
    local auto_start=false

    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --url)
                target_url="$2"
                shift 2
                ;;
            --headless)
                headless="$2"
                shift 2
                ;;
            --auto-start)
                auto_start=true
                shift
                ;;
            --help)
                show_usage
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done

    print_header

    # Check dependencies
    check_dependencies

    # Check Playwright
    check_playwright

    # Create report directory
    create_report_dir

    # Check if server is running
    if ! check_server "$target_url"; then
        if [ "$auto_start" = true ] && [ "$target_url" = "http://localhost:3001" ]; then
            start_dev_server
            # Trap to ensure server is stopped on exit
            trap stop_dev_server EXIT

            # Check again
            if ! check_server "$target_url"; then
                print_error "Failed to start development server"
                exit 1
            fi
        else
            print_error "Server is not accessible. Please start the server first:"
            echo -e "  ${BLUE}npm run dev${NC}"
            echo ""
            echo "Or use --auto-start to automatically start the dev server"
            exit 1
        fi
    fi

    echo ""

    # Run monitoring
    run_monitoring "$target_url" "$headless"
    local exit_code=$?

    # Show reports
    show_reports

    # Final status
    echo ""
    if [ $exit_code -eq 0 ]; then
        echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║                  ✅ MONITORING COMPLETE                    ║${NC}"
        echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    else
        echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${RED}║                  ❌ MONITORING FAILED                      ║${NC}"
        echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
    fi

    exit $exit_code
}

# Run main function
main "$@"
