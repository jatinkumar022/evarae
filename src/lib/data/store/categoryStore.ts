import { create } from 'zustand';
import { apiFetch } from '@/lib/utils';

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  parent?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

type Status = 'idle' | 'loading' | 'success' | 'error';

interface CategoryState {
  categories: Category[];
  currentCategory: Category | null;
  status: Status;
  error: string | null;

  // Actions
  fetchCategories: () => Promise<void>;
  fetchCategory: (id: string) => Promise<void>;
  createCategory: (data: Partial<Category>) => Promise<Category>;
  updateCategory: (id: string, data: Partial<Category>) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  currentCategory: null,
  status: 'idle',
  error: null,

  // Fetch all categories
  fetchCategories: async () => {
    set({ status: 'loading', error: null });
    try {
      const response = await apiFetch<{ categories: Category[] }>(
        '/api/admin/categories'
      );
      set({
        categories: response.categories,
        status: 'success',
      });
    } catch (err: any) {
      set({
        error: err?.message ?? String(err) ?? 'Failed to fetch categories',
        status: 'error',
      });
    }
  },

  // Fetch single category
  fetchCategory: async (id: string) => {
    set({ status: 'loading', error: null });
    try {
      const response = await apiFetch<{ category: Category }>(
        `/api/admin/categories/${id}`
      );
      set({
        currentCategory: response.category,
        status: 'success',
      });
    } catch (err: any) {
      set({
        error: err?.message ?? 'Failed to fetch category',
        status: 'error',
      });
    }
  },

  // Create category
  createCategory: async (data: Partial<Category>) => {
    set({ status: 'loading', error: null });
    try {
      const response = await apiFetch<{ category: Category }>(
        '/api/admin/categories',
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );
      set(state => ({
        categories: [...state.categories, response.category],
        status: 'success',
      }));
      return response.category;
    } catch (err: any) {
      set({
        error: err?.message ?? 'Failed to create category',
        status: 'error',
      });
      throw err;
    }
  },

  // Update category
  updateCategory: async (id: string, data: Partial<Category>) => {
    set({ status: 'loading', error: null });
    try {
      const response = await apiFetch<{ category: Category }>(
        `/api/admin/categories/${id}`,
        {
          method: 'PUT',
          body: JSON.stringify(data),
        }
      );
      set(state => ({
        categories: state.categories.map(c =>
          c._id === id ? response.category : c
        ),
        currentCategory:
          state.currentCategory?._id === id
            ? response.category
            : state.currentCategory,
        status: 'success',
      }));
      return response.category;
    } catch (err: any) {
      set({
        error: err?.message ?? 'Failed to update category',
        status: 'error',
      });
      throw err;
    }
  },

  // Delete category
  deleteCategory: async (id: string) => {
    set({ status: 'loading', error: null });
    try {
      await apiFetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
      set(state => ({
        categories: state.categories.filter(c => c._id !== id),
        currentCategory:
          state.currentCategory?._id === id ? null : state.currentCategory,
        status: 'success',
      }));
    } catch (err: any) {
      set({
        error: err?.message ?? 'Failed to delete category',
        status: 'error',
      });
      throw err;
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));
