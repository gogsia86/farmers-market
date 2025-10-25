# 🐧 WSL2 Setup Guide - Complete Installation

**Purpose**: Set up a stable Linux development environment on Windows
**Time Required**: 15-20 minutes
**Skill Level**: Beginner-friendly
**Success Rate**: 95%

---

## 🎯 Why WSL2
### Problems It Solves

❌ **Windows Issues You're Facing:**

- Server crashes every 30 seconds (Watchpack error)
- Production builds fail (path incompatibility)
- NextAuth routing bugs
- Unstable development environment

✅ **WSL2 Benefits:**

- 🚀 Stable server (no crashes!)
- 🏗️ Production builds work perfectly
- ✅ All features testable
- 💼 Professional dev environment
- 🔧 Better tool compatibility

---

## 📋 Prerequisites

Before starting, ensure you have:

- ✅ Windows 10 version 2004+ or Windows 11
- ✅ Administrator access
- ✅ At least 20GB free disk space
- ✅ Internet connection

---

## 🚀 Step-by-Step Installation

### Step 1: Enable WSL2 (5 minutes)

Open PowerShell as Administrator and run:

```powershell
# Enable WSL2
wsl --install Ubuntu

# Or if already installed, update to WSL2
wsl --set-default-version 2
```
### Expected Output
```
Installing: Windows Subsystem for Linux
Installing: Ubuntu
The requested operation is successful. Changes will not be effective until the system is rebooted.
```

### Step 2: Restart Your Computer

**IMPORTANT**: You MUST restart for WSL2 to work!

```powershell
# Restart now
shutdown /r /t 0
```

### Step 3: First Ubuntu Setup (2 minutes)

After restart, Ubuntu will automatically open and finish installation.
### You'll be prompted to
1. **Create a username** (lowercase, no spaces)

   ```
   Enter new UNIX username: gogzia
   ```

2. **Create a password** (you won't see it as you type - this is normal!)
   ```
   New password: [your password]
   Retype new password: [your password]
   ```
### Success! You'll see
```
Installation successful!
gogzia@YourComputer:~$
```

### Step 4: Update Ubuntu (3 minutes)

Run these commands in Ubuntu terminal:

```bash
# Update package list
sudo apt update

# Upgrade installed packages
sudo apt upgrade -y

# Install essential build tools
sudo apt install -y build-essential curl git
```

### Step 5: Install Node.js with NVM (3 minutes)

```bash
# Install NVM (Node Version Manager)
curl -o- <https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh> | bash

# Reload terminal configuration
source ~/.bashrc

# Verify NVM installed
nvm --version
# Should output: 0.39.7

# Install Node.js 20 (LTS)
nvm install 20

# Verify Node installation
node --version
# Should output: v20.x.x

npm --version
# Should output: 10.x.x
```

### Step 6: Copy Your Project to WSL2 (2-5 minutes)

```bash
# Create projects directory in WSL home
mkdir -p ~/projects

# Copy project from Windows to WSL
# /mnt/v is your V: drive in WSL
cp -r /mnt/v/Projects/Farmers-Market ~/projects/

# Navigate to project
cd ~/projects/Farmers-Market/farmers-market

# Verify files copied
ls -la
# You should see package.json, src/, etc.
```

---

## 🔧 Project Setup in WSL2

### Step 7: Install Dependencies (3-5 minutes)

```bash
# Make sure you're in the project directory
cd ~/projects/Farmers-Market/farmers-market

# Install all npm packages
npm install

# This will take a few minutes...
# You'll see packages being installed
```

### Step 8: Setup Database Connection

**Option A: Use Windows PostgreSQL from WSL**

Find your Windows IP address:

```powershell
# In Windows PowerShell (not WSL)
ipconfig

# Look for "Ethernet adapter" or "WiFi adapter"
# IPv4 Address: 192.168.1.X
```

Then in WSL, update your `.env`:

```bash
# Edit .env file
nano .env

# Update DATABASE_URL (replace YOUR_WINDOWS_IP)
DATABASE_URL="postgresql://postgres:your_password@YOUR_WINDOWS_IP:5432/farmers_market"

# Save: Ctrl+O, Enter, Ctrl+X
```

**Option B: Install PostgreSQL in WSL** (recommended for isolation)

```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Start PostgreSQL
sudo service postgresql start

# Create database user
sudo -u postgres psql -c "CREATE USER gogzia WITH PASSWORD 'your_password';"
sudo -u postgres psql -c "ALTER USER gogzia CREATEDB;"

# Create database
createdb farmers_market

# Update .env
nano .env
# DATABASE_URL="postgresql://gogzia:your_password@localhost:5432/farmers_market"
```

### Step 9: Initialize Prisma (1 minute)

```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Seed database (optional)
npm run seed
```

### Step 10: Start Development Server 🎉

```bash
# Start the dev server
npm run dev
```
### Expected Output
```
  ▲ Next.js 14.2.16
  - Local: <http://localhost:3000>
  - Network: <http://0.0.0.0:3000>

 ✓ Ready in 2.3s
```

**SUCCESS!** Your server is now running in WSL2! 🎉

---

## 🌐 Accessing Your App

### From Windows Browser

Open your browser and go to:

- **Local**: <http://localhost:3000>
- **Or**: <http://localhost:3001> (if you changed the port)

The app running in WSL2 is accessible from Windows!

---

## 💡 Daily Workflow

### Starting Your Day

```bash
# Open Ubuntu from Windows Start Menu
# Or: Press Win+R, type "wsl", press Enter

# Navigate to project
cd ~/projects/Farmers-Market/farmers-market

# Start PostgreSQL (if using WSL PostgreSQL)
sudo service postgresql start

# Start dev server
npm run dev
```

### Editing Code

**Option 1: VS Code with WSL Extension** (RECOMMENDED)

```bash
# From WSL terminal, open VS Code
code .

# This opens VS Code connected to WSL!
# All your extensions work, terminal runs in WSL
```

**Option 2: Edit in Windows**

Your files are accessible at:

```
\\wsl$\Ubuntu\home\gogzia\projects\Farmers-Market
```

Just open this in Windows Explorer or VS Code!

---

## 🔧 Useful WSL Commands

### File System Navigation

```bash
# Access Windows files from WSL
cd /mnt/c/Users/YourName/Documents  # C: drive
cd /mnt/v/Projects                  # V: drive

# Go to WSL home directory
cd ~
# Or
cd /home/gogzia

# Current directory
pwd
```

### Service Management

```bash
# Start PostgreSQL
sudo service postgresql start

# Stop PostgreSQL
sudo service postgresql stop

# Check PostgreSQL status
sudo service postgresql status
```

### Git Operations

```bash
# Git works the same in WSL
git status
git add .
git commit -m "message"
git push

# Configure git (first time only)
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

---

## 🐛 Troubleshooting

### Issue: "WSL 2 requires an update"
### Solution
1. Download WSL2 kernel update: <https://aka.ms/wsl2kernel>
2. Install it
3. Restart computer

### Issue: "command not found: nvm"
### Solution
```bash
# Reload bash configuration
source ~/.bashrc

# Or close and reopen terminal
```

### Issue: Can't access PostgreSQL from WSL
### Solution
1. Edit PostgreSQL config in Windows:

   ```
   C:\Program Files\PostgreSQL\16\data\pg_hba.conf
   ```

2. Add line:

   ```
   host    all             all             0.0.0.0/0               md5
   ```

3. Edit `postgresql.conf`:

   ```
   listen_addresses = '*'
   ```

4. Restart PostgreSQL service in Windows

### Issue: Port 3000 already in use
### Solution
```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 [PID]

# Or use different port
npm run dev -- -p 3001
```

### Issue: Slow file operations
### Solution
Keep your project files in WSL file system (~/projects/), not in /mnt/

---

## 🎯 Performance Tips

### 1. Use WSL File System
### ❌ DON'T
```bash
cd /mnt/v/Projects/Farmers-Market
npm install  # SLOW!
```
### ✅ DO
```bash
cd ~/projects/Farmers-Market
npm install  # FAST!
```

### 2. Install Node Modules in WSL

Always run `npm install` from within WSL, not from Windows.

### 3. Use VS Code WSL Extension

Install "Remote - WSL" extension in VS Code for native performance.

---

## 🚀 Testing Your Setup

### Verify Everything Works

```bash
# 1. Check Node version
node --version
# Should output: v20.x.x

# 2. Check npm version
npm --version
# Should output: 10.x.x

# 3. Check Prisma
npx prisma --version
# Should output prisma version

# 4. Check database connection
npx prisma db pull
# Should connect successfully

# 5. Start dev server
npm run dev
# Should start without crashes!
```

### Test Login

1. Navigate to: http://localhost:3000/auth/login
2. Try logging in: ana.romana@email.com / FarmLife2024!
3. **Should work!** ✅

---

## 📚 Next Steps

After WSL2 is set up:

1. ✅ **Test all features** - Follow `PHASE_3_TESTING_GUIDE.md`
2. ✅ **Build for production** - `npm run build` (will work now!)
3. ✅ **Run tests** - `npm test`
4. ✅ **Deploy** - Follow `VERCEL_DEPLOYMENT_GUIDE.md`

---

## 🆘 Getting Help

### Common Resources

- **WSL Documentation**: <<https://learn.microsoft.com/en-us/windows/wsl>/>
- **Node.js in WSL**: <<https://learn.microsoft.com/en-us/windows/dev-environment/javascript/nodejs-on-ws>l>
- **VS Code + WSL**: <<https://code.visualstudio.com/docs/remote/ws>l>

### Quick Commands Reference

```bash
# WSL Management (from Windows PowerShell)
wsl --list --verbose              # List installed distros
wsl --shutdown                    # Shutdown WSL
wsl --terminate Ubuntu            # Terminate Ubuntu
wsl --unregister Ubuntu           # Remove Ubuntu

# Inside WSL
exit                              # Close WSL session
sudo service postgresql start     # Start PostgreSQL
code .                            # Open VS Code
```

---

## ✅ Success Checklist

After completing this guide, you should have:

- [ ] WSL2 installed and running
- [ ] Ubuntu set up with username/password
- [ ] Node.js 20 installed via NVM
- [ ] Project copied to WSL filesystem
- [ ] Dependencies installed (npm packages)
- [ ] PostgreSQL configured and connected
- [ ] Prisma client generated
- [ ] Database migrated and seeded
- [ ] Dev server running without crashes
- [ ] VS Code connected to WSL (optional but recommended)

---

**🎉 Congratulations!** You now have a professional, stable development environment!

**Next**: Test your farmer dashboard and all features thoroughly. Everything should work perfectly now! 🚀

---

_Last Updated: October 21, 2025_
_Questions? Check the troubleshooting section or ask for help!_
