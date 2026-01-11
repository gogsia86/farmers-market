# 🚀 Developer Onboarding Guide - Get Started in 30 Minutes

**Last Updated:** January 10, 2025  
**Version:** 1.0.0  
**Target Time:** 30 minutes to first successful dev server run  
**Status:** ✅ Production Ready

---

## 📋 Table of Contents

- [Quick Start (30 Minutes)](#quick-start-30-minutes)
- [Prerequisites](#prerequisites)
- [Installation Steps](#installation-steps)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Verification](#verification)
- [Your First Change](#your-first-change)
- [Common Issues](#common-issues)
- [IDE Setup](#ide-setup)
- [Next Steps](#next-steps)

---

## 🎯 Quick Start (30 Minutes)

This guide will get you from zero to a running development server in **30 minutes or less**.

### What You'll Accomplish

By the end of this guide:

- ✅ Development environment fully configured
- ✅ Database running locally
- ✅ Application running at `http://localhost:3001`
- ✅ Ready to make your first contribution
- ✅ Understanding of core project structure

### Time Breakdown

| Task                | Duration   |
| ------------------- | ---------- |
| Prerequisites Check | 5 min      |
| Clone & Install     | 8 min      |
| Environment Setup   | 7 min      |
| Database Setup      | 5 min      |
| First Run           | 3 min      |
| Verification        | 2 min      |
| **Total**           | **30 min** |

---

## ✅ Prerequisites

### Required Software

Before starting, ensure you have:

| Software       | Version | Check Command    | Install Link                             |
| -------------- | ------- | ---------------- | ---------------------------------------- |
| **Node.js**    | 20.x    | `node --version` | [nodejs.org](https://nodejs.org)         |
| **npm**        | 10.x+   | `npm --version`  | Included with Node.js                    |
| **Git**        | 2.x+    | `git --version`  | [git-scm.com](https://git-scm.com)       |
| **PostgreSQL** | 14+     | `psql --version` | [postgresql.org](https://postgresql.org) |

### Optional but Recommended

| Software    | Purpose                               | Link                                                   |
| ----------- | ------------------------------------- | ------------------------------------------------------ |
| **VSCode**  | IDE with excellent TypeScript support | [code.visualstudio.com](https://code.visualstudio.com) |
| **Docker**  | For containerized PostgreSQL          | [docker.com](https://docker.com)                       |
| **Postman** | API testing                           | [postman.com](https://postman.com)                     |

### Quick Prerequisites Check

Run this command to verify your setup:

```bash
node --version && npm --version && git --version && psql --version
```

**Expected Output:**

```
v20.x.x (or v22.x.x)
10.x.x
git version 2.x.x
psql (PostgreSQL) 14.x (or higher)
```

---

## 📦 Installation Steps

### Step 1: Clone the Repository (2 minutes)

```bash
# Clone the repository
git clone https://github.com/yourusername/farmers-market-platform.git

# Navigate to project directory
cd farmers-market-platform

# Verify you're on the main branch
git branch
```

**Expected Output:**

```
* main
```

### Step 2: Install Dependencies (6 minutes)

```bash
# Install all dependencies
npm install

# Wait for installation to complete
# This may take 5-8 minutes depending on internet speed
```

**What's Being Installed:**

- Next.js 16.1.1 (React 19 framework)
- Prisma 7.2.0 (Database ORM)
- TypeScript 5.9.3 (Type safety)
- NextAuth v5 (Authentication)
- 200+ other dependencies

**Expected Output (at end):**

```
added 1887 packages, and audited 1888 packages in Xs

291 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

### Step 3: Verify Installation

```bash
# Check if node_modules was created
ls node_modules

# Verify Prisma was installed
npx prisma --version

# Verify Next.js was installed
npx next --version
```

---

## 🔐 Environment Configuration

### Step 1: Create Environment File (2 minutes)

```bash
# Copy the example environment file
cp .env.example .env.local

# Open in your editor
code .env.local  # VSCode
# or
nano .env.local  # Terminal editor
```

### Step 2: Configure Required Variables (5 minutes)

Open `.env.local` and update the following:

#### Database Connection

```bash
# PostgreSQL Connection
DATABASE_URL="postgresql://username:password@localhost:5432/farmers_market_dev?schema=public"

# Replace:
# - username: your PostgreSQL username (default: postgres)
# - password: your PostgreSQL password
# - farmers_market_dev: your database name
```

#### NextAuth Configuration

```bash
# Generate a random secret (run this in terminal):
# openssl rand -base64 32

NEXTAUTH_SECRET="your-generated-secret-here"
NEXTAUTH_URL="http://localhost:3001"
```

#### Optional Services (Can Skip for Now)

```bash
# Email (optional - for production)
SENDGRID_API_KEY=""

# Stripe (optional - for payments)
STRIPE_SECRET_KEY=""
STRIPE_PUBLISHABLE_KEY=""

# Redis (optional - for caching)
REDIS_URL=""

# Cloudinary (optional - for image uploads)
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
```

### Step 3: Verify Environment Variables

```bash
# Check if .env.local exists and is not empty
cat .env.local | grep DATABASE_URL
cat .env.local | grep NEXTAUTH_SECRET
```

**Expected Output:**

```
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret..."
```

---

## 🗄️ Database Setup

### Option 1: Local PostgreSQL (Recommended for Development)

#### Step 1: Start PostgreSQL Service

```bash
# Windows (if installed via installer)
# PostgreSQL should start automatically

# macOS (via Homebrew)
brew services start postgresql@14

# Linux (via systemd)
sudo systemctl start postgresql

# Verify it's running
psql --version
```

#### Step 2: Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Inside psql, create database:
CREATE DATABASE farmers_market_dev;

# Verify database was created
\l

# Exit psql
\q
```

#### Step 3: Run Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database (optional)
npx prisma db seed
```

**Expected Output:**

```
✔ Generated Prisma Client (v7.2.0)

Your database is now in sync with your schema.

✔ Generated Prisma Client to ./node_modules/@prisma/client
```

### Option 2: Docker PostgreSQL (Alternative)

```bash
# Start PostgreSQL in Docker
docker run --name farmers-market-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=farmers_market_dev \
  -p 5432:5432 \
  -d postgres:14

# Verify container is running
docker ps

# Then run migrations
npx prisma migrate dev
```

### Step 4: Verify Database Setup

```bash
# Open Prisma Studio to view database
npx prisma studio

# Opens at http://localhost:5555
# You should see all tables
```

---

## 🚀 Running the Application

### Step 1: Start Development Server (1 minute)

```bash
# Start the dev server with Turbopack
npm run dev

# Alternative: Start with webpack
npm run dev:webpack
```

**Expected Output:**

```
▲ Next.js 16.1.1 (Turbopack)
- Local:         http://localhost:3001
- Network:       http://172.x.x.x:3001

✓ Starting...
✓ Ready in 2.6s
```

### Step 2: Access the Application

Open your browser and navigate to:

```
http://localhost:3001
```

**You should see:**

- ✅ Farmers Market Platform homepage
- ✅ Navigation header
- ✅ No console errors (F12 to check)

### Common Commands

```bash
# Development server (Turbopack - fastest)
npm run dev

# Development server (Webpack - for debugging)
npm run dev:webpack

# Production build
npm run build

# Production server (must build first)
npm run start

# Type checking
npm run type-check

# Linting
npm run lint

# Testing
npm run test

# Database UI
npx prisma studio
```

---

## ✅ Verification

### Step 1: Health Check

Visit: http://localhost:3001/api/health

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "database": "connected",
    "uptime": 123,
    "timestamp": "2025-01-10T12:00:00.000Z"
  }
}
```

### Step 2: Interactive API Docs

Visit: http://localhost:3001/api-docs

**You should see:**

- ✅ Swagger UI interface
- ✅ All API endpoints listed
- ✅ Ability to test endpoints

### Step 3: Database Connection

```bash
# Check database connection
npx prisma db pull

# Should not error out
```

### Step 4: TypeScript Check

```bash
# Run type checking
npm run type-check

# Expected output (no errors):
# ✓ Type checking complete
```

### Verification Checklist

- [ ] Dev server starts without errors
- [ ] Can access http://localhost:3001
- [ ] Health check returns 200 OK
- [ ] API docs loads at /api-docs
- [ ] Database connection successful
- [ ] No TypeScript errors
- [ ] No console errors in browser

---

## 🎨 Your First Change

Let's make a simple change to verify your setup works end-to-end.

### Step 1: Create a Feature Branch

```bash
# Create and switch to new branch
git checkout -b feat/my-first-change

# Verify you're on the new branch
git branch
```

### Step 2: Make a Simple Change

Edit `src/app/page.tsx`:

```typescript
// Find the welcome text and add your name
<h1>
  Welcome to Farmers Market Platform, [Your Name]!
</h1>
```

### Step 3: Verify Hot Reload

Save the file and check your browser at http://localhost:3001

**You should see:**

- ✅ Page automatically refreshes
- ✅ Your name appears in the heading
- ✅ No errors

### Step 4: Commit Your Change

```bash
# Check what changed
git status

# Stage your change
git add src/app/page.tsx

# Commit with a descriptive message
git commit -m "feat: personalize welcome message"

# View your commit
git log --oneline -1
```

### Step 5: Switch Back

```bash
# Revert your change and switch back to main
git checkout main

# Delete your test branch
git branch -D feat/my-first-change
```

**Congratulations! 🎉 You've successfully:**

- Created a branch
- Made a change
- Verified hot reload
- Committed code
- Used Git workflow

---

## ❌ Common Issues

### Issue 1: Port Already in Use

**Error:**

```
Error: listen EADDRINUSE: address already in use :::3001
```

**Solution:**

```bash
# Find process using port 3001
# Windows:
netstat -ano | findstr :3001

# macOS/Linux:
lsof -i :3001

# Kill the process or use different port
npm run dev -- -p 3002
```

### Issue 2: Database Connection Failed

**Error:**

```
Error: Can't reach database server
```

**Solutions:**

1. **Check PostgreSQL is running:**

```bash
# Windows
services.msc  # Look for PostgreSQL

# macOS
brew services list

# Linux
sudo systemctl status postgresql
```

2. **Verify credentials in .env.local:**

```bash
cat .env.local | grep DATABASE_URL
# Ensure username, password, and database name are correct
```

3. **Test connection manually:**

```bash
psql -U postgres -d farmers_market_dev
```

### Issue 3: Prisma Generate Fails

**Error:**

```
Error: @prisma/client did not initialize yet
```

**Solution:**

```bash
# Regenerate Prisma Client
npx prisma generate

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue 4: Type Errors

**Error:**

```
Type error: Property 'xyz' does not exist
```

**Solution:**

```bash
# Restart TypeScript server in VSCode
# Cmd+Shift+P → "TypeScript: Restart TS Server"

# Or run type check
npm run type-check
```

### Issue 5: Module Not Found

**Error:**

```
Error: Cannot find module '@/lib/...'
```

**Solution:**

```bash
# Restart dev server
# Press Ctrl+C to stop
npm run dev

# If persists, clear Next.js cache
rm -rf .next
npm run dev
```

### Issue 6: EACCES Permission Error

**Error:**

```
Error: EACCES: permission denied
```

**Solution:**

```bash
# Fix npm permissions (don't use sudo)
# Option 1: Use nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20

# Option 2: Change npm default directory
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
```

---

## 💻 IDE Setup

### VSCode (Recommended)

#### Step 1: Install Recommended Extensions

The project includes a `.vscode/extensions.json` file with recommended extensions.

**When you open the project, VSCode will prompt:**

> "This workspace has extension recommendations"

Click **"Install All"**

**Key Extensions:**

- ESLint - Code linting
- Prettier - Code formatting
- Prisma - Schema highlighting
- TypeScript - Enhanced IntelliSense
- Tailwind CSS IntelliSense - CSS autocomplete

**Manual Installation:**

```bash
# View recommended extensions
cat .vscode/extensions.json

# Install via command palette
# Cmd+Shift+P → "Extensions: Show Recommended Extensions"
```

#### Step 2: Configure VSCode Settings

Create `.vscode/settings.json` (if not exists):

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "files.exclude": {
    "**/.next": true,
    "**/node_modules": true,
    "**/.git": true
  }
}
```

#### Step 3: Keyboard Shortcuts

Learn these essential shortcuts:

| Action           | Windows/Linux  | macOS            |
| ---------------- | -------------- | ---------------- |
| Command Palette  | `Ctrl+Shift+P` | `Cmd+Shift+P`    |
| Quick Open       | `Ctrl+P`       | `Cmd+P`          |
| Go to Definition | `F12`          | `F12`            |
| Find References  | `Shift+F12`    | `Shift+F12`      |
| Rename Symbol    | `F2`           | `F2`             |
| Format Document  | `Shift+Alt+F`  | `Shift+Option+F` |

### Other IDEs

#### WebStorm

```bash
# Enable TypeScript
# Settings → Languages & Frameworks → TypeScript
# Check "Enable TypeScript"

# Enable ESLint
# Settings → Languages & Frameworks → JavaScript → Code Quality Tools → ESLint
# Select "Automatic ESLint configuration"
```

#### Vim/Neovim

```bash
# Install coc.nvim for TypeScript support
# Add to .vimrc / init.vim:
Plug 'neoclide/coc.nvim', {'branch': 'release'}
Plug 'prisma/vim-prisma'

# Install coc-tsserver
:CocInstall coc-tsserver coc-eslint coc-prettier
```

---

## 📚 Next Steps

### Immediate Actions (Next 30 Minutes)

1. **Read Core Documentation**
   - [ ] [Project README](../../README.md)
   - [ ] [Architecture Overview](../architecture/OVERVIEW.md)
   - [ ] [API Documentation](../api/README.md)
   - [ ] [Coding Standards](../../.cursorrules)

2. **Explore the Codebase**

   ```bash
   # Browse project structure
   tree -L 2 src/

   # Open key files
   code src/app/layout.tsx        # Root layout
   code src/lib/database/index.ts # Database singleton
   code prisma/schema.prisma      # Database schema
   ```

3. **Run All Scripts**
   ```bash
   npm run lint           # Check code quality
   npm run type-check     # Check types
   npm run test           # Run tests
   npm run build          # Production build
   ```

### First Day Tasks

- [ ] Complete [Onboarding Checklist](../onboarding-checklist.md)
- [ ] Join team communication channels
- [ ] Set up 1-on-1 with mentor
- [ ] Review recent PRs to understand workflow
- [ ] Read divine instruction files in `.github/instructions/`

### First Week Goals

- [ ] Make your first contribution (even if small)
- [ ] Submit your first PR
- [ ] Conduct your first code review
- [ ] Understand the authentication flow
- [ ] Complete one "good first issue"

### Learning Resources

#### Internal Documentation

| Document                                     | Purpose                   |
| -------------------------------------------- | ------------------------- |
| [API Docs](http://localhost:3001/api-docs)   | Interactive API testing   |
| [Prisma Schema](../../prisma/schema.prisma)  | Database structure        |
| [Scripts Reference](../SCRIPTS_REFERENCE.md) | All npm scripts explained |
| [Testing Guide](../testing/README.md)        | How to write tests        |

#### External Resources

| Resource            | Link                                |
| ------------------- | ----------------------------------- |
| Next.js 15 Docs     | https://nextjs.org/docs             |
| React 19 Docs       | https://react.dev                   |
| Prisma Docs         | https://www.prisma.io/docs          |
| TypeScript Handbook | https://www.typescriptlang.org/docs |
| Tailwind CSS        | https://tailwindcss.com/docs        |

---

## 🎯 Success Criteria

You've successfully completed onboarding when:

- [x] ✅ Dev server runs without errors
- [x] ✅ Can access application at http://localhost:3001
- [x] ✅ Database is connected and migrated
- [x] ✅ Can make changes and see hot reload
- [x] ✅ Understand project structure
- [x] ✅ Know how to commit code
- [x] ✅ IDE is configured properly
- [x] ✅ Tests run successfully
- [x] ✅ Know where to find documentation

---

## 🤝 Getting Help

### Resources (In Order of Preference)

1. **📖 Documentation First**
   - Search `/docs` directory
   - Check Swagger UI at `/api-docs`
   - Read `.cursorrules` for patterns

2. **🔍 Search Existing Issues**
   - GitHub Issues
   - Closed PRs
   - Team chat history

3. **💬 Ask Your Mentor**
   - Scheduled 1-on-1 time
   - Quick questions via chat

4. **👥 Team Chat**
   - Development channel
   - Tag specific team members

5. **🎫 Create an Issue**
   - For bugs or unclear documentation
   - Tag with `question` label

### Good Questions to Ask

✅ **Good:**

- "I'm trying to implement X. I found pattern Y in file Z. Is this the right approach?"
- "I got error E when doing F. I tried G and H. What should I try next?"
- "Where should I add authentication to this endpoint?"

❌ **Avoid:**

- "How do I install Node.js?" (Google first)
- "My code doesn't work." (Too vague)
- "Why is TypeScript complaining?" (Share the actual error)

---

## 📞 Support Contacts

| Need               | Contact       | Availability      |
| ------------------ | ------------- | ----------------- |
| General Questions  | Your Mentor   | Daily             |
| Technical Issues   | Tech Lead     | During work hours |
| Access/Permissions | DevOps Team   | Ticket system     |
| Product Questions  | Product Owner | Weekly sync       |

---

## 🎉 Congratulations!

You've completed the 30-minute developer onboarding!

**You are now ready to:**

- 🚀 Start contributing to the codebase
- 🧪 Test and debug the application
- 📝 Write production-ready code
- 🤝 Collaborate with the team
- 🌟 Build amazing features

**Remember:**

- 🌾 Code with agricultural consciousness
- ⚡ Architect with divine precision
- 🚀 Deliver with quantum efficiency
- 🤝 Collaborate with team spirit

**Welcome to the Farmers Market Platform team!** 🌾✨

---

**Next Document:** [Code Review Standards](./CODE_REVIEW_STANDARDS.md)

---

**Version:** 1.0.0  
**Last Updated:** January 10, 2025  
**Maintained By:** Development Team  
**Feedback:** Open an issue or PR to improve this guide
