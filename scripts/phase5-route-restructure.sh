#!/bin/bash

# 🚀 Phase 5: Route Restructure Automation Script
# Farmers Market Platform - Dependency Modernization Project
#
# This script automates the restructuring of Next.js route groups to
# eliminate parallel route conflicts introduced by Next.js 16 stricter validation
#
# Usage: bash scripts/phase5-route-restructure.sh

set -e  # Exit on error

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
CROSS="❌"
WARN="⚠️"
INFO="ℹ️"
ROCKET="🚀"
SPARKLES="✨"
FARM="🌾"

# Function to print colored output
print_status() {
    echo -e "${GREEN}${CHECK}${NC} $1"
}

print_error() {
    echo -e "${RED}${CROSS}${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}${WARN}${NC} $1"
}

print_info() {
    echo -e "${CYAN}${INFO}${NC} $1"
}

print_header() {
    echo -e "\n${PURPLE}═══════════════════════════════════════════════════════${NC}"
    echo -e "${PURPLE}${FARM} $1${NC}"
    echo -e "${PURPLE}═══════════════════════════════════════════════════════${NC}\n"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Must be run from project root directory"
    exit 1
fi

if [ ! -d "src/app" ]; then
    print_error "src/app directory not found"
    exit 1
fi

print_header "Phase 5: Route Restructure - Starting Divine Agricultural Migration"

# Step 1: Create backup
print_header "Step 1: Creating Backup"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_BRANCH="backup/pre-route-restructure-${TIMESTAMP}"

print_info "Creating backup branch: ${BACKUP_BRANCH}"
git checkout -b "${BACKUP_BRANCH}" 2>/dev/null || print_warning "Branch may already exist or git not initialized"
git add -A 2>/dev/null || true
git commit -m "Backup before Phase 5 route restructure" 2>/dev/null || print_warning "Nothing to commit or git not initialized"

print_info "Creating backup of src/app directory"
cp -r src/app "src/app.backup.${TIMESTAMP}"
print_status "Backup created at: src/app.backup.${TIMESTAMP}"

# Step 2: Create temporary directories for reorganization
print_header "Step 2: Preparing Temporary Directories"
mkdir -p temp_restructure/admin
mkdir -p temp_restructure/customer
mkdir -p temp_restructure/farmer
mkdir -p temp_restructure/public
mkdir -p temp_restructure/auth
print_status "Temporary directories created"

# Step 3: Move Admin routes
print_header "Step 3: Restructuring Admin Routes"
if [ -d "src/app/(admin)" ]; then
    print_info "Moving (admin) → admin"
    cp -r "src/app/(admin)"/* temp_restructure/admin/ 2>/dev/null || print_warning "No files in (admin)"

    # Move monitoring into admin
    if [ -d "src/app/(monitoring)" ]; then
        print_info "Moving (monitoring) → admin/monitoring"
        mkdir -p temp_restructure/admin/monitoring
        cp -r "src/app/(monitoring)"/* temp_restructure/admin/monitoring/ 2>/dev/null || print_warning "No files in (monitoring)"
    fi
    print_status "Admin routes restructured"
else
    print_warning "(admin) directory not found"
fi

# Step 4: Move Customer routes
print_header "Step 4: Restructuring Customer Routes"
if [ -d "src/app/(customer)" ]; then
    print_info "Moving (customer) → customer"
    cp -r "src/app/(customer)"/* temp_restructure/customer/ 2>/dev/null || print_warning "No files in (customer)"
    print_status "Customer routes restructured"
else
    print_warning "(customer) directory not found"
fi

# Step 5: Move Farmer routes
print_header "Step 5: Restructuring Farmer Routes"
if [ -d "src/app/(farmer)" ]; then
    print_info "Moving (farmer) → farmer"
    cp -r "src/app/(farmer)"/* temp_restructure/farmer/ 2>/dev/null || print_warning "No files in (farmer)"
    print_status "Farmer routes restructured"
else
    print_warning "(farmer) directory not found"
fi

# Step 6: Move Public routes to root
print_header "Step 6: Restructuring Public Routes (Root Level)"
if [ -d "src/app/(public)" ]; then
    print_info "Moving (public) → root level"
    cp -r "src/app/(public)"/* temp_restructure/public/ 2>/dev/null || print_warning "No files in (public)"
    print_status "Public routes moved to root"
else
    print_warning "(public) directory not found"
fi

# Step 7: Keep Auth routes as-is (no conflict)
print_header "Step 7: Preserving Auth Routes"
if [ -d "src/app/(auth)" ]; then
    print_info "Keeping (auth) as route group (no conflicts)"
    cp -r "src/app/(auth)" temp_restructure/auth/ 2>/dev/null || print_warning "No files in (auth)"
    print_status "Auth routes preserved"
else
    print_warning "(auth) directory not found"
fi

# Step 8: Backup and remove old route groups
print_header "Step 8: Removing Old Route Groups"
print_info "Removing old route group directories"
rm -rf "src/app/(admin)" 2>/dev/null || true
rm -rf "src/app/(customer)" 2>/dev/null || true
rm -rf "src/app/(farmer)" 2>/dev/null || true
rm -rf "src/app/(monitoring)" 2>/dev/null || true
# Note: We'll handle (public) files carefully to not delete root files

# Remove public route group but preserve other root files
if [ -d "src/app/(public)" ]; then
    rm -rf "src/app/(public)" 2>/dev/null || true
fi

print_status "Old route groups removed"

# Step 9: Move restructured files to final locations
print_header "Step 9: Moving Restructured Routes to Final Locations"

print_info "Installing admin routes"
mv temp_restructure/admin src/app/admin

print_info "Installing customer routes"
mv temp_restructure/customer src/app/customer

print_info "Installing farmer routes"
mv temp_restructure/farmer src/app/farmer

print_info "Installing auth routes"
if [ -d "temp_restructure/auth/(auth)" ]; then
    mv temp_restructure/auth/(auth) "src/app/(auth)"
fi

print_info "Installing public routes at root level"
# Copy public files to root, but don't overwrite existing root files
cp -rn temp_restructure/public/* src/app/ 2>/dev/null || true

print_status "All routes moved to final locations"

# Step 10: Clean up temporary directory
print_info "Cleaning up temporary files"
rm -rf temp_restructure
print_status "Cleanup complete"

# Step 11: Update path references in files
print_header "Step 10: Updating Path References"

print_info "This step requires careful manual review or advanced sed operations"
print_warning "The following files likely need updates:"
echo ""
echo "  1. middleware.ts - Update path matchers"
echo "  2. Navigation components - Update href attributes"
echo "  3. All Link components - Search for href=\"/(admin)\" patterns"
echo "  4. All redirect() calls - Update redirect paths"
echo "  5. All router.push() calls - Update navigation paths"
echo "  6. Test files - Update route references"
echo ""

print_info "Creating path update reference file..."
cat > ROUTE_UPDATE_GUIDE.md << 'EOF'
# Route Update Reference Guide

## Path Mapping

### Admin Routes
- `/(admin)` → `/admin`
- `/(admin)/farms` → `/admin/farms`
- `/(admin)/orders` → `/admin/orders`
- `/(admin)/products` → `/admin/products`
- `/(admin)/settings` → `/admin/settings`
- `/(admin)/users` → `/admin/users`
- `/(admin)/financial` → `/admin/financial`
- `/(monitoring)` → `/admin/monitoring`

### Customer Routes
- `/(customer)/dashboard` → `/customer/dashboard`
- `/(customer)/orders` → `/customer/orders`
- `/(customer)/cart` → `/customer/cart`
- `/(customer)/checkout` → `/customer/checkout`
- `/(customer)/marketplace` → `/customer/marketplace`

### Farmer Routes
- `/(farmer)/dashboard` → `/farmer/dashboard`
- `/(farmer)/orders` → `/farmer/orders`
- `/(farmer)/products` → `/farmer/products`
- `/(farmer)/settings` → `/farmer/settings`
- `/(farmer)/analytics` → `/farmer/analytics`
- `/(farmer)/finances` → `/farmer/finances`
- `/(farmer)/payouts` → `/farmer/payouts`

### Public Routes (at root)
- `/(public)/farms` → `/farms`
- `/(public)/products` → `/products`
- `/(public)/about` → `/about`
- `/(public)/contact` → `/contact`
- `/(public)/help` → `/help`
- `/(public)/marketplace` → `/marketplace`
- etc.

### Auth Routes (unchanged)
- `/(auth)/login` → `/(auth)/login` (no change)
- `/(auth)/signup` → `/(auth)/signup` (no change)
- etc.

## Files to Update Manually

### 1. middleware.ts
```typescript
export const config = {
  matcher: [
    '/admin/:path*',
    '/farmer/:path*',
    '/customer/:path*',
    '/api/:path*',
  ],
};
```

### 2. Navigation Components
Search and replace in all navigation files:
- `href="/(admin)/` → `href="/admin/`
- `href="/(customer)/` → `href="/customer/`
- `href="/(farmer)/` → `href="/farmer/`
- `href="/(public)/` → `href="/`

### 3. Redirect Functions
Update all redirect calls:
- `redirect('/(admin)/dashboard')` → `redirect('/admin')`
- `redirect('/(customer)/dashboard')` → `redirect('/customer/dashboard')`
- `redirect('/(farmer)/dashboard')` → `redirect('/farmer/dashboard')`

### 4. Search & Replace Commands

```bash
# Admin routes
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's|href="/(admin)/|href="/admin/|g' {} +
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' "s|href='/(admin)/|href='/admin/|g" {} +
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's|redirect("/(admin)/|redirect("/admin/|g' {} +
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' "s|redirect('/(admin)/|redirect('/admin/|g" {} +

# Customer routes
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's|href="/(customer)/|href="/customer/|g' {} +
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' "s|href='/(customer)/|href='/customer/|g" {} +
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's|redirect("/(customer)/|redirect("/customer/|g' {} +
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' "s|redirect('/(customer)/|redirect('/customer/|g" {} +

# Farmer routes
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's|href="/(farmer)/|href="/farmer/|g' {} +
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' "s|href='/(farmer)/|href='/farmer/|g" {} +
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's|redirect("/(farmer)/|redirect("/farmer/|g' {} +
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' "s|redirect('/(farmer)/|redirect('/farmer/|g" {} +

# Public routes
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's|href="/(public)/|href="/|g' {} +
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' "s|href='/(public)/|href='/|g" {} +
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's|redirect("/(public)/|redirect("/|g' {} +
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' "s|redirect('/(public)/|redirect('/|g" {} +
```

Note: Remove the `''` after `-i` on Linux (it's for macOS BSD sed)

## Testing Checklist

After updates:
- [ ] Run `npm run type-check`
- [ ] Run `npm run lint`
- [ ] Run `npm run build`
- [ ] Test all navigation links
- [ ] Test authentication redirects
- [ ] Test role-based routing
- [ ] Run full test suite
EOF

print_status "Route update guide created: ROUTE_UPDATE_GUIDE.md"

# Step 12: Verify directory structure
print_header "Step 11: Verifying New Structure"
echo ""
echo "New directory structure:"
echo ""
tree -L 2 src/app 2>/dev/null || find src/app -maxdepth 2 -type d | sort

# Step 13: Summary
print_header "🎉 Route Restructure Complete!"

echo ""
echo "${GREEN}${SPARKLES} Summary of Changes:${NC}"
echo ""
echo "  ${CHECK} Moved (admin) → admin/"
echo "  ${CHECK} Moved (customer) → customer/"
echo "  ${CHECK} Moved (farmer) → farmer/"
echo "  ${CHECK} Moved (public) → root level"
echo "  ${CHECK} Moved (monitoring) → admin/monitoring"
echo "  ${CHECK} Kept (auth) as route group"
echo ""
echo "${YELLOW}${WARN} Manual Updates Required:${NC}"
echo ""
echo "  1. Review and update middleware.ts"
echo "  2. Update all href attributes in components"
echo "  3. Update redirect() calls"
echo "  4. Update router.push() calls"
echo "  5. Update test files"
echo ""
echo "  ${INFO} See ROUTE_UPDATE_GUIDE.md for detailed instructions"
echo ""
echo "${CYAN}${ROCKET} Next Steps:${NC}"
echo ""
echo "  1. npm run type-check"
echo "  2. npm run lint"
echo "  3. npm run build"
echo "  4. Review ROUTE_UPDATE_GUIDE.md"
echo "  5. Update code references"
echo "  6. Run full test suite"
echo ""
echo "${GREEN}${FARM} Backup created at: src/app.backup.${TIMESTAMP}${NC}"
echo "${GREEN}${FARM} Backup branch: ${BACKUP_BRANCH}${NC}"
echo ""
echo "${PURPLE}═══════════════════════════════════════════════════════${NC}"
echo "${PURPLE}${SPARKLES} Route restructure phase complete! ${SPARKLES}${NC}"
echo "${PURPLE}═══════════════════════════════════════════════════════${NC}"
echo ""

exit 0
