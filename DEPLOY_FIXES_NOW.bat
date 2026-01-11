@echo off
REM ============================================================================
REM Production Fixes Deployment Script
REM Fixes: 404 errors, Prisma issues, and error handling
REM ============================================================================

echo.
echo ========================================
echo Production Fixes Deployment
echo ========================================
echo.

REM Navigate to project directory
cd /d "M:\Repo\Farmers Market Platform web and app"

echo [1/10] Checking Git status...
git status

echo.
echo [2/10] Regenerating Prisma Client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo ERROR: Prisma generate failed!
    pause
    exit /b 1
)

echo.
echo [3/10] Validating Prisma Schema...
call npx prisma validate
if %errorlevel% neq 0 (
    echo ERROR: Prisma validation failed!
    pause
    exit /b 1
)

echo.
echo [4/10] Checking TypeScript...
call npm run type-check
if %errorlevel% neq 0 (
    echo WARNING: TypeScript errors found. Continue? (Press Ctrl+C to abort)
    pause
)

echo.
echo [5/10] Running Linter...
call npm run lint
if %errorlevel% neq 0 (
    echo WARNING: Linting issues found. Continue? (Press Ctrl+C to abort)
    pause
)

echo.
echo [6/10] Building Project...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)

echo.
echo [7/10] Creating Git Branch...
git checkout -b fix/production-404-and-prisma-errors
if %errorlevel% neq 0 (
    echo Branch already exists or checkout failed. Continuing...
)

echo.
echo [8/10] Staging Changes...
git add .

echo.
echo [9/10] Committing Changes...
git commit -m "fix: resolve production 404 errors and Prisma field issues

- Add /orders redirect route with role-based navigation
- Add error boundaries for customer dashboard
- Add error boundaries and loading state for admin notifications
- Regenerate Prisma client to fix field name issues
- Preserve query parameters in redirects
- Add comprehensive error handling with error IDs

Fixes:
- /orders?status=PROCESSING 404
- /customer/dashboard 404
- /admin/notifications 404
- Admin dashboard Prisma error (type field)
- Settings save failure
- Farm approval errors
- Admin orders error (ID: 2958323098)

Files Added:
- src/app/orders/page.tsx
- src/app/(customer)/customer/dashboard/error.tsx
- src/app/(admin)/admin/notifications/error.tsx
- src/app/(admin)/admin/notifications/loading.tsx
- PRODUCTION_BUGS_ANALYSIS.md
- QUICK_FIX_SCRIPT.md
- PRODUCTION_FIXES_APPLIED.md"

if %errorlevel% neq 0 (
    echo ERROR: Git commit failed!
    pause
    exit /b 1
)

echo.
echo [10/10] Pushing to GitHub...
git push origin fix/production-404-and-prisma-errors
if %errorlevel% neq 0 (
    echo ERROR: Git push failed!
    echo.
    echo Please push manually:
    echo   git push origin fix/production-404-and-prisma-errors
    pause
    exit /b 1
)

echo.
echo ========================================
echo SUCCESS! Fixes Deployed to GitHub
echo ========================================
echo.
echo Next Steps:
echo 1. Go to GitHub and create a Pull Request
echo 2. Review changes and merge to main
echo 3. Vercel will auto-deploy
echo.
echo OR merge directly to main:
echo   git checkout main
echo   git merge fix/production-404-and-prisma-errors
echo   git push origin main
echo.
echo After deployment, test these URLs:
echo   - https://farmers-market-platform.vercel.app/orders?status=PROCESSING
echo   - https://farmers-market-platform.vercel.app/customer/dashboard
echo   - https://farmers-market-platform.vercel.app/admin/notifications
echo   - https://farmers-market-platform.vercel.app/admin
echo   - https://farmers-market-platform.vercel.app/admin/farms
echo   - https://farmers-market-platform.vercel.app/admin/orders
echo   - https://farmers-market-platform.vercel.app/settings
echo.
echo Monitoring:
echo   - Check Vercel deployment logs
echo   - Check Sentry for errors
echo   - Monitor error rates for 24 hours
echo.
echo Documentation:
echo   - PRODUCTION_BUGS_ANALYSIS.md - Detailed issue analysis
echo   - QUICK_FIX_SCRIPT.md - Step-by-step fixes
echo   - PRODUCTION_FIXES_APPLIED.md - Deployment guide
echo.
pause
