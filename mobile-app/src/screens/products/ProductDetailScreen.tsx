/**
 * 🛍️ PRODUCT DETAIL SCREEN - Divine Agricultural Product View
 *
 * Comprehensive product detail view with:
 * - Image gallery with zoom
 * - Product information and pricing
 * - Add to cart functionality
 * - Farm information
 * - Reviews and ratings
 * - Related products
 * - Seasonal and freshness indicators
 *
 * @reference .github/instructions/10_AGRICULTURAL_FEATURE_PATTERNS.instructions.md
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList,
  ActivityIndicator,
  Alert,
  Share,
  Animated,
  Platform,
  StatusBar,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCartStore } from "@/stores/cartStore";
import apiClient from "@/services/api";
import { colors, spacing, typography, shadows, borderRadius } from "@/theme";

// ============================================
// TYPE DEFINITIONS
// ============================================

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const IMAGE_HEIGHT = SCREEN_HEIGHT * 0.45;

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  images: string[];
  farmId: string;
  farmName: string;
  farmImage?: string;
  category: string;
  isOrganic: boolean;
  isSeasonal: boolean;
  inStock: boolean;
  stock: number;
  rating: number;
  reviewCount: number;
  harvestDate?: string;
  freshnessDays?: number;
  tags?: string[];
  nutritionInfo?: {
    calories?: number;
    protein?: string;
    carbs?: string;
    fat?: string;
    fiber?: string;
  };
}

interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
  helpful: number;
}

interface RelatedProduct {
  id: string;
  name: string;
  price: number;
  unit: string;
  image: string;
  farmName: string;
  isOrganic: boolean;
}

type RootStackParamList = {
  ProductDetail: { productId: string };
  FarmDetail: { farmId: string };
  Cart: undefined;
  ProductList: { category?: string };
  WriteReview: { productId: string };
};

type ProductDetailRouteProp = RouteProp<RootStackParamList, "ProductDetail">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// ============================================
// SUB-COMPONENTS
// ============================================

/**
 * Image Gallery with pagination dots
 */
const ImageGallery: React.FC<{
  images: string[];
  onImagePress?: () => void;
}> = ({ images, onImagePress }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleScroll = useCallback((event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / SCREEN_WIDTH);
    setActiveIndex(index);
  }, []);

  const displayImages = images.length > 0 ? images : [""];

  return (
    <View style={styles.galleryContainer}>
      <FlatList
        ref={flatListRef}
        data={displayImages}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        keyExtractor={(_, index) => `image-${index}`}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={onImagePress}
            style={styles.imageWrapper}
          >
            {item ? (
              <Image source={{ uri: item }} style={styles.productImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imagePlaceholderText}>🥬</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      />

      {/* Pagination Dots */}
      {displayImages.length > 1 && (
        <View style={styles.paginationContainer}>
          {displayImages.map((_, index) => (
            <View
              key={`dot-${index}`}
              style={[
                styles.paginationDot,
                activeIndex === index && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

/**
 * Badge component for organic/seasonal indicators
 */
const ProductBadge: React.FC<{
  type: "organic" | "seasonal" | "fresh" | "local";
  style?: any;
}> = ({ type, style }) => {
  const badges = {
    organic: { label: "Organic", emoji: "🌿", color: colors.success.main },
    seasonal: { label: "Seasonal", emoji: "🌸", color: colors.primary[500] },
    fresh: { label: "Fresh", emoji: "✨", color: colors.accent[500] },
    local: { label: "Local", emoji: "📍", color: colors.secondary[400] },
  };

  const badge = badges[type];

  return (
    <View style={[styles.badge, { backgroundColor: badge.color }, style]}>
      <Text style={styles.badgeText}>
        {badge.emoji} {badge.label}
      </Text>
    </View>
  );
};

/**
 * Quantity Selector Component
 */
const QuantitySelector: React.FC<{
  quantity: number;
  maxQuantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
}> = ({ quantity, maxQuantity, onIncrease, onDecrease }) => {
  return (
    <View style={styles.quantitySelector}>
      <TouchableOpacity
        style={[
          styles.quantityButton,
          quantity <= 1 && styles.quantityButtonDisabled,
        ]}
        onPress={onDecrease}
        disabled={quantity <= 1}
      >
        <Text
          style={[
            styles.quantityButtonText,
            quantity <= 1 && styles.quantityButtonTextDisabled,
          ]}
        >
          −
        </Text>
      </TouchableOpacity>
      <View style={styles.quantityDisplay}>
        <Text style={styles.quantityText}>{quantity}</Text>
      </View>
      <TouchableOpacity
        style={[
          styles.quantityButton,
          quantity >= maxQuantity && styles.quantityButtonDisabled,
        ]}
        onPress={onIncrease}
        disabled={quantity >= maxQuantity}
      >
        <Text
          style={[
            styles.quantityButtonText,
            quantity >= maxQuantity && styles.quantityButtonTextDisabled,
          ]}
        >
          +
        </Text>
      </TouchableOpacity>
    </View>
  );
};

/**
 * Star Rating Display
 */
const StarRating: React.FC<{
  rating: number;
  size?: number;
  showCount?: boolean;
  count?: number;
}> = ({ rating, size = 16, showCount = false, count = 0 }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <View style={styles.ratingContainer}>
      {[...Array(fullStars)].map((_, i) => (
        <Text key={`full-${i}`} style={[styles.star, { fontSize: size }]}>
          ⭐
        </Text>
      ))}
      {hasHalfStar && <Text style={[styles.star, { fontSize: size }]}>⭐</Text>}
      {[...Array(emptyStars)].map((_, i) => (
        <Text key={`empty-${i}`} style={[styles.starEmpty, { fontSize: size }]}>
          ☆
        </Text>
      ))}
      {showCount && <Text style={styles.ratingCount}>({count})</Text>}
    </View>
  );
};

/**
 * Review Card Component
 */
const ReviewCard: React.FC<{
  review: Review;
  onHelpful: (id: string) => void;
}> = ({ review, onHelpful }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewUser}>
          {review.userAvatar ? (
            <Image
              source={{ uri: review.userAvatar }}
              style={styles.reviewAvatar}
            />
          ) : (
            <View style={styles.reviewAvatarPlaceholder}>
              <Text style={styles.reviewAvatarText}>
                {review.userName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View>
            <Text style={styles.reviewUserName}>{review.userName}</Text>
            <Text style={styles.reviewDate}>
              {formatDate(review.createdAt)}
            </Text>
          </View>
        </View>
        <StarRating rating={review.rating} size={14} />
      </View>
      <Text style={styles.reviewComment}>{review.comment}</Text>
      <TouchableOpacity
        style={styles.helpfulButton}
        onPress={() => onHelpful(review.id)}
      >
        <Text style={styles.helpfulText}>👍 Helpful ({review.helpful})</Text>
      </TouchableOpacity>
    </View>
  );
};

/**
 * Related Product Card
 */
const RelatedProductCard: React.FC<{
  product: RelatedProduct;
  onPress: () => void;
}> = ({ product, onPress }) => {
  return (
    <TouchableOpacity style={styles.relatedProductCard} onPress={onPress}>
      {product.image ? (
        <Image
          source={{ uri: product.image }}
          style={styles.relatedProductImage}
        />
      ) : (
        <View style={styles.relatedProductImagePlaceholder}>
          <Text style={styles.relatedProductPlaceholderText}>🥬</Text>
        </View>
      )}
      {product.isOrganic && (
        <View style={styles.relatedProductBadge}>
          <Text style={styles.relatedProductBadgeText}>🌿</Text>
        </View>
      )}
      <View style={styles.relatedProductInfo}>
        <Text style={styles.relatedProductName} numberOfLines={1}>
          {product.name}
        </Text>
        <Text style={styles.relatedProductFarm} numberOfLines={1}>
          {product.farmName}
        </Text>
        <Text style={styles.relatedProductPrice}>
          ${product.price.toFixed(2)}/{product.unit}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

/**
 * Nutrition Info Section
 */
const NutritionInfo: React.FC<{
  nutrition: Product["nutritionInfo"];
}> = ({ nutrition }) => {
  if (!nutrition) return null;

  const items = [
    { label: "Calories", value: nutrition.calories, unit: "kcal" },
    { label: "Protein", value: nutrition.protein, unit: "" },
    { label: "Carbs", value: nutrition.carbs, unit: "" },
    { label: "Fat", value: nutrition.fat, unit: "" },
    { label: "Fiber", value: nutrition.fiber, unit: "" },
  ].filter((item) => item.value !== undefined);

  if (items.length === 0) return null;

  return (
    <View style={styles.nutritionSection}>
      <Text style={styles.sectionTitle}>Nutrition Facts</Text>
      <View style={styles.nutritionGrid}>
        {items.map((item, index) => (
          <View key={item.label} style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>
              {item.value}
              {item.unit}
            </Text>
            <Text style={styles.nutritionLabel}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export const ProductDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ProductDetailRouteProp>();
  const { productId } = route.params;

  // Cart store
  const { addItem, isProductInCart, getItemByProductId } = useCartStore();

  // State
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Animation
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, IMAGE_HEIGHT - 100],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  // Check if already in cart
  const cartItem = product ? getItemByProductId(product.id) : undefined;
  const inCart = product ? isProductInCart(product.id) : false;

  // ========================================
  // DATA FETCHING
  // ========================================

  const fetchProductDetails = useCallback(async () => {
    try {
      setIsLoading(true);

      // Fetch product details
      const productResponse = await apiClient.products.getById(productId);
      const productData = productResponse.data || productResponse;

      setProduct({
        id: productData.id,
        name: productData.name,
        description: productData.description || "",
        price: Number(productData.price),
        unit: productData.unit || "lb",
        images: productData.images || [],
        farmId: productData.farmId,
        farmName: productData.farm?.name || "Local Farm",
        farmImage: productData.farm?.image,
        category: productData.category || "Produce",
        isOrganic: productData.isOrganic || false,
        isSeasonal: productData.isSeasonal || false,
        inStock: productData.inStock !== false,
        stock: productData.stock || productData.quantityAvailable || 10,
        rating: productData.rating || 4.5,
        reviewCount: productData.reviewCount || 0,
        harvestDate: productData.harvestDate,
        freshnessDays: productData.freshnessDays,
        tags: productData.tags || [],
        nutritionInfo: productData.nutritionInfo,
      });

      // Fetch reviews
      try {
        const reviewsResponse = await apiClient.reviews.getByProduct(productId);
        const reviewsData = reviewsResponse.data || reviewsResponse || [];
        setReviews(Array.isArray(reviewsData) ? reviewsData.slice(0, 10) : []);
      } catch (error) {
        console.log("No reviews available");
        setReviews([]);
      }

      // Fetch related products
      try {
        const relatedResponse = await apiClient.products.getByCategory(
          productData.category,
        );
        const relatedData = relatedResponse.data || relatedResponse || [];
        const related = Array.isArray(relatedData)
          ? relatedData
              .filter((p: any) => p.id !== productId)
              .slice(0, 6)
              .map((p: any) => ({
                id: p.id,
                name: p.name,
                price: Number(p.price),
                unit: p.unit || "lb",
                image: p.images?.[0] || "",
                farmName: p.farm?.name || "Local Farm",
                isOrganic: p.isOrganic || false,
              }))
          : [];
        setRelatedProducts(related);
      } catch (error) {
        console.log("No related products");
        setRelatedProducts([]);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      Alert.alert("Error", "Failed to load product details");
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchProductDetails();
  }, [fetchProductDetails]);

  // ========================================
  // HANDLERS
  // ========================================

  const handleAddToCart = async () => {
    if (!product || !product.inStock) return;

    setIsAddingToCart(true);
    try {
      await addItem({
        productId: product.id,
        productName: product.name,
        productImage: product.images[0] || "",
        price: product.price,
        quantity,
        unit: product.unit,
        farmId: product.farmId,
        farmName: product.farmName,
        stock: product.stock,
      });

      Alert.alert(
        "Added to Cart! 🛒",
        `${quantity} ${product.unit} of ${product.name} added to your cart.`,
        [
          { text: "Continue Shopping", style: "cancel" },
          { text: "View Cart", onPress: () => navigation.navigate("Cart") },
        ],
      );
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to add item to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product || !product.inStock) return;

    setIsAddingToCart(true);
    try {
      if (!inCart) {
        await addItem({
          productId: product.id,
          productName: product.name,
          productImage: product.images[0] || "",
          price: product.price,
          quantity,
          unit: product.unit,
          farmId: product.farmId,
          farmName: product.farmName,
          stock: product.stock,
        });
      }
      navigation.navigate("Cart");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to process");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleShare = async () => {
    if (!product) return;

    try {
      await Share.share({
        title: product.name,
        message: `Check out ${product.name} from ${product.farmName} on Farmers Market!\n\n$${product.price.toFixed(2)}/${product.unit}`,
      });
    } catch (error) {
      console.error("Share error:", error);
    }
  };

  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite);
    // TODO: Implement API call to save favorite
  };

  const handleFarmPress = () => {
    if (product) {
      navigation.navigate("FarmDetail", { farmId: product.farmId });
    }
  };

  const handleRelatedProductPress = (relatedProductId: string) => {
    navigation.push("ProductDetail", { productId: relatedProductId });
  };

  const handleReviewHelpful = (reviewId: string) => {
    // TODO: Implement helpful API call
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId ? { ...r, helpful: r.helpful + 1 } : r,
      ),
    );
  };

  const handleWriteReview = () => {
    navigation.navigate("WriteReview", { productId });
  };

  const incrementQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity((q) => q + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((q) => q - 1);
    }
  };

  // ========================================
  // RENDER
  // ========================================

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
        <Text style={styles.loadingText}>Loading product...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorEmoji}>😕</Text>
        <Text style={styles.errorTitle}>Product Not Found</Text>
        <Text style={styles.errorText}>
          The product you're looking for doesn't exist or has been removed.
        </Text>
        <TouchableOpacity
          style={styles.errorButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const totalPrice = product.price * quantity;
  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Animated Header */}
      <Animated.View
        style={[styles.animatedHeader, { opacity: headerOpacity }]}
      >
        <Text style={styles.animatedHeaderTitle} numberOfLines={1}>
          {product.name}
        </Text>
      </Animated.View>

      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>

      {/* Action Buttons */}
      <View style={styles.headerActions}>
        <TouchableOpacity
          style={styles.headerActionButton}
          onPress={handleShare}
        >
          <Text style={styles.headerActionIcon}>↗</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerActionButton}
          onPress={handleFavoriteToggle}
        >
          <Text
            style={[
              styles.headerActionIcon,
              isFavorite && styles.favoriteActive,
            ]}
          >
            {isFavorite ? "❤️" : "🤍"}
          </Text>
        </TouchableOpacity>
      </View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Image Gallery */}
        <ImageGallery images={product.images} />

        {/* Product Info */}
        <View style={styles.productInfo}>
          {/* Badges */}
          <View style={styles.badgesRow}>
            {product.isOrganic && <ProductBadge type="organic" />}
            {product.isSeasonal && <ProductBadge type="seasonal" />}
            {product.freshnessDays && product.freshnessDays <= 2 && (
              <ProductBadge type="fresh" />
            )}
          </View>

          {/* Category */}
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("ProductList", { category: product.category })
            }
          >
            <Text style={styles.category}>{product.category}</Text>
          </TouchableOpacity>

          {/* Name */}
          <Text style={styles.productName}>{product.name}</Text>

          {/* Rating */}
          <View style={styles.ratingRow}>
            <StarRating
              rating={product.rating}
              showCount
              count={product.reviewCount}
            />
          </View>

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>${product.price.toFixed(2)}</Text>
            <Text style={styles.priceUnit}>/ {product.unit}</Text>
          </View>

          {/* Stock Status */}
          {product.inStock ? (
            <Text style={styles.stockStatus}>
              ✓ In Stock ({product.stock} available)
            </Text>
          ) : (
            <Text style={styles.outOfStock}>✗ Out of Stock</Text>
          )}

          {/* Farm Info */}
          <TouchableOpacity style={styles.farmCard} onPress={handleFarmPress}>
            {product.farmImage ? (
              <Image
                source={{ uri: product.farmImage }}
                style={styles.farmImage}
              />
            ) : (
              <View style={styles.farmImagePlaceholder}>
                <Text style={styles.farmImagePlaceholderText}>🌾</Text>
              </View>
            )}
            <View style={styles.farmInfo}>
              <Text style={styles.farmLabel}>Sold by</Text>
              <Text style={styles.farmName}>{product.farmName}</Text>
            </View>
            <Text style={styles.farmArrow}>→</Text>
          </TouchableOpacity>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About this product</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {product.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Nutrition Info */}
          <NutritionInfo nutrition={product.nutritionInfo} />

          {/* Reviews Section */}
          {reviews.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  Reviews ({product.reviewCount})
                </Text>
                <TouchableOpacity onPress={handleWriteReview}>
                  <Text style={styles.writeReviewLink}>Write a Review</Text>
                </TouchableOpacity>
              </View>

              {displayedReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onHelpful={handleReviewHelpful}
                />
              ))}

              {reviews.length > 3 && (
                <TouchableOpacity
                  style={styles.showMoreButton}
                  onPress={() => setShowAllReviews(!showAllReviews)}
                >
                  <Text style={styles.showMoreText}>
                    {showAllReviews
                      ? "Show Less"
                      : `Show All ${reviews.length} Reviews`}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>You might also like</Text>
              <FlatList
                data={relatedProducts}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.relatedProductsList}
                renderItem={({ item }) => (
                  <RelatedProductCard
                    product={item}
                    onPress={() => handleRelatedProductPress(item.id)}
                  />
                )}
              />
            </View>
          )}

          {/* Bottom Spacer */}
          <View style={styles.bottomSpacer} />
        </View>
      </Animated.ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomBarContent}>
          {/* Quantity Selector */}
          <QuantitySelector
            quantity={quantity}
            maxQuantity={product.stock}
            onIncrease={incrementQuantity}
            onDecrease={decrementQuantity}
          />

          {/* Total Price */}
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalPrice}>${totalPrice.toFixed(2)}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[
              styles.addToCartButton,
              (!product.inStock || isAddingToCart) && styles.buttonDisabled,
            ]}
            onPress={handleAddToCart}
            disabled={!product.inStock || isAddingToCart}
          >
            {isAddingToCart ? (
              <ActivityIndicator size="small" color={colors.primary[500]} />
            ) : (
              <Text style={styles.addToCartText}>
                {inCart ? "+ Add More" : "🛒 Add to Cart"}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.buyNowButton,
              (!product.inStock || isAddingToCart) && styles.buttonDisabled,
            ]}
            onPress={handleBuyNow}
            disabled={!product.inStock || isAddingToCart}
          >
            <Text style={styles.buyNowText}>Buy Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollContent: {
    paddingBottom: 200,
  },

  // Loading & Error States
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background.primary,
  },
  loadingText: {
    marginTop: spacing[4],
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing[6],
    backgroundColor: colors.background.primary,
  },
  errorEmoji: {
    fontSize: 64,
    marginBottom: spacing[4],
  },
  errorTitle: {
    fontSize: typography.fontSize["2xl"],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  errorText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: spacing[6],
  },
  errorButton: {
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.lg,
  },
  errorButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.inverse,
  },

  // Animated Header
  animatedHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === "ios" ? 100 : 80,
    backgroundColor: colors.background.primary,
    zIndex: 100,
    justifyContent: "flex-end",
    paddingBottom: spacing[3],
    paddingHorizontal: spacing[16],
    ...shadows.md,
  },
  animatedHeaderTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    textAlign: "center",
  },

  // Header Buttons
  backButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 30,
    left: spacing[4],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 101,
  },
  backIcon: {
    fontSize: 24,
    color: colors.text.inverse,
  },
  headerActions: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 30,
    right: spacing[4],
    flexDirection: "row",
    gap: spacing[2],
    zIndex: 101,
  },
  headerActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerActionIcon: {
    fontSize: 20,
  },
  favoriteActive: {
    transform: [{ scale: 1.1 }],
  },

  // Image Gallery
  galleryContainer: {
    height: IMAGE_HEIGHT,
    backgroundColor: colors.neutral[100],
  },
  imageWrapper: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
  },
  productImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.neutral[200],
  },
  imagePlaceholderText: {
    fontSize: 80,
  },
  paginationContainer: {
    position: "absolute",
    bottom: spacing[4],
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing[2],
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  paginationDotActive: {
    backgroundColor: colors.text.inverse,
    width: 24,
  },

  // Product Info
  productInfo: {
    padding: spacing[4],
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    marginTop: -spacing[4],
  },

  // Badges
  badgesRow: {
    flexDirection: "row",
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  badge: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
  },
  badgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.inverse,
  },

  // Category
  category: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[500],
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing[1],
  },

  // Name
  productName: {
    fontSize: typography.fontSize["2xl"],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },

  // Rating
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingRow: {
    marginBottom: spacing[3],
  },
  star: {
    marginRight: 2,
  },
  starEmpty: {
    marginRight: 2,
    color: colors.neutral[300],
  },
  ratingCount: {
    marginLeft: spacing[2],
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },

  // Price
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: spacing[2],
  },
  price: {
    fontSize: typography.fontSize["3xl"],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[600],
  },
  priceUnit: {
    fontSize: typography.fontSize.lg,
    color: colors.text.secondary,
    marginLeft: spacing[1],
  },

  // Stock
  stockStatus: {
    fontSize: typography.fontSize.sm,
    color: colors.success.main,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing[4],
  },
  outOfStock: {
    fontSize: typography.fontSize.sm,
    color: colors.error.main,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing[4],
  },

  // Farm Card
  farmCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing[3],
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    marginBottom: spacing[4],
  },
  farmImage: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
  },
  farmImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[100],
    justifyContent: "center",
    alignItems: "center",
  },
  farmImagePlaceholderText: {
    fontSize: 24,
  },
  farmInfo: {
    flex: 1,
    marginLeft: spacing[3],
  },
  farmLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  farmName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  farmArrow: {
    fontSize: 20,
    color: colors.text.tertiary,
  },

  // Section
  section: {
    marginBottom: spacing[6],
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing[3],
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing[3],
  },
  description: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    lineHeight: 24,
  },

  // Tags
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing[2],
    marginBottom: spacing[6],
  },
  tag: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.full,
  },
  tagText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },

  // Nutrition
  nutritionSection: {
    marginBottom: spacing[6],
  },
  nutritionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing[3],
  },
  nutritionItem: {
    width: "30%",
    backgroundColor: colors.background.secondary,
    padding: spacing[3],
    borderRadius: borderRadius.md,
    alignItems: "center",
  },
  nutritionValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  nutritionLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },

  // Reviews
  writeReviewLink: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[500],
    fontWeight: typography.fontWeight.medium,
  },
  reviewCard: {
    backgroundColor: colors.background.secondary,
    padding: spacing[4],
    borderRadius: borderRadius.lg,
    marginBottom: spacing[3],
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing[2],
  },
  reviewUser: {
    flexDirection: "row",
    alignItems: "center",
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: spacing[3],
  },
  reviewAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[100],
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing[3],
  },
  reviewAvatarText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[600],
  },
  reviewUserName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  reviewDate: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  reviewComment: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing[2],
  },
  helpfulButton: {
    alignSelf: "flex-start",
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[2],
    borderRadius: borderRadius.sm,
    backgroundColor: colors.neutral[100],
  },
  helpfulText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  showMoreButton: {
    alignItems: "center",
    paddingVertical: spacing[3],
  },
  showMoreText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[500],
    fontWeight: typography.fontWeight.medium,
  },

  // Related Products
  relatedProductsList: {
    paddingRight: spacing[4],
  },
  relatedProductCard: {
    width: 140,
    marginRight: spacing[3],
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
  },
  relatedProductImage: {
    width: "100%",
    height: 120,
    resizeMode: "cover",
  },
  relatedProductImagePlaceholder: {
    width: "100%",
    height: 120,
    backgroundColor: colors.neutral[200],
    justifyContent: "center",
    alignItems: "center",
  },
  relatedProductPlaceholderText: {
    fontSize: 40,
  },
  relatedProductBadge: {
    position: "absolute",
    top: spacing[2],
    left: spacing[2],
    backgroundColor: colors.success.main,
    borderRadius: borderRadius.full,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  relatedProductBadgeText: {
    fontSize: 12,
  },
  relatedProductInfo: {
    padding: spacing[3],
  },
  relatedProductName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  relatedProductFarm: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginBottom: spacing[1],
  },
  relatedProductPrice: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[600],
  },

  // Bottom Spacer
  bottomSpacer: {
    height: 50,
  },

  // Bottom Bar
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    paddingBottom: Platform.OS === "ios" ? spacing[8] : spacing[4],
    ...shadows.lg,
  },
  bottomBarContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing[3],
  },

  // Quantity Selector
  quantitySelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
  },
  quantityButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background.secondary,
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  quantityButtonText: {
    fontSize: 24,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  quantityButtonTextDisabled: {
    color: colors.text.disabled,
  },
  quantityDisplay: {
    width: 50,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background.primary,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.border.light,
  },
  quantityText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },

  // Total
  totalContainer: {
    alignItems: "flex-end",
  },
  totalLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  totalPrice: {
    fontSize: typography.fontSize["2xl"],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[600],
  },

  // Action Buttons
  actionButtons: {
    flexDirection: "row",
    gap: spacing[3],
  },
  addToCartButton: {
    flex: 1,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.primary[500],
  },
  addToCartText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary[500],
  },
  buyNowButton: {
    flex: 1,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.lg,
  },
  buyNowText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.inverse,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

export default ProductDetailScreen;
