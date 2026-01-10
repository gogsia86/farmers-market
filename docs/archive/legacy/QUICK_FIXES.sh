#!/bin/bash
# 🎯 Quick Optimization Fixes for Farmers Market Platform
# Run these commands to apply immediate optimizations

echo "╔════════════════════════════════════════════════════════╗"
echo "║  Farmers Market Platform - Quick Fixes                ║"
echo "║  Phase 1: Critical Issues Only                         ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# 1. Git Cleanup (SAFE - 5 minutes)
echo "🧹 Step 1: Cleaning Git repository..."
echo "Current git size:"
du -sh .git
echo ""
read -p "Run git garbage collection? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Running git gc --aggressive..."
    git gc --aggressive --prune=now
    echo "Running git fsck..."
    git fsck --full
    echo "✅ Git cleanup complete!"
    echo "New git size:"
    du -sh .git
    echo ""
fi

# 2. Check for large files in history
echo "🔍 Step 2: Checking for large files in Git history..."
echo "Top 10 largest files in history:"
git rev-list --objects --all | \
  git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | \
  sed -n 's/^blob //p' | \
  sort --numeric-sort --key=2 | \
  tail -10
echo ""

# 3. Show current repository statistics
echo "📊 Step 3: Repository Statistics:"
git count-objects -vH
echo ""

# 4. Verify .next is ignored
echo "🔍 Step 4: Verifying .next is properly ignored..."
NEXT_FILES=$(git ls-files .next 2>/dev/null | wc -l)
if [ "$NEXT_FILES" -eq "0" ]; then
    echo "✅ .next directory is properly ignored"
else
    echo "⚠️  Warning: $NEXT_FILES files from .next are tracked in Git"
fi
echo ""

# 5. Check untracked large files
echo "🔍 Step 5: Checking for large untracked files..."
echo "Largest untracked files (excluding node_modules):"
find . -type f -not -path "./node_modules/*" -not -path "./.git/*" -not -path "./.next/*" -size +5M 2>/dev/null | head -10
echo ""

echo "╔════════════════════════════════════════════════════════╗"
echo "║  ✅ Analysis Complete!                                ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "📝 Next Steps:"
echo "1. Review OPTIMIZATION_EXECUTIVE_SUMMARY.md"
echo "2. Fix Sentry source maps in next.config.mjs"
echo "3. Verify SENTRY_AUTH_TOKEN in Vercel dashboard"
echo "4. Deploy and test"
echo ""
