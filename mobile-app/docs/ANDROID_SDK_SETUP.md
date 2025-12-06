# Android SDK Setup Guide for Windows

This guide will help you set up the Android SDK and Android Studio so you can run the Farmers Market mobile app on an Android emulator.

## Prerequisites

- Windows 10/11
- At least 8GB RAM (16GB recommended)
- 10GB+ free disk space
- Administrator access

## Step 1: Install Android Studio

1. **Download Android Studio**
   - Visit: https://developer.android.com/studio
   - Click "Download Android Studio"
   - Accept the terms and download the `.exe` file

2. **Run the Installer**
   - Double-click the downloaded `.exe` file
   - Follow the installation wizard
   - Choose "Standard" installation type
   - Select a theme (your preference)
   - Wait for the download of Android SDK components (this may take 15-30 minutes)

3. **Complete Initial Setup**
   - Click "Finish" when installation completes
   - Android Studio will open to the welcome screen

## Step 2: Install Android SDK Components

1. **Open SDK Manager**
   - From Android Studio welcome screen, click "More Actions" → "SDK Manager"
   - Or from top menu: `Tools` → `SDK Manager`

2. **Install Required SDK Platforms**
   - Go to "SDK Platforms" tab
   - Check the following:
     - ✅ Android 14.0 ("UpsideDownCake") - API Level 34
     - ✅ Android 13.0 ("Tiramisu") - API Level 33
     - ✅ Android 12.0 ("S") - API Level 31
   - Click "Apply" and wait for download

3. **Install SDK Tools**
   - Go to "SDK Tools" tab
   - Check "Show Package Details" at bottom right
   - Ensure these are installed:
     - ✅ Android SDK Build-Tools (latest version)
     - ✅ Android SDK Command-line Tools
     - ✅ Android Emulator
     - ✅ Android SDK Platform-Tools
     - ✅ Intel x86 Emulator Accelerator (HAXM installer) - if using Intel CPU
   - Click "Apply" and wait for installation

4. **Note the SDK Location**
   - At the top of SDK Manager, you'll see "Android SDK Location"
   - Default is usually: `C:\Users\YourUsername\AppData\Local\Android\Sdk`
   - **Copy this path** - you'll need it for the next step

## Step 3: Set Environment Variables

1. **Open Environment Variables Settings**
   - Press `Win + X` and select "System"
   - Click "Advanced system settings" on the right
   - Click "Environment Variables..." button at the bottom

2. **Add ANDROID_HOME Variable**
   - Under "User variables", click "New..."
   - Variable name: `ANDROID_HOME`
   - Variable value: Paste the SDK location from Step 2.4 (e.g., `C:\Users\Gogsi\AppData\Local\Android\Sdk`)
   - Click "OK"

3. **Add to PATH**
   - Under "User variables", select "Path" and click "Edit..."
   - Click "New" and add: `%ANDROID_HOME%\platform-tools`
   - Click "New" again and add: `%ANDROID_HOME%\emulator`
   - Click "New" again and add: `%ANDROID_HOME%\tools`
   - Click "New" again and add: `%ANDROID_HOME%\tools\bin`
   - Click "OK" on all windows

4. **Verify Environment Variables**
   - **Close PowerShell completely** (environment variables only load in new sessions)
   - Open a **new PowerShell window**
   - Run: `echo $env:ANDROID_HOME`
   - You should see the SDK path printed
   - Run: `adb --version`
   - You should see ADB version information

## Step 4: Create an Android Virtual Device (AVD)

1. **Open AVD Manager**
   - From Android Studio welcome screen: "More Actions" → "Virtual Device Manager"
   - Or from top menu: `Tools` → `Device Manager`

2. **Create New Device**
   - Click "Create Device" button
   - Select a device definition (recommended: **Pixel 5** or **Pixel 6**)
   - Click "Next"

3. **Select System Image**
   - Select an API level (recommended: **API 33 (Android 13.0)**)
   - If not downloaded, click "Download" next to the system image
   - Wait for download to complete
   - Click "Next"

4. **Configure AVD**
   - Give it a name (e.g., "Pixel_5_API_33")
   - Configure options:
     - Graphics: **Automatic** or **Hardware - GLES 2.0**
     - RAM: **2048 MB** or more
   - Click "Finish"

## Step 5: Test the Setup

1. **Close and reopen PowerShell** (to load new environment variables)

2. **Navigate to mobile app directory**:
   ```powershell
   cd "M:\Repo\Farmers Market Platform web and app\mobile-app"
   ```

3. **Start Expo**:
   ```powershell
   npx expo start
   ```

4. **Press `a`** to open Android emulator
   - The emulator should start automatically
   - The app will install and open in the emulator

## Troubleshooting

### "ANDROID_HOME not found" Error
**Solution**: 
- Make sure you **closed and reopened PowerShell** after setting environment variables
- Verify with: `echo $env:ANDROID_HOME`
- If empty, double-check Step 3

### Emulator is Very Slow
**Solutions**:
- Enable **Hardware Acceleration (HAXM for Intel or WHPX for AMD)**
- Go to Windows Features → Enable "Windows Hypervisor Platform"
- Allocate more RAM to AVD (edit AVD settings in Device Manager)
- Use a lower resolution device (e.g., Pixel 4 instead of Pixel 6 Pro)

### "adb: command not found"
**Solution**:
- Verify PATH includes `%ANDROID_HOME%\platform-tools`
- Restart PowerShell
- Run: `adb --version` to verify

### Emulator Doesn't Connect to Metro Bundler
**Solution**:
- Run in Expo: `npx expo start --localhost`
- Or configure ADB reverse: `adb reverse tcp:8081 tcp:8081`

### HAXM Installation Fails
**Solution**:
- If using AMD CPU, you can't use HAXM - use Windows Hypervisor Platform instead
- Enable virtualization in BIOS
- Disable Hyper-V if HAXM installation fails:
  ```powershell
  bcdedit /set hypervisorlaunchtype off
  ```
  Then restart computer

### "License Not Accepted" Errors
**Solution**:
```powershell
cd $env:ANDROID_HOME\tools\bin
./sdkmanager --licenses
```
Accept all licenses by typing `y`

## Alternative: Use Physical Device (Easier!)

If the emulator setup is too complex or your computer struggles with emulation:

1. **Install Expo Go** app from Google Play Store
2. **Enable USB Debugging** on your Android phone:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times to enable Developer Options
   - Go to Settings → Developer Options
   - Enable "USB Debugging"
3. **Connect phone via USB**
4. **Run**: `npx expo start`
5. **Press `a`** - the app will install directly on your phone

Or simply **scan the QR code** in Expo Go without USB connection!

## Quick Reference Commands

```powershell
# Check Android SDK path
echo $env:ANDROID_HOME

# Check ADB version
adb --version

# List connected devices
adb devices

# List available emulators
emulator -list-avds

# Start specific emulator manually
emulator -avd Pixel_5_API_33

# Check if Expo sees Android SDK
npx expo doctor
```

## Resources

- [Android Studio Documentation](https://developer.android.com/studio/intro)
- [Expo Android Development](https://docs.expo.dev/workflow/android-studio-emulator/)
- [React Native Environment Setup](https://reactnative.dev/docs/environment-setup)

---

**Need Help?** If you encounter issues not covered here, check the project's troubleshooting documentation or reach out to the development team.