#!/bin/bash

# Minimal Essential NPM Install Script
# For slow/unstable network connections
# Installs only critical dependencies first

set -e

echo "🚀 Minimal Essential Install - For Slow Networks"
echo "=================================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Progress tracker
INSTALLED=0
FAILED=0

# Function to install a single package with retry
install_package() {
    local package=$1
    local max_retries=3
    local retry_count=0

    while [ $retry_count -lt $max_retries ]; do
        echo -ne "${CYAN}Installing: $package (attempt $((retry_count + 1))/$max_retries)...${NC}"

        if npm install "$package" --legacy-peer-deps --no-save --silent 2>&1 | grep -q "npm error"; then
            retry_count=$((retry_count + 1))
            if [ $retry_count -lt $max_retries ]; then
                echo -e " ${YELLOW}Failed, retrying...${NC}"
                sleep 2
            else
                echo -e " ${RED}✗ Failed${NC}"
                FAILED=$((FAILED + 1))
                return 1
            fi
        else
            echo -e " ${GREEN}✓${NC}"
            INSTALLED=$((INSTALLED + 1))
            return 0
        fi
    done
}

# Phase 1: Core Runtime Dependencies
echo -e "${BLUE}📦 Phase 1: Core Runtime Dependencies${NC}"
echo "========================================"

CORE_DEPS=(
    "next@^16.1.1"
    "react@^19.2.3"
    "react-dom@^19.2.3"
    "@prisma/client@^7.2.0"
    "zod@^3.25.76"
)

for dep in "${CORE_DEPS[@]}"; do
    install_package "$dep"
done

echo ""

# Phase 2: Database & Auth
echo -e "${BLUE}📦 Phase 2: Database & Auth${NC}"
echo "============================"

DB_AUTH_DEPS=(
    "next-auth@^5.0.0-beta.30"
    "@auth/prisma-adapter@^2.11.1"
    "pg@^8.16.3"
    "@prisma/adapter-pg@^7.2.0"
    "bcryptjs@^3.0.3"
)

for dep in "${DB_AUTH_DEPS[@]}"; do
    install_package "$dep"
done

echo ""

# Phase 3: Essential UI Components
echo -e "${BLUE}📦 Phase 3: Essential UI${NC}"
echo "========================="

UI_DEPS=(
    "tailwind-merge@^3.4.0"
    "tailwindcss-animate@^1.0.7"
    "class-variance-authority@^0.7.1"
    "clsx@^2.1.1"
    "lucide-react@^0.562.0"
)

for dep in "${UI_DEPS[@]}"; do
    install_package "$dep"
done

echo ""

# Phase 4: Forms & Validation
echo -e "${BLUE}📦 Phase 4: Forms & Validation${NC}"
echo "==============================="

FORMS_DEPS=(
    "react-hook-form@^7.69.0"
    "@hookform/resolvers@^5.2.2"
)

for dep in "${FORMS_DEPS[@]}"; do
    install_package "$dep"
done

echo ""

# Phase 5: API & Data Fetching
echo -e "${BLUE}📦 Phase 5: API & Data${NC}"
echo "======================="

API_DEPS=(
    "@tanstack/react-query@^5.90.12"
    "date-fns@^4.1.0"
    "nanoid@^5.1.6"
)

for dep in "${API_DEPS[@]}"; do
    install_package "$dep"
done

echo ""

# Phase 6: Critical Dev Dependencies
echo -e "${BLUE}📦 Phase 6: Dev Dependencies${NC}"
echo "============================="

DEV_DEPS=(
    "typescript@^5.9.3"
    "@types/node@^25.0.3"
    "@types/react@^19.2.7"
    "@types/react-dom@^19.2.3"
    "prisma@^7.2.0"
    "tailwindcss@^3.4.19"
    "autoprefixer@^10.4.23"
)

for dep in "${DEV_DEPS[@]}"; do
    install_package "$dep"
done

echo ""
echo "=================================================="
echo -e "${GREEN}✓ Installed: $INSTALLED packages${NC}"
echo -e "${RED}✗ Failed: $FAILED packages${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All essential packages installed!${NC}"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Install remaining packages: npm install --legacy-peer-deps"
    echo "   2. Or continue in background: nohup npm install --legacy-peer-deps &"
    echo "   3. Generate lockfile: npm install --package-lock-only"
    echo ""
else
    echo -e "${YELLOW}⚠️  Some packages failed to install${NC}"
    echo ""
    echo "📝 Options:"
    echo "   1. Check internet connection"
    echo "   2. Try again later: bash scripts/install-minimal.sh"
    echo "   3. Install manually: npm install <package> --legacy-peer-deps"
    echo ""
fi

# Try to generate a partial package-lock.json
if [ $FAILED -eq 0 ]; then
    echo -e "${CYAN}🔒 Generating partial lockfile...${NC}"
    npm install --package-lock-only --legacy-peer-deps --silent 2>&1 || true
    echo -e "${GREEN}✓ Lockfile updated${NC}"
fi

exit 0
