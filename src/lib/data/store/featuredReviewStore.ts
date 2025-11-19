import { create } from 'zustand';
import { apiFetch } from '@/lib/utils';

export interface FeaturedReview {
  _id: string;
  product?: { _id: string; name: string };
  title?: string;
  comment: string;
  rating: number;
  images?: string[];
  createdAt: string;
  verifiedPurchase?: boolean;
  helpfulVotes?: number;
  featuredVotes?: number;
  user?: {
    name?: string;
    email?: string;
  };
}

type Status = 'idle' | 'loading' | 'success' | 'error';

interface FeaturedReviewEntry {
  reviews: FeaturedReview[];
  status: Status;
  error: string | null;
}

interface FeaturedReviewState {
  entries: Record<string, FeaturedReviewEntry>;
  fetchFeaturedReviews: (productId: string) => Promise<void>;
  clear: (productId?: string) => void;
}

export const useFeaturedReviewStore = create<FeaturedReviewState>((set, get) => ({
  entries: {},

  fetchFeaturedReviews: async productId => {
    const state = get();
    const existing = state.entries[productId];
    if (existing && existing.status === 'loading') return;

    set(state => ({
      entries: {
        ...state.entries,
        [productId]: {
          reviews: existing?.reviews ?? [],
          status: 'loading',
          error: null,
        },
      },
    }));

    try {
      const response = await apiFetch<{
        reviews: FeaturedReview[];
      }>(`/api/admin/reviews/featured?product=${productId}&limit=200`);

      set(state => ({
        entries: {
          ...state.entries,
          [productId]: {
            reviews: Array.isArray(response.reviews) ? response.reviews : [],
            status: 'success',
            error: null,
          },
        },
      }));
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load featured reviews';
      set(state => ({
        entries: {
          ...state.entries,
          [productId]: {
            reviews: existing?.reviews ?? [],
            status: 'error',
            error: message,
          },
        },
      }));
    }
  },

  clear: productId => {
    if (!productId) {
      set({ entries: {} });
      return;
    }
    set(state => {
      const updated = { ...state.entries };
      delete updated[productId];
      return { entries: updated };
    });
  },
}));

