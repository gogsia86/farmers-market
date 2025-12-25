#!/bin/bash

# ═══════════════════════════════════════════════════════════
# 🚀 VERCEL ENVIRONMENT VARIABLES UPLOAD SCRIPT
# Farmers Market Platform - Automated Environment Setup
# Last Updated: 2024-12-18
# ═══════════════════════════════════════════════════════════

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ═══════════════════════════════════════════════════════════
# Helper Functions
# ═══════════════════════════════════════════════════════════

print_header() {
    echo -e "${BLUE}"
    echo "════════════════════════════════════════════════════════════"
    echo "  🌾 Farmers Market Platform - Vercel Environment Setup"
    echo "════════════════════════════════════════════════════════════"
    echo -e "${NC}"
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

# ═══════════════════════════════════════════════════════════
# Check Prerequisites
# ═══════════════════════════════════════════════════════════

check_prerequisites() {
    print_info "Checking prerequisites..."

    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        print_error "Vercel CLI is not installed"
        echo ""
        echo "Install it with:"
        echo "  npm install -g vercel"
        echo ""
        exit 1
    fi

    print_success "Vercel CLI is installed"

    # Check if .env.vercel.local exists
    if [ ! -f ".env.vercel.local" ]; then
        print_warning ".env.vercel.local not found"
        echo ""
        echo "Creating .env.vercel.local from template..."

        if [ -f ".env.vercel" ]; then
            cp .env.vercel .env.vercel.local
            print_success "Created .env.vercel.local from template"
            echo ""
            print_warning "IMPORTANT: Edit .env.vercel.local with your actual values before continuing!"
            echo ""
            read -p "Press Enter when you've updated .env.vercel.local with real values..."
        else
            print_error ".env.vercel template not found"
            exit 1
        fi
    fi

    print_success "Prerequisites check passed"
    echo ""
}

# ═══════════════════════════════════════════════════════════
# Login and Link Project
# ═══════════════════════════════════════════════════════════

setup_vercel() {
    print_info "Setting up Vercel connection..."

    # Check if already logged in
    if ! vercel whoami &> /dev/null; then
        print_info "Please log in to Vercel..."
        vercel login
    else
        print_success "Already logged in to Vercel"
    fi

    # Check if project is linked
    if [ ! -f ".vercel/project.json" ]; then
        print_info "Linking to Vercel project..."
        vercel link
    else
        print_success "Project already linked"
    fi

    echo ""
}

# ═══════════════════════════════════════════════════════════
# Upload Environment Variables
# ═══════════════════════════════════════════════════════════

upload_env_vars() {
    local env_type=$1
    local env_file=".env.vercel.local"

    print_info "Uploading environment variables to ${env_type}..."
    echo ""

    local total=0
    local success=0
    local skipped=0
    local failed=0

    # Read .env.vercel.local and upload each variable
    while IFS= read -r line || [ -n "$line" ]; do
        # Skip comments and empty lines
        if [[ "$line" =~ ^#.*$ ]] || [[ -z "$line" ]]; then
            continue
        fi

        # Parse KEY=VALUE
        if [[ "$line" =~ ^([A-Z_][A-Z0-9_]*)=(.*)$ ]]; then
            key="${BASH_REMATCH[1]}"
            value="${BASH_REMATCH[2]}"

            # Skip if value is a placeholder
            if [[ "$value" == *"your-"* ]] || [[ "$value" == *"xxx"* ]] || [[ "$value" == *"generate-"* ]]; then
                print_warning "Skipping ${key} (placeholder value detected)"
                ((skipped++))
                continue
            fi

            # Skip empty values
            if [[ -z "$value" ]]; then
                print_warning "Skipping ${key} (empty value)"
                ((skipped++))
                continue
            fi

            ((total++))

            # Upload to Vercel
            if echo "$value" | vercel env add "$key" "$env_type" --force > /dev/null 2>&1; then
                print_success "Added ${key}"
                ((success++))
            else
                print_error "Failed to add ${key}"
                ((failed++))
            fi
        fi
    done < "$env_file"

    echo ""
    print_info "Upload Summary:"
    echo "  Total processed: $total"
    echo "  Successfully added: $success"
    echo "  Skipped (placeholders): $skipped"
    echo "  Failed: $failed"
    echo ""
}

# ═══════════════════════════════════════════════════════════
# Interactive Mode
# ═══════════════════════════════════════════════════════════

interactive_upload() {
    echo ""
    echo "Which environment do you want to upload to?"
    echo "  1) Production only"
    echo "  2) Preview only"
    echo "  3) Development only"
    echo "  4) All environments"
    echo ""
    read -p "Enter choice (1-4): " choice

    case $choice in
        1)
            upload_env_vars "production"
            ;;
        2)
            upload_env_vars "preview"
            ;;
        3)
            upload_env_vars "development"
            ;;
        4)
            upload_env_vars "production"
            upload_env_vars "preview"
            upload_env_vars "development"
            ;;
        *)
            print_error "Invalid choice"
            exit 1
            ;;
    esac
}

# ═══════════════════════════════════════════════════════════
# Verify Upload
# ═══════════════════════════════════════════════════════════

verify_upload() {
    print_info "Verifying uploaded environment variables..."
    echo ""

    echo "Production environment variables:"
    vercel env ls production

    echo ""
    read -p "Do you want to trigger a new deployment? (y/n): " deploy

    if [[ "$deploy" == "y" ]] || [[ "$deploy" == "Y" ]]; then
        print_info "Deploying to production..."
        vercel --prod --force
        print_success "Deployment triggered!"
        echo ""
        print_info "Check deployment status at: https://vercel.com/dashboard"
    fi
}

# ═══════════════════════════════════════════════════════════
# Validate Required Variables
# ═══════════════════════════════════════════════════════════

validate_required_vars() {
    print_info "Validating required environment variables..."
    echo ""

    local required_vars=(
        "DATABASE_URL"
        "NEXTAUTH_URL"
        "NEXTAUTH_SECRET"
        "JWT_SECRET"
        "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
        "STRIPE_SECRET_KEY"
        "SENDGRID_API_KEY"
        "GOOGLE_MAPS_API_KEY"
        "ADMIN_API_KEY"
    )

    local missing=0

    for var in "${required_vars[@]}"; do
        if ! grep -q "^${var}=.\+$" .env.vercel.local 2>/dev/null || \
           grep -q "^${var}=.*your-.*$" .env.vercel.local 2>/dev/null || \
           grep -q "^${var}=.*xxx.*$" .env.vercel.local 2>/dev/null || \
           grep -q "^${var}=.*generate-.*$" .env.vercel.local 2>/dev/null; then
            print_error "Missing or invalid: ${var}"
            ((missing++))
        else
            print_success "Valid: ${var}"
        fi
    done

    echo ""

    if [ $missing -gt 0 ]; then
        print_error "$missing required variables are missing or invalid"
        echo ""
        print_warning "Please update .env.vercel.local with actual values"
        echo ""
        read -p "Continue anyway? (y/n): " continue
        if [[ "$continue" != "y" ]] && [[ "$continue" != "Y" ]]; then
            exit 1
        fi
    else
        print_success "All required variables are set!"
    fi

    echo ""
}

# ═══════════════════════════════════════════════════════════
# Generate Secrets Helper
# ═══════════════════════════════════════════════════════════

generate_secrets() {
    print_info "Generating secure secrets..."
    echo ""

    echo "NEXTAUTH_SECRET:"
    openssl rand -base64 32
    echo ""

    echo "JWT_SECRET:"
    openssl rand -base64 32
    echo ""

    echo "ADMIN_API_KEY:"
    openssl rand -hex 32
    echo ""

    echo "ADMIN_SECRET_KEY:"
    openssl rand -hex 32
    echo ""

    print_info "Copy these values to .env.vercel.local"
    echo ""
}

# ═══════════════════════════════════════════════════════════
# Main Menu
# ═══════════════════════════════════════════════════════════

show_menu() {
    echo ""
    echo "What would you like to do?"
    echo "  1) Generate secrets (NEXTAUTH_SECRET, JWT_SECRET, etc.)"
    echo "  2) Validate .env.vercel.local"
    echo "  3) Upload environment variables to Vercel"
    echo "  4) List current Vercel environment variables"
    echo "  5) Delete all environment variables (danger!)"
    echo "  6) Exit"
    echo ""
    read -p "Enter choice (1-6): " menu_choice

    case $menu_choice in
        1)
            generate_secrets
            show_menu
            ;;
        2)
            validate_required_vars
            show_menu
            ;;
        3)
            validate_required_vars
            interactive_upload
            verify_upload
            ;;
        4)
            echo ""
            print_info "Production environment variables:"
            vercel env ls production
            echo ""
            print_info "Preview environment variables:"
            vercel env ls preview
            show_menu
            ;;
        5)
            print_warning "This will delete ALL environment variables!"
            read -p "Are you sure? Type 'DELETE' to confirm: " confirm
            if [[ "$confirm" == "DELETE" ]]; then
                print_info "Deleting all environment variables..."
                vercel env rm --yes
                print_success "All environment variables deleted"
            else
                print_info "Deletion cancelled"
            fi
            show_menu
            ;;
        6)
            print_success "Goodbye!"
            exit 0
            ;;
        *)
            print_error "Invalid choice"
            show_menu
            ;;
    esac
}

# ═══════════════════════════════════════════════════════════
# Main Execution
# ═══════════════════════════════════════════════════════════

main() {
    print_header
    check_prerequisites
    setup_vercel
    show_menu
}

# Run main function
main
