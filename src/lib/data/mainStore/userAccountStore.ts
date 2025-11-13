import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { accountApi, type UserAccount } from '@/lib/utils';

interface UserAccountState {
  user: UserAccount | null;
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
  lastFetched: number | null;

  // Load user account (with caching to prevent duplicate calls)
  load: () => Promise<void>;
  // Refresh user account (force reload)
  refresh: () => Promise<void>;
  // Hydrate user account immediately (used after auth responses)
  hydrate: (user: UserAccount | null) => void;
  // Clear user account (on logout)
  clear: () => void;
  // Check if user is authenticated
  isAuthenticated: () => boolean;
}

// Cache duration: 2 minutes (shorter than categories since user data might change)
const CACHE_DURATION = 2 * 60 * 1000;

export const useUserAccountStore = create<UserAccountState>()(
  persist(
    (set, get) => ({
      user: null,
      status: 'idle',
      error: null,
      lastFetched: null,

      load: async () => {
        const state = get();
        const now = Date.now();

        // Return cached data if still valid and not in error state
        if (
          state.user !== null &&
          state.lastFetched &&
          now - state.lastFetched < CACHE_DURATION &&
          state.status === 'success'
        ) {
          return;
        }

        // If already loading, don't start another request
        if (state.status === 'loading') {
          return;
        }

        set({ status: 'loading', error: null });
        try {
          const { user } = await accountApi.me();
          set({
            user,
            status: 'success',
            lastFetched: now,
            error: null,
          });
        } catch (e: unknown) {
          const message =
            e instanceof Error ? e.message : 'Failed to load user account';
          set({
            status: 'error',
            error: message,
            user: null,
          });
        }
      },

      refresh: async () => {
        set({ status: 'loading', error: null });
        try {
          const { user } = await accountApi.me();
          set({
            user,
            status: 'success',
            lastFetched: Date.now(),
            error: null,
          });
        } catch (e: unknown) {
          const message =
            e instanceof Error ? e.message : 'Failed to refresh user account';
          set({
            status: 'error',
            error: message,
            user: null,
          });
        }
      },

      hydrate: (user: UserAccount | null) => {
        set({
          user,
          status: user ? 'success' : 'idle',
          error: null,
          lastFetched: user ? Date.now() : null,
        });
      },

      clear: () => {
        set({
          user: null,
          status: 'idle',
          error: null,
          lastFetched: null,
        });
      },

      isAuthenticated: () => {
        return get().user !== null;
      },
    }),
    {
      name: 'user-account-storage',
      partialize: (state) => ({
        user: state.user,
        lastFetched: state.lastFetched,
      }),
      onRehydrateStorage: () => () => {
        set({ lastFetched: null, status: 'idle' });
      },
    }
  )
);

