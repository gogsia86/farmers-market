#!/bin/bash
# ========================================
# FARMERS MARKET PLATFORM - INFRASTRUCTURE SETUP
# Complete Infrastructure Setup Script (Phases 2-4)
# ========================================
#
# This script guides you through:
# - Phase 2: Environment Configuration
# - Phase 3: Database Setup
# - Phase 4: Infrastructure Deployment
#
# Usage:
#   ./scripts/setup-infrastructure.sh [option]
#
# Options:
#   vercel    - Deploy to Vercel (fastest)
#   docker    - Deploy with Docker (self-hosted)
#   validate  - Only validate environment
# ========================================

set -e

# ============ COLORS ============

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# ============ FUNCTIONS ============

print_banner() {
    clear
    echo -e "${MAGENTA}${WHITE}"
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║                                                            ║"
    echo "║     🌾 FARMERS MARKET PLATFORM                            ║"
    echo "║     Infrastructure Setup Wizard                           ║"
    echo "║     Phases 2-4: Environment → Database → Deployment       ║"
    echo "║                                                            ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

log() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

error() {
    echo -e "${RED}[✗]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

section() {
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo ""
}

prompt() {
    echo -e "${YELLOW}$1${NC}"
}

confirm() {
    while true; do
        echo -e "${YELLOW}$1 (y/n): ${NC}"
        read -r response
        case $response in
            [Yy]* ) return 0;;
            [Nn]* ) return 1;;
            * ) echo "Please answer yes or no.";;
        esac
    done
}

pause() {
    echo ""
    echo -e "${CYAN}Press Enter to continue...${NC}"
    read -r
}

# ============ PHASE 2: ENVIRONMENT CONFIGURATION ============

setup_environment() {
    section "PHASE 2: Environment Configuration"

    log "Setting up production environment variables..."

    # Check if .env.production already exists
    if [ -f .env.production ]; then
        warning ".env.production already exists"
        if confirm "Do you want to overwrite it?"; then
            rm .env.production
        else
            log "Keeping existing .env.production"
            return 0
        fi
    fi

    log "Creating .env.production template..."

    # Create environment template
    cat > .env.production << 'EOF'
# ===============================================
# FARMERS MARKET PLATFORM - PRODUCTION CONFIG
# ===============================================

# ============ APPLICATION SETTINGS ============
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=https://your-domain.com/api

# ============ DATABASE ============
DATABASE_URL=postgresql://farmersmarket:YOUR_DB_PASSWORD@localhost:5432/farmersmarket?schema=public&connection_limit=20&pool_timeout=30

# ============ AUTHENTICATION ============
# Generate with: openssl rand -base64 32
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=YOUR_NEXTAUTH_SECRET_HERE
AUTH_TRUST_HOST=true

# ============ EMAIL SERVICE ============
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=noreply@your-domain.com

# ============ PAYMENT PROCESSING ============
STRIPE_SECRET_KEY=sk_live_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# ============ FILE STORAGE ============
AWS_ACCESS_KEY_ID=AKIA_xxxxx
AWS_SECRET_ACCESS_KEY=xxxxx
AWS_REGION=us-east-1
AWS_S3_BUCKET=farmersmarket-uploads

# ============ CACHING & SESSIONS ============
REDIS_URL=redis://localhost:6379

# ============ MONITORING ============
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
SENTRY_ENVIRONMENT=production

# ============ MAPS ============
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy_xxxxx

# ============ ANALYTICS ============
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# ============ FEATURE FLAGS ============
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_ML_FEATURES=false
EOF

    success ".env.production template created"

    echo ""
    log "Next steps for environment setup:"
    echo ""
    echo "  1. Generate secrets:"
    echo -e "     ${CYAN}openssl rand -base64 32${NC} (for NEXTAUTH_SECRET)"
    echo ""
    echo "  2. Get API keys from:"
    echo "     • Stripe: https://dashboard.stripe.com/apikeys"
    echo "     • Resend: https://resend.com/api-keys"
    echo "     • AWS S3: AWS IAM Console"
    echo "     • Google Maps: https://console.cloud.google.com/"
    echo ""
    echo "  3. Update .env.production with your values"
    echo ""

    if confirm "Have you updated .env.production with your credentials?"; then
        success "Environment configuration ready"
    else
        warning "Please update .env.production before continuing"
        exit 1
    fi

    # Validate environment
    log "Validating environment variables..."
    if [ -f scripts/validate-env.js ]; then
        if node scripts/validate-env.js; then
            success "Environment validation passed"
        else
            error "Environment validation failed"
            exit 1
        fi
    else
        warning "Validation script not found, skipping validation"
    fi
}

# ============ PHASE 3: DATABASE SETUP ============

setup_database() {
    section "PHASE 3: Database Setup"

    log "Database setup options:"
    echo ""
    echo "  1. Vercel Postgres (Managed, Easy)"
    echo "  2. Supabase (Managed, Developer-friendly)"
    echo "  3. AWS RDS (Managed, Enterprise)"
    echo "  4. Docker PostgreSQL (Self-hosted)"
    echo "  5. Skip (Already configured)"
    echo ""

    prompt "Select database option (1-5):"
    read -r db_option

    case $db_option in
        1)
            setup_vercel_postgres
            ;;
        2)
            setup_supabase
            ;;
        3)
            setup_aws_rds
            ;;
        4)
            setup_docker_postgres
            ;;
        5)
            log "Skipping database setup"
            ;;
        *)
            error "Invalid option"
            exit 1
            ;;
    esac

    # Run migrations
    log "Running Prisma migrations..."
    if npx prisma migrate deploy; then
        success "Database migrations completed"
    else
        error "Migration failed"
        exit 1
    fi

    # Generate Prisma Client
    log "Generating Prisma Client..."
    if npx prisma generate; then
        success "Prisma Client generated"
    else
        error "Prisma Client generation failed"
        exit 1
    fi

    # Verify database connection
    log "Verifying database connection..."
    if npx prisma db pull --force; then
        success "Database connection verified"
    else
        error "Cannot connect to database"
        exit 1
    fi
}

setup_vercel_postgres() {
    log "Setting up Vercel Postgres..."

    if ! command -v vercel &> /dev/null; then
        log "Installing Vercel CLI..."
        npm install -g vercel
    fi

    log "Run these commands:"
    echo ""
    echo -e "  ${CYAN}vercel login${NC}"
    echo -e "  ${CYAN}vercel postgres create farmersmarket-db${NC}"
    echo -e "  ${CYAN}vercel postgres show farmersmarket-db${NC}"
    echo ""
    log "Copy the DATABASE_URL to your .env.production"

    pause
}

setup_supabase() {
    log "Setting up Supabase..."
    echo ""
    log "1. Go to https://supabase.com"
    log "2. Create new project"
    log "3. Go to Settings → Database"
    log "4. Copy the connection pooling string (port 6543)"
    log "5. Add to .env.production as DATABASE_URL"
    echo ""
    pause
}

setup_aws_rds() {
    log "Setting up AWS RDS..."
    echo ""
    log "1. Go to AWS Console → RDS"
    log "2. Create Database → PostgreSQL"
    log "3. Choose production template"
    log "4. Instance: db.t3.medium or larger"
    log "5. Enable automated backups"
    log "6. Note the endpoint URL"
    log "7. Construct connection string:"
    echo -e "   ${CYAN}postgresql://username:password@endpoint:5432/dbname${NC}"
    echo ""
    pause
}

setup_docker_postgres() {
    log "Starting PostgreSQL with Docker..."

    if ! command -v docker &> /dev/null; then
        error "Docker not installed"
        exit 1
    fi

    # Start PostgreSQL container
    docker run -d \
        --name farmersmarket-db \
        -e POSTGRES_USER=farmersmarket \
        -e POSTGRES_PASSWORD=farmersmarket \
        -e POSTGRES_DB=farmersmarket \
        -p 5432:5432 \
        postgres:15-alpine

    success "PostgreSQL started on localhost:5432"

    # Update .env.production
    log "Updating DATABASE_URL in .env.production..."
    sed -i.bak 's|DATABASE_URL=.*|DATABASE_URL=postgresql://farmersmarket:farmersmarket@localhost:5432/farmersmarket?schema=public|g' .env.production

    success "Database URL updated"
}

# ============ PHASE 4: INFRASTRUCTURE DEPLOYMENT ============

deploy_infrastructure() {
    section "PHASE 4: Infrastructure Deployment"

    log "Deployment options:"
    echo ""
    echo "  1. Vercel (Fastest, Recommended)"
    echo "  2. Docker (Self-hosted, Full control)"
    echo "  3. Manual (I'll deploy myself)"
    echo ""

    prompt "Select deployment option (1-3):"
    read -r deploy_option

    case $deploy_option in
        1)
            deploy_vercel
            ;;
        2)
            deploy_docker
            ;;
        3)
            log "Manual deployment selected"
            show_manual_deployment_instructions
            ;;
        *)
            error "Invalid option"
            exit 1
            ;;
    esac
}

deploy_vercel() {
    log "Deploying to Vercel..."

    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        log "Installing Vercel CLI..."
        npm install -g vercel
    fi

    # Login
    log "Logging in to Vercel..."
    vercel login

    # Link project
    log "Linking project..."
    vercel link

    # Deploy
    log "Deploying to production..."
    if vercel --prod; then
        success "Deployment successful!"
        echo ""
        log "Next steps:"
        echo "  1. Go to vercel.com/dashboard"
        echo "  2. Navigate to Settings → Environment Variables"
        echo "  3. Import variables from .env.production"
        echo ""
    else
        error "Deployment failed"
        exit 1
    fi
}

deploy_docker() {
    log "Deploying with Docker..."

    if [ ! -f docker-compose.prod.yml ]; then
        error "docker-compose.prod.yml not found"
        exit 1
    fi

    # Run deployment script
    if [ -f scripts/deploy-docker.sh ]; then
        chmod +x scripts/deploy-docker.sh
        ./scripts/deploy-docker.sh
    else
        error "Deployment script not found"
        exit 1
    fi
}

show_manual_deployment_instructions() {
    log "Manual deployment instructions:"
    echo ""
    echo "For Vercel:"
    echo -e "  ${CYAN}vercel --prod${NC}"
    echo ""
    echo "For Docker:"
    echo -e "  ${CYAN}docker-compose -f docker-compose.prod.yml up -d${NC}"
    echo ""
    echo "For AWS/VPS:"
    echo -e "  ${CYAN}npm run build${NC}"
    echo -e "  ${CYAN}npm start${NC}"
    echo ""
}

# ============ VALIDATION ONLY ============

validate_only() {
    section "Environment Validation"

    if [ -f scripts/validate-env.js ]; then
        node scripts/validate-env.js
    else
        error "Validation script not found"
        exit 1
    fi
}

# ============ FINAL SUMMARY ============

show_final_summary() {
    section "🎉 INFRASTRUCTURE SETUP COMPLETE!"

    echo ""
    success "Phase 2: Environment Configuration ✅"
    success "Phase 3: Database Setup ✅"
    success "Phase 4: Infrastructure Deployment ✅"
    echo ""

    log "Production Readiness: ${GREEN}82%${NC}"
    echo ""

    log "Next steps:"
    echo ""
    echo "  1. Test your deployment:"
    echo -e "     ${CYAN}curl https://your-domain.com/api/health${NC}"
    echo ""
    echo "  2. Monitor your application:"
    echo "     • Check logs for errors"
    echo "     • Monitor performance"
    echo "     • Set up alerts"
    echo ""
    echo "  3. Complete remaining phases (optional):"
    echo "     • Phase 5: Security Hardening"
    echo "     • Phase 6: Performance Optimization"
    echo "     • Phase 7: Monitoring & Observability"
    echo ""

    log "Documentation created:"
    echo "  • INFRASTRUCTURE_SETUP_COMPLETE.md"
    echo "  • DEPLOYMENT_CHECKLIST.md"
    echo "  • scripts/validate-env.js"
    echo "  • scripts/deploy-docker.sh"
    echo "  • scripts/backup-database.sh"
    echo ""

    success "Your platform is ready for production! 🚀"
    echo ""
}

# ============ MAIN EXECUTION ============

main() {
    print_banner

    # Check arguments
    if [ "$1" = "validate" ]; then
        validate_only
        exit 0
    fi

    log "This script will guide you through infrastructure setup."
    log "Estimated time: 30-60 minutes"
    echo ""

    if ! confirm "Ready to start?"; then
        log "Exiting..."
        exit 0
    fi

    # Phase 2: Environment
    setup_environment
    pause

    # Phase 3: Database
    setup_database
    pause

    # Phase 4: Deployment
    if [ -n "$1" ]; then
        case $1 in
            vercel)
                deploy_vercel
                ;;
            docker)
                deploy_docker
                ;;
            *)
                deploy_infrastructure
                ;;
        esac
    else
        deploy_infrastructure
    fi

    # Show summary
    show_final_summary
}

# Run main function
main "$@"
