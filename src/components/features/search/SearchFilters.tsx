// 🔍 Search Filters Component
// Divine Agricultural Filter Consciousness

"use client";

import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  X,
  Filter,
  Leaf,
  Calendar,
  DollarSign,
  Building2,
  Tag,
} from "lucide-react";
import type {
  ProductSearchFilters,
  FilterOption,
  Season,
} from "@/types/search";
import {
  formatPrice,
  getPriceRangePresets,
  getCurrentSeason,
} from "@/lib/utils/search.utils";

interface SearchFiltersProps {
  filters: ProductSearchFilters;
  onFiltersChange: (filters: ProductSearchFilters) => void;
  availableCategories?: FilterOption[];
  availableFarms?: FilterOption[];
  priceRange?: {
    min: number;
    max: number;
  };
  className?: string;
}

/**
 * Search filters panel with agricultural consciousness
 * Supports categories, price range, farms, and special filters
 */
export function SearchFilters({
  filters,
  onFiltersChange,
  availableCategories = [],
  availableFarms = [],
  priceRange = { min: 0, max: 100 },
  className,
}: SearchFiltersProps) {
  const [localPriceRange, setLocalPriceRange] = useState<[number, number]>([
    filters.minPrice || priceRange.min,
    filters.maxPrice || priceRange.max,
  ]);

  const currentSeason = getCurrentSeason();

  // Update price range when filters change externally
  useEffect(() => {
    setLocalPriceRange([
      filters.minPrice || priceRange.min,
      filters.maxPrice || priceRange.max,
    ]);
  }, [filters.minPrice, filters.maxPrice, priceRange]);

  // Handle category toggle
  const handleCategoryToggle = (categoryId: string) => {
    const newFilters = { ...filters };
    if (newFilters.categoryId === categoryId) {
      delete newFilters.categoryId;
    } else {
      newFilters.categoryId = categoryId;
    }
    onFiltersChange(newFilters);
  };

  // Handle farm toggle
  const handleFarmToggle = (farmId: string) => {
    const newFilters = { ...filters };
    if (newFilters.farmId === farmId) {
      delete newFilters.farmId;
    } else {
      newFilters.farmId = farmId;
    }
    onFiltersChange(newFilters);
  };

  // Handle price range change
  const handlePriceRangeChange = (value: [number, number]) => {
    setLocalPriceRange(value);
  };

  // Apply price range on mouse up
  const handlePriceRangeCommit = (value: [number, number]) => {
    onFiltersChange({
      ...filters,
      minPrice: value[0],
      maxPrice: value[1],
    });
  };

  // Handle preset price range
  const handlePresetPriceRange = (min?: number, max?: number) => {
    const newRange: [number, number] = [
      min || priceRange.min,
      max || priceRange.max,
    ];
    setLocalPriceRange(newRange);
    onFiltersChange({
      ...filters,
      minPrice: min,
      maxPrice: max,
    });
  };

  // Handle availability toggle
  const handleAvailabilityToggle = (
    value: "IN_STOCK" | "OUT_OF_STOCK" | "ALL"
  ) => {
    onFiltersChange({
      ...filters,
      availability: value === "ALL" ? undefined : value,
    });
  };

  // Handle organic toggle
  const handleOrganicToggle = () => {
    onFiltersChange({
      ...filters,
      organic: !filters.organic,
    });
  };

  // Handle seasonal toggle
  const handleSeasonalToggle = () => {
    onFiltersChange({
      ...filters,
      seasonal: !filters.seasonal,
    });
  };

  // Clear all filters
  const handleClearAll = () => {
    setLocalPriceRange([priceRange.min, priceRange.max]);
    onFiltersChange({
      page: filters.page,
      limit: filters.limit,
      sortBy: filters.sortBy,
    });
  };

  // Count active filters
  const activeFilterCount = [
    filters.categoryId,
    filters.farmId,
    filters.minPrice !== undefined || filters.maxPrice !== undefined,
    filters.availability,
    filters.organic,
    filters.seasonal,
  ].filter(Boolean).length;

  const pricePresets = getPriceRangePresets();

  return (
    <div
      className={cn(
        "w-full space-y-6 rounded-lg border bg-card p-6 shadow-sm",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">Filters</h3>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFilterCount}
            </Badge>
          )}
        </div>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="h-8 px-2 text-xs"
          >
            <X className="mr-1 h-3 w-3" />
            Clear All
          </Button>
        )}
      </div>

      <Separator />

      {/* Filters Accordion */}
      <Accordion type="multiple" defaultValue={["availability", "price"]} className="w-full">
        {/* Availability */}
        <AccordionItem value="availability">
          <AccordionTrigger className="text-sm font-medium">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Availability
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="in-stock"
                  checked={filters.availability === "IN_STOCK"}
                  onCheckedChange={() => handleAvailabilityToggle("IN_STOCK")}
                />
                <Label htmlFor="in-stock" className="cursor-pointer text-sm">
                  In Stock Only
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="out-of-stock"
                  checked={filters.availability === "OUT_OF_STOCK"}
                  onCheckedChange={() =>
                    handleAvailabilityToggle("OUT_OF_STOCK")
                  }
                />
                <Label
                  htmlFor="out-of-stock"
                  className="cursor-pointer text-sm"
                >
                  Out of Stock
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="all-stock"
                  checked={!filters.availability}
                  onCheckedChange={() => handleAvailabilityToggle("ALL")}
                />
                <Label htmlFor="all-stock" className="cursor-pointer text-sm">
                  Show All
                </Label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Price Range */}
        <AccordionItem value="price">
          <AccordionTrigger className="text-sm font-medium">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Price Range
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              {/* Price slider */}
              <div className="px-2">
                <Slider
                  min={priceRange.min}
                  max={priceRange.max}
                  step={1}
                  value={localPriceRange}
                  onValueChange={handlePriceRangeChange}
                  onValueCommit={handlePriceRangeCommit}
                  className="mb-4"
                />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{formatPrice(localPriceRange[0])}</span>
                  <span>{formatPrice(localPriceRange[1])}</span>
                </div>
              </div>

              {/* Price presets */}
              <div className="flex flex-wrap gap-2">
                {pricePresets.map((preset) => (
                  <Button
                    key={preset.label}
                    variant={
                      filters.minPrice === preset.min &&
                      filters.maxPrice === preset.max
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() =>
                      handlePresetPriceRange(preset.min, preset.max)
                    }
                    className="h-7 text-xs"
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Categories */}
        {availableCategories.length > 0 && (
          <AccordionItem value="categories">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Categories
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <ScrollArea className="h-[200px] pr-4">
                <div className="space-y-3 pt-2">
                  {availableCategories.map((category) => (
                    <div
                      key={category.value}
                      className="flex items-center justify-between space-x-2"
                    >
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category.value}`}
                          checked={filters.categoryId === category.value}
                          onCheckedChange={() =>
                            handleCategoryToggle(category.value)
                          }
                          disabled={category.disabled}
                        />
                        <Label
                          htmlFor={`category-${category.value}`}
                          className="cursor-pointer text-sm"
                        >
                          {category.label}
                        </Label>
                      </div>
                      {category.count !== undefined && (
                        <span className="text-xs text-muted-foreground">
                          ({category.count})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Farms */}
        {availableFarms.length > 0 && (
          <AccordionItem value="farms">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Farms
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <ScrollArea className="h-[200px] pr-4">
                <div className="space-y-3 pt-2">
                  {availableFarms.map((farm) => (
                    <div
                      key={farm.value}
                      className="flex items-center justify-between space-x-2"
                    >
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`farm-${farm.value}`}
                          checked={filters.farmId === farm.value}
                          onCheckedChange={() => handleFarmToggle(farm.value)}
                          disabled={farm.disabled}
                        />
                        <Label
                          htmlFor={`farm-${farm.value}`}
                          className="cursor-pointer text-sm"
                        >
                          {farm.label}
                        </Label>
                      </div>
                      {farm.count !== undefined && (
                        <span className="text-xs text-muted-foreground">
                          ({farm.count})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Special Filters */}
        <AccordionItem value="special">
          <AccordionTrigger className="text-sm font-medium">
            <div className="flex items-center gap-2">
              <Leaf className="h-4 w-4" />
              Special Filters
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-2">
              {/* Organic */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="organic"
                  checked={filters.organic || false}
                  onCheckedChange={handleOrganicToggle}
                />
                <Label htmlFor="organic" className="cursor-pointer text-sm">
                  <div className="flex items-center gap-2">
                    <Leaf className="h-3 w-3 text-green-600" />
                    Organic Only
                  </div>
                </Label>
              </div>

              {/* Seasonal */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="seasonal"
                  checked={filters.seasonal || false}
                  onCheckedChange={handleSeasonalToggle}
                />
                <Label htmlFor="seasonal" className="cursor-pointer text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3 text-blue-600" />
                    Seasonal ({currentSeason})
                  </div>
                </Label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

/**
 * Mobile filter sheet trigger
 */
export function MobileFilterTrigger({
  activeFilterCount,
  onClick,
}: {
  activeFilterCount: number;
  onClick: () => void;
}) {
  return (
    <Button variant="outline" size="sm" onClick={onClick} className="gap-2">
      <Filter className="h-4 w-4" />
      Filters
      {activeFilterCount > 0 && (
        <Badge variant="secondary" className="h-5 px-1.5 text-xs">
          {activeFilterCount}
        </Badge>
      )}
    </Button>
  );
}
