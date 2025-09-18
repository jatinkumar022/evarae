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
    thumbnail?: string;
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

  fetchCategories: () => Promise<void>;
  fetchCategory: (slugOrId: string, includeProducts?: boolean) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export const usePublicCategoryStore = create<PublicCategoryState>(set => ({
  categories: [],
  currentCategory: null,
  status: 'idle',
  error: null,

  fetchCategories: async () => {
    set({ status: 'loading', error: null });
    try {
      const res = await fetch('/api/main/categories', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data: { categories: PublicCategory[] } = await res.json();
      set({ categories: data.categories, status: 'success' });
    } catch (e: unknown) {
      set({
        status: 'error',
        error: e instanceof Error ? e.message : 'Failed to fetch categories',
      });
    }
  },

  fetchCategory: async (slugOrId, includeProducts = false) => {
    set({ status: 'loading', error: null });
    try {
      const res = await fetch(
        `/api/main/categories/${slugOrId}?includeProducts=${
          includeProducts ? 'true' : 'false'
        }`,
        { cache: 'no-store' }
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
      set({ currentCategory: merged, status: 'success' });
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
