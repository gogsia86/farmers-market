/**
 * 📦 PRODUCT LIST SCREEN - Farmers Market Mobile App
 *
 * Comprehensive product browsing with:
 * - Category filtering
 * - Search functionality
 * - Sorting options
 * - Pagination/infinite scroll
 * - Pull to refresh
 * - Add to cart functionality
 *
 * @reference Agricultural consciousness patterns
 */

import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Modal,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { theme } from "../../theme";
import { useCartStore } from "../../stores/cartStore";
import apiClient from "../../services/api";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PRODUCTS_PER_PAGE = 20;

// ========================================
// 🎯 TYPES
// ========================================

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  image: string;
  farmId: string;
  farmName: string;
  category: string;
  isOrganic: boolean;
  isSeasonal: boolean;
  inStock: boolean;
  stock: number;
}

interface FilterState {
  category: string | null;
  isOrganic: boolean | null;
  isSeasonal: boolean | null;
  minPrice: number | null;
  maxPrice: number | null;
  inStock: boolean;
}

type SortOption = "name" | "price_low" | "price_high" | "newest";

// ========================================
// 📦 CONSTANTS
// ========================================

const CATEGORIES = [
  { id: "all", name: "All", icon: "🛒" },
  { id: "VEGETABLES", name: "Vegetables", icon: "🥬" },
  { id: "FRUITS", name: "Fruits", icon: "🍎" },
  { id: "DAIRY", name: "Dairy", icon: "🥛" },
  { id: "MEAT", name: "Meat", icon: "🥩" },
  { id: "EGGS", name: "Eggs", icon: "🥚" },
  { id: "HONEY", name: "Honey", icon: "🍯" },
  { id: "BAKED_GOODS", name: "Baked", icon: "🍞" },
  { id: "HERBS", name: "Herbs", icon: "🌿" },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "name", label: "Name (A-Z)" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
];

const DEFAULT_FILTERS: FilterState = {
  category: null,
  isOrganic: null,
  isSeasonal: null,
  minPrice: null,
  maxPrice: null,
  inStock: true,
};

// ========================================
// 🎨 SUB-COMPONENTS
// ========================================

const SearchHeader = ({
  searchQuery,
  onSearchChange,
  onFilterPress,
  onSortPress,
  activeFiltersCount,
}: {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onFilterPress: () => void;
  onSortPress: () => void;
  activeFiltersCount: number;
}) => (
  <View style={styles.searchHeader}>
    <View style={styles.searchInputContainer}>
      <Text style={styles.searchIcon}>🔍</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Search products..."
        placeholderTextColor={theme.colors.text.tertiary}
        value={searchQuery}
        onChangeText={onSearchChange}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {searchQuery.length > 0 && (
        <TouchableOpacity onPress={() => onSearchChange("")}>
          <Text style={styles.clearIcon}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
    <View style={styles.searchActions}>
      <TouchableOpacity style={styles.filterButton} onPress={onFilterPress}>
        <Text style={styles.filterIcon}>⚙️</Text>
        {activeFiltersCount > 0 && (
          <View style={styles.filterBadge}>
            <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
          </View>
        )}
      </TouchableOpacity>
      <TouchableOpacity style={styles.sortButton} onPress={onSortPress}>
        <Text style={styles.sortIcon}>↕️</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const CategoryTabs = ({
  selectedCategory,
  onSelectCategory,
}: {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}) => (
  <FlatList
    horizontal
    data={CATEGORIES}
    keyExtractor={(item) => item.id}
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.categoryTabsContainer}
    renderItem={({ item }) => {
      const isSelected =
        item.id === "all" ? !selectedCategory : selectedCategory === item.id;
      return (
        <TouchableOpacity
          style={[styles.categoryTab, isSelected && styles.categoryTabSelected]}
          onPress={() => onSelectCategory(item.id === "all" ? null : item.id)}
        >
          <Text style={styles.categoryTabIcon}>{item.icon}</Text>
          <Text
            style={[
              styles.categoryTabText,
              isSelected && styles.categoryTabTextSelected,
            ]}
          >
            {item.name}
          </Text>
        </TouchableOpacity>
      );
    }}
  />
);

const ProductCard = ({
  product,
  onPress,
  onAddToCart,
  isInCart,
}: {
  product: Product;
  onPress: () => void;
  onAddToCart: () => void;
  isInCart: boolean;
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

      {/* Out of Stock Overlay */}
      {!product.inStock && (
        <View style={styles.outOfStockOverlay}>
          <Text style={styles.outOfStockText}>Out of Stock</Text>
        </View>
      )}
    </View>

    <View style={styles.productInfo}>
      <Text style={styles.productName} numberOfLines={2}>
        {product.name}
      </Text>
      <Text style={styles.productFarm} numberOfLines={1}>
        {product.farmName}
      </Text>
      <View style={styles.productPriceRow}>
        <Text style={styles.productPrice}>
          ${product.price.toFixed(2)}/{product.unit}
        </Text>
        {product.inStock && (
          <TouchableOpacity
            style={[
              styles.addToCartButton,
              isInCart && styles.addToCartButtonInCart,
            ]}
            onPress={(e) => {
              e.stopPropagation();
              onAddToCart();
            }}
          >
            <Text style={styles.addToCartIcon}>{isInCart ? "✓" : "+"}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  </TouchableOpacity>
);

const FilterModal = ({
  visible,
  filters,
  onFiltersChange,
  onClose,
  onReset,
}: {
  visible: boolean;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClose: () => void;
  onReset: () => void;
}) => (
  <Modal visible={visible} animationType="slide" transparent>
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Filters</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.modalCloseIcon}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Product Type</Text>
          <View style={styles.filterOptions}>
            <TouchableOpacity
              style={[
                styles.filterOption,
                filters.isOrganic === true && styles.filterOptionSelected,
              ]}
              onPress={() =>
                onFiltersChange({
                  ...filters,
                  isOrganic: filters.isOrganic === true ? null : true,
                })
              }
            >
              <Text style={styles.filterOptionText}>🌱 Organic Only</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterOption,
                filters.isSeasonal === true && styles.filterOptionSelected,
              ]}
              onPress={() =>
                onFiltersChange({
                  ...filters,
                  isSeasonal: filters.isSeasonal === true ? null : true,
                })
              }
            >
              <Text style={styles.filterOptionText}>🌸 Seasonal</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Availability</Text>
          <TouchableOpacity
            style={[
              styles.filterOption,
              filters.inStock && styles.filterOptionSelected,
            ]}
            onPress={() =>
              onFiltersChange({ ...filters, inStock: !filters.inStock })
            }
          >
            <Text style={styles.filterOptionText}>In Stock Only</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Price Range</Text>
          <View style={styles.priceInputs}>
            <TextInput
              style={styles.priceInput}
              placeholder="Min"
              placeholderTextColor={theme.colors.text.tertiary}
              keyboardType="numeric"
              value={filters.minPrice?.toString() || ""}
              onChangeText={(text) =>
                onFiltersChange({
                  ...filters,
                  minPrice: text ? parseFloat(text) : null,
                })
              }
            />
            <Text style={styles.priceInputSeparator}>-</Text>
            <TextInput
              style={styles.priceInput}
              placeholder="Max"
              placeholderTextColor={theme.colors.text.tertiary}
              keyboardType="numeric"
              value={filters.maxPrice?.toString() || ""}
              onChangeText={(text) =>
                onFiltersChange({
                  ...filters,
                  maxPrice: text ? parseFloat(text) : null,
                })
              }
            />
          </View>
        </View>

        <View style={styles.modalActions}>
          <TouchableOpacity style={styles.resetButton} onPress={onReset}>
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyButton} onPress={onClose}>
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

const SortModal = ({
  visible,
  selectedSort,
  onSelectSort,
  onClose,
}: {
  visible: boolean;
  selectedSort: SortOption;
  onSelectSort: (sort: SortOption) => void;
  onClose: () => void;
}) => (
  <Modal visible={visible} animationType="fade" transparent>
    <TouchableOpacity
      style={styles.modalOverlay}
      activeOpacity={1}
      onPress={onClose}
    >
      <View style={styles.sortModalContent}>
        <Text style={styles.sortModalTitle}>Sort By</Text>
        {SORT_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.sortOption,
              selectedSort === option.value && styles.sortOptionSelected,
            ]}
            onPress={() => {
              onSelectSort(option.value);
              onClose();
            }}
          >
            <Text
              style={[
                styles.sortOptionText,
                selectedSort === option.value && styles.sortOptionTextSelected,
              ]}
            >
              {option.label}
            </Text>
            {selectedSort === option.value && (
              <Text style={styles.sortOptionCheck}>✓</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </TouchableOpacity>
  </Modal>
);

const EmptyState = ({ searchQuery }: { searchQuery: string }) => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyEmoji}>🥬</Text>
    <Text style={styles.emptyTitle}>No Products Found</Text>
    <Text style={styles.emptyText}>
      {searchQuery
        ? `No results for "${searchQuery}". Try a different search term.`
        : "No products match your filters. Try adjusting your criteria."}
    </Text>
  </View>
);

const LoadingState = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={theme.colors.primary[500]} />
    <Text style={styles.loadingText}>Loading fresh products...</Text>
  </View>
);

// ========================================
// 📦 MAIN COMPONENT
// ========================================

export const ProductListScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { items: cartItems, addItem, isProductInCart } = useCartStore();

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    ...DEFAULT_FILTERS,
    category: route.params?.category || null,
  });
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);

  // ========================================
  // 🔄 DATA FETCHING
  // ========================================

  const fetchProducts = useCallback(
    async (pageNum: number = 1, refresh: boolean = false) => {
      try {
        if (refresh) {
          setIsRefreshing(true);
        } else if (pageNum === 1) {
          setIsLoading(true);
        } else {
          setIsLoadingMore(true);
        }

        // Build query params
        const params: any = {
          page: pageNum,
          limit: PRODUCTS_PER_PAGE,
          sortBy:
            sortBy === "name"
              ? "name"
              : sortBy === "newest"
                ? "createdAt"
                : "price",
          sortOrder:
            sortBy === "price_high"
              ? "desc"
              : sortBy === "newest"
                ? "desc"
                : "asc",
        };

        if (searchQuery) params.searchTerm = searchQuery;
        if (filters.category) params.category = filters.category;
        if (filters.isOrganic) params.organic = true;
        if (filters.isSeasonal) params.seasonal = true;
        if (filters.inStock) params.inStock = true;
        if (filters.minPrice) params.minPrice = filters.minPrice;
        if (filters.maxPrice) params.maxPrice = filters.maxPrice;

        const response = await apiClient.products.getAll(params);

        const fetchedProducts: Product[] = (response.data || []).map(
          (p: any) => ({
            id: p.id,
            name: p.name,
            description: p.description || "",
            price: p.price,
            unit: p.unit || "each",
            image: p.images?.[0] || "",
            farmId: p.farmId,
            farmName: p.farm?.name || "Local Farm",
            category: p.category,
            isOrganic: p.organic || false,
            isSeasonal: p.seasonal || false,
            inStock: p.inStock !== false,
            stock: p.quantityAvailable || 0,
          }),
        );

        if (pageNum === 1) {
          setProducts(fetchedProducts);
        } else {
          setProducts((prev) => [...prev, ...fetchedProducts]);
        }

        setHasMore(fetchedProducts.length === PRODUCTS_PER_PAGE);
        setPage(pageNum);
      } catch (error) {
        console.error("❌ Failed to fetch products:", error);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
        setIsLoadingMore(false);
      }
    },
    [searchQuery, filters, sortBy],
  );

  useEffect(() => {
    fetchProducts(1);
  }, [fetchProducts]);

  // Update category from route params
  useEffect(() => {
    if (route.params?.category) {
      setFilters((prev) => ({ ...prev, category: route.params.category }));
    }
  }, [route.params?.category]);

  // ========================================
  // 🎯 HANDLERS
  // ========================================

  const handleRefresh = () => {
    fetchProducts(1, true);
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      fetchProducts(page + 1);
    }
  };

  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  const handleCategorySelect = (category: string | null) => {
    setFilters((prev) => ({ ...prev, category }));
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
        farmId: product.farmId,
        farmName: product.farmName,
        stock: product.stock,
      });
      console.log("✅ Added to cart:", product.name);
    } catch (error) {
      console.error("❌ Failed to add to cart:", error);
    }
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  // ========================================
  // 📊 COMPUTED VALUES
  // ========================================

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.isOrganic) count++;
    if (filters.isSeasonal) count++;
    if (!filters.inStock) count++;
    if (filters.minPrice) count++;
    if (filters.maxPrice) count++;
    return count;
  }, [filters]);

  // ========================================
  // 🎨 RENDER
  // ========================================

  const renderProduct = ({ item }: { item: Product }) => (
    <ProductCard
      product={item}
      onPress={() => handleProductPress(item.id)}
      onAddToCart={() => handleAddToCart(item)}
      isInCart={isProductInCart(item.id)}
    />
  );

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.loadingMoreContainer}>
        <ActivityIndicator size="small" color={theme.colors.primary[500]} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Products</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("Cart")}
          style={styles.cartButton}
        >
          <Text style={styles.cartIcon}>🛒</Text>
          {cartItems.length > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>
                {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search & Filters */}
      <SearchHeader
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onFilterPress={() => setShowFilterModal(true)}
        onSortPress={() => setShowSortModal(true)}
        activeFiltersCount={activeFiltersCount}
      />

      {/* Category Tabs */}
      <CategoryTabs
        selectedCategory={filters.category}
        onSelectCategory={handleCategorySelect}
      />

      {/* Products List */}
      {isLoading ? (
        <LoadingState />
      ) : products.length === 0 ? (
        <EmptyState searchQuery={searchQuery} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderProduct}
          numColumns={2}
          columnWrapperStyle={styles.productRow}
          contentContainerStyle={styles.productList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary[500]}
              colors={[theme.colors.primary[500]]}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
        />
      )}

      {/* Modals */}
      <FilterModal
        visible={showFilterModal}
        filters={filters}
        onFiltersChange={setFilters}
        onClose={() => setShowFilterModal(false)}
        onReset={handleResetFilters}
      />

      <SortModal
        visible={showSortModal}
        selectedSort={sortBy}
        onSelectSort={setSortBy}
        onClose={() => setShowSortModal(false)}
      />
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

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },

  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  backIcon: {
    fontSize: 24,
    color: theme.colors.text.primary,
  },

  headerTitle: {
    ...theme.typography.styles.h4,
    color: theme.colors.text.primary,
  },

  cartButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },

  cartIcon: {
    fontSize: 22,
  },

  cartBadge: {
    position: "absolute",
    top: 2,
    right: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.colors.error.main,
    justifyContent: "center",
    alignItems: "center",
  },

  cartBadgeText: {
    color: theme.colors.text.inverse,
    fontSize: 10,
    fontWeight: "700",
  },

  // Search Header
  searchHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    gap: theme.spacing[2],
  },

  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing[3],
    height: 44,
  },

  searchIcon: {
    fontSize: 16,
    marginRight: theme.spacing[2],
  },

  searchInput: {
    flex: 1,
    ...theme.typography.styles.body1,
    color: theme.colors.text.primary,
  },

  clearIcon: {
    fontSize: 16,
    color: theme.colors.text.tertiary,
    padding: theme.spacing[1],
  },

  searchActions: {
    flexDirection: "row",
    gap: theme.spacing[2],
  },

  filterButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    position: "relative",
  },

  filterIcon: {
    fontSize: 18,
  },

  filterBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.primary[500],
    justifyContent: "center",
    alignItems: "center",
  },

  filterBadgeText: {
    color: theme.colors.text.inverse,
    fontSize: 10,
    fontWeight: "700",
  },

  sortButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
  },

  sortIcon: {
    fontSize: 18,
  },

  // Category Tabs
  categoryTabsContainer: {
    paddingHorizontal: theme.spacing[4],
    paddingBottom: theme.spacing[3],
  },

  categoryTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
    marginRight: theme.spacing[2],
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },

  categoryTabSelected: {
    backgroundColor: theme.colors.primary[500],
    borderColor: theme.colors.primary[500],
  },

  categoryTabIcon: {
    fontSize: 16,
    marginRight: theme.spacing[1],
  },

  categoryTabText: {
    ...theme.typography.styles.body2,
    color: theme.colors.text.secondary,
  },

  categoryTabTextSelected: {
    color: theme.colors.text.inverse,
    fontWeight: "600",
  },

  // Product List
  productList: {
    paddingHorizontal: theme.spacing[4],
    paddingBottom: theme.spacing[8],
  },

  productRow: {
    justifyContent: "space-between",
    marginBottom: theme.spacing[4],
  },

  // Product Card
  productCard: {
    width: (SCREEN_WIDTH - theme.spacing[4] * 3) / 2,
    backgroundColor: theme.colors.surface.primary,
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden",
    ...theme.shadows.sm,
  },

  productImageContainer: {
    position: "relative",
    width: "100%",
    height: 130,
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
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },

  seasonalBadge: {
    backgroundColor: theme.colors.secondary[400],
    paddingHorizontal: theme.spacing[2],
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },

  badgeText: {
    color: theme.colors.text.inverse,
    fontSize: 10,
    fontWeight: "600",
  },

  outOfStockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  outOfStockText: {
    color: theme.colors.text.inverse,
    fontWeight: "700",
    fontSize: 12,
  },

  productInfo: {
    padding: theme.spacing[3],
  },

  productName: {
    ...theme.typography.styles.body2,
    color: theme.colors.text.primary,
    fontWeight: "600",
    marginBottom: 2,
    minHeight: 36,
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

  addToCartButtonInCart: {
    backgroundColor: theme.colors.success.main,
  },

  addToCartIcon: {
    color: theme.colors.text.inverse,
    fontSize: 16,
    fontWeight: "700",
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

  loadingMoreContainer: {
    paddingVertical: theme.spacing[4],
    alignItems: "center",
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing[8],
  },

  emptyEmoji: {
    fontSize: 64,
    marginBottom: theme.spacing[4],
  },

  emptyTitle: {
    ...theme.typography.styles.h4,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  },

  emptyText: {
    ...theme.typography.styles.body1,
    color: theme.colors.text.secondary,
    textAlign: "center",
  },

  // Modal Overlay
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },

  // Filter Modal
  modalContent: {
    backgroundColor: theme.colors.background.primary,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    padding: theme.spacing[6],
    maxHeight: "80%",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing[6],
  },

  modalTitle: {
    ...theme.typography.styles.h4,
    color: theme.colors.text.primary,
  },

  modalCloseIcon: {
    fontSize: 24,
    color: theme.colors.text.secondary,
  },

  filterSection: {
    marginBottom: theme.spacing[6],
  },

  filterLabel: {
    ...theme.typography.styles.label,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[3],
  },

  filterOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing[2],
  },

  filterOption: {
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.secondary,
    borderWidth: 1,
    borderColor: theme.colors.border.main,
  },

  filterOptionSelected: {
    backgroundColor: theme.colors.primary[100],
    borderColor: theme.colors.primary[500],
  },

  filterOptionText: {
    ...theme.typography.styles.body2,
    color: theme.colors.text.primary,
  },

  priceInputs: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[2],
  },

  priceInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: theme.colors.border.main,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing[3],
    ...theme.typography.styles.body1,
    color: theme.colors.text.primary,
  },

  priceInputSeparator: {
    ...theme.typography.styles.body1,
    color: theme.colors.text.tertiary,
  },

  modalActions: {
    flexDirection: "row",
    gap: theme.spacing[3],
    marginTop: theme.spacing[4],
  },

  resetButton: {
    flex: 1,
    paddingVertical: theme.spacing[4],
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background.secondary,
    alignItems: "center",
  },

  resetButtonText: {
    ...theme.typography.styles.body1,
    color: theme.colors.text.secondary,
    fontWeight: "600",
  },

  applyButton: {
    flex: 2,
    paddingVertical: theme.spacing[4],
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary[500],
    alignItems: "center",
  },

  applyButtonText: {
    ...theme.typography.styles.body1,
    color: theme.colors.text.inverse,
    fontWeight: "600",
  },

  // Sort Modal
  sortModalContent: {
    backgroundColor: theme.colors.background.primary,
    marginHorizontal: theme.spacing[4],
    marginBottom: theme.spacing[8],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[4],
  },

  sortModalTitle: {
    ...theme.typography.styles.h5,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[4],
    textAlign: "center",
  },

  sortOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },

  sortOptionSelected: {
    backgroundColor: theme.colors.primary[50],
  },

  sortOptionText: {
    ...theme.typography.styles.body1,
    color: theme.colors.text.primary,
  },

  sortOptionTextSelected: {
    color: theme.colors.primary[600],
    fontWeight: "600",
  },

  sortOptionCheck: {
    color: theme.colors.primary[500],
    fontSize: 18,
    fontWeight: "700",
  },
});

// ========================================
// 📦 EXPORTS
// ========================================

export default ProductListScreen;
