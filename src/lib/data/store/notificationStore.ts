import { create } from 'zustand';

export interface Notification {
  _id: string;
  type: 'order_placed' | 'order_status_changed' | 'return_request' | 'payment_received';
  title: string;
  message: string;
  orderId?: string;
  orderNumber?: string;
  userId?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
  
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (notification: Notification) => void;
  clearError: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  status: 'idle',
  error: null,

  fetchNotifications: async () => {
    const state = get();
    // Don't show loading if we already have notifications (for polling)
    if (state.notifications.length === 0) {
      set({ status: 'loading', error: null });
    }
    try {
      const response = await fetch('/api/admin/notifications', {
        credentials: 'include',
        cache: 'no-store',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      
      const data: { notifications: Notification[]; unreadCount: number } = await response.json();
      
      set({
        notifications: data.notifications,
        unreadCount: data.unreadCount,
        status: 'success',
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch notifications';
      // Only set error if we don't have any notifications yet
      if (state.notifications.length === 0) {
        set({
          status: 'error',
          error: message,
        });
      }
      console.error('Failed to fetch notifications:', err);
    }
  },

  markAsRead: async (id: string) => {
    try {
      const response = await fetch(`/api/admin/notifications/${id}/read`, {
        method: 'PATCH',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
      
      set(state => ({
        notifications: state.notifications.map(n =>
          n._id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (err: unknown) {
      console.error('Failed to mark notification as read:', err);
    }
  },

  markAllAsRead: async () => {
    try {
      const response = await fetch('/api/admin/notifications/read-all', {
        method: 'PATCH',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }
      
      set(state => ({
        notifications: state.notifications.map(n => ({
          ...n,
          isRead: true,
          readAt: new Date().toISOString(),
        })),
        unreadCount: 0,
      }));
    } catch (err: unknown) {
      console.error('Failed to mark all notifications as read:', err);
    }
  },

  addNotification: (notification: Notification) => {
    set(state => ({
      notifications: [notification, ...state.notifications],
      unreadCount: notification.isRead ? state.unreadCount : state.unreadCount + 1,
    }));
  },

  clearError: () => set({ error: null }),
}));

