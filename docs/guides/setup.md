# Project Setup Guide

## 🔧 Prerequisites

1. Node.js Installation
   ```bash
   # Download from: https://nodejs.org/ (LTS version)
   node --version
   npm --version
   ```

2. VS Code Extensions
   - Next.js snippets
   - Auto Rename Tag
   - ES7+ React/Redux/React-Native snippets
   - Thunder Client (API testing)
   - Tailwind CSS IntelliSense
   - Prisma
   - GitHub Copilot

3. Environment Variables
   ```env
   # .env.local
   DATABASE_URL="..."
   NEXTAUTH_SECRET="..."
   NEXTAUTH_URL="http://localhost:3000"
   ```

## 🚀 Project Creation

```bash
# Create Next.js project
npx create-next-app@latest farmers-market-platform --typescript --tailwind --eslint --app

# Navigate to project
cd farmers-market-platform

# Install dependencies
npm install @prisma/client prisma
npm install lucide-react @radix-ui/react-dialog
npm install @hookform/resolvers zod
npm install date-fns
```

## 📁 Directory Structure Setup

```bash
# Create main directories
mkdir -p src/{app/{(auth),(dashboard),api},components/{ui,agricultural,layout},lib}

# Create key files
touch src/app/layout.tsx
touch src/app/page.tsx
touch src/lib/{auth,db,utils}.ts
```

## 🗄️ Database Setup

1. Initialize Prisma
   ```bash
   npx prisma init
   ```

2. Create schema
   ```prisma
   // prisma/schema.prisma
   model User {
     id        String   @id @default(cuid())
     email     String   @unique
     name      String?
     role      String
     createdAt DateTime @default(now())
   }
   ```

3. Run migrations
   ```bash
   npx prisma generate
   npx prisma db push
   ```

## 🔐 Authentication Setup

1. Configure NextAuth
   ```typescript
   // src/lib/auth.ts
   import NextAuth from 'next-auth';

   export const authConfig = {
     // Configuration
   };
   ```

2. Setup API route
   ```typescript
   // src/app/api/auth/[...nextauth]/route.ts
   import NextAuth from 'next-auth';
   import { authConfig } from '@/lib/auth';

   const handler = NextAuth(authConfig);
   export { handler as GET, handler as POST };
   ```

## 🎨 UI Setup

1. Configure Tailwind
   ```typescript
   // tailwind.config.ts
   import type { Config } from 'tailwindcss';

   const config: Config = {
     content: [
       './src/**/*.{js,ts,jsx,tsx,mdx}',
     ],
     theme: {
       extend: {
         // Custom theme
       },
     },
     plugins: [],
   };

   export default config;
   ```

2. Setup global styles
   ```css
   /* src/app/globals.css */
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

## 🧪 Testing Setup

1. Install testing dependencies
   ```bash
   npm install -D jest @testing-library/react @testing-library/jest-dom
   ```

2. Configure Jest
   ```typescript
   // jest.config.js
   const nextJest = require('next/jest');

   const createJestConfig = nextJest({
     dir: './',
   });

   const customJestConfig = {
     setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
     testEnvironment: 'jest-environment-jsdom',
   };

   module.exports = createJestConfig(customJestConfig);
   ```

## 📝 ESLint & Prettier Setup

1. Install dependencies
   ```bash
   npm install -D eslint-config-prettier prettier
   ```

2. Configure ESLint
   ```javascript
   // .eslintrc.json
   {
     "extends": [
       "next/core-web-vitals",
       "prettier"
     ]
   }
   ```

3. Configure Prettier
   ```json
   // .prettierrc
   {
     "semi": true,
     "singleQuote": true,
     "tabWidth": 2,
     "trailingComma": "es5"
   }
   ```

## 🚀 Development Server

1. Start the development server
   ```bash
   npm run dev
   ```

2. Open browser
   ```
   http://localhost:3000
   ```

## 📚 Additional Configuration

### Git Setup
```bash
# Initialize git
git init

# Add .gitignore
cat > .gitignore << EOL
node_modules
.next
.env
.env.local
EOL

# Initial commit
git add .
git commit -m "Initial commit: Project setup"
```

### VS Code Settings
```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### Component Creation
```typescript
// src/components/ui/Button.tsx
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary'
}) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded ${
        variant === 'primary' 
          ? 'bg-blue-500 text-white' 
          : 'bg-gray-200 text-gray-800'
      }`}
    >
      {children}
    </button>
  );
};
```

## 🔍 Verification Steps

1. Check Next.js setup
   ```bash
   npm run build
   ```

2. Verify database connection
   ```bash
   npx prisma studio
   ```

3. Run tests
   ```bash
   npm test
   ```

4. Check linting
   ```bash
   npm run lint
   ```

## 📚 Next Steps

1. Review [Architecture Documentation](../architecture/README.md)
2. Check [API Documentation](../api/README.md)
3. Follow [Best Practices](./best-practices.md)
4. Start with [Task Manifest](../../DIVINE_TASK_MANIFEST.md)

---

*This setup guide ensures a consistent development environment across the team.*