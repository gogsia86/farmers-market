# 🚀 Mobile App Quick Start Guide

**Get the Farmers Market Mobile App up and running in 30 minutes!**

---

## ⚡ Quick Setup (30 Minutes)

### Step 1: Install Required Tools (10 min)

```bash
# Install Node.js (if not already installed)
# Download from: https://nodejs.org/ (v20+)

# Install Expo CLI globally
npm install -g expo-cli eas-cli

# Verify installations
node --version    # Should be v20+
npm --version     # Should be v10+
expo --version    # Should be latest
```

### Step 2: Initialize the Project (5 min)

```bash
# Navigate to mobile-app directory
cd "Farmers Market Platform web and app/mobile-app"

# Install all dependencies
npm install

# This will take 3-5 minutes
```

### Step 3: Configure Environment (5 min)

Create `.env` file in `mobile-app/` directory:

```bash
# Copy this configuration
API_BASE_URL=http://localhost:3001/api
STRIPE_PUBLISHABLE_KEY=pk_test_51234567890
APP_ENV=development
```

### Step 4: Start Development (10 min)

```bash
# Start the Metro bundler
npm start

# In a new terminal, start the web platform API
cd ..
npm run dev

# Scan QR code with Expo Go app on your phone
# OR press 'i' for iOS simulator
# OR press 'a' for Android emulator
```

**🎉 You're now running the mobile app!**

---

## 📱 Test the App Immediately

### Quick Test Checklist

1. **View Home Screen** ✅
   - Should see "Welcome to Farmers Market"
   - Browse featured products

2. **Test Authentication** ✅
   - Tap "Login"
   - Use test credentials: `test@example.com` / `password123`
   - Should redirect to main app

3. **Browse Products** ✅
   - Scroll through product list
   - Tap on a product to view details
   - Images should load

4. **Add to Cart** ✅
   - Tap "Add to Cart" on any product
   - Cart icon should show badge with count
   - View cart screen

5. **Test Offline Mode** ✅
   - Enable airplane mode on device
   - Browse products (from cache)
   - Add items to cart
   - Disable airplane mode
   - Items should sync automatically

---

## 🛠️ Development Workflow

### Daily Development

```bash
# Morning routine
npm start                    # Start dev server
npm run type-check          # Check for type errors
npm run lint               # Check code quality

# During development
# Edit files in src/
# Changes auto-reload on device

# Before committing
npm run format             # Format code
npm test                   # Run tests
git add .
git commit -m "feat: your feature"
```

### Common Commands

```bash
# Development
npm start                  # Start Expo dev server
npm run dev               # Same as start
npm run ios               # Run on iOS simulator
npm run android           # Run on Android emulator

# Quality
npm run type-check        # TypeScript check
npm run lint              # Lint code
npm run lint:fix          # Auto-fix linting issues
npm run format            # Format with Prettier
npm test                  # Run tests
npm run test:coverage     # Test with coverage

# Building
npm run build:ios         # Build iOS app (EAS)
npm run build:android     # Build Android app (EAS)
npm run build:all         # Build both platforms

# Deployment
npm run update            # Push OTA update
```

---

## 📂 Where to Start Coding

### Add Your First Feature (Example: New Screen)

1. **Create Screen Component**
   ```typescript
   // src/screens/example/ExampleScreen.tsx
   import React from 'react';
   import { View, Text, StyleSheet } from 'react-native';

   export default function ExampleScreen() {
     return (
       <View style={styles.container}>
         <Text style={styles.title}>Example Screen</Text>
       </View>
     );
   }

   const styles = StyleSheet.create({
     container: {
       flex: 1,
       justifyContent: 'center',
       alignItems: 'center',
     },
     title: {
       fontSize: 24,
       fontWeight: 'bold',
     },
   });
   ```

2. **Add Route to Navigator**
   ```typescript
   // src/navigation/RootNavigator.tsx
   import ExampleScreen from '@/screens/example/ExampleScreen';

   // Add to Stack.Screen list
   <Stack.Screen name="Example" component={ExampleScreen} />
   ```

3. **Navigate to Screen**
   ```typescript
   // From any component
   import { useNavigation } from '@react-navigation/native';

   const navigation = useNavigation();
   navigation.navigate('Example');
   ```

### Add API Endpoint

```typescript
// src/services/api.ts

// Add new endpoint group
myFeature = {
  getData: async () => {
    const response = await this.axiosInstance.get('/my-feature');
    return response.data;
  },

  createItem: async (data: any) => {
    const response = await this.axiosInstance.post('/my-feature', data);
    return response.data;
  },
};
```

### Add State Management

```typescript
// src/stores/myFeatureStore.ts
import { create } from 'zustand';

interface MyFeatureState {
  data: any[];
  isLoading: boolean;
  fetchData: () => Promise<void>;
}

export const useMyFeatureStore = create<MyFeatureState>((set) => ({
  data: [],
  isLoading: false,

  fetchData: async () => {
    set({ isLoading: true });
    try {
      const data = await apiClient.myFeature.getData();
      set({ data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
    }
  },
}));
```

---

## 🎯 Implementation Priorities

### Week 1: Core Screens (Must-Have)

- [x] App structure setup
- [x] Navigation configured
- [x] API client created
- [x] Authentication store
- [x] Cart store
- [ ] **LOGIN SCREEN** - Start here!
  - Create `src/screens/auth/LoginScreen.tsx`
  - Form with email/password
  - Connect to auth store
  - Handle login errors

- [ ] **REGISTER SCREEN**
  - Create `src/screens/auth/RegisterScreen.tsx`
  - Form with name, email, password, role
  - Connect to auth store

- [ ] **HOME SCREEN**
  - Create `src/screens/home/HomeScreen.tsx`
  - Featured products section
  - Categories grid
  - Search bar

- [ ] **PRODUCT LIST SCREEN**
  - Create `src/screens/products/ProductListScreen.tsx`
  - FlatList with products
  - Infinite scroll
  - Pull to refresh

- [ ] **PRODUCT DETAIL SCREEN**
  - Create `src/screens/products/ProductDetailScreen.tsx`
  - Image gallery
  - Product info
  - Add to cart button

### Week 2: Shopping Flow

- [ ] **CART SCREEN**
  - Item list with quantities
  - Update/remove items
  - Price summary
  - Checkout button

- [ ] **CHECKOUT SCREEN**
  - Shipping address selection
  - Payment method selection
  - Order summary
  - Place order button

- [ ] **ORDER SUCCESS SCREEN**
  - Confirmation message
  - Order details
  - Track order button

### Week 3: User Profile

- [ ] **PROFILE SCREEN**
  - User info display
  - Settings options
  - Logout button

- [ ] **ORDER HISTORY SCREEN**
  - Past orders list
  - Order status
  - Reorder option

- [ ] **EDIT PROFILE SCREEN**
  - Form to update user info
  - Photo upload
  - Save changes

### Week 4: Farmer Features

- [ ] **FARMER DASHBOARD**
  - Sales overview
  - Quick stats
  - Recent orders

- [ ] **PRODUCT MANAGEMENT**
  - Product list
  - Add/edit products
  - Camera integration

---

## 🧩 Copy-Paste Components

### Button Component
```typescript
// src/components/base/Button.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  disabled?: boolean;
}

export default function Button({ 
  title, 
  onPress, 
  variant = 'primary', 
  loading = false,
  disabled = false 
}: ButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[variant],
        (disabled || loading) && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: '#10b981',
  },
  secondary: {
    backgroundColor: '#f59e0b',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#10b981',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

### Input Component
```typescript
// src/components/base/Input.tsx
import React from 'react';
import { TextInput, View, Text, StyleSheet } from 'react-native';

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: string;
}

export default function Input({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  error,
}: InputProps) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error && styles.inputError]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        placeholderTextColor="#9ca3af"
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#374151',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  error: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
});
```

---

## 🐛 Common Issues & Fixes

### Issue: "Cannot connect to Metro"
```bash
# Fix: Clear cache and restart
npm start -- --reset-cache
```

### Issue: "Module not found"
```bash
# Fix: Reinstall dependencies
rm -rf node_modules
npm install
```

### Issue: "Build failed"
```bash
# Fix: Clean and rebuild
npm run prebuild:clean
npm run prebuild
```

### Issue: "Expo Go won't connect"
```bash
# Fix: Make sure devices are on same network
# OR use tunnel mode
npm start -- --tunnel
```

### Issue: "Type errors"
```bash
# Fix: Regenerate types
npm run type-check
# Check the error messages and fix accordingly
```

---

## 📞 Getting Help

### Resources

1. **Documentation**
   - [Full Development Plan](./MOBILE_APP_DEVELOPMENT_PLAN.md)
   - [Detailed README](./README.md)
   - [Web Platform Docs](../README.md)

2. **External Docs**
   - [React Native Docs](https://reactnative.dev/)
   - [Expo Docs](https://docs.expo.dev/)
   - [React Navigation](https://reactnavigation.org/)

3. **Community**
   - React Native Discord
   - Stack Overflow
   - GitHub Issues

### Contact

- **Team Slack**: #mobile-dev
- **Email**: dev@farmersmarket.com
- **GitHub**: Open an issue

---

## ✅ Success Checklist

Before considering Phase 1 complete:

- [ ] App runs on iOS simulator
- [ ] App runs on Android emulator
- [ ] App runs on physical device (via Expo Go)
- [ ] Login/Register works
- [ ] Can browse products
- [ ] Can add to cart
- [ ] Cart syncs across app
- [ ] Can view product details
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Tests passing (when added)

---

## 🎓 Learning Path

### New to React Native?

1. **Day 1**: Complete [React Native Tutorial](https://reactnative.dev/docs/tutorial)
2. **Day 2**: Learn [React Navigation basics](https://reactnavigation.org/docs/getting-started)
3. **Day 3**: Understand [Expo workflow](https://docs.expo.dev/workflow/overview/)
4. **Day 4**: Study [TypeScript with React Native](https://reactnative.dev/docs/typescript)
5. **Day 5**: Start building features!

### Key Concepts to Master

- **Components**: Building blocks of UI
- **State Management**: Zustand for global state
- **Navigation**: Stack, Tab, Modal navigators
- **API Calls**: Axios + React Query
- **Styling**: StyleSheet, flexbox
- **Hooks**: useState, useEffect, custom hooks
- **TypeScript**: Types, interfaces, generics

---

## 🚀 Next Steps

1. **Get it running** (Today)
   - Follow Steps 1-4 above
   - See the app on your device

2. **Build login screen** (This week)
   - Start with authentication
   - Most critical feature

3. **Add product browsing** (Next week)
   - Core shopping experience
   - Connect to real API

4. **Implement cart** (Week 3)
   - Shopping cart functionality
   - Sync with server

5. **Polish & test** (Week 4)
   - Add animations
   - Handle edge cases
   - Write tests

---

**🎉 Ready to build something amazing? Let's get started!**

Questions? Check the [Full Development Plan](./MOBILE_APP_DEVELOPMENT_PLAN.md) or reach out to the team.

**Last Updated**: December 2025  
**Version**: 1.0.0