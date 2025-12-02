#!/bin/bash

# 🧹 DOCUMENTATION CLEANUP SCRIPT
# Farmers Market Platform - Documentation Reorganization
# This script automates the PHASE 1 cleanup from DEEP_CLEANUP_ANALYSIS_REPORT.md

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to create directory if it doesn't exist
create_dir() {
    if [ ! -d "$1" ]; then
        mkdir -p "$1"
        print_success "Created directory: $1"
    else
        print_status "Directory already exists: $1"
    fi
}

# Function to move files with pattern
move_files() {
    local pattern=$1
    local destination=$2
    local description=$3

    print_status "Moving $description..."

    local count=0
    for file in $pattern; do
        if [ -f "$file" ]; then
            mv "$file" "$destination/"
            count=$((count + 1))
        fi
    done

    if [ $count -gt 0 ]; then
        print_success "Moved $count file(s) to $destination"
    else
        print_warning "No files found matching pattern: $pattern"
    fi
}

# Banner
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  🧹 FARMERS MARKET DOCUMENTATION CLEANUP                  ║"
echo "║  Phase 1: Documentation Reorganization                     ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Confirm before proceeding
read -p "This will reorganize 100+ markdown files. Continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Cleanup cancelled by user"
    exit 0
fi

print_status "Starting documentation cleanup..."
echo ""

# Step 1: Create directory structure
print_status "Creating documentation directory structure..."
create_dir "docs/phases"
create_dir "docs/status"
create_dir "docs/testing"
create_dir "docs/implementation"
create_dir "docs/audits"
create_dir "docs/quick-reference"
create_dir "docs/deployment"
create_dir "docs/database"
create_dir "docs/typescript"
create_dir "docs/payments"
create_dir "docs/progress"
create_dir "docs/priorities"
create_dir "docs/project"
create_dir "docs/ai"
create_dir "docs/archive"
echo ""

# Step 2: Move Phase Documentation
print_status "=== PHASE DOCUMENTATION ==="
move_files "PHASE_*.md" "docs/phases" "phase documentation files"
echo ""

# Step 3: Move Status Reports
print_status "=== STATUS REPORTS ==="
move_files "*_STATUS*.md" "docs/status" "status report files"
move_files "*_SUMMARY*.md" "docs/status" "summary files"
move_files "START*.md" "docs/status" "start guide files"
move_files "CONTINUE*.md" "docs/status" "continuation files"
move_files "ACTION*.md" "docs/status" "action plan files"
move_files "STATUS_NOW.md" "docs/status" "current status file"
move_files "DO_THIS_NOW.md" "docs/status" "immediate action file"
move_files "SUCCESS_SUMMARY.md" "docs/status" "success summary file"
echo ""

# Step 4: Move Testing Documentation
print_status "=== TESTING DOCUMENTATION ==="
move_files "TEST*.md" "docs/testing" "test documentation files"
move_files "*TESTING*.md" "docs/testing" "testing guide files"
move_files "READY_TO_TEST_NOW.md" "docs/testing" "test readiness file"
move_files "SKIPPED_TESTS_ANALYSIS.md" "docs/testing" "skipped tests analysis"
echo ""

# Step 5: Move Implementation Guides
print_status "=== IMPLEMENTATION GUIDES ==="
move_files "IMPLEMENTATION*.md" "docs/implementation" "implementation files"
move_files "TIER_*.md" "docs/implementation" "tier files"
move_files "WIREFRAME*.md" "docs/implementation" "wireframe files"
echo ""

# Step 6: Move Audits & Analysis
print_status "=== AUDIT & ANALYSIS ==="
move_files "AUDIT*.md" "docs/audits" "audit files"
move_files "CLEANUP*.md" "docs/audits" "cleanup plan files"
move_files "*REVIEW*.md" "docs/audits" "review files"
move_files "REPOSITORY*.md" "docs/audits" "repository analysis files"
move_files "WEBSITE_STRUCTURE_ANALYSIS.md" "docs/audits" "website analysis file"
move_files "DEEP_CLEANUP_ANALYSIS_REPORT.md" "docs/audits" "cleanup analysis report"
echo ""

# Step 7: Move Quick References
print_status "=== QUICK REFERENCE ==="
move_files "QUICK*.md" "docs/quick-reference" "quick reference files"
move_files "FIXES*.md" "docs/quick-reference" "fixes reference files"
echo ""

# Step 8: Move Deployment Documentation
print_status "=== DEPLOYMENT ==="
move_files "DEPLOY*.md" "docs/deployment" "deployment files"
move_files "URGENT_FIXES*.md" "docs/deployment" "urgent fixes files"
move_files "FINAL_COMMANDS.md" "docs/deployment" "final commands file"
echo ""

# Step 9: Move Database Documentation
print_status "=== DATABASE & PRISMA ==="
move_files "PRISMA_*.md" "docs/database" "Prisma documentation files"
move_files "DATABASE_*.md" "docs/database" "database guide files"
echo ""

# Step 10: Move TypeScript Documentation
print_status "=== TYPESCRIPT ==="
move_files "*TYPESCRIPT*.md" "docs/typescript" "TypeScript documentation files"
echo ""

# Step 11: Move Payment Integration
print_status "=== PAYMENT INTEGRATION ==="
move_files "PAYMENT*.md" "docs/payments" "payment documentation files"
move_files "STRIPE*.md" "docs/payments" "Stripe documentation files"
echo ""

# Step 12: Move Weekly Progress
print_status "=== WEEKLY PROGRESS ==="
move_files "WEEK_*.md" "docs/progress" "weekly progress files"
move_files "SPRINT_*.md" "docs/progress" "sprint files"
echo ""

# Step 13: Move Priority Tracking
print_status "=== PRIORITY TRACKING ==="
move_files "PRIORITY_*.md" "docs/priorities" "priority tracking files"
echo ""

# Step 14: Move Project Management
print_status "=== PROJECT MANAGEMENT ==="
move_files "PROJECT*.md" "docs/project" "project management files"
move_files "NEXT_PHASE*.md" "docs/project" "next phase files"
move_files "NEXT_SESSION*.md" "docs/project" "next session files"
move_files "NEXT_STEPS*.md" "docs/project" "next steps files"
echo ""

# Step 15: Move AI Documentation
print_status "=== AI & PERPLEXITY ==="
move_files "PERPLEXITY*.md" "docs/ai" "Perplexity documentation files"
move_files "*OPENAI*.md" "docs/ai" "OpenAI documentation files"
echo ""

# Step 16: Move Session Documentation
print_status "=== SESSION REPORTS ==="
move_files "SESSION*.md" "docs/status" "session report files"
echo ""

# Step 17: Archive old README variants
print_status "=== README VARIANTS ==="
if [ -f "README_FIXES.md" ]; then
    mv "README_FIXES.md" "docs/archive/"
    print_success "Archived README_FIXES.md"
fi
if [ -f "README_PHASE2_COMPLETE.md" ]; then
    mv "README_PHASE2_COMPLETE.md" "docs/archive/"
    print_success "Archived README_PHASE2_COMPLETE.md"
fi
if [ -f "README_PHASE3_COMPLETE.md" ]; then
    mv "README_PHASE3_COMPLETE.md" "docs/archive/"
    print_success "Archived README_PHASE3_COMPLETE.md"
fi
echo ""

# Step 18: Clean up temporary files
print_status "=== TEMPORARY FILES ==="
if [ -f "prisma-version-before.txt" ]; then
    rm -f "prisma-version-before.txt"
    print_success "Removed prisma-version-before.txt"
fi
if [ -f "prisma-version-after.txt" ]; then
    rm -f "prisma-version-after.txt"
    print_success "Removed prisma-version-after.txt"
fi
if [ -f "TESTING_SESSION_PROGRESS.txt" ]; then
    mv "TESTING_SESSION_PROGRESS.txt" "docs/testing/"
    print_success "Moved TESTING_SESSION_PROGRESS.txt to docs/testing/"
fi
echo ""

# Step 19: Create index files for each directory
print_status "Creating index files for documentation directories..."

cat > docs/INDEX.md << 'EOF'
# 📚 Documentation Index
## Farmers Market Platform Documentation

Last Updated: $(date +%Y-%m-%d)

## Directory Structure

### 📁 Quick Navigation

- **[Phases](./phases/)** - Development phase documentation
- **[Status](./status/)** - Status reports and progress tracking
- **[Testing](./testing/)** - Test documentation and guides
- **[Implementation](./implementation/)** - Implementation guides and checklists
- **[Audits](./audits/)** - Code audits and analysis reports
- **[Quick Reference](./quick-reference/)** - Quick start guides and references
- **[Deployment](./deployment/)** - Deployment guides and checklists
- **[Database](./database/)** - Database and Prisma documentation
- **[TypeScript](./typescript/)** - TypeScript fixes and guides
- **[Payments](./payments/)** - Payment integration documentation
- **[Progress](./progress/)** - Weekly and sprint progress reports
- **[Priorities](./priorities/)** - Priority tracking documents
- **[Project](./project/)** - Project management documentation
- **[AI](./ai/)** - AI integration and Perplexity documentation
- **[Archive](./archive/)** - Archived documentation

## Key Documents

### For Developers
- [Quick Start Guide](./quick-reference/)
- [Development Workflow](../README.md)
- [Testing Guide](./testing/)

### For DevOps
- [Deployment Checklist](./deployment/)
- [Database Setup](./database/)

### For Project Managers
- [Project Status](./status/)
- [Progress Reports](./progress/)

## Contributing to Documentation

Please place new documentation in the appropriate directory:
- Development phases → `/docs/phases/`
- Status updates → `/docs/status/`
- Testing guides → `/docs/testing/`
- etc.

Keep the root directory clean!
EOF

print_success "Created docs/INDEX.md"
echo ""

# Step 20: Update .gitignore for monitoring reports
print_status "Updating .gitignore..."
if ! grep -q "monitoring-reports/" .gitignore 2>/dev/null; then
    echo "" >> .gitignore
    echo "# Monitoring Reports (runtime generated)" >> .gitignore
    echo "monitoring-reports/" >> .gitignore
    print_success "Added monitoring-reports/ to .gitignore"
fi

if ! grep -q ".vs/" .gitignore 2>/dev/null; then
    echo "" >> .gitignore
    echo "# Visual Studio" >> .gitignore
    echo ".vs/" >> .gitignore
    echo "*.slnx" >> .gitignore
    print_success "Added Visual Studio files to .gitignore"
fi
echo ""

# Step 21: Generate summary report
print_status "Generating cleanup summary..."
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  ✅ CLEANUP COMPLETE                                      ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
print_success "Documentation has been reorganized into /docs/ directory"
print_success "All files moved to appropriate subdirectories"
print_success "Index file created at docs/INDEX.md"
print_success ".gitignore updated with new entries"
echo ""
print_warning "NEXT STEPS:"
echo "  1. Review moved files in docs/ directories"
echo "  2. Update internal documentation links"
echo "  3. Update README.md references if needed"
echo "  4. Commit changes with message: 'docs: reorganize documentation structure'"
echo ""
print_status "For detailed analysis, see: docs/audits/DEEP_CLEANUP_ANALYSIS_REPORT.md"
echo ""

# Count remaining markdown files at root
ROOT_MD_COUNT=$(find . -maxdepth 1 -name "*.md" -type f | wc -l)
print_status "Markdown files remaining at root: $ROOT_MD_COUNT"

if [ $ROOT_MD_COUNT -le 5 ]; then
    print_success "✅ Root directory cleanup successful!"
else
    print_warning "⚠️  Review remaining root markdown files"
fi

echo ""
print_status "Cleanup script completed successfully!"
echo ""
