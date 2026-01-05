# Dependencies Documentation

**Farmers Market Platform**
Last Updated: November 15, 2025
Project Version: 1.0.0

## Overview

This document provides a comprehensive overview of all project dependencies, their purposes, versions, and reasons for inclusion. Use this as a reference when updating, auditing, or troubleshooting dependencies.

---

## Core Framework Dependencies

### Next.js 15.0.3
- **Category**: Framework
- **Purpose**: React framework for production with App Router, Server Components, and API routes
- **Why Required**: Foundation of the application, provides routing, SSR, and build optimization
- **Documentation**: https://nextjs.org/docs

### React 19.0.0-rc & React DOM 19.0.0-rc
- **Category**: UI Framework
- **Purpose**: Core React library for building user interfaces
- **Why Required**: Required by Next.js 15, provides component-based architecture
- **Note**: Using RC version for Next.js 15 compatibility
- **Documentation**: https://react.dev

### TypeScript 5.7.2
- **Category**: Language
- **Purpose**: Type-safe JavaScript superset
- **Why Required**: Ensures type safety, better IDE support, and prevents runtime errors
- **Documentation**: https://www.typescriptlang.org/docs/

---

## Database & ORM

### Prisma 6.1.0
- **Category**: ORM
- **Purpose**: Type-safe database client and schema management
- **Why Required**:
  - Database schema definition and migrations
  - Type-safe queries and relationships
  - Connection pooling and query optimization
- **Key Features Used**:
  - PostgreSQL database management
  - Automated migrations
  - Decimal type handling for prices
  - Relationship modeling (User, Farm, Product, Order)
- **Documentation**: https://www.prisma.io/docs

### @prisma/client 6.1.0
- **Category**: Database Client
- **Purpose**: Auto-generated Prisma client for database operations
- **Why Required**: Runtime client for all database interactions
- **Note**: Must match @prisma/prisma version
- **Documentation**: https://www.prisma.io/docs/concepts/components/prisma-client

---

## Authentication & Authorization

### NextAuth.js (Auth.js) 5.0.0-beta.25
- **Category**: Authentication
- **Purpose**: Authentication solution for Next.js App Router
- **Why Required**:
  - User authentication (email/password, OAuth)
  - Session management
  - Protected routes and API endpoints
  - Multi-role support (Customer, Farmer, Admin)
- **Key Features Used**:
  - Credentials provider
  - Prisma adapter
  - JWT sessions
  - Role-based access control
- **Documentation**: https://authjs.dev

### @auth/prisma-adapter 2.7.4
- **Category**: Authentication Adapter
- **Purpose**: Connects NextAuth with Prisma ORM
- **Why Required**: Stores authentication data in PostgreSQL via Prisma
- **Documentation**: https://authjs.dev/reference/adapter/prisma

### bcryptjs 2.4.3
- **Category**: Security
- **Purpose**: Password hashing library
- **Why Required**: Securely hash and verify user passwords
- **Type Support**: @types/bcryptjs 2.4.6
- **Documentation**: https://github.com/dcodeIO/bcrypt.js

---

## Payment Processing

### Stripe 17.5.0
- **Category**: Payment Gateway (Server)
- **Purpose**: Server-side Stripe SDK for payment processing
- **Why Required**:
  - Process customer payments
  - Create payment intents
  - Handle webhooks
  - Manage subscriptions (future)
- **Documentation**: https://stripe.com/docs/api

### @stripe/stripe-js 4.12.0
- **Category**: Payment Gateway (Client)
- **Purpose**: Client-side Stripe SDK for secure payment UI
- **Why Required**:
  - Load Stripe.js securely
  - Create payment elements
  - Handle 3D Secure authentication
- **Documentation**: https://stripe.com/docs/js

---

## UI Components & Styling

### Tailwind CSS 3.4.17
- **Category**: CSS Framework
- **Purpose**: Utility-first CSS framework
- **Why Required**:
  - Rapid UI development
  - Consistent design system
  - Responsive design utilities
  - Dark mode support
- **Documentation**: https://tailwindcss.com/docs

### Radix UI Components
- **Category**: Headless UI Components
- **Purpose**: Accessible, unstyled UI primitives
- **Why Required**:
  - Built-in accessibility (ARIA)
  - Keyboard navigation
  - Focus management
  - Composable components
- **Components Used**:
  - @radix-ui/react-alert-dialog 1.1.4
  - @radix-ui/react-avatar 1.1.2
  - @radix-ui/react-checkbox 1.1.3
  - @radix-ui/react-dialog 1.1.4
  - @radix-ui/react-dropdown-menu 2.1.4
  - @radix-ui/react-label 2.1.1
  - @radix-ui/react-popover 1.1.4
  - @radix-ui/react-progress 1.1.1
  - @radix-ui/react-radio-group 1.2.2
  - @radix-ui/react-scroll-area 1.2.2
  - @radix-ui/react-select 2.1.4
  - @radix-ui/react-separator 1.1.1
  - @radix-ui/react-slider 1.2.1
  - @radix-ui/react-slot 1.1.1
  - @radix-ui/react-switch 1.1.2
  - @radix-ui/react-tabs 1.1.2
  - @radix-ui/react-toast 1.2.4
  - @radix-ui/react-tooltip 1.1.6
- **Documentation**: https://www.radix-ui.com/primitives

### Lucide React 0.469.0
- **Category**: Icon Library
- **Purpose**: Beautiful, consistent icon set
- **Why Required**: Icons for UI elements, actions, and navigation
- **Documentation**: https://lucide.dev

### clsx 2.1.1 & tailwind-merge 2.6.0
- **Category**: Utility
- **Purpose**: Conditional class name management
- **Why Required**: Merge Tailwind classes and handle conditional styling
- **Usage Pattern**: Combined in `cn()` utility function
- **Documentation**:
  - https://github.com/lukeed/clsx
  - https://github.com/dcastil/tailwind-merge

### class-variance-authority 0.7.1
- **Category**: Utility
- **Purpose**: Variant-based component styling
- **Why Required**: Create reusable component variants with type safety
- **Documentation**: https://cva.style/docs

---

## Forms & Validation

### React Hook Form 7.54.2
- **Category**: Form Management
- **Purpose**: Performant form library with validation
- **Why Required**:
  - Uncontrolled form inputs (better performance)
  - Built-in validation
  - Error handling
  - TypeScript support
- **Documentation**: https://react-hook-form.com

### Zod 3.24.1
- **Category**: Validation
- **Purpose**: TypeScript-first schema validation
- **Why Required**:
  - Input validation (client & server)
  - Type inference
  - Error messages
  - API request/response validation
- **Integration**: Works with React Hook Form via @hookform/resolvers
- **Documentation**: https://zod.dev

### @hookform/resolvers 3.9.1
- **Category**: Form Integration
- **Purpose**: Connect validation libraries to React Hook Form
- **Why Required**: Integrate Zod schemas with React Hook Form
- **Documentation**: https://github.com/react-hook-form/resolvers

---

## Date & Time Handling

### date-fns 4.1.0
- **Category**: Date Utility
- **Purpose**: Modern date utility library
- **Why Required**:
  - Format dates for display
  - Calculate date ranges
  - Parse user input dates
  - Handle timezones
- **Use Cases**:
  - Order dates
  - Product availability dates
  - Farm event scheduling
- **Documentation**: https://date-fns.org

---

## File Upload & Storage

### uploadthing 7.4.2
- **Category**: File Upload
- **Purpose**: Type-safe file upload solution
- **Why Required**:
  - Farm images
  - Product photos
  - User avatars
  - File size validation
  - Image optimization
- **Documentation**: https://docs.uploadthing.com

### @uploadthing/react 7.4.0
- **Category**: File Upload (React)
- **Purpose**: React components for UploadThing
- **Why Required**: Pre-built upload components and hooks
- **Documentation**: https://docs.uploadthing.com/getting-started/appdir

---

## AI & Automation

### Microsoft Agent Framework (@microsoft/agents-*) 0.2.2
- **Category**: AI Orchestration
- **Purpose**: Multi-agent AI system for farm management
- **Why Required**:
  - Automated farm analysis
  - Product catalog management
  - Order processing
  - Inventory optimization
- **Packages**:
  - @microsoft/agents-client
  - @microsoft/agents-core
  - @microsoft/agents-node
- **Documentation**: https://github.com/microsoft/agent-framework

---

## Monitoring & Observability

### OpenTelemetry (@opentelemetry/*) 1.29.0
- **Category**: Observability
- **Purpose**: Distributed tracing and monitoring
- **Why Required**:
  - Performance monitoring
  - Request tracing
  - Error tracking
  - Service health metrics
- **Packages**:
  - @opentelemetry/api
  - @opentelemetry/instrumentation
  - @opentelemetry/sdk-trace-node
  - @opentelemetry/sdk-trace-web
  - @opentelemetry/resources
  - @opentelemetry/semantic-conventions
- **Documentation**: https://opentelemetry.io/docs/

### @azure/monitor-opentelemetry 1.9.0
- **Category**: Monitoring Integration
- **Purpose**: Azure Application Insights integration
- **Why Required**: Send telemetry data to Azure for analysis
- **Documentation**: https://learn.microsoft.com/en-us/azure/azure-monitor/

---

## Development Tools

### ESLint 9.17.0
- **Category**: Code Quality
- **Purpose**: JavaScript/TypeScript linter
- **Why Required**:
  - Enforce code style
  - Catch bugs early
  - Best practice enforcement
- **Plugins**:
  - eslint-config-next 15.0.3
  - @typescript-eslint/eslint-plugin 8.18.2
  - @typescript-eslint/parser 8.18.2
- **Documentation**: https://eslint.org/docs/latest/

### Prettier 3.4.2
- **Category**: Code Formatting
- **Purpose**: Opinionated code formatter
- **Why Required**: Consistent code formatting across team
- **Plugins**:
  - prettier-plugin-tailwindcss 0.6.9 (sort Tailwind classes)
- **Documentation**: https://prettier.io/docs/en/

### PostCSS 8.5.1
- **Category**: CSS Processing
- **Purpose**: Transform CSS with JavaScript plugins
- **Why Required**: Required by Tailwind CSS for processing
- **Documentation**: https://postcss.org

### Autoprefixer 10.4.20
- **Category**: CSS Processing
- **Purpose**: Add vendor prefixes to CSS
- **Why Required**: Browser compatibility for CSS
- **Documentation**: https://github.com/postcss/autoprefixer

### tsx 4.19.2
- **Category**: TypeScript Execution
- **Purpose**: Run TypeScript files directly
- **Why Required**: Execute scripts and utilities during development
- **Documentation**: https://github.com/privatenumber/tsx

---

## Testing

### Jest 29.7.0
- **Category**: Testing Framework
- **Purpose**: JavaScript testing framework
- **Why Required**: Unit and integration tests
- **Documentation**: https://jestjs.io

### @testing-library/react 16.1.0
- **Category**: Testing Utilities
- **Purpose**: React component testing utilities
- **Why Required**: Test React components in user-centric way
- **Documentation**: https://testing-library.com/react

### @testing-library/jest-dom 6.6.3
- **Category**: Testing Matchers
- **Purpose**: Custom Jest matchers for DOM
- **Why Required**: Enhanced assertions for DOM testing
- **Documentation**: https://github.com/testing-library/jest-dom

---

## Type Definitions (@types/*)

Type definitions for libraries that don't include TypeScript types:

- **@types/bcryptjs** 2.4.6 - bcryptjs types
- **@types/node** 22.10.2 - Node.js types
- **@types/react** 19.0.1 - React types
- **@types/react-dom** 19.0.2 - React DOM types

---

## Dependency Management Strategy

### Version Pinning
- **Exact versions**: Core dependencies (Next.js, React, Prisma)
- **Caret (^)**: Utility libraries (allows minor updates)
- **Tilde (~)**: Type definitions (patch updates only)

### Update Policy
1. **Monthly**: Review and update dependencies
2. **Security**: Immediate updates for vulnerabilities
3. **Major versions**: Thorough testing before upgrade
4. **Breaking changes**: Document migration steps

### Audit Schedule
- **Weekly**: `npm audit` check in CI/CD
- **Monthly**: Full dependency audit with `npm outdated`
- **Quarterly**: Review for unused dependencies with `depcheck`

---

## Security Considerations

### Known Vulnerabilities
- Run `npm audit` regularly
- Review severity levels (Critical, High, Medium, Low)
- Apply fixes promptly: `npm audit fix`
- For breaking changes: Manual review and testing

### Supply Chain Security
- Verify package integrity with `npm audit signatures`
- Use lock file (`package-lock.json`) for reproducible builds
- Review dependency licenses for compliance
- Monitor for deprecated packages

---

## Removal Candidates

Dependencies removed during cleanup (November 2025):
- Unused UI libraries
- Duplicate functionality packages
- Outdated testing utilities
- Legacy compatibility layers

---

## Adding New Dependencies

Before adding a new dependency, consider:

1. **Necessity**: Can existing dependencies solve the problem?
2. **Maintenance**: Is the package actively maintained?
3. **Bundle size**: Impact on client bundle (use bundle analyzer)
4. **Type safety**: Does it have TypeScript support?
5. **Security**: Check npm audit and GitHub security alerts
6. **License**: Compatible with project license (MIT)
7. **Alternatives**: Compare with similar packages

### Approval Process
1. Research and document necessity
2. Check bundle size impact
3. Review security and maintenance status
4. Add to this documentation
5. Update relevant instruction files

---

## Resources

- **Package Manager**: npm (required for consistency)
- **Registry**: https://registry.npmjs.org
- **Bundle Analyzer**: `npm run analyze` (if configured)
- **Dependency Graph**: `npm ls` or visualize with tools

---

## Maintenance Commands

```bash
# Install dependencies
npm install

# Update specific package
npm update <package-name>

# Check for outdated packages
npm outdated

# Security audit
npm audit

# Fix security vulnerabilities
npm audit fix

# Check for unused dependencies
npx depcheck

# View dependency tree
npm ls

# Clean install (removes node_modules)
npm ci
```

---

## Contact

For dependency-related questions or issues:
- Review this documentation
- Check `.github/instructions/` for detailed patterns
- Consult the development team
- Reference official package documentation

---

**Last Audit**: November 15, 2025
**Next Scheduled Audit**: December 15, 2025
**Maintained By**: Development Team
