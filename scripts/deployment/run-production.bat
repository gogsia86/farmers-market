@echo off
REM ============================================
REM FARMERS MARKET PLATFORM - PRODUCTION SERVER
REM ============================================
REM Version: 3.0
REM Platform: Windows
REM ============================================

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║  🌾 FARMERS MARKET PLATFORM - PRODUCTION SERVER 🚀        ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Check if build exists
if not exist ".next\standalone\server.js" (
    echo ❌ Production build not found!
    echo.
    echo 💡 Please build the application first:
    echo    npm run build
    echo.
    pause
    exit /b 1
)

echo ✅ Production build found
echo.

REM Set environment variables
set NODE_ENV=production
set PORT=3001

echo 🔧 Configuration:
echo    Environment: %NODE_ENV%
echo    Port: %PORT%
echo    Database: PostgreSQL
echo.

REM Start the server
echo 🚀 Starting production server...
echo.
echo 📍 Application will be available at:
echo    http://localhost:%PORT%
echo.
echo 🏥 Health Check:
echo    http://localhost:%PORT%/api/health
echo.
echo 📊 Admin Dashboard:
echo    http://localhost:%PORT%/admin
echo.
echo ⚠️  Press Ctrl+C to stop the server
echo ═══════════════════════════════════════════════════════════
echo.

REM Change to standalone directory and run server
cd .next\standalone
node server.js

REM If server stops, return to root
cd ..\..

echo.
echo 🛑 Server stopped
pause
