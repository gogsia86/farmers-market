@echo off
REM 🌾 Farmers Market Mobile App - Windows Startup Script
REM Starts the Expo development server with proper configuration

echo.
echo ========================================
echo 🌾 Farmers Market Mobile App
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo ❌ node_modules not found!
    echo.
    echo Running: npm install
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo ❌ npm install failed!
        pause
        exit /b 1
    )
)

REM Check if .env exists
if not exist ".env" (
    echo.
    echo ⚠️  .env file not found!
    echo Creating from .env.example...
    copy .env.example .env
    echo.
    echo ⚠️  Please edit .env and set your API_BASE_URL
    echo.
)

REM Clear any existing Metro cache
echo.
echo 🧹 Clearing Metro cache...
if exist ".expo\" rmdir /s /q ".expo"
if exist "node_modules\.cache\" rmdir /s /q "node_modules\.cache"

REM Start Expo
echo.
echo 🚀 Starting Expo development server...
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 📱 To view the app:
echo    • Scan QR code with Expo Go app
echo    • Press 'i' for iOS Simulator
echo    • Press 'a' for Android Emulator
echo    • Press 'w' for Web Browser
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

call npx expo start --clear

pause
