#!/bin/bash
# 🧹 Repository Cleanup Script
# Farmers Market Platform - Automated Cleanup
# Version: 1.0
# Last Updated: December 22, 2024
#
# Purpose: Remove generated files, build artifacts, logs, and temporary files
# Usage: npm run clean  OR  bash scripts/cleanup-repo.sh
# Safety: Only removes generated/temporary files - never source code

# Don't exit on error - continue cleanup even if some operations fail
set +e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🧹 Farmers Market Platform - Repository Cleanup         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to print status
print_status() {
    echo -e "${GREEN}✅${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️${NC}  $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ️${NC}  $1"
}

# Function to safely remove directory
remove_dir() {
    if [ -d "$1" ]; then
        rm -rf "$1"
        print_status "Removed: $1"
        return 0
    else
        print_info "Already clean: $1"
        return 1
    fi
}

# Function to safely remove files
remove_files() {
    local pattern="$1"
    local description="$2"
    local count=$(find . -name "$pattern" -type f -not -path "*/node_modules/*" 2>/dev/null | wc -l)

    if [ "$count" -gt 0 ]; then
        find . -name "$pattern" -type f -not -path "*/node_modules/*" -delete 2>/dev/null
        print_status "Removed $count $description file(s)"
    else
        print_info "No $description files to remove"
    fi
}

# Start cleanup
echo -e "${YELLOW}Starting cleanup process...${NC}"
echo ""

# ═══════════════════════════════════════════════════════════
# 🏗️  Build Artifacts
# ═══════════════════════════════════════════════════════════
echo -e "${BLUE}[1/7] Removing build artifacts...${NC}"

remove_dir ".next"
remove_dir "out"
remove_dir "build"
remove_dir "dist"
remove_dir ".turbo"
remove_dir ".jest-cache"
remove_dir "coverage"

echo ""

# ═══════════════════════════════════════════════════════════
# 📊 Log Files
# ═══════════════════════════════════════════════════════════
echo -e "${BLUE}[2/7] Removing log files...${NC}"

remove_dir "logs"
remove_dir "cleanup-logs"
remove_files "*.log" "log"
remove_files "npm-debug.log*" "npm debug"
remove_files "yarn-debug.log*" "yarn debug"
remove_files "yarn-error.log*" "yarn error"
remove_files "pnpm-debug.log*" "pnpm debug"

echo ""

# ═══════════════════════════════════════════════════════════
# 🗑️  Temporary Files
# ═══════════════════════════════════════════════════════════
echo -e "${BLUE}[3/7] Removing temporary files...${NC}"

remove_files "*.tmp" "temporary"
remove_files "*.temp" "temp"
remove_files "*.bak" "backup"
remove_files "*.old" "old"
remove_files "*.backup" "backup"
remove_files "*.swp" "swap"
remove_files "*.swo" "swap"
remove_files "*.swn" "swap"
remove_files "*~" "tilde backup"

echo ""

# ═══════════════════════════════════════════════════════════
# 💻 OS-Specific Files
# ═══════════════════════════════════════════════════════════
echo -e "${BLUE}[4/7] Removing OS-specific files...${NC}"

# macOS
remove_files ".DS_Store" "macOS metadata"
remove_files ".DS_Store?" "macOS metadata"
remove_files "._*" "macOS resource fork"
remove_files ".AppleDouble" "macOS"
remove_files ".LSOverride" "macOS"

# Windows
remove_files "Thumbs.db" "Windows thumbnail"
remove_files "Thumbs.db:encryptable" "Windows thumbnail"
remove_files "ehthumbs.db" "Windows thumbnail"
remove_files "desktop.ini" "Windows"

# Linux
remove_files ".directory" "Linux"
remove_files ".Trash-*" "Linux trash"

echo ""

# ═══════════════════════════════════════════════════════════
# 🎨 Cache Files
# ═══════════════════════════════════════════════════════════
echo -e "${BLUE}[5/7] Removing cache files...${NC}"

remove_dir ".cache"
remove_dir ".eslintcache"
remove_dir ".stylelintcache"
remove_files "*.tsbuildinfo" "TypeScript build info"

echo ""

# ═══════════════════════════════════════════════════════════
# 🧪 Test Artifacts
# ═══════════════════════════════════════════════════════════
echo -e "${BLUE}[6/7] Removing test artifacts...${NC}"

remove_dir "test-results"
remove_dir "playwright-report"
remove_dir ".nyc_output"

echo ""

# ═══════════════════════════════════════════════════════════
# 🗄️  Database Files (Development Only)
# ═══════════════════════════════════════════════════════════
echo -e "${BLUE}[7/7] Removing development database files...${NC}"

if [ -f "prisma/dev.db" ]; then
    print_warning "Found development database (prisma/dev.db)"
    print_info "Not removing - delete manually if needed"
fi

remove_files "*.db-journal" "database journal"

echo ""

# ═══════════════════════════════════════════════════════════
# 📊 Summary
# ═══════════════════════════════════════════════════════════
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ Cleanup Complete!                                     ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

print_status "Build artifacts removed"
print_status "Log files removed"
print_status "Temporary files removed"
print_status "OS-specific files removed"
print_status "Cache files removed"
print_status "Test artifacts removed"

echo ""
print_info "Repository is now clean and optimized! 🌾✨"
echo ""

# Optional: Show disk space saved
if command -v du &> /dev/null; then
    echo -e "${BLUE}Repository size after cleanup:${NC}"
    du -sh . 2>/dev/null || echo "Unable to calculate size"
    echo ""
fi

# Exit successfully
exit 0
