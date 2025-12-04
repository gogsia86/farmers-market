# 📱 Farmers Market Mobile App

**A comprehensive React Native mobile application for iOS and Android, providing seamless access to the Farmers Market Platform.**

[![React Native](https://img.shields.io/badge/React%20Native-0.74-61DAFB?logo=react)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-51-000020?logo=expo)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](../LICENSE)

---

## 🎯 Overview

The Farmers Market Mobile App brings the full power of our web platform to iOS and Android devices, providing:

- **Seamless Shopping Experience**: Browse products, manage cart, and checkout with ease
- **Location-Based Discovery**: Find farms near you with GPS integration
- **Real-time Notifications**: Get order updates instantly via push notifications
- **Offline Support**: Browse products and manage cart even without internet
- **Native Performance**: Optimized for mobile with 60fps animations
- **Farmer Tools**: Mobile dashboard for farmers to manage products and orders

---

## 📋 Table of Contents

- [Features](#-features)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Development](#-development)
- [Project Structure](#-project-structure)
- [Configuration](#-configuration)
- [Building](#-building)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Architecture](#-architecture)
- [Contributing](#-contributing)

---

## ✨ Features

### For Customers

- **Product Discovery**
  - Browse products with infinite scroll
  - Advanced search and filtering
  - Category-based browsing
  - Featured products showcase
  - Product image gallery with zoom

- **Shopping Experience**
  - Add to cart with quantity selection
  - Real-time cart synchronization
  - Persistent cart across devices
  - Apply promo codes
  - Saved payment methods
  - Apple Pay / Google Pay support

- **Order Management**
  - Real-time order tracking
  - Order history with details
  - Reorder with one tap
  - Order status notifications
  - Leave reviews and ratings

- **Profile & Settings**
  - Edit profile with photo upload
  - Manage multiple addresses
  - Saved payment methods
  - Notification preferences
  - Order history

### For Farmers

- **Product Management**
  - Create/edit products with camera
  - Upload multiple product images
  - Manage inventory in real-time
  - Set stock alerts
  - Barcode scanning for inventory

- **Order Processing**
  - View incoming orders
  - Update order status
  - Mark orders ready for pickup
  - Customer communication
  - Quick actions for common tasks

- **Business Analytics**
  - Sales dashboard with charts
  - Top-selling products
  - Revenue tracking
  - Customer insights
  - Export reports (PDF)

### Mobile-Specific Features

- **Push Notifications**
  - Order status updates
  - New product alerts
  - Promotional messages
  - Farm announcements

- **Location Services**
  - Find farms near you
  - GPS navigation to farms
  - Delivery tracking on map
  - Distance calculations

- **Camera Integration**
  - Product photo capture
  - Profile picture upload
  - Barcode scanning
  - Document scanning

- **Offline Support**
  - Browse cached products
  - Manage cart offline
  - Auto-sync when online
  - Queue pending actions

---

## 🔧 Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

- **Node.js**: v20.0.0 or higher
- **npm**: v10.0.0 or higher
- **Expo CLI**: Latest version
- **Git**: For version control

### Development Environment

#### For iOS Development:
- **macOS**: Required for iOS development
- **Xcode**: Latest version (15+)
- **iOS Simulator**: Included with Xcode
- **CocoaPods**: `sudo gem install cocoapods`

#### For Android Development:
- **Android Studio**: Latest version
- **Android SDK**: API Level 31+
- **Android Emulator**: Configured in Android Studio
- **Java JDK**: v17 or higher

### Optional but Recommended

- **EAS CLI**: For cloud builds (`npm install -g eas-cli`)
- **Expo Go App**: For testing on physical devices
- **VS Code**: With React Native extensions
- **Flipper**: For debugging (included with React Native)

---

## 📥 Installation

### 1. Clone the Repository

```bash
# Navigate to the project root
cd "Farmers Market Platform web and app"

# The mobile-app folder is already included
cd mobile-app
```

### 2. Install Dependencies

```bash
# Install all npm packages
npm install

# For iOS development (macOS only)
cd ios && pod install && cd ..
```

### 3. Set Up Environment Variables

Create a `.env` file in the `mobile-app` directory:

```bash
# API Configuration
API_BASE_URL=http://localhost:3001/api
API_BASE_URL_PRODUCTION=https://farmersmarket.com/api

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_PUBLISHABLE_KEY_PRODUCTION=pk_live_your_key_here

# Sentry (Optional)
SENTRY_DSN=your_sentry_dsn_here

# Google Maps (Optional)
GOOGLE_MAPS_API_KEY=your_google_maps_key_here

# App Configuration
APP_ENV=development
APP_VERSION=1.0.0
```

### 4. Configure app.json

Update the `app.json` file with your project details:

```json
{
  "expo": {
    "name": "Farmers Market",
    "slug": "farmers-market-mobile",
    "ios": {
      "bundleIdentifier": "com.yourcompany.farmersmarket"
    },
    "android": {
      "package": "com.yourcompany.farmersmarket"
    }
  }
}
```

---

## 🚀 Development

### Start Development Server

```bash
# Start Expo development server
npm start

# Or with specific options
npm run dev
```

### Run on Simulators/Emulators

```bash
# Run on iOS simulator (macOS only)
npm run ios

# Run on Android emulator
npm run android

# Run in web browser (for testing)
npm run web
```

### Run on Physical Device

1. **Install Expo Go** app from App Store or Google Play
2. **Start the dev server**: `npm start`
3. **Scan QR code** with your device camera (iOS) or Expo Go (Android)

### Development Commands

```bash
# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Code formatting
npm run format
npm run format:check

# Clear cache and restart
npm run dev -- --clear
```

---

## 📁 Project Structure

```
mobile-app/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── base/           # Base components (Button, Input, etc.)
│   │   ├── products/       # Product-related components
│   │   ├── cart/           # Cart components
│   │   └── common/         # Common components
│   │
│   ├── screens/            # Screen components
│   │   ├── auth/           # Login, Register, etc.
│   │   ├── home/           # Home screen
│   │   ├── products/       # Product listing, detail
│   │   ├── cart/           # Shopping cart
│   │   ├── checkout/       # Checkout flow
│   │   ├── orders/         # Order history, tracking
│   │   ├── profile/        # User profile
│   │   ├── farms/          # Farm listing, detail
│   │   └── farmer/         # Farmer dashboard
│   │
│   ├── navigation/         # Navigation configuration
│   │   ├── RootNavigator.tsx
│   │   ├── CustomerTabNavigator.tsx
│   │   ├── FarmerTabNavigator.tsx
│   │   └── navigationRef.ts
│   │
│   ├── stores/             # Zustand state management
│   │   ├── authStore.ts    # Authentication state
│   │   ├── cartStore.ts    # Shopping cart state
│   │   └── userStore.ts    # User preferences
│   │
│   ├── services/           # API and external services
│   │   ├── api.ts          # Main API client
│   │   ├── storage.ts      # AsyncStorage wrapper
│   │   └── notifications.ts # Push notifications
│   │
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useCart.ts
│   │   ├── useProducts.ts
│   │   └── useLocation.ts
│   │
│   ├── utils/              # Utility functions
│   │   ├── validation.ts   # Form validation
│   │   ├── formatting.ts   # Data formatting
│   │   ├── constants.ts    # App constants
│   │   └── helpers.ts      # Helper functions
│   │
│   ├── types/              # TypeScript types
│   │   ├── api.types.ts
│   │   ├── navigation.types.ts
│   │   └── models.types.ts
│   │
│   └── config/             # Configuration files
│       ├── theme.ts        # App theme
│       └── config.ts       # App configuration
│
├── assets/                 # Static assets
│   ├── fonts/             # Custom fonts
│   ├── images/            # Images
│   └── icons/             # App icons
│
├── __tests__/             # Test files
│   ├── unit/              # Unit tests
│   ├── integration/       # Integration tests
│   └── e2e/               # End-to-end tests
│
├── .env                   # Environment variables
├── app.json               # Expo configuration
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
├── babel.config.js        # Babel configuration
├── metro.config.js        # Metro bundler config
└── eas.json               # EAS Build configuration
```

---

## ⚙️ Configuration

### TypeScript Configuration

The app uses strict TypeScript with path aliases:

```typescript
// Use path aliases in imports
import Button from '@/components/base/Button';
import { useAuthStore } from '@/stores/authStore';
import apiClient from '@/services/api';
```

### Theme Configuration

Customize the app theme in `src/config/theme.ts`:

```typescript
export const theme = {
  colors: {
    primary: '#10b981',      // Green
    secondary: '#f59e0b',    // Amber
    accent: '#3b82f6',       // Blue
    // ... more colors
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  // ... more theme properties
};
```

### API Configuration

The app automatically selects the correct API endpoint:

- **Development**: `http://localhost:3001/api` (or `http://10.0.2.2:3001/api` for Android)
- **Production**: `https://farmersmarket.com/api`

---

## 🏗️ Building

### Development Build

```bash
# Build for local development
npm run prebuild

# This generates iOS and Android native projects
```

### Production Build with EAS

#### Initial Setup

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo account
eas login

# Configure EAS project
eas build:configure
```

#### Create Production Builds

```bash
# Build for iOS
npm run build:ios

# Build for Android
npm run build:android

# Build for both platforms
npm run build:all
```

### Build Profiles

The `eas.json` file contains build profiles:

- **development**: Development builds with debugging
- **preview**: Internal testing builds
- **production**: App Store/Play Store builds

---

## 🧪 Testing

### Unit Tests

```bash
# Run unit tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

### End-to-End Tests

```bash
# Build app for testing
npm run test:e2e:build:ios
npm run test:e2e:build:android

# Run E2E tests
npm run test:e2e
```

### Test Coverage Goals

- **Unit Tests**: 80%+ coverage
- **Integration Tests**: Critical user flows
- **E2E Tests**: Main user journeys

---

## 🚢 Deployment

### iOS Deployment (App Store)

1. **Build production version**:
   ```bash
   eas build --platform ios --profile production
   ```

2. **Submit to App Store**:
   ```bash
   eas submit --platform ios
   ```

3. **Required**:
   - Apple Developer Account ($99/year)
   - App Store Connect setup
   - App icons and screenshots
   - Privacy policy and terms

### Android Deployment (Google Play)

1. **Build production version**:
   ```bash
   eas build --platform android --profile production
   ```

2. **Submit to Google Play**:
   ```bash
   eas submit --platform android
   ```

3. **Required**:
   - Google Play Developer Account ($25 one-time)
   - Play Console setup
   - App icons and screenshots
   - Privacy policy and terms

### Over-the-Air Updates (OTA)

For quick updates without app store review:

```bash
# Publish update
npm run update

# Users get updates automatically on next launch
```

---

## 🏛️ Architecture

### State Management

- **Zustand**: Global state (auth, cart)
- **React Query**: Server state and caching
- **AsyncStorage**: Persistent local storage
- **SecureStore**: Secure token storage

### Navigation

- **React Navigation**: Native-like navigation
- **Stack Navigator**: Screen transitions
- **Tab Navigator**: Bottom tab navigation
- **Deep Linking**: Handle app links

### API Communication

- **Axios**: HTTP client
- **Interceptors**: Token refresh, error handling
- **Offline Queue**: Queue requests when offline
- **Optimistic Updates**: Instant UI feedback

### Data Flow

```
User Action
    ↓
Component Event
    ↓
Store Action (Zustand)
    ↓
API Call (Axios)
    ↓
Server Response
    ↓
Store Update
    ↓
UI Re-render
```

### Security

- **Token Storage**: Expo SecureStore (encrypted)
- **Biometric Auth**: Face ID / Touch ID / Fingerprint
- **Certificate Pinning**: Prevent MITM attacks
- **Input Validation**: Client-side validation
- **Rate Limiting**: Prevent abuse

---

## 📊 Performance Optimization

### Image Optimization

- **Expo Image**: Fast image loading with caching
- **Progressive Loading**: Blur-up technique
- **Lazy Loading**: Load images on demand
- **WebP Format**: Smaller file sizes

### Bundle Size

- **Code Splitting**: Dynamic imports
- **Tree Shaking**: Remove unused code
- **Asset Optimization**: Compress images
- **Target**: <30MB app size

### Runtime Performance

- **React.memo**: Prevent unnecessary re-renders
- **useMemo/useCallback**: Optimize expensive computations
- **FlatList**: Virtualized lists for performance
- **Target**: 60fps animations

---

## 🐛 Debugging

### React Native Debugger

```bash
# Open debugger
npm start
# Press 'd' in terminal, then select "Debug in Chrome"
```

### Flipper

Flipper is automatically configured for:
- Network inspection
- Layout inspector
- Performance monitoring
- Crash reports

### Logs

```bash
# View iOS logs
npx react-native log-ios

# View Android logs
npx react-native log-android
```

---

## 📚 Documentation

### Additional Resources

- [Development Plan](./MOBILE_APP_DEVELOPMENT_PLAN.md) - Comprehensive 16-week plan
- [API Documentation](../docs/API.md) - Backend API reference
- [Design System](./docs/DESIGN_SYSTEM.md) - UI component library
- [Testing Guide](./docs/TESTING.md) - Testing best practices

### External Links

- [React Native Docs](https://reactnative.dev/)
- [Expo Docs](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Zustand](https://github.com/pmndrs/zustand)
- [React Query](https://tanstack.com/query/latest)

---

## 🤝 Contributing

### Development Workflow

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**:
   - Follow TypeScript best practices
   - Add tests for new features
   - Update documentation

3. **Run quality checks**:
   ```bash
   npm run type-check
   npm run lint:fix
   npm run test
   ```

4. **Commit your changes**:
   ```bash
   git commit -m "feat: add new feature"
   ```

5. **Push and create PR**:
   ```bash
   git push origin feature/your-feature-name
   ```

### Code Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Follow Airbnb style guide
- **Prettier**: Automatic code formatting
- **Naming**: PascalCase for components, camelCase for functions
- **Testing**: Write tests for all business logic

---

## 🔍 Troubleshooting

### Common Issues

#### Metro Bundler Issues
```bash
# Clear cache and restart
npm start -- --reset-cache
```

#### iOS Simulator Issues
```bash
# Reset simulator
xcrun simctl erase all
```

#### Android Emulator Issues
```bash
# Cold boot emulator
# In Android Studio: Tools > AVD Manager > Cold Boot Now
```

#### Node Modules Issues
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

---

## 👥 Team & Support

### Development Team

- **Tech Lead**: [Your Name]
- **Mobile Developers**: [Team Names]
- **UI/UX Designer**: [Designer Name]
- **QA Engineer**: [QA Name]

### Get Help

- **Slack**: #mobile-dev channel
- **Email**: dev@farmersmarket.com
- **Issues**: [GitHub Issues](https://github.com/your-org/farmers-market/issues)

---

## 🎉 Acknowledgments

Special thanks to:
- The Expo team for an amazing development experience
- React Native community for excellent libraries
- All contributors who have helped improve this app

---

**Built with ❤️ by the Farmers Market Team**

Last Updated: December 2025
Version: 1.0.0