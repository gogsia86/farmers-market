#!/bin/bash
# 04-rollback.sh - Emergency Rollback Script
# Farmers Market Platform - Safe Cleanup Toolkit
# Purpose: Restore repository to pre-cleanup state

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${RED}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${RED}║  Farmers Market Platform - Emergency Rollback         ║${NC}"
echo -e "${RED}║  Safe Cleanup Toolkit v1.0                             ║${NC}"
echo -e "${RED}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Ensure we're in project root
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ ERROR: package.json not found${NC}"
    echo "Please run this script from the project root directory"
    exit 1
fi

# Check if git is available
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ ERROR: git is not installed${NC}"
    echo "This script requires git to perform rollback"
    exit 1
fi

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}❌ ERROR: Not in a git repository${NC}"
    echo "This script can only rollback changes in a git repository"
    exit 1
fi

echo -e "${YELLOW}⚠️  WARNING: This will restore your repository to a previous state${NC}"
echo ""
echo "This script can:"
echo "  1. Restore from a backup branch (created by cleanup script)"
echo "  2. Revert uncommitted changes"
echo "  3. Reset to a specific commit"
echo ""

# Get current branch
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
echo -e "Current branch: ${GREEN}$CURRENT_BRANCH${NC}"
echo ""

# Find backup branches
echo -e "${BLUE}Looking for backup branches...${NC}"
BACKUP_BRANCHES=$(git branch | grep "backup-pre-cleanup" | sed 's/^[* ]*//' || echo "")

if [ -z "$BACKUP_BRANCHES" ]; then
    echo -e "${YELLOW}No backup branches found${NC}"
    echo ""
    HAS_BACKUP=false
else
    echo -e "${GREEN}Found backup branches:${NC}"
    echo "$BACKUP_BRANCHES" | nl
    echo ""
    HAS_BACKUP=true
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD -- 2>/dev/null; then
    UNCOMMITTED_COUNT=$(git status --porcelain | wc -l)
    echo -e "${YELLOW}⚠  You have $UNCOMMITTED_COUNT uncommitted changes${NC}"
    echo ""
    HAS_UNCOMMITTED=true
else
    HAS_UNCOMMITTED=false
fi

# Show rollback options
echo -e "${YELLOW}Rollback Options:${NC}"
echo ""
echo "  1. Restore from backup branch (recommended if available)"
echo "  2. Discard all uncommitted changes (git reset --hard)"
echo "  3. Reset to specific commit"
echo "  4. Stash changes and restore from backup"
echo "  5. Cancel rollback"
echo ""

read -p "Select an option (1-5): " OPTION

case $OPTION in
    1)
        # Restore from backup branch
        if [ "$HAS_BACKUP" = false ]; then
            echo -e "${RED}❌ No backup branches available${NC}"
            echo "Run option 2 or 3 instead"
            exit 1
        fi

        echo ""
        echo -e "${BLUE}Available backup branches:${NC}"
        echo "$BACKUP_BRANCHES" | nl
        echo ""
        read -p "Enter backup branch number: " BACKUP_NUM

        SELECTED_BACKUP=$(echo "$BACKUP_BRANCHES" | sed -n "${BACKUP_NUM}p")

        if [ -z "$SELECTED_BACKUP" ]; then
            echo -e "${RED}❌ Invalid selection${NC}"
            exit 1
        fi

        echo ""
        echo -e "${YELLOW}Selected backup: ${GREEN}$SELECTED_BACKUP${NC}"
        echo ""
        read -p "This will restore your repository to this state. Continue? (yes/no): " CONFIRM

        if [ "$CONFIRM" != "yes" ]; then
            echo -e "${YELLOW}Rollback cancelled${NC}"
            exit 0
        fi

        # Create safety backup of current state
        SAFETY_BACKUP="safety-backup-$(date +%Y%m%d_%H%M%S)"
        echo ""
        echo -e "${BLUE}Creating safety backup of current state: ${GREEN}$SAFETY_BACKUP${NC}"
        git branch "$SAFETY_BACKUP"

        # Restore from backup
        echo -e "${BLUE}Restoring from backup branch...${NC}"
        git checkout "$SELECTED_BACKUP"
        git checkout -b "restored-$(date +%Y%m%d_%H%M%S)"

        echo ""
        echo -e "${GREEN}✅ Repository restored from backup!${NC}"
        echo ""
        echo -e "New branch created with restored state"
        echo -e "Your previous state is saved in: ${GREEN}$SAFETY_BACKUP${NC}"
        echo ""
        echo "Next steps:"
        echo "  1. Verify everything works: ./cleanup-scripts/03-verify.sh"
        echo "  2. If satisfied, merge changes: git checkout $CURRENT_BRANCH && git merge --no-ff restored-*"
        echo "  3. If not satisfied, restore safety backup: git checkout $SAFETY_BACKUP"
        ;;

    2)
        # Discard all uncommitted changes
        echo ""
        echo -e "${RED}⚠️  WARNING: This will permanently discard all uncommitted changes!${NC}"
        echo ""
        read -p "Are you absolutely sure? Type 'DISCARD' to continue: " CONFIRM

        if [ "$CONFIRM" != "DISCARD" ]; then
            echo -e "${YELLOW}Rollback cancelled${NC}"
            exit 0
        fi

        echo ""
        echo -e "${BLUE}Discarding all changes...${NC}"

        # Reset to HEAD
        git reset --hard HEAD

        # Clean untracked files
        echo -e "${BLUE}Cleaning untracked files...${NC}"
        git clean -fd

        echo ""
        echo -e "${GREEN}✅ All uncommitted changes discarded${NC}"
        echo ""
        echo "Repository reset to last commit:"
        git log -1 --oneline
        echo ""
        echo "Next steps:"
        echo "  1. Run: npm install (to restore dependencies if needed)"
        echo "  2. Run: npm run build (to verify everything works)"
        echo "  3. Run: ./cleanup-scripts/03-verify.sh"
        ;;

    3)
        # Reset to specific commit
        echo ""
        echo -e "${BLUE}Recent commits:${NC}"
        git log --oneline -10
        echo ""
        read -p "Enter commit hash to reset to: " COMMIT_HASH

        if ! git cat-file -e "$COMMIT_HASH^{commit}" 2>/dev/null; then
            echo -e "${RED}❌ Invalid commit hash${NC}"
            exit 1
        fi

        echo ""
        echo -e "${YELLOW}Commit details:${NC}"
        git show --stat "$COMMIT_HASH"
        echo ""
        read -p "Reset to this commit? (yes/no): " CONFIRM

        if [ "$CONFIRM" != "yes" ]; then
            echo -e "${YELLOW}Rollback cancelled${NC}"
            exit 0
        fi

        # Create safety backup
        SAFETY_BACKUP="safety-backup-$(date +%Y%m%d_%H%M%S)"
        echo ""
        echo -e "${BLUE}Creating safety backup: ${GREEN}$SAFETY_BACKUP${NC}"
        git branch "$SAFETY_BACKUP"

        # Reset to commit
        echo -e "${BLUE}Resetting to commit $COMMIT_HASH...${NC}"
        git reset --hard "$COMMIT_HASH"

        echo ""
        echo -e "${GREEN}✅ Repository reset to commit $COMMIT_HASH${NC}"
        echo ""
        echo -e "Safety backup created: ${GREEN}$SAFETY_BACKUP${NC}"
        echo ""
        echo "Next steps:"
        echo "  1. Run: npm install"
        echo "  2. Run: npm run build"
        echo "  3. Run: ./cleanup-scripts/03-verify.sh"
        echo "  4. To restore previous state: git reset --hard $SAFETY_BACKUP"
        ;;

    4)
        # Stash and restore from backup
        if [ "$HAS_BACKUP" = false ]; then
            echo -e "${RED}❌ No backup branches available${NC}"
            exit 1
        fi

        if [ "$HAS_UNCOMMITTED" = false ]; then
            echo -e "${YELLOW}No uncommitted changes to stash${NC}"
            echo "Use option 1 instead"
            exit 1
        fi

        echo ""
        echo -e "${BLUE}Stashing current changes...${NC}"
        STASH_MSG="Pre-rollback stash $(date +%Y%m%d_%H%M%S)"
        git stash push -m "$STASH_MSG"

        echo ""
        echo -e "${BLUE}Available backup branches:${NC}"
        echo "$BACKUP_BRANCHES" | nl
        echo ""
        read -p "Enter backup branch number: " BACKUP_NUM

        SELECTED_BACKUP=$(echo "$BACKUP_BRANCHES" | sed -n "${BACKUP_NUM}p")

        if [ -z "$SELECTED_BACKUP" ]; then
            echo -e "${RED}❌ Invalid selection${NC}"
            git stash pop
            exit 1
        fi

        echo ""
        echo -e "${BLUE}Restoring from backup branch...${NC}"
        git checkout "$SELECTED_BACKUP"
        git checkout -b "restored-$(date +%Y%m%d_%H%M%S)"

        echo ""
        echo -e "${GREEN}✅ Repository restored from backup!${NC}"
        echo ""
        echo -e "Your changes were stashed: ${GREEN}$STASH_MSG${NC}"
        echo ""
        echo "Next steps:"
        echo "  1. Verify everything works: ./cleanup-scripts/03-verify.sh"
        echo "  2. To restore your stashed changes: git stash pop"
        echo "  3. To discard stashed changes: git stash drop"
        echo "  4. To list stashes: git stash list"
        ;;

    5)
        echo -e "${YELLOW}Rollback cancelled${NC}"
        exit 0
        ;;

    *)
        echo -e "${RED}❌ Invalid option${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Rollback complete!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

exit 0
