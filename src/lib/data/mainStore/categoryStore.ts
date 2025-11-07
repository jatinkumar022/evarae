import { create } from 'zustand';

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
    image?: string;
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
  // Cache management
  lastFetched: number | null; // Timestamp of last successful fetch
  cacheMaxAge: number; // Cache max age in milliseconds (10 minutes)

  fetchCategories: (force?: boolean) => Promise<void>;
  fetchCategory: (slugOrId: string, includeProducts?: boolean, force?: boolean) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export const usePublicCategoryStore = create<PublicCategoryState>(set => ({
  categories: [],
  currentCategory: null,
  status: 'idle',
  error: null,
  lastFetched: null,
  cacheMaxAge: 10 * 60 * 1000, // 10 minutes (categories change less frequently)

  fetchCategories: async (force = false) => {
    const state = usePublicCategoryStore.getState();
    
    // Check if we need to fetch (force, no data, or stale cache)
    const now = Date.now();
    const isStale = state.lastFetched 
      ? (now - state.lastFetched) > state.cacheMaxAge 
      : true;
    const hasData = state.categories.length > 0;
    
    // Skip fetch if we have fresh data and not forcing
    if (!force && hasData && !isStale && state.status === 'success') {
      return;
    }
    
    set({ status: 'loading', error: null });
    try {
      const res = await fetch('/api/main/categories', { 
        cache: 'force-cache',
        next: { revalidate: 600 } // Revalidate every 10 minutes
      });
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data: { categories: PublicCategory[] } = await res.json();
      set({ categories: data.categories, status: 'success', lastFetched: Date.now() });
    } catch (e: unknown) {
      set({
        status: 'error',
        error: e instanceof Error ? e.message : 'Failed to fetch categories',
      });
    }
  },

  fetchCategory: async (slugOrId, includeProducts = false, force = false) => {
    const state = usePublicCategoryStore.getState();
    
    // For category pages, always fetch if different category or forcing
    const isDifferentCategory = state.currentCategory?.slug !== slugOrId;
    
    if (!force && !isDifferentCategory && state.status === 'success') {
      return;
    }
    
    set({ status: 'loading', error: null });
    try {
      const res = await fetch(
        `/api/main/categories/${slugOrId}?includeProducts=${
          includeProducts ? 'true' : 'false'
        }`,
        { 
          cache: 'force-cache',
          next: { revalidate: 300 } // Revalidate every 5 minutes
        }
      );
      if (!res.ok) throw new Error('Failed to fetch category');
      const data: {
        category: PublicCategory;
        products?: PublicCategoryWithProducts['products'];
      } = await res.json();
      const merged: PublicCategoryWithProducts = {
        ...data.category,
        products: data.products,
      };
      set({ currentCategory: merged, status: 'success', lastFetched: Date.now() });
    } catch (e: unknown) {
      set({
        status: 'error',
        error: e instanceof Error ? e.message : 'Failed to fetch category',
      });
    }
  },

  clearError: () => set({ error: null }),
  reset: () =>
    set({ categories: [], currentCategory: null, status: 'idle', error: null }),
}));
