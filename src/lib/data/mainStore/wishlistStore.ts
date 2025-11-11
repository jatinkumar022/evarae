import { create } from 'zustand';
import { apiFetch } from '@/lib/utils';

export interface WishlistProduct {
  _id: string;
  name: string;
  slug: string;
  images: string[];
  price: number;
  discountPrice?: number | null;
  tags: string[];
  material: string;
  colors: string[];
  stockQuantity: number;
  categories: Array<{ _id?: string; name: string; slug: string }>;
  addedAt?: string | Date;
}

interface WishlistState {
  products: WishlistProduct[];
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;

  load: () => Promise<void>;
  add: (productId: string) => Promise<void>;
  remove: (productId: string) => Promise<void>;
  isWishlisted: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  products: [],
  status: 'idle',
  error: null,

  load: async () => {
    set({ status: 'loading', error: null });
    try {
      const data = await apiFetch<{ products: WishlistProduct[] }>(
        '/api/main/wishlist',
        { method: 'GET' }
      );
      set({
        products: data.products || [],
        status: 'success',
      });
    } catch (e: unknown) {
      const message =
        typeof e === 'object' && e && 'message' in e
          ? String(
              (e as { message?: unknown }).message || 'Failed to load wishlist'
            )
          : 'Failed to load wishlist';
      set({ status: 'error', error: message });
    }
  },

  add: async (productId: string) => {
    try {
      const data = await apiFetch<{ products: WishlistProduct[] }>(
        '/api/main/wishlist',
        {
          method: 'POST',
          body: JSON.stringify({ productId }),
        }
      );
      set({
        products: data.products || [],
        status: 'success',
        error: null,
      });
    } catch (e: unknown) {
      const message =
        typeof e === 'object' && e && 'message' in e
          ? String(
              (e as { message?: unknown }).message ||
                'Failed to add to wishlist'
            )
          : 'Failed to add to wishlist';
      set({ status: 'error', error: message });
      throw new Error(message);
    }
  },

  remove: async (productId: string) => {
    try {
      const data = await apiFetch<{ products: WishlistProduct[] }>(
        '/api/main/wishlist',
        {
          method: 'DELETE',
          body: JSON.stringify({ productId }),
        }
      );
      set({
        products: data.products || [],
        status: 'success',
        error: null,
      });
    } catch (e: unknown) {
      const message =
        typeof e === 'object' && e && 'message' in e
          ? String(
              (e as { message?: unknown }).message ||
                'Failed to remove from wishlist'
            )
          : 'Failed to remove from wishlist';
      set({ status: 'error', error: message });
      throw new Error(message);
    }
  },

  isWishlisted: (productId: string) => {
    const state = get();
    return state.products.some(
      p => String(p._id) === productId || p.slug === productId
    );
  },
}));

