# Scripts Reference

Organized collection of automation scripts for the Farmers Market Platform.

## 📁 Directory Structure

### `database/`
Database management scripts - setup, migrations, backups, diagnostics.

### `testing/`
Testing utilities - test data creation, test user management.

### `deployment/`
Deployment automation - Vercel, Docker, verification.

### `monitoring/`
Monitoring and health checks - production monitoring, Sentry, Redis.

### `maintenance/`
Maintenance tasks - cache management, cleanup, optimization.

### `inspection/`
Quality assurance - website inspection, bot checks, accessibility.

### `migration/`
Data migrations - schema changes, data transformations.

### `development/`
Development helpers - dev server management, cache warming.

### `utils/`
Shared utilities - reusable functions and helpers.

## 🚀 Common Commands

See package.json for all available npm scripts.

### Database
```bash
npm run db:setup      # Initial database setup
npm run db:seed       # Seed test data
npm run db:migrate    # Run migrations
```

### Testing
```bash
npm run test:users:create    # Create test users
npm run seed:test            # Seed test data
```

### Monitoring
```bash
npm run bot:production       # Run production health check
npm run sentry:check         # Check Sentry integration
```

## 📝 Adding New Scripts

1. Place script in appropriate category folder
2. Update this README
3. Add npm script to package.json if needed
4. Document usage and parameters
