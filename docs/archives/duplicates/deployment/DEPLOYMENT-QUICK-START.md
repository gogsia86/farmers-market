# 🚀 Deployment Quick Start Guide

## Congratulations! Your Docker Image is Live! 🎉

Your Farmers Market Platform image is now available on Docker Hub and ready to deploy anywhere!

---

## 📦 Image Information

- **Docker Hub**: https://hub.docker.com/r/gogsiasdocker/farmers-market-app
- **Image Name**: `gogsiasdocker/farmers-market-app`
- **Available Tags**: 
  - `latest` - Always points to the latest stable version
  - `v1.0.0` - Specific version tag
- **Size**: 698MB (160MB compressed)
- **Platform**: linux/amd64
- **Base**: Node.js 20 Alpine

---

## ⚡ Quick Deploy Commands

### Option 1: Docker Run (Simplest)

```bash
# Pull the image
docker pull gogsiasdocker/farmers-market-app:latest

# Run the container
docker run -d \
  --name farmers-market-app \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:password@localhost:5432/farmersmarket" \
  -e NEXTAUTH_SECRET="your-secret-here" \
  -e NEXTAUTH_URL="http://localhost:3000" \
  --restart unless-stopped \
  gogsiasdocker/farmers-market-app:latest
```

**Access**: http://localhost:3000

---

### Option 2: Docker Compose (Recommended)

Create `docker-compose.production.yml`:

```yaml
version: '3.8'

services:
  app:
    image: gogsiasdocker/farmers-market-app:latest
    container_name: farmers-market-app
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/farmersmarket
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
    depends_on:
      - db
      - redis
    restart: unless-stopped
    networks:
      - farmers-market-network

  db:
    image: postgis/postgis:16-3.4-alpine
    container_name: farmers-market-db
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=farmersmarket
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped
    networks:
      - farmers-market-network

  redis:
    image: redis:7-alpine
    container_name: farmers-market-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped
    networks:
      - farmers-market-network

volumes:
  postgres_data:
  redis_data:

networks:
  farmers-market-network:
    driver: bridge
```

**Deploy**:
```bash
# Set environment variables
export NEXTAUTH_SECRET="your-super-secret-key-here"
export NEXTAUTH_URL="https://yourdomain.com"

# Start all services
docker-compose -f docker-compose.production.yml up -d

# Check status
docker-compose -f docker-compose.production.yml ps

# View logs
docker-compose -f docker-compose.production.yml logs -f app
```

---

## 🌍 Deploy to Cloud Providers

### AWS ECS (Elastic Container Service)

```bash
# 1. Create task definition
aws ecs register-task-definition --cli-input-json file://ecs-task-def.json

# 2. Create service
aws ecs create-service \
  --cluster farmers-market-cluster \
  --service-name farmers-market-service \
  --task-definition farmers-market-app \
  --desired-count 2 \
  --launch-type FARGATE
```

---

### Azure Container Instances

```bash
# Deploy to Azure
az container create \
  --resource-group farmers-market-rg \
  --name farmers-market-app \
  --image gogsiasdocker/farmers-market-app:latest \
  --dns-name-label farmers-market \
  --ports 3000 \
  --environment-variables \
    NODE_ENV=production \
    DATABASE_URL=$DATABASE_URL \
    NEXTAUTH_SECRET=$NEXTAUTH_SECRET
```

---

### Google Cloud Run

```bash
# Deploy to Cloud Run
gcloud run deploy farmers-market-app \
  --image gogsiasdocker/farmers-market-app:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000 \
  --set-env-vars DATABASE_URL=$DATABASE_URL,NEXTAUTH_SECRET=$NEXTAUTH_SECRET
```

---

### DigitalOcean App Platform

1. Go to: https://cloud.digitalocean.com/apps
2. Click **"Create App"**
3. Choose **"Docker Hub"**
4. Enter: `gogsiasdocker/farmers-market-app:latest`
5. Configure environment variables
6. Click **"Deploy"**

---

### Heroku

```bash
# Login to Heroku container registry
heroku container:login

# Pull from Docker Hub and push to Heroku
docker pull gogsiasdocker/farmers-market-app:latest
docker tag gogsiasdocker/farmers-market-app:latest registry.heroku.com/your-app-name/web
docker push registry.heroku.com/your-app-name/web

# Release
heroku container:release web -a your-app-name
```

---

## 🔧 Required Environment Variables

**Essential**:
```bash
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/dbname
NEXTAUTH_SECRET=your-super-secret-key-minimum-32-characters
NEXTAUTH_URL=https://yourdomain.com
```

**Optional but Recommended**:
```bash
# Redis
REDIS_URL=redis://localhost:6379

# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Storage (for uploads)
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET=farmers-market-uploads
AWS_REGION=us-east-1

# Monitoring
SENTRY_DSN=https://your-sentry-dsn
AZURE_APPINSIGHTS_KEY=your-key

# Stripe (payments)
STRIPE_PUBLIC_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

---

## 🗄️ Database Setup

### Run Migrations

```bash
# After container is running
docker exec -it farmers-market-app npx prisma migrate deploy

# Optional: Seed database
docker exec -it farmers-market-app npx prisma db seed
```

### Database Connection String Format

```
postgresql://[user]:[password]@[host]:[port]/[database]?schema=public
```

**Example**:
```
postgresql://postgres:mypassword@db.example.com:5432/farmersmarket?schema=public
```

---

## ✅ Health Check & Verification

### Check Container Status

```bash
# View running containers
docker ps

# Check logs
docker logs farmers-market-app

# Follow logs in real-time
docker logs -f farmers-market-app

# Check container health
docker inspect farmers-market-app | grep -A 10 Health
```

### API Health Endpoint

```bash
# Check if app is running
curl http://localhost:3000/api/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2024-11-24T20:00:00.000Z",
  "uptime": 123.456
}
```

### Full System Check

```bash
# Test database connection
docker exec farmers-market-app npx prisma db execute --stdin < "SELECT 1"

# Check Next.js build
curl http://localhost:3000

# Check API routes
curl http://localhost:3000/api/farms
```

---

## 🔄 Update & Rollback

### Update to New Version

```bash
# Pull latest image
docker pull gogsiasdocker/farmers-market-app:latest

# Stop old container
docker stop farmers-market-app
docker rm farmers-market-app

# Start new container
docker run -d --name farmers-market-app \
  -p 3000:3000 \
  --env-file .env.production \
  gogsiasdocker/farmers-market-app:latest
```

### Rollback to Previous Version

```bash
# Stop current
docker stop farmers-market-app
docker rm farmers-market-app

# Run specific version
docker run -d --name farmers-market-app \
  -p 3000:3000 \
  --env-file .env.production \
  gogsiasdocker/farmers-market-app:v1.0.0
```

---

## 📊 Monitoring & Logs

### View Logs

```bash
# Last 100 lines
docker logs --tail 100 farmers-market-app

# Follow logs
docker logs -f farmers-market-app

# With timestamps
docker logs -t farmers-market-app

# Specific time range
docker logs --since 1h farmers-market-app
```

### Container Stats

```bash
# Real-time stats
docker stats farmers-market-app

# Resource usage
docker container inspect farmers-market-app --format='{{.State.Status}}'
```

---

## 🔒 Security Best Practices

### Use Secrets Management

**Docker Secrets**:
```bash
# Create secrets
echo "my-secret-key" | docker secret create nextauth_secret -

# Use in stack
docker service create \
  --name farmers-market-app \
  --secret nextauth_secret \
  gogsiasdocker/farmers-market-app:latest
```

**Environment Files**:
```bash
# Never commit .env files!
# Use .env.example as template

# Create production env file
cp .env.example .env.production
nano .env.production  # Edit with real values

# Run with env file
docker run -d --env-file .env.production gogsiasdocker/farmers-market-app:latest
```

### SSL/TLS (HTTPS)

**Using Nginx Reverse Proxy**:
```bash
# Use included nginx configuration
docker-compose -f docker-compose.yml up -d
```

**Using Caddy (Auto SSL)**:
```bash
docker run -d \
  -p 80:80 -p 443:443 \
  -v caddy_data:/data \
  caddy:alpine \
  caddy reverse-proxy --from yourdomain.com --to localhost:3000
```

---

## 🚨 Troubleshooting

### Container Won't Start

```bash
# Check logs for errors
docker logs farmers-market-app

# Common issues:
# 1. Port already in use
docker ps  # Check what's using port 3000

# 2. Missing environment variables
docker inspect farmers-market-app | grep -A 20 Env

# 3. Database connection failed
# Verify DATABASE_URL is correct
```

### Database Connection Issues

```bash
# Test database connectivity
docker exec farmers-market-app nc -zv db-host 5432

# Check Prisma connection
docker exec farmers-market-app npx prisma db pull
```

### Performance Issues

```bash
# Check resource usage
docker stats farmers-market-app

# Increase memory limit
docker run -d --memory="2g" --cpus="2" \
  gogsiasdocker/farmers-market-app:latest
```

---

## 📚 Additional Resources

- **Full Docker Documentation**: `DOCKER_DEPLOYMENT_GUIDE.md`
- **Docker Compose Files**: `docker-compose.yml`, `docker-compose.production.yml`
- **Nginx Configuration**: `nginx/nginx.conf`
- **Environment Template**: `.env.production.example`
- **Database Schema**: `prisma/schema.prisma`

---

## 🎯 Production Checklist

### Before Deploying:
- [ ] Set strong `NEXTAUTH_SECRET` (32+ characters)
- [ ] Configure production `DATABASE_URL`
- [ ] Set up SSL/TLS certificates
- [ ] Configure email service (SMTP)
- [ ] Set up Redis for caching
- [ ] Configure file storage (S3 or similar)
- [ ] Set up monitoring (Sentry, AppInsights)
- [ ] Configure backup strategy

### After Deploying:
- [ ] Run database migrations
- [ ] Verify health endpoint responds
- [ ] Test user registration/login
- [ ] Check API endpoints
- [ ] Monitor logs for errors
- [ ] Set up automated backups
- [ ] Configure CI/CD pipeline
- [ ] Document deployment process

---

## 🌟 Quick Command Reference

```bash
# Pull image
docker pull gogsiasdocker/farmers-market-app:latest

# Run container
docker run -d -p 3000:3000 --env-file .env.production gogsiasdocker/farmers-market-app:latest

# View logs
docker logs -f farmers-market-app

# Run migrations
docker exec farmers-market-app npx prisma migrate deploy

# Shell into container
docker exec -it farmers-market-app sh

# Stop container
docker stop farmers-market-app

# Remove container
docker rm farmers-market-app

# Clean up
docker system prune -a
```

---

## 🎊 You're Ready to Deploy!

Your Farmers Market Platform is containerized and ready to deploy to any cloud provider or server!

**Image**: `gogsiasdocker/farmers-market-app:latest`

**Next Steps**:
1. Choose deployment target (AWS, Azure, GCP, DigitalOcean, etc.)
2. Set up environment variables
3. Configure database
4. Deploy container
5. Run migrations
6. Test and monitor

**Need Help?**
- Check troubleshooting section
- Review `DOCKER_DEPLOYMENT_GUIDE.md`
- Inspect container logs: `docker logs farmers-market-app`

---

**🌾 Divine Agricultural Platform - Ready for Production! 🚀**