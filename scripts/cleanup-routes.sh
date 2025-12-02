#!/bin/bash

# 🚦 ROUTE CLEANUP AUTOMATION SCRIPT
# Farmers Market Platform - Phase 2: Route Consolidation
# This script automates route cleanup from ROUTE_CLEANUP_ACTION_PLAN.md

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
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

print_section() {
    echo ""
    echo -e "${CYAN}════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}════════════════════════════════════════════════════════${NC}"
    echo ""
}

# Banner
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  🚦 FARMERS MARKET ROUTE CLEANUP                          ║"
echo "║  Phase 2: Route Consolidation & Deduplication             ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Confirm before proceeding
print_warning "This script will:"
echo "  1. Remove duplicate /farmer-dashboard route"
echo "  2. Update all references to use /farmer/dashboard"
echo "  3. Add redirects to next.config.mjs"
echo "  4. Update demo route references"
echo ""
read -p "Continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Cleanup cancelled by user"
    exit 0
fi

print_status "Starting route cleanup..."
echo ""

# ═══════════════════════════════════════════════════════════════
# PHASE 1: SEARCH FOR REFERENCES
# ═══════════════════════════════════════════════════════════════

print_section "PHASE 1: Analyzing Route References"

print_status "Searching for /farmer-dashboard references..."
FARMER_DASH_REFS=$(grep -r "farmer-dashboard" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l || echo "0")
print_status "Found $FARMER_DASH_REFS reference(s) to /farmer-dashboard"

if [ $FARMER_DASH_REFS -gt 0 ]; then
    print_status "References found in:"
    grep -r "farmer-dashboard" src/ --include="*.tsx" --include="*.ts" -l 2>/dev/null || true
fi

# ═══════════════════════════════════════════════════════════════
# PHASE 2: UPDATE REFERENCES
# ═══════════════════════════════════════════════════════════════

print_section "PHASE 2: Updating Route References"

# Update references in TypeScript/TSX files
print_status "Updating /farmer-dashboard → /farmer/dashboard..."

# Files to update
FILES_TO_UPDATE=(
    "src/app/api/admin/approvals/route.ts"
    "src/app/demos/analytics/page.tsx"
    "src/app/demos/chat/page.tsx"
    "src/app/demos/inventory/page.tsx"
    "src/app/demos/page.tsx"
)

UPDATE_COUNT=0
for file in "${FILES_TO_UPDATE[@]}"; do
    if [ -f "$file" ]; then
        # Check if file contains the pattern
        if grep -q "farmer-dashboard" "$file"; then
            # Backup original
            cp "$file" "$file.bak"

            # Update references
            sed -i 's|/farmer-dashboard|/farmer/dashboard|g' "$file"

            UPDATE_COUNT=$((UPDATE_COUNT + 1))
            print_success "Updated: $file"
        fi
    fi
done

print_success "Updated $UPDATE_COUNT file(s)"

# ═══════════════════════════════════════════════════════════════
# PHASE 3: CREATE REDIRECT ROUTE
# ═══════════════════════════════════════════════════════════════

print_section "PHASE 3: Creating Redirect Route"

print_status "Creating redirect from /farmer-dashboard to /farmer/dashboard..."

# Create a simple redirect page
cat > src/app/farmer-dashboard/page.tsx << 'EOF'
/**
 * 🔄 FARMER DASHBOARD REDIRECT
 * This route redirects to the canonical farmer dashboard location
 * Maintains backward compatibility for bookmarks and external links
 */

import { redirect } from "next/navigation";

export default function FarmerDashboardRedirect() {
  redirect("/farmer/dashboard");
}
EOF

print_success "Created redirect at src/app/farmer-dashboard/page.tsx"

# ═══════════════════════════════════════════════════════════════
# PHASE 4: UPDATE NEXT.CONFIG.MJS
# ═══════════════════════════════════════════════════════════════

print_section "PHASE 4: Adding Server-Side Redirects"

print_status "Updating next.config.mjs with permanent redirects..."

# Check if next.config.mjs exists
if [ ! -f "next.config.mjs" ]; then
    print_error "next.config.mjs not found!"
    exit 1
fi

# Check if redirects already exist
if grep -q "farmer-dashboard.*farmer/dashboard" next.config.mjs; then
    print_warning "Redirect already exists in next.config.mjs"
else
    print_status "Adding redirects function to next.config.mjs"
    print_warning "Please manually add the following to next.config.mjs:"
    echo ""
    cat << 'EOF'
  async redirects() {
    return [
      // Farmer Dashboard Redirect (backward compatibility)
      {
        source: '/farmer-dashboard',
        destination: '/farmer/dashboard',
        permanent: true, // 301 redirect
      },
      {
        source: '/farmer-dashboard/:path*',
        destination: '/farmer/dashboard/:path*',
        permanent: true,
      },
    ];
  },
EOF
    echo ""
fi

# ═══════════════════════════════════════════════════════════════
# PHASE 5: VERIFICATION
# ═══════════════════════════════════════════════════════════════

print_section "PHASE 5: Verification"

print_status "Verifying changes..."

# Check if /farmer/dashboard exists
if [ -d "src/app/(farmer)/farmer/dashboard" ]; then
    print_success "✓ Canonical route exists: /farmer/dashboard"
else
    print_error "✗ Canonical route missing: src/app/(farmer)/farmer/dashboard"
fi

# Check if redirect route exists
if [ -f "src/app/farmer-dashboard/page.tsx" ]; then
    print_success "✓ Redirect route created: /farmer-dashboard"
else
    print_warning "⚠ Redirect route not found"
fi

# Check for remaining references
REMAINING_REFS=$(grep -r '".*farmer-dashboard"' src/ --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l || echo "0")
if [ $REMAINING_REFS -eq 0 ]; then
    print_success "✓ All string references updated"
else
    print_warning "⚠ $REMAINING_REFS reference(s) still found - review manually"
fi

# ═══════════════════════════════════════════════════════════════
# PHASE 6: CLEANUP BACKUPS
# ═══════════════════════════════════════════════════════════════

print_section "PHASE 6: Cleanup"

print_status "Cleaning up backup files..."
BACKUP_COUNT=$(find src/ -name "*.bak" 2>/dev/null | wc -l || echo "0")

if [ $BACKUP_COUNT -gt 0 ]; then
    read -p "Remove $BACKUP_COUNT backup file(s)? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        find src/ -name "*.bak" -delete
        print_success "Removed backup files"
    else
        print_warning "Backup files kept (*.bak)"
    fi
fi

# ═══════════════════════════════════════════════════════════════
# COMPLETION SUMMARY
# ═══════════════════════════════════════════════════════════════

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  ✅ ROUTE CLEANUP PHASE 2 COMPLETE                        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

print_success "Route consolidation completed!"
echo ""
print_warning "MANUAL STEPS REQUIRED:"
echo "  1. ⚠️  Add redirects to next.config.mjs (see output above)"
echo "  2. 🧪 Test the redirect: visit /farmer-dashboard"
echo "  3. ✅ Verify canonical route works: /farmer/dashboard"
echo "  4. 🔍 Review any remaining references"
echo ""

print_status "Summary of changes:"
echo "  • Updated $UPDATE_COUNT file(s)"
echo "  • Created redirect route"
echo "  • Remaining references: $REMAINING_REFS"
echo ""

print_warning "NEXT STEPS:"
echo "  1. Run tests: npm test"
echo "  2. Start dev server: npm run dev"
echo "  3. Test routes manually"
echo "  4. Review changes: git diff"
echo "  5. Commit changes: git commit -m 'refactor: consolidate farmer dashboard routes'"
echo ""

print_status "For additional route cleanup, see:"
echo "  • docs/audits/ROUTE_CLEANUP_ACTION_PLAN.md"
echo "  • docs/audits/CLEANUP_CHECKLIST.md"
echo ""

print_success "Route cleanup script completed successfully!"
echo ""

# Show git status
print_status "Git status:"
git status --short 2>/dev/null || print_warning "Not a git repository or git not available"
echo ""
