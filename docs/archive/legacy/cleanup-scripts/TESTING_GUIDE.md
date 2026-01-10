# 🧪 Testing Guide - Safe Cleanup Toolkit

**Farmers Market Platform - Safe Cleanup Toolkit v1.0**  
**Purpose:** Guide for testing cleanup scripts before production use

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Pre-Testing Checklist](#pre-testing-checklist)
3. [Test Environment Setup](#test-environment-setup)
4. [Test Scenarios](#test-scenarios)
5. [Validation Criteria](#validation-criteria)
6. [Troubleshooting Tests](#troubleshooting-tests)

---

## 🎯 Overview

This guide helps you **safely test** the cleanup scripts before using them on your main branch or production code. Follow these steps to ensure everything works correctly in your specific environment.

### Testing Philosophy

- ✅ **Test on a separate branch first**
- ✅ **Verify each script independently**
- ✅ **Check rollback functionality**
- ✅ **Validate against real deployment**
- ✅ **Document any issues**

---

## ✅ Pre-Testing Checklist

Before you start testing, ensure:

```bash
# 1. You're in the project root
cd "Farmers Market Platform web and app"
pwd  # Should show project root

# 2. Git is initialized and working
git status

# 3. All changes are committed
git add .
git commit -m "Pre-cleanup checkpoint"

# 4. You have a clean working directory
git status  # Should show "working tree clean"

# 5. Node modules are installed
ls node_modules  # Should exist
npm list --depth=0  # Should show packages

# 6. Current build works
npm run build  # Should succeed

# 7. Scripts are executable
ls -la cleanup-scripts/*.sh  # Should show -rwxr-xr-x

# 8. You have enough disk space
df -h .  # Should have at least 1GB free
```

**All checks passed? ✅ Proceed to testing**

---

## 🔬 Test Environment Setup

### Option 1: Test Branch (Recommended)

```bash
# Create a test branch
git checkout -b test/cleanup-scripts

# This allows you to:
# - Test safely without affecting main
# - Easily discard if something goes wrong
# - Compare results with main branch
```

### Option 2: Separate Clone (Safest)

```bash
# Clone repository to separate location
cd ..
git clone . "../Farmers-Market-Platform-TEST"
cd "../Farmers-Market-Platform-TEST"

# Install dependencies
npm install

# Now test in this isolated copy
```

### Option 3: Docker Container (Most Isolated)

```bash
# Create a Dockerfile for testing
cat > Dockerfile.test << 'EOF'
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
CMD ["/bin/sh"]
EOF

# Build and run
docker build -f Dockerfile.test -t farmers-market-test .
docker run -it farmers-market-test
```

---

## 🧪 Test Scenarios

### Test 1: Analysis Script (Non-Destructive)

**Purpose:** Verify analysis runs without errors

```bash
# Run analysis
./cleanup-scripts/01-analyze.sh

# Expected Output:
# - Colored output showing analysis progress
# - File counts for each category
# - Report saved to cleanup-scripts/reports/

# Validation:
echo "✅ Test 1.1: Script completed without errors"

# Check report was created
ls -la cleanup-scripts/reports/analysis_*.txt
echo "✅ Test 1.2: Report file created"

# Verify report content
cat cleanup-scripts/reports/analysis_*.txt | head -50
echo "✅ Test 1.3: Report contains expected sections"

# Verify no files were modified
git status
# Should show only new report file
echo "✅ Test 1.4: No files were modified"
```

**Expected Results:**
- ✅ Script exits with code 0
- ✅ Report file created in reports/ directory
- ✅ Report contains all 10 sections
- ✅ No source files modified
- ✅ Clear, readable output

**Pass Criteria:** All 4 validation checks pass

---

### Test 2: Cleanup Script (Destructive - Use Test Branch)

**Purpose:** Verify cleanup removes correct files and creates backup

```bash
# Ensure you're on test branch
git branch --show-current  # Should show "test/cleanup-scripts"

# Count files before
BEFORE_COUNT=$(find . -type f ! -path "./node_modules/*" ! -path "./.git/*" | wc -l)
echo "Files before cleanup: $BEFORE_COUNT"

# Run cleanup (Type 'YES' when prompted)
./cleanup-scripts/02-safe-cleanup.sh

# Expected Output:
# - Confirmation prompt appears
# - Backup branch created message
# - Progress for each cleanup category
# - Summary showing files removed

# Validation:
echo "✅ Test 2.1: Script completed"

# Check backup branch was created
git branch | grep "backup-pre-cleanup"
echo "✅ Test 2.2: Backup branch created"

# Check log file was created
ls -la cleanup-scripts/logs/cleanup_*.log
echo "✅ Test 2.3: Log file created"

# Count files after
AFTER_COUNT=$(find . -type f ! -path "./node_modules/*" ! -path "./.git/*" | wc -l)
echo "Files after cleanup: $AFTER_COUNT"
echo "Files removed: $((BEFORE_COUNT - AFTER_COUNT))"
echo "✅ Test 2.4: Files were removed"

# Verify critical files still exist
test -f package.json && echo "✅ package.json preserved"
test -f next.config.js && echo "✅ next.config.js preserved"
test -f prisma/schema.prisma && echo "✅ Prisma schema preserved"
test -d app && echo "✅ app/ directory preserved"
test -d components && echo "✅ components/ directory preserved"
test -d lib && echo "✅ lib/ directory preserved"
echo "✅ Test 2.5: Critical files preserved"

# Check what was removed
echo ""
echo "Files removed:"
cat cleanup-scripts/logs/cleanup_*.log | grep "Removed"
```

**Expected Results:**
- ✅ Script creates backup branch
- ✅ 100-1000 files removed (typical range)
- ✅ All critical files preserved
- ✅ Log file created with details
- ✅ No errors during execution

**Pass Criteria:** All 5 validation checks pass

---

### Test 3: Verification Script

**Purpose:** Verify that cleanup didn't break anything

```bash
# Run verification
./cleanup-scripts/03-verify.sh

# Expected Output:
# - 12 verification checks
# - Build test execution
# - Type checking results
# - Final summary with pass/fail

# Validation:
EXIT_CODE=$?
if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ Test 3.1: Verification passed"
else
    echo "❌ Test 3.1: Verification failed (exit code: $EXIT_CODE)"
fi

# Check verification log
ls -la cleanup-scripts/logs/verification_*.log
echo "✅ Test 3.2: Verification log created"

# Check build log
ls -la cleanup-scripts/logs/build_*.log
echo "✅ Test 3.3: Build log created"

# Verify build artifacts exist
test -d .next && echo "✅ Test 3.4: Build artifacts created"

# Test the build manually
npm run build
if [ $? -eq 0 ]; then
    echo "✅ Test 3.5: Manual build successful"
else
    echo "❌ Test 3.5: Manual build failed"
fi
```

**Expected Results:**
- ✅ All 12 verification checks pass (or acceptable warnings)
- ✅ Build completes successfully
- ✅ No critical errors in logs
- ✅ Exit code is 0
- ✅ .next directory created

**Pass Criteria:** Verification script exits with 0 and build succeeds

---

### Test 4: Rollback Script

**Purpose:** Verify rollback can restore previous state

```bash
# Note current state
CURRENT_BRANCH=$(git branch --show-current)
CURRENT_COMMIT=$(git rev-parse HEAD)
echo "Current branch: $CURRENT_BRANCH"
echo "Current commit: $CURRENT_COMMIT"

# Find backup branch
BACKUP_BRANCH=$(git branch | grep "backup-pre-cleanup" | tail -1 | xargs)
echo "Backup branch: $BACKUP_BRANCH"

# Run rollback (select option 1)
./cleanup-scripts/04-rollback.sh
# When prompted:
# - Select option 1 (restore from backup)
# - Enter the backup branch number (usually 1)
# - Type 'yes' to confirm

# Expected Output:
# - List of available backup branches
# - Confirmation prompt
# - Safety backup created
# - Restoration confirmation

# Validation:
echo "✅ Test 4.1: Rollback script completed"

# Check new branch was created
NEW_BRANCH=$(git branch --show-current)
echo "New branch: $NEW_BRANCH"
test "$NEW_BRANCH" != "$CURRENT_BRANCH" && echo "✅ Test 4.2: New branch created"

# Verify files are restored
git diff $BACKUP_BRANCH HEAD --stat
echo "✅ Test 4.3: Files restored (should show no differences)"

# Verify build still works
npm run build
if [ $? -eq 0 ]; then
    echo "✅ Test 4.4: Build works after rollback"
else
    echo "❌ Test 4.4: Build failed after rollback"
fi
```

**Expected Results:**
- ✅ Rollback script shows backup branches
- ✅ Restoration creates new branch
- ✅ Files are restored correctly
- ✅ Build still works
- ✅ No data loss

**Pass Criteria:** Successful restoration and working build

---

### Test 5: Full Workflow (Integration Test)

**Purpose:** Test complete cleanup workflow from start to finish

```bash
#!/bin/bash
# Full workflow test script

echo "🧪 FULL WORKFLOW TEST"
echo "===================="
echo ""

# Start clean
git checkout -b test/full-workflow
echo "✅ Step 1: Created test branch"

# Step 1: Analysis
echo ""
echo "Running analysis..."
./cleanup-scripts/01-analyze.sh > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Step 2: Analysis completed"
else
    echo "❌ Step 2: Analysis failed"
    exit 1
fi

# Step 2: Cleanup
echo ""
echo "Running cleanup..."
echo "YES" | ./cleanup-scripts/02-safe-cleanup.sh > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Step 3: Cleanup completed"
else
    echo "❌ Step 3: Cleanup failed"
    exit 1
fi

# Step 3: Verification
echo ""
echo "Running verification..."
./cleanup-scripts/03-verify.sh > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Step 4: Verification passed"
else
    echo "❌ Step 4: Verification failed"
    exit 1
fi

# Step 4: Build test
echo ""
echo "Testing build..."
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Step 5: Build successful"
else
    echo "❌ Step 5: Build failed"
    exit 1
fi

# Step 5: Check deployment readiness
echo ""
echo "Checking deployment readiness..."
CRITICAL_FILES=("package.json" "next.config.js" "prisma/schema.prisma" "app/layout.tsx")
ALL_PRESENT=true

for file in "${CRITICAL_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Missing: $file"
        ALL_PRESENT=false
    fi
done

if [ "$ALL_PRESENT" = true ]; then
    echo "✅ Step 6: All critical files present"
else
    echo "❌ Step 6: Some critical files missing"
    exit 1
fi

# Success
echo ""
echo "🎉 FULL WORKFLOW TEST PASSED"
echo "=============================="
echo ""
echo "Summary:"
echo "  ✅ Analysis worked"
echo "  ✅ Cleanup worked"
echo "  ✅ Verification passed"
echo "  ✅ Build succeeded"
echo "  ✅ Deployment ready"
echo ""
echo "You can now safely use the cleanup scripts on your main branch!"
```

**Expected Results:**
- ✅ All 6 steps complete successfully
- ✅ No errors or failures
- ✅ Build works after cleanup
- ✅ All critical files preserved

**Pass Criteria:** All steps pass without errors

---

## ✅ Validation Criteria

### Must Pass (Critical)

1. **No Critical File Loss**
   - All files in app/, components/, lib/ preserved
   - Configuration files intact
   - Prisma schema present
   - GitHub workflows preserved

2. **Successful Build**
   - `npm run build` completes without errors
   - .next directory created
   - No import errors

3. **Backup Creation**
   - Backup branch created before cleanup
   - Rollback script can restore from backup

4. **Verification Passes**
   - Verification script exits with code 0
   - No critical errors in logs

### Should Pass (Important)

5. **Expected File Removal**
   - Test files removed (*.test.*, *.spec.*)
   - Backup files removed (*.bak, *-old.*)
   - Log files removed (*.log)
   - Build artifacts cleaned

6. **Logging Works**
   - All operations logged
   - Logs contain expected information
   - Logs are readable

7. **User Experience**
   - Clear output messages
   - Progress indicators work
   - Confirmation prompts function

### Nice to Have

8. **Performance Improvement**
   - Repository size reduced by 100MB+
   - Build time improved by 10-20 seconds

9. **Documentation Accuracy**
   - README instructions work as written
   - Quick reference matches actual behavior
   - Examples are accurate

---

## 🔍 Troubleshooting Tests

### Test Failed: Analysis Script Errors

**Symptom:** Script exits with error

**Debug Steps:**
```bash
# Run with verbose output
bash -x ./cleanup-scripts/01-analyze.sh 2>&1 | tee debug.log

# Check for common issues
which jq  # Should be installed (optional)
git status  # Should be in git repo
test -f package.json  # Should exist
```

---

### Test Failed: Cleanup Removes Critical Files

**Symptom:** Critical files missing after cleanup

**Debug Steps:**
```bash
# Immediately rollback
./cleanup-scripts/04-rollback.sh

# Check what was removed
cat cleanup-scripts/logs/cleanup_*.log

# Compare with backup
git diff backup-pre-cleanup-* --name-only

# Report the issue with log files
```

---

### Test Failed: Verification Fails

**Symptom:** Verification script reports failures

**Debug Steps:**
```bash
# Check specific logs
cat cleanup-scripts/logs/verification_*.log
cat cleanup-scripts/logs/build_*.log
cat cleanup-scripts/logs/typecheck_*.log

# Try manual build
npm run build 2>&1 | tee manual-build.log

# Check for missing dependencies
npm list --depth=0

# Verify Prisma
npx prisma validate
```

---

### Test Failed: Rollback Doesn't Work

**Symptom:** Cannot restore from backup

**Debug Steps:**
```bash
# List all branches
git branch -a

# Manually restore
git checkout backup-pre-cleanup-*

# Check backup branch content
git log --oneline -5

# Try stash instead
git stash
git checkout backup-pre-cleanup-*
```

---

## 📊 Test Report Template

After testing, document results:

```markdown
# Cleanup Scripts Test Report

**Date:** YYYY-MM-DD
**Tester:** Your Name
**Environment:** [Linux/macOS/Windows + version]
**Branch:** test/cleanup-scripts

## Test Results

| Test | Status | Notes |
|------|--------|-------|
| 1. Analysis Script | ✅/❌ | |
| 2. Cleanup Script | ✅/❌ | |
| 3. Verification Script | ✅/❌ | |
| 4. Rollback Script | ✅/❌ | |
| 5. Full Workflow | ✅/❌ | |

## Metrics

- Files before cleanup: ___
- Files after cleanup: ___
- Files removed: ___
- Repository size before: ___
- Repository size after: ___
- Build time before: ___
- Build time after: ___

## Issues Found

1. [Describe any issues]
2. [Include error messages]
3. [Note workarounds]

## Recommendation

[ ] ✅ Approved for production use
[ ] ⚠️ Approved with caveats (list below)
[ ] ❌ Not approved (needs fixes)

**Notes:** [Any additional comments]
```

---

## 🎯 Final Checklist

Before using scripts in production:

- [ ] All test scenarios pass
- [ ] Verification script passes
- [ ] Build succeeds after cleanup
- [ ] Rollback tested and works
- [ ] No critical files removed
- [ ] Logs are readable and accurate
- [ ] Documentation matches behavior
- [ ] Team has reviewed test results
- [ ] Backup strategy confirmed
- [ ] Deployment process unchanged

**All checked? ✅ Ready for production!**

---

## 📞 Support

If tests fail or you need help:

1. Check cleanup-scripts/logs/ for details
2. Review this testing guide
3. Consult README.md troubleshooting section
4. Document issues with logs attached

---

**Remember:** Testing on a separate branch or clone is always safer than testing on your main branch!

🧪 Happy Testing! 🚀