# Repository Structure

## Source Code Organization

src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Dashboard routes
│   ├── api/               # API endpoints
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── agricultural/     # Farm-specific components
│   └── layout/          # Layout components
├── lib/                  # Utilities and configs
│   ├── auth.ts          # Authentication utilities
│   ├── db.ts           # Database utilities
│   └── utils.ts        # General utilities
└── guides/              # Development guides
    └── COMPLETE_GUIDE.md

## Documentation Structure

.github/instructions/
├── AGRICULTURAL_DIVINITY/   # Agricultural patterns
├── DIVINE_QUALITY/         # Testing and QA
├── DIVINE_SECURITY/        # Security patterns
├── NEXTJS_DIVINITY/       # Next.js implementation
└── PLATFORM_DIVINITY/     # Platform guides

docs/
└── DEVELOPMENT_GUIDE.md   # Central documentation

## Implementation Guidelines

1. Follow Next.js App Router conventions
2. Use component folders for organization
3. Keep utilities in lib/ directory
4. Follow agricultural domain patterns
5. Reference implementation guides

## Quick Links

- [Development Guide](./docs/DEVELOPMENT_GUIDE.md)
- [Task Manifest](./DIVINE_TASK_MANIFEST.md)
- [Complete Guide](./src/guides/COMPLETE_GUIDE.md)

---

This structure follows Next.js best practices and divine architectural patterns
