@echo off
echo.
echo ========================================
echo   Farmers Market Platform Dev Server
echo ========================================
echo.
echo Checking for running processes on port 3001...
netstat -ano | findstr :3001 > nul
if %errorlevel% equ 0 (
    echo WARNING: Port 3001 is already in use!
    echo Please close the existing process or use a different port.
    echo.
    pause
    exit /b 1
)

echo Port 3001 is available.
echo.
echo Starting Next.js development server...
echo - Framework: Next.js 16.1.1 (Turbopack)
echo - Port: 3001
echo - Memory: 16GB allocated
echo.
echo Access URLs:
echo   Local:   http://localhost:3001
echo   Network: Check terminal output
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

npm run dev

echo.
echo ========================================
echo Server stopped.
echo ========================================
pause
