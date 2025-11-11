import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function apiFetch<T>(
  input: RequestInfo,
  init?: RequestInit
): Promise<T> {
  const method = (init?.method || (input instanceof Request ? input.method : 'GET'))
    ?.toUpperCase?.() || 'GET';

  const headers = new Headers(init?.headers as HeadersInit);

  if (!(init?.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (method !== 'GET') {
    headers.set('x-skip-global-loader', 'true');
  }

  const res = await fetch(input, {
    ...init,
    method,
    headers,
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMessage =
      (data && (data.error || data.message)) || 'Request failed';
    throw new Error(errorMessage);
  }
  return data as T;
}

export const adminAuthApi = {
  requestOtp: (email: string) =>
    apiFetch<{ ok: true; message: string; devOtp?: string }>(
      '/api/admin/auth/request-otp',
      { method: 'POST', body: JSON.stringify({ email }) }
    ),
  verifyOtp: (email: string, otp: string) =>
    apiFetch<{ ok: true; admin: { id: string; name: string; email: string } }>(
      '/api/admin/auth/verify-otp',
      { method: 'POST', body: JSON.stringify({ email, otp }) }
    ),
  me: () =>
    apiFetch<{ admin: { id: string; name: string; email: string } | null }>(
      '/api/admin/auth/me',
      { method: 'GET' }
    ),
  logout: () =>
    apiFetch<{ ok: true }>('/api/admin/auth/logout', { method: 'POST' }),
};

export const userAuthApi = {
  // Signup OTP
  signupRequestOtp: (email: string) =>
    apiFetch<{ ok: true; message: string; devOtp?: string }>(
      '/api/auth/signup/request-otp',
      { method: 'POST', body: JSON.stringify({ email }) }
    ),
  signupVerifyOtp: (email: string, otp: string) =>
    apiFetch<{ ok: true }>('/api/auth/signup/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    }),

  // Login OTP
  loginRequestOtp: (email: string) =>
    apiFetch<{ ok: true; message: string; devOtp?: string }>(
      '/api/auth/login/request-otp',
      { method: 'POST', body: JSON.stringify({ email }) }
    ),
  loginVerifyOtp: (email: string, otp: string) =>
    apiFetch<{ ok: true; user: { id: string; name: string; email: string } }>(
      '/api/auth/login/verify-otp',
      { method: 'POST', body: JSON.stringify({ email, otp }) }
    ),

  loginWithPassword: (email: string, password: string) =>
    apiFetch<{ ok: true; user: { id: string; name: string; email: string } }>(
      '/api/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }) }
    ),
  completeProfile: (name: string, phone: string, password: string) =>
    apiFetch<{ ok: true }>('/api/auth/complete-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, phone, password }),
    }),
  checkEmail: (email: string) =>
    apiFetch<{ exists: boolean }>('/api/auth/check-email', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  logout: () => apiFetch<{ ok: true }>('/api/auth/logout', { method: 'POST' }),
};

export type UserAccount = {
  id: string;
  name: string | null;
  email: string;
  phone?: string | null;
  gender?: string | null;
  dob?: string | null;
  newsletterOptIn?: boolean;
  membershipTier?: string | null;
};

export type AccountUpdatePayload = {
  name: string;
  phone?: string;
  gender?: string;
  dob?: string;
  newsletterOptIn?: boolean;
};

export const accountApi = {
  me: () =>
    apiFetch<{ user: UserAccount | null }>('/api/account/me', {
      method: 'GET',
    }),
  update: (payload: AccountUpdatePayload) =>
    apiFetch<{ ok: true }>('/api/account/update', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
