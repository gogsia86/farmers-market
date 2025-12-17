# 🔄 RESTART GUIDE - Get Your QR Code Back!

> **Quick fix when QR code stops working**

---

## 🚀 METHOD 1: Simple Restart (Recommended)

### Step 1: Open New Terminal/Command Prompt

```bash
cd "M:\Repo\Farmers Market Platform web and app\mobile-app"
```

### Step 2: Start Expo

```bash
npx expo start
```

**That's it!** New QR code will appear in 10-20 seconds.

---

## 🚀 METHOD 2: Clear Cache & Restart

If Method 1 doesn't work:

```bash
cd "M:\Repo\Farmers Market Platform web and app\mobile-app"
npx expo start --clear
```

The `--clear` flag clears the Metro bundler cache.

---

## 🚀 METHOD 3: Use Windows Batch Script

Double-click the file:

```
start.bat
```

This script will:

- Check for dependencies
- Clear cache automatically
- Start Expo with fresh QR code

---

## 📱 VIEWING OPTIONS

Once Expo starts, you have these options:

### Option A: Physical Device (Best!)

1. Install **Expo Go** app on your phone
2. **Scan the QR code** in the terminal
3. Wait for app to load

### Option B: Android Emulator

```bash
# Make sure Android Studio AVD is running first!
# Then press 'a' in the Expo terminal
```

### Option C: iOS Simulator (Mac Only)

```bash
# Press 'i' in the Expo terminal
```

### Option D: Web Browser (Quick Test)

```bash
# Press 'w' in the Expo terminal
```

---

## 🐛 TROUBLESHOOTING

### QR Code Still Not Working?

**Try Tunnel Mode:**

```bash
npx expo start --tunnel
```

This uses a tunnel connection that works even with complex network setups.

### "Port 8081 already in use"

Kill the existing process:

```bash
# Find the process
netstat -ano | findstr :8081

# Kill it (replace <PID> with the number from above)
taskkill /PID <PID> /F

# Then restart
npx expo start
```

### Can't Connect on Phone?

1. **Same WiFi?** Make sure phone and computer are on the same WiFi network
2. **Firewall?** Windows Firewall might be blocking port 8081
3. **Try Tunnel:** `npx expo start --tunnel`

### Metro Bundler Issues

```bash
# Delete cache folders
rmdir /s /q .expo
rmdir /s /q node_modules\.cache

# Restart
npx expo start --clear
```

### Still Having Issues?

```bash
# Nuclear option - reinstall everything
rmdir /s /q node_modules
del package-lock.json
npm install
npx expo start --clear
```

---

## ⚡ QUICK COMMANDS

```bash
# Normal start
npx expo start

# Start with cache clear
npx expo start --clear

# Start with tunnel (works through firewall)
npx expo start --tunnel

# Start and open Android
npx expo start --android

# Start and open iOS (Mac only)
npx expo start --ios

# Start and open web
npx expo start --web
```

---

## 📱 EXPO GO APP LINKS

### iOS

https://apps.apple.com/app/expo-go/id982107779

### Android

https://play.google.com/store/apps/details?id=host.exp.exponent

---

## ✅ SUCCESS CHECKLIST

When Expo starts successfully, you should see:

- ✅ "Metro waiting on exp://..." message
- ✅ QR code displayed in terminal
- ✅ List of keyboard commands (a, i, w, etc.)
- ✅ No red error messages

---

## 🎯 EXPECTED OUTPUT

```
Starting Metro Bundler

▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
█ ▄▄▄▄▄ █ ██▀▀ ▀▄██ ▄▄▄▄▄ █
█ █   █ █  ▀█ ▀█▄▄█ █   █ █
█ █▄▄▄█ █▀  █▄▀▀▄██ █▄▄▄█ █
█▄▄▄▄▄▄▄█▄█ ▀▄█▄█ █▄▄▄▄▄▄▄█
[QR CODE APPEARS HERE]

› Metro waiting on exp://192.168.1.XXX:8081
› Scan the QR code above with Expo Go

› Press a │ open Android
› Press w │ open web
```

---

## 🌟 PRO TIPS

1. **Keep Terminal Open** - Don't close the terminal window while developing
2. **Auto Reload** - Changes to your code will hot-reload automatically
3. **Shake Device** - Shake your phone to open developer menu in the app
4. **Press R** - In terminal, press 'r' to reload the app manually
5. **Tunnel Mode** - Use `--tunnel` if you have complex network/firewall setup

---

## 🆘 STILL STUCK?

### Check Backend API

The mobile app needs the backend API running:

```bash
# In a SEPARATE terminal window
cd "M:\Repo\Farmers Market Platform web and app"
npm run dev
```

Backend should be running on: `http://localhost:3001`

### Check .env File

Make sure `.env` exists with:

```
APP_ENV=development
API_BASE_URL=http://localhost:3001/api
DEBUG_MODE=true
```

For physical device, change to:

```
API_BASE_URL=http://YOUR_COMPUTER_IP:3001/api
```

Find your IP:

```bash
ipconfig
# Look for "IPv4 Address" under your WiFi adapter
```

---

## 🎉 YOU'RE BACK!

Once you see the QR code:

1. Open Expo Go on your phone
2. Scan the QR code
3. Wait 30-60 seconds for first load
4. You'll see the Welcome screen!

**Happy coding!** 🚀🌾

---

**Status:** 🔄 RESTART GUIDE  
**Last Updated:** December 2, 2024  
**Version:** 1.0.0
