@echo off
setlocal enabledelayedexpansion

REM 🌾 Interactive Stripe Setup Script - Windows Version
REM Divine Agricultural E-Commerce Platform
REM Version: 1.0.0

echo.
echo ============================================================
echo   🌾 STRIPE SETUP - INTERACTIVE GUIDE
echo   Divine Agricultural Payment Integration
echo ============================================================
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo [ERROR] Not in project root directory!
    echo Please run this script from: M:\Repo\Farmers Market Platform web and app
    pause
    exit /b 1
)

REM Check if Stripe CLI is installed
if not exist ".stripe-cli\stripe.exe" (
    echo [ERROR] Stripe CLI not found in .stripe-cli\ directory
    echo Please install Stripe CLI first.
    pause
    exit /b 1
)

echo [OK] Stripe CLI found
echo.

REM ============================================
REM STEP 1: Check Stripe Version
REM ============================================
echo ============================================================
echo ⚡ STEP 1: Verify Stripe CLI Installation
echo ============================================================
echo.

echo Checking Stripe CLI version...
.\.stripe-cli\stripe.exe --version
echo.

REM ============================================
REM STEP 2: Authenticate with Stripe
REM ============================================
echo ============================================================
echo 🔐 STEP 2: Authenticate with Stripe
echo ============================================================
echo.

echo Checking if already authenticated...
.\.stripe-cli\stripe.exe config --list >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Already authenticated with Stripe!
    echo.
    .\.stripe-cli\stripe.exe config --list
    echo.
    set /p REAUTH="Do you want to re-authenticate? (y/n): "
    if /i "!REAUTH!"=="y" (
        echo.
        echo Re-authenticating...
        .\.stripe-cli\stripe.exe login
    )
) else (
    echo [WARNING] Not authenticated yet.
    echo.
    echo This will open your browser to authenticate.
    echo 1. Browser will open automatically
    echo 2. Click 'Allow access' button
    echo 3. Return to this terminal
    echo.
    pause
    echo.
    echo Opening browser for authentication...
    .\.stripe-cli\stripe.exe login
    echo.
    echo [OK] Authentication complete!
)

echo.

REM ============================================
REM STEP 3: Get API Keys
REM ============================================
echo ============================================================
echo 🔑 STEP 3: Get Your Stripe API Keys
echo ============================================================
echo.

echo You need to get your test API keys from the Stripe Dashboard.
echo.
echo [IMPORTANT] Make sure you're in TEST MODE!
echo.
echo 1. URL: https://dashboard.stripe.com/test/apikeys
echo 2. Make sure the toggle says 'Test mode' (NOT Live mode)
echo 3. Copy both keys:
echo    - Publishable key (starts with pk_test_)
echo    - Secret key (starts with sk_test_)
echo.

set /p OPEN_BROWSER="Do you want to open the Stripe Dashboard? (y/n): "
if /i "!OPEN_BROWSER!"=="y" (
    echo.
    echo Opening Stripe Dashboard...
    start https://dashboard.stripe.com/test/apikeys
    echo.
    echo [OK] Dashboard should be opening...
)

echo.
echo Once you have your keys, press any key to continue...
pause >nul

REM ============================================
REM STEP 4: Enter API Keys
REM ============================================
echo.
echo ============================================================
echo 🔑 STEP 4: Enter Your API Keys
echo ============================================================
echo.

echo Please paste your keys here:
echo.

REM Get Publishable Key
set /p PUBLISHABLE_KEY="Publishable Key (pk_test_...): "

REM Validate publishable key
echo !PUBLISHABLE_KEY! | findstr /b "pk_test_" >nul
if %errorlevel% neq 0 (
    echo [WARNING] Key doesn't start with 'pk_test_'
    set /p CONTINUE="Continue anyway? (y/n): "
    if /i not "!CONTINUE!"=="y" (
        echo Setup cancelled.
        pause
        exit /b 1
    )
)

echo.

REM Get Secret Key
set /p SECRET_KEY="Secret Key (sk_test_...): "

REM Validate secret key
echo !SECRET_KEY! | findstr /b "sk_test_" >nul
if %errorlevel% neq 0 (
    echo [WARNING] Key doesn't start with 'sk_test_'
    set /p CONTINUE="Continue anyway? (y/n): "
    if /i not "!CONTINUE!"=="y" (
        echo Setup cancelled.
        pause
        exit /b 1
    )
)

echo.
echo [OK] Keys received!

REM ============================================
REM STEP 5: Update .env.local
REM ============================================
echo.
echo ============================================================
echo ⚡ STEP 5: Update .env.local File
echo ============================================================
echo.

set ENV_FILE=.env.local

REM Backup existing .env.local if it exists
if exist "%ENV_FILE%" (
    echo Creating backup of existing .env.local...
    for /f "tokens=1-4 delims=/ " %%a in ('date /t') do (set mydate=%%c%%a%%b)
    for /f "tokens=1-2 delims=: " %%a in ('time /t') do (set mytime=%%a%%b)
    set BACKUP_FILE=.env.local.backup.!mydate!_!mytime!
    copy "%ENV_FILE%" "!BACKUP_FILE!" >nul
    echo [OK] Backup created: !BACKUP_FILE!
)

echo.
echo Updating Stripe keys in .env.local...

REM Create temporary file with updated content
if exist "%ENV_FILE%" (
    REM Update existing file
    set KEY_UPDATED=0

    REM Read and update file
    (
        for /f "usebackq delims=" %%a in ("%ENV_FILE%") do (
            set "line=%%a"
            if "!line:~0,36!"=="NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=" (
                echo NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=!PUBLISHABLE_KEY!
                set KEY_UPDATED=1
            ) else if "!line:~0,18!"=="STRIPE_SECRET_KEY=" (
                echo STRIPE_SECRET_KEY=!SECRET_KEY!
            ) else if "!line:~0,21!"=="STRIPE_WEBHOOK_SECRET=" (
                echo STRIPE_WEBHOOK_SECRET=whsec_WILL_UPDATE_IN_STEP_7
            ) else (
                echo !line!
            )
        )

        REM Add keys if they weren't in the file
        if !KEY_UPDATED! equ 0 (
            echo.
            echo # Stripe Keys (added by setup script)
            echo NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=!PUBLISHABLE_KEY!
            echo STRIPE_SECRET_KEY=!SECRET_KEY!
            echo STRIPE_WEBHOOK_SECRET=whsec_WILL_UPDATE_IN_STEP_7
        )
    ) > "%ENV_FILE%.tmp"

    move /y "%ENV_FILE%.tmp" "%ENV_FILE%" >nul
) else (
    REM Create new file
    (
        echo # Stripe Test Keys (Generated by setup script)
        echo NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=!PUBLISHABLE_KEY!
        echo STRIPE_SECRET_KEY=!SECRET_KEY!
        echo STRIPE_WEBHOOK_SECRET=whsec_WILL_UPDATE_IN_STEP_7
        echo.
        echo # Database (Update with your database URL)
        echo DATABASE_URL="postgresql://user:password@localhost:5432/farmers_market"
        echo.
        echo # NextAuth (Update with your values)
        echo NEXTAUTH_URL=http://localhost:3001
        echo NEXTAUTH_SECRET=your-secret-here
    ) > "%ENV_FILE%"
)

echo [OK] .env.local updated successfully!

REM ============================================
REM STEP 6: Summary
REM ============================================
echo.
echo ============================================================
echo 🚀 SETUP COMPLETE!
echo ============================================================
echo.

echo [OK] Stripe CLI authenticated
echo [OK] API keys configured
echo [OK] .env.local file updated
echo.

echo ============================================================
echo   NEXT STEPS
echo ============================================================
echo.
echo 1. Start the development server:
echo    npm run dev:omen
echo.
echo 2. In a NEW terminal, start webhook forwarding:
echo    .\.stripe-cli\stripe.exe listen --forward-to localhost:3001/api/webhooks/stripe
echo.
echo 3. Copy the webhook secret (whsec_...) and update .env.local
echo.
echo 4. Restart the dev server
echo.
echo 5. Run manual tests:
echo    .\.stripe-cli\stripe.exe trigger payment_intent.succeeded
echo.
echo For detailed testing instructions, see:
echo   - DO_THIS_NOW.md
echo   - PRIORITY_2_PROGRESS.md
echo.
echo 🚀 Divine payment consciousness activated! 🚀
echo.

pause
