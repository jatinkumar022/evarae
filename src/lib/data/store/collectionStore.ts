import { create } from 'zustand';
import { apiFetch } from '@/lib/utils';
import { Product } from '@/lib/types/product';

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

export const useCollectionStore = create<CollectionState>((set, get) => ({
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
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch collections',
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
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch collection',
        status: 'error',
      });
    }
  },

  fetchProducts: async () => {
    try {
      const response = await apiFetch<{ products: Product[] }>(
        '/api/admin/products'
      );
      set({ allProducts: response.products });
    } catch (error) {
      console.error('Failed to fetch products', error);
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
    } catch (error: any) {
      set({
        error: error.message || 'Failed to create collection',
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
    } catch (error: any) {
      set({
        error: error.message || 'Failed to update collection',
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
    } catch (error: any) {
      console.error('Failed to update collection products', error);
      set({
        status: 'error',
        error: error.message || 'Failed to update collection products',
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
    } catch (error: any) {
      set({
        error: error.message || 'Failed to delete collection',
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
