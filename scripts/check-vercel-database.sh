#!/bin/bash
#
# 🔍 VERCEL DATABASE ENVIRONMENT CHECKER
#
# Check and verify Vercel environment variables for database connection
#
# Usage:
#   ./scripts/check-vercel-database.sh
#   chmod +x scripts/check-vercel-database.sh && ./scripts/check-vercel-database.sh
#
# Requirements:
#   - Vercel CLI installed (npm i -g vercel)
#   - Logged in to Vercel (vercel login)
#   - Project linked (vercel link)

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m' # No Color

# Print functions
print_header() {
    echo ""
    echo -e "${BOLD}${CYAN}═══════════════════════════════════════════════════════════════════════${NC}"
    echo -e "${BOLD}${CYAN}$1${NC}"
    echo -e "${BOLD}${CYAN}═══════════════════════════════════════════════════════════════════════${NC}"
    echo ""
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

print_step() {
    echo -e "${BOLD}$1${NC}"
}

# Check if Vercel CLI is installed
check_vercel_cli() {
    print_step "🔍 Checking Vercel CLI..."

    if ! command -v vercel &> /dev/null; then
        print_error "Vercel CLI is not installed"
        echo ""
        print_info "Install with: npm install -g vercel"
        echo ""
        exit 1
    fi

    print_success "Vercel CLI is installed"
    vercel --version
}

# Check if logged in to Vercel
check_vercel_auth() {
    print_step "🔐 Checking Vercel authentication..."

    if ! vercel whoami &> /dev/null; then
        print_error "Not logged in to Vercel"
        echo ""
        print_info "Login with: vercel login"
        echo ""
        exit 1
    fi

    local username=$(vercel whoami 2>&1)
    print_success "Logged in as: $username"
}

# Check if project is linked
check_vercel_project() {
    print_step "🔗 Checking project link..."

    if [ ! -f ".vercel/project.json" ]; then
        print_error "Project is not linked to Vercel"
        echo ""
        print_info "Link project with: vercel link"
        echo ""
        exit 1
    fi

    local project_id=$(cat .vercel/project.json | grep -o '"projectId": "[^"]*' | cut -d'"' -f4)
    local org_id=$(cat .vercel/project.json | grep -o '"orgId": "[^"]*' | cut -d'"' -f4)

    print_success "Project linked"
    echo -e "${DIM}   Project ID: $project_id${NC}"
    echo -e "${DIM}   Org ID: $org_id${NC}"
}

# Pull and check environment variables
check_database_env() {
    local env=$1
    local env_name=$2

    print_step "📋 Checking $env_name environment..."

    # Pull environment variables
    local output=$(vercel env pull .env.$env --environment=$env 2>&1)

    if [ $? -ne 0 ]; then
        print_warning "Could not pull $env_name environment variables"
        echo -e "${DIM}   $output${NC}"
        return 1
    fi

    # Check if .env file was created
    if [ ! -f ".env.$env" ]; then
        print_warning "Environment file not created for $env_name"
        return 1
    fi

    # Check for DATABASE_URL
    if grep -q "DATABASE_URL" ".env.$env"; then
        local db_url=$(grep "DATABASE_URL" ".env.$env" | cut -d'=' -f2-)

        # Mask the password
        local masked_url=$(echo "$db_url" | sed -E 's/:([^@:]+)@/:****@/')

        print_success "DATABASE_URL found in $env_name"
        echo -e "${DIM}   $masked_url${NC}"

        # Check if it's a Vercel Postgres URL
        if echo "$db_url" | grep -q "postgres.vercel-storage.com"; then
            print_info "Using Vercel Postgres"
        elif echo "$db_url" | grep -q "localhost"; then
            print_warning "Using localhost (not suitable for $env_name)"
        else
            print_info "Using external PostgreSQL"
        fi

        # Check for pooling parameter
        if echo "$db_url" | grep -q "pgbouncer=true\|pooler=true"; then
            print_info "Connection pooling enabled"
        else
            print_warning "Connection pooling not detected"
            echo -e "${DIM}   Consider adding: ?pgbouncer=true${NC}"
        fi

    else
        print_error "DATABASE_URL not found in $env_name"
        echo ""
        print_info "Set it with: vercel env add DATABASE_URL $env"
        echo ""
        return 1
    fi

    # Check for other database-related variables
    local other_vars=("POSTGRES_URL" "POSTGRES_PRISMA_URL" "POSTGRES_URL_NON_POOLING")

    for var in "${other_vars[@]}"; do
        if grep -q "$var" ".env.$env"; then
            print_info "Found: $var"
        fi
    done

    # Clean up temporary env file
    rm -f ".env.$env"

    echo ""
}

# Test database connection
test_connection() {
    print_step "🔌 Testing database connection..."

    # Pull production environment
    vercel env pull .env.test.local --environment=production > /dev/null 2>&1

    if [ ! -f ".env.test.local" ]; then
        print_warning "Could not pull environment for testing"
        return 1
    fi

    # Source the environment
    export $(cat .env.test.local | grep -v '^#' | xargs)

    # Test with psql if available
    if command -v psql &> /dev/null; then
        print_info "Testing with psql..."

        if echo "SELECT 1;" | psql "$DATABASE_URL" > /dev/null 2>&1; then
            print_success "Database connection successful!"
        else
            print_error "Database connection failed"
            print_info "The DATABASE_URL may be incorrect or database may be inaccessible"
        fi
    else
        print_info "psql not installed, skipping connection test"
        print_info "Install PostgreSQL client to test connections"
    fi

    # Clean up
    rm -f .env.test.local
    echo ""
}

# Check for common issues
check_common_issues() {
    print_step "🔍 Checking for common issues..."

    # Check if DATABASE_URL is in .gitignore
    if grep -q "DATABASE_URL\|.env" .gitignore 2>/dev/null; then
        print_success ".env files are in .gitignore"
    else
        print_warning ".env files may not be in .gitignore"
        echo -e "${DIM}   Add to .gitignore: .env* and !.env.example${NC}"
    fi

    # Check if .env.example exists
    if [ -f ".env.example" ]; then
        print_success ".env.example exists"
    else
        print_warning ".env.example not found"
        echo -e "${DIM}   Create a template for environment variables${NC}"
    fi

    # Check if prisma/schema.prisma exists
    if [ -f "prisma/schema.prisma" ]; then
        print_success "Prisma schema found"

        # Check datasource
        if grep -q 'provider.*=.*"postgresql"' prisma/schema.prisma; then
            print_success "Using PostgreSQL provider"
        else
            print_warning "Not using PostgreSQL provider"
        fi
    else
        print_error "Prisma schema not found"
    fi

    echo ""
}

# Provide recommendations
print_recommendations() {
    print_header "🎯 RECOMMENDATIONS"

    echo -e "${BOLD}1. Set DATABASE_URL in all environments:${NC}"
    echo "   vercel env add DATABASE_URL production"
    echo "   vercel env add DATABASE_URL preview"
    echo "   vercel env add DATABASE_URL development"
    echo ""

    echo -e "${BOLD}2. Use Vercel Postgres (recommended):${NC}"
    echo "   • Go to: https://vercel.com/dashboard/stores"
    echo "   • Create a PostgreSQL database"
    echo "   • Link it to your project"
    echo "   • Environment variables will be added automatically"
    echo ""

    echo -e "${BOLD}3. For connection pooling:${NC}"
    echo "   • Use POSTGRES_PRISMA_URL for Prisma (with pooling)"
    echo "   • Use POSTGRES_URL_NON_POOLING for migrations"
    echo "   • Format: postgresql://user:pass@host:port/db?pgbouncer=true"
    echo ""

    echo -e "${BOLD}4. After setting environment variables:${NC}"
    echo "   • Redeploy your application: vercel --prod"
    echo "   • Run migrations: npx prisma migrate deploy"
    echo "   • Test with: npm run db:test"
    echo ""

    echo -e "${BOLD}5. Verify with health check:${NC}"
    echo "   npm run bot:production"
    echo ""
}

# Main execution
main() {
    print_header "🚀 VERCEL DATABASE ENVIRONMENT CHECKER"

    echo -e "${DIM}Checking Vercel environment variables for database connection...${NC}"
    echo ""

    # Prerequisites
    check_vercel_cli
    echo ""

    check_vercel_auth
    echo ""

    check_vercel_project
    echo ""

    print_header "📋 ENVIRONMENT VARIABLES"

    # Check all environments
    check_database_env "production" "Production"
    check_database_env "preview" "Preview"
    check_database_env "development" "Development"

    # Test connection
    test_connection

    # Check common issues
    check_common_issues

    # Recommendations
    print_recommendations

    print_header "✅ CHECKS COMPLETE"

    echo -e "${GREEN}Review the output above for any issues.${NC}"
    echo -e "${GREEN}Follow the recommendations if needed.${NC}"
    echo ""

    print_info "Next steps:"
    echo "   1. Fix any missing DATABASE_URL variables"
    echo "   2. Run: npm run db:test"
    echo "   3. Run: npm run bot:production"
    echo ""
}

# Run main function
main
