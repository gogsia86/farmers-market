#!/bin/bash

#
# 🌱 FARMERS MARKET PLATFORM - ENV SETUP SCRIPT
#
# This script creates or updates the .env file with the correct DATABASE_URL
# and other necessary environment variables for local development.
#
# Usage:
#   chmod +x scripts/setup-env.sh
#   ./scripts/setup-env.sh
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Helper functions
print_green() {
    echo -e "${GREEN}$1${NC}"
}

print_yellow() {
    echo -e "${YELLOW}$1${NC}"
}

print_red() {
    echo -e "${RED}$1${NC}"
}

print_cyan() {
    echo -e "${CYAN}$1${NC}"
}

# Get script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_ROOT/.env"
ENV_EXAMPLE_FILE="$PROJECT_ROOT/.env.example"

# Banner
echo ""
print_cyan "╔═══════════════════════════════════════════════════════════════════╗"
print_cyan "║         🌱 FARMERS MARKET PLATFORM - ENV SETUP SCRIPT            ║"
print_cyan "╚═══════════════════════════════════════════════════════════════════╝"
echo ""

# Check if .env already exists
if [ -f "$ENV_FILE" ]; then
    print_yellow "⚠️  .env file already exists!"
    echo ""
    read -p "Do you want to update DATABASE_URL? (y/N): " response

    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        print_green "✅ Exiting without changes."
        exit 0
    fi

    # Backup existing .env
    BACKUP_FILE="$ENV_FILE.backup.$(date +%Y%m%d_%H%M%S)"
    cp "$ENV_FILE" "$BACKUP_FILE"
    print_cyan "📦 Backed up existing .env to: $BACKUP_FILE"
fi

# Database configuration (Docker defaults)
DB_HOST="localhost"
DB_PORT="5432"
DB_DATABASE="farmers_market"
DB_USER="farmers_user"
DB_PASSWORD="changeme123"

# Construct DATABASE_URL
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}"

echo ""
print_cyan "📝 Database Configuration:"
echo "   Host:     $DB_HOST"
echo "   Port:     $DB_PORT"
echo "   Database: $DB_DATABASE"
echo "   User:     $DB_USER"
echo "   Password: $DB_PASSWORD"
echo ""

# Ask if user wants to customize
read -p "Use these settings? (Y/n): " customize
if [[ "$customize" =~ ^[Nn]$ ]]; then
    echo ""
    print_yellow "🔧 Custom Configuration:"

    read -p "Enter database host [localhost]: " custom_host
    DB_HOST="${custom_host:-localhost}"

    read -p "Enter database port [5432]: " custom_port
    DB_PORT="${custom_port:-5432}"

    read -p "Enter database name [farmers_market]: " custom_db
    DB_DATABASE="${custom_db:-farmers_market}"

    read -p "Enter database user [farmers_user]: " custom_user
    DB_USER="${custom_user:-farmers_user}"

    read -p "Enter database password [changeme123]: " custom_password
    DB_PASSWORD="${custom_password:-changeme123}"

    # Reconstruct DATABASE_URL with custom values
    DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}"
fi

echo ""
print_cyan "📄 Final DATABASE_URL:"
echo "   $DATABASE_URL"
echo ""

# Create or update .env file
if [ -f "$ENV_FILE" ]; then
    # Check if DATABASE_URL exists
    if grep -q "^DATABASE_URL=" "$ENV_FILE"; then
        # Replace existing DATABASE_URL
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s|^DATABASE_URL=.*|DATABASE_URL=\"$DATABASE_URL\"|" "$ENV_FILE"
        else
            # Linux
            sed -i "s|^DATABASE_URL=.*|DATABASE_URL=\"$DATABASE_URL\"|" "$ENV_FILE"
        fi
        print_yellow "🔄 Updated existing DATABASE_URL"
    else
        # Add DATABASE_URL
        echo "" >> "$ENV_FILE"
        echo "# Database Configuration" >> "$ENV_FILE"
        echo "DATABASE_URL=\"$DATABASE_URL\"" >> "$ENV_FILE"
        print_green "➕ Added DATABASE_URL to .env"
    fi
else
    # Create new .env file
    cat > "$ENV_FILE" << EOF
# ============================================================================
# FARMERS MARKET PLATFORM - ENVIRONMENT VARIABLES
# ============================================================================

# Database Configuration
DATABASE_URL="$DATABASE_URL"

# Node Environment
NODE_ENV="development"

# NextAuth Configuration
NEXTAUTH_SECRET="change-this-to-a-random-secret-in-production-$RANDOM"
NEXTAUTH_URL="http://localhost:3000"

# API Configuration
NEXT_PUBLIC_API_URL="http://localhost:3000/api"

# ============================================================================
# Add additional environment variables below
# ============================================================================

EOF
    print_green "✅ Created new .env file"
fi

# Ensure essential variables exist
declare -A ESSENTIAL_VARS=(
    ["NODE_ENV"]="development"
    ["NEXTAUTH_SECRET"]="change-this-to-a-random-secret-in-production-$RANDOM"
    ["NEXTAUTH_URL"]="http://localhost:3000"
    ["NEXT_PUBLIC_API_URL"]="http://localhost:3000/api"
)

for var in "${!ESSENTIAL_VARS[@]}"; do
    if ! grep -q "^$var=" "$ENV_FILE"; then
        echo "$var=\"${ESSENTIAL_VARS[$var]}\"" >> "$ENV_FILE"
        print_green "➕ Added $var"
    fi
done

echo ""
print_green "═══════════════════════════════════════════════════════════════════"
print_green "✅ Environment setup complete!"
print_green "═══════════════════════════════════════════════════════════════════"
echo ""

# Show next steps
print_cyan "🚀 Next Steps:"
echo "   1. Verify PostgreSQL is running:"
echo "      docker-compose -f docker-compose.dev.yml up -d postgres-dev"
echo ""
echo "   2. Apply database migrations:"
echo "      npx prisma migrate deploy"
echo ""
echo "   3. Generate Prisma client:"
echo "      npx prisma generate"
echo ""
echo "   4. Seed the database:"
echo "      npm run seed"
echo ""
echo "   5. Start the development server:"
echo "      npm run dev"
echo ""

# Test database connection
echo ""
read -p "Do you want to test the database connection now? (Y/n): " test_connection
if [[ ! "$test_connection" =~ ^[Nn]$ ]]; then
    print_cyan "🔍 Testing database connection..."

    # Check if psql is available
    if command -v psql &> /dev/null; then
        echo ""
        CONNECTION_STRING="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}"

        if psql "$CONNECTION_STRING" -c "SELECT version();" &> /dev/null; then
            print_green "✅ Database connection successful!"
        else
            print_red "❌ Database connection failed!"
            echo "   Make sure PostgreSQL is running:"
            echo "   docker-compose -f docker-compose.dev.yml up -d postgres-dev"
        fi
    else
        print_yellow "⚠️  psql not found. Skipping connection test."
        echo "   Install PostgreSQL client tools to enable connection testing."
    fi
fi

echo ""
print_green "📝 Configuration saved to: $ENV_FILE"
echo ""
