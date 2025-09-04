import { create } from 'zustand';
import { adminAuthApi } from '@/lib/utils';

export type AdminProfile = { id: string; name: string; email: string } | null;

type Status = 'idle' | 'loading' | 'success' | 'error';

type AdminAuthState = {
  email: string;
  profile: AdminProfile;
  requestStatus: Status;
  verifyStatus: Status;
  resendInSec: number;
  error: string | null;
  devOtp?: string;
  setEmail: (email: string) => void;
  requestOtp: () => Promise<void>;
  resendOtp: () => Promise<void>;
  verifyOtp: (otp: string) => Promise<void>;
  loadProfile: () => Promise<void>;
  logout: () => Promise<void>;
};

const RESEND_COOLDOWN = 45;

export const useAdminAuth = create<AdminAuthState>((set, get) => ({
  email: '',
  profile: null,
  requestStatus: 'idle',
  verifyStatus: 'idle',
  resendInSec: 0,
  error: null,
  devOtp: undefined,

  setEmail: email => set({ email }),

  requestOtp: async () => {
    const { email } = get();
    if (!email) return;
    set({ requestStatus: 'loading', error: null });
    try {
      const res = await adminAuthApi.requestOtp(email);
      set({
        requestStatus: 'success',
        devOtp: res.devOtp,
        resendInSec: RESEND_COOLDOWN,
      });
      // start cooldown timer
      let remaining = RESEND_COOLDOWN;
      const tick = () => {
        remaining -= 1;
        if (remaining <= 0) return set({ resendInSec: 0 });
        set({ resendInSec: remaining });
        setTimeout(tick, 1000);
      };
      setTimeout(tick, 1000);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to request OTP';
      set({
        requestStatus: 'error',
        error: message,
      });
    }
  },

  resendOtp: async () => {
    if (get().resendInSec > 0) return;
    await get().requestOtp();
  },

  verifyOtp: async (otp: string) => {
    const { email } = get();
    if (!email || !otp) return;
    set({ verifyStatus: 'loading', error: null });
    try {
      await adminAuthApi.verifyOtp(email, otp);
      set({ verifyStatus: 'success' });
      await get().loadProfile();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Invalid OTP';
      set({ verifyStatus: 'error', error: message });
    }
  },

  loadProfile: async () => {
    try {
      const res = await adminAuthApi.me();
      set({ profile: res.admin || null });
    } catch {
      set({ profile: null });
    }
  },

  logout: async () => {
    await adminAuthApi.logout();
    set({ profile: null, email: '', devOtp: undefined });
  },
}));
