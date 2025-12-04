/**
 * Authentication Store for Farmers Market Mobile App
 *
 * Global state management for authentication using Zustand.
 * Handles user login, logout, registration, and session management.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '@/services/api';

// User type definition
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'CUSTOMER' | 'FARMER' | 'ADMIN';
  avatar?: string;
  phone?: string;
  emailVerified: boolean;
  createdAt: string;
  farmId?: string;
}

// Auth state interface
interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  hasHydrated: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  getCurrentUser: () => Promise<void>;
  clearError: () => void;
  setHasHydrated: (value: boolean) => void;
  resetAuth: () => void;
}

// Registration data interface
interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: 'CUSTOMER' | 'FARMER';
  phone?: string;
}

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  hasHydrated: false,
};

/**
 * Authentication Store
 *
 * Persists authentication state across app restarts using AsyncStorage.
 * Automatically syncs with secure token storage.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...initialState,

      /**
       * Login user with email and password
       */
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          const { user, accessToken } = await apiClient.auth.login(email, password);

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          console.log('✅ Login successful:', user.email);
        } catch (error: any) {
          const errorMessage = error.message || 'Login failed. Please try again.';

          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          });

          console.error('❌ Login error:', errorMessage);
          throw error;
        }
      },

      /**
       * Register new user
       */
      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null });

        try {
          const { user, accessToken } = await apiClient.auth.register(data);

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          console.log('✅ Registration successful:', user.email);
        } catch (error: any) {
          const errorMessage = error.message || 'Registration failed. Please try again.';

          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          });

          console.error('❌ Registration error:', errorMessage);
          throw error;
        }
      },

      /**
       * Logout user and clear all auth data
       */
      logout: async () => {
        set({ isLoading: true });

        try {
          // Call API to invalidate token on server
          await apiClient.auth.logout();
        } catch (error) {
          console.error('Logout API call failed:', error);
          // Continue with logout even if API call fails
        }

        // Clear local state and tokens
        await apiClient.clearTokens();

        set({
          ...initialState,
          hasHydrated: true, // Keep hydrated state
        });

        console.log('✅ Logout successful');
      },

      /**
       * Update user data in store
       */
      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;

        if (!currentUser) {
          console.warn('No user to update');
          return;
        }

        set({
          user: {
            ...currentUser,
            ...userData,
          },
        });

        console.log('✅ User updated:', userData);
      },

      /**
       * Fetch current user from API
       * Used to refresh user data or verify session
       */
      getCurrentUser: async () => {
        const isAuthenticated = await apiClient.isAuthenticated();

        if (!isAuthenticated) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const user = await apiClient.auth.getCurrentUser();

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          console.log('✅ Current user fetched:', user.email);
        } catch (error: any) {
          const errorMessage = error.message || 'Failed to fetch user data';

          // If token is invalid, clear auth state
          if (error.statusCode === 401) {
            await apiClient.clearTokens();
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
          } else {
            set({
              isLoading: false,
              error: errorMessage,
            });
          }

          console.error('❌ Get current user error:', errorMessage);
        }
      },

      /**
       * Clear error message
       */
      clearError: () => {
        set({ error: null });
      },

      /**
       * Set hydration status
       */
      setHasHydrated: (value: boolean) => {
        set({ hasHydrated: value });
      },

      /**
       * Reset auth state to initial values
       */
      resetAuth: () => {
        set({
          ...initialState,
          hasHydrated: true,
        });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Only persist these fields
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        console.log('🔄 Auth store rehydrated');
        state?.setHasHydrated(true);
      },
    }
  )
);

/**
 * Selector hooks for optimized re-renders
 */
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);

/**
 * Helper function to check if user has specific role
 */
export const useHasRole = (role: User['role']) => {
  const user = useUser();
  return user?.role === role;
};

/**
 * Helper function to check if user is farmer
 */
export const useIsFarmer = () => {
  const user = useUser();
  return user?.role === 'FARMER';
};

/**
 * Helper function to check if user is customer
 */
export const useIsCustomer = () => {
  const user = useUser();
  return user?.role === 'CUSTOMER';
};

/**
 * Helper function to check if user is admin
 */
export const useIsAdmin = () => {
  const user = useUser();
  return user?.role === 'ADMIN';
};

/**
 * Helper to get user's farm ID (for farmers)
 */
export const useFarmId = () => {
  const user = useUser();
  return user?.farmId;
};

export default useAuthStore;
