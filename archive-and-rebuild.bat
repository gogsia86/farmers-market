@echo off
REM ============================================================================
REM Farmers Market Platform 2.0 - Archive and Rebuild Script (Windows)
REM ============================================================================
REM This script safely archives the old implementation and creates a clean slate
REM Run this AFTER closing all editors, terminals, and the dev server
REM ============================================================================

echo.
echo ============================================================================
echo    Farmers Market Platform 2.0 - Clean Slate Initialization
echo ============================================================================
echo.

REM Check if git is available
git --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Git is not installed or not in PATH
    echo Please install Git from https://git-scm.com/
    pause
    exit /b 1
)

echo [INFO] Git detected
echo.

REM Step 1: Check for uncommitted changes
echo ============================================================================
echo Step 1: Checking Git Status
echo ============================================================================
echo.

git diff --quiet
if errorlevel 1 (
    echo [WARNING] You have uncommitted changes
    echo.
    git status --short
    echo.
    set /p COMMIT_FIRST="Do you want to commit these changes first? (y/n): "
    if /i "%COMMIT_FIRST%"=="y" (
        git add -A
        git commit -m "Pre-archive: Prepare for clean rebuild"
        echo [SUCCESS] Changes committed
    )
)

echo.

REM Step 2: Create archive directory
echo ============================================================================
echo Step 2: Creating Archive Directory
echo ============================================================================
echo.

if exist .archive-old-implementation (
    echo [WARNING] Archive directory already exists
    set /p OVERWRITE="Overwrite existing archive? (y/n): "
    if /i not "%OVERWRITE%"=="y" (
        echo [CANCELLED] Keeping existing archive
        goto :create_new_structure
    )
    echo [INFO] Removing old archive...
    rmdir /s /q .archive-old-implementation
)

mkdir .archive-old-implementation
echo [SUCCESS] Archive directory created: .archive-old-implementation
echo.

REM Step 3: Copy old implementation to archive
echo ============================================================================
echo Step 3: Archiving Old Implementation
echo ============================================================================
echo.

echo [INFO] Copying src/app to archive...
if exist src\app (
    xcopy src\app .archive-old-implementation\app\ /E /I /Q /Y
    echo [SUCCESS] src/app archived
) else (
    echo [WARNING] src/app does not exist
)

echo [INFO] Copying src/components to archive...
if exist src\components (
    xcopy src\components .archive-old-implementation\components\ /E /I /Q /Y
    echo [SUCCESS] src/components archived
) else (
    echo [WARNING] src/components does not exist
)

echo [INFO] Copying src/lib/services to archive...
if exist src\lib\services (
    xcopy src\lib\services .archive-old-implementation\services\ /E /I /Q /Y
    echo [SUCCESS] src/lib/services archived
) else (
    echo [WARNING] src/lib/services does not exist
)

echo [INFO] Copying src/lib/controllers to archive...
if exist src\lib\controllers (
    xcopy src\lib\controllers .archive-old-implementation\controllers\ /E /I /Q /Y
    echo [SUCCESS] src/lib/controllers archived
) else (
    echo [WARNING] src/lib/controllers does not exist
)

echo.
echo [SUCCESS] All files archived to .archive-old-implementation/
echo.

REM Step 4: Verify archive was created
echo ============================================================================
echo Step 4: Verifying Archive
echo ============================================================================
echo.

if not exist .archive-old-implementation\app (
    echo [ERROR] Archive verification failed - app directory not found
    echo [ERROR] Stopping to prevent data loss
    pause
    exit /b 1
)

echo [SUCCESS] Archive verified successfully
echo.

REM Step 5: Remove old implementation
echo ============================================================================
echo Step 5: Removing Old Implementation
echo ============================================================================
echo.

echo [WARNING] This will DELETE the old implementation files!
echo [INFO] They are safely archived in .archive-old-implementation/
set /p CONFIRM_DELETE="Type 'DELETE' to confirm removal: "

if not "%CONFIRM_DELETE%"=="DELETE" (
    echo [CANCELLED] Old implementation preserved
    echo [INFO] You can manually delete the folders later:
    echo        - src\app
    echo        - src\components
    echo        - src\lib\services
    echo        - src\lib\controllers
    goto :create_new_structure
)

echo [INFO] Removing old implementation...

if exist src\app (
    rmdir /s /q src\app
    echo [SUCCESS] src/app removed
)

if exist src\components (
    rmdir /s /q src\components
    echo [SUCCESS] src/components removed
)

if exist src\lib\services (
    rmdir /s /q src\lib\services
    echo [SUCCESS] src/lib/services removed
)

if exist src\lib\controllers (
    rmdir /s /q src\lib\controllers
    echo [SUCCESS] src/lib/controllers removed
)

echo.
echo [SUCCESS] Old implementation removed
echo.

:create_new_structure

REM Step 6: Create clean directory structure
echo ============================================================================
echo Step 6: Creating Clean Directory Structure
echo ============================================================================
echo.

mkdir src\app 2>nul
mkdir src\components\ui 2>nul
mkdir src\components\features 2>nul
mkdir src\lib\services 2>nul
mkdir src\lib\controllers 2>nul

echo [SUCCESS] Clean directory structure created
echo.

REM Step 7: Create minimal starter files
echo ============================================================================
echo Step 7: Creating Minimal Starter Files
echo ============================================================================
echo.

REM Create layout.tsx
echo Creating src/app/layout.tsx...
(
echo import type { Metadata } from "next";
echo import "./globals.css";
echo.
echo export const metadata: Metadata = {
echo   title: "Farmers Market Platform",
echo   description: "Connect local farmers with customers",
echo };
echo.
echo export default function RootLayout^(^{
echo   children,
echo }: {
echo   children: React.ReactNode;
echo }^) {
echo   return ^(
echo     ^<html lang="en"^>
echo       ^<body^>{children}^</body^>
echo     ^</html^>
echo   ^);
echo }
) > src\app\layout.tsx

REM Create page.tsx
echo Creating src/app/page.tsx...
(
echo export default function HomePage^(^) {
echo   return ^(
echo     ^<main className="min-h-screen p-8"^>
echo       ^<div className="max-w-4xl mx-auto"^>
echo         ^<h1 className="text-4xl font-bold mb-4"^>
echo           Farmers Market Platform 2.0
echo         ^</h1^>
echo         ^<p className="text-lg text-gray-600 mb-8"^>
echo           Professional marketplace connecting local farmers with customers.
echo         ^</p^>
echo         ^<div className="bg-blue-50 border border-blue-200 rounded-lg p-6"^>
echo           ^<h2 className="text-xl font-semibold mb-2"^>🚀 Clean Slate Ready^</h2^>
echo           ^<p^>The platform is ready for professional development.^</p^>
echo         ^</div^>
echo       ^</div^>
echo     ^</main^>
echo   ^);
echo }
) > src\app\page.tsx

REM Create globals.css
echo Creating src/app/globals.css...
(
echo @tailwind base;
echo @tailwind components;
echo @tailwind utilities;
echo.
echo :root {
echo   --foreground-rgb: 0, 0, 0;
echo   --background-rgb: 255, 255, 255;
echo }
echo.
echo body {
echo   color: rgb^(var^(--foreground-rgb^)^);
echo   background: rgb^(var^(--background-rgb^)^);
echo }
) > src\app\globals.css

echo [SUCCESS] Starter files created
echo.

REM Step 8: Update .gitignore
echo ============================================================================
echo Step 8: Updating .gitignore
echo ============================================================================
echo.

findstr /C:".archive-old-implementation" .gitignore >nul 2>&1
if errorlevel 1 (
    echo. >> .gitignore
    echo # Old implementation archive >> .gitignore
    echo .archive-old-implementation/ >> .gitignore
    echo [SUCCESS] .gitignore updated
) else (
    echo [INFO] .gitignore already contains archive entry
)
echo.

REM Step 9: Git commit
echo ============================================================================
echo Step 9: Committing Clean Slate
echo ============================================================================
echo.

git add -A
git commit -m "feat: Initialize Farmers Market Platform 2.0 clean slate

- Archived old implementation to .archive-old-implementation/
- Created minimal clean foundation
- Preserved database schema and core utilities
- Ready for professional MVP development"

if errorlevel 1 (
    echo [WARNING] Git commit failed or no changes to commit
) else (
    echo [SUCCESS] Changes committed to git
)
echo.

REM Final summary
echo ============================================================================
echo                          SUCCESS! 🎉
echo ============================================================================
echo.
echo Clean slate initialized successfully!
echo.
echo NEXT STEPS:
echo   1. Start dev server:     npm run dev
echo   2. Visit:               http://localhost:3000
echo   3. Follow rebuild plan:  FRESH_START_STRATEGY.md
echo.
echo ARCHIVED FILES:
echo   Location: .archive-old-implementation/
echo   Contents: app/, components/, services/, controllers/
echo   Status:   Safely preserved for reference
echo.
echo PRESERVED FILES (not archived):
echo   - prisma/ (database schema)
echo   - src/lib/database/ (database utilities)
echo   - src/lib/auth/ (authentication)
echo   - src/lib/utils/ (helper functions)
echo   - src/types/ (type definitions)
echo.
echo ============================================================================
echo.

pause
