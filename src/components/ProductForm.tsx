/**
 * PRODUCT FORM COMPONENT
 * Divine React component for creating/editing agricultural products
 * Comprehensive product management with quantum validation
 */

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Product, ProductCategory, ProductUnit, Season } from "@/types/product";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Form validation schema
const productFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(100),
  description: z.string().optional(),
  category: z.nativeEnum(ProductCategory),
  subCategory: z.string().optional(),
  basePrice: z.number().positive("Price must be positive"),
  unit: z.nativeEnum(ProductUnit),
  quantity: z.number().int().min(0, "Quantity cannot be negative"),
  lowStockThreshold: z.number().int().min(0),
  isOrganic: z.boolean(),
  isNonGMO: z.boolean(),
  isLocallyGrown: z.boolean(),
  isSeasonal: z.boolean(),
  isPesticideFree: z.boolean(),
  seasons: z.array(z.nativeEnum(Season)).min(1, "Select at least one season"),
  tags: z.string().optional(),
  isFeatured: z.boolean(),
});

type ProductFormData = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel?: () => void;
}

export function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: product
      ? {
          name: product.name,
          description: product.description,
          category: product.category,
          subCategory: product.subCategory,
          basePrice: product.pricing.basePrice.amount,
          unit: product.pricing.basePrice.unit,
          quantity: product.inventory.quantity,
          lowStockThreshold: product.inventory.lowStockThreshold,
          isOrganic: product.attributes.isOrganic,
          isNonGMO: product.attributes.isNonGMO,
          isLocallyGrown: product.attributes.isLocallyGrown,
          isSeasonal: product.attributes.isSeasonal,
          isPesticideFree: product.attributes.isPesticideFree,
          seasons: product.seasons,
          tags: product.tags.join(", "),
          isFeatured: product.isFeatured,
        }
      : {
          isOrganic: false,
          isNonGMO: false,
          isLocallyGrown: true,
          isSeasonal: false,
          isPesticideFree: false,
          isFeatured: false,
          seasons: [],
        },
  });

  const selectedSeasons = watch("seasons") || [];

  const handleFormSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="e.g., Organic Heirloom Tomatoes"
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Describe your product..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                onValueChange={(value) =>
                  setValue("category", value as ProductCategory)
                }
                defaultValue={product?.category}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(ProductCategory).map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.category.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="subCategory">Subcategory</Label>
              <Input
                id="subCategory"
                {...register("subCategory")}
                placeholder="e.g., Cherry Tomatoes"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              {...register("tags")}
              placeholder="e.g., heirloom, cherry, red"
            />
          </div>
        </CardContent>
      </Card>

      {/* Pricing & Inventory */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing & Inventory</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="basePrice">Price *</Label>
              <Input
                id="basePrice"
                type="number"
                step="0.01"
                {...register("basePrice", { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.basePrice && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.basePrice.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="unit">Unit *</Label>
              <Select
                onValueChange={(value) =>
                  setValue("unit", value as ProductUnit)
                }
                defaultValue={product?.pricing.basePrice.unit}
              >
                <SelectTrigger id="unit">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(ProductUnit).map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity">Quantity in Stock *</Label>
              <Input
                id="quantity"
                type="number"
                {...register("quantity", { valueAsNumber: true })}
                placeholder="0"
              />
              {errors.quantity && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.quantity.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="lowStockThreshold">Low Stock Alert At *</Label>
              <Input
                id="lowStockThreshold"
                type="number"
                {...register("lowStockThreshold", { valueAsNumber: true })}
                placeholder="10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attributes */}
      <Card>
        <CardHeader>
          <CardTitle>Product Attributes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isOrganic"
              checked={watch("isOrganic")}
              onCheckedChange={(checked) =>
                setValue("isOrganic", checked as boolean)
              }
            />
            <Label htmlFor="isOrganic">Certified Organic</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isNonGMO"
              checked={watch("isNonGMO")}
              onCheckedChange={(checked) =>
                setValue("isNonGMO", checked as boolean)
              }
            />
            <Label htmlFor="isNonGMO">Non-GMO</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isLocallyGrown"
              checked={watch("isLocallyGrown")}
              onCheckedChange={(checked) =>
                setValue("isLocallyGrown", checked as boolean)
              }
            />
            <Label htmlFor="isLocallyGrown">Locally Grown</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isSeasonal"
              checked={watch("isSeasonal")}
              onCheckedChange={(checked) =>
                setValue("isSeasonal", checked as boolean)
              }
            />
            <Label htmlFor="isSeasonal">Seasonal Product</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isPesticideFree"
              checked={watch("isPesticideFree")}
              onCheckedChange={(checked) =>
                setValue("isPesticideFree", checked as boolean)
              }
            />
            <Label htmlFor="isPesticideFree">Pesticide-Free</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isFeatured"
              checked={watch("isFeatured")}
              onCheckedChange={(checked) =>
                setValue("isFeatured", checked as boolean)
              }
            />
            <Label htmlFor="isFeatured">Featured Product</Label>
          </div>
        </CardContent>
      </Card>

      {/* Seasonality */}
      <Card>
        <CardHeader>
          <CardTitle>Availability Seasons *</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.values(Season).map((season) => (
              <div key={season} className="flex items-center space-x-2">
                <Checkbox
                  id={`season-${season}`}
                  checked={selectedSeasons.includes(season)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setValue("seasons", [...selectedSeasons, season]);
                    } else {
                      setValue(
                        "seasons",
                        selectedSeasons.filter((s) => s !== season)
                      );
                    }
                  }}
                />
                <Label htmlFor={`season-${season}`}>{season}</Label>
              </div>
            ))}
          </div>
          {errors.seasons && (
            <p className="text-sm text-red-600 mt-2">
              {errors.seasons.message}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end gap-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {product ? "Update Product" : "Create Product"}
        </Button>
      </div>
    </form>
  );
}
