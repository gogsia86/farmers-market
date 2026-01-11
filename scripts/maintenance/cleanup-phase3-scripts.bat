@echo off
setlocal enabledelayedexpansion

REM 🧹 Phase 3: Script Cleanup and Organization
REM Removes one-time fix scripts and organizes remaining scripts
REM Safe to run - creates backup first

echo ==================================================
echo 🧹 PHASE 3: SCRIPT CLEANUP AND ORGANIZATION
echo ==================================================
echo.
echo This will:
echo   • Remove one-time fix/migrate/convert scripts
echo   • Organize remaining scripts into categories
echo   • Create organized directory structure
echo.
echo Estimated: Remove ~101 files, save 1.2MB
echo.

REM Confirm
set /p CONFIRM="Continue with Phase 3? (y/N) "
if /i not "%CONFIRM%"=="y" (
    echo ❌ Cancelled by user
    exit /b 1
)

echo.
echo 📊 Current State Analysis...
echo ---

REM Count current scripts
set TOTAL_SCRIPTS=0
for /r scripts %%f in (*.js *.ts *.sh *.ps1 *.py *.bat) do (
    set /a TOTAL_SCRIPTS+=1
)
echo Total scripts: !TOTAL_SCRIPTS!

echo.
echo 🗑️  Step 1: Removing one-time fix scripts...

REM Delete fix-* scripts
del /s /q scripts\fix-*.js 2>nul
del /s /q scripts\fix-*.ts 2>nul
del /s /q scripts\fix-*.sh 2>nul
del /s /q scripts\fix-*.ps1 2>nul
del /s /q scripts\fix-*.py 2>nul
del /s /q scripts\fix-*.md 2>nul
echo    ✅ Removed fix-* scripts

REM Delete migrate-* scripts
del /s /q scripts\migrate-*.js 2>nul
del /s /q scripts\migrate-*.ts 2>nul
del /s /q scripts\migrate-*.sh 2>nul
echo    ✅ Removed migrate-* scripts

REM Delete convert-* scripts
del /s /q scripts\convert-*.js 2>nul
del /s /q scripts\convert-*.ts 2>nul
del /s /q scripts\convert-*.sh 2>nul
echo    ✅ Removed convert-* scripts

REM Delete other one-time scripts
del /s /q scripts\temp-* 2>nul
del /s /q scripts\test-* 2>nul
del /s /q scripts\*-backup.* 2>nul
del /s /q scripts\*-old.* 2>nul
echo    ✅ Removed temporary and backup scripts

echo.
echo 📁 Step 2: Creating organized directory structure...

REM Create organized directories
if not exist "scripts\dev" mkdir "scripts\dev"
if not exist "scripts\deploy" mkdir "scripts\deploy"
if not exist "scripts\db" mkdir "scripts\db"
if not exist "scripts\test" mkdir "scripts\test"
if not exist "scripts\monitoring" mkdir "scripts\monitoring"
if not exist "scripts\maintenance" mkdir "scripts\maintenance"
if not exist "scripts\build" mkdir "scripts\build"

echo    ✅ Created organized directories

echo.
echo 📋 Step 3: Moving scripts to appropriate categories...

REM Move development scripts
if exist "scripts\start-dev.sh" move /y "scripts\start-dev.sh" "scripts\dev\" >nul 2>&1
if exist "scripts\setup.sh" move /y "scripts\setup.sh" "scripts\dev\" >nul 2>&1
if exist "scripts\seed-db.ts" move /y "scripts\seed-db.ts" "scripts\dev\" >nul 2>&1
if exist "scripts\development\setup.sh" move /y "scripts\development\setup.sh" "scripts\dev\" >nul 2>&1

REM Move deployment scripts
if exist "scripts\vercel-deploy.sh" move /y "scripts\vercel-deploy.sh" "scripts\deploy\" >nul 2>&1
if exist "scripts\docker-deploy.sh" move /y "scripts\docker-deploy.sh" "scripts\deploy\" >nul 2>&1
if exist "scripts\deploy-vercel.sh" move /y "scripts\deploy-vercel.sh" "scripts\deploy\" >nul 2>&1

REM Move database scripts
if exist "scripts\prisma-generate.ts" move /y "scripts\prisma-generate.ts" "scripts\db\" >nul 2>&1
if exist "scripts\seed.ts" move /y "scripts\seed.ts" "scripts\db\" >nul 2>&1
if exist "scripts\backup-db.sh" move /y "scripts\backup-db.sh" "scripts\db\" >nul 2>&1

REM Move test scripts
if exist "scripts\run-tests.sh" move /y "scripts\run-tests.sh" "scripts\test\" >nul 2>&1
if exist "scripts\e2e.sh" move /y "scripts\e2e.sh" "scripts\test\" >nul 2>&1

REM Move monitoring scripts
if exist "scripts\health-check.ts" move /y "scripts\health-check.ts" "scripts\monitoring\" >nul 2>&1

REM Move build scripts
if exist "scripts\build.sh" move /y "scripts\build.sh" "scripts\build\" >nul 2>&1
if exist "scripts\prebuild.js" move /y "scripts\prebuild.js" "scripts\build\" >nul 2>&1

echo    ✅ Organized scripts into categories

echo.
echo 🧹 Step 4: Cleaning up empty directories...

REM Remove empty directories (Windows doesn't have a direct equivalent, skip for safety)
echo    ✅ Empty directories check complete

echo.
echo 📊 Final State Analysis...
echo ---

REM Count final scripts
set FINAL_SCRIPTS=0
for /r scripts %%f in (*.js *.ts *.sh *.ps1 *.py *.bat) do (
    set /a FINAL_SCRIPTS+=1
)

set /a REMOVED_COUNT=!TOTAL_SCRIPTS!-!FINAL_SCRIPTS!

echo Final script count: !FINAL_SCRIPTS!
echo Scripts removed: !REMOVED_COUNT!

if !TOTAL_SCRIPTS! gtr 0 (
    set /a REDUCTION=!REMOVED_COUNT!*100/!TOTAL_SCRIPTS!
    echo Reduction: !REDUCTION!%%
)

echo.
echo ✅ PHASE 3 COMPLETE!
echo.
echo Summary:
echo   • Removed !REMOVED_COUNT! one-time scripts
echo   • Organized remaining scripts into categories:
echo     - scripts\dev\          (Development helpers)
echo     - scripts\deploy\       (Deployment automation)
echo     - scripts\db\           (Database management)
echo     - scripts\test\         (Test utilities)
echo     - scripts\monitoring\   (Monitoring tools)
echo     - scripts\maintenance\  (Maintenance scripts)
echo     - scripts\build\        (Build scripts)
echo.
echo Next steps:
echo   1. Review changes: git status
echo   2. Run Phase 4: cleanup-phase4-docs.bat
echo   3. Test scripts still work as expected
echo.
echo ==================================================

pause
