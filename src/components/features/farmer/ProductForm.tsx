/**
 * 🌾 PRODUCT FORM COMPONENT
 * Divine implementation of product creation/editing form
 * Features: Zod validation, image upload, comprehensive fields, agricultural consciousness
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PhotoIcon, XMarkIcon } from "@heroicons/react/24/outline";
import {
  productCategorySchema,
  productUnitSchema,
  type ProductCategory,
  type ProductUnit,
} from "@/lib/validations/product";

// Form schema for client-side validation
const productFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(200),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000),
  category: productCategorySchema,
  unit: productUnitSchema,
  basePrice: z.number().positive("Price must be positive"),
  salePrice: z.number().positive().optional().or(z.literal(0)),
  quantity: z.number().int().min(0, "Quantity cannot be negative"),
  lowStockThreshold: z.number().int().positive().default(10),
  organic: z.boolean().default(false),
  seasonal: z.boolean().default(false),
  locallyGrown: z.boolean().default(true),
  inStock: z.boolean().default(true),
  featured: z.boolean().default(false),
  weight: z.number().positive().optional().or(z.literal(0)),
  certifications: z.string().optional(),
  allergens: z.string().optional(),
  storageInstructions: z.string().max(500).optional(),
  images: z
    .array(z.string().url())
    .min(1, "At least one image required")
    .max(10),
});

type ProductFormData = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  farmId: string;
  initialData?: Partial<ProductFormData> & { id?: string };
  mode: "create" | "edit";
}

const CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: "VEGETABLES", label: "Vegetables" },
  { value: "FRUITS", label: "Fruits" },
  { value: "DAIRY", label: "Dairy" },
  { value: "EGGS", label: "Eggs" },
  { value: "MEAT", label: "Meat" },
  { value: "POULTRY", label: "Poultry" },
  { value: "SEAFOOD", label: "Seafood" },
  { value: "PANTRY", label: "Pantry" },
  { value: "BEVERAGES", label: "Beverages" },
  { value: "BAKED_GOODS", label: "Baked Goods" },
  { value: "PREPARED_FOODS", label: "Prepared Foods" },
  { value: "FLOWERS", label: "Flowers" },
  { value: "OTHER", label: "Other" },
];

const UNITS: { value: ProductUnit; label: string }[] = [
  { value: "LB", label: "Pound (lb)" },
  { value: "OZ", label: "Ounce (oz)" },
  { value: "KG", label: "Kilogram (kg)" },
  { value: "G", label: "Gram (g)" },
  { value: "PIECE", label: "Piece" },
  { value: "BUNCH", label: "Bunch" },
  { value: "BAG", label: "Bag" },
  { value: "BOX", label: "Box" },
  { value: "DOZEN", label: "Dozen" },
  { value: "PINT", label: "Pint" },
  { value: "QUART", label: "Quart" },
  { value: "GALLON", label: "Gallon" },
];

export function ProductForm({ farmId, initialData, mode }: ProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>(
    initialData?.images || [],
  );
  const [imageError, setImageError] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema) as any,
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      category: initialData?.category || "VEGETABLES",
      unit: initialData?.unit || "LB",
      basePrice: initialData?.basePrice || 0,
      salePrice: initialData?.salePrice || 0,
      quantity: initialData?.quantity || 0,
      lowStockThreshold: initialData?.lowStockThreshold || 10,
      organic: initialData?.organic || false,
      seasonal: initialData?.seasonal || false,
      locallyGrown: initialData?.locallyGrown !== false,
      inStock: initialData?.inStock !== false,
      featured: initialData?.featured || false,
      weight: initialData?.weight || 0,
      certifications: initialData?.certifications || "",
      allergens: initialData?.allergens || "",
      storageInstructions: initialData?.storageInstructions || "",
      images: initialData?.images || [],
    },
  });

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setImageError("");

    // Check total images limit
    if (uploadedImages.length + files.length > 10) {
      setImageError("Maximum 10 images allowed");
      return;
    }

    // Validate file types and sizes
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        setImageError("Only image files are allowed");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setImageError("Each image must be less than 5MB");
        return;
      }
    }

    try {
      // In a real implementation, upload to cloud storage (S3, Cloudinary, etc.)
      // For now, create temporary URLs
      const newImageUrls: string[] = [];

      for (const file of Array.from(files)) {
        // Create temporary object URL for preview
        const objectUrl = URL.createObjectURL(file);
        newImageUrls.push(objectUrl);

        // TODO: Replace with actual upload to cloud storage
        // const formData = new FormData();
        // formData.append('file', file);
        // const response = await fetch('/api/upload', { method: 'POST', body: formData });
        // const { url } = await response.json();
        // newImageUrls.push(url);
      }

      const updatedImages = [...uploadedImages, ...newImageUrls];
      setUploadedImages(updatedImages);
      setValue("images", updatedImages, { shouldValidate: true });
    } catch (error) {
      setImageError("Failed to upload images. Please try again.");
    }
  };

  // Remove image
  const removeImage = (index: number) => {
    const updatedImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(updatedImages);
    setValue("images", updatedImages, { shouldValidate: true });
  };

  // Handle form submission
  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);

    try {
      // Prepare payload
      const payload = {
        ...data,
        farmId,
        pricing: {
          basePrice: data.basePrice,
          salePrice: data.salePrice || undefined,
        },
        inventory: {
          quantity: data.quantity,
          reserved: 0,
          lowStockThreshold: data.lowStockThreshold,
          allowBackorder: false,
        },
        attributes: {
          weight: data.weight || undefined,
          organic: data.organic,
          seasonal: data.seasonal,
          locallyGrown: data.locallyGrown,
          certifications: data.certifications
            ? data.certifications.split(",").map((c) => c.trim())
            : [],
          allergens: data.allergens
            ? data.allergens.split(",").map((a) => a.trim())
            : [],
          storageInstructions: data.storageInstructions,
        },
      };

      // Make API call
      const url =
        mode === "create"
          ? "/api/farmer/products"
          : `/api/farmer/products/${initialData?.id}`;

      const response = await fetch(url, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save product");
      }

      await response.json();

      // Redirect to products page
      router.push("/farmer/products");
      router.refresh();
    } catch (error) {
      console.error("Failed to save product:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to save product. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit as any)}
      className="space-y-8"
      data-testid="product-form"
    >
      {/* Basic Information */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Basic Information
        </h2>
        <div className="space-y-4">
          {/* Product Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Product Name *
            </label>
            <input
              type="text"
              id="name"
              {...register("name")}
              className={`mt-1 block w-full rounded-md border ${
                errors.name ? "border-red-300" : "border-gray-300"
              } px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500`}
              placeholder="e.g., Organic Tomatoes"
              data-testid="product-name-input"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description *
            </label>
            <textarea
              id="description"
              {...register("description")}
              rows={4}
              className={`mt-1 block w-full rounded-md border ${
                errors.description ? "border-red-300" : "border-gray-300"
              } px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500`}
              placeholder="Describe your product, including variety, taste, and growing practices..."
              data-testid="product-description-input"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Category and Unit */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700"
              >
                Category *
              </label>
              <select
                id="category"
                {...register("category")}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
                data-testid="product-category-select"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="unit"
                className="block text-sm font-medium text-gray-700"
              >
                Unit of Measure *
              </label>
              <select
                id="unit"
                {...register("unit")}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
                data-testid="product-unit-select"
              >
                {UNITS.map((unit) => (
                  <option key={unit.value} value={unit.value}>
                    {unit.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing & Inventory */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Pricing & Inventory
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label
                htmlFor="basePrice"
                className="block text-sm font-medium text-gray-700"
              >
                Base Price * ($)
              </label>
              <input
                type="number"
                id="basePrice"
                step="0.01"
                {...register("basePrice", { valueAsNumber: true })}
                className={`mt-1 block w-full rounded-md border ${
                  errors.basePrice ? "border-red-300" : "border-gray-300"
                } px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500`}
                placeholder="0.00"
                data-testid="product-price-input"
              />
              {errors.basePrice && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.basePrice.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="salePrice"
                className="block text-sm font-medium text-gray-700"
              >
                Sale Price ($)
              </label>
              <input
                type="number"
                id="salePrice"
                step="0.01"
                {...register("salePrice", { valueAsNumber: true })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
                placeholder="0.00"
                data-testid="product-sale-price-input"
              />
            </div>

            <div>
              <label
                htmlFor="weight"
                className="block text-sm font-medium text-gray-700"
              >
                Weight (optional)
              </label>
              <input
                type="number"
                id="weight"
                step="0.01"
                {...register("weight", { valueAsNumber: true })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
                placeholder="0.00"
                data-testid="product-weight-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="quantity"
                className="block text-sm font-medium text-gray-700"
              >
                Quantity in Stock *
              </label>
              <input
                type="number"
                id="quantity"
                {...register("quantity", { valueAsNumber: true })}
                className={`mt-1 block w-full rounded-md border ${
                  errors.quantity ? "border-red-300" : "border-gray-300"
                } px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500`}
                placeholder="0"
                data-testid="product-quantity-input"
              />
              {errors.quantity && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.quantity.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="lowStockThreshold"
                className="block text-sm font-medium text-gray-700"
              >
                Low Stock Alert Threshold
              </label>
              <input
                type="number"
                id="lowStockThreshold"
                {...register("lowStockThreshold", { valueAsNumber: true })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
                placeholder="10"
                data-testid="product-low-stock-input"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Product Attributes */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Product Attributes
        </h2>
        <div className="space-y-4">
          {/* Checkboxes */}
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="organic"
                {...register("organic")}
                className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                data-testid="product-organic-checkbox"
              />
              <label
                htmlFor="organic"
                className="ml-2 block text-sm text-gray-700"
              >
                Organic
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="seasonal"
                {...register("seasonal")}
                className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                data-testid="product-seasonal-checkbox"
              />
              <label
                htmlFor="seasonal"
                className="ml-2 block text-sm text-gray-700"
              >
                Seasonal
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="locallyGrown"
                {...register("locallyGrown")}
                className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                data-testid="product-locally-grown-checkbox"
              />
              <label
                htmlFor="locallyGrown"
                className="ml-2 block text-sm text-gray-700"
              >
                Locally Grown
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="inStock"
                {...register("inStock")}
                className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                data-testid="product-in-stock-checkbox"
              />
              <label
                htmlFor="inStock"
                className="ml-2 block text-sm text-gray-700"
              >
                In Stock
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="featured"
                {...register("featured")}
                className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                data-testid="product-featured-checkbox"
              />
              <label
                htmlFor="featured"
                className="ml-2 block text-sm text-gray-700"
              >
                Featured Product
              </label>
            </div>
          </div>

          {/* Certifications */}
          <div>
            <label
              htmlFor="certifications"
              className="block text-sm font-medium text-gray-700"
            >
              Certifications (comma-separated)
            </label>
            <input
              type="text"
              id="certifications"
              {...register("certifications")}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
              placeholder="e.g., USDA Organic, Non-GMO"
              data-testid="product-certifications-input"
            />
          </div>

          {/* Allergens */}
          <div>
            <label
              htmlFor="allergens"
              className="block text-sm font-medium text-gray-700"
            >
              Allergens (comma-separated)
            </label>
            <input
              type="text"
              id="allergens"
              {...register("allergens")}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
              placeholder="e.g., Nuts, Dairy"
              data-testid="product-allergens-input"
            />
          </div>

          {/* Storage Instructions */}
          <div>
            <label
              htmlFor="storageInstructions"
              className="block text-sm font-medium text-gray-700"
            >
              Storage Instructions
            </label>
            <textarea
              id="storageInstructions"
              {...register("storageInstructions")}
              rows={2}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
              placeholder="How should customers store this product?"
              data-testid="product-storage-input"
            />
          </div>
        </div>
      </div>

      {/* Product Images */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Product Images *
        </h2>
        <div className="space-y-4">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Images (Max 10, up to 5MB each)
            </label>
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <PhotoIcon className="w-10 h-10 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, WEBP (MAX. 5MB)
                  </p>
                </div>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  data-testid="product-image-upload"
                />
              </label>
            </div>
            {imageError && (
              <p className="mt-1 text-sm text-red-600">{imageError}</p>
            )}
            {errors.images && (
              <p className="mt-1 text-sm text-red-600">
                {errors.images.message}
              </p>
            )}
          </div>

          {/* Image Preview */}
          {uploadedImages.length > 0 && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {uploadedImages.map((url, index) => (
                <div
                  key={index}
                  className="relative group aspect-square"
                  data-testid={`product-image-${index}`}
                >
                  <img
                    src={url}
                    alt={`Product ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    data-testid={`remove-image-${index}`}
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                  {index === 0 && (
                    <span className="absolute bottom-2 left-2 px-2 py-1 bg-green-600 text-white text-xs rounded">
                      Primary
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-gray-300 bg-white px-6 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
          disabled={isSubmitting}
          data-testid="cancel-button"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-green-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          data-testid="submit-button"
        >
          {isSubmitting
            ? "Saving..."
            : mode === "create"
              ? "Create Product"
              : "Update Product"}
        </button>
      </div>
    </form>
  );
}
