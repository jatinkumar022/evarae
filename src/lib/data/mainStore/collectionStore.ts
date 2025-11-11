import { create } from 'zustand';

export interface PublicCollection {
  _id?: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface PublicCollectionWithProducts extends PublicCollection {
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

interface PublicCollectionState {
  collections: PublicCollection[];
  currentCollection: PublicCollectionWithProducts | null;
  status: Status;
  error: string | null;

  fetchCollections: () => Promise<void>;
  fetchCollection: (slugOrId: string) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export const usePublicCollectionStore = create<PublicCollectionState>(set => ({
  collections: [],
  currentCollection: null,
  status: 'idle',
  error: null,

  fetchCollections: async () => {
    set({ status: 'loading', error: null });
    try {
      const res = await fetch('/api/main/collections', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch collections');
      const data: { collections: PublicCollection[] } = await res.json();
      set({ collections: data.collections, status: 'success' });
    } catch (e: unknown) {
      set({
        status: 'error',
        error: e instanceof Error ? e.message : 'Failed to fetch collections',
      });
    }
  },

  fetchCollection: async slugOrId => {
    set({ status: 'loading', error: null });
    try {
      const res = await fetch(`/api/main/collections/${slugOrId}`, {
        cache: 'no-store',
      });
      if (!res.ok) throw new Error('Failed to fetch collection');
      const data: { collection: PublicCollectionWithProducts } =
        await res.json();
      set({ currentCollection: data.collection, status: 'success' });
    } catch (e: unknown) {
      set({
        status: 'error',
        error: e instanceof Error ? e.message : 'Failed to fetch collection',
      });
    }
  },

  clearError: () => set({ error: null }),
  reset: () =>
    set({
      collections: [],
      currentCollection: null,
      status: 'idle',
      error: null,
    }),
}));
