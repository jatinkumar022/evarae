import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { useCartStore } from './cartStore';

// Lightweight store that only tracks cart count
// This prevents the entire Navbar from re-rendering when cart changes
interface CartCountState {
  count: number;
  updateCount: (count: number) => void;
  syncWithCart: () => void;
}

export const useCartCountStore = create<CartCountState>()(
  subscribeWithSelector((set, get) => ({
    count: 0,
    updateCount: (count) => set({ count }),
    syncWithCart: () => {
      // Sync with current cart count
      const currentCount = useCartStore.getState().items.length;
      set({ count: currentCount });
    },
  }))
);

// Subscribe to cart store changes globally
if (typeof window !== 'undefined') {
  useCartStore.subscribe(
    (state) => {
      const count = state.items.length;
      useCartCountStore.getState().updateCount(count);
    }
  );
}

