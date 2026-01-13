#!/bin/bash
# Quick Start Script for Database Optimization
# Usage: ./optimize.sh [check|apply|test|compare|help]

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Banner
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║    Farmers Market Platform - Database Optimization Tool       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if DATABASE_URL is set
check_database_url() {
    if [ -z "$DATABASE_URL" ]; then
        echo -e "${YELLOW}⚠️  DATABASE_URL not found in environment${NC}"
        echo ""
        echo "Loading from .env.local..."

        if [ -f .env.local ]; then
            export $(grep -v '^#' .env.local | grep DATABASE_URL | xargs)
            if [ -z "$DATABASE_URL" ]; then
                echo -e "${RED}❌ DATABASE_URL not found in .env.local${NC}"
                echo ""
                echo "Please add DATABASE_URL to .env.local or set it in your environment:"
                echo ""
                echo "  export DATABASE_URL='postgresql://username:password@host:port/database'"
                echo ""
                exit 1
            fi
            echo -e "${GREEN}✅ Loaded DATABASE_URL from .env.local${NC}"
        else
            echo -e "${RED}❌ .env.local not found${NC}"
            echo ""
            echo "Please create .env.local with DATABASE_URL or set it in your environment:"
            echo ""
            echo "  export DATABASE_URL='postgresql://username:password@host:port/database'"
            echo ""
            exit 1
        fi
    else
        echo -e "${GREEN}✅ DATABASE_URL is configured${NC}"
    fi
    echo ""
}

# Function to run readiness check
run_check() {
    echo -e "${BLUE}🔍 Running database readiness check...${NC}"
    echo ""
    npx tsx scripts/check-db-readiness.ts
}

# Function to apply optimizations
run_apply() {
    echo -e "${BLUE}🚀 Applying database optimizations...${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  This will create indexes and modify database objects${NC}"
    echo -e "${YELLOW}   All changes are safe and reversible${NC}"
    echo ""
    read -p "Continue? (y/N): " -n 1 -r
    echo ""

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npx tsx scripts/apply-db-optimizations.ts
        echo ""
        echo -e "${GREEN}✅ Optimization complete!${NC}"
        echo ""
        echo "Next steps:"
        echo "  1. Run performance test: ./optimize.sh test"
        echo "  2. Compare results: ./optimize.sh compare"
        echo ""
    else
        echo -e "${YELLOW}Cancelled by user${NC}"
        exit 0
    fi
}

# Function to run performance test
run_test() {
    echo -e "${BLUE}📊 Running performance inspection...${NC}"
    echo ""
    npm run inspect:v4:quick -- --mock-auth
    echo ""
    echo -e "${GREEN}✅ Inspection complete!${NC}"
    echo ""
    echo "Results saved to: inspection-reports/"
    echo "Compare with baseline: ./optimize.sh compare"
    echo ""
}

# Function to compare performance
run_compare() {
    echo -e "${BLUE}📈 Comparing performance metrics...${NC}"
    echo ""
    npx tsx scripts/compare-performance.ts --latest
}

# Function to show help
show_help() {
    echo "Usage: ./optimize.sh [command]"
    echo ""
    echo "Commands:"
    echo "  check      Run database readiness check (Step 1)"
    echo "  apply      Apply database optimizations (Step 2)"
    echo "  test       Run performance inspection (Step 3)"
    echo "  compare    Compare before/after performance (Step 4)"
    echo "  all        Run all steps (check → apply → test → compare)"
    echo "  help       Show this help message"
    echo ""
    echo "Quick Start:"
    echo "  1. Ensure DATABASE_URL is set in .env.local"
    echo "  2. Run: ./optimize.sh all"
    echo ""
    echo "Step-by-Step:"
    echo "  ./optimize.sh check    # Verify database readiness"
    echo "  ./optimize.sh apply    # Apply optimizations"
    echo "  ./optimize.sh test     # Run performance test"
    echo "  ./optimize.sh compare  # View improvements"
    echo ""
    echo "Documentation:"
    echo "  - Full guide: SETUP_DATABASE_OPTIMIZATION.md"
    echo "  - Action plan: NEXT_STEPS_ACTION_PLAN.md"
    echo "  - Technical details: DB_OPTIMIZATION_STATUS.md"
    echo ""
}

# Function to run all steps
run_all() {
    echo -e "${BLUE}🚀 Running complete optimization workflow...${NC}"
    echo ""

    # Step 1: Check
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}   STEP 1: Database Readiness Check${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
    run_check

    echo ""
    echo -e "${GREEN}✅ Readiness check passed${NC}"
    echo ""
    read -p "Continue to Step 2? (y/N): " -n 1 -r
    echo ""

    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Workflow stopped by user${NC}"
        exit 0
    fi

    # Step 2: Apply
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}   STEP 2: Apply Database Optimizations${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
    npx tsx scripts/apply-db-optimizations.ts

    echo ""
    echo -e "${GREEN}✅ Optimizations applied${NC}"
    echo ""
    read -p "Continue to Step 3? (y/N): " -n 1 -r
    echo ""

    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Workflow stopped by user${NC}"
        echo ""
        echo "You can run performance test later with: ./optimize.sh test"
        exit 0
    fi

    # Step 3: Test
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}   STEP 3: Performance Testing${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
    run_test

    # Step 4: Compare
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}   STEP 4: Performance Comparison${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
    run_compare

    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║              OPTIMIZATION WORKFLOW COMPLETE! 🎉                ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Review comparison results above"
    echo "  2. Integrate optimized repository (see NEXT_STEPS_ACTION_PLAN.md)"
    echo "  3. Deploy to staging for testing"
    echo "  4. Monitor performance metrics"
    echo ""
}

# Main script logic
check_database_url

case "${1:-help}" in
    check)
        run_check
        ;;
    apply)
        run_apply
        ;;
    test)
        run_test
        ;;
    compare)
        run_compare
        ;;
    all)
        run_all
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac
