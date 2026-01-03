"use client";

import { productKeys } from "@/lib/react-query/query-keys";
import { createLogger } from "@/lib/utils/logger";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";

// Create logger for search suggestions
const searchLogger = createLogger("SearchSuggestions");

/**
 * 🌾 DIVINE AGRICULTURAL SEARCH SUGGESTIONS HOOK
 *
 * Autocomplete search with:
 * - Intelligent debouncing
 * - Multi-source suggestions (products, farms, categories)
 * - Agricultural consciousness
 * - Keyboard navigation support
 * - Cache-first strategy
 *
 * @module useSearchSuggestions
 */

// ============================================================================
// TYPE DEFINITIONS - DIVINE TYPE SAFETY
// ============================================================================

/**
 * Suggestion types
 */
export type SuggestionType = "PRODUCT" | "FARM" | "CATEGORY";

/**
 * Search suggestion
 */
export interface SearchSuggestion {
  type: SuggestionType;
  label: string;
  value: string;
  metadata?: {
    // Product metadata
    price?: number;
    image?: string;
    stock?: number;

    // Farm metadata
    productCount?: number;
    logo?: string;
    location?: string;

    // Category metadata
    icon?: string;
  };
}

/**
 * Suggestions API response
 */
export interface SuggestionsResponse {
  success: boolean;
  query: string;
  suggestions: SearchSuggestion[];
}

/**
 * Hook options
 */
export interface UseSearchSuggestionsOptions {
  /** Minimum query length to trigger search (default: 2) */
  minLength?: number;

  /** Debounce delay in milliseconds (default: 300) */
  debounceMs?: number;

  /** Maximum number of suggestions (default: 10) */
  limit?: number;

  /** Enable query (default: true) */
  enabled?: boolean;

  /** Callback when suggestion is selected */
  onSelect?: (suggestion: SearchSuggestion) => void;
}

/**
 * Hook return type
 */
export interface UseSearchSuggestionsReturn {
  // State
  suggestions: SearchSuggestion[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;

  // Query management
  query: string;
  setQuery: (query: string) => void;
  debouncedQuery: string;

  // Actions
  clearSuggestions: () => void;
  selectSuggestion: (suggestion: SearchSuggestion) => void;

  // Helpers
  hasSuggestions: boolean;
  isEmpty: boolean;

  // Keyboard navigation
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  selectNext: () => void;
  selectPrevious: () => void;
  selectCurrent: () => void;

  // Grouping helpers
  productSuggestions: SearchSuggestion[];
  farmSuggestions: SearchSuggestion[];
  categorySuggestions: SearchSuggestion[];
}

// ============================================================================
// API FUNCTIONS - QUANTUM FETCH OPERATIONS
// ============================================================================

/**
 * Fetch search suggestions from API
 */
async function fetchSuggestions(
  query: string,
  limit?: number,
): Promise<SuggestionsResponse> {
  const params = new URLSearchParams();
  params.append("q", query);
  if (limit) params.append("limit", String(limit));

  const response = await fetch(`/api/search/suggestions?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Suggestions fetch failed: ${response.statusText}`);
  }

  return response.json();
}

// ============================================================================
// DEBOUNCE HOOK - DIVINE INPUT OPTIMIZATION
// ============================================================================

/**
 * Custom debounce hook for search input
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up timeout to update debounced value
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up on value change or unmount
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// ============================================================================
// MAIN HOOK - DIVINE SEARCH SUGGESTIONS
// ============================================================================

/**
 * Divine Search Suggestions Hook with React Query
 *
 * Features:
 * - Intelligent debouncing (300ms default)
 * - Multi-source suggestions (products, farms, categories)
 * - Keyboard navigation support
 * - Cache-first strategy for instant results
 * - Agricultural consciousness
 *
 * @example
 * ```tsx
 * function SearchBar() {
 *   const {
 *     query,
 *     setQuery,
 *     suggestions,
 *     isLoading,
 *     selectSuggestion,
 *     selectedIndex,
 *     selectNext,
 *     selectPrevious,
 *     selectCurrent
 *   } = useSearchSuggestions({
 *     minLength: 2,
 *     debounceMs: 300,
 *     onSelect: (suggestion) => {
 *       router.push(`/search?q=${suggestion.value}`);
 *     }
 *   });
 *
 *   const handleKeyDown = (e: KeyboardEvent) => {
 *     if (e.key === "ArrowDown") {
 *       e.preventDefault();
 *       selectNext();
 *     } else if (e.key === "ArrowUp") {
 *       e.preventDefault();
 *       selectPrevious();
 *     } else if (e.key === "Enter") {
 *       e.preventDefault();
 *       selectCurrent();
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       <input
 *         value={query}
 *         onChange={(e) => setQuery(e.target.value)}
 *         onKeyDown={handleKeyDown}
 *         placeholder="Search products, farms, categories..."
 *       />
 *
 *       {suggestions.length > 0 && (
 *         <ul>
 *           {suggestions.map((suggestion, index) => (
 *             <li
 *               key={`${suggestion.type}-${suggestion.value}`}
 *               className={index === selectedIndex ? "selected" : ""}
 *               onClick={() => selectSuggestion(suggestion)}
 *             >
 *               {suggestion.label}
 *             </li>
 *           ))}
 *         </ul>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useSearchSuggestions(
  options: UseSearchSuggestionsOptions = {},
): UseSearchSuggestionsReturn {
  const {
    minLength = 2,
    debounceMs = 300,
    limit = 10,
    enabled = true,
    onSelect,
  } = options;

  const queryClient = useQueryClient();

  // Query state
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, debounceMs);

  // Keyboard navigation state
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Determine if query should trigger API call
  const shouldFetch = useMemo(() => {
    return enabled && debouncedQuery.length >= minLength;
  }, [enabled, debouncedQuery, minLength]);

  // Fetch suggestions with React Query
  const { data, isLoading, isError, error } = useQuery({
    queryKey: productKeys.suggestions(debouncedQuery),
    queryFn: () => fetchSuggestions(debouncedQuery, limit),
    enabled: shouldFetch,
    staleTime: 5 * 60 * 1000, // 5 minutes - suggestions don't change frequently
    gcTime: 10 * 60 * 1000, // 10 minutes - cache for quick re-search
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Extract suggestions
  const suggestions = useMemo(() => {
    return data?.suggestions ?? [];
  }, [data]);

  // Group suggestions by type
  const productSuggestions = useMemo(
    () => suggestions.filter((s) => s.type === "PRODUCT"),
    [suggestions],
  );

  const farmSuggestions = useMemo(
    () => suggestions.filter((s) => s.type === "FARM"),
    [suggestions],
  );

  const categorySuggestions = useMemo(
    () => suggestions.filter((s) => s.type === "CATEGORY"),
    [suggestions],
  );

  // Computed values
  const hasSuggestions = useMemo(() => suggestions.length > 0, [suggestions]);

  const isEmpty = useMemo(
    () => shouldFetch && !isLoading && suggestions.length === 0,
    [shouldFetch, isLoading, suggestions],
  );

  // Clear suggestions
  const clearSuggestions = useCallback(() => {
    setQuery("");
    setSelectedIndex(-1);
  }, []);

  // Select suggestion
  const selectSuggestion = useCallback(
    (suggestion: SearchSuggestion) => {
      setQuery(suggestion.label);
      setSelectedIndex(-1);
      onSelect?.(suggestion);
    },
    [onSelect],
  );

  // Keyboard navigation - Select next
  const selectNext = useCallback(() => {
    setSelectedIndex((prev) => {
      if (prev < suggestions.length - 1) {
        return prev + 1;
      }
      return prev;
    });
  }, [suggestions.length]);

  // Keyboard navigation - Select previous
  const selectPrevious = useCallback(() => {
    setSelectedIndex((prev) => {
      if (prev > -1) {
        return prev - 1;
      }
      return prev;
    });
  }, []);

  // Keyboard navigation - Select current
  const selectCurrent = useCallback(() => {
    if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
      const suggestion = suggestions[selectedIndex];
      if (suggestion) {
        selectSuggestion(suggestion);
      }
    }
  }, [selectedIndex, suggestions, selectSuggestion]);

  // Reset selected index when suggestions change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [suggestions]);

  return {
    // State
    suggestions,
    isLoading: shouldFetch && isLoading,
    isError,
    error: error as Error | null,

    // Query management
    query,
    setQuery,
    debouncedQuery,

    // Actions
    clearSuggestions,
    selectSuggestion,

    // Helpers
    hasSuggestions,
    isEmpty,

    // Keyboard navigation
    selectedIndex,
    setSelectedIndex,
    selectNext,
    selectPrevious,
    selectCurrent,

    // Grouping helpers
    productSuggestions,
    farmSuggestions,
    categorySuggestions,
  };
}

// ============================================================================
// RECENT SEARCHES HOOK - LOCAL STORAGE PERSISTENCE
// ============================================================================

/**
 * Hook for managing recent searches with local storage
 *
 * @example
 * ```tsx
 * function SearchBar() {
 *   const {
 *     recentSearches,
 *     addSearch,
 *     removeSearch,
 *     clearAll
 *   } = useRecentSearches();
 *
 *   return (
 *     <div>
 *       <h3>Recent Searches</h3>
 *       <ul>
 *         {recentSearches.map((search) => (
 *           <li key={search.id}>
 *             {search.query}
 *             <button onClick={() => removeSearch(search.id)}>×</button>
 *           </li>
 *         ))}
 *       </ul>
 *     </div>
 *   );
 * }
 * ```
 */
export function useRecentSearches(maxItems: number = 10) {
  const STORAGE_KEY = "agricultural_recent_searches";

  // Load initial state from localStorage
  const [recentSearches, setRecentSearches] = useState<
    Array<{ id: string; query: string; timestamp: number }>
  >(() => {
    if (typeof window === "undefined") return [];

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      searchLogger.error("Failed to load recent searches", error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  });

  // Save to localStorage whenever searches change
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recentSearches));
    } catch (error) {
      searchLogger.error("Failed to save recent searches", error instanceof Error ? error : new Error(String(error)));
    }
  }, [recentSearches]);

  // Add new search
  const addSearch = useCallback(
    (query: string) => {
      const trimmedQuery = query.trim();
      if (!trimmedQuery) return;

      setRecentSearches((prev) => {
        // Remove duplicate if exists
        const filtered = prev.filter((s) => s.query !== trimmedQuery);

        // Add new search at the beginning
        const updated = [
          {
            id: Date.now().toString(),
            query: trimmedQuery,
            timestamp: Date.now(),
          },
          ...filtered,
        ];

        // Keep only max items
        return updated.slice(0, maxItems);
      });
    },
    [maxItems],
  );

  // Remove specific search
  const removeSearch = useCallback((id: string) => {
    setRecentSearches((prev) => prev.filter((s) => s.id !== id));
  }, []);

  // Clear all searches
  const clearAll = useCallback(() => {
    setRecentSearches([]);
  }, []);

  return {
    recentSearches,
    addSearch,
    removeSearch,
    clearAll,
  };
}
