# 🚀 START NOW - Quick Execution Script (PowerShell)
# Farmers Market Platform - Path to 100%

$ErrorActionPreference = "Stop"

Write-Host "🌾 Farmers Market Platform - FINISH THIS! 🚜" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Progress tracking
$PHASE_1_COMPLETE = 2
$PHASE_1_TOTAL = 8
$TOTAL_COMPLETE = 2
$TOTAL_TASKS = 32
$PHASE_1_PERCENT = [math]::Round(($PHASE_1_COMPLETE / $PHASE_1_TOTAL) * 100)
$OVERALL_PERCENT = [math]::Round(($TOTAL_COMPLETE / $TOTAL_TASKS) * 100)

Write-Host "📊 Current Progress:" -ForegroundColor Blue
Write-Host "   Phase 1: $PHASE_1_COMPLETE/$PHASE_1_TOTAL tasks ($PHASE_1_PERCENT%)"
Write-Host "   Overall: $TOTAL_COMPLETE/$TOTAL_TASKS tasks ($OVERALL_PERCENT%)"
Write-Host ""

Write-Host "✅ Completed Tasks:" -ForegroundColor Green
Write-Host "   [x] 1.1 - Fix Vercel Deployment"
Write-Host "   [x] 1.4 - Security Audit (Source Maps)"
Write-Host ""

Write-Host "🔥 NEXT ACTIONS (Do Now!):" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. FIX SENTRY CONFIGURATION (30 min)" -ForegroundColor Red
Write-Host "   - Go to: https://sentry.io/settings/account/api/auth-tokens/"
Write-Host "   - Create token with: project:releases, org:read"
Write-Host "   - Run: vercel env add SENTRY_AUTH_TOKEN production"
Write-Host "   - Test: `$env:SENTRY_AUTH_TOKEN='your-token'; npm run build"
Write-Host ""

Write-Host "2. VERIFY TEST SUITE (3 hours)" -ForegroundColor Red
Write-Host "   - Run: npm test"
Write-Host "   - Fix any failures"
Write-Host "   - Run: npm run test:coverage"
Write-Host "   - Document results"
Write-Host ""

Write-Host "3. ENVIRONMENT AUDIT (2 hours)" -ForegroundColor Red
Write-Host "   - Review all env vars"
Write-Host "   - Update .env.example"
Write-Host "   - Create docs/ENVIRONMENT_VARIABLES.md"
Write-Host ""

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📖 Read These Files:" -ForegroundColor Blue
Write-Host "   1. FINISH_THIS.md        - Complete execution plan"
Write-Host "   2. TODO.md               - Full task list (32 tasks)"
Write-Host "   3. PHASE_1_TRACKER.md    - Phase 1 progress tracker"
Write-Host ""

Write-Host "🎯 Today's Goal:" -ForegroundColor Blue
Write-Host "   Complete Phase 1 (all 8 tasks) = 25% overall progress"
Write-Host ""

Write-Host "🎊 After Phase 1:" -ForegroundColor Blue
Write-Host "   - Deployment working ✅"
Write-Host "   - Tests verified ✅"
Write-Host "   - Critical blockers removed ✅"
Write-Host "   - Ready for Phase 2 ✅"
Write-Host ""

# Interactive menu
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "What do you want to do?" -ForegroundColor Yellow
Write-Host ""
Write-Host "1) Start Task 1.2 - Fix Sentry (30 min)"
Write-Host "2) Start Task 1.3 - Verify Tests (3 hours)"
Write-Host "3) View full TODO list"
Write-Host "4) View Phase 1 tracker"
Write-Host "5) Run tests now"
Write-Host "6) Check deployment status"
Write-Host "7) Exit"
Write-Host ""

$choice = Read-Host "Enter choice [1-7]"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "🔥 TASK 1.2: FIX SENTRY CONFIGURATION" -ForegroundColor Green
        Write-Host ""
        Write-Host "Step 1: Get Sentry auth token"
        Write-Host "   → Open: https://sentry.io/settings/account/api/auth-tokens/"
        Write-Host "   → Click: 'Create New Token'"
        Write-Host "   → Scopes: project:releases, org:read"
        Write-Host "   → Copy the token"
        Write-Host ""
        Write-Host "Step 2: Add to Vercel"
        $hasToken = Read-Host "Have you copied your Sentry token? (y/n)"
        if ($hasToken -eq "y") {
            Write-Host "   → Running: vercel env add SENTRY_AUTH_TOKEN production"
            vercel env add SENTRY_AUTH_TOKEN production
        } else {
            Write-Host "   → Please get your token first, then run this script again"
            exit 0
        }
        Write-Host ""
        Write-Host "Step 3: Test locally"
        $token = Read-Host "Enter your Sentry token to test" -AsSecureString
        $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($token)
        $plainToken = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
        $env:SENTRY_AUTH_TOKEN = $plainToken
        Write-Host "   → Running: npm run build"
        npm run build
        Write-Host ""
        Write-Host "✅ Task 1.2 Complete!" -ForegroundColor Green
        Write-Host "   → Update PHASE_1_TRACKER.md"
        Write-Host "   → Commit changes: git add . && git commit -m 'fix: configure Sentry auth token'"
        Write-Host "   → Push: git push"
    }
    "2" {
        Write-Host ""
        Write-Host "🔥 TASK 1.3: VERIFY TEST SUITE" -ForegroundColor Green
        Write-Host ""
        Write-Host "Running full test suite... (this may take several minutes)"
        Write-Host ""
        npm test | Tee-Object -FilePath test-results.txt
        Write-Host ""
        Write-Host "Generating coverage report..."
        npm run test:coverage
        Write-Host ""
        Write-Host "✅ Tests complete!" -ForegroundColor Green
        Write-Host "   → Review test-results.txt for details"
        Write-Host "   → Check coverage/index.html for coverage report"
        Write-Host "   → Document any failures in TEST_RESULTS.md"
    }
    "3" {
        Write-Host ""
        Get-Content TODO.md | Out-Host -Paging
    }
    "4" {
        Write-Host ""
        Get-Content PHASE_1_TRACKER.md | Out-Host -Paging
    }
    "5" {
        Write-Host ""
        Write-Host "Running tests..."
        npm test
    }
    "6" {
        Write-Host ""
        Write-Host "Checking deployment status..."
        vercel ls
        Write-Host ""
        Write-Host "Latest deployment logs:"
        vercel logs --follow
    }
    "7" {
        Write-Host ""
        Write-Host "Thanks for checking in! Remember:" -ForegroundColor Blue
        Write-Host "   - Read FINISH_THIS.md for the complete plan"
        Write-Host "   - Start with Task 1.2 (Sentry configuration)"
        Write-Host "   - Focus on one task at a time"
        Write-Host "   - Update trackers as you go"
        Write-Host "   - Commit and push often"
        Write-Host ""
        Write-Host "LET'S FINISH THIS! 🚀" -ForegroundColor Green
        exit 0
    }
    default {
        Write-Host ""
        Write-Host "Invalid choice. Please run the script again." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "🎉 Great work! Keep going!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:"
Write-Host "   1. Update PHASE_1_TRACKER.md"
Write-Host "   2. Commit your changes"
Write-Host "   3. Move to the next task"
Write-Host ""
Write-Host "Progress: $TOTAL_COMPLETE/$TOTAL_TASKS tasks → 100%" -ForegroundColor Blue
Write-Host ""
Write-Host "🌾 Let's reach 100%! 🚜" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
