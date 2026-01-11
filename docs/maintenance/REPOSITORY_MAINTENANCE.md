# 🧹 Repository Maintenance Guide

**Last Updated:** January 2025
**Status:** Active
**Audience:** All contributors

---

## 📋 Overview

This guide provides best practices and procedures for maintaining a clean, organized repository. Following these guidelines will ensure the codebase remains professional and easy to navigate.

---

## 🎯 Core Principles

1. **Keep Root Clean** - Only essential files in root directory
2. **Organize Documentation** - Use `docs/` subdirectories
3. **Never Commit Logs** - Logs belong in `.gitignore`
4. **Archive Old Content** - Use `.archive/` for outdated materials
5. **Regular Cleanup** - Monthly maintenance cycles

---

## 📁 Directory Structure Standards

### Root Directory Rules

**✅ ALLOWED in Root:**

- `README.md` - Main project documentation
- `CHANGELOG.md` - Version history
- `CONTRIBUTING.md` - Contribution guidelines
- `LICENSE` - License file
- Configuration files (`package.json`, `tsconfig.json`, etc.)
- Docker files (`Dockerfile`, `docker-compose.yml`)
- CI/CD configs (`.github/`, `.gitlab-ci.yml`)

**❌ NOT ALLOWED in Root:**

- Individual fix/implementation summaries
- Temporary documentation
- Log files
- Test output files
- Analysis reports
- Quick reference guides (unless essential)
- Old/completed documentation

### Documentation Organization

All documentation must go in appropriate `docs/` subdirectories:

```
docs/
├── action-items/       # Current action items and TODOs
├── analysis/           # Code analysis reports
├── api/               # API documentation
├── architecture/      # System architecture docs
├── deployment/        # Deployment guides
├── fixes/             # Historical fix summaries
├── getting-started/   # Onboarding and quickstarts
├── guides/            # How-to guides
├── implementation/    # Implementation notes
├── optimization/      # Performance optimization docs
├── project/           # Project management docs
├── testing/           # Testing documentation
└── maintenance/       # Maintenance guides (this file)
```

---

## 🚫 Files That Should NEVER Be Committed

### Log Files

```
*.log
*-output.txt
*-output.log
bot-*.log
install*.log
dev-server.log
```

### Build Artifacts

```
.next/
.turbo/
out/
build/
dist/
coverage/
.jest-cache/
```

### Test Results

```
test-results/
playwright-report/
.playwright/
```

### Environment Files

```
.env.local
.env.production
.env.*.local
```

### OS-Specific Files

```
.DS_Store
Thumbs.db
desktop.ini
```

### Editor-Specific (optional to ignore)

```
.vscode/*
!.vscode/extensions.json
.idea/
*.swp
```

---

## 🔄 Monthly Maintenance Checklist

Perform this checklist at the end of each month:

### Week 1: Review and Organize

- [ ] **Review root directory**

  ```bash
  ls -la | grep "\.md$" | wc -l
  # Should be ≤ 5 essential MD files
  ```

- [ ] **Check for log files**

  ```bash
  find . -maxdepth 1 -name "*.log" -o -name "*-output.txt"
  # Should return nothing
  ```

- [ ] **Verify documentation organization**
  - All guides in `docs/guides/`
  - All analysis in `docs/analysis/`
  - All fixes in `docs/fixes/`

### Week 2: Archive Old Content

- [ ] **Archive completed documentation**

  ```bash
  # Move to .archive/old-docs/
  mv OLD_DOC.md .archive/old-docs/
  ```

- [ ] **Archive old validation reports**

  ```bash
  mv validation-report-*.json .archive/validation-reports/
  ```

- [ ] **Clean up old fix summaries**
  - Move summaries older than 3 months to archive

### Week 3: Clean Generated Files

- [ ] **Remove build artifacts**

  ```bash
  rm -rf .next .turbo coverage .jest-cache
  ```

- [ ] **Clean test results**

  ```bash
  rm -rf test-results playwright-report .playwright
  ```

- [ ] **Verify .gitignore working**
  ```bash
  git status --ignored
  ```

### Week 4: Update and Document

- [ ] **Update CHANGELOG.md**
  - Add significant changes from the month

- [ ] **Update documentation index**
  - Ensure `docs/README.md` is current

- [ ] **Run cleanup script**

  ```bash
  bash cleanup-repo-improved.sh --auto
  ```

- [ ] **Commit maintenance**
  ```bash
  git add .
  git commit -m "chore: monthly repository maintenance"
  ```

---

## 📝 Pre-Commit Checklist

Before every commit, verify:

- [ ] **No log files staged**

  ```bash
  git diff --cached --name-only | grep "\.log$"
  # Should return nothing
  ```

- [ ] **No test output files**

  ```bash
  git diff --cached --name-only | grep -E "(test-results|coverage)"
  # Should return nothing
  ```

- [ ] **Documentation in correct location**
  - New guides → `docs/guides/`
  - Analysis → `docs/analysis/`
  - Not in root (unless essential)

- [ ] **Commit message follows convention**

  ```
  type(scope): description

  Types: feat, fix, docs, style, refactor, test, chore
  ```

---

## 🔧 Cleanup Commands

### Quick Cleanup

```bash
# Remove all log files
find . -maxdepth 1 -name "*.log" -delete

# Remove test results
rm -rf test-results playwright-report

# Remove build artifacts
rm -rf .next .turbo coverage
```

### Full Cleanup

```bash
# Run automated cleanup script
bash cleanup-repo-improved.sh --dry-run  # Preview changes
bash cleanup-repo-improved.sh --auto     # Execute cleanup
```

### Check Repository Health

```bash
# Count root MD files (should be ≤ 5)
find . -maxdepth 1 -name "*.md" -type f | wc -l

# Check for log files (should be 0)
find . -maxdepth 1 -name "*.log" | wc -l

# Check repository size
du -sh .git

# Check ignored files
git status --ignored
```

---

## 📊 Repository Health Metrics

### Excellent Health ⭐⭐⭐

- Root MD files: ≤ 5
- Log files: 0
- Build artifacts: None committed
- Documentation: Well-organized
- .gitignore: Comprehensive

### Good Health ⭐⭐

- Root MD files: 6-10
- Log files: 0
- Build artifacts: None committed
- Documentation: Mostly organized
- .gitignore: Good

### Needs Attention ⭐

- Root MD files: 11-20
- Log files: Present
- Build artifacts: Some committed
- Documentation: Disorganized
- .gitignore: Incomplete

### Poor Health ❌

- Root MD files: 20+
- Log files: Multiple
- Build artifacts: Committed
- Documentation: Scattered
- .gitignore: Missing patterns

---

## 🎓 Best Practices

### Documentation

1. **Name files descriptively**

   ```
   ✅ CART_OPTIMIZATION_GUIDE.md
   ❌ guide.md
   ```

2. **Use consistent naming**

   ```
   ✅ FEATURE_NAME_TYPE.md (e.g., CART_ANALYSIS.md)
   ❌ random-names.md
   ```

3. **Include metadata**

   ```markdown
   # Document Title

   **Last Updated:** January 2025
   **Status:** Active | Archived | Deprecated
   **Audience:** Developers | Operations | All
   ```

4. **Link between documents**
   ```markdown
   See also: [Related Guide](../guides/RELATED_GUIDE.md)
   ```

### File Organization

1. **Create new subdirectories when needed**

   ```bash
   mkdir -p docs/new-category
   ```

2. **Use README.md for directory index**

   ```
   docs/guides/README.md - List all guides
   ```

3. **Keep related files together**
   ```
   docs/deployment/
   ├── README.md
   ├── DOCKER_DEPLOYMENT.md
   ├── VERCEL_DEPLOYMENT.md
   └── AWS_DEPLOYMENT.md
   ```

### Version Control

1. **Commit cleanup separately**

   ```bash
   git commit -m "chore: cleanup documentation"
   ```

2. **Review before pushing**

   ```bash
   git status
   git diff --staged
   ```

3. **Use meaningful commit messages**
   ```
   ✅ chore: organize documentation into subdirectories
   ❌ chore: cleanup
   ```

---

## 🚨 Common Issues and Solutions

### Issue: Too Many Root Files

**Problem:** Root directory cluttered with documentation.

**Solution:**

```bash
# Move to appropriate docs subdirectory
mv ANALYSIS_DOC.md docs/analysis/
mv GUIDE_DOC.md docs/guides/
mv FIX_DOC.md docs/fixes/
```

### Issue: Log Files Committed

**Problem:** `.log` files in git history.

**Prevention:**

```bash
# Add to .gitignore
echo "*.log" >> .gitignore

# Remove from staging
git reset HEAD *.log
```

**If already committed:**

```bash
# Remove from index but keep locally
git rm --cached *.log
```

### Issue: Large Repository Size

**Problem:** Repository growing too large.

**Solution:**

```bash
# Check what's taking space
git rev-list --objects --all | \
  git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | \
  sed -n 's/^blob //p' | \
  sort --numeric-sort --key=2 | \
  tail -20

# Use Git LFS for large files
git lfs track "*.png"
git lfs track "*.jpg"
```

### Issue: Outdated Documentation

**Problem:** Old docs cluttering structure.

**Solution:**

```bash
# Archive old documentation
mkdir -p .archive/old-docs/2024-Q4
mv OLD_DOC.md .archive/old-docs/2024-Q4/
```

---

## 🔍 Monitoring Tools

### Git Hooks

Create `.git/hooks/pre-commit`:

```bash
#!/bin/bash

# Check for log files
if git diff --cached --name-only | grep -E "\.log$"; then
    echo "Error: Attempting to commit log files"
    exit 1
fi

# Check for large files
while read -r file; do
    size=$(git cat-file -s ":0:$file")
    if [ "$size" -gt 5242880 ]; then  # 5MB
        echo "Error: File $file is larger than 5MB"
        exit 1
    fi
done < <(git diff --cached --name-only)
```

### CI/CD Checks

Add to `.github/workflows/repo-health.yml`:

```yaml
name: Repository Health Check

on: [push, pull_request]

jobs:
  check-health:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Check for log files
        run: |
          if find . -maxdepth 1 -name "*.log" | grep -q .; then
            echo "Error: Log files found in root"
            exit 1
          fi

      - name: Check root MD file count
        run: |
          count=$(find . -maxdepth 1 -name "*.md" -type f | wc -l)
          if [ "$count" -gt 10 ]; then
            echo "Warning: Too many MD files in root ($count)"
            exit 1
          fi
```

---

## 📞 Questions?

- **What goes in root?** Only README, CHANGELOG, CONTRIBUTING, LICENSE, and configs
- **Where do guides go?** `docs/guides/`
- **What about old docs?** `.archive/old-docs/`
- **How often to clean?** Monthly, plus pre-commit checks
- **Who maintains?** All contributors

---

## 📚 Related Documentation

- [Cleanup Plan](../CLEANUP_PLAN.md)
- [Cleanup Completed](../CLEANUP_COMPLETED.md)
- [Repository Analysis](../REPO_ANALYSIS_SUMMARY.md)
- [Contributing Guidelines](../../CONTRIBUTING.md)

---

## ✅ Quick Reference

```bash
# Daily: Before committing
git status                              # Check what's staged
find . -maxdepth 1 -name "*.log"       # Check for logs

# Weekly: Clean up
rm -rf .next coverage test-results     # Remove generated files
git status --ignored                    # Check ignored files

# Monthly: Full cleanup
bash cleanup-repo-improved.sh --auto   # Run cleanup script

# Always: Organize new docs
mv NEW_GUIDE.md docs/guides/           # Put in correct location
```

---

**Remember:** A clean repository is a happy repository! 🌟

---

_Last reviewed: January 2025_
_Next review: February 2025_
