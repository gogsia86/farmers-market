# 🚀 START DEVELOPMENT - Immediate Action Plan

> **You're reading this because you want to START CODING RIGHT NOW!**

This document provides the **fastest path** from zero to coding. Follow these steps in order.

---

## ⚡ QUICK START (5 Minutes)

### Step 1: Install Dependencies (2 min)

```bash
# Navigate to mobile app directory
cd "Farmers Market Platform web and app/mobile-app"

# Install all packages
npm install

# Expected output: "added XXX packages in XXs"
```

### Step 2: Create Environment File (1 min)

```bash
# Copy template
cp .env.example .env

# Open in editor
code .env
# or: nano .env
# or: notepad .env
```

**Minimal configuration needed:**

```bash
# In .env file, set ONLY these for now:
APP_ENV=development
API_BASE_URL=http://localhost:3001/api
DEBUG_MODE=true
VERBOSE_LOGGING=true
```

### Step 3: Start Backend API (2 min)

**Open a NEW terminal window:**

```bash
# Navigate to project root
cd "Farmers Market Platform web and app"

# Start the backend
npm run dev

# Wait for: "Ready on http://localhost:3001"
```

**Keep this terminal running!**

### Step 4: Start Mobile App

**Back in the mobile-app terminal:**

```bash
npm start

# You'll see QR code and options:
# Press 'i' for iOS simulator
# Press 'a' for Android emulator
# Or scan QR with Expo Go app
```

✅ **Done! App should be running.**

---

## 🎯 YOUR FIRST TASK - Authentication Screens

### What We're Building First

1. **Login Screen** - User authentication
2. **Register Screen** - New user signup
3. **Welcome Screen** - Onboarding flow

### File Structure to Create

```
src/
├── screens/
│   ├── auth/
│   │   ├── LoginScreen.tsx          ← Start here
│   │   ├── RegisterScreen.tsx       ← Then this
│   │   ├── WelcomeScreen.tsx        ← Then this
│   │   └── ForgotPasswordScreen.tsx ← Finally this
│   │
│   └── home/
│       └── HomeScreen.tsx            ← Placeholder
│
└── components/
    └── ui/
        ├── Button.tsx                 ✅ Already created
        ├── Input.tsx                  ← Create next
        ├── Card.tsx                   ← Create next
        └── LoadingSpinner.tsx         ← Create next
```

---

## 📝 Implementation Order (First Week)

### Day 1: Base UI Components (Today!)

**Priority 1: Input Component** (30 min)

- Text input with label
- Error states
- Password visibility toggle
- Form validation support

**Priority 2: Card Component** (15 min)

- Container for content
- Shadow and elevation
- Padding variants

**Priority 3: LoadingSpinner** (10 min)

- Activity indicator wrapper
- Full-screen overlay option

### Day 2: Authentication Screens

**Morning: Login Screen** (2-3 hours)

- Email + Password inputs
- Remember me checkbox
- Login button with loading state
- Forgot password link
- Register link
- Form validation
- API integration with authStore

**Afternoon: Register Screen** (2-3 hours)

- Full name input
- Email input
- Password input with strength indicator
- Confirm password
- Terms acceptance checkbox
- Register button
- Form validation
- API integration

### Day 3: Welcome & Navigation

**Morning: Welcome Screen** (1-2 hours)

- Splash/intro carousel
- Get Started button
- Skip option

**Afternoon: Navigation Setup** (2 hours)

- Stack navigator configuration
- Auth flow vs Main flow
- Conditional navigation based on auth state
- Deep linking basics

### Day 4: Testing & Polish

- Write component tests
- Test authentication flow end-to-end
- Fix bugs
- Polish UI/UX
- Add error handling

### Day 5: Product Browsing (Next Feature)

- Product list screen
- Product detail screen
- Search functionality
- Filter UI

---

## 🏗️ Code Templates - Copy & Start

### Template 1: Input Component

**File:** `src/components/ui/Input.tsx`

```typescript
import React, { useState } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { theme } from '../../theme';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: any;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  containerStyle,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={[
        styles.inputContainer,
        isFocused && styles.inputContainerFocused,
        error && styles.inputContainerError,
      ]}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        <TextInput
          style={[styles.input, style]}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor={theme.colors.text.tertiary}
          {...props}
        />

        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing[4],
  },
  label: {
    ...theme.typography.styles.label,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
    borderWidth: 1,
    borderColor: theme.colors.border.main,
    borderRadius: theme.borderRadius.base,
    paddingHorizontal: theme.spacing[3],
    minHeight: 48,
  },
  inputContainerFocused: {
    borderColor: theme.colors.border.focus,
    backgroundColor: theme.colors.background.primary,
  },
  inputContainerError: {
    borderColor: theme.colors.error.main,
  },
  input: {
    flex: 1,
    ...theme.typography.styles.body1,
    color: theme.colors.text.primary,
    paddingVertical: theme.spacing[3],
  },
  leftIcon: {
    marginRight: theme.spacing[2],
  },
  rightIcon: {
    marginLeft: theme.spacing[2],
  },
  error: {
    ...theme.typography.styles.caption,
    color: theme.colors.error.main,
    marginTop: theme.spacing[1],
  },
});

export default Input;
```

### Template 2: Login Screen (Basic Structure)

**File:** `src/screens/auth/LoginScreen.tsx`

```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { theme } from '../../theme';
import { useAuthStore } from '../../stores/authStore';

export const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const { login, isLoading } = useAuthStore();

  const validateForm = () => {
    const newErrors: any = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      await login(email, password);
      // Navigation handled by auth state change
    } catch (error: any) {
      Alert.alert(
        'Login Failed',
        error.message || 'Invalid credentials. Please try again.'
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>🌾 Welcome Back</Text>
            <Text style={styles.subtitle}>
              Log in to access your farmers market
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={errors.email}
            />

            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              error={errors.password}
              rightIcon={
                <Text onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? '🙈' : '👁️'}
                </Text>
              }
            />

            <Button
              onPress={handleLogin}
              loading={isLoading}
              disabled={isLoading}
              fullWidth
              size="lg"
            >
              Log In
            </Button>

            <Button
              variant="ghost"
              onPress={() => navigation.navigate('ForgotPassword')}
              fullWidth
            >
              Forgot Password?
            </Button>
          </View>

          {/* Register Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Don't have an account?{' '}
              <Text
                style={styles.footerLink}
                onPress={() => navigation.navigate('Register')}
              >
                Sign Up
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: theme.spacing[6],
    justifyContent: 'center',
  },
  header: {
    marginBottom: theme.spacing[8],
    alignItems: 'center',
  },
  title: {
    ...theme.typography.styles.h2,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  },
  subtitle: {
    ...theme.typography.styles.body1,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  form: {
    marginBottom: theme.spacing[6],
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    ...theme.typography.styles.body2,
    color: theme.colors.text.secondary,
  },
  footerLink: {
    color: theme.colors.primary[500],
    fontWeight: theme.typography.fontWeight.semibold,
  },
});

export default LoginScreen;
```

---

## 🐛 Debug Checklist

If something doesn't work, check these in order:

### 1. Dependencies Issue

```bash
rm -rf node_modules package-lock.json
npm install
```

### 2. Metro Cache Issue

```bash
npm start -- --clear
```

### 3. Backend Not Running

```bash
# In separate terminal
cd "Farmers Market Platform web and app"
npm run dev
```

### 4. Environment Variables

```bash
# Check .env exists
ls -la .env

# Verify API_BASE_URL is correct
cat .env | grep API_BASE_URL
```

### 5. Simulator/Emulator Issue

- Restart simulator/emulator
- Close and reopen Expo Go app
- Press 'r' in terminal to reload

### 6. TypeScript Errors

```bash
npm run type-check
# Fix reported errors
```

---

## 📊 Progress Tracker

Track your implementation progress:

### Week 1: Foundation ✅

- [x] Environment setup
- [x] Dependencies installed
- [x] Backend running
- [x] App launches
- [ ] Input component created
- [ ] Login screen implemented
- [ ] Register screen implemented
- [ ] Authentication flow working

### Week 2: Core Features

- [ ] Product list screen
- [ ] Product detail screen
- [ ] Search functionality
- [ ] Cart implementation
- [ ] Checkout flow (basic)

### Week 3: Farmer Features

- [ ] Farm profile screen
- [ ] Product management
- [ ] Order management
- [ ] Inventory tracking

### Week 4: Polish & Testing

- [ ] Unit tests (>80% coverage)
- [ ] Integration tests
- [ ] E2E tests (critical paths)
- [ ] Performance optimization
- [ ] Bug fixes

---

## 🎯 Success Criteria - Day 1

By end of today, you should have:

✅ App running on simulator/device
✅ Input component created and tested
✅ Button component working (already done)
✅ Login screen UI complete
✅ Can type in inputs
✅ Form validation working
✅ No console errors

---

## 🆘 Getting Stuck?

### Quick Fixes

**"Can't find module..."**

```bash
npm install
npm start -- --clear
```

**"Network request failed"**

- Check backend is running
- Verify API_BASE_URL in .env
- Try http://10.0.2.2:3001/api for Android

**"Undefined is not an object"**

- Check import paths
- Ensure all files are saved
- Restart Metro bundler

**"Type error..."**

- Run: `npm run type-check`
- Fix reported errors
- Restart TypeScript server in IDE

### Still Stuck?

1. **Check logs:**
   - Expo terminal
   - Backend terminal
   - Device/simulator logs

2. **Search documentation:**
   - GETTING_STARTED.md
   - QUICK_REFERENCE.md
   - Expo docs

3. **Ask for help:**
   - Provide error message
   - Share code snippet
   - Describe what you tried

---

## 🚀 You're Ready!

**Time to code:** Start with creating the Input component (template above).

**Commands to have running:**

Terminal 1:

```bash
cd "Farmers Market Platform web and app"
npm run dev
```

Terminal 2:

```bash
cd "Farmers Market Platform web and app/mobile-app"
npm start
```

**Open your IDE:**

```bash
code "Farmers Market Platform web and app/mobile-app"
```

**Create first file:**

```bash
touch src/components/ui/Input.tsx
```

---

## 🎉 Let's Build!

You have everything you need to start building the Farmers Market mobile app.

Remember:

- **Start small** - One component at a time
- **Test often** - Reload and verify after each change
- **Ask questions** - Better to ask than waste time
- **Have fun** - You're building something awesome! 🌾

**Happy coding! 🚀**

---

**Next file to read:** `QUICK_REFERENCE.md` for code patterns

**Version:** 1.0.0
**Last Updated:** November 2024
