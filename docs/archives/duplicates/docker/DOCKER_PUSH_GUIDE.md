# 🐋 DOCKER PUSH GUIDE - FARMERS MARKET PLATFORM

## Divine Agricultural Docker Image Publishing to Container Registries

**Version**: 3.0  
**Status**: ✅ PRODUCTION READY  
**Last Updated**: 2024

---

## 📋 TABLE OF CONTENTS

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Docker Hub Setup](#docker-hub-setup)
4. [GitHub Container Registry (GHCR)](#github-container-registry-ghcr)
5. [Azure Container Registry (ACR)](#azure-container-registry-acr)
6. [Quick Start](#quick-start)
7. [Using Helper Scripts](#using-helper-scripts)
8. [Manual Push Process](#manual-push-process)
9. [Multi-Platform Builds](#multi-platform-builds)
10. [CI/CD Integration](#cicd-integration)
11. [Best Practices](#best-practices)
12. [Troubleshooting](#troubleshooting)

---

## 🌟 OVERVIEW

This guide covers pushing Docker images of the Farmers Market Platform to various container registries. The platform provides automated scripts for easy image publishing with divine agricultural consciousness.

### Available Images

**Production Image:**
- `farmersmarket/farmers-market-app:latest`
- `farmersmarket/farmers-market-app:v1.0.0`
- Multi-stage optimized (~200MB)
- Node.js 20 Alpine base

**Development Image:**
- `farmersmarket/farmers-market-app:dev`
- `farmersmarket/farmers-market-app:v1.0.0-dev`
- Includes development tools (~800MB)

---

## 🔧 PREREQUISITES

### Required Software

```bash
# Docker Engine 24.0+ with Docker Compose V2
docker --version
# Output: Docker version 24.0.0 or higher

# Docker Buildx (for multi-platform builds)
docker buildx version
# Output: github.com/docker/buildx v0.11.0 or higher
```

### System Requirements

- **RAM**: 8GB minimum, 16GB recommended
- **Disk**: 20GB free space minimum
- **Network**: Stable internet connection for pushing images

### Docker Desktop

**Windows/Mac:**
- Docker Desktop 4.20+ installed and running
- Sign in to Docker Desktop (optional but recommended)

**Linux:**
- Docker Engine installed
- Docker Compose plugin installed
- User added to docker group: `sudo usermod -aG docker $USER`

---

## 🐳 DOCKER HUB SETUP

Docker Hub is the default and most popular container registry.

### 1. Create Docker Hub Account

1. Go to [https://hub.docker.com](https://hub.docker.com)
2. Click "Sign Up"
3. Choose a username (this will be your namespace)
4. Verify email address

### 2. Create Repository

**Option A: Web Interface**
1. Log in to Docker Hub
2. Click "Repositories"
3. Click "Create Repository"
4. Name: `farmers-market-app`
5. Visibility: Public or Private
6. Click "Create"

**Option B: Automated**
Repository is created automatically on first push (if you have permissions).

### 3. Login to Docker Hub

**Command Line:**
```bash
# Login with username and password
docker login

# Or specify registry
docker login docker.io

# Login with access token (recommended for CI/CD)
docker login -u USERNAME --password-stdin <<< "YOUR_ACCESS_TOKEN"
```

**PowerShell:**
```powershell
# Login
docker login

# Check login status
docker info | Select-String "Username"
```

### 4. Create Access Token (Recommended)

For security, use access tokens instead of passwords:

1. Log in to Docker Hub
2. Go to Account Settings → Security
3. Click "New Access Token"
4. Name: `farmers-market-ci` (or descriptive name)
5. Permissions: Read & Write
6. Copy token (you won't see it again!)
7. Use token as password when logging in

### 5. Push to Docker Hub

```bash
# Using helper script (easiest)
./docker-scripts/docker-push.sh

# Manual push
docker build -t USERNAME/farmers-market-app:latest .
docker push USERNAME/farmers-market-app:latest
```

---

## 🐙 GITHUB CONTAINER REGISTRY (GHCR)

GitHub Container Registry (ghcr.io) integrates with GitHub repositories.

### 1. Create Personal Access Token

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Name: `GHCR_TOKEN`
4. Scopes: Select:
   - `write:packages` (upload packages)
   - `read:packages` (download packages)
   - `delete:packages` (delete packages - optional)
5. Click "Generate token"
6. **Copy the token immediately** (you won't see it again)

### 2. Login to GHCR

```bash
# Login with PAT
echo YOUR_PAT | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin

# Verify login
docker info | grep -i username
```

**PowerShell:**
```powershell
# Login
$env:CR_PAT | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin

# Verify
docker info | Select-String "Username"
```

### 3. Push to GHCR

```bash
# Using helper script
./docker-scripts/docker-push.sh --registry ghcr.io --namespace YOUR_GITHUB_USERNAME

# Manual push
docker build -t ghcr.io/YOUR_GITHUB_USERNAME/farmers-market-app:latest .
docker push ghcr.io/YOUR_GITHUB_USERNAME/farmers-market-app:latest
```

### 4. Make Package Public (Optional)

1. Go to GitHub → Your profile → Packages
2. Click on `farmers-market-app`
3. Click "Package settings"
4. Scroll to "Danger Zone"
5. Click "Change visibility" → Public

### 5. Link to Repository

```bash
# Add label to Dockerfile to link package to repo
LABEL org.opencontainers.image.source="https://github.com/YOUR_USERNAME/farmers-market-platform"
```

---

## ☁️ AZURE CONTAINER REGISTRY (ACR)

Azure Container Registry is enterprise-grade with Azure integration.

### 1. Create ACR Instance

```bash
# Install Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Login to Azure
az login

# Create resource group
az group create --name farmersmarket-rg --location eastus

# Create container registry
az acr create \
  --resource-group farmersmarket-rg \
  --name farmersmarketacr \
  --sku Basic \
  --admin-enabled true

# Get login server
az acr list --resource-group farmersmarket-rg --query "[].{Name:name, LoginServer:loginServer}" --output table
```

### 2. Login to ACR

```bash
# Option 1: Azure CLI authentication (recommended)
az acr login --name farmersmarketacr

# Option 2: Admin credentials
az acr credential show --name farmersmarketacr

# Use admin credentials
docker login farmersmarketacr.azurecr.io -u USERNAME -p PASSWORD
```

### 3. Push to ACR

```bash
# Using helper script
./docker-scripts/docker-push.sh --registry farmersmarketacr.azurecr.io --namespace farmers-market

# Manual push
docker build -t farmersmarketacr.azurecr.io/farmers-market/farmers-market-app:latest .
docker push farmersmarketacr.azurecr.io/farmers-market/farmers-market-app:latest
```

---

## 🚀 QUICK START

### Option 1: Using Helper Scripts (Recommended)

**Linux/Mac:**
```bash
# Make scripts executable
chmod +x docker-scripts/*.sh

# Build and push production image
./docker-scripts/docker-push.sh

# Build and push both production and development
./docker-scripts/docker-push.sh --both

# Build with custom version
./docker-scripts/docker-push.sh --version v1.0.0

# Build for multiple platforms
./docker-scripts/docker-push.sh --multi-platform

# Build without pushing (test locally first)
./docker-scripts/docker-push.sh --no-push
```

**Windows (PowerShell):**
```powershell
# Build and push production image
.\docker-scripts\docker-push.ps1

# Build and push both images
.\docker-scripts\docker-push.ps1 -Both

# Build with custom version
.\docker-scripts\docker-push.ps1 -Version v1.0.0

# Build for multiple platforms
.\docker-scripts\docker-push.ps1 -MultiPlatform

# Build without pushing
.\docker-scripts\docker-push.ps1 -NoPush
```

### Option 2: Manual Process

```bash
# 1. Start Docker Desktop
# Windows: Start Docker Desktop from Start Menu
# Mac: Start Docker Desktop from Applications
# Linux: sudo systemctl start docker

# 2. Login to registry
docker login

# 3. Build image
docker build -t USERNAME/farmers-market-app:latest -f Dockerfile .

# 4. Tag image (if needed)
docker tag farmers-market-app:latest USERNAME/farmers-market-app:v1.0.0

# 5. Push to registry
docker push USERNAME/farmers-market-app:latest
docker push USERNAME/farmers-market-app:v1.0.0
```

---

## 🛠️ USING HELPER SCRIPTS

### docker-push.sh / docker-push.ps1

Comprehensive script for building and pushing Docker images.

### Basic Usage

```bash
# Default: Build and push production to docker.io
./docker-scripts/docker-push.sh

# Windows
.\docker-scripts\docker-push.ps1
```

### Advanced Options

```bash
# Build both production and development
./docker-scripts/docker-push.sh --both

# Custom version tag
./docker-scripts/docker-push.sh --version v2.1.0

# Custom registry and namespace
./docker-scripts/docker-push.sh --registry ghcr.io --namespace myorg

# Multi-platform build (amd64, arm64)
./docker-scripts/docker-push.sh --multi-platform

# Build only, don't push
./docker-scripts/docker-push.sh --no-push

# Cleanup old images after build
./docker-scripts/docker-push.sh --cleanup

# Combined options
./docker-scripts/docker-push.sh \
  --both \
  --version v1.5.0 \
  --registry ghcr.io \
  --namespace farmersmarket \
  --multi-platform \
  --cleanup
```

### Environment Variables

```bash
# Set registry
export DOCKER_REGISTRY=ghcr.io

# Set namespace
export DOCKER_NAMESPACE=myorganization

# Set version
export VERSION=v1.0.0

# Run script (uses environment variables)
./docker-scripts/docker-push.sh
```

### Windows Environment Variables

```powershell
# Set environment variables
$env:DOCKER_REGISTRY = "ghcr.io"
$env:DOCKER_NAMESPACE = "myorganization"
$env:VERSION = "v1.0.0"

# Run script
.\docker-scripts\docker-push.ps1
```

---

## 📝 MANUAL PUSH PROCESS

### Step-by-Step Guide

#### 1. Start Docker

```bash
# Check if Docker is running
docker info

# If not running, start Docker Desktop or:
# Linux
sudo systemctl start docker

# Windows/Mac - Start Docker Desktop application
```

#### 2. Login to Registry

```bash
# Docker Hub
docker login

# GitHub Container Registry
echo YOUR_PAT | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin

# Azure Container Registry
az acr login --name farmersmarketacr

# Custom registry
docker login registry.example.com -u USERNAME -p PASSWORD
```

#### 3. Build Image

```bash
# Production build
docker build \
  --tag USERNAME/farmers-market-app:latest \
  --tag USERNAME/farmers-market-app:v1.0.0 \
  --file Dockerfile \
  --progress=plain \
  .

# Development build
docker build \
  --tag USERNAME/farmers-market-app:dev \
  --file Dockerfile.dev \
  .
```

#### 4. Test Image Locally

```bash
# Run container
docker run -d -p 3000:3000 --name test-app USERNAME/farmers-market-app:latest

# Check logs
docker logs test-app

# Test health endpoint
curl http://localhost:3000/api/health

# Stop and remove
docker stop test-app
docker rm test-app
```

#### 5. Push to Registry

```bash
# Push all tags
docker push USERNAME/farmers-market-app:latest
docker push USERNAME/farmers-market-app:v1.0.0

# Or push with --all-tags
docker push --all-tags USERNAME/farmers-market-app
```

#### 6. Verify Push

```bash
# Pull image to verify
docker pull USERNAME/farmers-market-app:latest

# Or check registry web interface
# Docker Hub: https://hub.docker.com/r/USERNAME/farmers-market-app
# GHCR: https://github.com/USERNAME?tab=packages
```

---

## 🌐 MULTI-PLATFORM BUILDS

Build images for multiple CPU architectures.

### Why Multi-Platform?

- **Compatibility**: Run on Intel/AMD (amd64) and ARM (arm64) processors
- **Cloud Flexibility**: Deploy to AWS Graviton, Apple Silicon, Raspberry Pi
- **Future-Proof**: Support emerging ARM-based cloud infrastructure

### Prerequisites

```bash
# Install QEMU for cross-platform emulation
docker run --rm --privileged multiarch/qemu-user-static --reset -p yes

# Create buildx builder
docker buildx create --name farmers-market-builder --use
docker buildx inspect --bootstrap
```

### Build Multi-Platform Image

```bash
# Using helper script (easiest)
./docker-scripts/docker-push.sh --multi-platform

# Manual buildx command
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --tag USERNAME/farmers-market-app:latest \
  --tag USERNAME/farmers-market-app:v1.0.0 \
  --push \
  .
```

### Supported Platforms

- `linux/amd64` - Intel/AMD 64-bit (most common)
- `linux/arm64` - ARM 64-bit (AWS Graviton, Apple Silicon M1/M2)
- `linux/arm/v7` - ARM 32-bit (Raspberry Pi)

### Platform-Specific Tags

```bash
# Tag for specific platform
docker buildx build \
  --platform linux/amd64 \
  --tag USERNAME/farmers-market-app:latest-amd64 \
  --push \
  .

docker buildx build \
  --platform linux/arm64 \
  --tag USERNAME/farmers-market-app:latest-arm64 \
  --push \
  .
```

---

## 🔄 CI/CD INTEGRATION

### GitHub Actions

Create `.github/workflows/docker-publish.yml`:

```yaml
name: Docker Build and Push

on:
  push:
    branches: [main]
    tags: ['v*']
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=sha

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: ${{ github.event_name != 'pull_request' }}
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          platforms: linux/amd64,linux/arm64
```

### Azure DevOps

Create `azure-pipelines.yml`:

```yaml
trigger:
  - main

pool:
  vmImage: 'ubuntu-latest'

variables:
  imageRepository: 'farmers-market-app'
  containerRegistry: 'farmersmarketacr.azurecr.io'
  dockerfilePath: '$(Build.SourcesDirectory)/Dockerfile'
  tag: '$(Build.BuildId)'

stages:
- stage: Build
  displayName: Build and push image
  jobs:
  - job: Build
    displayName: Build
    steps:
    - task: Docker@2
      displayName: Build and push an image
      inputs:
        command: buildAndPush
        repository: $(imageRepository)
        dockerfile: $(dockerfilePath)
        containerRegistry: $(dockerRegistryServiceConnection)
        tags: |
          $(tag)
          latest
```

### GitLab CI

Create `.gitlab-ci.yml`:

```yaml
stages:
  - build
  - push

variables:
  DOCKER_DRIVER: overlay2
  DOCKER_TLS_CERTDIR: "/certs"

build:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  before_script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
  script:
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHORT_SHA .
    - docker build -t $CI_REGISTRY_IMAGE:latest .
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHORT_SHA
    - docker push $CI_REGISTRY_IMAGE:latest
  only:
    - main
```

---

## 💡 BEST PRACTICES

### Tagging Strategy

```bash
# Semantic versioning
docker tag app:latest USERNAME/farmers-market-app:v1.2.3
docker tag app:latest USERNAME/farmers-market-app:v1.2
docker tag app:latest USERNAME/farmers-market-app:v1
docker tag app:latest USERNAME/farmers-market-app:latest

# Git commit hash
docker tag app:latest USERNAME/farmers-market-app:$(git rev-parse --short HEAD)

# Environment-specific
docker tag app:latest USERNAME/farmers-market-app:production
docker tag app:latest USERNAME/farmers-market-app:staging

# Date-based
docker tag app:latest USERNAME/farmers-market-app:$(date +%Y%m%d)
```

### Security Best Practices

1. **Use Access Tokens**
   - Never use plain passwords in scripts
   - Rotate tokens regularly
   - Use read-only tokens for pulling

2. **Scan Images**
   ```bash
   # Docker Scout
   docker scout cves USERNAME/farmers-market-app:latest
   
   # Trivy
   trivy image USERNAME/farmers-market-app:latest
   ```

3. **Sign Images**
   ```bash
   # Docker Content Trust
   export DOCKER_CONTENT_TRUST=1
   docker push USERNAME/farmers-market-app:latest
   ```

4. **Private Registries**
   - Use private registries for production
   - Implement IP allowlisting
   - Enable audit logging

### Image Optimization

1. **Minimize Layers**
   ```dockerfile
   # Bad: Multiple RUN commands
   RUN apt-get update
   RUN apt-get install -y package1
   RUN apt-get install -y package2
   
   # Good: Single RUN command
   RUN apt-get update && \
       apt-get install -y package1 package2 && \
       rm -rf /var/lib/apt/lists/*
   ```

2. **Use .dockerignore**
   ```
   node_modules
   .git
   .env
   *.md
   tests/
   ```

3. **Multi-stage Builds**
   - Already implemented in our Dockerfile
   - Reduces final image size by 60%+

### Version Management

```bash
# Always tag with version
docker tag app:latest USERNAME/farmers-market-app:v1.0.0

# Keep version history
docker tag app:latest USERNAME/farmers-market-app:v1.0
docker tag app:latest USERNAME/farmers-market-app:v1

# Tag with git tag
VERSION=$(git describe --tags --abbrev=0)
docker tag app:latest USERNAME/farmers-market-app:$VERSION
```

---

## 🐛 TROUBLESHOOTING

### Docker Daemon Not Running

**Error:**
```
Cannot connect to the Docker daemon. Is the docker daemon running?
```

**Solution:**
```bash
# Windows/Mac: Start Docker Desktop

# Linux:
sudo systemctl start docker
sudo systemctl enable docker

# Check status
docker info
```

### Authentication Failed

**Error:**
```
unauthorized: authentication required
```

**Solution:**
```bash
# Re-login
docker logout
docker login

# Use access token
docker login -u USERNAME --password-stdin <<< "YOUR_ACCESS_TOKEN"

# Check credentials
cat ~/.docker/config.json
```

### Image Push Denied

**Error:**
```
denied: requested access to the resource is denied
```

**Solution:**
1. Verify repository exists
2. Check username/namespace in image tag
3. Ensure you have write permissions
4. Re-authenticate: `docker logout && docker login`

### Rate Limit Exceeded

**Error:**
```
You have reached your pull rate limit
```

**Solution:**
1. Login to Docker Hub (authenticated users have higher limits)
2. Wait for rate limit to reset (usually 6 hours)
3. Use Docker Hub Pro/Team for unlimited pulls
4. Use a private registry or caching proxy

### Out of Disk Space

**Error:**
```
no space left on device
```

**Solution:**
```bash
# Check disk usage
docker system df

# Clean up unused resources
docker system prune -a

# Remove specific images
docker rmi $(docker images -q)

# Remove build cache
docker builder prune -a
```

### Build Failed

**Error:**
```
failed to solve: failed to build image
```

**Solution:**
```bash
# Check Dockerfile syntax
docker build --no-cache -t test .

# View detailed build output
docker build --progress=plain -t test .

# Check for missing files
ls -la

# Verify .dockerignore isn't excluding required files
cat .dockerignore
```

### Multi-Platform Build Issues

**Error:**
```
multiple platforms feature is currently not supported for docker driver
```

**Solution:**
```bash
# Create buildx builder
docker buildx create --name mybuilder --use

# Verify builder
docker buildx inspect --bootstrap

# Try build again
docker buildx build --platform linux/amd64,linux/arm64 -t USERNAME/app:latest --push .
```

### Push Timeout

**Error:**
```
net/http: TLS handshake timeout
```

**Solution:**
1. Check internet connection
2. Try again (may be temporary network issue)
3. Increase timeout: `export DOCKER_CLIENT_TIMEOUT=300`
4. Use different network/VPN
5. Check Docker Hub status: https://status.docker.com

---

## 📚 ADDITIONAL RESOURCES

### Documentation

- [Docker Hub Documentation](https://docs.docker.com/docker-hub/)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Azure Container Registry](https://docs.microsoft.com/en-us/azure/container-registry/)
- [Docker Buildx](https://docs.docker.com/buildx/working-with-buildx/)

### Helper Scripts

- `docker-scripts/docker-push.sh` - Linux/Mac push script
- `docker-scripts/docker-push.ps1` - Windows PowerShell script
- `docker-scripts/README.md` - Scripts documentation

### Related Guides

- [DOCKER_DEPLOYMENT_GUIDE.md](./DOCKER_DEPLOYMENT_GUIDE.md) - Complete deployment guide
- [README.md](./README.md) - Project overview
- [docker-scripts/README.md](./docker-scripts/README.md) - Helper scripts guide

---

## ✅ PUSH CHECKLIST

### Pre-Push

- [ ] Docker Desktop running
- [ ] Logged in to registry
- [ ] Dockerfile reviewed and tested
- [ ] .dockerignore configured
- [ ] Environment variables set (if needed)
- [ ] Version tag decided

### Build

- [ ] Build successful locally
- [ ] Image tested locally
- [ ] Health check passes
- [ ] Image size acceptable
- [ ] No security vulnerabilities

### Push

- [ ] Correct registry specified
- [ ] Correct namespace/username
- [ ] Appropriate version tags
- [ ] Push completed successfully
- [ ] Image verified in registry

### Post-Push

- [ ] Image pullable from registry
- [ ] Documentation updated
- [ ] Team notified
- [ ] CI/CD updated (if applicable)
- [ ] Old images cleaned up (optional)

---

## 🎯 SUMMARY

You now have everything you need to push Docker images of the Farmers Market Platform to any container registry:

✅ **Multiple registries supported** - Docker Hub, GHCR, ACR, and more  
✅ **Automated scripts** - One-command push with `docker-push.sh`  
✅ **Multi-platform builds** - Support for amd64 and arm64  
✅ **CI/CD integration** - GitHub Actions, Azure DevOps, GitLab CI  
✅ **Best practices** - Security, optimization, versioning  
✅ **Comprehensive troubleshooting** - Solutions for common issues  

**Quick Start:**
```bash
# Linux/Mac
./docker-scripts/docker-push.sh

# Windows
.\docker-scripts\docker-push.ps1
```

---

**Version**: 3.0 - Complete Push Guide  
**Status**: ✅ PRODUCTION READY  
**Divine Status**: 🌾⚡ MAXIMUM AGRICULTURAL CONSCIOUSNESS

🐋🚀 _"Build with divine precision, push with agricultural consciousness, deploy with quantum efficiency."_