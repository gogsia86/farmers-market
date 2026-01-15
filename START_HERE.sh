#!/bin/bash

# 🌾 Farmers Market Platform - Quick Start Script
# This script helps you begin Phase 1: Critical Blockers

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Banner
echo -e "${GREEN}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🌾  FARMERS MARKET PLATFORM - QUICK START                  ║
║                                                               ║
║   Phase 1: Critical Blockers                                 ║
║   Target: 3 Days                                             ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Function to print section headers
print_section() {
    echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

# Function to print success
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Function to print error
print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Function to print info
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Function to ask yes/no question
ask_yes_no() {
    while true; do
        read -p "$(echo -e ${YELLOW}$1 [y/n]: ${NC})" yn
        case $yn in
            [Yy]* ) return 0;;
            [Nn]* ) return 1;;
            * ) echo "Please answer yes or no.";;
        esac
    done
}

# Check if we're in the right directory
print_section "📍 STEP 1: Verify Project Directory"

if [ ! -f "package.json" ] || [ ! -f "next.config.mjs" ]; then
    print_error "Not in project root directory!"
    print_info "Please run this script from: Farmers Market Platform web and app/"
    exit 1
fi

print_success "Project directory verified"

# Check Node.js version
print_section "📦 STEP 2: Check Node.js Version"

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    print_error "Node.js version must be 20 or higher"
    print_info "Current version: $(node -v)"
    print_info "Required: v20.18.0 or higher"
    exit 1
fi

print_success "Node.js version: $(node -v)"

# Check npm version
NPM_VERSION=$(npm -v | cut -d'.' -f1)
if [ "$NPM_VERSION" -lt 10 ]; then
    print_error "npm version must be 10 or higher"
    print_info "Current version: $(npm -v)"
    print_info "Required: v10.0.0 or higher"
    exit 1
fi

print_success "npm version: $(npm -v)"

# Install dependencies
print_section "📥 STEP 3: Install Dependencies"

if ask_yes_no "Install/update npm dependencies?"; then
    print_info "Installing dependencies (this may take a few minutes)..."
    npm install
    print_success "Dependencies installed"
else
    print_warning "Skipping dependency installation"
fi

# Check environment variables
print_section "🔐 STEP 4: Environment Variables"

if [ ! -f ".env" ]; then
    print_error ".env file not found!"
    print_info "Creating .env file from template..."

    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_success ".env file created"
        print_warning "IMPORTANT: Edit .env and add your actual values!"
    else
        print_error ".env.example not found. Creating basic .env..."
        cat > .env << 'EOL'
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/farmers_market"

# Auth
NEXTAUTH_SECRET="generate-a-secret-key-here"
NEXTAUTH_URL="http://localhost:3001"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Redis
REDIS_URL="redis://localhost:6379"

# Sentry
SENTRY_AUTH_TOKEN="your-sentry-auth-token"
EOL
        print_success "Basic .env created"
        print_warning "IMPORTANT: Edit .env and add your actual values!"
    fi
else
    print_success ".env file exists"
fi

# Database check
print_section "🗄️  STEP 5: Database Connection"

if ask_yes_no "Test database connection?"; then
    print_info "Testing database connection..."
    if npm run db:test 2>/dev/null; then
        print_success "Database connection successful"
    else
        print_error "Database connection failed"
        print_info "Make sure PostgreSQL is running and DATABASE_URL is correct in .env"
    fi
else
    print_warning "Skipping database connection test"
fi

# Redis check
print_section "📦 STEP 6: Redis Connection"

if ask_yes_no "Test Redis connection?"; then
    print_info "Testing Redis connection..."
    if npm run redis:test 2>/dev/null; then
        print_success "Redis connection successful"
    else
        print_error "Redis connection failed"
        print_info "Make sure Redis is running and REDIS_URL is correct in .env"
    fi
else
    print_warning "Skipping Redis connection test"
fi

# Run tests
print_section "🧪 STEP 7: Verify Tests"

if ask_yes_no "Run test suite?"; then
    print_info "Running tests (this may take a few minutes)..."
    if npm test 2>&1 | tee test-output.log; then
        print_success "All tests passed!"
    else
        print_error "Some tests failed"
        print_info "Check test-output.log for details"
    fi
else
    print_warning "Skipping test execution"
fi

# Build check
print_section "🏗️  STEP 8: Build Verification"

if ask_yes_no "Test production build?"; then
    print_info "Building for production (this may take a few minutes)..."
    if npm run build 2>&1 | tee build-output.log; then
        print_success "Build successful!"
    else
        print_error "Build failed"
        print_info "Check build-output.log for details"
    fi
else
    print_warning "Skipping build verification"
fi

# Summary
print_section "📊 SETUP SUMMARY"

echo -e "${GREEN}✅ Core Setup Complete!${NC}\n"

echo -e "${CYAN}Next Steps:${NC}"
echo -e "1. ${YELLOW}Review TODO.md${NC} for detailed task list"
echo -e "2. ${YELLOW}Fix Vercel deployment${NC} (see CRITICAL_ACTIONS_REQUIRED.txt)"
echo -e "3. ${YELLOW}Start development server:${NC} npm run dev"
echo -e "4. ${YELLOW}Open browser:${NC} http://localhost:3001"

echo -e "\n${CYAN}Phase 1 Critical Tasks:${NC}"
echo -e "  ${RED}[P0]${NC} 1.1 Fix Vercel Deployment (4 hours)"
echo -e "  ${RED}[P0]${NC} 1.2 Fix Sentry Configuration (2 hours)"
echo -e "  ${RED}[P0]${NC} 1.3 Verify Test Suite (3 hours)"
echo -e "  ${RED}[P0]${NC} 1.4 Security Audit (2 hours)"

echo -e "\n${CYAN}Quick Commands:${NC}"
echo -e "  ${BLUE}npm run dev${NC}           - Start development server"
echo -e "  ${BLUE}npm test${NC}              - Run tests"
echo -e "  ${BLUE}npm run lint${NC}          - Check code quality"
echo -e "  ${BLUE}npm run type-check${NC}    - Check TypeScript"
echo -e "  ${BLUE}npm run db:studio${NC}     - Open Prisma Studio"

echo -e "\n${CYAN}Documentation:${NC}"
echo -e "  ${BLUE}docs/README.md${NC}                           - Documentation hub"
echo -e "  ${BLUE}docs/getting-started/QUICK_START_GUIDE.md${NC} - Quick start guide"
echo -e "  ${BLUE}TODO.md${NC}                                 - Complete task list"
echo -e "  ${BLUE}CRITICAL_ACTIONS_REQUIRED.txt${NC}           - Deployment fixes"

echo -e "\n${CYAN}Deployment Checklist:${NC}"
echo -e "  [ ] Clear Vercel build cache"
echo -e "  [ ] Update SENTRY_AUTH_TOKEN in Vercel env vars"
echo -e "  [ ] Test deployment locally: vercel --prod"
echo -e "  [ ] Monitor deployment logs"
echo -e "  [ ] Test health endpoint: curl https://your-domain.vercel.app/api/health"

echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Setup complete! Ready to start Phase 1 🚀${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Optional: Open TODO.md
if ask_yes_no "Open TODO.md now?"; then
    if command -v code &> /dev/null; then
        code TODO.md
    elif command -v vim &> /dev/null; then
        vim TODO.md
    elif command -v nano &> /dev/null; then
        nano TODO.md
    else
        print_info "Please open TODO.md manually"
    fi
fi

echo -e "\n${MAGENTA}Good luck! 🌾🚜${NC}\n"
