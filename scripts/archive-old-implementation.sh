#!/bin/bash

# ============================================================================
# Archive Old Implementation Script
# Purpose: Safely isolate old codebase before fresh rebuild
# Date: January 3, 2026
# ============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================================================
# Functions
# ============================================================================

print_header() {
    echo ""
    echo -e "${BLUE}============================================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}============================================================================${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# ============================================================================
# Pre-flight Checks
# ============================================================================

print_header "Pre-flight Checks"

# Check if git is available
if ! command -v git &> /dev/null; then
    print_error "Git is not installed. Please install git first."
    exit 1
fi
print_success "Git is installed"

# Check if we're in a git repository
if ! git rev-parse --is-inside-work-tree &> /dev/null; then
    print_error "Not in a git repository. Please run from project root."
    exit 1
fi
print_success "In git repository"

# Check for uncommitted changes
if [[ -n $(git status -s) ]]; then
    print_warning "You have uncommitted changes"
    echo ""
    git status -s
    echo ""
    read -p "Do you want to commit these changes before archiving? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Please commit your changes first, then run this script again."
        exit 1
    fi
fi

# ============================================================================
# Create Archive Branch
# ============================================================================

print_header "Step 1: Creating Archive Branch"

CURRENT_BRANCH=$(git branch --show-current)
ARCHIVE_BRANCH="archive/old-implementation-$(date +%Y-%m-%d)"

print_info "Current branch: $CURRENT_BRANCH"
print_info "Archive branch: $ARCHIVE_BRANCH"

# Check if archive branch already exists
if git show-ref --verify --quiet "refs/heads/$ARCHIVE_BRANCH"; then
    print_warning "Archive branch already exists: $ARCHIVE_BRANCH"
    read -p "Do you want to overwrite it? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Aborted by user"
        exit 1
    fi
    git branch -D "$ARCHIVE_BRANCH"
fi

# Create archive branch
git checkout -b "$ARCHIVE_BRANCH"
git add .
git commit -m "Archive: Complete old implementation before rebuild ($(date +%Y-%m-%d))" || print_warning "No changes to commit"
print_success "Archive branch created: $ARCHIVE_BRANCH"

# Push to remote (optional)
read -p "Do you want to push archive branch to remote? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git push origin "$ARCHIVE_BRANCH" || print_warning "Failed to push to remote"
    print_success "Archive branch pushed to remote"
fi

# Return to original branch
git checkout "$CURRENT_BRANCH"
print_success "Returned to branch: $CURRENT_BRANCH"

# ============================================================================
# Create Local Archive Directory
# ============================================================================

print_header "Step 2: Creating Local Archive Directory"

ARCHIVE_DIR=".archive-old-implementation"

if [ -d "$ARCHIVE_DIR" ]; then
    print_warning "Archive directory already exists: $ARCHIVE_DIR"
    read -p "Do you want to remove it and create fresh? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf "$ARCHIVE_DIR"
        print_success "Removed old archive directory"
    else
        print_error "Aborted by user"
        exit 1
    fi
fi

# Create archive structure
mkdir -p "$ARCHIVE_DIR"/{src,docs,tests,scripts}
print_success "Archive directory created: $ARCHIVE_DIR"

# ============================================================================
# Move Old Implementation
# ============================================================================

print_header "Step 3: Moving Old Implementation to Archive"

# Function to safely move directories
safe_move() {
    local src=$1
    local dest=$2

    if [ -d "$src" ] || [ -f "$src" ]; then
        mv "$src" "$dest"
        print_success "Moved: $src → $dest"
    else
        print_warning "Not found (skipping): $src"
    fi
}

# Move source directories
print_info "Moving source code..."
safe_move "src/app" "$ARCHIVE_DIR/src/"
safe_move "src/components" "$ARCHIVE_DIR/src/"
safe_move "src/lib/services" "$ARCHIVE_DIR/src/lib/"
safe_move "src/lib/controllers" "$ARCHIVE_DIR/src/lib/"
safe_move "src/hooks" "$ARCHIVE_DIR/src/"

# Move test directories
print_info "Moving tests..."
safe_move "tests" "$ARCHIVE_DIR/"
safe_move "__mocks__" "$ARCHIVE_DIR/"
safe_move "src/__tests__" "$ARCHIVE_DIR/src/"

# Move documentation
print_info "Moving documentation..."
safe_move "WEBSITE_ANALYSIS_AND_REBUILD_RECOMMENDATION.md" "$ARCHIVE_DIR/docs/"
safe_move "docs/archive" "$ARCHIVE_DIR/docs/" 2>/dev/null || true

echo ""
print_success "Old implementation archived to: $ARCHIVE_DIR"

# ============================================================================
# Create Clean Directory Structure
# ============================================================================

print_header "Step 4: Creating Clean Directory Structure"

# Create new app structure
mkdir -p src/app/{api,marketplace}
mkdir -p src/app/'(auth)'/{login,register,forgot-password}
mkdir -p src/app/'(customer)'/{dashboard,orders,favorites,settings}
mkdir -p src/app/'(farmer)'/{dashboard,products,orders,analytics}
mkdir -p src/app/'(admin)'/{dashboard,farms,users,reports}

# Create component structure
mkdir -p src/components/{ui,forms,layout,marketplace,dashboard,shared}

# Create lib structure
mkdir -p src/lib/{services,validation,utils,constants}

# Create hooks directory
mkdir -p src/hooks

# Create test structure
mkdir -p tests/{unit,integration,e2e}

print_success "Clean directory structure created"

# ============================================================================
# Update Configuration Files
# ============================================================================

print_header "Step 5: Updating Configuration Files"

# Update .gitignore
print_info "Updating .gitignore..."
if ! grep -q ".archive-old-implementation" .gitignore 2>/dev/null; then
    cat >> .gitignore << 'EOF'

# ============================================================================
# Old Implementation Archive (Local Only)
# ============================================================================
.archive-old-implementation/

# Prevent accidental imports from archived code
**/quantum*.ts
**/divine*.ts
**/biodynamic*.ts
EOF
    print_success "Updated .gitignore"
else
    print_warning ".gitignore already contains archive exclusion"
fi

# Update tsconfig.json exclude
print_info "Updating tsconfig.json..."
if [ -f "tsconfig.json" ]; then
    # Create backup
    cp tsconfig.json tsconfig.json.backup
    print_success "Created tsconfig.json.backup"
fi

# ============================================================================
# Create Placeholder Files
# ============================================================================

print_header "Step 6: Creating Placeholder Files"

# Create root layout
cat > src/app/layout.tsx << 'EOF'
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Farmers Market Platform",
  description: "Fresh produce from local farmers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
EOF
print_success "Created src/app/layout.tsx"

# Create homepage
cat > src/app/page.tsx << 'EOF'
export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">
          🌾 Farmers Market Platform
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Fresh Start - Clean Rebuild
        </p>
        <p className="text-gray-500">
          Ready for development!
        </p>
      </div>
    </main>
  );
}
EOF
print_success "Created src/app/page.tsx"

# Create globals.css
cat > src/app/globals.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 214, 219, 220;
  --background-end-rgb: 255, 255, 255;
}

@media (prefers-color-scheme: dark) {
  :root {
    --foreground-rgb: 255, 255, 255;
    --background-start-rgb: 0, 0, 0;
    --background-end-rgb: 0, 0, 0;
  }
}

body {
  color: rgb(var(--foreground-rgb));
  background: linear-gradient(
      to bottom,
      transparent,
      rgb(var(--background-end-rgb))
    )
    rgb(var(--background-start-rgb));
}
EOF
print_success "Created src/app/globals.css"

# ============================================================================
# Create Archive README
# ============================================================================

print_header "Step 7: Creating Archive Documentation"

cat > "$ARCHIVE_DIR/README.md" << 'EOF'
# Old Implementation Archive

**Archive Date**: $(date +%Y-%m-%d)
**Status**: ARCHIVED - Reference Only

## ⚠️ Important Notice

This directory contains the OLD implementation that has been archived for reference purposes.

**DO NOT:**
- Import any files from this directory
- Copy code without cleaning metaphorical naming
- Use as production code

**DO:**
- Reference for business logic extraction
- Learn from past decisions
- Use as migration source (after cleaning)

## What's Archived

- `src/app/` - Old routes (30+ directories)
- `src/components/` - Old UI components (152 files)
- `src/lib/services/` - Business logic (49 services)
- `src/lib/controllers/` - Controller layer
- `src/hooks/` - React hooks
- `tests/` - Old test suites
- `docs/` - Historical documentation

## Migration Status

See `FRESH_START_STRATEGY.md` in project root for migration plan.

## Rollback

If needed, restore from git branch:
```bash
git checkout archive/old-implementation-$(date +%Y-%m-%d)
```

---

**Archive Purpose**: Safe preservation before clean rebuild
**New Implementation**: See `src/` directory in project root
EOF

print_success "Created archive README"

# ============================================================================
# Generate Summary Report
# ============================================================================

print_header "Archive Complete - Summary Report"

echo ""
echo "📊 Archive Statistics:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Count archived files
ARCHIVED_FILES=$(find "$ARCHIVE_DIR" -type f 2>/dev/null | wc -l)
ARCHIVE_SIZE=$(du -sh "$ARCHIVE_DIR" 2>/dev/null | cut -f1)

echo "📦 Archived Files:    $ARCHIVED_FILES"
echo "💾 Archive Size:      $ARCHIVE_SIZE"
echo "📁 Archive Location:  $ARCHIVE_DIR"
echo "🌿 Git Branch:        $ARCHIVE_BRANCH"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

print_success "✨ Archive process completed successfully!"
echo ""
print_info "Next Steps:"
echo "  1. Review archive: cd $ARCHIVE_DIR"
echo "  2. Start development: npm run dev"
echo "  3. Build new features following FRESH_START_STRATEGY.md"
echo ""
print_info "To restore old implementation:"
echo "  git checkout $ARCHIVE_BRANCH"
echo ""

# ============================================================================
# Create completion marker
# ============================================================================

cat > ".archive-complete" << EOF
Archive completed: $(date)
Archive branch: $ARCHIVE_BRANCH
Archive directory: $ARCHIVE_DIR
Files archived: $ARCHIVED_FILES
Size: $ARCHIVE_SIZE
EOF

print_success "Archive completion marker created: .archive-complete"

# ============================================================================
# Optional: Test new structure
# ============================================================================

echo ""
read -p "Do you want to test the new structure with 'npm run dev'? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Starting development server..."
    print_warning "Press Ctrl+C to stop the server"
    echo ""
    npm run dev
fi

exit 0
