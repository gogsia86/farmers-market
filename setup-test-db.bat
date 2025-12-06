@echo off
REM ============================================================================
REM FARMERS MARKET PLATFORM - TEST DATABASE SETUP SCRIPT
REM Sets up test database and runs Prisma migrations
REM ============================================================================

echo ╔════════════════════════════════════════════════════════════╗
echo ║  🌾 Farmers Market Platform - Test Database Setup         ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Set environment variable for this session
set DATABASE_URL=postgresql://postgres:test_password_123@localhost:5433/farmersmarket_test
set DIRECT_URL=postgresql://postgres:test_password_123@localhost:5433/farmersmarket_test

echo 📊 Database Configuration:
echo   Host: localhost:5433
echo   Database: farmersmarket_test
echo   User: postgres
echo.

REM Check if Docker container is running
echo 🐳 Checking Docker container...
docker ps --filter "name=farmers-market-test-db" --format "{{.Status}}" | findstr "Up" >nul
if %ERRORLEVEL% EQU 0 (
    echo   ✅ Test database container is running
) else (
    echo   ❌ Test database container not found
    echo   Starting test database...
    docker-compose -f docker-compose.test.yml up -d
    echo   Waiting for database to be healthy...
    timeout /t 10 /nobreak >nul
)

echo.

REM Test database connection
echo 🔌 Testing database connection...
docker exec farmers-market-test-db pg_isready -U postgres >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo   ✅ Database connection successful
) else (
    echo   ❌ Database connection failed
    exit /b 1
)

echo.

REM Generate Prisma Client
echo 🔧 Generating Prisma Client...
call npx prisma generate
if %ERRORLEVEL% NEQ 0 (
    echo   ❌ Prisma client generation failed
    exit /b 1
)
echo   ✅ Prisma client generated
echo.

REM Push schema to database
echo 📤 Pushing Prisma schema to database...
echo   (This may take a moment...)
call npx prisma db push --accept-data-loss
if %ERRORLEVEL% NEQ 0 (
    echo   ❌ Database schema push failed
    exit /b 1
)
echo   ✅ Database schema pushed successfully
echo.

REM Verify tables were created
echo 🔍 Verifying database tables...
docker exec farmers-market-test-db psql -U postgres -d farmersmarket_test -c "\dt" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo   ✅ Database tables created successfully
) else (
    echo   ⚠️ Could not verify tables
)

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║  ✅ TEST DATABASE SETUP COMPLETE                          ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 📝 Next Steps:
echo   1. Run E2E tests:  npx playwright test --config=playwright.config.temp.ts
echo   2. View database:  npx prisma studio
echo   3. Stop database:  docker-compose -f docker-compose.test.yml down
echo.
echo 🌐 Database URL: %DATABASE_URL%
echo.
