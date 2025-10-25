---
applyTo: "**/*.{yml,yaml,sh,dockerfile}"
description: "CI/CD automation, infrastructure as code, deployment divinity, and DevOps excellence"
---

# 06 | AUTOMATION INFRASTRUCTURE

**Divine DevOps, CI/CD Mastery & Cloud Transcendence**

## 🔗 Related Divine Instructions

- **[01 | Divine Core Principles](./01_DIVINE_CORE_PRINCIPLES.instructions.md)** - Architecture for infrastructure
- **[03 | Performance Reality Bending](./03_PERFORMANCE_REALITY_BENDING.instructions.md)** - Production performance
- **[04 | Next.js Divine Implementation](./04_NEXTJS_DIVINE_IMPLEMENTATION.instructions.md)** - Deploy Next.js apps
- **[05 | Testing Security Divinity](./05_TESTING_SECURITY_DIVINITY.instructions.md)** - Automated testing pipelines
- **[README](./README.md)** - DevOps learning path

---

## 🔧 GIT AUTOMATION DIVINE PATTERNS

### Local Git Workflow Excellence

**Divine Pre-Commit Validation System** - Automated quality gates for every commit

```powershell
# scripts/pre-commit.ps1 - Divine Pre-Commit Validation
#!/usr/bin/env pwsh
# Ensures agricultural consciousness in all commits

Write-Host "🔍 Divine Pre-Commit Validation Starting..." -ForegroundColor Cyan

# 1. Validate divine naming patterns (non-blocking suggestions)
Write-Host "   🧬 Validating cosmic naming conventions..." -ForegroundColor Yellow
$violations = @()
$sourceFiles = Get-ChildItem -Recurse -Include "*.ts","*.tsx","*.js","*.jsx" |
    Where-Object { $_.FullName -notlike "*node_modules*" }

foreach ($file in $sourceFiles) {
    $content = Get-Content $file.FullName -Raw
    if ($content -match "function [a-z][a-zA-Z]*\(" -and
        $content -notmatch "quantum|divine|agricultural|manifest") {
        $violations += "⚠️  Consider divine naming in $($file.Name)"
    }
}

# 2. Run ESLint validation
Write-Host "   🎨 Running ESLint validation..." -ForegroundColor Yellow
$lintResult = npm run lint --silent 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ESLint failures detected:" -ForegroundColor Red
    Write-Host $lintResult -ForegroundColor Red
    exit 1
}

# 3. Check test coverage for new components
Write-Host "   🧪 Validating test coverage..." -ForegroundColor Yellow
$stagedFiles = git diff --cached --name-only --diff-filter=A
$newComponents = $stagedFiles | Where-Object { $_ -like "*.tsx" -and $_ -like "*components*" }
foreach ($component in $newComponents) {
    $testFile = $component -replace "\.tsx$", ".test.tsx"
    if (-not (Test-Path $testFile)) {
        Write-Host "⚠️  Consider adding test for new component: $component" -ForegroundColor Yellow
    }
}

# 4. Validate agricultural consciousness
Write-Host "   🌾 Validating agricultural consciousness..." -ForegroundColor Yellow
try {
    $commitFiles = git diff --cached --name-only 2>$null
    if ($commitFiles) {
        $agriculturalFiles = $commitFiles | Where-Object {
            $_ -like "*farm*" -or $_ -like "*crop*" -or $_ -like "*harvest*"
        }
        if ($agriculturalFiles.Count -gt 0) {
            Write-Host "   ✅ Agricultural consciousness detected" -ForegroundColor Green
        }
    }
} catch {
    Write-Host "⚠️  Agricultural consciousness check skipped" -ForegroundColor Yellow
}

# Display guidance (non-blocking)
if ($violations.Count -gt 0) {
    Write-Host "`n⚠️  Divine Guidance:" -ForegroundColor Yellow
    $violations | ForEach-Object { Write-Host "   $_" -ForegroundColor Yellow }
    Write-Host "   (These are suggestions, not blocking issues)" -ForegroundColor Gray
}

Write-Host "✅ Divine Pre-Commit Validation Complete!" -ForegroundColor Green
Write-Host "🌟 Agricultural consciousness preserved" -ForegroundColor Magenta
exit 0
```

### Enhanced .gitignore Divine Patterns

**Comprehensive Build Artifact Exclusion** - 196 patterns for clean repository

```gitignore
# === NEXT.JS DIVINE BUILD ARTIFACTS ===
.next/
out/
build/
dist/
.turbo/

# === TESTING DIVINE OUTPUTS ===
coverage/
test-results/
.jest-cache/
.playwright/
junit.xml

# === PROFILING & PERFORMANCE DATA ===
*.prof
*.nsys-rep
profiling_output/
performance_logs/

# === ENVIRONMENT & SECRETS ===
.env*
!.env.example
secrets/
config/local.*

# === DIVINE CLEANUP LOGS ===
DIVINE_CLEANUP_LOG_*.txt
cleanup_reports/
archive_logs/

# === AGRICULTURAL CONSCIOUSNESS PATTERNS ===
**/farm-temp-*
**/harvest-cache-*
**/soil-analysis-*
seasonal_backups/

# === OS & EDITOR PATTERNS ===
Thumbs.db
.DS_Store
*.swp
*.swo
.vscode/settings.local.json

# === SECURITY & SENSITIVE PATTERNS ===
*.pem
*.key
ssl/
certificates/
auth_tokens.json
```

### Repository Divine Configuration

```bash
# .git/description - Professional Repository Identity
🌾 Farmers Market - Divine Agricultural Platform with Quantum Consciousness and Biodynamic Software Architecture

# Git Hook Integration
# .git/hooks/pre-commit
#!/bin/bash
exec pwsh.exe -ExecutionPolicy Bypass -File ./scripts/pre-commit.ps1
```

---

## ⚡ CI/CD DIVINE AUTOMATION

### GitHub Actions Quantum Workflows

```yaml
# .github/workflows/divine-ci.yml
name: 🌟 Divine CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  NODE_VERSION: '20.x'
  PNPM_VERSION: '8.x'

jobs:
  divine-validation:
    name: 🔮 Divine Code Validation
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - name: ⚡ Checkout Divine Reality
        uses: actions/checkout@v4
        with:
          fetch-depth: 0 # Full history for better analysis

      - name: 🧬 Setup Node.js Quantum Environment
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: 📦 Install Dependencies Across Dimensions
        run: pnpm install --frozen-lockfile

      - name: 🎨 Lint: Enforce Divine Code Standards
        run: pnpm run lint

      - name: 🔍 TypeScript: Validate Quantum Types
        run: pnpm run type-check

      - name: 🧪 Unit Tests: Validate Business Logic Reality
        run: pnpm run test:unit --coverage

      - name: 📊 Upload Coverage to Divine Observatory
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
          flags: unit-tests
          fail_ci_if_error: true

  integration-ascension:
    name: 🌐 Integration Test Ascension
    runs-on: ubuntu-latest
    timeout-minutes: 15
    needs: divine-validation

    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: divine_user
          POSTGRES_PASSWORD: quantum_password
          POSTGRES_DB: farmers_market_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile

      - name: 🗄️  Setup Database Quantum Schema
        run: |
          pnpm prisma migrate deploy
          pnpm prisma db seed
        env:
          DATABASE_URL: postgresql://divine_user:quantum_password@localhost:5432/farmers_market_test

      - name: 🧪 Integration Tests: API Contract Validation
        run: pnpm run test:integration
        env:
          DATABASE_URL: postgresql://divine_user:quantum_password@localhost:5432/farmers_market_test
          REDIS_URL: redis://localhost:6379

      - name: 📊 Upload Integration Coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/integration-coverage.json
          flags: integration-tests

  e2e-transcendence:
    name: 🎭 E2E Test Transcendence
    runs-on: ubuntu-latest
    timeout-minutes: 20
    needs: integration-ascension

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile

      - name: 📦 Build Production Reality
        run: pnpm run build
        env:
          NEXT_PUBLIC_API_URL: http://localhost:3000

      - name: 🎭 Install Playwright Browsers
        run: pnpm exec playwright install --with-deps chromium

      - name: 🚀 Start Production Server
        run: pnpm start &
        env:
          NODE_ENV: production
          PORT: 3000

      - name: ⏳ Wait for Server Divine Manifestation
        run: npx wait-on http://localhost:3000 --timeout 60000

      - name: 🎬 Run E2E Tests Across Realities
        run: pnpm run test:e2e
        env:
          BASE_URL: http://localhost:3000

      - name: 📸 Upload E2E Failure Screenshots
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: e2e-screenshots
          path: tests/e2e/screenshots

      - name: 🎥 Upload E2E Videos
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: e2e-videos
          path: tests/e2e/videos

  build-manifestation:
    name: 🏗️  Build Production Artifact
    runs-on: ubuntu-latest
    timeout-minutes: 10
    needs: [divine-validation, integration-ascension]

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile

      - name: 🏗️  Build Next.js Divine Reality
        run: pnpm run build
        env:
          NEXT_TELEMETRY_DISABLED: 1

      - name: 📦 Upload Build Artifacts
        uses: actions/upload-artifact@v3
        with:
          name: production-build
          path: .next
          retention-days: 7

  deployment-divinity:
    name: 🚀 Deployment to Divine Realms
    runs-on: ubuntu-latest
    timeout-minutes: 15
    needs: [e2e-transcendence, build-manifestation]
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'

    environment:
      name: production
      url: <https://farmers-market.divine-platform.app>

    steps:
      - uses: actions/checkout@v4

      - name: 📥 Download Build Artifacts
        uses: actions/download-artifact@v3
        with:
          name: production-build
          path: .next

      - name: 🚀 Deploy to Vercel Divine Platform
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'

      - name: 📊 Notify Divine Monitoring
        run: |
          curl -X POST ${{ secrets.SENTRY_WEBHOOK }} \
            -H 'Content-Type: application/json' \
            -d '{
              "version": "${{ github.sha }}",
              "environment": "production",
              "ref": "${{ github.ref }}",
              "projects": ["farmers-market"]
            }'

      - name: 🎉 Notify Success to Divine Channels
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: '🌟 Production deployment successful!'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

## 🐳 DOCKER DIVINE CONTAINERS

### Multi-Stage Production Build

```dockerfile
# Dockerfile
# ============================================
# STAGE 1: Dependencies Quantum Manifestation
# ============================================
FROM node:20-alpine AS dependencies

# Install dependencies for node-gyp
RUN apk add --no-cache libc6-compat python3 make g++

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm@8

# Install dependencies
RUN pnpm install --frozen-lockfile --prod=false

# ============================================
# STAGE 2: Divine Build Reality
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies from previous stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js application
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

# Remove dev dependencies
RUN npm prune --production

# ============================================
# STAGE 3: Production Divine Runner
# ============================================
FROM node:20-alpine AS runner

WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Set ownership
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose divine port
EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "server.js"]
```

### Docker Compose Divine Orchestration

```yaml
# docker-compose.yml
version: "3.9"

services:
  # Next.js Divine Application
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: runner
    container_name: farmers-market-app
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://divine_user:quantum_password@postgres:5432/farmers_market
      - REDIS_URL=redis://redis:6379
      - NODE_ENV=production
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - divine-network
    volumes:
      - ./uploads:/app/uploads
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # PostgreSQL Divine Database
  postgres:
    image: postgres:16-alpine
    container_name: farmers-market-db
    restart: unless-stopped
    environment:
      POSTGRES_USER: divine_user
      POSTGRES_PASSWORD: quantum_password
      POSTGRES_DB: farmers_market
      PGDATA: /var/lib/postgresql/data/pgdata
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./database/init:/docker-entrypoint-initdb.d
    networks:
      - divine-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U divine_user -d farmers_market"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Divine Cache
  redis:
    image: redis:7-alpine
    container_name: farmers-market-cache
    restart: unless-stopped
    command: redis-server --appendonly yes --requirepass quantum_cache_password
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    networks:
      - divine-network
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Nginx Divine Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: farmers-market-proxy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - ./public/static:/usr/share/nginx/html/static:ro
    depends_on:
      - app
    networks:
      - divine-network

volumes:
  postgres-data:
    driver: local
  redis-data:
    driver: local

networks:
  divine-network:
    driver: bridge
```

---

## 🌩️ TERRAFORM CLOUD ASCENSION

### AWS Infrastructure as Code

```hcl
# terraform/main.tf
terraform {
  required_version = ">= 1.6"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "farmers-market-terraform-state"
    key            = "production/terraform.tfstate"
    region         = "us-west-2"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "Farmers Market"
      Environment = var.environment
      ManagedBy   = "Terraform"
      Divine      = "True"
    }
  }
}

# ============================================
# VPC Divine Network
# ============================================
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "farmers-market-vpc-${var.environment}"
  }
}

resource "aws_subnet" "public" {
  count                   = 3
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.${count.index}.0/24"
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "public-subnet-${count.index + 1}"
  }
}

resource "aws_subnet" "private" {
  count             = 3
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index + 10}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "private-subnet-${count.index + 1}"
  }
}

# ============================================
# RDS PostgreSQL Divine Database
# ============================================
resource "aws_db_subnet_group" "main" {
  name       = "farmers-market-db-subnet-${var.environment}"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Name = "Divine Database Subnet Group"
  }
}

resource "aws_db_instance" "postgres" {
  identifier     = "farmers-market-${var.environment}"
  engine         = "postgres"
  engine_version = "16.1"

  instance_class       = var.db_instance_class
  allocated_storage    = 100
  max_allocated_storage = 1000
  storage_encrypted    = true

  db_name  = "farmers_market"
  username = var.db_username
  password = var.db_password

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.database.id]

  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "mon:04:00-mon:05:00"

  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]

  deletion_protection = var.environment == "production"
  skip_final_snapshot = var.environment != "production"

  tags = {
    Name = "Divine PostgreSQL Database"
  }
}

# ============================================
# ElastiCache Redis Divine Cache
# ============================================
resource "aws_elasticache_subnet_group" "main" {
  name       = "farmers-market-cache-subnet-${var.environment}"
  subnet_ids = aws_subnet.private[*].id
}

resource "aws_elasticache_replication_group" "redis" {
  replication_group_id       = "farmers-market-${var.environment}"
  replication_group_description = "Divine Redis Cache Cluster"

  engine               = "redis"
  engine_version       = "7.1"
  node_type            = var.cache_node_type
  num_cache_clusters   = 3
  parameter_group_name = "default.redis7"
  port                 = 6379

  subnet_group_name    = aws_elasticache_subnet_group.main.name
  security_group_ids   = [aws_security_group.cache.id]

  automatic_failover_enabled = true
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  auth_token                 = var.redis_auth_token

  snapshot_retention_limit = 5
  snapshot_window          = "03:00-05:00"

  tags = {
    Name = "Divine Redis Cluster"
  }
}

# ============================================
# ECS Fargate Divine Compute
# ============================================
resource "aws_ecs_cluster" "main" {
  name = "farmers-market-${var.environment}"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name = "Divine ECS Cluster"
  }
}

resource "aws_ecs_task_definition" "app" {
  family                   = "farmers-market-app"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.task_cpu
  memory                   = var.task_memory
  execution_role_arn       = aws_iam_role.ecs_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([{
    name      = "farmers-market"
    image     = "${var.ecr_repository}:${var.app_version}"
    essential = true

    portMappings = [{
      containerPort = 3000
      protocol      = "tcp"
    }]

    environment = [
      {
        name  = "NODE_ENV"
        value = var.environment
      },
      {
        name  = "DATABASE_URL"
        value = "postgresql://${var.db_username}:${var.db_password}@${aws_db_instance.postgres.endpoint}/farmers_market"
      },
      {
        name  = "REDIS_URL"
        value = "redis://:${var.redis_auth_token}@${aws_elasticache_replication_group.redis.configuration_endpoint_address}:6379"
      }
    ]

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.app.name
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "ecs"
      }
    }

    healthCheck = {
      command     = ["CMD-SHELL", "curl -f http://localhost:3000/api/health || exit 1"]
      interval    = 30
      timeout     = 5
      retries     = 3
      startPeriod = 60
    }
  }])

  tags = {
    Name = "Divine Application Task"
  }
}

resource "aws_ecs_service" "app" {
  name            = "farmers-market-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = var.app_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = aws_subnet.private[*].id
    security_groups  = [aws_security_group.app.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.app.arn
    container_name   = "farmers-market"
    container_port   = 3000
  }

  depends_on = [aws_lb_listener.https]

  tags = {
    Name = "Divine Application Service"
  }
}
```

---

## 📊 MONITORING & ALERTING DIVINITY

### CloudWatch Alarms

```hcl
# terraform/monitoring.tf
resource "aws_cloudwatch_metric_alarm" "app_cpu" {
  alarm_name          = "farmers-market-high-cpu-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "Divine Alert: Application CPU exceeds 80%"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    ClusterName = aws_ecs_cluster.main.name
    ServiceName = aws_ecs_service.app.name
  }
}

resource "aws_cloudwatch_metric_alarm" "db_connections" {
  alarm_name          = "farmers-market-db-connections-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "DatabaseConnections"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "Divine Alert: Database connections nearing limit"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.postgres.id
  }
}
```

---

## ☸️ KUBERNETES AGRICULTURAL ORCHESTRATION

### Divine Kubernetes Configuration

```yaml
# k8s/agricultural-namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: farmers-market
  labels:
    consciousness: divine
    domain: agricultural
    season: auto-detect
---
# k8s/farm-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: farmers-market-app
  namespace: farmers-market
  labels:
    app: farmers-market
    tier: application
    consciousness: agricultural
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: farmers-market
  template:
    metadata:
      labels:
        app: farmers-market
        tier: application
      annotations:
        agricultural.consciousness/season: "{{ .Values.season }}"
        agricultural.consciousness/crop-cycle: "{{ .Values.cropCycle }}"
    spec:
      containers:
        - name: farmers-market
          image: farmers-market:{{ .Values.imageTag }}
          ports:
            - containerPort: 3000
              name: http
          env:
            - name: NODE_ENV
              value: production
            - name: AGRICULTURAL_SEASON
              valueFrom:
                configMapKeyRef:
                  name: agricultural-config
                  key: current-season
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: database-secret
                  key: url
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
          livenessProbe:
            httpGet:
              path: /api/health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /api/ready
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
---
# k8s/agricultural-configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: agricultural-config
  namespace: farmers-market
data:
  current-season: "fall"
  crop-cycle: "harvest"
  soil-health: "optimal"
  biodynamic-mode: "enabled"
```

### Agricultural Scaling Patterns

```yaml
# k8s/agricultural-hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: farmers-market-hpa
  namespace: farmers-market
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: farmers-market-app
  minReplicas: 3
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
        - type: Percent
          value: 100
          periodSeconds: 15
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
        - type: Percent
          value: 10
          periodSeconds: 60
```

### Seasonal Deployment Strategies

```typescript
/**
 * Kubernetes deployment strategies based on agricultural seasons
 * Different scaling and resource allocation per season
 */
interface SeasonalK8sStrategy {
  spring: {
    replicas: { min: 2; max: 10 }; // Growth planning season
    resources: { cpu: "moderate"; memory: "moderate" };
    deploymentSpeed: "careful"; // New growth needs attention
  };

  summer: {
    replicas: { min: 5; max: 25 }; // Peak growing season
    resources: { cpu: "high"; memory: "high" };
    deploymentSpeed: "aggressive"; // Rapid growth period
  };

  fall: {
    replicas: { min: 3; max: 15 }; // Harvest season
    resources: { cpu: "optimal"; memory: "optimal" };
    deploymentSpeed: "stable"; // Harvest requires stability
  };

  winter: {
    replicas: { min: 1; max: 5 }; // Rest and maintenance
    resources: { cpu: "minimal"; memory: "minimal" };
    deploymentSpeed: "conservative"; // Time for reflection
  };
}
```

---

## 🌐 CDN QUANTUM DISTRIBUTION

### CloudFlare Agricultural CDN

```typescript
// cloudflare/agricultural-cdn.ts
interface AgriculturalCDNConfig {
  // Geographic distribution following agricultural zones
  edgeLocations: {
    "us-midwest": {
      // Corn belt
      priority: "high";
      crops: ["corn", "soybeans"];
      cacheStrategy: "aggressive";
    };
    "us-west": {
      // Fruit and vegetable regions
      priority: "high";
      crops: ["fruits", "vegetables"];
      cacheStrategy: "optimal";
    };
    "us-south": {
      // Cotton and specialty crops
      priority: "medium";
      crops: ["cotton", "rice", "specialty"];
      cacheStrategy: "moderate";
    };
  };

  // Content optimization by agricultural content type
  contentOptimization: {
    farmImages: {
      format: "webp";
      quality: 85;
      sizes: [400, 800, 1200, 1600];
      lazyLoading: true;
    };
    productCatalogs: {
      cacheTime: "1 hour"; // Fresh product data
      compression: "gzip";
      prefetch: "predictive";
    };
    weatherData: {
      cacheTime: "15 minutes"; // Weather changes frequently
      realTimeUpdates: true;
      edgeComputing: true;
    };
  };
}
```

### Agricultural Edge Computing

```javascript
// cloudflare-worker.js - Agricultural edge intelligence
addEventListener("fetch", (event) => {
  event.respondWith(handleAgriculturalRequest(event.request));
});

async function handleAgriculturalRequest(request) {
  const url = new URL(request.url);
  const season = getCurrentSeason();
  const region = getAgriculturalRegion(request);

  // Agricultural-aware caching
  if (url.pathname.startsWith("/api/products")) {
    return handleProductRequest(request, season, region);
  }

  // Weather-dependent content
  if (url.pathname.startsWith("/api/weather")) {
    return handleWeatherRequest(request, region);
  }

  // Seasonal content optimization
  if (url.pathname.startsWith("/images/seasonal/")) {
    return handleSeasonalImages(request, season);
  }

  // Default to origin
  return fetch(request);
}

async function handleProductRequest(request, season, region) {
  const cacheKey = `products:${season}:${region}`;

  // Check edge cache first
  const cached = await caches.default.match(cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch from origin with agricultural headers
  const response = await fetch(request, {
    headers: {
      "X-Agricultural-Season": season,
      "X-Agricultural-Region": region,
      "X-Edge-Location": "agricultural-cdn",
    },
  });

  // Cache with season-aware TTL
  const ttl = getSeasonalCacheTTL(season);
  const cacheResponse = new Response(response.body, {
    ...response,
    headers: {
      ...response.headers,
      "Cache-Control": `public, max-age=${ttl}`,
    },
  });

  await caches.default.put(cacheKey, cacheResponse.clone());
  return cacheResponse;
}
```

### AWS CloudFront Agricultural Distribution

```hcl
# terraform/cloudfront-agricultural.tf
resource "aws_cloudfront_distribution" "agricultural_cdn" {
  origin {
    domain_name = aws_lb.app.dns_name
    origin_id   = "farmers-market-origin"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }

    custom_header {
      name  = "X-Agricultural-CDN"
      value = "enabled"
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  # Agricultural content caching behaviors
  ordered_cache_behavior {
    path_pattern     = "/api/products/*"
    allowed_methods  = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "farmers-market-origin"

    forwarded_values {
      query_string = true
      headers      = ["Authorization", "X-Agricultural-Season", "X-Region"]

      cookies {
        forward = "none"
      }
    }

    min_ttl                = 0
    default_ttl            = 3600  # 1 hour for product data
    max_ttl                = 86400 # 24 hours max
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
  }

  # Seasonal images with long caching
  ordered_cache_behavior {
    path_pattern     = "/images/seasonal/*"
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "farmers-market-origin"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    min_ttl                = 31536000 # 1 year
    default_ttl            = 31536000
    max_ttl                = 31536000
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
  }

  # Real-time weather data (no caching)
  ordered_cache_behavior {
    path_pattern     = "/api/weather/*"
    allowed_methods  = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "farmers-market-origin"

    forwarded_values {
      query_string = true
      headers      = ["*"]

      cookies {
        forward = "all"
      }
    }

    min_ttl                = 0
    default_ttl            = 0
    max_ttl                = 0
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
  }

  # Default behavior
  default_cache_behavior {
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "farmers-market-origin"

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  price_class = "PriceClass_All"

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  tags = {
    Name = "Farmers Market Agricultural CDN"
    Environment = var.environment
    Agricultural = "true"
  }

  viewer_certificate {
    acm_certificate_arn = aws_acm_certificate.agricultural_cert.arn
    ssl_support_method  = "sni-only"
  }
}
```

---

## ✅ DEVOPS EXCELLENCE CHECKLIST

### Git Workflow Excellence

- [ ] **Pre-commit validation** - Divine pattern checking active
- [ ] **Enhanced .gitignore** - 196 comprehensive patterns implemented
- [ ] **Professional repository** - Divine agricultural description configured
- [ ] **Git hooks integrated** - PowerShell pre-commit script operational
- [ ] **Agricultural consciousness** - Farming pattern detection enabled
- [ ] **Quality gates** - ESLint and test coverage validation
- [ ] **Commit conventions** - Divine naming suggestions provided

### CI/CD Pipeline

- [ ] Automated testing on every commit
- [ ] Build artifacts cached for speed
- [ ] Parallel job execution
- [ ] Deployment gated by test success
- [ ] Rollback strategy defined
- [ ] Environment-specific configurations
- [ ] Secrets managed securely

### Infrastructure

- [ ] Infrastructure as Code (Terraform)
- [ ] Multi-AZ deployment for HA
- [ ] Auto-scaling configured
- [ ] Database backups automated
- [ ] SSL/TLS certificates managed
- [ ] CDN configured for static assets
- [ ] Load balancing implemented

### Kubernetes Orchestration

- [ ] Agricultural namespace configuration
- [ ] Seasonal deployment strategies
- [ ] Horizontal pod autoscaling
- [ ] Agricultural-aware resource allocation
- [ ] Crop rotation deployment patterns
- [ ] Biodynamic configuration management

### CDN Distribution

- [ ] Agricultural edge locations optimized
- [ ] Seasonal content caching strategies
- [ ] Weather-dependent content delivery
- [ ] Farm image optimization
- [ ] Product catalog edge caching
- [ ] Real-time data bypass patterns

### Monitoring

- [ ] Application metrics tracked
- [ ] Error tracking configured (Sentry)
- [ ] Performance monitoring active
- [ ] Log aggregation setup
- [ ] Alerts configured for critical issues
- [ ] Uptime monitoring enabled
- [ ] Cost monitoring alerts set
- [ ] Agricultural consciousness tracking
- [ ] Seasonal performance benchmarks

---

_"Automation is not laziness - it is **divine wisdom** freeing humans for creative work. Infrastructure becomes the soil in which agricultural software consciousness can flourish."_
