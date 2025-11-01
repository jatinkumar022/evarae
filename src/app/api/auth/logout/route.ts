import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const res = NextResponse.json({ ok: true });
  
  // Get all cookies from the request
  const cookieHeader = request.headers.get('cookie') || '';
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
  
  return res;
}
