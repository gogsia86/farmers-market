@echo off
setlocal EnableDelayedExpansion

REM ============================================================================
REM 🎯 MVP VALIDATION BOT LAUNCHER
REM ============================================================================
REM
REM This script runs the comprehensive MVP validation bot to verify all
REM critical features are working before production launch.
REM
REM Usage:
REM   RUN-MVP-VALIDATION.bat           (runs in headless mode)
REM   RUN-MVP-VALIDATION.bat headed    (runs with visible browser)
REM   RUN-MVP-VALIDATION.bat help      (shows this help)
REM
REM ============================================================================

echo.
echo ╔════════════════════════════════════════════════════════════════════════╗
echo ║                   🎯 MVP VALIDATION BOT LAUNCHER                        ║
echo ║                 Farmers Market Platform - MVP Checker                   ║
echo ╚════════════════════════════════════════════════════════════════════════╝
echo.

REM Check for help flag
if "%1"=="help" (
    echo 📖 HELP - MVP Validation Bot
    echo.
    echo This bot validates all MVP requirements:
    echo   ✅ Farmers can register and get approved
    echo   ✅ Farmers can add/edit products with photos
    echo   ✅ Customers can browse and search products
    echo   ✅ Customers can add to cart and checkout
    echo   ✅ Payments process successfully via Stripe
    echo   ✅ Orders appear in farmer dashboard
    echo   ✅ Email notifications work
    echo   ✅ Admin can manage farms and orders
    echo   ✅ Site works on mobile phones
    echo   ✅ All critical security measures in place
    echo   ✅ Terms of service and privacy policy published
    echo   ✅ Customer support email set up
    echo.
    echo USAGE:
    echo   RUN-MVP-VALIDATION.bat           Run in headless mode
    echo   RUN-MVP-VALIDATION.bat headed    Run with visible browser for debugging
    echo.
    echo REQUIREMENTS:
    echo   - Server must be running on http://localhost:3001
    echo   - Database must be set up and accessible
    echo   - Admin account must exist with credentials in .env
    echo.
    echo REPORTS:
    echo   - Screenshots: ./mvp-validation-screenshots/
    echo   - Reports: ./mvp-validation-reports/
    echo.
    goto :end
)

REM Check if Node.js is installed
where node >nul 2>&1
if errorlevel 1 (
    echo ❌ ERROR: Node.js is not installed or not in PATH
    echo.
    echo Please install Node.js from https://nodejs.org/
    echo.
    goto :error
)

echo ✅ Node.js found
node --version
echo.

REM Check if npm packages are installed
if not exist "node_modules\" (
    echo ⚠️  WARNING: node_modules not found
    echo.
    echo Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo ❌ ERROR: Failed to install dependencies
        goto :error
    )
)

echo ✅ Dependencies installed
echo.

REM Check if server is running
echo 🔍 Checking if server is running...
curl -s http://localhost:3001 >nul 2>&1
if errorlevel 1 (
    echo.
    echo ⚠️  WARNING: Server does not appear to be running on http://localhost:3001
    echo.
    echo Please start the development server first:
    echo   npm run dev
    echo.
    echo Or start the production server:
    echo   npm run build
    echo   npm start
    echo.
    set /p continue="Continue anyway? (y/N): "
    if /i not "!continue!"=="y" (
        echo.
        echo ❌ Validation cancelled
        goto :end
    )
) else (
    echo ✅ Server is running on http://localhost:3001
)

echo.
echo ════════════════════════════════════════════════════════════════════════
echo.

REM Run the MVP validation bot
if "%1"=="headed" (
    echo 🚀 Starting MVP validation bot with VISIBLE BROWSER...
    echo    You will see the browser performing tests
    echo.
    set HEADLESS=false
    call npm run bot:mvp:headed
) else (
    echo 🚀 Starting MVP validation bot in HEADLESS MODE...
    echo    Running tests in background...
    echo.
    call npm run bot:mvp
)

set BOT_EXIT_CODE=%errorlevel%

echo.
echo ════════════════════════════════════════════════════════════════════════
echo.

REM Check the exit code
if %BOT_EXIT_CODE% EQU 0 (
    echo.
    echo ╔════════════════════════════════════════════════════════════════════════╗
    echo ║                                                                        ║
    echo ║                    🎉 MVP VALIDATION COMPLETE! 🎉                      ║
    echo ║                                                                        ║
    echo ║                   ✅ ALL CHECKS PASSED - READY TO LAUNCH!              ║
    echo ║                                                                        ║
    echo ╚════════════════════════════════════════════════════════════════════════╝
    echo.
    echo 📊 View detailed reports in: mvp-validation-reports\
    echo 📸 View screenshots in: mvp-validation-screenshots\
    echo.
    echo 🚀 Your MVP is ready for production deployment!
    echo.
) else (
    echo.
    echo ╔════════════════════════════════════════════════════════════════════════╗
    echo ║                                                                        ║
    echo ║                    ⚠️  MVP VALIDATION INCOMPLETE  ⚠️                    ║
    echo ║                                                                        ║
    echo ║                   ❌ SOME CHECKS FAILED - REVIEW NEEDED                ║
    echo ║                                                                        ║
    echo ╚════════════════════════════════════════════════════════════════════════╝
    echo.
    echo 📊 Review detailed reports in: mvp-validation-reports\
    echo 📸 View failure screenshots in: mvp-validation-screenshots\
    echo.
    echo 🔧 Fix the issues and run the validation again.
    echo.
)

goto :end

:error
echo.
echo ════════════════════════════════════════════════════════════════════════
echo.
echo ❌ MVP validation failed to start
echo.
echo Please check the error messages above and try again.
echo.
exit /b 1

:end
echo Press any key to exit...
pause >nul
exit /b %BOT_EXIT_CODE%
