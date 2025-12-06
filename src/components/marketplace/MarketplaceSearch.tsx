"use client";

/**
 * 🔍 MARKETPLACE SEARCH COMPONENT
 * Flexible search component for marketplace products and farms pages
 *
 * Divine Patterns:
 * - Debounced search (300ms)
 * - Real-time filtering
 * - Keyboard navigation
 * - Loading states
 * - Agricultural consciousness
 *
 * Features:
 * - Search products or farms
 * - Filter by category
 * - Sort options
 * - Quick filters (organic, in-season)
 * - Responsive design
 *
 * Reference: 04_NEXTJS_DIVINE_IMPLEMENTATION.instructions.md
 */

import { Search, X, ChevronDown, Leaf } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";

interface MarketplaceSearchProps {
  type: "products" | "farms";
  placeholder?: string;
  onSearch?: (query: string) => void;
  showFilters?: boolean;
  className?: string;
}

interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

const PRODUCT_CATEGORIES: FilterOption[] = [
  { label: "All Categories", value: "" },
  { label: "Vegetables", value: "vegetables" },
  { label: "Fruits", value: "fruits" },
  { label: "Dairy", value: "dairy" },
  { label: "Meat & Poultry", value: "meat" },
  { label: "Eggs", value: "eggs" },
  { label: "Honey & Bee Products", value: "honey" },
  { label: "Preserves & Jams", value: "preserves" },
  { label: "Baked Goods", value: "baked-goods" },
];

const SORT_OPTIONS: FilterOption[] = [
  { label: "Relevance", value: "relevance" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Name: A to Z", value: "name-asc" },
  { label: "Newest First", value: "newest" },
  { label: "Rating: High to Low", value: "rating" },
];

export function MarketplaceSearch({
  type,
  placeholder,
  onSearch,
  showFilters = true,
  className = "",
}: MarketplaceSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "relevance");
  const [organicOnly, setOrganicOnly] = useState(
    searchParams.get("organic") === "true",
  );
  const [inSeasonOnly, setInSeasonOnly] = useState(
    searchParams.get("season") === "true",
  );
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  const defaultPlaceholder =
    type === "products"
      ? "Search fresh tomatoes, organic honey, free-range eggs..."
      : "Search farms by name, location, or products...";

  // Update URL with search params
  const updateSearchParams = useCallback(
    (params: Record<string, string | null>) => {
      const newParams = new URLSearchParams(searchParams.toString());

      Object.entries(params).forEach(([key, value]) => {
        if (value) {
          newParams.set(key, value);
        } else {
          newParams.delete(key);
        }
      });

      const queryString = newParams.toString();
      const path =
        type === "products" ? "/marketplace/products" : "/marketplace/farms";
      router.push(queryString ? `${path}?${queryString}` : path);
    },
    [router, searchParams, type],
  );

  // Handle search input change with debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer for debounced search
    debounceTimerRef.current = setTimeout(() => {
      if (onSearch) {
        onSearch(value);
      } else {
        updateSearchParams({ q: value || null });
      }
    }, 300);
  };

  // Handle search submit
  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();

    if (onSearch) {
      onSearch(query);
    } else {
      updateSearchParams({ q: query || null });
    }
  };

  // Handle clear search
  const handleClear = () => {
    setQuery("");
    if (onSearch) {
      onSearch("");
    } else {
      updateSearchParams({ q: null });
    }
    inputRef.current?.focus();
  };

  // Handle category change
  const handleCategoryChange = (value: string) => {
    setCategory(value);
    updateSearchParams({ category: value || null });
  };

  // Handle sort change
  const handleSortChange = (value: string) => {
    setSort(value);
    updateSearchParams({ sort: value === "relevance" ? null : value });
  };

  // Handle organic filter toggle
  const handleOrganicToggle = () => {
    const newValue = !organicOnly;
    setOrganicOnly(newValue);
    updateSearchParams({ organic: newValue ? "true" : null });
  };

  // Handle season filter toggle
  const handleSeasonToggle = () => {
    const newValue = !inSeasonOnly;
    setInSeasonOnly(newValue);
    updateSearchParams({ season: newValue ? "true" : null });
  };

  // Clear all filters
  const handleClearFilters = () => {
    setCategory("");
    setSort("relevance");
    setOrganicOnly(false);
    setInSeasonOnly(false);
    updateSearchParams({
      category: null,
      sort: null,
      organic: null,
      season: null,
    });
  };

  // Handle click outside filter dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setShowFilterDropdown(false);
      }
    }

    if (showFilterDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
    return undefined;
  }, [showFilterDropdown]);

  // Check if any filters are active
  const hasActiveFilters =
    category || sort !== "relevance" || organicOnly || inSeasonOnly;

  return (
    <div className={`${className}`}>
      {/* Search Bar */}
      <form
        onSubmit={handleSearch}
        className="flex flex-col sm:flex-row gap-3 mb-4"
      >
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder={placeholder || defaultPlaceholder}
            className="w-full pl-12 pr-12 py-3 rounded-lg border-2 border-gray-300 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 transition-all"
            aria-label={`Search ${type}`}
          />

          {/* Clear Button */}
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              aria-label="Clear search"
            >
              <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        {/* Search Button (Mobile) */}
        <button
          type="submit"
          className="sm:hidden bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Search className="h-5 w-5" />
          Search
        </button>
      </form>

      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-3 pb-4 border-b border-gray-200">
          {/* Category Dropdown (Products only) */}
          {type === "products" && (
            <div className="relative">
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 cursor-pointer"
                aria-label="Filter by category"
              >
                {PRODUCT_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
            </div>
          )}

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 cursor-pointer"
              aria-label="Sort results"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
          </div>

          {/* Quick Filters */}
          {type === "products" && (
            <>
              {/* Organic Filter */}
              <button
                onClick={handleOrganicToggle}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  organicOnly
                    ? "bg-green-100 text-green-700 border-2 border-green-500"
                    : "bg-white text-gray-700 border border-gray-300 hover:border-gray-400"
                }`}
                aria-label="Filter organic products only"
                aria-pressed={organicOnly}
              >
                <Leaf className="h-4 w-4" />
                Organic
              </button>

              {/* In Season Filter */}
              <button
                onClick={handleSeasonToggle}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  inSeasonOnly
                    ? "bg-green-100 text-green-700 border-2 border-green-500"
                    : "bg-white text-gray-700 border border-gray-300 hover:border-gray-400"
                }`}
                aria-label="Filter in-season products only"
                aria-pressed={inSeasonOnly}
              >
                In Season
              </button>
            </>
          )}

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="ml-auto text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
            >
              <X className="h-4 w-4" />
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Active Filter Summary */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600">Active filters:</span>

          {category && (
            <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
              {PRODUCT_CATEGORIES.find((c) => c.value === category)?.label}
              <button
                onClick={() => handleCategoryChange("")}
                className="hover:text-green-900"
                aria-label="Remove category filter"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {sort !== "relevance" && (
            <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
              {SORT_OPTIONS.find((s) => s.value === sort)?.label}
              <button
                onClick={() => handleSortChange("relevance")}
                className="hover:text-green-900"
                aria-label="Remove sort filter"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {organicOnly && (
            <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
              <Leaf className="h-3 w-3" />
              Organic
              <button
                onClick={handleOrganicToggle}
                className="hover:text-green-900"
                aria-label="Remove organic filter"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {inSeasonOnly && (
            <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
              In Season
              <button
                onClick={handleSeasonToggle}
                className="hover:text-green-900"
                aria-label="Remove season filter"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
