import { create } from 'zustand';
import { apiFetch } from '@/lib/utils';

export interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  // Profile data
  profile?: {
    _id: string;
    phone: string;
    gender: 'prefer_not_to_say' | 'male' | 'female' | 'other';
    dob: string | null;
    newsletterOptIn: boolean;
    smsNotifications: boolean;
    emailNotifications: boolean;
    orderUpdates: boolean;
    promotionalEmails: boolean;
    language: string;
    twoFactorEnabled: boolean;
    addresses: Array<{
      _id: string;
      label: string;
      fullName: string;
      phone: string;
      line1: string;
      line2: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      isDefaultShipping: boolean;
      isDefaultBilling: boolean;
    }>;
  };
  // Aggregated stats
  totalOrders?: number;
  totalSpent?: number;
  lastOrderDate?: string | null;
  averageOrderValue?: number;
}

export interface CustomerFilters {
  search: string;
  status: string; // 'all' | 'active' | 'inactive' | 'verified' | 'unverified'
  role: string;
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

interface CustomerState {
  customers: Customer[];
  currentCustomer: Customer | null;
  filters: CustomerFilters;
  pagination: PaginationInfo | null;
  status: Status;
  error: string | null;

  setFilters: (filters: Partial<CustomerFilters>) => void;
  fetchCustomers: () => Promise<void>;
  fetchCustomer: (id: string) => Promise<void>;
  updateCustomer: (id: string, data: Partial<Customer>) => Promise<Customer>;
  deleteCustomer: (id: string) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

const defaultFilters: CustomerFilters = {
  search: '',
  status: '',
  role: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  page: 1,
  limit: 12,
};

export const useCustomerStore = create<CustomerState>((set, get) => ({
  customers: [],
  currentCustomer: null,
  filters: defaultFilters,
  pagination: null,
  status: 'idle',
  error: null,

  setFilters: newFilters =>
    set(state => {
      // Only reset page to 1 if it's not explicitly provided in newFilters
      // This allows pagination to work correctly
      const updatedFilters = { ...state.filters, ...newFilters };
      // If page is not in newFilters and other filters changed, reset to page 1
      if (!('page' in newFilters) && Object.keys(newFilters).some(key => key !== 'page')) {
        updatedFilters.page = 1;
      }
      return { filters: updatedFilters };
    }),

  fetchCustomers: async () => {
    const { filters } = get();
    set({ status: 'loading', error: null });
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });

      const response = await apiFetch<{
        customers: Customer[];
        pagination: PaginationInfo;
      }>(`/api/admin/customers?${queryParams.toString()}`);

      set({
        customers: response.customers,
        pagination: response.pagination,
        status: 'success',
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch customers';
      set({
        error: message,
        status: 'error',
      });
    }
  },

  fetchCustomer: async id => {
    set({ status: 'loading', error: null });
    try {
      const response = await apiFetch<{ customer: Customer }>(
        `/api/admin/customers/${id}`
      );
      set({ currentCustomer: response.customer, status: 'success' });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch customer';
      set({
        error: message,
        status: 'error',
      });
    }
  },

  updateCustomer: async (id, data) => {
    set({ status: 'loading', error: null });
    try {
      const response = await apiFetch<{ customer: Customer }>(
        `/api/admin/customers/${id}`,
        {
          method: 'PATCH',
          body: JSON.stringify(data),
        }
      );

      set(state => ({
        customers: state.customers.map(c =>
          c._id === id ? response.customer : c
        ),
        currentCustomer:
          state.currentCustomer?._id === id
            ? response.customer
            : state.currentCustomer,
        status: 'success',
      }));
      return response.customer;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to update customer';
      set({
        error: message,
        status: 'error',
      });
      throw err;
    }
  },

  deleteCustomer: async id => {
    set({ status: 'loading', error: null });
    try {
      await apiFetch(`/api/admin/customers/${id}`, { method: 'DELETE' });
      set(state => ({
        customers: state.customers.filter(c => c._id !== id),
        currentCustomer:
          state.currentCustomer?._id === id ? null : state.currentCustomer,
        status: 'success',
      }));
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete customer';
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
      customers: [],
      currentCustomer: null,
      filters: defaultFilters,
      pagination: null,
      status: 'idle',
      error: null,
    }),
}));

