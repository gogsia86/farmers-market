/**
 * useSearchAlerts Hook
 *
 * React Query hooks for search alert operations:
 * - Fetch alerts with filtering
 * - Create, update, delete alerts
 * - Execute/test alerts
 * - Toggle alert status
 *
 * @example
 * ```tsx
 * const { alerts, isLoading } = useSearchAlerts({
 *   savedSearchId: 'search-123'
 * });
 * ```
 *
 * @since Run 4 - Phase 2
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/react-query/query-keys';
import { SearchAlertType } from '@prisma/client';
import { useToast } from '@/hooks/use-toast';

// ============================================
// TYPES
// ============================================

export interface SearchAlertFilters {
  savedSearchId?: string;
  type?: SearchAlertType;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}

export interface SearchAlert {
  id: string;
  savedSearchId: string;
  userId: string;
  type: SearchAlertType;
  conditions: Record<string, any>;
  channels: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
  };
  isActive: boolean;
  lastTriggered?: Date | null;
  triggerCount: number;
  createdAt: Date;
  updatedAt: Date;
  savedSearch: {
    id: string;
    name: string;
    query?: string | null;
    description?: string | null;
    filters?: Record<string, any>;
  };
}

export interface SearchAlertsResponse {
  alerts: SearchAlert[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface CreateAlertInput {
  savedSearchId: string;
  type: SearchAlertType;
  conditions: {
    minProducts?: number;
    priceChangePercent?: number;
    specificFarms?: string[];
    keywords?: string[];
    categories?: string[];
  };
  channels: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
  };
  isActive?: boolean;
}

export interface UpdateAlertInput {
  type?: SearchAlertType;
  conditions?: Record<string, any>;
  channels?: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
  };
  isActive?: boolean;
}

export interface AlertExecutionResult {
  alertId: string;
  triggered: boolean;
  notificationsSent: number;
  channels: string[];
  error?: string;
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Fetch search alerts from API
 */
async function fetchSearchAlerts(
  filters: SearchAlertFilters = {}
): Promise<SearchAlertsResponse> {
  const params = new URLSearchParams();

  if (filters.savedSearchId) {
    params.append('savedSearchId', filters.savedSearchId);
  }

  if (filters.type) {
    params.append('type', filters.type);
  }

  if (filters.isActive !== undefined) {
    params.append('isActive', filters.isActive.toString());
  }

  if (filters.limit) {
    params.append('limit', filters.limit.toString());
  }

  if (filters.offset) {
    params.append('offset', filters.offset.toString());
  }

  const response = await fetch(`/api/search-alerts?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch search alerts');
  }

  return response.json();
}

/**
 * Fetch single alert by ID
 */
async function fetchSearchAlert(alertId: string): Promise<SearchAlert> {
  const response = await fetch(`/api/search-alerts/${alertId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch alert');
  }

  return response.json();
}

/**
 * Create a new alert
 */
async function createAlert(input: CreateAlertInput) {
  const response = await fetch('/api/search-alerts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create alert');
  }

  return response.json();
}

/**
 * Update an alert
 */
async function updateAlert(alertId: string, input: UpdateAlertInput) {
  const response = await fetch(`/api/search-alerts/${alertId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update alert');
  }

  return response.json();
}

/**
 * Delete an alert
 */
async function deleteAlert(alertId: string) {
  const response = await fetch(`/api/search-alerts/${alertId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete alert');
  }

  return response.json();
}

/**
 * Execute/test an alert
 */
async function executeAlert(alertId: string): Promise<AlertExecutionResult> {
  const response = await fetch(`/api/search-alerts/${alertId}/execute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to execute alert');
  }

  const data = await response.json();
  return data.result;
}

// ============================================
// QUERY HOOKS
// ============================================

/**
 * Hook to fetch search alerts
 */
export function useSearchAlerts(filters: SearchAlertFilters = {}) {
  const query = useQuery({
    queryKey: ['search-alerts', 'list', filters],
    queryFn: () => fetchSearchAlerts(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    alerts: query.data?.alerts || [],
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
 * Hook to fetch alerts for a specific saved search
 */
export function useSearchAlertsBySavedSearch(savedSearchId: string) {
  return useSearchAlerts({ savedSearchId });
}

/**
 * Hook to fetch a single alert by ID
 */
export function useSearchAlert(alertId: string) {
  const query = useQuery({
    queryKey: ['search-alerts', 'detail', alertId],
    queryFn: () => fetchSearchAlert(alertId),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: !!alertId,
  });

  return {
    alert: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}

/**
 * Hook to fetch only active alerts
 */
export function useActiveSearchAlerts() {
  return useSearchAlerts({ isActive: true });
}

/**
 * Hook to fetch alerts by type
 */
export function useSearchAlertsByType(type: SearchAlertType) {
  return useSearchAlerts({ type });
}

// ============================================
// MUTATION HOOKS
// ============================================

/**
 * Hook to create a search alert
 */
export function useCreateSearchAlert() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: createAlert,
    onSuccess: (data) => {
      // Invalidate alerts list
      queryClient.invalidateQueries({
        queryKey: ['search-alerts'],
      });

      // Invalidate saved search to update alert count
      if (data.alert?.savedSearchId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.savedSearches.detail(data.alert.savedSearchId),
        });
      }

      toast({
        title: 'Alert created',
        description: 'Your search alert has been created successfully.',
        variant: 'success',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to create alert',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    createAlert: mutation.mutate,
    createAlertAsync: mutation.mutateAsync,
    isCreating: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
  };
}

/**
 * Hook to update a search alert
 */
export function useUpdateSearchAlert() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAlertInput }) =>
      updateAlert(id, data),
    onSuccess: (data, variables) => {
      // Invalidate alerts list
      queryClient.invalidateQueries({
        queryKey: ['search-alerts'],
      });

      // Invalidate specific alert
      queryClient.invalidateQueries({
        queryKey: ['search-alerts', 'detail', variables.id],
      });

      toast({
        title: 'Alert updated',
        description: 'Your search alert has been updated successfully.',
        variant: 'success',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update alert',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    updateAlert: mutation.mutate,
    updateAlertAsync: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
  };
}

/**
 * Hook to delete a search alert
 */
export function useDeleteSearchAlert() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: deleteAlert,
    onSuccess: () => {
      // Invalidate alerts list
      queryClient.invalidateQueries({
        queryKey: ['search-alerts'],
      });

      toast({
        title: 'Alert deleted',
        description: 'Your search alert has been deleted successfully.',
        variant: 'success',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to delete alert',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    deleteAlert: mutation.mutate,
    deleteAlertAsync: mutation.mutateAsync,
    isDeleting: mutation.isPending,
    error: mutation.error,
  };
}

/**
 * Hook to execute/test a search alert
 */
export function useExecuteSearchAlert() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: executeAlert,
    onSuccess: (result, alertId) => {
      // Invalidate alert to update last triggered time
      queryClient.invalidateQueries({
        queryKey: ['search-alerts', 'detail', alertId],
      });

      // Invalidate list to update trigger count
      queryClient.invalidateQueries({
        queryKey: ['search-alerts'],
      });

      if (result.triggered) {
        toast({
          title: 'Alert triggered',
          description: `Notifications sent via ${result.channels.join(', ')}`,
          variant: 'success',
        });
      } else {
        toast({
          title: 'Alert evaluated',
          description: 'Conditions not met - no notifications sent',
          variant: 'default',
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to execute alert',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    executeAlert: mutation.mutate,
    executeAlertAsync: mutation.mutateAsync,
    isExecuting: mutation.isPending,
    error: mutation.error,
    result: mutation.data,
  };
}

/**
 * Hook to toggle alert active status
 */
export function useToggleSearchAlert() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateAlert(id, { isActive: !isActive }),
    onSuccess: (data, variables) => {
      // Invalidate alerts
      queryClient.invalidateQueries({
        queryKey: ['search-alerts'],
      });

      queryClient.invalidateQueries({
        queryKey: ['search-alerts', 'detail', variables.id],
      });

      toast({
        title: variables.isActive ? 'Alert disabled' : 'Alert enabled',
        description: `Alert has been ${!variables.isActive ? 'enabled' : 'disabled'}`,
        variant: 'success',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to toggle alert',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    toggleAlert: mutation.mutate,
    toggleAlertAsync: mutation.mutateAsync,
    isToggling: mutation.isPending,
    error: mutation.error,
  };
}
