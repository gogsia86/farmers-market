/**
 * 📦 ORDER DETAIL SCREEN - Divine Order Tracking
 *
 * Comprehensive order detail view with:
 * - Order status tracking with timeline
 * - Order items list
 * - Delivery/pickup information
 * - Payment summary
 * - Contact support
 * - Cancel/reorder functionality
 *
 * @reference .github/instructions/10_AGRICULTURAL_FEATURE_PATTERNS.instructions.md
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  RefreshControl,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCartStore } from "@/stores/cartStore";
import apiClient from "@/services/api";
import { colors, spacing, typography, shadows, borderRadius } from "@/theme";

// ============================================
// TYPE DEFINITIONS
// ============================================

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  unit: string;
  price: number;
  total: number;
}

interface OrderTimelineItem {
  status: string;
  label: string;
  timestamp?: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

interface Order {
  id: string;
  orderNumber: string;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "PREPARING"
    | "READY"
    | "FULFILLED"
    | "COMPLETED"
    | "CANCELLED";
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  items: OrderItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  discount: number;
  total: number;
  fulfillmentMethod: "DELIVERY" | "FARM_PICKUP" | "MARKET_PICKUP";
  scheduledDate?: string;
  farmId: string;
  farmName: string;
  farmPhone?: string;
  farmAddress?: string;
  deliveryAddress?: {
    fullName: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
  };
  specialInstructions?: string;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  fulfilledAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
}

type RootStackParamList = {
  OrderDetail: { orderId: string };
  ProductDetail: { productId: string };
  FarmDetail: { farmId: string };
  Orders: undefined;
  Cart: undefined;
  Help: undefined;
};

type OrderDetailRouteProp = RouteProp<RootStackParamList, "OrderDetail">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// ============================================
// CONSTANTS
// ============================================

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: string }
> = {
  PENDING: { label: "Pending", color: colors.warning.main, icon: "⏳" },
  CONFIRMED: { label: "Confirmed", color: colors.info.main, icon: "✓" },
  PREPARING: { label: "Preparing", color: colors.primary[500], icon: "👨‍🍳" },
  READY: { label: "Ready", color: colors.accent[500], icon: "📦" },
  FULFILLED: { label: "On the Way", color: colors.primary[600], icon: "🚚" },
  COMPLETED: { label: "Delivered", color: colors.success.main, icon: "✅" },
  CANCELLED: { label: "Cancelled", color: colors.error.main, icon: "✗" },
};

const FULFILLMENT_CONFIG: Record<string, { label: string; icon: string }> = {
  DELIVERY: { label: "Home Delivery", icon: "🚚" },
  FARM_PICKUP: { label: "Farm Pickup", icon: "🌾" },
  MARKET_PICKUP: { label: "Market Pickup", icon: "🏪" },
};

// ============================================
// SUB-COMPONENTS
// ============================================

/**
 * Status Badge
 */
const StatusBadge: React.FC<{
  status: Order["status"];
}> = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;

  return (
    <View style={[styles.statusBadge, { backgroundColor: config.color }]}>
      <Text style={styles.statusBadgeIcon}>{config.icon}</Text>
      <Text style={styles.statusBadgeText}>{config.label}</Text>
    </View>
  );
};

/**
 * Order Timeline
 */
const OrderTimeline: React.FC<{
  order: Order;
}> = ({ order }) => {
  const getTimeline = (): OrderTimelineItem[] => {
    const statuses = [
      "PENDING",
      "CONFIRMED",
      "PREPARING",
      "READY",
      "FULFILLED",
      "COMPLETED",
    ];
    const currentIndex = statuses.indexOf(order.status);

    if (order.status === "CANCELLED") {
      return [
        {
          status: "CANCELLED",
          label: "Order Cancelled",
          timestamp: order.cancelledAt,
          isCompleted: true,
          isCurrent: true,
        },
      ];
    }

    return statuses.map((status, index) => {
      let timestamp: string | undefined;
      switch (status) {
        case "PENDING":
          timestamp = order.createdAt;
          break;
        case "CONFIRMED":
          timestamp = order.confirmedAt;
          break;
        case "FULFILLED":
          timestamp = order.fulfilledAt;
          break;
        case "COMPLETED":
          timestamp = order.completedAt;
          break;
      }

      return {
        status,
        label: STATUS_CONFIG[status]?.label || status,
        timestamp,
        isCompleted: index < currentIndex,
        isCurrent: index === currentIndex,
      };
    });
  };

  const timeline = getTimeline();

  const formatTime = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <View style={styles.timelineContainer}>
      <Text style={styles.sectionTitle}>Order Status</Text>
      <View style={styles.timeline}>
        {timeline.map((item, index) => (
          <View key={item.status} style={styles.timelineItem}>
            {/* Line */}
            {index > 0 && (
              <View
                style={[
                  styles.timelineLine,
                  item.isCompleted || item.isCurrent
                    ? styles.timelineLineActive
                    : styles.timelineLineInactive,
                ]}
              />
            )}

            {/* Dot */}
            <View
              style={[
                styles.timelineDot,
                item.isCompleted && styles.timelineDotCompleted,
                item.isCurrent && styles.timelineDotCurrent,
                !item.isCompleted &&
                  !item.isCurrent &&
                  styles.timelineDotPending,
              ]}
            >
              {item.isCompleted && (
                <Text style={styles.timelineDotCheck}>✓</Text>
              )}
              {item.isCurrent && <View style={styles.timelineDotPulse} />}
            </View>

            {/* Content */}
            <View style={styles.timelineContent}>
              <Text
                style={[
                  styles.timelineLabel,
                  (item.isCompleted || item.isCurrent) &&
                    styles.timelineLabelActive,
                ]}
              >
                {item.label}
              </Text>
              {item.timestamp && (
                <Text style={styles.timelineTime}>
                  {formatTime(item.timestamp)}
                </Text>
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

/**
 * Order Item Card
 */
const OrderItemCard: React.FC<{
  item: OrderItem;
  onPress: () => void;
}> = ({ item, onPress }) => {
  return (
    <TouchableOpacity style={styles.itemCard} onPress={onPress}>
      {item.productImage ? (
        <Image source={{ uri: item.productImage }} style={styles.itemImage} />
      ) : (
        <View style={styles.itemImagePlaceholder}>
          <Text style={styles.itemImagePlaceholderText}>🥬</Text>
        </View>
      )}
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={2}>
          {item.productName}
        </Text>
        <Text style={styles.itemQuantity}>
          {item.quantity} {item.unit} × ${item.price.toFixed(2)}
        </Text>
      </View>
      <Text style={styles.itemTotal}>${item.total.toFixed(2)}</Text>
    </TouchableOpacity>
  );
};

/**
 * Info Card
 */
const InfoCard: React.FC<{
  icon: string;
  title: string;
  children: React.ReactNode;
  action?: {
    label: string;
    onPress: () => void;
  };
}> = ({ icon, title, children, action }) => {
  return (
    <View style={styles.infoCard}>
      <View style={styles.infoCardHeader}>
        <View style={styles.infoCardTitleRow}>
          <Text style={styles.infoCardIcon}>{icon}</Text>
          <Text style={styles.infoCardTitle}>{title}</Text>
        </View>
        {action && (
          <TouchableOpacity onPress={action.onPress}>
            <Text style={styles.infoCardAction}>{action.label}</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.infoCardContent}>{children}</View>
    </View>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export const OrderDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<OrderDetailRouteProp>();
  const { orderId } = route.params;
  const { addItem } = useCartStore();

  // State
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // ========================================
  // DATA FETCHING
  // ========================================

  const fetchOrder = useCallback(async () => {
    try {
      const response = await apiClient.orders.getById(orderId);
      const data = response.data || response;

      setOrder({
        id: data.id,
        orderNumber:
          data.orderNumber || `ORD-${data.id.slice(0, 8).toUpperCase()}`,
        status: data.status || "PENDING",
        paymentStatus: data.paymentStatus || "PAID",
        items: (data.items || []).map((item: any) => ({
          id: item.id,
          productId: item.productId,
          productName: item.productName || item.product?.name || "Product",
          productImage: item.productImage || item.product?.images?.[0],
          quantity: item.quantity,
          unit: item.unit || item.product?.unit || "lb",
          price: Number(
            item.unitPrice || item.price || item.product?.price || 0,
          ),
          total: Number(
            item.subtotal ||
              item.total ||
              item.quantity * (item.unitPrice || item.price || 0),
          ),
        })),
        subtotal: Number(data.subtotal || 0),
        tax: Number(data.tax || 0),
        deliveryFee: Number(data.deliveryFee || 0),
        discount: Number(data.discount || 0),
        total: Number(data.total || 0),
        fulfillmentMethod: data.fulfillmentMethod || "DELIVERY",
        scheduledDate: data.scheduledDate,
        farmId: data.farmId || data.farm?.id,
        farmName: data.farmName || data.farm?.name || "Local Farm",
        farmPhone: data.farmPhone || data.farm?.phone,
        farmAddress: data.farmAddress || data.farm?.address,
        deliveryAddress: data.deliveryAddress,
        specialInstructions: data.specialInstructions,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        confirmedAt: data.confirmedAt,
        fulfilledAt: data.fulfilledAt,
        completedAt: data.completedAt,
        cancelledAt: data.cancelledAt,
        cancelReason: data.cancelReason,
        trackingUrl: data.trackingUrl,
        estimatedDelivery: data.estimatedDelivery,
      });
    } catch (error) {
      console.error("Error fetching order:", error);
      Alert.alert("Error", "Failed to load order details");
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchOrder();
    setIsRefreshing(false);
  };

  // ========================================
  // HANDLERS
  // ========================================

  const handleCancelOrder = () => {
    if (!order) return;

    if (!["PENDING", "CONFIRMED"].includes(order.status)) {
      Alert.alert(
        "Cannot Cancel",
        "This order cannot be cancelled as it is already being prepared or has been fulfilled.",
      );
      return;
    }

    Alert.alert(
      "Cancel Order",
      "Are you sure you want to cancel this order? This action cannot be undone.",
      [
        { text: "Keep Order", style: "cancel" },
        {
          text: "Cancel Order",
          style: "destructive",
          onPress: async () => {
            setIsCancelling(true);
            try {
              await apiClient.orders.cancel(orderId);
              await fetchOrder();
              Alert.alert(
                "Order Cancelled",
                "Your order has been cancelled successfully.",
              );
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to cancel order");
            } finally {
              setIsCancelling(false);
            }
          },
        },
      ],
    );
  };

  const handleReorder = async () => {
    if (!order) return;

    Alert.alert("Reorder", "Add all items from this order to your cart?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Add to Cart",
        onPress: async () => {
          try {
            for (const item of order.items) {
              await addItem({
                productId: item.productId,
                productName: item.productName,
                productImage: item.productImage || "",
                price: item.price,
                quantity: item.quantity,
                unit: item.unit,
                farmId: order.farmId,
                farmName: order.farmName,
                stock: 100, // Assume in stock
              });
            }
            Alert.alert(
              "Items Added",
              "All items have been added to your cart.",
              [
                { text: "Continue Shopping", style: "cancel" },
                {
                  text: "View Cart",
                  onPress: () => navigation.navigate("Cart"),
                },
              ],
            );
          } catch (error: any) {
            Alert.alert(
              "Error",
              error.message || "Failed to add items to cart",
            );
          }
        },
      },
    ]);
  };

  const handleTrackDelivery = () => {
    if (order?.trackingUrl) {
      Linking.openURL(order.trackingUrl);
    } else {
      Alert.alert("Tracking", "Tracking information is not available yet.");
    }
  };

  const handleContactFarm = () => {
    if (order?.farmPhone) {
      Linking.openURL(`tel:${order.farmPhone}`);
    } else {
      Alert.alert("Contact", "Farm contact information is not available.");
    }
  };

  const handleContactSupport = () => {
    navigation.navigate("Help");
  };

  const handleProductPress = (productId: string) => {
    navigation.navigate("ProductDetail", { productId });
  };

  const handleFarmPress = () => {
    if (order?.farmId) {
      navigation.navigate("FarmDetail", { farmId: order.farmId });
    }
  };

  // ========================================
  // RENDER HELPERS
  // ========================================

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const canCancel = order && ["PENDING", "CONFIRMED"].includes(order.status);
  const canTrack =
    order &&
    ["FULFILLED"].includes(order.status) &&
    order.fulfillmentMethod === "DELIVERY";

  // ========================================
  // RENDER
  // ========================================

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
        <Text style={styles.loadingText}>Loading order details...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorEmoji}>😕</Text>
        <Text style={styles.errorTitle}>Order Not Found</Text>
        <Text style={styles.errorText}>
          We couldn't find this order. It may have been deleted or doesn't
          exist.
        </Text>
        <TouchableOpacity
          style={styles.errorButton}
          onPress={() => navigation.navigate("Orders")}
        >
          <Text style={styles.errorButtonText}>View All Orders</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Order Details</Text>
          <Text style={styles.orderNumber}>{order.orderNumber}</Text>
        </View>
        <TouchableOpacity
          style={styles.helpButton}
          onPress={handleContactSupport}
        >
          <Text style={styles.helpIcon}>❓</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary[500]}
          />
        }
      >
        {/* Status Card */}
        <View style={styles.statusCard}>
          <StatusBadge status={order.status} />
          <Text style={styles.statusDate}>
            Ordered on {formatDate(order.createdAt)}
          </Text>
          {order.estimatedDelivery &&
            order.status !== "COMPLETED" &&
            order.status !== "CANCELLED" && (
              <Text style={styles.estimatedDelivery}>
                Estimated delivery: {formatDate(order.estimatedDelivery)}
              </Text>
            )}
          {order.cancelReason && (
            <View style={styles.cancelReasonBox}>
              <Text style={styles.cancelReasonLabel}>Cancellation Reason:</Text>
              <Text style={styles.cancelReasonText}>{order.cancelReason}</Text>
            </View>
          )}
        </View>

        {/* Timeline */}
        {order.status !== "CANCELLED" && <OrderTimeline order={order} />}

        {/* Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items ({order.items.length})</Text>
          {order.items.map((item) => (
            <OrderItemCard
              key={item.id}
              item={item}
              onPress={() => handleProductPress(item.productId)}
            />
          ))}
        </View>

        {/* Farm Info */}
        <InfoCard
          icon={FULFILLMENT_CONFIG[order.fulfillmentMethod]?.icon || "📦"}
          title={
            FULFILLMENT_CONFIG[order.fulfillmentMethod]?.label || "Delivery"
          }
          action={{
            label: "View Farm",
            onPress: handleFarmPress,
          }}
        >
          <Text style={styles.infoText}>{order.farmName}</Text>
          {order.farmAddress && (
            <Text style={styles.infoTextSecondary}>{order.farmAddress}</Text>
          )}
          {order.farmPhone && (
            <TouchableOpacity onPress={handleContactFarm}>
              <Text style={styles.infoLink}>📞 {order.farmPhone}</Text>
            </TouchableOpacity>
          )}
        </InfoCard>

        {/* Delivery Address */}
        {order.fulfillmentMethod === "DELIVERY" && order.deliveryAddress && (
          <InfoCard icon="📍" title="Delivery Address">
            <Text style={styles.infoText}>
              {order.deliveryAddress.fullName}
            </Text>
            <Text style={styles.infoTextSecondary}>
              {order.deliveryAddress.street}
            </Text>
            <Text style={styles.infoTextSecondary}>
              {order.deliveryAddress.city}, {order.deliveryAddress.state}{" "}
              {order.deliveryAddress.zipCode}
            </Text>
            <Text style={styles.infoTextSecondary}>
              {order.deliveryAddress.phone}
            </Text>
          </InfoCard>
        )}

        {/* Special Instructions */}
        {order.specialInstructions && (
          <InfoCard icon="📝" title="Special Instructions">
            <Text style={styles.infoTextSecondary}>
              {order.specialInstructions}
            </Text>
          </InfoCard>
        )}

        {/* Payment Summary */}
        <InfoCard icon="💳" title="Payment Summary">
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Subtotal</Text>
            <Text style={styles.paymentValue}>
              ${order.subtotal.toFixed(2)}
            </Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Tax</Text>
            <Text style={styles.paymentValue}>${order.tax.toFixed(2)}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Delivery Fee</Text>
            <Text style={styles.paymentValue}>
              {order.deliveryFee === 0
                ? "FREE"
                : `$${order.deliveryFee.toFixed(2)}`}
            </Text>
          </View>
          {order.discount > 0 && (
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabelDiscount}>Discount</Text>
              <Text style={styles.paymentValueDiscount}>
                -${order.discount.toFixed(2)}
              </Text>
            </View>
          )}
          <View style={styles.paymentDivider} />
          <View style={styles.paymentRow}>
            <Text style={styles.paymentTotalLabel}>Total</Text>
            <Text style={styles.paymentTotalValue}>
              ${order.total.toFixed(2)}
            </Text>
          </View>
          <View style={styles.paymentStatusRow}>
            <Text style={styles.paymentStatusLabel}>Payment Status:</Text>
            <Text
              style={[
                styles.paymentStatusValue,
                order.paymentStatus === "PAID" && styles.paymentStatusPaid,
                order.paymentStatus === "REFUNDED" &&
                  styles.paymentStatusRefunded,
              ]}
            >
              {order.paymentStatus}
            </Text>
          </View>
        </InfoCard>

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomBar}>
        {canTrack && (
          <TouchableOpacity
            style={styles.trackButton}
            onPress={handleTrackDelivery}
          >
            <Text style={styles.trackButtonText}>🚚 Track Delivery</Text>
          </TouchableOpacity>
        )}

        {canCancel ? (
          <TouchableOpacity
            style={[styles.cancelButton, isCancelling && styles.buttonDisabled]}
            onPress={handleCancelOrder}
            disabled={isCancelling}
          >
            {isCancelling ? (
              <ActivityIndicator size="small" color={colors.error.main} />
            ) : (
              <Text style={styles.cancelButtonText}>Cancel Order</Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.reorderButton}
            onPress={handleReorder}
          >
            <Text style={styles.reorderButtonText}>🔄 Reorder</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.supportButton}
          onPress={handleContactSupport}
        >
          <Text style={styles.supportButtonText}>Need Help?</Text>
        </TouchableOpacity>
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
    backgroundColor: colors.background.secondary,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing[4],
    paddingTop: Platform.OS === "ios" ? spacing[12] : spacing[4],
    paddingBottom: spacing[3],
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    fontSize: 24,
    color: colors.text.primary,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  orderNumber: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  helpButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  helpIcon: {
    fontSize: 22,
  },

  // Loading & Error
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

  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[4],
    paddingBottom: spacing[32],
  },

  // Status Card
  statusCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[4],
    alignItems: "center",
    ...shadows.sm,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
    marginBottom: spacing[3],
  },
  statusBadgeIcon: {
    fontSize: 16,
    marginRight: spacing[2],
  },
  statusBadgeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.inverse,
  },
  statusDate: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  estimatedDelivery: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[600],
    fontWeight: typography.fontWeight.medium,
    marginTop: spacing[2],
  },
  cancelReasonBox: {
    backgroundColor: colors.error.light,
    borderRadius: borderRadius.md,
    padding: spacing[3],
    marginTop: spacing[3],
    width: "100%",
  },
  cancelReasonLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.error.dark,
    marginBottom: spacing[1],
  },
  cancelReasonText: {
    fontSize: typography.fontSize.sm,
    color: colors.error.dark,
  },

  // Timeline
  timelineContainer: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[4],
    ...shadows.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing[4],
  },
  timeline: {
    marginLeft: spacing[2],
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing[4],
    position: "relative",
  },
  timelineLine: {
    position: "absolute",
    left: 10,
    top: -20,
    width: 2,
    height: 20,
    backgroundColor: colors.neutral[300],
  },
  timelineLineActive: {
    backgroundColor: colors.primary[500],
  },
  timelineLineInactive: {
    backgroundColor: colors.neutral[200],
  },
  timelineDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing[3],
  },
  timelineDotCompleted: {
    backgroundColor: colors.success.main,
  },
  timelineDotCurrent: {
    backgroundColor: colors.primary[500],
  },
  timelineDotPending: {
    backgroundColor: colors.neutral[200],
    borderWidth: 2,
    borderColor: colors.neutral[300],
  },
  timelineDotCheck: {
    fontSize: 12,
    color: colors.text.inverse,
    fontWeight: typography.fontWeight.bold,
  },
  timelineDotPulse: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.text.inverse,
  },
  timelineContent: {
    flex: 1,
  },
  timelineLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  timelineLabelActive: {
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
  },
  timelineTime: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginTop: 2,
  },

  // Section
  section: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[4],
    ...shadows.sm,
  },

  // Item Card
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
  },
  itemImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral[100],
    justifyContent: "center",
    alignItems: "center",
  },
  itemImagePlaceholderText: {
    fontSize: 28,
  },
  itemInfo: {
    flex: 1,
    marginLeft: spacing[3],
  },
  itemName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  itemQuantity: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  itemTotal: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },

  // Info Card
  infoCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[4],
    ...shadows.sm,
  },
  infoCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing[3],
  },
  infoCardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoCardIcon: {
    fontSize: 20,
    marginRight: spacing[2],
  },
  infoCardTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  infoCardAction: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[500],
    fontWeight: typography.fontWeight.medium,
  },
  infoCardContent: {},
  infoText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  infoTextSecondary: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing[1],
    lineHeight: 20,
  },
  infoLink: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[500],
    marginTop: spacing[2],
  },

  // Payment Summary
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing[2],
  },
  paymentLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  paymentValue: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
  },
  paymentLabelDiscount: {
    fontSize: typography.fontSize.sm,
    color: colors.success.main,
  },
  paymentValueDiscount: {
    fontSize: typography.fontSize.sm,
    color: colors.success.main,
    fontWeight: typography.fontWeight.medium,
  },
  paymentDivider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing[3],
  },
  paymentTotalLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  paymentTotalValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[600],
  },
  paymentStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing[3],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  paymentStatusLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginRight: spacing[2],
  },
  paymentStatusValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  paymentStatusPaid: {
    color: colors.success.main,
  },
  paymentStatusRefunded: {
    color: colors.warning.main,
  },

  // Bottom Spacer
  bottomSpacer: {
    height: spacing[20],
  },

  // Bottom Bar
  bottomBar: {
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    paddingBottom: Platform.OS === "ios" ? spacing[8] : spacing[4],
    flexDirection: "row",
    gap: spacing[3],
    ...shadows.lg,
  },
  trackButton: {
    flex: 1,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.lg,
  },
  trackButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.inverse,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.error.main,
  },
  cancelButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.error.main,
  },
  reorderButton: {
    flex: 1,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.lg,
  },
  reorderButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.inverse,
  },
  supportButton: {
    height: 48,
    paddingHorizontal: spacing[4],
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
  },
  supportButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default OrderDetailScreen;
