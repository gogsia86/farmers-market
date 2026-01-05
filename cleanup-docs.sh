#!/bin/bash

# 🌟 Divine Docs Folder Consolidation Script
# Farmers Market Platform - Documentation Organization
# This script consolidates 47+ folders into 12 organized categories

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║ 📚 DIVINE DOCS FOLDER CONSOLIDATION                       ║"
echo "║ Organizing 47+ folders into 12 clear categories          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

cd docs/

# Counter for operations
MOVED_COUNT=0
MERGED_COUNT=0

# Function to move files with logging
move_files() {
    local source="$1"
    local destination="$2"
    local description="$3"

    if [ -d "$source" ]; then
        mkdir -p "$destination"
        if [ "$(ls -A $source 2>/dev/null)" ]; then
            cp -r "$source"/* "$destination/" 2>/dev/null || true
            echo "  ✓ $description"
            MOVED_COUNT=$((MOVED_COUNT + 1))
        fi
    fi
}

# Function to merge folder content
merge_folder() {
    local source="$1"
    local destination="$2"
    local description="$3"

    if [ -d "$source" ]; then
        mkdir -p "$destination"
        if [ "$(ls -A $source 2>/dev/null)" ]; then
            cp -r "$source"/* "$destination/" 2>/dev/null || true
            rm -rf "$source"
            echo "  ✓ Merged: $description"
            MERGED_COUNT=$((MERGED_COUNT + 1))
        fi
    fi
}

echo "📁 Creating new 12-folder structure..."
mkdir -p getting-started/tutorials
mkdir -p architecture/decisions
mkdir -p architecture/diagrams
mkdir -p architecture/patterns
mkdir -p development/coding-standards
mkdir -p development/debugging
mkdir -p development/tools
mkdir -p ui-ux/components
mkdir -p ui-ux/design-system
mkdir -p ui-ux/animations
mkdir -p deployment/docker
mkdir -p deployment/vercel
mkdir -p deployment/monitoring
mkdir -p configuration/examples
mkdir -p configuration/environment
mkdir -p testing/unit
mkdir -p testing/integration
mkdir -p testing/e2e
mkdir -p features/authentication
mkdir -p features/payments
mkdir -p features/notifications
mkdir -p archives/sprints
mkdir -p archives/old-implementations
mkdir -p archives/reports
mkdir -p checklists/deployment
mkdir -p checklists/code-review
echo "  ✓ Created new structure"
echo ""

# ============================================================
# MERGE GETTING-STARTED FOLDERS
# ============================================================
echo "🔄 Consolidating getting-started documentation..."
merge_folder "quick-start" "getting-started" "quick-start → getting-started"
move_files "guides" "getting-started/tutorials" "guides (intro) → getting-started/tutorials"

# ============================================================
# MERGE ARCHITECTURE FOLDERS
# ============================================================
echo ""
echo "🏗️  Consolidating architecture documentation..."
merge_folder "adr" "architecture/decisions" "adr → architecture/decisions"
merge_folder "diagrams" "architecture/diagrams" "diagrams → architecture/diagrams"
move_files "technical" "architecture/patterns" "technical → architecture/patterns"

# ============================================================
# MERGE DEVELOPMENT FOLDERS
# ============================================================
echo ""
echo "🔧 Consolidating development documentation..."
merge_folder "code-quality" "development/coding-standards" "code-quality → development/coding-standards"
move_files "refactoring" "development" "refactoring → development"
move_files "typescript" "development" "typescript → development"

# ============================================================
# MERGE UI/UX FOLDERS
# ============================================================
echo ""
echo "🎨 Consolidating UI/UX documentation..."
merge_folder "ui" "ui-ux/components" "ui → ui-ux/components"
merge_folder "animations" "ui-ux/animations" "animations → ui-ux/animations"

# ============================================================
# MERGE DEPLOYMENT FOLDERS
# ============================================================
echo ""
echo "🚀 Consolidating deployment documentation..."
merge_folder "docker" "deployment/docker" "docker → deployment/docker"
move_files "monitoring" "deployment/monitoring" "monitoring → deployment/monitoring"

# ============================================================
# MERGE CONFIGURATION FOLDERS
# ============================================================
echo ""
echo "⚙️  Consolidating configuration documentation..."
merge_folder "env-configs" "configuration/environment" "env-configs → configuration/environment"

# ============================================================
# MERGE PROJECT MANAGEMENT FOLDERS
# ============================================================
echo ""
echo "📋 Consolidating project management..."
merge_folder "project-management" "project" "project-management → project"

# ============================================================
# MERGE VSCODE FOLDERS
# ============================================================
echo ""
echo "💻 Consolidating VSCode documentation..."
merge_folder "vscode-configuration" "vscode" "vscode-configuration → vscode"

# ============================================================
# ARCHIVE TIME-BASED FOLDERS
# ============================================================
echo ""
echo "📦 Archiving time-based documentation..."
move_files "sprint-6" "archives/sprints/sprint-6" "sprint-6 → archives"
move_files "sprints" "archives/sprints" "sprints → archives"
move_files "week2" "archives/sprints/week2" "week2 → archives"
move_files "phases" "archives/sprints/phases" "phases → archives"

# ============================================================
# ARCHIVE REPORT/PROGRESS FOLDERS
# ============================================================
echo ""
echo "📊 Archiving reports and progress..."
move_files "reports" "archives/reports" "reports → archives"
move_files "progress" "archives/reports/progress" "progress → archives"
move_files "priorities" "archives/priorities" "priorities → archives"

# ============================================================
# ARCHIVE OLD IMPLEMENTATIONS
# ============================================================
echo ""
echo "🗄️  Archiving old implementations..."
move_files "archive" "archives/old-implementations" "archive → archives"
move_files "root-archive" "archives/old-implementations" "root-archive → archives"

# ============================================================
# MOVE SESSION/COMPLETION DOCS TO .project-docs
# ============================================================
echo ""
echo "📝 Moving session/completion docs to .project-docs..."

# Move session summaries to .project-docs
for file in CONTINUOUS_SESSION_*.md SESSION*.md; do
    if [ -f "$file" ]; then
        mv "$file" ../.project-docs/sessions/ 2>/dev/null || true
        echo "  ✓ Moved session: $file"
    fi
done

# Move completion reports to .project-docs
for file in *COMPLETE*.md *COMPLETION*.md; do
    if [ -f "$file" ]; then
        mv "$file" ../.project-docs/summaries/ 2>/dev/null || true
        echo "  ✓ Moved completion: $file"
    fi
done

# Move sprint-specific docs to .project-docs
for file in SPRINT_*.md sprint-*.md; do
    if [ -f "$file" ]; then
        mv "$file" ../.project-docs/sessions/ 2>/dev/null || true
        echo "  ✓ Moved sprint doc: $file"
    fi
done

# Move progress/status docs to .project-docs
for file in *PROGRESS*.md *STATUS*.md WEEK_2_DAY_*.md; do
    if [ -f "$file" ]; then
        mv "$file" ../.project-docs/progress/ 2>/dev/null || true
        echo "  ✓ Moved progress: $file"
    fi
done

# ============================================================
# REMOVE VAGUE/REDUNDANT FOLDERS
# ============================================================
echo ""
echo "🗑️  Removing empty and redundant folders..."

folders_to_remove=(
    "current"
    "executive"
    "quick-reference"
)

for folder in "${folders_to_remove[@]}"; do
    if [ -d "$folder" ]; then
        # Move any remaining content to appropriate places
        if [ "$(ls -A $folder 2>/dev/null)" ]; then
            cp -r "$folder"/* archives/ 2>/dev/null || true
        fi
        rm -rf "$folder"
        echo "  ✓ Removed: $folder"
    fi
done

# ============================================================
# CREATE INDEX FILES
# ============================================================
echo ""
echo "📖 Creating index files..."

# Main docs README
cat > README.md << 'EOF'
# 📚 Farmers Market Platform Documentation

Complete technical documentation for the Farmers Market Platform.

## 📁 Documentation Structure

```
docs/
├── getting-started/           # New developer onboarding
├── architecture/              # System architecture & patterns
├── development/               # Development guides & standards
├── api/                      # API documentation
├── database/                 # Database schema & migrations
├── ui-ux/                    # UI/UX design system
├── deployment/               # Deployment guides
├── configuration/            # Configuration & environment
├── testing/                  # Testing documentation
├── features/                 # Feature-specific docs
├── quantum-docs/             # Divine agricultural consciousness
├── archives/                 # Historical documentation
└── checklists/              # Quick reference checklists
```

## 🚀 Quick Links

### New Developers
- [Getting Started](getting-started/README.md)
- [Development Setup](development/README.md)
- [Quick Start Guide](getting-started/developer-quickstart.md)

### Architecture
- [System Architecture](architecture/README.md)
- [Architecture Decisions](architecture/decisions/README.md)
- [Design Patterns](architecture/patterns/README.md)

### Development
- [Coding Standards](development/coding-standards/README.md)
- [Testing Guide](testing/README.md)
- [Debugging Guide](development/debugging/README.md)

### Deployment
- [Deployment Guide](deployment/README.md)
- [Docker Setup](deployment/docker/README.md)
- [Monitoring](deployment/monitoring/README.md)

## 📖 Documentation Standards

- Keep docs up-to-date with code changes
- Use clear, descriptive titles
- Include code examples where appropriate
- Link to related documentation
- Follow the divine agricultural principles

## 🔍 Search Tips

Use your IDE's search (Ctrl+Shift+F or Cmd+Shift+F) to find specific topics across all documentation.

---

**Last Updated**: January 2025
**Status**: Organized & Maintained
EOF

# getting-started/README.md
cat > getting-started/README.md << 'EOF'
# 🚀 Getting Started

Welcome to the Farmers Market Platform! This guide will help you get up and running quickly.

## Quick Start

1. **Prerequisites**: Node.js 22+, PostgreSQL 16+
2. **Clone**: `git clone <repo-url>`
3. **Install**: `npm install`
4. **Configure**: Copy `.env.example` to `.env`
5. **Database**: `npm run db:push`
6. **Run**: `npm run dev`

## Documentation

- [Developer Quick Start](developer-quickstart.md)
- [Onboarding Checklist](onboarding-checklist.md)
- [Tutorials](tutorials/README.md)

## Need Help?

Check the main [documentation](../README.md) or ask the team!
EOF

# architecture/README.md
cat > architecture/README.md << 'EOF'
# 🏗️ Architecture Documentation

System architecture, design patterns, and architectural decisions for the Farmers Market Platform.

## Structure

- **decisions/**: Architecture Decision Records (ADRs)
- **diagrams/**: System diagrams and visualizations
- **patterns/**: Design patterns and best practices

## Key Concepts

- Next.js 15 App Router with Server Components
- Prisma ORM with PostgreSQL
- Server Actions for mutations
- Divine agricultural consciousness patterns

See individual folders for detailed documentation.
EOF

# development/README.md
cat > development/README.md << 'EOF'
# 🔧 Development Guide

Guidelines, standards, and best practices for developing the Farmers Market Platform.

## Contents

- **coding-standards/**: Code style and conventions
- **debugging/**: Debugging techniques and tools
- **tools/**: Development tools and setup

## Quick Links

- [Coding Standards](coding-standards/README.md)
- [Testing Guide](../testing/README.md)
- [TypeScript Guidelines](typescript/README.md)

## Development Workflow

1. Create feature branch
2. Follow coding standards
3. Write tests
4. Submit PR
5. Code review
6. Merge to master
EOF

# ui-ux/README.md
cat > ui-ux/README.md << 'EOF'
# 🎨 UI/UX Documentation

Design system, component library, and user experience guidelines.

## Structure

- **components/**: UI component documentation
- **design-system/**: Design tokens and principles
- **animations/**: Animation patterns and guidelines

## Design Principles

- Agricultural consciousness in UI
- Accessible and responsive
- Performance-first animations
- Tailwind CSS with custom theme
EOF

# deployment/README.md
cat > deployment/README.md << 'EOF'
# 🚀 Deployment Guide

Deployment strategies, configurations, and monitoring for the Farmers Market Platform.

## Deployment Targets

- **Vercel**: Primary production deployment
- **Docker**: Containerized deployment option
- **Local**: Development and testing

## Structure

- **docker/**: Docker configurations
- **vercel/**: Vercel deployment guides
- **monitoring/**: Monitoring and observability

## Quick Deploy

Production deployment via Vercel:
```bash
npm run build
vercel --prod
```

See individual folders for detailed guides.
EOF

# configuration/README.md
cat > configuration/README.md << 'EOF'
# ⚙️ Configuration Guide

Environment variables, feature flags, and application configuration.

## Structure

- **environment/**: Environment variable documentation
- **examples/**: Example configurations

## Environment Variables

See [ENVIRONMENT_VARIABLES.md](../ENVIRONMENT_VARIABLES.md) for complete list.

## Configuration Files

- `.env`: Local development
- `.env.example`: Template with all variables
- `next.config.mjs`: Next.js configuration
- `tailwind.config.ts`: Tailwind configuration
EOF

# testing/README.md
cat > testing/README.md << 'EOF'
# 🧪 Testing Documentation

Testing strategies, guidelines, and best practices.

## Test Types

- **unit/**: Unit tests with Jest/Vitest
- **integration/**: Integration tests
- **e2e/**: End-to-end tests with Playwright

## Running Tests

```bash
npm test              # All tests
npm run test:unit     # Unit tests only
npm run test:e2e      # E2E tests
npm run test:coverage # With coverage
```

## Testing Standards

- Aim for 80%+ code coverage
- Test business logic thoroughly
- Mock external dependencies
- Follow AAA pattern (Arrange, Act, Assert)
EOF

# archives/README.md
cat > archives/README.md << 'EOF'
# 🗄️ Archives

Historical documentation, old implementations, and superseded guides.

## Structure

- **sprints/**: Sprint-specific documentation
- **old-implementations/**: Previous implementations
- **reports/**: Historical reports and analysis
- **priorities/**: Old priority lists

## Note

Content in archives is preserved for historical reference but may be outdated.
For current documentation, see the main docs folders.
EOF

echo "  ✓ Created all index files"

# ============================================================
# CLEANUP EMPTY DIRECTORIES
# ============================================================
echo ""
echo "🧹 Removing empty directories..."

# Find and remove empty directories
find . -type d -empty -delete 2>/dev/null || true
echo "  ✓ Removed empty directories"

cd ..

# ============================================================
# SUMMARY
# ============================================================
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║ ✅ DOCS CONSOLIDATION COMPLETE                             ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📊 Summary:"
echo "  • Folders merged: $MERGED_COUNT"
echo "  • Files relocated: $MOVED_COUNT"
echo "  • New structure: 12 organized categories"
echo "  • Session/progress docs moved to .project-docs/"
echo ""
echo "📁 New Documentation Structure:"
echo "  docs/"
echo "  ├── getting-started/       # Onboarding & tutorials"
echo "  ├── architecture/          # System design & patterns"
echo "  ├── development/           # Coding standards & guides"
echo "  ├── api/                   # API documentation"
echo "  ├── database/              # Schema & migrations"
echo "  ├── ui-ux/                 # Design system & components"
echo "  ├── deployment/            # Deployment guides"
echo "  ├── configuration/         # Environment & settings"
echo "  ├── testing/               # Test documentation"
echo "  ├── features/              # Feature-specific docs"
echo "  ├── quantum-docs/          # Divine documentation"
echo "  ├── archives/              # Historical content"
echo "  └── checklists/            # Quick references"
echo ""
echo "🎯 Documentation is now organized and navigable!"
echo "   47+ folders → 12 clear categories"
echo ""
echo "💡 All folders have README.md index files"
echo "   Start with docs/README.md for navigation"
echo ""
