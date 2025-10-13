# 🎯 CRITICAL FILES REFERENCE - FARMERS MARKET ENTERPRISE PLATFORM

## 🔥 PRODUCTION-CRITICAL FILES

### Core Application Files

```
farmers-market/
├── app/
│   ├── layout.tsx                    # Root layout with providers
│   ├── page.tsx                      # Homepage with dynamic content
│   ├── api/
│   │   ├── health/route.ts           # 🚨 CRITICAL: Health monitoring
│   │   ├── auth/[...nextauth]/route.ts # Authentication endpoints
│   │   ├── products/route.ts         # Product API with caching
│   │   ├── vendors/route.ts          # Vendor management API
│   │   └── orders/route.ts           # Order processing API
│   ├── shop/
│   │   ├── page.tsx                  # Enhanced shop with filtering
│   │   └── [id]/page.tsx             # Product detail pages
│   ├── cart/
│   │   └── page.tsx                  # Multi-vendor cart system
│   ├── checkout/
│   │   └── page.tsx                  # Complete checkout flow
│   └── vendors/
│       ├── page.tsx                  # Vendor directory
│       └── [slug]/page.tsx           # Individual vendor profiles
```

### Production Infrastructure Files

```
farmers-market/
├── Dockerfile                        # 🚨 CRITICAL: Production container
├── docker-compose.prod.yml           # 🚨 CRITICAL: Production orchestration
├── .github/
│   └── workflows/
│       └── ci-cd.yml                 # 🚨 CRITICAL: Automated deployment
├── scripts/
│   └── deploy.sh                     # 🚨 CRITICAL: Deployment automation
├── config/
│   └── quantum-monitoring.config.ts  # Performance monitoring config
└── docs/
    └── PRODUCTION_DEPLOYMENT_GUIDE.md # 🚨 CRITICAL: Deployment procedures
```

---

## 🛡️ SECURITY & PERFORMANCE FILES

### Security Infrastructure

- `middleware.ts` - Rate limiting, CSRF protection, security headers
- `lib/security/` - Security utilities and validation
- `lib/auth/` - Authentication configuration and providers

### Performance Optimization

- `lib/cache/` - Multi-layer caching system
- `lib/monitoring/` - Performance tracking and metrics
- `components/ui/` - Optimized reusable components

---

## 🚀 DEPLOYMENT CHECKLIST

### Pre-Deployment Requirements ✅

- [x] Environment variables configured
- [x] Database migrations ready
- [x] SSL certificates prepared
- [x] Domain DNS configured
- [x] CDN setup complete

### Production Services ✅

- [x] PostgreSQL database
- [x] Redis cache
- [x] Nginx reverse proxy
- [x] Prometheus monitoring
- [x] Grafana dashboards

### Monitoring Endpoints ✅

- [x] `/api/health` - Basic health check
- [x] `/api/health/detailed` - Comprehensive system status
- [x] `/api/health/ready` - Readiness probe
- [x] `/api/health/live` - Liveness probe

---

## 🎯 QUICK START COMMANDS

### Local Development

```bash
# Install dependencies
cd farmers-market && npm install

# Start development server
npm run dev

# Run tests
npm test

# Check production build
npm run build
```

### Production Deployment

```bash
# Build and deploy
./scripts/deploy.sh

# Check health
curl https://your-domain.com/api/health

# Monitor logs
docker-compose -f docker-compose.prod.yml logs -f app

# Scale services
docker-compose -f docker-compose.prod.yml up --scale app=3
```

---

## 📊 MONITORING DASHBOARD URLS

### Health Monitoring

- **Application Health**: `/api/health/detailed`
- **Prometheus Metrics**: `http://localhost:9090`
- **Grafana Dashboard**: `http://localhost:3001`

### Performance Tracking

- **Web Vitals**: Automated tracking in production
- **User Analytics**: Integrated with monitoring stack
- **Error Tracking**: Comprehensive error reporting

---

## 🔧 CONFIGURATION FILES

### Essential Config Files

- `next.config.js` - Next.js production optimization
- `tailwind.config.js` - UI styling configuration
- `prisma/schema.prisma` - Database schema
- `tsconfig.json` - TypeScript configuration
- `.env.example` - Environment variables template

### Docker Configuration

- `Dockerfile` - Multi-stage production build
- `docker-compose.yml` - Development environment
- `docker-compose.prod.yml` - Production orchestration
- `docker-compose.monitoring.yml` - Monitoring stack

---

## 🚨 EMERGENCY PROCEDURES

### Rollback Process

1. Stop current deployment: `docker-compose down`
2. Restore from backup: `./scripts/rollback.sh`
3. Health check: `curl /api/health`
4. Notify team: Automated alerts configured

### Critical Alerts

- **Service Down**: Automated Slack/email notifications
- **High Error Rate**: Threshold-based alerting
- **Performance Degradation**: Real-time monitoring
- **Security Issues**: Immediate incident response

---

## 🎊 SUCCESS METRICS

### Business KPIs

- **Conversion Rate**: Track shop to checkout flow
- **User Engagement**: Monitor real-time features
- **Vendor Adoption**: Track farmer registrations
- **Order Volume**: Monitor transaction growth

### Technical KPIs

- **Uptime**: 99.9% target
- **Response Time**: <200ms average
- **Error Rate**: <0.1%
- **Performance Score**: 95+ Lighthouse

---

*This reference guide provides immediate access to all critical production files and procedures.*

**Last Updated**: October 12, 2025  
**Platform Status**: ✅ **ENTERPRISE READY FOR PRODUCTION**