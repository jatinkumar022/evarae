import { create } from 'zustand';
import { userAuthApi } from '@/lib/utils';

export type UserProfile = { id: string; name: string; email: string } | null;

type Status = 'idle' | 'loading' | 'success' | 'error';

type UserAuthState = {
  email: string;
  profile: UserProfile;
  requestStatus: Status;
  verifyStatus: Status;
  resendInSec: number;
  error: string | null;
  devOtp?: string;
  setEmail: (email: string) => void;
  // Signup flow
  requestSignupOtp: () => Promise<void>;
  verifySignupOtp: (otp: string) => Promise<void>;
  // Login flow
  requestLoginOtp: () => Promise<void>;
  verifyLoginOtp: (otp: string) => Promise<void>;
  resendOtp: () => Promise<void>;
  logout: () => Promise<void>;
};

const RESEND_COOLDOWN = 45;

export const useUserAuth = create<UserAuthState>((set, get) => ({
  email: '',
  profile: null,
  requestStatus: 'idle',
  verifyStatus: 'idle',
  resendInSec: 0,
  error: null,
  devOtp: undefined,

  setEmail: email => set({ email }),

  requestSignupOtp: async () => {
    const { email } = get();
    if (!email) return;
    set({ requestStatus: 'loading', error: null });
    try {
      const res = await userAuthApi.signupRequestOtp(email);
      set({
        requestStatus: 'success',
        devOtp: res.devOtp,
        resendInSec: RESEND_COOLDOWN,
      });
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
      set({ requestStatus: 'error', error: message });
      throw new Error(message);
    }
  },

  verifySignupOtp: async (otp: string) => {
    const { email } = get();
    if (!email || !otp) return;
    set({ verifyStatus: 'loading', error: null });
    try {
      await userAuthApi.signupVerifyOtp(email, otp);
      set({ verifyStatus: 'success' });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Invalid OTP';
      set({ verifyStatus: 'error', error: message });
      throw new Error(message);
    }
  },

  requestLoginOtp: async () => {
    const { email } = get();
    if (!email) return;
    set({ requestStatus: 'loading', error: null });
    try {
      const res = await userAuthApi.loginRequestOtp(email);
      set({
        requestStatus: 'success',
        devOtp: res.devOtp,
        resendInSec: RESEND_COOLDOWN,
      });
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
      set({ requestStatus: 'error', error: message });
      // keep behavior for login unchanged for now
      throw new Error(message);
    }
  },

  verifyLoginOtp: async (otp: string) => {
    const { email } = get();
    if (!email || !otp) return;
    set({ verifyStatus: 'loading', error: null });
    try {
      const res = await userAuthApi.loginVerifyOtp(email, otp);
      set({ verifyStatus: 'success', profile: res.user });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Invalid OTP';
      set({ verifyStatus: 'error', error: message });
      throw new Error(message);
    }
  },

  resendOtp: async () => {
    if (get().resendInSec > 0) return;
    // Caller should choose requestSignupOtp or requestLoginOtp; default to login for safety
    await get().requestLoginOtp();
  },

  logout: async () => {
    await userAuthApi.logout();
    set({ profile: null, email: '', devOtp: undefined });
  },
}));
