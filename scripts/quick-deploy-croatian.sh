#!/bin/bash

# 🇭🇷 Croatian Farmers Market Platform - Quick Deploy Script
# This script automates the deployment process to Vercel

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "\n${CYAN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}${BOLD}  $1${NC}"
    echo -e "${CYAN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

print_step() {
    echo -e "${BLUE}${BOLD}[Step $1]${NC} ${CYAN}$2${NC}"
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
    echo -e "${MAGENTA}ℹ️  $1${NC}"
}

# Banner
clear
echo -e "${CYAN}${BOLD}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🇭🇷  CROATIAN FARMERS MARKET PLATFORM  🇭🇷               ║
║                                                           ║
║          Quick Deployment to Vercel                       ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}\n"

print_info "This script will guide you through deploying the Croatian"
print_info "Farmers Market Platform to Vercel in production."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

print_success "Found project root directory"

# Step 1: Check prerequisites
print_header "Step 1: Checking Prerequisites"

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    print_success "Node.js installed: $NODE_VERSION"
else
    print_error "Node.js not found. Please install Node.js 20+"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    print_success "npm installed: $NPM_VERSION"
else
    print_error "npm not found. Please install npm"
    exit 1
fi

# Check Vercel CLI
if ! command -v vercel &> /dev/null; then
    print_warning "Vercel CLI not found. Installing..."
    npm install -g vercel
    print_success "Vercel CLI installed"
else
    VERCEL_VERSION=$(vercel -v)
    print_success "Vercel CLI installed: $VERCEL_VERSION"
fi

# Step 2: Pre-flight checks
print_header "Step 2: Running Pre-flight Checks"

print_step 2.1 "Checking local database state..."
if npm run db:test --silent 2>&1 | grep -q "success\|Connected"; then
    print_success "Database connection OK"
else
    print_warning "Database connection issue (non-critical for deployment)"
fi

print_step 2.2 "Verifying Croatian data..."
CROATIAN_COUNT=$(npx tsx scripts/check-db-state.ts 2>/dev/null | grep -o "Found [0-9]* Croatian farms" | grep -o "[0-9]*" || echo "0")
if [ "$CROATIAN_COUNT" -gt 0 ]; then
    print_success "Found $CROATIAN_COUNT Croatian farms in local database"
else
    print_warning "No Croatian farms found locally (will seed production)"
fi

# Step 3: Code quality checks (optional)
print_header "Step 3: Code Quality Checks (Optional)"

read -p "$(echo -e ${YELLOW}Run code quality checks? This may take a few minutes. [y/N]: ${NC})" -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_step 3.1 "Running TypeScript type check..."
    if npm run type-check; then
        print_success "Type check passed"
    else
        print_error "Type check failed. Continue anyway? [y/N]"
        read -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi

    print_step 3.2 "Running linter..."
    if npm run lint; then
        print_success "Lint check passed"
    else
        print_warning "Lint issues found (non-critical)"
    fi
else
    print_info "Skipping quality checks"
fi

# Step 4: Vercel login
print_header "Step 4: Vercel Authentication"

if vercel whoami &> /dev/null; then
    VERCEL_USER=$(vercel whoami)
    print_success "Already logged in as: $VERCEL_USER"
else
    print_step 4.1 "Logging into Vercel..."
    vercel login
    print_success "Logged into Vercel"
fi

# Step 5: Link/Create project
print_header "Step 5: Project Setup"

print_info "Checking if project is linked to Vercel..."

if [ -d ".vercel" ] && [ -f ".vercel/project.json" ]; then
    print_success "Project already linked to Vercel"
    PROJECT_NAME=$(cat .vercel/project.json | grep -o '"name":"[^"]*"' | cut -d'"' -f4)
    print_info "Project name: $PROJECT_NAME"
else
    print_warning "Project not linked. Let's link it now..."
    vercel link
    print_success "Project linked to Vercel"
fi

# Step 6: Environment variables check
print_header "Step 6: Environment Variables"

print_warning "IMPORTANT: Ensure these environment variables are set in Vercel:"
echo ""
echo -e "${YELLOW}Required:${NC}"
echo "  • DATABASE_URL          (Production PostgreSQL connection)"
echo "  • NEXTAUTH_SECRET       (Generate with: openssl rand -base64 32)"
echo "  • NEXTAUTH_URL          (Your Vercel deployment URL)"
echo ""
echo -e "${YELLOW}Optional:${NC}"
echo "  • STRIPE_SECRET_KEY     (For payments)"
echo "  • SMTP_HOST/USER/PASS   (For emails)"
echo "  • CLOUDINARY_*          (For image uploads)"
echo ""

read -p "$(echo -e ${YELLOW}Have you configured environment variables in Vercel dashboard? [y/N]: ${NC})" -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_info "Please set environment variables first:"
    echo ""
    echo "  1. Go to: https://vercel.com/dashboard"
    echo "  2. Select your project"
    echo "  3. Go to: Settings → Environment Variables"
    echo "  4. Add the required variables"
    echo ""
    read -p "Press Enter when ready to continue..."
fi

# Step 7: Choose deployment type
print_header "Step 7: Deployment Type"

echo "Choose deployment type:"
echo "  1) Preview deployment (test before production)"
echo "  2) Production deployment (live site)"
echo ""
read -p "Enter choice [1-2]: " -n 1 -r DEPLOY_CHOICE
echo ""

# Step 8: Deploy
print_header "Step 8: Deploying to Vercel"

if [ "$DEPLOY_CHOICE" = "1" ]; then
    print_step 8.1 "Starting preview deployment..."
    print_info "This creates a test URL you can review before going live"

    if vercel; then
        print_success "Preview deployment completed!"
        print_info "Test your preview URL thoroughly before deploying to production"
    else
        print_error "Preview deployment failed. Check logs above."
        exit 1
    fi
elif [ "$DEPLOY_CHOICE" = "2" ]; then
    print_step 8.1 "Starting production deployment..."
    print_warning "This will deploy to your live production URL!"

    read -p "$(echo -e ${RED}${BOLD}Are you sure? [y/N]: ${NC})" -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Deployment cancelled"
        exit 0
    fi

    if vercel --prod; then
        print_success "Production deployment completed! 🎉"
    else
        print_error "Production deployment failed. Check logs above."
        exit 1
    fi
else
    print_error "Invalid choice. Exiting."
    exit 1
fi

# Step 9: Post-deployment
print_header "Step 9: Post-Deployment Setup"

print_step 9.1 "Do you want to seed the production database with Croatian data?"
echo ""
print_info "This will add 78 Croatian farms and 70 products to your production database."
echo ""

read -p "$(echo -e ${YELLOW}Seed production database? [y/N]: ${NC})" -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_step 9.2 "Pulling production environment variables..."
    if vercel env pull .env.production; then
        print_success "Environment variables pulled"

        print_step 9.3 "Seeding production database..."
        if DATABASE_URL="$(grep DATABASE_URL .env.production | cut -d '=' -f2-)" npm run seed:croatian:safe; then
            print_success "Production database seeded successfully!"
        else
            print_error "Seeding failed. You can seed manually later with:"
            echo "  DATABASE_URL=<your-prod-url> npm run seed:croatian:safe"
        fi

        # Clean up
        rm -f .env.production
    else
        print_error "Failed to pull environment variables"
    fi
else
    print_info "Skipping database seeding"
    print_info "You can seed later with: npm run seed:production"
fi

# Step 10: Verification
print_header "Step 10: Verification"

print_step 10.1 "Getting deployment URL..."
DEPLOYMENT_URL=$(vercel inspect --scope production 2>/dev/null | grep -o 'https://[^ ]*' | head -1 || echo "")

if [ -n "$DEPLOYMENT_URL" ]; then
    print_success "Deployment URL: $DEPLOYMENT_URL"
    echo ""
    print_info "Opening deployment in browser..."
    sleep 2

    # Open in default browser (cross-platform)
    if command -v xdg-open &> /dev/null; then
        xdg-open "$DEPLOYMENT_URL"
    elif command -v open &> /dev/null; then
        open "$DEPLOYMENT_URL"
    elif command -v start &> /dev/null; then
        start "$DEPLOYMENT_URL"
    else
        print_warning "Could not open browser. Please visit manually:"
        echo "  $DEPLOYMENT_URL"
    fi
else
    print_warning "Could not retrieve deployment URL automatically"
    print_info "Check Vercel dashboard: https://vercel.com/dashboard"
fi

# Final summary
print_header "🎉 Deployment Complete!"

echo -e "${GREEN}${BOLD}Your Croatian Farmers Market Platform is now deployed!${NC}\n"

echo -e "${CYAN}Next Steps:${NC}"
echo "  1. Visit your deployment URL and verify it works"
echo "  2. Test the Croatian admin login:"
echo "     • Email: admin@hrvatski-tržnice.hr"
echo "     • Password: Admin123!"
echo "  3. Check that 78 farms are visible on /farms page"
echo "  4. Monitor logs: vercel logs --follow"
echo "  5. Set up custom domain (optional)"
echo ""

echo -e "${CYAN}Useful Commands:${NC}"
echo "  • View logs:        vercel logs"
echo "  • Open dashboard:   vercel open"
echo "  • Redeploy:         vercel --prod"
echo "  • Rollback:         vercel rollback [url]"
echo ""

echo -e "${CYAN}Resources:${NC}"
echo "  • Deployment Guide: ./DEPLOYMENT_GUIDE_CROATIAN.md"
echo "  • Vercel Dashboard: https://vercel.com/dashboard"
echo "  • Documentation:    https://vercel.com/docs"
echo ""

print_success "Deployment script completed successfully! 🚀"
echo ""
