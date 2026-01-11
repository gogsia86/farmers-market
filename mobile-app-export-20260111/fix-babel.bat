@echo off
echo ================================================================
echo   Farmers Market Mobile App - Babel Fix Script
echo   Installing missing Babel dependencies and clearing cache
echo ================================================================
echo.

REM Check if we're in the correct directory
if not exist "package.json" (
    echo ERROR: Not in the mobile-app directory!
    echo Please run this script from: mobile-app folder
    pause
    exit /b 1
)

echo [1/5] Stopping any running Metro bundler...
tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I /N "node.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo Found Node processes, attempting to stop Metro...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8081') do (
        taskkill /F /PID %%a 2>nul
    )
    timeout /t 2 /nobreak >nul
)
echo.

echo [2/5] Cleaning Metro bundler cache...
if exist ".expo" (
    rmdir /s /q .expo
    echo Removed .expo cache
)
echo.

echo [3/5] Cleaning npm cache...
call npm cache clean --force
echo.

echo [4/5] Installing missing Babel dependencies...
echo This may take a few minutes...
call npm install --legacy-peer-deps
echo.

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: npm install failed!
    echo.
    echo Try running manually:
    echo   npm install --legacy-peer-deps --force
    echo.
    pause
    exit /b 1
)

echo [5/5] Verifying installation...
call npm list @babel/core @babel/plugin-transform-template-literals
echo.

echo ================================================================
echo   Fix Complete! Babel dependencies installed.
echo ================================================================
echo.
echo   To start the development server:
echo   1. Run: npx expo start --clear
echo   2. Press 'w' to open in web browser
echo.
echo   Or run: npm run web
echo.
echo ================================================================
echo.
echo Starting Expo with cleared cache in 3 seconds...
timeout /t 3 /nobreak >nul

echo.
echo Starting Expo...
call npx expo start --clear

pause
