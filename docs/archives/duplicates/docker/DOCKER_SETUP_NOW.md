# 🐋 DOCKER SETUP - IMMEDIATE ACTION GUIDE

## Your Docker is Running! Let's Push to Registry

**Status**: ✅ Docker is running (v29.0.1)  
**Action Required**: Login and push images

---

## 🚀 QUICK SETUP (5 MINUTES)

### Step 1: Login to Docker Hub

You need a Docker Hub account to push images.

**Option A: If you already have a Docker Hub account**

```bash
# Login with your credentials
docker login

# Enter your Docker Hub username and password when prompted
```

**Option B: If you DON'T have a Docker Hub account**

1. Go to https://hub.docker.com/signup
2. Create a free account (takes 2 minutes)
3. Verify your email
4. Come back and run: `docker login`

---

### Step 2: Build and Push Images

Once logged in, choose one of these options:

**Option 1: Using the automated script (RECOMMENDED)**

```bash
# Linux/Mac/Git Bash
./docker-scripts/docker-push.sh --no-push

# Test build first (doesn't push yet)
# This will build the image and verify it works

# When ready to push:
./docker-scripts/docker-push.sh

# Or on Windows PowerShell
.\docker-scripts\docker-push.ps1
```

**Option 2: Manual build and push**

```bash
# Replace YOUR_DOCKERHUB_USERNAME with your actual username
export DOCKER_USERNAME=YOUR_DOCKERHUB_USERNAME

# Build production image
docker build \
  -t $DOCKER_USERNAME/farmers-market-app:latest \
  -t $DOCKER_USERNAME/farmers-market-app:v1.0.0 \
  -f Dockerfile \
  .

# Test the image locally
docker run -d -p 3000:3000 --name test-app $DOCKER_USERNAME/farmers-market-app:latest

# Check if it's running
docker logs test-app

# Stop test container
docker stop test-app
docker rm test-app

# Push to Docker Hub
docker push $DOCKER_USERNAME/farmers-market-app:latest
docker push $DOCKER_USERNAME/farmers-market-app:v1.0.0
```

**Option 3: Quick test build (no push)**

```bash
# Just build and test locally without pushing
docker build -t farmers-market-app:test .

# Run it
docker run -d -p 3000:3000 farmers-market-app:test

# Test health endpoint
curl http://localhost:3000/api/health

# Clean up
docker stop $(docker ps -q --filter ancestor=farmers-market-app:test)
```

---

## 🎯 RECOMMENDED FIRST-TIME FLOW

```bash
# 1. Login to Docker Hub
docker login

# 2. Test build locally first (no push)
./docker-scripts/docker-push.sh --no-push

# 3. If build succeeds, verify the image
docker images | grep farmers-market

# 4. Push to Docker Hub
./docker-scripts/docker-push.sh
```

---

## 🔐 AUTHENTICATION OPTIONS

### Using Docker Hub Username/Password

```bash
docker login
# Username: your_username
# Password: your_password
```

### Using Access Token (More Secure - Recommended for automation)

1. Go to https://hub.docker.com/settings/security
2. Click "New Access Token"
3. Name it: `farmers-market-local`
4. Copy the token
5. Use it to login:

```bash
docker login -u YOUR_USERNAME --password-stdin <<< "YOUR_ACCESS_TOKEN"
```

---

## 📦 WHAT WILL BE BUILT

### Production Image
- **Name**: `YOUR_USERNAME/farmers-market-app:latest`
- **Size**: ~200MB (optimized with Alpine Linux)
- **Base**: Node.js 20 Alpine
- **Features**: 
  - Multi-stage build
  - Non-root user
  - Health checks
  - Production-ready

### What Gets Pushed
```
YOUR_USERNAME/farmers-market-app:latest
YOUR_USERNAME/farmers-market-app:v1.0.0
```

---

## ⚡ TROUBLESHOOTING

### "Permission Denied" Error

```bash
# Linux: Add yourself to docker group
sudo usermod -aG docker $USER
newgrp docker

# Then logout and login again
```

### "Cannot Connect to Docker Daemon"

```bash
# Windows/Mac: Make sure Docker Desktop is running
# Check system tray/menu bar for Docker icon

# Linux: Start Docker service
sudo systemctl start docker
sudo systemctl enable docker
```

### "Unauthorized: Authentication Required"

```bash
# Logout and login again
docker logout
docker login
```

### Build Fails Due to Memory

```bash
# Check available memory
docker info | grep "Total Memory"

# Increase Docker memory limit in Docker Desktop:
# Settings → Resources → Memory → Increase to 8GB+
```

---

## 🌟 SCRIPT OPTIONS REFERENCE

```bash
# Build production only (default)
./docker-scripts/docker-push.sh

# Build production and development
./docker-scripts/docker-push.sh --both

# Build with custom version tag
./docker-scripts/docker-push.sh --version v1.2.3

# Build for multiple platforms (takes longer)
./docker-scripts/docker-push.sh --multi-platform

# Build but don't push (test first)
./docker-scripts/docker-push.sh --no-push

# Custom registry (GitHub Container Registry)
./docker-scripts/docker-push.sh --registry ghcr.io --namespace YOUR_GITHUB_USERNAME

# Full custom build
./docker-scripts/docker-push.sh \
  --version v1.0.0 \
  --registry docker.io \
  --namespace YOUR_USERNAME \
  --cleanup
```

---

## 📋 COMPLETE WORKFLOW

### First Time Setup

```bash
# 1. Verify Docker is running
docker version

# 2. Login to Docker Hub
docker login

# 3. Test build locally
./docker-scripts/docker-push.sh --no-push

# 4. If successful, push to registry
./docker-scripts/docker-push.sh

# 5. Verify image is available
docker pull YOUR_USERNAME/farmers-market-app:latest
```

### Subsequent Builds

```bash
# Quick rebuild and push
./docker-scripts/docker-push.sh

# Or with new version
./docker-scripts/docker-push.sh --version v1.1.0
```

---

## 🎓 DOCKER HUB REPOSITORY SETUP

### Auto-Create on First Push (Easiest)

The repository will be created automatically when you first push.

### Manual Repository Creation

1. Login to https://hub.docker.com
2. Click "Repositories"
3. Click "Create Repository"
4. Repository Name: `farmers-market-app`
5. Visibility: Public or Private
6. Click "Create"

---

## 🔍 VERIFICATION

After pushing, verify your image:

```bash
# Pull from Docker Hub
docker pull YOUR_USERNAME/farmers-market-app:latest

# Run it
docker run -d -p 3000:3000 YOUR_USERNAME/farmers-market-app:latest

# Check it's working
curl http://localhost:3000/api/health

# View on Docker Hub
# https://hub.docker.com/r/YOUR_USERNAME/farmers-market-app
```

---

## ⏱️ ESTIMATED TIME

- **Docker login**: 30 seconds
- **Build production image**: 3-5 minutes (first time), 30-60 seconds (cached)
- **Push to Docker Hub**: 1-2 minutes
- **Total first-time setup**: ~10 minutes

---

## 🆘 NEED HELP?

### Quick Checks

```bash
# Is Docker running?
docker info

# Am I logged in?
docker info | grep Username

# What images do I have?
docker images

# Check Docker disk usage
docker system df
```

### Get Detailed Logs

```bash
# Build with verbose output
docker build --progress=plain -t test .

# Script with debug output
bash -x ./docker-scripts/docker-push.sh
```

### Clean Start

```bash
# Remove all local images (fresh start)
docker system prune -a

# Then rebuild
./docker-scripts/docker-push.sh --no-push
```

---

## 📚 ADDITIONAL DOCUMENTATION

- **Complete Push Guide**: [DOCKER_PUSH_GUIDE.md](./DOCKER_PUSH_GUIDE.md)
- **Deployment Guide**: [DOCKER_DEPLOYMENT_GUIDE.md](./DOCKER_DEPLOYMENT_GUIDE.md)
- **Scripts Reference**: [docker-scripts/README.md](./docker-scripts/README.md)

---

## ✅ READY TO GO?

### Execute These Commands Now:

```bash
# Step 1: Login
docker login

# Step 2: Test build
./docker-scripts/docker-push.sh --no-push

# Step 3: Push to Docker Hub
./docker-scripts/docker-push.sh
```

### Or Quick Manual Build:

```bash
# Login
docker login

# Build (replace YOUR_USERNAME)
docker build -t YOUR_USERNAME/farmers-market-app:latest .

# Push
docker push YOUR_USERNAME/farmers-market-app:latest
```

---

**You're all set! Docker is running and ready. Just login and push! 🚀**

🌾⚡ _"Build with divine precision, push with agricultural consciousness!"_