import { create } from 'zustand';
import { apiFetch } from '@/lib/utils';

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface AdminReview {
  _id: string;
  product?: { _id?: string; name?: string; slug?: string };
  user?: { _id?: string; name?: string; email?: string };
  rating: number;
  title?: string;
  comment?: string;
  images?: string[];
  verifiedPurchase?: boolean;
  status?: ReviewStatus;
  helpfulVotes?: number;
  featuredVotes?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ReviewFilters {
  search: string;
  status: string;
  product: string;
  rating: string;
  verifiedPurchase: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  page: number;
  limit: number;
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

export type ReviewType = 'real' | 'featured';

export interface ReviewStats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

export interface FeaturedReviewPayload {
  fullName: string;
  rating: number;
  comment: string;
  title?: string;
  featuredVotes?: number;
  verifiedPurchase?: boolean;
  createdAt?: string;
  updatedAt?: string;
  images?: string[];
}

export interface FeaturedReviewError {
  index: number;
  error: string;
}

interface ReviewState {
  reviews: AdminReview[];
  currentReview: AdminReview | null;
  reviewType: ReviewType;
  filters: ReviewFilters;
  pagination: PaginationInfo | null;
  status: Status;
  stats: ReviewStats;
  statsStatus: Status;
  error: string | null;

  setReviewType: (type: ReviewType) => void;
  setFilters: (filters: Partial<ReviewFilters>) => void;
  fetchReviews: () => Promise<void>;
  fetchReview: (id: string) => Promise<void>;
  updateReviewStatus: (id: string, status: ReviewStatus) => Promise<AdminReview>;
  deleteReview: (id: string) => Promise<void>;
  createFeaturedReviews: (
    productId: string,
    reviews: FeaturedReviewPayload[]
  ) => Promise<{ created: AdminReview[]; errors?: FeaturedReviewError[] }>;
  fetchStats: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

const defaultFilters: ReviewFilters = {
  search: '',
  status: 'pending',
  product: '',
  rating: '',
  verifiedPurchase: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  page: 1,
  limit: 12,
};

export const useReviewStore = create<ReviewState>((set, get) => ({
  reviews: [],
  currentReview: null,
  reviewType: 'real',
  filters: defaultFilters,
  pagination: null,
  status: 'idle',
  stats: {
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
  },
  statsStatus: 'idle',
  error: null,

  setReviewType: (type) => {
    set({
      reviewType: type,
      filters: {
        ...defaultFilters,
        status: type === 'real' ? 'pending' : '',
      },
    });
  },

  setFilters: (newFilters) =>
    set((state) => {
      // Only reset page to 1 if it's not explicitly provided in newFilters
      // This allows pagination to work correctly
      const updatedFilters = { ...state.filters, ...newFilters };
      // If page is not in newFilters and other filters changed, reset to page 1
      if (!('page' in newFilters) && Object.keys(newFilters).some(key => key !== 'page')) {
        updatedFilters.page = 1;
      }
      return { filters: updatedFilters };
    }),

  fetchReviews: async () => {
    const { filters, reviewType } = get();
    set({ status: 'loading', error: null });
    try {
      const queryParams = new URLSearchParams();
      
      // Add status filter if provided (empty means "All Status")
      if (reviewType === 'real' && filters.status !== undefined) {
        queryParams.append('status', filters.status);
      }
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value && key !== 'status') {
          queryParams.append(key, value.toString());
        }
      });

      const endpoint = reviewType === 'featured'
        ? `/api/admin/reviews/featured?${queryParams.toString()}`
        : `/api/admin/reviews?${queryParams.toString()}`;

      const response = await apiFetch<{
        reviews: AdminReview[];
        pagination: PaginationInfo;
      }>(endpoint);

      set({
        reviews: response.reviews,
        pagination: response.pagination,
        status: 'success',
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch reviews';
      set({
        error: message,
        status: 'error',
      });
    }
  },

  fetchReview: async (id) => {
    const { reviewType } = get();
    set({ status: 'loading', error: null });
    try {
      const endpoint = reviewType === 'featured'
        ? `/api/admin/reviews/featured/${id}`
        : `/api/admin/reviews/${id}`;

      const response = await apiFetch<{ review: AdminReview }>(endpoint);

      set({
        currentReview: response.review,
        status: 'success',
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch review';
      set({
        error: message,
        status: 'error',
      });
    }
  },

  updateReviewStatus: async (id, newStatus) => {
    const { reviewType } = get();
    set({ status: 'loading', error: null });
    try {
      const endpoint = reviewType === 'featured'
        ? `/api/admin/reviews/featured/${id}`
        : `/api/admin/reviews/${id}`;

      const response = await apiFetch<{ review: AdminReview }>(endpoint, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });

      set((state) => ({
        reviews: state.reviews.map((r) =>
          r._id === id ? response.review : r
        ),
        currentReview:
          state.currentReview?._id === id
            ? response.review
            : state.currentReview,
        status: 'success',
      }));

      return response.review;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to update review';
      set({
        error: message,
        status: 'error',
      });
      throw err;
    }
  },

  deleteReview: async (id) => {
    const { reviewType } = get();
    set({ status: 'loading', error: null });
    try {
      const endpoint = reviewType === 'featured'
        ? `/api/admin/reviews/featured/${id}`
        : `/api/admin/reviews/${id}`;

      await apiFetch<{ message: string }>(endpoint, {
        method: 'DELETE',
      });

      set((state) => ({
        reviews: state.reviews.filter((r) => r._id !== id),
        currentReview:
          state.currentReview?._id === id ? null : state.currentReview,
        status: 'success',
      }));
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete review';
      set({
        error: message,
        status: 'error',
      });
      throw err;
    }
  },

  createFeaturedReviews: async (productId, reviews) => {
    set({ status: 'loading', error: null });
    try {
      const response = await apiFetch<{
        created: AdminReview[];
        errors?: FeaturedReviewError[];
      }>('/api/admin/reviews/featured', {
        method: 'POST',
        body: JSON.stringify({ productId, reviews }),
      });

      set({ status: 'success' });
      return response;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to create featured reviews';
      set({
        error: message,
        status: 'error',
      });
      throw err;
    }
  },

  fetchStats: async () => {
    set({ statsStatus: 'loading' });
    try {
      const response = await apiFetch<{ stats: ReviewStats }>('/api/admin/reviews/stats');
      set({
        stats: response.stats,
        statsStatus: 'success',
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load review stats';
      set({
        statsStatus: 'error',
        error: message,
      });
    }
  },

  clearError: () => set({ error: null }),

  reset: () =>
    set({
      reviews: [],
      currentReview: null,
      filters: defaultFilters,
      pagination: null,
      status: 'idle',
      statsStatus: 'idle',
      stats: {
        pending: 0,
        approved: 0,
        rejected: 0,
        total: 0,
      },
      error: null,
    }),
}));

