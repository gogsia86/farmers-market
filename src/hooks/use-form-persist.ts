/**
 * 🌟 Form Persistence Hook - Divine Form State Management
 * Custom hook for persisting form data to localStorage
 * Following: 08_UX_DESIGN_CONSCIOUSNESS, 12_ERROR_HANDLING_VALIDATION
 */

"use client";

import * as React from "react";

import { logger } from '@/lib/monitoring/logger';

interface UseFormPersistOptions {
  key: string;
  storage?: Storage;
  exclude?: string[];
  debounceTime?: number;
}

export function useFormPersist<T extends Record<string, any>>(
  defaultValues: T,
  options: UseFormPersistOptions
) {
  const {
    key,
    storage = typeof window !== "undefined" ? window.localStorage : null,
    exclude = [],
    debounceTime = 300,
  } = options;

  const [values, setValues] = React.useState<T>(() => {
    if (!storage) return defaultValues;

    try {
      const stored = storage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...defaultValues, ...parsed };
      }
    } catch (error) {
      logger.error("Failed to load persisted form data:", {
      error: error instanceof Error ? error.message : String(error),
    });
    }
    return defaultValues;
  });

  const timeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined);

  const persistValues = React.useCallback(
    (data: T) => {
      if (!storage) return;

      // Filter out excluded fields
      const filteredData = Object.entries(data).reduce((acc, [key, value]) => {
        if (!exclude.includes(key)) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);

      try {
        storage.setItem(key, JSON.stringify(filteredData));
      } catch (error) {
        logger.error("Failed to persist form data:", {
      error: error instanceof Error ? error.message : String(error),
    });
      }
    },
    [key, storage, exclude]
  );

  const updateValues = React.useCallback(
    (newValues: Partial<T>) => {
      setValues((prev) => {
        const updated = { ...prev, ...newValues };

        // Debounce persistence
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          persistValues(updated);
        }, debounceTime);

        return updated;
      });
    },
    [persistValues, debounceTime]
  );

  const clearPersistedData = React.useCallback(() => {
    if (!storage) return;
    try {
      storage.removeItem(key);
      setValues(defaultValues);
    } catch (error) {
      logger.error("Failed to clear persisted form data:", {
      error: error instanceof Error ? error.message : String(error),
    });
    }
  }, [key, storage, defaultValues]);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    values,
    updateValues,
    clearPersistedData,
    setValues,
  };
}

/**
 * Hook for auto-saving form data with React Hook Form
 */
export function useFormAutoSave<T extends Record<string, any>>(
  watch: () => T,
  options: {
    key: string;
    onSave?: (data: T) => void | Promise<void>;
    debounceTime?: number;
    enabled?: boolean;
  }
) {
  const { key, onSave, debounceTime = 1000, enabled = true } = options;
  const [isSaving, setIsSaving] = React.useState(false);
  const [lastSaved, setLastSaved] = React.useState<Date | null>(null);
  const timeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined);

  React.useEffect(() => {
    if (!enabled) return;

    const subscription = watch();

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      setIsSaving(true);
      try {
        if (onSave) {
          await onSave(subscription as T);
        }
        setLastSaved(new Date());
      } catch (error) {
        logger.error("Auto-save failed:", {
      error: error instanceof Error ? error.message : String(error),
    });
      } finally {
        setIsSaving(false);
      }
    }, debounceTime);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [watch, onSave, debounceTime, enabled]);

  return {
    isSaving,
    lastSaved,
  };
}

/**
 * Hook for managing form draft state
 */
export function useFormDraft<T extends Record<string, any>>(
  formKey: string,
  defaultValues: T
) {
  const {
    values: draftData,
    updateValues: updateDraft,
    clearPersistedData: clearDraft,
    setValues: setDraftData,
  } = useFormPersist(defaultValues, {
    key: `draft:${formKey}`,
  });

  const hasDraft = React.useMemo(() => {
    return JSON.stringify(draftData) !== JSON.stringify(defaultValues);
  }, [draftData, defaultValues]);

  const restoreDraft = React.useCallback(() => {
    return draftData;
  }, [draftData]);

  return {
    draftData,
    updateDraft,
    clearDraft,
    setDraftData,
    hasDraft,
    restoreDraft,
  };
}
