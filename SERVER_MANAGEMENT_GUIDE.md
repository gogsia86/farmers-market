# 🖥️ Server Management Guide - Farmers Market Platform

**Last Updated**: January 16, 2025  
**Status**: ✅ Fully Operational  
**Version**: 3.0 - Divine Agricultural Edition

---

## 📋 Quick Start

### Starting the Dev Server

```bash
# Option 1: Safe start (Recommended - auto-handles port conflicts)
npm run dev:safe

# Option 2: Standard start (port 3001)
npm run dev

# Option 3: Turbo mode (faster)
npm run dev:turbo

# Option 4: HP OMEN optimized (maximum performance)
npm run dev:omen
```

### Stopping the Server

```bash
# Stop gracefully (Ctrl+C in terminal)
# Or kill all dev server processes
npm run kill-server

# Nuclear option: Kill ALL Node.js processes
npm run kill-server -- --all
```

---

## 🚀 Server Startup Methods

### Method 1: Safe Start (Recommended) ⭐

**What it does:**
- ✅ Automatically checks if ports are available
- ✅ Kills conflicting processes if needed
- ✅ Falls back to alternative ports if necessary
- ✅ Provides clear status messages

**Usage:**
```bash
npm run dev:safe
```

**Output:**
```
╔════════════════════════════════════════════════════════════╗
║  🚀 Safe Dev Server Starter                                ║
║  Farmers Market Platform - Divine Agricultural Testing    ║
╚════════════════════════════════════════════════════════════╝

🎯 Attempting to use default port 3001...

🔍 Checking port 3001...
   ✅ Port 3001 is available

╔════════════════════════════════════════════════════════════╗
║  🚀 Starting Next.js Dev Server on port 3001              ║
╚════════════════════════════════════════════════════════════╝

   ▲ Next.js 16.0.3
   - Local:        http://localhost:3001
   ✓ Ready in 2.5s
```

---

### Method 2: Standard Start

**What it does:**
- Uses Next.js standard startup
- Requires port 3001 to be available
- Fails if port is in use

**Usage:**
```bash
npm run dev
```

**Port Configuration:**
- Default: `3001` (configured in package.json)
- Change via: `PORT=3002 npm run dev`

---

### Method 3: Turbo Mode

**What it does:**
- Uses Next.js Turbopack for faster compilation
- Better for large codebases
- Optimized for development speed

**Usage:**
```bash
npm run dev:turbo
```

**Benefits:**
- ⚡ Faster initial compilation
- ⚡ Faster hot module replacement (HMR)
- ⚡ Better memory usage

---

### Method 4: HP OMEN Optimized

**What it does:**
- Maximum memory allocation (32GB)
- Optimized for HP OMEN hardware
- Best performance for large projects

**Usage:**
```bash
npm run dev:omen
```

**Hardware Requirements:**
- RAM: 64GB recommended
- CPU: 12+ threads
- GPU: RTX 2070 Max-Q or better

**Memory Settings:**
- `--max-old-space-size=32768` (32GB)
- `--max-semi-space-size=512` (512MB)

---

## 🔪 Killing Server Processes

### Method 1: Kill Dev Server (Targeted)

**What it does:**
- Scans common development ports (3000-3003, 5000, 8000, 8080)
- Finds and terminates processes
- Safe and selective

**Usage:**
```bash
npm run kill-server
```

**Output:**
```
╔════════════════════════════════════════════════════════════╗
║  🔪 Kill Dev Server - Farmers Market Platform             ║
║  Terminate processes on development ports                 ║
╚════════════════════════════════════════════════════════════╝

🔍 Scanning common development ports: 3000, 3001, 3002, 3003, 5000, 8000, 8080

📍 Checking port 3000...
   ✅ Port 3000 is clear (no processes found)

📍 Checking port 3001...
   ⚠️  Found 1 process(es) on port 3001
   ✅ Killed process PID: 12345

╔════════════════════════════════════════════════════════════╗
║  ✅ Success! Killed 1 process(es)                         ║
║  Ports affected: 3001                                      ║
╚════════════════════════════════════════════════════════════╝

💡 You can now start the dev server:
   npm run dev
```

---

### Method 2: Kill All Node Processes (Nuclear)

**What it does:**
- ⚠️ Kills ALL Node.js processes on your system
- Use with caution
- Useful when targeted kill doesn't work

**Usage:**
```bash
npm run kill-server -- --all
```

**Warning:**
- This will terminate ALL Node.js processes
- Any running Node apps will be killed
- IDE extensions using Node may need restart

---

## 🐛 Troubleshooting

### Issue 1: Port Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3001
```

**Solutions:**

#### Solution A: Use Safe Start (Recommended)
```bash
npm run dev:safe
# Automatically handles port conflicts
```

#### Solution B: Kill Existing Process
```bash
npm run kill-server
npm run dev
```

#### Solution C: Manual Kill (Windows)
```bash
# Find process
netstat -ano | findstr :3001

# Kill process (replace <PID> with actual PID)
taskkill /F /PID <PID>
```

#### Solution D: Manual Kill (Linux/Mac)
```bash
# Find process
lsof -i :3001

# Kill process (replace <PID> with actual PID)
kill -9 <PID>
```

#### Solution E: Use Different Port
```bash
PORT=3002 npm run dev
```

---

### Issue 2: Multiple Instances Running

**Symptoms:**
- Multiple terminal windows with dev servers
- Confused about which server is active
- Unexpected behavior

**Solution:**
```bash
# Kill all dev servers
npm run kill-server

# Or nuclear option
npm run kill-server -- --all

# Start fresh
npm run dev:safe
```

---

### Issue 3: Server Won't Start

**Error:**
```
⨯ Failed to start server
```

**Checklist:**

1. **Check Database Connection**
```bash
# Verify DATABASE_URL is set
echo $DATABASE_URL  # Linux/Mac
echo %DATABASE_URL% # Windows

# Test database connection
npm run db:studio
```

2. **Clear Next.js Cache**
```bash
rm -rf .next
npm run dev
```

3. **Check Node Version**
```bash
node --version
# Should be >= 20.19.0
```

4. **Check Dependencies**
```bash
rm -rf node_modules package-lock.json
npm install
```

5. **Check TypeScript Errors**
```bash
npm run type-check
```

---

### Issue 4: Server Crashes Randomly

**Symptoms:**
- Server exits unexpectedly
- "Out of memory" errors
- Slow performance

**Solutions:**

1. **Increase Memory Allocation**
```bash
# Use HP OMEN optimized mode
npm run dev:omen
```

2. **Check Available Memory**
```bash
# Windows
systeminfo | findstr Memory

# Linux/Mac
free -h
```

3. **Check for Memory Leaks**
```bash
# Monitor Node process
# Windows: Task Manager
# Linux/Mac: top or htop
```

---

### Issue 5: Hot Reload Not Working

**Symptoms:**
- Changes not reflecting
- Need to manually refresh
- HMR not triggering

**Solutions:**

1. **Use Turbo Mode**
```bash
npm run dev:turbo
```

2. **Check File Watchers**
```bash
# Increase file watcher limit (Linux)
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

3. **Restart Dev Server**
```bash
# Ctrl+C to stop
npm run dev
```

---

## 📊 Port Configuration

### Default Ports

| Service | Port | Configured In |
|---------|------|---------------|
| **Next.js Dev** | 3001 | package.json |
| **Next.js Prod** | 3001 | package.json |
| **Database Studio** | 5555 | Prisma default |
| **Playwright** | 3001 | playwright.config.ts |

### Changing Ports

#### Temporary (One-time)
```bash
PORT=3002 npm run dev
```

#### Permanent (Update package.json)
```json
{
  "scripts": {
    "dev": "cross-env NODE_OPTIONS='--max-old-space-size=16384' next dev -p 3002"
  }
}
```

#### Environment Variable (.env.local)
```bash
PORT=3002
```

---

## 🔧 Advanced Configuration

### Memory Optimization

```bash
# Small projects (< 1GB)
NODE_OPTIONS='--max-old-space-size=4096' npm run dev

# Medium projects (1-5GB)
NODE_OPTIONS='--max-old-space-size=8192' npm run dev

# Large projects (5-10GB)
NODE_OPTIONS='--max-old-space-size=16384' npm run dev

# HP OMEN / Enterprise (10GB+)
NODE_OPTIONS='--max-old-space-size=32768' npm run dev
```

### Performance Tuning

#### Enable Turbopack
```bash
npm run dev:turbo
```

#### Disable Source Maps (Faster builds)
```javascript
// next.config.mjs
productionBrowserSourceMaps: false,
```

#### Enable SWC Minification (Already enabled)
```javascript
// Automatically enabled in Next.js 15+
```

---

## 🌐 Network Access

### Local Network Access

To access the dev server from other devices on your network:

```bash
# Start server with network access
npm run dev -- --hostname 0.0.0.0

# Find your local IP
# Windows: ipconfig
# Linux/Mac: ifconfig or ip addr

# Access from other devices
# http://<YOUR_IP>:3001
```

### Firewall Configuration

**Windows:**
```powershell
# Allow Node through firewall
netsh advfirewall firewall add rule name="Node.js" dir=in action=allow program="C:\Program Files\nodejs\node.exe" enable=yes
```

**Linux:**
```bash
# Allow port 3001
sudo ufw allow 3001
```

---

## 📝 Server Management Scripts

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Standard dev server (port 3001) |
| `npm run dev:safe` | Safe start with auto port handling |
| `npm run dev:turbo` | Turbo mode (faster) |
| `npm run dev:omen` | HP OMEN optimized |
| `npm run kill-server` | Kill dev server processes |
| `npm run kill-server -- --all` | Kill ALL Node.js processes |
| `npm start` | Production server |

### Script Locations

```
📂 scripts/
├── 📄 start-dev-safe.js ........... Safe server starter
├── 📄 kill-dev-server.js .......... Process killer
└── 📄 e2e-test.js ................. E2E test runner
```

---

## 🎯 Best Practices

### Development Workflow

1. **Start of Day**
```bash
# Kill any leftover processes
npm run kill-server

# Start fresh
npm run dev:safe
```

2. **During Development**
```bash
# Use watch mode for tests
npm run test:watch

# Keep dev server running
# Only restart if absolutely necessary
```

3. **End of Day**
```bash
# Stop server gracefully (Ctrl+C)
# Or ensure all processes are stopped
npm run kill-server
```

### Multi-Project Workflow

If working on multiple projects:

```bash
# Project 1: Port 3001
cd project1
npm run dev

# Project 2: Port 3002
cd project2
PORT=3002 npm run dev

# Project 3: Port 3003
cd project3
PORT=3003 npm run dev
```

---

## 🌾 Agricultural Consciousness

### Server Startup Messages

```
╔════════════════════════════════════════════════════════════╗
║  🌾 Farmers Market Platform                               ║
║  Divine Agricultural E-Commerce Platform                  ║
╚════════════════════════════════════════════════════════════╝

🌱 Agricultural Consciousness: ACTIVE
⚡ Divine Performance: OPTIMIZED
🎯 HP OMEN Mode: ENABLED
```

### Environment Variables

```bash
# .env.local
AGRICULTURAL_CONSCIOUSNESS=enabled
DIVINE_PATTERNS=active
HP_OMEN_OPTIMIZATION=ultimate
HP_OMEN_RAM_GB=64
HP_OMEN_THREADS=12
HP_OMEN_GPU=RTX_2070_MAX_Q
```

---

## 📚 Related Documentation

- **[E2E Testing Guide](./E2E_TESTING_GUIDE.md)** - E2E server requirements
- **[Testing Quick Reference](./TESTING_QUICK_REFERENCE.md)** - Test commands
- **[Test Fixes Documentation](./TEST_FIXES_DOCUMENTATION.md)** - Infrastructure details

---

## 🆘 Emergency Commands

### Complete Reset

```bash
# Nuclear option: Complete fresh start
npm run kill-server -- --all
rm -rf .next node_modules package-lock.json
npm install
npm run dev:safe
```

### System Check

```bash
# Check everything is healthy
node --version          # Should be >= 20.19.0
npm --version           # Should be >= 10.0.0
npm run type-check      # Should have no errors
npm run lint            # Should pass
npm run test            # Should pass
```

---

## 🎉 Summary

### Quick Commands

```bash
# Start server safely
npm run dev:safe

# Kill all dev servers
npm run kill-server

# Start fresh
npm run kill-server && npm run dev:safe

# Maximum performance
npm run dev:omen
```

### Common Issues

1. **Port in use** → `npm run dev:safe`
2. **Multiple instances** → `npm run kill-server`
3. **Won't start** → Check database, clear cache
4. **Crashes** → Use `npm run dev:omen`
5. **HMR not working** → `npm run dev:turbo`

---

**Status**: ✅ FULLY OPERATIONAL  
**Divine Level**: MAXIMUM SERVER MANAGEMENT POWER 🌾⚡

_"Tend to your servers like crops, nurture with divine consciousness, harvest with quantum efficiency."_ 🌾🖥️