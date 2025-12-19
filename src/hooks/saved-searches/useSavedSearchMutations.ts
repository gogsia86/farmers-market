/**
 * useSavedSearchMutations Hooks
 *
 * React Query mutation hooks for saved search operations:
 * - Create saved search
 * - Update saved search
 * - Delete saved search
 * - Execute saved search
 * - Duplicate saved search
 *
 * @example
 * ```tsx
 * const { createSavedSearch, isCreating } = useCreateSavedSearch();
 *
 * await createSavedSearch({
 *   name: 'My Search',
 *   filters: { category: 'VEGETABLES' }
 * });
 * ```
 *
 * @since Run 4
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/query-keys";
import { Season, NotificationFrequency } from "@prisma/client";
import { useToast } from "@/hooks/use-toast";

// ============================================
// TYPES
// ============================================

export interface CreateSavedSearchInput {
  name: string;
  description?: string;
  query?: string;
  filters?: Record<string, any>;
  sortBy?: string;
  location?: {
    lat: number;
    lng: number;
    radius: number;
  };
  isPublic?: boolean;
  folderId?: string;
  tags?: string[];
  notificationsEnabled?: boolean;
  notificationFrequency?: NotificationFrequency;
  seasonalPreference?: Season;
  preferredFarms?: string[];
  biodynamicOnly?: boolean;
}

export interface UpdateSavedSearchInput {
  name?: string;
  description?: string;
  query?: string;
  filters?: Record<string, any>;
  sortBy?: string;
  location?: {
    lat: number;
    lng: number;
    radius: number;
  };
  isPublic?: boolean;
  folderId?: string;
  tags?: string[];
  notificationsEnabled?: boolean;
  notificationFrequency?: NotificationFrequency;
  seasonalPreference?: Season;
  preferredFarms?: string[];
  biodynamicOnly?: boolean;
}

export interface ExecuteSavedSearchInput {
  limit?: number;
  offset?: number;
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Create a new saved search
 */
async function createSavedSearch(input: CreateSavedSearchInput) {
  const response = await fetch("/api/saved-searches", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create saved search");
  }

  return response.json();
}

/**
 * Update a saved search
 */
async function updateSavedSearch(id: string, input: UpdateSavedSearchInput) {
  const response = await fetch(`/api/saved-searches/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update saved search");
  }

  return response.json();
}

/**
 * Delete a saved search
 */
async function deleteSavedSearch(id: string) {
  const response = await fetch(`/api/saved-searches/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete saved search");
  }

  return response.json();
}

/**
 * Execute a saved search
 */
async function executeSavedSearch(
  id: string,
  params: ExecuteSavedSearchInput = {},
) {
  const response = await fetch(`/api/saved-searches/${id}/execute`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to execute saved search");
  }

  return response.json();
}

// ============================================
// MUTATION HOOKS
// ============================================

/**
 * Hook to create a saved search
 */
export function useCreateSavedSearch() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: createSavedSearch,
    onSuccess: (data) => {
      // Invalidate saved searches list
      queryClient.invalidateQueries({
        queryKey: queryKeys.savedSearches.all,
      });

      toast({
        title: "Saved search created",
        description: `"${data.savedSearch.name}" has been saved successfully.`,
        variant: "success",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create saved search",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    createSavedSearch: mutation.mutate,
    createSavedSearchAsync: mutation.mutateAsync,
    isCreating: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
  };
}

/**
 * Hook to update a saved search
 */
export function useUpdateSavedSearch() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSavedSearchInput }) =>
      updateSavedSearch(id, data),
    onSuccess: (data, variables) => {
      // Invalidate saved searches list
      queryClient.invalidateQueries({
        queryKey: queryKeys.savedSearches.all,
      });

      // Invalidate specific saved search
      queryClient.invalidateQueries({
        queryKey: queryKeys.savedSearches.detail(variables.id),
      });

      toast({
        title: "Saved search updated",
        description: `"${data.savedSearch.name}" has been updated successfully.`,
        variant: "success",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update saved search",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    updateSavedSearch: mutation.mutate,
    updateSavedSearchAsync: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
  };
}

/**
 * Hook to delete a saved search
 */
export function useDeleteSavedSearch() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: deleteSavedSearch,
    onSuccess: () => {
      // Invalidate saved searches list
      queryClient.invalidateQueries({
        queryKey: queryKeys.savedSearches.all,
      });

      toast({
        title: "Saved search deleted",
        description: "The saved search has been deleted successfully.",
        variant: "success",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete saved search",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    deleteSavedSearch: mutation.mutate,
    deleteSavedSearchAsync: mutation.mutateAsync,
    isDeleting: mutation.isPending,
    error: mutation.error,
  };
}

/**
 * Hook to execute a saved search
 */
export function useExecuteSavedSearch() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: ({
      id,
      params,
    }: {
      id: string;
      params?: ExecuteSavedSearchInput;
    }) => executeSavedSearch(id, params),
    onSuccess: (data, variables) => {
      // Update execution stats in cache
      queryClient.invalidateQueries({
        queryKey: queryKeys.savedSearches.detail(variables.id),
      });

      // Cache the results
      queryClient.setQueryData(
        queryKeys.savedSearches.execute(variables.id, variables.params),
        data,
      );
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to execute saved search",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    executeSavedSearch: mutation.mutate,
    executeSavedSearchAsync: mutation.mutateAsync,
    isExecuting: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
  };
}

/**
 * Hook to duplicate a saved search
 */
export function useDuplicateSavedSearch() {
  const { createSavedSearchAsync } = useCreateSavedSearch();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async ({ id, newName }: { id: string; newName?: string }) => {
      // Fetch the original search
      const response = await fetch(`/api/saved-searches/${id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch saved search");
      }

      const original = await response.json();

      // Create duplicate
      return createSavedSearchAsync({
        name: newName || `${original.name} (Copy)`,
        description: original.description,
        query: original.query,
        filters: original.filters,
        sortBy: original.sortBy,
        location: original.location,
        isPublic: false, // Duplicates are private by default
        folderId: original.folderId,
        tags: original.tags,
        notificationsEnabled: original.notificationsEnabled,
        notificationFrequency: original.notificationFrequency,
        seasonalPreference: original.seasonalPreference,
        preferredFarms: original.preferredFarms,
        biodynamicOnly: original.biodynamicOnly,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.savedSearches.all,
      });

      toast({
        title: "Saved search duplicated",
        description: "The search has been duplicated successfully.",
        variant: "success",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to duplicate saved search",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    duplicateSavedSearch: mutation.mutate,
    duplicateSavedSearchAsync: mutation.mutateAsync,
    isDuplicating: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
  };
}
