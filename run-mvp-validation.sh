#!/bin/bash

# ============================================================================
# 🎯 MVP VALIDATION BOT LAUNCHER
# ============================================================================
#
# This script runs the comprehensive MVP validation bot to verify all
# critical features are working before production launch.
#
# Usage:
#   ./run-mvp-validation.sh           (runs in headless mode)
#   ./run-mvp-validation.sh headed    (runs with visible browser)
#   ./run-mvp-validation.sh help      (shows this help)
#
# ============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

echo ""
echo "╔════════════════════════════════════════════════════════════════════════╗"
echo "║                   🎯 MVP VALIDATION BOT LAUNCHER                        ║"
echo "║                 Farmers Market Platform - MVP Checker                   ║"
echo "╚════════════════════════════════════════════════════════════════════════╝"
echo ""

# Check for help flag
if [ "$1" = "help" ]; then
    echo "📖 HELP - MVP Validation Bot"
    echo ""
    echo "This bot validates all MVP requirements:"
    echo "  ✅ Farmers can register and get approved"
    echo "  ✅ Farmers can add/edit products with photos"
    echo "  ✅ Customers can browse and search products"
    echo "  ✅ Customers can add to cart and checkout"
    echo "  ✅ Payments process successfully via Stripe"
    echo "  ✅ Orders appear in farmer dashboard"
    echo "  ✅ Email notifications work"
    echo "  ✅ Admin can manage farms and orders"
    echo "  ✅ Site works on mobile phones"
    echo "  ✅ All critical security measures in place"
    echo "  ✅ Terms of service and privacy policy published"
    echo "  ✅ Customer support email set up"
    echo ""
    echo "USAGE:"
    echo "  ./run-mvp-validation.sh           Run in headless mode"
    echo "  ./run-mvp-validation.sh headed    Run with visible browser for debugging"
    echo ""
    echo "REQUIREMENTS:"
    echo "  - Server must be running on http://localhost:3001"
    echo "  - Database must be set up and accessible"
    echo "  - Admin account must exist with credentials in .env"
    echo ""
    echo "REPORTS:"
    echo "  - Screenshots: ./mvp-validation-screenshots/"
    echo "  - Reports: ./mvp-validation-reports/"
    echo ""
    exit 0
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ ERROR: Node.js is not installed or not in PATH${NC}"
    echo ""
    echo "Please install Node.js from https://nodejs.org/"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Node.js found${NC}"
node --version
echo ""

# Check if npm packages are installed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  WARNING: node_modules not found${NC}"
    echo ""
    echo "Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ ERROR: Failed to install dependencies${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Check if server is running
echo "🔍 Checking if server is running..."
if ! curl -s http://localhost:3001 > /dev/null 2>&1; then
    echo ""
    echo -e "${YELLOW}⚠️  WARNING: Server does not appear to be running on http://localhost:3001${NC}"
    echo ""
    echo "Please start the development server first:"
    echo "  npm run dev"
    echo ""
    echo "Or start the production server:"
    echo "  npm run build"
    echo "  npm start"
    echo ""
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        echo -e "${RED}❌ Validation cancelled${NC}"
        exit 0
    fi
else
    echo -e "${GREEN}✅ Server is running on http://localhost:3001${NC}"
fi

echo ""
echo "════════════════════════════════════════════════════════════════════════"
echo ""

# Run the MVP validation bot
if [ "$1" = "headed" ]; then
    echo -e "${CYAN}🚀 Starting MVP validation bot with VISIBLE BROWSER...${NC}"
    echo "   You will see the browser performing tests"
    echo ""
    export HEADLESS=false
    npm run bot:mvp:headed
    BOT_EXIT_CODE=$?
else
    echo -e "${CYAN}🚀 Starting MVP validation bot in HEADLESS MODE...${NC}"
    echo "   Running tests in background..."
    echo ""
    npm run bot:mvp
    BOT_EXIT_CODE=$?
fi

echo ""
echo "════════════════════════════════════════════════════════════════════════"
echo ""

# Check the exit code
if [ $BOT_EXIT_CODE -eq 0 ]; then
    echo ""
    echo "╔════════════════════════════════════════════════════════════════════════╗"
    echo "║                                                                        ║"
    echo "║                    🎉 MVP VALIDATION COMPLETE! 🎉                      ║"
    echo "║                                                                        ║"
    echo "║                   ✅ ALL CHECKS PASSED - READY TO LAUNCH!              ║"
    echo "║                                                                        ║"
    echo "╚════════════════════════════════════════════════════════════════════════╝"
    echo ""
    echo -e "${GREEN}📊 View detailed reports in: mvp-validation-reports/${NC}"
    echo -e "${GREEN}📸 View screenshots in: mvp-validation-screenshots/${NC}"
    echo ""
    echo -e "${BOLD}${GREEN}🚀 Your MVP is ready for production deployment!${NC}"
    echo ""
else
    echo ""
    echo "╔════════════════════════════════════════════════════════════════════════╗"
    echo "║                                                                        ║"
    echo "║                    ⚠️  MVP VALIDATION INCOMPLETE  ⚠️                    ║"
    echo "║                                                                        ║"
    echo "║                   ❌ SOME CHECKS FAILED - REVIEW NEEDED                ║"
    echo "║                                                                        ║"
    echo "╚════════════════════════════════════════════════════════════════════════╝"
    echo ""
    echo -e "${YELLOW}📊 Review detailed reports in: mvp-validation-reports/${NC}"
    echo -e "${YELLOW}📸 View failure screenshots in: mvp-validation-screenshots/${NC}"
    echo ""
    echo -e "${RED}🔧 Fix the issues and run the validation again.${NC}"
    echo ""
fi

exit $BOT_EXIT_CODE
