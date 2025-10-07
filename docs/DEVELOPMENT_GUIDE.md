# Farmers Market Platform Development Guide

This document serves as a central reference for all development guides and documentation.

## 🌟 Core Documentation

### Architecture & Setup
- [Divine Task Manifest](../DIVINE_TASK_MANIFEST.md) - Master task list and progress tracking
- [Architecture DNA](../.github/instructions/ARCHITECTURE_DNA.instructions.md) - Core architectural patterns
- [Setup Foundation](../.github/instructions/NEXTJS_DIVINITY/SETUP_FOUNDATION.instructions.md) - Project setup guide

### Implementation Guides
- [Project Setup](./guides/setup.md) - Initial setup and configuration
- [Best Practices](./guides/best-practices.md) - Development standards and patterns
- [API Documentation](./api/README.md) - API implementation guide
- [Architecture Overview](./architecture/README.md) - System architecture and patterns
- [Component Architecture](../.github/instructions/NEXTJS_DIVINITY/COMPONENT_ARCHITECTURE.instructions.md) - UI component patterns
- [Database Schema](../.github/instructions/NEXTJS_DIVINITY/DATABASE_SCHEMA.instructions.md) - Data model reference

### Agricultural Domain
- [Farming Patterns](../.github/instructions/AGRICULTURAL_DIVINITY/FARMING_PATTERNS.instructions.md) - Agricultural feature patterns
- [Workflow Mastery](../.github/instructions/AGRICULTURAL_DIVINITY/WORKFLOW_MASTERY.instructions.md) - Agricultural workflows

### Quality & Security
- [Quality Assurance](../.github/instructions/DIVINE_QUALITY/QUALITY_ASSURANCE.instructions.md) - Testing and QA guide
- [Security Framework](../.github/instructions/DIVINE_SECURITY/SECURITY_FRAMEWORK.instructions.md) - Security implementation
- [Performance Alchemy](../.github/instructions/PERFORMANCE_ALCHEMY.instructions.md) - Performance optimization

## 📁 Directory Structure

```
farmers-market/
├── src/                    # Source code
│   ├── app/               # Next.js App Router
│   │   ├── (auth)/        # Authentication routes
│   │   ├── (dashboard)/   # Dashboard routes
│   │   └── api/          # API endpoints
│   ├── components/        # React components
│   │   ├── ui/           # Base UI components
│   │   ├── agricultural/ # Farm-specific components
│   │   └── layout/      # Layout components
│   └── lib/              # Utilities and configs
├── docs/                  # Documentation
│   ├── api/              # API documentation
│   ├── architecture/     # System architecture
│   └── guides/          # Implementation guides
├── .github/              # GitHub and divine instructions
│   └── instructions/     # Divine implementation patterns
└── public/              # Static assets
```

## 🚀 Getting Started

1. Set up the development environment:
   ```powershell
   npm install
   ```

2. Follow the setup guides:
   - [Setup Foundation](../.github/instructions/NEXTJS_DIVINITY/SETUP_FOUNDATION.instructions.md)
   - [Development Guide](../src/guides/COMPLETE_GUIDE.md)

3. Start development:
   ```powershell
   npm run dev
   ```

## 🔄 Development Workflow

1. Start with [Project Setup](./guides/setup.md) for initial configuration
2. Review [Architecture Overview](./architecture/README.md) for system design
3. Follow [Best Practices](./guides/best-practices.md) for development standards
4. Check the [Divine Task Manifest](../DIVINE_TASK_MANIFEST.md) for task status
5. Use [API Documentation](./api/README.md) for endpoint implementation
6. Reference [Component Architecture](../.github/instructions/NEXTJS_DIVINITY/COMPONENT_ARCHITECTURE.instructions.md) for UI development
7. Ensure quality using [Quality Assurance](../.github/instructions/DIVINE_QUALITY/QUALITY_ASSURANCE.instructions.md)

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

*This guide is dynamically updated based on the divine task manifest and implementation progress.*