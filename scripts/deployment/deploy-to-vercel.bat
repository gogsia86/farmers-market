@echo off
setlocal enabledelayedexpansion

REM =============================================================================
REM 🚀 DEPLOY TO VERCEL - Windows Deployment Helper
REM =============================================================================
REM
REM This script guides you through deploying the Farmers Market Platform to Vercel
REM with proper error checking and validation.
REM
REM Usage: deploy-to-vercel.bat
REM
REM =============================================================================

title Vercel Deployment Assistant

REM Colors (limited in Windows cmd)
set "GREEN=[92m"
set "YELLOW=[93m"
set "RED=[91m"
set "BLUE=[94m"
set "CYAN=[96m"
set "PURPLE=[95m"
set "NC=[0m"

cls
echo.
echo %PURPLE%════════════════════════════════════════════════════════════════════════%NC%
echo %PURPLE%  🚀 VERCEL DEPLOYMENT ASSISTANT%NC%
echo %PURPLE%════════════════════════════════════════════════════════════════════════%NC%
echo.
echo %CYAN%ℹ️  This script will guide you through deploying to Vercel%NC%
echo.
pause

REM =============================================================================
REM STEP 1: PRE-DEPLOYMENT CHECKS
REM =============================================================================

cls
echo.
echo %PURPLE%════════════════════════════════════════════════════════════════════════%NC%
echo %PURPLE%  📋 STEP 1: PRE-DEPLOYMENT CHECKS%NC%
echo %PURPLE%════════════════════════════════════════════════════════════════════════%NC%
echo.

REM Check if git is installed
echo %BLUE%▶ Checking Git installation...%NC%
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo %RED%❌ Git is not installed. Please install Git first.%NC%
    echo %CYAN%Download from: https://git-scm.com/download/win%NC%
    pause
    exit /b 1
)
echo %GREEN%✅ Git is installed%NC%
echo.

REM Check if we're in a git repository
echo %BLUE%▶ Checking Git repository...%NC%
git rev-parse --is-inside-work-tree >nul 2>nul
if %errorlevel% neq 0 (
    echo %RED%❌ Not in a Git repository. Please run this from the project root.%NC%
    pause
    exit /b 1
)
echo %GREEN%✅ Git repository detected%NC%
echo.

REM Check for uncommitted changes
echo %BLUE%▶ Checking for uncommitted changes...%NC%
git diff-index --quiet HEAD -- >nul 2>nul
if %errorlevel% neq 0 (
    echo %YELLOW%⚠️  You have uncommitted changes%NC%
    echo.
    set /p commit_now="Do you want to commit them now? (y/n): "
    if /i "!commit_now!"=="y" (
        git add .
        set /p commit_msg="Enter commit message: "
        git commit -m "!commit_msg!"
        echo %GREEN%✅ Changes committed%NC%
    ) else (
        echo %CYAN%ℹ️  Continuing with uncommitted changes...%NC%
    )
) else (
    echo %GREEN%✅ No uncommitted changes%NC%
)
echo.

REM Check if Node.js is installed
echo %BLUE%▶ Checking Node.js installation...%NC%
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo %RED%❌ Node.js is not installed. Please install Node.js 20+ first.%NC%
    echo %CYAN%Download from: https://nodejs.org/%NC%
    pause
    exit /b 1
)
for /f "delims=" %%i in ('node -v') do set NODE_VERSION=%%i
echo %GREEN%✅ Node.js %NODE_VERSION% installed%NC%
echo.

REM Check if npm is installed
echo %BLUE%▶ Checking npm installation...%NC%
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo %RED%❌ npm is not installed. Please install npm first.%NC%
    pause
    exit /b 1
)
for /f "delims=" %%i in ('npm -v') do set NPM_VERSION=%%i
echo %GREEN%✅ npm %NPM_VERSION% installed%NC%
echo.

pause

REM =============================================================================
REM STEP 2: VERIFY BUILD LOCALLY
REM =============================================================================

cls
echo.
echo %PURPLE%════════════════════════════════════════════════════════════════════════%NC%
echo %PURPLE%  🏗️  STEP 2: VERIFY BUILD LOCALLY%NC%
echo %PURPLE%════════════════════════════════════════════════════════════════════════%NC%
echo.

set /p test_build="Do you want to test the build locally first? (Recommended) (y/n): "
if /i "!test_build!"=="y" (
    echo.
    echo %BLUE%▶ Installing dependencies...%NC%
    call npm install

    echo.
    echo %BLUE%▶ Running type check...%NC%
    call npm run type-check
    if %errorlevel% neq 0 (
        echo %RED%❌ Type check failed. Please fix TypeScript errors first.%NC%
        pause
        exit /b 1
    )
    echo %GREEN%✅ Type check passed%NC%

    echo.
    echo %BLUE%▶ Running build...%NC%
    call npm run build
    if %errorlevel% neq 0 (
        echo %RED%❌ Build failed. Please fix errors before deploying.%NC%
        pause
        exit /b 1
    )
    echo %GREEN%✅ Build succeeded locally%NC%
) else (
    echo %YELLOW%⚠️  Skipping local build test%NC%
)
echo.

pause

REM =============================================================================
REM STEP 3: DATABASE SETUP
REM =============================================================================

cls
echo.
echo %PURPLE%════════════════════════════════════════════════════════════════════════%NC%
echo %PURPLE%  🗄️  STEP 3: DATABASE CONFIGURATION%NC%
echo %PURPLE%════════════════════════════════════════════════════════════════════════%NC%
echo.

echo %CYAN%ℹ️  You need a PostgreSQL database for production%NC%
echo.
echo Options:
echo   1. Neon (Recommended - Free tier available)
echo   2. Vercel Postgres
echo   3. Railway
echo   4. I already have a database
echo.

set /p db_option="Select option (1-4): "

if "!db_option!"=="1" (
    echo.
    echo %CYAN%ℹ️  Setting up Neon database...%NC%
    echo.
    echo Steps:
    echo   1. Go to https://neon.tech
    echo   2. Sign up and create a new project
    echo   3. Copy the connection string
    echo.
    echo %YELLOW%Press Enter after completing these steps...%NC%
    pause >nul
)

if "!db_option!"=="2" (
    echo.
    echo %CYAN%ℹ️  Setting up Vercel Postgres...%NC%
    echo.
    echo Steps:
    echo   1. Go to Vercel Dashboard → Storage
    echo   2. Create a new Postgres database
    echo   3. Copy the POSTGRES_PRISMA_URL
    echo.
    echo %YELLOW%Press Enter after completing these steps...%NC%
    pause >nul
)

if "!db_option!"=="3" (
    echo.
    echo %CYAN%ℹ️  Setting up Railway database...%NC%
    echo.
    echo Steps:
    echo   1. Go to https://railway.app
    echo   2. Create new project → Add PostgreSQL
    echo   3. Copy DATABASE_URL from Variables tab
    echo.
    echo %YELLOW%Press Enter after completing these steps...%NC%
    pause >nul
)

if "!db_option!"=="4" (
    echo %GREEN%✅ Using existing database%NC%
)

echo.
echo %CYAN%ℹ️  You'll need to add DATABASE_URL to Vercel environment variables%NC%
echo.

pause

REM =============================================================================
REM STEP 4: VERCEL CLI CHECK
REM =============================================================================

cls
echo.
echo %PURPLE%════════════════════════════════════════════════════════════════════════%NC%
echo %PURPLE%  🔧 STEP 4: VERCEL CLI CHECK%NC%
echo %PURPLE%════════════════════════════════════════════════════════════════════════%NC%
echo.

echo %BLUE%▶ Checking Vercel CLI installation...%NC%
where vercel >nul 2>nul
if %errorlevel% neq 0 (
    echo %YELLOW%⚠️  Vercel CLI not installed%NC%
    set /p install_cli="Do you want to install it now? (y/n): "
    if /i "!install_cli!"=="y" (
        call npm install -g vercel
        echo %GREEN%✅ Vercel CLI installed%NC%
    ) else (
        echo %CYAN%ℹ️  You can deploy via GitHub integration instead%NC%
    )
) else (
    for /f "delims=" %%i in ('vercel -v') do set VERCEL_VERSION=%%i
    echo %GREEN%✅ Vercel CLI !VERCEL_VERSION! installed%NC%
)
echo.

pause

REM =============================================================================
REM STEP 5: DEPLOYMENT METHOD
REM =============================================================================

cls
echo.
echo %PURPLE%════════════════════════════════════════════════════════════════════════%NC%
echo %PURPLE%  🚀 STEP 5: CHOOSE DEPLOYMENT METHOD%NC%
echo %PURPLE%════════════════════════════════════════════════════════════════════════%NC%
echo.

echo How would you like to deploy?
echo   1. GitHub Integration (Automatic - Recommended)
echo   2. Vercel CLI (Manual)
echo.

set /p deploy_option="Select option (1-2): "

if "!deploy_option!"=="1" (
    cls
    echo.
    echo %PURPLE%════════════════════════════════════════════════════════════════════════%NC%
    echo %PURPLE%  🔗 GITHUB INTEGRATION DEPLOYMENT%NC%
    echo %PURPLE%════════════════════════════════════════════════════════════════════════%NC%
    echo.

    echo %BLUE%▶ Step 1: Push code to GitHub%NC%
    echo.

    for /f "delims=" %%i in ('git rev-parse --abbrev-ref HEAD') do set CURRENT_BRANCH=%%i
    echo %CYAN%ℹ️  Current branch: !CURRENT_BRANCH!%NC%
    echo.

    set /p push_now="Push to GitHub now? (y/n): "
    if /i "!push_now!"=="y" (
        git push origin !CURRENT_BRANCH!
        echo %GREEN%✅ Code pushed to GitHub%NC%
    )

    echo.
    echo %BLUE%▶ Step 2: Connect to Vercel%NC%
    echo.
    echo Next steps:
    echo   1. Go to https://vercel.com/dashboard
    echo   2. Click 'Add New...' → 'Project'
    echo   3. Import your Git repository
    echo   4. Configure environment variables (see below)
    echo   5. Click 'Deploy'
    echo.
)

if "!deploy_option!"=="2" (
    cls
    echo.
    echo %PURPLE%════════════════════════════════════════════════════════════════════════%NC%
    echo %PURPLE%  💻 VERCEL CLI DEPLOYMENT%NC%
    echo %PURPLE%════════════════════════════════════════════════════════════════════════%NC%
    echo.

    where vercel >nul 2>nul
    if %errorlevel% neq 0 (
        echo %RED%❌ Vercel CLI not installed. Please install it first:%NC%
        echo   npm install -g vercel
        pause
        exit /b 1
    )

    echo %BLUE%▶ Logging into Vercel...%NC%
    call vercel login

    echo.
    echo %BLUE%▶ Deploying to Vercel...%NC%
    set /p prod_deploy="Deploy to production? (y/n): "
    if /i "!prod_deploy!"=="y" (
        call vercel --prod
    ) else (
        call vercel
    )
)

pause

REM =============================================================================
REM STEP 6: ENVIRONMENT VARIABLES CHECKLIST
REM =============================================================================

cls
echo.
echo %PURPLE%════════════════════════════════════════════════════════════════════════%NC%
echo %PURPLE%  🔐 STEP 6: ENVIRONMENT VARIABLES%NC%
echo %PURPLE%════════════════════════════════════════════════════════════════════════%NC%
echo.

echo %YELLOW%⚠️  IMPORTANT: Add these environment variables in Vercel Dashboard%NC%
echo Go to: Settings → Environment Variables
echo.

echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo REQUIRED VARIABLES:
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 1. DATABASE_URL
echo    Value: postgresql://user:pass@host:5432/database?sslmode=require
echo    Environments: Production, Preview, Development
echo.
echo 2. NEXTAUTH_SECRET
echo    Generate with: openssl rand -base64 32
echo    Or PowerShell: [Convert]::ToBase64String((1..32^|%%{Get-Random -Max 256}))
echo    Environments: Production, Preview, Development
echo.
echo 3. NEXTAUTH_URL
echo    Value: https://your-project.vercel.app
echo    Environments: Production, Preview, Development
echo.
echo 4. STRIPE_SECRET_KEY
echo    Value: sk_test_51xxxxx (from Stripe dashboard)
echo    Environments: Production, Preview, Development
echo.
echo 5. STRIPE_PUBLISHABLE_KEY
echo    Value: pk_test_51xxxxx (from Stripe dashboard)
echo    Environments: Production, Preview, Development
echo.
echo 6. NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
echo    Value: pk_test_51xxxxx (same as above)
echo    Environments: Production, Preview, Development
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo OPTIONAL VARIABLES:
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 7. RESEND_API_KEY (for email notifications)
echo 8. CLOUDINARY_CLOUD_NAME (for image uploads)
echo 9. CLOUDINARY_API_KEY
echo 10. CLOUDINARY_API_SECRET
echo 11. SENTRY_DSN (for error tracking)
echo.

echo %YELLOW%Press Enter after you've added the environment variables...%NC%
pause >nul

REM =============================================================================
REM STEP 7: POST-DEPLOYMENT
REM =============================================================================

cls
echo.
echo %PURPLE%════════════════════════════════════════════════════════════════════════%NC%
echo %PURPLE%  ✅ STEP 7: POST-DEPLOYMENT SETUP%NC%
echo %PURPLE%════════════════════════════════════════════════════════════════════════%NC%
echo.

echo %CYAN%ℹ️  After deployment completes, you need to:%NC%
echo.
echo 1. Initialize the database:
echo    set DATABASE_URL=your_production_database_url
echo    npx prisma db push
echo    npm run db:seed:basic
echo.
echo 2. Test your site:
echo    Visit: https://your-project.vercel.app
echo    Try signing up and logging in
echo.
echo 3. Monitor deployment:
echo    Vercel Dashboard → Deployments
echo    Check logs for any errors
echo.

pause

REM =============================================================================
REM COMPLETION
REM =============================================================================

cls
echo.
echo %PURPLE%════════════════════════════════════════════════════════════════════════%NC%
echo %PURPLE%  🎉 DEPLOYMENT PROCESS STARTED%NC%
echo %PURPLE%════════════════════════════════════════════════════════════════════════%NC%
echo.

echo %GREEN%✅ Great job! Your deployment is in progress.%NC%
echo.
echo %CYAN%ℹ️  What to do next:%NC%
echo.
echo 1. ⏱️  Wait 6-8 minutes for build to complete
echo 2. 👀 Monitor: https://vercel.com/dashboard
echo 3. 🗄️  Initialize database (see above)
echo 4. 🧪 Test your live site
echo 5. 📊 Check analytics and logs
echo.
echo %CYAN%ℹ️  For detailed troubleshooting, see: VERCEL_DEPLOYMENT_GUIDE.md%NC%
echo.
echo %GREEN%✅ Happy deploying! 🚀🌾%NC%
echo.

pause
exit /b 0
