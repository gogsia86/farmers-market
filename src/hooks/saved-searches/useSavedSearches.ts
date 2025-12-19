/**
 * useSavedSearches Hook
 *
 * React Query hook for fetching saved searches with filtering and pagination
 *
 * @example
 * ```tsx
 * const { searches, isLoading, error } = useSavedSearches({
 *   folderId: 'folder-123',
 *   limit: 20
 * });
 * ```
 *
 * @since Run 4
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/react-query/query-keys';
import { Season } from '@prisma/client';

// ============================================
// TYPES
// ============================================

export interface SavedSearchFilters {
  folderId?: string | null;
  tags?: string[];
  seasonalPreference?: Season;
  isPublic?: boolean;
  limit?: number;
  offset?: number;
}

export interface SavedSearch {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  query?: string | null;
  filters: Record<string, any>;
  sortBy?: string | null;
  location?: {
    lat: number;
    lng: number;
    radius: number;
  } | null;
  isPublic: boolean;
  shareToken?: string | null;
  folderId?: string | null;
  tags: string[];
  notificationsEnabled: boolean;
  notificationFrequency: string;
  lastNotificationSent?: Date | null;
  executionCount: number;
  lastExecutedAt?: Date | null;
  resultsCount?: number | null;
  seasonalPreference?: Season | null;
  preferredFarms: string[];
  biodynamicOnly: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
    avatar: string | null;
  };
  folder?: {
    id: string;
    name: string;
    color?: string | null;
    icon?: string | null;
  } | null;
  _count?: {
    alerts: number;
    sharedWith: number;
  };
}

export interface SavedSearchesResponse {
  searches: SavedSearch[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Fetch saved searches from API
 */
async function fetchSavedSearches(
  filters: SavedSearchFilters = {}
): Promise<SavedSearchesResponse> {
  const params = new URLSearchParams();

  if (filters.folderId !== undefined) {
    params.append('folderId', filters.folderId || '');
  }

  if (filters.tags && filters.tags.length > 0) {
    params.append('tags', filters.tags.join(','));
  }

  if (filters.seasonalPreference) {
    params.append('seasonalPreference', filters.seasonalPreference);
  }

  if (filters.isPublic !== undefined) {
    params.append('isPublic', filters.isPublic.toString());
  }

  if (filters.limit) {
    params.append('limit', filters.limit.toString());
  }

  if (filters.offset) {
    params.append('offset', filters.offset.toString());
  }

  const response = await fetch(`/api/saved-searches?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch saved searches');
  }

  return response.json();
}

// ============================================
// HOOK
// ============================================

/**
 * Hook to fetch saved searches with React Query
 */
export function useSavedSearches(filters: SavedSearchFilters = {}) {
  const query = useQuery({
    queryKey: queryKeys.savedSearches.list(filters),
    queryFn: () => fetchSavedSearches(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
  });

  return {
    searches: query.data?.searches || [],
    total: query.data?.total || 0,
    hasMore: query.data?.hasMore || false,
    limit: query.data?.limit || filters.limit || 50,
    offset: query.data?.offset || filters.offset || 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error as Error | null,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
}

/**
 * Hook to fetch saved searches by folder
 */
export function useSavedSearchesByFolder(folderId: string | null) {
  return useSavedSearches({ folderId });
}

/**
 * Hook to fetch public saved searches
 */
export function usePublicSavedSearches() {
  return useSavedSearches({ isPublic: true });
}

/**
 * Hook to fetch saved searches by season
 */
export function useSavedSearchesBySeason(season: Season) {
  return useSavedSearches({ seasonalPreference: season });
}

/**
 * Hook to fetch saved searches by tags
 */
export function useSavedSearchesByTags(tags: string[]) {
  return useSavedSearches({ tags });
}
