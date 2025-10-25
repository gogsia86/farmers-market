/**
 * PRODUCT FILTERS COMPONENT
 * Divine React component for agricultural product filtering interface
 * Quantum filter consciousness for optimal product discovery
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
import { ProductCategory, Season } from "@/types/product";
import { X } from "lucide-react";

export interface ProductFilterState {
  categories: ProductCategory[];
  seasons: Season[];
  isOrganic?: boolean;
  isNonGMO?: boolean;
  inStock?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "name" | "price" | "newest" | "popular";
  sortOrder?: "asc" | "desc";
}

interface ProductFiltersProps {
  filters: ProductFilterState;
  onFiltersChange: (filters: ProductFilterState) => void;
  onReset: () => void;
}

export function ProductFilters({
  filters,
  onFiltersChange,
  onReset,
}: ProductFiltersProps) {
  const updateFilter = <K extends keyof ProductFilterState>(
    key: K,
    value: ProductFilterState[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleCategory = (category: ProductCategory) => {
    const categories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    updateFilter("categories", categories);
  };

  const toggleSeason = (season: Season) => {
    const seasons = filters.seasons.includes(season)
      ? filters.seasons.filter((s) => s !== season)
      : [...filters.seasons, season];
    updateFilter("seasons", seasons);
  };

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.seasons.length > 0 ||
    filters.isOrganic !== undefined ||
    filters.isNonGMO !== undefined ||
    filters.inStock !== undefined ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined;

  return (
    <div className="space-y-4">
      {/* Header with Reset */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-primary"
          >
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Sort */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Sort By</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select
            value={filters.sortBy}
            onValueChange={(value) =>
              updateFilter("sortBy", value as ProductFilterState["sortBy"])
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="name">Name (A-Z)</SelectItem>
              <SelectItem value="price">Price</SelectItem>
            </SelectContent>
          </Select>

          {filters.sortBy &&
            filters.sortBy !== "newest" &&
            filters.sortBy !== "popular" && (
              <Select
                value={filters.sortOrder}
                onValueChange={(value) =>
                  updateFilter("sortOrder", value as "asc" | "desc")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Order..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">
                    {filters.sortBy === "name" ? "A-Z" : "Low to High"}
                  </SelectItem>
                  <SelectItem value="desc">
                    {filters.sortBy === "name" ? "Z-A" : "High to Low"}
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Category</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {Object.values(ProductCategory).map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category}`}
                checked={filters.categories.includes(category)}
                onCheckedChange={() => toggleCategory(category)}
              />
              <Label
                htmlFor={`category-${category}`}
                className="text-sm font-normal cursor-pointer"
              >
                {category}
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Seasons */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Season</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {Object.values(Season).map((season) => (
            <div key={season} className="flex items-center space-x-2">
              <Checkbox
                id={`season-${season}`}
                checked={filters.seasons.includes(season)}
                onCheckedChange={() => toggleSeason(season)}
              />
              <Label
                htmlFor={`season-${season}`}
                className="text-sm font-normal cursor-pointer"
              >
                {season}
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Attributes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Attributes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isOrganic"
              checked={filters.isOrganic === true}
              onCheckedChange={(checked) =>
                updateFilter("isOrganic", checked ? true : undefined)
              }
            />
            <Label
              htmlFor="isOrganic"
              className="text-sm font-normal cursor-pointer"
            >
              Organic
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isNonGMO"
              checked={filters.isNonGMO === true}
              onCheckedChange={(checked) =>
                updateFilter("isNonGMO", checked ? true : undefined)
              }
            />
            <Label
              htmlFor="isNonGMO"
              className="text-sm font-normal cursor-pointer"
            >
              Non-GMO
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="inStock"
              checked={filters.inStock === true}
              onCheckedChange={(checked) =>
                updateFilter("inStock", checked ? true : undefined)
              }
            />
            <Label
              htmlFor="inStock"
              className="text-sm font-normal cursor-pointer"
            >
              In Stock
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Price Range */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Price Range</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="minPrice" className="text-sm">
              Min Price
            </Label>
            <Input
              id="minPrice"
              type="number"
              step="0.01"
              placeholder="$0.00"
              value={filters.minPrice || ""}
              onChange={(e) =>
                updateFilter(
                  "minPrice",
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
            />
          </div>

          <div>
            <Label htmlFor="maxPrice" className="text-sm">
              Max Price
            </Label>
            <Input
              id="maxPrice"
              type="number"
              step="0.01"
              placeholder="$999.99"
              value={filters.maxPrice || ""}
              onChange={(e) =>
                updateFilter(
                  "maxPrice",
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
