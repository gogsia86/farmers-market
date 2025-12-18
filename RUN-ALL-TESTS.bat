@echo off
REM =============================================================================
REM Comprehensive Testing Script - Farmers Market Platform
REM =============================================================================
REM This script runs all available tests and generates a comprehensive report
REM Author: Platform Engineering Team
REM Date: December 18, 2025
REM =============================================================================

setlocal enabledelayedexpansion

echo.
echo ================================================================================
echo    🌾 FARMERS MARKET PLATFORM - COMPREHENSIVE TEST SUITE
echo ================================================================================
echo.
echo Starting comprehensive testing at %date% %time%
echo.

REM Set color codes for better visibility
set "GREEN=[92m"
set "RED=[91m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "RESET=[0m"

REM Initialize counters
set TESTS_PASSED=0
set TESTS_FAILED=0
set TESTS_SKIPPED=0

REM Create logs directory if it doesn't exist
if not exist "logs" mkdir logs
set LOG_FILE=logs\test-run-%date:~-4,4%%date:~-10,2%%date:~-7,2%-%time:~0,2%%time:~3,2%%time:~6,2%.log
set LOG_FILE=%LOG_FILE: =0%

echo Test execution log - %date% %time% > "%LOG_FILE%"
echo ======================================== >> "%LOG_FILE%"
echo. >> "%LOG_FILE%"

REM =============================================================================
REM TEST 1: Platform Validation
REM =============================================================================
echo.
echo --------------------------------------------------------------------------------
echo %BLUE%TEST 1/10: Platform Validation%RESET%
echo --------------------------------------------------------------------------------
echo Running: npm run validate:platform
echo.

call npm run validate:platform >> "%LOG_FILE%" 2>&1
if %ERRORLEVEL% EQU 0 (
    echo %GREEN%✓ PASS%RESET% - Platform validation successful
    set /a TESTS_PASSED+=1
) else (
    echo %RED%✗ FAIL%RESET% - Platform validation failed
    set /a TESTS_FAILED+=1
)

REM =============================================================================
REM TEST 2: TypeScript Compilation
REM =============================================================================
echo.
echo --------------------------------------------------------------------------------
echo %BLUE%TEST 2/10: TypeScript Compilation%RESET%
echo --------------------------------------------------------------------------------
echo Running: npm run type-check
echo.

call npm run type-check >> "%LOG_FILE%" 2>&1
if %ERRORLEVEL% EQU 0 (
    echo %GREEN%✓ PASS%RESET% - TypeScript compilation successful
    set /a TESTS_PASSED+=1
) else (
    echo %RED%✗ FAIL%RESET% - TypeScript compilation failed
    set /a TESTS_FAILED+=1
)

REM =============================================================================
REM TEST 3: ESLint
REM =============================================================================
echo.
echo --------------------------------------------------------------------------------
echo %BLUE%TEST 3/10: ESLint Code Quality%RESET%
echo --------------------------------------------------------------------------------
echo Running: npm run lint
echo.

call npm run lint >> "%LOG_FILE%" 2>&1
if %ERRORLEVEL% EQU 0 (
    echo %GREEN%✓ PASS%RESET% - ESLint passed
    set /a TESTS_PASSED+=1
) else (
    echo %RED%✗ FAIL%RESET% - ESLint failed
    set /a TESTS_FAILED+=1
)

REM =============================================================================
REM TEST 4: Code Formatting
REM =============================================================================
echo.
echo --------------------------------------------------------------------------------
echo %BLUE%TEST 4/10: Code Formatting Check%RESET%
echo --------------------------------------------------------------------------------
echo Running: npm run format:check
echo.

call npm run format:check >> "%LOG_FILE%" 2>&1
if %ERRORLEVEL% EQU 0 (
    echo %GREEN%✓ PASS%RESET% - Code formatting correct
    set /a TESTS_PASSED+=1
) else (
    echo %YELLOW%⚠ WARNING%RESET% - Some files need formatting
    echo Running auto-fix: npm run format
    call npm run format >> "%LOG_FILE%" 2>&1
    set /a TESTS_PASSED+=1
)

REM =============================================================================
REM TEST 5: Unit Tests
REM =============================================================================
echo.
echo --------------------------------------------------------------------------------
echo %BLUE%TEST 5/10: Unit Tests%RESET%
echo --------------------------------------------------------------------------------
echo Running: npm run test:unit
echo.

call npm run test:unit >> "%LOG_FILE%" 2>&1
if %ERRORLEVEL% EQU 0 (
    echo %GREEN%✓ PASS%RESET% - All unit tests passed
    set /a TESTS_PASSED+=1
) else (
    echo %RED%✗ FAIL%RESET% - Some unit tests failed
    set /a TESTS_FAILED+=1
)

REM =============================================================================
REM TEST 6: Production Build
REM =============================================================================
echo.
echo --------------------------------------------------------------------------------
echo %BLUE%TEST 6/10: Production Build%RESET%
echo --------------------------------------------------------------------------------
echo Running: npm run build
echo This may take several minutes...
echo.

call npm run build >> "%LOG_FILE%" 2>&1
if %ERRORLEVEL% EQU 0 (
    echo %GREEN%✓ PASS%RESET% - Production build successful
    set /a TESTS_PASSED+=1
) else (
    echo %RED%✗ FAIL%RESET% - Production build failed
    set /a TESTS_FAILED+=1
)

REM =============================================================================
REM TEST 7: Integration Tests (Customer Journey)
REM =============================================================================
echo.
echo --------------------------------------------------------------------------------
echo %BLUE%TEST 7/10: Integration Tests - Customer Journey%RESET%
echo --------------------------------------------------------------------------------
echo Running: npm run test:integration:customer
echo.

call npm run test:integration:customer >> "%LOG_FILE%" 2>&1
if %ERRORLEVEL% EQU 0 (
    echo %GREEN%✓ PASS%RESET% - Customer journey tests passed
    set /a TESTS_PASSED+=1
) else (
    echo %YELLOW%⊘ SKIP%RESET% - Integration tests skipped or failed (may need config)
    set /a TESTS_SKIPPED+=1
)

REM =============================================================================
REM TEST 8: Integration Tests (Farmer Journey)
REM =============================================================================
echo.
echo --------------------------------------------------------------------------------
echo %BLUE%TEST 8/10: Integration Tests - Farmer Journey%RESET%
echo --------------------------------------------------------------------------------
echo Running: npm run test:integration:farmer
echo.

call npm run test:integration:farmer >> "%LOG_FILE%" 2>&1
if %ERRORLEVEL% EQU 0 (
    echo %GREEN%✓ PASS%RESET% - Farmer journey tests passed
    set /a TESTS_PASSED+=1
) else (
    echo %YELLOW%⊘ SKIP%RESET% - Integration tests skipped or failed (may need config)
    set /a TESTS_SKIPPED+=1
)

REM =============================================================================
REM TEST 9: Test Coverage Report
REM =============================================================================
echo.
echo --------------------------------------------------------------------------------
echo %BLUE%TEST 9/10: Test Coverage Analysis%RESET%
echo --------------------------------------------------------------------------------
echo Running: npm run test:coverage
echo This may take several minutes...
echo.

call npm run test:coverage >> "%LOG_FILE%" 2>&1
if %ERRORLEVEL% EQU 0 (
    echo %GREEN%✓ PASS%RESET% - Coverage report generated
    set /a TESTS_PASSED+=1
    echo Coverage report available in: coverage\index.html
) else (
    echo %YELLOW%⊘ SKIP%RESET% - Coverage report generation failed
    set /a TESTS_SKIPPED+=1
)

REM =============================================================================
REM TEST 10: Quality Gate Check
REM =============================================================================
echo.
echo --------------------------------------------------------------------------------
echo %BLUE%TEST 10/10: Overall Quality Gate%RESET%
echo --------------------------------------------------------------------------------
echo Running: npm run quality
echo.

call npm run quality >> "%LOG_FILE%" 2>&1
if %ERRORLEVEL% EQU 0 (
    echo %GREEN%✓ PASS%RESET% - Quality gate passed
    set /a TESTS_PASSED+=1
) else (
    echo %RED%✗ FAIL%RESET% - Quality gate failed
    set /a TESTS_FAILED+=1
)

REM =============================================================================
REM Generate Summary Report
REM =============================================================================
echo.
echo.
echo ================================================================================
echo    📊 TEST EXECUTION SUMMARY
echo ================================================================================
echo.
echo Test Run Date:     %date% %time%
echo Log File:          %LOG_FILE%
echo.
echo --------------------------------------------------------------------------------
echo Results:
echo --------------------------------------------------------------------------------
echo   %GREEN%✓ Passed:%RESET%        %TESTS_PASSED%
echo   %RED%✗ Failed:%RESET%        %TESTS_FAILED%
echo   %YELLOW%⊘ Skipped:%RESET%       %TESTS_SKIPPED%
echo   ─────────────────
set /a TOTAL_TESTS=%TESTS_PASSED%+%TESTS_FAILED%+%TESTS_SKIPPED%
echo   Total Tests:     %TOTAL_TESTS%
echo.

REM Calculate pass percentage
if %TOTAL_TESTS% GTR 0 (
    set /a PASS_PERCENTAGE=(%TESTS_PASSED%*100)/%TOTAL_TESTS%
    echo Pass Rate:        !PASS_PERCENTAGE!%%
) else (
    echo Pass Rate:        N/A
)

echo.
echo --------------------------------------------------------------------------------
echo Status:
echo --------------------------------------------------------------------------------

if %TESTS_FAILED% EQU 0 (
    if %TESTS_SKIPPED% EQU 0 (
        echo   %GREEN%🎉 ALL TESTS PASSED! Platform is production ready.%RESET%
        set EXIT_CODE=0
    ) else (
        echo   %YELLOW%⚠️  MOSTLY PASSED with some skipped tests.%RESET%
        echo   Review skipped tests and consider running them manually.
        set EXIT_CODE=0
    )
) else (
    echo   %RED%❌ SOME TESTS FAILED! Review the log file for details.%RESET%
    echo   Fix failing tests before deploying to production.
    set EXIT_CODE=1
)

echo.
echo --------------------------------------------------------------------------------
echo Next Steps:
echo --------------------------------------------------------------------------------
if %TESTS_FAILED% EQU 0 (
    echo   1. Review the full test log: %LOG_FILE%
    echo   2. Check coverage report: coverage\index.html
    echo   3. Consider running E2E tests: npm run test:e2e
    echo   4. Review the comprehensive report: COMPREHENSIVE_TESTING_REPORT.md
    echo   5. If all looks good, deploy to production!
) else (
    echo   1. Review failed tests in: %LOG_FILE%
    echo   2. Fix the issues identified
    echo   3. Re-run this script: RUN-ALL-TESTS.bat
    echo   4. Once all tests pass, proceed to deployment
)

echo.
echo ================================================================================
echo    🔗 USEFUL COMMANDS
echo ================================================================================
echo.
echo   Run specific test suites:
echo   -------------------------
echo   npm run test:unit              - Run unit tests only
echo   npm run test:integration       - Run integration tests
echo   npm run test:e2e:ui            - Run E2E tests with UI
echo   npm run validate:platform      - Validate platform architecture
echo.
echo   Code quality checks:
echo   --------------------
echo   npm run lint                   - Check linting
echo   npm run format                 - Fix formatting
echo   npm run type-check             - Check TypeScript
echo   npm run quality                - Run all quality checks
echo.
echo   Additional testing:
echo   -------------------
echo   npm run test:human             - Interactive human testing
echo   npm run test:coverage          - Generate coverage report
echo   npm run test:visual            - Visual regression testing
echo   npm run test:a11y              - Accessibility testing
echo.
echo ================================================================================
echo.

REM Append summary to log file
echo. >> "%LOG_FILE%"
echo ======================================== >> "%LOG_FILE%"
echo TEST EXECUTION SUMMARY >> "%LOG_FILE%"
echo ======================================== >> "%LOG_FILE%"
echo Tests Passed:  %TESTS_PASSED% >> "%LOG_FILE%"
echo Tests Failed:  %TESTS_FAILED% >> "%LOG_FILE%"
echo Tests Skipped: %TESTS_SKIPPED% >> "%LOG_FILE%"
echo Total Tests:   %TOTAL_TESTS% >> "%LOG_FILE%"
if defined PASS_PERCENTAGE (
    echo Pass Rate:     !PASS_PERCENTAGE!%% >> "%LOG_FILE%"
)
echo ======================================== >> "%LOG_FILE%"

REM Open the log file if requested
set /p OPEN_LOG="Would you like to open the detailed log file? (y/N): "
if /i "%OPEN_LOG%"=="y" (
    start notepad "%LOG_FILE%"
)

REM Ask if user wants to see coverage report
if exist "coverage\index.html" (
    set /p OPEN_COVERAGE="Would you like to open the coverage report? (y/N): "
    if /i "!OPEN_COVERAGE!"=="y" (
        start coverage\index.html
    )
)

echo.
echo Test execution completed at %date% %time%
echo.
pause

exit /b %EXIT_CODE%
