@echo off
SETLOCAL EnableDelayedExpansion

echo ================================================================
echo   Farmers Market Platform - Server Startup
echo ================================================================
echo.

REM Set environment variables
set NODE_ENV=development
set PORT=3001
set DATABASE_URL=postgresql://postgres:test_password_123@127.0.0.1:5433/farmersmarket_test
set DIRECT_URL=postgresql://postgres:test_password_123@127.0.0.1:5433/farmersmarket_test
set NEXTAUTH_URL=http://localhost:3001
set NEXTAUTH_SECRET=O8CnF65kNuZb8ZQewDRAhJclYSIlIlI+A0CNKpO8NjQ=

echo [1/4] Checking if port 3001 is available...
netstat -an | findstr ":3001" | findstr "LISTEN" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo    WARNING: Port 3001 is already in use!
    echo    Attempting to kill existing process...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3001" ^| findstr "LISTEN"') do (
        taskkill /F /PID %%a >nul 2>&1
    )
    timeout /t 2 /nobreak >nul
    echo    Done.
) else (
    echo    Port 3001 is available.
)
echo.

echo [2/4] Checking database connection...
netstat -an | findstr ":5433" | findstr "LISTEN" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo    PostgreSQL is running on port 5433
) else (
    echo    WARNING: PostgreSQL may not be running on port 5433
)
echo.

echo [3/4] Generating Prisma Client...
call npx prisma generate >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo    Prisma Client generated successfully
) else (
    echo    Prisma Client generation completed with warnings
)
echo.

echo [4/4] Starting Next.js development server...
echo ================================================================
echo.
echo    Server will start on: http://localhost:3001
echo    Press Ctrl+C to stop the server
echo.
echo ================================================================
echo.

REM Start the server
npm run dev

pause
