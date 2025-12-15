# Quick Reference Guide

## Farmers Market Platform - Development Commands

**Last Updated:** December 1, 2024  
**Server Port:** 3001  
**Status:** ✅ All systems operational

---

## 🚀 Getting Started

### Start Development Server

```bash
npm run dev
```

**Access:** http://localhost:3001

### Alternative Dev Modes

```bash
npm run dev:safe          # Safe mode with error handling
npm run dev:webpack       # Use Webpack instead of Turbo
npm run dev:logger        # Enable debug logging
npm run dev:omen          # High-performance mode (64GB RAM systems)
```

---

## 🏗️ Building

### Standard Build

```bash
npm run build
```

### Optimized Build

```bash
npm run build:optimized
```

### Build for Docker

```bash
npm run build:docker
```

### Start Production Server

```bash
npm run start             # Port 3001
```

---

## ✅ Quality Checks

### Type Checking

```bash
npm run type-check        # Standard
npm run type-check:omen   # High-performance systems
```

### Code Linting

```bash
npm run lint              # Check for issues
npm run lint:fix          # Auto-fix issues
npm run lint:quiet        # Suppress warnings
```

### Code Formatting

```bash
npm run format            # Format all files
npm run format:check      # Check formatting only
```

### Full Quality Check

```bash
npm run quality           # type-check + lint + format:check
npm run quality:fix       # type-check + lint:fix + format
```

---

## 🧪 Testing

### Unit Tests

```bash
npm test                  # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # With coverage report
npm run test:omen         # High-performance mode
```

### Integration Tests

```bash
npm run test:integration
```

### E2E Tests

```bash
npm run test:e2e          # Standard
npm run test:e2e:ui       # With UI
npm run test:e2e:headed   # See browser
npm run test:e2e:debug    # Debug mode
```

### All Tests

```bash
npm run test:all          # Unit + E2E
npm run test:all:omen     # High-performance mode
```

---

## 🗄️ Database

### Migrations

```bash
npm run db:migrate        # Create and apply migration
npm run db:push           # Push schema changes
```

### Seeding

```bash
npm run db:seed           # Full seed
npm run db:seed:basic     # Basic seed only
```

### Database Setup

```bash
npm run db:setup          # Push + seed
npm run db:reset          # Reset and seed
```

### Prisma Studio

```bash
npm run db:studio         # Open GUI on http://localhost:5555
```

---

## 📊 Monitoring

### Dashboard

```bash
npm run monitor:dashboard:test    # Test monitoring APIs
```

### Workflow Monitor

```bash
npm run monitor                   # All workflows
npm run monitor:critical          # Critical only
npm run monitor:health            # Health check
npm run monitor:reports           # View reports
```

### Monitoring Daemon

```bash
npm run monitor:daemon:pm2        # Start daemon
npm run monitor:daemon:stop       # Stop daemon
npm run monitor:daemon:restart    # Restart daemon
npm run monitor:daemon:logs       # View logs
npm run monitor:daemon:status     # Check status
```

---

## 🧹 Maintenance

### Clean Cache

```bash
npm run clean:cache       # Clean test cache
npm run clean:all         # Clean all caches
```

### Kill Dev Server

```bash
npm run kill-server       # Force stop dev server
```

---

## 🔧 Troubleshooting

### TypeScript Errors

✅ **Status:** All fixed (see TYPESCRIPT_FIXES_SUMMARY.md)

### Build Fails

1. Check TypeScript: `npm run type-check`
2. Clean cache: `npm run clean:all`
3. Reinstall: `rm -rf node_modules && npm install`

### Development Server Won't Start

1. Kill existing server: `npm run kill-server`
2. Check port 3001 is free
3. Try safe mode: `npm run dev:safe`

### Database Issues

1. Reset database: `npm run db:reset`
2. Check connection string in `.env.local`
3. Ensure PostgreSQL is running

### ESLint Issues

**Known Issue:** `next lint` has a directory resolution bug  
**Workaround:** Use type checking instead: `npm run type-check`

---

## 📁 Important Files

### Configuration

- `next.config.mjs` - Next.js configuration
- `tsconfig.json` - TypeScript configuration
- `eslint.config.mjs` - ESLint configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `prisma/schema.prisma` - Database schema

### Environment Variables

- `.env.local` - Local development (create from .env.example)
- `.env.production` - Production settings
- `.env` - Shared settings

### Documentation

- `README.md` - Project overview
- `TYPESCRIPT_FIXES_SUMMARY.md` - Recent error fixes
- `START_HERE_UPGRADE.md` - Platform upgrade guide
- `100_PERCENT_PRODUCTION_READY.md` - Production readiness

---

## 🎯 Common Workflows

### Starting Fresh Development Session

```bash
git pull
npm install
npm run db:push
npm run dev
```

### Before Committing

```bash
npm run quality:fix
npm test
git add .
git commit -m "Your message"
```

### Preparing for Production

```bash
npm run clean:all
npm install
npm run type-check
npm run build
npm run test:all
```

### Creating a Production Build

```bash
npm run build:optimized
npm run start
# Test on http://localhost:3001
```

---

## 🌐 URLs

| Service       | URL                              |
| ------------- | -------------------------------- |
| Development   | http://localhost:3001            |
| Production    | http://localhost:3001            |
| Prisma Studio | http://localhost:5555            |
| API Health    | http://localhost:3001/api/health |

---

## 💡 Pro Tips

1. **Performance:** Use `dev:omen` mode on high-end systems (64GB+ RAM)
2. **Type Safety:** Run `npm run type-check` before committing
3. **Database:** Use Prisma Studio for quick data inspection
4. **Monitoring:** Keep an eye on `monitoring-reports/` directory
5. **Clean Build:** Run `clean:all` if experiencing weird build issues
6. **Memory:** Server uses `--max-old-space-size=16384` (16GB) by default

---

## 🆘 Help & Support

### Documentation

- Check `/docs` folder for detailed guides
- Review `.github/instructions` for feature documentation

### Debug Mode

```bash
# Enable detailed logging
npm run dev:logger

# Check diagnostics
npm run diagnostic
```

### System Requirements

- Node.js >= 20.19.0
- npm >= 10.0.0
- PostgreSQL (latest)
- 16GB+ RAM recommended

---

**Happy Coding! 🌾✨**
