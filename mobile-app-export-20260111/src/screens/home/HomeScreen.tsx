/**
 * 🏠 HOME SCREEN - Farmers Market Mobile App
 *
 * Main landing screen with:
 * - Featured products carousel
 * - Nearby farms section
 * - Categories quick access
 * - Seasonal highlights
 * - Quick actions (cart, orders, profile)
 *
 * @reference Agricultural consciousness patterns
 */

import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { theme } from "../../theme";
import { useAuthStore } from "../../stores/authStore";
import { useCartStore } from "../../stores/cartStore";
import apiClient from "../../services/api";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ========================================
// 🎯 TYPES
// ========================================

interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  image: string;
  farmName: string;
  isOrganic: boolean;
  isSeasonal: boolean;
}

interface Farm {
  id: string;
  name: string;
  image: string;
  distance: string;
  rating: number;
  productCount: number;
  isVerified: boolean;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
}

// ========================================
// 📦 CONSTANTS
// ========================================

const CATEGORIES: Category[] = [
  { id: "vegetables", name: "Vegetables", icon: "🥬", count: 0 },
  { id: "fruits", name: "Fruits", icon: "🍎", count: 0 },
  { id: "dairy", name: "Dairy", icon: "🥛", count: 0 },
  { id: "meat", name: "Meat", icon: "🥩", count: 0 },
  { id: "eggs", name: "Eggs", icon: "🥚", count: 0 },
  { id: "honey", name: "Honey", icon: "🍯", count: 0 },
  { id: "baked", name: "Baked", icon: "🍞", count: 0 },
  { id: "herbs", name: "Herbs", icon: "🌿", count: 0 },
];

const SEASONAL_BANNERS = {
  SPRING: {
    emoji: "🌱",
    message: "Fresh spring greens are in season!",
    color: theme.colors.seasonal.spring.primary,
  },
  SUMMER: {
    emoji: "☀️",
    message: "Summer berries & stone fruits available!",
    color: theme.colors.seasonal.summer.primary,
  },
  FALL: {
    emoji: "🍂",
    message: "Harvest season - pumpkins & squash!",
    color: theme.colors.seasonal.fall.primary,
  },
  WINTER: {
    emoji: "❄️",
    message: "Winter root vegetables & preserves!",
    color: theme.colors.seasonal.winter.primary,
  },
};

// ========================================
// 🎨 SUB-COMPONENTS
// ========================================

const HeaderSection = ({
  userName,
  cartItemCount,
  onCartPress,
  onProfilePress,
}: {
  userName: string;
  cartItemCount: number;
  onCartPress: () => void;
  onProfilePress: () => void;
}) => (
  <View style={styles.header}>
    <TouchableOpacity onPress={onProfilePress} style={styles.profileButton}>
      <View style={styles.avatarContainer}>
        <Text style={styles.avatarText}>👤</Text>
      </View>
      <View style={styles.greetingContainer}>
        <Text style={styles.greetingText}>Hello,</Text>
        <Text style={styles.userName}>{userName || "Guest"}</Text>
      </View>
    </TouchableOpacity>

    <TouchableOpacity onPress={onCartPress} style={styles.cartButton}>
      <Text style={styles.cartIcon}>🛒</Text>
      {cartItemCount > 0 && (
        <View style={styles.cartBadge}>
          <Text style={styles.cartBadgeText}>
            {cartItemCount > 99 ? "99+" : cartItemCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  </View>
);

const SearchBar = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity
    style={styles.searchBar}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={styles.searchIcon}>🔍</Text>
    <Text style={styles.searchPlaceholder}>Search products, farms...</Text>
  </TouchableOpacity>
);

const SeasonalBanner = ({
  season,
}: {
  season: keyof typeof SEASONAL_BANNERS;
}) => {
  const banner = SEASONAL_BANNERS[season];
  return (
    <View style={[styles.seasonalBanner, { backgroundColor: banner.color }]}>
      <Text style={styles.seasonalEmoji}>{banner.emoji}</Text>
      <Text style={styles.seasonalText}>{banner.message}</Text>
    </View>
  );
};

const CategoryItem = ({
  category,
  onPress,
}: {
  category: Category;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={styles.categoryItem}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.categoryIconContainer}>
      <Text style={styles.categoryIcon}>{category.icon}</Text>
    </View>
    <Text style={styles.categoryName}>{category.name}</Text>
  </TouchableOpacity>
);

const ProductCard = ({
  product,
  onPress,
  onAddToCart,
}: {
  product: Product;
  onPress: () => void;
  onAddToCart: () => void;
}) => (
  <TouchableOpacity
    style={styles.productCard}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={styles.productImageContainer}>
      {product.image ? (
        <Image source={{ uri: product.image }} style={styles.productImage} />
      ) : (
        <View style={styles.productImagePlaceholder}>
          <Text style={styles.productImagePlaceholderText}>🥬</Text>
        </View>
      )}

      {/* Badges */}
      <View style={styles.productBadges}>
        {product.isOrganic && (
          <View style={styles.organicBadge}>
            <Text style={styles.badgeText}>Organic</Text>
          </View>
        )}
        {product.isSeasonal && (
          <View style={styles.seasonalBadge}>
            <Text style={styles.badgeText}>Seasonal</Text>
          </View>
        )}
      </View>
    </View>

    <View style={styles.productInfo}>
      <Text style={styles.productName} numberOfLines={2}>
        {product.name}
      </Text>
      <Text style={styles.productFarm}>{product.farmName}</Text>
      <View style={styles.productPriceRow}>
        <Text style={styles.productPrice}>
          ${product.price.toFixed(2)}/{product.unit}
        </Text>
        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={(e) => {
            e.stopPropagation();
            onAddToCart();
          }}
        >
          <Text style={styles.addToCartIcon}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  </TouchableOpacity>
);

const FarmCard = ({ farm, onPress }: { farm: Farm; onPress: () => void }) => (
  <TouchableOpacity
    style={styles.farmCard}
    onPress={onPress}
    activeOpacity={0.8}
  >
    {farm.image ? (
      <Image source={{ uri: farm.image }} style={styles.farmImage} />
    ) : (
      <View style={styles.farmImagePlaceholder}>
        <Text style={styles.farmImagePlaceholderText}>🌾</Text>
      </View>
    )}

    <View style={styles.farmInfo}>
      <View style={styles.farmNameRow}>
        <Text style={styles.farmName} numberOfLines={1}>
          {farm.name}
        </Text>
        {farm.isVerified && <Text style={styles.verifiedBadge}>✓</Text>}
      </View>
      <Text style={styles.farmDistance}>📍 {farm.distance}</Text>
      <View style={styles.farmStats}>
        <Text style={styles.farmRating}>⭐ {farm.rating.toFixed(1)}</Text>
        <Text style={styles.farmProducts}>{farm.productCount} products</Text>
      </View>
    </View>
  </TouchableOpacity>
);

const SectionHeader = ({
  title,
  onSeeAll,
}: {
  title: string;
  onSeeAll?: () => void;
}) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {onSeeAll && (
      <TouchableOpacity onPress={onSeeAll}>
        <Text style={styles.seeAllText}>See All →</Text>
      </TouchableOpacity>
    )}
  </View>
);

const QuickActions = ({
  onOrdersPress,
  onFavoritesPress,
  onDealsPress,
}: {
  onOrdersPress: () => void;
  onFavoritesPress: () => void;
  onDealsPress: () => void;
}) => (
  <View style={styles.quickActions}>
    <TouchableOpacity style={styles.quickActionItem} onPress={onOrdersPress}>
      <View
        style={[
          styles.quickActionIcon,
          { backgroundColor: theme.colors.primary[100] },
        ]}
      >
        <Text style={styles.quickActionEmoji}>📦</Text>
      </View>
      <Text style={styles.quickActionText}>My Orders</Text>
    </TouchableOpacity>

    <TouchableOpacity style={styles.quickActionItem} onPress={onFavoritesPress}>
      <View
        style={[
          styles.quickActionIcon,
          { backgroundColor: theme.colors.error.light },
        ]}
      >
        <Text style={styles.quickActionEmoji}>❤️</Text>
      </View>
      <Text style={styles.quickActionText}>Favorites</Text>
    </TouchableOpacity>

    <TouchableOpacity style={styles.quickActionItem} onPress={onDealsPress}>
      <View
        style={[
          styles.quickActionIcon,
          { backgroundColor: theme.colors.secondary[100] },
        ]}
      >
        <Text style={styles.quickActionEmoji}>🏷️</Text>
      </View>
      <Text style={styles.quickActionText}>Deals</Text>
    </TouchableOpacity>
  </View>
);

const LoadingState = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={theme.colors.primary[500]} />
    <Text style={styles.loadingText}>Loading fresh products...</Text>
  </View>
);

const ErrorState = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) => (
  <View style={styles.errorContainer}>
    <Text style={styles.errorEmoji}>😕</Text>
    <Text style={styles.errorText}>{message}</Text>
    <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
      <Text style={styles.retryButtonText}>Try Again</Text>
    </TouchableOpacity>
  </View>
);

// ========================================
// 🏠 MAIN COMPONENT
// ========================================

export const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const { items: cartItems, addItem } = useCartStore();

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [nearbyFarms, setNearbyFarms] = useState<Farm[]>([]);
  const [currentSeason, setCurrentSeason] =
    useState<keyof typeof SEASONAL_BANNERS>("SUMMER");

  // ========================================
  // 🔄 DATA FETCHING
  // ========================================

  const fetchHomeData = useCallback(async () => {
    try {
      setError(null);

      // Fetch featured products and nearby farms in parallel
      const [productsResponse, farmsResponse] = await Promise.all([
        apiClient.products.getFeatured(),
        apiClient.farms.getAll({ limit: 5 }),
      ]);

      // Transform products data
      const products: Product[] = (productsResponse.data || []).map(
        (p: any) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          unit: p.unit || "each",
          image: p.images?.[0] || "",
          farmName: p.farm?.name || "Local Farm",
          isOrganic: p.organic || false,
          isSeasonal: p.seasonal || false,
        }),
      );

      // Transform farms data
      const farms: Farm[] = (farmsResponse.data || []).map((f: any) => ({
        id: f.id,
        name: f.name,
        image: f.photos?.[0]?.url || "",
        distance: f.distance || "5 miles",
        rating: f.averageRating || 4.5,
        productCount: f.productCount || 0,
        isVerified: f.isVerified || false,
      }));

      setFeaturedProducts(products);
      setNearbyFarms(farms);

      // Determine current season
      const month = new Date().getMonth();
      if (month >= 2 && month <= 4) setCurrentSeason("SPRING");
      else if (month >= 5 && month <= 7) setCurrentSeason("SUMMER");
      else if (month >= 8 && month <= 10) setCurrentSeason("FALL");
      else setCurrentSeason("WINTER");
    } catch (err: any) {
      console.error("❌ Failed to fetch home data:", err);
      setError(err.message || "Failed to load content");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHomeData();
  }, [fetchHomeData]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchHomeData();
  }, [fetchHomeData]);

  // ========================================
  // 🎯 HANDLERS
  // ========================================

  const handleCartPress = () => {
    navigation.navigate("Cart");
  };

  const handleProfilePress = () => {
    navigation.navigate("Profile");
  };

  const handleSearchPress = () => {
    navigation.navigate("Search");
  };

  const handleCategoryPress = (categoryId: string) => {
    navigation.navigate("Products", { category: categoryId });
  };

  const handleProductPress = (productId: string) => {
    navigation.navigate("ProductDetail", { productId });
  };

  const handleAddToCart = async (product: Product) => {
    try {
      await addItem({
        productId: product.id,
        productName: product.name,
        productImage: product.image,
        price: product.price,
        quantity: 1,
        unit: product.unit,
        farmId: "",
        farmName: product.farmName,
        stock: 100, // Default
      });
      console.log("✅ Added to cart:", product.name);
    } catch (err) {
      console.error("❌ Failed to add to cart:", err);
    }
  };

  const handleFarmPress = (farmId: string) => {
    navigation.navigate("FarmDetail", { farmId });
  };

  const handleSeeAllProducts = () => {
    navigation.navigate("Products");
  };

  const handleSeeAllFarms = () => {
    navigation.navigate("Farms");
  };

  const handleOrdersPress = () => {
    navigation.navigate("Orders");
  };

  const handleFavoritesPress = () => {
    navigation.navigate("Favorites");
  };

  const handleDealsPress = () => {
    navigation.navigate("Deals");
  };

  // ========================================
  // 🎨 RENDER
  // ========================================

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingState />
      </SafeAreaView>
    );
  }

  if (error && featuredProducts.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorState message={error} onRetry={fetchHomeData} />
      </SafeAreaView>
    );
  }

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary[500]}
            colors={[theme.colors.primary[500]]}
          />
        }
      >
        {/* Header */}
        <HeaderSection
          userName={user?.name || ""}
          cartItemCount={cartItemCount}
          onCartPress={handleCartPress}
          onProfilePress={handleProfilePress}
        />

        {/* Search Bar */}
        <SearchBar onPress={handleSearchPress} />

        {/* Seasonal Banner */}
        <SeasonalBanner season={currentSeason} />

        {/* Quick Actions */}
        <QuickActions
          onOrdersPress={handleOrdersPress}
          onFavoritesPress={handleFavoritesPress}
          onDealsPress={handleDealsPress}
        />

        {/* Categories */}
        <View style={styles.section}>
          <SectionHeader title="Categories" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {CATEGORIES.map((category) => (
              <CategoryItem
                key={category.id}
                category={category}
                onPress={() => handleCategoryPress(category.id)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Featured Products */}
        <View style={styles.section}>
          <SectionHeader
            title="🌟 Featured Products"
            onSeeAll={handleSeeAllProducts}
          />
          <FlatList
            horizontal
            data={featuredProducts}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productsContainer}
            renderItem={({ item }) => (
              <ProductCard
                product={item}
                onPress={() => handleProductPress(item.id)}
                onAddToCart={() => handleAddToCart(item)}
              />
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No featured products yet</Text>
              </View>
            }
          />
        </View>

        {/* Nearby Farms */}
        <View style={styles.section}>
          <SectionHeader
            title="🌾 Farms Near You"
            onSeeAll={handleSeeAllFarms}
          />
          {nearbyFarms.map((farm) => (
            <FarmCard
              key={farm.id}
              farm={farm}
              onPress={() => handleFarmPress(farm.id)}
            />
          ))}
          {nearbyFarms.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No farms found nearby</Text>
            </View>
          )}
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

// ========================================
// 💅 STYLES
// ========================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: theme.spacing[8],
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
  },

  profileButton: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary[100],
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: {
    fontSize: 24,
  },

  greetingContainer: {
    marginLeft: theme.spacing[3],
  },

  greetingText: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.secondary,
  },

  userName: {
    ...theme.typography.styles.h5,
    color: theme.colors.text.primary,
  },

  cartButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.background.secondary,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },

  cartIcon: {
    fontSize: 24,
  },

  cartBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.error.main,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },

  cartBadgeText: {
    color: theme.colors.text.inverse,
    fontSize: 11,
    fontWeight: "700",
  },

  // Search Bar
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: theme.spacing[4],
    marginVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },

  searchIcon: {
    fontSize: 18,
    marginRight: theme.spacing[2],
  },

  searchPlaceholder: {
    ...theme.typography.styles.body1,
    color: theme.colors.text.tertiary,
  },

  // Seasonal Banner
  seasonalBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: theme.spacing[4],
    marginBottom: theme.spacing[4],
    padding: theme.spacing[4],
    borderRadius: theme.borderRadius.lg,
  },

  seasonalEmoji: {
    fontSize: 28,
    marginRight: theme.spacing[3],
  },

  seasonalText: {
    flex: 1,
    ...theme.typography.styles.body1,
    color: theme.colors.text.inverse,
    fontWeight: "600",
  },

  // Quick Actions
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: theme.spacing[4],
    marginBottom: theme.spacing[4],
  },

  quickActionItem: {
    alignItems: "center",
  },

  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing[2],
  },

  quickActionEmoji: {
    fontSize: 24,
  },

  quickActionText: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.secondary,
    fontWeight: "500",
  },

  // Section
  section: {
    marginBottom: theme.spacing[6],
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing[4],
    marginBottom: theme.spacing[3],
  },

  sectionTitle: {
    ...theme.typography.styles.h4,
    color: theme.colors.text.primary,
  },

  seeAllText: {
    ...theme.typography.styles.body2,
    color: theme.colors.primary[500],
    fontWeight: "600",
  },

  // Categories
  categoriesContainer: {
    paddingHorizontal: theme.spacing[4],
    gap: theme.spacing[3],
  },

  categoryItem: {
    alignItems: "center",
    marginRight: theme.spacing[4],
  },

  categoryIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.background.secondary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing[2],
    ...theme.shadows.sm,
  },

  categoryIcon: {
    fontSize: 32,
  },

  categoryName: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.secondary,
    fontWeight: "500",
  },

  // Products
  productsContainer: {
    paddingHorizontal: theme.spacing[4],
  },

  productCard: {
    width: (SCREEN_WIDTH - theme.spacing[4] * 3) / 2,
    marginRight: theme.spacing[3],
    backgroundColor: theme.colors.surface.primary,
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden",
    ...theme.shadows.sm,
  },

  productImageContainer: {
    position: "relative",
    width: "100%",
    height: 120,
  },

  productImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  productImagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: theme.colors.background.secondary,
    justifyContent: "center",
    alignItems: "center",
  },

  productImagePlaceholderText: {
    fontSize: 40,
  },

  productBadges: {
    position: "absolute",
    top: theme.spacing[2],
    left: theme.spacing[2],
    flexDirection: "row",
    gap: theme.spacing[1],
  },

  organicBadge: {
    backgroundColor: theme.colors.agricultural.organic,
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[1],
    borderRadius: theme.borderRadius.sm,
  },

  seasonalBadge: {
    backgroundColor: theme.colors.secondary[400],
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[1],
    borderRadius: theme.borderRadius.sm,
  },

  badgeText: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.inverse,
    fontWeight: "600",
    fontSize: 10,
  },

  productInfo: {
    padding: theme.spacing[3],
  },

  productName: {
    ...theme.typography.styles.body2,
    color: theme.colors.text.primary,
    fontWeight: "600",
    marginBottom: theme.spacing[1],
  },

  productFarm: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing[2],
  },

  productPriceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  productPrice: {
    ...theme.typography.styles.body1,
    color: theme.colors.primary[600],
    fontWeight: "700",
  },

  addToCartButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary[500],
    justifyContent: "center",
    alignItems: "center",
  },

  addToCartIcon: {
    color: theme.colors.text.inverse,
    fontSize: 18,
    fontWeight: "700",
  },

  // Farms
  farmCard: {
    flexDirection: "row",
    marginHorizontal: theme.spacing[4],
    marginBottom: theme.spacing[3],
    backgroundColor: theme.colors.surface.primary,
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden",
    ...theme.shadows.sm,
  },

  farmImage: {
    width: 100,
    height: 100,
    resizeMode: "cover",
  },

  farmImagePlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: theme.colors.background.secondary,
    justifyContent: "center",
    alignItems: "center",
  },

  farmImagePlaceholderText: {
    fontSize: 40,
  },

  farmInfo: {
    flex: 1,
    padding: theme.spacing[3],
    justifyContent: "center",
  },

  farmNameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing[1],
  },

  farmName: {
    ...theme.typography.styles.body1,
    color: theme.colors.text.primary,
    fontWeight: "600",
    flex: 1,
  },

  verifiedBadge: {
    color: theme.colors.primary[500],
    fontSize: 14,
    marginLeft: theme.spacing[1],
  },

  farmDistance: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing[2],
  },

  farmStats: {
    flexDirection: "row",
    alignItems: "center",
  },

  farmRating: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.secondary,
    marginRight: theme.spacing[3],
  },

  farmProducts: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.tertiary,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    ...theme.typography.styles.body1,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing[4],
  },

  // Error
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing[6],
  },

  errorEmoji: {
    fontSize: 64,
    marginBottom: theme.spacing[4],
  },

  errorText: {
    ...theme.typography.styles.body1,
    color: theme.colors.text.secondary,
    textAlign: "center",
    marginBottom: theme.spacing[4],
  },

  retryButton: {
    paddingHorizontal: theme.spacing[6],
    paddingVertical: theme.spacing[3],
    backgroundColor: theme.colors.primary[500],
    borderRadius: theme.borderRadius.md,
  },

  retryButtonText: {
    ...theme.typography.styles.body1,
    color: theme.colors.text.inverse,
    fontWeight: "600",
  },

  // Empty State
  emptyContainer: {
    padding: theme.spacing[6],
    alignItems: "center",
  },

  emptyText: {
    ...theme.typography.styles.body2,
    color: theme.colors.text.tertiary,
  },

  bottomSpacing: {
    height: theme.spacing[8],
  },
});

// ========================================
// 📦 EXPORTS
// ========================================

export default HomeScreen;
