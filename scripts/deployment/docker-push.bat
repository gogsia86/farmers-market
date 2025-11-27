@echo off
REM ============================================================================
REM DOCKER HUB PUSH SCRIPT - Farmers Market Platform (Windows)
REM Automated script to tag and push images to Docker Hub
REM ============================================================================

setlocal EnableDelayedExpansion

REM Configuration
set "DOCKER_HUB_USERNAME=gogsiasdocker"
set "IMAGE_NAME=farmers-market-app"
set "LOCAL_IMAGE=farmersmarketplatformwebandapp-app:latest"
set "VERSION=v1.0.0"

echo.
echo ========================================================================
echo   FARMERS MARKET PLATFORM - DOCKER HUB PUSH SCRIPT
echo ========================================================================
echo.

REM ============================================================================
REM STEP 1: Verify Docker is running
REM ============================================================================
echo [1/6] Checking Docker status...
docker info >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not running!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)
echo [OK] Docker is running
echo.

REM ============================================================================
REM STEP 2: Verify local image exists
REM ============================================================================
echo [2/6] Checking for local image...
docker images | findstr /C:"%LOCAL_IMAGE%" >nul 2>&1
if errorlevel 1 (
    echo ERROR: Local image not found: %LOCAL_IMAGE%
    echo Please build the image first with: docker-compose build
    pause
    exit /b 1
)
echo [OK] Local image found: %LOCAL_IMAGE%
echo.

REM ============================================================================
REM STEP 3: Docker Hub login
REM ============================================================================
echo [3/6] Logging into Docker Hub...
echo Docker Hub Username: %DOCKER_HUB_USERNAME%
echo.

REM Check if already logged in
docker info 2>nul | findstr /C:"Username: %DOCKER_HUB_USERNAME%" >nul 2>&1
if errorlevel 1 (
    echo Please enter your Docker Hub password:
    docker login -u %DOCKER_HUB_USERNAME%
    if errorlevel 1 (
        echo ERROR: Docker Hub login failed!
        echo Please check your credentials and try again.
        pause
        exit /b 1
    )
    echo [OK] Successfully logged in to Docker Hub
) else (
    echo [OK] Already logged in to Docker Hub as %DOCKER_HUB_USERNAME%
)
echo.

REM ============================================================================
REM STEP 4: Tag images
REM ============================================================================
echo [4/6] Tagging images...

REM Tag with version
set "VERSION_TAG=%DOCKER_HUB_USERNAME%/%IMAGE_NAME%:%VERSION%"
echo   - Tagging as %VERSION_TAG%
docker tag %LOCAL_IMAGE% %VERSION_TAG%

REM Tag as latest
set "LATEST_TAG=%DOCKER_HUB_USERNAME%/%IMAGE_NAME%:latest"
echo   - Tagging as %LATEST_TAG%
docker tag %LOCAL_IMAGE% %LATEST_TAG%

echo [OK] Images tagged successfully
echo.

REM ============================================================================
REM STEP 5: Push images to Docker Hub
REM ============================================================================
echo [5/6] Pushing images to Docker Hub...
echo This may take a few minutes depending on your internet connection...
echo.

REM Push version tag
echo Pushing version tag: %VERSION%
docker push %VERSION_TAG%
if errorlevel 1 (
    echo ERROR: Failed to push version tag
    pause
    exit /b 1
)
echo [OK] Version tag pushed successfully
echo.

REM Push latest tag
echo Pushing latest tag
docker push %LATEST_TAG%
if errorlevel 1 (
    echo ERROR: Failed to push latest tag
    pause
    exit /b 1
)
echo [OK] Latest tag pushed successfully
echo.

REM ============================================================================
REM STEP 6: Verify push
REM ============================================================================
echo [6/6] Verifying pushed images...

docker manifest inspect %VERSION_TAG% >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Could not verify version tag (might take a moment to sync)
) else (
    echo [OK] Version tag verified on Docker Hub
)

docker manifest inspect %LATEST_TAG% >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Could not verify latest tag (might take a moment to sync)
) else (
    echo [OK] Latest tag verified on Docker Hub
)
echo.

REM ============================================================================
REM SUCCESS SUMMARY
REM ============================================================================
echo ========================================================================
echo   SUCCESS! IMAGES PUSHED TO DOCKER HUB
echo ========================================================================
echo.
echo Published Images:
echo   * %VERSION_TAG%
echo   * %LATEST_TAG%
echo.
echo Docker Hub URL:
echo   https://hub.docker.com/r/%DOCKER_HUB_USERNAME%/%IMAGE_NAME%
echo.
echo Pull Commands:
echo   docker pull %VERSION_TAG%
echo   docker pull %LATEST_TAG%
echo.
echo Deploy on Any Server:
echo   1. docker pull %VERSION_TAG%
echo   2. docker-compose up -d
echo.
echo [OK] Your application is now globally available!
echo.

REM ============================================================================
REM CLEANUP (Optional)
REM ============================================================================
set /p CLEANUP="Do you want to remove local tags to save space? (y/N): "
if /i "%CLEANUP%"=="y" (
    echo Removing local tags...
    docker rmi %VERSION_TAG% >nul 2>&1
    docker rmi %LATEST_TAG% >nul 2>&1
    echo [OK] Local tags removed
)

echo.
echo ========================================================================
echo Script completed successfully!
echo ========================================================================
echo.
pause
