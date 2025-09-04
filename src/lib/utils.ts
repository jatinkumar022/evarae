import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function apiFetch<T>(
  input: RequestInfo,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
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
