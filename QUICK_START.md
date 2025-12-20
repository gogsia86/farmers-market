# ⚡ Quick Start Guide

> **Get the Farmers Market Platform running in 5 minutes!**

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20.0.0 or higher ([Download](https://nodejs.org/))
- **PostgreSQL** 14.0 or higher ([Download](https://www.postgresql.org/download/))
- **npm** 10.0.0 or higher (comes with Node.js)
- **Git** ([Download](https://git-scm.com/downloads))

### Optional but Recommended

- **Docker** & **Docker Compose** (for containerized development)
- **Visual Studio Code** with recommended extensions

---

## 🚀 Fast Setup (5 Minutes)

### Step 1: Clone & Install (2 min)

```bash
# Clone the repository
git clone https://github.com/gogsia86/farmers-market.git
cd "Farmers Market Platform web and app"

# Install dependencies
npm install
```

### Step 2: Configure Environment (1 min)

Create a `.env` file in the root directory:

```bash
# Copy the example environment file
cp .env.example .env
```

**Minimal Configuration** (edit `.env`):

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/farmers_market"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-change-this-in-production"

# Stripe (Test Mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_key"
STRIPE_SECRET_KEY="sk_test_your_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

# App
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

> 💡 **Tip:** For Stripe keys, visit [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)

### Step 3: Setup Database (1 min)

```bash
# Create database and run migrations
npm run db:setup

# Seed with sample data (optional but recommended)
npm run db:seed
```

### Step 4: Start Development Server (1 min)

```bash
# Start the development server
npm run dev
```

The app will start at `http://localhost:3000` 🎉

### Step 5: Access the Platform

Open your browser and visit:

- **🌐 Main App:** [http://localhost:3000](http://localhost:3000)
- **👤 Admin Dashboard:** [http://localhost:3000/admin](http://localhost:3000/admin)
- **🧑‍🌾 Farmer Dashboard:** [http://localhost:3000/farmer/dashboard](http://localhost:3000/farmer/dashboard)

**Default Test Accounts** (after seeding):

```
Admin Account:
  Email: admin@farmersmarket.com
  Password: Admin123!

Farmer Account:
  Email: farmer@example.com
  Password: Farmer123!

Customer Account:
  Email: customer@example.com
  Password: Customer123!
```

---

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] ✅ App loads successfully at `http://localhost:3000`
- [ ] ✅ Can login with test credentials
- [ ] ✅ Admin dashboard is accessible
- [ ] ✅ Can view farms and products
- [ ] ✅ No console errors in browser DevTools
- [ ] ✅ Database tables created (check with `npm run db:studio`)

---

## 🐳 Docker Quick Start (Alternative)

If you prefer Docker:

```bash
# Start all services (app, database, redis)
docker-compose up -d

# Run database migrations
docker-compose exec app npm run db:push

# Seed database
docker-compose exec app npm run db:seed

# View logs
docker-compose logs -f app
```

Access at: [http://localhost:3000](http://localhost:3000)

---

## 🆘 Common Issues & Solutions

### Database Connection Failed

**Error:** `Can't reach database server`

**Solution:**

```bash
# Ensure PostgreSQL is running
pg_ctl status

# Start PostgreSQL
pg_ctl start

# Or use Docker
docker-compose up -d postgres
```

### Port 3000 Already in Use

**Error:** `Port 3000 is already in use`

**Solution:**

```bash
# Find process using port 3000
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process or use different port
PORT=3001 npm run dev
```

### Migration Failed

**Error:** `Migration failed to apply`

**Solution:**

```bash
# Reset database (⚠️ This deletes all data!)
npm run db:reset

# Or manually fix migrations
npm run db:studio
```

### Module Not Found

**Error:** `Cannot find module '@/...'`

**Solution:**

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Clear Next.js cache
rm -rf .next
npm run dev
```

### Stripe Webhook Issues

**Error:** `Webhook signature verification failed`

**Solution:**

```bash
# Install Stripe CLI
# Mac: brew install stripe/stripe-cli/stripe
# Windows: Download from https://stripe.com/docs/stripe-cli

# Login and forward webhooks
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Copy webhook secret to .env
STRIPE_WEBHOOK_SECRET="whsec_xxx"
```

---

## 📚 Next Steps

### Learn the Platform

1. **[Complete Documentation](./docs/README.md)** - Comprehensive guides
2. **[Testing Guide](./docs/testing/README.md)** - Run tests and verify quality
3. **[API Documentation](./docs/api/README.md)** - API endpoints and examples
4. **[Development Guide](./docs/development/README.md)** - Development best practices

### Development Workflow

```bash
# Run tests
npm test

# Type checking
npm run type-check

# Linting
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

### Key Commands

| Command              | Description                       |
| -------------------- | --------------------------------- |
| `npm run dev`        | Start development server          |
| `npm run build`      | Build production bundle           |
| `npm test`           | Run all tests                     |
| `npm run test:watch` | Run tests in watch mode           |
| `npm run db:studio`  | Open Prisma Studio (database GUI) |
| `npm run db:push`    | Push schema changes to database   |
| `npm run db:seed`    | Seed database with sample data    |
| `npm run lint`       | Run ESLint                        |
| `npm run type-check` | Check TypeScript types            |

---

## 🎯 What's Next?

### For Developers

- Review [Divine Agricultural Patterns](./.github/instructions/) for coding standards
- Check [Architecture Documentation](./docs/architecture/README.md)
- Explore [Component Library](./docs/ui/README.md)
- Read [Testing Strategy](./docs/testing/README.md)

### For Farmers (Using the Platform)

1. Register as a farmer
2. Complete farm profile
3. Add products with photos
4. Set delivery options
5. Start receiving orders!

### For Customers

1. Browse local farms
2. Add products to cart
3. Checkout with Stripe
4. Track order status
5. Rate and review

---

## 🔧 Advanced Configuration

### Environment Variables

For complete environment configuration:

```bash
# See all available options
cat .env.example

# Or check documentation
open docs/configuration/README.md
```

### Performance Optimization

```bash
# Enable production optimizations
NODE_ENV=production npm run build

# Analyze bundle size
npm run analyze

# Run performance tests
npm run test:performance
```

### Multi-Language Support

The platform supports multiple languages:

```env
# Set default language in .env
NEXT_PUBLIC_DEFAULT_LOCALE="en"

# Supported: en, es, fr, de, it
```

---

## 🤝 Contributing

Want to contribute? Great!

1. Read [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines
2. Check [Open Issues](https://github.com/gogsia86/farmers-market/issues)
3. Follow [Code Standards](./.cursorrules)
4. Submit Pull Request

---

## 💬 Getting Help

### Resources

- **📖 Documentation:** [docs/README.md](./docs/README.md)
- **🐛 Report Issues:** [GitHub Issues](https://github.com/gogsia86/farmers-market/issues)
- **💬 Discussions:** [GitHub Discussions](https://github.com/gogsia86/farmers-market/discussions)
- **📧 Email:** support@farmersmarket.com

### Community

- **Discord:** [Join our community](https://discord.gg/farmersmarket)
- **Twitter:** [@FarmersMarketPlatform](https://twitter.com/farmersmarket)

---

## 📊 Platform Features

### For Platform Owners (Admin)

- 👥 User management (farmers, customers)
- 🏪 Farm approval & verification
- 💳 Payment & commission tracking
- 📊 Analytics & reporting
- 🔒 Security & compliance
- 📧 Email notifications

### For Farmers

- 🏪 Farm profile management
- 📦 Product catalog with photos
- 📦 Inventory tracking
- 📊 Order management
- 💰 Revenue analytics
- 🚚 Delivery zone configuration

### For Customers

- 🔍 Search & filter farms/products
- 🛒 Shopping cart
- 💳 Secure checkout (Stripe)
- 📦 Order tracking
- ⭐ Reviews & ratings
- 🌍 Multi-language support

---

## 🎓 Learning Path

### Beginner (Week 1)

1. ✅ Complete this Quick Start
2. ✅ Explore the UI as different user roles
3. ✅ Read architecture overview
4. ✅ Run basic tests

### Intermediate (Week 2)

1. 🔨 Make your first code change
2. 🧪 Write your first test
3. 📚 Read database schema documentation
4. 🔄 Submit your first PR

### Advanced (Week 3+)

1. 🏗️ Implement a new feature
2. ⚡ Optimize performance
3. 🔐 Add security enhancement
4. 📖 Write documentation

---

## 🚀 Deploy to Production

Ready to deploy? Check out our deployment guides:

- **[Vercel](./docs/deployment/vercel.md)** (Recommended)
- **[Docker](./docs/deployment/docker.md)**
- **[AWS](./docs/deployment/aws.md)**
- **[DigitalOcean](./docs/deployment/digitalocean.md)**

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with [Next.js 15](https://nextjs.org/)
- Powered by [Prisma](https://www.prisma.io/)
- Payments by [Stripe](https://stripe.com/)
- Hosted on [Vercel](https://vercel.com/)

---

**🌾 Happy Farming! 🌾**

_Questions? Check out our [FAQ](./docs/FAQ.md) or [contact us](mailto:support@farmersmarket.com)_

---

**Last Updated:** December 20, 2024  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
