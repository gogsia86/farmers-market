@echo off
REM 🌾 Farmers Market Platform - Page Verification Script
REM Starts dev server and runs automated page checker

echo ================================================================================
echo 🌾 Farmers Market Platform - Page Verification
echo ================================================================================
echo.

echo Starting development server...
echo Please wait for the server to be ready (about 20-30 seconds)
echo.

REM Start the dev server in a new window
start "Farmers Market Dev Server" cmd /c "npm run dev"

echo Waiting for server to start...
timeout /t 30 /nobreak >nul

echo.
echo Server should be ready now!
echo ================================================================================
echo.

echo Running automated page checker...
echo.

node check-pages.js

echo.
echo ================================================================================
echo Verification complete!
echo.
echo To manually verify pages, open your browser to:
echo http://localhost:3001
echo.
echo Press any key to close the dev server window...
pause >nul

REM Try to kill the dev server (optional)
taskkill /FI "WINDOWTITLE eq Farmers Market Dev Server*" /F >nul 2>&1

echo.
echo Done! 🌾
