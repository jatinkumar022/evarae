import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface NewArrivalProduct {
  slug: string;
  name: string;
  description?: string;
  price?: number | null;
  discountPrice?: number | null;
  images?: string[];
  categories?: Array<{
    _id?: string;
    name?: string;
    slug?: string;
  }>;
  material?: string;
  colors?: string[];
  status?: string;
  stockQuantity?: number;
  tags?: string[];
  sku?: string;
}

interface NewArrivalsState {
  products: NewArrivalProduct[];
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
  lastFetched: number | null;

  fetchNewArrivals: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

export const useNewArrivalsStore = create<NewArrivalsState>()(
  persist(
    (set, get) => ({
      products: [],
      status: 'idle',
      error: null,
      lastFetched: null,

      fetchNewArrivals: async () => {
        const state = get();
        const now = Date.now();

        // Return cached data if still valid
        if (
          state.products.length > 0 &&
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
          const res = await fetch('/api/main/new-arrived', { cache: 'no-store' });
          if (!res.ok) throw new Error('Failed to fetch new arrivals');
          const data: { products?: NewArrivalProduct[] } = await res.json();
          set({
            products: data.products || [],
            status: 'success',
            lastFetched: now,
          });
        } catch (e: unknown) {
          set({
            status: 'error',
            error: e instanceof Error ? e.message : 'Failed to fetch new arrivals',
          });
        }
      },

      clearError: () => set({ error: null }),
      reset: () =>
        set({
          products: [],
          status: 'idle',
          error: null,
          lastFetched: null,
        }),
    }),
    {
      name: 'new-arrivals-storage',
      partialize: (state) => ({
        products: state.products,
        lastFetched: state.lastFetched,
      }),
    }
  )
);

if (typeof window !== 'undefined') {
  useNewArrivalsStore.persist.onFinishHydration(() => {
    useNewArrivalsStore.setState({ lastFetched: null, status: 'idle' });
  });
}

