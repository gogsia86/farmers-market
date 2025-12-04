# 📱 Mobile App Quick Reference Card

**Keep this handy during development!**

---

## 🚀 Quick Commands

```bash
# Development
npm start                    # Start dev server
npm run ios                  # Run iOS simulator
npm run android              # Run Android emulator
npm run dev                  # Start with cache clear

# Quality
npm run type-check          # Check TypeScript
npm run lint                # Lint code
npm run lint:fix            # Auto-fix linting
npm run format              # Format code
npm test                    # Run tests
npm run test:coverage       # Test with coverage

# Building
npm run build:ios           # Build iOS (EAS)
npm run build:android       # Build Android (EAS)
npm run prebuild            # Generate native projects

# Deployment
npm run update              # Push OTA update
npm run submit:ios          # Submit to App Store
npm run submit:android      # Submit to Google Play
```

---

## 📁 Key File Locations

```
src/
├── services/api.ts              # API client - all endpoints
├── stores/authStore.ts          # Authentication state
├── stores/cartStore.ts          # Shopping cart state
├── navigation/RootNavigator.tsx # Main navigation
├── components/base/             # Reusable UI components
├── screens/                     # All screen components
├── hooks/                       # Custom React hooks
└── utils/                       # Utility functions

Configuration:
├── .env                         # Environment variables
├── app.json                     # Expo configuration
├── tsconfig.json                # TypeScript config
└── package.json                 # Dependencies
```

---

## 🎯 Import Aliases

```typescript
import Button from '@/components/base/Button';
import apiClient from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { formatCurrency } from '@/utils/formatting';
```

---

## 🔐 Authentication

```typescript
// Login
const { login, isAuthenticated, user } = useAuthStore();
await login(email, password);

// Register
const { register } = useAuthStore();
await register({ email, password, name, role });

// Logout
const { logout } = useAuthStore();
await logout();

// Get current user
const { getCurrentUser } = useAuthStore();
await getCurrentUser();

// Check auth status
const isAuthenticated = useIsAuthenticated();
const user = useUser();
const isFarmer = useIsFarmer();
```

---

## 🛒 Shopping Cart

```typescript
// Add item
const { addItem } = useCartStore();
await addItem({
  productId: 'prod_123',
  productName: 'Organic Apples',
  price: 4.99,
  quantity: 2,
  // ... other fields
});

// Update quantity
const { updateQuantity } = useCartStore();
await updateQuantity(itemId, newQuantity);

// Remove item
const { removeItem } = useCartStore();
await removeItem(itemId);

// Get cart data
const items = useCartItems();
const totals = useCartTotals();
const itemCount = useCartItemCount();
const total = useCartTotal();

// Sync with server
const { syncWithServer } = useCartStore();
await syncWithServer();
```

---

## 🌐 API Calls

```typescript
import apiClient from '@/services/api';

// Products
const products = await apiClient.products.getAll({ page: 1, limit: 20 });
const product = await apiClient.products.getById(id);
const results = await apiClient.products.search(query);

// Farms
const farms = await apiClient.farms.getAll();
const farm = await apiClient.farms.getById(id);
const nearby = await apiClient.farms.getNearby(lat, lng, radius);

// Cart
const cart = await apiClient.cart.get();
await apiClient.cart.add(productId, quantity);
await apiClient.cart.update(itemId, quantity);
await apiClient.cart.remove(itemId);

// Orders
const orders = await apiClient.orders.getAll();
const order = await apiClient.orders.getById(id);
await apiClient.orders.create(orderData);
await apiClient.orders.cancel(id);

// User
const profile = await apiClient.user.getProfile();
await apiClient.user.updateProfile(data);
await apiClient.user.uploadAvatar(imageUri);
```

---

## 🧭 Navigation

```typescript
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '@/navigation/RootNavigator';

const navigation = useNavigation();

// Navigate to screen
navigation.navigate('ProductDetail', { productId: '123' });
navigation.navigate('Cart');

// Go back
navigation.goBack();

// Replace current screen
navigation.replace('Login');

// Reset navigation stack
navigation.reset({
  index: 0,
  routes: [{ name: 'Home' }],
});
```

---

## 🎨 Styling

```typescript
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  button: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
});
```

### Theme Colors
```typescript
primary: '#10b981'      // Green
secondary: '#f59e0b'    // Amber
accent: '#3b82f6'       // Blue
success: '#22c55e'      // Green
error: '#ef4444'        // Red
warning: '#f59e0b'      // Amber
```

---

## 📸 Image Handling

```typescript
import * as ImagePicker from 'expo-image-picker';

// Pick from gallery
const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ImagePicker.MediaTypeOptions.Images,
  allowsEditing: true,
  aspect: [4, 3],
  quality: 0.8,
});

if (!result.canceled) {
  const imageUri = result.assets[0].uri;
  await apiClient.upload.image(imageUri, 'products');
}

// Take photo
const photo = await ImagePicker.launchCameraAsync({
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.8,
});
```

---

## 📍 Location

```typescript
import * as Location from 'expo-location';

// Request permissions
const { status } = await Location.requestForegroundPermissionsAsync();

// Get current location
const location = await Location.getCurrentPositionAsync({});
const { latitude, longitude } = location.coords;

// Get nearby farms
const farms = await apiClient.farms.getNearby(latitude, longitude, 50);
```

---

## 🔔 Notifications

```typescript
import * as Notifications from 'expo-notifications';

// Request permissions
const { status } = await Notifications.requestPermissionsAsync();

// Get push token
const token = await Notifications.getExpoPushTokenAsync();
await apiClient.notifications.updatePushToken(token.data);

// Show local notification
await Notifications.scheduleNotificationAsync({
  content: {
    title: "Order Update",
    body: "Your order is on the way!",
  },
  trigger: null,
});
```

---

## 🧪 Testing

```typescript
import { render, fireEvent, waitFor } from '@testing-library/react-native';

describe('LoginScreen', () => {
  it('handles login successfully', async () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.press(getByText('Login'));
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });
});
```

---

## 🐛 Common Issues

### Metro Bundler Won't Start
```bash
npm start -- --reset-cache
rm -rf node_modules/.cache
```

### Module Not Found
```bash
rm -rf node_modules
npm install
```

### TypeScript Errors
```bash
npm run type-check
# Fix errors in editor
```

### Expo Go Won't Connect
```bash
npm start -- --tunnel
# OR ensure devices on same network
```

### Build Fails
```bash
npm run prebuild:clean
npm run prebuild
```

---

## 💡 Best Practices

### ✅ Do's
- Use TypeScript strict mode
- Write tests for business logic
- Handle loading and error states
- Implement offline support
- Test on both iOS and Android
- Use optimistic updates for cart
- Handle network errors gracefully
- Use proper error boundaries

### ❌ Don'ts
- Don't hardcode API URLs
- Don't ignore TypeScript errors
- Don't skip testing on devices
- Don't forget to handle offline state
- Don't commit .env files
- Don't skip accessibility
- Don't forget to sync cart

---

## 📊 Performance Tips

```typescript
// Use React.memo for expensive components
const ProductCard = React.memo(({ product }) => {
  return <View>...</View>;
});

// Use useCallback for event handlers
const handlePress = useCallback(() => {
  navigation.navigate('ProductDetail', { productId });
}, [productId]);

// Use useMemo for expensive calculations
const sortedProducts = useMemo(() => {
  return products.sort((a, b) => a.price - b.price);
}, [products]);

// Optimize FlatList
<FlatList
  data={products}
  renderItem={renderItem}
  keyExtractor={item => item.id}
  removeClippedSubviews
  maxToRenderPerBatch={10}
  windowSize={10}
/>
```

---

## 🔗 Useful Links

- **Docs**: [mobile-app/START_HERE.md](./START_HERE.md)
- **Setup**: [mobile-app/QUICK_START_GUIDE.md](./QUICK_START_GUIDE.md)
- **Tasks**: [mobile-app/IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md)
- **Plan**: [mobile-app/MOBILE_APP_DEVELOPMENT_PLAN.md](./MOBILE_APP_DEVELOPMENT_PLAN.md)

- **React Native**: https://reactnative.dev/
- **Expo**: https://docs.expo.dev/
- **React Navigation**: https://reactnavigation.org/
- **Stripe**: https://stripe.com/docs/mobile

---

## 🆘 Need Help?

1. Check documentation in `mobile-app/` folder
2. Search error message in React Native docs
3. Check Expo documentation
4. Ask in Slack #mobile-dev channel
5. Open GitHub issue

---

**Keep coding! 🚀**

Last Updated: December 2025