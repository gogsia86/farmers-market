/**
 * 🌾 CREATE PRODUCT FORM COMPONENT
 * Divine product creation form with agricultural consciousness
 *
 * Features:
 * - Complete product data input
 * - Category selection
 * - Image upload (URL input for now)
 * - Tags management
 * - Price and inventory
 * - Organic certification toggle
 * - Harvest date picker
 * - Real-time validation
 * - Loading states
 * - Error handling
 *
 * Architecture:
 * - Client Component (form interactivity)
 * - Server Actions integration
 * - Type-safe form handling
 * - Agricultural domain patterns
 */

"use client";

import { createProduct } from "@/app/actions/product.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ProductCategory } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { logger } from '@/lib/monitoring/logger';

/**
 * 🌱 COMPONENT PROPS
 */
interface CreateProductFormProps {
  farmId: string;
  farmName?: string;
}

/**
 * 🌾 PRODUCT CATEGORIES
 */
const PRODUCT_CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: "VEGETABLES", label: "🥕 Vegetables" },
  { value: "FRUITS", label: "🍎 Fruits" },
  { value: "DAIRY", label: "🥛 Dairy" },
  { value: "EGGS", label: "🥚 Eggs" },
  { value: "MEAT", label: "🥩 Meat" },
  { value: "POULTRY", label: "🍗 Poultry" },
  { value: "SEAFOOD", label: "🐟 Seafood" },
  { value: "PANTRY", label: "🥫 Pantry" },
  { value: "BEVERAGES", label: "🧃 Beverages" },
  { value: "BAKED_GOODS", label: "🍞 Baked Goods" },
  { value: "PREPARED_FOODS", label: "🍱 Prepared Foods" },
  { value: "FLOWERS", label: "🌸 Flowers" },
  { value: "OTHER", label: "📦 Other" },
];

/**
 * 🌱 COMMON UNITS OF MEASUREMENT
 */
const COMMON_UNITS = [
  "lb",
  "oz",
  "kg",
  "g",
  "bunch",
  "head",
  "piece",
  "dozen",
  "pint",
  "quart",
  "gallon",
  "liter",
  "box",
  "bag",
  "jar",
];

/**
 * 🌾 CREATE PRODUCT FORM COMPONENT
 */
export function CreateProductForm({ farmId, farmName }: CreateProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ProductCategory>("VEGETABLES");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("lb");
  const [quantityAvailable, setQuantityAvailable] = useState("");
  const [organic, setOrganic] = useState(false);
  const [harvestDate, setHarvestDate] = useState("");
  const [storageInstructions, setStorageInstructions] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageInput, setImageInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  /**
   * 🏷️ ADD TAG
   */
  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput("");
    }
  };

  /**
   * 🗑️ REMOVE TAG
   */
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  /**
   * 🖼️ ADD IMAGE URL
   */
  const handleAddImage = () => {
    const trimmedUrl = imageInput.trim();
    if (trimmedUrl && !imageUrls.includes(trimmedUrl)) {
      // Basic URL validation
      try {
        new URL(trimmedUrl);
        setImageUrls([...imageUrls, trimmedUrl]);
        setImageInput("");
      } catch {
        setFieldErrors({ ...fieldErrors, images: "Invalid image URL" });
      }
    }
  };

  /**
   * 🗑️ REMOVE IMAGE URL
   */
  const handleRemoveImage = (urlToRemove: string) => {
    setImageUrls(imageUrls.filter((url) => url !== urlToRemove));
  };

  /**
   * 📝 HANDLE FORM SUBMIT
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setFieldErrors({});

    try {
      // Build FormData
      const formData = new FormData();
      formData.append("farmId", farmId);
      formData.append("name", name);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("price", price);
      formData.append("unit", unit);
      formData.append("quantityAvailable", quantityAvailable);
      formData.append("organic", organic.toString());
      formData.append("storageInstructions", storageInstructions);
      if (harvestDate) {
        formData.append("harvestDate", harvestDate);
      }
      formData.append("images", JSON.stringify(imageUrls));
      formData.append("tags", JSON.stringify(tags));

      // Call server action
      const result = await createProduct(formData);

      if (result.success) {
        // Navigate to product management page
        router.push(`/farmer/farms/${farmId}/products`);
        router.refresh();
      } else {
        setError(result.error || "Failed to create product");
        if (result.errors) {
          setFieldErrors(result.errors);
        }
      }
    } catch (err: any) {
      logger.error("Product creation error:", {
      error: err instanceof Error ? err.message : String(err),
    });
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          🌱 Create New Product
        </h2>
        {farmName && (
          <p className="mt-1 text-sm text-gray-600">
            Adding product to <span className="font-medium">{farmName}</span>
          </p>
        )}
      </div>

      {/* Global Error */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Product Name */}
      <div>
        <Label htmlFor="name">Product Name *</Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Organic Roma Tomatoes"
          required
          className="mt-1"
        />
        {fieldErrors.name && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your product, how it's grown, and what makes it special..."
          required
          rows={4}
          className="mt-1"
        />
        {fieldErrors.description && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.description}</p>
        )}
      </div>

      {/* Category */}
      <div>
        <Label htmlFor="category">Category *</Label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value as ProductCategory)}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
        >
          {PRODUCT_CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
        {fieldErrors.category && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.category}</p>
        )}
      </div>

      {/* Price and Unit (side by side) */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Price (USD) *</Label>
          <div className="relative mt-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              required
              className="pl-7"
            />
          </div>
          {fieldErrors.price && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.price}</p>
          )}
        </div>

        <div>
          <Label htmlFor="unit">Unit *</Label>
          <select
            id="unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
          >
            {COMMON_UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
          {fieldErrors.unit && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.unit}</p>
          )}
        </div>
      </div>

      {/* Quantity Available */}
      <div>
        <Label htmlFor="quantityAvailable">Quantity Available *</Label>
        <Input
          id="quantityAvailable"
          type="number"
          step="0.01"
          min="0"
          value={quantityAvailable}
          onChange={(e) => setQuantityAvailable(e.target.value)}
          placeholder="0"
          required
          className="mt-1"
        />
        {fieldErrors.quantityAvailable && (
          <p className="mt-1 text-sm text-red-600">
            {fieldErrors.quantityAvailable}
          </p>
        )}
      </div>

      {/* Organic Toggle */}
      <div className="flex items-center">
        <input
          id="organic"
          type="checkbox"
          checked={organic}
          onChange={(e) => setOrganic(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
        />
        <Label htmlFor="organic" className="ml-2 mb-0">
          🌿 Certified Organic
        </Label>
      </div>

      {/* Harvest Date */}
      <div>
        <Label htmlFor="harvestDate">Harvest Date (Optional)</Label>
        <Input
          id="harvestDate"
          type="date"
          value={harvestDate}
          onChange={(e) => setHarvestDate(e.target.value)}
          className="mt-1"
        />
      </div>

      {/* Storage Instructions */}
      <div>
        <Label htmlFor="storageInstructions">
          Storage Instructions (Optional)
        </Label>
        <Textarea
          id="storageInstructions"
          value={storageInstructions}
          onChange={(e) => setStorageInstructions(e.target.value)}
          placeholder="e.g., Store in a cool, dry place. Refrigerate after opening."
          rows={2}
          className="mt-1"
        />
      </div>

      {/* Image URLs */}
      <div>
        <Label htmlFor="imageInput">Product Images (URLs)</Label>
        <div className="mt-1 flex gap-2">
          <Input
            id="imageInput"
            type="url"
            value={imageInput}
            onChange={(e) => setImageInput(e.target.value)}
            placeholder="https://example.com/image.jpg"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddImage();
              }
            }}
          />
          <Button
            type="button"
            onClick={handleAddImage}
            variant="outline"
            className="whitespace-nowrap"
          >
            Add Image
          </Button>
        </div>
        {fieldErrors.images && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.images}</p>
        )}

        {/* Image List */}
        {imageUrls.length > 0 && (
          <div className="mt-3 space-y-2">
            {imageUrls.map((url, index) => (
              <div
                key={index}
                className="flex items-center gap-2 rounded-md bg-gray-50 p-2"
              >
                <img
                  src={url}
                  alt={`Product ${index + 1}`}
                  className="h-12 w-12 rounded object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Crect width='48' height='48' fill='%23ddd'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999'%3E?%3C/text%3E%3C/svg%3E";
                  }}
                />
                <span className="flex-1 truncate text-sm text-gray-600">
                  {url}
                </span>
                <Button
                  type="button"
                  onClick={() => handleRemoveImage(url)}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tags */}
      <div>
        <Label htmlFor="tagInput">Tags (Optional)</Label>
        <div className="mt-1 flex gap-2">
          <Input
            id="tagInput"
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="e.g., heirloom, local, seasonal"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddTag();
              }
            }}
          />
          <Button
            type="button"
            onClick={handleAddTag}
            variant="outline"
            className="whitespace-nowrap"
          >
            Add Tag
          </Button>
        </div>

        {/* Tag List */}
        {tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm text-green-800"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-green-200"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex gap-4 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1"
          variant="default"
        >
          {isSubmitting ? "Creating Product..." : "🌱 Create Product"}
        </Button>
        <Button
          type="button"
          onClick={() => router.back()}
          variant="outline"
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
