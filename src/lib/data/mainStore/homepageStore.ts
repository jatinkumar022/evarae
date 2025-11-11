import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface HomepageCollection {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
}

export interface HomepageProduct {
  _id: string;
  name: string;
  slug: string;
  images?: string[];
  price: number;
  discountPrice?: number;
  tags?: string[];
  material?: string;
  colors?: string[];
  categories?: Array<{
    _id: string;
    name: string;
    slug: string;
  }>;
}

export interface HomepageCategory {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  banner?: string;
  mobileBanner?: string;
}

export interface FreshlyMinted {
  backgroundImage: string;
  topImage1: string;
  topImage2: string;
  topImage1Title: string;
  topImage2Title: string;
  topImage1Link: string;
  topImage2Link: string;
}

export interface HomepageData {
  hero: {
    images: string[];
  };
  categories: HomepageCategory[];
  bestsellers: HomepageProduct[];
  signatureCollections: HomepageCollection[];
  trendingCollections: HomepageCollection[];
  trendingConfig?: {
    enabled: boolean;
    daysBack: number;
  };
  freshlyMinted: FreshlyMinted;
  worldOfCaelvi: HomepageCollection[];
}

type Status = 'idle' | 'loading' | 'success' | 'error';

interface HomepageState {
  data: HomepageData | null;
  status: Status;
  error: string | null;
  lastFetched: number | null;
  fetchHomepage: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

export const useHomepageStore = create<HomepageState>()(
  persist(
    (set, get) => ({
      data: null,
      status: 'idle',
      error: null,
      lastFetched: null,

      fetchHomepage: async () => {
        const state = get();
        const now = Date.now();

        // Return cached data if still valid
        if (
          state.data &&
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
          const res = await fetch('/api/main/homepage', {
            cache: 'no-store',
            next: { revalidate: 300 }, // Revalidate every 5 minutes
          });
          if (!res.ok) throw new Error('Failed to fetch homepage data');
          const data: HomepageData = await res.json();
          set({
            data,
            status: 'success',
            lastFetched: now,
          });
        } catch (e: unknown) {
          set({
            status: 'error',
            error: e instanceof Error ? e.message : 'Failed to fetch homepage data',
          });
        }
      },

      clearError: () => set({ error: null }),
      reset: () =>
        set({
          data: null,
          status: 'idle',
          error: null,
          lastFetched: null,
        }),
    }),
    {
      name: 'homepage-storage',
      partialize: (state) => ({
        data: state.data,
        lastFetched: state.lastFetched,
      }),
    }
  )
);

