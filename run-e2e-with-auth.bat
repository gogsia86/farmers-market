@echo off
REM ╔════════════════════════════════════════════════════════════╗
REM ║  🚀 E2E Test Runner with Authentication Setup              ║
REM ║  Farmers Market Platform - Divine Testing Framework       ║
REM ╚════════════════════════════════════════════════════════════╝

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║  🧪 E2E Test Suite with Authentication                    ║
echo ╠════════════════════════════════════════════════════════════╣
echo ║  This script will:                                        ║
echo ║  1. Verify dev server is running                          ║
echo ║  2. Setup authentication states                           ║
echo ║  3. Run E2E tests                                         ║
echo ║  4. Generate HTML report                                  ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM ============================================================================
REM Step 1: Check if dev server is running
REM ============================================================================

echo [1/5] 🔍 Checking if dev server is running on http://localhost:3001...
curl -s -o NUL -w "%%{http_code}" http://localhost:3001 > temp_status.txt
set /p SERVER_STATUS=<temp_status.txt
del temp_status.txt

if "%SERVER_STATUS%"=="000" (
    echo ❌ Dev server is NOT running!
    echo.
    echo Please start the dev server first:
    echo    npm run dev
    echo.
    echo Then run this script again.
    exit /b 1
)

echo ✅ Dev server is running (HTTP %SERVER_STATUS%)
echo.

REM ============================================================================
REM Step 2: Ensure auth directory exists
REM ============================================================================

echo [2/5] 📁 Ensuring auth directory exists...
if not exist "tests\auth\.auth" (
    mkdir "tests\auth\.auth"
    echo ✅ Created auth directory
) else (
    echo ✅ Auth directory exists
)
echo.

REM ============================================================================
REM Step 3: Setup authentication (run setup tests)
REM ============================================================================

echo [3/5] 🔐 Setting up authentication states...
echo Running authentication setup...
echo.

npx playwright test tests/e2e/auth.setup.ts --config=playwright.config.temp.ts --project=setup

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Authentication setup failed!
    echo.
    echo Possible issues:
    echo   - Login page not accessible
    echo   - Test user credentials incorrect
    echo   - Database not seeded with test users
    echo.
    echo Please check:
    echo   1. Test users exist in database
    echo   2. Login functionality is working
    echo   3. NextAuth configuration is correct
    echo.
    exit /b 1
)

echo.
echo ✅ Authentication states created successfully!
echo.

REM ============================================================================
REM Step 4: Verify auth files were created
REM ============================================================================

echo [4/5] 🔍 Verifying authentication files...

set AUTH_FILES_OK=1

if not exist "tests\auth\.auth\admin.json" (
    echo ❌ Admin auth state missing
    set AUTH_FILES_OK=0
)

if not exist "tests\auth\.auth\farmer.json" (
    echo ❌ Farmer auth state missing
    set AUTH_FILES_OK=0
)

if not exist "tests\auth\.auth\customer.json" (
    echo ❌ Customer auth state missing
    set AUTH_FILES_OK=0
)

if %AUTH_FILES_OK%==0 (
    echo.
    echo ❌ Some authentication files are missing!
    exit /b 1
)

echo ✅ All authentication files verified
echo.

REM ============================================================================
REM Step 5: Run E2E tests with authentication
REM ============================================================================

echo [5/5] 🧪 Running E2E tests...
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║  Running Playwright E2E Test Suite                        ║
echo ╠════════════════════════════════════════════════════════════╣
echo ║  This may take several minutes...                         ║
echo ║  Tests will run across multiple browsers:                 ║
echo ║  • Chromium, Firefox, WebKit                              ║
echo ║  • Mobile Chrome, Mobile Safari                           ║
echo ║  • Authenticated contexts (Admin, Farmer, Customer)       ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Parse command line arguments
set "TEST_FILTER="
set "BROWSER="
set "HEADED="

:parse_args
if "%~1"=="" goto end_parse
if /i "%~1"=="--headed" set HEADED=--headed
if /i "%~1"=="--browser" set BROWSER=--project=%~2& shift
if /i "%~1"=="--grep" set TEST_FILTER=--grep "%~2"& shift
shift
goto parse_args
:end_parse

REM Build the test command
set TEST_CMD=npx playwright test --config=playwright.config.temp.ts

if defined BROWSER set TEST_CMD=%TEST_CMD% %BROWSER%
if defined HEADED set TEST_CMD=%TEST_CMD% %HEADED%
if defined TEST_FILTER set TEST_CMD=%TEST_CMD% %TEST_FILTER%

REM Exclude setup tests from main run
set TEST_CMD=%TEST_CMD% --ignore-snapshots

echo Running: %TEST_CMD%
echo.

%TEST_CMD%

set TEST_EXIT_CODE=%ERRORLEVEL%

echo.
echo ═══════════════════════════════════════════════════════════════
echo.

if %TEST_EXIT_CODE% EQU 0 (
    echo ✅ All tests passed!
    echo.
    echo 📊 Opening HTML report...
    npx playwright show-report
) else (
    echo ⚠️  Some tests failed (Exit code: %TEST_EXIT_CODE%)
    echo.
    echo 📊 View detailed results:
    echo    npx playwright show-report
    echo.
    echo 💡 Tips for fixing failures:
    echo    1. Check authentication setup is working
    echo    2. Verify all routes exist
    echo    3. Check database is seeded properly
    echo    4. Review test-results folder for screenshots
    echo.
)

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║  📈 Test Results Summary                                   ║
echo ╠════════════════════════════════════════════════════════════╣
echo ║  HTML Report: test-results/html-report/index.html         ║
echo ║  JSON Results: test-results/e2e-results.json              ║
echo ║  Screenshots: test-results/ (on failure)                  ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM ============================================================================
REM Usage examples
REM ============================================================================

if %TEST_EXIT_CODE% NEQ 0 (
    echo 💡 Usage Examples:
    echo.
    echo    Run all tests:
    echo       run-e2e-with-auth.bat
    echo.
    echo    Run specific browser:
    echo       run-e2e-with-auth.bat --browser chromium
    echo.
    echo    Run in headed mode:
    echo       run-e2e-with-auth.bat --headed
    echo.
    echo    Run tests matching pattern:
    echo       run-e2e-with-auth.bat --grep "marketplace"
    echo.
    echo    Combine options:
    echo       run-e2e-with-auth.bat --browser chromium --headed --grep "login"
    echo.
)

exit /b %TEST_EXIT_CODE%
