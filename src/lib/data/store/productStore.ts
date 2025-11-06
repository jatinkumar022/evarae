import { create } from 'zustand';
import { apiFetch } from '@/lib/utils';

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  sku?: string;
  categories: Array<{ _id: string; name: string; slug: string }>;
  collections?: Array<{ _id: string; name: string; slug: string }>;
  price: number;
  discountPrice?: number;
  stockQuantity: number;
  material: string;
  weight: string;
  colors: string[];
  images: string[];
  thumbnail?: string;
  tags: string[];
  video?: string;
  status: 'active' | 'out_of_stock' | 'hidden';
  metaTitle: string;
  metaDescription: string;
  createdAt: string;
  updatedAt: string;
  sizes?: string[]; // Added to support admin UI display
}

export interface ProductFilters {
  search: string;
  category: string;
  status: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  page: number;
  limit: number;
  tags?: string; // optional tag filter
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

type Status = 'idle' | 'loading' | 'success' | 'error';

interface ProductState {
  products: Product[];
  currentProduct: Product | null;
  filters: ProductFilters;
  pagination: PaginationInfo | null;
  status: Status;
  error: string | null;
  productsByCategory: Record<string, Product[]>;

  setFilters: (filters: Partial<ProductFilters>) => void;
  fetchProducts: () => Promise<void>;
  fetchProduct: (id: string) => Promise<void>;
  createProduct: (productData: Partial<Product>) => Promise<Product>;
  updateProduct: (
    id: string,
    productData: Partial<Product>
  ) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
  fetchProductsByCategory: (categoryId: string) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

const defaultFilters: ProductFilters = {
  search: '',
  category: '',
  status: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  page: 1,
  limit: 12,
  tags: '',
};

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  currentProduct: null,
  filters: defaultFilters,
  pagination: null,
  status: 'idle',
  error: null,
  productsByCategory: {},

  setFilters: newFilters => {
    const current = get().filters;
    const merged = { ...current, ...newFilters };
    // Only update if actually changed
    if (JSON.stringify(merged) !== JSON.stringify(current)) {
      set({ filters: { ...merged, page: newFilters.page !== undefined ? newFilters.page : (Object.keys(newFilters).some(k => k !== 'page') ? 1 : current.page) } });
    }
  },

  fetchProducts: async () => {
    const { filters } = get();
    set({ status: 'loading', error: null });
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });

      const response = await apiFetch<{
        products: Product[];
        pagination: PaginationInfo;
      }>(`/api/admin/products?${queryParams.toString()}`);

      set({
        products: response.products,
        pagination: response.pagination,
        status: 'success',
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch products';
      set({
        error: message,
        status: 'error',
      });
    }
  },

  fetchProduct: async id => {
    set({ status: 'loading', error: null });
    try {
      const response = await apiFetch<{ product: Product }>(
        `/api/admin/products/${id}`
      );
      set({ currentProduct: response.product, status: 'success' });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch product';
      set({
        error: message,
        status: 'error',
      });
    }
  },

  createProduct: async productData => {
    set({ status: 'loading', error: null });
    try {
      const response = await apiFetch<{ product: Product }>(
        '/api/admin/products',
        {
          method: 'POST',
          body: JSON.stringify(productData),
        }
      );

      set(state => ({
        products: [response.product, ...state.products],
        status: 'success',
      }));
      return response.product;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to create product';
      set({
        error: message,
        status: 'error',
      });
      throw err;
    }
  },

  updateProduct: async (id, productData) => {
    set({ status: 'loading', error: null });
    try {
      const response = await apiFetch<{ product: Product }>(
        `/api/admin/products/${id}`,
        {
          method: 'PUT',
          body: JSON.stringify(productData),
        }
      );

      set(state => ({
        products: state.products.map(p =>
          p._id === id ? response.product : p
        ),
        currentProduct:
          state.currentProduct?._id === id
            ? response.product
            : state.currentProduct,
        status: 'success',
      }));
      return response.product;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to update product';
      set({
        error: message,
        status: 'error',
      });
      throw err;
    }
  },

  deleteProduct: async id => {
    set({ status: 'loading', error: null });
    try {
      await apiFetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      set(state => ({
        products: state.products.filter(p => p._id !== id),
        currentProduct:
          state.currentProduct?._id === id ? null : state.currentProduct,
        status: 'success',
      }));
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete product';
      set({
        error: message,
        status: 'error',
      });
      throw err;
    }
  },

  fetchProductsByCategory: async categoryId => {
    set({ status: 'loading', error: null });
    try {
      const response = await apiFetch<{ products: Product[] }>(
        `/api/admin/products?category=${categoryId}`
      );
      set(state => ({
        productsByCategory: {
          ...state.productsByCategory,
          [categoryId]: response.products,
        },
        status: 'success',
      }));
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to fetch products by category';
      set({
        error: message,
        status: 'error',
      });
    }
  },

  clearError: () => set({ error: null }),
  reset: () =>
    set({
      products: [],
      currentProduct: null,
      filters: defaultFilters,
      pagination: null,
      status: 'idle',
      error: null,
      productsByCategory: {},
    }),
}));
