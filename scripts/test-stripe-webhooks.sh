#!/bin/bash
# 🧪 Stripe Webhook Manual Testing Script
# Divine Agricultural Payment Testing Automation
# Version: 1.0

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
STRIPE_CLI="$PROJECT_ROOT/.stripe-cli/stripe"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🌾 Farmers Market Platform - Stripe Webhook Testing  🌾  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if Stripe CLI exists
if [ ! -f "$STRIPE_CLI" ]; then
    echo -e "${RED}❌ Stripe CLI not found at: $STRIPE_CLI${NC}"
    echo -e "${YELLOW}💡 Run: cd '$PROJECT_ROOT' && ./.stripe-cli/stripe --version${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Stripe CLI found: $("$STRIPE_CLI" --version)${NC}"
echo ""

# Function to run a test
run_test() {
    local test_name="$1"
    local event_type="$2"

    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}🧪 TEST: $test_name${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    echo -e "${BLUE}Triggering event: $event_type${NC}"
    if "$STRIPE_CLI" trigger "$event_type"; then
        echo ""
        echo -e "${GREEN}✅ Event triggered successfully${NC}"
        echo -e "${GREEN}   Check Terminal 1 (dev server) for processing logs${NC}"
        echo -e "${GREEN}   Check Terminal 2 (stripe listen) for [200] response${NC}"
    else
        echo ""
        echo -e "${RED}❌ Failed to trigger event${NC}"
        return 1
    fi

    echo ""
    echo -e "${YELLOW}⏱️  Waiting 2 seconds for processing...${NC}"
    sleep 2
    echo ""
}

# Function to test API endpoint
test_api_endpoint() {
    local endpoint="$1"
    local expected="$2"

    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}🔌 API TEST: $endpoint${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    echo -e "${BLUE}Calling: GET http://localhost:3001$endpoint${NC}"

    response=$(curl -s "http://localhost:3001$endpoint")

    if echo "$response" | grep -q "$expected"; then
        echo ""
        echo -e "${GREEN}✅ API endpoint healthy${NC}"
        echo -e "${GREEN}   Response: $response${NC}"
    else
        echo ""
        echo -e "${RED}❌ Unexpected response${NC}"
        echo -e "${RED}   Got: $response${NC}"
        echo -e "${RED}   Expected to contain: $expected${NC}"
        return 1
    fi

    echo ""
}

# Main menu
show_menu() {
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}Select a test to run:${NC}"
    echo ""
    echo -e "  ${GREEN}1${NC}) Health Check - Test webhook endpoint"
    echo -e "  ${GREEN}2${NC}) Payment Success - payment_intent.succeeded"
    echo -e "  ${GREEN}3${NC}) Payment Failed - payment_intent.payment_failed"
    echo -e "  ${GREEN}4${NC}) Refund Processed - charge.refunded"
    echo -e "  ${GREEN}5${NC}) Run All Tests (Sequential)"
    echo -e "  ${GREEN}6${NC}) Create Payment Intent (API Test)"
    echo ""
    echo -e "  ${GREEN}0${NC}) Exit"
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -ne "${YELLOW}Enter your choice [0-6]: ${NC}"
}

# Test: Health Check
test_health_check() {
    test_api_endpoint "/api/webhooks/stripe" "ok"
}

# Test: Payment Success
test_payment_success() {
    run_test "Payment Success Event" "payment_intent.succeeded"
}

# Test: Payment Failed
test_payment_failed() {
    run_test "Payment Failed Event" "payment_intent.payment_failed"
}

# Test: Refund
test_refund() {
    run_test "Refund Processed Event" "charge.refunded"
}

# Test: Create Payment Intent
test_create_payment_intent() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}🔌 API TEST: Create Payment Intent${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    echo -e "${BLUE}Calling: POST http://localhost:3001/api/payments/intent${NC}"
    echo -e "${BLUE}Body: {orderId: 'test-order-123', amount: 50.00, currency: 'usd'}${NC}"
    echo ""

    response=$(curl -s -X POST http://localhost:3001/api/payments/intent \
        -H "Content-Type: application/json" \
        -d '{
            "orderId": "test-order-123",
            "amount": 50.00,
            "currency": "usd"
        }')

    if echo "$response" | grep -q "client_secret"; then
        echo -e "${GREEN}✅ Payment intent created successfully${NC}"
        echo ""
        echo -e "${GREEN}Response (formatted):${NC}"
        echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"
    else
        echo -e "${RED}❌ Failed to create payment intent${NC}"
        echo -e "${RED}   Response: $response${NC}"
        return 1
    fi

    echo ""
}

# Run all tests
run_all_tests() {
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║           🚀 RUNNING ALL TESTS (SEQUENTIAL)  🚀           ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    local failed=0

    # Test 1: Health Check
    if test_health_check; then
        echo -e "${GREEN}✅ TEST 1/5 PASSED: Health Check${NC}"
    else
        echo -e "${RED}❌ TEST 1/5 FAILED: Health Check${NC}"
        ((failed++))
    fi
    echo ""
    sleep 1

    # Test 2: Payment Success
    if test_payment_success; then
        echo -e "${GREEN}✅ TEST 2/5 PASSED: Payment Success${NC}"
    else
        echo -e "${RED}❌ TEST 2/5 FAILED: Payment Success${NC}"
        ((failed++))
    fi
    echo ""
    sleep 2

    # Test 3: Payment Failed
    if test_payment_failed; then
        echo -e "${GREEN}✅ TEST 3/5 PASSED: Payment Failed${NC}"
    else
        echo -e "${RED}❌ TEST 3/5 FAILED: Payment Failed${NC}"
        ((failed++))
    fi
    echo ""
    sleep 2

    # Test 4: Refund
    if test_refund; then
        echo -e "${GREEN}✅ TEST 4/5 PASSED: Refund${NC}"
    else
        echo -e "${RED}❌ TEST 4/5 FAILED: Refund${NC}"
        ((failed++))
    fi
    echo ""
    sleep 2

    # Test 5: Create Payment Intent
    if test_create_payment_intent; then
        echo -e "${GREEN}✅ TEST 5/5 PASSED: Create Payment Intent${NC}"
    else
        echo -e "${RED}❌ TEST 5/5 FAILED: Create Payment Intent${NC}"
        ((failed++))
    fi
    echo ""

    # Summary
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║                   📊 TEST SUMMARY  📊                      ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    local passed=$((5 - failed))
    echo -e "  Total Tests: ${BLUE}5${NC}"
    echo -e "  Passed: ${GREEN}$passed${NC}"
    echo -e "  Failed: ${RED}$failed${NC}"
    echo ""

    if [ $failed -eq 0 ]; then
        echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║         🎉 ALL TESTS PASSED! PRIORITY 2 COMPLETE! 🎉       ║${NC}"
        echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
        return 0
    else
        echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${RED}║     ⚠️  SOME TESTS FAILED - CHECK LOGS FOR DETAILS  ⚠️     ║${NC}"
        echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
        return 1
    fi
}

# Check prerequisites
check_prerequisites() {
    echo -e "${YELLOW}🔍 Checking prerequisites...${NC}"
    echo ""

    # Check if dev server is running
    if ! curl -s http://localhost:3001/api/webhooks/stripe > /dev/null 2>&1; then
        echo -e "${RED}❌ Dev server not running on http://localhost:3001${NC}"
        echo ""
        echo -e "${YELLOW}📋 Prerequisites:${NC}"
        echo -e "  1. Terminal 1: ${BLUE}npm run dev:omen${NC}"
        echo -e "  2. Terminal 2: ${BLUE}./.stripe-cli/stripe listen --forward-to localhost:3001/api/webhooks/stripe${NC}"
        echo -e "  3. Update STRIPE_WEBHOOK_SECRET in .env.local"
        echo -e "  4. Restart dev server"
        echo ""
        echo -e "${YELLOW}Then run this script again!${NC}"
        echo ""
        exit 1
    fi

    echo -e "${GREEN}✅ Dev server is running${NC}"
    echo ""
}

# Main script
main() {
    check_prerequisites

    while true; do
        show_menu
        read choice
        echo ""

        case $choice in
            1)
                test_health_check
                ;;
            2)
                test_payment_success
                ;;
            3)
                test_payment_failed
                ;;
            4)
                test_refund
                ;;
            5)
                run_all_tests
                ;;
            6)
                test_create_payment_intent
                ;;
            0)
                echo -e "${BLUE}👋 Goodbye! Happy testing!${NC}"
                echo ""
                exit 0
                ;;
            *)
                echo -e "${RED}❌ Invalid choice. Please enter 0-6.${NC}"
                echo ""
                ;;
        esac

        echo ""
        echo -e "${YELLOW}Press Enter to continue...${NC}"
        read
        clear
    done
}

# Run main function
main
