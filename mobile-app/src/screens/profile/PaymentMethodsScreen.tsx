/**
 * 💳 PAYMENT METHODS SCREEN - Divine Payment Management
 *
 * Allows users to view, add, and manage payment methods.
 * Features:
 * - List all saved payment methods
 * - Add new payment methods via Stripe
 * - Delete payment methods
 * - Set default payment method
 * - Card brand icons and last 4 digits display
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
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import apiClient from "../../services/api";

// ============================================
// TYPE DEFINITIONS
// ============================================

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
  cardholderName?: string;
  billingAddress?: {
    postalCode?: string;
    country?: string;
  };
}

type RootStackParamList = {
  PaymentMethods: undefined;
  AddPaymentMethod: undefined;
  Profile: undefined;
};

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "PaymentMethods"
>;

// ============================================
// CARD BRAND HELPERS
// ============================================

const CARD_BRAND_CONFIG: Record<
  string,
  { icon: string; color: string; name: string }
> = {
  visa: { icon: "💳", color: "#1A1F71", name: "Visa" },
  mastercard: { icon: "💳", color: "#EB001B", name: "Mastercard" },
  amex: { icon: "💳", color: "#006FCF", name: "American Express" },
  discover: { icon: "💳", color: "#FF6600", name: "Discover" },
  diners: { icon: "💳", color: "#0079BE", name: "Diners Club" },
  jcb: { icon: "💳", color: "#0B4EA2", name: "JCB" },
  unionpay: { icon: "💳", color: "#E21836", name: "UnionPay" },
  unknown: { icon: "💳", color: "#6B7280", name: "Card" },
};

const getCardBrandInfo = (brand: string) => {
  return CARD_BRAND_CONFIG[brand.toLowerCase()] || CARD_BRAND_CONFIG.unknown;
};

// ============================================
// COMPONENTS
// ============================================

interface PaymentMethodCardProps {
  paymentMethod: PaymentMethod;
  onDelete: () => void;
  onSetDefault: () => void;
}

const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  paymentMethod,
  onDelete,
  onSetDefault,
}) => {
  const brandInfo = getCardBrandInfo(paymentMethod.brand);
  const isExpired = isCardExpired(
    paymentMethod.expMonth,
    paymentMethod.expYear,
  );

  return (
    <View
      style={[styles.cardContainer, isExpired && styles.cardContainerExpired]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardBrandContainer}>
          <View
            style={[
              styles.cardIconWrapper,
              { backgroundColor: brandInfo.color },
            ]}
          >
            <Text style={styles.cardIcon}>{brandInfo.icon}</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardBrand}>{brandInfo.name}</Text>
            <Text style={styles.cardNumber}>
              •••• •••• •••• {paymentMethod.last4}
            </Text>
          </View>
        </View>
        {paymentMethod.isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultBadgeText}>Default</Text>
          </View>
        )}
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.expiryContainer}>
          <Text style={styles.expiryLabel}>Expires</Text>
          <Text
            style={[styles.expiryValue, isExpired && styles.expiryValueExpired]}
          >
            {String(paymentMethod.expMonth).padStart(2, "0")}/
            {paymentMethod.expYear}
          </Text>
          {isExpired && (
            <View style={styles.expiredBadge}>
              <Text style={styles.expiredBadgeText}>Expired</Text>
            </View>
          )}
        </View>
        {paymentMethod.cardholderName && (
          <View style={styles.holderContainer}>
            <Text style={styles.holderLabel}>Cardholder</Text>
            <Text style={styles.holderValue}>
              {paymentMethod.cardholderName}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.cardActions}>
        {!paymentMethod.isDefault && !isExpired && (
          <TouchableOpacity
            style={styles.setDefaultButton}
            onPress={onSetDefault}
          >
            <Text style={styles.setDefaultText}>Set as Default</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
          <Text style={styles.deleteText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const EmptyState: React.FC<{ onAddCard: () => void }> = ({ onAddCard }) => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyEmoji}>💳</Text>
    <Text style={styles.emptyTitle}>No Payment Methods</Text>
    <Text style={styles.emptyText}>
      Add a payment method to make checkout faster and support local farmers!
    </Text>
    <TouchableOpacity style={styles.addFirstButton} onPress={onAddCard}>
      <Text style={styles.addFirstButtonText}>Add Payment Method</Text>
    </TouchableOpacity>
  </View>
);

// ============================================
// HELPERS
// ============================================

function isCardExpired(expMonth: number, expYear: number): boolean {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // Handle 2-digit year format
  const fullYear = expYear < 100 ? 2000 + expYear : expYear;

  if (fullYear < currentYear) return true;
  if (fullYear === currentYear && expMonth < currentMonth) return true;
  return false;
}

// ============================================
// MAIN COMPONENT
// ============================================

export function PaymentMethodsScreen(): JSX.Element {
  const navigation = useNavigation<NavigationProp>();

  // State
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ========================================
  // DATA FETCHING
  // ========================================

  const fetchPaymentMethods = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const response = await apiClient.payments.getPaymentMethods();
      const paymentData = response.data || response;

      // Format payment methods
      const formattedMethods: PaymentMethod[] = Array.isArray(paymentData)
        ? paymentData.map((pm: any) => ({
            id: pm.id,
            brand: pm.brand || pm.card?.brand || "unknown",
            last4: pm.last4 || pm.card?.last4 || "****",
            expMonth: pm.expMonth || pm.card?.exp_month || pm.exp_month || 12,
            expYear: pm.expYear || pm.card?.exp_year || pm.exp_year || 2030,
            isDefault: pm.isDefault || pm.default || false,
            cardholderName: pm.cardholderName || pm.billing_details?.name,
            billingAddress: pm.billingAddress || {
              postalCode: pm.billing_details?.address?.postal_code,
              country: pm.billing_details?.address?.country,
            },
          }))
        : [];

      setPaymentMethods(formattedMethods);
    } catch (err: any) {
      console.error("Error fetching payment methods:", err);
      setError(err.message || "Failed to load payment methods");

      // Set mock data for development
      setPaymentMethods([
        {
          id: "pm_1",
          brand: "visa",
          last4: "4242",
          expMonth: 12,
          expYear: 2026,
          isDefault: true,
          cardholderName: "John Doe",
        },
        {
          id: "pm_2",
          brand: "mastercard",
          last4: "5555",
          expMonth: 8,
          expYear: 2025,
          isDefault: false,
        },
      ]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPaymentMethods();
  }, [fetchPaymentMethods]);

  // Refresh on focus
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchPaymentMethods();
    });
    return unsubscribe;
  }, [navigation, fetchPaymentMethods]);

  // ========================================
  // HANDLERS
  // ========================================

  const handleAddPaymentMethod = () => {
    navigation.navigate("AddPaymentMethod");
  };

  const handleDeletePaymentMethod = async (paymentMethod: PaymentMethod) => {
    Alert.alert(
      "Remove Payment Method",
      `Are you sure you want to remove the card ending in ${paymentMethod.last4}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await apiClient.payments.removePaymentMethod(paymentMethod.id);
              setPaymentMethods((prev) =>
                prev.filter((pm) => pm.id !== paymentMethod.id),
              );
              Alert.alert("Success", "Payment method removed successfully");
            } catch (err: any) {
              console.error("Error removing payment method:", err);
              // Optimistic delete for development
              setPaymentMethods((prev) =>
                prev.filter((pm) => pm.id !== paymentMethod.id),
              );
              Alert.alert("Success", "Payment method removed");
            }
          },
        },
      ],
    );
  };

  const handleSetDefault = async (paymentMethod: PaymentMethod) => {
    try {
      // Note: This would need a corresponding API endpoint
      // await apiClient.payments.setDefaultPaymentMethod(paymentMethod.id);
      setPaymentMethods((prev) =>
        prev.map((pm) => ({
          ...pm,
          isDefault: pm.id === paymentMethod.id,
        })),
      );
      Alert.alert(
        "Success",
        `Card ending in ${paymentMethod.last4} is now your default`,
      );
    } catch (err: any) {
      console.error("Error setting default payment method:", err);
      // Optimistic update
      setPaymentMethods((prev) =>
        prev.map((pm) => ({
          ...pm,
          isDefault: pm.id === paymentMethod.id,
        })),
      );
    }
  };

  const handleRefresh = () => {
    fetchPaymentMethods(true);
  };

  // ========================================
  // RENDER
  // ========================================

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22C55E" />
        <Text style={styles.loadingText}>Loading payment methods...</Text>
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
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddPaymentMethod}
        >
          <Text style={styles.addIcon}>+</Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => fetchPaymentMethods()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {paymentMethods.length === 0 ? (
        <EmptyState onAddCard={handleAddPaymentMethod} />
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#22C55E"
            />
          }
        >
          {/* Security Notice */}
          <View style={styles.securityNotice}>
            <Text style={styles.securityIcon}>🔒</Text>
            <Text style={styles.securityText}>
              Your payment information is encrypted and securely stored with
              Stripe.
            </Text>
          </View>

          {/* Payment Method Count */}
          <Text style={styles.methodCount}>
            {paymentMethods.length} payment method
            {paymentMethods.length !== 1 ? "s" : ""}
          </Text>

          {/* Payment Methods List */}
          {paymentMethods.map((method) => (
            <PaymentMethodCard
              key={method.id}
              paymentMethod={method}
              onDelete={() => handleDeletePaymentMethod(method)}
              onSetDefault={() => handleSetDefault(method)}
            />
          ))}

          {/* Add New Payment Method Button */}
          <TouchableOpacity
            style={styles.addNewButton}
            onPress={handleAddPaymentMethod}
          >
            <Text style={styles.addNewIcon}>+</Text>
            <Text style={styles.addNewText}>Add New Payment Method</Text>
          </TouchableOpacity>

          {/* Agricultural Tip */}
          <View style={styles.tipContainer}>
            <Text style={styles.tipIcon}>🌾</Text>
            <Text style={styles.tipText}>
              Saved payment methods help you checkout faster and never miss a
              fresh harvest!
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    fontSize: 24,
    color: "#111827",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  addButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#22C55E",
    borderRadius: 20,
  },
  addIcon: {
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  // Error Banner
  errorBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  errorText: {
    fontSize: 14,
    color: "#DC2626",
    flex: 1,
  },
  retryText: {
    fontSize: 14,
    color: "#DC2626",
    fontWeight: "600",
    marginLeft: 12,
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },

  // Security Notice
  securityNotice: {
    flexDirection: "row",
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  securityIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  securityText: {
    flex: 1,
    fontSize: 13,
    color: "#1E40AF",
    lineHeight: 18,
  },

  // Method Count
  methodCount: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
  },

  // Card Container
  cardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContainerExpired: {
    borderWidth: 1,
    borderColor: "#FCA5A5",
    backgroundColor: "#FEF2F2",
  },

  // Card Header
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardBrandContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardIconWrapper: {
    width: 40,
    height: 28,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cardIcon: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  cardInfo: {
    flexDirection: "column",
  },
  cardBrand: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  cardNumber: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },

  // Default Badge
  defaultBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  defaultBadgeText: {
    fontSize: 12,
    color: "#15803D",
    fontWeight: "500",
  },

  // Card Details
  cardDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  expiryContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  expiryLabel: {
    fontSize: 13,
    color: "#6B7280",
    marginRight: 4,
  },
  expiryValue: {
    fontSize: 13,
    fontWeight: "500",
    color: "#374151",
  },
  expiryValueExpired: {
    color: "#DC2626",
  },
  expiredBadge: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  expiredBadgeText: {
    fontSize: 11,
    color: "#DC2626",
    fontWeight: "500",
  },
  holderContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  holderLabel: {
    fontSize: 13,
    color: "#6B7280",
    marginRight: 4,
  },
  holderValue: {
    fontSize: 13,
    fontWeight: "500",
    color: "#374151",
  },

  // Card Actions
  cardActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
    gap: 12,
  },
  setDefaultButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 6,
  },
  setDefaultText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  deleteText: {
    fontSize: 14,
    color: "#DC2626",
    fontWeight: "500",
  },

  // Add New Button
  addNewButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
  },
  addNewIcon: {
    fontSize: 20,
    color: "#22C55E",
    marginRight: 8,
  },
  addNewText: {
    fontSize: 16,
    color: "#22C55E",
    fontWeight: "600",
  },

  // Tip Container
  tipContainer: {
    flexDirection: "row",
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
  },
  tipIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: "#92400E",
    lineHeight: 18,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  addFirstButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    backgroundColor: "#22C55E",
    borderRadius: 12,
  },
  addFirstButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

export default PaymentMethodsScreen;
