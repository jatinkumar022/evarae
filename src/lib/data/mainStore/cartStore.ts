import { create } from 'zustand';
import { apiFetch } from '@/lib/utils';

export type CartProduct = {
  _id?: string;
  id?: string;
  name?: string;
  slug?: string;
  sku?: string;
  price?: number;
  discountPrice?: number | null;
  thumbnail?: string | null;
  images?: string[];
};
export type CartItem = {
  product: CartProduct;
  quantity: number;
  selectedColor?: string | null;
  selectedSize?: string | null;
};
export type SavedItem = { product: CartProduct };

interface CartState {
  items: CartItem[];
  savedItems: SavedItem[];
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
  // Per-operation loading states for inline loaders
  isAdding: boolean;
  isUpdating: string | null; // productId that's being updated
  isRemoving: string | null; // productId that's being removed
  isSaving: string | null; // productId that's being saved
  isUnsaving: string | null; // productId that's being unsaved
  // Cache management
  lastFetched: number | null; // Timestamp of last successful fetch
  cacheMaxAge: number; // Cache max age in milliseconds (5 minutes)

  load: (force?: boolean) => Promise<void>;
  add: (payload: {
    productId?: string;
    productSlug?: string;
    sku?: string;
    product?: CartProduct; // nested support
    quantity?: number;
    selectedColor?: string | null;
    selectedSize?: string | null;
    optimisticProduct?: CartProduct;
  }) => Promise<void>;
  save: (productId: string) => Promise<void>;
  unsave: (productId: string) => Promise<void>;
  update: (
    productId: string,
    quantity: number,
    opts?: { selectedColor?: string | null; selectedSize?: string | null }
  ) => Promise<void>;
  remove: (
    productId: string,
    opts?: { selectedColor?: string | null; selectedSize?: string | null }
  ) => Promise<void>;
}

export const useCartStore = create<CartState>(set => ({
  items: [],
  savedItems: [],
  status: 'idle',
  error: null,
  isAdding: false,
  isUpdating: null,
  isRemoving: null,
  isSaving: null,
  isUnsaving: null,
  lastFetched: null,
  cacheMaxAge: 5 * 60 * 1000, // 5 minutes

  load: async (force = false) => {
    const state = useCartStore.getState();
    
    // Check if we need to fetch (force, no data, or stale cache)
    const now = Date.now();
    const isStale = state.lastFetched 
      ? (now - state.lastFetched) > state.cacheMaxAge 
      : true;
    const hasData = state.items.length > 0 || state.savedItems.length > 0;
    
    // Skip fetch if we have fresh data and not forcing
    if (!force && hasData && !isStale && state.status === 'success') {
      return;
    }
    
    set({ status: 'loading', error: null });
    try {
      const data = await apiFetch<{
        items: CartItem[];
        savedItems: SavedItem[];
      }>('/api/account/cart', { method: 'GET' });
      set({
        items: data.items || [],
        savedItems: data.savedItems || [],
        status: 'success',
        lastFetched: Date.now(),
      });
    } catch (e: unknown) {
      const message =
        typeof e === 'object' && e && 'message' in e
          ? String(
              (e as { message?: unknown }).message || 'Failed to load cart'
            )
          : 'Failed to load cart';
      set({ status: 'error', error: message });
    }
  },

  add: async payload => {
    set({ isAdding: true });
    if (payload.optimisticProduct) {
      set(state => {
        const key = String(
          payload.productId ||
            payload.productSlug ||
            payload.sku ||
            payload.product?._id ||
            payload.optimisticProduct?._id ||
            payload.product?.id ||
            payload.optimisticProduct?.id
        );
        const existingIndex = state.items.findIndex(
          i => String(i?.product?._id || i?.product?.id) === key
        );
        const nextItems = [...state.items];
        if (existingIndex >= 0) {
          nextItems[existingIndex] = {
            ...nextItems[existingIndex],
            quantity:
              (nextItems[existingIndex].quantity || 1) +
              (payload.quantity || 1),
          };
        } else {
          nextItems.unshift({
            product: payload.optimisticProduct as CartProduct,
            quantity: payload.quantity || 1,
            selectedColor: payload.selectedColor,
            selectedSize: payload.selectedSize,
          });
        }
        return { items: nextItems } as Partial<CartState> as CartState;
      });
    }
    try {
      const data = await apiFetch<{
        items: CartItem[];
        savedItems: SavedItem[];
      }>('/api/account/cart', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      set({
        items: data.items || [],
        savedItems: data.savedItems || [],
        status: 'success',
        error: null,
        isAdding: false,
        lastFetched: Date.now(),
      });
    } catch (e: unknown) {
      const message =
        typeof e === 'object' && e && 'message' in e
          ? String(
              (e as { message?: unknown }).message || 'Failed to add to cart'
            )
          : 'Failed to add to cart';
      set({ status: 'error', error: message, isAdding: false });
    }
  },

  save: async productId => {
    set({ isSaving: productId });
    try {
      const data = await apiFetch<{
        items: CartItem[];
        savedItems: SavedItem[];
      }>('/api/account/cart?action=save', {
        method: 'POST',
        body: JSON.stringify({ productId }),
      });
      set({
        items: data.items || [],
        savedItems: data.savedItems || [],
        status: 'success',
        error: null,
        isSaving: null,
        lastFetched: Date.now(),
      });
    } catch (e: unknown) {
      const message =
        typeof e === 'object' && e && 'message' in e
          ? String(
              (e as { message?: unknown }).message || 'Failed to save item'
            )
          : 'Failed to save item';
      set({ status: 'error', error: message, isSaving: null });
    }
  },

  unsave: async productId => {
    set({ isUnsaving: productId });
    try {
      const data = await apiFetch<{
        items: CartItem[];
        savedItems: SavedItem[];
      }>('/api/account/cart?action=unsave', {
        method: 'DELETE',
        body: JSON.stringify({ productId }),
      });
      set({
        items: data.items || [],
        savedItems: data.savedItems || [],
        status: 'success',
        error: null,
        isUnsaving: null,
        lastFetched: Date.now(),
      });
    } catch (e: unknown) {
      const message =
        typeof e === 'object' && e && 'message' in e
          ? String(
              (e as { message?: unknown }).message ||
                'Failed to remove saved item'
            )
          : 'Failed to remove saved item';
      set({
        status: 'error',
        error: message,
        isUnsaving: null,
      });
    }
  },

  update: async (productId, quantity, opts) => {
    set({ isUpdating: productId });
    try {
      const data = await apiFetch<{
        items: CartItem[];
        savedItems: SavedItem[];
      }>('/api/account/cart', {
        method: 'PATCH',
        body: JSON.stringify({ productId, quantity, ...(opts || {}) }),
      });
      set({
        items: data.items || [],
        savedItems: data.savedItems || [],
        status: 'success',
        error: null,
        isUpdating: null,
        lastFetched: Date.now(),
      });
    } catch (e: unknown) {
      const message =
        typeof e === 'object' && e && 'message' in e
          ? String(
              (e as { message?: unknown }).message || 'Failed to update cart'
            )
          : 'Failed to update cart';
      set({ status: 'error', error: message, isUpdating: null });
    }
  },

  remove: async (productId, opts) => {
    set({ isRemoving: productId });
    try {
      const data = await apiFetch<{
        items: CartItem[];
        savedItems: SavedItem[];
      }>('/api/account/cart', {
        method: 'DELETE',
        body: JSON.stringify({ productId, ...(opts || {}) }),
      });
      set({
        items: data.items || [],
        savedItems: data.savedItems || [],
        status: 'success',
        error: null,
        isRemoving: null,
        lastFetched: Date.now(),
      });
    } catch (e: unknown) {
      const message =
        typeof e === 'object' && e && 'message' in e
          ? String(
              (e as { message?: unknown }).message || 'Failed to remove item'
            )
          : 'Failed to remove item';
      set({ status: 'error', error: message, isRemoving: null });
    }
  },
}));
