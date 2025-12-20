#!/bin/bash

# =============================================================================
# 🚀 DEPLOY TO VERCEL - Interactive Deployment Helper
# =============================================================================
#
# This script guides you through deploying the Farmers Market Platform to Vercel
# with proper error checking and validation.
#
# Usage: ./deploy-to-vercel.sh
#
# =============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

print_header() {
    echo -e "${PURPLE}"
    echo "════════════════════════════════════════════════════════════════════════"
    echo "  $1"
    echo "════════════════════════════════════════════════════════════════════════"
    echo -e "${NC}"
}

print_step() {
    echo -e "${BLUE}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

ask_yes_no() {
    local question=$1
    local default=${2:-"n"}

    if [ "$default" = "y" ]; then
        prompt="[Y/n]"
    else
        prompt="[y/N]"
    fi

    echo -e "${YELLOW}$question $prompt${NC}"
    read -r response

    response=${response:-$default}

    if [[ "$response" =~ ^[Yy]$ ]]; then
        return 0
    else
        return 1
    fi
}

# =============================================================================
# MAIN SCRIPT
# =============================================================================

clear
print_header "🚀 VERCEL DEPLOYMENT ASSISTANT"
echo ""
print_info "This script will guide you through deploying to Vercel"
echo ""

# =============================================================================
# STEP 1: PRE-DEPLOYMENT CHECKS
# =============================================================================

print_header "📋 STEP 1: PRE-DEPLOYMENT CHECKS"
echo ""

# Check if git is installed
print_step "Checking Git installation..."
if ! command -v git &> /dev/null; then
    print_error "Git is not installed. Please install Git first."
    exit 1
fi
print_success "Git is installed"

# Check if we're in a git repository
print_step "Checking Git repository..."
if ! git rev-parse --is-inside-work-tree &> /dev/null; then
    print_error "Not in a Git repository. Please run this from the project root."
    exit 1
fi
print_success "Git repository detected"

# Check for uncommitted changes
print_step "Checking for uncommitted changes..."
if ! git diff-index --quiet HEAD --; then
    print_warning "You have uncommitted changes"
    if ask_yes_no "Do you want to commit them now?"; then
        git add .
        echo -e "${YELLOW}Enter commit message:${NC}"
        read -r commit_message
        git commit -m "$commit_message"
        print_success "Changes committed"
    else
        print_info "Continuing with uncommitted changes..."
    fi
else
    print_success "No uncommitted changes"
fi

# Check if Node.js is installed
print_step "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 20+ first."
    exit 1
fi
NODE_VERSION=$(node -v)
print_success "Node.js $NODE_VERSION installed"

# Check if npm is installed
print_step "Checking npm installation..."
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi
NPM_VERSION=$(npm -v)
print_success "npm $NPM_VERSION installed"

echo ""

# =============================================================================
# STEP 2: VERIFY BUILD LOCALLY
# =============================================================================

print_header "🏗️  STEP 2: VERIFY BUILD LOCALLY"
echo ""

if ask_yes_no "Do you want to test the build locally first? (Recommended)"; then
    print_step "Installing dependencies..."
    npm install

    print_step "Running type check..."
    if npm run type-check; then
        print_success "Type check passed"
    else
        print_error "Type check failed. Please fix TypeScript errors first."
        exit 1
    fi

    print_step "Running build..."
    if npm run build; then
        print_success "Build succeeded locally"
    else
        print_error "Build failed. Please fix errors before deploying."
        exit 1
    fi
else
    print_warning "Skipping local build test"
fi

echo ""

# =============================================================================
# STEP 3: DATABASE SETUP
# =============================================================================

print_header "🗄️  STEP 3: DATABASE CONFIGURATION"
echo ""

print_info "You need a PostgreSQL database for production"
echo ""
echo "Options:"
echo "  1. Neon (Recommended - Free tier available)"
echo "  2. Vercel Postgres"
echo "  3. Railway"
echo "  4. I already have a database"
echo ""

read -p "Select option (1-4): " db_option

case $db_option in
    1)
        print_info "Setting up Neon database..."
        echo ""
        echo "Steps:"
        echo "  1. Go to https://neon.tech"
        echo "  2. Sign up and create a new project"
        echo "  3. Copy the connection string"
        echo ""
        print_warning "Have you completed these steps? Press Enter when ready..."
        read
        ;;
    2)
        print_info "Setting up Vercel Postgres..."
        echo ""
        echo "Steps:"
        echo "  1. Go to Vercel Dashboard → Storage"
        echo "  2. Create a new Postgres database"
        echo "  3. Copy the POSTGRES_PRISMA_URL"
        echo ""
        print_warning "Have you completed these steps? Press Enter when ready..."
        read
        ;;
    3)
        print_info "Setting up Railway database..."
        echo ""
        echo "Steps:"
        echo "  1. Go to https://railway.app"
        echo "  2. Create new project → Add PostgreSQL"
        echo "  3. Copy DATABASE_URL from Variables tab"
        echo ""
        print_warning "Have you completed these steps? Press Enter when ready..."
        read
        ;;
    4)
        print_success "Using existing database"
        ;;
    *)
        print_error "Invalid option"
        exit 1
        ;;
esac

echo ""
print_info "You'll need to add DATABASE_URL to Vercel environment variables"
echo ""

# =============================================================================
# STEP 4: VERCEL CLI CHECK
# =============================================================================

print_header "🔧 STEP 4: VERCEL CLI CHECK"
echo ""

print_step "Checking Vercel CLI installation..."
if ! command -v vercel &> /dev/null; then
    print_warning "Vercel CLI not installed"
    if ask_yes_no "Do you want to install it now?"; then
        npm install -g vercel
        print_success "Vercel CLI installed"
    else
        print_info "You can deploy via GitHub integration instead"
    fi
else
    VERCEL_VERSION=$(vercel -v)
    print_success "Vercel CLI $VERCEL_VERSION installed"
fi

echo ""

# =============================================================================
# STEP 5: DEPLOYMENT METHOD
# =============================================================================

print_header "🚀 STEP 5: CHOOSE DEPLOYMENT METHOD"
echo ""

echo "How would you like to deploy?"
echo "  1. GitHub Integration (Automatic - Recommended)"
echo "  2. Vercel CLI (Manual)"
echo ""

read -p "Select option (1-2): " deploy_option

case $deploy_option in
    1)
        # GitHub Integration
        print_header "🔗 GITHUB INTEGRATION DEPLOYMENT"
        echo ""

        print_step "Step 1: Push code to GitHub"
        echo ""

        # Get current branch
        CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
        print_info "Current branch: $CURRENT_BRANCH"

        if ask_yes_no "Push to GitHub now?"; then
            git push origin "$CURRENT_BRANCH"
            print_success "Code pushed to GitHub"
        fi

        echo ""
        print_step "Step 2: Connect to Vercel"
        echo ""
        echo "Next steps:"
        echo "  1. Go to https://vercel.com/dashboard"
        echo "  2. Click 'Add New...' → 'Project'"
        echo "  3. Import your Git repository"
        echo "  4. Configure environment variables (see below)"
        echo "  5. Click 'Deploy'"
        echo ""
        ;;

    2)
        # Vercel CLI
        print_header "💻 VERCEL CLI DEPLOYMENT"
        echo ""

        if ! command -v vercel &> /dev/null; then
            print_error "Vercel CLI not installed. Please install it first:"
            echo "  npm install -g vercel"
            exit 1
        fi

        print_step "Logging into Vercel..."
        vercel login

        print_step "Deploying to Vercel..."
        if ask_yes_no "Deploy to production?"; then
            vercel --prod
        else
            vercel
        fi
        ;;

    *)
        print_error "Invalid option"
        exit 1
        ;;
esac

# =============================================================================
# STEP 6: ENVIRONMENT VARIABLES CHECKLIST
# =============================================================================

print_header "🔐 STEP 6: ENVIRONMENT VARIABLES"
echo ""

print_warning "IMPORTANT: Add these environment variables in Vercel Dashboard"
echo "Go to: Settings → Environment Variables"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "REQUIRED VARIABLES:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. DATABASE_URL"
echo "   Value: postgresql://user:pass@host:5432/database?sslmode=require"
echo "   Environments: Production, Preview, Development"
echo ""
echo "2. NEXTAUTH_SECRET"
echo "   Generate with: openssl rand -base64 32"
echo "   Environments: Production, Preview, Development"
echo ""
echo "3. NEXTAUTH_URL"
echo "   Value: https://your-project.vercel.app"
echo "   Environments: Production, Preview, Development"
echo ""
echo "4. STRIPE_SECRET_KEY"
echo "   Value: sk_test_51xxxxx (from Stripe dashboard)"
echo "   Environments: Production, Preview, Development"
echo ""
echo "5. STRIPE_PUBLISHABLE_KEY"
echo "   Value: pk_test_51xxxxx (from Stripe dashboard)"
echo "   Environments: Production, Preview, Development"
echo ""
echo "6. NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
echo "   Value: pk_test_51xxxxx (same as above)"
echo "   Environments: Production, Preview, Development"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "OPTIONAL VARIABLES:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "7. RESEND_API_KEY (for email notifications)"
echo "8. CLOUDINARY_CLOUD_NAME (for image uploads)"
echo "9. CLOUDINARY_API_KEY"
echo "10. CLOUDINARY_API_SECRET"
echo "11. SENTRY_DSN (for error tracking)"
echo ""

print_warning "Press Enter after you've added the environment variables..."
read

# =============================================================================
# STEP 7: POST-DEPLOYMENT
# =============================================================================

print_header "✅ STEP 7: POST-DEPLOYMENT SETUP"
echo ""

print_info "After deployment completes, you need to:"
echo ""
echo "1. Initialize the database:"
echo "   export DATABASE_URL='your_production_database_url'"
echo "   npx prisma db push"
echo "   npm run db:seed:basic"
echo ""
echo "2. Test your site:"
echo "   Visit: https://your-project.vercel.app"
echo "   Try signing up and logging in"
echo ""
echo "3. Monitor deployment:"
echo "   Vercel Dashboard → Deployments"
echo "   Check logs for any errors"
echo ""

# =============================================================================
# COMPLETION
# =============================================================================

print_header "🎉 DEPLOYMENT PROCESS STARTED"
echo ""

print_success "Great job! Your deployment is in progress."
echo ""
print_info "What to do next:"
echo ""
echo "1. ⏱️  Wait 6-8 minutes for build to complete"
echo "2. 👀 Monitor: https://vercel.com/dashboard"
echo "3. 🗄️  Initialize database (see above)"
echo "4. 🧪 Test your live site"
echo "5. 📊 Check analytics and logs"
echo ""
print_info "For detailed troubleshooting, see: VERCEL_DEPLOYMENT_GUIDE.md"
echo ""
print_success "Happy deploying! 🚀🌾"
echo ""

exit 0
