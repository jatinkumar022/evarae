import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Order {
  _id: string;
  orderNumber: string;
  totalAmount: number;
  orderStatus: string;
  createdAt?: string;
  items?: Array<{
    product?: {
      _id?: string;
      name?: string;
      images?: string[];
      price?: number;
    };
    quantity?: number;
    selectedColor?: string;
  }>;
}

interface OrdersState {
  orders: Order[];
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
  lastFetched: number | null;

  fetchOrders: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

// Cache duration: 2 minutes (orders can change frequently)
const CACHE_DURATION = 2 * 60 * 1000;

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: [],
      status: 'idle',
      error: null,
      lastFetched: null,

      fetchOrders: async () => {
        const state = get();
        const now = Date.now();

        // Return cached data if still valid
        if (
          state.orders.length >= 0 &&
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
          const res = await fetch('/api/orders', { credentials: 'include' });
          if (!res.ok) throw new Error('Failed to fetch orders');
          const data: { orders?: Order[] } = await res.json();
          const normalized = (data.orders || []).map(o => ({
            ...o,
            orderNumber: o.orderNumber || o._id,
          }));
          set({
            orders: normalized,
            status: 'success',
            lastFetched: now,
          });
        } catch (e: unknown) {
          set({
            status: 'error',
            error: e instanceof Error ? e.message : 'Failed to fetch orders',
          });
        }
      },

      clearError: () => set({ error: null }),
      reset: () =>
        set({
          orders: [],
          status: 'idle',
          error: null,
          lastFetched: null,
        }),
    }),
    {
      name: 'orders-storage',
      partialize: (state) => ({
        orders: state.orders,
        lastFetched: state.lastFetched,
      }),
      onRehydrateStorage: () => () => {
        set({ lastFetched: null, status: 'idle' });
      },
    }
  )
);

