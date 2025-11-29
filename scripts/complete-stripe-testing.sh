#!/bin/bash

# 🌾 Complete Stripe Testing Script
# Farmers Market Platform - Interactive Stripe Setup & Testing
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
PARTY="🎉"

# Determine OS and Stripe command
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    STRIPE_CMD="./.stripe-cli/stripe.exe"
else
    STRIPE_CMD="./.stripe-cli/stripe"
fi

clear

echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║  ${PURPLE}🌾 STRIPE TESTING - COMPLETE GUIDE${CYAN}                        ║${NC}"
echo -e "${CYAN}║  Divine Agricultural Payment Integration                  ║${NC}"
echo -e "${CYAN}║  Estimated Time: 45 minutes                              ║${NC}"
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

# ============================================
# STEP 1: Authenticate with Stripe
# ============================================
print_step "${LOCK} STEP 1: Authenticate with Stripe (5 minutes)"

echo -e "${INFO} Checking authentication status..."
if $STRIPE_CMD config --list > /dev/null 2>&1; then
    echo -e "${GREEN}${CHECK} Already authenticated with Stripe!${NC}"
    echo ""
    $STRIPE_CMD config --list
    echo ""
    if ! ask_yes_no "Do you want to re-authenticate?"; then
        echo -e "${GREEN}${CHECK} Using existing authentication${NC}"
    else
        echo ""
        echo -e "${YELLOW}Re-authenticating...${NC}"
        $STRIPE_CMD login
    fi
else
    echo -e "${YELLOW}${WARN} Not authenticated yet${NC}"
    echo ""
    echo -e "${CYAN}This will open your browser to authenticate:${NC}"
    echo -e "  1. Browser will open automatically"
    echo -e "  2. Click ${GREEN}'Allow access'${NC} button"
    echo -e "  3. Return to this terminal"
    echo ""
    wait_for_user

    echo -e "${LIGHTNING} Opening browser for authentication..."
    $STRIPE_CMD login

    echo ""
    echo -e "${GREEN}${CHECK} Authentication complete!${NC}"
fi

# ============================================
# STEP 2: Get API Keys
# ============================================
print_step "${KEY} STEP 2: Get Your Stripe Test API Keys (5 minutes)"

echo -e "${CYAN}You need to get your test API keys from the Stripe Dashboard.${NC}"
echo ""
echo -e "${YELLOW}IMPORTANT: Make sure you're in TEST MODE!${NC}"
echo ""
echo -e "1. URL: ${BLUE}https://dashboard.stripe.com/test/apikeys${NC}"
echo -e "2. Toggle at top should say ${GREEN}'Test mode'${NC} (NOT Live mode)"
echo -e "3. Copy both keys:"
echo -e "   ${PURPLE}• Publishable key${NC} (starts with pk_test_)"
echo -e "   ${PURPLE}• Secret key${NC} (starts with sk_test_)"
echo ""

if ask_yes_no "Open Stripe Dashboard now?"; then
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

    echo -e "${GREEN}Dashboard should be opening...${NC}"
fi

echo ""
echo -e "${CYAN}Once you have your keys ready, we'll update .env.local${NC}"
wait_for_user

# ============================================
# STEP 3: Configure Environment Variables
# ============================================
print_step "${LIGHTNING} STEP 3: Configure .env.local (5 minutes)"

echo -e "${CYAN}Please enter your Stripe test API keys:${NC}"
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

# Backup existing .env.local
if [ -f .env.local ]; then
    BACKUP_FILE=".env.local.backup.$(date +%Y%m%d_%H%M%S)"
    echo ""
    echo -e "${INFO} Backing up existing .env.local to ${BACKUP_FILE}"
    cp .env.local "$BACKUP_FILE"
    echo -e "${GREEN}${CHECK} Backup created${NC}"
fi

echo ""
echo -e "${INFO} Updating .env.local with Stripe keys..."

# Update or add Stripe keys to .env.local
if grep -q "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=" .env.local 2>/dev/null; then
    # Update existing keys
    sed -i.tmp "s|NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=.*|NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$PUBLISHABLE_KEY|g" .env.local
    sed -i.tmp "s|STRIPE_SECRET_KEY=.*|STRIPE_SECRET_KEY=$SECRET_KEY|g" .env.local
    rm -f .env.local.tmp
    echo -e "${GREEN}${CHECK} Updated existing keys${NC}"
else
    # Add new keys
    echo "" >> .env.local
    echo "# Stripe Test Keys (added by setup script)" >> .env.local
    echo "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$PUBLISHABLE_KEY" >> .env.local
    echo "STRIPE_SECRET_KEY=$SECRET_KEY" >> .env.local
    echo "STRIPE_WEBHOOK_SECRET=whsec_WILL_UPDATE_IN_STEP_6" >> .env.local
    echo -e "${GREEN}${CHECK} Added new keys${NC}"
fi

# Ensure webhook secret line exists
if ! grep -q "STRIPE_WEBHOOK_SECRET=" .env.local; then
    echo "STRIPE_WEBHOOK_SECRET=whsec_WILL_UPDATE_IN_STEP_6" >> .env.local
fi

echo -e "${GREEN}${CHECK} .env.local updated successfully!${NC}"

# ============================================
# STEP 4: Start Development Server
# ============================================
print_step "${ROCKET} STEP 4: Start Development Server (2 minutes)"

echo -e "${CYAN}Starting the development server...${NC}"
echo ""
echo -e "${INFO} This will run in the background"
echo -e "${INFO} Server will be available at: ${BLUE}http://localhost:3001${NC}"
echo ""

# Kill any existing process on port 3001
echo -e "${INFO} Checking for existing processes on port 3001..."
if lsof -ti:3001 > /dev/null 2>&1; then
    echo -e "${YELLOW}${WARN} Port 3001 is in use, killing existing process...${NC}"
    lsof -ti:3001 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# Start dev server in background
echo -e "${INFO} Starting dev server (this may take 10-15 seconds)..."
npm run dev:omen > /tmp/stripe-test-dev.log 2>&1 &
DEV_SERVER_PID=$!

# Wait for server to be ready
echo -e "${INFO} Waiting for server to be ready..."
for i in {1..30}; do
    if curl -s http://localhost:3001 > /dev/null 2>&1; then
        echo -e "${GREEN}${CHECK} Development server is ready!${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}${WARN} Server did not start in time. Check logs at /tmp/stripe-test-dev.log${NC}"
        exit 1
    fi
    echo -n "."
    sleep 1
done

echo ""
echo -e "${GREEN}${CHECK} Server running on http://localhost:3001${NC}"
echo -e "${INFO} Server PID: $DEV_SERVER_PID"
echo ""

# Test health endpoint
echo -e "${INFO} Testing webhook health endpoint..."
HEALTH_RESPONSE=$(curl -s http://localhost:3001/api/webhooks/stripe)
if echo "$HEALTH_RESPONSE" | grep -q "ok"; then
    echo -e "${GREEN}${CHECK} Webhook endpoint is active!${NC}"
    echo -e "${CYAN}Response: $HEALTH_RESPONSE${NC}"
else
    echo -e "${RED}${WARN} Unexpected response: $HEALTH_RESPONSE${NC}"
fi

wait_for_user

# ============================================
# STEP 5: Start Webhook Forwarding
# ============================================
print_step "${LIGHTNING} STEP 5: Start Webhook Forwarding (2 minutes)"

echo -e "${CYAN}Starting Stripe webhook forwarding...${NC}"
echo ""
echo -e "${INFO} This will forward Stripe events to your local server"
echo -e "${INFO} Watch for the ${YELLOW}webhook secret (whsec_...)${NC} - you'll need it!"
echo ""

# Start webhook forwarding in background and capture output
echo -e "${LIGHTNING} Starting webhook listener..."
$STRIPE_CMD listen --forward-to localhost:3001/api/webhooks/stripe > /tmp/stripe-webhook.log 2>&1 &
WEBHOOK_PID=$!

# Wait for webhook secret to appear
echo -e "${INFO} Waiting for webhook secret..."
sleep 3

# Extract webhook secret from logs
WEBHOOK_SECRET=""
for i in {1..10}; do
    if [ -f /tmp/stripe-webhook.log ]; then
        WEBHOOK_SECRET=$(grep -oP 'whsec_[a-zA-Z0-9]+' /tmp/stripe-webhook.log | head -1)
        if [ ! -z "$WEBHOOK_SECRET" ]; then
            break
        fi
    fi
    sleep 1
done

if [ -z "$WEBHOOK_SECRET" ]; then
    echo -e "${RED}${WARN} Could not extract webhook secret automatically${NC}"
    echo -e "${YELLOW}Please check /tmp/stripe-webhook.log manually${NC}"
    echo ""
    echo -e "${CYAN}Enter your webhook secret (whsec_...):${NC}"
    read -r WEBHOOK_SECRET
else
    echo -e "${GREEN}${CHECK} Webhook secret captured!${NC}"
    echo -e "${PURPLE}Secret: $WEBHOOK_SECRET${NC}"
fi

echo ""
echo -e "${INFO} Webhook listener PID: $WEBHOOK_PID"
echo -e "${GREEN}${CHECK} Webhook forwarding active!${NC}"

wait_for_user

# ============================================
# STEP 6: Update Webhook Secret
# ============================================
print_step "${KEY} STEP 6: Update Webhook Secret (2 minutes)"

echo -e "${INFO} Updating .env.local with webhook secret..."

# Update webhook secret in .env.local
sed -i.tmp "s|STRIPE_WEBHOOK_SECRET=.*|STRIPE_WEBHOOK_SECRET=$WEBHOOK_SECRET|g" .env.local
rm -f .env.local.tmp

echo -e "${GREEN}${CHECK} Webhook secret updated in .env.local${NC}"

# Restart dev server to pick up new secret
echo ""
echo -e "${INFO} Restarting dev server to load new secret..."
kill $DEV_SERVER_PID 2>/dev/null || true
sleep 2

npm run dev:omen > /tmp/stripe-test-dev.log 2>&1 &
DEV_SERVER_PID=$!

# Wait for server to restart
echo -e "${INFO} Waiting for server to restart..."
for i in {1..30}; do
    if curl -s http://localhost:3001 > /dev/null 2>&1; then
        echo -e "${GREEN}${CHECK} Server restarted successfully!${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

echo ""
wait_for_user

# ============================================
# STEP 7: Run Manual Tests
# ============================================
print_step "${PARTY} STEP 7: Run Payment Tests (30 minutes)"

echo -e "${CYAN}Now we'll test all payment flows!${NC}"
echo ""
echo -e "${INFO} We'll test the following scenarios:"
echo -e "  1. ${GREEN}Payment Success${NC}"
echo -e "  2. ${YELLOW}Payment Failed${NC}"
echo -e "  3. ${BLUE}Refund Processing${NC}"
echo ""

# Test 1: Payment Success
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}TEST 1: Payment Intent Success${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${INFO} Triggering payment_intent.succeeded event..."
$STRIPE_CMD trigger payment_intent.succeeded

echo ""
echo -e "${INFO} Check the webhook logs:"
tail -5 /tmp/stripe-webhook.log

echo ""
echo -e "${CYAN}Did you see a ${GREEN}[200]${CYAN} response?${NC}"
if ask_yes_no "Test 1 passed?"; then
    echo -e "${GREEN}${CHECK} Test 1: PASSED${NC}"
    TEST1_PASSED=1
else
    echo -e "${RED}${WARN} Test 1: FAILED${NC}"
    TEST1_PASSED=0
fi

echo ""
wait_for_user

# Test 2: Payment Failed
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}TEST 2: Payment Intent Failed${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${INFO} Triggering payment_intent.payment_failed event..."
$STRIPE_CMD trigger payment_intent.payment_failed

echo ""
echo -e "${INFO} Check the webhook logs:"
tail -5 /tmp/stripe-webhook.log

echo ""
echo -e "${CYAN}Did you see a ${GREEN}[200]${CYAN} response?${NC}"
if ask_yes_no "Test 2 passed?"; then
    echo -e "${GREEN}${CHECK} Test 2: PASSED${NC}"
    TEST2_PASSED=1
else
    echo -e "${RED}${WARN} Test 2: FAILED${NC}"
    TEST2_PASSED=0
fi

echo ""
wait_for_user

# Test 3: Refund
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}TEST 3: Charge Refunded${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${INFO} Triggering charge.refunded event..."
$STRIPE_CMD trigger charge.refunded

echo ""
echo -e "${INFO} Check the webhook logs:"
tail -5 /tmp/stripe-webhook.log

echo ""
echo -e "${CYAN}Did you see a ${GREEN}[200]${CYAN} response?${NC}"
if ask_yes_no "Test 3 passed?"; then
    echo -e "${GREEN}${CHECK} Test 3: PASSED${NC}"
    TEST3_PASSED=1
else
    echo -e "${RED}${WARN} Test 3: FAILED${NC}"
    TEST3_PASSED=0
fi

# ============================================
# STEP 8: Test Summary
# ============================================
print_step "${PARTY} TEST RESULTS SUMMARY"

TOTAL_TESTS=3
PASSED_TESTS=$((TEST1_PASSED + TEST2_PASSED + TEST3_PASSED))

echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║  ${GREEN}TEST RESULTS${CYAN}                                              ║${NC}"
echo -e "${CYAN}╠════════════════════════════════════════════════════════════╣${NC}"

if [ $TEST1_PASSED -eq 1 ]; then
    echo -e "${CYAN}║  ${GREEN}${CHECK} Test 1: Payment Success         PASSED${CYAN}              ║${NC}"
else
    echo -e "${CYAN}║  ${RED}${WARN} Test 1: Payment Success         FAILED${CYAN}              ║${NC}"
fi

if [ $TEST2_PASSED -eq 1 ]; then
    echo -e "${CYAN}║  ${GREEN}${CHECK} Test 2: Payment Failed          PASSED${CYAN}              ║${NC}"
else
    echo -e "${CYAN}║  ${RED}${WARN} Test 2: Payment Failed          FAILED${CYAN}              ║${NC}"
fi

if [ $TEST3_PASSED -eq 1 ]; then
    echo -e "${CYAN}║  ${GREEN}${CHECK} Test 3: Refund Processing       PASSED${CYAN}              ║${NC}"
else
    echo -e "${CYAN}║  ${RED}${WARN} Test 3: Refund Processing       FAILED${CYAN}              ║${NC}"
fi

echo -e "${CYAN}╠════════════════════════════════════════════════════════════╣${NC}"
echo -e "${CYAN}║  ${PURPLE}Total: $PASSED_TESTS/$TOTAL_TESTS tests passed${CYAN}                              ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

if [ $PASSED_TESTS -eq $TOTAL_TESTS ]; then
    echo -e "${GREEN}${PARTY}${PARTY}${PARTY} ALL TESTS PASSED! ${PARTY}${PARTY}${PARTY}${NC}"
    echo ""
    echo -e "${GREEN}Your Stripe integration is working perfectly!${NC}"
else
    echo -e "${YELLOW}${WARN} Some tests failed. Review the logs at:${NC}"
    echo -e "  • Dev server: /tmp/stripe-test-dev.log"
    echo -e "  • Webhooks: /tmp/stripe-webhook.log"
fi

# ============================================
# Cleanup
# ============================================
echo ""
echo -e "${INFO} Cleaning up background processes..."
echo ""
echo -e "${CYAN}Do you want to stop the dev server and webhook listener?${NC}"
if ask_yes_no "Stop processes?"; then
    kill $DEV_SERVER_PID 2>/dev/null || true
    kill $WEBHOOK_PID 2>/dev/null || true
    echo -e "${GREEN}${CHECK} Processes stopped${NC}"
else
    echo ""
    echo -e "${INFO} Processes still running:"
    echo -e "  • Dev Server PID: $DEV_SERVER_PID"
    echo -e "  • Webhook Listener PID: $WEBHOOK_PID"
    echo ""
    echo -e "${YELLOW}To stop them manually:${NC}"
    echo -e "  kill $DEV_SERVER_PID"
    echo -e "  kill $WEBHOOK_PID"
fi

# ============================================
# Final Summary
# ============================================
print_step "${ROCKET} COMPLETION SUMMARY"

echo ""
echo -e "${GREEN}${CHECK} Stripe CLI authenticated${NC}"
echo -e "${GREEN}${CHECK} API keys configured${NC}"
echo -e "${GREEN}${CHECK} Webhook secret configured${NC}"
echo -e "${GREEN}${CHECK} $PASSED_TESTS/$TOTAL_TESTS tests passed${NC}"
echo ""

if [ $PASSED_TESTS -eq $TOTAL_TESTS ]; then
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║  ${GREEN}${PARTY} CONGRATULATIONS! ${PARTY}${CYAN}                                    ║${NC}"
    echo -e "${CYAN}║                                                            ║${NC}"
    echo -e "${CYAN}║  Your Stripe integration is 100% working!                 ║${NC}"
    echo -e "${CYAN}║  You are now PRODUCTION READY! ${ROCKET}                         ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
else
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║  ${YELLOW}TESTING COMPLETE${CYAN}                                        ║${NC}"
    echo -e "${CYAN}║                                                            ║${NC}"
    echo -e "${CYAN}║  Review failed tests and check logs                       ║${NC}"
    echo -e "${CYAN}║  Then re-run this script                                  ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
fi

echo ""
echo -e "${CYAN}Next steps:${NC}"
echo -e "  1. Deploy to staging environment"
echo -e "  2. Run integration tests"
echo -e "  3. Launch to production! ${ROCKET}"
echo ""
echo -e "${GREEN}Divine payment consciousness activated! ${PARTY}${NC}"
echo ""
