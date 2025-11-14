import { create } from 'zustand';
import { apiFetch } from '@/lib/utils';

export interface ReturnRequestOrderItem {
  product: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  quantity: number;
  image: string | null;
  selectedColor: string | null;
  selectedSize: string | null;
}

export interface ReturnRequest {
  _id: string;
  user: {
    _id: string;
    name?: string;
    email?: string;
  };
  order: {
    _id: string;
    orderNumber?: string;
    totalAmount?: number;
    paidAt?: string;
  };
  orderItem: ReturnRequestOrderItem;
  returnReason: string;
  note: string;
  images: string[];
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed';
  adminNotes: string | null;
  processedAt: string | null;
  processedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

type Status = 'idle' | 'loading' | 'success' | 'error';

interface ReturnRequestState {
  // User-facing state
  returnRequests: ReturnRequest[];
  currentReturnRequest: ReturnRequest | null;
  returnRequestsMap: Record<string, boolean>; // Map of orderId+sku to hasReturnRequest
  status: Status;
  error: string | null;

  // Actions
  fetchReturnRequests: (orderId?: string) => Promise<void>;
  fetchReturnRequest: (id: string) => Promise<void>;
  fetchReturnRequestByOrderAndSku: (orderId: string, sku: string) => Promise<ReturnRequest | null>;
  checkReturnRequestsForOrder: (orderId: string, items: Array<{ sku: string }>) => Promise<void>;
  createReturnRequest: (data: {
    orderId: string;
    orderItem: ReturnRequestOrderItem;
    returnReason: string;
    note: string;
    images: string[];
  }) => Promise<ReturnRequest>;
  clearError: () => void;
  reset: () => void;
}

export const useReturnRequestStore = create<ReturnRequestState>((set, get) => ({
  returnRequests: [],
  currentReturnRequest: null,
  returnRequestsMap: {},
  status: 'idle',
  error: null,

  fetchReturnRequests: async (orderId?: string) => {
    set({ status: 'loading', error: null });
    try {
      const url = orderId
        ? `/api/account/return-requests?orderId=${orderId}`
        : '/api/account/return-requests';
      const response = await apiFetch<{ returnRequests: ReturnRequest[] }>(url);
      set({
        returnRequests: response.returnRequests,
        status: 'success',
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch return requests';
      set({
        error: message,
        status: 'error',
      });
    }
  },

  fetchReturnRequest: async (id: string) => {
    set({ status: 'loading', error: null });
    try {
      const response = await apiFetch<{ returnRequest: ReturnRequest }>(
        `/api/account/return-requests/${id}`
      );
      set({
        currentReturnRequest: response.returnRequest,
        status: 'success',
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch return request';
      set({
        error: message,
        status: 'error',
      });
    }
  },

  fetchReturnRequestByOrderAndSku: async (orderId: string, sku: string) => {
    try {
      const response = await apiFetch<{ returnRequest: ReturnRequest | null }>(
        `/api/account/return-requests?orderId=${orderId}&sku=${sku}`
      );
      return response.returnRequest || null;
    } catch (err: unknown) {
      console.error('Failed to fetch return request:', err);
      return null;
    }
  },

  checkReturnRequestsForOrder: async (orderId: string, items: Array<{ sku: string; [key: string]: unknown }>) => {
    if (!orderId || !items || items.length === 0) {
      return;
    }
    
    try {
      const returnRequests: Record<string, boolean> = {};
      
      // Check for return requests for each item
      await Promise.all(
        items.map(async (item) => {
          if (!item?.sku) return;
          try {
            const returnRequest = await get().fetchReturnRequestByOrderAndSku(orderId, item.sku);
            if (returnRequest) {
              returnRequests[item.sku] = true;
            }
          } catch (err) {
            // Silently fail for individual items
            console.error(`Failed to check return request for ${item.sku}:`, err);
          }
        })
      );
      
      set({ returnRequestsMap: returnRequests });
    } catch (error) {
      console.error('Error checking return requests:', error);
    }
  },

  createReturnRequest: async (data) => {
    set({ status: 'loading', error: null });
    try {
      const response = await apiFetch<{ returnRequest: ReturnRequest }>(
        '/api/account/return-requests',
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );

      // Add to return requests list
      set(state => ({
        returnRequests: [response.returnRequest, ...state.returnRequests],
        currentReturnRequest: response.returnRequest,
        // Update the map for this specific order item
        returnRequestsMap: {
          ...state.returnRequestsMap,
          [data.orderItem.sku]: true,
        },
        status: 'success',
      }));

      return response.returnRequest;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to create return request';
      set({
        error: message,
        status: 'error',
      });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
  reset: () =>
    set({
      returnRequests: [],
      currentReturnRequest: null,
      returnRequestsMap: {},
      status: 'idle',
      error: null,
    }),
}));
