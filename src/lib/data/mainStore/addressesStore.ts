import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Address {
  _id: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
}

interface AddressesState {
  addresses: Address[];
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
  lastFetched: number | null;

  fetchAddresses: () => Promise<void>;
  refreshAddresses: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

// Cache duration: 1 minute (addresses can change when user adds/edits)
const CACHE_DURATION = 1 * 60 * 1000;

export const useAddressesStore = create<AddressesState>()(
  persist(
    (set, get) => ({
      addresses: [],
      status: 'idle',
      error: null,
      lastFetched: null,

      fetchAddresses: async () => {
        const state = get();
        const now = Date.now();

        // Return cached data if still valid
        if (
          state.addresses.length >= 0 &&
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
          const res = await fetch('/api/account/addresses', {
            cache: 'no-store',
            credentials: 'include',
          });
          if (!res.ok) throw new Error('Failed to fetch addresses');
          const data: { addresses?: Address[] } = await res.json();
          set({
            addresses: data.addresses || [],
            status: 'success',
            lastFetched: now,
          });
        } catch (e: unknown) {
          set({
            status: 'error',
            error: e instanceof Error ? e.message : 'Failed to fetch addresses',
          });
        }
      },

      refreshAddresses: async () => {
        set({ status: 'loading', error: null });
        try {
          const res = await fetch('/api/account/addresses', {
            cache: 'no-store',
            credentials: 'include',
          });
          if (!res.ok) throw new Error('Failed to refresh addresses');
          const data: { addresses?: Address[] } = await res.json();
          set({
            addresses: data.addresses || [],
            status: 'success',
            lastFetched: Date.now(),
          });
        } catch (e: unknown) {
          set({
            status: 'error',
            error: e instanceof Error ? e.message : 'Failed to refresh addresses',
          });
        }
      },

      clearError: () => set({ error: null }),
      reset: () =>
        set({
          addresses: [],
          status: 'idle',
          error: null,
          lastFetched: null,
        }),
    }),
    {
      name: 'addresses-storage',
      partialize: (state) => ({
        addresses: state.addresses,
        lastFetched: state.lastFetched,
      }),
      onRehydrateStorage: () => () => {
        set({ lastFetched: null, status: 'idle' });
      },
    }
  )
);

