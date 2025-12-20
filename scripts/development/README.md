# 💻 Development Scripts

Scripts for local development, debugging, and quick development workflows.

## Available Scripts

### `START_NOW.bat` (Windows)

Quick start development server with all necessary services.

```cmd
scripts\development\START_NOW.bat
```

**What it does:**

1. Checks prerequisites (Node.js, database)
2. Installs dependencies (if needed)
3. Sets up environment variables
4. Runs database migrations
5. Starts development server on http://localhost:3000

**Features:**

- One-command startup
- Automatic dependency check
- Error handling and recovery
- Opens browser automatically

---

### `START-SERVER.bat` (Windows)

Standard development server start.

```cmd
scripts\development\START-SERVER.bat
```

**Usage:**

- Basic server startup
- No dependency checks
- Faster startup for regular development

---

### `start-server-fixed.sh` (Linux/Mac)

Development server with error fixes and optimizations.

```bash
./scripts/development/start-server-fixed.sh
```

**Features:**

- Automatic port conflict resolution
- Memory optimization for large projects
- Hot reload configuration
- Development-specific environment setup

**Fixes included:**

- Port 3000 availability check
- Node memory heap size optimization
- Proper signal handling (SIGINT, SIGTERM)
- Graceful shutdown

---

### `FIX_ALL_ERRORS.bat` (Windows)

Run all error fixing and linting scripts.

```cmd
scripts\development\FIX_ALL_ERRORS.bat
```

**What it fixes:**

1. ESLint errors (auto-fixable)
2. Prettier formatting
3. TypeScript type errors (where possible)
4. Import organization
5. Unused variable removal

**Output:**

- Summary of fixed issues
- List of remaining issues requiring manual fix
- Suggestions for resolution

---

### `fix-remaining-errors.sh` (Linux/Mac)

Fix remaining linting and type errors.

```bash
./scripts/development/fix-remaining-errors.sh
```

**What it does:**

- Runs ESLint with auto-fix
- Formats code with Prettier
- Checks TypeScript compilation
- Generates error report
- Provides fix suggestions

---

## Common Development Workflows

### Starting Fresh Development Session

```bash
# 1. Pull latest changes
git pull origin main

# 2. Install dependencies (if package.json changed)
npm install

# 3. Run migrations (if schema changed)
npx prisma migrate dev

# 4. Start development server
./scripts/development/start-server-fixed.sh
```

### Quick Start (Windows)

```cmd
# One command to rule them all
scripts\development\START_NOW.bat
```

### Fixing Errors Before Commit

```bash
# 1. Fix all auto-fixable errors
./scripts/development/fix-remaining-errors.sh

# 2. Review remaining issues
npm run lint

# 3. Fix manually as needed

# 4. Verify build works
npm run build
```

### Development with Hot Reload

```bash
# Start server (hot reload enabled by default)
npm run dev

# Make changes - server auto-restarts
# Edit files in src/
```

---

## Environment Setup

### Required Environment Variables

Create a `.env.local` file with:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/farmers_market_dev"
DIRECT_URL="postgresql://user:password@localhost:5432/farmers_market_dev"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-dev-secret-key-min-32-chars"

# Optional: External services
STRIPE_SECRET_KEY="sk_test_..."
UPLOADTHING_SECRET="..."
```

### Quick Environment Setup

```bash
# Copy example env file
cp .env.example .env.local

# Edit with your values
nano .env.local  # or use your preferred editor
```

---

## Troubleshooting

### Port Already in Use

**Issue:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solutions:**

```bash
# Option 1: Kill process on port 3000
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9

# Option 2: Use different port
PORT=3001 npm run dev
```

---

### Database Connection Errors

**Issue:** Cannot connect to PostgreSQL

**Solutions:**

```bash
# 1. Check if PostgreSQL is running
# Windows
sc query postgresql-x64-14

# Linux/Mac
sudo service postgresql status

# 2. Verify DATABASE_URL in .env.local

# 3. Test connection
npx prisma db pull

# 4. Run migrations
npx prisma migrate dev
```

---

### Module Not Found Errors

**Issue:** `Cannot find module '@/lib/...'`

**Solutions:**

```bash
# 1. Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# 2. Clear Next.js cache
rm -rf .next

# 3. Restart development server
npm run dev
```

---

### TypeScript Errors

**Issue:** Type errors preventing compilation

**Solutions:**

```bash
# 1. Run type check
npm run type-check

# 2. Auto-fix what's possible
./scripts/development/fix-remaining-errors.sh

# 3. Update TypeScript
npm install typescript@latest

# 4. Restart TS server in IDE
# VS Code: Cmd/Ctrl + Shift + P -> "TypeScript: Restart TS Server"
```

---

### Hot Reload Not Working

**Issue:** Changes not reflecting in browser

**Solutions:**

1. **Check Fast Refresh is enabled** (it should be by default)
2. **Hard refresh browser:** Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
3. **Clear browser cache**
4. **Restart dev server**
5. **Check for syntax errors** in console

---

### Memory Issues

**Issue:** JavaScript heap out of memory

**Solutions:**

```bash
# Increase Node.js memory limit
# Linux/Mac
export NODE_OPTIONS="--max-old-space-size=4096"
npm run dev

# Windows
set NODE_OPTIONS=--max-old-space-size=4096
npm run dev

# Or use the fixed script (already configured)
./scripts/development/start-server-fixed.sh
```

---

## Development Tools

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "prisma.prisma",
    "bradlc.vscode-tailwindcss",
    "ms-playwright.playwright"
  ]
}
```

### Debugging

#### VS Code Debug Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

#### Debug API Routes

```typescript
// Add breakpoints in your API route
export async function GET(request: NextRequest) {
  debugger; // Execution will pause here
  const data = await fetchData();
  return NextResponse.json(data);
}
```

---

## Performance Optimization

### Development Build Performance

```bash
# Enable SWC minifier (faster than Terser)
# Already configured in next.config.mjs

# Use turbopack (experimental - Next.js 13+)
npm run dev -- --turbo

# Disable type checking in dev (faster startup)
# next.config.mjs: typescript: { ignoreBuildErrors: true }
```

### Database Query Optimization

```bash
# Enable Prisma query logging
# In your .env.local
DEBUG="prisma:query"

# Then run dev server
npm run dev
```

---

## Code Quality Tools

### Linting

```bash
# Run ESLint
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Lint specific file
npx eslint src/app/page.tsx
```

### Formatting

```bash
# Format all files
npm run format

# Format specific file
npx prettier --write src/app/page.tsx

# Check formatting
npm run format:check
```

### Type Checking

```bash
# Check types
npm run type-check

# Watch mode
npm run type-check -- --watch
```

---

## Database Development

### Prisma Commands

```bash
# Create migration
npx prisma migrate dev --name add_user_role

# Reset database (DEV ONLY!)
npx prisma migrate reset

# Generate Prisma Client
npx prisma generate

# Open Prisma Studio (database GUI)
npx prisma studio

# View database schema
npx prisma db pull

# Push schema without migration
npx prisma db push
```

### Seeding Development Data

```bash
# Run seed script
npm run db:seed

# Reset and seed
npm run db:reset
```

---

## Testing During Development

### Quick Test Commands

```bash
# Run tests related to changed files
npm run test -- --watch

# Run specific test file
npm run test -- FarmCard.test.tsx

# Run tests with coverage
npm run test:coverage
```

---

## Git Workflow

### Pre-Commit Checklist

```bash
# 1. Fix errors
./scripts/development/fix-remaining-errors.sh

# 2. Run tests
npm run test

# 3. Build check
npm run build

# 4. Commit
git add .
git commit -m "feat: your message"
```

### Husky Git Hooks

The project uses Husky for pre-commit hooks:

- **pre-commit:** Runs linting and formatting
- **pre-push:** Runs tests

If you need to skip hooks (not recommended):

```bash
git commit --no-verify
```

---

## Quick Reference

```bash
# Start development server
npm run dev

# Start with scripts (recommended)
./scripts/development/start-server-fixed.sh  # Linux/Mac
scripts\development\START_NOW.bat            # Windows

# Fix errors
./scripts/development/fix-remaining-errors.sh  # Linux/Mac
scripts\development\FIX_ALL_ERRORS.bat         # Windows

# Database
npx prisma studio              # Open database GUI
npx prisma migrate dev         # Run migrations
npm run db:seed                # Seed data

# Code quality
npm run lint                   # Check linting
npm run format                 # Format code
npm run type-check             # Check types

# Testing
npm run test                   # Run tests
npm run test:watch             # Watch mode

# Build
npm run build                  # Production build
npm run start                  # Start production server
```

---

## Additional Resources

- **Next.js Documentation**: https://nextjs.org/docs
- **Prisma Documentation**: https://www.prisma.io/docs
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/handbook/
- **Project Documentation**: See `docs/development/`

---

## Tips for Faster Development

1. **Use TypeScript strict mode** - Catch errors early
2. **Enable ESLint in IDE** - Real-time error detection
3. **Use Prettier auto-format** - Save time on formatting
4. **Learn keyboard shortcuts** - Speed up workflow
5. **Use React DevTools** - Debug components easily
6. **Enable Fast Refresh** - See changes instantly
7. **Use Prisma Studio** - Visual database management
8. **Write tests as you code** - Prevent regressions

---

**Last Updated**: December 2025  
**Maintained By**: Farmers Market Platform Team  
**Divine Agricultural Consciousness**: Code with joy, debug with patience! 🌾✨
