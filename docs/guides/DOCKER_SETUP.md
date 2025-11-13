# 🐳 Docker Setup Guide - Farmers Market Platform

Complete guide for running the Farmers Market Platform with Docker Desktop.

---

## 📋 **Prerequisites**

1. ✅ **Docker Desktop** installed and running
   - Download: https://www.docker.com/products/docker-desktop/
   - Minimum: 4GB RAM allocated to Docker
   - Recommended: 8GB RAM for optimal performance

2. ✅ **Git** (for cloning the repository)

3. ✅ **Basic terminal/command line knowledge**

---

## 🚀 **Quick Start (Production Mode)**

### **Step 1: Clone & Navigate**

```bash
cd "m:\Repo\Farmers Market Platform web and app"
```

### **Step 2: Configure Environment**

```bash
# Copy environment template
copy .env.docker.example .env.docker

# Edit .env.docker with your values
notepad .env.docker
```

**Important**: Change these values in `.env.docker`:

- `DB_PASSWORD` - Strong database password
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `STRIPE_SECRET_KEY` - Your Stripe API key (if using payments)

### **Step 3: Start All Services**

```bash
docker-compose --env-file .env.docker up -d
```

This starts:

- ✅ PostgreSQL database (port 5432)
- ✅ Redis cache (port 6379)
- ✅ Next.js application (port 3000)

### **Step 4: Run Database Migrations**

```bash
# Run Prisma migrations
docker-compose exec app npx prisma migrate deploy

# Seed the database
docker-compose exec app npx prisma db seed
```

### **Step 5: Access the Application**

- **Website**: http://localhost:3000
- **Health Check**: http://localhost:3000/api/health

---

## 🛠️ **Development Mode (Hot Reload)**

For active development with instant code updates:

### **Start Development Environment**

```bash
docker-compose -f docker-compose.dev.yml up -d
```

This provides:

- ✅ Hot reload (changes reflect instantly)
- ✅ Source code mounted as volume
- ✅ Development server on port 3001
- ✅ pgAdmin on port 5050

### **Access Development Services**

- **Website**: http://localhost:3001
- **pgAdmin**: http://localhost:5050
  - Email: `dev@farmersmarket.local`
  - Password: `dev123`

---

## 📊 **Managing Services**

### **View Running Containers**

```bash
docker-compose ps
```

### **View Logs**

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f postgres
docker-compose logs -f redis
```

### **Stop Services**

```bash
# Stop but keep data
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop and remove volumes (WARNING: deletes data!)
docker-compose down -v
```

### **Restart Services**

```bash
docker-compose restart
docker-compose restart app  # Restart only the app
```

---

## 🗄️ **Database Management**

### **Access PostgreSQL CLI**

```bash
docker-compose exec postgres psql -U farmersmarket -d farmersmarket
```

### **Run Prisma Commands**

```bash
# Generate Prisma Client
docker-compose exec app npx prisma generate

# Run migrations
docker-compose exec app npx prisma migrate dev

# View database in Prisma Studio
docker-compose exec app npx prisma studio
```

### **Backup Database**

```bash
docker-compose exec postgres pg_dump -U farmersmarket farmersmarket > backup.sql
```

### **Restore Database**

```bash
docker-compose exec -T postgres psql -U farmersmarket -d farmersmarket < backup.sql
```

---

## 🔧 **Troubleshooting**

### **Problem: Port Already in Use**

```bash
# Windows: Find process using port
netstat -ano | findstr :3000

# Kill the process
taskkill /PID <PID> /F
```

### **Problem: Database Connection Error**

```bash
# Check if PostgreSQL is healthy
docker-compose exec postgres pg_isready -U farmersmarket

# Restart database
docker-compose restart postgres
```

### **Problem: App Won't Start**

```bash
# View detailed logs
docker-compose logs app

# Rebuild the container
docker-compose build --no-cache app
docker-compose up -d app
```

### **Problem: Out of Disk Space**

```bash
# Clean up unused Docker resources
docker system prune -a --volumes

# Remove specific project volumes
docker-compose down -v
```

---

## 🎯 **Production Deployment**

### **Build for Production**

```bash
# Build optimized image
docker build -t farmers-market:latest .

# Tag for registry
docker tag farmers-market:latest your-registry.com/farmers-market:latest

# Push to registry
docker push your-registry.com/farmers-market:latest
```

### **Run with Docker Swarm (Optional)**

```bash
docker swarm init
docker stack deploy -c docker-compose.yml farmers-market
```

---

## 📈 **Performance Tuning**

### **Allocate More Resources**

Docker Desktop → Settings → Resources:

- **CPUs**: 4-6 cores
- **Memory**: 8-16 GB
- **Swap**: 2 GB
- **Disk**: 60 GB

### **Optimize Build Cache**

```bash
# Use BuildKit for faster builds
$env:DOCKER_BUILDKIT=1
docker-compose build
```

---

## 🔐 **Security Checklist**

Before deploying to production:

- [ ] Change all default passwords in `.env.docker`
- [ ] Use strong `NEXTAUTH_SECRET`
- [ ] Enable HTTPS (use reverse proxy like Nginx)
- [ ] Restrict database ports (don't expose 5432 publicly)
- [ ] Use Docker secrets for sensitive data
- [ ] Enable firewall rules
- [ ] Set up regular backups
- [ ] Monitor logs for suspicious activity

---

## 📚 **Additional Resources**

- **Docker Documentation**: https://docs.docker.com/
- **Docker Compose**: https://docs.docker.com/compose/
- **Next.js Docker**: https://nextjs.org/docs/deployment#docker-image
- **Prisma with Docker**: https://www.prisma.io/docs/guides/deployment/deploy-to-docker

---

## 🆘 **Getting Help**

If you encounter issues:

1. Check logs: `docker-compose logs -f`
2. Verify health: `docker-compose ps`
3. Review environment variables: `docker-compose config`
4. Consult README.md for project-specific details

---

**Built with 💚 by the Farmers Market team**
