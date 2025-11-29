#!/bin/bash

# 🌾 Interactive Stripe Setup Script
# Divine Agricultural E-Commerce Platform
# Version: 1.0.0

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Emojis
CHECK="✅"
WARN="⚠️"
INFO="ℹ️"
ROCKET="🚀"
LOCK="🔐"
KEY="🔑"
LIGHTNING="⚡"

echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║  ${PURPLE}🌾 STRIPE SETUP - INTERACTIVE GUIDE${CYAN}                     ║${NC}"
echo -e "${CYAN}║  Divine Agricultural Payment Integration                  ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to print step header
print_step() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}${1}${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# Function to wait for user
wait_for_user() {
    echo ""
    echo -e "${YELLOW}Press ENTER to continue...${NC}"
    read -r
}

# Function to ask yes/no
ask_yes_no() {
    while true; do
        read -p "$1 (y/n): " yn
        case $yn in
            [Yy]* ) return 0;;
            [Nn]* ) return 1;;
            * ) echo "Please answer yes (y) or no (n).";;
        esac
    done
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: Not in project root directory!${NC}"
    echo "Please run this script from: M:/Repo/Farmers Market Platform web and app"
    exit 1
fi

# Check if Stripe CLI is installed
if [ ! -f ".stripe-cli/stripe.exe" ] && [ ! -f ".stripe-cli/stripe" ]; then
    echo -e "${RED}Error: Stripe CLI not found in .stripe-cli/ directory${NC}"
    echo "Please install Stripe CLI first."
    exit 1
fi

# Determine stripe command based on OS
if [ -f ".stripe-cli/stripe.exe" ]; then
    STRIPE_CMD="./.stripe-cli/stripe.exe"
else
    STRIPE_CMD="./.stripe-cli/stripe"
fi

echo -e "${GREEN}${CHECK} Stripe CLI found: ${STRIPE_CMD}${NC}"

# ============================================
# STEP 1: Check Stripe Version
# ============================================
print_step "${LIGHTNING} STEP 1: Verify Stripe CLI Installation"

echo -e "${INFO} Checking Stripe CLI version..."
STRIPE_VERSION=$($STRIPE_CMD --version 2>&1)
echo -e "${GREEN}${CHECK} ${STRIPE_VERSION}${NC}"

# ============================================
# STEP 2: Authenticate with Stripe
# ============================================
print_step "${LOCK} STEP 2: Authenticate with Stripe"

echo -e "${INFO} Checking if already authenticated..."
if $STRIPE_CMD config --list > /dev/null 2>&1; then
    echo -e "${GREEN}${CHECK} Already authenticated with Stripe!${NC}"
    echo ""
    $STRIPE_CMD config --list
    echo ""
    if ask_yes_no "Do you want to re-authenticate?"; then
        echo ""
        echo -e "${YELLOW}${WARN} Re-authenticating...${NC}"
        $STRIPE_CMD login
    fi
else
    echo -e "${YELLOW}${WARN} Not authenticated yet.${NC}"
    echo ""
    echo -e "${CYAN}This will open your browser to authenticate.${NC}"
    echo -e "${CYAN}1. Browser will open automatically${NC}"
    echo -e "${CYAN}2. Click 'Allow access' button${NC}"
    echo -e "${CYAN}3. Return to this terminal${NC}"
    echo ""
    wait_for_user

    echo -e "${LIGHTNING} Opening browser for authentication..."
    $STRIPE_CMD login

    echo ""
    echo -e "${GREEN}${CHECK} Authentication complete!${NC}"
fi

# ============================================
# STEP 3: Get API Keys
# ============================================
print_step "${KEY} STEP 3: Get Your Stripe API Keys"

echo -e "${CYAN}You need to get your test API keys from the Stripe Dashboard.${NC}"
echo ""
echo -e "${YELLOW}IMPORTANT: Make sure you're in TEST MODE!${NC}"
echo ""
echo -e "1. Open: ${BLUE}https://dashboard.stripe.com/test/apikeys${NC}"
echo -e "2. Make sure the toggle at the top says ${GREEN}'Test mode'${NC} (NOT Live mode)"
echo -e "3. Copy the following keys:"
echo -e "   ${PURPLE}• Publishable key${NC} (starts with pk_test_)"
echo -e "   ${PURPLE}• Secret key${NC} (starts with sk_test_)"
echo ""

if ask_yes_no "Do you want me to open the Stripe Dashboard for you?"; then
    echo ""
    echo -e "${LIGHTNING} Opening Stripe Dashboard..."

    # Try to open browser based on OS
    if command -v xdg-open > /dev/null; then
        xdg-open "https://dashboard.stripe.com/test/apikeys" 2>/dev/null &
    elif command -v open > /dev/null; then
        open "https://dashboard.stripe.com/test/apikeys"
    elif command -v start > /dev/null; then
        start "https://dashboard.stripe.com/test/apikeys"
    else
        echo -e "${YELLOW}Could not auto-open browser. Please open manually:${NC}"
        echo "https://dashboard.stripe.com/test/apikeys"
    fi

    echo ""
    echo -e "${GREEN}Dashboard should be opening...${NC}"
fi

echo ""
echo -e "${CYAN}Once you have your keys, we'll update .env.local${NC}"
wait_for_user

# ============================================
# STEP 4: Get Keys from User
# ============================================
print_step "${KEY} STEP 4: Enter Your API Keys"

echo -e "${CYAN}Please paste your keys here:${NC}"
echo ""

# Get Publishable Key
echo -e "${PURPLE}Publishable Key (pk_test_...):${NC}"
read -r PUBLISHABLE_KEY

# Validate publishable key
if [[ ! $PUBLISHABLE_KEY =~ ^pk_test_ ]]; then
    echo -e "${RED}${WARN} Warning: Key doesn't start with 'pk_test_'${NC}"
    if ! ask_yes_no "Continue anyway?"; then
        echo "Setup cancelled."
        exit 1
    fi
fi

echo ""

# Get Secret Key
echo -e "${PURPLE}Secret Key (sk_test_...):${NC}"
read -rs SECRET_KEY  # -s for secret (won't show on screen)
echo ""

# Validate secret key
if [[ ! $SECRET_KEY =~ ^sk_test_ ]]; then
    echo -e "${RED}${WARN} Warning: Key doesn't start with 'sk_test_'${NC}"
    if ! ask_yes_no "Continue anyway?"; then
        echo "Setup cancelled."
        exit 1
    fi
fi

echo ""
echo -e "${GREEN}${CHECK} Keys received!${NC}"

# ============================================
# STEP 5: Update .env.local
# ============================================
print_step "${LIGHTNING} STEP 5: Update .env.local File"

ENV_FILE=".env.local"

# Backup existing .env.local if it exists
if [ -f "$ENV_FILE" ]; then
    BACKUP_FILE=".env.local.backup.$(date +%Y%m%d_%H%M%S)"
    echo -e "${INFO} Backing up existing .env.local to ${BACKUP_FILE}"
    cp "$ENV_FILE" "$BACKUP_FILE"
    echo -e "${GREEN}${CHECK} Backup created${NC}"
fi

echo ""
echo -e "${INFO} Updating Stripe keys in .env.local..."

# Create or update .env.local
if [ -f "$ENV_FILE" ]; then
    # Update existing file

    # Check if keys already exist
    if grep -q "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=" "$ENV_FILE"; then
        # Update existing key
        sed -i "s|NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=.*|NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$PUBLISHABLE_KEY|g" "$ENV_FILE"
    else
        # Add new key
        echo "" >> "$ENV_FILE"
        echo "# Stripe Keys (added by setup script)" >> "$ENV_FILE"
        echo "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$PUBLISHABLE_KEY" >> "$ENV_FILE"
    fi

    if grep -q "STRIPE_SECRET_KEY=" "$ENV_FILE"; then
        sed -i "s|STRIPE_SECRET_KEY=.*|STRIPE_SECRET_KEY=$SECRET_KEY|g" "$ENV_FILE"
    else
        echo "STRIPE_SECRET_KEY=$SECRET_KEY" >> "$ENV_FILE"
    fi

    if ! grep -q "STRIPE_WEBHOOK_SECRET=" "$ENV_FILE"; then
        echo "STRIPE_WEBHOOK_SECRET=whsec_WILL_UPDATE_IN_STEP_7" >> "$ENV_FILE"
    fi
else
    # Create new file
    cat > "$ENV_FILE" << EOF
# Stripe Test Keys (Generated by setup script)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$PUBLISHABLE_KEY
STRIPE_SECRET_KEY=$SECRET_KEY
STRIPE_WEBHOOK_SECRET=whsec_WILL_UPDATE_IN_STEP_7

# Database (Update with your database URL)
DATABASE_URL="postgresql://user:password@localhost:5432/farmers_market"

# NextAuth (Update with your values)
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-secret-here
EOF
fi

echo -e "${GREEN}${CHECK} .env.local updated successfully!${NC}"

# ============================================
# STEP 6: Summary
# ============================================
print_step "${ROCKET} SETUP COMPLETE!"

echo -e "${GREEN}${CHECK} Stripe CLI authenticated${NC}"
echo -e "${GREEN}${CHECK} API keys configured${NC}"
echo -e "${GREEN}${CHECK} .env.local file updated${NC}"
echo ""

echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║  ${GREEN}NEXT STEPS${CYAN}                                                ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}1.${NC} Start the development server:"
echo -e "   ${BLUE}npm run dev:omen${NC}"
echo ""
echo -e "${YELLOW}2.${NC} In a NEW terminal, start webhook forwarding:"
echo -e "   ${BLUE}$STRIPE_CMD listen --forward-to localhost:3001/api/webhooks/stripe${NC}"
echo ""
echo -e "${YELLOW}3.${NC} Copy the webhook secret (whsec_...) and update .env.local"
echo ""
echo -e "${YELLOW}4.${NC} Restart the dev server"
echo ""
echo -e "${YELLOW}5.${NC} Run manual tests:"
echo -e "   ${BLUE}$STRIPE_CMD trigger payment_intent.succeeded${NC}"
echo ""

echo -e "${CYAN}For detailed testing instructions, see:${NC}"
echo -e "  • ${BLUE}DO_THIS_NOW.md${NC}"
echo -e "  • ${BLUE}PRIORITY_2_PROGRESS.md${NC}"
echo ""

echo -e "${GREEN}${ROCKET} Divine payment consciousness activated! ${ROCKET}${NC}"
echo ""
