@echo off
echo ================================================================
echo   Farmers Market Platform - Full Stack Startup Script
echo   Starting Backend API + Mobile App
echo ================================================================
echo.

REM Check if we're in the correct directory
if not exist "package.json" (
    echo ERROR: Not in the correct directory!
    echo Please run this script from: M:\Repo\Farmers Market Platform web and app
    pause
    exit /b 1
)

echo [1/6] Cleaning up any existing processes...
echo.

REM Kill any existing Node processes (optional - uncomment if needed)
REM taskkill /F /IM node.exe 2>nul

REM Kill any processes on port 3000 (backend)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    taskkill /F /PID %%a 2>nul
)

REM Kill any processes on port 8081 (Metro bundler)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8081') do (
    taskkill /F /PID %%a 2>nul
)

echo Ports cleaned up!
echo.

echo [2/6] Checking backend dependencies...
if not exist "node_modules" (
    echo Installing backend dependencies...
    call npm install
) else (
    echo Backend dependencies already installed.
)
echo.

echo [3/6] Checking mobile app dependencies...
cd mobile-app
if not exist "node_modules" (
    echo Installing mobile app dependencies...
    call npm install
) else (
    echo Mobile app dependencies already installed.
)
cd ..
echo.

echo [4/6] Starting Backend API Server...
echo Opening new window for backend...
start "Farmers Market Backend API" cmd /k "cd /d "%~dp0" && npm run dev"
timeout /t 3 /nobreak >nul
echo Backend API started on http://localhost:3000
echo.

echo [5/6] Starting Mobile App (Expo)...
echo Opening new window for Expo Metro bundler...
start "Farmers Market Mobile App" cmd /k "cd /d "%~dp0mobile-app" && npx expo start --clear"
timeout /t 3 /nobreak >nul
echo Mobile app Metro bundler starting...
echo.

echo [6/6] Startup Complete!
echo ================================================================
echo.
echo   Backend API:     http://localhost:3000
echo   Mobile Metro:    exp://127.0.0.1:8081
echo.
echo   Two windows have been opened:
echo   1. Backend API Server (port 3000)
echo   2. Mobile App Expo Dev Server (port 8081)
echo.
echo   To run the mobile app:
echo   - Press 'w' in the Expo window for web browser
echo   - Press 'a' in the Expo window for Android (requires Android Studio)
echo   - Scan QR code with Expo Go app on your phone
echo.
echo ================================================================
echo.
echo Press any key to close this window (servers will keep running)...
pause >nul
