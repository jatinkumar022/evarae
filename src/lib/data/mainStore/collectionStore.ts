import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  lastFetched: number | null;

  fetchCollections: () => Promise<void>;
  fetchCollection: (slugOrId: string) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

// Cache duration: 5 minutes (same as categories)
const CACHE_DURATION = 5 * 60 * 1000;

export const usePublicCollectionStore = create<PublicCollectionState>()(
  persist(
    (set, get) => ({
      collections: [],
      currentCollection: null,
      status: 'idle',
      error: null,
      lastFetched: null,

      fetchCollections: async () => {
        const state = get();
        const now = Date.now();

        // Return cached data if still valid
        if (
          state.collections.length > 0 &&
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
          const res = await fetch('/api/main/collections', { cache: 'no-store' });
          if (!res.ok) throw new Error('Failed to fetch collections');
          const data: { collections: PublicCollection[] } = await res.json();
          set({
            collections: data.collections,
            status: 'success',
            lastFetched: now,
          });
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
          lastFetched: null,
        }),
    }),
    {
      name: 'collections-storage',
      partialize: (state) => ({
        collections: state.collections,
        lastFetched: state.lastFetched,
      }),
    }
  )
);

if (typeof window !== 'undefined') {
  usePublicCollectionStore.persist.onFinishHydration(() => {
    usePublicCollectionStore.setState({ lastFetched: null, status: 'idle' });
  });
}