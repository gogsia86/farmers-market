@echo off
REM ======================================
REM Farmers Market Platform - Dev Server
REM Start Development Server
REM ======================================

echo.
echo ========================================
echo   Farmers Market Platform
echo   Starting Development Server...
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo [ERROR] node_modules not found!
    echo Please run: npm install
    echo.
    pause
    exit /b 1
)

REM Check if PostgreSQL is running
netstat -ano | findstr ":5432" >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] PostgreSQL doesn't appear to be running on port 5432
    echo Please start PostgreSQL before continuing.
    echo.
    set /p CONTINUE="Continue anyway? (y/N): "
    if /i not "%CONTINUE%"=="y" (
        exit /b 1
    )
)

REM Check if .env file exists
if not exist ".env" (
    echo [WARNING] .env file not found!
    echo.
    if exist ".env.example" (
        echo Creating .env from .env.example...
        copy .env.example .env
        echo.
        echo [ACTION REQUIRED] Please edit .env file with your credentials.
        echo Press any key to open .env in notepad...
        pause >nul
        notepad .env
    ) else (
        echo Please create .env file with DATABASE_URL and other settings.
        pause
        exit /b 1
    )
)

REM Kill any existing Node processes on port 3001
echo Checking for processes on port 3001...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
    echo Killing process %%a on port 3001...
    taskkill /F /PID %%a >nul 2>&1
)

REM Clear Next.js cache if requested
if "%1"=="--clean" (
    echo Cleaning Next.js cache...
    if exist ".next\" rmdir /s /q .next
    if exist ".turbo\" rmdir /s /q .turbo
    echo Cache cleared.
    echo.
)

REM Start the development server
echo.
echo Starting Next.js development server on http://localhost:3001
echo.
echo Press Ctrl+C to stop the server
echo.

npm run dev

REM If npm run dev exits, show the error
if %errorlevel% neq 0 (
    echo.
    echo ========================================
    echo   [ERROR] Server failed to start!
    echo ========================================
    echo.
    echo Common fixes:
    echo   1. Run: npm install
    echo   2. Check PostgreSQL is running
    echo   3. Verify .env file has correct DATABASE_URL
    echo   4. Clear cache: start-dev.bat --clean
    echo.
    pause
)
