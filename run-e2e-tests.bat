@echo off
REM 🌾 E2E Test Runner - Farmers Market Platform
REM Runs Playwright E2E tests against test database

echo.
echo ============================================================
echo   E2E Test Suite - Farmers Market Platform
echo ============================================================
echo.

REM Set test database URL
set DATABASE_URL=postgresql://postgres:test_password_123@localhost:5433/farmersmarket_test

REM Check if test database is running
echo [*] Checking test database connection...
docker-compose -f docker-compose.test.yml ps > nul 2>&1
if errorlevel 1 (
    echo [!] Test database is not running!
    echo [*] Starting test database...
    docker-compose -f docker-compose.test.yml up -d
    timeout /t 5 /nobreak > nul
)
echo [OK] Test database is running

REM Push latest schema to test database
echo.
echo [*] Pushing Prisma schema to test database...
call npx prisma db push --accept-data-loss
if errorlevel 1 (
    echo [ERROR] Schema push failed!
    exit /b 1
)
echo [OK] Schema pushed successfully

REM Check if dev server is running
echo.
echo [*] Checking if dev server is running on port 3001...
curl -s http://localhost:3001 > nul 2>&1
if errorlevel 1 (
    echo [ERROR] Dev server is NOT running on port 3001!
    echo [*] Please start the dev server first:
    echo     npm run dev
    exit /b 1
)
echo [OK] Dev server is running

REM Parse command line arguments
set WORKERS=6
set EXTRA_ARGS=

:parse_args
if "%1"=="" goto run_tests
if "%1"=="--workers" (
    set WORKERS=%2
    shift
    shift
    goto parse_args
)
if "%1"=="--headed" (
    set EXTRA_ARGS=%EXTRA_ARGS% --headed
    shift
    goto parse_args
)
if "%1"=="--debug" (
    set EXTRA_ARGS=%EXTRA_ARGS% --debug
    shift
    goto parse_args
)
if "%1"=="--grep" (
    set EXTRA_ARGS=%EXTRA_ARGS% --grep "%2"
    shift
    shift
    goto parse_args
)
if "%1"=="--help" (
    echo Usage: run-e2e-tests.bat [options]
    echo.
    echo Options:
    echo   --workers [n]     Number of parallel workers (default: 6)
    echo   --headed          Run tests in headed mode (visible browser)
    echo   --debug           Run tests in debug mode
    echo   --grep [pattern]  Only run tests matching pattern
    echo   --help            Show this help message
    echo.
    echo Examples:
    echo   run-e2e-tests.bat
    echo   run-e2e-tests.bat --workers 4 --headed
    echo   run-e2e-tests.bat --grep "login"
    exit /b 0
)
shift
goto parse_args

:run_tests
REM Run E2E tests
echo.
echo ============================================================
echo   Running E2E Test Suite
echo ============================================================
echo.

echo [*] Running: npx playwright test --config=playwright.config.temp.ts --workers=%WORKERS% %EXTRA_ARGS%
echo.

call npx playwright test --config=playwright.config.temp.ts --workers=%WORKERS% %EXTRA_ARGS%
set TEST_EXIT_CODE=%errorlevel%

echo.
echo ============================================================
if %TEST_EXIT_CODE%==0 (
    echo   [SUCCESS] E2E Tests Completed Successfully!
) else (
    echo   [FAILED] E2E Tests Failed
)
echo ============================================================
echo.

REM Show report options
echo [*] To view the detailed report, run:
echo     npx playwright show-report
echo.

exit /b %TEST_EXIT_CODE%
