/**
 * 💳 CHECKOUT SCREEN - Divine Payment Flow
 *
 * Comprehensive checkout experience with:
 * - Order summary
 * - Shipping address selection/entry
 * - Delivery method selection
 * - Payment method selection (Stripe)
 * - Order confirmation
 * - Promo code support
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
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCartStore, useCartItems, useCartTotals } from "@/stores/cartStore";
import apiClient from "@/services/api";
import { colors, spacing, typography, shadows, borderRadius } from "@/theme";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";

// ============================================
// TYPE DEFINITIONS
// ============================================

interface Address {
  id: string;
  label: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  isDefault: boolean;
}

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

interface DeliveryOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
  icon: string;
}

type CheckoutStep = "review" | "shipping" | "delivery" | "payment" | "confirm";

type RootStackParamList = {
  Checkout: undefined;
  OrderConfirmation: { orderId: string };
  AddAddress: undefined;
  AddPaymentMethod: undefined;
  Cart: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// ============================================
// CONSTANTS
// ============================================

const DELIVERY_OPTIONS: DeliveryOption[] = [
  {
    id: "standard",
    name: "Standard Delivery",
    description: "Delivered to your door",
    price: 5.99,
    estimatedDays: "3-5 business days",
    icon: "🚚",
  },
  {
    id: "express",
    name: "Express Delivery",
    description: "Fast delivery to your door",
    price: 12.99,
    estimatedDays: "1-2 business days",
    icon: "⚡",
  },
  {
    id: "farm_pickup",
    name: "Farm Pickup",
    description: "Pick up directly from the farm",
    price: 0,
    estimatedDays: "Same day available",
    icon: "🌾",
  },
  {
    id: "market_pickup",
    name: "Market Pickup",
    description: "Pick up at local farmers market",
    price: 0,
    estimatedDays: "Next market day",
    icon: "🏪",
  },
];

// ============================================
// SUB-COMPONENTS
// ============================================

/**
 * Step Indicator
 */
const StepIndicator: React.FC<{
  currentStep: CheckoutStep;
  steps: { key: CheckoutStep; label: string }[];
}> = ({ currentStep, steps }) => {
  const currentIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <View style={styles.stepIndicator}>
      {steps.map((step, index) => (
        <React.Fragment key={step.key}>
          <View style={styles.stepItem}>
            <View
              style={[
                styles.stepCircle,
                index <= currentIndex && styles.stepCircleActive,
                index < currentIndex && styles.stepCircleCompleted,
              ]}
            >
              {index < currentIndex ? (
                <Text style={styles.stepCheckmark}>✓</Text>
              ) : (
                <Text
                  style={[
                    styles.stepNumber,
                    index <= currentIndex && styles.stepNumberActive,
                  ]}
                >
                  {index + 1}
                </Text>
              )}
            </View>
            <Text
              style={[
                styles.stepLabel,
                index <= currentIndex && styles.stepLabelActive,
              ]}
            >
              {step.label}
            </Text>
          </View>
          {index < steps.length - 1 && (
            <View
              style={[
                styles.stepLine,
                index < currentIndex && styles.stepLineActive,
              ]}
            />
          )}
        </React.Fragment>
      ))}
    </View>
  );
};

/**
 * Cart Item for Order Summary
 */
interface CartItemSummary {
  id: string;
  productName: string;
  productImage?: string;
  quantity: number;
  price: number;
}

/**
 * Cart Totals for Order Summary
 */
interface CartTotalsSummary {
  subtotal: number;
  tax: number;
  total: number;
}

/**
 * Order Summary Card
 */
const OrderSummaryCard: React.FC<{
  items: CartItemSummary[];
  totals: CartTotalsSummary;
  deliveryFee: number;
  discount: number;
  promoCode?: string;
}> = ({ items, totals, deliveryFee, discount }) => {
  const _finalTotal = totals.subtotal + totals.tax + deliveryFee - discount;

  return (
    <View style={styles.summaryCard}>
      <Text style={styles.cardTitle}>Order Summary</Text>

      {/* Items */}
      {items.map((item) => (
        <View key={item.id} style={styles.summaryItem}>
          <View style={styles.summaryItemLeft}>
            {item.productImage ? (
              <Image
                source={{ uri: item.productImage }}
                style={styles.summaryItemImage}
              />
            ) : (
              <View style={styles.summaryItemImagePlaceholder}>
                <Text style={styles.summaryItemPlaceholderText}>🥬</Text>
              </View>
            )}
            <View style={styles.summaryItemInfo}>
              <Text style={styles.summaryItemName} numberOfLines={1}>
                {item.productName}
              </Text>
              <Text style={styles.summaryItemQuantity}>
                Qty: {item.quantity} × ${item.price.toFixed(2)}
              </Text>
            </View>
          </View>
          <Text style={styles.summaryItemPrice}>
            ${(item.price * item.quantity).toFixed(2)}
          </Text>
        </View>
      ))}

      {/* Divider */}
      <View style={styles.divider} />

      {/* Totals */}
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Subtotal</Text>
        <Text style={styles.totalValue}>${totals.subtotal.toFixed(2)}</Text>
      </View>

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Tax</Text>
        <Text style={styles.totalValue}>${totals.tax.toFixed(2)}</Text>
      </View>

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Delivery</Text>
        <Text style={styles.totalValue}>
          {deliveryFee === 0 ? "FREE" : `$${deliveryFee.toFixed(2)}`}
        </Text>
      </View>

      {discount > 0 && (
        <View style={styles.totalRow}>
          <Text style={styles.discountLabel}>
            Discount {promoCode && `(${promoCode})`}
          </Text>
          <Text style={styles.discountValue}>-${discount.toFixed(2)}</Text>
        </View>
      )}

      <View style={styles.divider} />

      <View style={styles.totalRow}>
        <Text style={styles.grandTotalLabel}>Total</Text>
        <Text style={styles.grandTotalValue}>${finalTotal.toFixed(2)}</Text>
      </View>
    </View>
  );
};

/**
 * Address Card
 */
const AddressCard: React.FC<{
  address: Address;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ address, isSelected, onSelect }) => {
  return (
    <TouchableOpacity
      style={[styles.addressCard, isSelected && styles.addressCardSelected]}
      onPress={onSelect}
    >
      <View style={styles.addressCardHeader}>
        <View style={styles.addressLabelContainer}>
          <Text style={styles.addressLabel}>{address.label}</Text>
          {address.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultBadgeText}>Default</Text>
            </View>
          )}
        </View>
        <View
          style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}
        >
          {isSelected && <View style={styles.radioInner} />}
        </View>
      </View>
      <Text style={styles.addressName}>{address.fullName}</Text>
      <Text style={styles.addressText}>{address.street}</Text>
      <Text style={styles.addressText}>
        {address.city}, {address.state} {address.zipCode}
      </Text>
      <Text style={styles.addressPhone}>{address.phone}</Text>
    </TouchableOpacity>
  );
};

/**
 * Delivery Option Card
 */
const DeliveryOptionCard: React.FC<{
  option: DeliveryOption;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ option, isSelected, onSelect }) => {
  return (
    <TouchableOpacity
      style={[styles.deliveryCard, isSelected && styles.deliveryCardSelected]}
      onPress={onSelect}
    >
      <View style={styles.deliveryCardLeft}>
        <Text style={styles.deliveryIcon}>{option.icon}</Text>
        <View style={styles.deliveryInfo}>
          <Text style={styles.deliveryName}>{option.name}</Text>
          <Text style={styles.deliveryDescription}>{option.description}</Text>
          <Text style={styles.deliveryTime}>{option.estimatedDays}</Text>
        </View>
      </View>
      <View style={styles.deliveryCardRight}>
        <Text style={styles.deliveryPrice}>
          {option.price === 0 ? "FREE" : `$${option.price.toFixed(2)}`}
        </Text>
        <View
          style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}
        >
          {isSelected && <View style={styles.radioInner} />}
        </View>
      </View>
    </TouchableOpacity>
  );
};

/**
 * Payment Method Card
 */
const PaymentMethodCard: React.FC<{
  method: PaymentMethod;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ method, isSelected, onSelect }) => {
  const brandIcons: Record<string, string> = {
    visa: "💳",
    mastercard: "💳",
    amex: "💳",
    discover: "💳",
  };

  return (
    <TouchableOpacity
      style={[styles.paymentCard, isSelected && styles.paymentCardSelected]}
      onPress={onSelect}
    >
      <View style={styles.paymentCardLeft}>
        <Text style={styles.paymentIcon}>
          {brandIcons[method.brand.toLowerCase()] || "💳"}
        </Text>
        <View style={styles.paymentInfo}>
          <Text style={styles.paymentBrand}>
            {method.brand.charAt(0).toUpperCase() + method.brand.slice(1)} ••••{" "}
            {method.last4}
          </Text>
          <Text style={styles.paymentExpiry}>
            Expires {method.expMonth}/{method.expYear}
          </Text>
        </View>
      </View>
      <View
        style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}
      >
        {isSelected && <View style={styles.radioInner} />}
      </View>
    </TouchableOpacity>
  );
};

/**
 * Promo Code Input
 */
const PromoCodeInput: React.FC<{
  value: string;
  onChange: (text: string) => void;
  onApply: () => void;
  isApplied: boolean;
  isLoading: boolean;
  discount: number;
}> = ({ value, onChange, onApply, isApplied, isLoading, discount }) => {
  return (
    <View style={styles.promoContainer}>
      <Text style={styles.promoLabel}>Promo Code</Text>
      <View style={styles.promoInputRow}>
        <TextInput
          style={[styles.promoInput, isApplied && styles.promoInputApplied]}
          placeholder="Enter promo code"
          placeholderTextColor={colors.text.tertiary}
          value={value}
          onChangeText={onChange}
          autoCapitalize="characters"
          editable={!isApplied}
        />
        <TouchableOpacity
          style={[styles.promoButton, isApplied && styles.promoButtonApplied]}
          onPress={onApply}
          disabled={isLoading || (!value && !isApplied)}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.text.inverse} />
          ) : (
            <Text style={styles.promoButtonText}>
              {isApplied ? "Remove" : "Apply"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
      {isApplied && (
        <Text style={styles.promoAppliedText}>
          ✓ Promo code applied! You save ${discount.toFixed(2)}
        </Text>
      )}
    </View>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export const CheckoutScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const cartItems = useCartItems();
  const cartTotals = useCartTotals();
  const { clearCart } = useCartStore();

  // Stripe checkout hook
  const {
    processCheckout,
    validateCheckout,
    isProcessing: _stripeProcessing,
    error: stripeError,
  } = useStripeCheckout();

  // Steps
  const steps: { key: CheckoutStep; label: string }[] = [
    { key: "review", label: "Review" },
    { key: "shipping", label: "Shipping" },
    { key: "delivery", label: "Delivery" },
    { key: "payment", label: "Payment" },
  ];

  // State
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("review");
  const [_isLoading, _setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Address state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);

  // Delivery state
  const [selectedDeliveryId, setSelectedDeliveryId] =
    useState<string>("standard");

  // Payment state
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(
    null,
  );
  const [isLoadingPayments, setIsLoadingPayments] = useState(true);

  // Promo code state
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromoCode, setAppliedPromoCode] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  // Notes
  const [specialInstructions, setSpecialInstructions] = useState("");

  // Calculated values
  const selectedDelivery = DELIVERY_OPTIONS.find(
    (d) => d.id === selectedDeliveryId,
  );
  const deliveryFee = selectedDelivery?.price || 0;
  const finalTotal =
    cartTotals.subtotal + cartTotals.tax + deliveryFee - discount;

  // ========================================
  // DATA FETCHING
  // ========================================

  const fetchAddresses = useCallback(async () => {
    try {
      setIsLoadingAddresses(true);
      const response = await apiClient.user.getAddresses();
      const addressData = response.data || response || [];

      const formattedAddresses: Address[] = Array.isArray(addressData)
        ? addressData.map((addr: Record<string, unknown>) => ({
            id: addr.id,
            label: addr.label || addr.type || "Address",
            fullName:
              addr.fullName ||
              `${addr.firstName || ""} ${addr.lastName || ""}`.trim(),
            street: addr.street || addr.address1 || "",
            city: addr.city || "",
            state: addr.state || "",
            zipCode: addr.zipCode || addr.postalCode || "",
            phone: addr.phone || "",
            isDefault: addr.isDefault || false,
          }))
        : [];

      setAddresses(formattedAddresses);

      // Select default address
      const defaultAddr = formattedAddresses.find((a) => a.isDefault);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
      } else if (formattedAddresses.length > 0) {
        setSelectedAddressId(formattedAddresses[0].id);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
      // Add mock address for demo
      const mockAddress: Address = {
        id: "mock-1",
        label: "Home",
        fullName: "John Doe",
        street: "123 Farm Road",
        city: "Greenville",
        state: "CA",
        zipCode: "90210",
        phone: "(555) 123-4567",
        isDefault: true,
      };
      setAddresses([mockAddress]);
      setSelectedAddressId(mockAddress.id);
    } finally {
      setIsLoadingAddresses(false);
    }
  }, []);

  const fetchPaymentMethods = useCallback(async () => {
    try {
      setIsLoadingPayments(true);
      const response = await apiClient.payments.getPaymentMethods();
      const paymentData = response.data || response || [];

      const formattedPayments: PaymentMethod[] = Array.isArray(paymentData)
        ? paymentData.map((pm: Record<string, unknown>) => ({
            id: pm.id as string,
            brand:
              (pm.brand as string) ||
              ((pm.card as Record<string, unknown>)?.brand as string) ||
              "card",
            last4:
              (pm.last4 as string) ||
              ((pm.card as Record<string, unknown>)?.last4 as string) ||
              "****",
            expMonth:
              (pm.expMonth as number) ||
              ((pm.card as Record<string, unknown>)?.exp_month as number) ||
              12,
            expYear:
              (pm.expYear as number) ||
              ((pm.card as Record<string, unknown>)?.exp_year as number) ||
              2025,
            isDefault: (pm.isDefault as boolean) || false,
          }))
        : [];

      setPaymentMethods(formattedPayments);

      // Select default payment
      const defaultPm = formattedPayments.find((p) => p.isDefault);
      if (defaultPm) {
        setSelectedPaymentId(defaultPm.id);
      } else if (formattedPayments.length > 0) {
        setSelectedPaymentId(formattedPayments[0].id);
      }
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      // Add mock payment for demo
      const mockPayment: PaymentMethod = {
        id: "mock-pm-1",
        brand: "visa",
        last4: "4242",
        expMonth: 12,
        expYear: 2025,
        isDefault: true,
      };
      setPaymentMethods([mockPayment]);
      setSelectedPaymentId(mockPayment.id);
    } finally {
      setIsLoadingPayments(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
    fetchPaymentMethods();
  }, [fetchAddresses, fetchPaymentMethods]);

  // ========================================
  // HANDLERS
  // ========================================

  const handleApplyPromo = async () => {
    if (appliedPromoCode) {
      // Remove promo code
      setAppliedPromoCode(null);
      setDiscount(0);
      setPromoCode("");
      return;
    }

    if (!promoCode.trim()) return;

    setIsApplyingPromo(true);
    try {
      // TODO: Implement actual promo code validation API
      // Simulating API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock discount - in production, this would come from API
      const mockDiscount =
        promoCode.toUpperCase() === "FRESH10" ? cartTotals.subtotal * 0.1 : 0;

      if (mockDiscount > 0) {
        setDiscount(mockDiscount);
        setAppliedPromoCode(promoCode.toUpperCase());
      } else {
        Alert.alert(
          "Invalid Code",
          "This promo code is not valid or has expired.",
        );
      }
    } catch (_error) {
      Alert.alert("Error", "Failed to apply promo code. Please try again.");
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const handleContinue = () => {
    const stepIndex = steps.findIndex((s) => s.key === currentStep);

    // Validation
    if (currentStep === "shipping" && !selectedAddressId) {
      Alert.alert("Missing Address", "Please select a shipping address.");
      return;
    }

    if (currentStep === "payment" && !selectedPaymentId) {
      Alert.alert("Missing Payment", "Please select a payment method.");
      return;
    }

    if (stepIndex < steps.length - 1) {
      setCurrentStep(steps[stepIndex + 1].key);
    } else {
      handlePlaceOrder();
    }
  };

  const handleBack = () => {
    const stepIndex = steps.findIndex((s) => s.key === currentStep);
    if (stepIndex > 0) {
      setCurrentStep(steps[stepIndex - 1].key);
    } else {
      navigation.goBack();
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId || !selectedPaymentId) {
      Alert.alert(
        "Missing Information",
        "Please complete all required fields.",
      );
      return;
    }

    // Get selected address for checkout options
    const selectedAddress = addresses.find((a) => a.id === selectedAddressId);
    if (!selectedAddress) {
      Alert.alert("Error", "Please select a valid shipping address.");
      return;
    }

    setIsProcessing(true);
    try {
      // Prepare checkout options for Stripe integration
      const checkoutOptions = {
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          name: item.name,
        })),
        shippingAddress: {
          id: selectedAddress.id,
          fullName: selectedAddress.fullName,
          street: selectedAddress.street,
          city: selectedAddress.city,
          state: selectedAddress.state,
          zipCode: selectedAddress.zipCode,
          phone: selectedAddress.phone,
        },
        deliveryMethod: selectedDeliveryId.toUpperCase() as
          | "DELIVERY"
          | "PICKUP"
          | "SHIPPING",
        paymentMethodId: selectedPaymentId,
        promoCode: appliedPromoCode || undefined,
        specialInstructions: specialInstructions || undefined,
      };

      // Calculate totals
      const totals = {
        subtotal: cartTotals.subtotal,
        tax: cartTotals.tax,
        deliveryFee,
        discount,
        total: finalTotal,
      };

      // Validate checkout before processing
      const validation = validateCheckout(checkoutOptions);
      if (!validation.valid) {
        Alert.alert("Validation Error", validation.errors.join("\n"));
        setIsProcessing(false);
        return;
      }

      // Process checkout with Stripe
      const result = await processCheckout(checkoutOptions, totals);

      if (result.success && result.orderId) {
        // Clear cart on success
        await clearCart();

        // Navigate to confirmation
        Alert.alert(
          "Order Placed! 🎉",
          "Your order has been successfully placed. You will receive a confirmation email shortly.",
          [
            {
              text: "View Order",
              onPress: () =>
                navigation.navigate("OrderConfirmation", {
                  orderId: result.orderId!,
                }),
            },
          ],
        );
      } else if (result.requiresAction) {
        // Handle 3D Secure or additional authentication
        Alert.alert(
          "Authentication Required",
          "Your bank requires additional verification. Please complete the authentication to proceed.",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Continue",
              onPress: () => {
                // Re-attempt with authentication
                // The Stripe SDK will handle the 3DS flow automatically
                handlePlaceOrder();
              },
            },
          ],
        );
      } else {
        throw new Error(result.error || "Payment failed");
      }
    } catch (error: unknown) {
      console.error("Order placement error:", error);
      Alert.alert(
        "Order Failed",
        error.message ||
          stripeError ||
          "There was an error processing your order. Please try again.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddAddress = () => {
    navigation.navigate("AddAddress");
  };

  const handleAddPaymentMethod = () => {
    navigation.navigate("AddPaymentMethod");
  };

  // ========================================
  // RENDER STEPS
  // ========================================

  const renderReviewStep = () => (
    <View style={styles.stepContent}>
      <OrderSummaryCard
        items={cartItems}
        totals={cartTotals}
        deliveryFee={deliveryFee}
        discount={discount}
        promoCode={appliedPromoCode || undefined}
      />

      <PromoCodeInput
        value={promoCode}
        onChange={setPromoCode}
        onApply={handleApplyPromo}
        isApplied={!!appliedPromoCode}
        isLoading={isApplyingPromo}
        discount={discount}
      />

      <View style={styles.notesContainer}>
        <Text style={styles.notesLabel}>Special Instructions (Optional)</Text>
        <TextInput
          style={styles.notesInput}
          placeholder="Add any special requests or delivery instructions..."
          placeholderTextColor={colors.text.tertiary}
          value={specialInstructions}
          onChangeText={setSpecialInstructions}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>
    </View>
  );

  const renderShippingStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.sectionTitle}>Shipping Address</Text>

      {isLoadingAddresses ? (
        <View style={styles.loadingSection}>
          <ActivityIndicator size="small" color={colors.primary[500]} />
          <Text style={styles.loadingText}>Loading addresses...</Text>
        </View>
      ) : addresses.length === 0 ? (
        <View style={styles.emptySection}>
          <Text style={styles.emptyText}>No saved addresses</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddAddress}>
            <Text style={styles.addButtonText}>+ Add Address</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              isSelected={selectedAddressId === address.id}
              onSelect={() => setSelectedAddressId(address.id)}
            />
          ))}
          <TouchableOpacity
            style={styles.addNewButton}
            onPress={handleAddAddress}
          >
            <Text style={styles.addNewButtonText}>+ Add New Address</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  const renderDeliveryStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.sectionTitle}>Delivery Method</Text>

      {DELIVERY_OPTIONS.map((option) => (
        <DeliveryOptionCard
          key={option.id}
          option={option}
          isSelected={selectedDeliveryId === option.id}
          onSelect={() => setSelectedDeliveryId(option.id)}
        />
      ))}

      {/* Delivery info */}
      <View style={styles.deliveryInfoBox}>
        <Text style={styles.deliveryInfoIcon}>🌿</Text>
        <Text style={styles.deliveryInfoText}>
          We partner with eco-friendly delivery services to bring fresh produce
          from local farms to your doorstep.
        </Text>
      </View>
    </View>
  );

  const renderPaymentStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.sectionTitle}>Payment Method</Text>

      {isLoadingPayments ? (
        <View style={styles.loadingSection}>
          <ActivityIndicator size="small" color={colors.primary[500]} />
          <Text style={styles.loadingText}>Loading payment methods...</Text>
        </View>
      ) : paymentMethods.length === 0 ? (
        <View style={styles.emptySection}>
          <Text style={styles.emptyText}>No saved payment methods</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddPaymentMethod}
          >
            <Text style={styles.addButtonText}>+ Add Payment Method</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {paymentMethods.map((method) => (
            <PaymentMethodCard
              key={method.id}
              method={method}
              isSelected={selectedPaymentId === method.id}
              onSelect={() => setSelectedPaymentId(method.id)}
            />
          ))}
          <TouchableOpacity
            style={styles.addNewButton}
            onPress={handleAddPaymentMethod}
          >
            <Text style={styles.addNewButtonText}>
              + Add New Payment Method
            </Text>
          </TouchableOpacity>
        </>
      )}

      {/* Security notice */}
      <View style={styles.securityNotice}>
        <Text style={styles.securityIcon}>🔒</Text>
        <Text style={styles.securityText}>
          Your payment information is encrypted and secure. We use Stripe for
          secure payment processing.
        </Text>
      </View>

      {/* Order total */}
      <View style={styles.finalTotalCard}>
        <View style={styles.finalTotalRow}>
          <Text style={styles.finalTotalLabel}>Order Total</Text>
          <Text style={styles.finalTotalValue}>${finalTotal.toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "review":
        return renderReviewStep();
      case "shipping":
        return renderShippingStep();
      case "delivery":
        return renderDeliveryStep();
      case "payment":
        return renderPaymentStep();
      default:
        return null;
    }
  };

  // ========================================
  // MAIN RENDER
  // ========================================

  if (cartItems.length === 0) {
    return (
      <View style={styles.emptyCartContainer}>
        <Text style={styles.emptyCartEmoji}>🛒</Text>
        <Text style={styles.emptyCartTitle}>Your cart is empty</Text>
        <Text style={styles.emptyCartText}>
          Add some fresh products to your cart to checkout.
        </Text>
        <TouchableOpacity
          style={styles.shopButton}
          onPress={() => navigation.navigate("Cart")}
        >
          <Text style={styles.shopButtonText}>Browse Products</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Step Indicator */}
      <StepIndicator currentStep={currentStep} steps={steps} />

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {renderCurrentStep()}
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            isProcessing && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color={colors.text.inverse} />
          ) : (
            <Text style={styles.continueButtonText}>
              {currentStep === "payment"
                ? `Place Order • $${finalTotal.toFixed(2)}`
                : "Continue"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  headerRight: {
    width: 40,
  },

  // Step Indicator
  stepIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[4],
    backgroundColor: colors.background.primary,
  },
  stepItem: {
    alignItems: "center",
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.neutral[200],
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing[1],
  },
  stepCircleActive: {
    backgroundColor: colors.primary[500],
  },
  stepCircleCompleted: {
    backgroundColor: colors.success.main,
  },
  stepNumber: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
  },
  stepNumberActive: {
    color: colors.text.inverse,
  },
  stepCheckmark: {
    fontSize: typography.fontSize.sm,
    color: colors.text.inverse,
    fontWeight: typography.fontWeight.bold,
  },
  stepLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  stepLabelActive: {
    color: colors.primary[500],
    fontWeight: typography.fontWeight.medium,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: colors.neutral[200],
    marginHorizontal: spacing[2],
    marginBottom: spacing[4],
  },
  stepLineActive: {
    backgroundColor: colors.success.main,
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[4],
    paddingBottom: spacing[24],
  },
  stepContent: {
    flex: 1,
  },

  // Summary Card
  summaryCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[4],
    ...shadows.sm,
  },
  cardTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing[4],
  },
  summaryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing[3],
  },
  summaryItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  summaryItemImage: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.md,
  },
  summaryItemImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral[100],
    justifyContent: "center",
    alignItems: "center",
  },
  summaryItemPlaceholderText: {
    fontSize: 24,
  },
  summaryItemInfo: {
    flex: 1,
    marginLeft: spacing[3],
  },
  summaryItemName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  summaryItemQuantity: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
  summaryItemPrice: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing[3],
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing[2],
  },
  totalLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  totalValue: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
  },
  discountLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.success.main,
  },
  discountValue: {
    fontSize: typography.fontSize.sm,
    color: colors.success.main,
    fontWeight: typography.fontWeight.medium,
  },
  grandTotalLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  grandTotalValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[600],
  },

  // Section
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing[4],
  },

  // Loading & Empty
  loadingSection: {
    padding: spacing[8],
    alignItems: "center",
  },
  loadingText: {
    marginTop: spacing[2],
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  emptySection: {
    padding: spacing[8],
    alignItems: "center",
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginBottom: spacing[4],
  },
  addButton: {
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.lg,
  },
  addButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.inverse,
  },
  addNewButton: {
    paddingVertical: spacing[3],
    alignItems: "center",
  },
  addNewButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[500],
    fontWeight: typography.fontWeight.medium,
  },

  // Address Card
  addressCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[3],
    borderWidth: 2,
    borderColor: colors.border.main,
  },
  addressCardSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  addressCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing[2],
  },
  addressLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
  },
  addressLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  defaultBadge: {
    backgroundColor: colors.primary[100],
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  defaultBadgeText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary[600],
    fontWeight: typography.fontWeight.medium,
  },
  addressName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },
  addressText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  addressPhone: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing[2],
  },

  // Radio Circle
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border.dark,
    justifyContent: "center",
    alignItems: "center",
  },
  radioCircleSelected: {
    borderColor: colors.primary[500],
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary[500],
  },

  // Delivery Card
  deliveryCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[3],
    borderWidth: 2,
    borderColor: colors.border.main,
  },
  deliveryCardSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  deliveryCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  deliveryIcon: {
    fontSize: 28,
    marginRight: spacing[3],
  },
  deliveryInfo: {
    flex: 1,
  },
  deliveryName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  deliveryDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
  deliveryTime: {
    fontSize: typography.fontSize.xs,
    color: colors.primary[500],
    marginTop: spacing[1],
  },
  deliveryCardRight: {
    alignItems: "flex-end",
    gap: spacing[2],
  },
  deliveryPrice: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[600],
  },
  deliveryInfoBox: {
    flexDirection: "row",
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginTop: spacing[2],
  },
  deliveryInfoIcon: {
    fontSize: 24,
    marginRight: spacing[3],
  },
  deliveryInfoText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },

  // Payment Card
  paymentCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[3],
    borderWidth: 2,
    borderColor: colors.border.main,
  },
  paymentCardSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  paymentCardLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentIcon: {
    fontSize: 28,
    marginRight: spacing[3],
  },
  paymentInfo: {},
  paymentBrand: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  paymentExpiry: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing[1],
  },
  securityNotice: {
    flexDirection: "row",
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginTop: spacing[4],
  },
  securityIcon: {
    fontSize: 20,
    marginRight: spacing[3],
  },
  securityText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  finalTotalCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginTop: spacing[4],
    ...shadows.sm,
  },
  finalTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  finalTotalLabel: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  finalTotalValue: {
    fontSize: typography.fontSize["2xl"],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[600],
  },

  // Promo Code
  promoContainer: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[4],
    ...shadows.sm,
  },
  promoLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  promoInputRow: {
    flexDirection: "row",
    gap: spacing[2],
  },
  promoInput: {
    flex: 1,
    height: 44,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[3],
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
  },
  promoInputApplied: {
    backgroundColor: colors.success.light,
  },
  promoButton: {
    height: 44,
    paddingHorizontal: spacing[4],
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  promoButtonApplied: {
    backgroundColor: colors.neutral[400],
  },
  promoButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.inverse,
  },
  promoAppliedText: {
    fontSize: typography.fontSize.sm,
    color: colors.success.main,
    marginTop: spacing[2],
    fontWeight: typography.fontWeight.medium,
  },

  // Notes
  notesContainer: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    ...shadows.sm,
  },
  notesLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  notesInput: {
    height: 80,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing[3],
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
  },

  // Bottom Bar
  bottomBar: {
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    padding: spacing[4],
    paddingBottom: Platform.OS === "ios" ? spacing[8] : spacing[4],
    ...shadows.lg,
  },
  continueButton: {
    height: 52,
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.inverse,
  },

  // Empty Cart
  emptyCartContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing[6],
    backgroundColor: colors.background.primary,
  },
  emptyCartEmoji: {
    fontSize: 64,
    marginBottom: spacing[4],
  },
  emptyCartTitle: {
    fontSize: typography.fontSize["2xl"],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  emptyCartText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: spacing[6],
  },
  shopButton: {
    paddingHorizontal: spacing[8],
    paddingVertical: spacing[4],
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.lg,
  },
  shopButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.inverse,
  },
});

export default CheckoutScreen;
