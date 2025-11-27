#!/bin/bash

###############################################################################
# 🌾 DIVINE REPOSITORY CLEANUP SCRIPT
# Comprehensive cleanup for Farmers Market Platform
# Removes outdated files, test artifacts, and build caches
###############################################################################

set -e

echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║   🌾 DIVINE REPOSITORY CLEANUP - COMPREHENSIVE                     ║"
echo "║   Farmers Market Platform - Repository Maintenance                 ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Track what we're doing
CLEANED_FILES=0
CLEANED_DIRS=0
FREED_SPACE=0

# Function to safely remove file
remove_file() {
    if [ -f "$1" ]; then
        SIZE=$(du -sk "$1" 2>/dev/null | cut -f1 || echo 0)
        rm -f "$1"
        CLEANED_FILES=$((CLEANED_FILES + 1))
        FREED_SPACE=$((FREED_SPACE + SIZE))
        echo -e "${GREEN}✓${NC} Removed: $1"
    fi
}

# Function to safely remove directory
remove_dir() {
    if [ -d "$1" ]; then
        SIZE=$(du -sk "$1" 2>/dev/null | cut -f1 || echo 0)
        rm -rf "$1"
        CLEANED_DIRS=$((CLEANED_DIRS + 1))
        FREED_SPACE=$((FREED_SPACE + SIZE))
        echo -e "${GREEN}✓${NC} Removed directory: $1"
    fi
}

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Phase 1: Build Artifacts & Caches${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Next.js build artifacts
remove_dir ".next"
remove_dir "out"
remove_dir "dist"
remove_dir ".vercel"

# Test artifacts
remove_dir "coverage"
remove_dir ".jest-cache"
remove_dir "playwright-report"
remove_dir "test-results"

# Node modules cache (don't remove node_modules itself)
remove_dir "node_modules/.cache"

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Phase 2: Log Files${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Log directories and files
remove_dir "logs"
remove_dir "cleanup-logs"
remove_file "dev-server.log"
remove_file "test-output.log"
remove_file "dev.pid"

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Phase 3: Archive & Old Files${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Archive directory (review before removing)
remove_dir "archive"
remove_dir "docker-exports"
remove_dir "messages"

# Old database files
remove_dir "database"

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Phase 4: Redundant Documentation Files${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Session completion summaries (keep main docs)
remove_file "SESSION_2_COMPLETION_SUMMARY.md"
remove_file "SESSION_3_IMPLEMENTATION_COMPLETE.md"
remove_file "SESSION_3_QUICK_SUMMARY.md"
remove_file "SESSION_4_FINAL_STATUS.md"
remove_file "SESSION_4_PHASE_1_COMPLETE.md"
remove_file "SESSION_4_PHASE_2_COMPLETION_STATUS.md"
remove_file "SESSION_4_PHASE_2_START_HERE.md"
remove_file "SESSION_4_QUICK_SUMMARY.md"
remove_file "SESSION_4_VISUAL_PROGRESS.txt"
remove_file "SESSION_COMPLETE_SUMMARY.md"
remove_file "SESSION_HANDOFF.md"

# Phase completion files
remove_file "PHASE_1_IMPLEMENTATION_COMPLETE.md"
remove_file "PHASE_2_CERTIFICATE.md"
remove_file "PHASE_2_EXECUTIVE_SUMMARY.md"
remove_file "PHASE_2_START_HERE.md"
remove_file "PHASE_2_SUMMARY.txt"
remove_file "PHASE_3_QUICK_REFERENCE.md"
remove_file "PHASE_3_READY_SUMMARY.md"
remove_file "PHASE_3_START_SUMMARY.md"

# Quick start duplicates
remove_file "QUICK-FIX-SUMMARY.txt"
remove_file "QUICK_STATUS_SUMMARY.txt"
remove_file "QUICK-START-AFTER-CLEAN.md"

# Start here duplicates (keep main START-HERE.md and START-HERE-NOW.md)
remove_file "START_HERE_IMPROVEMENTS.md"
remove_file "START_HERE_PHASE_3.md"
remove_file "START_HERE_PHASE_3_SESSION_2.md"
remove_file "START_HERE_PUSH_PR.md"
remove_file "START_HERE_REC_4_5.md"

# Workflow monitoring duplicates
remove_file "WORKFLOW_BOT_ANALYSIS_AND_RECOMMENDATIONS.md"
remove_file "WORKFLOW_BOT_EXECUTIVE_SUMMARY.md"
remove_file "WORKFLOW_BOT_QUICK_FIX_GUIDE.md"
remove_file "WORKFLOW_COMPLETION_SUMMARY.md"
remove_file "WORKFLOW_FIX_STATUS.md"
remove_file "WORKFLOW_MONITORING_REPORT.md"
remove_file "WORKFLOW_MONITORING_STATUS.md"
remove_file "WORKFLOW_MONITORING_SUMMARY.md"

# Monitoring bot duplicates
remove_file "MONITORING_BOT_COMPLETE.md"
remove_file "MONITORING_BOT_EXECUTION_REPORT.md"
remove_file "MONITORING_BOT_SUMMARY.md"

# Test and analysis duplicates
remove_file "TEST_AND_DOCKER_ANALYSIS.md"
remove_file "TEST_FIXES_SUMMARY.md"
remove_file "TEST_SUMMARY_VISUAL.txt"
remove_file "BOT_ANALYSIS_SUMMARY.md"

# Cleanup summaries
remove_file "CLEANUP_COMPLETE_SUMMARY.md"
remove_file "CLEANUP_SUCCESS_SUMMARY.txt"

# Execution reports
remove_file "EXECUTION_COMPLETE.md"
remove_file "FINAL_ANALYSIS_SUMMARY.txt"

# Improvement plans
remove_file "IMPROVEMENT_ACTION_PLAN.md"

# Recommendations duplicates
remove_file "RECOMMENDATIONS_4_5_COMPLETE_SUMMARY.md"
remove_file "RECOMMENDATIONS_4_5_CONTINUED.md"
remove_file "RECOMMENDATIONS_4_5_IMPLEMENTATION_PLAN.md"
remove_file "RECOMMENDATIONS_COMPLETE.md"
remove_file "REC_4_5_QUICK_START.md"

# Docker and deployment duplicates
remove_file "DOCKER_DEPLOYMENT_SUCCESS.md"
remove_file "DOCKER_HUB_PUSH_GUIDE.md"
remove_file "DEPLOYMENT_VISUAL_SUMMARY.txt"

# PR and commit files
remove_file "COMMIT_SUMMARY.md"
remove_file "HOW_TO_PUSH_AND_CREATE_PR.md"
remove_file "PR_TEMPLATE_PRISMA_7.md"
remove_file "PUSH_READY_SUMMARY.md"

# Port and configuration files
remove_file "PORT_3000_QUICK_REFERENCE.md"
remove_file "PORT_UPDATE_PHASE_3_COMPLETE.md"

# Integration and dashboard files
remove_file "INTEGRATION_DASHBOARD.txt"
remove_file "DASHBOARD_QUICK_COMMANDS.md"

# Prisma migration duplicates
remove_file "PRISMA_7_MIGRATION_COMPLETE.md"
remove_file "PRISMA_7_MIGRATION_PLAN.md"
remove_file "WHAT_NEXT_AFTER_PRISMA_7.md"

# Dev environment duplicates
remove_file "DEV-ENVIRONMENT-READY.md"
remove_file "DEV-SETUP-COMPLETE.txt"

# Next steps files
remove_file "NEXT_SESSION_START_HERE.md"
remove_file "NEXT_STEPS_SUMMARY.md"
remove_file "WHATS_NEXT_SESSION.md"

# Quick reference duplicates (keep main QUICK_REFERENCE.md)
remove_file "DOCKER-QUICK-REFERENCE.txt"
remove_file "AUTH-QUICK-REFERENCE.txt"

# Accomplishments and status
remove_file "ACCOMPLISHMENTS.txt"
remove_file "CURRENT_STATUS.txt"

# Quality workflow
remove_file "QUALITY_WORKFLOW_VISUAL.txt"

# Monitoring quick starts (keep main one)
remove_file "QUICK_START_MONITORING.md"
remove_file "MONITORING_QUICK_START.md"
remove_file "QUICK_START_PHASE_2.md"

# TypeScript docs (keep main index)
remove_file "TYPESCRIPT_DOCS_INDEX.md"

# Docker deployment files (keep main ones)
remove_file "DOCKER_DEPLOYMENT_QUICKSTART.md"

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Phase 5: Redundant Scripts${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Old batch and shell scripts
remove_file "CHECK-AUTH.bat"
remove_file "DOCKER-LOGS.bat"
remove_file "DOCKER-SHELL.bat"
remove_file "DOCKER-START.bat"
remove_file "LOGIN.bat"
remove_file "PUSH-TO-DOCKER-HUB.bat"
remove_file "QUICK-FIX-ALL.bat"
remove_file "START-DEV.bat"
remove_file "START.bat"
remove_file "db-setup.bat"
remove_file "dev-setup.bat"
remove_file "setup-database.bat"

# Old PowerShell scripts
remove_file "check-auth.ps1"
remove_file "deploy-docker.ps1"
remove_file "docker-deploy.ps1"
remove_file "docker-deploy-simple.ps1"
remove_file "docker-manager.ps1"
remove_file "docker-start.ps1"
remove_file "optimize-system.ps1"
remove_file "setup-env.ps1"
remove_file "setup-vercel-env.ps1"
remove_file "start-dev-simple.ps1"
remove_file "test-ollama.ps1"

# Old shell scripts (keep main ones)
remove_file "cleanup-quick-start.sh"
remove_file "cleanup-repository.sh"
remove_file "dev-setup.sh"
remove_file "dev-stop.sh"
remove_file "docker-start-dev.sh"
remove_file "docker-start-prod.sh"
remove_file "quick-cleanup.sh"
remove_file "archive-historical-docs.ps1"

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Phase 6: Backup Files${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Backup files
remove_file "prisma.config.ts.backup"
remove_file "jest.config.clean.js"

# Test files
remove_file "test-debug.js"

# Other C# files (wrong project?)
remove_file "Program.cs"

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Phase 7: Empty/Unused Directories${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Remove empty directories
find . -type d -empty -not -path "./node_modules/*" -not -path "./.git/*" -delete 2>/dev/null || true

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Phase 8: Git Cleanup (Optional)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if command -v git &> /dev/null; then
    echo -e "${YELLOW}Running git garbage collection...${NC}"
    git gc --prune=now --aggressive 2>/dev/null || echo -e "${YELLOW}⚠ Git cleanup skipped${NC}"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║                      ✨ CLEANUP COMPLETE ✨                         ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}📊 CLEANUP STATISTICS:${NC}"
echo -e "   ${GREEN}✓${NC} Files removed: ${GREEN}$CLEANED_FILES${NC}"
echo -e "   ${GREEN}✓${NC} Directories removed: ${GREEN}$CLEANED_DIRS${NC}"
echo -e "   ${GREEN}✓${NC} Space freed: ~${GREEN}$((FREED_SPACE / 1024))${NC} MB"
echo ""
echo -e "${BLUE}📚 PRESERVED DOCUMENTATION:${NC}"
echo -e "   ${GREEN}✓${NC} README.md"
echo -e "   ${GREEN}✓${NC} DEPLOY.md"
echo -e "   ${GREEN}✓${NC} DOCUMENTATION_INDEX.md"
echo -e "   ${GREEN}✓${NC} DOCUMENTATION_MASTER_INDEX.md"
echo -e "   ${GREEN}✓${NC} .cursorrules (Divine Rules)"
echo -e "   ${GREEN}✓${NC} .github/instructions/ (All 16 divine instructions)"
echo ""
echo -e "${YELLOW}📝 NEXT STEPS:${NC}"
echo -e "   1. Run: ${BLUE}npm install${NC} (if needed)"
echo -e "   2. Run: ${BLUE}npm run test${NC} (verify tests pass)"
echo -e "   3. Run: ${BLUE}npm run lint${NC} (check code quality)"
echo -e "   4. Run: ${BLUE}git status${NC} (review changes)"
echo ""
echo -e "${GREEN}🌾 Repository is now clean and optimized!${NC}"
echo ""
