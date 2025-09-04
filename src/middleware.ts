// /middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Only pages that really require login
const PROTECTED_PATHS = [
  '/checkout',
  '/account',
  '/orders',
  '/wishlist',
  '/cart',
];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const adminToken = request.cookies.get('adminToken')?.value;
  const path = request.nextUrl.pathname;

  const isProtectedPath = PROTECTED_PATHS.some(p => path.startsWith(p));

  // If not authenticated and trying to access protected page → redirect to login
  if (!token && isProtectedPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If authenticated and trying to access login/signup → redirect to home (or account)
  if (token && (path === '/login' || path === '/signup')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Admin area protection: require adminToken, allow /admin/login
  if (path.startsWith('/admin')) {
    if (path === '/admin/login') {
      // If already authenticated as admin, redirect to admin root
      if (adminToken) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return NextResponse.next();
    }

    if (!adminToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*|favicon.ico).*)'],
};
