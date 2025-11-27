# 🚀 Quick Start Guide

Get the Farmers Market application running on your local machine in 5 minutes!

## ⚡ Prerequisites

Before you begin, ensure you have:

- **Node.js** 20.x or higher ([Download](<https://nodejs.org>/))
- **PostgreSQL** 14.x or higher ([Download](<https://www.postgresql.org/download>/))
- **npm** or **yarn** package manager
- **Git** for version control

## 📋 5-Minute Setup

### Step 1: Clone the Repository (30 seconds)

```bash
git clone <https://github.com/your-org/farmers-market.git>
cd farmers-market/farmers-market
```

### Step 2: Install Dependencies (2 minutes)

```bash
npm install
```

This will install all required packages including Next.js, React, Prisma, and testing tools.

### Step 3: Configure Environment (1 minute)

```bash
# Copy the example environment file
cp .env.local.example .env.local

# Open .env.local and configure these essential variables:
# - DATABASE_URL (your PostgreSQL connection string)
# - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)
# - NEXTAUTH_URL (http://localhost:3000 for local dev)
```

### Minimum Required Variables

```env
DATABASE_URL="postgresql://user:password@localhost:5432/farmers_market"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-generated-secret-here"
```

### Step 4: Set Up Database (1 minute)

```bash
# Push the database schema
npm run db:push

# Seed with sample data (optional but recommended)
npm run db:seed
```

This creates all database tables and populates them with sample products, farms, and users.

### Step 5: Start Development Server (30 seconds)

```bash
npm run dev
```

The application will be available at:

- **Frontend**: <http://localhost:3000>
- **API**: <http://localhost:3000/api>

## ✅ Verify Installation

Open your browser and visit <http://localhost:3000>. You should see:

- ✅ Homepage loads successfully
- ✅ Product listings appear (if you seeded data)
- ✅ No console errors in browser DevTools

## 🧪 Run Tests (Optional)

Verify everything works correctly:

```bash
# Run unit tests
npm run test

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 🎯 Next Steps

Now that you're up and running:

1. **Explore the App**: Browse products, create an account, test checkout
2. **Read the Docs**: Check out [Development Guide](./guides/DEVELOPMENT.md) for detailed info
3. **Review Code**: Familiarize yourself with the codebase structure
4. **Make Changes**: Try making a small change and see hot reload in action

## 📁 Project Structure

```text
farmers-market/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   ├── lib/              # Utility libraries
│   ├── types/            # TypeScript types
│   └── hooks/            # Custom React hooks
├── prisma/
│   └── schema.prisma     # Database schema
├── public/               # Static assets
└── tests/                # Test files
```

## 🔧 Common Commands

```bash
# Development
npm run dev               # Start dev server
npm run dev:stable        # Start with increased memory

# Building
npm run build             # Build for production
npm run start             # Start production server

# Database
npm run db:studio         # Open Prisma Studio (GUI)
npm run db:migrate        # Create a new migration
npm run db:generate       # Regenerate Prisma Client

# Testing
npm run test              # Run all tests
npm run test:watch        # Watch mode
npm run lint              # Check code quality
npm run type-check        # Check TypeScript types
```

## 🆘 Troubleshooting

### Port 3000 Already in Use

```bash
# Kill the process using port 3000
npx kill-port 3000

# Or start on a different port
PORT=3001 npm run dev
```

### Database Connection Error

1. Verify PostgreSQL is running
2. Check `DATABASE_URL` in `.env.local`
3. Ensure database exists: `createdb farmers_market`
4. Try connecting with: `psql postgresql://user:password@localhost:5432/farmers_market`

### Build Fails with Memory Error

```bash
# Use the safe build command with increased memory
npm run build:safe
```

### Prisma Client Not Generated

```bash
npm run db:generate
```

## 💡 Tips for New Developers

1. **Use Prisma Studio**: Run `npm run db:studio` to visually inspect your database
2. **Hot Reload**: Save files to see changes instantly in the browser
3. **Console Logs**: Check both browser console and terminal for errors
4. **Type Safety**: Let TypeScript guide you - hover over variables to see types
5. **Storybook**: Run `npm run storybook` to see component library

## 📚 Learn More

- [Development Guide](./guides/DEVELOPMENT.md) - Detailed development setup
- [Testing Guide](./guides/TESTING.md) - How to write tests
- [Database Guide](./guides/DATABASE.md) - Working with Prisma
- [API Documentation](./api/README.md) - API endpoints reference
- [Troubleshooting Guide](./guides/TROUBLESHOOTING.md) - Common issues

## 🎉 You're Ready

Congratulations! You now have a fully functional local development environment.

**Next**: Start exploring the codebase and making your first contribution! 🚀

---

**Questions?** Check the [Troubleshooting Guide](./guides/TROUBLESHOOTING.md) or ask the team.
