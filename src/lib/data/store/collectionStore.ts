import { create } from 'zustand';
import { apiFetch } from '@/lib/utils';
import { type Product } from '@/lib/data/store/productStore';

export interface Collection {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  products: Product[];
}

type Status = 'idle' | 'loading' | 'success' | 'error';

interface CollectionState {
  collections: Collection[];
  currentCollection: Collection | null;
  allProducts: Product[]; // ✅ new
  status: Status;
  error: string | null;

  // Actions
  fetchCollections: () => Promise<void>;
  fetchCollection: (id: string) => Promise<void>;
  fetchProducts: () => Promise<void>; // ✅ new
  createCollection: (
    collectionData: Partial<Collection>
  ) => Promise<Collection>;
  updateCollection: (
    id: string,
    collectionData: Partial<Collection>
  ) => Promise<Collection>;
  updateCollectionProducts: (id: string, productIds: string[]) => Promise<void>; // ✅ new
  deleteCollection: (id: string) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export const useCollectionStore = create<CollectionState>(set => ({
  collections: [],
  currentCollection: null,
  allProducts: [], // ✅
  status: 'idle',
  error: null,

  fetchCollections: async () => {
    set({ status: 'loading', error: null });
    try {
      const response = await apiFetch<{ collections: Collection[] }>(
        '/api/admin/collections'
      );
      set({ collections: response.collections, status: 'success' });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch collections';
      set({
        error: message,
        status: 'error',
      });
    }
  },

  fetchCollection: async (id: string) => {
    set({ status: 'loading', error: null });
    try {
      const response = await apiFetch<{ collection: Collection }>(
        `/api/admin/collections/${id}`
      );
      set({ currentCollection: response.collection, status: 'success' });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch collection';
      set({
        error: message,
        status: 'error',
      });
    }
  },

  fetchProducts: async () => {
    try {
      // Fetch all products by using a very high limit
      // The API will return all products up to this limit
      const response = await apiFetch<{ products: Product[] }>(
        '/api/admin/products?limit=10000&status=active'
      );
      set({ allProducts: response.products });
    } catch (error: unknown) {
      console.error('Failed to fetch products', error);
      set({ allProducts: [] });
    }
  },

  createCollection: async collectionData => {
    set({ status: 'loading', error: null });
    try {
      const response = await apiFetch<{ collection: Collection }>(
        '/api/admin/collections',
        {
          method: 'POST',
          body: JSON.stringify(collectionData),
        }
      );
      set(state => ({
        collections: [response.collection, ...state.collections],
        status: 'success',
      }));
      return response.collection;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to create collection';
      set({
        error: message,
        status: 'error',
      });
      throw error;
    }
  },

  updateCollection: async (id: string, collectionData) => {
    set({ status: 'loading', error: null });
    try {
      const response = await apiFetch<{ collection: Collection }>(
        `/api/admin/collections/${id}`,
        {
          method: 'PUT',
          body: JSON.stringify(collectionData),
        }
      );
      set(state => ({
        collections: state.collections.map(c =>
          c._id === id ? response.collection : c
        ),
        currentCollection:
          state.currentCollection?._id === id
            ? response.collection
            : state.currentCollection,
        status: 'success',
      }));
      return response.collection;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to update collection';
      set({
        error: message,
        status: 'error',
      });
      throw error;
    }
  },

  updateCollectionProducts: async (id, productIds) => {
    set({ status: 'loading', error: null });
    try {
      const response = await apiFetch<{ collection: Collection }>(
        `/api/admin/collections/${id}`,
        {
          method: 'PUT',
          body: JSON.stringify({ products: productIds }),
        }
      );
      set(state => ({
        currentCollection: response.collection,
        collections: state.collections.map(c =>
          c._id === id ? response.collection : c
        ),
        status: 'success',
      }));
    } catch (error: unknown) {
      console.error('Failed to update collection products', error);
      set({
        status: 'error',
        error:
          error instanceof Error
            ? error.message
            : 'Failed to update collection products',
      });
    }
  },

  deleteCollection: async (id: string) => {
    set({ status: 'loading', error: null });
    try {
      await apiFetch(`/api/admin/collections/${id}`, {
        method: 'DELETE',
      });
      set(state => ({
        collections: state.collections.filter(c => c._id !== id),
        currentCollection:
          state.currentCollection?._id === id ? null : state.currentCollection,
        status: 'success',
      }));
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete collection';
      set({
        error: message,
        status: 'error',
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),

  reset: () =>
    set({
      collections: [],
      currentCollection: null,
      allProducts: [],
      status: 'idle',
      error: null,
    }),
}));
