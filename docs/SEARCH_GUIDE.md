# 🔍 Documentation Search Guide

> **Find any information in seconds - Master guide to searching the Farmers Market Platform documentation**

This guide provides powerful search techniques, common queries, and shortcuts to help you find documentation instantly.

---

## 🚀 Quick Search Reference

### Most Common Searches

```bash
# Find all guides
ls docs/guides/*.md

# Search for specific topic
grep -r "authentication" docs/

# Find recent updates (last 7 days)
find docs/ -name "*.md" -mtime -7

# List all README files
find docs/ -name "README.md"

# Find API documentation
ls docs/api/*.md
```

---

## 🎯 Search by Topic

### Authentication & Security

```bash
grep -r "auth\|authentication\|security" docs/guides/
```

**Common Files**:

- `docs/guides/AUTHENTICATION-GUIDE.md`
- `docs/guides/SECURITY_TESTING_GUIDE.md`
- `docs/audits/`

### Database & Prisma

```bash
grep -r "database\|prisma\|migration" docs/
```

**Common Files**:

- `docs/database/`
- `docs/technical/MIGRATION_AND_ENV_SETUP_COMPLETE.md`
- `docs/technical/SEEDING_COMPLETE.md`

### Testing

```bash
grep -r "test\|testing\|coverage" docs/testing/ docs/guides/
```

**Common Files**:

- `docs/testing/`
- `docs/guides/MANUAL_TESTING_GUIDE.md`
- `docs/guides/QA_TESTING_GUIDE.md`

### Deployment

```bash
grep -r "deploy\|docker\|vercel" docs/deployment/ docs/docker/
```

**Common Files**:

- `docs/deployment/`
- `docs/docker/`
- `docs/guides/STAGING_DEPLOYMENT_GUIDE.md`

### Performance & Optimization

```bash
grep -r "performance\|optimization\|cache" docs/
```

**Common Files**:

- `docs/optimization/`
- `docs/guides/PERFORMANCE_OPTIMIZATION.md`
- `docs/profiling/`

---

## 🔧 Advanced Search Techniques

### 1. Multi-Pattern Search

```bash
# Search for multiple terms
grep -r -E "error|bug|fix" docs/technical/

# Search with case insensitivity
grep -ri "typescript" docs/

# Search excluding archives
grep -r "pattern" docs/ --exclude-dir=archive
```

### 2. Context Search (Show Surrounding Lines)

```bash
# Show 3 lines before and after match
grep -r -B3 -A3 "API endpoint" docs/

# Show 10 lines after match
grep -r -A10 "## Installation" docs/guides/
```

### 3. File Type Specific

```bash
# Search only markdown files
find docs/ -name "*.md" -exec grep -l "keyword" {} \;

# Search README files only
find docs/ -name "README.md" -exec grep -H "keyword" {} \;

# Search excluding specific directories
grep -r "term" docs/ --exclude-dir={archive,node_modules}
```

### 4. Search by Date Range

```bash
# Files modified in last 7 days
find docs/ -name "*.md" -mtime -7

# Files modified more than 30 days ago
find docs/ -name "*.md" -mtime +30

# Files modified between dates
find docs/ -name "*.md" -newermt "2024-12-01" ! -newermt "2024-12-31"
```

### 5. Search with File Size

```bash
# Large documentation files (>50KB)
find docs/ -name "*.md" -size +50k

# Small files (<10KB)
find docs/ -name "*.md" -size -10k
```

---

## 📋 Search by File Type

### README Navigation Files

```bash
find docs/ -name "README.md" | sort
```

### Guide Documents

```bash
ls docs/guides/*GUIDE*.md
```

### Completion Summaries

```bash
find docs/ -name "*COMPLETE*.md" -o -name "*SUMMARY*.md"
```

### Quick Reference Docs

```bash
find docs/ -name "*QUICK*.md" -o -name "*REFERENCE*.md"
```

### Status & Progress Reports

```bash
ls docs/progress/**/*.md docs/phases/*.md docs/status/*.md 2>/dev/null
```

---

## 🎓 Search by Role

### New Developer

```bash
# Getting started docs
find docs/getting-started/ docs/quick-start/ -name "*.md"

# Setup guides
grep -l "installation\|setup" docs/guides/*.md

# Quick start docs
find docs/ -name "*QUICK_START*.md"
```

### Active Developer

```bash
# Development guides
ls docs/guides/*.md | grep -v "QUICK_START"

# Current development run
ls docs/guides/runs/RUN_*.md | tail -5

# Technical implementations
ls docs/technical/*.md
```

### QA Engineer

```bash
# Testing documentation
find docs/testing/ -name "*.md"

# Testing guides
ls docs/guides/*TEST*.md

# Quality metrics
ls docs/code-quality/*.md
```

### DevOps Engineer

```bash
# Deployment docs
find docs/deployment/ docs/docker/ -name "*.md"

# Configuration guides
ls docs/configuration/*.md

# Monitoring setup
ls docs/monitoring/*.md
```

### Project Manager

```bash
# Progress tracking
find docs/progress/ -name "*.md"

# Phase completions
ls docs/phases/completion/*.md

# Executive summaries
ls docs/executive/*.md
```

---

## 🔍 Common Search Scenarios

### "How do I set up the project?"

```bash
cat QUICK_START.md
cat docs/guides/DIVINE_DEV_SETUP.md
ls docs/getting-started/*.md
```

### "How do I run tests?"

```bash
grep -r "npm.*test" docs/
cat docs/guides/MANUAL_TESTING_GUIDE.md
cat docs/testing/README.md
```

### "How do I deploy?"

```bash
grep -r "deploy\|production" docs/deployment/
cat docs/guides/STAGING_DEPLOYMENT_GUIDE.md
cat docs/docker/README.md
```

### "Where are the API docs?"

```bash
ls docs/api/*.md
find docs/ -name "*API*.md"
grep -r "API endpoint" docs/
```

### "What changed recently?"

```bash
cat CHANGELOG.md
find docs/ -name "*.md" -mtime -7
grep -r "PHASE_6\|Phase 6" docs/phases/
```

### "How do I fix error X?"

```bash
grep -r "error_name" docs/technical/
grep -r "error_name" docs/troubleshooting/
cat docs/technical/TYPESCRIPT_FIXES_COMPLETED.md
```

### "What's the project status?"

```bash
cat PROJECT_STATUS.md
cat docs/progress/daily/$(ls -t docs/progress/daily/*.md | head -1)
cat docs/phases/PHASE_6_PROGRESS.md
```

---

## 📊 Search Cheat Sheet

### Basic Commands

| Command                   | Purpose             | Example                          |
| ------------------------- | ------------------- | -------------------------------- |
| `grep -r "term" docs/`    | Search all docs     | `grep -r "authentication" docs/` |
| `find docs/ -name "*.md"` | List all markdown   | `find docs/ -name "README.md"`   |
| `ls docs/category/*.md`   | List category files | `ls docs/guides/*.md`            |
| `cat docs/path/file.md`   | View file           | `cat QUICK_START.md`             |

### Advanced Commands

| Command                   | Purpose                 | Example                                |
| ------------------------- | ----------------------- | -------------------------------------- |
| `grep -ri "term" docs/`   | Case-insensitive search | `grep -ri "docker" docs/`              |
| `grep -r -l "term" docs/` | List files with match   | `grep -r -l "API" docs/`               |
| `grep -r -B3 -A3 "term"`  | Show context            | `grep -r -B3 -A3 "setup" docs/guides/` |
| `find docs/ -mtime -7`    | Recent files            | `find docs/ -name "*.md" -mtime -7`    |

### Combined Searches

```bash
# Search in specific directories only
grep -r "keyword" docs/{guides,testing,deployment}

# Search and count occurrences
grep -r -c "keyword" docs/ | grep -v ":0$"

# Search and show line numbers
grep -rn "keyword" docs/

# Search for multiple keywords (OR)
grep -r -E "term1|term2|term3" docs/

# Search for multiple keywords (AND)
grep -r "term1" docs/ | grep "term2"
```

---

## 🎯 Pro Tips

### 1. Create Search Aliases

Add to your `.bashrc` or `.zshrc`:

```bash
# Documentation shortcuts
alias docfind='find docs/ -name "*.md" -exec grep -l'
alias docgrep='grep -r'
alias docls='ls docs/**/*.md'
alias docrecent='find docs/ -name "*.md" -mtime -7'

# Usage
docfind "authentication"  # Find files containing term
docrecent                 # Show recent updates
```

### 2. Use ripgrep (rg) for Speed

If available, `ripgrep` is faster:

```bash
# Install ripgrep
# macOS: brew install ripgrep
# Ubuntu: apt install ripgrep
# Windows: choco install ripgrep

# Usage
rg "search term" docs/
rg -i "case insensitive" docs/
rg -l "list files only" docs/
```

### 3. VS Code Search

- Press `Ctrl+Shift+F` (Windows/Linux) or `Cmd+Shift+F` (Mac)
- Set search scope to `docs/`
- Use regex for advanced patterns

### 4. GitHub Search

```
repo:username/farmers-market-platform path:docs/ "search term"
```

---

## 🗂️ Directory Quick Reference

### Essential Directories

```
docs/
├── guides/           # 35+ developer guides
├── testing/          # Test documentation
├── deployment/       # Deployment guides
├── architecture/     # System architecture
├── api/              # API documentation
├── database/         # Database docs
├── progress/         # Progress tracking
├── phases/           # Phase documentation
├── technical/        # Technical implementations
└── archive/          # Historical docs (276+)
```

### Key Entry Points

- `docs/README.md` - Master documentation hub ⭐
- `docs/guides/README.md` - Guide overview
- `docs/testing/README.md` - Testing hub
- `docs/deployment/README.md` - Deployment hub
- `docs/archive/README.md` - Archive navigation

---

## 📱 Mobile/Browser Search

### Using GitHub Web Interface

1. Navigate to repository
2. Press `/` to open file finder
3. Type filename
4. Or use "Go to file" button

### Using GitHub Search

1. In repository, click search bar
2. Use filters:
   - `path:docs/` - Search docs only
   - `extension:md` - Markdown files only
   - `modified:>2024-12-01` - Recent changes

---

## 🎨 Visual Search (File Browser)

### VS Code File Explorer

```
docs/
├── 📚 README.md ⭐ Start Here
├── 📂 guides/
│   ├── 📄 START_HERE.md
│   ├── 📄 QUICK_START_CHECKLIST.md
│   └── 📂 runs/
├── 📂 testing/
├── 📂 deployment/
└── ...
```

### Recommended Extensions

- **Markdown Preview** - Preview .md files
- **Markdown All in One** - TOC generation
- **Search Editor** - Advanced search UI

---

## 🔗 Search Resources

### Documentation Navigation

- [Master Hub](./README.md) - Central navigation
- [Documentation Map](./DOCUMENTATION_MAP.md) - Visual guide
- [Project README](../README.md) - Project overview

### External Resources

- **Full-text Search**: Use IDE search features
- **Git History**: `git log --all -- docs/path/to/file.md`
- **GitHub**: Web-based search and navigation

---

## 💡 Search Best Practices

### ✅ DO

- Start with `docs/README.md` for navigation
- Use specific search terms
- Search within relevant directories first
- Check README files in each directory
- Use case-insensitive search when uncertain
- Follow links in documentation

### ❌ DON'T

- Search entire project when you need docs only
- Use overly generic terms ("file", "code", "docs")
- Forget to check archives for historical info
- Skip reading README files
- Ignore related links in documents

---

## 📈 Search Examples by Complexity

### Beginner Searches

```bash
# Find getting started guide
ls docs/getting-started/*.md

# Find quick start
cat QUICK_START.md

# List all guides
ls docs/guides/*.md
```

### Intermediate Searches

```bash
# Find authentication docs
grep -r "authentication" docs/guides/ docs/api/

# Recent testing docs
find docs/testing/ -name "*.md" -mtime -14

# All deployment guides
find docs/ -path "*/deployment/*.md"
```

### Advanced Searches

```bash
# Find API endpoints with examples
grep -r -A5 "GET\|POST\|PUT\|DELETE" docs/api/

# Complex pattern matching
grep -r -E "error.*fix|bug.*resolved" docs/technical/

# Multi-directory contextual search
grep -r -B2 -A5 "configuration" docs/{deployment,docker,configuration}/
```

---

## 🆘 Can't Find What You Need?

### Troubleshooting Steps

1. ✅ Check [Master Documentation Hub](./README.md)
2. ✅ Review [Documentation Map](./DOCUMENTATION_MAP.md)
3. ✅ Search archives: `grep -r "term" docs/archive/`
4. ✅ Check git history: `git log --all --full-history docs/`
5. ✅ Ask the team (Slack/Discord)
6. ✅ Open an issue for missing documentation

### Common Issues

- **"No results found"**: Try case-insensitive search (`-i`)
- **"Too many results"**: Narrow to specific directory
- **"Outdated info"**: Check `docs/archive/` vs active docs
- **"Can't remember filename"**: Use content search instead

---

## 📞 Search Support

**Need Help Searching?**

- Review this guide's examples
- Check [Documentation Map](./DOCUMENTATION_MAP.md)
- Ask team in #documentation channel
- Improve search: Open PR with better keywords

---

**Last Updated**: 2025  
**Maintained By**: Documentation Team  
**Version**: 1.0 - Comprehensive Search Guide  
**Status**: 🟢 Complete & Ready to Use

**Quick Start**: `grep -r "what you're looking for" docs/`
