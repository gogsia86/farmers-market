/**
 * 📦 ORDERS SCREEN - Farmers Market Mobile App
 *
 * Order history and tracking with:
 * - Order list with status indicators
 * - Filter by order status
 * - Order details navigation
 * - Pull to refresh
 * - Empty state
 *
 * @reference Agricultural consciousness patterns
 */

import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { theme } from "../../theme";
import { useAuthStore } from "../../stores/authStore";
import apiClient from "../../services/api";

// ========================================
// 🎯 TYPES
// ========================================

interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  createdAt: string;
  total: number;
  itemCount: number;
  farmName: string;
  items: OrderItem[];
}

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
}

type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "FULFILLED"
  | "COMPLETED"
  | "CANCELLED";

type FilterStatus = "ALL" | OrderStatus;

// ========================================
// 📦 CONSTANTS
// ========================================

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; icon: string; bgColor: string }
> = {
  PENDING: {
    label: "Pending",
    color: theme.colors.secondary[600],
    icon: "⏳",
    bgColor: theme.colors.secondary[100],
  },
  CONFIRMED: {
    label: "Confirmed",
    color: theme.colors.info.main,
    icon: "✓",
    bgColor: theme.colors.info.light,
  },
  PREPARING: {
    label: "Preparing",
    color: theme.colors.primary[600],
    icon: "🥬",
    bgColor: theme.colors.primary[100],
  },
  READY: {
    label: "Ready",
    color: theme.colors.success.main,
    icon: "📦",
    bgColor: theme.colors.success.light,
  },
  FULFILLED: {
    label: "On the way",
    color: theme.colors.accent[600],
    icon: "🚚",
    bgColor: theme.colors.accent[100],
  },
  COMPLETED: {
    label: "Completed",
    color: theme.colors.success.dark,
    icon: "✅",
    bgColor: theme.colors.success.light,
  },
  CANCELLED: {
    label: "Cancelled",
    color: theme.colors.error.main,
    icon: "✕",
    bgColor: theme.colors.error.light,
  },
};

const FILTER_OPTIONS: { value: FilterStatus; label: string }[] = [
  { value: "ALL", label: "All Orders" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PREPARING", label: "Preparing" },
  { value: "READY", label: "Ready" },
  { value: "FULFILLED", label: "On the way" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

// ========================================
// 🎨 SUB-COMPONENTS
// ========================================

const Header = ({ onBack }: { onBack: () => void }) => (
  <View style={styles.header}>
    <TouchableOpacity onPress={onBack} style={styles.backButton}>
      <Text style={styles.backIcon}>←</Text>
    </TouchableOpacity>
    <Text style={styles.headerTitle}>My Orders</Text>
    <View style={styles.placeholder} />
  </View>
);

const FilterTabs = ({
  selectedFilter,
  onSelectFilter,
}: {
  selectedFilter: FilterStatus;
  onSelectFilter: (filter: FilterStatus) => void;
}) => (
  <FlatList
    horizontal
    data={FILTER_OPTIONS}
    keyExtractor={(item) => item.value}
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.filterTabsContainer}
    renderItem={({ item }) => {
      const isSelected = selectedFilter === item.value;
      return (
        <TouchableOpacity
          style={[styles.filterTab, isSelected && styles.filterTabSelected]}
          onPress={() => onSelectFilter(item.value)}
        >
          <Text
            style={[
              styles.filterTabText,
              isSelected && styles.filterTabTextSelected,
            ]}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      );
    }}
  />
);

const StatusBadge = ({ status }: { status: OrderStatus }) => {
  const config = STATUS_CONFIG[status];
  return (
    <View style={[styles.statusBadge, { backgroundColor: config.bgColor }]}>
      <Text style={styles.statusIcon}>{config.icon}</Text>
      <Text style={[styles.statusText, { color: config.color }]}>
        {config.label}
      </Text>
    </View>
  );
};

const OrderCard = ({
  order,
  onPress,
}: {
  order: Order;
  onPress: () => void;
}) => {
  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const formattedTime = new Date(order.createdAt).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Order Header */}
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
          <Text style={styles.orderDate}>
            {formattedDate} at {formattedTime}
          </Text>
        </View>
        <StatusBadge status={order.status} />
      </View>

      {/* Farm Info */}
      <View style={styles.farmInfo}>
        <Text style={styles.farmIcon}>🌾</Text>
        <Text style={styles.farmName}>{order.farmName}</Text>
      </View>

      {/* Order Items Preview */}
      <View style={styles.itemsPreview}>
        {order.items.slice(0, 2).map((item) => (
          <Text key={item.id} style={styles.itemText} numberOfLines={1}>
            {item.quantity}x {item.productName}
          </Text>
        ))}
        {order.items.length > 2 && (
          <Text style={styles.moreItems}>
            +{order.items.length - 2} more items
          </Text>
        )}
      </View>

      {/* Order Footer */}
      <View style={styles.orderFooter}>
        <Text style={styles.itemCount}>
          {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
        </Text>
        <Text style={styles.orderTotal}>${order.total.toFixed(2)}</Text>
      </View>

      {/* Action Hint */}
      <View style={styles.actionHint}>
        <Text style={styles.actionHintText}>Tap to view details →</Text>
      </View>
    </TouchableOpacity>
  );
};

const EmptyState = ({
  filter,
  onBrowse,
}: {
  filter: FilterStatus;
  onBrowse: () => void;
}) => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyEmoji}>📦</Text>
    <Text style={styles.emptyTitle}>
      {filter === "ALL" ? "No orders yet" : `No ${filter.toLowerCase()} orders`}
    </Text>
    <Text style={styles.emptyText}>
      {filter === "ALL"
        ? "Start shopping to see your orders here"
        : "Orders with this status will appear here"}
    </Text>
    {filter === "ALL" && (
      <TouchableOpacity style={styles.browseButton} onPress={onBrowse}>
        <Text style={styles.browseButtonText}>Browse Products</Text>
      </TouchableOpacity>
    )}
  </View>
);

const LoadingState = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={theme.colors.primary[500]} />
    <Text style={styles.loadingText}>Loading your orders...</Text>
  </View>
);

// ========================================
// 📦 MAIN COMPONENT
// ========================================

export const OrdersScreen = () => {
  const navigation = useNavigation<any>();
  const { isAuthenticated } = useAuthStore();

  // State
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterStatus>("ALL");
  const [error, setError] = useState<string | null>(null);

  // ========================================
  // 🔄 DATA FETCHING
  // ========================================

  const fetchOrders = useCallback(
    async (refresh: boolean = false) => {
      try {
        if (refresh) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }
        setError(null);

        const params: any = {};
        if (filter !== "ALL") {
          params.status = filter;
        }

        const response = await apiClient.orders.getAll(params);

        const fetchedOrders: Order[] = (response.data || []).map((o: any) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          status: o.status,
          createdAt: o.createdAt,
          total: o.total,
          itemCount: o.items?.length || 0,
          farmName: o.farm?.name || "Local Farm",
          items: (o.items || []).map((i: any) => ({
            id: i.id,
            productName: i.productName || i.product?.name || "Product",
            quantity: i.quantity,
            price: i.unitPrice || i.price,
          })),
        }));

        setOrders(fetchedOrders);
      } catch (err: any) {
        console.error("❌ Failed to fetch orders:", err);
        setError(err.message || "Failed to load orders");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [filter],
  );

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    } else {
      setIsLoading(false);
    }
  }, [fetchOrders, isAuthenticated]);

  // ========================================
  // 🎯 HANDLERS
  // ========================================

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleRefresh = useCallback(() => {
    fetchOrders(true);
  }, [fetchOrders]);

  const handleFilterChange = useCallback((newFilter: FilterStatus) => {
    setFilter(newFilter);
  }, []);

  const handleOrderPress = useCallback(
    (orderId: string) => {
      navigation.navigate("OrderDetail", { orderId });
    },
    [navigation],
  );

  const handleBrowseProducts = useCallback(() => {
    navigation.navigate("Products");
  }, [navigation]);

  // ========================================
  // 🎨 RENDER
  // ========================================

  const renderOrder = ({ item }: { item: Order }) => (
    <OrderCard order={item} onPress={() => handleOrderPress(item.id)} />
  );

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <Header onBack={handleBack} />
        <View style={styles.authContainer}>
          <Text style={styles.authEmoji}>🔒</Text>
          <Text style={styles.authTitle}>Sign in to view orders</Text>
          <Text style={styles.authText}>
            Please log in to see your order history
          </Text>
          <TouchableOpacity
            style={styles.authButton}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.authButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header onBack={handleBack} />

      <FilterTabs selectedFilter={filter} onSelectFilter={handleFilterChange} />

      {isLoading ? (
        <LoadingState />
      ) : orders.length === 0 ? (
        <EmptyState filter={filter} onBrowse={handleBrowseProducts} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrder}
          contentContainerStyle={styles.ordersList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary[500]}
              colors={[theme.colors.primary[500]]}
            />
          }
        />
      )}
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

  placeholder: {
    width: 40,
  },

  // Filter Tabs
  filterTabsContainer: {
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
  },

  filterTab: {
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
    marginRight: theme.spacing[2],
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },

  filterTabSelected: {
    backgroundColor: theme.colors.primary[500],
    borderColor: theme.colors.primary[500],
  },

  filterTabText: {
    ...theme.typography.styles.body2,
    color: theme.colors.text.secondary,
  },

  filterTabTextSelected: {
    color: theme.colors.text.inverse,
    fontWeight: "600",
  },

  // Orders List
  ordersList: {
    paddingHorizontal: theme.spacing[4],
    paddingBottom: theme.spacing[8],
  },

  // Order Card
  orderCard: {
    backgroundColor: theme.colors.surface.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[4],
    marginBottom: theme.spacing[3],
    ...theme.shadows.sm,
  },

  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: theme.spacing[3],
  },

  orderNumber: {
    ...theme.typography.styles.h5,
    color: theme.colors.text.primary,
  },

  orderDate: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.tertiary,
    marginTop: 2,
  },

  // Status Badge
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[1],
    borderRadius: theme.borderRadius.full,
  },

  statusIcon: {
    fontSize: 12,
    marginRight: theme.spacing[1],
  },

  statusText: {
    ...theme.typography.styles.caption,
    fontWeight: "600",
  },

  // Farm Info
  farmInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing[3],
    paddingBottom: theme.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },

  farmIcon: {
    fontSize: 16,
    marginRight: theme.spacing[2],
  },

  farmName: {
    ...theme.typography.styles.body2,
    color: theme.colors.text.secondary,
    fontWeight: "500",
  },

  // Items Preview
  itemsPreview: {
    marginBottom: theme.spacing[3],
  },

  itemText: {
    ...theme.typography.styles.body2,
    color: theme.colors.text.primary,
    marginBottom: 2,
  },

  moreItems: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.tertiary,
    marginTop: 2,
  },

  // Order Footer
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: theme.spacing[3],
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },

  itemCount: {
    ...theme.typography.styles.caption,
    color: theme.colors.text.tertiary,
  },

  orderTotal: {
    ...theme.typography.styles.h5,
    color: theme.colors.primary[600],
  },

  // Action Hint
  actionHint: {
    alignItems: "flex-end",
    marginTop: theme.spacing[2],
  },

  actionHintText: {
    ...theme.typography.styles.caption,
    color: theme.colors.primary[500],
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

  // Auth State
  authContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing[8],
  },

  authEmoji: {
    fontSize: 64,
    marginBottom: theme.spacing[4],
  },

  authTitle: {
    ...theme.typography.styles.h4,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  },

  authText: {
    ...theme.typography.styles.body1,
    color: theme.colors.text.secondary,
    textAlign: "center",
    marginBottom: theme.spacing[6],
  },

  authButton: {
    backgroundColor: theme.colors.primary[500],
    paddingVertical: theme.spacing[4],
    paddingHorizontal: theme.spacing[8],
    borderRadius: theme.borderRadius.md,
  },

  authButtonText: {
    ...theme.typography.styles.body1,
    color: theme.colors.text.inverse,
    fontWeight: "600",
  },
});

// ========================================
// 📦 EXPORTS
// ========================================

export default OrdersScreen;
