import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface BestSellerProduct {
  _id?: string;
  slug?: string;
  name: string;
  images?: string[];
  price?: number;
  discountPrice?: number;
  stockQuantity?: number;
  status?: string;
}

interface BestSellersState {
  products: BestSellerProduct[];
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
  lastFetched: number | null;

  fetchBestSellers: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

export const useBestSellersStore = create<BestSellersState>()(
  persist(
    (set, get) => ({
      products: [],
      status: 'idle',
      error: null,
      lastFetched: null,

      fetchBestSellers: async () => {
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
          const res = await fetch('/api/main/dashboard/best-sellers');
          if (!res.ok) throw new Error('Failed to fetch best sellers');
          const data: { products?: BestSellerProduct[] } = await res.json();
          set({
            products: (data.products || []).slice(0, 6),
            status: 'success',
            lastFetched: now,
          });
        } catch (e: unknown) {
          set({
            status: 'error',
            error: e instanceof Error ? e.message : 'Failed to fetch best sellers',
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
      name: 'best-sellers-storage',
      partialize: (state) => ({
        products: state.products,
        lastFetched: state.lastFetched,
      }),
    }
  )
);

if (typeof window !== 'undefined') {
  useBestSellersStore.persist.onFinishHydration(() => {
    useBestSellersStore.setState({ lastFetched: null, status: 'idle' });
  });
}

