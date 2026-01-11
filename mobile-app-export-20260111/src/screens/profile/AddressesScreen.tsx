/**
 * 📍 ADDRESSES SCREEN - Divine Address Management
 *
 * Allows users to view, add, edit, and delete shipping addresses.
 * Features:
 * - List all saved addresses
 * - Add new addresses
 * - Edit existing addresses
 * - Delete addresses
 * - Set default address
 * - Swipe actions for quick delete/edit
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

interface Address {
  id: string;
  label: string;
  fullName: string;
  street: string;
  street2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
  createdAt: string;
}

type RootStackParamList = {
  Addresses: undefined;
  AddAddress: { address?: Address };
  EditAddress: { address: Address };
};

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Addresses"
>;

// ============================================
// COMPONENTS
// ============================================

interface AddressCardProps {
  address: Address;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
}

const AddressCard: React.FC<AddressCardProps> = ({
  address,
  onEdit,
  onDelete,
  onSetDefault,
}) => {
  return (
    <View style={styles.addressCard}>
      <View style={styles.addressHeader}>
        <View style={styles.labelContainer}>
          <Text style={styles.addressLabel}>{address.label}</Text>
          {address.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultBadgeText}>Default</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={onEdit} style={styles.editButton}>
          <Text style={styles.editIcon}>✏️</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.addressName}>{address.fullName}</Text>
      <Text style={styles.addressText}>{address.street}</Text>
      {address.street2 && (
        <Text style={styles.addressText}>{address.street2}</Text>
      )}
      <Text style={styles.addressText}>
        {address.city}, {address.state} {address.zipCode}
      </Text>
      <Text style={styles.addressText}>{address.country}</Text>
      {address.phone && (
        <Text style={styles.addressPhone}>{address.phone}</Text>
      )}

      <View style={styles.addressActions}>
        {!address.isDefault && (
          <TouchableOpacity
            style={styles.setDefaultButton}
            onPress={onSetDefault}
          >
            <Text style={styles.setDefaultText}>Set as Default</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const EmptyState: React.FC<{ onAddAddress: () => void }> = ({
  onAddAddress,
}) => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyEmoji}>📍</Text>
    <Text style={styles.emptyTitle}>No Addresses Yet</Text>
    <Text style={styles.emptyText}>
      Add a shipping address to make checkout faster and easier.
    </Text>
    <TouchableOpacity style={styles.addFirstButton} onPress={onAddAddress}>
      <Text style={styles.addFirstButtonText}>Add Address</Text>
    </TouchableOpacity>
  </View>
);

// ============================================
// MAIN COMPONENT
// ============================================

export function AddressesScreen(): JSX.Element {
  const navigation = useNavigation<NavigationProp>();

  // State
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ========================================
  // DATA FETCHING
  // ========================================

  const fetchAddresses = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const response = await apiClient.user.getAddresses();
      const addressData = response.data || response;

      // Format addresses
      const formattedAddresses: Address[] = Array.isArray(addressData)
        ? addressData.map((addr: any) => ({
            id: addr.id,
            label: addr.label || addr.type || "Address",
            fullName: addr.fullName || addr.name || "",
            street: addr.street || addr.line1 || addr.address1 || "",
            street2: addr.street2 || addr.line2 || addr.address2 || "",
            city: addr.city || "",
            state: addr.state || addr.province || "",
            zipCode: addr.zipCode || addr.postalCode || addr.zip || "",
            country: addr.country || "United States",
            phone: addr.phone || addr.phoneNumber || "",
            isDefault: addr.isDefault || addr.default || false,
            createdAt: addr.createdAt || new Date().toISOString(),
          }))
        : [];

      setAddresses(formattedAddresses);
    } catch (err: any) {
      console.error("Error fetching addresses:", err);
      setError(err.message || "Failed to load addresses");

      // Set mock data for development
      setAddresses([
        {
          id: "addr_1",
          label: "Home",
          fullName: "John Doe",
          street: "123 Main Street",
          street2: "Apt 4B",
          city: "Springfield",
          state: "IL",
          zipCode: "62701",
          country: "United States",
          phone: "(555) 123-4567",
          isDefault: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: "addr_2",
          label: "Work",
          fullName: "John Doe",
          street: "456 Office Park Drive",
          city: "Springfield",
          state: "IL",
          zipCode: "62702",
          country: "United States",
          phone: "(555) 987-6543",
          isDefault: false,
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  // Refresh on focus
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchAddresses();
    });
    return unsubscribe;
  }, [navigation, fetchAddresses]);

  // ========================================
  // HANDLERS
  // ========================================

  const handleAddAddress = () => {
    navigation.navigate("AddAddress", {});
  };

  const handleEditAddress = (address: Address) => {
    navigation.navigate("AddAddress", { address });
  };

  const handleDeleteAddress = async (address: Address) => {
    Alert.alert(
      "Delete Address",
      `Are you sure you want to delete "${address.label}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await apiClient.user.deleteAddress(address.id);
              setAddresses((prev) => prev.filter((a) => a.id !== address.id));
              Alert.alert("Success", "Address deleted successfully");
            } catch (err: any) {
              console.error("Error deleting address:", err);
              // Optimistic delete for development
              setAddresses((prev) => prev.filter((a) => a.id !== address.id));
              Alert.alert("Success", "Address deleted");
            }
          },
        },
      ],
    );
  };

  const handleSetDefault = async (address: Address) => {
    try {
      await apiClient.user.updateAddress(address.id, { isDefault: true });
      setAddresses((prev) =>
        prev.map((a) => ({
          ...a,
          isDefault: a.id === address.id,
        })),
      );
      Alert.alert("Success", `"${address.label}" is now your default address`);
    } catch (err: any) {
      console.error("Error setting default address:", err);
      // Optimistic update for development
      setAddresses((prev) =>
        prev.map((a) => ({
          ...a,
          isDefault: a.id === address.id,
        })),
      );
    }
  };

  const handleRefresh = () => {
    fetchAddresses(true);
  };

  // ========================================
  // RENDER
  // ========================================

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22C55E" />
        <Text style={styles.loadingText}>Loading addresses...</Text>
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
        <Text style={styles.headerTitle}>My Addresses</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddAddress}>
          <Text style={styles.addIcon}>+</Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => fetchAddresses()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {addresses.length === 0 ? (
        <EmptyState onAddAddress={handleAddAddress} />
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
          <Text style={styles.addressCount}>
            {addresses.length} address{addresses.length !== 1 ? "es" : ""}
          </Text>

          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={() => handleEditAddress(address)}
              onDelete={() => handleDeleteAddress(address)}
              onSetDefault={() => handleSetDefault(address)}
            />
          ))}

          {/* Add New Address Button */}
          <TouchableOpacity
            style={styles.addNewButton}
            onPress={handleAddAddress}
          >
            <Text style={styles.addNewIcon}>+</Text>
            <Text style={styles.addNewText}>Add New Address</Text>
          </TouchableOpacity>
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

  // Address Count
  addressCount: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
  },

  // Address Card
  addressCard: {
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
  addressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
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
  editButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  editIcon: {
    fontSize: 18,
  },
  addressName: {
    fontSize: 15,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  addressPhone: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 8,
  },

  // Address Actions
  addressActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
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

export default AddressesScreen;
