# 🌐 Web Support Setup Guide - Quick Fix

This guide will help you quickly set up web support for the Farmers Market mobile app so you can test it in a browser.

## 🚀 Quick Fix (Windows PowerShell)

Run these commands in order:

```powershell
# Navigate to mobile-app directory
cd "M:\Repo\Farmers Market Platform web and app\mobile-app"

# Install dependencies with legacy peer deps
npm install --legacy-peer-deps

# Start Expo and press 'w' for web
npx expo start
```

When the Expo dev server starts, press **`w`** to open in your web browser!

---

## 📋 Detailed Step-by-Step Instructions

### Step 1: Navigate to Mobile App Directory

```powershell
cd "M:\Repo\Farmers Market Platform web and app\mobile-app"
```

### Step 2: Install Dependencies

The project has a `.npmrc` file configured to handle peer dependency conflicts automatically. Just run:

```powershell
npm install
```

If you still get dependency errors, use:

```powershell
npm install --legacy-peer-deps
```

### Step 3: Start Expo Development Server

```powershell
npx expo start
```

Or use the shortcut:

```powershell
npm run web
```

### Step 4: Open in Browser

When you see the QR code and menu, press **`w`** on your keyboard.

Your default browser will open with the app running at:

```
http://localhost:8081
```

---

## 🔧 Troubleshooting

### "Unable to resolve dependency tree" Error

**Solution 1 - Use Legacy Peer Deps:**

```powershell
npm install --legacy-peer-deps
```

**Solution 2 - Force Install:**

```powershell
npm install --force
```

**Solution 3 - Clean Install:**

```powershell
# Remove node_modules and package-lock
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json

# Clear npm cache
npm cache clean --force

# Reinstall
npm install --legacy-peer-deps
```

### "react-native-web not found" Error

Install it specifically:

```powershell
npm install react-native-web@~0.19.6 react-dom@18.2.0 --legacy-peer-deps
```

### Port 8081 Already in Use

Kill the process on port 8081:

```powershell
# Find the process
Get-NetTCPConnection -LocalPort 8081 | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }

# Or restart Expo with a different port
npx expo start --port 8082
```

### Metro Bundler Crashes

Clear Metro cache:

```powershell
npx expo start --clear
```

Or clear all caches:

```powershell
npx expo start --clear --reset-cache
```

### Browser Opens But Shows Blank Page

1. **Check Console for Errors:**
   - Press `F12` in your browser
   - Look at the Console tab for error messages

2. **Common Fixes:**

   ```powershell
   # Clear Expo cache and restart
   npx expo start --clear

   # Or clear everything
   npx expo start --clear --reset-cache --no-dev
   ```

3. **Verify Dependencies:**
   ```powershell
   npm list react-native-web
   npm list react-dom
   ```

---

## 🎯 Quick Test Commands

```powershell
# Test if web dependencies are installed
npm list react-native-web react-dom

# Check for outdated packages
npm outdated

# Verify Expo installation
npx expo --version

# Run Expo doctor to check for issues
npx expo doctor
```

---

## 📦 Required Dependencies for Web

These are automatically installed with `npm install`:

```json
{
  "react": "18.2.0",
  "react-dom": "18.2.0",
  "react-native-web": "~0.19.6"
}
```

---

## 🌟 Alternative: Use the Setup Script

We've created a batch script that automates the entire process:

```powershell
# Run the setup script
.\setup-web.bat
```

This script will:

1. ✅ Clean npm cache
2. ✅ Remove old node_modules
3. ✅ Install all dependencies
4. ✅ Verify web support

---

## 🚀 Full Stack Development

To run both backend API and mobile app together:

### Option 1: Automated (Recommended)

```powershell
# From project root
cd "M:\Repo\Farmers Market Platform web and app"
.\start-all.ps1
```

This opens two windows:

- Backend API (port 3000)
- Mobile App (port 8081)

### Option 2: Manual

**Terminal 1 - Backend:**

```powershell
cd "M:\Repo\Farmers Market Platform web and app"
npm run dev
```

**Terminal 2 - Mobile App:**

```powershell
cd "M:\Repo\Farmers Market Platform web and app\mobile-app"
npx expo start
```

Then press **`w`** in the mobile app terminal to open web.

---

## 🔍 Verify Everything Works

After starting the app in browser:

1. **Check Welcome Screen:**
   - You should see the Farmers Market welcome page
   - Logo and branding should display

2. **Test Navigation:**
   - Click "Get Started" button
   - Should navigate to Login screen

3. **Test Login Form:**
   - Email and password inputs should work
   - Form should be styled correctly

4. **Check Console:**
   - Press `F12` → Console tab
   - Should see no critical errors
   - You might see warnings (that's okay)

---

## 📱 Other Development Options

### Option A: Physical Device (No Setup Required!)

1. Install **Expo Go** from Google Play Store or App Store
2. Scan the QR code from terminal
3. App loads on your device!

**Pros:** No Android Studio setup needed
**Cons:** Requires phone and same Wi-Fi network

### Option B: Android Emulator

Requires Android Studio setup. See: `docs/ANDROID_SDK_SETUP.md`

**Pros:** Full Android emulation
**Cons:** Requires large download and setup time

### Option C: Web Browser (Current Option)

**Pros:**

- Instant setup
- Fast development
- No emulator overhead

**Cons:**

- Some React Native features don't work on web
- Different behavior than native

---

## 🎓 Development Tips

### Hot Reload

The web version supports fast refresh. Just save your files and the browser updates automatically!

### View React Developer Tools

Install React DevTools Chrome extension:
https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi

### Debug Network Requests

1. Press `F12` → Network tab
2. Filter by "Fetch/XHR"
3. See all API calls to your backend

### Test Responsive Design

1. Press `F12` → Device Toolbar (or Ctrl+Shift+M)
2. Select device (iPhone, Pixel, etc.)
3. Test different screen sizes

---

## 📚 Additional Resources

- [Expo Web Documentation](https://docs.expo.dev/workflow/web/)
- [React Native Web](https://necolas.github.io/react-native-web/)
- [Expo Troubleshooting](https://docs.expo.dev/troubleshooting/overview/)

---

## ✅ Success Criteria

You'll know everything is working when:

- ✅ Expo starts without errors
- ✅ Pressing `w` opens browser
- ✅ You see the Farmers Market welcome screen
- ✅ Navigation works (Welcome → Login)
- ✅ UI elements render correctly
- ✅ No critical errors in browser console

---

## 🆘 Still Having Issues?

If you've tried everything and it still doesn't work:

1. **Share Error Messages:**
   - Copy the full error from terminal
   - Copy browser console errors (F12)

2. **Check Environment:**

   ```powershell
   node --version  # Should be 18.x or higher
   npm --version   # Should be 9.x or higher
   npx expo --version  # Should show Expo version
   ```

3. **Last Resort - Complete Reset:**
   ```powershell
   # Delete everything and start fresh
   Remove-Item -Recurse -Force node_modules
   Remove-Item -Force package-lock.json
   npm cache clean --force
   npm install --legacy-peer-deps
   npx expo start --clear
   ```

---

**Happy Coding! 🌾🚀**
