"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Apple,
  Carrot,
  Egg,
  Filter,
  Leaf,
  MapPin,
  Milk,
  RotateCcw,
  Search,
  Wheat,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * 🔍 PRODUCT FILTERS COMPONENT - Phase 3
 * Advanced sidebar filtering for marketplace
 * Features: Category, Price, Location, Dietary, Stock filters
 */

export interface ProductFilterState {
  categories: string[];
  priceRange: [number, number];
  maxDistance: number;
  dietary: string[];
  inStockOnly: boolean;
  certifications: string[];
  sortBy: string;
  searchQuery: string;
}

interface ProductFiltersProps {
  filters: ProductFilterState;
  onFiltersChange: (filters: ProductFilterState) => void;
  onReset: () => void;
  productCount?: number;
  className?: string;
}

const CATEGORIES = [
  { id: "fruits", name: "Fruits", icon: Apple, color: "text-red-600" },
  {
    id: "vegetables",
    name: "Vegetables",
    icon: Carrot,
    color: "text-green-600",
  },
  { id: "dairy", name: "Dairy", icon: Milk, color: "text-blue-600" },
  {
    id: "grains",
    name: "Grains & Flour",
    icon: Wheat,
    color: "text-amber-600",
  },
  { id: "eggs", name: "Eggs & Poultry", icon: Egg, color: "text-orange-600" },
  { id: "greens", name: "Greens & Herbs", icon: Leaf, color: "text-lime-600" },
];

const DIETARY_OPTIONS = [
  { id: "organic", label: "Organic" },
  { id: "vegan", label: "Vegan" },
  { id: "gluten-free", label: "Gluten Free" },
  { id: "non-gmo", label: "Non-GMO" },
  { id: "local", label: "Local (<50mi)" },
];

const CERTIFICATIONS = [
  { id: "usda-organic", label: "USDA Organic" },
  { id: "biodynamic", label: "Biodynamic" },
  { id: "regenerative", label: "Regenerative" },
  { id: "animal-welfare", label: "Animal Welfare Approved" },
];

const SORT_OPTIONS = [
  { value: "relevance", label: "Most Relevant" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "newest", label: "Newest First" },
  { value: "distance", label: "Nearest First" },
];

export function ProductFilters({
  filters,
  onFiltersChange,
  onReset,
  productCount = 0,
  className = "",
}: ProductFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const updateFilter = (key: keyof ProductFilterState, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleCategory = (categoryId: string) => {
    const newCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter((c) => c !== categoryId)
      : [...filters.categories, categoryId];
    updateFilter("categories", newCategories);
  };

  const toggleDietary = (dietaryId: string) => {
    const newDietary = filters.dietary.includes(dietaryId)
      ? filters.dietary.filter((d) => d !== dietaryId)
      : [...filters.dietary, dietaryId];
    updateFilter("dietary", newDietary);
  };

  const toggleCertification = (certId: string) => {
    const newCerts = filters.certifications.includes(certId)
      ? filters.certifications.filter((c) => c !== certId)
      : [...filters.certifications, certId];
    updateFilter("certifications", newCerts);
  };

  const activeFilterCount =
    filters.categories.length +
    filters.dietary.length +
    filters.certifications.length +
    (filters.inStockOnly ? 1 : 0) +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 100 ? 1 : 0) +
    (filters.maxDistance < 100 ? 1 : 0);

  return (
    <aside
      className={`bg-card border border-border rounded-xl shadow-sm ${className}`}
    >
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary-600" />
          <h2 className="font-semibold text-foreground">Filters</h2>
          {activeFilterCount > 0 && (
            <span className="bg-primary-100 text-primary-700 text-xs font-semibold px-2 py-0.5 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="text-sm"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="lg:hidden"
          >
            {isExpanded ? (
              <X className="h-4 w-4" />
            ) : (
              <Filter className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Filters Content */}
      <div
        className={`${isExpanded ? "block" : "hidden lg:block"} divide-y divide-border`}
      >
        {/* Search within results */}
        <div className="p-4">
          <Label className="text-sm font-semibold mb-3 block">
            Search Products
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name..."
              value={filters.searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                updateFilter("searchQuery", e.target.value)
              }
              className="pl-9"
            />
          </div>
        </div>

        {/* Sort By */}
        <div className="p-4">
          <Label className="text-sm font-semibold mb-3 block">Sort By</Label>
          <Select
            value={filters.sortBy}
            onValueChange={(value: string) => updateFilter("sortBy", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select sort order" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Categories */}
        <div className="p-4">
          <Label className="text-sm font-semibold mb-3 block">Categories</Label>
          <div className="space-y-2.5">
            {CATEGORIES.map((category) => {
              const Icon = category.icon;
              const isSelected = filters.categories.includes(category.id);
              return (
                <button
                  key={category.id}
                  onClick={() => toggleCategory(category.id)}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-colors ${
                    isSelected
                      ? "bg-primary-50 border-2 border-primary-500"
                      : "border-2 border-transparent hover:bg-accent"
                  }`}
                >
                  <div
                    className={`flex-shrink-0 ${isSelected ? "text-primary-600" : category.color}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span
                    className={`text-sm font-medium flex-1 text-left ${
                      isSelected ? "text-primary-700" : "text-foreground"
                    }`}
                  >
                    {category.name}
                  </span>
                  {isSelected && (
                    <div className="flex-shrink-0 w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Price Range */}
        <div className="p-4">
          <Label className="text-sm font-semibold mb-3 block">
            Price Range
          </Label>
          <div className="space-y-4">
            <Slider
              value={filters.priceRange}
              onValueChange={(value: number[]) =>
                updateFilter("priceRange", value as [number, number])
              }
              min={0}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                ${filters.priceRange[0]}
              </span>
              <span className="text-muted-foreground">
                ${filters.priceRange[1]}
                {filters.priceRange[1] >= 100 && "+"}
              </span>
            </div>
          </div>
        </div>

        {/* Location/Distance */}
        <div className="p-4">
          <Label className="text-sm font-semibold mb-3 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Maximum Distance
          </Label>
          <div className="space-y-4">
            <Slider
              value={[filters.maxDistance]}
              onValueChange={(value: number[]) =>
                updateFilter("maxDistance", value[0])
              }
              min={5}
              max={100}
              step={5}
              className="w-full"
            />
            <div className="text-sm text-center">
              <span className="font-semibold text-foreground">
                {filters.maxDistance >= 100
                  ? "Any distance"
                  : `${filters.maxDistance} miles`}
              </span>
            </div>
          </div>
        </div>

        {/* Dietary & Attributes */}
        <div className="p-4">
          <Label className="text-sm font-semibold mb-3 block">
            Dietary & Attributes
          </Label>
          <div className="space-y-2.5">
            {DIETARY_OPTIONS.map((option) => (
              <div key={option.id} className="flex items-center gap-2">
                <Checkbox
                  id={`dietary-${option.id}`}
                  checked={filters.dietary.includes(option.id)}
                  onCheckedChange={() => toggleDietary(option.id)}
                />
                <Label
                  htmlFor={`dietary-${option.id}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div className="p-4">
          <Label className="text-sm font-semibold mb-3 block">
            Certifications
          </Label>
          <div className="space-y-2.5">
            {CERTIFICATIONS.map((cert) => (
              <div key={cert.id} className="flex items-center gap-2">
                <Checkbox
                  id={`cert-${cert.id}`}
                  checked={filters.certifications.includes(cert.id)}
                  onCheckedChange={() => toggleCertification(cert.id)}
                />
                <Label
                  htmlFor={`cert-${cert.id}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {cert.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Stock Availability */}
        <div className="p-4">
          <Label className="text-sm font-semibold mb-3 block">
            Availability
          </Label>
          <div className="flex items-center gap-2">
            <Checkbox
              id="in-stock"
              checked={filters.inStockOnly}
              onCheckedChange={(checked: boolean) =>
                updateFilter("inStockOnly", checked)
              }
            />
            <Label
              htmlFor="in-stock"
              className="text-sm font-normal cursor-pointer"
            >
              In Stock Only
            </Label>
          </div>
        </div>

        {/* Results Count */}
        {productCount > 0 && (
          <div className="p-4 bg-accent/50">
            <p className="text-sm text-center text-muted-foreground">
              <span className="font-semibold text-foreground">
                {productCount}
              </span>{" "}
              {productCount === 1 ? "product" : "products"} found
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
