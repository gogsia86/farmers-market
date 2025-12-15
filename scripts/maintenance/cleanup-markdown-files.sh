#!/bin/bash

# 🧹 Comprehensive Markdown File Cleanup Script
# Farmers Market Platform - Organize and clean all .md files
# This script archives old session reports and organizes documentation

set -e

echo "🧹 Starting comprehensive markdown file cleanup..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ============================================
# 1. CREATE ARCHIVE STRUCTURE
# ============================================
echo -e "${BLUE}📁 Creating archive structure...${NC}"

mkdir -p "docs/archive/session-reports"
mkdir -p "docs/archive/phase-reports"
mkdir -p "docs/archive/analysis-reports"
mkdir -p "docs/archive/audit-reports"
mkdir -p "docs/archive/old-guides"
mkdir -p "docs/archive/duplicate-docs"

echo -e "${GREEN}✅ Archive structure created${NC}"
echo ""

# ============================================
# 2. ARCHIVE SESSION REPORTS FROM /docs
# ============================================
echo -e "${BLUE}📦 Archiving session reports...${NC}"

# Session summaries
find docs -maxdepth 1 -name "*SESSION*.md" -type f -exec mv {} docs/archive/session-reports/ \; 2>/dev/null || true
find docs -maxdepth 1 -name "*CONVERSATION*.md" -type f -exec mv {} docs/archive/session-reports/ \; 2>/dev/null || true
find docs -maxdepth 1 -name "*CONTINUATION*.md" -type f -exec mv {} docs/archive/session-reports/ \; 2>/dev/null || true
find docs -maxdepth 1 -name "*HANDOFF*.md" -type f -exec mv {} docs/archive/session-reports/ \; 2>/dev/null || true

echo "  → Moved session reports"

# ============================================
# 3. ARCHIVE PHASE REPORTS FROM /docs
# ============================================
echo -e "${BLUE}📦 Archiving phase reports...${NC}"

find docs -maxdepth 1 -name "PHASE*.md" -type f -exec mv {} docs/archive/phase-reports/ \; 2>/dev/null || true
find docs -maxdepth 1 -name "*COMPLETE*.md" -type f -exec mv {} docs/archive/phase-reports/ \; 2>/dev/null || true
find docs -maxdepth 1 -name "*PROGRESS*.md" -type f -exec mv {} docs/archive/phase-reports/ \; 2>/dev/null || true
find docs -maxdepth 1 -name "*CHECKPOINT*.md" -type f -exec mv {} docs/archive/phase-reports/ \; 2>/dev/null || true
find docs -maxdepth 1 -name "*KICKOFF*.md" -type f -exec mv {} docs/archive/phase-reports/ \; 2>/dev/null || true

echo "  → Moved phase reports"

# ============================================
# 4. ARCHIVE ANALYSIS REPORTS FROM /docs
# ============================================
echo -e "${BLUE}📦 Archiving analysis reports...${NC}"

find docs -maxdepth 1 -name "*ANALYSIS*.md" -type f -exec mv {} docs/archive/analysis-reports/ \; 2>/dev/null || true
find docs -maxdepth 1 -name "*REPORT*.md" -type f -exec mv {} docs/archive/analysis-reports/ \; 2>/dev/null || true
find docs -maxdepth 1 -name "*REVIEW*.md" -type f -exec mv {} docs/archive/analysis-reports/ \; 2>/dev/null || true
find docs -maxdepth 1 -name "*TODO*.md" -type f -exec mv {} docs/archive/analysis-reports/ \; 2>/dev/null || true

echo "  → Moved analysis reports"

# ============================================
# 5. ARCHIVE AUDIT REPORTS FROM /docs
# ============================================
echo -e "${BLUE}📦 Archiving audit reports...${NC}"

find docs -maxdepth 1 -name "*AUDIT*.md" -type f -exec mv {} docs/archive/audit-reports/ \; 2>/dev/null || true
find docs -maxdepth 1 -name "*DUPLICATE*.md" -type f -exec mv {} docs/archive/audit-reports/ \; 2>/dev/null || true
find docs -maxdepth 1 -name "*CLEANUP*.md" -type f -exec mv {} docs/archive/audit-reports/ \; 2>/dev/null || true

echo "  → Moved audit reports"

# ============================================
# 6. ARCHIVE OLD/DUPLICATE GUIDES FROM /docs
# ============================================
echo -e "${BLUE}📦 Archiving old guides...${NC}"

# Old quick references (keep only the newest ones)
find docs -maxdepth 1 -name "QUICK-*.md" -type f -exec mv {} docs/archive/old-guides/ \; 2>/dev/null || true
find docs -maxdepth 1 -name "*QUICKREF*.md" -type f -exec mv {} docs/archive/old-guides/ \; 2>/dev/null || true
find docs -maxdepth 1 -name "*QUICK_START.md" -type f -exec mv {} docs/archive/old-guides/ \; 2>/dev/null || true

# Migration guides (keep only current)
find docs -maxdepth 1 -name "*MIGRATION*.md" -type f -exec mv {} docs/archive/old-guides/ \; 2>/dev/null || true
find docs -maxdepth 1 -name "*UPGRADE*.md" -type f -exec mv {} docs/archive/old-guides/ \; 2>/dev/null || true
find docs -maxdepth 1 -name "*RESTRUCTURE*.md" -type f -exec mv {} docs/archive/old-guides/ \; 2>/dev/null || true

# Old implementation guides
find docs -maxdepth 1 -name "*IMPLEMENTATION*.md" -type f -exec mv {} docs/archive/old-guides/ \; 2>/dev/null || true
find docs -maxdepth 1 -name "*FIX*.md" -type f -exec mv {} docs/archive/old-guides/ \; 2>/dev/null || true
find docs -maxdepth 1 -name "*REPAIR*.md" -type f -exec mv {} docs/archive/old-guides/ \; 2>/dev/null || true

echo "  → Moved old guides"

# ============================================
# 7. ORGANIZE REMAINING DOCS BY CATEGORY
# ============================================
echo -e "${BLUE}📁 Organizing remaining documentation...${NC}"

# API Documentation
mkdir -p "docs/api"
find docs -maxdepth 1 -name "*API*.md" -type f -exec mv {} docs/api/ \; 2>/dev/null || true

# Database Documentation
mkdir -p "docs/database"
find docs -maxdepth 1 -name "*DATABASE*.md" -type f -exec mv {} docs/database/ \; 2>/dev/null || true
find docs -maxdepth 1 -name "*SCHEMA*.md" -type f -exec mv {} docs/database/ \; 2>/dev/null || true

# Testing Documentation
mkdir -p "docs/testing"
find docs -maxdepth 1 -name "*TEST*.md" -type f -exec mv {} docs/testing/ \; 2>/dev/null || true
find docs -maxdepth 1 -name "*E2E*.md" -type f -exec mv {} docs/testing/ \; 2>/dev/null || true

# Development Guides
mkdir -p "docs/development"
find docs -maxdepth 1 -name "*DEVELOPMENT*.md" -type f -exec mv {} docs/development/ \; 2>/dev/null || true
find docs -maxdepth 1 -name "*CONTRIBUTING*.md" -type f -exec mv {} docs/development/ \; 2>/dev/null || true

# Monitoring & Performance
mkdir -p "docs/monitoring"
find docs -maxdepth 1 -name "*MONITORING*.md" -type f -exec mv {} docs/monitoring/ \; 2>/dev/null || true
find docs -maxdepth 1 -name "*PERFORMANCE*.md" -type f -exec mv {} docs/monitoring/ \; 2>/dev/null || true
find docs -maxdepth 1 -name "*TRACING*.md" -type f -exec mv {} docs/monitoring/ \; 2>/dev/null || true

# CI/CD & Deployment (additional files)
find docs -maxdepth 1 -name "*CI_CD*.md" -type f -exec mv {} docs/deployment/ \; 2>/dev/null || true
find docs -maxdepth 1 -name "*PRODUCTION*.md" -type f -exec mv {} docs/deployment/ \; 2>/dev/null || true
find docs -maxdepth 1 -name "*RUNBOOK*.md" -type f -exec mv {} docs/deployment/ \; 2>/dev/null || true

# Configuration Guides
mkdir -p "docs/configuration"
find docs -maxdepth 1 -name "*CONFIG*.md" -type f -exec mv {} docs/configuration/ \; 2>/dev/null || true
find docs -maxdepth 1 -name "*SETUP*.md" -type f -exec mv {} docs/configuration/ \; 2>/dev/null || true
find docs -maxdepth 1 -name "*EMAIL*.md" -type f -exec mv {} docs/configuration/ \; 2>/dev/null || true
find docs -maxdepth 1 -name "*SSL*.md" -type f -exec mv {} docs/configuration/ \; 2>/dev/null || true

# Payment & Stripe
mkdir -p "docs/payments"
find docs -maxdepth 1 -name "*STRIPE*.md" -type f -exec mv {} docs/payments/ \; 2>/dev/null || true
find docs -maxdepth 1 -name "*PAYMENT*.md" -type f -exec mv {} docs/payments/ \; 2>/dev/null || true
find docs -maxdepth 1 -name "*CHECKOUT*.md" -type f -exec mv {} docs/payments/ \; 2>/dev/null || true

# AI & Automation
mkdir -p "docs/ai"
find docs -maxdepth 1 -name "*AI*.md" -type f -exec mv {} docs/ai/ \; 2>/dev/null || true
find docs -maxdepth 1 -name "*WORKFLOW*.md" -type f -exec mv {} docs/ai/ \; 2>/dev/null || true
find docs -maxdepth 1 -name "*BOT*.md" -type f -exec mv {} docs/ai/ \; 2>/dev/null || true
find docs -maxdepth 1 -name "*DIVINE*.md" -type f -exec mv {} docs/ai/ \; 2>/dev/null || true

# Architecture & Design
mkdir -p "docs/architecture"
find docs -maxdepth 1 -name "*ARCHITECTURE*.md" -type f -exec mv {} docs/architecture/ \; 2>/dev/null || true
find docs -maxdepth 1 -name "*PATTERN*.md" -type f -exec mv {} docs/architecture/ \; 2>/dev/null || true
find docs -maxdepth 1 -name "*CACHE*.md" -type f -exec mv {} docs/architecture/ \; 2>/dev/null || true

# Features & Planning
mkdir -p "docs/features"
find docs -maxdepth 1 -name "*FEATURE*.md" -type f -exec mv {} docs/features/ \; 2>/dev/null || true
find docs -maxdepth 1 -name "*PLAN*.md" -type f -exec mv {} docs/features/ \; 2>/dev/null || true
find docs -maxdepth 1 -name "*ROADMAP*.md" -type f -exec mv {} docs/features/ \; 2>/dev/null || true

# TypeScript & Linting
mkdir -p "docs/code-quality"
find docs -maxdepth 1 -name "*TYPESCRIPT*.md" -type f -exec mv {} docs/code-quality/ \; 2>/dev/null || true
find docs -maxdepth 1 -name "*LINT*.md" -type f -exec mv {} docs/code-quality/ \; 2>/dev/null || true
find docs -maxdepth 1 -name "*ESLINT*.md" -type f -exec mv {} docs/code-quality/ \; 2>/dev/null || true
find docs -maxdepth 1 -name "*QUALITY*.md" -type f -exec mv {} docs/code-quality/ \; 2>/dev/null || true

# Internationalization
mkdir -p "docs/i18n"
find docs -maxdepth 1 -name "*I18N*.md" -type f -exec mv {} docs/i18n/ \; 2>/dev/null || true
find docs -maxdepth 1 -name "*LANGUAGE*.md" -type f -exec mv {} docs/i18n/ \; 2>/dev/null || true

# Platform & Executive Summaries
mkdir -p "docs/executive"
find docs -maxdepth 1 -name "*EXECUTIVE*.md" -type f -exec mv {} docs/executive/ \; 2>/dev/null || true
find docs -maxdepth 1 -name "*PLATFORM*.md" -type f -exec mv {} docs/executive/ \; 2>/dev/null || true
find docs -maxdepth 1 -name "*BRIEFING*.md" -type f -exec mv {} docs/executive/ \; 2>/dev/null || true

# Dashboard & UI
mkdir -p "docs/ui"
find docs -maxdepth 1 -name "*DASHBOARD*.md" -type f -exec mv {} docs/ui/ \; 2>/dev/null || true
find docs -maxdepth 1 -name "*UI*.md" -type f -exec mv {} docs/ui/ \; 2>/dev/null || true
find docs -maxdepth 1 -name "*VISUAL*.md" -type f -exec mv {} docs/ui/ \; 2>/dev/null || true

# Bundle Size & Optimization
mkdir -p "docs/optimization"
find docs -maxdepth 1 -name "*BUNDLE*.md" -type f -exec mv {} docs/optimization/ \; 2>/dev/null || true
find docs -maxdepth 1 -name "*OPTIMIZATION*.md" -type f -exec mv {} docs/optimization/ \; 2>/dev/null || true

# Troubleshooting
mkdir -p "docs/troubleshooting"
find docs -maxdepth 1 -name "*TROUBLESHOOTING*.md" -type f -exec mv {} docs/troubleshooting/ \; 2>/dev/null || true
find docs -maxdepth 1 -name "*DEBUG*.md" -type f -exec mv {} docs/troubleshooting/ \; 2>/dev/null || true
find docs -maxdepth 1 -name "*NEXTAUTH*.md" -type f -exec mv {} docs/troubleshooting/ \; 2>/dev/null || true

# Guides & How-Tos
mkdir -p "docs/guides"
find docs -maxdepth 1 -name "*GUIDE*.md" -type f -exec mv {} docs/guides/ \; 2>/dev/null || true
find docs -maxdepth 1 -name "*COMMANDS*.md" -type f -exec mv {} docs/guides/ \; 2>/dev/null || true

echo "  → Organized documentation by category"

# ============================================
# 8. CLEAN UP ARCHIVE SUBDIRECTORIES
# ============================================
echo -e "${BLUE}📦 Organizing archive subdirectories...${NC}"

# Move files from docs/archived, docs/archive, docs/archives to main archive
if [ -d "docs/archived" ]; then
  find docs/archived -name "*.md" -type f -exec mv {} docs/archive/old-guides/ \; 2>/dev/null || true
  rmdir docs/archived 2>/dev/null || true
fi

if [ -d "docs/archives" ]; then
  find docs/archives -name "*.md" -type f -exec mv {} docs/archive/old-guides/ \; 2>/dev/null || true
  rmdir docs/archives 2>/dev/null || true
fi

echo "  → Consolidated archive directories"

# ============================================
# 9. CREATE DOCUMENTATION INDEX FILES
# ============================================
echo -e "${BLUE}📑 Creating documentation index files...${NC}"

# Main docs README
cat > "docs/README.md" << 'EOL'
# 📚 Farmers Market Platform Documentation

Welcome to the comprehensive documentation for the Farmers Market Platform!

## 📖 Documentation Structure

### 🚀 [Quick Start](./quick-start/)
Get up and running in minutes

### 🚢 [Deployment](./deployment/)
Production deployment guides and Vercel setup

### 🔌 [API Documentation](./api/)
API endpoints and integration guides

### 🗄️ [Database](./database/)
Database schema, migrations, and data management

### 💻 [Development](./development/)
Development guides and best practices

### 🧪 [Testing](./testing/)
Testing strategies, E2E tests, and quality assurance

### 🏗️ [Architecture](./architecture/)
System design and architectural decisions

### ⚙️ [Configuration](./configuration/)
Setup guides for various services

### 💳 [Payments](./payments/)
Stripe integration and payment processing

### 🤖 [AI & Automation](./ai/)
AI features and workflow automation

### 📊 [Monitoring](./monitoring/)
Performance monitoring and observability

### 🎨 [UI/UX](./ui/)
User interface guides and design system

### ⚡ [Optimization](./optimization/)
Performance optimization and bundle size

### 🔧 [Troubleshooting](./troubleshooting/)
Common issues and solutions

### 📖 [Guides](./guides/)
Step-by-step tutorials and how-to guides

### 💼 [Executive](./executive/)
High-level summaries and business docs

### 🏆 [Code Quality](./code-quality/)
TypeScript, linting, and code standards

### 🌍 [Internationalization](./i18n/)
Multi-language support

### 🎯 [Features](./features/)
Feature specifications and roadmaps

### 📦 [Archive](./archive/)
Historical documents and old reports

---

## 🎯 Quick Links

- [Main README](../README.md)
- [Workspace Index](../WORKSPACE_INDEX.md)
- [Coding Standards](../.cursorrules)

---

**Last Updated:** Auto-generated
**Status:** ✅ Active & Maintained
🌾 **"Clean docs, clear mind, divine development."** ⚡
EOL

# Archive README
cat > "docs/archive/README.md" << 'EOL'
# 📦 Documentation Archive

This directory contains historical documents, session reports, and deprecated guides.

## 📁 Archive Structure

- **session-reports/** - Session summaries and conversation logs
- **phase-reports/** - Phase completion reports and progress tracking
- **analysis-reports/** - Analysis, reviews, and assessments
- **audit-reports/** - Audit results and cleanup reports
- **old-guides/** - Deprecated guides and outdated documentation
- **duplicate-docs/** - Duplicate files for reference

## ⚠️ Note

These documents are kept for historical reference only. For current documentation, see the main [docs/](../) directory.

---

**Archive Date:** Auto-generated
**Purpose:** Historical reference
EOL

echo "  → Created documentation index files"

# ============================================
# 10. REMOVE EMPTY DIRECTORIES
# ============================================
echo -e "${BLUE}🗑️  Removing empty directories...${NC}"

find docs -type d -empty -delete 2>/dev/null || true

echo "  → Cleaned empty directories"

# ============================================
# 11. CREATE SUMMARY REPORT
# ============================================
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✨ MARKDOWN CLEANUP COMPLETE!                             ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Count files in each directory
echo -e "${BLUE}📊 Documentation Summary:${NC}"
echo ""
echo "Main Documentation Directories:"
for dir in docs/*/; do
  if [ -d "$dir" ] && [ "$dir" != "docs/archive/" ]; then
    count=$(find "$dir" -maxdepth 1 -name "*.md" -type f 2>/dev/null | wc -l)
    dirname=$(basename "$dir")
    echo "  → $dirname: $count files"
  fi
done

echo ""
echo "Archive:"
archive_count=$(find docs/archive -name "*.md" -type f 2>/dev/null | wc -l)
echo "  → Total archived: $archive_count files"

echo ""
echo -e "${BLUE}📁 New Structure:${NC}"
echo "  docs/"
echo "  ├── api/              # API documentation"
echo "  ├── architecture/     # System architecture"
echo "  ├── ai/               # AI & automation"
echo "  ├── code-quality/     # TypeScript & linting"
echo "  ├── configuration/    # Setup guides"
echo "  ├── database/         # Database docs"
echo "  ├── deployment/       # Deployment guides"
echo "  ├── development/      # Dev guides"
echo "  ├── executive/        # Business docs"
echo "  ├── features/         # Feature specs"
echo "  ├── guides/           # How-to guides"
echo "  ├── i18n/             # Internationalization"
echo "  ├── monitoring/       # Performance monitoring"
echo "  ├── optimization/     # Performance optimization"
echo "  ├── payments/         # Stripe & payments"
echo "  ├── quick-start/      # Getting started"
echo "  ├── testing/          # Testing docs"
echo "  ├── troubleshooting/  # Problem solving"
echo "  ├── ui/               # UI/UX guides"
echo "  └── archive/          # Historical docs"
echo ""

echo -e "${YELLOW}💡 Next Steps:${NC}"
echo "  1. Review organized documentation: ls -la docs/*/"
echo "  2. Check archive: ls -la docs/archive/*/"
echo "  3. Update internal links if needed"
echo "  4. Commit changes: git add docs && git commit -m 'docs: organize markdown files'"
echo ""

echo -e "${GREEN}🌾 Documentation is now beautifully organized! ⚡${NC}"
