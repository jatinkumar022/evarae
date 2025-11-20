import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { clearKeys, cacheKeys } from '@/lib/cache';

const USER_JWT_SECRET = process.env.USER_JWT_SECRET as string | undefined;

export async function POST(request: Request) {
  const res = NextResponse.json({ ok: true });
  
  // Get all cookies from the request
  const cookieHeader = request.headers.get('cookie') || '';
  let userId: string | null = null;
  if (USER_JWT_SECRET) {
    const token = cookieHeader
      .split(';')
      .map(c => c.trim())
      .find(part => part.startsWith('token='))?.split('=')[1];
    if (token) {
      try {
        const payload = jwt.verify(token, USER_JWT_SECRET) as { uid?: string } | null;
        userId = payload?.uid ?? null;
      } catch {
        userId = null;
      }
    }
  }
  const cookies = cookieHeader.split(';').map(c => c.trim().split('=')[0]).filter(Boolean);
  
  // List of token-related cookie names (case-insensitive matching)
  const tokenCookiePatterns = [
    'token',
    'adminToken',
    'accessToken',
    'refreshToken',
    'authToken',
    'sessionToken',
    'userRole',
    'signupToken',
    'auth',
    'session',
  ];
  
  // Clear all cookies that match token patterns
  const cookiesToClear = new Set<string>();
  
  // Find all matching cookies (case-insensitive)
  cookies.forEach(cookieName => {
    const lowerName = cookieName.toLowerCase();
    if (tokenCookiePatterns.some(pattern => lowerName.includes(pattern.toLowerCase()))) {
      cookiesToClear.add(cookieName);
    }
  });
  
  // Also explicitly clear known token cookies
  tokenCookiePatterns.forEach(pattern => {
    cookiesToClear.add(pattern);
    cookiesToClear.add(pattern.toLowerCase());
    cookiesToClear.add(pattern.toUpperCase());
  });
  
  // Clear all matching cookies with both httpOnly and non-httpOnly options
  const clearOptions = [
    { httpOnly: true },
    { httpOnly: false },
  ];
  
  cookiesToClear.forEach(cookieName => {
    clearOptions.forEach(options => {
      res.cookies.set(cookieName, '', {
        ...options,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
        maxAge: 0,
      });
    });
  });
  
  if (userId) {
    clearKeys([
      cacheKeys.userProfile(userId),
      cacheKeys.userCart(userId),
      cacheKeys.userAddresses(userId),
      cacheKeys.userWishlist(userId),
      cacheKeys.userReturnRequests(userId),
    ]);
  }
  
  return res;
}
