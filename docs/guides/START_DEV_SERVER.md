# 🚀 START DEV SERVER - Quick Guide

**Farmers Market Platform - Get Running in 5 Minutes**

---

## ⚡ FASTEST PATH TO RUNNING SERVER

```bash
# 1. Start PostgreSQL (if not running)
# 2. Run this:
npm run dev

# 3. Open browser:
http://localhost:3001
```

**That's it!** 🎉

---

## 📚 Need More Help?

### Choose Your Documentation:

#### 👤 **I'm a Manager/PM**

→ Read: [**DEV_SERVER_SUMMARY.md**](./DEV_SERVER_SUMMARY.md) (2 minutes)

- Executive overview
- Current status (95/100 ✅)
- What's working, what's not
- Bottom line recommendation

#### 🆕 **I'm a New Developer**

→ Read: [**QUICK_START_CHECKLIST.md**](./QUICK_START_CHECKLIST.md) (5 minutes)

- Step-by-step setup
- Quick verification
- Common issues & fixes
- Success indicators

#### 👨‍💻 **I'm an Experienced Developer**

→ Read: [**DEV_SERVER_ANALYSIS_CHECKLIST.md**](./DEV_SERVER_ANALYSIS_CHECKLIST.md) (15 minutes)

- Complete technical deep dive
- All configurations explained
- Performance tuning
- Troubleshooting guide

#### 🎯 **I'm a Tech Lead**

→ Read: [**RECOMMENDED_UPDATES.md**](./RECOMMENDED_UPDATES.md) (10 minutes)

- Prioritized action items
- Implementation timeline
- Sprint planning guide
- Technical debt tracking

#### 🗺️ **I Want to Navigate All Docs**

→ Read: [**DEV_SERVER_DOCS_INDEX.md**](./DEV_SERVER_DOCS_INDEX.md) (Index)

- Complete documentation map
- Quick topic finder
- Training guides
- Maintenance schedule

---

## 🔍 Quick Troubleshooting

### Issue: Port Already in Use

```bash
npm run kill-server
```

### Issue: Database Connection Failed

```bash
# Windows:
net start postgresql-x64-14

# Verify:
psql -U postgres -l | grep farmersmarket
```

### Issue: Stale Changes Not Showing

```bash
rm -rf .next
npm run dev
```

### Issue: Prisma Client Not Found

```bash
npx prisma generate
```

---

## ✅ Current Status

**System Health**: ✅ 95/100 - READY FOR DEVELOPMENT

```
✓ Node.js v22.21.0
✓ npm v10.9.4
✓ Next.js v16.0.3
✓ Prisma v7.0.1
✓ TypeScript v5.9.3
✓ Port 3001 available
✓ All dependencies installed
✓ Latest features committed
```

**Minor Issues** (non-blocking):

- ⚠️ 22 TypeScript warnings (mainly mobile-app)
- ⚠️ Database may need retry on first connect

---

## 🎊 Latest Features

When you start the server, you'll see:

- ✨ **Search Autocomplete** - Homepage search with suggestions
- 📊 **Platform Stats** - Real-time farm/product/order counts
- 🌾 **Featured Farms** - Dynamic farm cards
- 🏥 **Health Check API** - `/api/health` endpoint
- 📈 **Monitoring Dashboard** - `/monitoring` route

---

## 📞 Quick Commands

```bash
# Development
npm run dev              # Start (RECOMMENDED)
npm run dev:omen         # HP OMEN optimized
npm run dev:logger       # Debug mode

# Database
npm run db:push          # Sync schema
npm run db:studio        # Visual manager
npm run db:seed:basic    # Add test data

# Quality
npm run type-check       # TypeScript
npm run lint             # Linting
npm run test             # Tests

# Troubleshooting
npm run kill-server      # Stop server
rm -rf .next             # Clear cache
```

---

## 🎯 Success Checklist

Dev server is running when you see:

- [x] "Ready in X seconds" in terminal
- [x] No fatal errors in console
- [x] Homepage loads at http://localhost:3001
- [x] Database connected (or graceful degradation)
- [x] Hot reload works (edit file, see changes)
- [x] API responds: `curl http://localhost:3001/api/health`

---

## 📊 Documentation Suite

**Total**: 2,709 lines | 5 documents | ~72KB

| Document                                       | Size | Time   | Purpose            |
| ---------------------------------------------- | ---- | ------ | ------------------ |
| [Summary](./DEV_SERVER_SUMMARY.md)             | 11KB | 2 min  | Executive overview |
| [Quick Start](./QUICK_START_CHECKLIST.md)      | 6KB  | 5 min  | Fast setup         |
| [Analysis](./DEV_SERVER_ANALYSIS_CHECKLIST.md) | 28KB | 15 min | Deep dive          |
| [Updates](./RECOMMENDED_UPDATES.md)            | 16KB | 10 min | Action items       |
| [Index](./DEV_SERVER_DOCS_INDEX.md)            | 11KB | -      | Navigation         |

---

## 🚀 Start Now!

```bash
npm run dev
```

Then open: **http://localhost:3001**

**Need help?** Pick a doc above based on your role! 📖

---

**Status**: ✅ READY  
**Version**: 1.0  
**Updated**: December 3, 2024

_"Get coding in under 5 minutes!"_ ⚡🌾
