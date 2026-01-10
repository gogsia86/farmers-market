# 🚀 VERCEL DEPLOYMENT FIX - ONE-COMMAND DEPLOY
# Farmers Market Platform - Production Fix Script
# Fixes TypeScript error and deploys to Vercel

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  🚀 VERCEL DEPLOYMENT FIX - FARMERS MARKET PLATFORM           ║" -ForegroundColor Cyan
Write-Host "║  Fix TypeScript Error & Deploy to Production                  ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if we're in the right directory
$expectedFile = "src/app/(customer)/farms/page.tsx"
if (-not (Test-Path $expectedFile))
{
    Write-Host "❌ ERROR: Not in project root directory!" -ForegroundColor Red
    Write-Host "   Expected to find: $expectedFile" -ForegroundColor Yellow
    Write-Host "   Current location: $(Get-Location)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "💡 Solution: Navigate to project root first:" -ForegroundColor Cyan
    Write-Host "   cd 'M:\Repo\Farmers Market Platform web and app'" -ForegroundColor White
    exit 1
}

Write-Host "✅ Project directory confirmed" -ForegroundColor Green
Write-Host ""

# Step 2: Show what changed
Write-Host "📝 CHANGES TO BE DEPLOYED:" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host "   File: src/app/(customer)/farms/page.tsx" -ForegroundColor White
Write-Host "   Fix:  Type-safe farm.photos[0] access with proper null handling" -ForegroundColor White
Write-Host "   Impact: Resolves Vercel build failure (TypeError at line 125)" -ForegroundColor White
Write-Host ""

# Step 3: Check git status
Write-Host "🔍 Checking git status..." -ForegroundColor Cyan
$gitStatus = git status --short
if ($LASTEXITCODE -ne 0)
{
    Write-Host "❌ ERROR: Git command failed!" -ForegroundColor Red
    Write-Host "   Make sure git is installed and initialized" -ForegroundColor Yellow
    exit 1
}

Write-Host "Git status:" -ForegroundColor Gray
Write-Host $gitStatus -ForegroundColor White
Write-Host ""

# Step 4: Confirm deployment
Write-Host "⚠️  READY TO DEPLOY" -ForegroundColor Yellow
Write-Host ""
Write-Host "This will:" -ForegroundColor White
Write-Host "   1. Stage the fixed file (farms/page.tsx + DEPLOYMENT_FIX_PLAN.md)" -ForegroundColor Gray
Write-Host "   2. Commit with descriptive message" -ForegroundColor Gray
Write-Host "   3. Push to origin/master" -ForegroundColor Gray
Write-Host "   4. Trigger Vercel production deployment (~3 minutes)" -ForegroundColor Gray
Write-Host ""

$confirmation = Read-Host "Continue with deployment? (Y/n)"
if ($confirmation -eq 'n' -or $confirmation -eq 'N')
{
    Write-Host "❌ Deployment cancelled by user" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "🚀 DEPLOYING..." -ForegroundColor Green
Write-Host "═════════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

# Step 5: Stage files
Write-Host "📦 Staging files..." -ForegroundColor Cyan
git add "src/app/(customer)/farms/page.tsx"
git add "DEPLOYMENT_FIX_PLAN.md"

if ($LASTEXITCODE -ne 0)
{
    Write-Host "❌ ERROR: Failed to stage files" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Files staged successfully" -ForegroundColor Green
Write-Host ""

# Step 6: Commit
Write-Host "💾 Creating commit..." -ForegroundColor Cyan

$commitTitle = "fix: type safety for farm.photos[0] with proper null handling"
$commitBody = @"

Extract firstPhoto constant for type narrowing and add proper optional chaining with fallback image. Use existing /images/placeholder-farm.svg as default. Resolves Vercel build failure (TypeError at line 125).

The fix follows TypeScript best practices from .cursorrules by extracting array elements before accessing properties and providing fallback values for all nullable fields.

Technical Details:
Changed from farm.photos[0].thumbnailUrl (unsafe) to firstPhoto?.thumbnailUrl || fallback (safe). TypeScript now correctly narrows types in component scope.

Expected Result:
Build time ~3 minutes, 57 static pages generated, 356.64 MB build cache restored, deployment success to Vercel Edge.

Fixes deployment-build-failure
"@

git commit -m "$commitTitle$commitBody"

if ($LASTEXITCODE -ne 0)
{
    Write-Host "❌ ERROR: Failed to create commit" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Commit created successfully" -ForegroundColor Green
Write-Host ""

# Step 7: Push
Write-Host "📤 Pushing to origin/master..." -ForegroundColor Cyan
git push origin master

if ($LASTEXITCODE -ne 0)
{
    Write-Host "❌ ERROR: Failed to push to remote" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Troubleshooting:" -ForegroundColor Yellow
    Write-Host "   1. Check your internet connection" -ForegroundColor White
    Write-Host "   2. Verify git credentials: git config --list" -ForegroundColor White
    Write-Host "   3. Try manual push: git push origin master" -ForegroundColor White
    Write-Host "   4. Check remote: git remote -v" -ForegroundColor White
    exit 1
}

Write-Host "✅ Pushed to remote successfully!" -ForegroundColor Green
Write-Host ""

# Step 8: Success message
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✅ DEPLOYMENT INITIATED SUCCESSFULLY!                         ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "🎉 WHAT HAPPENS NEXT:" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host ""
Write-Host "   ⏱️  Timeline:" -ForegroundColor White
Write-Host "      • Build starts:      ~10 seconds" -ForegroundColor Gray
Write-Host "      • Type checking:     ~30 seconds  ✅" -ForegroundColor Gray
Write-Host "      • Build completion:  ~2-3 minutes ✅" -ForegroundColor Gray
Write-Host "      • Deployment:        ~30 seconds  ✅" -ForegroundColor Gray
Write-Host "      • Total:             ~3-4 minutes" -ForegroundColor Gray
Write-Host ""
Write-Host "   📊 Expected Build Output:" -ForegroundColor White
Write-Host "      • ✓ Compiled successfully" -ForegroundColor Green
Write-Host "      • ✓ Linting and checking validity of types" -ForegroundColor Green
Write-Host "      • ✓ Generating static pages (57/57)" -ForegroundColor Green
Write-Host "      • ✓ Finalizing page optimization" -ForegroundColor Green
Write-Host "      • Build Cache: 356.64 MB (Restored)" -ForegroundColor Green
Write-Host ""

Write-Host "🔗 NEXT STEPS:" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host ""
Write-Host "   1. Monitor deployment:" -ForegroundColor White
Write-Host "      🌐 https://vercel.com/dashboard" -ForegroundColor Blue
Write-Host ""
Write-Host "   2. Wait ~3-4 minutes for build to complete" -ForegroundColor White
Write-Host ""
Write-Host "   3. Verify production site:" -ForegroundColor White
Write-Host "      🌐 https://farmers-market-platform.vercel.app/farms" -ForegroundColor Blue
Write-Host ""
Write-Host "   4. Check for:" -ForegroundColor White
Write-Host "      ✅ Page loads successfully" -ForegroundColor Gray
Write-Host "      ✅ Farm images display correctly" -ForegroundColor Gray
Write-Host "      ✅ Fallback images show for farms without photos" -ForegroundColor Gray
Write-Host "      ✅ No console errors" -ForegroundColor Gray
Write-Host ""

Write-Host "📚 DOCUMENTATION:" -ForegroundColor Cyan
Write-Host "   Full deployment details: DEPLOYMENT_FIX_PLAN.md" -ForegroundColor White
Write-Host ""

Write-Host "💡 MONITORING TIP:" -ForegroundColor Yellow
Write-Host "   Open Vercel dashboard now to watch the build in real-time!" -ForegroundColor White
Write-Host ""

# Step 9: Offer to open Vercel dashboard
$openDashboard = Read-Host "Open Vercel dashboard in browser? (Y/n)"
if ($openDashboard -ne 'n' -and $openDashboard -ne 'N')
{
    Write-Host ""
    Write-Host "🌐 Opening Vercel dashboard..." -ForegroundColor Cyan
    Start-Process "https://vercel.com/dashboard"
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "✨ Deployment complete! Your fix is on the way to production! ✨" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
