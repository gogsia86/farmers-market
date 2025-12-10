/**
 * 🛒 CART SCREEN - Farmers Market Mobile App
 *
 * Shopping cart with:
 * - Cart item list with quantity controls
 * - Price calculations (subtotal, tax, shipping, total)
 * - Remove items
 * - Clear cart
 * - Proceed to checkout
 * - Empty cart state
 *
 * @reference Agricultural consciousness patterns
 */

import React, { useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { theme } from "../../theme";
import {
  useCartStore,
  useCartItems,
  useCartTotals,
  useCartLoading,
  useIsCartEmpty,
  useIsFreeShipping,
  useRemainingForFreeShipping,
  CartItem,
} from "../../stores/cartStore";

// ========================================
// 🎨 SUB-COMPONENTS
// ========================================

const Header = ({
  onBack,
  onClear,
  itemCount,
}: {
  onBack: () => void;
  onClear: () => void;
  itemCount: number;
}) => (
  <View style={styles.header}>
    <TouchableOpacity onPress={onBack} style={styles.backButton}>
      <Text style={styles.backIcon}>←</Text>
    </TouchableOpacity>
    <Text style={styles.headerTitle}>
      Shopping Cart {itemCount > 0 && `(${itemCount})`}
    </Text>
    {itemCount > 0 ? (
      <TouchableOpacity onPress={onClear} style={styles.clearButton}>
        <Text style={styles.clearText}>Clear</Text>
      </TouchableOpacity>
    ) : (
      <View style={styles.clearButton} />
    )}
  </View>
);

const FreeShippingBanner = ({
  isFreeShipping,
  remaining,
}: {
  isFreeShipping: boolean;
  remaining: number;
}) => {
  if (isFreeShipping) {
    return (
      <View style={[styles.shippingBanner, styles.shippingBannerSuccess]}>
        <Text style={styles.shippingBannerEmoji}>🎉</Text>
        <Text style={styles.shippingBannerText}>
          You've unlocked FREE shipping!
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.shippingBanner}>
      <Text style={styles.shippingBannerEmoji}>🚚</Text>
      <Text style={styles.shippingBannerText}>
        Add ${remaining.toFixed(2)} more for FREE shipping
      </Text>
      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBar,
            { width: `${Math.min(100, ((50 - remaining) / 50) * 100)}%` },
          ]}
        />
      </View>
    </View>
  );
};

const CartItemCard = ({
  item,
  onUpdateQuantity,
  onRemove,
}: {
  item: CartItem;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
}) => (
  <View style={styles.cartItemCard}>
    {/* Product Image */}
    {item.productImage ? (
      <Image source={{ uri: item.productImage }} style={styles.itemImage} />
    ) : (
      <View style={styles.itemImagePlaceholder}>
        <Text style={styles.itemImagePlaceholderText}>🥬</Text>
      </View>
    )}

    {/* Item Details */}
    <View style={styles.itemDetails}>
      <Text style={styles.itemName} numberOfLines={2}>
        {item.productName}
      </Text>
      <Text style={styles.itemFarm}>{item.farmName}</Text>
      <Text style={styles.itemPrice}>
        ${item.price.toFixed(2)}/{item.unit}
      </Text>
    </View>

    {/* Quantity Controls */}
    <View style={styles.quantityContainer}>
      <View style={styles.quantityControls}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => onUpdateQuantity(item.quantity - 1)}
        >
          <Text style={styles.quantityButtonText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.quantityText}>{item.quantity}</Text>
        <TouchableOpacity
          style={[
            styles.quantityButton,
            item.quantity >= item.stock && styles.quantityButtonDisabled,
          ]}
          onPress={() => onUpdateQuantity(item.quantity + 1)}
          disabled={item.quantity >= item.stock}
        >
          <Text style={styles.quantityButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.itemSubtotal}>
        ${(item.price * item.quantity).toFixed(2)}
      </Text>
      <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
        <Text style={styles.removeButtonText}>Remove</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const CartSummary = ({
  subtotal,
  tax,
  shipping,
  discount,
  total,
}: {
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
}) => (
  <View style={styles.summaryContainer}>
    <Text style={styles.summaryTitle}>Order Summary</Text>

    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>Subtotal</Text>
      <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
    </View>

    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>Tax (8%)</Text>
      <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
    </View>

    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>Shipping</Text>
      <Text style={[styles.summaryValue, shipping === 0 && styles.freeText]}>
        {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
      </Text>
    </View>

    {discount > 0 && (
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Discount</Text>
        <Text style={[styles.summaryValue, styles.discountText]}>
          -${discount.toFixed(2)}
        </Text>
      </View>
    )}

    <View style={styles.divider} />

    <View style={styles.totalRow}>
      <Text style={styles.totalLabel}>Total</Text>
      <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
    </View>
  </View>
);

const EmptyCart = ({ onBrowse }: { onBrowse: () => void }) => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyEmoji}>🛒</Text>
    <Text style={styles.emptyTitle}>Your cart is empty</Text>
    <Text style={styles.emptyText}>
      Discover fresh, local produce from farmers near you
    </Text>
    <TouchableOpacity style={styles.browseButton} onPress={onBrowse}>
      <Text style={styles.browseButtonText}>Browse Products</Text>
    </TouchableOpacity>
  </View>
);

const CheckoutButton = ({
  total,
  onCheckout,
  disabled,
}: {
  total: number;
  onCheckout: () => void;
  disabled: boolean;
}) => (
  <View style={styles.checkoutContainer}>
    <TouchableOpacity
      style={[styles.checkoutButton, disabled && styles.checkoutButtonDisabled]}
      onPress={onCheckout}
      disabled={disabled}
    >
      <Text style={styles.checkoutButtonText}>
        Proceed to Checkout • ${total.toFixed(2)}
      </Text>
    </TouchableOpacity>
    <View style={styles.secureNote}>
      <Text style={styles.secureIcon}>🔒</Text>
      <Text style={styles.secureText}>Secure checkout with Stripe</Text>
    </View>
  </View>
);

// ========================================
// 🛒 MAIN COMPONENT
// ========================================

export const CartScreen = () => {
  const navigation = useNavigation<any>();

  // Cart state
  const items = useCartItems();
  const totals = useCartTotals();
  const isLoading = useCartLoading();
  const isEmpty = useIsCartEmpty();
  const isFreeShipping = useIsFreeShipping();
  const remainingForFreeShipping = useRemainingForFreeShipping();

  // Cart actions
  const { updateQuantity, removeItem, clearCart } = useCartStore();

  // ========================================
  // 🎯 HANDLERS
  // ========================================

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleClearCart = useCallback(() => {
    Alert.alert(
      "Clear Cart",
      "Are you sure you want to remove all items from your cart?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            clearCart();
          },
        },
      ],
    );
  }, [clearCart]);

  const handleUpdateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      if (quantity < 1) {
        handleRemoveItem(itemId);
        return;
      }
      await updateQuantity(itemId, quantity);
    },
    [updateQuantity],
  );

  const handleRemoveItem = useCallback(
    (itemId: string) => {
      Alert.alert(
        "Remove Item",
        "Are you sure you want to remove this item from your cart?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove",
            style: "destructive",
            onPress: () => {
              removeItem(itemId);
            },
          },
        ],
      );
    },
    [removeItem],
  );

  const handleBrowseProducts = useCallback(() => {
    navigation.navigate("Products");
  }, [navigation]);

  const handleCheckout = useCallback(() => {
    navigation.navigate("Checkout");
  }, [navigation]);

  // ========================================
  // 📊 COMPUTED VALUES
  // ========================================

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  // ========================================
  // 🎨 RENDER
  // ========================================

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <CartItemCard
      item={item}
      onUpdateQuantity={(quantity) => handleUpdateQuantity(item.id, quantity)}
      onRemove={() => handleRemoveItem(item.id)}
    />
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header onBack={handleBack} onClear={handleClearCart} itemCount={0} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[500]} />
          <Text style={styles.loadingText}>Loading your cart...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isEmpty) {
    return (
      <SafeAreaView style={styles.container}>
        <Header onBack={handleBack} onClear={handleClearCart} itemCount={0} />
        <EmptyCart onBrowse={handleBrowseProducts} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header
        onBack={handleBack}
        onClear={handleClearCart}
        itemCount={itemCount}
      />

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderCartItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <FreeShippingBanner
            isFreeShipping={isFreeShipping}
            remaining={remainingForFreeShipping}
          />
        }
        ListFooterComponent={
          <CartSummary
            subtotal={totals.subtotal}
            tax={totals.tax}
            shipping={totals.shipping}
            discount={totals.discount}
            total={totals.total}
          />
        }
      />

      <CheckoutButton
        total={totals.total}
        onCheckout={handleCheckout}
        disabled={items.length === 0}
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

  clearButton: {
    width: 60,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-end",
  },

  clearText: {
    ...theme.typography.styles.body2,
    color: theme.colors.error.main,
    fontWeight: "600",
  },

  // List Content
  listContent: {
    paddingHorizontal: theme.spacing[4],
    paddingBottom: theme.spacing[4],
  },

  // Shipping Banner
  shippingBanner: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    backgroundColor: theme.colors.secondary[100],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing[3],
    marginVertical: theme.spacing[4],
  },

  shippingBannerSuccess: {
    backgroundColor: theme.colors.success.light,
  },

  shippingBannerEmoji: {
    fontSize: 20,
    marginRight: theme.spacing[2],
  },

  shippingBannerText: {
    ...theme.typography.styles.body2,
    color: theme.colors.text.primary,
    fontWeight: "500",
    flex: 1,
  },

  progressBarContainer: {
    width: "100%",
    height: 4,
    backgroundColor: theme.colors.neutral[200],
    borderRadius: 2,
    marginTop: theme.spacing[2],
  },

  progressBar: {
    height: "100%",
    backgroundColor: theme.colors.primary[500],
    borderRadius: 2,
  },

  // Cart Item Card
  cartItemCard: {
    flexDirection: "row",
    backgroundColor: theme.colors.surface.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[3],
    marginBottom: theme.spacing[3],
    ...theme.shadows.sm,
  },

  itemImage: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.md,
    resizeMode: "cover",
  },

  itemImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background.secondary,
    justifyContent: "center",
    alignItems: "center",
  },

  itemImagePlaceholderText: {
    fontSize: 32,
  },

  itemDetails: {
    flex: 1,
    marginLeft: theme.spacing[3],
    justifyContent: "center",
  },

  itemName: {
    ...theme.typography.styles.body1,
    color: theme.colors.text.primary,
    fontWeight: "600",
    marginBottom: 2,
  },

  itemFarm: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing[1],
  },

  itemPrice: {
    ...theme.typography.styles.body2,
    color: theme.colors.primary[600],
    fontWeight: "600",
  },

  quantityContainer: {
    alignItems: "flex-end",
    justifyContent: "space-between",
  },

  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    overflow: "hidden",
  },

  quantityButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },

  quantityButtonDisabled: {
    opacity: 0.5,
  },

  quantityButtonText: {
    fontSize: 18,
    color: theme.colors.primary[500],
    fontWeight: "700",
  },

  quantityText: {
    ...theme.typography.styles.body1,
    color: theme.colors.text.primary,
    fontWeight: "600",
    minWidth: 28,
    textAlign: "center",
  },

  itemSubtotal: {
    ...theme.typography.styles.body1,
    color: theme.colors.text.primary,
    fontWeight: "700",
    marginTop: theme.spacing[2],
  },

  removeButton: {
    marginTop: theme.spacing[1],
  },

  removeButtonText: {
    ...theme.typography.styles.caption,
    color: theme.colors.error.main,
  },

  // Summary
  summaryContainer: {
    backgroundColor: theme.colors.surface.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[4],
    marginTop: theme.spacing[4],
    ...theme.shadows.sm,
  },

  summaryTitle: {
    ...theme.typography.styles.h5,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[4],
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing[3],
  },

  summaryLabel: {
    ...theme.typography.styles.body1,
    color: theme.colors.text.secondary,
  },

  summaryValue: {
    ...theme.typography.styles.body1,
    color: theme.colors.text.primary,
  },

  freeText: {
    color: theme.colors.success.main,
    fontWeight: "600",
  },

  discountText: {
    color: theme.colors.success.main,
    fontWeight: "600",
  },

  divider: {
    height: 1,
    backgroundColor: theme.colors.border.light,
    marginVertical: theme.spacing[3],
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  totalLabel: {
    ...theme.typography.styles.h4,
    color: theme.colors.text.primary,
  },

  totalValue: {
    ...theme.typography.styles.h4,
    color: theme.colors.primary[600],
  },

  // Checkout
  checkoutContainer: {
    padding: theme.spacing[4],
    paddingBottom: theme.spacing[6],
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
    backgroundColor: theme.colors.background.primary,
  },

  checkoutButton: {
    backgroundColor: theme.colors.primary[500],
    paddingVertical: theme.spacing[4],
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
  },

  checkoutButtonDisabled: {
    backgroundColor: theme.colors.neutral[300],
  },

  checkoutButtonText: {
    ...theme.typography.styles.body1,
    color: theme.colors.text.inverse,
    fontWeight: "700",
  },

  secureNote: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: theme.spacing[3],
  },

  secureIcon: {
    fontSize: 14,
    marginRight: theme.spacing[1],
  },

  secureText: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.tertiary,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing[8],
  },

  emptyEmoji: {
    fontSize: 80,
    marginBottom: theme.spacing[4],
  },

  emptyTitle: {
    ...theme.typography.styles.h3,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  },

  emptyText: {
    ...theme.typography.styles.body1,
    color: theme.colors.text.secondary,
    textAlign: "center",
    marginBottom: theme.spacing[6],
  },

  browseButton: {
    backgroundColor: theme.colors.primary[500],
    paddingVertical: theme.spacing[4],
    paddingHorizontal: theme.spacing[8],
    borderRadius: theme.borderRadius.md,
  },

  browseButtonText: {
    ...theme.typography.styles.body1,
    color: theme.colors.text.inverse,
    fontWeight: "600",
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
});

// ========================================
// 📦 EXPORTS
// ========================================

export default CartScreen;
