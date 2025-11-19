import { create } from 'zustand';

export type ProductReview = {
  _id: string;
  rating: number;
  title?: string;
  comment: string;
  images: string[];
  createdAt: string;
  verifiedPurchase: boolean;
  helpfulVotes: number;
  viewerHasVoted: boolean;
  user: {
    _id: string;
    name: string;
    email?: string;
  };
};

export type ProductReviewSummary = {
  averageRating: number;
  reviewCount: number;
  verifiedCount: number;
  ratingBreakdown: Record<'1' | '2' | '3' | '4' | '5', number>;
};

interface ReviewEntry {
  reviews: ProductReview[];
  summary: ProductReviewSummary | null;
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
  lastFetched: number | null;
}

interface ProductReviewStore {
  entries: Record<string, ReviewEntry>;
  fetchReviews: (productId: string, options?: { force?: boolean }) => Promise<void>;
  refreshReviews: (productId: string) => Promise<void>;
}

const CACHE_DURATION = 60 * 1000;

export const useProductReviewStore = create<ProductReviewStore>((set, get) => ({
  entries: {},

  fetchReviews: async (productId, options = {}) => {
    if (!productId) return;
    const { entries } = get();
    const entry = entries[productId];
    const now = Date.now();

    if (
      !options.force &&
      entry &&
      entry.status === 'success' &&
      entry.lastFetched &&
      now - entry.lastFetched < CACHE_DURATION
    ) {
      return;
    }

    if (entry?.status === 'loading') {
      return;
    }

    set(state => ({
      entries: {
        ...state.entries,
        [productId]: {
          reviews: entry?.reviews ?? [],
          summary: entry?.summary ?? null,
          status: 'loading',
          error: null,
          lastFetched: entry?.lastFetched ?? null,
        },
      },
    }));

    try {
      const res = await fetch(
        `/api/products/${encodeURIComponent(productId)}/reviews?limit=50`,
        { cache: 'no-store' }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to load reviews');
      }

      const data = await res.json();

      const reviews: ProductReview[] = Array.isArray(data.reviews)
        ? data.reviews.map((review: ProductReview) => ({
            ...review,
            helpfulVotes: typeof review.helpfulVotes === 'number' ? review.helpfulVotes : 0,
            viewerHasVoted: Boolean(review.viewerHasVoted),
          }))
        : [];
      const summary: ProductReviewSummary | null =
        data.summary && typeof data.summary === 'object' ? data.summary : null;

      set(state => ({
        entries: {
          ...state.entries,
          [productId]: {
            reviews,
            summary,
            status: 'success',
            error: null,
            lastFetched: Date.now(),
          },
        },
      }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to load reviews right now';
      set(state => ({
        entries: {
          ...state.entries,
          [productId]: {
            reviews: entry?.reviews ?? [],
            summary: entry?.summary ?? null,
            status: 'error',
            error: message,
            lastFetched: entry?.lastFetched ?? null,
          },
        },
      }));
    }
  },

  refreshReviews: async productId => {
    await get().fetchReviews(productId, { force: true });
  },
}));
