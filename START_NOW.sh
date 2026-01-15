#!/bin/bash

# 🚀 START NOW - Quick Execution Script
# Farmers Market Platform - Path to 100%

set -e

echo "🌾 Farmers Market Platform - FINISH THIS! 🚜"
echo "=================================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Progress tracking
PHASE_1_COMPLETE=2
PHASE_1_TOTAL=8
TOTAL_COMPLETE=2
TOTAL_TASKS=32

echo -e "${BLUE}📊 Current Progress:${NC}"
echo -e "   Phase 1: ${PHASE_1_COMPLETE}/${PHASE_1_TOTAL} tasks (25%)"
echo -e "   Overall: ${TOTAL_COMPLETE}/${TOTAL_TASKS} tasks (6%)"
echo ""

echo -e "${GREEN}✅ Completed Tasks:${NC}"
echo "   [x] 1.1 - Fix Vercel Deployment"
echo "   [x] 1.4 - Security Audit (Source Maps)"
echo ""

echo -e "${YELLOW}🔥 NEXT ACTIONS (Do Now!):${NC}"
echo ""
echo -e "${RED}1. FIX SENTRY CONFIGURATION (30 min)${NC}"
echo "   - Go to: https://sentry.io/settings/account/api/auth-tokens/"
echo "   - Create token with: project:releases, org:read"
echo "   - Run: vercel env add SENTRY_AUTH_TOKEN production"
echo "   - Test: export SENTRY_AUTH_TOKEN='your-token' && npm run build"
echo ""

echo -e "${RED}2. VERIFY TEST SUITE (3 hours)${NC}"
echo "   - Run: npm test"
echo "   - Fix any failures"
echo "   - Run: npm run test:coverage"
echo "   - Document results"
echo ""

echo -e "${RED}3. ENVIRONMENT AUDIT (2 hours)${NC}"
echo "   - Review all env vars"
echo "   - Update .env.example"
echo "   - Create docs/ENVIRONMENT_VARIABLES.md"
echo ""

echo "=================================================="
echo ""
echo -e "${BLUE}📖 Read These Files:${NC}"
echo "   1. FINISH_THIS.md        - Complete execution plan"
echo "   2. TODO.md               - Full task list (32 tasks)"
echo "   3. PHASE_1_TRACKER.md    - Phase 1 progress tracker"
echo ""

echo -e "${BLUE}🎯 Today's Goal:${NC}"
echo "   Complete Phase 1 (all 8 tasks) = 25% overall progress"
echo ""

echo -e "${BLUE}🎊 After Phase 1:${NC}"
echo "   - Deployment working ✅"
echo "   - Tests verified ✅"
echo "   - Critical blockers removed ✅"
echo "   - Ready for Phase 2 ✅"
echo ""

# Interactive menu
echo "=================================================="
echo -e "${YELLOW}What do you want to do?${NC}"
echo ""
echo "1) Start Task 1.2 - Fix Sentry (30 min)"
echo "2) Start Task 1.3 - Verify Tests (3 hours)"
echo "3) View full TODO list"
echo "4) View Phase 1 tracker"
echo "5) Run tests now"
echo "6) Check deployment status"
echo "7) Exit"
echo ""

read -p "Enter choice [1-7]: " choice

case $choice in
  1)
    echo ""
    echo -e "${GREEN}🔥 TASK 1.2: FIX SENTRY CONFIGURATION${NC}"
    echo ""
    echo "Step 1: Get Sentry auth token"
    echo "   → Open: https://sentry.io/settings/account/api/auth-tokens/"
    echo "   → Click: 'Create New Token'"
    echo "   → Scopes: project:releases, org:read"
    echo "   → Copy the token"
    echo ""
    echo "Step 2: Add to Vercel"
    read -p "Have you copied your Sentry token? (y/n): " has_token
    if [ "$has_token" = "y" ]; then
      echo "   → Running: vercel env add SENTRY_AUTH_TOKEN production"
      vercel env add SENTRY_AUTH_TOKEN production
    else
      echo "   → Please get your token first, then run this script again"
      exit 0
    fi
    echo ""
    echo "Step 3: Test locally"
    read -p "Enter your Sentry token to test: " token
    export SENTRY_AUTH_TOKEN="$token"
    echo "   → Running: npm run build"
    npm run build
    echo ""
    echo -e "${GREEN}✅ Task 1.2 Complete!${NC}"
    echo "   → Update PHASE_1_TRACKER.md"
    echo "   → Commit changes: git add . && git commit -m 'fix: configure Sentry auth token'"
    echo "   → Push: git push"
    ;;
  2)
    echo ""
    echo -e "${GREEN}🔥 TASK 1.3: VERIFY TEST SUITE${NC}"
    echo ""
    echo "Running full test suite... (this may take several minutes)"
    echo ""
    npm test | tee test-results.txt
    echo ""
    echo "Generating coverage report..."
    npm run test:coverage
    echo ""
    echo -e "${GREEN}✅ Tests complete!${NC}"
    echo "   → Review test-results.txt for details"
    echo "   → Check coverage/index.html for coverage report"
    echo "   → Document any failures in TEST_RESULTS.md"
    ;;
  3)
    echo ""
    cat TODO.md | less
    ;;
  4)
    echo ""
    cat PHASE_1_TRACKER.md | less
    ;;
  5)
    echo ""
    echo "Running tests..."
    npm test
    ;;
  6)
    echo ""
    echo "Checking deployment status..."
    vercel ls
    echo ""
    echo "Latest deployment logs:"
    vercel logs --follow
    ;;
  7)
    echo ""
    echo -e "${BLUE}Thanks for checking in! Remember:${NC}"
    echo "   - Read FINISH_THIS.md for the complete plan"
    echo "   - Start with Task 1.2 (Sentry configuration)"
    echo "   - Focus on one task at a time"
    echo "   - Update trackers as you go"
    echo "   - Commit and push often"
    echo ""
    echo -e "${GREEN}LET'S FINISH THIS! 🚀${NC}"
    exit 0
    ;;
  *)
    echo ""
    echo "Invalid choice. Please run the script again."
    exit 1
    ;;
esac

echo ""
echo "=================================================="
echo -e "${GREEN}🎉 Great work! Keep going!${NC}"
echo ""
echo "Next steps:"
echo "   1. Update PHASE_1_TRACKER.md"
echo "   2. Commit your changes"
echo "   3. Move to the next task"
echo ""
echo -e "${BLUE}Progress: ${TOTAL_COMPLETE}/${TOTAL_TASKS} tasks → 100%${NC}"
echo ""
echo "🌾 Let's reach 100%! 🚜"
echo "=================================================="
