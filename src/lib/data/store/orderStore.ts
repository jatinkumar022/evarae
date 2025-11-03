import { create } from 'zustand';
import { apiFetch } from '@/lib/utils';

export interface OrderItem {
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

export interface ShippingAddress {
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Order {
  _id: string;
  user: string;
  orderNumber: string;
  items: OrderItem[];
  subtotalAmount: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  paymentChargesAmount: number;
  totalAmount: number;
  paymentMethod: 'razorpay' | 'stripe' | 'phonepe' | 'cod';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' | 'completed';
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  shippingAddress: ShippingAddress;
  paymentProviderOrderId: string | null;
  paymentProviderPaymentId: string | null;
  paymentProviderSignature: string | null;
  paymentProvider: string;
  trackingNumber: string | null;
  courierName: string | null;
  isGift: boolean;
  couponCode: string | null;
  notes: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderFilters {
  search: string;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  page: number;
  limit: number;
  dateFrom?: string;
  dateTo?: string;
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

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  filters: OrderFilters;
  pagination: PaginationInfo | null;
  status: Status;
  error: string | null;

  setFilters: (filters: Partial<OrderFilters>) => void;
  fetchOrders: () => Promise<void>;
  fetchOrder: (id: string) => Promise<void>;
  updateOrderStatus: (id: string, orderStatus: Order['orderStatus']) => Promise<Order>;
  updatePaymentStatus: (id: string, paymentStatus: Order['paymentStatus']) => Promise<Order>;
  updateTracking: (id: string, trackingNumber: string, courierName: string) => Promise<Order>;
  deleteOrder: (id: string) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

const defaultFilters: OrderFilters = {
  search: '',
  orderStatus: '',
  paymentStatus: '',
  paymentMethod: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  page: 1,
  limit: 12,
};

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  currentOrder: null,
  filters: defaultFilters,
  pagination: null,
  status: 'idle',
  error: null,

  setFilters: newFilters =>
    set(state => ({
      filters: { ...state.filters, ...newFilters, page: 1 },
    })),

  fetchOrders: async () => {
    const { filters } = get();
    set({ status: 'loading', error: null });
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });

      const response = await apiFetch<{
        orders: Order[];
        pagination: PaginationInfo;
      }>(`/api/admin/orders?${queryParams.toString()}`);

      set({
        orders: response.orders,
        pagination: response.pagination,
        status: 'success',
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch orders';
      set({
        error: message,
        status: 'error',
      });
    }
  },

  fetchOrder: async id => {
    set({ status: 'loading', error: null });
    try {
      const response = await apiFetch<{ order: Order }>(
        `/api/admin/orders/${id}`
      );
      set({ currentOrder: response.order, status: 'success' });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch order';
      set({
        error: message,
        status: 'error',
      });
    }
  },

  updateOrderStatus: async (id, orderStatus) => {
    set({ status: 'loading', error: null });
    try {
      const response = await apiFetch<{ order: Order }>(
        `/api/admin/orders/${id}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ orderStatus }),
        }
      );

      set(state => ({
        orders: state.orders.map(o =>
          o._id === id ? response.order : o
        ),
        currentOrder:
          state.currentOrder?._id === id
            ? response.order
            : state.currentOrder,
        status: 'success',
      }));
      return response.order;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to update order status';
      set({
        error: message,
        status: 'error',
      });
      throw err;
    }
  },

  updatePaymentStatus: async (id, paymentStatus) => {
    set({ status: 'loading', error: null });
    try {
      const response = await apiFetch<{ order: Order }>(
        `/api/admin/orders/${id}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ paymentStatus }),
        }
      );

      set(state => ({
        orders: state.orders.map(o =>
          o._id === id ? response.order : o
        ),
        currentOrder:
          state.currentOrder?._id === id
            ? response.order
            : state.currentOrder,
        status: 'success',
      }));
      return response.order;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to update payment status';
      set({
        error: message,
        status: 'error',
      });
      throw err;
    }
  },

  updateTracking: async (id, trackingNumber, courierName) => {
    set({ status: 'loading', error: null });
    try {
      const response = await apiFetch<{ order: Order }>(
        `/api/admin/orders/${id}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ trackingNumber, courierName }),
        }
      );

      set(state => ({
        orders: state.orders.map(o =>
          o._id === id ? response.order : o
        ),
        currentOrder:
          state.currentOrder?._id === id
            ? response.order
            : state.currentOrder,
        status: 'success',
      }));
      return response.order;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to update tracking';
      set({
        error: message,
        status: 'error',
      });
      throw err;
    }
  },

  deleteOrder: async id => {
    set({ status: 'loading', error: null });
    try {
      await apiFetch(`/api/admin/orders/${id}`, { method: 'DELETE' });
      set(state => ({
        orders: state.orders.filter(o => o._id !== id),
        currentOrder:
          state.currentOrder?._id === id ? null : state.currentOrder,
        status: 'success',
      }));
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete order';
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
      orders: [],
      currentOrder: null,
      filters: defaultFilters,
      pagination: null,
      status: 'idle',
      error: null,
    }),
}));

