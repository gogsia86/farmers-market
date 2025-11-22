"use client";

/**
 * 🔍 SEARCH AUTOCOMPLETE COMPONENT
 * Real-time search suggestions for homepage search bar
 *
 * Divine Patterns:
 * - Debounced API calls (300ms)
 * - Keyboard navigation (arrow keys, enter, escape)
 * - Click outside to close
 * - Loading and error states
 * - Product, farm, and category suggestions
 */

import { Search, TrendingUp, MapPin, Tag, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";

interface SearchSuggestion {
  type: "product" | "farm" | "category";
  id: string;
  name: string;
  description?: string;
  image?: string | null;
  farmName?: string;
  city?: string;
  state?: string;
  category?: string;
  price?: number;
}

interface SearchAutocompleteProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchAutocomplete({
  onSearch,
  placeholder = "Search for fresh tomatoes, local honey, organic eggs...",
  className = "",
}: SearchAutocompleteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  // Popular search terms (shown when input is empty)
  const popularTerms = ["Tomatoes", "Organic Eggs", "Fresh Milk", "Honey"];

  // Fetch suggestions with debounce
  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/search/suggest?q=${encodeURIComponent(searchQuery)}&limit=10`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch suggestions");
      }

      const data = await response.json();

      if (data.success) {
        setSuggestions(data.data);
        setShowDropdown(true);
        setSelectedIndex(-1);
      } else {
        throw new Error(data.error || "Failed to load suggestions");
      }
    } catch (err) {
      console.error("Error fetching suggestions:", err);
      setError(err instanceof Error ? err.message : "Failed to load suggestions");
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle input change with debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer for debounced search
    if (value.length >= 2) {
      debounceTimerRef.current = setTimeout(() => {
        fetchSuggestions(value);
      }, 300); // 300ms debounce
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  };

  // Handle search submit
  const handleSearch = (searchQuery?: string) => {
    const finalQuery = searchQuery || query;

    if (!finalQuery.trim()) {
      return;
    }

    setShowDropdown(false);

    if (onSearch) {
      onSearch(finalQuery);
    } else {
      router.push(`/search?q=${encodeURIComponent(finalQuery)}`);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setShowDropdown(false);

    if (suggestion.type === "product") {
      router.push(`/products?q=${encodeURIComponent(suggestion.name)}`);
    } else if (suggestion.type === "farm") {
      router.push(`/farms?q=${encodeURIComponent(suggestion.name)}`);
    } else if (suggestion.type === "category") {
      router.push(`/products?category=${suggestion.category}`);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || suggestions.length === 0) {
      if (e.key === "Enter") {
        handleSearch();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;

      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;

      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else {
          handleSearch();
        }
        break;

      case "Escape":
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Clear query
  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  // Get icon for suggestion type
  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case "product":
        return <Tag className="h-4 w-4 text-agricultural-600" />;
      case "farm":
        return <MapPin className="h-4 w-4 text-agricultural-600" />;
      case "category":
        return <TrendingUp className="h-4 w-4 text-agricultural-600" />;
      default:
        return <Search className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query.length >= 2 && suggestions.length > 0) {
              setShowDropdown(true);
            }
          }}
          placeholder={placeholder}
          className="w-full px-6 py-5 pr-32 rounded-full border-2 border-agricultural-200 focus:border-agricultural-500 focus:outline-none text-lg shadow-lg transition-all"
          aria-label="Search products and farms"
          aria-autocomplete="list"
          aria-controls="search-suggestions"
          aria-expanded={showDropdown}
        />

        {/* Clear Button */}
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-32 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Clear search"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        )}

        {/* Search Button */}
        <button
          onClick={() => handleSearch()}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-agricultural-600 hover:bg-agricultural-700 text-white px-8 py-3 rounded-full font-semibold transition-colors flex items-center gap-2"
          aria-label="Search"
        >
          <Search className="h-5 w-5" />
          Search
        </button>
      </div>

      {/* Popular Searches (shown when input is empty) */}
      {!query && !showDropdown && (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <span className="text-sm text-gray-600">Popular:</span>
          {popularTerms.map((term) => (
            <button
              key={term}
              onClick={() => {
                setQuery(term);
                handleSearch(term);
              }}
              className="text-sm text-agricultural-600 hover:text-agricultural-700 hover:underline transition-colors"
            >
              {term}
            </button>
          ))}
        </div>
      )}

      {/* Suggestions Dropdown */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          id="search-suggestions"
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50 max-h-96 overflow-y-auto"
          role="listbox"
        >
          {/* Loading State */}
          {loading && (
            <div className="p-4 text-center">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-agricultural-600"></div>
              <p className="text-sm text-gray-600 mt-2">Searching...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="p-4 text-center">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* No Results */}
          {!loading && !error && suggestions.length === 0 && query.length >= 2 && (
            <div className="p-6 text-center">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-600">No results found for "{query}"</p>
              <p className="text-sm text-gray-500 mt-1">
                Try different keywords or browse our categories
              </p>
            </div>
          )}

          {/* Suggestions List */}
          {!loading && suggestions.length > 0 && (
            <ul className="divide-y divide-gray-100">
              {suggestions.map((suggestion, index) => (
                <li key={suggestion.id}>
                  <button
                    onClick={() => handleSuggestionClick(suggestion)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full text-left p-4 hover:bg-agricultural-50 transition-colors flex items-center gap-4 ${
                      selectedIndex === index ? "bg-agricultural-50" : ""
                    }`}
                    role="option"
                    aria-selected={selectedIndex === index}
                  >
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      {getSuggestionIcon(suggestion.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 truncate">
                          {suggestion.name}
                        </span>
                        {suggestion.type === "product" && suggestion.price && (
                          <span className="text-agricultural-600 font-semibold text-sm">
                            ${suggestion.price.toFixed(2)}
                          </span>
                        )}
                      </div>

                      {/* Metadata */}
                      <div className="text-sm text-gray-600 flex items-center gap-2 mt-0.5">
                        {suggestion.type === "product" && suggestion.farmName && (
                          <span className="truncate">{suggestion.farmName}</span>
                        )}
                        {suggestion.type === "farm" &&
                          (suggestion.city || suggestion.state) && (
                            <span className="truncate">
                              {suggestion.city}
                              {suggestion.city && suggestion.state && ", "}
                              {suggestion.state}
                            </span>
                          )}
                        {suggestion.type === "category" && suggestion.description && (
                          <span className="truncate">{suggestion.description}</span>
                        )}
                      </div>
                    </div>

                    {/* Type Badge */}
                    <div className="flex-shrink-0">
                      <span className="text-xs text-gray-500 capitalize">
                        {suggestion.type}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Footer */}
          {suggestions.length > 0 && (
            <div className="bg-gray-50 px-4 py-3 text-center border-t border-gray-200">
              <button
                onClick={() => handleSearch()}
                className="text-sm text-agricultural-600 hover:text-agricultural-700 font-medium"
              >
                View all results for "{query}" →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
