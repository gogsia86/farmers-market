# 🚀 Sprint 4: Email Enhancements - Quick Start Guide

**Duration**: 2 weeks (Week 7-8)  
**Status**: 🟢 READY TO START  
**Estimated Effort**: 12 hours

---

## ⚡ TL;DR - Start Here

**What we're building**: Production-grade email infrastructure with background processing, user preferences, and analytics.

**Why it matters**: Reliable email delivery, user control, compliance, and visibility.

**Prerequisites**: Redis, Bull, database migration

**Time to first commit**: ~30 minutes

---

## 📋 Checklist - Complete in Order

### Day 1-2: Database Foundation (2 hours)

- [ ] **Read sprint documentation**
  - `docs/sprints/SPRINT_4_EMAIL_ENHANCEMENTS_KICKOFF.md` (1,528 lines)
  - Focus on P4.1 (Database Schema)

- [ ] **Update Prisma schema**
  - Open `prisma/schema.prisma`
  - Add to User model:
    ```prisma
    resetToken              String?   @unique
    resetTokenExpiry        DateTime?
    verificationToken       String?   @unique
    verificationTokenExpiry DateTime?
    emailPreferences        EmailPreferences?
    ```
  - Add EmailPreferences model (see kickoff doc)
  - Add EmailLog model (see kickoff doc)
  - Add EmailType and EmailStatus enums

- [ ] **Generate migration**

  ```bash
  npx prisma migrate dev --name add-email-enhancements
  ```

- [ ] **Test in Prisma Studio**

  ```bash
  npx prisma studio
  ```

- [ ] **Commit changes**
  ```bash
  git add prisma/
  git commit -m "feat(database): Add email enhancement schema"
  ```

---

### Day 3-4: Email Queue (4 hours)

- [ ] **Start Redis**

  ```bash
  # Add to docker-compose.yml:
  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
    volumes: [redis-data:/data]

  docker-compose up -d redis
  redis-cli ping  # Should return PONG
  ```

- [ ] **Install dependencies**

  ```bash
  npm install bull ioredis
  npm install -D @types/bull
  ```

- [ ] **Add environment variables** (`.env.local`)

  ```bash
  REDIS_HOST="localhost"
  REDIS_PORT="6379"
  REDIS_PASSWORD=""
  REDIS_TLS="false"
  ```

- [ ] **Create queue service**

  ```bash
  mkdir -p src/lib/queue src/lib/workers
  touch src/lib/queue/email.queue.ts
  ```

  - Copy implementation from kickoff doc P4.2
  - ~300 lines

- [ ] **Create worker process**

  ```bash
  touch src/lib/workers/email.worker.ts
  ```

  - Copy implementation from kickoff doc P4.2
  - ~200 lines

- [ ] **Update email service**
  - Open `src/lib/services/email.service.ts`
  - Add queue integration:

    ```typescript
    import { enqueueEmail } from '@/lib/queue/email.queue';

    async sendEmail(options: EmailOptions) {
      if (process.env.NODE_ENV === 'production') {
        // Queue in production
        await enqueueEmail(options, userId, emailType);
      } else {
        // Direct send in development
        await this.directSend(options);
      }
    }
    ```

- [ ] **Test queue**

  ```bash
  # Terminal 1: Start worker
  npm run worker:email

  # Terminal 2: Trigger test email
  npm run dev
  # Create test order to trigger email

  # Check database EmailLog table
  npx prisma studio
  ```

- [ ] **Commit changes**
  ```bash
  git add src/lib/queue/ src/lib/workers/ src/lib/services/email.service.ts
  git commit -m "feat(email): Add background queue with Bull and Redis"
  ```

---

### Day 5-6: Email Preferences (3 hours)

- [ ] **Create preferences service**

  ```bash
  touch src/lib/services/email-preferences.service.ts
  ```

  - Copy implementation from kickoff doc P4.3
  - ~250 lines

- [ ] **Create API endpoints**

  ```bash
  mkdir -p src/app/api/preferences/email
  touch src/app/api/preferences/email/route.ts
  touch src/app/api/unsubscribe/route.ts
  ```

  - Copy implementations from kickoff doc P4.3
  - ~150 lines + ~100 lines

- [ ] **Create UI component**

  ```bash
  mkdir -p src/components/settings
  touch src/components/settings/EmailPreferences.tsx
  ```

  - Copy implementation from kickoff doc P4.3
  - ~300 lines

- [ ] **Add to settings page**

  ```bash
  # Add to src/app/(customer)/settings/page.tsx
  import { EmailPreferences } from '@/components/settings/EmailPreferences';

  // In component:
  <EmailPreferences />
  ```

- [ ] **Test preference flow**
  - Log in as user
  - Navigate to settings
  - Toggle email preferences
  - Verify database updates
  - Trigger disabled email type
  - Verify email not sent

- [ ] **Commit changes**
  ```bash
  git add src/lib/services/email-preferences.service.ts
  git add src/app/api/preferences/ src/app/api/unsubscribe/
  git add src/components/settings/
  git commit -m "feat(email): Add user preference management"
  ```

---

### Day 7-8: Email Analytics (3 hours)

- [ ] **Create analytics service**

  ```bash
  touch src/lib/services/email-analytics.service.ts
  ```

  - Copy implementation from kickoff doc P4.4
  - ~300 lines

- [ ] **Create API endpoint**

  ```bash
  mkdir -p src/app/api/analytics/email
  touch src/app/api/analytics/email/route.ts
  ```

  - ~200 lines

- [ ] **Create dashboard page**

  ```bash
  mkdir -p src/app/(admin)/analytics/email
  touch src/app/(admin)/analytics/email/page.tsx
  ```

  - ~400 lines
  - Show delivery stats, engagement metrics, email type breakdown

- [ ] **Test analytics**
  - Log in as admin
  - Navigate to `/analytics/email`
  - Verify metrics display
  - Send test emails
  - Refresh dashboard
  - Verify counts update

- [ ] **Commit changes**
  ```bash
  git add src/lib/services/email-analytics.service.ts
  git add src/app/api/analytics/email/
  git add src/app/(admin)/analytics/email/
  git commit -m "feat(email): Add analytics dashboard"
  ```

---

### Day 9: Testing & Documentation (2 hours)

- [ ] **Write tests**

  ```bash
  mkdir -p __tests__/lib/services
  touch __tests__/lib/services/email-preferences.service.test.ts
  touch __tests__/lib/queue/email.queue.test.ts
  touch __tests__/lib/services/email-analytics.service.test.ts
  ```

- [ ] **Run all tests**

  ```bash
  npm run type-check  # Should be 0 errors
  npm test            # All tests should pass
  npm run lint        # No ESLint errors
  npm run build       # Build should succeed
  ```

- [ ] **Create documentation**

  ```bash
  mkdir -p docs/guides docs/admin
  touch docs/guides/EMAIL_QUEUE_SETUP.md
  touch docs/guides/EMAIL_PREFERENCES_GUIDE.md
  touch docs/admin/EMAIL_ANALYTICS_GUIDE.md
  ```

- [ ] **Update existing docs**
  - Add Redis to `docs/ENVIRONMENT_VARIABLES.md`
  - Add Redis setup to `README.md`
  - Update `docs/TECHNICAL_DEBT_STATUS.md`

- [ ] **Commit documentation**
  ```bash
  git add docs/ __tests__/
  git commit -m "docs(email): Add Sprint 4 documentation and tests"
  ```

---

### Day 10: Review & Deploy (1 hour)

- [ ] **Final verification**

  ```bash
  npm run type-check     # ✅ 0 errors
  npm test               # ✅ All passing
  npm run lint           # ✅ No errors
  npm run build          # ✅ Success
  ```

- [ ] **Create sprint completion report**

  ```bash
  touch docs/sprints/SPRINT_4_EMAIL_ENHANCEMENTS_COMPLETE.md
  ```

  - Document all deliverables
  - Include metrics and achievements
  - List testing results
  - Add deployment instructions

- [ ] **Deploy to staging**

  ```bash
  # Set up Azure Redis Cache
  # Update staging environment variables
  # Run database migration
  # Deploy code
  # Run smoke tests
  ```

- [ ] **Final commit and PR**
  ```bash
  git add docs/sprints/SPRINT_4_EMAIL_ENHANCEMENTS_COMPLETE.md
  git commit -m "docs: Sprint 4 completion report"
  git push origin sprint-4/email-enhancements
  # Create pull request
  ```

---

## 🎯 Success Criteria

Sprint 4 is complete when:

### Functionality ✅

- [x] Database migrations run successfully
- [x] Email queue processing jobs
- [x] Users can manage preferences
- [x] Unsubscribe flow working
- [x] Analytics dashboard live

### Quality ✅

- [x] 0 TypeScript errors
- [x] All tests passing
- [x] > 80% test coverage
- [x] No ESLint errors

### Documentation ✅

- [x] Sprint completion report
- [x] User guides
- [x] Technical documentation
- [x] API documentation

---

## 🔥 Hot Commands

```bash
# Development
npm run dev                    # Start Next.js
npm run worker:email          # Start email worker

# Database
npx prisma studio             # Database UI
npx prisma migrate dev        # Run migration
npx prisma generate           # Regenerate client

# Testing
npm run type-check            # TypeScript
npm test                      # Run tests
npm run lint                  # ESLint
npm run build                 # Production build

# Redis
docker-compose up -d redis    # Start Redis
redis-cli ping                # Test Redis
redis-cli monitor             # Watch Redis

# Diagnostics
npm run audit:todo            # List TODOs
npm run validate:all          # Full check
```

---

## 📊 Files to Create/Update

### New Files (13)

```
prisma/migrations/xxx_add_email_enhancements/migration.sql
src/lib/queue/email.queue.ts
src/lib/workers/email.worker.ts
src/lib/services/email-preferences.service.ts
src/lib/services/email-analytics.service.ts
src/app/api/preferences/email/route.ts
src/app/api/unsubscribe/route.ts
src/app/api/analytics/email/route.ts
src/components/settings/EmailPreferences.tsx
src/app/(admin)/analytics/email/page.tsx
docs/guides/EMAIL_QUEUE_SETUP.md
docs/guides/EMAIL_PREFERENCES_GUIDE.md
docs/admin/EMAIL_ANALYTICS_GUIDE.md
```

### Updated Files (5)

```
src/lib/services/email.service.ts
src/lib/services/index.ts
docs/ENVIRONMENT_VARIABLES.md
docs/TECHNICAL_DEBT_STATUS.md
README.md
```

---

## ⚠️ Common Gotchas

1. **Redis not running**: Always start Redis before testing
2. **Environment variables**: Add REDIS\_\* vars to `.env.local`
3. **Migration order**: Database first, then code
4. **Queue vs Direct**: Production uses queue, dev uses direct send
5. **Type safety**: Maintain 0 TypeScript errors always

---

## 🆘 Troubleshooting

**Problem**: Redis connection refused  
**Solution**: `docker-compose up -d redis` and check `REDIS_HOST`

**Problem**: TypeScript errors in queue  
**Solution**: Install `@types/bull`: `npm i -D @types/bull`

**Problem**: Migration fails  
**Solution**: Check schema syntax, ensure database is running

**Problem**: Worker not processing jobs  
**Solution**: Check worker is running, check Redis connection

**Problem**: Emails not respecting preferences  
**Solution**: Check preference checking in email service

---

## 📖 Full Documentation

- **Kickoff Document**: `docs/sprints/SPRINT_4_EMAIL_ENHANCEMENTS_KICKOFF.md` (1,528 lines)
- **Continuation Plan**: `CONTINUATION_PLAN.md` (661 lines)
- **Executive Summary**: `TECHNICAL_DEBT_EXECUTIVE_SUMMARY.md` (534 lines)
- **Technical Debt Status**: `docs/TECHNICAL_DEBT_STATUS.md`

---

## 🎓 Learning Resources

- [Bull.js Documentation](https://github.com/OptimalBits/bull)
- [Prisma Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Azure Redis Cache](https://docs.microsoft.com/en-us/azure/azure-cache-for-redis/)

---

## ✅ Final Checklist

- [ ] All code written and tested
- [ ] 0 TypeScript errors
- [ ] All tests passing
- [ ] Documentation complete
- [ ] Deployed to staging
- [ ] Sprint completion report written
- [ ] Pull request created

---

**Estimated Timeline**: 10 days (12 hours total)  
**Difficulty**: Medium  
**Prerequisites**: Completed Sprint 3  
**Next Sprint**: Sprint 5 - Settings & Configuration

---

**Ready?** Start with the database schema! 🚀

**Remember**: Agricultural consciousness in all code! 🌾⚡
