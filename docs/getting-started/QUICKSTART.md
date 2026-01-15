# 🚀 QUICK START GUIDE
## Get Your Farmers Market Platform Running in 10 Minutes

**Last Updated**: January 14, 2025  
**Difficulty**: Beginner  
**Time Required**: 10-15 minutes

---

## 📋 Prerequisites

Before you begin, ensure you have:

- ✅ **Node.js 20+** installed ([Download](https://nodejs.org/))
- ✅ **PostgreSQL 15+** installed and running ([Download](https://www.postgresql.org/download/))
- ✅ **npm 10+** (comes with Node.js)
- ✅ **Git** installed ([Download](https://git-scm.com/))
- ✅ A code editor (VS Code recommended)

**Check your versions**:
```bash
node --version    # Should be v20.x.x or higher
npm --version     # Should be 10.x.x or higher
psql --version    # Should be 15.x or higher
```

---

## 🎯 Quick Start (5 Commands)

```bash
# 1. Clone the repository
git clone <repository-url>
cd "Farmers Market Platform web and app"

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your database credentials

# 4. Set up database
npx prisma migrate dev
npx prisma db seed

# 5. Start development server
npm run dev
```

**That's it!** Open [http://localhost:3001](http://localhost:3001) 🎉

---

## 🔧 Detailed Setup

### Step 1: Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd "Farmers Market Platform web and app"

# Install dependencies (takes 2-3 minutes)
npm install
```

### Step 2: Database Setup

**Option A: Local PostgreSQL** (Recommended for development)

```bash
# Create database
createdb farmers_market

# Or using psql
psql -U postgres
CREATE DATABASE farmers_market;
\q
```

**Option B: Use Cloud Database** (Supabase, Railway, Neon, etc.)

Get your connection string from your provider and skip to Step 3.

### Step 3: Environment Variables

Create `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/farmers_market"

# NextAuth (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3001"

# Stripe (get from https://stripe.com)
STRIPE_PUBLIC_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email (optional for testing)
EMAIL_FROM="noreply@yourdomain.com"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"

# Redis (optional for caching)
REDIS_URL="redis://localhost:6379"

# Optional Services
OPENAI_API_KEY="sk-..."          # For AI features
CLOUDINARY_URL="cloudinary://..." # For image uploads
```

**Quick Tips**:
- For `NEXTAUTH_SECRET`, run: `openssl rand -base64 32`
- Get Stripe test keys from: https://dashboard.stripe.com/test/apikeys
- Gmail SMTP: Use [App Passwords](https://support.google.com/accounts/answer/185833)

### Step 4: Database Migration & Seeding

```bash
# Run migrations (creates all tables)
npx prisma migrate dev

# Seed database with sample data
npx prisma db seed

# Optional: Open Prisma Studio to view data
npx prisma studio
# Opens at http://localhost:5555
```

**What gets seeded**:
- ✅ 3 test users (Admin, Farmer, Customer)
- ✅ 5 sample farms
- ✅ 50+ products
- ✅ Categories and certifications
- ✅ Sample orders

### Step 5: Start Development Server

```bash
# Start with Turbopack (fast!)
npm run dev

# Or with standard webpack
npm run dev:webpack
```

**Development server runs at**: http://localhost:3001

---

## 🧪 Test Credentials

After seeding, you can log in with these accounts:

### Admin Account
```
Email: admin@farmersmarket.com
Password: Admin123!
```

### Farmer Account
```
Email: farmer@example.com
Password: Farmer123!
```

### Customer Account
```
Email: customer@example.com
Password: Customer123!
```

---

## 🎨 What You'll See

### Homepage (Public)
- Browse farms and products
- Search functionality
- Featured items
- Farm locations

### Customer Portal (`/customer`)
- Product catalog with filters
- Shopping cart
- Checkout process
- Order history

### Farmer Portal (`/farmer`)
- Farm management
- Product inventory
- Order fulfillment
- Sales analytics

### Admin Portal (`/admin`)
- Platform overview
- Farm verification
- User management
- System monitoring

---

## 🔍 Common Issues & Solutions

### Issue: Database connection failed

**Solution**:
```bash
# Check PostgreSQL is running
# Mac:
brew services list

# Windows:
# Check Services app for PostgreSQL

# Linux:
sudo systemctl status postgresql

# Test connection
psql -U postgres -d farmers_market -c "SELECT 1;"
```

### Issue: Port 3001 already in use

**Solution**:
```bash
# Option 1: Kill existing process
# Windows:
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:3001 | xargs kill

# Option 2: Use different port
npm run dev -- -p 3002
```

### Issue: Prisma errors

**Solution**:
```bash
# Regenerate Prisma Client
npx prisma generate

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Check schema
npx prisma validate
```

### Issue: Module not found

**Solution**:
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Clear Next.js cache
rm -rf .next
```

---

## 📚 Next Steps

Now that you're up and running:

1. **Explore the Platform**
   - Try each user role (Admin, Farmer, Customer)
   - Create a test order
   - Test payment flow (use Stripe test cards)

2. **Read the Documentation**
   - [Development Guide](../development/DEVELOPMENT_GUIDE.md)
   - [Architecture Overview](../architecture/ARCHITECTURE.md)
   - [API Reference](../api/API_REFERENCE.md)

3. **Make Your First Changes**
   - Customize the theme in `src/app/globals.css`
   - Update the homepage in `src/app/page.tsx`
   - Add your branding and logo

4. **Set Up Testing**
   ```bash
   # Run unit tests
   npm test

   # Run E2E tests
   npm run test:e2e
   ```

---

## 🛠️ Development Workflow

### Daily Development

```bash
# Pull latest changes
git pull

# Install any new dependencies
npm install

# Run migrations if schema changed
npx prisma migrate dev

# Start dev server
npm run dev
```

### Before Committing

```bash
# Run linter
npm run lint

# Run type checker
npm run type-check

# Run tests
npm test

# All checks at once
npm run quality
```

---

## 🚀 Performance Tips

### Development Speed

```bash
# Use Turbopack (default, fastest)
npm run dev

# Increase memory for large projects
NODE_OPTIONS='--max-old-space-size=8192' npm run dev
```

### Database Performance

```bash
# If queries are slow, run optimization
npm run db:optimize

# View slow queries
npx prisma studio
```

---

## 📞 Getting Help

### Resources
- 📖 **Documentation**: `docs/` directory
- 🐛 **Issues**: Check GitHub Issues
- 💬 **Discussions**: GitHub Discussions
- 📧 **Email**: support@farmersmarket.com

### Debugging Tools

```bash
# Check application health
curl http://localhost:3001/api/health

# View logs
# Logs are in console when running npm run dev

# Database GUI
npx prisma studio
```

---

## ✅ Verification Checklist

Before proceeding to development:

- [ ] Development server running at http://localhost:3001
- [ ] Can access homepage (public)
- [ ] Can log in as Admin
- [ ] Can log in as Farmer
- [ ] Can log in as Customer
- [ ] Database has seed data
- [ ] No errors in console
- [ ] Prisma Studio works

---

## 🎓 Learning Path

**New to the project?** Follow this path:

1. **Week 1**: Understand the platform
   - Explore all three portals
   - Complete a full order flow
   - Review database schema

2. **Week 2**: Code exploration
   - Read service layer (`src/lib/services/`)
   - Understand API routes (`src/app/api/`)
   - Review component structure

3. **Week 3**: Make changes
   - Pick a small feature
   - Write tests
   - Submit a PR

---

## 🔗 Useful Commands Reference

```bash
# Development
npm run dev              # Start dev server (Turbopack)
npm run dev:webpack      # Start dev server (Webpack)
npm run build           # Production build
npm run start           # Start production server

# Database
npx prisma studio       # Open database GUI
npx prisma migrate dev  # Run migrations
npx prisma db seed      # Seed data
npx prisma db push      # Push schema changes

# Code Quality
npm run lint            # Run ESLint
npm run type-check      # TypeScript check
npm run format          # Format with Prettier
npm run quality         # Run all checks

# Testing
npm test                # Run unit tests
npm run test:e2e        # Run E2E tests
npm run test:coverage   # Generate coverage report

# Cleanup
npm run clean:cache     # Clear test cache
npm run kill-server     # Kill dev server
```

---

## 🎉 You're Ready!

You now have a fully functional Farmers Market Platform running locally!

**Recommended Next Steps**:
1. ✅ Explore the three portals (Admin, Farmer, Customer)
2. ✅ Read the [Development Guide](../development/DEVELOPMENT_GUIDE.md)
3. ✅ Review the [Architecture](../architecture/ARCHITECTURE.md)
4. ✅ Start building features!

---

**Questions?** Check the [FAQ](../FAQ.md) or open an issue on GitHub.

**Happy coding!** 🚀