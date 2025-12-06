@echo off
REM 🚀 Load Testing Execution Script
REM Runs K6 load tests against the Farmers Market Platform

echo.
echo ============================================================
echo   K6 Load Testing - Farmers Market Platform
echo ============================================================
echo.

REM Check if K6 is installed
where k6 >nul 2>&1
if errorlevel 1 (
    echo [ERROR] K6 is not installed!
    echo.
    echo Please install K6:
    echo   Windows: choco install k6
    echo   Or download from: https://k6.io/docs/getting-started/installation/
    echo.
    exit /b 1
)

echo [OK] K6 is installed
echo.

REM Check if dev server is running
echo [*] Checking if dev server is running on port 3001...
curl -s http://localhost:3001 >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Dev server is NOT running on port 3001!
    echo [*] Please start the dev server first:
    echo     npm run dev
    exit /b 1
)
echo [OK] Dev server is running
echo.

REM Create results directory
if not exist "tests\load\results" mkdir tests\load\results
echo [OK] Results directory ready
echo.

REM Parse command line arguments
set TEST_TYPE=marketplace
set DURATION=
set VUS=
set OUTPUT=

:parse_args
if "%1"=="" goto run_test
if "%1"=="--test" (
    set TEST_TYPE=%2
    shift
    shift
    goto parse_args
)
if "%1"=="--duration" (
    set DURATION=%2
    shift
    shift
    goto parse_args
)
if "%1"=="--vus" (
    set VUS=%2
    shift
    shift
    goto parse_args
)
if "%1"=="--help" (
    echo Usage: run-load-tests.bat [options]
    echo.
    echo Options:
    echo   --test [marketplace^|api^|both]  Test type to run (default: marketplace)
    echo   --duration [time]               Test duration (e.g., 5m, 10m)
    echo   --vus [number]                  Number of virtual users
    echo   --help                          Show this help message
    echo.
    echo Examples:
    echo   run-load-tests.bat
    echo   run-load-tests.bat --test api
    echo   run-load-tests.bat --test both --duration 10m --vus 200
    exit /b 0
)
shift
goto parse_args

:run_test
echo ============================================================
echo   Test Configuration
echo ============================================================
echo   Test Type: %TEST_TYPE%
if not "%DURATION%"=="" echo   Duration: %DURATION%
if not "%VUS%"=="" echo   Virtual Users: %VUS%
echo   Base URL: http://localhost:3001
echo ============================================================
echo.

REM Build K6 command
set K6_CMD=k6 run
if not "%DURATION%"=="" set K6_CMD=%K6_CMD% --duration %DURATION%
if not "%VUS%"=="" set K6_CMD=%K6_CMD% --vus %VUS%

REM Run tests based on type
if "%TEST_TYPE%"=="marketplace" goto run_marketplace
if "%TEST_TYPE%"=="api" goto run_api
if "%TEST_TYPE%"=="both" goto run_both
echo [ERROR] Invalid test type: %TEST_TYPE%
exit /b 1

:run_marketplace
echo [*] Running Marketplace Load Test...
echo.
set TIMESTAMP=%DATE:~-4%%DATE:~4,2%%DATE:~7,2%_%TIME:~0,2%%TIME:~3,2%%TIME:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
%K6_CMD% --out json=tests/load/results/marketplace-%TIMESTAMP%.json tests/load/marketplace-load.js
set TEST_EXIT_CODE=%errorlevel%
goto show_results

:run_api
echo [*] Running API Stress Test...
echo.
set TIMESTAMP=%DATE:~-4%%DATE:~4,2%%DATE:~7,2%_%TIME:~0,2%%TIME:~3,2%%TIME:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
%K6_CMD% --out json=tests/load/results/api-stress-%TIMESTAMP%.json tests/load/api-stress-test.js
set TEST_EXIT_CODE=%errorlevel%
goto show_results

:run_both
echo [*] Running Complete Load Test Suite...
echo.

echo [1/2] Running Marketplace Load Test...
set TIMESTAMP=%DATE:~-4%%DATE:~4,2%%DATE:~7,2%_%TIME:~0,2%%TIME:~3,2%%TIME:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
%K6_CMD% --out json=tests/load/results/marketplace-%TIMESTAMP%.json tests/load/marketplace-load.js
set MARKETPLACE_EXIT=%errorlevel%

echo.
echo [2/2] Running API Stress Test...
set TIMESTAMP=%DATE:~-4%%DATE:~4,2%%DATE:~7,2%_%TIME:~0,2%%TIME:~3,2%%TIME:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
%K6_CMD% --out json=tests/load/results/api-stress-%TIMESTAMP%.json tests/load/api-stress-test.js
set API_EXIT=%errorlevel%

if %MARKETPLACE_EXIT%==0 if %API_EXIT%==0 (
    set TEST_EXIT_CODE=0
) else (
    set TEST_EXIT_CODE=1
)
goto show_results

:show_results
echo.
echo ============================================================
if %TEST_EXIT_CODE%==0 (
    echo   [SUCCESS] Load Tests Completed!
) else (
    echo   [FAILED] Some tests failed or had errors
)
echo ============================================================
echo.
echo [*] Results saved to: tests\load\results\
echo [*] View detailed metrics in the JSON files
echo.

REM Show summary
echo ============================================================
echo   Quick Actions
echo ============================================================
echo.
echo View results:
echo   - Check tests\load\results\ directory
echo   - Open JSON files for detailed metrics
echo   - Review console output above for summary
echo.
echo Re-run tests:
echo   - Marketplace only: run-load-tests.bat --test marketplace
echo   - API stress only: run-load-tests.bat --test api
echo   - Both tests: run-load-tests.bat --test both
echo.
echo Customize tests:
echo   - Custom duration: run-load-tests.bat --duration 10m
echo   - Custom VUs: run-load-tests.bat --vus 200
echo.

exit /b %TEST_EXIT_CODE%
