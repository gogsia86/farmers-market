# NextJS Foundation Setup

## Overview
Setup and foundational configuration for the NextJS Farmers Market application.

## Dependencies
- [Core Architecture DNA](../CORE/ARCHITECTURE_DNA.instructions.md)
- [Core Divine Patterns](../CORE/DIVINE_PATTERNS.instructions.md)
- [Technical NextJS Patterns](../TECHNICAL/NEXTJS/COMPONENT_PATTERNS.instructions.md)

## Environment Setup

### Project Initialization
```bash
# Create NextJS project with TypeScript
npx create-next-app@latest farmers-market \
  --typescript \
  --tailwind \
  --eslint \
  --src-dir \
  --app \
  --import-alias "@/*"
```

### Development Dependencies
```json
{
  "dependencies": {
    "next": "^13.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@prisma/client": "^4.0.0",
    "zod": "^3.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "@types/node": "^18.0.0",
    "typescript": "^4.9.0",
    "prisma": "^4.0.0",
    "tailwindcss": "^3.0.0",
    "eslint": "^8.0.0"
  }
}
```

### Configuration Files
```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: true,
    serverComponents: true,
  },
}

module.exports = nextConfig

// tsconfig.json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```