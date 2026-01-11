@echo off
echo ================================================================
echo   Farmers Market Mobile App - Web Support Setup
echo   Installing dependencies for web development
echo ================================================================
echo.

REM Check if we're in the correct directory
if not exist "package.json" (
    echo ERROR: Not in the mobile-app directory!
    echo Please run this script from: mobile-app folder
    pause
    exit /b 1
)

echo [1/4] Cleaning npm cache...
call npm cache clean --force
echo.

echo [2/4] Removing existing node_modules...
if exist "node_modules" (
    echo Removing node_modules directory...
    rmdir /s /q node_modules
    echo Done!
) else (
    echo node_modules doesn't exist, skipping...
)
echo.

echo [3/4] Installing all dependencies with legacy peer deps...
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

echo [4/4] Verifying web dependencies...
call npm list react-native-web
echo.

echo ================================================================
echo   Setup Complete! Web support is now enabled.
echo ================================================================
echo.
echo   To start the development server:
echo   1. Run: npx expo start
echo   2. Press 'w' to open in web browser
echo.
echo   Or simply run: npm run web
echo.
echo ================================================================
echo.
pause
