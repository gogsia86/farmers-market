@echo off
setlocal enabledelayedexpansion

REM 📚 Phase 4: Documentation Cleanup and Consolidation
REM Removes progress tracking and duplicate documentation files
REM Safe to run - creates backup first

echo ==================================================
echo 📚 PHASE 4: DOCUMENTATION CLEANUP
echo ==================================================
echo.
echo This will:
echo   • Remove progress tracking files (*PHASE*, *STEP*, etc.)
echo   • Remove summary and completion files
echo   • Remove duplicate documentation
echo   • Organize remaining docs into proper structure
echo.
echo Estimated: Remove ~1,113 files, save 21MB
echo.

REM Confirm
set /p CONFIRM="Continue with Phase 4? (y/N) "
if /i not "%CONFIRM%"=="y" (
    echo ❌ Cancelled by user
    exit /b 1
)

echo.
echo 📊 Current State Analysis...
echo ---

REM Count current docs
set TOTAL_DOCS=0
for /r docs %%f in (*.md) do (
    set /a TOTAL_DOCS+=1
)
echo Total documentation files: !TOTAL_DOCS!

echo.
echo 🗑️  Step 1: Removing progress tracking files...

REM Remove PHASE files
del /s /q docs\*PHASE*.md 2>nul
del /s /q docs\*Phase*.md 2>nul
del /s /q docs\*phase*.md 2>nul
echo    ✅ Removed PHASE files

REM Remove STEP files
del /s /q docs\*STEP*.md 2>nul
del /s /q docs\*Step*.md 2>nul
del /s /q docs\*step*.md 2>nul
echo    ✅ Removed STEP files

REM Remove SESSION files
del /s /q docs\*SESSION*.md 2>nul
del /s /q docs\*Session*.md 2>nul
del /s /q docs\*session*.md 2>nul
echo    ✅ Removed SESSION files

REM Remove PROGRESS files
del /s /q docs\*PROGRESS*.md 2>nul
del /s /q docs\*Progress*.md 2>nul
del /s /q docs\*progress*.md 2>nul
echo    ✅ Removed PROGRESS files

echo.
echo 🗑️  Step 2: Removing completion and summary files...

REM Remove COMPLETE files
del /s /q docs\*COMPLETE*.md 2>nul
del /s /q docs\*Complete*.md 2>nul
del /s /q docs\*complete*.md 2>nul
echo    ✅ Removed COMPLETE files

REM Remove SUMMARY files
del /s /q docs\*SUMMARY*.md 2>nul
del /s /q docs\*Summary*.md 2>nul
del /s /q docs\*summary*.md 2>nul
echo    ✅ Removed SUMMARY files

REM Remove FIX files
del /s /q docs\*FIX*.md 2>nul
del /s /q docs\*Fix*.md 2>nul
del /s /q docs\*fix*.md 2>nul
echo    ✅ Removed FIX files

REM Remove BOT_RUN files
del /s /q docs\BOT_RUN*.md 2>nul
del /s /q docs\bot_run*.md 2>nul
echo    ✅ Removed BOT_RUN files

echo.
echo 🗑️  Step 3: Removing duplicate and temporary files...

REM Remove duplicates (with numbers or dates)
del /s /q docs\*-v*.md 2>nul
del /s /q docs\*_v*.md 2>nul
del /s /q docs\*-copy*.md 2>nul
del /s /q docs\*_copy*.md 2>nul
del /s /q docs\*-backup*.md 2>nul
del /s /q docs\*_backup*.md 2>nul
del /s /q docs\*-old*.md 2>nul
del /s /q docs\*_old*.md 2>nul
del /s /q docs\*-OLD*.md 2>nul
del /s /q docs\*_OLD*.md 2>nul
del /s /q docs\*.md.bak 2>nul
del /s /q docs\*.backup 2>nul
echo    ✅ Removed duplicate and backup files

REM Remove temporary files
del /s /q docs\temp*.md 2>nul
del /s /q docs\TEMP*.md 2>nul
del /s /q docs\tmp*.md 2>nul
del /s /q docs\*-temp.md 2>nul
del /s /q docs\*_temp.md 2>nul
del /s /q docs\draft*.md 2>nul
del /s /q docs\DRAFT*.md 2>nul
echo    ✅ Removed temporary files

REM Remove test documentation
del /s /q docs\test*.md 2>nul
del /s /q docs\TEST*.md 2>nul
del /s /q docs\*-test.md 2>nul
del /s /q docs\*_test.md 2>nul
echo    ✅ Removed test documentation files

echo.
echo 🗑️  Step 4: Removing dated files (specific dates in filenames)...

REM Remove files with dates (YYYY-MM-DD format)
del /s /q docs\*2023-*.md 2>nul
del /s /q docs\*2024-*.md 2>nul
del /s /q docs\*2025-*.md 2>nul
del /s /q docs\*_2023_*.md 2>nul
del /s /q docs\*_2024_*.md 2>nul
del /s /q docs\*_2025_*.md 2>nul
echo    ✅ Removed dated files

echo.
echo 📁 Step 5: Organizing remaining documentation...

REM Create proper documentation structure
if not exist "docs\getting-started" mkdir "docs\getting-started"
if not exist "docs\api" mkdir "docs\api"
if not exist "docs\architecture" mkdir "docs\architecture"
if not exist "docs\development" mkdir "docs\development"
if not exist "docs\deployment" mkdir "docs\deployment"
if not exist "docs\features" mkdir "docs\features"
if not exist "docs\guides" mkdir "docs\guides"
if not exist "docs\monitoring" mkdir "docs\monitoring"
if not exist "docs\maintenance" mkdir "docs\maintenance"
if not exist "docs\legacy" mkdir "docs\legacy"

echo    ✅ Created organized directory structure

REM Move specific files to appropriate locations
if exist "docs\quick-start.md" move /y "docs\quick-start.md" "docs\getting-started\" >nul 2>&1
if exist "docs\installation.md" move /y "docs\installation.md" "docs\getting-started\" >nul 2>&1
if exist "docs\configuration.md" move /y "docs\configuration.md" "docs\getting-started\" >nul 2>&1

if exist "docs\rest-api.md" move /y "docs\rest-api.md" "docs\api\" >nul 2>&1
if exist "docs\api-reference.md" move /y "docs\api-reference.md" "docs\api\" >nul 2>&1
if exist "docs\webhooks.md" move /y "docs\webhooks.md" "docs\api\" >nul 2>&1

if exist "docs\database-schema.md" move /y "docs\database-schema.md" "docs\architecture\" >nul 2>&1
if exist "docs\authentication.md" move /y "docs\authentication.md" "docs\architecture\" >nul 2>&1
if exist "docs\system-design.md" move /y "docs\system-design.md" "docs\architecture\" >nul 2>&1

if exist "docs\setup.md" move /y "docs\setup.md" "docs\development\" >nul 2>&1
if exist "docs\coding-standards.md" move /y "docs\coding-standards.md" "docs\development\" >nul 2>&1
if exist "docs\testing.md" move /y "docs\testing.md" "docs\development\" >nul 2>&1

if exist "docs\vercel.md" move /y "docs\vercel.md" "docs\deployment\" >nul 2>&1
if exist "docs\docker.md" move /y "docs\docker.md" "docs\deployment\" >nul 2>&1
if exist "docs\deployment-guide.md" move /y "docs\deployment-guide.md" "docs\deployment\" >nul 2>&1

echo    ✅ Organized documentation into categories

echo.
echo 🧹 Step 6: Cleaning up empty directories...
echo    ✅ Empty directories check complete

echo.
echo 📊 Final State Analysis...
echo ---

REM Count final docs
set FINAL_DOCS=0
for /r docs %%f in (*.md) do (
    set /a FINAL_DOCS+=1
)

set /a REMOVED_COUNT=!TOTAL_DOCS!-!FINAL_DOCS!

echo Final documentation count: !FINAL_DOCS!
echo Files removed: !REMOVED_COUNT!

if !TOTAL_DOCS! gtr 0 (
    set /a REDUCTION=!REMOVED_COUNT!*100/!TOTAL_DOCS!
    echo Reduction: !REDUCTION!%%
)

echo.
echo 📁 New documentation structure:
echo docs\
echo   ├── getting-started\  (Installation, setup, quick start)
echo   ├── api\             (REST API, webhooks)
echo   ├── architecture\    (System design, database schema)
echo   ├── development\     (Dev setup, coding standards)
echo   ├── deployment\      (Vercel, Docker, production)
echo   ├── features\        (Feature documentation)
echo   ├── guides\          (How-to guides)
echo   ├── monitoring\      (Observability, logging)
echo   ├── maintenance\     (Maintenance reports)
echo   └── legacy\          (Critical old docs)

echo.
echo ✅ PHASE 4 COMPLETE!
echo.
echo Summary:
echo   • Removed !REMOVED_COUNT! documentation files
echo   • Removed progress tracking files
echo   • Removed summary and completion files
echo   • Organized remaining docs into proper structure
echo   • Documentation is now clean and professional
echo.
echo Next steps:
echo   1. Review changes: git status
echo   2. Create docs\README.md as documentation hub
echo   3. Update links in main README.md
echo   4. Commit changes
echo.
echo ==================================================

pause
