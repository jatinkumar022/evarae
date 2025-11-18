import { create } from 'zustand';

export interface PublicCategoryRef {
  _id?: string;
  name: string;
  slug: string;
}

export interface PublicProduct {
  _id?: string;
  name: string;
  slug: string;
  images?: string[];
  price: number;
  discountPrice?: number;
  status?: string;
  tags?: string[];
  categories?: PublicCategoryRef[];
  description?: string;
  stockQuantity?: number;
  video?: string;
  metaTitle?: string;
  metaDescription?: string;
}

export interface PublicPaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

type Status = 'idle' | 'loading' | 'success' | 'error';

interface ProductFilters {
  search: string;
  category: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  page: number;
  limit: number;
}

interface PublicProductState {
  products: PublicProduct[];
  currentProduct: PublicProduct | null;
  pagination: PublicPaginationInfo | null;
  status: Status;
  error: string | null;
  filters: ProductFilters;

  setFilters: (f: Partial<ProductFilters>) => void;
  fetchProducts: () => Promise<void>;
  fetchProduct: (slugOrId: string) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

const defaultFilters: ProductFilters = {
  search: '',
  category: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  page: 1,
  limit: 12,
};

export const usePublicProductStore = create<PublicProductState>((set, get) => ({
  products: [],
  currentProduct: null,
  pagination: null,
  status: 'idle',
  error: null,
  filters: defaultFilters,

  setFilters: f =>
    set(state => ({ filters: { ...state.filters, ...f, page: 1 } })),

  fetchProducts: async () => {
    const { filters } = get();
    set({ status: 'loading', error: null });
    try {
      const qs = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v) qs.append(k, String(v));
      });
      const res = await fetch(`/api/main/product?${qs.toString()}`, {
        cache: 'no-store',
      });
      if (!res.ok) throw new Error('Failed to fetch products');
      const data: {
        products: PublicProduct[];
        pagination: PublicPaginationInfo;
      } = await res.json();
      set({
        products: data.products,
        pagination: data.pagination,
        status: 'success',
      });
    } catch (e: unknown) {
      set({
        status: 'error',
        error: e instanceof Error ? e.message : 'Failed to fetch products',
      });
    }
  },

  fetchProduct: async slugOrId => {
    set({ status: 'loading', error: null });
    try {
      const res = await fetch(`/api/main/product/${slugOrId}`, {
        cache: 'no-store',
      });
      if (!res.ok) throw new Error('Failed to fetch product');
      const data: { product: PublicProduct } = await res.json();
      set({ currentProduct: data.product, status: 'success' });
    } catch (e: unknown) {
      set({
        status: 'error',
        error: e instanceof Error ? e.message : 'Failed to fetch product',
      });
    }
  },

  clearError: () => set({ error: null }),
  reset: () =>
    set({
      products: [],
      currentProduct: null,
      pagination: null,
      status: 'idle',
      error: null,
      filters: defaultFilters,
    }),
}));
