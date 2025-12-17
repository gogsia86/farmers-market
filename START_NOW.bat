@echo off
REM ========================================
REM FARMERS MARKET PLATFORM - QUICK START
REM ========================================
REM This script fixes database and starts the application
REM Last Updated: January 2025

echo.
echo ========================================
echo  FARMERS MARKET PLATFORM - QUICK START
echo ========================================
echo.

REM Check if Docker is available
docker --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Docker is not installed or not in PATH
    echo Please install Docker Desktop from: https://www.docker.com/products/docker-desktop
    echo.
    pause
    exit /b 1
)

echo [STEP 1/6] Starting PostgreSQL Database...
echo.

REM Check if postgres-farmers container already exists
docker ps -a | findstr postgres-farmers >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo PostgreSQL container exists. Restarting...
    docker start postgres-farmers
) else (
    echo Creating new PostgreSQL container...
    docker run -d --name postgres-farmers -e POSTGRES_PASSWORD=test_password_123 -e POSTGRES_DB=farmersmarket_test -p 5433:5432 postgres:15-alpine
)

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to start PostgreSQL
    pause
    exit /b 1
)

echo [SUCCESS] PostgreSQL is running on port 5433
echo.
echo Waiting 10 seconds for database to initialize...
timeout /t 10 /nobreak >nul

echo.
echo [STEP 2/6] Generating Prisma Client...
echo.
call npx prisma generate
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to generate Prisma Client
    pause
    exit /b 1
)

echo.
echo [STEP 3/6] Applying Database Migrations...
echo.
call npx prisma migrate deploy
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Migrations failed. Trying db push...
    call npx prisma db push --accept-data-loss
)

echo.
echo [STEP 4/6] Checking Migration Status...
echo.
call npx prisma migrate status

echo.
echo [STEP 5/6] Seeding Test Data...
echo.
call npm run db:seed:basic
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Seeding failed. You may need to seed manually later.
    echo Run: npm run db:seed:basic
)

echo.
echo [STEP 6/6] Starting Development Server...
echo.
echo ========================================
echo  PLATFORM READY!
echo ========================================
echo.
echo Database: PostgreSQL running on port 5433
echo Server: Starting on http://localhost:3001
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

REM Start the development server
call npm run dev

REM If server stops, keep window open
echo.
echo Server stopped.
pause
