import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PublicCategory {
  _id?: string;
  name: string;
  slug: string;
  image?: string;
  banner?: string;
  mobileBanner?: string;
  description?: string;
  isActive?: boolean;
}

export interface PublicCategoryWithProducts extends PublicCategory {
  products?: Array<{
    _id?: string;
    name: string;
    slug: string;
    images?: string[];
    price: number;
    discountPrice?: number;
  }>;
}

type Status = 'idle' | 'loading' | 'success' | 'error';

interface PublicCategoryState {
  categories: PublicCategory[];
  currentCategory: PublicCategoryWithProducts | null;
  status: Status;
  error: string | null;
  lastFetched: number | null; // Timestamp of last fetch
  fetchCategories: () => Promise<void>;
  fetchCategory: (slugOrId: string, includeProducts?: boolean) => Promise<void>;
  setCategoriesFromHomepage: (categories: PublicCategory[]) => void;
  clearError: () => void;
  reset: () => void;
}

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

export const usePublicCategoryStore = create<PublicCategoryState>()(
  persist(
    (set, get) => ({
      categories: [],
      currentCategory: null,
      status: 'idle',
      error: null,
      lastFetched: null,

      fetchCategories: async () => {
        const state = get();
        const now = Date.now();
        
        // Return cached data if still valid
        if (
          state.categories.length > 0 &&
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
          const res = await fetch('/api/main/categories', {
            cache: 'no-store',
            next: { revalidate: 300 }, // Revalidate every 5 minutes
          });
          if (!res.ok) throw new Error('Failed to fetch categories');
          const data: { categories: PublicCategory[] } = await res.json();
          set({
            categories: data.categories,
            status: 'success',
            lastFetched: now,
          });
        } catch (e: unknown) {
          set({
            status: 'error',
            error: e instanceof Error ? e.message : 'Failed to fetch categories',
          });
        }
      },

      fetchCategory: async (slugOrId, includeProducts = false) => {
        const state = get();
        
        // If already loading, don't start another request
        if (state.status === 'loading') {
          return;
        }

        // If we already have this category loaded and it matches, don't refetch
        if (state.currentCategory?.slug === slugOrId && state.status === 'success') {
          return;
        }

        set({ status: 'loading', error: null });
        try {
          const res = await fetch(
            `/api/main/categories/${slugOrId}?includeProducts=${
              includeProducts ? 'true' : 'false'
            }`,
            { cache: 'no-store' }
          );
          
          // If 404, set error and don't retry
          if (res.status === 404) {
            set({
              status: 'error',
              error: 'Category not found',
            });
            return;
          }
          
          if (!res.ok) throw new Error('Failed to fetch category');
          const data: {
            category: PublicCategory;
            products?: PublicCategoryWithProducts['products'];
          } = await res.json();
          const merged: PublicCategoryWithProducts = {
            ...data.category,
            products: data.products,
          };
          set({ currentCategory: merged, status: 'success' });
        } catch (e: unknown) {
          set({
            status: 'error',
            error: e instanceof Error ? e.message : 'Failed to fetch category',
          });
        }
      },

      setCategoriesFromHomepage: (categories: PublicCategory[]) => {
        const state = get();
        // Only set if we don't have categories or if homepage has more recent data
        // This prevents overwriting if categories were already fetched
        if (state.categories.length === 0 || categories.length > 0) {
          set({
            categories,
            status: 'success',
            lastFetched: Date.now(),
            error: null,
          });
        }
      },

      clearError: () => set({ error: null }),
      reset: () =>
        set({
          categories: [],
          currentCategory: null,
          status: 'idle',
          error: null,
          lastFetched: null,
        }),
    }),
    {
      name: 'category-cache',
      partialize: (state) => ({
        categories: state.categories,
        lastFetched: state.lastFetched,
        status: state.status,
      }),
    }
  )
);

if (typeof window !== 'undefined') {
  usePublicCategoryStore.persist.onFinishHydration(() => {
    usePublicCategoryStore.setState({ lastFetched: null, status: 'idle' });
  });
}