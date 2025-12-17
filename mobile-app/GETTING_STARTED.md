# 🚀 Getting Started with Farmers Market Mobile App

> **Divine Agricultural Mobile Development - Your First Steps**

This guide will walk you through setting up and running the Farmers Market mobile app for the first time. Follow these steps in order for a smooth setup experience.

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

- **Node.js** (v18.x or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** (comes with Node.js)
- **Git** - [Download](https://git-scm.com/)
- **Expo CLI** - Install globally: `npm install -g expo-cli`

### Development Environment

Choose your development platform:

#### For iOS Development (macOS only)

- **Xcode** (latest version) - [Mac App Store](https://apps.apple.com/us/app/xcode/id497799835)
- **iOS Simulator** (comes with Xcode)
- **CocoaPods** - Install: `sudo gem install cocoapods`

#### For Android Development

- **Android Studio** - [Download](https://developer.android.com/studio)
- **Android SDK** (API 33 or higher)
- **Android Emulator** or physical device

#### For Quick Testing (Easiest!)

- **Expo Go App** - Install on your physical device:
  - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
  - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

---

## 🔧 Step 1: Clone & Navigate to Mobile App

```bash
# If you haven't cloned the repository yet
git clone <repository-url>

# Navigate to the mobile app directory
cd "Farmers Market Platform web and app/mobile-app"
```

---

## 📦 Step 2: Install Dependencies

```bash
# Install all npm packages
npm install

# Or if you prefer yarn
yarn install
```

**Expected time:** 2-5 minutes depending on your internet connection.

---

## 🌐 Step 3: Configure Environment Variables

### Create Your Environment File

```bash
# Copy the example environment file
cp .env.example .env

# Or on Windows
copy .env.example .env
```

### Edit `.env` with Your Settings

Open `.env` in your favorite editor and configure these **CRITICAL** values:

#### Minimum Required Configuration

```bash
# Environment
APP_ENV=development

# API Configuration - IMPORTANT!
# Choose based on your development setup:

# For iOS Simulator (Mac)
API_BASE_URL=http://localhost:3001/api

# For Android Emulator
API_BASE_URL=http://10.0.2.2:3001/api

# For Physical Device (use your computer's local IP)
# Find your IP: Windows: ipconfig | macOS/Linux: ifconfig
API_BASE_URL=http://192.168.1.XXX:3001/api

# Stripe (use test keys for development)
STRIPE_PUBLISHABLE_KEY_DEV=pk_test_YOUR_KEY_HERE

# Google Maps (optional for initial testing)
GOOGLE_MAPS_API_KEY_ANDROID=YOUR_KEY_HERE
GOOGLE_MAPS_API_KEY_IOS=YOUR_KEY_HERE

# Sentry (optional for initial testing)
SENTRY_DSN=YOUR_DSN_HERE

# Debug Mode
DEBUG_MODE=true
VERBOSE_LOGGING=true
```

> **💡 Finding Your Local IP Address:**
>
> - **Windows:** Open CMD and run `ipconfig`, look for "IPv4 Address"
> - **macOS/Linux:** Open Terminal and run `ifconfig | grep "inet "` or `ip addr`
> - Usually starts with `192.168.x.x` or `10.0.x.x`

---

## 🏃 Step 4: Start the Backend API

The mobile app needs the backend API running. In a **separate terminal**:

```bash
# Navigate to the web platform root
cd "Farmers Market Platform web and app"

# Install dependencies (if not already done)
npm install

# Set up the database (if not already done)
npx prisma generate
npx prisma db push

# Start the development server
npm run dev
```

**Verify backend is running:**

- Open browser to `http://localhost:3001/api/health` (or your configured port)
- You should see a health check response

---

## 🚀 Step 5: Start the Mobile App

Back in the mobile app directory:

```bash
# Start the Expo development server
npm start

# Or with specific options
npm start -- --clear  # Clear cache if needed
```

**You should see:**

```
Metro waiting on exp://192.168.1.XXX:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web

› Press r │ reload app
› Press m │ toggle menu
› Press ? │ show all commands
```

---

## 📱 Step 6: Run on Device/Simulator

### Option A: Physical Device (Easiest for Testing)

1. **Install Expo Go** on your phone (links in Prerequisites)
2. **Scan the QR Code** displayed in the terminal
   - **iOS:** Use the Camera app
   - **Android:** Use the Expo Go app
3. Wait for the app to build and launch

### Option B: iOS Simulator (macOS only)

```bash
# Press 'i' in the Expo terminal
# Or run directly:
npm run ios
```

**First time setup:**

- Xcode will install necessary components
- Select a simulator (iPhone 14 Pro recommended)

### Option C: Android Emulator

```bash
# Press 'a' in the Expo terminal
# Or run directly:
npm run android
```

**First time setup:**

- Make sure you have an Android Virtual Device (AVD) created in Android Studio
- Go to Android Studio → Tools → AVD Manager → Create Virtual Device
- Recommended: Pixel 5 with Android 13 (API 33)

---

## ✅ Step 7: Verify Installation

### You Should See:

1. **Splash Screen** (Farmers Market logo)
2. **Welcome/Login Screen**
3. **No errors in terminal**

### Test Basic Functionality:

1. **Try to login** (you may need to create a test account first via the web platform)
2. **Navigate** through the app
3. **Check terminal logs** for any errors

---

## 🐛 Troubleshooting

### Problem: "Unable to resolve module"

**Solution:**

```bash
# Clear Metro bundler cache
npm start -- --clear

# Or manually clear all caches
rm -rf node_modules
rm -rf .expo
npm install
```

### Problem: "Network request failed" or "Cannot connect to API"

**Solution:**

1. **Verify backend is running:** Check `http://localhost:3001/api/health` in browser
2. **Check API_BASE_URL in `.env`:**
   - iOS Simulator: `http://localhost:3001/api`
   - Android Emulator: `http://10.0.2.2:3001/api`
   - Physical Device: `http://YOUR_LOCAL_IP:3001/api`
3. **Ensure both devices are on same network** (for physical devices)
4. **Check firewall settings** - may be blocking connections

### Problem: "Expo Go app shows 'Something went wrong'"

**Solution:**

```bash
# Reload the app
Press 'r' in Expo terminal

# Or shake device and tap "Reload"
```

### Problem: Android Emulator not detected

**Solution:**

1. **Start Android Studio**
2. **Open AVD Manager** (Tools → AVD Manager)
3. **Launch an emulator** (click play button)
4. **Wait for emulator to fully boot**
5. **Try again:** Press 'a' in Expo terminal

### Problem: iOS Simulator not opening

**Solution:**

```bash
# Open simulator manually
open -a Simulator

# Or specify device
xcrun simctl boot "iPhone 14 Pro"

# Then press 'i' in Expo terminal
```

### Problem: "Unable to find expo in this project"

**Solution:**

```bash
# Install Expo packages
npm install expo @expo/vector-icons expo-status-bar

# Reinstall all dependencies
rm -rf node_modules package-lock.json
npm install
```

### Problem: TypeScript errors on start

**Solution:**

```bash
# Generate Prisma types (if using shared types)
cd ..
npx prisma generate
cd mobile-app

# Restart with cache clear
npm start -- --clear
```

### Problem: "Port 8081 already in use"

**Solution:**

```bash
# Kill process on port 8081
# macOS/Linux:
lsof -ti:8081 | xargs kill

# Windows:
netstat -ano | findstr :8081
taskkill /PID <PID> /F

# Or use different port
npm start -- --port 8082
```

---

## 🔑 Quick Command Reference

```bash
# Start development server
npm start

# Start with cache clear
npm start -- --clear

# Open on iOS Simulator
npm run ios

# Open on Android Emulator
npm run android

# Run tests
npm test

# Run type checking
npm run type-check

# Lint code
npm run lint

# Format code
npm run format

# Build for production (requires EAS account)
npm run build:ios
npm run build:android
```

---

## 📁 Project Structure Overview

```
mobile-app/
├── App.tsx                 # Main app entry point
├── app.json               # Expo configuration
├── package.json           # Dependencies
├── .env                   # Environment variables (create this!)
├── .env.example          # Environment template
│
├── src/
│   ├── components/       # Reusable UI components
│   ├── screens/          # App screens/pages
│   ├── navigation/       # Navigation setup
│   ├── services/         # API & external services
│   ├── stores/           # State management (Zustand)
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Helper functions
│   └── types/            # TypeScript types
│
└── assets/               # Images, fonts, etc.
```

---

## 🎯 Next Steps

Now that your app is running, here's what to do next:

### Immediate Tasks (First Day)

1. **Explore the app** - Navigate through existing screens
2. **Review documentation:**
   - `README.md` - Project overview
   - `IMPLEMENTATION_ROADMAP.md` - Development phases
   - `QUICK_REFERENCE.md` - Code patterns
3. **Set up your IDE:**
   - Install recommended extensions (ESLint, Prettier, React Native Tools)
   - Configure code formatting

### Short-term Tasks (First Week)

1. **Implement authentication screens:**
   - Login
   - Register
   - Forgot Password
2. **Create base UI components:**
   - Button
   - Input
   - Card
   - Loading indicators
3. **Set up test environment:**
   - Configure Jest
   - Write first component test

### Development Workflow

```bash
# 1. Create a new feature branch
git checkout -b feature/login-screen

# 2. Make your changes
# Edit files in src/

# 3. Test your changes
npm start
# Test on device/simulator

# 4. Run tests and linting
npm test
npm run lint

# 5. Commit your changes
git add .
git commit -m "feat: implement login screen"

# 6. Push and create PR
git push origin feature/login-screen
```

---

## 📚 Additional Resources

### Documentation

- **Expo Docs:** https://docs.expo.dev/
- **React Native Docs:** https://reactnative.dev/docs/getting-started
- **React Navigation:** https://reactnavigation.org/docs/getting-started
- **Zustand:** https://github.com/pmndrs/zustand
- **React Query:** https://tanstack.com/query/latest

### Project Docs

- `START_HERE.md` - Project introduction
- `MOBILE_APP_DEVELOPMENT_PLAN.md` - Complete development plan
- `IMPLEMENTATION_ROADMAP.md` - 16-week roadmap
- `QUICK_START_GUIDE.md` - Quick setup guide
- `QUICK_REFERENCE.md` - Code patterns and snippets

### Divine Instructions (in `.github/instructions/`)

Review these for advanced patterns:

- `04_NEXTJS_DIVINE_IMPLEMENTATION.instructions.md`
- `09_AI_WORKFLOW_AUTOMATION.instructions.md`
- `10_AGRICULTURAL_FEATURE_PATTERNS.instructions.md`
- `16_KILO_QUICK_REFERENCE.instructions.md`

---

## 🆘 Getting Help

### Common Issues Database

Check `TROUBLESHOOTING.md` (will be created) for comprehensive issue resolution.

### Ask for Help

1. **Check existing documentation** (you're reading it!)
2. **Search project issues** on GitHub
3. **Ask in team chat** with:
   - What you're trying to do
   - What you expected to happen
   - What actually happened
   - Relevant error messages
   - Your environment (iOS/Android, physical/simulator)

### Debug Information Template

```
**Environment:**
- Platform: iOS/Android
- Device: Simulator/Physical (model)
- Node version: (run `node -v`)
- npm version: (run `npm -v`)
- Expo SDK: (check `app.json`)

**Issue:**
[Describe the issue]

**Steps to reproduce:**
1.
2.
3.

**Expected behavior:**
[What should happen]

**Actual behavior:**
[What actually happens]

**Error messages:**
```

[Paste relevant errors]

```

**Screenshots:**
[If applicable]
```

---

## 🎉 Congratulations!

You now have a fully functional development environment for the Farmers Market mobile app!

### What You've Accomplished:

✅ Installed all dependencies
✅ Configured environment variables
✅ Started the backend API
✅ Launched the mobile app
✅ Verified everything works

### Ready to Build?

Head over to `IMPLEMENTATION_ROADMAP.md` to see what features to build next, or check `QUICK_REFERENCE.md` for copy-paste code patterns.

---

## 🌾 Divine Agricultural Development Principles

Remember to code with:

- **🧬 Agricultural Consciousness** - Every feature serves farmers and customers
- **⚡ Quantum Efficiency** - Optimize for performance (your HP OMEN can handle it!)
- **🎯 Type Safety** - TypeScript strict mode, always
- **✨ User Delight** - Smooth animations, intuitive UX
- **🔒 Security First** - Protect user data
- **🧪 Test Coverage** - Every feature tested

---

**Happy Coding! 🚀🌾**

_"Code with agricultural consciousness, architect with divine precision, deliver with quantum efficiency."_

---

**Version:** 1.0.0
**Last Updated:** November 2024
**Status:** ✅ READY FOR DEVELOPMENT
