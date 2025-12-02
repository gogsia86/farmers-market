/**
 * CONSUMER ADDRESSES PAGE - WIREFRAME IMPLEMENTATION
 *
 * Complete address management with:
 * - Address list with cards
 * - Add new address form
 * - Edit existing addresses
 * - Delete addresses
 * - Set default address
 * - Address type labels (Home, Work, Other)
 */

"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { EmptyState } from "@/components/dashboard/EmptyState";

interface Address {
  id: string;
  type: "HOME" | "WORK" | "OTHER";
  label: string | null;
  street: string;
  street2: string | null;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
}

interface AddressFormData {
  type: "HOME" | "WORK" | "OTHER";
  label: string;
  street: string;
  street2: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

const emptyForm: AddressFormData = {
  type: "HOME",
  label: "",
  street: "",
  street2: "",
  city: "",
  state: "",
  zipCode: "",
  country: "US",
  isDefault: false,
};

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
];

export default function AddressesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<AddressFormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?redirect=/dashboard/addresses");
      return;
    }

    if (status === "authenticated") {
      fetchAddresses();
    }
  }, [status, router]);

  const fetchAddresses = async () => {
    try {
      const response = await fetch("/api/users/addresses");
      const data = await response.json();

      if (data.success) {
        setAddresses(data.addresses || []);
      }
    } catch (error) {
      console.error("Failed to fetch addresses:", error);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setShowModal(true);
    setMessage(null);
  };

  const openEditModal = (address: Address) => {
    setEditingId(address.id);
    setFormData({
      type: address.type,
      label: address.label || "",
      street: address.street,
      street2: address.street2 || "",
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      isDefault: address.isDefault,
    });
    setShowModal(true);
    setMessage(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData(emptyForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const url = editingId
        ? `/api/users/addresses/${editingId}`
        : "/api/users/addresses";

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({
          type: "success",
          text: editingId ? "Address updated successfully!" : "Address added successfully!",
        });
        await fetchAddresses();
        closeModal();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to save address" });
      }
    } catch (error) {
      console.error("Address save error:", error);
      setMessage({ type: "error", text: "An error occurred. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/users/addresses/${addressId}/default`, {
        method: "PUT",
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: "success", text: "Default address updated!" });
        await fetchAddresses();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to set default address" });
      }
    } catch (error) {
      console.error("Set default error:", error);
      setMessage({ type: "error", text: "An error occurred. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (addressId: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/users/addresses/${addressId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: "success", text: "Address deleted successfully!" });
        await fetchAddresses();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to delete address" });
      }
    } catch (error) {
      console.error("Delete error:", error);
      setMessage({ type: "error", text: "An error occurred. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const getAddressTypeIcon = (type: string) => {
    switch (type) {
      case "HOME":
        return "🏠";
      case "WORK":
        return "🏢";
      case "OTHER":
        return "📍";
      default:
        return "📍";
    }
  };

  const getAddressTypeColor = (type: string) => {
    switch (type) {
      case "HOME":
        return "bg-green-100 text-green-700 border-green-300";
      case "WORK":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "OTHER":
        return "bg-purple-100 text-purple-700 border-purple-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  if (status === "loading" || loading) {
    return <AddressesSkeleton />;
  }

  if (!session?.user) {
    return null;
  }

  const defaultAddress = addresses.find((a) => a.isDefault);
  const otherAddresses = addresses.filter((a) => !a.isDefault);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-green-600 hover:text-green-700 font-medium mb-4 inline-flex items-center gap-2"
          >
            ← Back to Dashboard
          </Link>
          <div className="flex items-center justify-between mt-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Delivery Addresses 📍
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your delivery locations for faster checkout
              </p>
            </div>
            <button onClick={openAddModal} className="btn-green">
              + Add Address
            </button>
          </div>
        </div>

        {/* Message Alert */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border-2 border-green-200"
                : "bg-red-50 text-red-800 border-2 border-red-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">
                {message.type === "success" ? "✅" : "❌"}
              </span>
              <p className="font-medium">{message.text}</p>
            </div>
          </div>
        )}

        {/* Address Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-3xl font-bold text-green-600">
              {addresses.length}
            </div>
            <div className="text-sm text-gray-600">Saved Addresses</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-3xl font-bold text-blue-600">
              {defaultAddress ? "1" : "0"}
            </div>
            <div className="text-sm text-gray-600">Default Address</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 hidden sm:block">
            <div className="text-3xl font-bold text-purple-600">
              {addresses.filter((a) => a.type === "HOME").length}
            </div>
            <div className="text-sm text-gray-600">Home Addresses</div>
          </div>
        </div>

        {/* Addresses List */}
        {addresses.length === 0 ? (
          <EmptyState
            icon="📍"
            title="No addresses saved"
            description="Add your delivery address to start ordering from local farms"
            action={
              <button onClick={openAddModal} className="btn-green">
                Add Your First Address
              </button>
            }
          />
        ) : (
          <div className="space-y-6">
            {/* Default Address */}
            {defaultAddress && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Default Address
                </h2>
                <AddressCard
                  address={defaultAddress}
                  onEdit={() => openEditModal(defaultAddress)}
                  onDelete={() => handleDelete(defaultAddress.id)}
                  onSetDefault={() => handleSetDefault(defaultAddress.id)}
                  getTypeIcon={getAddressTypeIcon}
                  getTypeColor={getAddressTypeColor}
                  disabled={submitting}
                />
              </div>
            )}

            {/* Other Addresses */}
            {otherAddresses.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Other Addresses
                </h2>
                <div className="space-y-4">
                  {otherAddresses.map((address) => (
                    <AddressCard
                      key={address.id}
                      address={address}
                      onEdit={() => openEditModal(address)}
                      onDelete={() => handleDelete(address.id)}
                      onSetDefault={() => handleSetDefault(address.id)}
                      getTypeIcon={getAddressTypeIcon}
                      getTypeColor={getAddressTypeColor}
                      disabled={submitting}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <span className="text-4xl">💡</span>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Address Tips
              </h3>
              <ul className="text-gray-600 space-y-1 text-sm">
                <li>• Set a default address for faster checkout</li>
                <li>• Add multiple addresses for home, work, or gifts</li>
                <li>• Use descriptive labels to identify addresses easily</li>
                <li>• Keep your addresses up-to-date for accurate deliveries</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Address Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingId ? "Edit Address" : "Add New Address"}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                  disabled={submitting}
                >
                  ×
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {/* Address Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address Type *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(["HOME", "WORK", "OTHER"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, type })}
                      className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                        formData.type === type
                          ? "bg-green-100 border-green-500 text-green-700"
                          : "bg-white border-gray-300 text-gray-700 hover:border-gray-400"
                      }`}
                    >
                      {getAddressTypeIcon(type)} {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Label */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Label (Optional)
                </label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) =>
                    setFormData({ ...formData, label: e.target.value })
                  }
                  className="input-field"
                  placeholder="e.g., Main House, Downtown Office"
                />
              </div>

              {/* Street Address */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address *
                </label>
                <input
                  type="text"
                  value={formData.street}
                  onChange={(e) =>
                    setFormData({ ...formData, street: e.target.value })
                  }
                  className="input-field"
                  placeholder="123 Main Street"
                  required
                />
              </div>

              {/* Apartment/Suite */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apartment, Suite, etc. (Optional)
                </label>
                <input
                  type="text"
                  value={formData.street2}
                  onChange={(e) =>
                    setFormData({ ...formData, street2: e.target.value })
                  }
                  className="input-field"
                  placeholder="Apt 4B"
                />
              </div>

              {/* City, State, Zip */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    className="input-field"
                    placeholder="San Francisco"
                    required
                  />
                </div>

                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                    className="input-field"
                    required
                  >
                    <option value="">Select</option>
                    {US_STATES.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) =>
                      setFormData({ ...formData, zipCode: e.target.value })
                    }
                    className="input-field"
                    placeholder="94102"
                    pattern="[0-9]{5}"
                    required
                  />
                </div>
              </div>

              {/* Default Checkbox */}
              <div className="mb-6">
                <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.isDefault}
                    onChange={(e) =>
                      setFormData({ ...formData, isDefault: e.target.checked })
                    }
                    className="w-5 h-5 text-green-600 rounded"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      Set as default address
                    </p>
                    <p className="text-sm text-gray-600">
                      Use this address for all future orders
                    </p>
                  </div>
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-6 border-t">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-green flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Saving..." : editingId ? "Update Address" : "Add Address"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn-outline"
                  disabled={submitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Address Card Component
interface AddressCardProps {
  address: Address;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
  getTypeIcon: (type: string) => string;
  getTypeColor: (type: string) => string;
  disabled: boolean;
}

function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  getTypeIcon,
  getTypeColor,
  disabled,
}: AddressCardProps) {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-green-500 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium border-2 ${getTypeColor(
              address.type,
            )}`}
          >
            {getTypeIcon(address.type)} {address.type}
          </span>
          {address.isDefault && (
            <span className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-bold">
              ✓ DEFAULT
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            disabled={disabled}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors disabled:opacity-50"
          >
            ✏️ Edit
          </button>
          <button
            onClick={onDelete}
            disabled={disabled}
            className="text-red-600 hover:text-red-700 font-medium text-sm transition-colors disabled:opacity-50"
          >
            🗑️ Delete
          </button>
        </div>
      </div>

      {address.label && (
        <h3 className="text-lg font-bold text-gray-900 mb-2">{address.label}</h3>
      )}

      <div className="text-gray-700 space-y-1">
        <p>{address.street}</p>
        {address.street2 && <p>{address.street2}</p>}
        <p>
          {address.city}, {address.state} {address.zipCode}
        </p>
        <p className="text-sm text-gray-600">{address.country}</p>
      </div>

      {!address.isDefault && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={onSetDefault}
            disabled={disabled}
            className="text-green-600 hover:text-green-700 font-medium text-sm transition-colors disabled:opacity-50"
          >
            Set as Default Address
          </button>
        </div>
      )}
    </div>
  );
}

function AddressesSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
          ))}
        </div>

        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
